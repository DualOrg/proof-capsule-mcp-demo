import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const url = process.env.MCP_URL || "http://127.0.0.1:4184/mcp";
const client = new Client({
  name: "proof-capsule-smoke",
  version: "0.1.0"
});

const transport = new StreamableHTTPClientTransport(new URL(url));
await client.connect(transport);

const tools = await client.listTools();
const toolNames = tools.tools.map((tool) => tool.name).sort();
for (const required of [
  "build_workflow_draft",
  "compose_proof_capsule",
  "compare_capsules",
  "diagnose_capsule",
  "evaluate_capsule_policy",
  "generate_agent_handoff_pack",
  "get_public_verifier_page",
  "get_current_live_capsule",
  "get_capsule_handoff",
  "get_capsule_status",
  "get_proof_timeline",
  "get_live_dual_status",
  "get_workflow_definition",
  "list_verifier_marketplace",
  "list_source_verifiers",
  "list_workflow_templates",
  "mint_proof_capsule_live",
  "plan_transition_queue",
  "red_team_capsule",
  "replay_workflow_capsule",
  "run_proof_capsule",
  "sync_proof_capsule_live",
  "verify_evidence_refs",
  "verify_proof_capsule"
]) {
  if (!toolNames.includes(required)) throw new Error(`Missing tool: ${required}`);
}

const writeTools = new Set(["mint_proof_capsule_live", "sync_proof_capsule_live"]);
const unsafe = tools.tools
  .filter((tool) => !writeTools.has(tool.name))
  .filter((tool) => tool.annotations?.readOnlyHint !== true || tool.annotations?.destructiveHint !== false)
  .map((tool) => tool.name);
if (unsafe.length) throw new Error(`Unsafe tool annotations: ${unsafe.join(", ")}`);
const writeAnnotationIssues = tools.tools
  .filter((tool) => writeTools.has(tool.name))
  .filter((tool) => tool.annotations?.readOnlyHint !== false || tool.annotations?.destructiveHint !== true)
  .map((tool) => tool.name);
if (writeAnnotationIssues.length) throw new Error(`Write tool annotations incorrect: ${writeAnnotationIssues.join(", ")}`);

const resources = await client.listResources();
const resourceUris = resources.resources.map((resource) => resource.uri).sort();
for (const required of [
  "capsule://dual/current",
  "capsule://dual/status",
  "capsule://demo/tradeflow-medical-devices",
  "capsule://manifest",
  "capsule://policy/default",
  "capsule://schema",
  "capsule://scorecard",
  "capsule://source-verifiers",
  "capsule://verifier-marketplace",
  "capsule://operator-runbook",
  "capsule://proof-runbook",
  "capsule://workflows"
]) {
  if (!resourceUris.includes(required)) throw new Error(`Missing resource: ${required}`);
}

const templates = await client.listResourceTemplates();
if (!templates.resourceTemplates.some((template) => template.uriTemplate === "capsule://demo/{scenario}")) {
  throw new Error("Missing scenario resource template.");
}
if (!templates.resourceTemplates.some((template) => template.uriTemplate === "capsule://workflow/{scenario}")) {
  throw new Error("Missing workflow resource template.");
}
if (!templates.resourceTemplates.some((template) => template.uriTemplate === "capsule://public-proof/{scenario}")) {
  throw new Error("Missing public proof resource template.");
}

const prompts = await client.listPrompts();
const promptNames = prompts.prompts.map((prompt) => prompt.name);
for (const required of ["proof_capsule_review", "mcp_client_handoff", "red_team_capsule_boundary", "design_proof_capsule_workflow", "operate_capsule_transition", "compare_capsule_versions", "publish_proof_capsule_verifier_page"]) {
  if (!promptNames.includes(required)) throw new Error(`Missing prompt: ${required}`);
}

const status = await client.callTool({ name: "get_capsule_status", arguments: {} });
if (status.structuredContent?.publicWrites !== false) {
  throw new Error("Status did not declare public writes disabled.");
}
const supportedScenarios = status.structuredContent?.supported_scenarios || [];
if (supportedScenarios.length < 3) {
  throw new Error("Status did not expose enough proof-capsule scenarios.");
}

const composed = await client.callTool({
  name: "compose_proof_capsule",
  arguments: { scenario: "tradeflow_medical_devices" }
});
const capsule = composed.structuredContent;
if (!capsule?.hashes?.capsule_content_hash || !capsule?.write_boundary || capsule.write_boundary.live_dual_writes !== false) {
  throw new Error("Composed capsule missing hashes or write boundary.");
}

const verified = await client.callTool({
  name: "verify_proof_capsule",
  arguments: { capsule }
});
if (!verified.structuredContent?.ok) {
  throw new Error("Verifier did not accept the composed capsule.");
}

const evaluation = await client.callTool({
  name: "evaluate_capsule_policy",
  arguments: { capsule }
});
if (evaluation.structuredContent?.result === "Blocked") {
  throw new Error("Default capsule should not be blocked.");
}

const workflow = await client.callTool({
  name: "get_workflow_definition",
  arguments: { scenario: "tradeflow_medical_devices" }
});
if (!workflow.structuredContent?.workflow_id || !workflow.structuredContent?.transitions?.length) {
  throw new Error("Workflow definition did not expose a reusable state machine.");
}

const replay = await client.callTool({
  name: "replay_workflow_capsule",
  arguments: { scenario: "tradeflow_medical_devices", capsule }
});
if (!replay.structuredContent?.ok || !replay.structuredContent?.hash_replay?.workflow_replay_hash) {
  throw new Error("Workflow replay did not verify the capsule.");
}

const evidence = await client.callTool({
  name: "verify_evidence_refs",
  arguments: { scenario: "tradeflow_medical_devices", capsule }
});
if (!evidence.structuredContent?.ok || evidence.structuredContent?.summary?.verified < capsule.evidence_refs.length) {
  throw new Error("Evidence intake verification did not pass.");
}

const timeline = await client.callTool({
  name: "get_proof_timeline",
  arguments: { scenario: "tradeflow_medical_devices", capsule }
});
if (!timeline.structuredContent?.timeline_hash || !timeline.structuredContent?.events?.length) {
  throw new Error("Proof timeline did not render lifecycle events.");
}

const proofRun = await client.callTool({
  name: "run_proof_capsule",
  arguments: { scenario: "tradeflow_medical_devices", capsule, base_url: "http://127.0.0.1:4184", endpoint: url }
});
if (!proofRun.structuredContent?.run_id || !proofRun.structuredContent?.public_verifier?.public_url || proofRun.structuredContent?.proof_score?.score < 90) {
  throw new Error("One-click proof run is incomplete.");
}

const publicVerifier = await client.callTool({
  name: "get_public_verifier_page",
  arguments: { scenario: "tradeflow_medical_devices", capsule, base_url: "http://127.0.0.1:4184", endpoint: url }
});
if (!publicVerifier.structuredContent?.public_url || !publicVerifier.structuredContent?.sections?.source_checks?.length) {
  throw new Error("Public verifier page model is incomplete.");
}

const transition = await client.callTool({
  name: "plan_transition_queue",
  arguments: { scenario: "tradeflow_medical_devices", capsule }
});
if (!transition.structuredContent?.queue_id || !transition.structuredContent?.write_operation?.requires_operator_token) {
  throw new Error("Transition queue did not produce an operator-gated sync payload.");
}

const diagnosis = await client.callTool({
  name: "diagnose_capsule",
  arguments: { scenario: "tradeflow_medical_devices", capsule }
});
if (!diagnosis.structuredContent?.healthy) {
  throw new Error("Default capsule diagnosis unexpectedly found blockers.");
}

const verifiers = await client.callTool({
  name: "list_source_verifiers",
  arguments: {}
});
if ((verifiers.structuredContent?.verifier_count || 0) < 10) {
  throw new Error("Source verifier registry is too thin.");
}

const marketplace = await client.callTool({
  name: "list_verifier_marketplace",
  arguments: {}
});
if ((marketplace.structuredContent?.module_count || 0) < verifiers.structuredContent.verifier_count) {
  throw new Error("Verifier marketplace is incomplete.");
}

const draft = await client.callTool({
  name: "build_workflow_draft",
  arguments: {
    title: "Supplier onboarding approval",
    subject_type: "supplier_record",
    states: "Requested, Evidence ready, Approved, Closed",
    evidence_types: "identity, compliance, mandate, settlement",
    sources: "enterprise_vault, counterparty_registry, dual, payment_preview",
    value_usd: 25000
  }
});
if (!draft.structuredContent?.draft_hash || !draft.structuredContent?.capsule?.hashes?.capsule_content_hash) {
  throw new Error("Workflow builder draft is incomplete.");
}

const comparison = await client.callTool({
  name: "compare_capsules",
  arguments: {
    left: capsule,
    right: {
      ...capsule,
      evidence_refs: capsule.evidence_refs.slice(0, 6)
    }
  }
});
if (comparison.structuredContent?.same_content || !comparison.structuredContent?.changed_hashes?.length) {
  throw new Error("Capsule compare did not detect evidence/hash changes.");
}

const handoff = await client.callTool({
  name: "generate_agent_handoff_pack",
  arguments: { scenario: "tradeflow_medical_devices", capsule, endpoint: url }
});
if (!handoff.structuredContent?.mcp_calls?.some((call) => call.tool === "plan_transition_queue")) {
  throw new Error("Agent handoff pack is incomplete.");
}

const scenarioCapsules = [];
for (const scenario of supportedScenarios) {
  const scenarioResult = await client.callTool({
    name: "compose_proof_capsule",
    arguments: { scenario }
  });
  const scenarioCapsule = scenarioResult.structuredContent;
  if (!scenarioCapsule?.capsule_id || !scenarioCapsule?.subject?.subject_id) {
    throw new Error(`Scenario ${scenario} did not return a complete capsule.`);
  }
  scenarioCapsules.push({
    scenario,
    capsuleId: scenarioCapsule.capsule_id,
    subjectId: scenarioCapsule.subject.subject_id
  });
}
if (new Set(scenarioCapsules.map((item) => item.capsuleId)).size !== scenarioCapsules.length) {
  throw new Error("Advertised scenarios returned duplicate capsule IDs.");
}
if (new Set(scenarioCapsules.map((item) => item.subjectId)).size !== scenarioCapsules.length) {
  throw new Error("Advertised scenarios returned duplicate subject IDs.");
}

const redTeam = await client.callTool({
  name: "red_team_capsule",
  arguments: { attack: "live_write_escalation" }
});
if (!redTeam.structuredContent?.blocked || redTeam.structuredContent?.code !== "live_write_blocked") {
  throw new Error("Live-write escalation was not blocked.");
}

await client.close();

console.log(JSON.stringify({
  ok: true,
  url,
  toolCount: toolNames.length,
  resourceCount: resourceUris.length,
  templateCount: templates.resourceTemplates.length,
  promptCount: promptNames.length,
  capsuleId: capsule.capsule_id,
  contentHash: capsule.hashes.capsule_content_hash,
  verifierOk: verified.structuredContent.ok,
  policyResult: evaluation.structuredContent.result,
  workflowId: workflow.structuredContent.workflow_id,
  workflowReplayHash: replay.structuredContent.hash_replay.workflow_replay_hash,
  evidenceVerified: evidence.structuredContent.summary.verified,
  timelineHash: timeline.structuredContent.timeline_hash,
  proofRunId: proofRun.structuredContent.run_id,
  publicVerifierUrl: publicVerifier.structuredContent.public_url,
  transitionQueueId: transition.structuredContent.queue_id,
  sourceVerifierCount: verifiers.structuredContent.verifier_count,
  marketplaceModuleCount: marketplace.structuredContent.module_count,
  workflowDraftHash: draft.structuredContent.draft_hash,
  compareHash: comparison.structuredContent.compare_hash,
  handoffPackId: handoff.structuredContent.pack_id,
  scenarioCoverage: scenarioCapsules,
  liveWriteBlocked: redTeam.structuredContent.blocked
}, null, 2));
