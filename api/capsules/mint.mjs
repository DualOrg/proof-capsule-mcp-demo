import { mintProofCapsule, requireOperator } from "../../src/dual-live.mjs";
import { readBody, withApi } from "../_http.mjs";

export default async function handler(req, res) {
  await withApi(req, res, ["POST", "OPTIONS"], async () => {
    requireOperator(req);
    res.status(200).json(await mintProofCapsule(await readBody(req)));
  });
}
