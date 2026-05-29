import { getTenantActivationBlueprint } from "../../src/capsule-core.mjs";
import { getDualStatusLive } from "../../src/dual-live.mjs";
import { readBody, withApi } from "../_http.mjs";

export default async function handler(req, res) {
  await withApi(req, res, ["GET", "POST", "OPTIONS"], async () => {
    const body = req.method === "POST" ? await readBody(req) : {
      tenant_name: req.query?.tenant_name,
      use_case: req.query?.use_case,
      plan_id: req.query?.plan_id,
      sources: req.query?.sources,
      gateway_domain: req.query?.gateway_domain
    };
    res.status(200).json(getTenantActivationBlueprint({
      ...body,
      dual_status: await getDualStatusLive()
    }));
  });
}
