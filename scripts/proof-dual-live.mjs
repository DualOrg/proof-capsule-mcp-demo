import { getCurrentCapsuleLive, getDualStatusLive } from "../src/dual-live.mjs";
import { envSummary, loadEnv } from "./_env.mjs";

loadEnv();

const status = await getDualStatusLive();
const current = await getCurrentCapsuleLive();
const ok = Boolean(status.readbackReady && current.verification?.ok);

console.log(JSON.stringify({
  ok,
  env: envSummary(),
  mode: status.mode,
  source: status.source,
  liveDualWrites: status.liveDualWrites,
  publicWrites: status.publicWrites,
  object: status.object,
  verification: current.verification
}, null, 2));

if (!ok) process.exit(1);
