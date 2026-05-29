export function setCors(res) {
  res.setHeader("access-control-allow-origin", "*");
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

export async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  const raw = Buffer.concat(chunks).toString("utf8") || "{}";
  return JSON.parse(raw);
}

export async function withApi(req, res, allowed, handler) {
  setCors(res);
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
