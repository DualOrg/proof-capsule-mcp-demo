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
const verification = await post("/api/capsule/verify", { capsule: demo.capsule });
const redTeam = await post("/api/capsule/red-team", { attack: "live_write_escalation" });
const mcp = await get("/mcp");

const ok = Boolean(
  status.publicWrites === false
  && dual.publicWrites === false
  && verification.accepted
  && redTeam.blocked
  && mcp.tools?.includes("sync_proof_capsule_live")
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
  redTeamCode: redTeam.code
}, null, 2));

if (!ok) process.exit(1);
