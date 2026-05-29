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
const demo = await get("/api/capsule/demo?scenario=universal_proof_capsule");
const workflow = await get("/api/workflow/definition?scenario=universal_proof_capsule");
const verifiers = await get("/api/source/verifiers");
const marketplace = await get("/api/source/marketplace");
const scenarioMarketplace = await get("/api/scenarios/marketplace");
const saasReadiness = await get("/api/saas/readiness");
const saasPlans = await get("/api/saas/plans");
const extensibilityKit = await get("/api/extensions/kit");
const activationBlueprint = await post("/api/activation/blueprint", {
  tenant_name: "Acme Proof Operations",
  use_case: "multi-source proof rooms for regulated workflow decisions",
  plan_id: "growth_control_plane",
  sources: "dual, enterprise_vault, solana, ipfs, payment_preview",
  gateway_domain: "gateway.acme-proof.example"
});
const tenantOnboarding = await post("/api/saas/onboarding", {
  tenant_name: "Acme Proof Operations",
  use_case: "multi-source proof rooms for regulated workflow decisions",
  plan_id: "growth_control_plane",
  sources: "dual, enterprise_vault, solana, ipfs, payment_preview"
});
const adminPlane = await post("/api/saas/admin", {
  tenant_name: "Acme Proof Operations",
  plan_id: "growth_control_plane",
  sources: "dual, enterprise_vault, solana, ipfs, payment_preview"
});
const activationRequest = await post("/api/activation/request", {
  tenant_name: "Acme Proof Operations",
  use_case: "multi-source proof rooms for regulated workflow decisions",
  plan_id: "growth_control_plane",
  sources: "dual, enterprise_vault, solana, ipfs, payment_preview",
  gateway_domain: "gateway.acme-proof.example",
  endpoint: `${baseUrl}/mcp`
});
const activationApiKey = await post("/api/activation/api-key-preview", {
  tenant_name: "Acme Proof Operations",
  workspace_id: tenantOnboarding.workspace_id,
  scopes: "capsule:read, capsule:run, proof:publish, gateway:adapter:onboard"
});
const activationDualBinding = await post("/api/activation/dual-bind", {
  tenant_name: "Acme Proof Operations",
  workspace_id: tenantOnboarding.workspace_id
});
const extensionPack = await post("/api/extensions/build", {
  tenant_name: "Acme Proof Operations",
  extension_name: "Supplier compliance proof room",
  use_case: "supplier onboarding approval with tokenised attestations and DUAL state",
  subject_type: "supplier_record",
  states: "Requested, Evidence ready, Approved, Archived",
  evidence_types: "identity, compliance, mandate, settlement",
  sources: "enterprise_vault, counterparty_registry, dual, payment_preview",
  endpoint: `${baseUrl}/mcp`
});
const adapterCertification = await post("/api/extensions/certify", {
  source: "enterprise_vault",
  proof_types: "identity, compliance",
  auth_model: "tenant_api_gateway",
  raw_evidence_stored: false,
  signed_attestation_mode: true,
  recheck_before_action: true
});
const migrationPlan = await post("/api/extensions/migration", {
  from_version: "proof-capsule-workflow-draft.v0.2",
  to_version: "proof-capsule-extension.v0.1",
  extension_manifest: extensionPack.extension_manifest
});
const verification = await post("/api/capsule/verify", { capsule: demo.capsule });
const replay = await post("/api/workflow/replay", { scenario: "universal_proof_capsule", capsule: demo.capsule });
const evidence = await post("/api/evidence/verify", { scenario: "universal_proof_capsule", capsule: demo.capsule });
const transition = await post("/api/transition/plan", { scenario: "universal_proof_capsule", capsule: demo.capsule });
const timeline = await post("/api/capsule/timeline", { scenario: "universal_proof_capsule", capsule: demo.capsule });
const proofRun = await post("/api/proof/run", { scenario: "universal_proof_capsule", capsule: demo.capsule });
const publicVerifier = await get("/api/proof/public?scenario=universal_proof_capsule");
const proofRoom = await get("/api/proof/room?scenario=universal_proof_capsule");
const pinnedPublicVerifier = await get(`/api/proof/public?scenario=universal_proof_capsule&proof_id=${encodeURIComponent(demo.capsule.capsule_id)}&content_hash=${encodeURIComponent(demo.capsule.hashes.capsule_content_hash)}`);
const tamperedPublicVerifier = await get(`/api/proof/public?scenario=universal_proof_capsule&proof_id=${encodeURIComponent(demo.capsule.capsule_id)}&content_hash=${encodeURIComponent("sha256:0000000000000000000000000000000000000000000000000000000000000000")}`);
const diagnosis = await post("/api/capsule/diagnose", { scenario: "universal_proof_capsule", capsule: demo.capsule });
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
const handoff = await post("/api/agent/handoff", { scenario: "universal_proof_capsule", capsule: demo.capsule, endpoint: `${baseUrl}/mcp` });
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
  && proofRoom.proof_room?.source_cards?.length > 0
  && proofRoom.proof_room?.agent_mode?.read_tools?.includes("publish_public_proof")
  && pinnedPublicVerifier.link_integrity?.verified === true
  && pinnedPublicVerifier.link_integrity?.status === "link_verified"
  && tamperedPublicVerifier.ok === false
  && tamperedPublicVerifier.link_integrity?.status === "link_mismatch"
  && diagnosis.healthy
  && verifiers.verifier_count >= 10
  && marketplace.module_count >= verifiers.verifier_count
  && scenarioMarketplace.template_count >= 7
  && saasReadiness.sellable_now
  && saasReadiness.package_readiness_score >= 100
  && saasReadiness.package_readiness_basis?.score_type === "computed_weighted_package_controls"
  && saasReadiness.package_readiness_basis?.checks?.some((check) => check.key === "connector_disclosure" && check.ready)
  && saasReadiness.package_readiness_basis?.checks?.some((check) => check.key === "self_service_tenant_activation" && check.ready)
  && saasReadiness.extensibility?.score >= 98
  && saasReadiness.tenant_activation_gateway?.activation_package_score >= 100
  && activationBlueprint.activation_package_score >= 100
  && activationBlueprint.api_key_issuance?.secret_returned === false
  && activationBlueprint.customer_gateway_setup?.ingress?.operator_routes_require_server_token === true
  && activationRequest.activation_request_id
  && activationRequest.activation_steps?.some((step) => step.title === "DUAL binding")
  && activationApiKey.key_id
  && activationApiKey.secret_returned === false
  && activationDualBinding.dual_binding_id
  && activationDualBinding.gateway_policy?.public_writes === false
  && extensibilityKit.extensibility_score >= 98
  && extensibilityKit.score_basis?.score_type === "computed_weighted_extensibility_controls"
  && extensionPack.extension_pack_id
  && extensionPack.requires_code_change === false
  && extensionPack.marketplace_listing?.acceptance_gates?.length > 0
  && adapterCertification.certification_score >= 98
  && adapterCertification.adapter_contract?.raw_evidence_stored === false
  && migrationPlan.ok
  && migrationPlan.migration_steps?.some((step) => step.action === "readback")
  && saasPlans.plan_count >= 3
  && tenantOnboarding.workspace_id
  && tenantOnboarding.launch_steps?.length >= 5
  && adminPlane.admin_plane_id
  && adminPlane.ops_views?.length >= 4
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
  && mcp.tools?.includes("get_proof_room")
  && mcp.tools?.includes("create_capsule")
  && mcp.tools?.includes("attach_proof")
  && mcp.tools?.includes("evaluate_gate")
  && mcp.tools?.includes("simulate_workflow")
  && mcp.tools?.includes("publish_public_proof")
  && mcp.tools?.includes("verify_capsule")
  && mcp.tools?.includes("get_saas_readiness")
  && mcp.tools?.includes("list_saas_plans")
  && mcp.tools?.includes("create_tenant_onboarding_plan")
  && mcp.tools?.includes("get_admin_control_plane")
  && mcp.tools?.includes("get_extensibility_kit")
  && mcp.tools?.includes("build_extension_pack")
  && mcp.tools?.includes("certify_source_adapter")
  && mcp.tools?.includes("plan_schema_migration")
  && mcp.tools?.includes("get_tenant_activation_blueprint")
  && mcp.tools?.includes("create_tenant_activation_request")
  && mcp.tools?.includes("issue_tenant_api_key_preview")
  && mcp.tools?.includes("bind_dual_tenant_gateway")
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
  proofRoomId: proofRoom.proof_room?.room_id,
  publicVerifierLinkStatus: pinnedPublicVerifier.link_integrity?.status,
  tamperedPublicVerifierStatus: tamperedPublicVerifier.link_integrity?.status,
  sourceVerifierCount: verifiers.verifier_count,
  marketplaceModuleCount: marketplace.module_count,
  scenarioTemplateCount: scenarioMarketplace.template_count,
  saasPackageScore: saasReadiness.package_readiness_score,
  saasPackageScoreType: saasReadiness.package_readiness_basis.score_type,
  saasActivationScore: saasReadiness.tenant_activation_score,
  tenantActivationPackageScore: activationBlueprint.activation_package_score,
  tenantActivationScore: activationBlueprint.tenant_activation_score,
  activationRequestId: activationRequest.activation_request_id,
  activationApiKeyId: activationApiKey.key_id,
  activationDualBindingId: activationDualBinding.dual_binding_id,
  extensibilityScore: extensibilityKit.extensibility_score,
  extensibilityScoreType: extensibilityKit.score_basis.score_type,
  extensionPackId: extensionPack.extension_pack_id,
  adapterCertificationScore: adapterCertification.certification_score,
  migrationId: migrationPlan.migration_id,
  saasPlanCount: saasPlans.plan_count,
  tenantWorkspaceId: tenantOnboarding.workspace_id,
  adminPlaneId: adminPlane.admin_plane_id,
  workflowDraftHash: draft.draft_hash,
  compareHash: comparison.compare_hash,
  handoffPackId: handoff.pack_id,
  redTeamCode: redTeam.code
}, null, 2));

if (!ok) process.exit(1);
