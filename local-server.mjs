import { createServer } from "node:http";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {
  composeProofCapsule,
  evaluateCapsulePolicy,
  getWorkflowDefinition,
  listSourceVerifiers,
  redTeamCapsule,
  replayWorkflowCapsule,
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

function setCors(res) {
  res.setHeader("access-control-allow-origin", "*");
  res.setHeader("access-control-allow-methods", "GET, POST, OPTIONS");
  res.setHeader("access-control-allow-headers", "content-type, mcp-session-id");
  res.setHeader("cache-control", "no-store, max-age=0, must-revalidate");
  res.setHeader("pragma", "no-cache");
  res.setHeader("expires", "0");
}

async function readBody(req) {
  let body = "";
  for await (const chunk of req) body += chunk;
  if (!body) return {};
  try {
    return JSON.parse(body);
  } catch {
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

  if (req.method === "POST" && url.pathname === "/api/capsule/evaluate") {
    return sendJson(res, 200, evaluateCapsulePolicy(await readBody(req)));
  }

  if (req.method === "POST" && url.pathname === "/api/capsule/red-team") {
    return sendJson(res, 200, redTeamCapsule(await readBody(req)));
  }

  if (req.method === "GET" && url.pathname === "/api/workflow/definition") {
    return sendJson(res, 200, getWorkflowDefinition({ scenario: url.searchParams.get("scenario") || undefined }));
  }

  if (req.method === "POST" && url.pathname === "/api/workflow/replay") {
    return sendJson(res, 200, replayWorkflowCapsule(await readBody(req)));
  }

  if (req.method === "GET" && url.pathname === "/api/source/verifiers") {
    return sendJson(res, 200, listSourceVerifiers());
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
  const pathname = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
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
