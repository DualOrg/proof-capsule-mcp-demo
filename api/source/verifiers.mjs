import { listSourceVerifiers } from "../../src/capsule-core.mjs";
import { withApi } from "../_http.mjs";

export default async function handler(req, res) {
  await withApi(req, res, ["GET", "OPTIONS"], async () => {
    res.status(200).json(listSourceVerifiers());
  });
}
