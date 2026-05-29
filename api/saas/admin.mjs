import { getAdminControlPlane } from "../../src/capsule-core.mjs";
import { readBody, withApi } from "../_http.mjs";

export default async function handler(req, res) {
  await withApi(req, res, ["GET", "POST", "OPTIONS"], async () => {
    const body = req.method === "POST" ? await readBody(req) : {
      tenant_name: req.query?.tenant_name,
      use_case: req.query?.use_case,
      plan_id: req.query?.plan_id,
      sources: req.query?.sources
    };
    res.status(200).json(getAdminControlPlane(body));
  });
}
