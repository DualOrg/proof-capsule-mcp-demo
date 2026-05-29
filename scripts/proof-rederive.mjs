import {
  SCENARIOS,
  buildProofTimeline,
  buildProofRoom,
  buildPublicVerifierPage,
  buildExtensionPack,
  buildWorkflowDraft,
  bindDualTenantGateway,
  certifySourceAdapter,
  compareCapsules,
  composeProofCapsule,
  createTenantActivationRequest,
  createTenantOnboardingPlan,
  diagnoseCapsule,
  evaluateCapsulePolicy,
  generateAgentHandoffPack,
  getAdminControlPlane,
  getExtensibilityKit,
  getSaasReadiness,
  getTenantActivationBlueprint,
  getWorkflowDefinition,
  issueTenantApiKeyPreview,
  listScenarioMarketplace,
  listSaasPlans,
  listVerifierMarketplace,
  listSourceVerifiers,
  planSchemaMigration,
  planTransitionQueue,
  replayWorkflowCapsule,
  runProofCapsule,
  verifyEvidenceRefs,
  verifyProofCapsule
} from "../src/capsule-core.mjs";

const requestedScenario = process.argv[2];
const scenarios = requestedScenario ? [requestedScenario] : SCENARIOS;

function runScenario(scenario) {
  const capsule = composeProofCapsule({ scenario, generated_at: "2026-05-29T00:00:00.000Z" });
  const verification = verifyProofCapsule({ capsule });
  const policy = evaluateCapsulePolicy({ capsule });
  const workflow = getWorkflowDefinition({ scenario });
  const replay = replayWorkflowCapsule({ scenario, capsule });
  const evidence = verifyEvidenceRefs({ scenario, capsule });
  const timeline = buildProofTimeline({ scenario, capsule });
  const transitionPlan = planTransitionQueue({ scenario, capsule });
  const diagnosis = diagnoseCapsule({ scenario, capsule });
  const handoff = generateAgentHandoffPack({ scenario, capsule, endpoint: "http://127.0.0.1:4184/mcp" });
  const proofRun = runProofCapsule({ scenario, capsule, base_url: "http://127.0.0.1:4184", endpoint: "http://127.0.0.1:4184/mcp" });
  const publicVerifier = buildPublicVerifierPage({ scenario, capsule, base_url: "http://127.0.0.1:4184", endpoint: "http://127.0.0.1:4184/mcp" });
  const proofRoom = buildProofRoom({ scenario, capsule, base_url: "http://127.0.0.1:4184", endpoint: "http://127.0.0.1:4184/mcp" });
  const pinnedPublicVerifier = buildPublicVerifierPage({
    scenario,
    capsule,
    proof_id: capsule.capsule_id,
    content_hash: capsule.hashes.capsule_content_hash,
    base_url: "http://127.0.0.1:4184",
    endpoint: "http://127.0.0.1:4184/mcp"
  });
  const tamperedPublicVerifier = buildPublicVerifierPage({
    scenario,
    capsule,
    proof_id: capsule.capsule_id,
    content_hash: "sha256:0000000000000000000000000000000000000000000000000000000000000000",
    base_url: "http://127.0.0.1:4184",
    endpoint: "http://127.0.0.1:4184/mcp"
  });
  const tamperedCapsule = structuredClone(capsule);
  tamperedCapsule.evidence_refs[0] = {
    ...tamperedCapsule.evidence_refs[0],
    hash: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
  };
  const tamperVerification = verifyProofCapsule({ capsule: tamperedCapsule });
  const missingEvidenceCapsule = composeProofCapsule({
    scenario,
    generated_at: "2026-05-29T00:00:00.000Z",
    evidence_refs: capsule.evidence_refs.slice(0, 2)
  });
  const missingEvidencePolicy = evaluateCapsulePolicy({ capsule: missingEvidenceCapsule });

  if (!verification.ok) {
    throw new Error(`Proof Capsule verification failed for ${scenario}.`);
  }

  if (policy.result === "Blocked") {
    throw new Error(`${scenario} unexpectedly blocked: ${policy.code}`);
  }

  if (tamperVerification.ok) {
    throw new Error(`${scenario} tampered capsule unexpectedly verified.`);
  }

  if (missingEvidencePolicy.result !== "Blocked" || missingEvidencePolicy.code !== "evidence_missing") {
    throw new Error(`${scenario} missing evidence capsule was not blocked.`);
  }

  if (!workflow.ok || !workflow.workflow_id || !workflow.transitions?.length) {
    throw new Error(`${scenario} workflow definition is incomplete.`);
  }

  const workflowStates = new Set(workflow.states || []);
  const transitionWithUnknownState = (workflow.transitions || []).find((transition) => (
    !workflowStates.has(transition.from_state) || !workflowStates.has(transition.to_state)
  ));
  if (transitionWithUnknownState) {
    throw new Error(`${scenario} workflow transition references an undeclared state: ${transitionWithUnknownState.action}.`);
  }

  if (!replay.ok || !replay.transition_allowed || replay.replay_steps.some((step) => !step.pass)) {
    throw new Error(`${scenario} workflow replay failed.`);
  }

  if (!evidence.ok || evidence.summary.verified < capsule.evidence_refs.length) {
    throw new Error(`${scenario} evidence intake verification failed.`);
  }

  if (!timeline.ok || timeline.events.length !== workflow.states.length || !timeline.timeline_hash) {
    throw new Error(`${scenario} proof timeline failed.`);
  }

  if (!transitionPlan.ok || !transitionPlan.queue_id || !transitionPlan.write_operation?.requires_operator_token) {
    throw new Error(`${scenario} transition queue failed.`);
  }

  if (!diagnosis.ok || diagnosis.failures.length) {
    throw new Error(`${scenario} diagnosis unexpectedly found blockers.`);
  }

  if (!handoff.ok || !handoff.mcp_calls?.some((call) => call.tool === "plan_transition_queue")) {
    throw new Error(`${scenario} agent handoff pack is incomplete.`);
  }

  if (!proofRun.ok || !proofRun.public_verifier?.public_url || proofRun.proof_score.score < 90) {
    throw new Error(`${scenario} proof run is incomplete.`);
  }

  if (!publicVerifier.ok || !publicVerifier.sections?.source_checks?.length || !publicVerifier.public_url.includes("/proof/")) {
    throw new Error(`${scenario} public verifier page is incomplete.`);
  }

  if (!proofRoom.ok || !proofRoom.proof_room?.source_cards?.length || !proofRoom.proof_room?.agent_mode?.read_tools?.includes("publish_public_proof")) {
    throw new Error(`${scenario} proof room is incomplete.`);
  }

  if (!pinnedPublicVerifier.ok || !pinnedPublicVerifier.link_integrity?.verified || pinnedPublicVerifier.link_integrity.status !== "link_verified") {
    throw new Error(`${scenario} pinned public verifier link did not verify.`);
  }

  if (tamperedPublicVerifier.ok || tamperedPublicVerifier.link_integrity?.status !== "link_mismatch") {
    throw new Error(`${scenario} tampered public verifier link was not rejected.`);
  }

  return {
    scenario,
    capsuleId: capsule.capsule_id,
    capsuleType: capsule.capsule_type,
    subjectId: capsule.subject.subject_id,
    decision: capsule.decision.result,
    policyResult: policy.result,
    contentHash: capsule.hashes.capsule_content_hash,
    envelopeHash: capsule.hashes.capsule_envelope_hash,
    verificationLevel: verification.verification_level,
    workflowId: workflow.workflow_id,
    workflowReplayHash: replay.hash_replay.workflow_replay_hash,
    timelineHash: timeline.timeline_hash,
    proofRunId: proofRun.run_id,
    publicProofId: publicVerifier.public_proof_id,
    proofRoomId: proofRoom.proof_room.room_id,
    publicLinkVerified: pinnedPublicVerifier.link_integrity.verified,
    tamperedPublicLinkRejected: tamperedPublicVerifier.link_integrity.status === "link_mismatch",
    proofScore: proofRun.proof_score.score,
    transitionQueueId: transitionPlan.queue_id,
    tamperRejected: !tamperVerification.ok,
    missingEvidenceBlocked: missingEvidencePolicy.result === "Blocked",
    verifiedHashes: Object.fromEntries(Object.entries(verification.hashes.verification).map(([name, item]) => [name, item.verifies])),
    caveats: verification.caveats,
    dualAnchor: capsule.dual_anchor
  };
}

const results = scenarios.map(runScenario);
const uniqueCapsuleIds = new Set(results.map((result) => result.capsuleId));
const uniqueSubjectIds = new Set(results.map((result) => result.subjectId));
const verifierRegistry = listSourceVerifiers();
const marketplace = listVerifierMarketplace();
const scenarioMarketplace = listScenarioMarketplace();
const saasPlans = listSaasPlans();
const saasReadiness = getSaasReadiness({ live_dual_readback: true, operator_gate_configured: true });
const tenantOnboarding = createTenantOnboardingPlan({
  tenant_name: "Acme Proof Operations",
  use_case: "multi-source proof rooms for regulated workflow decisions",
  plan_id: "growth_control_plane",
  sources: "dual, enterprise_vault, solana, ipfs, payment_preview"
});
const adminPlane = getAdminControlPlane({
  tenant_name: "Acme Proof Operations",
  plan_id: "growth_control_plane",
  sources: "dual, enterprise_vault, solana, ipfs, payment_preview",
  live_dual_readback: true,
  operator_gate_configured: true
});
const activationBlueprint = getTenantActivationBlueprint({
  tenant_name: "Acme Proof Operations",
  use_case: "multi-source proof rooms for regulated workflow decisions",
  plan_id: "growth_control_plane",
  sources: "dual, enterprise_vault, solana, ipfs, payment_preview",
  live_dual_readback: true,
  operator_gate_configured: true
});
const activationRequest = createTenantActivationRequest({
  tenant_name: "Acme Proof Operations",
  use_case: "multi-source proof rooms for regulated workflow decisions",
  plan_id: "growth_control_plane",
  sources: "dual, enterprise_vault, solana, ipfs, payment_preview",
  live_dual_readback: true,
  operator_gate_configured: true
});
const activationApiKey = issueTenantApiKeyPreview({
  tenant_name: "Acme Proof Operations",
  workspace_id: tenantOnboarding.workspace_id,
  scopes: "capsule:read, capsule:run, proof:publish, gateway:adapter:onboard"
});
const activationDualBinding = bindDualTenantGateway({
  tenant_name: "Acme Proof Operations",
  workspace_id: tenantOnboarding.workspace_id,
  live_dual_readback: true,
  operator_gate_configured: true,
  dual_object_id: "proof-capsule-object-smoke",
  dual_template_id: "proof-capsule-template-smoke"
});
const extensibilityKit = getExtensibilityKit();
const extensionPack = buildExtensionPack({
  tenant_name: "Acme Proof Operations",
  extension_name: "Supplier compliance proof room",
  use_case: "supplier onboarding approval with tokenised attestations and DUAL state",
  subject_type: "supplier_record",
  states: "Requested, Evidence ready, Approved, Archived",
  evidence_types: "identity, compliance, mandate, settlement",
  sources: "enterprise_vault, counterparty_registry, dual, payment_preview"
});
const adapterCertification = certifySourceAdapter({
  source: "enterprise_vault",
  proof_types: "identity, compliance",
  auth_model: "tenant_api_gateway",
  raw_evidence_stored: false,
  recheck_before_action: true,
  signed_attestation_mode: true
});
const migrationPlan = planSchemaMigration({
  from_version: "proof-capsule-workflow-draft.v0.2",
  to_version: "proof-capsule-extension.v0.1",
  extension_manifest: extensionPack.extension_manifest
});
const draft = buildWorkflowDraft({
  title: "Supplier onboarding approval",
  subject_type: "supplier_record",
  states: "Requested, Evidence ready, Approved, Closed",
  evidence_types: "identity, compliance, mandate, settlement",
  sources: "enterprise_vault, counterparty_registry, dual, payment_preview",
  value_usd: 25000
});
const draftEvidence = verifyEvidenceRefs({ capsule: draft.capsule, required_evidence: draft.workflow_definition.transitions[0].required_evidence });
const comparison = compareCapsules({
  left: composeProofCapsule({ scenario: "tradeflow_medical_devices", generated_at: "2026-05-29T00:00:00.000Z" }),
  right: composeProofCapsule({ scenario: "tradeflow_medical_devices", generated_at: "2026-05-29T00:00:00.000Z", evidence_refs: composeProofCapsule({ scenario: "tradeflow_medical_devices", generated_at: "2026-05-29T00:00:00.000Z" }).evidence_refs.slice(0, 6) })
});
const publicVerifier = buildPublicVerifierPage({
  scenario: "tradeflow_medical_devices",
  base_url: "http://127.0.0.1:4184",
  endpoint: "http://127.0.0.1:4184/mcp"
});

if (uniqueCapsuleIds.size !== results.length || uniqueSubjectIds.size !== results.length) {
  throw new Error("Advertised scenarios are not producing distinct capsules.");
}

if (verifierRegistry.verifier_count < 10) {
  throw new Error("Source verifier registry is too thin for workflow-proof reuse.");
}

if (marketplace.module_count < verifierRegistry.verifier_count || !marketplace.modules.some((module) => module.source === "dual")) {
  throw new Error("Verifier marketplace is incomplete.");
}

if (scenarioMarketplace.template_count < 7 || !scenarioMarketplace.templates.some((template) => template.scenario === "universal_proof_capsule")) {
  throw new Error("Scenario marketplace is incomplete.");
}

if (saasPlans.plan_count < 3 || !saasPlans.plans.some((plan) => plan.plan_id === "growth_control_plane")) {
  throw new Error("SaaS plan catalogue is incomplete.");
}

if (
  !saasReadiness.sellable_now
  || saasReadiness.package_readiness_score < 100
  || saasReadiness.package_readiness_basis?.score_type !== "computed_weighted_package_controls"
  || !saasReadiness.package_readiness_basis?.checks?.some((check) => check.key === "pilot_sales_pack" && check.ready)
  || !saasReadiness.package_readiness_basis?.checks?.some((check) => check.key === "self_service_tenant_activation" && check.ready)
  || saasReadiness.tenant_activation_gateway?.activation_package_score < 100
  || !saasReadiness.readiness_checks?.some((check) => check.key === "tenant_onboarding" && check.ready)
) {
  throw new Error("SaaS readiness model is incomplete.");
}

if (!tenantOnboarding.workspace_id || !tenantOnboarding.launch_steps?.length || !tenantOnboarding.mcp_handoff?.first_calls?.includes("get_saas_readiness")) {
  throw new Error("Tenant onboarding plan is incomplete.");
}

if (!adminPlane.admin_plane_id || !adminPlane.ops_views?.length || !adminPlane.audit_schema?.capsule_id) {
  throw new Error("Admin control plane is incomplete.");
}

if (
  activationBlueprint.activation_package_score < 100
  || activationBlueprint.activation_package_basis?.score_type !== "computed_weighted_activation_package_controls"
  || activationBlueprint.api_key_issuance?.secret_returned !== false
  || activationBlueprint.dual_integration?.gateway_policy?.operator_token_required !== true
  || activationBlueprint.customer_gateway_setup?.ingress?.operator_routes_require_server_token !== true
) {
  throw new Error("Tenant activation blueprint is incomplete.");
}

if (
  !activationRequest.activation_request_id
  || !activationRequest.activation_steps?.some((step) => step.title === "DUAL binding")
  || !activationRequest.mcp_handoff?.first_calls?.includes("get_tenant_activation_blueprint")
) {
  throw new Error("Tenant activation request is incomplete.");
}

if (!activationApiKey.key_id || activationApiKey.secret_returned !== false || !activationApiKey.scopes?.includes("capsule:run")) {
  throw new Error("Tenant API-key preview returned an unsafe or incomplete credential.");
}

if (
  activationDualBinding.binding_status !== "dual_gateway_bound"
  || activationDualBinding.gateway_policy?.write_execution !== "not_enabled_until_operator_gate"
  || activationDualBinding.gateway_policy?.public_writes !== false
) {
  throw new Error("DUAL tenant binding model is incomplete.");
}

if (
  extensibilityKit.extensibility_score < 98
  || extensibilityKit.score_basis?.score_type !== "computed_weighted_extensibility_controls"
  || !extensibilityKit.extension_surfaces?.some((surface) => surface.surface === "MCP")
  || !extensibilityKit.adapter_plugin_contract?.certification_requirements?.length
) {
  throw new Error("Extensibility kit is incomplete.");
}

if (
  !extensionPack.extension_pack_id
  || extensionPack.requires_code_change !== false
  || !extensionPack.marketplace_listing?.acceptance_gates?.length
  || !extensionPack.mcp_handoff?.first_calls?.includes("build_extension_pack")
) {
  throw new Error("Extension pack builder is incomplete.");
}

if (adapterCertification.certification_score < 98 || adapterCertification.adapter_contract?.raw_evidence_stored !== false) {
  throw new Error("Adapter certification harness is incomplete.");
}

if (!migrationPlan.ok || !migrationPlan.migration_steps?.some((step) => step.action === "readback") || !migrationPlan.rollback_plan?.length) {
  throw new Error("Schema migration planner is incomplete.");
}

if (!draft.ok || !draftEvidence.ok || !draft.workflow_definition.transitions.length) {
  throw new Error("Workflow builder draft failed.");
}

if (comparison.same_content || comparison.changed_hashes.length === 0) {
  throw new Error("Capsule compare did not detect a material change.");
}

if (!publicVerifier.public_url || !publicVerifier.sections?.policy_decision?.decision_content_hash) {
  throw new Error("Public verifier page model is incomplete.");
}

if (publicVerifier.link_integrity?.status !== "link_unpinned" || !publicVerifier.public_url.includes("content_hash=")) {
  throw new Error("Public verifier model did not expose default unpinned status and pinned share URL.");
}

console.log(JSON.stringify({
  ok: true,
  scenarioCount: results.length,
  advertisedScenariosCovered: results.length === scenarios.length,
  sourceVerifierCount: verifierRegistry.verifier_count,
  marketplaceModuleCount: marketplace.module_count,
  scenarioTemplateCount: scenarioMarketplace.template_count,
  saasPlanCount: saasPlans.plan_count,
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
  tenantWorkspaceId: tenantOnboarding.workspace_id,
  adminPlaneId: adminPlane.admin_plane_id,
  workflowDraftHash: draft.draft_hash,
  compareHash: comparison.compare_hash,
  publicVerifierUrl: publicVerifier.public_url,
  primary: results[0],
  scenarios: results.map((result) => ({
    scenario: result.scenario,
    capsuleId: result.capsuleId,
    subjectId: result.subjectId,
    capsuleType: result.capsuleType,
    policyResult: result.policyResult,
    workflowId: result.workflowId,
    workflowReplayHash: result.workflowReplayHash,
    timelineHash: result.timelineHash,
    proofRunId: result.proofRunId,
    publicProofId: result.publicProofId,
    proofRoomId: result.proofRoomId,
    publicLinkVerified: result.publicLinkVerified,
    tamperedPublicLinkRejected: result.tamperedPublicLinkRejected,
    proofScore: result.proofScore,
    transitionQueueId: result.transitionQueueId,
    contentHash: result.contentHash,
    tamperRejected: result.tamperRejected,
    missingEvidenceBlocked: result.missingEvidenceBlocked
  }))
}, null, 2));
