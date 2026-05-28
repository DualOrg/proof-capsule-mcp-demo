import fs from "node:fs";
import path from "node:path";

export function loadEnv() {
  const candidates = [
    process.env.DUAL_ENV_FILE,
    path.resolve(process.cwd(), ".env"),
    path.resolve(process.cwd(), "../ager-dual-pilot/.env")
  ].filter(Boolean);
  const loaded = [];
  for (const candidate of candidates) {
    if (!candidate || !fs.existsSync(candidate)) continue;
    const text = fs.readFileSync(candidate, "utf8");
    for (const line of text.split(/\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
      const index = trimmed.indexOf("=");
      const key = trimmed.slice(0, index).trim();
      const raw = trimmed.slice(index + 1).trim();
      const value = raw.replace(/^['"]|['"]$/g, "");
      if (key && process.env[key] === undefined) process.env[key] = value;
    }
    loaded.push(candidate);
    break;
  }
  return loaded;
}

export function envSummary() {
  return {
    DUAL_API_URL: Boolean(process.env.DUAL_API_URL),
    DUAL_API_KEY: Boolean(process.env.DUAL_API_KEY),
    DUAL_ORG_ID: Boolean(process.env.DUAL_ORG_ID),
    DUAL_PROOF_CAPSULE_TEMPLATE_ID: Boolean(process.env.DUAL_PROOF_CAPSULE_TEMPLATE_ID),
    DUAL_PROOF_CAPSULE_OBJECT_ID: Boolean(process.env.DUAL_PROOF_CAPSULE_OBJECT_ID),
    DEMO_OPERATOR_TOKEN: Boolean(process.env.DEMO_OPERATOR_TOKEN),
    DUAL_WRITE_MODE: process.env.DUAL_WRITE_MODE || ""
  };
}
