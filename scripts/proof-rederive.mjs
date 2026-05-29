import {
  SCENARIOS,
  buildProofTimeline,
  buildWorkflowDraft,
  compareCapsules,
  composeProofCapsule,
  diagnoseCapsule,
  evaluateCapsulePolicy,
  generateAgentHandoffPack,
  getWorkflowDefinition,
  listVerifierMarketplace,
  listSourceVerifiers,
  planTransitionQueue,
  replayWorkflowCapsule,
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

if (uniqueCapsuleIds.size !== results.length || uniqueSubjectIds.size !== results.length) {
  throw new Error("Advertised scenarios are not producing distinct capsules.");
}

if (verifierRegistry.verifier_count < 10) {
  throw new Error("Source verifier registry is too thin for workflow-proof reuse.");
}

if (marketplace.module_count < verifierRegistry.verifier_count || !marketplace.modules.some((module) => module.source === "dual")) {
  throw new Error("Verifier marketplace is incomplete.");
}

if (!draft.ok || !draftEvidence.ok || !draft.workflow_definition.transitions.length) {
  throw new Error("Workflow builder draft failed.");
}

if (comparison.same_content || comparison.changed_hashes.length === 0) {
  throw new Error("Capsule compare did not detect a material change.");
}

console.log(JSON.stringify({
  ok: true,
  scenarioCount: results.length,
  advertisedScenariosCovered: results.length === scenarios.length,
  sourceVerifierCount: verifierRegistry.verifier_count,
  marketplaceModuleCount: marketplace.module_count,
  workflowDraftHash: draft.draft_hash,
  compareHash: comparison.compare_hash,
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
    transitionQueueId: result.transitionQueueId,
    contentHash: result.contentHash,
    tamperRejected: result.tamperRejected,
    missingEvidenceBlocked: result.missingEvidenceBlocked
  }))
}, null, 2));
