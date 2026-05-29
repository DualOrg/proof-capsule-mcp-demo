import { runProofCapsule } from "../../src/capsule-core.mjs";
import { readBody, withApi } from "../_http.mjs";

function requestBaseUrl(req) {
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host || "proof-capsule-mcp-demo.vercel.app";
  return `${proto}://${host}`;
}

export default async function handler(req, res) {
  await withApi(req, res, ["POST", "OPTIONS"], async () => {
    const baseUrl = requestBaseUrl(req);
    res.status(200).json(runProofCapsule({
      ...(await readBody(req)),
      base_url: baseUrl,
      endpoint: `${baseUrl}/mcp`
    }));
  });
}
