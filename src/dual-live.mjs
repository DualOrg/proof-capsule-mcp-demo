import {
  attachHashes,
  composeProofCapsule,
  defaultWriteBoundary,
  hashValue,
  serviceDescriptor,
  verifyProofCapsule
} from "./capsule-core.mjs";
import { timingSafeEqual } from "node:crypto";

export const ORG_ID = "69b935b4187e903f826bbe71";
export const TEMPLATE_NAME = "io.dual.proof_capsule.demo.v1";
export const LOCAL_TEMPLATE_ID = "proof-capsule-template-local-v1";
export const LOCAL_OBJECT_ID = "proof-capsule-object-local-v1";
export const OPERATOR_TOKEN_MIN_LENGTH = 32;
const configuredAttemptLimit = Number(process.env.DEMO_OPERATOR_ATTEMPT_LIMIT || 12);
const configuredAttemptWindowMs = Number(process.env.DEMO_OPERATOR_ATTEMPT_WINDOW_MS || 5 * 60 * 1000);
export const OPERATOR_ATTEMPT_LIMIT = Number.isFinite(configuredAttemptLimit) && configuredAttemptLimit > 0
  ? configuredAttemptLimit
  : 12;
export const OPERATOR_ATTEMPT_WINDOW_MS = Number.isFinite(configuredAttemptWindowMs) && configuredAttemptWindowMs > 0
  ? configuredAttemptWindowMs
  : 5 * 60 * 1000;

const operatorFailures = new Map();

export function dualConfig() {
  const writeMode = process.env.DUAL_WRITE_MODE || "read_only";
  return {
    apiUrl: process.env.DUAL_API_URL || "https://api-testnet.dual.network",
    apiKey: process.env.DUAL_API_KEY || "",
    orgId: process.env.DUAL_ORG_ID || ORG_ID,
    templateName: TEMPLATE_NAME,
    templateId: process.env.DUAL_PROOF_CAPSULE_TEMPLATE_ID || "",
    objectId: process.env.DUAL_PROOF_CAPSULE_OBJECT_ID || "",
    operatorToken: process.env.DEMO_OPERATOR_TOKEN || "",
    writeMode,
    eventBusPath: process.env.DUAL_EVENTBUS_PATH || "/ebus/execute",
    explorerUrl: process.env.DUAL_EXPLORER_URL || "https://explorer-testnet.dual.network",
    publicWrites: false
  };
}

export function readiness() {
  const config = dualConfig();
  const readbackReady = Boolean(config.apiKey && config.objectId);
  const operatorTokenStrong = isOperatorTokenStrong(config.operatorToken);
  const mintReady = Boolean(config.apiKey && config.templateId && operatorTokenStrong && config.writeMode === "event_bus");
  const syncReady = Boolean(mintReady && config.objectId);
  const missing = [];
  if (!config.apiKey) missing.push("DUAL_API_KEY");
  if (!config.templateId) missing.push("DUAL_PROOF_CAPSULE_TEMPLATE_ID");
  if (!config.objectId) missing.push("DUAL_PROOF_CAPSULE_OBJECT_ID");
  if (!config.operatorToken) missing.push("DEMO_OPERATOR_TOKEN");
  if (config.operatorToken && !operatorTokenStrong) missing.push("DEMO_OPERATOR_TOKEN>=32_RANDOM_CHARS");
  if (config.writeMode !== "event_bus") missing.push("DUAL_WRITE_MODE=event_bus");

  return {
    service: "dual-proof-capsule-mcp-demo",
    runtime: process.env.VERCEL ? "vercel" : "node",
    mode: readbackReady ? "dual" : "local-proof",
    orgId: config.orgId,
    templateName: config.templateName,
    templateId: config.templateId || LOCAL_TEMPLATE_ID,
    objectId: config.objectId || LOCAL_OBJECT_ID,
    configured: readbackReady,
    readbackReady,
    mintReady,
    syncReady,
    writable: mintReady,
    writeMode: config.writeMode,
    eventBusPath: config.eventBusPath,
    operatorGateConfigured: Boolean(config.operatorToken),
    publicWrites: false,
    liveDualWrites: mintReady,
    writeExecutionExposed: mintReady ? "operator_gated" : false,
    missing: mintReady ? [] : missing,
    safety: {
      rawEvidenceStored: false,
      publicWriteTools: false,
      operatorGate: config.operatorToken ? operatorTokenStrong ? "configured_high_entropy" : "configured_weak" : "not_configured",
      operatorAttemptLimit: {
        enabled: true,
        maxFailures: OPERATOR_ATTEMPT_LIMIT,
        windowSeconds: Math.round(OPERATOR_ATTEMPT_WINDOW_MS / 1000)
      },
      proofLevel: readbackReady ? "dual_readback_rederived" : "local_rederived"
    },
    detail: mintReady
      ? "DUAL readback and operator-gated event-bus writes are configured."
      : readbackReady
        ? "DUAL readback is configured. Live writes need a template id, event_bus mode, and DEMO_OPERATOR_TOKEN."
        : "Running in local proof mode. Set DUAL_API_KEY and DUAL_PROOF_CAPSULE_OBJECT_ID to enable live DUAL readback."
  };
}

export async function getDualStatusLive() {
  const status = readiness();
  if (!status.readbackReady) {
    return {
      ...status,
      source: "local_proof",
      object: null,
      verification: null
    };
  }
  try {
    const current = await readCurrentObject();
    return {
      ...status,
      source: "dual_readback",
      object: current.object,
      verification: current.verification
    };
  } catch (error) {
    return {
      ...status,
      source: "dual_readback_error",
      readbackReady: false,
      configured: false,
      liveDualWrites: false,
      error: error.message || "DUAL readback failed"
    };
  }
}

export async function getCurrentCapsuleLive(input = {}) {
  const status = readiness();
  if (!status.readbackReady) {
    const capsule = composeProofCapsule(input);
    return {
      ok: true,
      source: "local_seed",
      capsule,
      status,
      object: null,
      verification: verifyProofCapsule({ capsule })
    };
  }
  const current = await readCurrentObject();
  return {
    ok: true,
    source: "dual_readback",
    capsule: current.capsule,
    status,
    object: current.object,
    verification: current.verification
  };
}

export async function readCurrentObject(config = dualConfig()) {
  const object = await readObjectById(config.objectId, config);
  const properties = object.properties || {};
  const capsule = normalizeStoredCapsule(properties, { object });
  const verification = verifyCapsuleReadback(properties, capsule);
  return {
    available: true,
    source: "dual_readback",
    object,
    properties,
    capsule,
    verification,
    status: readiness()
  };
}

export async function mintProofCapsule(input = {}) {
  requireWritable({ requireObject: false });
  const config = dualConfig();
  if (config.objectId && input.force !== true) {
    const error = new Error("Canonical Proof Capsule object is already configured; mint is disabled unless force=true.");
    error.status = 409;
    error.readiness = readiness();
    throw error;
  }

  const balance = await requirePositiveBalance(config);
  const initialCapsule = composeForLiveWrite(input, { templateId: config.templateId });
  const initialVerification = verifyProofCapsule({ capsule: initialCapsule });
  if (!initialVerification.accepted) {
    const error = new Error("Proof Capsule failed verification before mint.");
    error.status = 409;
    error.verification = initialVerification;
    throw error;
  }

  const metadata = semanticMetadata("proof_capsule_minted", initialCapsule, input.audit || {});
  const { result, payloadStyle } = await executeEventBusWithFallback(
    config,
    mintPayloadAttempts(config.templateId, initialCapsule, metadata)
  );
  const objectId = extractObjectId(result);
  const postMintObject = objectId ? await readObjectById(objectId, { ...config, objectId }) : extractResultObject(result);
  const anchoredCapsule = composeForLiveWrite(input, { object: postMintObject, templateId: config.templateId, objectId });
  const anchoredMetadata = semanticMetadata("proof_capsule_post_mint_anchor_synced", anchoredCapsule, {
    ...(input.audit || {}),
    minted_object_id: objectId
  });
  const postMintSync = objectId
    ? await executeEventBusWithFallback(
        config,
        updatePayloadAttempts(objectId, anchoredCapsule, anchoredMetadata)
      )
    : null;
  const readback = objectId ? await readObjectById(objectId, { ...config, objectId }) : postMintObject;
  const verification = verifyCapsuleReadback(readback?.properties || {}, anchoredCapsule);

  return {
    ok: true,
    minted: true,
    synced: Boolean(postMintSync),
    action: "mint",
    payloadStyle,
    postMintPayloadStyle: postMintSync?.payloadStyle || null,
    balance,
    publicWrites: false,
    liveDualWrites: true,
    object: readback,
    capsule: anchoredCapsule,
    verification,
    result,
    postMintSync: postMintSync?.result || null
  };
}

export async function syncProofCapsule(input = {}) {
  requireWritable();
  const config = dualConfig();
  const balance = await requirePositiveBalance(config);
  const existing = await readObjectById(config.objectId, config);
  const capsule = composeForLiveWrite(input, { object: existing, templateId: config.templateId, objectId: config.objectId });
  const verificationBeforeWrite = verifyProofCapsule({ capsule });
  if (!verificationBeforeWrite.accepted) {
    const error = new Error("Proof Capsule failed verification before sync.");
    error.status = 409;
    error.verification = verificationBeforeWrite;
    throw error;
  }
  const metadata = semanticMetadata("proof_capsule_synced", capsule, input.audit || {});
  const { result, payloadStyle } = await executeEventBusWithFallback(
    config,
    updatePayloadAttempts(config.objectId, capsule, metadata)
  );
  const readback = await readObjectById(config.objectId, config);
  const verification = verifyCapsuleReadback(readback.properties, capsule);
  return {
    ok: true,
    synced: true,
    action: "update",
    payloadStyle,
    balance,
    publicWrites: false,
    liveDualWrites: true,
    object: readback,
    capsule,
    verification,
    result
  };
}

export async function ensureTemplateAndObject(options = {}) {
  const config = dualConfig();
  if (!config.apiKey) {
    const error = new Error("DUAL_API_KEY is not configured.");
    error.status = 409;
    throw error;
  }
  if (config.writeMode !== "event_bus") {
    const error = new Error("DUAL_WRITE_MODE=event_bus is required for setup writes.");
    error.status = 409;
    throw error;
  }
  const template = await findOrCreateTemplate(config);
  const templateId = extractTemplateId(template);
  await requirePositiveBalance(config);
  const object = await findOrMintSeedObject({ ...config, templateId }, templateId, options);
  const objectId = extractObjectId(object);
  const readback = objectId ? await readObjectById(objectId, { ...config, templateId, objectId }) : null;
  const anchoredCapsule = composeForLiveWrite(options, { object: readback, templateId, objectId });
  const synced = objectId
    ? await executeEventBusWithFallback(
        { ...config, templateId, objectId },
        updatePayloadAttempts(objectId, anchoredCapsule, semanticMetadata("proof_capsule_setup_synced", anchoredCapsule, {
          source: "setup-live-dual",
          reason: "canonical Proof Capsule object"
        }))
      )
    : null;
  const finalReadback = objectId ? await readObjectById(objectId, { ...config, templateId, objectId }) : readback;
  const verification = finalReadback ? verifyCapsuleReadback(finalReadback.properties, anchoredCapsule) : null;
  return {
    created_at: new Date().toISOString(),
    api_url: config.apiUrl,
    org_id: config.orgId,
    template_name: config.templateName,
    template_id: templateId,
    object_id: objectId,
    readback_verified: Boolean(verification?.ok),
    verification,
    sync_result: synced?.result || null,
    readback: finalReadback
  };
}

export function requireOperator(requestOrToken, options = {}) {
  const supplied = typeof requestOrToken === "string"
    ? requestOrToken
    : requestOrToken?.headers?.["x-demo-operator-token"]
      || requestOrToken?.headers?.["X-Demo-Operator-Token"]
      || requestOrToken?.headers?.get?.("x-demo-operator-token")
      || "";
  const auth = typeof requestOrToken === "string"
    ? ""
    : requestOrToken?.headers?.authorization
      || requestOrToken?.headers?.Authorization
      || requestOrToken?.headers?.get?.("authorization")
      || "";
  const bearer = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "";
  const expected = dualConfig().operatorToken;
  const valid = isOperatorTokenStrong(expected)
    && (timingSafeTokenEqual(supplied, expected) || timingSafeTokenEqual(bearer, expected));
  const limiterKey = operatorLimiterKey(requestOrToken, options);
  if (valid) {
    operatorFailures.delete(limiterKey);
    return;
  }
  recordOperatorFailure(limiterKey);
  if (!expected || !isOperatorTokenStrong(expected) || !valid) {
    const error = new Error("Invalid or missing operator token.");
    error.status = 403;
    throw error;
  }
}

export function requireWritable(options = {}) {
  const requireObject = options.requireObject !== false;
  const status = readiness();
  const config = dualConfig();
  const baseWritable = Boolean(config.apiKey && config.templateId && isOperatorTokenStrong(config.operatorToken) && config.writeMode === "event_bus");
  if (!baseWritable || (requireObject && !config.objectId)) {
    const error = new Error(status.detail);
    error.status = 409;
    error.readiness = status;
    throw error;
  }
}

export function isOperatorTokenStrong(token) {
  return typeof token === "string" && Buffer.byteLength(token, "utf8") >= OPERATOR_TOKEN_MIN_LENGTH;
}

function timingSafeTokenEqual(candidate, expected) {
  if (!candidate || !expected) return false;
  const left = Buffer.from(String(candidate), "utf8");
  const right = Buffer.from(String(expected), "utf8");
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function operatorLimiterKey(requestOrToken, options = {}) {
  if (typeof requestOrToken === "string") return `mcp:${options.source || "operator-token"}`;
  const forwardedFor = requestOrToken?.headers?.["x-forwarded-for"]
    || requestOrToken?.headers?.["X-Forwarded-For"]
    || requestOrToken?.headers?.get?.("x-forwarded-for")
    || "";
  const realIp = requestOrToken?.headers?.["x-real-ip"]
    || requestOrToken?.headers?.["X-Real-IP"]
    || requestOrToken?.headers?.get?.("x-real-ip")
    || "";
  const socketIp = requestOrToken?.socket?.remoteAddress || "";
  const ip = String(forwardedFor).split(",")[0].trim() || String(realIp).trim() || socketIp || "unknown";
  return `http:${ip}`;
}

function recordOperatorFailure(key) {
  const now = Date.now();
  const current = operatorFailures.get(key);
  const fresh = current && current.expiresAt > now
    ? { count: current.count + 1, expiresAt: current.expiresAt }
    : { count: 1, expiresAt: now + OPERATOR_ATTEMPT_WINDOW_MS };
  operatorFailures.set(key, fresh);
  if (fresh.count > OPERATOR_ATTEMPT_LIMIT) {
    const error = new Error("Too many invalid operator token attempts. Try again later.");
    error.status = 429;
    error.code = "OPERATOR_RATE_LIMITED";
    throw error;
  }
}

export async function requirePositiveBalance(config = dualConfig()) {
  const raw = await dualRequest(config, "GET", `/organizations/${encodeURIComponent(config.orgId)}/balance`);
  const value = extractBalance(raw);
  const ready = Number.isFinite(value) && value > 0;
  if (!ready) {
    const error = new Error(`DUAL org balance must be positive before Proof Capsule event-bus writes. Current balance: ${value}`);
    error.status = 409;
    error.balance = { ready, value };
    throw error;
  }
  return { ready, value };
}

export async function readBody(request) {
  if (request.body && typeof request.body === "object" && !request.readable) return request.body;
  if (typeof request.body === "string") return JSON.parse(request.body || "{}");
  const chunks = [];
  for await (const chunk of request) chunks.push(Buffer.from(chunk));
  const raw = Buffer.concat(chunks).toString("utf8") || "{}";
  return JSON.parse(raw);
}

export function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader("content-type", "application/json; charset=utf-8");
  response.end(JSON.stringify(payload, null, 2));
}

export function requireMethod(request, response, method) {
  if (request.method === method) return true;
  sendJson(response, 405, { ok: false, error: `Method ${request.method} not allowed`, allowed: [method] });
  return false;
}

export function sendError(response, error) {
  sendJson(response, error.status || 500, {
    ok: false,
    error: {
      message: error.message || "Unknown error",
      code: error.code || error.name || "SERVER_ERROR",
      readiness: error.readiness || undefined,
      balance: error.balance || undefined,
      verification: error.verification || undefined
    },
    publicWrites: false
  });
}

export function liveServiceDescriptor() {
  const status = readiness();
  const descriptor = serviceDescriptor();
  return {
    ...descriptor,
    version: "0.3.0",
    mode: status.mode,
    writeBoundary: status.detail,
    liveDualWrites: status.liveDualWrites,
    publicWrites: false,
    operatorTokenAccepted: status.operatorGateConfigured,
    dual: status,
    resources: [
      ...descriptor.resources,
      "capsule://dual/status",
      "capsule://dual/current"
    ],
    tools: [
      ...descriptor.tools,
      "get_live_dual_status",
      "get_current_live_capsule",
      "mint_proof_capsule_live",
      "sync_proof_capsule_live"
    ]
  };
}

export function composeForLiveWrite(input = {}, context = {}) {
  const base = input.capsule?.schema_version
    ? input.capsule
    : composeProofCapsule(input);
  return attachHashes({
    ...base,
    dual_anchor: liveDualAnchor(context),
    write_boundary: defaultWriteBoundary({
      live_dual_writes: true,
      operator_token_accepted: true,
      write_execution: "operator_gated",
      proof_surface: "server_side_dual_event_bus"
    })
  }, input.generated_at || new Date().toISOString());
}

export function capsuleTemplateProperties(capsuleInput, audit = {}) {
  const capsule = capsuleInput?.hashes ? capsuleInput : composeProofCapsule(capsuleInput || {});
  return {
    proof_capsule_schema: capsule.schema_version,
    capsule_id: capsule.capsule_id,
    capsule_type: capsule.capsule_type,
    subject_id: capsule.subject?.subject_id || "",
    subject_label: capsule.subject?.label || "",
    subject_value_usd: Number(capsule.subject?.value_usd || 0),
    decision_result: capsule.decision?.result || "",
    decision_code: capsule.decision?.code || "",
    review_required: Boolean(capsule.decision?.review_required),
    evidence_ref_count: (capsule.evidence_refs || []).length,
    external_anchor_count: (capsule.external_anchors || []).length,
    claim_count: (capsule.claims || []).length,
    capsule_content_hash: capsule.hashes?.capsule_content_hash || "",
    capsule_envelope_hash: capsule.hashes?.capsule_envelope_hash || "",
    policy_hash: capsule.hashes?.policy_hash || "",
    evidence_hash: capsule.hashes?.evidence_hash || "",
    external_anchor_hash: capsule.hashes?.external_anchor_hash || "",
    decision_content_hash: capsule.hashes?.decision_content_hash || "",
    state_transition_hash: capsule.hashes?.state_transition_hash || "",
    source_boundary: capsule.verification_contract?.source_boundary || "",
    raw_payload_stored: false,
    public_writes: false,
    live_write_boundary: "operator_gated",
    capsule,
    hashes: capsule.hashes || {},
    last_audit: audit,
    updated_at: new Date().toISOString()
  };
}

export function templatePayload(orgId = dualConfig().orgId) {
  const capsule = composeForLiveWrite({ scenario: "tradeflow_medical_devices" }, {
    templateId: LOCAL_TEMPLATE_ID,
    objectId: LOCAL_OBJECT_ID
  });
  const properties = capsuleTemplateProperties(capsule, {
    source: "template-seed",
    reason: "Proof Capsule template default object"
  });
  return {
    organization_id: orgId,
    name: TEMPLATE_NAME,
    description: "Use-case-agnostic DUAL Proof Capsule envelope with external evidence refs and re-derivable hashes.",
    metadata: {
      source: "proof-capsule-mcp-demo",
      schema_version: "proof-capsule.v0.1",
      proof_scope: "agnostic_evidence_envelope",
      public_writes: false,
      raw_payload_stored: false
    },
    object: {
      metadata: {
        name: "Proof Capsule Demo",
        description: "DUAL-anchored proof capsule for external tokenized data, evidence refs, and policy decisions.",
        category: "proof-capsule"
      },
      custom: properties
    },
    actions: [
      { name: "mint", alias: "mint_proof_capsule" },
      { name: "update", alias: "sync_proof_capsule" }
    ],
    public_access: {
      custom: [
        "proof_capsule_schema",
        "capsule_id",
        "capsule_type",
        "subject_id",
        "subject_label",
        "decision_result",
        "decision_code",
        "evidence_ref_count",
        "external_anchor_count",
        "capsule_content_hash",
        "capsule_envelope_hash",
        "policy_hash",
        "evidence_hash",
        "external_anchor_hash",
        "decision_content_hash",
        "raw_payload_stored",
        "public_writes",
        "live_write_boundary",
        "updated_at"
      ]
    }
  };
}

export function updatePayloadAttempts(objectId, capsuleInput, metadata = {}) {
  const properties = capsuleTemplateProperties(capsuleInput, metadata);
  return [
    { style: "direct_custom", payload: updatePayloadByStyle("direct_custom", objectId, properties, metadata) },
    { style: "direct_data_custom", payload: updatePayloadByStyle("direct_data_custom", objectId, properties, metadata) }
  ];
}

export function mintPayloadAttempts(templateId, capsuleInput, metadata = {}) {
  const properties = capsuleTemplateProperties(capsuleInput, metadata);
  return [
    { style: "direct_custom", payload: mintPayloadByStyle("direct_custom", templateId, properties, metadata) },
    { style: "direct_data_custom", payload: mintPayloadByStyle("direct_data_custom", templateId, properties, metadata) }
  ];
}

export function semanticMetadata(eventType, capsuleInput, audit = {}) {
  const capsule = capsuleInput?.hashes ? capsuleInput : composeProofCapsule(capsuleInput || {});
  return {
    source: "proof_capsule_mcp_demo",
    event_type: eventType,
    event_status: capsule.decision?.result || "",
    capsule_id: capsule.capsule_id,
    capsule_type: capsule.capsule_type,
    capsule_content_hash: capsule.hashes?.capsule_content_hash || "",
    evidence_hash: capsule.hashes?.evidence_hash || "",
    decision_content_hash: capsule.hashes?.decision_content_hash || "",
    raw_payload_stored: false,
    generated_at: new Date().toISOString(),
    audit
  };
}

async function findOrCreateTemplate(config) {
  const existing = await findTemplate(config);
  if (existing) return existing;
  const payload = templatePayload(config.orgId);
  try {
    return await dualRequest(config, "POST", "/templates", payload);
  } catch (error) {
    if (error.status !== 400) throw error;
    const { organization_id: _organizationId, ...withoutOrg } = payload;
    return dualRequest(config, "POST", "/templates", withoutOrg);
  }
}

async function findTemplate(config) {
  const body = await dualRequest(config, "GET", `/templates?org_id=${encodeURIComponent(config.orgId)}&limit=25`);
  return asArray(body).find((item) => item?.name === TEMPLATE_NAME) || null;
}

async function findOrMintSeedObject(config, templateId, options = {}) {
  const existing = await findSeedObject(config, templateId);
  if (existing) return existing;
  const capsule = composeForLiveWrite({ scenario: options.scenario || "tradeflow_medical_devices" }, { templateId });
  const metadata = semanticMetadata("proof_capsule_minted", capsule, {
    source: "setup-live-dual",
    reason: "canonical Proof Capsule object"
  });
  const { result } = await executeEventBusWithFallback(config, mintPayloadAttempts(templateId, capsule, metadata));
  const objectId = extractObjectId(result);
  if (objectId) return { id: objectId, result };
  return await findSeedObject(config, templateId) || result;
}

async function findSeedObject(config, templateId) {
  const body = await dualRequest(config, "GET", `/objects?template_id=${encodeURIComponent(templateId)}&org_id=${encodeURIComponent(config.orgId)}&limit=25`);
  return asArray(body).find((item) => {
    const custom = extractCustom(item);
    return custom.capsule_id === "PC-TRADEFLOW-SG-AU-001";
  }) || null;
}

async function executeEventBusWithFallback(config, attempts) {
  const errors = [];
  for (const attempt of attempts) {
    try {
      const result = await dualRequest(config, "POST", config.eventBusPath, attempt.payload);
      return { result, payloadStyle: attempt.style };
    } catch (error) {
      errors.push({
        style: attempt.style,
        status: error.status || null,
        message: error.message,
        body: error.body || null
      });
    }
  }
  const error = new Error(`DUAL event-bus write failed. ${errors.map((item) => `${item.style}: ${item.message}`).join(" | ")}`);
  error.status = errors[0]?.status || 400;
  error.body = { attempts: errors };
  throw error;
}

async function readObjectById(objectId, config = dualConfig()) {
  const object = await dualRequest(config, "GET", `/objects/${encodeURIComponent(objectId)}`);
  return summarizeObject(object, config);
}

async function dualRequest(config, method, path, body) {
  if (!config.apiKey) {
    const error = new Error("DUAL_API_KEY is not configured.");
    error.status = 409;
    throw error;
  }
  const response = await fetch(`${config.apiUrl.replace(/\/+$/, "")}${path}`, {
    method,
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "x-api-key": config.apiKey
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload?.message || payload?.error || `DUAL request failed with HTTP ${response.status}`);
    error.status = response.status;
    error.body = payload;
    throw error;
  }
  return payload;
}

function updatePayloadByStyle(style, objectId, properties, metadata = {}) {
  const custom = {
    ...properties,
    updated_at: new Date().toISOString()
  };
  if (style === "direct_data_custom") {
    return {
      action: {
        update: {
          id: objectId,
          data: { custom }
        }
      },
      metadata
    };
  }
  return {
    action: {
      update: {
        id: objectId,
        custom
      }
    },
    metadata
  };
}

function mintPayloadByStyle(style, templateId, properties, metadata = {}) {
  const config = dualConfig();
  const custom = {
    ...properties,
    updated_at: new Date().toISOString()
  };
  if (style === "direct_data_custom") {
    return {
      action: {
        mint: {
          template_id: templateId,
          organization_id: config.orgId,
          num: 1,
          data: { custom }
        }
      },
      metadata: mintMetadata(metadata)
    };
  }
  return {
    action: {
      mint: {
        template_id: templateId,
        organization_id: config.orgId,
        num: 1,
        custom
      }
    },
    metadata: mintMetadata(metadata)
  };
}

function mintMetadata(metadata = {}) {
  return {
    name: "Proof Capsule Demo",
    description: "DUAL-anchored proof capsule for external tokenized data and policy decisions.",
    category: "proof-capsule",
    ...metadata
  };
}

function verifyCapsuleReadback(properties = {}, expectedCapsule = null) {
  const capsule = normalizeStoredCapsule(properties);
  const verification = verifyProofCapsule({ capsule });
  const expected = expectedCapsule || capsule;
  const matches = {
    capsule_id: properties.capsule_id === expected.capsule_id,
    capsule_content_hash: properties.capsule_content_hash === expected.hashes?.capsule_content_hash,
    evidence_hash: properties.evidence_hash === expected.hashes?.evidence_hash,
    decision_content_hash: properties.decision_content_hash === expected.hashes?.decision_content_hash,
    public_writes_disabled: properties.public_writes === false,
    raw_payload_not_stored: properties.raw_payload_stored === false
  };
  const ok = verification.accepted && Object.values(matches).every(Boolean);
  if (!ok) {
    const error = new Error("DUAL readback did not match the expected Proof Capsule state.");
    error.status = 409;
    error.verification = { ok, matches, verification };
    throw error;
  }
  return {
    ok,
    matches,
    verification_level: "dual_readback_rederived",
    capsule_content_hash: properties.capsule_content_hash,
    evidence_hash: properties.evidence_hash,
    verification_hash: hashValue({ matches, capsule_hashes: capsule.hashes })
  };
}

function normalizeStoredCapsule(properties = {}, context = {}) {
  if (properties.capsule?.schema_version) {
    return attachHashes(properties.capsule, properties.capsule.generated_at || properties.updated_at || new Date().toISOString());
  }
  return composeForLiveWrite({
    scenario: "tradeflow_medical_devices",
    capsule_id: properties.capsule_id || undefined
  }, {
    object: context.object,
    templateId: properties.template_id || dualConfig().templateId,
    objectId: context.object?.id || dualConfig().objectId
  });
}

function liveDualAnchor(context = {}) {
  const config = dualConfig();
  const object = context.object || {};
  const objectId = context.objectId || object.id || config.objectId || null;
  const templateId = context.templateId || object.templateId || config.templateId || null;
  return {
    mode: "dual_live",
    source: "Live DUAL proof-capsule object",
    org_id: config.orgId,
    object_id: objectId,
    template_id: templateId,
    state_hash: object.stateHash || null,
    integrity_hash: object.integrityHash || null,
    object_explorer_url: objectId ? `${config.explorerUrl.replace(/\/+$/, "")}/objects/${objectId}` : null,
    template_explorer_url: templateId ? `${config.explorerUrl.replace(/\/+$/, "")}/templates/${templateId}` : null,
    caveat: "DUAL anchors the proof envelope. External systems remain the source of truth for their native facts."
  };
}

function summarizeObject(object = {}, config = dualConfig()) {
  if (!object || typeof object !== "object") return null;
  const properties = extractCustom(object);
  const id = extractObjectId(object);
  const templateId = extractTemplateId(object) || config.templateId;
  return {
    id,
    templateId,
    organizationId: extractOrganizationId(object) || config.orgId,
    stateHash: stringValue(object.state_hash || object.stateHash),
    integrityHash: stringValue(object.integrity_hash || object.integrityHash || properties.capsule_content_hash),
    explorerUrl: id ? `${config.explorerUrl.replace(/\/+$/, "")}/objects/${id}` : null,
    templateExplorerUrl: templateId ? `${config.explorerUrl.replace(/\/+$/, "")}/templates/${templateId}` : null,
    properties
  };
}

function extractResultObject(result = {}) {
  const candidates = [
    result?.object,
    result?.data?.object,
    result?.result?.object,
    result?.objects?.[0],
    result?.data?.objects?.[0],
    result?.result?.objects?.[0],
    result?.affected_objects?.[0],
    result?.affectedObjects?.[0]
  ];
  return candidates.map((candidate) => summarizeObject(candidate)).find(Boolean) || null;
}

function extractCustom(object = {}) {
  return object?.properties
    || object?.custom
    || object?.data?.custom
    || object?.state?.custom
    || object?.object?.properties
    || object?.object?.custom
    || {};
}

function extractObjectId(value = {}) {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return extractObjectId(value[0]);
  return value.id
    || value.object_id
    || value.objectId
    || value.data?.id
    || value.data?.object_id
    || value.data?.objectId
    || value.data?.objects?.[0]?.id
    || value.objects?.[0]?.id
    || value.result?.id
    || value.result?.object_id
    || value.result?.objectId
    || value.result?.objects?.[0]?.id
    || "";
}

function extractTemplateId(value = {}) {
  return value.template_id
    || value.templateId
    || value.template?.id
    || value.id
    || value.data?.template_id
    || value.data?.templateId
    || value.data?.id
    || "";
}

function extractOrganizationId(value = {}) {
  return value.organization_id
    || value.organizationId
    || value.org_id
    || value.orgId
    || value.data?.organization_id
    || value.data?.organizationId
    || "";
}

function extractBalance(value) {
  const candidates = [
    value?.balance?.amount,
    value?.balance?.value,
    value?.balance,
    value?.available?.amount,
    value?.available?.value,
    value?.available,
    value?.amount,
    value?.value,
    value?.data?.balance?.amount,
    value?.data?.balance?.value,
    value?.data?.balance,
    value?.data?.available?.amount,
    value?.data?.available?.value,
    value?.data?.available,
    value?.organization?.balance
  ];
  for (const candidate of candidates) {
    if (candidate === undefined || candidate === null || candidate === "") continue;
    const numeric = Number(candidate);
    if (Number.isFinite(numeric)) return numeric;
  }
  return Number.NaN;
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  return value?.items
    || value?.templates
    || value?.objects
    || value?.results
    || value?.data?.items
    || value?.data?.templates
    || value?.data?.objects
    || [];
}

function stringValue(value, fallback = "") {
  if (value === undefined || value === null || value === "") return fallback;
  return String(value);
}
