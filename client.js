let currentCapsule = null;
let liveStatus = null;

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

function renderCapsule(capsule, outputTitle = "Current capsule JSON") {
  currentCapsule = capsule;
  $("scenarioLabel").textContent = $("scenarioSelect").selectedOptions[0]?.textContent || "Scenario";
  $("capsuleId").textContent = capsule.capsule_id;
  $("capsuleType").textContent = capsule.capsule_type;
  $("decision").textContent = capsule.decision?.result || "-";
  $("valueUsd").textContent = formatUsd(capsule.subject?.value_usd);
  $("evidenceCount").textContent = String(capsule.evidence_refs?.length || 0);
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
  const scenario = $("scenarioSelect").value;
  const payload = await jsonFetch(`/api/capsule/demo?scenario=${encodeURIComponent(scenario)}`);
  renderCapsule(payload.capsule, "Composed Proof Capsule JSON");
}

async function verify() {
  const payload = await jsonFetch("/api/capsule/verify", {
    method: "POST",
    body: JSON.stringify({ capsule: currentCapsule })
  });
  $("verifyStatus").textContent = payload.ok ? "Verified" : "Mismatch";
  $("outputTitle").textContent = "Verification report";
  $("output").textContent = JSON.stringify(payload, null, 2);
}

async function redTeam() {
  const payload = await jsonFetch("/api/capsule/red-team", {
    method: "POST",
    body: JSON.stringify({ attack: "live_write_escalation", scenario: $("scenarioSelect").value })
  });
  $("verifyStatus").textContent = payload.blocked ? "Blocked" : "Allowed";
  $("outputTitle").textContent = "Red-team result";
  $("output").textContent = JSON.stringify(payload, null, 2);
}

async function loadCurrentLive() {
  const payload = await jsonFetch("/api/capsule/current");
  if (payload.capsule) renderCapsule(payload.capsule, payload.source === "dual_readback" ? "Live DUAL readback capsule" : "Local seed capsule");
  $("output").textContent = JSON.stringify(payload, null, 2);
}

function operatorHeaders() {
  const token = $("operatorToken").value.trim();
  if (!token) throw new Error("Operator token is required for live DUAL writes.");
  return { "x-demo-operator-token": token };
}

async function syncLive() {
  const payload = await jsonFetch("/api/capsules/sync", {
    method: "POST",
    headers: operatorHeaders(),
    body: JSON.stringify({
      capsule: currentCapsule,
      audit: {
        source: "proof-capsule-ui",
        scenario: $("scenarioSelect").value
      }
    })
  });
  $("verifyStatus").textContent = payload.verification?.ok ? "DUAL synced" : "Sync issue";
  if (payload.capsule) renderCapsule(payload.capsule, "Live DUAL sync result");
  $("outputTitle").textContent = "Live DUAL sync result";
  $("output").textContent = JSON.stringify(payload, null, 2);
  await loadStatus();
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
        scenario: $("scenarioSelect").value
      }
    })
  });
  $("verifyStatus").textContent = payload.verification?.ok ? "DUAL minted" : "Mint issue";
  if (payload.capsule) renderCapsule(payload.capsule, "Live DUAL mint result");
  $("outputTitle").textContent = "Live DUAL mint result";
  $("output").textContent = JSON.stringify(payload, null, 2);
  await loadStatus();
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

$("composeBtn").addEventListener("click", () => compose().catch(showError));
$("verifyBtn").addEventListener("click", () => verify().catch(showError));
$("redTeamBtn").addEventListener("click", () => redTeam().catch(showError));
$("syncBtn").addEventListener("click", () => syncLive().catch(showError));
$("mintBtn").addEventListener("click", () => mintLive().catch(showError));
$("scenarioSelect").addEventListener("change", () => compose().catch(showError));

function showError(error) {
  $("outputTitle").textContent = "Load error";
  $("output").textContent = JSON.stringify(error.payload || { error: error.message }, null, 2);
}

Promise.resolve()
  .then(loadStatus)
  .then((status) => status.readbackReady ? loadCurrentLive() : compose())
  .catch(showError);
