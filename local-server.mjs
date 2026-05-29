import { createServer } from "node:http";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {
  buildProofTimeline,
  buildPublicVerifierPage,
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
  redTeamCapsule,
  replayWorkflowCapsule,
  runProofCapsule,
  verifyEvidenceRefs,
  verifyProofCapsule
} from "./src/capsule-core.mjs";
import {
  getCurrentCapsuleLive,
  getDualStatusLive,
  liveServiceDescriptor,
  mintProofCapsule,
  readBody as readDualBody,
  requireOperator,
  syncProofCapsule
} from "./src/dual-live.mjs";
import { createMcpServer } from "./src/mcp-server.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 4184);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
  ".png": "image/png",
  ".md": "text/markdown; charset=utf-8"
};
const MAX_JSON_BODY_BYTES = Number(process.env.DEMO_MAX_JSON_BODY_BYTES || 512 * 1024);
const MAX_JSON_DEPTH = Number(process.env.DEMO_MAX_JSON_DEPTH || 32);

function setCors(res) {
  res.setHeader("access-control-allow-origin", "*");
  res.setHeader("access-control-allow-methods", "GET, POST, OPTIONS");
  res.setHeader("access-control-allow-headers", "content-type, authorization, x-demo-operator-token, mcp-session-id");
  res.setHeader("cache-control", "no-store, max-age=0, must-revalidate");
  res.setHeader("pragma", "no-cache");
  res.setHeader("expires", "0");
}

function rejectPayload(message, status = 413) {
  const error = new Error(message);
  error.status = status;
  throw error;
}

function assertPayloadDepth(value, depth = 0, seen = new WeakSet()) {
  if (depth > MAX_JSON_DEPTH) rejectPayload(`JSON payload exceeds maximum depth of ${MAX_JSON_DEPTH}.`, 400);
  if (!value || typeof value !== "object") return;
  if (seen.has(value)) rejectPayload("JSON payload cannot contain circular references.", 400);
  seen.add(value);
  if (Array.isArray(value)) {
    for (const item of value) assertPayloadDepth(item, depth + 1, seen);
    return;
  }
  for (const key of Object.keys(value)) assertPayloadDepth(value[key], depth + 1, seen);
}

function parseJsonBody(raw) {
  if (Number.isFinite(MAX_JSON_BODY_BYTES) && Buffer.byteLength(raw, "utf8") > MAX_JSON_BODY_BYTES) {
    rejectPayload(`JSON payload exceeds ${MAX_JSON_BODY_BYTES} bytes.`);
  }
  const payload = JSON.parse(raw || "{}");
  assertPayloadDepth(payload);
  return payload;
}

async function readBody(req) {
  let body = "";
  for await (const chunk of req) {
    body += chunk;
    if (Number.isFinite(MAX_JSON_BODY_BYTES) && Buffer.byteLength(body, "utf8") > MAX_JSON_BODY_BYTES) {
      rejectPayload(`JSON payload exceeds ${MAX_JSON_BODY_BYTES} bytes.`);
    }
  }
  if (!body) return {};
  try {
    return parseJsonBody(body);
  } catch (parseError) {
    if (parseError.status) throw parseError;
    const error = new Error("Request body must be valid JSON.");
    error.status = 400;
    throw error;
  }
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  });
  res.end(JSON.stringify(payload, null, 2));
}

async function handleMcp(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }
  if (req.method === "GET") {
    sendJson(res, 200, liveServiceDescriptor());
    return;
  }
  if (req.method !== "POST") {
    res.writeHead(405, { allow: "GET, POST, OPTIONS" });
    res.end("MCP endpoint expects POST.");
    return;
  }

  const server = createMcpServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true
  });
  res.on("close", () => {
    transport.close();
    server.close();
  });
  await server.connect(transport);
  await transport.handleRequest(req, res);
}

async function handleApi(req, res, url) {
  if (req.method === "GET" && url.pathname === "/api/status") {
    return sendJson(res, 200, liveServiceDescriptor());
  }

  if (req.method === "GET" && url.pathname === "/api/dual/status") {
    return sendJson(res, 200, await getDualStatusLive());
  }

  if (req.method === "GET" && url.pathname === "/api/capsule/current") {
    return sendJson(res, 200, await getCurrentCapsuleLive({ scenario: url.searchParams.get("scenario") || undefined }));
  }

  if (req.method === "GET" && url.pathname === "/api/capsule/demo") {
    return sendJson(res, 200, { ok: true, capsule: composeProofCapsule({ scenario: url.searchParams.get("scenario") || "tradeflow_medical_devices" }) });
  }

  if (req.method === "POST" && url.pathname === "/api/capsule/compose") {
    return sendJson(res, 200, { ok: true, capsule: composeProofCapsule(await readBody(req)) });
  }

  if (req.method === "POST" && url.pathname === "/api/capsule/verify") {
    return sendJson(res, 200, verifyProofCapsule(await readBody(req)));
  }

  if (req.method === "POST" && url.pathname === "/api/capsule/diagnose") {
    return sendJson(res, 200, diagnoseCapsule(await readBody(req)));
  }

  if (req.method === "POST" && url.pathname === "/api/capsule/timeline") {
    return sendJson(res, 200, buildProofTimeline(await readBody(req)));
  }

  if (url.pathname === "/api/proof/public") {
    if (req.method === "GET") {
      return sendJson(res, 200, buildPublicVerifierPage({
        scenario: url.searchParams.get("scenario") || undefined,
        proof_id: url.searchParams.get("proof_id") || url.searchParams.get("id") || undefined,
        content_hash: url.searchParams.get("content_hash") || url.searchParams.get("hash") || undefined,
        base_url: `${url.protocol}//${url.host}`,
        endpoint: `${url.protocol}//${url.host}/mcp`
      }));
    }
    if (req.method === "POST") {
      return sendJson(res, 200, buildPublicVerifierPage({
        ...(await readBody(req)),
        base_url: `${url.protocol}//${url.host}`,
        endpoint: `${url.protocol}//${url.host}/mcp`
      }));
    }
  }

  if (req.method === "POST" && url.pathname === "/api/proof/run") {
    return sendJson(res, 200, runProofCapsule({
      ...(await readBody(req)),
      base_url: `${url.protocol}//${url.host}`,
      endpoint: `${url.protocol}//${url.host}/mcp`
    }));
  }

  if (req.method === "POST" && url.pathname === "/api/capsule/compare") {
    return sendJson(res, 200, compareCapsules(await readBody(req)));
  }

  if (req.method === "POST" && url.pathname === "/api/capsule/evaluate") {
    return sendJson(res, 200, evaluateCapsulePolicy(await readBody(req)));
  }

  if (req.method === "POST" && url.pathname === "/api/capsule/red-team") {
    return sendJson(res, 200, redTeamCapsule(await readBody(req)));
  }

  if (req.method === "GET" && url.pathname === "/api/workflow/definition") {
    return sendJson(res, 200, getWorkflowDefinition({ scenario: url.searchParams.get("scenario") || undefined }));
  }

  if (req.method === "POST" && url.pathname === "/api/workflow/build") {
    return sendJson(res, 200, buildWorkflowDraft(await readBody(req)));
  }

  if (req.method === "POST" && url.pathname === "/api/workflow/replay") {
    return sendJson(res, 200, replayWorkflowCapsule(await readBody(req)));
  }

  if (req.method === "POST" && url.pathname === "/api/evidence/verify") {
    return sendJson(res, 200, verifyEvidenceRefs(await readBody(req)));
  }

  if (req.method === "POST" && url.pathname === "/api/transition/plan") {
    return sendJson(res, 200, planTransitionQueue(await readBody(req)));
  }

  if (req.method === "GET" && url.pathname === "/api/source/verifiers") {
    return sendJson(res, 200, listSourceVerifiers());
  }

  if (req.method === "GET" && url.pathname === "/api/source/marketplace") {
    return sendJson(res, 200, listVerifierMarketplace({
      sources: (url.searchParams.get("sources") || "").split(",").map((source) => source.trim()).filter(Boolean)
    }));
  }

  if (req.method === "POST" && url.pathname === "/api/agent/handoff") {
    return sendJson(res, 200, generateAgentHandoffPack(await readBody(req)));
  }

  if (req.method === "POST" && url.pathname === "/api/capsules/sync") {
    requireOperator(req);
    return sendJson(res, 200, await syncProofCapsule(await readDualBody(req)));
  }

  if (req.method === "POST" && url.pathname === "/api/capsules/mint") {
    requireOperator(req);
    return sendJson(res, 200, await mintProofCapsule(await readDualBody(req)));
  }

  return false;
}

async function serveStatic(req, res, url) {
  const pathname = url.pathname === "/" || url.pathname.startsWith("/proof/")
    ? "/index.html"
    : decodeURIComponent(url.pathname);
  const fullPath = path.normalize(path.join(__dirname, pathname));
  if (!fullPath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  try {
    const content = await fs.readFile(fullPath);
    res.writeHead(200, {
      "content-type": mimeTypes[path.extname(fullPath)] || "application/octet-stream",
      "cache-control": pathname === "/index.html" ? "no-store" : "public, max-age=300"
    });
    res.end(content);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "127.0.0.1"}`);
  try {
    if (url.pathname === "/mcp" || url.pathname === "/api/mcp") {
      await handleMcp(req, res);
      return;
    }
    if (url.pathname.startsWith("/api/")) {
      const handled = await handleApi(req, res, url);
      if (handled !== false) return;
      return sendJson(res, 404, { ok: false, error: "Unknown API route." });
    }
    await serveStatic(req, res, url);
  } catch (error) {
    sendJson(res, error.status || 500, { ok: false, error: error.message || "Unexpected error." });
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Proof Capsule MCP demo running at http://127.0.0.1:${port}`);
  console.log(`MCP endpoint: http://127.0.0.1:${port}/mcp`);
});
