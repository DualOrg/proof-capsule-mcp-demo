import { ensureTemplateAndObject } from "../src/dual-live.mjs";
import { envSummary, loadEnv } from "./_env.mjs";

loadEnv();
if (!process.env.DUAL_WRITE_MODE) process.env.DUAL_WRITE_MODE = "event_bus";

const result = await ensureTemplateAndObject({
  scenario: process.argv[2] || "tradeflow_medical_devices"
});

console.log(JSON.stringify({
  ok: true,
  env: envSummary(),
  template_id: result.template_id,
  object_id: result.object_id,
  org_id: result.org_id,
  readback_verified: result.readback_verified,
  verification: result.verification,
  next_env: {
    DUAL_PROOF_CAPSULE_TEMPLATE_ID: result.template_id,
    DUAL_PROOF_CAPSULE_OBJECT_ID: result.object_id,
    DUAL_WRITE_MODE: "event_bus"
  }
}, null, 2));
