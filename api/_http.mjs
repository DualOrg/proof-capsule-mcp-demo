const DEFAULT_ALLOWED_ORIGINS = [
  "https://proof-capsule-mcp-demo.vercel.app",
  "http://127.0.0.1:4184",
  "http://localhost:4184"
];
const MAX_JSON_BODY_BYTES = Number(process.env.DEMO_MAX_JSON_BODY_BYTES || 512 * 1024);
const MAX_JSON_DEPTH = Number(process.env.DEMO_MAX_JSON_DEPTH || 32);

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

export function setCors(req, res) {
  const origin = req?.headers?.origin;
  if (origin && isAllowedOrigin(origin)) {
    res.setHeader("access-control-allow-origin", origin);
    res.setHeader("vary", "origin");
  }
  res.setHeader("access-control-allow-methods", "GET, POST, OPTIONS");
  res.setHeader("access-control-allow-headers", "content-type, authorization, x-demo-operator-token, mcp-session-id");
  res.setHeader("cache-control", "no-store, max-age=0, must-revalidate");
  res.setHeader("pragma", "no-cache");
  res.setHeader("expires", "0");
}

export function sendJson(res, status, payload) {
  res.status(status).json(payload);
}

export function sendError(res, error) {
  res.status(error.status || 500).json({
    ok: false,
    error: {
      message: error.message || "Unexpected error.",
      code: error.code || error.name || "SERVER_ERROR",
      readiness: error.readiness || undefined,
      balance: error.balance || undefined,
      verification: error.verification || undefined
    },
    publicWrites: false
  });
}

function rejectPayload(message, status = 413) {
  const error = new Error(message);
  error.status = status;
  error.code = "PAYLOAD_REJECTED";
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

export function assertJsonPayload(value, raw = "") {
  const byteLength = raw
    ? Buffer.byteLength(raw, "utf8")
    : Buffer.byteLength(JSON.stringify(value || {}), "utf8");
  if (Number.isFinite(MAX_JSON_BODY_BYTES) && byteLength > MAX_JSON_BODY_BYTES) {
    rejectPayload(`JSON payload exceeds ${MAX_JSON_BODY_BYTES} bytes.`);
  }
  assertPayloadDepth(value);
}

function parseJson(raw) {
  try {
    return JSON.parse(raw || "{}");
  } catch {
    const error = new Error("Request body must be valid JSON.");
    error.status = 400;
    error.code = "INVALID_JSON";
    throw error;
  }
}

export async function readBody(req) {
  if (req.body && typeof req.body === "object") {
    assertJsonPayload(req.body);
    return req.body;
  }
  if (typeof req.body === "string") {
    const payload = parseJson(req.body);
    assertJsonPayload(payload, req.body || "{}");
    return payload;
  }
  const chunks = [];
  let bytes = 0;
  for await (const chunk of req) {
    const buffer = Buffer.from(chunk);
    bytes += buffer.length;
    if (Number.isFinite(MAX_JSON_BODY_BYTES) && bytes > MAX_JSON_BODY_BYTES) {
      rejectPayload(`JSON payload exceeds ${MAX_JSON_BODY_BYTES} bytes.`);
    }
    chunks.push(buffer);
  }
  const raw = Buffer.concat(chunks).toString("utf8") || "{}";
  const payload = parseJson(raw);
  assertJsonPayload(payload, raw);
  return payload;
}

export async function withApi(req, res, allowed, handler) {
  setCors(req, res);
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  if (!allowed.includes(req.method)) {
    res.setHeader("allow", allowed.join(", "));
    res.status(405).json({ ok: false, error: `Method ${req.method} not allowed`, allowed });
    return;
  }
  try {
    await handler();
  } catch (error) {
    sendError(res, error);
  }
}
