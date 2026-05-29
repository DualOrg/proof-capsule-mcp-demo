import { getSaasReadiness } from "../../src/capsule-core.mjs";
import { getDualStatusLive } from "../../src/dual-live.mjs";
import { readBody, withApi } from "../_http.mjs";

export default async function handler(req, res) {
  await withApi(req, res, ["GET", "POST", "OPTIONS"], async () => {
    const body = req.method === "POST" ? await readBody(req) : {};
    const dualStatus = await getDualStatusLive();
    res.status(200).json(getSaasReadiness({
      ...body,
      dual_status: dualStatus
    }));
  });
}
