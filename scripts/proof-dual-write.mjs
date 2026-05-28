import { syncProofCapsule } from "../src/dual-live.mjs";
import { envSummary, loadEnv } from "./_env.mjs";

loadEnv();
if (!process.env.DUAL_WRITE_MODE) process.env.DUAL_WRITE_MODE = "event_bus";

const result = await syncProofCapsule({
  scenario: process.argv[2] || "tradeflow_medical_devices",
  audit: {
    source: "proof-dual-write-script",
    purpose: "controlled live DUAL write proof"
  }
});

console.log(JSON.stringify({
  ok: result.ok,
  env: envSummary(),
  action: result.action,
  payloadStyle: result.payloadStyle,
  publicWrites: result.publicWrites,
  liveDualWrites: result.liveDualWrites,
  object: result.object,
  verification: result.verification
}, null, 2));
