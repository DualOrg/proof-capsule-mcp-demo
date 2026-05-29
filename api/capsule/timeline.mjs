import { buildProofTimeline } from "../../src/capsule-core.mjs";
import { readBody, withApi } from "../_http.mjs";

export default async function handler(req, res) {
  await withApi(req, res, ["POST", "OPTIONS"], async () => {
    res.status(200).json(buildProofTimeline(await readBody(req)));
  });
}
