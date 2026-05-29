import { buildPublicVerifierPage } from "../../src/capsule-core.mjs";
import { readBody, withApi } from "../_http.mjs";

function requestBaseUrl(req) {
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host || "proof-capsule-mcp-demo.vercel.app";
  return `${proto}://${host}`;
}

export default async function handler(req, res) {
  await withApi(req, res, ["GET", "POST", "OPTIONS"], async () => {
    const baseUrl = requestBaseUrl(req);
    const url = new URL(req.url || "/api/proof/public", baseUrl);
    const input = req.method === "GET"
      ? {
          scenario: url.searchParams.get("scenario") || undefined,
          proof_id: url.searchParams.get("proof_id") || url.searchParams.get("id") || undefined,
          content_hash: url.searchParams.get("content_hash") || url.searchParams.get("hash") || undefined
        }
      : await readBody(req);
    res.status(200).json(buildPublicVerifierPage({
      ...input,
      base_url: baseUrl,
      endpoint: `${baseUrl}/mcp`
    }));
  });
}
