import { createTenantActivationRequest } from "../../src/capsule-core.mjs";
import { getDualStatusLive } from "../../src/dual-live.mjs";
import { readBody, withApi } from "../_http.mjs";

export default async function handler(req, res) {
  await withApi(req, res, ["POST", "OPTIONS"], async () => {
    res.status(200).json(createTenantActivationRequest({
      ...(await readBody(req)),
      dual_status: await getDualStatusLive()
    }));
  });
}
