import {
  SCENARIOS,
  composeProofCapsule,
  evaluateCapsulePolicy,
  verifyProofCapsule
} from "../src/capsule-core.mjs";

const requestedScenario = process.argv[2];
const scenarios = requestedScenario ? [requestedScenario] : SCENARIOS;

function runScenario(scenario) {
  const capsule = composeProofCapsule({ scenario, generated_at: "2026-05-29T00:00:00.000Z" });
  const verification = verifyProofCapsule({ capsule });
  const policy = evaluateCapsulePolicy({ capsule });
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

if (uniqueCapsuleIds.size !== results.length || uniqueSubjectIds.size !== results.length) {
  throw new Error("Advertised scenarios are not producing distinct capsules.");
}

console.log(JSON.stringify({
  ok: true,
  scenarioCount: results.length,
  advertisedScenariosCovered: results.length === scenarios.length,
  primary: results[0],
  scenarios: results.map((result) => ({
    scenario: result.scenario,
    capsuleId: result.capsuleId,
    subjectId: result.subjectId,
    capsuleType: result.capsuleType,
    policyResult: result.policyResult,
    contentHash: result.contentHash,
    tamperRejected: result.tamperRejected,
    missingEvidenceBlocked: result.missingEvidenceBlocked
  }))
}, null, 2));
