import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpServer, getMcpDescriptor } from "../src/mcp-server.mjs";
import { assertJsonPayload } from "./_http.mjs";

const DEFAULT_ALLOWED_ORIGINS = [
  "https://proof-capsule-mcp-demo.vercel.app",
  "http://127.0.0.1:4184",
  "http://localhost:4184"
];

function allowedOrigins() {
  const configured = String(process.env.DEMO_ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  return configured.length ? configured : DEFAULT_ALLOWED_ORIGINS;
}

function isAllowedOrigin(origin = "") {
  return allowedOrigins().includes(origin) || /^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(origin);
}

function setCors(req, res) {
  const origin = req?.headers?.origin;
  if (origin && isAllowedOrigin(origin)) {
    res.setHeader("access-control-allow-origin", origin);
    res.setHeader("vary", "origin");
  }
  res.setHeader("access-control-allow-methods", "GET, POST, OPTIONS");
  res.setHeader("access-control-allow-headers", "content-type, authorization, x-demo-operator-token, mcp-session-id");
  res.setHeader("cache-control", "no-store, max-age=0, must-revalidate");
  res.setHeader("cdn-cache-control", "no-store");
  res.setHeader("vercel-cdn-cache-control", "no-store");
  res.setHeader("surrogate-control", "no-store");
  res.setHeader("pragma", "no-cache");
  res.setHeader("expires", "0");
}

export default async function handler(req, res) {
  setCors(req, res);

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method === "GET") {
    res.status(200).json(getMcpDescriptor());
    return;
  }

  if (req.method !== "POST") {
    res.setHeader("allow", "GET, POST, OPTIONS");
    res.status(405).json({ ok: false, error: "MCP endpoint expects POST." });
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

  try {
    if (req.body) assertJsonPayload(req.body);
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    if (!res.headersSent) {
      res.status(error.status || 500).json({ ok: false, error: error.message || "MCP request failed." });
    }
  }
}
