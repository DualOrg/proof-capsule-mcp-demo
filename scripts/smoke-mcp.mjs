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
  "compose_proof_capsule",
  "evaluate_capsule_policy",
  "get_current_live_capsule",
  "get_capsule_handoff",
  "get_capsule_status",
  "get_live_dual_status",
  "mint_proof_capsule_live",
  "red_team_capsule",
  "sync_proof_capsule_live",
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
  "capsule://scorecard"
]) {
  if (!resourceUris.includes(required)) throw new Error(`Missing resource: ${required}`);
}

const templates = await client.listResourceTemplates();
if (!templates.resourceTemplates.some((template) => template.uriTemplate === "capsule://demo/{scenario}")) {
  throw new Error("Missing scenario resource template.");
}

const prompts = await client.listPrompts();
const promptNames = prompts.prompts.map((prompt) => prompt.name);
for (const required of ["proof_capsule_review", "mcp_client_handoff", "red_team_capsule_boundary"]) {
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
  scenarioCoverage: scenarioCapsules,
  liveWriteBlocked: redTeam.structuredContent.blocked
}, null, 2));
