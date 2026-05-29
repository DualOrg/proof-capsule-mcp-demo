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
  "attach_proof",
  "bind_dual_tenant_gateway",
  "build_workflow_draft",
  "compose_proof_capsule",
  "compare_capsules",
  "create_tenant_activation_request",
  "create_tenant_onboarding_plan",
  "create_capsule",
  "diagnose_capsule",
  "evaluate_gate",
  "evaluate_capsule_policy",
  "generate_agent_handoff_pack",
  "get_admin_control_plane",
  "get_extensibility_kit",
  "get_proof_room",
  "get_public_verifier_page",
  "get_saas_readiness",
  "get_tenant_activation_blueprint",
  "get_current_live_capsule",
  "get_capsule_handoff",
  "get_capsule_status",
  "get_proof_timeline",
  "get_live_dual_status",
  "get_workflow_definition",
  "list_scenario_marketplace",
  "list_saas_plans",
  "list_verifier_marketplace",
  "list_source_verifiers",
  "list_workflow_templates",
  "mint_proof_capsule_live",
  "issue_tenant_api_key_preview",
  "build_extension_pack",
  "certify_source_adapter",
  "plan_schema_migration",
  "plan_transition_queue",
  "red_team_capsule",
  "replay_workflow_capsule",
  "run_proof_capsule",
  "publish_public_proof",
  "simulate_workflow",
  "sync_proof_capsule_live",
  "verify_evidence_refs",
  "verify_capsule",
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
  "capsule://proof-room",
  "capsule://agent-mode",
  "capsule://activation/blueprint",
  "capsule://activation/dual-binding",
  "capsule://activation/gateway",
  "capsule://activation/security",
  "capsule://scenario-marketplace",
  "capsule://saas/admin",
  "capsule://saas/onboarding",
  "capsule://saas/plans",
  "capsule://saas/readiness",
  "capsule://extensions/adapter-contract",
  "capsule://extensions/kit",
  "capsule://extensions/migration",
  "capsule://extensions/scorecard",
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
if (!templates.resourceTemplates.some((template) => template.uriTemplate === "capsule://proof-room/{scenario}")) {
  throw new Error("Missing proof room resource template.");
}

const prompts = await client.listPrompts();
const promptNames = prompts.prompts.map((prompt) => prompt.name);
for (const required of ["proof_capsule_review", "mcp_client_handoff", "red_team_capsule_boundary", "design_proof_capsule_workflow", "operate_capsule_transition", "compare_capsule_versions", "publish_proof_capsule_verifier_page", "supercharge_proof_capsule", "launch_proof_capsule_saas_tenant", "extend_proof_capsule_product", "activate_proof_capsule_tenant"]) {
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
  arguments: { scenario: "universal_proof_capsule" }
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
  arguments: { scenario: "universal_proof_capsule" }
});
if (!workflow.structuredContent?.workflow_id || !workflow.structuredContent?.transitions?.length) {
  throw new Error("Workflow definition did not expose a reusable state machine.");
}

const replay = await client.callTool({
  name: "replay_workflow_capsule",
  arguments: { scenario: "universal_proof_capsule", capsule }
});
if (!replay.structuredContent?.ok || !replay.structuredContent?.hash_replay?.workflow_replay_hash) {
  throw new Error("Workflow replay did not verify the capsule.");
}

const evidence = await client.callTool({
  name: "verify_evidence_refs",
  arguments: { scenario: "universal_proof_capsule", capsule }
});
if (!evidence.structuredContent?.ok || evidence.structuredContent?.summary?.verified < capsule.evidence_refs.length) {
  throw new Error("Evidence intake verification did not pass.");
}

const timeline = await client.callTool({
  name: "get_proof_timeline",
  arguments: { scenario: "universal_proof_capsule", capsule }
});
if (!timeline.structuredContent?.timeline_hash || !timeline.structuredContent?.events?.length) {
  throw new Error("Proof timeline did not render lifecycle events.");
}

const proofRun = await client.callTool({
  name: "run_proof_capsule",
  arguments: { scenario: "universal_proof_capsule", capsule, base_url: "http://127.0.0.1:4184", endpoint: url }
});
if (!proofRun.structuredContent?.run_id || !proofRun.structuredContent?.public_verifier?.public_url || proofRun.structuredContent?.proof_score?.score < 90) {
  throw new Error("One-click proof run is incomplete.");
}

const publicVerifier = await client.callTool({
  name: "get_public_verifier_page",
  arguments: {
    scenario: "universal_proof_capsule",
    capsule,
    proof_id: capsule.capsule_id,
    content_hash: capsule.hashes.capsule_content_hash,
    base_url: "http://127.0.0.1:4184",
    endpoint: url
  }
});
if (!publicVerifier.structuredContent?.public_url || !publicVerifier.structuredContent?.sections?.source_checks?.length) {
  throw new Error("Public verifier page model is incomplete.");
}
if (!publicVerifier.structuredContent?.link_integrity?.verified || publicVerifier.structuredContent?.link_integrity?.status !== "link_verified") {
  throw new Error("Pinned public verifier link did not verify.");
}

const tamperedPublicVerifier = await client.callTool({
  name: "get_public_verifier_page",
  arguments: {
    scenario: "universal_proof_capsule",
    capsule,
    proof_id: capsule.capsule_id,
    content_hash: "sha256:0000000000000000000000000000000000000000000000000000000000000000",
    base_url: "http://127.0.0.1:4184",
    endpoint: url
  }
});
if (tamperedPublicVerifier.structuredContent?.ok !== false || tamperedPublicVerifier.structuredContent?.link_integrity?.status !== "link_mismatch") {
  throw new Error("Tampered public verifier link was not rejected.");
}

const transition = await client.callTool({
  name: "plan_transition_queue",
  arguments: { scenario: "universal_proof_capsule", capsule }
});
if (!transition.structuredContent?.queue_id || !transition.structuredContent?.write_operation?.requires_operator_token) {
  throw new Error("Transition queue did not produce an operator-gated sync payload.");
}

const diagnosis = await client.callTool({
  name: "diagnose_capsule",
  arguments: { scenario: "universal_proof_capsule", capsule }
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

const scenarioMarketplace = await client.callTool({
  name: "list_scenario_marketplace",
  arguments: {}
});
if ((scenarioMarketplace.structuredContent?.template_count || 0) < 7 || !scenarioMarketplace.structuredContent?.templates?.some((template) => template.scenario === "universal_proof_capsule")) {
  throw new Error("Scenario marketplace is incomplete.");
}

const saasReadiness = await client.callTool({
  name: "get_saas_readiness",
  arguments: { live_dual_readback: true, operator_gate_configured: true }
});
if (
  !saasReadiness.structuredContent?.sellable_now
  || saasReadiness.structuredContent?.package_readiness_score < 98
  || saasReadiness.structuredContent?.package_readiness_basis?.score_type !== "computed_weighted_package_controls"
  || !saasReadiness.structuredContent?.package_readiness_basis?.checks?.some((check) => check.key === "connector_disclosure" && check.ready)
) {
  throw new Error("SaaS readiness model is incomplete.");
}

const saasPlans = await client.callTool({
  name: "list_saas_plans",
  arguments: { plan_id: "growth_control_plane" }
});
if ((saasPlans.structuredContent?.plan_count || 0) < 3 || !saasPlans.structuredContent?.plans?.some((plan) => plan.plan_id === "growth_control_plane")) {
  throw new Error("SaaS plan catalogue is incomplete.");
}

const tenantPlan = await client.callTool({
  name: "create_tenant_onboarding_plan",
  arguments: {
    tenant_name: "Acme Proof Operations",
    use_case: "multi-source proof rooms for regulated workflow decisions",
    plan_id: "growth_control_plane",
    sources: "dual, enterprise_vault, solana, ipfs, payment_preview",
    endpoint: url
  }
});
if (!tenantPlan.structuredContent?.workspace_id || !tenantPlan.structuredContent?.launch_steps?.length || !tenantPlan.structuredContent?.mcp_handoff?.first_calls?.includes("get_saas_readiness")) {
  throw new Error("Tenant onboarding plan is incomplete.");
}

const adminPlane = await client.callTool({
  name: "get_admin_control_plane",
  arguments: {
    tenant_name: "Acme Proof Operations",
    use_case: "multi-source proof rooms for regulated workflow decisions",
    plan_id: "growth_control_plane",
    sources: "dual, enterprise_vault, solana, ipfs, payment_preview"
  }
});
if (!adminPlane.structuredContent?.admin_plane_id || !adminPlane.structuredContent?.ops_views?.length || !adminPlane.structuredContent?.audit_schema?.capsule_id) {
  throw new Error("Admin control plane is incomplete.");
}

const activationBlueprint = await client.callTool({
  name: "get_tenant_activation_blueprint",
  arguments: {
    tenant_name: "Acme Proof Operations",
    use_case: "multi-source proof rooms for regulated workflow decisions",
    plan_id: "growth_control_plane",
    sources: "dual, enterprise_vault, solana, ipfs, payment_preview"
  }
});
if (
  activationBlueprint.structuredContent?.activation_package_score < 100
  || activationBlueprint.structuredContent?.api_key_issuance?.secret_returned !== false
  || activationBlueprint.structuredContent?.customer_gateway_setup?.ingress?.operator_routes_require_server_token !== true
) {
  throw new Error("Tenant activation blueprint is incomplete.");
}

const activationRequest = await client.callTool({
  name: "create_tenant_activation_request",
  arguments: {
    tenant_name: "Acme Proof Operations",
    use_case: "multi-source proof rooms for regulated workflow decisions",
    plan_id: "growth_control_plane",
    sources: "dual, enterprise_vault, solana, ipfs, payment_preview",
    endpoint: url
  }
});
if (!activationRequest.structuredContent?.activation_request_id || !activationRequest.structuredContent?.activation_steps?.some((step) => step.title === "DUAL binding")) {
  throw new Error("Tenant activation request is incomplete.");
}

const activationApiKey = await client.callTool({
  name: "issue_tenant_api_key_preview",
  arguments: {
    tenant_name: "Acme Proof Operations",
    workspace_id: activationRequest.structuredContent.workspace_id,
    scopes: "capsule:read, capsule:run, proof:publish, gateway:adapter:onboard"
  }
});
if (!activationApiKey.structuredContent?.key_id || activationApiKey.structuredContent?.secret_returned !== false) {
  throw new Error("Tenant API-key preview returned an unsafe credential.");
}

const activationDualBinding = await client.callTool({
  name: "bind_dual_tenant_gateway",
  arguments: {
    tenant_name: "Acme Proof Operations",
    workspace_id: activationRequest.structuredContent.workspace_id
  }
});
if (!activationDualBinding.structuredContent?.dual_binding_id || activationDualBinding.structuredContent?.gateway_policy?.public_writes !== false) {
  throw new Error("DUAL tenant binding model is incomplete.");
}

const extensibilityKit = await client.callTool({
  name: "get_extensibility_kit",
  arguments: {}
});
if (
  extensibilityKit.structuredContent?.extensibility_score < 98
  || extensibilityKit.structuredContent?.score_basis?.score_type !== "computed_weighted_extensibility_controls"
  || !extensibilityKit.structuredContent?.adapter_plugin_contract?.certification_requirements?.length
) {
  throw new Error("Extensibility kit is incomplete.");
}

const extensionPack = await client.callTool({
  name: "build_extension_pack",
  arguments: {
    tenant_name: "Acme Proof Operations",
    extension_name: "Supplier compliance proof room",
    use_case: "supplier onboarding approval with tokenised attestations and DUAL state",
    subject_type: "supplier_record",
    states: "Requested, Evidence ready, Approved, Archived",
    evidence_types: "identity, compliance, mandate, settlement",
    sources: "enterprise_vault, counterparty_registry, dual, payment_preview",
    endpoint: url
  }
});
if (!extensionPack.structuredContent?.extension_pack_id || extensionPack.structuredContent?.requires_code_change !== false || !extensionPack.structuredContent?.marketplace_listing?.acceptance_gates?.length) {
  throw new Error("Extension pack builder is incomplete.");
}

const adapterCertification = await client.callTool({
  name: "certify_source_adapter",
  arguments: {
    source: "enterprise_vault",
    proof_types: "identity, compliance",
    auth_model: "tenant_api_gateway",
    raw_evidence_stored: false,
    signed_attestation_mode: true,
    recheck_before_action: true
  }
});
if (adapterCertification.structuredContent?.certification_score < 98 || adapterCertification.structuredContent?.adapter_contract?.raw_evidence_stored !== false) {
  throw new Error("Adapter certification harness is incomplete.");
}

const migrationPlan = await client.callTool({
  name: "plan_schema_migration",
  arguments: {
    from_version: "proof-capsule-workflow-draft.v0.2",
    to_version: "proof-capsule-extension.v0.1",
    extension_manifest: extensionPack.structuredContent.extension_manifest
  }
});
if (!migrationPlan.structuredContent?.ok || !migrationPlan.structuredContent?.migration_steps?.some((step) => step.action === "readback")) {
  throw new Error("Schema migration planner is incomplete.");
}

const created = await client.callTool({
  name: "create_capsule",
  arguments: { scenario: "universal_proof_capsule", base_url: "http://127.0.0.1:4184", endpoint: url }
});
if (!created.structuredContent?.ok || !created.structuredContent?.proof_room?.room_id) {
  throw new Error("create_capsule did not return a verified proof room.");
}

const attached = await client.callTool({
  name: "attach_proof",
  arguments: {
    scenario: "universal_proof_capsule",
    capsule,
    proof_ref: {
      evidence_id: "EXTRA-ATTESTATION-SMOKE",
      type: "attestation",
      source: "verifier_attestation",
      summary: "Smoke-test verifier attestation.",
      ref: "attestation://smoke/extra"
    }
  }
});
if (!attached.structuredContent?.ok || attached.structuredContent?.capsule?.evidence_refs?.length <= capsule.evidence_refs.length) {
  throw new Error("attach_proof did not attach and verify a new proof ref.");
}

const gate = await client.callTool({
  name: "evaluate_gate",
  arguments: { scenario: "universal_proof_capsule", capsule }
});
if (!gate.structuredContent?.ok || gate.structuredContent?.transition?.status !== "ready_for_operator_sync") {
  throw new Error("evaluate_gate did not produce a ready transition dry-run.");
}

const simulation = await client.callTool({
  name: "simulate_workflow",
  arguments: { scenario: "universal_proof_capsule", capsule }
});
if (!simulation.structuredContent?.ok || !simulation.structuredContent?.simulation_steps?.length) {
  throw new Error("simulate_workflow did not return workflow steps.");
}

const proofRoom = await client.callTool({
  name: "get_proof_room",
  arguments: { scenario: "universal_proof_capsule", capsule, base_url: "http://127.0.0.1:4184", endpoint: url }
});
if (!proofRoom.structuredContent?.proof_room?.source_cards?.length || !proofRoom.structuredContent?.proof_room?.agent_mode?.read_tools?.includes("publish_public_proof")) {
  throw new Error("Proof room did not expose source cards and agent mode.");
}

const published = await client.callTool({
  name: "publish_public_proof",
  arguments: {
    scenario: "universal_proof_capsule",
    capsule,
    proof_id: capsule.capsule_id,
    content_hash: capsule.hashes.capsule_content_hash,
    base_url: "http://127.0.0.1:4184",
    endpoint: url
  }
});
if (!published.structuredContent?.ok || published.structuredContent?.link_integrity?.status !== "link_verified") {
  throw new Error("publish_public_proof did not verify the pinned public proof.");
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
      evidence_refs: capsule.evidence_refs.slice(0, 5)
    }
  }
});
if (comparison.structuredContent?.same_content || !comparison.structuredContent?.changed_hashes?.length) {
  throw new Error("Capsule compare did not detect evidence/hash changes.");
}

const handoff = await client.callTool({
  name: "generate_agent_handoff_pack",
  arguments: { scenario: "universal_proof_capsule", capsule, endpoint: url }
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
  publicVerifierLinkStatus: publicVerifier.structuredContent.link_integrity.status,
  tamperedPublicVerifierStatus: tamperedPublicVerifier.structuredContent.link_integrity.status,
  transitionQueueId: transition.structuredContent.queue_id,
  sourceVerifierCount: verifiers.structuredContent.verifier_count,
  marketplaceModuleCount: marketplace.structuredContent.module_count,
  saasPackageScore: saasReadiness.structuredContent.package_readiness_score,
  saasPackageScoreType: saasReadiness.structuredContent.package_readiness_basis.score_type,
  saasActivationScore: saasReadiness.structuredContent.tenant_activation_score,
  tenantActivationPackageScore: activationBlueprint.structuredContent.activation_package_score,
  tenantActivationScore: activationBlueprint.structuredContent.tenant_activation_score,
  activationRequestId: activationRequest.structuredContent.activation_request_id,
  activationApiKeyId: activationApiKey.structuredContent.key_id,
  activationDualBindingId: activationDualBinding.structuredContent.dual_binding_id,
  extensibilityScore: extensibilityKit.structuredContent.extensibility_score,
  extensibilityScoreType: extensibilityKit.structuredContent.score_basis.score_type,
  extensionPackId: extensionPack.structuredContent.extension_pack_id,
  adapterCertificationScore: adapterCertification.structuredContent.certification_score,
  migrationId: migrationPlan.structuredContent.migration_id,
  saasPlanCount: saasPlans.structuredContent.plan_count,
  tenantWorkspaceId: tenantPlan.structuredContent.workspace_id,
  adminPlaneId: adminPlane.structuredContent.admin_plane_id,
  workflowDraftHash: draft.structuredContent.draft_hash,
  compareHash: comparison.structuredContent.compare_hash,
  handoffPackId: handoff.structuredContent.pack_id,
  scenarioCoverage: scenarioCapsules,
  liveWriteBlocked: redTeam.structuredContent.blocked
}, null, 2));
