let currentCapsule = null;
let liveStatus = null;
let currentWorkflow = null;
let lastTransitionPlan = null;
let compareBase = null;

const $ = (id) => document.getElementById(id);

async function jsonFetch(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(options.headers || {})
    }
  });
  const payload = await response.json();
  if (!response.ok) {
    const message = payload.error?.message || payload.error || `HTTP ${response.status}`;
    const error = new Error(message);
    error.payload = payload;
    throw error;
  }
  return payload;
}

function formatUsd(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function short(value) {
  return String(value || "").replace(/^sha256:/, "").slice(0, 16);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function scenario() {
  return $("scenarioSelect").value;
}

function capsuleInput(overrides = {}) {
  return {
    capsule_id: currentCapsule?.capsule_id,
    capsule_type: currentCapsule?.capsule_type,
    subject: currentCapsule?.subject,
    claims: currentCapsule?.claims,
    evidence_refs: currentCapsule?.evidence_refs,
    external_anchors: currentCapsule?.external_anchors,
    policy: currentCapsule?.policy,
    decision: currentCapsule?.decision,
    state_transition: currentCapsule?.state_transition,
    dual_anchor: currentCapsule?.dual_anchor,
    write_boundary: currentCapsule?.write_boundary,
    ...overrides
  };
}

async function recompose(overrides = {}, title = "Updated Proof Capsule JSON") {
  const payload = await jsonFetch("/api/capsule/compose", {
    method: "POST",
    body: JSON.stringify(capsuleInput(overrides))
  });
  renderCapsule(payload.capsule, title);
  await refreshOperationalPanels(payload.capsule);
  return payload.capsule;
}

function renderCapsule(capsule, outputTitle = "Current capsule JSON") {
  currentCapsule = capsule;
  $("scenarioLabel").textContent = $("scenarioSelect").selectedOptions[0]?.textContent || "Scenario";
  $("capsuleId").textContent = capsule.capsule_id;
  $("capsuleType").textContent = capsule.capsule_type;
  $("decision").textContent = capsule.decision?.result || "-";
  $("valueUsd").textContent = formatUsd(capsule.subject?.value_usd);
  $("evidenceCount").textContent = String(capsule.evidence_refs?.length || 0);
  $("statePair").textContent = `${capsule.state_transition?.from_state || "-"} -> ${capsule.state_transition?.to_state || "-"}`;
  $("verifyStatus").textContent = "Ready";

  $("evidenceList").innerHTML = (capsule.evidence_refs || []).map((ref) => `
    <article class="evidence-card">
      <strong>${escapeHtml(ref.type)} / ${escapeHtml(ref.source)}</strong>
      <p>${escapeHtml(ref.summary || ref.evidence_id)}</p>
      <code>${escapeHtml(short(ref.hash))}</code>
    </article>
  `).join("");

  const hashFields = [
    "claim_hash",
    "evidence_hash",
    "policy_hash",
    "external_anchor_hash",
    "state_transition_hash",
    "decision_content_hash",
    "capsule_content_hash",
    "capsule_envelope_hash"
  ];
  $("hashStack").innerHTML = hashFields.map((name) => `
    <div class="hash-row">
      <span>${escapeHtml(name.replaceAll("_", " "))}</span>
      <strong>${escapeHtml(short(capsule.hashes?.[name]))}</strong>
    </div>
  `).join("");

  const links = [
    ["DUAL object", capsule.dual_anchor?.object_explorer_url],
    ["DUAL template", capsule.dual_anchor?.template_explorer_url],
    ["Solana tx", capsule.external_anchors?.find((anchor) => anchor.chain === "solana")?.explorer_url],
    ["IPFS document", capsule.evidence_refs?.find((ref) => ref.source === "ipfs")?.explorer_url]
  ].filter(([, href]) => Boolean(href));

  $("linkStack").innerHTML = links.map(([label, href]) => `
    <div class="link-row">
      <span>${escapeHtml(label)}</span>
      <a href="${escapeAttribute(href)}" target="_blank" rel="noreferrer">${escapeHtml(href)}</a>
    </div>
  `).join("");

  $("outputTitle").textContent = outputTitle;
  $("output").textContent = JSON.stringify(capsule, null, 2);
}

function renderWorkflow(definition, replay = null) {
  currentWorkflow = definition;
  const ok = replay ? replay.ok : true;
  $("replayStatus").textContent = replay ? ok ? "Replay verified" : "Replay blocked" : "Draft workflow";
  $("replayStatus").className = ok ? "safe-text" : "warn-text";

  $("workflowStack").innerHTML = (definition.states || []).map((state) => {
    const item = (replay?.state_timeline || []).find((entry) => entry.state === state);
    const status = item?.status || (state === currentCapsule?.state_transition?.to_state ? "current" : "pending");
    return `
      <div class="workflow-row ${escapeAttribute(status)}">
        <span>${escapeHtml(status)}</span>
        <strong>${escapeHtml(state)}</strong>
      </div>
    `;
  }).join("");

  $("sourceVerifierStack").innerHTML = (replay?.source_verifier_summary || definition.source_verifier_coverage || []).slice(0, 8).map((item) => `
    <div class="workflow-row">
      <span>${escapeHtml(item.source)} / ${escapeHtml(item.mode || item.live_adapter_status)}</span>
      <strong>${escapeHtml(item.type || item.verifier_id || "verifier")}</strong>
      <p>${escapeHtml(item.freshness_rule || item.live_adapter_status || "")}</p>
    </div>
  `).join("");
}

function renderEvidenceVerification(payload) {
  $("evidenceStatus").textContent = payload.ok ? "Evidence ready" : "Evidence needs work";
  $("evidenceStatus").className = payload.ok ? "safe-text" : "warn-text";
  $("evidenceVerifierStack").innerHTML = (payload.results || []).map((item) => `
    <div class="workflow-row ${escapeAttribute(item.status)}">
      <span>${escapeHtml(item.status)}</span>
      <strong>${escapeHtml(item.type)} / ${escapeHtml(item.source || "missing")}</strong>
      <p>${escapeHtml(item.evidence_id)} · ${escapeHtml(item.recheck_rule || "")}</p>
    </div>
  `).join("");
}

function renderMarketplace(payload) {
  $("marketplaceStack").innerHTML = (payload.modules || []).slice(0, 20).map((item) => `
    <div class="module-row">
      <div>
        <span>${escapeHtml(item.action_readiness)}</span>
        <strong>${escapeHtml(item.source)}</strong>
        <p>${escapeHtml(item.proves)}</p>
      </div>
      <button type="button" data-source="${escapeAttribute(item.source)}">Add</button>
    </div>
  `).join("");
  $("marketplaceStack").querySelectorAll("button[data-source]").forEach((button) => {
    button.addEventListener("click", () => addModuleEvidence(button.dataset.source).catch(showError));
  });
}

function renderTransitionPlan(payload) {
  lastTransitionPlan = payload;
  $("transitionStatus").textContent = payload.status;
  $("transitionStatus").className = payload.status === "ready_for_operator_sync" ? "safe-text" : "warn-text";
  $("transitionStack").innerHTML = [
    ["Queue", payload.queue_id],
    ["From", payload.transition?.from_state || payload.current_state || "-"],
    ["To", payload.transition?.to_state || "-"],
    ["Evidence", payload.evidence?.ok ? "ready" : "needs work"],
    ["Replay", payload.replay?.ok ? "verified" : "blocked"],
    ["Write", payload.write_operation?.requires_operator_token ? "operator gated" : "none"]
  ].map(([label, value]) => `
    <div class="hash-row">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </div>
  `).join("");
  $("outputTitle").textContent = "Transition queue";
  $("output").textContent = JSON.stringify(payload, null, 2);
}

function renderDiagnosis(payload) {
  $("diagnosisStatus").textContent = payload.healthy ? "No blockers" : "Recovery required";
  $("diagnosisStatus").className = payload.healthy ? "safe-text" : "warn-text";
  $("recoveryStack").innerHTML = (payload.recovery_actions || []).map((action) => `
    <div class="workflow-row">
      <span>${escapeHtml(action.type)}</span>
      <strong>${escapeHtml(action.label)}</strong>
      <p>${escapeHtml(action.reason)}</p>
    </div>
  `).join("");
}

function renderTimeline(payload) {
  $("timelineStack").innerHTML = (payload.events || []).map((event) => `
    <div class="timeline-row ${escapeAttribute(event.status)}">
      <span>${escapeHtml(event.status)}</span>
      <strong>${escapeHtml(event.state)}</strong>
      <p>${escapeHtml(event.notes || "")}</p>
      ${event.decision_hash ? `<code>${escapeHtml(short(event.decision_hash))}</code>` : ""}
    </div>
  `).join("");
}

function renderComparison(payload) {
  $("compareStatus").textContent = payload.same_content ? "No change" : "Changes found";
  $("compareStatus").className = payload.same_content ? "safe-text" : "warn-text";
  $("compareStack").innerHTML = [
    ...payload.field_diffs.map((diff) => ({
      label: diff.field,
      value: `${diff.left ?? "-"} -> ${diff.right ?? "-"}`
    })),
    {
      label: "Evidence",
      value: `+${payload.evidence_diff.added_types.length} / -${payload.evidence_diff.removed_types.length}`
    },
    {
      label: "Hashes",
      value: `${payload.changed_hashes.length} changed`
    }
  ].map((item) => `
    <div class="hash-row">
      <span>${escapeHtml(item.label)}</span>
      <strong>${escapeHtml(item.value)}</strong>
    </div>
  `).join("");
}

function renderHandoff(payload) {
  $("handoffStatus").textContent = payload.status;
  $("handoffStatus").className = payload.status === "ready" ? "safe-text" : "warn-text";
  $("handoffStack").innerHTML = [
    ["Pack", payload.pack_id],
    ["Endpoint", payload.endpoint],
    ["Replay", payload.replay_summary?.ok ? "verified" : "blocked"],
    ["Next", (payload.next_allowed_actions || []).slice(0, 3).join(", ")]
  ].map(([label, value]) => `
    <div class="hash-row">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </div>
  `).join("");
  $("outputTitle").textContent = "Agent handoff pack";
  $("output").textContent = JSON.stringify(payload, null, 2);
}

function renderStatus(status) {
  liveStatus = status;
  $("dualStatus").textContent = status?.readbackReady ? "DUAL live" : "Local proof";
  $("dualStatus").className = status?.readbackReady ? "status-pill safe" : "status-pill";
  $("writeStatus").textContent = status?.liveDualWrites ? "Writes gated" : "Writes not configured";
  $("writeStatus").className = status?.liveDualWrites ? "status-pill safe" : "status-pill";
  $("endpoint").textContent = `${window.location.origin}/mcp`;
  $("dualReadiness").innerHTML = [
    ["Mode", status?.mode || "-"],
    ["Template", status?.templateId || "-"],
    ["Object", status?.objectId || "-"],
    ["Write path", status?.writeExecutionExposed || "not configured"]
  ].map(([label, value]) => `
    <div class="readiness-row">
      <strong>${escapeHtml(label)}</strong>
      <span>${escapeHtml(value)}</span>
    </div>
  `).join("");
}

async function loadStatus() {
  const status = await jsonFetch("/api/dual/status");
  renderStatus(status);
  return status;
}

async function compose() {
  const payload = await jsonFetch(`/api/capsule/demo?scenario=${encodeURIComponent(scenario())}`);
  compareBase = null;
  currentWorkflow = null;
  renderCapsule(payload.capsule, "Composed Proof Capsule JSON");
  await refreshOperationalPanels(payload.capsule);
}

async function verify() {
  const payload = await jsonFetch("/api/capsule/verify", {
    method: "POST",
    body: JSON.stringify({ capsule: currentCapsule })
  });
  $("verifyStatus").textContent = payload.accepted ? "Verified" : payload.ok ? "Policy issue" : "Mismatch";
  $("outputTitle").textContent = "Verification report";
  $("output").textContent = JSON.stringify(payload, null, 2);
}

async function redTeam() {
  const payload = await jsonFetch("/api/capsule/red-team", {
    method: "POST",
    body: JSON.stringify({ attack: "live_write_escalation", scenario: scenario() })
  });
  $("verifyStatus").textContent = payload.blocked ? "Blocked" : "Allowed";
  $("outputTitle").textContent = "Red-team result";
  $("output").textContent = JSON.stringify(payload, null, 2);
}

async function loadCurrentLive() {
  const payload = await jsonFetch("/api/capsule/current");
  if (payload.capsule) renderCapsule(payload.capsule, payload.source === "dual_readback" ? "Live DUAL readback capsule" : "Local seed capsule");
  if (payload.capsule) await refreshOperationalPanels(payload.capsule);
  $("output").textContent = JSON.stringify(payload, null, 2);
}

async function loadWorkflow(capsule = currentCapsule) {
  if (currentWorkflow?.schema_version && capsule?.capsule_id?.startsWith("PC-CUSTOM-")) {
    const replay = await jsonFetch("/api/workflow/replay", {
      method: "POST",
      body: JSON.stringify({ scenario: "custom_workflow", capsule, workflow_definition: currentWorkflow })
    });
    renderWorkflow(currentWorkflow, replay);
    return { definition: currentWorkflow, replay };
  }
  const [definition, replay] = await Promise.all([
    jsonFetch(`/api/workflow/definition?scenario=${encodeURIComponent(scenario())}`),
    jsonFetch("/api/workflow/replay", {
      method: "POST",
      body: JSON.stringify({ scenario: scenario(), capsule })
    })
  ]);
  renderWorkflow(definition, replay);
  return { definition, replay };
}

async function verifyEvidence() {
  const payload = await jsonFetch("/api/evidence/verify", {
    method: "POST",
    body: JSON.stringify({ scenario: scenario(), capsule: currentCapsule, workflow_definition: currentWorkflow || undefined })
  });
  renderEvidenceVerification(payload);
  return payload;
}

async function loadMarketplace() {
  const payload = await jsonFetch("/api/source/marketplace");
  renderMarketplace(payload);
  return payload;
}

async function loadTimeline() {
  const payload = await jsonFetch("/api/capsule/timeline", {
    method: "POST",
    body: JSON.stringify({ scenario: scenario(), capsule: currentCapsule, workflow_definition: currentWorkflow || undefined })
  });
  renderTimeline(payload);
  return payload;
}

async function refreshOperationalPanels(capsule = currentCapsule) {
  await Promise.all([
    loadWorkflow(capsule),
    verifyEvidence(),
    loadTimeline(),
    diagnose(false),
    loadMarketplace()
  ]);
}

async function attachEvidence() {
  const ref = {
    evidence_id: $("evidenceId").value.trim() || `UI-EVIDENCE-${Date.now()}`,
    type: $("evidenceType").value.trim() || "document",
    source: $("evidenceSource").value,
    summary: $("evidenceSummary").value.trim() || "Operator-supplied evidence reference.",
    ref: $("evidenceRef").value.trim() || undefined,
    freshness_status: $("evidenceFreshness").value
  };
  await recompose({
    evidence_refs: [...(currentCapsule.evidence_refs || []), ref]
  }, "Evidence attached and hashes re-derived");
}

async function addModuleEvidence(source) {
  const type = source === "dual" ? "mandate" : source === "payment_preview" ? "settlement" : "approval";
  await recompose({
    evidence_refs: [
      ...(currentCapsule.evidence_refs || []),
      {
        evidence_id: `${source.toUpperCase()}-${Date.now()}`,
        type,
        source,
        summary: `${source} verifier module evidence reference.`,
        ref: `${source}://module/${currentCapsule.capsule_id}`
      }
    ]
  }, "Verifier module evidence attached");
}

async function buildWorkflow() {
  const payload = await jsonFetch("/api/workflow/build", {
    method: "POST",
    body: JSON.stringify({
      title: $("workflowTitle").value,
      subject_type: $("workflowSubjectType").value,
      states: $("workflowStates").value,
      evidence_types: $("workflowEvidenceTypes").value,
      sources: $("workflowSources").value,
      value_usd: Number($("workflowValue").value || 0)
    })
  });
  compareBase = null;
  renderCapsule(payload.capsule, "Workflow draft");
  renderWorkflow(payload.workflow_definition, null);
  renderEvidenceVerification(payload.validation);
  $("outputTitle").textContent = "Workflow builder draft";
  $("output").textContent = JSON.stringify(payload, null, 2);
}

async function planTransition() {
  const payload = await jsonFetch("/api/transition/plan", {
    method: "POST",
    body: JSON.stringify({
      scenario: scenario(),
      capsule: currentCapsule,
      workflow_definition: currentWorkflow || undefined,
      action: $("transitionAction").value.trim() || undefined
    })
  });
  renderTransitionPlan(payload);
  renderEvidenceVerification(payload.evidence);
  if (currentWorkflow) renderWorkflow(currentWorkflow, payload.replay);
}

async function applyTransitionLocal() {
  if (!lastTransitionPlan?.queued_capsule) throw new Error("Run transition dry-run first.");
  renderCapsule(lastTransitionPlan.queued_capsule, "Queued transition applied locally");
  await refreshOperationalPanels(lastTransitionPlan.queued_capsule);
}

function operatorHeaders() {
  const token = $("operatorToken").value.trim();
  if (!token) throw new Error("Operator token is required for live DUAL writes.");
  return { "x-demo-operator-token": token };
}

async function syncLive(capsule = currentCapsule, auditSource = "proof-capsule-ui") {
  const payload = await jsonFetch("/api/capsules/sync", {
    method: "POST",
    headers: operatorHeaders(),
    body: JSON.stringify({
      capsule,
      audit: {
        source: auditSource,
        scenario: scenario()
      }
    })
  });
  $("verifyStatus").textContent = payload.verification?.ok ? "DUAL synced" : "Sync issue";
  if (payload.capsule) renderCapsule(payload.capsule, "Live DUAL sync result");
  if (payload.capsule) await refreshOperationalPanels(payload.capsule);
  $("outputTitle").textContent = "Live DUAL sync result";
  $("output").textContent = JSON.stringify(payload, null, 2);
  await loadStatus();
}

async function syncQueuedTransition() {
  if (!lastTransitionPlan?.queued_capsule) throw new Error("Run transition dry-run first.");
  await syncLive(lastTransitionPlan.queued_capsule, "proof-capsule-transition-queue");
}

async function mintLive() {
  const payload = await jsonFetch("/api/capsules/mint", {
    method: "POST",
    headers: operatorHeaders(),
    body: JSON.stringify({
      capsule: currentCapsule,
      force: false,
      audit: {
        source: "proof-capsule-ui",
        scenario: scenario()
      }
    })
  });
  $("verifyStatus").textContent = payload.verification?.ok ? "DUAL minted" : "Mint issue";
  if (payload.capsule) renderCapsule(payload.capsule, "Live DUAL mint result");
  if (payload.capsule) await refreshOperationalPanels(payload.capsule);
  $("outputTitle").textContent = "Live DUAL mint result";
  $("output").textContent = JSON.stringify(payload, null, 2);
  await loadStatus();
}

async function diagnose(showOutput = true) {
  const payload = await jsonFetch("/api/capsule/diagnose", {
    method: "POST",
    body: JSON.stringify({ scenario: scenario(), capsule: currentCapsule, workflow_definition: currentWorkflow || undefined })
  });
  renderDiagnosis(payload);
  if (showOutput) {
    $("outputTitle").textContent = "Recovery diagnosis";
    $("output").textContent = JSON.stringify(payload, null, 2);
  }
  return payload;
}

function setCompareBase() {
  compareBase = clone(currentCapsule);
  $("compareStatus").textContent = "Base set";
  $("compareStatus").className = "safe-text";
  $("compareStack").innerHTML = `
    <div class="hash-row">
      <span>Base</span>
      <strong>${escapeHtml(compareBase.capsule_id)} / ${escapeHtml(short(compareBase.hashes?.capsule_content_hash))}</strong>
    </div>
  `;
}

async function compareCurrent() {
  const payload = await jsonFetch("/api/capsule/compare", {
    method: "POST",
    body: JSON.stringify({
      scenario: scenario(),
      left: compareBase || undefined,
      right: currentCapsule
    })
  });
  renderComparison(payload);
  $("outputTitle").textContent = "Capsule comparison";
  $("output").textContent = JSON.stringify(payload, null, 2);
}

async function generateHandoff() {
  const payload = await jsonFetch("/api/agent/handoff", {
    method: "POST",
    body: JSON.stringify({
      scenario: scenario(),
      capsule: currentCapsule,
      workflow_definition: currentWorkflow || undefined,
      endpoint: `${window.location.origin}/mcp`
    })
  });
  renderHandoff(payload);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("'", "&#39;");
}

function showError(error) {
  $("outputTitle").textContent = "Load error";
  $("output").textContent = JSON.stringify(error.payload || { error: error.message }, null, 2);
}

$("composeBtn").addEventListener("click", () => compose().catch(showError));
$("verifyBtn").addEventListener("click", () => verify().catch(showError));
$("redTeamBtn").addEventListener("click", () => redTeam().catch(showError));
$("syncBtn").addEventListener("click", () => syncLive().catch(showError));
$("mintBtn").addEventListener("click", () => mintLive().catch(showError));
$("attachEvidenceBtn").addEventListener("click", () => attachEvidence().catch(showError));
$("verifyEvidenceBtn").addEventListener("click", () => verifyEvidence().then((payload) => {
  $("outputTitle").textContent = "Evidence verification";
  $("output").textContent = JSON.stringify(payload, null, 2);
}).catch(showError));
$("buildWorkflowBtn").addEventListener("click", () => buildWorkflow().catch(showError));
$("planTransitionBtn").addEventListener("click", () => planTransition().catch(showError));
$("applyTransitionBtn").addEventListener("click", () => applyTransitionLocal().catch(showError));
$("syncTransitionBtn").addEventListener("click", () => syncQueuedTransition().catch(showError));
$("diagnoseBtn").addEventListener("click", () => diagnose(true).catch(showError));
$("setCompareBaseBtn").addEventListener("click", () => setCompareBase());
$("compareCurrentBtn").addEventListener("click", () => compareCurrent().catch(showError));
$("handoffBtn").addEventListener("click", () => generateHandoff().catch(showError));
$("scenarioSelect").addEventListener("change", () => compose().catch(showError));

Promise.resolve()
  .then(loadStatus)
  .then((status) => status.readbackReady ? loadCurrentLive() : compose())
  .catch(showError);
