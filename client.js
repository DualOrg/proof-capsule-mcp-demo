let currentCapsule = null;
let liveStatus = null;
let currentWorkflow = null;
let lastTransitionPlan = null;
let compareBase = null;
let lastProofRun = null;
let publicMode = false;
let reviewerMode = false;
let reviewerStepIndex = 0;

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
  return String(value || "").replace(/^sha256:/, "").slice(0, 12);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function safeExternalUrl(value) {
  try {
    const url = new URL(String(value || ""), window.location.origin);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url.href;
  } catch {
    return null;
  }
}

function scenario() {
  return $("scenarioSelect").value;
}

const reviewerSteps = [
  {
    id: "scenario",
    targetId: "scenarioPanel",
    title: "Choose a proof workflow",
    body: "Start with one of the five demo workflows. Each one composes a different proof capsule shape while keeping the same DUAL verifier boundary.",
    facts: () => [
      ["Scenario", $("scenarioLabel")?.textContent || "Loading"],
      ["MCP", "24 tools"],
      ["Public writes", "false"],
      ["Mode", liveStatus?.mode || "checking"]
    ]
  },
  {
    id: "capsule",
    targetId: "capsulePanel",
    title: "Inspect the capsule",
    body: "The center panel shows the subject, decision, evidence references, state transition, workflow replay, and source verifier contracts.",
    facts: () => [
      ["Capsule", currentCapsule?.capsule_id || "Loading"],
      ["Decision", currentCapsule?.decision?.result || "-"],
      ["Evidence", String(currentCapsule?.evidence_refs?.length || 0)],
      ["State", currentCapsule?.state_transition?.to_state || "-"]
    ]
  },
  {
    id: "proof-run",
    targetId: "proofRunPanel",
    title: "Run the public proof",
    body: "The proof run compresses hashes, policy decision, source checks, DUAL anchors, timeline, diagnosis, and safe next action into one reviewer packet.",
    facts: () => [
      ["Status", lastProofRun?.status || "Not run"],
      ["Score", lastProofRun?.proof_score?.score ? `${lastProofRun.proof_score.score}/100` : "-"],
      ["Link", lastProofRun?.link_integrity?.status || "not checked"],
      ["Boundary", lastProofRun?.write_boundary?.write_execution || "public verify"]
    ]
  },
  {
    id: "proof-rail",
    targetId: "proofRailPanel",
    title: "Check DUAL anchors",
    body: "The proof rail shows DUAL readiness, replay status, timeline, hashes, and explorer links while keeping writes operator-gated.",
    facts: () => [
      ["DUAL", liveStatus?.readbackReady ? "live" : "fallback"],
      ["Object", short(liveStatus?.objectId || currentCapsule?.dual_anchor?.object_id)],
      ["Writes", liveStatus?.liveDualWrites ? "operator gated" : "not configured"],
      ["Public", String(Boolean(liveStatus?.publicWrites))]
    ]
  },
  {
    id: "support",
    targetId: "supportPanel",
    title: "Reviewer support",
    body: "The support rail gives the reviewer a fixed route through the demo and keeps the safety boundary visible throughout the walkthrough.",
    facts: () => [
      ["Run proof", lastProofRun ? "complete" : "pending"],
      ["Verifier", lastProofRun?.public_url ? "ready" : "pending"],
      ["Red-team", "live_write_blocked"],
      ["Gate", "operator token"]
    ]
  }
];

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

function renderHeaderContext() {
  $("headerMode").textContent = liveStatus?.readbackReady ? "DUAL live" : liveStatus?.mode || "Local proof";
  $("headerCapsuleId").textContent = currentCapsule?.capsule_id || "Loading";
  $("headerObjectId").textContent = liveStatus?.objectId || currentCapsule?.dual_anchor?.object_id || "Pending";
}

function renderSupportGuide() {
  const proofReady = Boolean(lastProofRun);
  const publicReady = Boolean(lastProofRun?.public_url || currentCapsule?.capsule_id);
  const dualReady = Boolean(liveStatus?.readbackReady || currentCapsule?.dual_anchor?.object_id);
  const writeSafe = liveStatus?.publicWrites === false;
  const checks = [
    {
      label: "Run proof bundle",
      detail: proofReady ? `${lastProofRun?.proof_score?.score ?? "-"} proof score, ${lastProofRun?.status || "ready"}` : "Use Run proof to create the reviewer packet.",
      ok: proofReady
    },
    {
      label: "Open public verifier",
      detail: publicReady ? "Shareable /proof route is available for this capsule." : "Compose a capsule first.",
      ok: publicReady
    },
    {
      label: "Check DUAL anchors",
      detail: dualReady ? "DUAL object/template references and proof links are visible in the rail." : "Live readback is not yet visible.",
      ok: dualReady
    },
    {
      label: "Confirm write boundary",
      detail: writeSafe ? "Public writes are false; live writes remain operator-gated." : "Write boundary needs review.",
      ok: writeSafe
    }
  ];
  $("supportStatus").textContent = checks.every((check) => check.ok) ? "Reviewer ready" : "Needs proof run";
  $("supportChecklist").innerHTML = checks.map((check) => `
    <div class="support-check ${check.ok ? "" : "warn"}">
      <strong>${escapeHtml(check.label)}</strong>
      <span>${escapeHtml(check.detail)}</span>
    </div>
  `).join("");
  $("demoScript").innerHTML = [
    ["1", "Run proof", "Creates a content-addressed verifier bundle and public proof URL."],
    ["2", "Open verifier", "Shows the tamper-evident public proof view with operator controls hidden."],
    ["3", "Red-team gate", "Demonstrates that public callers can verify or refuse but cannot write to DUAL."]
  ].map(([step, title, detail]) => `
    <div>
      <strong>${escapeHtml(step)}. ${escapeHtml(title)}</strong>
      <span>${escapeHtml(detail)}</span>
    </div>
  `).join("");
}

function renderReviewerGuide() {
  const guide = $("reviewerGuide");
  document.querySelectorAll(".review-focus").forEach((element) => element.classList.remove("review-focus"));

  if (!reviewerMode || publicMode) {
    guide.hidden = true;
    $("reviewerModeBtn").classList.remove("active");
    return;
  }

  const step = reviewerSteps[reviewerStepIndex] || reviewerSteps[0];
  const target = $(step.targetId);
  if (target) target.classList.add("review-focus");

  guide.hidden = false;
  $("reviewerModeBtn").classList.add("active");
  $("reviewerEyebrow").textContent = `Step ${reviewerStepIndex + 1} of ${reviewerSteps.length}`;
  $("reviewerTitle").textContent = step.title;
  $("reviewerBody").textContent = step.body;
  $("reviewerFacts").innerHTML = step.facts().map(([label, value]) => `
    <div>
      <dt>${escapeHtml(label)}</dt>
      <dd>${escapeHtml(value)}</dd>
    </div>
  `).join("");
  $("reviewerProgress").style.setProperty("--progress", `${((reviewerStepIndex + 1) / reviewerSteps.length) * 100}%`);
  $("reviewerPrevBtn").disabled = reviewerStepIndex === 0;
  $("reviewerNextBtn").textContent = reviewerStepIndex === reviewerSteps.length - 1 ? "Finish" : "Next";
}

function scrollReviewerTarget() {
  const step = reviewerSteps[reviewerStepIndex] || reviewerSteps[0];
  const target = $(step.targetId);
  if (target) target.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
}

function refreshReviewChrome() {
  renderHeaderContext();
  renderSupportGuide();
  renderReviewerGuide();
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
  ].map(([label, href]) => [label, safeExternalUrl(href), href]).filter(([, safeHref]) => Boolean(safeHref));

  $("linkStack").innerHTML = links.map(([label, safeHref, originalHref]) => `
    <div class="link-row">
      <span>${escapeHtml(label)}</span>
      <a href="${escapeAttribute(safeHref)}" target="_blank" rel="noreferrer noopener">${escapeHtml(originalHref)}</a>
    </div>
  `).join("");

  $("outputTitle").textContent = outputTitle;
  $("output").textContent = JSON.stringify(capsule, null, 2);
  refreshReviewChrome();
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

function renderProofRun(payload, outputTitle = "Proof run") {
  lastProofRun = payload;
  const writeExecution = payload.write_boundary?.write_execution || payload.capsule?.write_boundary?.write_execution || "";
  const boundaryLabel = !writeExecution || writeExecution === "none"
    ? "public writes off"
    : writeExecution;
  $("proofRunPanel").hidden = false;
  $("proofRunStatus").textContent = `${payload.status || payload.proof_score?.status || "ready"} / ${payload.proof_score?.score ?? "-"}%`;
  $("proofRunStatus").className = payload.ok === false ? "warn-text" : "safe-text";
  $("proofRunMetrics").innerHTML = [
    ["Proof", payload.public_proof_id || payload.public_verifier?.public_proof_id || payload.run_id || "-"],
    ["Decision", payload.summary?.decision || payload.capsule?.decision?.result || payload.public_verifier?.summary?.decision || "-"],
    ["Score", `${payload.proof_score?.score ?? "-"} / ${payload.proof_score?.max_score ?? 100}`],
    ["Boundary", boundaryLabel],
    ["Link", payload.link_integrity?.status || payload.public_verifier?.link_integrity?.status || "not checked"]
  ].map(([label, value]) => `
    <div class="proof-metric">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </div>
  `).join("");

  const steps = payload.steps || payload.sections?.workflow_replay?.replay_steps?.map((step) => ({
    step: step.name,
    pass: step.pass,
    detail: step.detail
  })) || [];
  $("proofRunSteps").innerHTML = steps.map((step) => `
    <div class="workflow-row ${step.pass ? "verified" : "missing"}">
      <span>${escapeHtml(step.pass ? "passed" : "needs work")}</span>
      <strong>${escapeHtml(step.step || step.name)}</strong>
      <p>${escapeHtml(step.detail || "")}</p>
    </div>
  `).join("");

  const publicUrl = payload.public_url || payload.public_verifier?.public_url || payload.links?.public_url;
  const linkRows = [
    ["Public verifier", publicUrl],
    ["MCP endpoint", payload.links?.mcp_endpoint || payload.public_verifier?.links?.mcp_endpoint || `${window.location.origin}/mcp`],
    ...((payload.links?.dual || payload.public_verifier?.links?.dual || []).map((link) => [link.label, link.url]))
  ].map(([label, href]) => [label, safeExternalUrl(href), href]).filter(([, safeHref]) => Boolean(safeHref));
  $("proofRunLinks").innerHTML = linkRows.map(([label, safeHref, originalHref]) => `
    <div class="link-row">
      <span>${escapeHtml(label)}</span>
      <a href="${escapeAttribute(safeHref)}" target="_blank" rel="noreferrer noopener">${escapeHtml(originalHref)}</a>
    </div>
  `).join("");

  const sourceChecks = payload.evidence?.results || payload.sections?.source_checks || payload.public_verifier?.sections?.source_checks || [];
  $("proofRunSources").innerHTML = sourceChecks.slice(0, 8).map((item) => `
    <div class="workflow-row ${escapeAttribute(item.status)}">
      <span>${escapeHtml(item.status)}</span>
      <strong>${escapeHtml(item.type)} / ${escapeHtml(item.source || "missing")}</strong>
      <p>${escapeHtml(item.recheck_rule || item.proves || "")}</p>
    </div>
  `).join("");

  $("outputTitle").textContent = outputTitle;
  $("output").textContent = JSON.stringify(payload, null, 2);
  refreshReviewChrome();
}

function renderPublicVerifierBanner(payload) {
  const integrity = payload.link_integrity || {};
  const checks = integrity.checks || [];
  $("publicVerifierBanner").hidden = false;
  $("publicVerifierTitle").textContent = payload.summary?.title || payload.capsule_id || "Verifier page";
  $("publicVerifierStatement").textContent = payload.verifier_statement || "Read-only proof envelope.";
  $("publicVerifierIntegrity").textContent = integrity.status || "not checked";
  $("publicVerifierIntegrity").className = integrity.ok === false ? "warn-text" : integrity.verified ? "safe-text" : "";
  $("publicVerifierAction").textContent = integrity.action || "";
  $("publicVerifierChecks").innerHTML = checks.map((check) => `
    <div class="integrity-row ${check.verifies ? "verified" : "missing"}">
      <span>${escapeHtml(check.check.replaceAll("_", " "))}</span>
      <strong>${escapeHtml(!check.supplied ? "not supplied" : check.verifies ? "matched" : "mismatch")}</strong>
      <p>${escapeHtml(check.supplied ? check.received : `Expected ${check.expected}`)}</p>
    </div>
  `).join("");
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
  refreshReviewChrome();
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

async function runProof() {
  const payload = await jsonFetch("/api/proof/run", {
    method: "POST",
    body: JSON.stringify({
      scenario: scenario(),
      capsule: currentCapsule,
      workflow_definition: currentWorkflow || undefined,
      base_url: window.location.origin,
      endpoint: `${window.location.origin}/mcp`
    })
  });
  renderProofRun(payload, "One-click proof run");
  return payload;
}

function scenarioFromProofPath(capsuleId = "") {
  if (capsuleId.includes("INSURANCE")) return "insurance_claim";
  if (capsuleId.includes("AGENT-MANDATE")) return "agent_mandate_purchase";
  if (capsuleId.includes("LUXURY")) return "luxury_resale";
  if (capsuleId.includes("CARBON")) return "carbon_credit";
  return "tradeflow_medical_devices";
}

async function loadPublicProofRoute() {
  const parts = window.location.pathname.split("/").filter(Boolean);
  if (parts[0] !== "proof") return false;
  publicMode = true;
  document.body.classList.add("public-mode");
  const capsuleId = decodeURIComponent(parts[1] || "");
  const params = new URLSearchParams(window.location.search);
  const requestedScenario = params.get("scenario") || scenarioFromProofPath(capsuleId);
  const requestedContentHash = params.get("content_hash") || params.get("hash") || "";
  $("scenarioSelect").value = requestedScenario;
  const payload = await jsonFetch(`/api/proof/public?scenario=${encodeURIComponent(requestedScenario)}&proof_id=${encodeURIComponent(capsuleId)}&content_hash=${encodeURIComponent(requestedContentHash)}`);
  currentWorkflow = null;
  document.title = `${payload.capsule_id} public proof`;
  document.querySelector(".topbar h1").textContent = "Proof Capsule Verifier";
  document.querySelector(".intro h2").textContent = "Read-only proof envelope with DUAL-gated writes disabled.";
  document.querySelector(".intro .lede").textContent = "This public page re-derives the capsule, source checks, policy decision, workflow replay, and link integrity without exposing any write action.";
  renderCapsule(payload.capsule, "Public verifier page");
  renderProofRun(payload, "Public verifier page");
  renderPublicVerifierBanner(payload);
  renderEvidenceVerification({ ok: payload.sections?.source_checks?.every((item) => item.status === "verified"), results: payload.sections?.source_checks || [] });
  renderTimeline({ events: payload.sections?.timeline || [] });
  await loadWorkflow(payload.capsule);
  await diagnose(false);
  return true;
}

function openProofPage() {
  if (!currentCapsule?.capsule_id) return;
  const url = `/proof/${encodeURIComponent(currentCapsule.capsule_id)}?scenario=${encodeURIComponent(scenario())}&content_hash=${encodeURIComponent(short(currentCapsule.hashes?.capsule_content_hash))}`;
  window.location.assign(url);
}

async function ensureProofThenOpen() {
  if (!lastProofRun) await runProof();
  openProofPage();
}

async function toggleReviewerMode() {
  reviewerMode = !reviewerMode;
  if (reviewerMode) reviewerStepIndex = 0;
  renderReviewerGuide();
  if (reviewerMode) scrollReviewerTarget();
}

function advanceReviewerStep() {
  if (reviewerStepIndex >= reviewerSteps.length - 1) {
    reviewerMode = false;
    renderReviewerGuide();
    return;
  }
  reviewerStepIndex += 1;
  renderReviewerGuide();
  scrollReviewerTarget();
}

function retreatReviewerStep() {
  reviewerStepIndex = Math.max(0, reviewerStepIndex - 1);
  renderReviewerGuide();
  scrollReviewerTarget();
}

function closeReviewerMode() {
  reviewerMode = false;
  renderReviewerGuide();
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
$("runProofBtn").addEventListener("click", () => runProof().catch(showError));
$("openProofBtn").addEventListener("click", () => openProofPage());
$("redTeamBtn").addEventListener("click", () => redTeam().catch(showError));
$("topRunProofBtn").addEventListener("click", () => runProof().catch(showError));
$("topOpenProofBtn").addEventListener("click", () => ensureProofThenOpen().catch(showError));
$("reviewerModeBtn").addEventListener("click", () => toggleReviewerMode().catch(showError));
$("walkRunProofBtn").addEventListener("click", () => runProof().catch(showError));
$("walkOpenProofBtn").addEventListener("click", () => ensureProofThenOpen().catch(showError));
$("walkRedTeamBtn").addEventListener("click", () => redTeam().catch(showError));
$("reviewerPrevBtn").addEventListener("click", retreatReviewerStep);
$("reviewerNextBtn").addEventListener("click", advanceReviewerStep);
$("reviewerCloseBtn").addEventListener("click", closeReviewerMode);
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
  .then(async (status) => {
    const routed = await loadPublicProofRoute();
    if (!routed) return status.readbackReady ? loadCurrentLive() : compose();
  })
  .catch(showError);
