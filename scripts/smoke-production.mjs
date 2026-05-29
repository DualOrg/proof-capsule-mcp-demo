const baseUrl = (process.argv[2] || process.env.PROOF_CAPSULE_PROD_URL || "").replace(/\/+$/, "");
if (!baseUrl) {
  console.error("Usage: npm run smoke:prod -- https://your-deployment.example");
  process.exit(1);
}

async function get(path) {
  const response = await fetch(`${baseUrl}${path}`);
  const payload = await response.json();
  if (!response.ok) throw new Error(`${path} failed with ${response.status}: ${JSON.stringify(payload)}`);
  return payload;
}

async function post(path, body) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(`${path} failed with ${response.status}: ${JSON.stringify(payload)}`);
  return payload;
}

const status = await get("/api/status");
const dual = await get("/api/dual/status");
const demo = await get("/api/capsule/demo?scenario=luxury_resale");
const workflow = await get("/api/workflow/definition?scenario=luxury_resale");
const verifiers = await get("/api/source/verifiers");
const marketplace = await get("/api/source/marketplace");
const verification = await post("/api/capsule/verify", { capsule: demo.capsule });
const replay = await post("/api/workflow/replay", { scenario: "luxury_resale", capsule: demo.capsule });
const evidence = await post("/api/evidence/verify", { scenario: "luxury_resale", capsule: demo.capsule });
const transition = await post("/api/transition/plan", { scenario: "luxury_resale", capsule: demo.capsule });
const timeline = await post("/api/capsule/timeline", { scenario: "luxury_resale", capsule: demo.capsule });
const proofRun = await post("/api/proof/run", { scenario: "luxury_resale", capsule: demo.capsule });
const publicVerifier = await get("/api/proof/public?scenario=luxury_resale");
const diagnosis = await post("/api/capsule/diagnose", { scenario: "luxury_resale", capsule: demo.capsule });
const draft = await post("/api/workflow/build", {
  title: "Supplier onboarding approval",
  subject_type: "supplier_record",
  states: "Requested, Evidence ready, Approved, Closed",
  evidence_types: "identity, compliance, mandate, settlement",
  sources: "enterprise_vault, counterparty_registry, dual, payment_preview",
  value_usd: 25000
});
const comparison = await post("/api/capsule/compare", {
  left: demo.capsule,
  right: {
    ...demo.capsule,
    evidence_refs: demo.capsule.evidence_refs.slice(0, 5)
  }
});
const handoff = await post("/api/agent/handoff", { scenario: "luxury_resale", capsule: demo.capsule, endpoint: `${baseUrl}/mcp` });
const redTeam = await post("/api/capsule/red-team", { attack: "live_write_escalation" });
const mcp = await get("/mcp");

const ok = Boolean(
  status.publicWrites === false
  && dual.publicWrites === false
  && verification.accepted
  && workflow.workflow_id
  && replay.ok
  && evidence.ok
  && transition.write_operation?.requires_operator_token
  && timeline.timeline_hash
  && proofRun.run_id
  && proofRun.public_verifier?.public_url
  && publicVerifier.public_url
  && publicVerifier.sections?.source_checks?.length > 0
  && diagnosis.healthy
  && verifiers.verifier_count >= 10
  && marketplace.module_count >= verifiers.verifier_count
  && draft.draft_hash
  && comparison.changed_hashes?.length > 0
  && handoff.mcp_calls?.some((call) => call.tool === "plan_transition_queue")
  && redTeam.blocked
  && mcp.tools?.includes("sync_proof_capsule_live")
  && mcp.tools?.includes("replay_workflow_capsule")
  && mcp.tools?.includes("build_workflow_draft")
  && mcp.tools?.includes("plan_transition_queue")
  && mcp.tools?.includes("run_proof_capsule")
  && mcp.tools?.includes("get_public_verifier_page")
);

console.log(JSON.stringify({
  ok,
  baseUrl,
  mode: status.mode,
  liveDualWrites: status.liveDualWrites,
  dualReadback: dual.readbackReady,
  operatorGateConfigured: dual.operatorGateConfigured,
  publicWrites: status.publicWrites,
  mcpToolCount: mcp.tools?.length || 0,
  verifiedScenario: demo.capsule?.capsule_id,
  workflowId: workflow.workflow_id,
  workflowReplayHash: replay.hash_replay?.workflow_replay_hash,
  evidenceVerified: evidence.summary?.verified,
  transitionQueueId: transition.queue_id,
  timelineHash: timeline.timeline_hash,
  proofRunId: proofRun.run_id,
  publicVerifierUrl: publicVerifier.public_url,
  sourceVerifierCount: verifiers.verifier_count,
  marketplaceModuleCount: marketplace.module_count,
  workflowDraftHash: draft.draft_hash,
  compareHash: comparison.compare_hash,
  handoffPackId: handoff.pack_id,
  redTeamCode: redTeam.code
}, null, 2));

if (!ok) process.exit(1);
