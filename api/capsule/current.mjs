import { getCurrentCapsuleLive } from "../../src/dual-live.mjs";
import { withApi } from "../_http.mjs";

export default async function handler(req, res) {
  await withApi(req, res, ["GET", "OPTIONS"], async () => {
    res.status(200).json(await getCurrentCapsuleLive({ scenario: req.query?.scenario }));
  });
}
