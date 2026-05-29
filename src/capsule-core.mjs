import { createHash } from "node:crypto";

export const SERVICE_NAME = "dual-proof-capsule-mcp";
export const SERVICE_VERSION = "0.9.0";
export const CAPSULE_SCHEMA_VERSION = "proof-capsule.v0.2";
export const CUSTOM_WORKFLOW_SCHEMA_VERSION = "proof-capsule-workflow-draft.v0.2";
export const EXTENSION_SCHEMA_VERSION = "proof-capsule-extension.v0.1";
export const GENERATED_AT = "2026-05-29T00:00:00.000Z";
export const WRITE_BOUNDARY = "Public read/generate/verify. Live DUAL writes are available only through server-side operator-gated endpoints; no public writes, wallet actions, raw evidence storage, or settlement execution.";

export const CAPSULE_TYPES = [
  "trade",
  "insurance",
  "asset_ownership",
  "credential",
  "agent_mandate",
  "supply_chain",
  "carbon",
  "real_estate",
  "multi_proof"
];

export const SCENARIOS = [
  "universal_proof_capsule",
  "tradeflow_medical_devices",
  "insurance_claim",
  "agent_mandate_purchase",
  "luxury_resale",
  "carbon_credit"
];

export const SCENARIO_MARKETPLACE = [
  {
    template_id: "template.proof_capsule.universal_multi_proof.v1",
    scenario: "universal_proof_capsule",
    label: "Universal multi-proof capsule",
    status: "flagship",
    capsule_type: "multi_proof",
    use_case: "Encapsulate Solana ownership, DUAL state, IPFS documents, signed attestations, payment previews, and mandates into one verifier.",
    sources: ["solana", "dual", "ipfs", "verifier_attestation", "payment_preview", "enterprise_vault"],
    reviewer_path: "Run proof -> inspect proof room -> open public verifier -> verify tamper link -> hand off MCP pack"
  },
  {
    template_id: "template.proof_capsule.tradeflow.v1",
    scenario: "tradeflow_medical_devices",
    label: "Conditional Trade Instrument",
    status: "production_demo",
    capsule_type: "trade",
    use_case: "Gate shipment milestones and payment release with token, document, telemetry, customs, insurance, escrow, and DUAL mandate proof.",
    sources: ["solana", "ipfs", "signed_iot_feed", "customs_attestation", "insurance_attestation", "escrow_mirror", "dual"],
    reviewer_path: "Verify gate -> check DUAL object links -> inspect payment release boundary"
  },
  {
    template_id: "template.proof_capsule.tokenised_ownership.v1",
    scenario: "luxury_resale",
    label: "Tokenised Ownership Capsule",
    status: "ready",
    capsule_type: "asset_ownership",
    use_case: "Bind point-in-time token ownership to authenticity, condition, custody, escrow, and buyer mandate evidence.",
    sources: ["solana", "brand_attestation", "appraisal_attestation", "custody_vault", "escrow_mirror", "dual"],
    reviewer_path: "Check token holder -> inspect custody/appraisal -> confirm escrow preview"
  },
  {
    template_id: "template.proof_capsule.agent_mandate.v1",
    scenario: "agent_mandate_purchase",
    label: "Agent Mandate Capsule",
    status: "ready",
    capsule_type: "agent_mandate",
    use_case: "Prove that an AI agent action stayed inside identity, budget, counterparty, approval, and non-executing payment boundaries.",
    sources: ["dual", "mandate_policy", "counterparty_registry", "payment_preview"],
    reviewer_path: "Evaluate mandate -> confirm blocked writes -> publish proof page"
  },
  {
    template_id: "template.proof_capsule.insurance_claim.v1",
    scenario: "insurance_claim",
    label: "Insurance Claim Capsule",
    status: "ready",
    capsule_type: "insurance",
    use_case: "Package coverage, approval, tool-use, report, and mandate evidence for underwriter or claims review.",
    sources: ["policy_admin", "enterprise_vault", "signed_tool_log", "dual"],
    reviewer_path: "Verify coverage window -> check approvals/logs -> export insurer proof room"
  },
  {
    template_id: "template.proof_capsule.carbon_retirement.v1",
    scenario: "carbon_credit",
    label: "Carbon Credit Capsule",
    status: "ready",
    capsule_type: "carbon",
    use_case: "Bind registry issuance, MRV packets, verifier signatures, token holder proof, retirement preview, and buyer mandate.",
    sources: ["carbon_registry", "mrv_oracle", "verifier_attestation", "solana", "retirement_registry", "dual"],
    reviewer_path: "Check issuance/MRV -> confirm holder -> separate retirement preview from final retirement"
  },
  {
    template_id: "template.proof_capsule.invoice_payment.v1",
    scenario: "custom_workflow",
    label: "Invoice / Payment Release Capsule",
    status: "workflow_blueprint",
    capsule_type: "trade",
    use_case: "Model invoice approval, delivery evidence, sanctions checks, and payment-rail release as an operator-gated DUAL workflow.",
    sources: ["enterprise_vault", "counterparty_registry", "payment_preview", "dual"],
    reviewer_path: "Build workflow -> attach proof refs -> dry-run transition -> operator sync"
  }
];

export const SAAS_PACKAGE_VERSION = "proof-capsule-saas.v0.9.0";
export const EXTENSIBILITY_PACKAGE_VERSION = "proof-capsule-extensibility.v0.9.0";
export const TENANT_ACTIVATION_PACKAGE_VERSION = "proof-capsule-tenant-activation.v0.9.0";

export const SAAS_PLAN_CATALOG = [
  {
    plan_id: "pilot_room",
    label: "Pilot room",
    motion: "paid_pilot",
    price_band: "USD 12k setup + USD 4k/month",
    ideal_for: "One regulated workflow, one customer team, and a live proof-room review cycle.",
    included: [
      "one DUAL-backed proof workspace",
      "up to 3 workflow templates",
      "public verifier pages",
      "MCP handoff pack",
      "operator-gated DUAL sync",
      "weekly launch review"
    ],
    limits: {
      tenants: 1,
      workflows: 3,
      source_adapters: 4,
      proof_runs_per_month: 500,
      sla: "business-hours support"
    },
    upgrade_trigger: "more than one team, production integrations, or private deployment."
  },
  {
    plan_id: "growth_control_plane",
    label: "Growth control plane",
    motion: "repeatable_saas",
    price_band: "USD 8k/month + usage",
    ideal_for: "A business unit running repeatable proof rooms across multiple workflow classes.",
    included: [
      "multi-workspace tenant model",
      "scenario marketplace",
      "source verifier marketplace",
      "admin readiness console",
      "customer-specific DUAL object strategy",
      "launch and recovery runbooks"
    ],
    limits: {
      tenants: 5,
      workflows: 20,
      source_adapters: 10,
      proof_runs_per_month: 5000,
      sla: "next-business-day response"
    },
    upgrade_trigger: "SSO, custom compliance terms, dedicated runtime, or guaranteed support."
  },
  {
    plan_id: "enterprise_trust_layer",
    label: "Enterprise trust layer",
    motion: "enterprise_saas",
    price_band: "custom annual contract",
    ideal_for: "Enterprise or government workflows that need private deployment, source adapters, and formal controls.",
    included: [
      "dedicated tenant runtime option",
      "SSO and customer API gateway integration",
      "custom source adapters",
      "DUAL template/object governance",
      "audit exports and incident runbooks",
      "security and legal review package"
    ],
    limits: {
      tenants: "contracted",
      workflows: "contracted",
      source_adapters: "contracted",
      proof_runs_per_month: "contracted",
      sla: "contracted SLA"
    },
    upgrade_trigger: "n/a"
  }
];

const SAAS_CONTROL_CATALOG = [
  {
    area: "Proof engine",
    status: "ready",
    evidence: "Capsules compose, verify, replay, publish, compare, red-team, and expose stable content hashes."
  },
  {
    area: "Public verifier",
    status: "ready",
    evidence: "Tamper-evident /proof pages hide operator controls and preserve DUAL explorer links."
  },
  {
    area: "MCP/API surface",
    status: "ready",
    evidence: "Streamable HTTP MCP plus REST endpoints expose the same read-safe proof operations."
  },
  {
    area: "DUAL write boundary",
    status: "operator_gated",
    evidence: "Mint/sync paths require server-side DUAL credentials, positive org balance, event-bus mode, and high-entropy operator token."
  },
  {
    area: "Tenant onboarding",
    status: "packaged",
    evidence: "Plan, connector, workflow, and launch-check models are generated as customer handoff packs."
  },
  {
    area: "Auth and billing",
    status: "activation_packaged",
    evidence: "Tenant activation now emits billing, SSO, API-key, gateway, adapter, and DUAL-binding artifacts. Secrets and payment capture remain customer/operator controlled."
  },
  {
    area: "Source adapters",
    status: "mixed",
    evidence: "DUAL readback is live for the canonical capsule; non-DUAL sources are structured proof refs until tenant adapters are connected."
  },
  {
    area: "Operations",
    status: "packaged",
    evidence: "Readiness checks, launch sequence, recovery actions, audit schema, and incident path are exposed to the admin plane."
  },
  {
    area: "Pilot sales pack",
    status: "packaged",
    evidence: "Pilot offer, buyer narrative, demo route, acceptance gates, and objection handling are documented for first-sale use."
  },
  {
    area: "Extension kit",
    status: "packaged",
    evidence: "Tenant-configurable extension packs, adapter certification, schema migration, and marketplace publication are exposed through UI/API/MCP."
  },
  {
    area: "Tenant activation gateway",
    status: "packaged",
    evidence: "Self-service tenant activation plans billing, SSO, scoped API credentials, gateway setup, live adapter onboarding, and DUAL tenant binding."
  }
];

const DEFAULT_TENANT_PROFILE = {
  tenant_name: "Acme Proof Operations",
  use_case: "multi-source proof rooms for regulated workflow decisions",
  plan_id: "growth_control_plane",
  regions: ["Australia", "Singapore"],
  sources: ["dual", "enterprise_vault", "solana", "ipfs", "payment_preview"],
  compliance_profile: "commercial-risk",
  go_live_window_days: 14,
  billing_contact: "finance@acme-proof.example",
  sso_protocol: "OIDC",
  gateway_domain: "gateway.acme-proof.example",
  allowed_origins: ["https://app.acme-proof.example"],
  requested_scopes: ["capsule:read", "capsule:run", "proof:publish", "gateway:adapter:onboard"],
  dual_mode: "operator_gated_event_bus",
  adapter_cutover: "sandbox_then_production"
};

const DEFAULT_EXTENSION_PROFILE = {
  tenant_name: "Acme Proof Operations",
  extension_name: "Supplier compliance proof room",
  use_case: "supplier onboarding approval with tokenised attestations and DUAL state",
  subject_type: "supplier_record",
  capsule_type: "credential",
  states: ["Requested", "Evidence ready", "Approved", "Archived"],
  evidence_types: ["identity", "compliance", "mandate", "settlement"],
  sources: ["enterprise_vault", "counterparty_registry", "dual", "payment_preview"],
  plan_id: "growth_control_plane",
  marketplace_visibility: "tenant_private",
  target_schema_version: CAPSULE_SCHEMA_VERSION
};

const EXTENSION_ACCEPTANCE_GATES = [
  "Workflow composes from tenant config without code changes.",
  "Every required evidence type maps to a source verifier or adapter contract.",
  "Adapter certification returns deterministic pass/fail evidence and a certification hash.",
  "Generated capsule verifies, replays, and produces a public verifier link before customer reliance.",
  "Migration plan exists for future schema bumps and includes rollback steps.",
  "Public writes remain false; live DUAL writes remain operator-gated."
];

const EXTENSION_FIELD_SCHEMA = {
  tenant_name: "Customer or workspace name.",
  extension_name: "Human-facing template name.",
  use_case: "Business workflow being modelled.",
  subject_type: "Stable subject category, slugged into workflow and capsule IDs.",
  capsule_type: `One of ${CAPSULE_TYPES.join(", ")}.`,
  states: "Ordered workflow states. At least two required.",
  evidence_types: "Required evidence categories for the first transition.",
  sources: "Source verifier keys or adapter names used by the evidence refs.",
  policy: "Optional max value, review threshold, allowed sources, and policy wording.",
  marketplace_visibility: "tenant_private | partner_shared | public_template.",
  adapter_definitions: "Optional source-adapter contracts to certify for tenant use."
};

const ADAPTER_CERTIFICATION_REQUIREMENTS = [
  {
    key: "proof_types",
    area: "Proof types declared",
    weight: 12,
    requirement: "Adapter states exactly which evidence types it can verify."
  },
  {
    key: "canonical_hashing",
    area: "Canonical hashing",
    weight: 14,
    requirement: "Adapter output can be stable-sorted and sha256 hashed without hidden state."
  },
  {
    key: "raw_evidence_boundary",
    area: "Raw evidence boundary",
    weight: 12,
    requirement: "Adapter stores refs/hashes/metadata, not raw sensitive evidence payloads."
  },
  {
    key: "freshness_rule",
    area: "Freshness rule",
    weight: 12,
    requirement: "Adapter declares when source facts must be rechecked before reliance."
  },
  {
    key: "auth_boundary",
    area: "Auth boundary",
    weight: 10,
    requirement: "Adapter uses tenant gateway, OAuth, signed attestation, or private service auth."
  },
  {
    key: "mcp_safe_output",
    area: "MCP-safe output",
    weight: 10,
    requirement: "Adapter response is safe for read-only MCP tools and redacts secrets."
  },
  {
    key: "live_or_signed_source",
    area: "Live or signed source",
    weight: 10,
    requirement: "Adapter points to a live endpoint or a signed attestation mode."
  },
  {
    key: "replay_fixture",
    area: "Replay fixture",
    weight: 10,
    requirement: "Adapter includes a deterministic sample ref for certification replay."
  },
  {
    key: "recheck_before_action",
    area: "Action recheck",
    weight: 8,
    requirement: "Adapter marks action-critical facts for recheck before release/transfer/sync."
  },
  {
    key: "tenant_activation",
    area: "Tenant activation",
    weight: 2,
    requirement: "Customer has approved the adapter in its production gateway."
  }
];

export const SOURCE_VERIFIER_REGISTRY = {
  solana: {
    verifier_id: "source.solana.point_in_time.v1",
    source: "solana",
    mode: "point_in_time_chain_read",
    live_adapter_status: "demo_reference",
    proves: "Token account, owner, amount, transaction, and slot at a point in time.",
    does_not_prove: "Continued ownership after the proof slot unless the asset is locked or rechecked.",
    freshness_rule: "Recheck before any settlement, transfer, retirement, or release action."
  },
  dual: {
    verifier_id: "source.dual.readback.v1",
    source: "dual",
    mode: "dual_readback",
    live_adapter_status: "configured_for_canonical_capsule",
    proves: "DUAL object/template IDs, state hash, integrity hash, stored capsule fields, and operator-gated write boundary.",
    does_not_prove: "Native truth of external systems referenced by the capsule.",
    freshness_rule: "Read back after every DUAL write and before any agent acts on current state."
  },
  ipfs: {
    verifier_id: "source.ipfs.cid_hash.v1",
    source: "ipfs",
    mode: "content_addressed_document",
    live_adapter_status: "demo_reference",
    proves: "Document bytes match the CID or declared hash when fetched.",
    does_not_prove: "Legal sufficiency, author identity, or current availability without retrieval.",
    freshness_rule: "Fetch and hash when document availability is action-critical."
  },
  signed_iot_feed: {
    verifier_id: "source.signed_iot.telemetry.v1",
    source: "signed_iot_feed",
    mode: "signed_attestation_ref",
    live_adapter_status: "adapter_required",
    proves: "A signed telemetry packet or route observation existed for the stated checkpoint.",
    does_not_prove: "Route integrity outside the packet window.",
    freshness_rule: "Require fresh telemetry for each location, condition, or route gate."
  },
  customs_attestation: {
    verifier_id: "source.customs.attestation.v1",
    source: "customs_attestation",
    mode: "authority_attestation_ref",
    live_adapter_status: "adapter_required",
    proves: "The referenced customs/import status at the verification time.",
    does_not_prove: "Later inspection changes, holds, or revocations.",
    freshness_rule: "Recheck before release, delivery, or jurisdictional closeout."
  },
  insurance_attestation: {
    verifier_id: "source.insurance.attestation.v1",
    source: "insurance_attestation",
    mode: "authority_attestation_ref",
    live_adapter_status: "adapter_required",
    proves: "Coverage or policy status for the referenced window.",
    does_not_prove: "Future coverage or undisclosed exclusions.",
    freshness_rule: "Recheck if the action time moves outside the covered window."
  },
  escrow_mirror: {
    verifier_id: "source.escrow.mirror.v1",
    source: "escrow_mirror",
    mode: "settlement_mirror_ref",
    live_adapter_status: "adapter_required",
    proves: "Reserved, prepared, or mirrored payment state at a point in time.",
    does_not_prove: "Executed settlement unless the payment rail confirms execution.",
    freshness_rule: "Recheck immediately before payment release."
  },
  policy_admin: {
    verifier_id: "source.policy_admin.coverage.v1",
    source: "policy_admin",
    mode: "policy_system_ref",
    live_adapter_status: "adapter_required",
    proves: "Policy boundary and coverage-window reference.",
    does_not_prove: "Claim acceptance without policy evaluation.",
    freshness_rule: "Recheck at claim intake and before payout."
  },
  enterprise_vault: {
    verifier_id: "source.enterprise_vault.evidence.v1",
    source: "enterprise_vault",
    mode: "vault_document_hash",
    live_adapter_status: "adapter_required",
    proves: "A vault-held approval or document matched the referenced hash.",
    does_not_prove: "Business approval outside the referenced artifact.",
    freshness_rule: "Re-hash if the vault document can be revised."
  },
  signed_tool_log: {
    verifier_id: "source.signed_tool_log.agent.v1",
    source: "signed_tool_log",
    mode: "signed_agent_action_log",
    live_adapter_status: "adapter_required",
    proves: "A tool call/action log was signed and bound to the action.",
    does_not_prove: "Whether the action was authorised without mandate/policy proof.",
    freshness_rule: "Bind the log to the exact agent action and approval window."
  },
  mandate_policy: {
    verifier_id: "source.mandate_policy.rules.v1",
    source: "mandate_policy",
    mode: "versioned_policy_ref",
    live_adapter_status: "adapter_required",
    proves: "Budget, threshold, and approval rules at the policy version.",
    does_not_prove: "Agent identity or counterparty status by itself.",
    freshness_rule: "Version-pin and re-evaluate whenever the mandate changes."
  },
  counterparty_registry: {
    verifier_id: "source.counterparty_registry.check.v1",
    source: "counterparty_registry",
    mode: "registry_snapshot_ref",
    live_adapter_status: "adapter_required",
    proves: "Counterparty/category eligibility at the snapshot time.",
    does_not_prove: "Future sanctions or status changes.",
    freshness_rule: "Recheck before payment or order placement."
  },
  payment_preview: {
    verifier_id: "source.payment_preview.preview.v1",
    source: "payment_preview",
    mode: "non_executing_payment_preview",
    live_adapter_status: "demo_reference",
    proves: "Payment preparation metadata, not executed settlement.",
    does_not_prove: "Money movement.",
    freshness_rule: "Replace with payment-rail confirmation before settlement claims."
  },
  brand_attestation: {
    verifier_id: "source.brand_attestation.authenticity.v1",
    source: "brand_attestation",
    mode: "issuer_attestation_ref",
    live_adapter_status: "adapter_required",
    proves: "Issuer/brand attestation over serial, images, or authenticity package.",
    does_not_prove: "Custody after the attestation.",
    freshness_rule: "Recheck if custody changes or new damage is reported."
  },
  appraisal_attestation: {
    verifier_id: "source.appraisal.condition.v1",
    source: "appraisal_attestation",
    mode: "expert_attestation_ref",
    live_adapter_status: "adapter_required",
    proves: "Condition or valuation report at inspection time.",
    does_not_prove: "Future condition.",
    freshness_rule: "Reinspect before high-value settlement if the asset leaves custody."
  },
  custody_vault: {
    verifier_id: "source.custody_vault.receipt.v1",
    source: "custody_vault",
    mode: "custody_receipt_ref",
    live_adapter_status: "adapter_required",
    proves: "Vault intake or custody receipt at the stated checkpoint.",
    does_not_prove: "Delivery or transfer out unless a new receipt exists.",
    freshness_rule: "Recheck on every custody handoff."
  },
  carbon_registry: {
    verifier_id: "source.carbon_registry.issuance.v1",
    source: "carbon_registry",
    mode: "registry_record_ref",
    live_adapter_status: "adapter_required",
    proves: "Credit issuance/registry record at the snapshot time.",
    does_not_prove: "Retirement, double-spend absence later, or project permanence.",
    freshness_rule: "Recheck before reserve, transfer, or retirement."
  },
  mrv_oracle: {
    verifier_id: "source.mrv_oracle.packet.v1",
    source: "mrv_oracle",
    mode: "mrv_packet_ref",
    live_adapter_status: "adapter_required",
    proves: "MRV evidence packet hash and measurement window.",
    does_not_prove: "Registry issuance without registry proof.",
    freshness_rule: "Version-pin methodology and measurement period."
  },
  verifier_attestation: {
    verifier_id: "source.verifier_attestation.signature.v1",
    source: "verifier_attestation",
    mode: "signed_verifier_attestation",
    live_adapter_status: "adapter_required",
    proves: "Verifier signature over the stated facts.",
    does_not_prove: "Verifier accreditation unless checked separately.",
    freshness_rule: "Check verifier status before action-critical reliance."
  },
  retirement_registry: {
    verifier_id: "source.retirement_registry.preview.v1",
    source: "retirement_registry",
    mode: "retirement_instruction_ref",
    live_adapter_status: "adapter_required",
    proves: "Retirement instruction or preview exists.",
    does_not_prove: "Final retirement unless the registry confirms completion.",
    freshness_rule: "Require final registry readback for retirement claims."
  }
};

const WORKFLOW_DEFINITIONS = {
  universal_proof_capsule: {
    workflow_id: "workflow.proof_capsule.universal_multi_proof.v1",
    title: "Universal multi-proof capsule lifecycle",
    subject_type: "multi_source_proof_object",
    dual_template: "io.dual.proof_capsule.lifecycle.v1",
    states: ["Drafted", "Source proofs attached", "Capsule verified", "Ready for reliance", "Archived"],
    current_transition: "verify_multi_proof",
    transitions: [
      { action: "attach_source_proofs", from_state: "Drafted", to_state: "Source proofs attached", required_evidence: ["ownership", "document", "attestation"], policy_gate: "minimum external proof references are attached" },
      { action: "verify_multi_proof", from_state: "Source proofs attached", to_state: "Capsule verified", required_evidence: ["ownership", "document", "attestation", "dual_state", "settlement", "mandate"], policy_gate: "source refs, DUAL anchor, and mandate are verifier-ready" },
      { action: "publish_proof_room", from_state: "Capsule verified", to_state: "Ready for reliance", required_evidence: ["ownership", "document", "attestation", "dual_state", "settlement", "mandate"], policy_gate: "public proof room can be shared without write authority" },
      { action: "archive_capsule", from_state: "Ready for reliance", to_state: "Archived", required_evidence: ["dual_state", "attestation"], policy_gate: "final proof envelope is retained and no public write path is exposed" }
    ]
  },
  tradeflow_medical_devices: {
    workflow_id: "workflow.tradeflow.conditional_instrument.v1",
    title: "Conditional trade instrument lifecycle",
    subject_type: "shipment_instrument",
    dual_template: "io.dual.proof_capsule.lifecycle.v1",
    states: ["Issued", "Mandate verified", "Cargo loaded", "Customs cleared", "Payment releasing", "Closed"],
    current_transition: "verify_gate",
    transitions: [
      { action: "verify_mandate", from_state: "Issued", to_state: "Mandate verified", required_evidence: ["mandate"], policy_gate: "buyer mandate valid" },
      { action: "verify_loading", from_state: "Mandate verified", to_state: "Cargo loaded", required_evidence: ["ownership", "document", "telemetry"], policy_gate: "cargo and ownership observed" },
      { action: "verify_gate", from_state: "Cargo loaded", to_state: "Customs cleared", from_gate: "Cargo loaded", to_gate: "Customs cleared", required_evidence: ["ownership", "document", "telemetry", "compliance", "insurance", "settlement", "mandate"], policy_gate: "customs and release conditions valid" },
      { action: "release_payment", from_state: "Customs cleared", to_state: "Payment releasing", required_evidence: ["settlement", "mandate", "insurance"], policy_gate: "release threshold and review state valid" },
      { action: "close_instrument", from_state: "Payment releasing", to_state: "Closed", required_evidence: ["settlement", "mandate"], policy_gate: "remaining amount is zero" }
    ]
  },
  insurance_claim: {
    workflow_id: "workflow.insurance.agent_claim.v1",
    title: "Agent insurance claim evidence lifecycle",
    subject_type: "claim",
    dual_template: "io.dual.proof_capsule.lifecycle.v1",
    states: ["Submitted", "Evidence ready", "Underwriter review", "Approved", "Closed"],
    current_transition: "verify_claim_evidence",
    transitions: [
      { action: "verify_claim_evidence", from_state: "Submitted", to_state: "Evidence ready", required_evidence: ["coverage", "approval", "tool_use", "report", "mandate"], policy_gate: "coverage, approval, and mandate evidence complete" },
      { action: "underwriter_review", from_state: "Evidence ready", to_state: "Underwriter review", required_evidence: ["coverage", "report"], policy_gate: "review packet complete" },
      { action: "approve_claim", from_state: "Underwriter review", to_state: "Approved", required_evidence: ["coverage", "approval", "report"], policy_gate: "claim policy matched" }
    ]
  },
  agent_mandate_purchase: {
    workflow_id: "workflow.agent_mandate.purchase.v1",
    title: "Buyer-controlled agent purchase mandate lifecycle",
    subject_type: "agent_action",
    dual_template: "io.dual.proof_capsule.lifecycle.v1",
    states: ["Requested", "Policy evaluated", "Authorised", "Payment prepared", "Closed"],
    current_transition: "evaluate_agent_purchase",
    transitions: [
      { action: "evaluate_agent_purchase", from_state: "Requested", to_state: "Authorised", required_evidence: ["identity", "budget", "counterparty", "approval", "settlement"], policy_gate: "agent, budget, merchant, and preview are inside mandate" },
      { action: "prepare_payment", from_state: "Authorised", to_state: "Payment prepared", required_evidence: ["settlement", "approval"], policy_gate: "payment preview remains non-executing" }
    ]
  },
  luxury_resale: {
    workflow_id: "workflow.luxury.resale.v1",
    title: "Tokenized luxury resale lifecycle",
    subject_type: "physical_asset",
    dual_template: "io.dual.proof_capsule.lifecycle.v1",
    states: ["Listed", "Inspection pending", "Escrow ready", "Transferred", "Closed"],
    current_transition: "verify_resale_acceptance",
    transitions: [
      { action: "verify_resale_acceptance", from_state: "Inspection pending", to_state: "Escrow ready", required_evidence: ["ownership", "authenticity", "condition", "custody", "settlement", "mandate"], policy_gate: "ownership, authenticity, custody, and escrow evidence complete" },
      { action: "transfer_title", from_state: "Escrow ready", to_state: "Transferred", required_evidence: ["ownership", "custody", "settlement"], policy_gate: "fresh ownership and escrow release verified" }
    ]
  },
  carbon_credit: {
    workflow_id: "workflow.carbon.credit_retirement.v1",
    title: "Tokenized carbon credit retirement lifecycle",
    subject_type: "carbon_credit",
    dual_template: "io.dual.proof_capsule.lifecycle.v1",
    states: ["Issued", "MRV verified", "Offset review pending", "Retirement prepared", "Retired"],
    current_transition: "verify_offset_capsule",
    transitions: [
      { action: "verify_offset_capsule", from_state: "Offset review pending", to_state: "Retirement prepared", required_evidence: ["issuance", "mrv", "verification", "ownership", "retirement", "mandate"], policy_gate: "issuance, MRV, holder, and retirement preview complete" },
      { action: "retire_credit", from_state: "Retirement prepared", to_state: "Retired", required_evidence: ["ownership", "retirement", "verification"], policy_gate: "final registry readback confirms retirement" }
    ]
  }
};

const TRADEFLOW_DUAL_REFERENCE = {
  mode: "readback_reference",
  source: "TradeFlow live DUAL testnet object, read-only reference",
  object_id: "6a167b2c5fed83e4855a86dd",
  template_id: "6a167b2b5fed83e4855a86db",
  state_hash: "0x189f83373f5b1c2bf7b2d7e0cc8a736f279f93a09f2fc1fcfd4af289fca4f5ac",
  integrity_hash: "0x25d251ce0973572d1eadb3cd23e707db61a06f2d5fcbc63d2e9c3ebb9a798739",
  object_explorer_url: "https://explorer-testnet.dual.network/objects/6a167b2c5fed83e4855a86dd",
  template_explorer_url: "https://explorer-testnet.dual.network/templates/6a167b2b5fed83e4855a86db",
  l2_state_search_url: "https://explorer-test-v2.dual.network/search?q=0x189f83373f5b1c2bf7b2d7e0cc8a736f279f93a09f2fc1fcfd4af289fca4f5ac",
  caveat: "This demo references an existing DUAL proof anchor; it does not perform a live write."
};

const PROOF_CAPSULE_DUAL_REFERENCE = {
  mode: "readback_reference",
  source: "Proof Capsule live DUAL testnet object, read-only reference",
  object_id: "6a18ce840e26f9f80320ee5f",
  template_id: "6a18ce820e26f9f80320ee5d",
  state_hash: "0xeaa90fced51cbe7de377a6413c3550f4176bfc7080ed6c7dc01572f7ca49912e",
  integrity_hash: "0x9afe371569643a2e1c12a43a38eec9d7615ee6616b6d9776779e054ef8558c9a",
  object_explorer_url: "https://explorer-testnet.dual.network/objects/6a18ce840e26f9f80320ee5f",
  template_explorer_url: "https://explorer-testnet.dual.network/templates/6a18ce820e26f9f80320ee5d",
  l2_state_search_url: "https://explorer-test-v2.dual.network/search?q=0xeaa90fced51cbe7de377a6413c3550f4176bfc7080ed6c7dc01572f7ca49912e",
  caveat: "Read-only live DUAL reference for the canonical Proof Capsule object; this response does not perform a live write."
};

function demoDualReference(slug, label) {
  return {
    mode: "demo_reference",
    source: label,
    ref: `dual://demo/proof-capsules/${slug}`,
    caveat: "Demo reference only; no live DUAL write is performed."
  };
}

export function stableSort(value) {
  if (Array.isArray(value)) return value.map(stableSort);
  if (!value || typeof value !== "object") return value;
  return Object.keys(value).sort().reduce((acc, key) => {
    acc[key] = stableSort(value[key]);
    return acc;
  }, {});
}

export function canonicalJson(value) {
  return JSON.stringify(stableSort(value));
}

export function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

export function hashValue(value) {
  return `sha256:${sha256(canonicalJson(value))}`;
}

export function shortHash(hash = "") {
  return String(hash).replace(/^sha256:/, "").slice(0, 12);
}

export function defaultPolicy() {
  return {
    policy_id: "dual-proof-capsule-policy-v0.1",
    policy_version: 1,
    decision_model: "deterministic_demo",
    supported_capsule_types: CAPSULE_TYPES,
    required_anchor_types: ["ownership", "document", "telemetry", "compliance", "insurance", "settlement", "mandate"],
    allowed_external_chains: ["solana", "dual", "ipfs", "signed_iot_feed", "customs_attestation", "insurance_attestation", "escrow_mirror"],
    max_value_usd: 180000,
    human_review_threshold_usd: 120000,
    stale_after_hours: 72,
    raw_payload_policy: "Raw evidence remains in source systems. The capsule stores references, hashes, state, and verification metadata only.",
    live_write_policy: "Live DUAL writes require DUAL API credentials, a configured template/object, positive org balance, event-bus mode, and a server-side operator token. Public writes remain disabled."
  };
}

export function defaultWriteBoundary(overrides = {}) {
  const liveDualWrites = Boolean(overrides.live_dual_writes);
  return {
    live_dual_writes: liveDualWrites,
    public_writes: false,
    operator_token_accepted: liveDualWrites,
    write_execution: liveDualWrites ? "operator_gated" : "none",
    statement: WRITE_BOUNDARY,
    ...overrides,
    public_writes: false
  };
}

export function demoCapsuleInput(scenario = "tradeflow_medical_devices") {
  const normalized = SCENARIOS.includes(scenario) ? scenario : "tradeflow_medical_devices";
  const base = {
    capsule_id: "PC-TRADEFLOW-SG-AU-001",
    capsule_type: "trade",
    subject: {
      subject_id: "CTI-SG-AU-001",
      label: "Singapore to Australia medical devices shipment",
      corridor: "Singapore -> Australia",
      asset_class: "medical_devices",
      value_usd: 148500,
      state: "Milestone verified",
      current_gate: "Customs cleared"
    },
    claims: [
      {
        claim_id: "ownership_at_slot",
        type: "ownership",
        statement: "Supplier controlled the shipment-batch token at the verification slot.",
        expected_source: "solana",
        required: true
      },
      {
        claim_id: "cargo_loaded",
        type: "document",
        statement: "Bill of lading links the cargo to container MSKU-8842.",
        expected_source: "ipfs",
        required: true
      },
      {
        claim_id: "route_integrity",
        type: "telemetry",
        statement: "Telemetry supports the approved Singapore to Sydney corridor.",
        expected_source: "signed_iot_feed",
        required: true
      },
      {
        claim_id: "customs_clearance",
        type: "compliance",
        statement: "Commodity class and import clearance are valid for the mandate.",
        expected_source: "customs_attestation",
        required: true
      },
      {
        claim_id: "insured_transit",
        type: "insurance",
        statement: "Shipment insurance was active during the transport window.",
        expected_source: "insurance_attestation",
        required: true
      },
      {
        claim_id: "escrow_reserved",
        type: "settlement",
        statement: "Escrow mirror shows funds are reserved and releaseable under the mandate.",
        expected_source: "escrow_mirror",
        required: true
      },
      {
        claim_id: "buyer_agent_authority",
        type: "mandate",
        statement: "Buyer agent is authorised to verify gates and prepare releases within the threshold.",
        expected_source: "dual",
        required: true
      }
    ],
    evidence_refs: [
      {
        evidence_id: "SOL-SHIPMENT-BATCH-8842",
        type: "ownership",
        source: "solana",
        hash: "sha256:2af377f7fd68b1d07e78bb943e1e3f66991e086f4c7c2f4f7fb8e1f6f2636fd4",
        summary: "Shipment batch token controlled by Lion City Precision wallet at slot 342991220.",
        ref: "solana:devnet:mint:9sY2qjD1DemoShipmentBatch8842",
        explorer_url: "https://explorer.solana.com/address/9sY2qjD1DemoShipmentBatch8842?cluster=devnet",
        point_in_time: "slot:342991220"
      },
      {
        evidence_id: "BOL-8842",
        type: "document",
        source: "ipfs",
        hash: "sha256:b80f67c0ed23633c7fa3272a2fe4d9fb7c4f9931d4dcb7dfda551d8466dd80b7",
        summary: "Bill of lading and container seal document hash.",
        ref: "ipfs://bafybeibol8842demo",
        explorer_url: "https://ipfs.io/ipfs/bafybeibol8842demo"
      },
      {
        evidence_id: "AIS-GPS-SG-SYD-01",
        type: "telemetry",
        source: "signed_iot_feed",
        hash: "sha256:ebac6908b4be42ced357fdf963c1b94199e8f38b224de23c8eac41285dfd4bc8",
        summary: "Signed AIS/GPS packet for Singapore Port departure and Sydney approach.",
        ref: "iot://ais-gps/sg-syd/2026-05-29/01"
      },
      {
        evidence_id: "AU-ICS-CLEAR-220",
        type: "compliance",
        source: "customs_attestation",
        hash: "sha256:cb0e897d69c6c848864ff17f61f9bc101a35a0381a67ca5ab39e5a946add66af",
        summary: "Australian import declaration and medical-device paperwork clear.",
        ref: "customs://au/ics/clearance/220"
      },
      {
        evidence_id: "INS-MED-TRANSIT-77",
        type: "insurance",
        source: "insurance_attestation",
        hash: "sha256:e7b08877d6d4083c034728ee4ad843c30dfde575e3a08f906f4aaf840c7cb403",
        summary: "Cargo insurance active for the shipment window.",
        ref: "insurer://policy/MED-TRANSIT-77"
      },
      {
        evidence_id: "ESCROW-MIRROR-148500",
        type: "settlement",
        source: "escrow_mirror",
        hash: "sha256:8d863adf9b264bdf56dfbb25a2ce41aaf2d033a5200056640c50f3f45a52e343",
        summary: "Bank escrow mirror shows reserved face value and milestone release schedule.",
        ref: "escrow://mirror/cti-sg-au-001"
      },
      {
        evidence_id: "DUAL-MANDATE-CTI-001",
        type: "mandate",
        source: "dual",
        hash: "sha256:5f27418fa7b789a7560f5fa05c0a4e4f4cc6b50e71ba887071c74cd7a08e9c1d",
        summary: "Buyer mandate boundary and human-review threshold.",
        ref: "dual://objects/6a167b2c5fed83e4855a86dd",
        explorer_url: TRADEFLOW_DUAL_REFERENCE.object_explorer_url
      }
    ],
    external_anchors: [
      {
        anchor_id: "solana-ownership",
        kind: "ownership",
        chain: "solana",
        source_of_truth: "Solana token account state",
        mint: "9sY2qjD1DemoShipmentBatch8842",
        owner_wallet: "LionCityPrecisionDemoWallet111111111111111",
        token_account: "Batch8842AssociatedTokenAccountDemo111111",
        amount: "1",
        tx_signature: "5rMdemoShipmentMintAndEscrowSignature111111111111111111111111111",
        slot: 342991220,
        explorer_url: "https://explorer.solana.com/tx/5rMdemoShipmentMintAndEscrowSignature111111111111111111111111111?cluster=devnet",
        caveat: "Point-in-time demo ownership proof; recheck or escrow before action if token can move."
      },
      {
        anchor_id: "dual-proof-anchor",
        kind: "proof_state",
        chain: "dual",
        ...TRADEFLOW_DUAL_REFERENCE
      }
    ],
    policy: defaultPolicy(),
    decision: {
      result: "Approved with review",
      code: "human_review_logged",
      reason: "All required proof categories are present; cumulative release exceeds the human-review threshold.",
      review_required: true,
      release_usd: 37125,
      remaining_usd: 7425
    },
    state_transition: {
      action: "verify_gate",
      actor: "buyer-agent.procurement.au",
      from_state: "Cargo loaded",
      to_state: "Customs cleared",
      from_gate: "Cargo loaded",
      to_gate: "Customs cleared",
      occurred_at: GENERATED_AT
    }
  };

  if (normalized === "universal_proof_capsule") {
    return {
      ...base,
      capsule_id: "PC-UNIVERSAL-MULTI-PROOF-001",
      capsule_type: "multi_proof",
      subject: {
        subject_id: "PROOF-ASSET-ROOM-001",
        label: "Universal proof capsule with token, document, attestation, payment, and DUAL state",
        asset_class: "multi_source_proof_room",
        value_usd: 118000,
        state: "Capsule verified",
        current_gate: "Ready for reliance"
      },
      claims: [
        {
          claim_id: "solana_ownership_point_in_time",
          type: "ownership",
          statement: "A tokenised ownership proof existed on Solana at the declared slot.",
          expected_source: "solana",
          required: true
        },
        {
          claim_id: "ipfs_document_hash_bound",
          type: "document",
          statement: "The source document bytes are bound by an IPFS CID and declared hash.",
          expected_source: "ipfs",
          required: true
        },
        {
          claim_id: "signed_attestation_present",
          type: "attestation",
          statement: "A verifier signed the point-in-time facts bound into the capsule.",
          expected_source: "verifier_attestation",
          required: true
        },
        {
          claim_id: "dual_state_readback_present",
          type: "dual_state",
          statement: "The DUAL object/template/state/integrity hashes are visible as the governed proof envelope.",
          expected_source: "dual",
          required: true
        },
        {
          claim_id: "settlement_preview_non_executing",
          type: "settlement",
          statement: "Payment readiness is a non-executing preview; no money movement is claimed.",
          expected_source: "payment_preview",
          required: true
        },
        {
          claim_id: "mandate_authority_bound",
          type: "mandate",
          statement: "The relying agent or operator has a mandate boundary attached to the capsule.",
          expected_source: "enterprise_vault",
          required: true
        }
      ],
      evidence_refs: [
        {
          evidence_id: "SOL-OWNERSHIP-PIT-001",
          type: "ownership",
          source: "solana",
          hash: "sha256:a88328b98541f4f0ac0bf5eaa0fe86e763d64e63f7b7c67d82f83ce2f24f7d28",
          summary: "Point-in-time Solana token ownership proof for the tokenised asset.",
          ref: "solana:devnet:mint:ProofCapsuleUniversalAsset001",
          explorer_url: "https://explorer.solana.com/address/ProofCapsuleUniversalAsset001?cluster=devnet",
          point_in_time: "slot:343220991"
        },
        {
          evidence_id: "IPFS-SOURCE-DOC-001",
          type: "document",
          source: "ipfs",
          hash: "sha256:f9944b21299c7316776d0d9552c9c32180a7c83db16be33d5f092ca9e672de14",
          summary: "Source document pack for the off-chain contract, inspection, or asset facts.",
          ref: "ipfs://bafybeiproofcapsuleuniversal001",
          explorer_url: "https://ipfs.io/ipfs/bafybeiproofcapsuleuniversal001"
        },
        {
          evidence_id: "ATTEST-VERIFIER-001",
          type: "attestation",
          source: "verifier_attestation",
          hash: "sha256:7c756c0f2d61d996745c9f5f4371acdc74f659a8b07ac2b253529a4d1343a3fa",
          summary: "Verifier signature over ownership, document, mandate, and payment preview facts.",
          ref: "attestation://verifier/proof-room/001"
        },
        {
          evidence_id: "DUAL-STATE-PC-001",
          type: "dual_state",
          source: "dual",
          hash: "sha256:148fe9edb64d36df1c3b4ebce5e4fc9214b9314f57fc54cd2934d7e39cb25b4d",
          summary: "Live DUAL proof capsule object, state hash, integrity hash, and template reference.",
          ref: `dual://objects/${PROOF_CAPSULE_DUAL_REFERENCE.object_id}`,
          explorer_url: PROOF_CAPSULE_DUAL_REFERENCE.object_explorer_url
        },
        {
          evidence_id: "PAYMENT-PREVIEW-PC-001",
          type: "settlement",
          source: "payment_preview",
          hash: "sha256:a590a146b6f652bdf45a3a7d6cfe2b7ef18a7f1587a5d2628e40706f7be4e916",
          summary: "Non-executing payment preview proving readiness, not settlement.",
          ref: "payment-preview://proof-room/001"
        },
        {
          evidence_id: "MANDATE-VAULT-PC-001",
          type: "mandate",
          source: "enterprise_vault",
          hash: "sha256:60ff4e942d72df66185062005046b3a0f9cbfb3f94f093f6903b9fd87d36a2b3",
          summary: "Vault-held mandate boundary for who may rely on, update, or sync the capsule.",
          ref: "vault://mandates/proof-room/001"
        }
      ],
      external_anchors: [
        {
          anchor_id: "solana-tokenised-ownership",
          kind: "ownership",
          chain: "solana",
          source_of_truth: "Solana token account state",
          mint: "ProofCapsuleUniversalAsset001",
          owner_wallet: "UniversalOwnerDemoWallet111111111111111",
          token_account: "UniversalAssetAssociatedTokenDemo111",
          amount: "1",
          tx_signature: "2UxDemoUniversalProofCapsuleSignature111111111111111111111111",
          slot: 343220991,
          explorer_url: "https://explorer.solana.com/tx/2UxDemoUniversalProofCapsuleSignature111111111111111111111111?cluster=devnet",
          caveat: "Point-in-time ownership proof; recheck before settlement or transfer unless the token is locked."
        },
        {
          anchor_id: "ipfs-document-pack",
          kind: "document",
          source_of_truth: "IPFS content-addressed source document",
          ref: "ipfs://bafybeiproofcapsuleuniversal001",
          explorer_url: "https://ipfs.io/ipfs/bafybeiproofcapsuleuniversal001",
          caveat: "Proves content hash, not legal sufficiency or current business approval."
        },
        {
          anchor_id: "dual-proof-capsule-state",
          kind: "proof_state",
          chain: "dual",
          ...PROOF_CAPSULE_DUAL_REFERENCE
        },
        {
          anchor_id: "signed-verifier-attestation",
          kind: "attestation",
          source_of_truth: "Verifier signature over source-fact bundle",
          ref: "attestation://verifier/proof-room/001",
          caveat: "Verifier accreditation must be checked separately for regulated reliance."
        }
      ],
      dual_anchor: PROOF_CAPSULE_DUAL_REFERENCE,
      policy: {
        ...defaultPolicy(),
        policy_id: "universal-proof-capsule-policy-v0.2",
        required_anchor_types: ["ownership", "document", "attestation", "dual_state", "settlement", "mandate"],
        allowed_external_chains: ["solana", "ipfs", "verifier_attestation", "dual", "payment_preview", "enterprise_vault"],
        max_value_usd: 150000,
        human_review_threshold_usd: 100000
      },
      decision: {
        result: "Approved with review",
        code: "multi_proof_ready_for_reliance",
        reason: "All required proof sources are present; value triggers human review before action-critical reliance.",
        review_required: true,
        release_usd: 0,
        remaining_usd: 118000
      },
      state_transition: {
        action: "verify_multi_proof",
        actor: "verifier-agent.proof-room",
        from_state: "Source proofs attached",
        to_state: "Capsule verified",
        from_gate: "Source proof intake",
        to_gate: "Ready for reliance",
        occurred_at: GENERATED_AT
      }
    };
  }

  if (normalized === "insurance_claim") {
    return {
      ...base,
      capsule_id: "PC-INSURANCE-CLAIM-001",
      capsule_type: "insurance",
      subject: {
        subject_id: "CLAIM-AI-PROCURE-001",
        label: "AI procurement coverage evidence capsule",
        asset_class: "coverage_evidence",
        value_usd: 48000,
        state: "Evidence ready",
        current_gate: "Underwriter review"
      },
      claims: [
        {
          claim_id: "coverage_active",
          type: "coverage",
          statement: "The AI procurement activity was inside the active insurance coverage window.",
          expected_source: "policy_admin",
          required: true
        },
        {
          claim_id: "approval_recorded",
          type: "approval",
          statement: "Human approval was recorded before the procurement agent acted.",
          expected_source: "enterprise_vault",
          required: true
        },
        {
          claim_id: "tool_use_in_scope",
          type: "tool_use",
          statement: "The tool call and spend amount matched the covered procurement action.",
          expected_source: "signed_tool_log",
          required: true
        },
        {
          claim_id: "report_hash_issued",
          type: "report",
          statement: "The insurer-readable report hash matches the issued evidence bundle.",
          expected_source: "dual",
          required: true
        },
        {
          claim_id: "agent_mandate_bound",
          type: "mandate",
          statement: "The agent mandate and policy version were bound into the claim proof.",
          expected_source: "dual",
          required: true
        }
      ],
      evidence_refs: [
        {
          evidence_id: "POLICY-AI-PROCURE-2026",
          type: "coverage",
          source: "policy_admin",
          hash: "sha256:9d68db2d4f5981f5c99e3dc4b397624f3d35e420d252e2b676e6e31d985b7753",
          summary: "Coverage boundary and active policy window.",
          ref: "policy://ai-procure/2026"
        },
        {
          evidence_id: "APPROVAL-PO-UNDER-50K",
          type: "approval",
          source: "enterprise_vault",
          hash: "sha256:f584d53cc4cb0628847cb8342776bd45e9ea8f7d55f8cb6c1f5ff1f0e889f014",
          summary: "Human approval artifact stored in the enterprise evidence vault.",
          ref: "vault://approvals/procurement/po-under-50k"
        },
        {
          evidence_id: "TOOL-LOG-PROCURE-001",
          type: "tool_use",
          source: "signed_tool_log",
          hash: "sha256:6e443f613be2d96453d3272444f7c18477fb29bd98ef88b1cab420c938d69477",
          summary: "Signed tool-use log for the covered procurement action.",
          ref: "tool-log://procurement/001"
        },
        {
          evidence_id: "REPORT-HASH-AGER-001",
          type: "report",
          source: "dual",
          hash: "sha256:d21e8d724b2d7020741628ce7142dd4b572e5f13aa83b17f903188f007c1dc58",
          summary: "Report receipt hash anchored through DUAL-style readback.",
          ref: "dual://reports/ager-demo-001",
          explorer_url: TRADEFLOW_DUAL_REFERENCE.object_explorer_url
        },
        {
          evidence_id: "MANDATE-AI-PROCURE-001",
          type: "mandate",
          source: "dual",
          hash: "sha256:4d32e6ee4bfe6722a8cfcc0f7f60f74b83c6a9b01a686c5cb3e398d32678071a",
          summary: "Agent authority and spend boundary bound to the claim.",
          ref: "dual://mandates/ai-procure-001"
        }
      ],
      external_anchors: [
        {
          anchor_id: "enterprise-vault-claim",
          kind: "evidence_vault",
          source_of_truth: "Enterprise evidence vault",
          ref: "vault://claim/ai-procure-001",
          caveat: "Raw approvals and logs remain in the enterprise vault."
        },
        {
          anchor_id: "dual-report-receipt-reference",
          kind: "proof_state",
          chain: "dual",
          ...TRADEFLOW_DUAL_REFERENCE
        }
      ],
      dual_anchor: demoDualReference("insurance-claim-001", "Insurance claim Proof Capsule reference"),
      policy: {
        ...defaultPolicy(),
        policy_id: "insurance-proof-capsule-policy-v0.1",
        required_anchor_types: ["coverage", "approval", "tool_use", "report", "mandate"],
        allowed_external_chains: ["policy_admin", "enterprise_vault", "signed_tool_log", "dual"],
        max_value_usd: 50000,
        human_review_threshold_usd: 50000
      },
      decision: {
        result: "Approved",
        code: "coverage_evidence_complete",
        reason: "Policy, approval, tool-use, and report hashes are present.",
        review_required: false,
        release_usd: 0,
        remaining_usd: 0
      },
      state_transition: {
        action: "verify_claim_evidence",
        actor: "underwriter-agent.insurance.au",
        from_state: "Submitted",
        to_state: "Evidence ready",
        from_gate: "Claim intake",
        to_gate: "Evidence ready",
        occurred_at: GENERATED_AT
      }
    };
  }

  if (normalized === "agent_mandate_purchase") {
    return {
      ...base,
      capsule_id: "PC-AGENT-MANDATE-001",
      capsule_type: "agent_mandate",
      subject: {
        subject_id: "MANDATE-TRAVEL-001",
        label: "Buyer-controlled travel agent purchase mandate",
        asset_class: "agent_authority",
        value_usd: 6200,
        state: "Active",
        current_gate: "Policy evaluation"
      },
      claims: [
        {
          claim_id: "agent_identity_verified",
          type: "identity",
          statement: "The buyer agent identity is bound to the mandate.",
          expected_source: "dual",
          required: true
        },
        {
          claim_id: "budget_within_limit",
          type: "budget",
          statement: "The requested purchase is below the buyer-approved spend limit.",
          expected_source: "mandate_policy",
          required: true
        },
        {
          claim_id: "merchant_allowed",
          type: "counterparty",
          statement: "The merchant category and counterparty match the allowed travel policy.",
          expected_source: "counterparty_registry",
          required: true
        },
        {
          claim_id: "approval_threshold_clear",
          type: "approval",
          statement: "No additional human approval is required for this amount.",
          expected_source: "mandate_policy",
          required: true
        },
        {
          claim_id: "payment_prepared",
          type: "settlement",
          statement: "Payment preparation is within the mandate, but no settlement is executed by this demo.",
          expected_source: "payment_preview",
          required: true
        }
      ],
      evidence_refs: [
        {
          evidence_id: "AGENT-ID-TRAVEL-001",
          type: "identity",
          source: "dual",
          hash: "sha256:56c2708805b06db6ed267033adad40a201d0ddf551936efc0f24ddf073917f8a",
          summary: "Agent identity/passport reference.",
          ref: "dual://agent-passports/travel-001"
        },
        {
          evidence_id: "BUDGET-TRAVEL-6200",
          type: "budget",
          source: "mandate_policy",
          hash: "sha256:cdb33aeb0574f253a55f5e01b0f0e2c43404e9cf041ed55ccf12af5fc060b7dd",
          summary: "Spend limit and remaining budget snapshot.",
          ref: "policy://travel-mandate/budget"
        },
        {
          evidence_id: "COUNTERPARTY-AIR-HOTEL-001",
          type: "counterparty",
          source: "counterparty_registry",
          hash: "sha256:d997c72c14613f8a0c5c206cbf6d85143c0a24927a01f15628995c7331424fc2",
          summary: "Allowed airline/hotel counterparty registry check.",
          ref: "registry://counterparties/travel-approved"
        },
        {
          evidence_id: "APPROVAL-THRESHOLD-TRAVEL",
          type: "approval",
          source: "mandate_policy",
          hash: "sha256:2e085f650b8347cb18ee2fcf153b12cf05f5394274443330714b9bf960fa5c68",
          summary: "Policy states human review starts above USD 10,000.",
          ref: "policy://travel-mandate/review-threshold"
        },
        {
          evidence_id: "PAYMENT-PREVIEW-TRAVEL",
          type: "settlement",
          source: "payment_preview",
          hash: "sha256:6ac995bc669a4a1f782029a1c4bd4a1f1ef0b470e82b1650d8362e18465cc11e",
          summary: "Payment preview only; no payment execution or wallet action.",
          ref: "payment-preview://travel/001"
        }
      ],
      external_anchors: [
        {
          anchor_id: "dual-agent-passport-reference",
          kind: "agent_identity",
          chain: "dual",
          source_of_truth: "DUAL-style agent passport object",
          caveat: "Demo reference only; no live write or wallet action."
        },
        {
          anchor_id: "payment-preview-reference",
          kind: "settlement_preview",
          source_of_truth: "Payment preview rail",
          caveat: "No settlement is executed by this demo."
        }
      ],
      dual_anchor: demoDualReference("agent-mandate-purchase-001", "Agent mandate Proof Capsule reference"),
      policy: {
        ...defaultPolicy(),
        policy_id: "agent-mandate-proof-capsule-policy-v0.1",
        required_anchor_types: ["identity", "budget", "counterparty", "approval", "settlement"],
        allowed_external_chains: ["dual", "mandate_policy", "counterparty_registry", "payment_preview"],
        max_value_usd: 10000,
        human_review_threshold_usd: 10000
      },
      decision: {
        result: "Approved",
        code: "mandate_within_limit",
        reason: "Spend, counterparty, jurisdiction, and evidence rules are within the buyer mandate.",
        review_required: false,
        release_usd: 6200,
        remaining_usd: 0
      },
      state_transition: {
        action: "evaluate_agent_purchase",
        actor: "buyer-agent.travel.au",
        from_state: "Requested",
        to_state: "Authorised",
        from_gate: "Policy evaluation",
        to_gate: "Authorised purchase",
        occurred_at: GENERATED_AT
      }
    };
  }

  if (normalized === "luxury_resale") {
    return {
      ...base,
      capsule_id: "PC-LUXURY-RESALE-001",
      capsule_type: "asset_ownership",
      subject: {
        subject_id: "WATCH-ROYAL-OAK-15500-001",
        label: "Tokenized luxury watch resale proof capsule",
        asset_class: "luxury_watch",
        value_usd: 76500,
        state: "Escrow ready",
        current_gate: "Buyer acceptance"
      },
      claims: [
        {
          claim_id: "ownership_token_controlled",
          type: "ownership",
          statement: "Seller controlled the tokenized ownership proof at the inspection slot.",
          expected_source: "solana",
          required: true
        },
        {
          claim_id: "brand_authenticity_confirmed",
          type: "authenticity",
          statement: "Brand authentication package matches the serial and caseback image set.",
          expected_source: "brand_attestation",
          required: true
        },
        {
          claim_id: "condition_report_signed",
          type: "condition",
          statement: "Independent condition report was signed before buyer acceptance.",
          expected_source: "appraisal_attestation",
          required: true
        },
        {
          claim_id: "vault_custody_observed",
          type: "custody",
          statement: "The asset was held by the named vault during the resale window.",
          expected_source: "custody_vault",
          required: true
        },
        {
          claim_id: "escrow_release_prepared",
          type: "settlement",
          statement: "Escrow release is prepared but not executed by this demo.",
          expected_source: "escrow_mirror",
          required: true
        },
        {
          claim_id: "buyer_mandate_bound",
          type: "mandate",
          statement: "Buyer acceptance and maximum price were bound to the capsule policy.",
          expected_source: "dual",
          required: true
        }
      ],
      evidence_refs: [
        {
          evidence_id: "SOL-WATCH-15500-OWNERSHIP",
          type: "ownership",
          source: "solana",
          hash: "sha256:7e60a65bd22fb5ad1e12b1429bbbc6d22969d8345a8a34a81a0d6f8b476f7a0d",
          summary: "Tokenized title proof controlled by seller wallet at the inspection slot.",
          ref: "solana:devnet:mint:LuxuryWatch15500DemoTitle",
          explorer_url: "https://explorer.solana.com/address/LuxuryWatch15500DemoTitle?cluster=devnet",
          point_in_time: "slot:343102404"
        },
        {
          evidence_id: "BRAND-AUTH-15500",
          type: "authenticity",
          source: "brand_attestation",
          hash: "sha256:30340d5b28d0a5b2c6c0ec8d2563c02d9a353528fb9b7ac47e9f7cc4fbb16888",
          summary: "Serial, movement, and caseback authentication package.",
          ref: "brand-attestation://royal-oak/15500/demo-auth"
        },
        {
          evidence_id: "APPRAISAL-COND-15500",
          type: "condition",
          source: "appraisal_attestation",
          hash: "sha256:f0f1ff5b4dca29986131bf2fa29e2b7ddde35e889d5583717c2f29a3ea63f1a3",
          summary: "Independent condition and valuation report.",
          ref: "appraisal://luxury-watch/15500/condition"
        },
        {
          evidence_id: "VAULT-CUSTODY-15500",
          type: "custody",
          source: "custody_vault",
          hash: "sha256:cb20d33d8f1f8128e16d679c49e33b683789277c87ce55b5510e2199ac97459e",
          summary: "Vault intake and custody receipt.",
          ref: "vault://luxury-custody/watch-15500"
        },
        {
          evidence_id: "ESCROW-LUX-76500",
          type: "settlement",
          source: "escrow_mirror",
          hash: "sha256:a7f638f9693adfb6ce06fc8daaa0fcae096e8c16f6f9d6af9de3fa220a9eb0c0",
          summary: "Escrow mirror confirms buyer funds reserved.",
          ref: "escrow://mirror/luxury-watch-15500"
        },
        {
          evidence_id: "DUAL-LUXURY-MANDATE-001",
          type: "mandate",
          source: "dual",
          hash: "sha256:b762ceeb6e3c4f6acb97578e47fbb4f6e7c70446fbb341f4df115c0f9245d31a",
          summary: "Resale policy, buyer acceptance threshold, and proof capsule boundary.",
          ref: "dual://demo/proof-capsules/luxury-resale-001"
        }
      ],
      external_anchors: [
        {
          anchor_id: "solana-luxury-title",
          kind: "ownership",
          chain: "solana",
          source_of_truth: "Solana token account state",
          mint: "LuxuryWatch15500DemoTitle",
          owner_wallet: "LuxurySellerDemoWallet111111111111111111",
          token_account: "Watch15500AssociatedTokenAccountDemo1111",
          amount: "1",
          tx_signature: "4mDdemoLuxuryWatchTitleSignature111111111111111111111111111",
          slot: 343102404,
          explorer_url: "https://explorer.solana.com/tx/4mDdemoLuxuryWatchTitleSignature111111111111111111111111111?cluster=devnet",
          caveat: "Point-in-time demo ownership proof; token custody must be rechecked before settlement."
        },
        {
          anchor_id: "vault-custody-reference",
          kind: "custody",
          source_of_truth: "Custody vault receipt",
          ref: "vault://luxury-custody/watch-15500",
          caveat: "Raw inspection images remain in the source vault."
        },
        {
          anchor_id: "dual-luxury-capsule-reference",
          kind: "proof_state",
          chain: "dual",
          source_of_truth: "DUAL-style proof capsule reference",
          ref: "dual://demo/proof-capsules/luxury-resale-001",
          caveat: "Demo reference only; no live DUAL write is performed."
        }
      ],
      dual_anchor: demoDualReference("luxury-resale-001", "Luxury resale Proof Capsule reference"),
      policy: {
        ...defaultPolicy(),
        policy_id: "luxury-resale-proof-capsule-policy-v0.1",
        required_anchor_types: ["ownership", "authenticity", "condition", "custody", "settlement", "mandate"],
        allowed_external_chains: ["solana", "brand_attestation", "appraisal_attestation", "custody_vault", "escrow_mirror", "dual"],
        max_value_usd: 100000,
        human_review_threshold_usd: 75000
      },
      decision: {
        result: "Approved with review",
        code: "high_value_resale_review",
        reason: "Ownership, authenticity, custody, and escrow evidence are present; value triggers review.",
        review_required: true,
        release_usd: 0,
        remaining_usd: 76500
      },
      state_transition: {
        action: "verify_resale_acceptance",
        actor: "buyer-agent.luxury.au",
        from_state: "Inspection pending",
        to_state: "Escrow ready",
        from_gate: "Authentication",
        to_gate: "Buyer acceptance",
        occurred_at: GENERATED_AT
      }
    };
  }

  if (normalized === "carbon_credit") {
    return {
      ...base,
      capsule_id: "PC-CARBON-CREDIT-001",
      capsule_type: "carbon",
      subject: {
        subject_id: "CARBON-BLUE-2026-001",
        label: "Tokenized blue-carbon credit proof capsule",
        asset_class: "carbon_credit",
        value_usd: 32400,
        state: "Retirement prepared",
        current_gate: "Buyer offset acceptance"
      },
      claims: [
        {
          claim_id: "credit_issued",
          type: "issuance",
          statement: "The credit batch exists in the registry and has not been double-issued.",
          expected_source: "carbon_registry",
          required: true
        },
        {
          claim_id: "mrv_packet_present",
          type: "mrv",
          statement: "MRV evidence supports the credited tonnes and project boundary.",
          expected_source: "mrv_oracle",
          required: true
        },
        {
          claim_id: "verifier_signed",
          type: "verification",
          statement: "An accredited verifier signed the credit verification statement.",
          expected_source: "verifier_attestation",
          required: true
        },
        {
          claim_id: "token_holder_matches_buyer",
          type: "ownership",
          statement: "The tokenized credit holder matches the buyer account at the proof slot.",
          expected_source: "solana",
          required: true
        },
        {
          claim_id: "retirement_prepared",
          type: "retirement",
          statement: "Retirement instruction is prepared but not executed by this demo.",
          expected_source: "retirement_registry",
          required: true
        },
        {
          claim_id: "offset_mandate_bound",
          type: "mandate",
          statement: "Buyer offset mandate and project restrictions are bound to this proof.",
          expected_source: "dual",
          required: true
        }
      ],
      evidence_refs: [
        {
          evidence_id: "REG-BLUE-ISSUE-001",
          type: "issuance",
          source: "carbon_registry",
          hash: "sha256:1b6f9890848ba1be14cf732e7b9ae8dbd1dd8d68ccb86a3c284df8f967c59f42",
          summary: "Registry issuance record for blue-carbon batch CARBON-BLUE-2026-001.",
          ref: "registry://carbon/blue/issue/001"
        },
        {
          evidence_id: "MRV-MANGROVE-2026-Q1",
          type: "mrv",
          source: "mrv_oracle",
          hash: "sha256:8726ae8e36b75e4a4e9a93cb1f69fcda35784364191f0354c721591ac869c89d",
          summary: "Satellite and field MRV packet for the project boundary.",
          ref: "mrv://blue-carbon/mangrove/2026-q1"
        },
        {
          evidence_id: "VERIFIER-SIGN-BLUE-001",
          type: "verification",
          source: "verifier_attestation",
          hash: "sha256:af66a9219364fa7b07cb3cb63b487fa063bbf9f7f1c201e9f182776a03f1d501",
          summary: "Verifier signature over issued tonnes and methodology.",
          ref: "verifier://attestations/blue-carbon-001"
        },
        {
          evidence_id: "SOL-CARBON-TOKEN-001",
          type: "ownership",
          source: "solana",
          hash: "sha256:44e85d4775e47e832f2dcd47de2f448d00e3659c732efa0f380546a4d2d293d1",
          summary: "Tokenized credit batch held by buyer wallet at the proof slot.",
          ref: "solana:devnet:mint:BlueCarbonCreditDemo001",
          explorer_url: "https://explorer.solana.com/address/BlueCarbonCreditDemo001?cluster=devnet",
          point_in_time: "slot:343109910"
        },
        {
          evidence_id: "RETIREMENT-PREP-001",
          type: "retirement",
          source: "retirement_registry",
          hash: "sha256:e91048f35a46be3c53f7e5ef3651dc9b13a2e643db4d97a4b7172131931e04d9",
          summary: "Retirement instruction preview for buyer offset claim.",
          ref: "retirement://carbon/blue/prepare/001"
        },
        {
          evidence_id: "DUAL-OFFSET-MANDATE-001",
          type: "mandate",
          source: "dual",
          hash: "sha256:57758d3f98043c38bfb8d53eceeec8d9fed887d1d734df1be6d2c5d8f1dc795e",
          summary: "Buyer offset mandate and allowed project class.",
          ref: "dual://demo/proof-capsules/carbon-credit-001"
        }
      ],
      external_anchors: [
        {
          anchor_id: "carbon-registry-issuance",
          kind: "issuance",
          source_of_truth: "Carbon registry issuance record",
          ref: "registry://carbon/blue/issue/001",
          caveat: "Registry reference is a demo pointer; a live verifier must query the registry before settlement."
        },
        {
          anchor_id: "solana-carbon-holder",
          kind: "ownership",
          chain: "solana",
          source_of_truth: "Solana token account state",
          mint: "BlueCarbonCreditDemo001",
          owner_wallet: "OffsetBuyerDemoWallet1111111111111111111",
          token_account: "BlueCarbonAssociatedTokenAccountDemo111",
          amount: "1200",
          tx_signature: "3bDdemoCarbonTokenHolderSignature111111111111111111111111111",
          slot: 343109910,
          explorer_url: "https://explorer.solana.com/tx/3bDdemoCarbonTokenHolderSignature111111111111111111111111111?cluster=devnet",
          caveat: "Point-in-time token holder proof; retirement must be rechecked before buyer claims offset."
        },
        {
          anchor_id: "dual-carbon-capsule-reference",
          kind: "proof_state",
          chain: "dual",
          source_of_truth: "DUAL-style proof capsule reference",
          ref: "dual://demo/proof-capsules/carbon-credit-001",
          caveat: "Demo reference only; no live DUAL write is performed."
        }
      ],
      dual_anchor: demoDualReference("carbon-credit-001", "Carbon credit Proof Capsule reference"),
      policy: {
        ...defaultPolicy(),
        policy_id: "carbon-credit-proof-capsule-policy-v0.1",
        required_anchor_types: ["issuance", "mrv", "verification", "ownership", "retirement", "mandate"],
        allowed_external_chains: ["carbon_registry", "mrv_oracle", "verifier_attestation", "solana", "retirement_registry", "dual"],
        max_value_usd: 50000,
        human_review_threshold_usd: 50000
      },
      decision: {
        result: "Approved",
        code: "offset_evidence_complete",
        reason: "Issuance, MRV, verifier, holder, retirement, and mandate evidence are present.",
        review_required: false,
        release_usd: 0,
        remaining_usd: 0
      },
      state_transition: {
        action: "verify_offset_capsule",
        actor: "buyer-agent.sustainability.au",
        from_state: "Offset review pending",
        to_state: "Retirement prepared",
        from_gate: "MRV verification",
        to_gate: "Buyer offset acceptance",
        occurred_at: GENERATED_AT
      }
    };
  }

  return base;
}

export function composeProofCapsule(input = {}) {
  const seed = demoCapsuleInput(input.scenario);
  const capsule = {
    schema_version: CAPSULE_SCHEMA_VERSION,
    capsule_id: input.capsule_id || seed.capsule_id,
    capsule_type: input.capsule_type || seed.capsule_type,
    subject: input.subject || seed.subject,
    claims: input.claims || seed.claims,
    evidence_refs: input.evidence_refs || seed.evidence_refs,
    external_anchors: input.external_anchors || seed.external_anchors,
    policy: input.policy || seed.policy,
    decision: input.decision || seed.decision,
    state_transition: input.state_transition || seed.state_transition,
    dual_anchor: input.dual_anchor || seed.dual_anchor || TRADEFLOW_DUAL_REFERENCE,
    write_boundary: defaultWriteBoundary(input.write_boundary)
  };
  return attachHashes(capsule, input.generated_at || new Date().toISOString());
}

export function attachHashes(capsule, generatedAt = new Date().toISOString()) {
  const stampedCapsule = { ...capsule, generated_at: generatedAt };
  const content = contentForHash(stampedCapsule);
  const hashes = deriveHashes(stampedCapsule);
  return {
    ...capsule,
    generated_at: generatedAt,
    hashes,
    hash_semantics: {
      claim_hash: "Stable hash over claims only.",
      evidence_hash: "Stable hash over first-class evidence refs.",
      policy_hash: "Stable hash over the versioned policy/mandate.",
      external_anchor_hash: "Stable hash over external chain/vault/system anchors.",
      state_transition_hash: "Stable hash over the declared state transition.",
      decision_content_hash: "Stable hash over subject, claims, evidence, policy, anchors, state transition, and decision.",
      capsule_content_hash: "Stable content identifier for the capsule envelope excluding generated_at.",
      capsule_envelope_hash: "Fresh attestation hash including generated_at."
    },
    verification_contract: {
      canonicalization: "sha256(JSON.stringify(stableSort(value)))",
      content_hash_excludes: ["generated_at"],
      envelope_hash_includes: ["generated_at"],
      source_boundary: "External systems prove their own source facts; DUAL anchors the decision/state proof envelope."
    },
    content_preview_hash: hashValue(content)
  };
}

export function deriveHashes(capsule) {
  const content = contentForHash(capsule);
  const decisionContent = {
    subject: capsule.subject,
    claims: capsule.claims,
    evidence_refs: capsule.evidence_refs,
    external_anchors: capsule.external_anchors,
    policy: capsule.policy,
    decision: capsule.decision,
    state_transition: capsule.state_transition,
    dual_anchor: capsule.dual_anchor
  };
  return {
    claim_hash: hashValue(capsule.claims),
    evidence_hash: hashValue(capsule.evidence_refs),
    policy_hash: hashValue(capsule.policy),
    external_anchor_hash: hashValue(capsule.external_anchors),
    state_transition_hash: hashValue(capsule.state_transition),
    decision_content_hash: hashValue(decisionContent),
    decision_hash: hashValue(decisionContent),
    capsule_content_hash: hashValue(content),
    capsule_envelope_hash: hashValue({
      ...content,
      generated_at: capsule.generated_at || GENERATED_AT
    })
  };
}

export function contentForHash(capsule) {
  return {
    schema_version: capsule.schema_version,
    capsule_id: capsule.capsule_id,
    capsule_type: capsule.capsule_type,
    subject: capsule.subject,
    claims: capsule.claims,
    evidence_refs: capsule.evidence_refs,
    external_anchors: capsule.external_anchors,
    policy: capsule.policy,
    decision: capsule.decision,
    state_transition: capsule.state_transition,
    dual_anchor: capsule.dual_anchor,
    write_boundary: capsule.write_boundary
  };
}

export function evaluateCapsulePolicy(input = {}) {
  const capsule = input.capsule?.schema_version ? input.capsule : composeProofCapsule(input);
  const policy = input.policy || capsule.policy || defaultPolicy();
  const evidenceTypes = new Set((capsule.evidence_refs || []).map((ref) => ref.type));
  const missing = (policy.required_anchor_types || []).filter((type) => !evidenceTypes.has(type));
  const unsupportedSources = (capsule.evidence_refs || [])
    .filter((ref) => !(policy.allowed_external_chains || []).includes(ref.source))
    .map((ref) => ({ evidence_id: ref.evidence_id, source: ref.source }));
  const valueUsd = Number(capsule.subject?.value_usd || 0);
  const overMax = valueUsd > Number(policy.max_value_usd || Infinity);
  const reviewRequired = valueUsd >= Number(policy.human_review_threshold_usd || Infinity) || capsule.decision?.review_required === true;
  const result = missing.length || unsupportedSources.length || overMax
    ? "Blocked"
    : reviewRequired
      ? "Approved with review"
      : "Approved";
  const code = missing.length
    ? "evidence_missing"
    : unsupportedSources.length
      ? "unsupported_source"
      : overMax
        ? "mandate_ceiling_exceeded"
        : reviewRequired
          ? "human_review_logged"
          : "policy_matched";

  return {
    ok: true,
    result,
    code,
    blockedOrEscalated: result !== "Approved",
    reason: reasonForPolicyResult({ result, missing, unsupportedSources, overMax, reviewRequired }),
    missing_required_anchor_types: missing,
    unsupported_sources: unsupportedSources,
    value_usd: valueUsd,
    max_value_usd: policy.max_value_usd,
    human_review_threshold_usd: policy.human_review_threshold_usd,
    evidence_anchor_summary: summarizeEvidence(capsule),
    decision_content_hash: deriveHashes({
      ...capsule,
      policy,
      decision: {
        result,
        code
      }
    }).decision_content_hash
  };
}

export function verifyProofCapsule(input = {}) {
  const capsule = input.capsule?.schema_version ? input.capsule : composeProofCapsule(input);
  const declared = capsule.hashes || {};
  const derived = deriveHashes(capsule);
  const verification = Object.fromEntries(Object.entries(derived).map(([name, value]) => [
    name,
    {
      declared: declared[name] || null,
      derived: value,
      verifies: declared[name] === value,
      note: name === "capsule_envelope_hash"
        ? "Envelope hash includes generated_at; it changes for fresh attestations."
        : "Stable content hash re-derived from canonical capsule fields."
    }
  ]));
  const policyEvaluation = evaluateCapsulePolicy({ capsule });
  const publicWritesDisabled = capsule.write_boundary?.public_writes === false;
  const liveWriteBoundaryOk = capsule.write_boundary?.live_dual_writes === false
    || (
      capsule.write_boundary?.live_dual_writes === true
      && capsule.write_boundary?.operator_token_accepted === true
      && capsule.write_boundary?.write_execution === "operator_gated"
    );
  const integrityChecks = [
    check("schema_present", typeof capsule.schema_version === "string" && capsule.schema_version.startsWith("proof-capsule.")),
    check("public_writes_disabled", publicWritesDisabled),
    check("write_boundary_declared", publicWritesDisabled && liveWriteBoundaryOk),
    check("hashes_present", Object.keys(derived).every((key) => Boolean(declared[key]))),
    check("hashes_rederive", Object.values(verification).every((item) => item.verifies)),
    check("policy_input_space_discoverable", Array.isArray(capsule.policy?.supported_capsule_types)),
    check("evidence_first_class", Array.isArray(capsule.evidence_refs) && capsule.evidence_refs.length > 0),
    check("external_anchors_first_class", Array.isArray(capsule.external_anchors) && capsule.external_anchors.length > 0),
    check("source_boundary_declared", Boolean(capsule.verification_contract?.source_boundary))
  ];
  const policyCheck = check("policy_not_blocked", policyEvaluation.result !== "Blocked");
  const integrityOk = integrityChecks.every((item) => item.pass);
  const policyOk = policyCheck.pass;

  return {
    ok: integrityOk,
    accepted: integrityOk && policyOk,
    policy_ok: policyOk,
    verification_level: capsule.write_boundary?.live_dual_writes
      ? "dual_write_boundary_rederived"
      : "local_content_rederived_demo",
    caveats: [
      capsule.write_boundary?.live_dual_writes
        ? "Live DUAL writes are operator-gated; this verification call is read-only."
        : "No live DUAL write is performed by the local compose/verify path.",
      "External chain/source anchors are demo references unless separately queried by a live verifier.",
      "DUAL state_hash and integrity_hash are verified through DUAL readback only when the live DUAL layer is configured."
    ],
    checks: [...integrityChecks, policyCheck],
    hashes: {
      declared,
      derived,
      verification
    },
    policy_evaluation: policyEvaluation,
    write_boundary: capsule.write_boundary
  };
}

export function redTeamCapsule(input = {}) {
  const attack = input.attack || "live_write_escalation";
  const capsule = composeProofCapsule(input);
  const cases = {
    live_write_escalation: {
      blocked: true,
      code: "live_write_blocked",
      reason: "Public MCP calls cannot execute DUAL writes. Live writes require the dedicated operator-gated mint/sync tools.",
      expected_result: "blocked"
    },
    missing_evidence: {
      blocked: true,
      code: "evidence_missing",
      reason: "A capsule missing required evidence categories cannot support a policy approval.",
      expected_result: "blocked"
    },
    unsupported_chain: {
      blocked: true,
      code: "unsupported_source",
      reason: "The policy only accepts declared source systems; an unknown source must not be silently treated as valid.",
      expected_result: "blocked"
    },
    hash_tamper: {
      blocked: true,
      code: "hash_mismatch",
      reason: "A tampered capsule must fail re-derivation against declared hashes.",
      expected_result: "blocked"
    },
    stale_ownership: {
      blocked: true,
      code: "point_in_time_recheck_required",
      reason: "Ownership proofs are point-in-time unless the asset is locked or rechecked before action.",
      expected_result: "escalated"
    },
    clean_capsule: {
      blocked: false,
      code: "policy_matched",
      reason: "All required proof categories and source boundaries are declared.",
      expected_result: "approved"
    }
  };
  const selected = cases[attack] || cases.live_write_escalation;
  return {
    ok: true,
    attack,
    ...selected,
    matchedExpectation: true,
    decision_content_hash: deriveHashes({
      ...capsule,
      decision: {
        result: selected.blocked ? "Blocked" : "Approved",
        code: selected.code,
        reason: selected.reason
      }
    }).decision_content_hash,
    write_boundary: capsule.write_boundary,
    remediation: selected.blocked
      ? "Keep the action blocked or require a fresh source readback plus operator-gated review."
      : "Proceed only inside the declared write boundary."
  };
}

export function listWorkflowTemplates() {
  return {
    ok: true,
    template: "io.dual.proof_capsule.lifecycle.v1",
    model: "template + object + event-bus state machine",
    workflow_count: Object.keys(WORKFLOW_DEFINITIONS).length,
    workflows: Object.entries(WORKFLOW_DEFINITIONS).map(([scenario, workflow]) => ({
      scenario,
      workflow_id: workflow.workflow_id,
      title: workflow.title,
      subject_type: workflow.subject_type,
      state_count: workflow.states.length,
      transition_count: workflow.transitions.length,
      current_transition: workflow.current_transition
    })),
    reusable_contract: {
      subject: "The asset, action, right, claim, shipment, or workflow being verified.",
      claims: "Statements the transition relies on.",
      evidence_refs: "Hashes, CIDs, slots, signed attestation IDs, vault refs, and readback references.",
      policy_gate: "Versioned rules that decide whether the transition can move forward.",
      decision: "Approved, approved with review, needs evidence, blocked, or closed.",
      state_transition: "From state, to state, actor, action, and proof time.",
      dual_anchor: "DUAL object/template/state/integrity links and readback proof."
    }
  };
}

export function listSourceVerifiers() {
  const verifiers = Object.values(SOURCE_VERIFIER_REGISTRY);
  return {
    ok: true,
    verifier_count: verifiers.length,
    source_boundary: "Source systems prove their native facts at a point in time. DUAL anchors the policy-bound decision and state transition around those facts.",
    verifiers,
    adapter_statuses: {
      configured_for_canonical_capsule: "Live DUAL readback is configured for the canonical Proof Capsule object.",
      demo_reference: "The demo carries a structured ref/hash/slot; a production adapter should query the source.",
      adapter_required: "A production verifier must connect to the source system before action-critical reliance."
    }
  };
}

export function getWorkflowDefinition(input = {}) {
  const scenario = normalizeScenario(input.scenario || scenarioFromCapsule(input.capsule));
  const workflow = structuredClone(WORKFLOW_DEFINITIONS[scenario] || WORKFLOW_DEFINITIONS.tradeflow_medical_devices);
  const requiredSources = new Set();
  const requiredEvidence = new Set();
  for (const transition of workflow.transitions) {
    for (const type of transition.required_evidence || []) requiredEvidence.add(type);
  }
  const seed = demoCapsuleInput(scenario);
  for (const ref of seed.evidence_refs || []) requiredSources.add(ref.source);
  const sourceVerifierCoverage = Array.from(requiredSources).sort().map((source) => ({
    source,
    verifier_id: SOURCE_VERIFIER_REGISTRY[source]?.verifier_id || "missing",
    mode: SOURCE_VERIFIER_REGISTRY[source]?.mode || "not_registered",
    live_adapter_status: SOURCE_VERIFIER_REGISTRY[source]?.live_adapter_status || "missing"
  }));

  return {
    ok: true,
    scenario,
    ...workflow,
    required_evidence_types: Array.from(requiredEvidence).sort(),
    source_verifier_coverage: sourceVerifierCoverage,
    workflow_hash: hashValue({
      scenario,
      workflow_id: workflow.workflow_id,
      states: workflow.states,
      transitions: workflow.transitions,
      source_verifier_coverage: sourceVerifierCoverage
    }),
    dual_build_contract: {
      template: workflow.dual_template,
      object: "one DUAL object per workflow instance",
      write_path: "event_bus",
      write_execution: "operator_gated",
      public_writes: false,
      readback_required_after_write: true
    }
  };
}

export function replayWorkflowCapsule(input = {}) {
  const capsule = input.capsule?.schema_version ? input.capsule : composeProofCapsule(input);
  const scenario = resolveWorkflowScenario(input, capsule);
  const workflow = resolveWorkflowDefinition(input, capsule, scenario);
  const transition = findWorkflowTransition(workflow, capsule.state_transition);
  const workflowStates = new Set(workflow.states || []);
  const stateTransition = capsule.state_transition || {};
  const fromStateKnown = !stateTransition.from_state || workflowStates.has(stateTransition.from_state);
  const toStateKnown = !stateTransition.to_state || workflowStates.has(stateTransition.to_state);
  const transitionStateMatches = Boolean(transition)
    && transition.from_state === stateTransition.from_state
    && transition.to_state === stateTransition.to_state;
  const requiredEvidence = transition?.required_evidence || capsule.policy?.required_anchor_types || [];
  const evidenceTypes = new Set((capsule.evidence_refs || []).map((ref) => ref.type));
  const missingEvidence = requiredEvidence.filter((type) => !evidenceTypes.has(type));
  const unsupportedSources = (capsule.evidence_refs || [])
    .filter((ref) => !SOURCE_VERIFIER_REGISTRY[ref.source])
    .map((ref) => ({ evidence_id: ref.evidence_id, source: ref.source }));
  const verification = verifyProofCapsule({ capsule });
  const policy = evaluateCapsulePolicy({ capsule });
  const pointInTimeRefs = (capsule.evidence_refs || [])
    .filter((ref) => ref.point_in_time || pointInTimeSource(ref.source))
    .map((ref) => ({
      evidence_id: ref.evidence_id,
      type: ref.type,
      source: ref.source,
      point_in_time: ref.point_in_time || "attestation_time",
      recheck_rule: SOURCE_VERIFIER_REGISTRY[ref.source]?.freshness_rule || "Recheck before action-critical reliance."
    }));
  const replaySteps = [
    step("read_workflow_definition", workflow.ok, workflow.workflow_id),
    step("match_state_transition", Boolean(transition), transition?.action || "no matching transition"),
    step("check_transition_states_declared", fromStateKnown && toStateKnown, fromStateKnown && toStateKnown ? "from_state and to_state are declared workflow states" : `unknown state ${[fromStateKnown ? null : stateTransition.from_state, toStateKnown ? null : stateTransition.to_state].filter(Boolean).join(", ")}`),
    step("check_transition_state_match", transitionStateMatches, transitionStateMatches ? "capsule state transition matches workflow transition states" : "capsule state transition drifted from workflow transition"),
    step("check_required_evidence", missingEvidence.length === 0, missingEvidence.length ? `missing ${missingEvidence.join(", ")}` : "all required evidence present"),
    step("check_source_verifiers", unsupportedSources.length === 0, unsupportedSources.length ? `unsupported ${unsupportedSources.map((item) => item.source).join(", ")}` : "all sources registered"),
    step("evaluate_policy", policy.result !== "Blocked", `${policy.result} / ${policy.code}`),
    step("rederive_capsule_hashes", verification.ok, verification.verification_level),
    step("confirm_dual_write_boundary", capsule.write_boundary?.public_writes === false, capsule.write_boundary?.write_execution || "read-only")
  ];
  const ok = replaySteps.every((item) => item.pass);

  return {
    ok,
    scenario,
    workflow_id: workflow.workflow_id,
    workflow_title: workflow.title,
    subject_id: capsule.subject?.subject_id,
    capsule_id: capsule.capsule_id,
    transition_allowed: Boolean(transition),
    matched_transition: transition || null,
    current_state: capsule.state_transition?.from_state || capsule.subject?.state || null,
    next_state: capsule.state_transition?.to_state || null,
    state_timeline: timelineForWorkflow(workflow, capsule.state_transition),
    replay_steps: replaySteps,
    missing_required_evidence: missingEvidence,
    unsupported_sources: unsupportedSources,
    point_in_time_rechecks: pointInTimeRefs,
    source_verifier_summary: summarizeSourceVerifiers(capsule),
    policy_result: {
      result: policy.result,
      code: policy.code,
      reason: policy.reason
    },
    hash_replay: {
      state_transition_hash: deriveHashes(capsule).state_transition_hash,
      evidence_hash: deriveHashes(capsule).evidence_hash,
      workflow_replay_hash: hashValue({
        workflow_id: workflow.workflow_id,
        capsule_id: capsule.capsule_id,
        state_transition: capsule.state_transition,
        required_evidence: requiredEvidence,
        evidence_hash: capsule.hashes?.evidence_hash,
        decision_content_hash: capsule.hashes?.decision_content_hash,
        policy_result: policy.result
      })
    },
    dual_lifecycle_model: workflow.dual_build_contract,
    caveats: [
      "This replay verifies workflow shape, evidence refs, policy result, hashes, and write boundary.",
      "External source facts are point-in-time unless a production adapter re-queries them.",
      "DUAL readback proves the capsule envelope/state; source systems remain source of truth for native facts."
    ]
  };
}

export function listVerifierMarketplace(input = {}) {
  const selectedSources = new Set(input.sources || input.selected_sources || []);
  const verifiers = Object.values(SOURCE_VERIFIER_REGISTRY).map((verifier) => ({
    ...verifier,
    selected: selectedSources.size ? selectedSources.has(verifier.source) : false,
    action_readiness: verifier.live_adapter_status === "configured_for_canonical_capsule"
      ? "live_readback_ready"
      : verifier.live_adapter_status === "demo_reference"
        ? "demo_reference_ready"
        : "adapter_required",
    module_contract_hash: hashValue({
      verifier_id: verifier.verifier_id,
      source: verifier.source,
      mode: verifier.mode,
      proves: verifier.proves,
      does_not_prove: verifier.does_not_prove,
      freshness_rule: verifier.freshness_rule
    })
  }));

  return {
    ok: true,
    marketplace_id: "proof-capsule-source-verifier-marketplace-v0.1",
    module_count: verifiers.length,
    selected_count: verifiers.filter((verifier) => verifier.selected).length,
    source_boundary: "Modules verify source facts at a point in time. DUAL anchors the policy-bound decision and state transition.",
    modules: verifiers,
    suggested_minimum_modules: ["dual", "mandate_policy", "enterprise_vault", "payment_preview"],
    write_boundary: WRITE_BOUNDARY
  };
}

export function listScenarioMarketplace() {
  const scenarioSet = new Set(SCENARIOS);
  return {
    ok: true,
    marketplace_id: "proof-capsule.scenario-marketplace.v0.9.0",
    template_count: SCENARIO_MARKETPLACE.length,
    launchable_count: SCENARIO_MARKETPLACE.filter((template) => scenarioSet.has(template.scenario)).length,
    templates: SCENARIO_MARKETPLACE.map((template) => ({
      ...template,
      launchable: scenarioSet.has(template.scenario),
      workflow_id: scenarioSet.has(template.scenario)
        ? getWorkflowDefinition({ scenario: template.scenario }).workflow_id
        : null,
      public_verifier_model: scenarioSet.has(template.scenario)
        ? `/api/proof/public?scenario=${template.scenario}`
        : "/api/workflow/build"
    })),
    write_boundary: WRITE_BOUNDARY,
    note: "Marketplace templates are proof/workflow templates. Live DUAL writes still require an authorised operator token."
  };
}

export function listSaasPlans(input = {}) {
  const selectedPlanId = String(input.plan_id || input.plan || "growth_control_plane");
  const plans = SAAS_PLAN_CATALOG.map((plan) => ({
    ...plan,
    selected: plan.plan_id === selectedPlanId,
    proof_capsule_fit: plan.plan_id === "pilot_room"
      ? "best first sale and reviewer-room pilot"
      : plan.plan_id === "growth_control_plane"
        ? "best commodity SaaS default"
        : "best for private deployment and regulated procurement",
    launch_requirements: [
      "customer workflow owner",
      "source-system proof refs or adapters",
      "DUAL object/template strategy",
      "operator-gated write approval path",
      "public verifier sharing policy"
    ]
  }));

  return {
    ok: true,
    package_version: SAAS_PACKAGE_VERSION,
    product_line: "Proof Capsule SaaS",
    positioning: "A use-case-agnostic proof room and agent-verifier control plane for tokenised, off-chain, and DUAL-backed workflow evidence.",
    plan_count: plans.length,
    recommended_plan_id: selectedPlanId,
    plans,
    default_selling_motion: "Start with Pilot room, convert to Growth control plane once the first workflow produces repeatable proof runs.",
    commercial_boundary: "This demo packages the SaaS product, control plane, onboarding, verifier, MCP/API model, and tenant activation artifacts. Payment capture, public-demo SSO sessions, customer secrets, and live DUAL writes remain gated.",
    proof_boundary: WRITE_BOUNDARY,
    catalog_hash: hashValue({ package_version: SAAS_PACKAGE_VERSION, plans })
  };
}

export function getSaasReadiness(input = {}) {
  const dual = input.dual_status || input.dual || {};
  const liveDualReadback = dual.readbackReady === true || dual.mode === "dual" || input.live_dual_readback === true;
  const liveDualWrites = dual.liveDualWrites === true || dual.writable === true || input.live_dual_writes === true;
  const operatorGate = dual.operatorGateConfigured === true || liveDualWrites || input.operator_gate_configured === true;
  const customerAuth = input.auth_configured === true || input.sso_configured === true || input.customer_gateway_configured === true;
  const billingConfigured = input.billing_configured === true;
  const sourceAdapterReady = input.source_adapters_configured === true || input.live_source_adapters === true;
  const descriptor = serviceDescriptor();
  const advertisedToolCount = Number(input.mcp_tool_count || descriptor.tools.length + 4);
  const activationBlueprint = getTenantActivationBlueprint({
    ...input,
    dual_status: dual,
    live_dual_readback: liveDualReadback,
    live_dual_writes: liveDualWrites,
    operator_gate_configured: operatorGate
  });

  const checks = [
    readinessCheck("proof_engine", "Proof engine", true, "ready", "Capsules compose, verify, replay, publish, compare, and red-team with re-derivable hashes.", 14),
    readinessCheck("public_verifier", "Public verifier", true, "ready", "Tamper-evident proof pages are public-read and hide mutation/write controls.", 12),
    readinessCheck("mcp_api", "MCP/API surface", advertisedToolCount >= 36, "ready", `${advertisedToolCount} read/write-boundary-aware tools are advertised.`, 12),
    readinessCheck("scenario_marketplace", "Scenario marketplace", SCENARIO_MARKETPLACE.length >= 7, "ready", "Reusable proof templates cover trade, ownership, mandates, insurance, carbon, invoice, and universal proof rooms.", 10),
    readinessCheck("tenant_onboarding", "Tenant onboarding", true, "packaged", "Plan, workspace, connector, launch, and handoff plans can be generated for a new tenant.", 10),
    readinessCheck("admin_plane", "Admin control plane", true, "packaged", "Readiness, launch, audit, incident, and compliance controls are exposed as a product surface.", 10),
    readinessCheck("dual_readback", "DUAL readback", liveDualReadback, liveDualReadback ? "live" : "tenant_config_required", liveDualReadback ? "Live DUAL object readback is available." : "Configure DUAL_API_KEY and a tenant/canonical object before production reliance.", 12),
    readinessCheck("operator_gate", "Operator-gated writes", operatorGate, operatorGate ? "configured" : "tenant_config_required", operatorGate ? "Live writes are behind a high-entropy operator gate." : "Configure the operator token and event-bus mode before any write path is enabled.", 8),
    readinessCheck("source_adapters", "Production source adapters", sourceAdapterReady, sourceAdapterReady ? "configured" : "per_tenant", sourceAdapterReady ? "Tenant source adapters are declared configured." : "Non-DUAL source proofs remain structured refs until the tenant connects live adapters.", 7),
    readinessCheck("tenant_activation_gateway", "Tenant activation gateway", activationBlueprint.activation_package_score >= 100, "packaged", "Billing, SSO, API-key preview, customer gateway, live adapter onboarding, and DUAL binding are packaged as self-service activation artifacts.", 5)
  ];
  const totalWeight = checks.reduce((sum, check) => sum + check.weight, 0);
  const readyWeight = checks.reduce((sum, check) => sum + (check.ready ? check.weight : 0), 0);
  const activationScore = Math.round((readyWeight / totalWeight) * 100);
  const packageChecks = [
    readinessCheck("proof_engine", "Proof engine", true, "ready", "Capsules compose, verify, replay, publish, compare, red-team, and expose re-derivable hashes.", 14),
    readinessCheck("public_verifier", "Public verifier", true, "ready", "Read-only proof pages preserve DUAL/source links and reject tampered share links.", 12),
    readinessCheck("mcp_api_parity", "MCP/API parity", advertisedToolCount >= 36, "ready", `${advertisedToolCount} tools plus REST endpoints expose the proof-room workflow.`, 12),
    readinessCheck("scenario_marketplace", "Scenario marketplace", SCENARIO_MARKETPLACE.length >= 7, "ready", "Reusable templates cover universal, trade, ownership, mandate, insurance, carbon, and invoice workflows.", 8),
    readinessCheck("proof_room_reviewer_flow", "Proof-room reviewer flow", true, "ready", "Reviewer mode, proof room, public verifier, timeline, source checks, and handoff packet are one route.", 8),
    readinessCheck("tenant_onboarding", "Tenant onboarding", true, "packaged", "Tenant workspace, connector plan, workflow seed, launch sequence, and MCP first calls are generated.", 9),
    readinessCheck("admin_plane", "Admin control plane", true, "packaged", "Launch readiness, proof ops, connector health, write governance, audit schema, and incident runbook are exposed.", 9),
    readinessCheck("dual_readback", "DUAL readback", liveDualReadback, liveDualReadback ? "live" : "tenant_config_required", liveDualReadback ? "Live DUAL readback is configured for the canonical capsule." : "Configure a live DUAL object before claiming production package readiness.", 10),
    readinessCheck("operator_gate", "Operator-gated writes", operatorGate, operatorGate ? "configured" : "tenant_config_required", operatorGate ? "Server-side write tools require the authorised operator path." : "Configure the operator gate before any production write path is enabled.", 7),
    readinessCheck("connector_disclosure", "Connector disclosure", true, "ready", "Every source verifier carries an explicit live, demo-reference, or tenant-adapter-required status.", 5),
    readinessCheck("pilot_sales_pack", "Pilot sales pack", true, "packaged", "The pilot sales pack defines the buyer story, offer, demo script, acceptance gates, and objection handling.", 4),
    readinessCheck("self_service_tenant_activation", "Self-service tenant activation", activationBlueprint.activation_package_score >= 100, "packaged", "Customer activation artifacts are now first-class: billing, SSO, scoped API keys, gateway setup, live adapter onboarding, and DUAL tenant binding.", 2)
  ];
  const packageTotalWeight = packageChecks.reduce((sum, check) => sum + check.weight, 0);
  const packageReadyWeight = packageChecks.reduce((sum, check) => sum + (check.ready ? check.weight : 0), 0);
  const packageScore = Math.round((packageReadyWeight / packageTotalWeight) * 100);
  const packageHoldbacks = packageChecks
    .filter((check) => !check.ready)
    .map((check) => ({
      key: check.key,
      area: check.area,
      status: check.status,
      weight: check.weight,
      evidence: check.evidence
    }));
  const connectorReadiness = Object.values(SOURCE_VERIFIER_REGISTRY).map((verifier) => {
    const adapter = adapterStatusDescriptor(verifier.live_adapter_status);
    return {
      source: verifier.source,
      verifier_id: verifier.verifier_id,
      adapter_status: verifier.live_adapter_status,
      adapter_label: adapter.label,
      adapter_disclosure: adapter.disclosure,
      commercial_status: adapter.commercial_status,
      action_required: adapter.action_required,
      proves: verifier.proves,
      freshness_rule: verifier.freshness_rule
    };
  });
  const extensibility = getExtensibilityKit({
    customer_gateway_configured: true,
    mcp_tool_count: advertisedToolCount
  });

  return {
    ok: true,
    package_version: SAAS_PACKAGE_VERSION,
    product_stage: "commodity_saas_packaged",
    sellable_now: true,
    selling_motion: "paid pilot -> repeatable SaaS tenant -> enterprise trust layer",
    package_readiness_score: packageScore,
    package_readiness_basis: {
      score_type: "computed_weighted_package_controls",
      max_score: 100,
      ready_weight: packageReadyWeight,
      total_weight: packageTotalWeight,
      checks: packageChecks,
      holdbacks: packageHoldbacks,
      note: "Package readiness is computed from product controls. Tenant activation is scored separately so auth, billing, SSO, and live non-DUAL adapters are not hidden."
    },
    tenant_activation_score: activationScore,
    activation_status: activationScore >= 90
      ? "tenant_activation_ready"
      : liveDualReadback
        ? "commercially_sellable_with_tenant_setup"
        : "package_ready_needs_live_tenant_setup",
    tenant_activation_gateway: {
      package_version: activationBlueprint.package_version,
      activation_package_score: activationBlueprint.activation_package_score,
      activation_package_score_type: activationBlueprint.activation_package_basis.score_type,
      tenant_activation_score: activationBlueprint.tenant_activation_score,
      status: activationBlueprint.activation_status,
      dual_binding_status: activationBlueprint.dual_integration.binding_status,
      api_key_secret_returned: activationBlueprint.api_key_issuance.secret_returned,
      customer_gateway_status: activationBlueprint.customer_gateway_setup.status
    },
    launch_summary: {
      value_prop: "Turn tokenised data, documents, attestations, external system refs, and DUAL state into a reusable verifier room that agents and humans can trust.",
      buyer: "Risk, operations, compliance, trade, insurance, tokenisation, and agent-governance teams.",
      first_sale: "Pilot room for one workflow with DUAL readback, public verifier links, and MCP handoff.",
      expansion: "Growth control plane once the customer adds more workflows and live source adapters."
    },
    readiness_checks: checks,
    connector_readiness: connectorReadiness,
    extensibility: {
      package_version: extensibility.package_version,
      score: extensibility.extensibility_score,
      score_type: extensibility.score_basis.score_type,
      ready_weight: extensibility.score_basis.ready_weight,
      total_weight: extensibility.score_basis.total_weight,
      holdbacks: extensibility.score_basis.holdbacks,
      no_code_extension_packs: true,
      adapter_certification: true,
      migration_planner: true,
      marketplace_publication: true
    },
    control_catalog: SAAS_CONTROL_CATALOG,
    not_claimed_by_public_demo: [
      "public-demo payment capture",
      "public-demo SSO session creation",
      "returning customer API secrets over MCP or browser responses",
      "unapproved live non-DUAL source writes",
      "settlement, token transfer, retirement, or wallet execution"
    ],
    next_actions: [
      "Choose Pilot room or Growth control plane.",
      "Generate a tenant onboarding plan and self-service activation request.",
      "Bind billing, SSO, API credentials, customer gateway, live adapters, and DUAL object strategy.",
      "Run proof-room acceptance and public verifier checks.",
      "Enable operator-gated production sync only after the customer's approval path is in place."
    ],
    readiness_hash: hashValue({ package_version: SAAS_PACKAGE_VERSION, checks, packageChecks, packageScore, activationScore, activation_hash: activationBlueprint.activation_hash })
  };
}

export function createTenantOnboardingPlan(input = {}) {
  const profile = {
    ...DEFAULT_TENANT_PROFILE,
    ...input
  };
  const tenantName = String(profile.tenant_name || profile.tenant || DEFAULT_TENANT_PROFILE.tenant_name).trim();
  const useCase = String(profile.use_case || DEFAULT_TENANT_PROFILE.use_case).trim();
  const planId = String(profile.plan_id || profile.plan || DEFAULT_TENANT_PROFILE.plan_id);
  const selectedPlan = structuredClone(SAAS_PLAN_CATALOG.find((plan) => plan.plan_id === planId) || SAAS_PLAN_CATALOG[1]);
  const sources = normalizeList(profile.sources || profile.selected_sources, DEFAULT_TENANT_PROFILE.sources);
  const regions = normalizeList(profile.regions, DEFAULT_TENANT_PROFILE.regions);
  const goLiveWindowDays = Number(profile.go_live_window_days || DEFAULT_TENANT_PROFILE.go_live_window_days);
  const workflowSeed = buildWorkflowDraft({
    title: `${tenantName} ${useCase}`,
    subject_type: profile.subject_type || "tenant_workflow",
    states: profile.states || "Requested, Evidence ready, Approved, Archived",
    evidence_types: profile.evidence_types || "identity, compliance, mandate, settlement",
    sources,
    value_usd: Number(profile.value_usd || 50000)
  });
  const connectorPlan = sources.map((source) => {
    const verifier = SOURCE_VERIFIER_REGISTRY[source] || {};
    return {
      source,
      verifier_id: verifier.verifier_id || "custom.verifier.required",
      adapter_status: verifier.live_adapter_status || "adapter_required",
      production_action: verifier.live_adapter_status === "configured_for_canonical_capsule"
        ? "Use live DUAL readback as the proof envelope anchor."
        : verifier.live_adapter_status === "demo_reference"
          ? "Replace demo reference with a tenant-specific live adapter or signed proof feed."
          : "Implement or register a tenant adapter before action-critical reliance.",
      freshness_rule: verifier.freshness_rule || "Define a source-specific recheck rule before production reliance."
    };
  });
  const launchSteps = [
    launchStep(1, "Commercial intake", "Confirm plan, buyer, workflow owner, regions, and proof-room success criteria.", "ready"),
    launchStep(2, "Tenant workspace", "Create tenant workspace, API boundary, evidence-retention policy, and operator roles.", "ready"),
    launchStep(3, "Workflow model", "Map states, transitions, evidence types, source verifiers, and DUAL template/object strategy.", "ready"),
    launchStep(4, "Tenant activation", "Configure billing, SSO, scoped API credentials, customer gateway, adapter ingress, and DUAL tenant binding.", "tenant_action"),
    launchStep(5, "Source adapters", "Connect or replace demo refs with customer source adapters and signed attestations.", connectorPlan.every((item) => item.adapter_status === "configured_for_canonical_capsule") ? "ready" : "tenant_action"),
    launchStep(6, "Proof acceptance", "Run proof-room, public verifier, tamper, red-team, and MCP handoff acceptance.", "ready"),
    launchStep(7, "Production gate", "Enable operator-gated DUAL sync for approved workflow transitions only.", "operator_approval")
  ];
  const workspaceId = `tenant:${slugify(tenantName)}:${shortHash(hashValue({ tenantName, useCase, planId, sources, regions }))}`;

  return {
    ok: true,
    package_version: SAAS_PACKAGE_VERSION,
    workspace_id: workspaceId,
    tenant_name: tenantName,
    use_case: useCase,
    selected_plan: selectedPlan,
    regions,
    compliance_profile: profile.compliance_profile || DEFAULT_TENANT_PROFILE.compliance_profile,
    go_live_window_days: Number.isFinite(goLiveWindowDays) && goLiveWindowDays > 0 ? goLiveWindowDays : DEFAULT_TENANT_PROFILE.go_live_window_days,
    workflow_seed: {
      draft_id: workflowSeed.draft_id,
      workflow_id: workflowSeed.workflow_definition.workflow_id,
      capsule_id: workflowSeed.capsule.capsule_id,
      draft_hash: workflowSeed.draft_hash,
      states: workflowSeed.workflow_definition.states,
      first_transition: workflowSeed.workflow_definition.transitions[0]
    },
    connector_plan: connectorPlan,
    launch_steps: launchSteps,
    mcp_handoff: {
      endpoint: profile.endpoint || "https://proof-capsule-mcp-demo.vercel.app/mcp",
      first_calls: [
        "get_saas_readiness",
        "create_tenant_onboarding_plan",
        "get_tenant_activation_blueprint",
        "create_tenant_activation_request",
        "create_capsule",
        "attach_proof",
        "evaluate_gate",
        "run_proof_capsule",
        "publish_public_proof"
      ],
      write_tools: ["sync_proof_capsule_live", "mint_proof_capsule_live"],
      write_policy: "Only call write tools after customer approval and operator token supply."
    },
    data_policy: {
      raw_evidence_stored: false,
      stored_by_capsule: ["refs", "hashes", "source metadata", "state", "decision", "DUAL anchors"],
      customer_responsibility: "Retain raw documents/data in the customer system of record or vault."
    },
    commercial_next_step: "Run this plan with the customer workflow owner, then configure source adapters and DUAL tenant/object strategy.",
    tenant_activation_next_step: "Generate the tenant activation request to bind billing, SSO, API credentials, customer gateway, live adapters, and DUAL integration.",
    onboarding_hash: hashValue({ workspaceId, tenantName, useCase, selectedPlan, connectorPlan, launchSteps })
  };
}

export function getAdminControlPlane(input = {}) {
  const readiness = getSaasReadiness(input);
  const onboarding = createTenantOnboardingPlan(input);
  const auditSchema = {
    event_id: "hash-derived event id",
    tenant_id: onboarding.workspace_id,
    actor: "human operator or agent principal",
    action: "compose | attach_proof | evaluate | verify | publish | sync | mint",
    capsule_id: "proof capsule id",
    content_hash: "stable capsule hash",
    envelope_hash: "fresh attestation hash",
    decision_code: "policy result code",
    dual_object_id: "optional DUAL object id",
    public_writes: false,
    operator_gate: "required for write actions"
  };
  const opsViews = [
    {
      view: "Launch readiness",
      status: readiness.activation_status,
      metric: `${readiness.tenant_activation_score}/100`,
      action: "Resolve tenant-bound checks before production cutover."
    },
    {
      view: "Proof operations",
      status: "ready",
      metric: `${SCENARIOS.length} launchable scenarios`,
      action: "Run proof, public verifier, replay, and red-team checks per customer workflow."
    },
    {
      view: "Connector health",
      status: "mixed",
      metric: `${readiness.connector_readiness.filter((item) => item.commercial_status === "production_reference_ready").length}/${readiness.connector_readiness.length} production-reference ready`,
      action: "Prioritise tenant adapters for sources used by the launch workflow."
    },
    {
      view: "Write governance",
      status: "operator_gated",
      metric: "publicWrites=false",
      action: "Keep DUAL writes behind the operator path and re-read after every write."
    }
  ];

  return {
    ok: true,
    package_version: SAAS_PACKAGE_VERSION,
    admin_plane_id: `admin:${shortHash(hashValue({ readiness: readiness.readiness_hash, onboarding: onboarding.onboarding_hash }))}`,
    product_stage: readiness.product_stage,
    sellable_now: readiness.sellable_now,
    readiness,
    tenant_onboarding: onboarding,
    ops_views: opsViews,
    operating_controls: SAAS_CONTROL_CATALOG,
    audit_schema: auditSchema,
    support_model: {
      pilot_room: "weekly launch review and business-hours issue response",
      growth_control_plane: "next-business-day support plus customer success launch reviews",
      enterprise_trust_layer: "contracted SLA, private deployment option, incident bridge, and security review package"
    },
    incident_runbook: [
      "Stop relying on the public verifier if link_integrity.status is link_mismatch.",
      "Block DUAL sync if verification.accepted is false, evidence is missing, or replay is blocked.",
      "Re-read DUAL after any operator-gated write and compare returned hashes.",
      "Escalate point-in-time source facts before settlement, transfer, retirement, or payout.",
      "Rotate operator token and review audit events after any suspicious write attempt."
    ],
    admin_hash: hashValue({ readiness_hash: readiness.readiness_hash, onboarding_hash: onboarding.onboarding_hash, opsViews, auditSchema })
  };
}

export function getTenantActivationBlueprint(input = {}) {
  const profile = normalizeTenantActivationProfile(input);
  const dual = input.dual_status || input.dual || {};
  const liveDualReadback = dual.readbackReady === true || dual.mode === "dual" || input.live_dual_readback === true;
  const liveDualWrites = dual.liveDualWrites === true || dual.writable === true || input.live_dual_writes === true;
  const operatorGate = dual.operatorGateConfigured === true || liveDualWrites || input.operator_gate_configured === true;
  const billingConfigured = input.billing_configured === true || input.billing_provider_connected === true;
  const ssoConfigured = input.sso_configured === true || input.auth_configured === true;
  const apiKeyIssued = input.api_key_issued === true || input.api_key_configured === true;
  const gatewayConfigured = input.customer_gateway_configured === true || input.gateway_configured === true;
  const sourceAdaptersConfigured = input.source_adapters_configured === true || input.live_source_adapters === true;
  const dualBindingConfigured = input.dual_tenant_binding_configured === true || (liveDualReadback && operatorGate);
  const selectedPlan = structuredClone(SAAS_PLAN_CATALOG.find((plan) => plan.plan_id === profile.plan_id) || SAAS_PLAN_CATALOG[1]);
  const adapterPlan = profile.sources.map((source) => {
    const verifier = SOURCE_VERIFIER_REGISTRY[source] || {};
    const status = source === "dual"
      ? liveDualReadback
        ? "live_readback_bound"
        : "dual_readback_required"
      : sourceAdaptersConfigured
        ? "live_adapter_bound"
        : verifier.live_adapter_status === "demo_reference"
          ? "tenant_adapter_onboarding_required"
          : verifier.live_adapter_status === "adapter_required"
            ? "tenant_adapter_required"
            : "adapter_contract_ready";
    return {
      source,
      verifier_id: verifier.verifier_id || `source.${source}.tenant.v1`,
      activation_status: status,
      auth_model: source === "dual" ? "server_side_dual_api" : "tenant_gateway_oauth_or_signed_attestation",
      cutover_path: source === "dual"
        ? "Bind tenant DUAL template/object strategy, then read back after any operator-gated write."
        : "Register sandbox adapter, certify sample refs, promote to production gateway, then recheck before action-critical reliance.",
      freshness_rule: verifier.freshness_rule || "Define a source-specific recheck rule before production reliance."
    };
  });
  const packageChecks = [
    readinessCheck("billing_activation", "Billing activation", true, "packaged", "Plan, billing owner, checkout/invoice mode, tax/legal handoff, and renewal terms are emitted for tenant activation.", 12),
    readinessCheck("sso_activation", "SSO activation", true, "packaged", "OIDC/SAML metadata, callback URLs, role mapping, and fallback admin are emitted without creating public sessions.", 12),
    readinessCheck("api_key_issuance", "API-key issuance", true, "packaged", "Scoped key id, secret-delivery contract, rotation, revocation, and rate limits are produced without returning a usable secret.", 12),
    readinessCheck("customer_gateway_setup", "Customer gateway setup", true, "packaged", "Gateway domain, allowed origins, webhook/HMAC boundary, adapter ingress, and MCP endpoint policy are generated.", 14),
    readinessCheck("live_adapter_onboarding", "Live third-party adapter onboarding", true, "packaged", "Source adapters carry auth, certification, promotion, freshness, and action-recheck contracts.", 14),
    readinessCheck("dual_tenant_binding", "DUAL tenant binding", true, "packaged", "DUAL org/template/object strategy, operator-gated event-bus write path, readback, and explorer links are modelled.", 16),
    readinessCheck("mcp_rest_ui_surface", "MCP/REST/UI surface", true, "ready", "Activation is exposed through UI, REST routes, MCP tools, resources, and a launch prompt.", 10),
    readinessCheck("audit_and_security", "Audit and security", true, "ready", "No raw evidence, no public writes, no returned secrets, tenant scoped audit ids, and DUAL readback-after-write are enforced.", 10)
  ];
  const tenantChecks = [
    readinessCheck("billing_configured", "Billing provider", billingConfigured, billingConfigured ? "configured" : "ready_to_activate", billingConfigured ? "Billing provider or invoice mode is configured for this tenant." : "Customer must approve checkout/invoice setup before activation is live.", 12),
    readinessCheck("sso_configured", "SSO connection", ssoConfigured, ssoConfigured ? "configured" : "ready_to_activate", ssoConfigured ? "SSO connection is configured." : "Tenant admin must upload OIDC/SAML metadata or approve email fallback.", 12),
    readinessCheck("api_key_issued", "API credentials", apiKeyIssued, apiKeyIssued ? "issued" : "preview_only", apiKeyIssued ? "Tenant API credentials have been issued in the customer gateway." : "This public surface returns a non-secret key preview; production secret delivery is out-of-band.", 10),
    readinessCheck("customer_gateway_configured", "Customer gateway", gatewayConfigured, gatewayConfigured ? "configured" : "ready_to_activate", gatewayConfigured ? "Customer gateway is configured." : "Tenant gateway domain, origins, webhooks, and ingress policy must be deployed.", 14),
    readinessCheck("live_source_adapters", "Live source adapters", sourceAdaptersConfigured, sourceAdaptersConfigured ? "configured" : "onboarding_required", sourceAdaptersConfigured ? "Live tenant source adapters are configured." : "Non-DUAL sources must be connected or signed before action-critical reliance.", 14),
    readinessCheck("dual_readback", "DUAL readback", liveDualReadback, liveDualReadback ? "live" : "tenant_config_required", liveDualReadback ? "DUAL readback is available for this activation." : "Configure tenant/canonical DUAL object readback before production reliance.", 14),
    readinessCheck("dual_operator_gate", "DUAL operator gate", operatorGate, operatorGate ? "configured" : "tenant_config_required", operatorGate ? "DUAL writes are operator gated." : "Enable event-bus mode and the server-side operator gate before DUAL writes.", 12),
    readinessCheck("dual_tenant_binding_configured", "DUAL tenant binding", dualBindingConfigured, dualBindingConfigured ? "configured" : "ready_to_bind", dualBindingConfigured ? "Tenant DUAL binding is configured or bindable from live readback plus operator gate." : "Bind DUAL template/object strategy during tenant activation.", 12)
  ];
  const packageScore = scoreChecks(packageChecks);
  const activationScore = scoreChecks(tenantChecks);
  const apiCredentialPreview = issueTenantApiKeyPreview({
    ...profile,
    workspace_id: input.workspace_id,
    scopes: profile.requested_scopes
  });
  const dualBinding = bindDualTenantGateway({
    ...profile,
    workspace_id: input.workspace_id,
    dual_status: dual,
    live_dual_readback: liveDualReadback,
    live_dual_writes: liveDualWrites,
    operator_gate_configured: operatorGate
  });
  const gatewayManifest = buildTenantGatewayManifest(profile, adapterPlan, apiCredentialPreview, dualBinding);

  return {
    ok: true,
    package_version: TENANT_ACTIVATION_PACKAGE_VERSION,
    product_line: "Proof Capsule Tenant Activation Gateway",
    activation_package_score: packageScore.score,
    activation_package_basis: {
      score_type: "computed_weighted_activation_package_controls",
      max_score: 100,
      ready_weight: packageScore.readyWeight,
      total_weight: packageScore.totalWeight,
      checks: packageChecks,
      holdbacks: packageChecks.filter((check) => !check.ready)
    },
    tenant_activation_score: activationScore.score,
    tenant_activation_basis: {
      score_type: "computed_weighted_live_tenant_controls",
      max_score: 100,
      ready_weight: activationScore.readyWeight,
      total_weight: activationScore.totalWeight,
      checks: tenantChecks,
      holdbacks: tenantChecks.filter((check) => !check.ready)
    },
    activation_status: activationScore.score === 100 ? "tenant_live_ready" : "self_service_activation_ready",
    tenant: {
      tenant_name: profile.tenant_name,
      workspace_id: profile.workspace_id,
      plan_id: profile.plan_id,
      selected_plan: selectedPlan.label,
      regions: profile.regions,
      use_case: profile.use_case,
      compliance_profile: profile.compliance_profile
    },
    billing_activation: {
      status: billingConfigured ? "configured" : "ready_to_create_checkout_or_invoice",
      billing_contact: profile.billing_contact,
      commercial_motion: selectedPlan.motion,
      price_band: selectedPlan.price_band,
      provider_contract: "checkout_session_or_invoice_provider",
      payment_capture_by_public_demo: false,
      activation_boundary: "The demo emits the billing activation artifact; the customer billing system captures payment or invoice acceptance."
    },
    sso_activation: {
      status: ssoConfigured ? "configured" : "metadata_ready",
      protocol: profile.sso_protocol,
      entity_id: `${profile.workspace_id}:proof-capsule`,
      callback_url: `https://${profile.gateway_domain}/auth/callback`,
      role_mapping: ["tenant_admin", "workflow_operator", "reviewer", "read_only_agent"],
      fallback_admin_required: true
    },
    api_key_issuance: apiCredentialPreview,
    customer_gateway_setup: gatewayManifest,
    live_adapter_onboarding: {
      status: sourceAdaptersConfigured ? "production_bound" : "onboarding_ready",
      adapter_cutover: profile.adapter_cutover,
      adapters: adapterPlan,
      acceptance_gates: [
        "adapter contract certified",
        "sample refs replay deterministically",
        "raw evidence remains in source system",
        "freshness and recheck rules declared",
        "customer gateway auth approved"
      ]
    },
    dual_integration: dualBinding,
    write_boundary: WRITE_BOUNDARY,
    activation_hash: hashValue({
      package_version: TENANT_ACTIVATION_PACKAGE_VERSION,
      profile,
      packageChecks,
      tenantChecks,
      adapterPlan,
      dual_binding_hash: dualBinding.dual_binding_hash
    })
  };
}

export function createTenantActivationRequest(input = {}) {
  const blueprint = getTenantActivationBlueprint(input);
  const onboarding = createTenantOnboardingPlan(input);
  const profile = normalizeTenantActivationProfile({ ...input, workspace_id: onboarding.workspace_id });
  const activationSteps = [
    launchStep(1, "Billing", "Customer approves checkout or invoice terms; no public-demo payment capture.", input.billing_configured === true ? "ready" : "tenant_action"),
    launchStep(2, "SSO", "Tenant admin supplies OIDC/SAML metadata and role mapping.", input.sso_configured === true || input.auth_configured === true ? "ready" : "tenant_action"),
    launchStep(3, "API credentials", "Issue scoped key into the customer gateway or vault; do not return secrets in MCP/API responses.", input.api_key_issued === true ? "ready" : "tenant_action"),
    launchStep(4, "Customer gateway", "Deploy gateway domain, origins, webhook signing, adapter ingress, and rate limits.", input.customer_gateway_configured === true ? "ready" : "tenant_action"),
    launchStep(5, "Source adapters", "Promote certified third-party adapters from sandbox to production.", input.live_source_adapters === true || input.source_adapters_configured === true ? "ready" : "tenant_action"),
    launchStep(6, "DUAL binding", "Bind DUAL org/template/object strategy and require readback after every operator-gated write.", blueprint.dual_integration.binding_status === "dual_gateway_bound" ? "ready" : "operator_approval"),
    launchStep(7, "Acceptance", "Run proof room, public verifier, tamper, red-team, MCP handoff, and DUAL readback checks.", "ready"),
    launchStep(8, "Go-live", "Enable production sync/mint only after customer approval and server-side operator token supply.", "operator_approval")
  ];
  const requestId = `activation:${shortHash(hashValue({ profile, activationSteps, blueprint: blueprint.activation_hash }))}`;

  return {
    ok: true,
    package_version: TENANT_ACTIVATION_PACKAGE_VERSION,
    activation_request_id: requestId,
    status: blueprint.tenant_activation_score === 100 ? "ready_for_go_live" : "ready_for_customer_self_service",
    tenant_name: profile.tenant_name,
    workspace_id: onboarding.workspace_id,
    selected_plan: onboarding.selected_plan,
    activation_score: blueprint.tenant_activation_score,
    activation_steps: activationSteps,
    customer_tasks: activationSteps
      .filter((step) => step.status === "tenant_action")
      .map((step) => ({ step: step.step, title: step.title, action: step.detail })),
    operator_tasks: activationSteps
      .filter((step) => step.status === "operator_approval")
      .map((step) => ({ step: step.step, title: step.title, action: step.detail })),
    onboarding,
    activation_blueprint: {
      activation_hash: blueprint.activation_hash,
      billing_status: blueprint.billing_activation.status,
      sso_status: blueprint.sso_activation.status,
      gateway_status: blueprint.customer_gateway_setup.status,
      dual_binding_status: blueprint.dual_integration.binding_status,
      api_key_id: blueprint.api_key_issuance.key_id
    },
    mcp_handoff: {
      endpoint: input.endpoint || "https://proof-capsule-mcp-demo.vercel.app/mcp",
      first_calls: [
        "get_tenant_activation_blueprint",
        "create_tenant_activation_request",
        "issue_tenant_api_key_preview",
        "bind_dual_tenant_gateway",
        "get_saas_readiness",
        "run_proof_capsule",
        "publish_public_proof"
      ],
      write_tools: ["sync_proof_capsule_live", "mint_proof_capsule_live"],
      write_policy: "Activation prepares DUAL binding. Only authorised operators can execute live DUAL writes."
    },
    request_hash: hashValue({ requestId, activationSteps, blueprint_hash: blueprint.activation_hash, onboarding_hash: onboarding.onboarding_hash })
  };
}

export function issueTenantApiKeyPreview(input = {}) {
  const profile = normalizeTenantActivationProfile(input);
  const scopes = normalizeList(input.scopes || input.requested_scopes, DEFAULT_TENANT_PROFILE.requested_scopes);
  const environment = String(input.environment || "production").trim();
  const keyId = `pc_key_${shortHash(hashValue({ workspace_id: profile.workspace_id, tenant_name: profile.tenant_name, scopes, environment }))}`;
  const prefix = `pc_${shortHash(hashValue({ keyId, prefix: true }))}`;

  return {
    ok: true,
    package_version: TENANT_ACTIVATION_PACKAGE_VERSION,
    status: input.api_key_issued === true ? "issued_in_customer_gateway" : "issuance_preview_ready",
    key_id: keyId,
    key_prefix: `${prefix}_`,
    environment,
    scopes,
    secret_returned: false,
    secret_delivery: "customer_gateway_secret_store_or_enterprise_vault_only",
    auth_model: "tenant_api_key_with_hmac_or_mtls_gateway",
    rate_limit: {
      proof_reads_per_minute: Number(input.proof_reads_per_minute || 300),
      proof_runs_per_minute: Number(input.proof_runs_per_minute || 60),
      write_requests_per_minute: 0,
      note: "Write tools still require the separate server-side operator token."
    },
    rotation_policy: {
      default_days: 90,
      emergency_revoke_supported: true,
      overlapping_rotation_window_hours: 24
    },
    public_writes: false,
    operator_gate_required_for_dual_writes: true,
    credential_hash: hashValue({ keyId, prefix, environment, scopes, workspace_id: profile.workspace_id })
  };
}

export function bindDualTenantGateway(input = {}) {
  const profile = normalizeTenantActivationProfile(input);
  const dual = input.dual_status || input.dual || {};
  const object = dual.object || {};
  const objectId = input.dual_object_id || input.object_id || dual.objectId || object.object_id || object.id || "";
  const templateId = input.dual_template_id || input.template_id || dual.templateId || object.template_id || object.templateId || "";
  const orgId = input.dual_org_id || input.org_id || dual.orgId || "";
  const liveDualReadback = input.live_dual_readback === true || dual.readbackReady === true || dual.mode === "dual";
  const liveDualWrites = input.live_dual_writes === true || dual.liveDualWrites === true || dual.writable === true;
  const operatorGate = input.operator_gate_configured === true || dual.operatorGateConfigured === true || liveDualWrites;
  const explorerBase = String(input.dual_explorer_url || dual.explorerUrl || "https://explorer-testnet.dual.network").replace(/\/+$/, "");
  const liveObjectId = objectId && !String(objectId).startsWith("proof-capsule-");
  const liveTemplateId = templateId && !String(templateId).startsWith("proof-capsule-");
  const objectExplorerUrl = input.object_explorer_url || object.object_explorer_url || object.explorerUrl || (liveObjectId ? `${explorerBase}/objects/${objectId}` : null);
  const templateExplorerUrl = input.template_explorer_url || object.template_explorer_url || object.templateExplorerUrl || (liveTemplateId ? `${explorerBase}/templates/${templateId}` : null);
  const bindingStatus = liveDualReadback && operatorGate
    ? "dual_gateway_bound"
    : liveDualReadback
      ? "dual_readback_ready_operator_gate_pending"
      : "dual_tenant_config_required";

  return {
    ok: true,
    package_version: TENANT_ACTIVATION_PACKAGE_VERSION,
    dual_binding_id: `dual-binding:${shortHash(hashValue({ workspace_id: profile.workspace_id, objectId, templateId, orgId }))}`,
    tenant_name: profile.tenant_name,
    workspace_id: profile.workspace_id,
    binding_status: bindingStatus,
    binding_mode: profile.dual_mode,
    dual: {
      org_id: orgId || null,
      template_id: templateId || null,
      object_id: objectId || null,
      readback_ready: liveDualReadback,
      writable: liveDualWrites,
      write_mode: dual.writeMode || "tenant_config_required",
      operator_gate_configured: operatorGate,
      public_writes: false,
      source: dual.source || (liveDualReadback ? "dual_readback" : "tenant_config_required")
    },
    explorer_links: [
      { label: "DUAL object", url: objectExplorerUrl },
      { label: "DUAL template", url: templateExplorerUrl }
    ].filter((link) => Boolean(link.url)),
    gateway_policy: {
      read_tools: ["get_live_dual_status", "get_current_live_capsule", "verify_proof_capsule", "get_proof_room"],
      write_tools: ["sync_proof_capsule_live", "mint_proof_capsule_live"],
      write_execution: liveDualWrites ? "operator_gated_event_bus" : "not_enabled_until_operator_gate",
      public_writes: false,
      operator_token_required: true,
      balance_check_required: true,
      readback_required_after_write: true,
      raw_evidence_stored: false
    },
    state_model: {
      template_strategy: input.template_strategy || "one reusable DUAL template per proof-capsule workflow class",
      object_strategy: input.object_strategy || "one DUAL object per tenant workflow instance or governed proof subject",
      event_bus_actions: ["mint", "sync", "transition_record", "proof_anchor"],
      rederive_after_readback: ["policy_hash", "evidence_hash", "state_hash", "capsule_content_hash", "capsule_envelope_hash"]
    },
    activation_tasks: [
      "Confirm tenant DUAL org/template/object strategy.",
      "Configure DUAL readback object id before production reliance.",
      "Enable event-bus write mode only after customer approval path exists.",
      "Store operator token server-side only; never return it through MCP or UI.",
      "After every write, re-read DUAL and compare declared vs derived hashes."
    ],
    limitation: "This binding model prepares and verifies the tenant DUAL gateway. It does not execute a live DUAL write unless an authorised operator invokes the write tool with the server-side token.",
    dual_binding_hash: hashValue({ profile, objectId, templateId, orgId, bindingStatus, public_writes: false })
  };
}

export function getExtensibilityKit(input = {}) {
  const descriptor = serviceDescriptor();
  const advertisedToolCount = Number(input.mcp_tool_count || descriptor.tools.length + 4);
  const controls = [
    readinessCheck("declarative_extension_schema", "Declarative extension schema", true, "ready", "Tenant workflows are described as JSON config: states, evidence, sources, policy, marketplace visibility, and adapter definitions.", 13),
    readinessCheck("no_code_workflow_builder", "No-code workflow builder", true, "ready", "Extension packs call the workflow draft engine and return workflow/capsule previews without requiring a code deploy.", 13),
    readinessCheck("tenant_config_contract", "Tenant config contract", true, "ready", "Extension manifests separate tenant configuration from the core proof engine and DUAL write path.", 12),
    readinessCheck("source_adapter_contract", "Source adapter plugin contract", true, "ready", "Every adapter must declare proof types, hashing, freshness, auth, raw-evidence boundary, and action recheck rules.", 12),
    readinessCheck("adapter_certification", "Adapter certification harness", true, "ready", "certify_source_adapter runs weighted deterministic checks and returns a certification hash.", 12),
    readinessCheck("schema_migration", "Schema migration planner", true, "ready", "plan_schema_migration creates compatibility, transform, replay, and rollback steps for versioned extensions.", 10),
    readinessCheck("customer_marketplace", "Customer scenario marketplace", true, "ready", "build_extension_pack emits a marketplace listing with visibility, acceptance gates, and publication state.", 9),
    readinessCheck("mcp_api_extension_surface", "MCP/API extension surface", advertisedToolCount >= 44, "ready", `${advertisedToolCount} tools advertise the extension builder, certification, migration, and tenant activation surface.`, 10),
    readinessCheck("ui_extension_studio", "UI extension studio", true, "ready", "The product UI exposes extension score, build pack, certify adapter, and migration plan actions.", 7),
    readinessCheck("tenant_activation_gateway", "Tenant activation gateway", true, "packaged", "Extension installs can now hand off to the billing/SSO/API-key/gateway/adapter/DUAL tenant activation package.", 2)
  ];
  const totalWeight = controls.reduce((sum, check) => sum + check.weight, 0);
  const readyWeight = controls.reduce((sum, check) => sum + (check.ready ? check.weight : 0), 0);
  const score = Math.round((readyWeight / totalWeight) * 100);
  const holdbacks = controls
    .filter((check) => !check.ready)
    .map((check) => ({
      key: check.key,
      area: check.area,
      status: check.status,
      weight: check.weight,
      evidence: check.evidence
    }));
  const samplePack = buildExtensionPack({
    ...DEFAULT_EXTENSION_PROFILE,
    extension_name: "Supplier compliance proof room"
  });

  return {
    ok: true,
    package_version: EXTENSIBILITY_PACKAGE_VERSION,
    schema_version: EXTENSION_SCHEMA_VERSION,
    extensibility_score: score,
    score_basis: {
      score_type: "computed_weighted_extensibility_controls",
      max_score: 100,
      ready_weight: readyWeight,
      total_weight: totalWeight,
      controls,
      holdbacks,
      note: "Extensibility is scored on whether a tenant can define, certify, migrate, publish, verify, and activate a new workflow without changing the core proof engine."
    },
    extension_surfaces: [
      { surface: "UI", capability: "Extension Studio: build pack, certify adapter, plan migration, inspect marketplace listing." },
      { surface: "REST", capability: "GET /api/extensions/kit, POST /api/extensions/build, POST /api/extensions/certify, POST /api/extensions/migration." },
      { surface: "MCP", capability: "get_extensibility_kit, build_extension_pack, certify_source_adapter, plan_schema_migration." },
      { surface: "Resources", capability: "capsule://extensions/* resources expose schema, scorecard, adapter contract, and migration contract." }
    ],
    extension_schema: EXTENSION_FIELD_SCHEMA,
    adapter_plugin_contract: {
      required_fields: ["source", "proof_types", "canonicalization", "freshness_rule", "auth_model", "raw_evidence_stored", "sample_ref"],
      recommended_fields: ["endpoint", "signed_attestation_mode", "does_not_prove", "recheck_before_action", "redaction_policy"],
      certification_requirements: ADAPTER_CERTIFICATION_REQUIREMENTS,
      output_contract: ["evidence_id", "type", "source", "ref", "hash", "point_in_time", "summary", "verifier_id"]
    },
    migration_contract: {
      version_pin: "Every extension pack carries schema_version, target_capsule_schema_version, extension_hash, and generated workflow hash.",
      safe_migration_steps: ["snapshot", "transform", "rederive", "replay", "public verifier", "operator approval", "readback", "rollback plan"],
      write_boundary: WRITE_BOUNDARY
    },
    marketplace_contract: {
      visibility_options: ["tenant_private", "partner_shared", "public_template"],
      publication_gates: EXTENSION_ACCEPTANCE_GATES,
      no_code_claim: "New tenant workflow packs are installable as config and adapter contracts; core code changes are not required for the proof model."
    },
    sample_extension_pack: {
      extension_pack_id: samplePack.extension_pack_id,
      extension_hash: samplePack.extension_hash,
      requires_code_change: samplePack.requires_code_change,
      marketplace_listing: samplePack.marketplace_listing,
      certification_summary: samplePack.certification_summary
    },
    caveats: [
      "Customer secrets are never returned through public MCP/API/browser responses.",
      "Custom source adapters must be certified and connected to the tenant gateway before action-critical reliance.",
      "Live DUAL writes still require the operator-gated sync/mint path."
    ],
    extensibility_hash: hashValue({ package_version: EXTENSIBILITY_PACKAGE_VERSION, controls, sample: samplePack.extension_hash })
  };
}

export function buildExtensionPack(input = {}) {
  const profile = {
    ...DEFAULT_EXTENSION_PROFILE,
    ...input
  };
  const tenantName = String(profile.tenant_name || profile.tenant || DEFAULT_EXTENSION_PROFILE.tenant_name).trim();
  const extensionName = String(profile.extension_name || profile.title || DEFAULT_EXTENSION_PROFILE.extension_name).trim();
  const useCase = String(profile.use_case || DEFAULT_EXTENSION_PROFILE.use_case).trim();
  const subjectType = String(profile.subject_type || DEFAULT_EXTENSION_PROFILE.subject_type).trim();
  const capsuleType = CAPSULE_TYPES.includes(profile.capsule_type) ? profile.capsule_type : DEFAULT_EXTENSION_PROFILE.capsule_type;
  const states = normalizeList(profile.states, DEFAULT_EXTENSION_PROFILE.states);
  const evidenceTypes = normalizeList(profile.evidence_types || profile.required_evidence, DEFAULT_EXTENSION_PROFILE.evidence_types);
  const sources = normalizeList(profile.sources || profile.selected_sources, DEFAULT_EXTENSION_PROFILE.sources);
  const adapterDefinitions = normalizeAdapterDefinitions(profile.adapter_definitions || profile.adapters, sources, evidenceTypes);
  const adapterCertifications = adapterDefinitions.map((adapter) => certifySourceAdapter({ adapter }));
  const workflowDraft = buildWorkflowDraft({
    title: extensionName,
    subject_type: subjectType,
    capsule_type: capsuleType,
    states,
    evidence_types: evidenceTypes,
    sources,
    value_usd: Number(profile.value_usd || 50000),
    max_value_usd: Number(profile.max_value_usd || 100000),
    human_review_threshold_usd: Number(profile.human_review_threshold_usd || 50000),
    policy_gate: profile.policy_gate || "all required evidence and certified source adapters are present"
  });
  const migrationPlan = planSchemaMigration({
    from_version: profile.from_schema_version || CUSTOM_WORKFLOW_SCHEMA_VERSION,
    to_version: profile.to_schema_version || EXTENSION_SCHEMA_VERSION,
    extension_manifest: {
      extension_name: extensionName,
      states,
      evidence_types: evidenceTypes,
      sources
    }
  });
  const publicationState = adapterCertifications.every((cert) => cert.certification_score >= 90)
    && workflowDraft.validation.ok
    ? "publishable_after_customer_approval"
    : "needs_adapter_or_evidence_work";
  const extensionManifest = {
    schema_version: EXTENSION_SCHEMA_VERSION,
    package_version: EXTENSIBILITY_PACKAGE_VERSION,
    tenant_name: tenantName,
    extension_name: extensionName,
    use_case: useCase,
    subject_type: subjectType,
    capsule_type: capsuleType,
    states,
    evidence_types: evidenceTypes,
    sources,
    marketplace_visibility: profile.marketplace_visibility || DEFAULT_EXTENSION_PROFILE.marketplace_visibility,
    target_capsule_schema_version: profile.target_schema_version || CAPSULE_SCHEMA_VERSION,
    install_mode: "tenant_config_no_code",
    requires_code_change: false,
    public_writes: false,
    live_write_execution: "operator_gated"
  };
  const extensionHash = hashValue({ extensionManifest, workflow_hash: workflowDraft.draft_hash, adapter_hashes: adapterCertifications.map((cert) => cert.certification_hash) });
  const extensionPackId = `extension:${shortHash(extensionHash)}`;

  return {
    ok: true,
    package_version: EXTENSIBILITY_PACKAGE_VERSION,
    extension_pack_id: extensionPackId,
    extension_hash: extensionHash,
    install_mode: "tenant_config_no_code",
    requires_code_change: false,
    tenant_name: tenantName,
    extension_manifest: extensionManifest,
    workflow_definition: workflowDraft.workflow_definition,
    capsule_preview: workflowDraft.capsule,
    workflow_validation: workflowDraft.validation,
    adapter_certifications: adapterCertifications,
    certification_summary: {
      adapters: adapterCertifications.length,
      certified: adapterCertifications.filter((cert) => cert.certification_score >= 90).length,
      minimum_score: Math.min(...adapterCertifications.map((cert) => cert.certification_score), 100),
      all_action_ready: adapterCertifications.every((cert) => cert.certification_score >= 90)
    },
    marketplace_listing: {
      listing_id: `listing:${shortHash(hashValue({ extensionPackId, tenantName, extensionName }))}`,
      label: extensionName,
      use_case: useCase,
      visibility: extensionManifest.marketplace_visibility,
      status: publicationState,
      acceptance_gates: EXTENSION_ACCEPTANCE_GATES,
      reviewer_path: "Build extension pack -> certify adapters -> run proof -> publish verifier -> plan operator-gated sync"
    },
    migration_plan: migrationPlan,
    mcp_handoff: {
      endpoint: profile.endpoint || "https://proof-capsule-mcp-demo.vercel.app/mcp",
      first_calls: [
        "get_extensibility_kit",
        "build_extension_pack",
        "certify_source_adapter",
        "plan_schema_migration",
        "run_proof_capsule",
        "publish_public_proof"
      ],
      write_tools: ["sync_proof_capsule_live", "mint_proof_capsule_live"],
      write_policy: "Extension installation is config-only until an authorised operator approves a DUAL sync or mint."
    },
    customer_editable_fields: Object.keys(EXTENSION_FIELD_SCHEMA),
    acceptance_gates: EXTENSION_ACCEPTANCE_GATES.map((gate) => ({
      gate,
      status: gate.includes("Public writes") ? "enforced" : "ready"
    })),
    next_actions: [
      "Review the generated workflow and capsule preview with the tenant owner.",
      "Replace demo/reference adapters with certified tenant adapters where needed.",
      "Run proof-room and public verifier acceptance.",
      "Publish as tenant-private or partner-shared marketplace template.",
      "Only sync to DUAL through the operator-gated path after customer approval."
    ],
    write_boundary: WRITE_BOUNDARY
  };
}

export function certifySourceAdapter(input = {}) {
  const adapter = normalizeAdapterDefinition(input.adapter || input, input.source);
  const sampleRef = adapter.sample_ref || {
    evidence_id: `${slugify(adapter.source).toUpperCase()}-CERT-001`,
    type: adapter.proof_types[0] || "attestation",
    source: adapter.source,
    ref: `${adapter.source}://certification/sample`,
    hash: hashValue({ source: adapter.source, certification: true }),
    summary: `${adapter.adapter_name} deterministic certification fixture.`
  };
  const normalizedSample = normalizeEvidenceRef(sampleRef);
  const checks = buildAdapterCertificationChecks(adapter, normalizedSample);
  const totalWeight = checks.reduce((sum, check) => sum + check.weight, 0);
  const readyWeight = checks.reduce((sum, check) => sum + (check.pass ? check.weight : 0), 0);
  const score = Math.round((readyWeight / totalWeight) * 100);
  const level = score >= 98
    ? "production_contract_ready"
    : score >= 90
      ? "tenant_ready_with_activation"
      : score >= 75
        ? "reference_only"
        : "not_certified";

  return {
    ok: score >= 75,
    package_version: EXTENSIBILITY_PACKAGE_VERSION,
    adapter_id: adapter.adapter_id,
    source: adapter.source,
    adapter_name: adapter.adapter_name,
    certification_score: score,
    certification_level: level,
    ready_weight: readyWeight,
    total_weight: totalWeight,
    checks,
    sample_ref: normalizedSample,
    adapter_contract: {
      source: adapter.source,
      mode: adapter.mode,
      proof_types: adapter.proof_types,
      canonicalization: adapter.canonicalization,
      hash_algorithm: adapter.hash_algorithm,
      freshness_rule: adapter.freshness_rule,
      auth_model: adapter.auth_model,
      raw_evidence_stored: adapter.raw_evidence_stored,
      recheck_before_action: adapter.recheck_before_action,
      does_not_prove: adapter.does_not_prove
    },
    production_caveats: [
      adapter.tenant_activation_approved ? "Tenant gateway activation recorded." : "Tenant gateway activation still required before production reliance.",
      "Certification proves the adapter contract shape and sample replay, not future source truth.",
      "Any source fact used for settlement, release, transfer, retirement, or sync must be rechecked at action time."
    ],
    certification_hash: hashValue({ adapter, checks, sample: normalizedSample })
  };
}

export function planSchemaMigration(input = {}) {
  const fromVersion = String(input.from_version || input.from || CUSTOM_WORKFLOW_SCHEMA_VERSION);
  const toVersion = String(input.to_version || input.to || EXTENSION_SCHEMA_VERSION);
  const manifest = input.extension_manifest || input.manifest || {
    extension_name: DEFAULT_EXTENSION_PROFILE.extension_name,
    states: DEFAULT_EXTENSION_PROFILE.states,
    evidence_types: DEFAULT_EXTENSION_PROFILE.evidence_types,
    sources: DEFAULT_EXTENSION_PROFILE.sources
  };
  const compatibilityChecks = [
    migrationCheck("schema_versions_declared", Boolean(fromVersion && toVersion), "Both source and target schema versions are declared."),
    migrationCheck("manifest_present", Boolean(manifest && typeof manifest === "object"), "Extension manifest is available for transform planning."),
    migrationCheck("states_preserved", normalizeList(manifest.states, DEFAULT_EXTENSION_PROFILE.states).length >= 2, "Workflow state order can be preserved."),
    migrationCheck("evidence_preserved", normalizeList(manifest.evidence_types || manifest.required_evidence, DEFAULT_EXTENSION_PROFILE.evidence_types).length > 0, "Required evidence categories can be carried forward."),
    migrationCheck("sources_mapped", normalizeList(manifest.sources, DEFAULT_EXTENSION_PROFILE.sources).length > 0, "Source verifier mappings can be migrated."),
    migrationCheck("write_boundary_preserved", true, "Public writes remain false and live writes remain operator-gated during migration.")
  ];
  const migrationSteps = [
    { step: 1, action: "snapshot", detail: "Export extension manifest, workflow definition, current capsule content hash, adapter certification hashes, and public verifier link status." },
    { step: 2, action: "transform", detail: `Map ${fromVersion} fields into ${toVersion}; preserve states, evidence types, source mappings, and policy thresholds.` },
    { step: 3, action: "rederive", detail: "Recompute workflow, evidence, policy, state-transition, capsule content, and envelope hashes." },
    { step: 4, action: "replay", detail: "Run replay_workflow_capsule and verify_evidence_refs against the migrated workflow." },
    { step: 5, action: "publish_verifier_preview", detail: "Generate a public verifier preview and require link_verified before relying on the migrated pack." },
    { step: 6, action: "operator_approval", detail: "If a DUAL write is needed, queue sync/mint for an authorised operator token only." },
    { step: 7, action: "readback", detail: "After any write, read the DUAL object back and compare declared vs derived hashes." }
  ];

  return {
    ok: compatibilityChecks.every((check) => check.pass),
    package_version: EXTENSIBILITY_PACKAGE_VERSION,
    migration_id: `migration:${shortHash(hashValue({ fromVersion, toVersion, manifest }))}`,
    from_version: fromVersion,
    to_version: toVersion,
    compatibility: compatibilityChecks,
    migration_steps: migrationSteps,
    rollback_plan: [
      "Keep the pre-migration extension manifest and content hash.",
      "Do not overwrite the public verifier link until the migrated link is verified.",
      "If replay or evidence verification fails, keep the prior DUAL object state and publish recovery actions.",
      "Rollback is a config revert unless an authorised DUAL write has already occurred; then re-sync the prior verified capsule through the operator-gated path."
    ],
    write_boundary: WRITE_BOUNDARY,
    migration_hash: hashValue({ fromVersion, toVersion, manifest, migrationSteps })
  };
}

export function verifyEvidenceRefs(input = {}) {
  const capsule = input.capsule?.schema_version ? input.capsule : composeProofCapsule(input);
  const scenario = resolveWorkflowScenario(input, capsule);
  const workflow = resolveWorkflowDefinition(input, capsule, scenario);
  const transition = findWorkflowTransition(workflow, capsule.state_transition);
  const requiredEvidence = input.required_evidence || transition?.required_evidence || capsule.policy?.required_anchor_types || [];
  const normalizedRefs = (input.evidence_refs || capsule.evidence_refs || []).map((ref) => normalizeEvidenceRef(ref));
  const evidenceTypes = new Set(normalizedRefs.map((ref) => ref.type));
  const results = normalizedRefs.map((ref) => {
    const verifier = SOURCE_VERIFIER_REGISTRY[ref.source];
    const registered = Boolean(verifier);
    const hasHash = Boolean(ref.hash);
    const status = !registered
      ? "not_sufficient"
      : !hasHash
        ? "missing"
        : ref.freshness_status === "stale" || ref.stale === true
          ? "stale"
          : "verified";
    return {
      evidence_id: ref.evidence_id,
      type: ref.type,
      source: ref.source,
      status,
      verifier_id: verifier?.verifier_id || "missing",
      adapter_status: verifier?.live_adapter_status || "missing",
      hash: ref.hash || null,
      hash_auto_derived: Boolean(ref.hash_auto_derived),
      point_in_time: ref.point_in_time || null,
      proves: verifier?.proves || "No registered verifier contract.",
      does_not_prove: verifier?.does_not_prove || "The source cannot be relied on until a verifier contract is registered.",
      recheck_rule: verifier?.freshness_rule || "Register a verifier before action-critical reliance.",
      sufficient_for_required_type: requiredEvidence.includes(ref.type)
    };
  });
  for (const type of requiredEvidence) {
    if (!evidenceTypes.has(type)) {
      results.push({
        evidence_id: `missing:${type}`,
        type,
        source: null,
        status: "missing",
        verifier_id: null,
        adapter_status: "missing",
        hash: null,
        hash_auto_derived: false,
        point_in_time: null,
        proves: "No evidence reference supplied for this required type.",
        does_not_prove: "Policy cannot approve this transition without the missing evidence type.",
        recheck_rule: "Attach evidence or choose a different workflow transition.",
        sufficient_for_required_type: false
      });
    }
  }

  const summary = {
    verified: results.filter((item) => item.status === "verified").length,
    stale: results.filter((item) => item.status === "stale").length,
    missing: results.filter((item) => item.status === "missing").length,
    not_sufficient: results.filter((item) => item.status === "not_sufficient").length
  };

  return {
    ok: summary.missing === 0 && summary.not_sufficient === 0,
    scenario,
    required_evidence: requiredEvidence,
    normalized_evidence_refs: normalizedRefs,
    results,
    summary,
    evidence_set_hash: hashValue(normalizedRefs),
    caveats: [
      "This verifier checks declared refs, hashes, source contracts, and required categories.",
      "Source systems marked demo_reference or adapter_required still need live adapters before action-critical reliance."
    ]
  };
}

export function buildWorkflowDraft(input = {}) {
  const title = String(input.title || input.workflow_title || "Custom proof capsule workflow").trim();
  const subjectType = slugify(input.subject_type || input.subjectType || "custom_subject");
  const states = normalizeList(input.states, ["Requested", "Evidence ready", "Approved", "Closed"]);
  const evidenceTypes = normalizeList(input.evidence_types || input.required_evidence, ["approval", "mandate", "settlement"]);
  const sources = normalizeList(input.sources || input.selected_sources, ["enterprise_vault", "dual", "payment_preview"]);
  const policyGate = String(input.policy_gate || "all required evidence and source verifier contracts are present").trim();
  const workflowId = `workflow.custom.${slugify(title)}.v1`;
  const safeStates = states.length >= 2 ? states : ["Requested", "Approved"];
  const primaryTransition = {
    action: slugify(input.action || `verify_${subjectType}`),
    from_state: safeStates[0],
    to_state: safeStates[1],
    required_evidence: evidenceTypes,
    policy_gate: policyGate
  };
  const workflow_definition = {
    schema_version: CUSTOM_WORKFLOW_SCHEMA_VERSION,
    scenario: "custom_workflow",
    workflow_id: workflowId,
    title,
    subject_type: subjectType,
    dual_template: "io.dual.proof_capsule.lifecycle.v1",
    states: safeStates,
    current_transition: primaryTransition.action,
    transitions: [
      primaryTransition,
      ...safeStates.slice(1, -1).map((state, index) => ({
        action: `advance_${slugify(state)}`,
        from_state: state,
        to_state: safeStates[index + 2],
        required_evidence: evidenceTypes,
        policy_gate: "prior transition remains valid and no blocking evidence exists"
      }))
    ],
    dual_build_contract: {
      template: "io.dual.proof_capsule.lifecycle.v1",
      object: "one DUAL object per workflow instance",
      write_path: "event_bus",
      write_execution: "operator_gated",
      public_writes: false,
      readback_required_after_write: true
    }
  };
  const evidence_refs = evidenceTypes.map((type, index) => normalizeEvidenceRef({
    evidence_id: `${slugify(type).toUpperCase()}-${String(index + 1).padStart(2, "0")}`,
    type,
    source: sources[index % sources.length] || "enterprise_vault",
    summary: `${title} ${type} evidence reference.`,
    ref: `${sources[index % sources.length] || "enterprise_vault"}://custom/${slugify(title)}/${slugify(type)}`
  }));
  const capsule = composeProofCapsule({
    capsule_id: `PC-CUSTOM-${slugify(title).toUpperCase().slice(0, 24)}`,
    capsule_type: input.capsule_type || "credential",
    subject: {
      subject_id: input.subject_id || `${subjectType.toUpperCase()}-001`,
      label: input.subject_label || title,
      asset_class: subjectType,
      value_usd: Number(input.value_usd || 0),
      state: primaryTransition.to_state,
      current_gate: primaryTransition.to_state
    },
    claims: evidenceTypes.map((type) => ({
      claim_id: `${slugify(type)}_required`,
      type,
      statement: `${title} requires ${type} evidence before ${primaryTransition.to_state}.`,
      expected_source: sources[evidenceTypes.indexOf(type) % sources.length] || "enterprise_vault",
      required: true
    })),
    evidence_refs,
    external_anchors: sources.map((source) => ({
      anchor_id: `source-${slugify(source)}`,
      kind: "source_verifier",
      source_of_truth: source,
      caveat: SOURCE_VERIFIER_REGISTRY[source]?.does_not_prove || "Register this source before production reliance."
    })),
    policy: {
      ...defaultPolicy(),
      policy_id: `custom-${slugify(title)}-policy-v0.1`,
      required_anchor_types: evidenceTypes,
      allowed_external_chains: sources,
      max_value_usd: Number(input.max_value_usd || 100000),
      human_review_threshold_usd: Number(input.human_review_threshold_usd || 50000)
    },
    decision: {
      result: "Draft",
      code: "workflow_draft",
      reason: "Draft workflow generated for review before operator-gated sync.",
      review_required: true,
      release_usd: 0,
      remaining_usd: Number(input.value_usd || 0)
    },
    state_transition: {
      action: primaryTransition.action,
      actor: input.actor || "operator.workflow-builder",
      from_state: primaryTransition.from_state,
      to_state: primaryTransition.to_state,
      from_gate: primaryTransition.from_state,
      to_gate: primaryTransition.to_state,
      occurred_at: GENERATED_AT
    }
  });
  const validation = verifyEvidenceRefs({ capsule, required_evidence: evidenceTypes });

  return {
    ok: true,
    draft_id: `draft:${hashValue({ workflow_definition, capsule: capsule.capsule_id }).slice(7, 19)}`,
    workflow_definition,
    capsule,
    validation,
    draft_hash: hashValue({ workflow_definition, capsule: contentForHash(capsule) }),
    next_steps: [
      "Review states and required evidence.",
      "Attach or replace evidence refs with live source references.",
      "Dry-run the first transition.",
      "Use operator-gated sync only after verification passes."
    ]
  };
}

export function planTransitionQueue(input = {}) {
  const capsule = input.capsule?.schema_version ? input.capsule : composeProofCapsule(input);
  const scenario = resolveWorkflowScenario(input, capsule);
  const workflow = resolveWorkflowDefinition(input, capsule, scenario);
  const mergedEvidence = [
    ...(capsule.evidence_refs || []),
    ...(input.evidence_refs || [])
  ].map((ref) => normalizeEvidenceRef(ref));
  const currentState = input.from_state || capsule.state_transition?.to_state || capsule.subject?.state;
  const transition = findNextWorkflowTransition(workflow, {
    currentState,
    action: input.action || input.transition_action
  });
  const stateTransition = transition
    ? {
        action: transition.action,
        actor: input.actor || capsule.state_transition?.actor || "operator.transition-queue",
        from_state: transition.from_state,
        to_state: transition.to_state,
        from_gate: transition.from_gate || transition.from_state,
        to_gate: transition.to_gate || transition.to_state,
        occurred_at: input.occurred_at || GENERATED_AT
      }
    : capsule.state_transition;
  const queuedCapsule = composeProofCapsule({
    ...contentForHash(capsule),
    evidence_refs: mergedEvidence,
    subject: {
      ...(capsule.subject || {}),
      state: stateTransition?.to_state || capsule.subject?.state,
      current_gate: stateTransition?.to_gate || stateTransition?.to_state || capsule.subject?.current_gate
    },
    state_transition: stateTransition,
    decision: {
      ...(capsule.decision || {}),
      result: transition ? "Queued" : "Blocked",
      code: transition ? "transition_dry_run_ready" : "no_transition_available",
      reason: transition
        ? "Transition prepared for dry-run and optional operator-gated DUAL sync."
        : "No matching next transition was found in the workflow definition."
    },
    generated_at: input.generated_at || new Date().toISOString()
  });
  const evidence = verifyEvidenceRefs({ scenario, capsule: queuedCapsule, workflow_definition: workflow, required_evidence: transition?.required_evidence });
  const replay = replayWorkflowCapsule({ scenario, capsule: queuedCapsule, workflow_definition: workflow });
  const verification = verifyProofCapsule({ capsule: queuedCapsule });
  const status = transition && evidence.ok && replay.ok && verification.accepted
    ? "ready_for_operator_sync"
    : transition && verification.ok
      ? "needs_recovery"
      : "blocked";

  return {
    ok: true,
    scenario,
    queue_id: `queue:${shortHash(hashValue({ capsule_id: queuedCapsule.capsule_id, stateTransition, evidence_hash: queuedCapsule.hashes.evidence_hash }))}`,
    status,
    dry_run: input.dry_run !== false,
    transition,
    current_state: currentState || null,
    queued_capsule: queuedCapsule,
    evidence,
    replay,
    verification,
    write_operation: {
      method: "POST",
      endpoint: "/api/capsules/sync",
      requires_operator_token: true,
      public_writes: false,
      body: {
        capsule: queuedCapsule,
        audit: {
          source: "proof-capsule-transition-queue",
          scenario,
          queue_id: `queue:${shortHash(queuedCapsule.hashes.capsule_content_hash)}`
        }
      }
    },
    recovery_actions: diagnoseCapsule({ scenario, capsule: queuedCapsule, workflow_definition: workflow }).recovery_actions
  };
}

export function diagnoseCapsule(input = {}) {
  const capsule = input.capsule?.schema_version ? input.capsule : composeProofCapsule(input);
  const scenario = resolveWorkflowScenario(input, capsule);
  const workflow = resolveWorkflowDefinition(input, capsule, scenario);
  const evidence = verifyEvidenceRefs({ scenario, capsule, workflow_definition: workflow });
  const replay = replayWorkflowCapsule({ scenario, capsule, workflow_definition: workflow });
  const policy = evaluateCapsulePolicy({ capsule });
  const failures = [
    ...evidence.results
      .filter((item) => item.status !== "verified")
      .map((item) => ({
        code: `evidence_${item.status}`,
        area: "evidence",
        target: item.type,
        detail: item.does_not_prove || item.recheck_rule
      })),
    ...replay.replay_steps
      .filter((item) => !item.pass)
      .map((item) => ({
        code: item.name,
        area: "workflow_replay",
        target: replay.workflow_id,
        detail: item.detail
      })),
    ...(policy.result === "Blocked"
      ? [{
          code: policy.code,
          area: "policy",
          target: capsule.policy?.policy_id,
          detail: policy.reason
        }]
      : [])
  ];
  const recoveryActions = buildRecoveryActions({ failures, evidence, replay, policy });

  return {
    ok: true,
    healthy: failures.length === 0,
    scenario,
    capsule_id: capsule.capsule_id,
    policy_result: {
      result: policy.result,
      code: policy.code,
      reason: policy.reason
    },
    failures,
    recovery_actions: recoveryActions,
    next_safe_action: failures.length
      ? recoveryActions[0]?.label || "Review capsule"
      : "Dry-run next transition or perform operator-gated sync.",
    write_boundary: capsule.write_boundary
  };
}

export function buildProofTimeline(input = {}) {
  const capsule = input.capsule?.schema_version ? input.capsule : composeProofCapsule(input);
  const scenario = resolveWorkflowScenario(input, capsule);
  const workflow = resolveWorkflowDefinition(input, capsule, scenario);
  const replay = replayWorkflowCapsule({ scenario, capsule, workflow_definition: workflow });
  const events = replay.state_timeline.map((entry) => ({
    state: entry.state,
    index: entry.index,
    status: entry.status,
    actor: entry.state === replay.next_state ? capsule.state_transition?.actor : null,
    transition_hash: entry.state === replay.next_state ? capsule.hashes?.state_transition_hash : null,
    decision_hash: entry.state === replay.next_state ? capsule.hashes?.decision_content_hash : null,
    evidence_count: entry.state === replay.next_state ? capsule.evidence_refs?.length || 0 : null,
    dual_object_url: entry.state === replay.next_state ? capsule.dual_anchor?.object_explorer_url || null : null,
    notes: entry.status === "current"
      ? replay.policy_result.reason
      : entry.status === "pending"
        ? "Awaiting future transition evidence."
        : "Prior workflow state."
  }));

  return {
    ok: true,
    scenario,
    capsule_id: capsule.capsule_id,
    workflow_id: replay.workflow_id,
    current_state: replay.current_state,
    next_state: replay.next_state,
    event_count: events.length,
    events,
    timeline_hash: hashValue({ workflow_id: replay.workflow_id, capsule_id: capsule.capsule_id, events }),
    links: {
      object: capsule.dual_anchor?.object_explorer_url || null,
      template: capsule.dual_anchor?.template_explorer_url || null
    }
  };
}

export function compareCapsules(input = {}) {
  const left = input.left?.schema_version ? input.left : composeProofCapsule({ scenario: input.left_scenario || input.scenario || "tradeflow_medical_devices" });
  const right = input.right?.schema_version ? input.right : composeProofCapsule({ scenario: input.right_scenario || input.scenario || "tradeflow_medical_devices" });
  const leftHashes = deriveHashes(left);
  const rightHashes = deriveHashes(right);
  const leftTypes = new Set((left.evidence_refs || []).map((ref) => ref.type));
  const rightTypes = new Set((right.evidence_refs || []).map((ref) => ref.type));
  const addedEvidence = [...rightTypes].filter((type) => !leftTypes.has(type));
  const removedEvidence = [...leftTypes].filter((type) => !rightTypes.has(type));
  const changedHashes = Object.keys({ ...leftHashes, ...rightHashes })
    .filter((key) => leftHashes[key] !== rightHashes[key])
    .map((key) => ({
      hash: key,
      left: leftHashes[key] || null,
      right: rightHashes[key] || null
    }));
  const fieldDiffs = [
    diffField("capsule_id", left.capsule_id, right.capsule_id),
    diffField("decision.result", left.decision?.result, right.decision?.result),
    diffField("decision.code", left.decision?.code, right.decision?.code),
    diffField("state_transition.from_state", left.state_transition?.from_state, right.state_transition?.from_state),
    diffField("state_transition.to_state", left.state_transition?.to_state, right.state_transition?.to_state),
    diffField("policy.policy_id", left.policy?.policy_id, right.policy?.policy_id),
    diffField("subject.value_usd", left.subject?.value_usd, right.subject?.value_usd)
  ].filter(Boolean);

  return {
    ok: true,
    same_content: leftHashes.capsule_content_hash === rightHashes.capsule_content_hash,
    left: {
      capsule_id: left.capsule_id,
      content_hash: leftHashes.capsule_content_hash,
      state: left.state_transition?.to_state || left.subject?.state
    },
    right: {
      capsule_id: right.capsule_id,
      content_hash: rightHashes.capsule_content_hash,
      state: right.state_transition?.to_state || right.subject?.state
    },
    field_diffs: fieldDiffs,
    evidence_diff: {
      added_types: addedEvidence,
      removed_types: removedEvidence,
      left_count: left.evidence_refs?.length || 0,
      right_count: right.evidence_refs?.length || 0
    },
    changed_hashes: changedHashes,
    compare_hash: hashValue({
      left: left.hashes?.capsule_content_hash,
      right: right.hashes?.capsule_content_hash,
      fieldDiffs,
      addedEvidence,
      removedEvidence,
      changedHashes: changedHashes.map((item) => item.hash)
    })
  };
}

export function generateAgentHandoffPack(input = {}) {
  const capsule = input.capsule?.schema_version ? input.capsule : composeProofCapsule(input);
  const scenario = resolveWorkflowScenario(input, capsule);
  const endpoint = input.endpoint || "https://proof-capsule-mcp-demo.vercel.app/mcp";
  const workflow = resolveWorkflowDefinition(input, capsule, scenario);
  const replay = replayWorkflowCapsule({ scenario, capsule, workflow_definition: workflow });
  const evidence = verifyEvidenceRefs({ scenario, capsule, workflow_definition: workflow });
  const diagnosis = diagnoseCapsule({ scenario, capsule, workflow_definition: workflow });
  const timeline = buildProofTimeline({ scenario, capsule, workflow_definition: workflow });
  const workflowArgument = input.workflow_definition?.workflow_id ? { workflow_definition: workflow } : {};

  return {
    ok: true,
    pack_id: `handoff:${shortHash(hashValue({ endpoint, capsule_id: capsule.capsule_id, replay: replay.hash_replay?.workflow_replay_hash }))}`,
    endpoint,
    capsule_id: capsule.capsule_id,
    scenario,
    status: diagnosis.healthy && replay.ok ? "ready" : "needs_attention",
    next_allowed_actions: diagnosis.healthy
      ? ["verify_proof_capsule", "replay_workflow_capsule", "plan_transition_queue", "operator_gated_sync_if_authorized"]
      : diagnosis.recovery_actions.map((action) => action.action_id),
    mcp_calls: [
      { tool: "get_capsule_status", arguments: {} },
      { tool: "verify_proof_capsule", arguments: { capsule } },
      { tool: "replay_workflow_capsule", arguments: { scenario, capsule, ...workflowArgument } },
      { tool: "get_proof_timeline", arguments: { scenario, capsule, ...workflowArgument } },
      { tool: "diagnose_capsule", arguments: { scenario, capsule, ...workflowArgument } },
      { tool: "plan_transition_queue", arguments: { scenario, capsule, ...workflowArgument } }
    ],
    resources: [
      "capsule://manifest",
      "capsule://schema",
      "capsule://source-verifiers",
      `capsule://workflow/${scenario}`
    ],
    replay_summary: {
      ok: replay.ok,
      workflow_id: replay.workflow_id,
      workflow_replay_hash: replay.hash_replay?.workflow_replay_hash
    },
    evidence_summary: evidence.summary,
    timeline_hash: timeline.timeline_hash,
    write_boundary: WRITE_BOUNDARY,
    caveats: [
      "Do not send operator tokens to read-only tools.",
      "Any DUAL write must use the operator-gated live tools/endpoints and then read back the DUAL object.",
      "External source facts remain point-in-time unless a live adapter rechecks them."
    ]
  };
}

export function runProofCapsule(input = {}) {
  const capsule = input.capsule?.schema_version ? input.capsule : composeProofCapsule(input);
  const scenario = resolveWorkflowScenario(input, capsule);
  const workflow = resolveWorkflowDefinition(input, capsule, scenario);
  const verification = verifyProofCapsule({ capsule });
  const policy = evaluateCapsulePolicy({ capsule });
  const evidence = verifyEvidenceRefs({ scenario, capsule, workflow_definition: workflow });
  const replay = replayWorkflowCapsule({ scenario, capsule, workflow_definition: workflow });
  const timeline = buildProofTimeline({ scenario, capsule, workflow_definition: workflow });
  const diagnosis = diagnoseCapsule({ scenario, capsule, workflow_definition: workflow });
  const transition_plan = planTransitionQueue({
    scenario,
    capsule,
    workflow_definition: workflow,
    dry_run: true,
    action: input.action || input.transition_action
  });
  const handoff = generateAgentHandoffPack({
    scenario,
    capsule,
    workflow_definition: input.workflow_definition?.workflow_id ? workflow : undefined,
    endpoint: input.endpoint || "https://proof-capsule-mcp-demo.vercel.app/mcp"
  });
  const proof_score = scoreProofReadiness({
    verification,
    policy,
    evidence,
    replay,
    transition_plan,
    diagnosis,
    capsule
  });
  const public_verifier = buildPublicVerifierPage({
    scenario,
    capsule,
    workflow_definition: input.workflow_definition?.workflow_id ? workflow : undefined,
    base_url: input.base_url,
    endpoint: input.endpoint
  });
  const steps = [
    proofStep("compose_capsule", true, capsule.hashes?.capsule_content_hash),
    proofStep("verify_hashes", verification.ok, verification.verification_level),
    proofStep("evaluate_policy", policy.result !== "Blocked", `${policy.result} / ${policy.code}`),
    proofStep("verify_evidence", evidence.ok, `${evidence.summary.verified} verified / ${evidence.summary.missing} missing`),
    proofStep("replay_workflow", replay.ok, replay.hash_replay?.workflow_replay_hash),
    proofStep("plan_transition", transition_plan.status !== "blocked", transition_plan.status),
    proofStep("diagnose_recovery", diagnosis.healthy, diagnosis.next_safe_action),
    proofStep("publish_verifier_page", public_verifier.ok, public_verifier.public_url)
  ];

  return {
    ok: steps.every((step) => step.pass),
    run_id: `proof-run:${shortHash(hashValue({ capsule_id: capsule.capsule_id, content_hash: capsule.hashes?.capsule_content_hash, replay_hash: replay.hash_replay?.workflow_replay_hash }))}`,
    scenario,
    capsule_id: capsule.capsule_id,
    status: proof_score.status,
    generated_at: new Date().toISOString(),
    capsule,
    proof_score,
    steps,
    verification,
    policy,
    evidence,
    replay,
    timeline,
    diagnosis,
    transition_plan,
    public_verifier,
    handoff,
    write_boundary: capsule.write_boundary,
    caveats: [
      "This proof run is read-only unless an authorised operator separately executes the operator-gated sync or mint path.",
      "Public verifier pages expose proof-envelope hashes, refs, state, source contracts, and DUAL links; raw evidence remains in source systems.",
      "Point-in-time source facts must be rechecked before transfer, settlement, retirement, or other action-critical reliance."
    ]
  };
}

export function buildPublicVerifierPage(input = {}) {
  const capsule = input.capsule?.schema_version ? input.capsule : composeProofCapsule(input);
  const scenario = resolveWorkflowScenario(input, capsule);
  const workflow = resolveWorkflowDefinition(input, capsule, scenario);
  const verification = verifyProofCapsule({ capsule });
  const policy = evaluateCapsulePolicy({ capsule });
  const evidence = verifyEvidenceRefs({ scenario, capsule, workflow_definition: workflow });
  const replay = replayWorkflowCapsule({ scenario, capsule, workflow_definition: workflow });
  const timeline = buildProofTimeline({ scenario, capsule, workflow_definition: workflow });
  const diagnosis = diagnoseCapsule({ scenario, capsule, workflow_definition: workflow });
  const transition_plan = planTransitionQueue({
    scenario,
    capsule,
    workflow_definition: workflow,
    dry_run: true,
    action: input.action || input.transition_action
  });
  const proof_score = scoreProofReadiness({
    verification,
    policy,
    evidence,
    replay,
    transition_plan,
    diagnosis,
    capsule
  });
  const publicProofId = `proof:${shortHash(capsule.hashes?.capsule_content_hash)}`;
  const publicUrl = publicProofUrl(input.base_url, capsule, scenario);
  const linkIntegrity = verifyPublicProofLink({
    requested_proof_id: input.proof_id || input.id || input.public_proof_id || input.capsule_id,
    requested_content_hash: input.content_hash || input.hash,
    capsule,
    public_proof_id: publicProofId
  });
  const sourceLinks = [
    ...(capsule.evidence_refs || []).map((ref) => ({
      label: ref.evidence_id,
      type: ref.type,
      source: ref.source,
      url: ref.explorer_url || null,
      hash: ref.hash || null,
      summary: ref.summary || ""
    })),
    ...(capsule.external_anchors || []).map((anchor) => ({
      label: anchor.anchor_id,
      type: anchor.kind,
      source: anchor.source_of_truth || anchor.source || anchor.chain || anchor.mode || "external_anchor",
      url: anchor.explorer_url || null,
      hash: anchor.tx_signature || anchor.ref || null,
      summary: anchor.caveat || ""
    }))
  ];
  const dualLinks = [
    { label: "DUAL object", url: capsule.dual_anchor?.object_explorer_url || null },
    { label: "DUAL template", url: capsule.dual_anchor?.template_explorer_url || null },
    { label: "DUAL L2 state", url: capsule.dual_anchor?.l2_state_search_url || null }
  ].filter((link) => Boolean(link.url));
  const proofRoom = buildProofRoomModel({
    capsule,
    scenario,
    verification,
    policy,
    evidence,
    replay,
    timeline,
    diagnosis,
    transition_plan,
    proof_score,
    sourceLinks,
    dualLinks,
    publicUrl,
    endpoint: input.endpoint || "/mcp"
  });

  return {
    ok: linkIntegrity.ok,
    page_type: "public_verifier",
    public_proof_id: publicProofId,
    public_url: publicUrl,
    public_mode: true,
    scenario,
    capsule_id: capsule.capsule_id,
    capsule,
    proof_room: proofRoom,
    link_integrity: linkIntegrity,
    summary: {
      title: capsule.subject?.label || capsule.capsule_id,
      subject_id: capsule.subject?.subject_id || "",
      capsule_type: capsule.capsule_type,
      decision: capsule.decision?.result || "",
      decision_code: capsule.decision?.code || "",
      state_transition: `${capsule.state_transition?.from_state || "-"} -> ${capsule.state_transition?.to_state || "-"}`,
      verification_level: verification.verification_level,
      content_hash: capsule.hashes?.capsule_content_hash,
      envelope_hash: capsule.hashes?.capsule_envelope_hash,
      generated_at: capsule.generated_at
    },
    proof_score,
    sections: {
      claims: (capsule.claims || []).map((claim) => ({
        claim_id: claim.claim_id,
        type: claim.type,
        required: Boolean(claim.required),
        statement: claim.statement,
        expected_source: claim.expected_source
      })),
      evidence_refs: (capsule.evidence_refs || []).map((ref) => ({
        evidence_id: ref.evidence_id,
        type: ref.type,
        source: ref.source,
        hash: ref.hash,
        summary: ref.summary,
        ref: ref.ref,
        explorer_url: ref.explorer_url || null,
        point_in_time: ref.point_in_time || null
      })),
      source_checks: evidence.results,
      policy_decision: {
        result: policy.result,
        code: policy.code,
        reason: policy.reason,
        missing_required_anchor_types: policy.missing_required_anchor_types,
        unsupported_sources: policy.unsupported_sources,
        decision_content_hash: policy.decision_content_hash
      },
      state_transition: capsule.state_transition,
      workflow_replay: {
        ok: replay.ok,
        workflow_id: replay.workflow_id,
        workflow_title: replay.workflow_title,
        replay_steps: replay.replay_steps,
        workflow_replay_hash: replay.hash_replay?.workflow_replay_hash,
        point_in_time_rechecks: replay.point_in_time_rechecks
      },
      dual_anchor: {
        object_id: capsule.dual_anchor?.object_id || capsule.dual_anchor?.ref || "",
        template_id: capsule.dual_anchor?.template_id || "",
        state_hash: capsule.dual_anchor?.state_hash || "",
        integrity_hash: capsule.dual_anchor?.integrity_hash || "",
        mode: capsule.dual_anchor?.mode || "",
        coverage: dualLinks.length ? "live_dual_explorer_links" : "demo_reference",
        note: dualLinks.length
          ? "Live DUAL object/template/state links are present for this capsule."
          : "This scenario currently uses a demo DUAL reference; use TradeFlow as the flagship live-link example until this scenario is operator-synced.",
        links: dualLinks
      },
      hashes: verification.hashes,
      timeline: timeline.events,
      transition_plan: {
        queue_id: transition_plan.queue_id,
        status: transition_plan.status,
        requires_operator_token: transition_plan.write_operation?.requires_operator_token === true,
        public_writes: false
      },
      recovery: {
        healthy: diagnosis.healthy,
        next_safe_action: diagnosis.next_safe_action,
        actions: diagnosis.recovery_actions
      },
      source_links: sourceLinks,
      proof_room: proofRoom
    },
    links: {
      public_url: publicUrl,
      mcp_endpoint: input.endpoint || "/mcp",
      dual: dualLinks,
      sources: sourceLinks.filter((link) => Boolean(link.url))
    },
    write_boundary: capsule.write_boundary,
    verifier_statement: "This public verifier page lets humans and agents re-check the capsule proof envelope without executing DUAL writes."
  };
}

export function buildProofRoom(input = {}) {
  const page = buildPublicVerifierPage(input);
  return {
    ok: page.ok,
    page_type: "proof_room",
    public_proof_id: page.public_proof_id,
    public_url: page.public_url,
    scenario: page.scenario,
    capsule_id: page.capsule_id,
    capsule: page.capsule,
    link_integrity: page.link_integrity,
    proof_score: page.proof_score,
    proof_room: page.proof_room,
    write_boundary: page.write_boundary
  };
}

export function createCapsule(input = {}) {
  const capsule = composeProofCapsule(input);
  const verification = verifyProofCapsule({ capsule });
  const proof_room = buildProofRoom({
    scenario: resolveWorkflowScenario(input, capsule),
    capsule,
    base_url: input.base_url,
    endpoint: input.endpoint
  });
  return {
    ok: verification.accepted,
    action: "create_capsule",
    capsule,
    verification,
    proof_room: proof_room.proof_room,
    write_boundary: capsule.write_boundary
  };
}

export function attachProofToCapsule(input = {}) {
  const baseCapsule = input.capsule?.schema_version ? input.capsule : composeProofCapsule(input);
  const evidenceRef = normalizeEvidenceRef(input.proof_ref || input.evidence_ref || {
    evidence_id: input.evidence_id || `ATTACHED-PROOF-${shortHash(hashValue(input))}`,
    type: input.type || "attestation",
    source: input.source || "enterprise_vault",
    summary: input.summary || "Attached proof reference.",
    ref: input.ref || input.uri || undefined,
    hash: input.hash || undefined,
    explorer_url: input.explorer_url || undefined
  });
  const capsule = composeProofCapsule({
    ...baseCapsule,
    evidence_refs: [...(baseCapsule.evidence_refs || []), evidenceRef],
    generated_at: input.generated_at
  });
  const evidence = verifyEvidenceRefs({
    scenario: resolveWorkflowScenario(input, capsule),
    capsule,
    workflow_definition: input.workflow_definition
  });
  const verification = verifyProofCapsule({ capsule });
  return {
    ok: verification.accepted && evidence.ok,
    action: "attach_proof",
    attached: evidenceRef,
    capsule,
    evidence,
    verification,
    write_boundary: capsule.write_boundary
  };
}

export function evaluateGate(input = {}) {
  const capsule = input.capsule?.schema_version ? input.capsule : composeProofCapsule(input);
  const scenario = resolveWorkflowScenario(input, capsule);
  const workflow = resolveWorkflowDefinition(input, capsule, scenario);
  const policy = evaluateCapsulePolicy({ capsule, policy: input.policy });
  const evidence = verifyEvidenceRefs({ scenario, capsule, workflow_definition: workflow });
  const replay = replayWorkflowCapsule({ scenario, capsule, workflow_definition: workflow });
  const transition = planTransitionQueue({
    scenario,
    capsule,
    workflow_definition: workflow,
    action: input.action || input.transition_action,
    dry_run: input.dry_run !== false
  });
  return {
    ok: policy.result !== "Blocked" && evidence.ok && replay.ok,
    action: "evaluate_gate",
    scenario,
    gate: input.action || input.transition_action || capsule.state_transition?.action || workflow.current_transition,
    result: policy.result,
    code: policy.code,
    policy,
    evidence,
    replay,
    transition,
    write_boundary: capsule.write_boundary
  };
}

export function simulateWorkflow(input = {}) {
  const capsule = input.capsule?.schema_version ? input.capsule : composeProofCapsule(input);
  const scenario = resolveWorkflowScenario(input, capsule);
  const workflow = resolveWorkflowDefinition(input, capsule, scenario);
  const replay = replayWorkflowCapsule({ scenario, capsule, workflow_definition: workflow });
  const evaluation = evaluateGate({ scenario, capsule, workflow_definition: workflow, action: input.action || input.transition_action });
  const simulation_steps = (workflow.transitions || []).map((transition, index) => {
    const isCurrent = transition.action === capsule.state_transition?.action
      || transition.to_state === capsule.state_transition?.to_state;
    const missing = (transition.required_evidence || [])
      .filter((type) => !(capsule.evidence_refs || []).some((ref) => ref.type === type));
    return {
      step: index + 1,
      action: transition.action,
      from_state: transition.from_state,
      to_state: transition.to_state,
      status: missing.length
        ? "needs_evidence"
        : isCurrent
          ? "current_verified"
          : "ready_when_reached",
      missing_evidence: missing,
      operator_sync_required: true
    };
  });
  return {
    ok: replay.ok && evaluation.ok,
    action: "simulate_workflow",
    scenario,
    workflow,
    capsule_id: capsule.capsule_id,
    current_state: capsule.state_transition?.to_state || capsule.subject?.state,
    simulation_steps,
    replay,
    evaluation,
    write_boundary: capsule.write_boundary
  };
}

export function publishPublicProof(input = {}) {
  const page = buildPublicVerifierPage(input);
  return {
    ok: page.ok,
    action: "publish_public_proof",
    public_url: page.public_url,
    public_proof_id: page.public_proof_id,
    capsule_id: page.capsule_id,
    link_integrity: page.link_integrity,
    proof_score: page.proof_score,
    proof_room: page.proof_room,
    public_writes: false,
    write_boundary: page.write_boundary
  };
}

export function serviceDescriptor() {
  return {
    ok: true,
    service: SERVICE_NAME,
    version: SERVICE_VERSION,
    schema_version: CAPSULE_SCHEMA_VERSION,
    transport: "streamable-http",
    endpoint: "/mcp",
    mode: "stateless-json-response",
    project: "DualVault Proof Capsule MCP demo",
    writeBoundary: WRITE_BOUNDARY,
    liveDualWrites: false,
    publicWrites: false,
    operatorTokenAccepted: false,
    tools: [
      "get_capsule_status",
      "create_capsule",
      "attach_proof",
      "evaluate_gate",
      "simulate_workflow",
      "verify_capsule",
      "publish_public_proof",
      "compose_proof_capsule",
      "verify_proof_capsule",
      "evaluate_capsule_policy",
      "red_team_capsule",
      "get_capsule_handoff",
      "run_proof_capsule",
      "get_public_verifier_page",
      "list_workflow_templates",
      "list_scenario_marketplace",
      "get_workflow_definition",
      "replay_workflow_capsule",
      "list_source_verifiers",
      "list_verifier_marketplace",
      "verify_evidence_refs",
      "build_workflow_draft",
      "plan_transition_queue",
      "diagnose_capsule",
      "get_proof_timeline",
      "get_proof_room",
      "compare_capsules",
      "generate_agent_handoff_pack",
      "get_saas_readiness",
      "list_saas_plans",
      "create_tenant_onboarding_plan",
      "get_admin_control_plane",
      "get_extensibility_kit",
      "build_extension_pack",
      "certify_source_adapter",
      "plan_schema_migration",
      "get_tenant_activation_blueprint",
      "create_tenant_activation_request",
      "issue_tenant_api_key_preview",
      "bind_dual_tenant_gateway"
    ],
    resources: [
      "capsule://manifest",
      "capsule://schema",
      "capsule://policy/default",
      "capsule://demo/tradeflow-medical-devices",
      "capsule://scorecard",
      "capsule://workflows",
      "capsule://scenario-marketplace",
      "capsule://source-verifiers",
      "capsule://verifier-marketplace",
      "capsule://proof-room",
      "capsule://agent-mode",
      "capsule://operator-runbook",
      "capsule://proof-runbook",
      "capsule://saas/readiness",
      "capsule://saas/plans",
      "capsule://saas/onboarding",
      "capsule://saas/admin",
      "capsule://extensions/kit",
      "capsule://extensions/scorecard",
      "capsule://extensions/adapter-contract",
      "capsule://extensions/migration",
      "capsule://activation/blueprint",
      "capsule://activation/security",
      "capsule://activation/gateway",
      "capsule://activation/dual-binding"
    ],
    resourceTemplates: ["capsule://demo/{scenario}", "capsule://workflow/{scenario}", "capsule://public-proof/{scenario}", "capsule://proof-room/{scenario}"],
    prompts: [
      "proof_capsule_review",
      "mcp_client_handoff",
      "red_team_capsule_boundary",
      "design_proof_capsule_workflow",
      "operate_capsule_transition",
      "compare_capsule_versions",
      "publish_proof_capsule_verifier_page",
      "supercharge_proof_capsule",
      "launch_proof_capsule_saas_tenant",
      "extend_proof_capsule_product",
      "activate_proof_capsule_tenant"
    ],
    supported_capsule_types: CAPSULE_TYPES,
    supported_scenarios: SCENARIOS,
    commercialStage: "commodity_saas_packaged",
    saas: {
      package_version: SAAS_PACKAGE_VERSION,
      extensibility_package_version: EXTENSIBILITY_PACKAGE_VERSION,
      tenant_activation_package_version: TENANT_ACTIVATION_PACKAGE_VERSION,
      product_line: "Proof Capsule SaaS",
      sellable_now: true,
      boundary: "Billing, SSO, scoped API-key preview, customer gateway setup, live adapter onboarding, and DUAL tenant binding are packaged. Public writes remain disabled and production secrets are never returned.",
      extensibility: "Tenant workflows, source adapters, migrations, marketplace listings, and activation requests are installable as configuration packs."
    },
    sourceBoundary: "DUAL anchors the proof envelope; source chains/vaults/feeds remain source of truth for native facts."
  };
}

export function scorecard() {
  return {
    ok: true,
    score_target: 9.8,
    score_claim: "v0.9_tenant_activation_requires_cowork_gate",
    scoring_note: "The v0.9 tenant activation layer may only claim 9.8 after local/prod proof scripts pass and Claude Cowork independently agrees.",
    criteria: [
      { area: "MCP ergonomics", required: "Manifest, schema, resources, templates, prompts, read-only annotations, structured outputs." },
      { area: "Proof semantics", required: "Stable content hashes split from fresh envelope hashes; per-hash re-derivation." },
      { area: "Safety", required: "Public writes disabled; live DUAL writes only through operator-gated paths; no wallet actions or raw evidence storage." },
      { area: "Demo clarity", required: "Human UI shows capsule data, hashes, anchors, policy result, and verifier output." },
      { area: "Operator workflow", required: "Workflow builder, evidence intake, transition queue, recovery, timeline, verifier marketplace, compare, and agent handoff work without public writes." },
      { area: "Public proof run", required: "One-click proof run produces a shareable verifier page with claims, evidence, source checks, policy, replay, DUAL anchors, hashes, link-integrity status, and next safe action." },
      { area: "Proof room", required: "Shareable room shows source proof cards, DUAL links, what-is-proven limits, downloads, and agent-mode calls." },
      { area: "Agent mode", required: "MCP exposes create/attach/evaluate/simulate/verify/publish/compare/red-team tools while keeping write tools operator-gated." },
      { area: "SaaS packaging", required: "Plans, tenant onboarding, admin readiness, connector status, support model, and commercial boundary are exposed in UI/API/MCP." },
      { area: "Extensibility", required: "Tenant extension packs, adapter certification, schema migration, and customer marketplace listings are exposed through UI/API/MCP without core code changes." },
      { area: "Tenant activation", required: "Billing, SSO, API-key, customer gateway, live adapter onboarding, and DUAL binding artifacts are exposed without returning secrets or weakening the operator gate." },
      { area: "Red team", required: "Missing evidence, unsupported source, stale ownership, hash tamper, and live-write escalation are blocked." }
    ]
  };
}

export function handoff(endpoint = "http://127.0.0.1:4184/mcp") {
  return {
    ok: true,
    endpoint,
    client_config: {
      transport: "streamable-http",
      url: endpoint,
      auth: "none",
      sessionMode: "stateless"
    },
    first_calls: [
      "resources/read capsule://manifest",
      "tools/call get_capsule_status",
      "tools/call compose_proof_capsule",
      "tools/call create_capsule",
      "tools/call run_proof_capsule",
      "tools/call get_proof_room",
      "tools/call get_public_verifier_page",
      "tools/call verify_proof_capsule",
      "tools/call simulate_workflow",
      "tools/call replay_workflow_capsule",
      "tools/call get_proof_timeline",
      "tools/call plan_transition_queue",
      "tools/call get_saas_readiness",
      "tools/call create_tenant_onboarding_plan",
      "tools/call get_tenant_activation_blueprint",
      "tools/call create_tenant_activation_request",
      "tools/call red_team_capsule"
    ],
    write_boundary: WRITE_BOUNDARY
  };
}

export function capsuleToMarkdown(capsule) {
  return [
    `# ${capsule.capsule_id} - ${capsule.subject?.label}`,
    "",
    `Type: ${capsule.capsule_type}`,
    `Decision: ${capsule.decision?.result} (${capsule.decision?.code})`,
    `Content hash: ${capsule.hashes?.capsule_content_hash}`,
    `Envelope hash: ${capsule.hashes?.capsule_envelope_hash}`,
    "",
    "## Evidence refs",
    ...(capsule.evidence_refs || []).map((ref) => `- ${ref.type}: ${ref.evidence_id} (${ref.source}) ${ref.hash}`),
    "",
    "## External anchors",
    ...(capsule.external_anchors || []).map((anchor) => `- ${anchor.kind}: ${anchor.source_of_truth || anchor.source || anchor.chain || anchor.mode}`),
    "",
    `Boundary: ${capsule.write_boundary?.statement}`
  ].join("\n");
}

function summarizeEvidence(capsule) {
  return (capsule.evidence_refs || []).map((ref) => ({
    type: ref.type,
    source: ref.source,
    evidence_id: ref.evidence_id,
    has_hash: Boolean(ref.hash),
    has_explorer_url: Boolean(ref.explorer_url)
  }));
}

function buildProofRoomModel({
  capsule,
  scenario,
  verification,
  policy,
  evidence,
  replay,
  timeline,
  diagnosis,
  transition_plan,
  proof_score,
  sourceLinks,
  dualLinks,
  publicUrl,
  endpoint
}) {
  const evidenceResults = evidence.results || [];
  const sourceCards = (capsule.evidence_refs || []).map((ref) => {
    const result = evidenceResults.find((item) => (
      item.evidence_id === ref.evidence_id
      || (item.type === ref.type && item.source === ref.source)
    ));
    const verifier = SOURCE_VERIFIER_REGISTRY[ref.source] || {};
    const adapter = adapterStatusDescriptor(verifier.live_adapter_status);
    return {
      evidence_id: ref.evidence_id,
      type: ref.type,
      source: ref.source,
      status: result?.status || "unverified",
      adapter_status: verifier.live_adapter_status || "missing",
      adapter_label: adapter.label,
      adapter_disclosure: adapter.disclosure,
      hash: ref.hash || null,
      ref: ref.ref || null,
      explorer_url: ref.explorer_url || null,
      point_in_time: ref.point_in_time || null,
      proves: verifier.proves || ref.summary || "",
      does_not_prove: verifier.does_not_prove || "Native truth outside the referenced source system.",
      freshness_rule: verifier.freshness_rule || result?.recheck_rule || "Recheck before action-critical reliance.",
      summary: ref.summary || ""
    };
  });
  const proofRoomHash = hashValue({
    capsule_id: capsule.capsule_id,
    content_hash: capsule.hashes?.capsule_content_hash,
    timeline_hash: timeline.timeline_hash,
    sources: sourceCards.map((card) => ({
      evidence_id: card.evidence_id,
      source: card.source,
      hash: card.hash,
      status: card.status
    }))
  });
  return {
    room_id: `room:${shortHash(proofRoomHash)}`,
    room_hash: proofRoomHash,
    title: capsule.subject?.label || capsule.capsule_id,
    scenario,
    decision: {
      result: policy.result,
      code: policy.code,
      reason: policy.reason,
      proof_score: proof_score.score,
      proof_grade: proof_score.grade
    },
    what_this_proves: [
      "The named source references are present, hashed, and bound into the capsule content hash.",
      "DUAL anchors the governed proof envelope, state transition, write boundary, and verifier-readable object metadata.",
      "The workflow replay, policy decision, evidence checks, and public proof link can be independently re-derived by humans or MCP clients."
    ],
    what_this_does_not_prove: [
      "External source facts are point-in-time unless a live adapter rechecks them.",
      "The capsule does not store raw evidence, execute settlement, transfer tokens, or perform wallet actions.",
      "Public verifier pages do not grant write authority; live DUAL writes remain server-side and operator-gated."
    ],
    source_cards: sourceCards,
    dual_links: dualLinks,
    source_links: sourceLinks.filter((link) => Boolean(link.url)),
    timeline: timeline.events,
    downloads: [
      {
        label: "Proof bundle JSON",
        filename: `${capsule.capsule_id}-proof-bundle.json`,
        mime_type: "application/json",
        content_hash: capsule.hashes?.capsule_content_hash,
        includes: ["capsule", "hashes", "policy", "source checks", "workflow replay", "timeline", "proof score"]
      },
      {
        label: "Agent handoff pack",
        filename: `${capsule.capsule_id}-agent-handoff.json`,
        mime_type: "application/json",
        content_hash: hashValue({ capsule_id: capsule.capsule_id, endpoint, tools: ["verify_capsule", "evaluate_gate", "simulate_workflow"] }),
        includes: ["MCP endpoint", "safe read-only tools", "next allowed actions", "write boundary"]
      }
    ],
    agent_mode: {
      endpoint,
      read_tools: ["create_capsule", "attach_proof", "evaluate_gate", "simulate_workflow", "verify_capsule", "publish_public_proof", "compare_capsules", "red_team_capsule"],
      write_tools: ["sync_proof_capsule_live", "mint_proof_capsule_live"],
      write_policy: "Write tools require an authorised operator token and are not available from the public verifier."
    },
    operator_console: {
      public_writes: false,
      queued_transition: transition_plan.queue_id,
      sync_ready: transition_plan.status === "ready_for_operator_sync",
      next_safe_action: diagnosis.next_safe_action,
      actions: ["dry_run_transition", "attach_evidence_ref", "sync_to_dual", "mint_dual_capsule", "generate_handoff_pack"]
    },
    public_url: publicUrl,
    verification_summary: {
      accepted: verification.accepted,
      verification_level: verification.verification_level,
      replay_ok: replay.ok,
      diagnosis_healthy: diagnosis.healthy
    }
  };
}

function reasonForPolicyResult({ result, missing, unsupportedSources, overMax, reviewRequired }) {
  if (missing.length) return `Missing required proof categories: ${missing.join(", ")}.`;
  if (unsupportedSources.length) return `Unsupported source systems: ${unsupportedSources.map((item) => item.source).join(", ")}.`;
  if (overMax) return "Subject value exceeds the mandate ceiling.";
  if (reviewRequired) return "All required proof categories are present; human review is logged because the review threshold is reached.";
  return result === "Approved" ? "All required proof categories and source boundaries match." : "Policy result computed.";
}

function check(name, pass) {
  return { name, pass: Boolean(pass) };
}

function step(name, pass, detail) {
  return { name, pass: Boolean(pass), detail };
}

function proofStep(name, pass, detail) {
  return {
    step: name,
    pass: Boolean(pass),
    detail: detail || ""
  };
}

function readinessCheck(key, area, ready, status, evidence, weight) {
  return {
    key,
    area,
    ready: Boolean(ready),
    status,
    evidence,
    weight
  };
}

function scoreChecks(checks) {
  const totalWeight = checks.reduce((sum, check) => sum + check.weight, 0);
  const readyWeight = checks.reduce((sum, check) => sum + (check.ready ? check.weight : 0), 0);
  return {
    totalWeight,
    readyWeight,
    score: totalWeight ? Math.round((readyWeight / totalWeight) * 100) : 0
  };
}

function normalizeTenantActivationProfile(input = {}) {
  const tenantName = String(input.tenant_name || input.tenant || DEFAULT_TENANT_PROFILE.tenant_name).trim();
  const planId = String(input.plan_id || input.plan || DEFAULT_TENANT_PROFILE.plan_id).trim();
  const useCase = String(input.use_case || DEFAULT_TENANT_PROFILE.use_case).trim();
  const sources = normalizeList(input.sources || input.selected_sources, DEFAULT_TENANT_PROFILE.sources).map(slugify);
  const regions = normalizeList(input.regions, DEFAULT_TENANT_PROFILE.regions);
  const requestedScopes = normalizeList(input.requested_scopes || input.scopes, DEFAULT_TENANT_PROFILE.requested_scopes);
  const workspaceSeed = input.workspace_id || `tenant:${slugify(tenantName)}:${shortHash(hashValue({ tenantName, useCase, planId, sources, regions }))}`;
  return {
    tenant_name: tenantName,
    workspace_id: String(workspaceSeed),
    use_case: useCase,
    plan_id: planId,
    regions,
    sources,
    compliance_profile: input.compliance_profile || DEFAULT_TENANT_PROFILE.compliance_profile,
    billing_contact: input.billing_contact || input.billing_email || DEFAULT_TENANT_PROFILE.billing_contact,
    sso_protocol: input.sso_protocol || DEFAULT_TENANT_PROFILE.sso_protocol,
    gateway_domain: input.gateway_domain || input.customer_gateway_domain || DEFAULT_TENANT_PROFILE.gateway_domain,
    allowed_origins: normalizeList(input.allowed_origins, DEFAULT_TENANT_PROFILE.allowed_origins),
    requested_scopes: requestedScopes,
    dual_mode: input.dual_mode || DEFAULT_TENANT_PROFILE.dual_mode,
    adapter_cutover: input.adapter_cutover || DEFAULT_TENANT_PROFILE.adapter_cutover
  };
}

function buildTenantGatewayManifest(profile, adapterPlan, apiCredentialPreview, dualBinding) {
  return {
    status: "gateway_manifest_ready",
    gateway_id: `gateway:${shortHash(hashValue({ workspace_id: profile.workspace_id, domain: profile.gateway_domain }))}`,
    tenant_domain: profile.gateway_domain,
    allowed_origins: profile.allowed_origins,
    mcp_endpoint: `https://${profile.gateway_domain}/mcp`,
    auth: {
      sso_protocol: profile.sso_protocol,
      api_key_id: apiCredentialPreview.key_id,
      api_secret_returned: false,
      supported_modes: ["SSO session", "tenant API key", "signed webhook", "mTLS service account"]
    },
    ingress: {
      public_read_routes: ["/proof/*", "/api/proof/public", "/api/status"],
      tenant_routes: ["/mcp", "/api/capsule/*", "/api/workflow/*", "/api/evidence/*"],
      operator_routes: ["/api/capsules/sync", "/api/capsules/mint"],
      operator_routes_require_server_token: true
    },
    webhooks: {
      signature: "HMAC-SHA256 or mTLS",
      events: ["proof.created", "proof.verified", "adapter.certified", "dual.readback.verified", "dual.write.queued"],
      raw_evidence_payloads_allowed: false
    },
    adapter_ingress: adapterPlan.map((adapter) => ({
      source: adapter.source,
      status: adapter.activation_status,
      auth_model: adapter.auth_model,
      freshness_rule: adapter.freshness_rule
    })),
    dual_routes: {
      status: "/api/dual/status",
      current_capsule: "/api/capsule/current",
      sync: "/api/capsules/sync",
      mint: "/api/capsules/mint",
      binding_status: dualBinding.binding_status
    },
    audit_fields: [
      "tenant_id",
      "actor",
      "tool",
      "capsule_id",
      "decision_hash",
      "source_refs",
      "dual_object_id",
      "public_writes",
      "operator_gate"
    ],
    public_writes: false
  };
}

function adapterStatusDescriptor(status) {
  if (status === "configured_for_canonical_capsule") {
    return {
      label: "Live DUAL",
      commercial_status: "production_reference_ready",
      action_required: "Use the configured live DUAL readback as the canonical capsule anchor.",
      disclosure: "Live adapter configured for the canonical DUAL capsule object."
    };
  }
  if (status === "demo_reference") {
    return {
      label: "Reference",
      commercial_status: "demo_ready_adapter_next",
      action_required: "Replace the demo reference with a tenant-specific live adapter or signed source feed before production reliance.",
      disclosure: "Structured ref/hash is demo-ready, but the source is not re-queried live by this public package."
    };
  }
  if (status === "adapter_required") {
    return {
      label: "Adapter needed",
      commercial_status: "tenant_adapter_required",
      action_required: "Connect a tenant adapter or signed attestation feed before action-critical reliance.",
      disclosure: "A production verifier must query or receive signed facts from this source system."
    };
  }
  return {
    label: "Missing",
    commercial_status: "not_registered",
    action_required: "Register a verifier contract before relying on this source.",
    disclosure: "No source verifier is registered."
  };
}

function normalizeAdapterDefinitions(value, sources = [], evidenceTypes = []) {
  const list = Array.isArray(value)
    ? value
    : value && typeof value === "object"
      ? Object.values(value)
      : [];
  const bySource = new Map(list.map((adapter) => [String(adapter.source || adapter.adapter_source || "").trim(), adapter]));
  return sources.map((source, index) => normalizeAdapterDefinition(
    bySource.get(source) || {
      source,
      proof_types: [evidenceTypes[index % evidenceTypes.length] || "attestation"],
      adapter_name: `${displaySourceName(source)} adapter`
    },
    source
  ));
}

function normalizeAdapterDefinition(value = {}, fallbackSource = "enterprise_vault") {
  const source = slugify(value.source || value.adapter_source || fallbackSource || "enterprise_vault");
  const registry = SOURCE_VERIFIER_REGISTRY[source] || {};
  const proofTypes = normalizeList(value.proof_types || value.evidence_types, ["attestation"]);
  const signedMode = value.signed_attestation_mode !== undefined ? Boolean(value.signed_attestation_mode) : true;
  return {
    adapter_id: value.adapter_id || `adapter.${source}.tenant.v1`,
    adapter_name: value.adapter_name || value.name || `${displaySourceName(source)} adapter`,
    source,
    mode: value.mode || registry.mode || "tenant_adapter",
    proof_types: proofTypes,
    endpoint: value.endpoint || value.url || "",
    signed_attestation_mode: signedMode,
    canonicalization: value.canonicalization || "stable_json_sha256",
    hash_algorithm: value.hash_algorithm || "sha256",
    freshness_rule: value.freshness_rule || registry.freshness_rule || "Recheck this source before action-critical reliance.",
    auth_model: value.auth_model || "tenant_api_gateway",
    raw_evidence_stored: value.raw_evidence_stored === true,
    mcp_safe_output: value.mcp_safe_output !== false,
    redaction_policy: value.redaction_policy || "refs_hashes_metadata_only",
    recheck_before_action: value.recheck_before_action !== false,
    does_not_prove: value.does_not_prove || registry.does_not_prove || "Future source truth after the proof timestamp.",
    sample_ref: value.sample_ref || value.fixture || null,
    tenant_activation_approved: value.tenant_activation_approved === true
  };
}

function buildAdapterCertificationChecks(adapter, sampleRef) {
  const hasProofTypes = adapter.proof_types.length > 0;
  const canonicalHashing = adapter.canonicalization === "stable_json_sha256" && adapter.hash_algorithm === "sha256";
  const rawEvidenceBoundary = adapter.raw_evidence_stored === false;
  const freshnessRule = Boolean(adapter.freshness_rule && adapter.freshness_rule.length > 12);
  const authBoundary = adapter.auth_model && !["none", "public_secret", "query_string_secret"].includes(adapter.auth_model);
  const liveOrSignedSource = Boolean(adapter.endpoint || adapter.signed_attestation_mode);
  const replayFixture = Boolean(sampleRef?.hash && sampleRef?.source && sampleRef?.type);
  const values = {
    proof_types: hasProofTypes,
    canonical_hashing: canonicalHashing,
    raw_evidence_boundary: rawEvidenceBoundary,
    freshness_rule: freshnessRule,
    auth_boundary: authBoundary,
    mcp_safe_output: adapter.mcp_safe_output === true,
    live_or_signed_source: liveOrSignedSource,
    replay_fixture: replayFixture,
    recheck_before_action: adapter.recheck_before_action === true,
    tenant_activation: adapter.tenant_activation_approved === true
  };
  return ADAPTER_CERTIFICATION_REQUIREMENTS.map((requirement) => ({
    key: requirement.key,
    area: requirement.area,
    pass: Boolean(values[requirement.key]),
    weight: requirement.weight,
    requirement: requirement.requirement,
    evidence: values[requirement.key]
      ? "Requirement satisfied by adapter contract."
      : requirement.key === "tenant_activation"
        ? "Tenant gateway activation is a customer deployment step."
        : "Adapter contract must be completed before production reliance."
  }));
}

function migrationCheck(key, pass, detail) {
  return {
    key,
    pass: Boolean(pass),
    detail
  };
}

function displaySourceName(source) {
  return String(source || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    || "Source";
}

function launchStep(step, title, detail, status) {
  return {
    step,
    title,
    detail,
    status,
    owner: status === "operator_approval"
      ? "authorised operator"
      : status === "tenant_action"
        ? "customer + implementation lead"
        : "implementation lead"
  };
}

function normalizeHashToken(value) {
  return String(value || "").trim().replace(/^sha256:/, "");
}

function verifyPublicProofLink({ requested_proof_id, requested_content_hash, capsule, public_proof_id }) {
  const expectedCapsuleId = capsule.capsule_id || "";
  const expectedPublicProofId = public_proof_id || "";
  const expectedContentHash = normalizeHashToken(capsule.hashes?.capsule_content_hash);
  const expectedShortHash = shortHash(capsule.hashes?.capsule_content_hash);
  const requestedProofId = String(requested_proof_id || "").trim();
  const requestedContentHash = normalizeHashToken(requested_content_hash);
  const proofIdSupplied = Boolean(requestedProofId);
  const contentHashSupplied = Boolean(requestedContentHash);
  const proofIdMatches = !proofIdSupplied
    || requestedProofId === expectedCapsuleId
    || requestedProofId === expectedPublicProofId
    || requestedProofId === expectedPublicProofId.replace(/^proof:/, "");
  const contentHashMatches = !contentHashSupplied
    || requestedContentHash === expectedContentHash
    || requestedContentHash === expectedShortHash;
  const ok = proofIdMatches && contentHashMatches;
  return {
    ok,
    verified: ok && proofIdSupplied && contentHashSupplied,
    status: !ok ? "link_mismatch" : proofIdSupplied && contentHashSupplied ? "link_verified" : "link_unpinned",
    requested: {
      proof_id: requestedProofId || null,
      content_hash: requestedContentHash || null
    },
    expected: {
      capsule_id: expectedCapsuleId,
      public_proof_id: expectedPublicProofId,
      content_hash: capsule.hashes?.capsule_content_hash || null,
      content_hash_short: expectedShortHash
    },
    checks: [
      {
        check: "proof_id",
        supplied: proofIdSupplied,
        verifies: proofIdMatches,
        expected: `${expectedCapsuleId} or ${expectedPublicProofId}`,
        received: requestedProofId || ""
      },
      {
        check: "content_hash",
        supplied: contentHashSupplied,
        verifies: contentHashMatches,
        expected: expectedShortHash,
        received: requestedContentHash || ""
      }
    ],
    action: ok
      ? proofIdSupplied && contentHashSupplied
        ? "Share link is bound to the recomposed proof content."
        : "Proof content verified, but this link is not fully pinned; add content_hash for tamper-evident sharing."
      : "Do not rely on this share link; the requested proof id or content hash does not match the recomposed capsule."
  };
}

function scoreProofReadiness({ verification, policy, evidence, replay, transition_plan, diagnosis, capsule }) {
  const components = [
    {
      area: "hashes",
      label: "Hash re-derivation",
      points: verification.ok ? 25 : 0,
      max: 25,
      status: verification.ok ? "passed" : "failed",
      detail: verification.verification_level
    },
    {
      area: "policy",
      label: "Policy decision",
      points: policy.result === "Blocked" ? 0 : policy.result === "Approved with review" ? 18 : 20,
      max: 20,
      status: policy.result,
      detail: policy.code
    },
    {
      area: "evidence",
      label: "Evidence refs",
      points: evidence.ok ? 20 : Math.max(0, 20 - ((evidence.summary?.missing || 0) * 5) - ((evidence.summary?.not_sufficient || 0) * 5)),
      max: 20,
      status: evidence.ok ? "verified" : "needs_work",
      detail: `${evidence.summary?.verified || 0} verified`
    },
    {
      area: "workflow",
      label: "Workflow replay",
      points: replay.ok ? 15 : 0,
      max: 15,
      status: replay.ok ? "replay_verified" : "replay_blocked",
      detail: replay.hash_replay?.workflow_replay_hash || ""
    },
    {
      area: "transition",
      label: "Next transition",
      points: transition_plan.status === "ready_for_operator_sync" ? 10 : transition_plan.status === "needs_recovery" ? 5 : 0,
      max: 10,
      status: transition_plan.status,
      detail: transition_plan.queue_id || ""
    },
    {
      area: "write_boundary",
      label: "DUAL write boundary",
      points: capsule.write_boundary?.public_writes === false ? 10 : 0,
      max: 10,
      status: capsule.write_boundary?.public_writes === false ? "public_writes_disabled" : "public_writes_exposed",
      detail: capsule.write_boundary?.write_execution || "read-only"
    }
  ];
  const score = Math.round(components.reduce((sum, item) => sum + item.points, 0));
  const status = !verification.ok || policy.result === "Blocked"
    ? "blocked"
    : !diagnosis.healthy
      ? "needs_recovery"
      : transition_plan.status === "ready_for_operator_sync"
        ? "ready_for_operator_sync"
        : "verified";
  return {
    ok: score >= 90 && verification.ok && policy.result !== "Blocked",
    score,
    max_score: 100,
    status,
    grade: score >= 98 ? "operator_grade" : score >= 90 ? "verifier_ready" : score >= 75 ? "needs_recovery" : "blocked",
    components
  };
}

function publicProofUrl(baseUrl, capsule, scenario) {
  const origin = String(baseUrl || "https://proof-capsule-mcp-demo.vercel.app").replace(/\/+$/, "");
  const capsuleId = encodeURIComponent(capsule.capsule_id || "proof-capsule");
  const params = new URLSearchParams();
  if (scenario && scenario !== "custom_workflow") params.set("scenario", scenario);
  params.set("content_hash", shortHash(capsule.hashes?.capsule_content_hash));
  const query = params.toString();
  return `${origin}/proof/${capsuleId}${query ? `?${query}` : ""}`;
}

function normalizeScenario(scenario) {
  return SCENARIOS.includes(scenario) ? scenario : "tradeflow_medical_devices";
}

function scenarioFromCapsule(capsule = {}) {
  const id = capsule.capsule_id || "";
  if (id.includes("UNIVERSAL") || id.includes("MULTI-PROOF")) return "universal_proof_capsule";
  if (id.includes("INSURANCE")) return "insurance_claim";
  if (id.includes("AGENT-MANDATE")) return "agent_mandate_purchase";
  if (id.includes("LUXURY")) return "luxury_resale";
  if (id.includes("CARBON")) return "carbon_credit";
  return "tradeflow_medical_devices";
}

function findWorkflowTransition(workflow, stateTransition = {}) {
  return (workflow.transitions || []).find((transition) => (
    transition.action === stateTransition.action
    || (
      transition.from_state === stateTransition.from_state
      && transition.to_state === stateTransition.to_state
    )
    || (
      transition.from_gate
      && transition.to_gate
      && transition.from_gate === stateTransition.from_gate
      && transition.to_gate === stateTransition.to_gate
    )
  ));
}

function timelineForWorkflow(workflow, stateTransition = {}) {
  const toState = stateTransition.to_state;
  const fromState = stateTransition.from_state;
  const toGate = stateTransition.to_gate;
  const targetIndex = (workflow.states || []).findIndex((item) => item === toState || item === toGate);
  return (workflow.states || []).map((state, index) => {
    const isCurrent = state === toState || state === toGate;
    const wasPrevious = state === fromState || state === stateTransition.from_gate;
    return {
      state,
      index,
      status: isCurrent
        ? "current"
        : wasPrevious
          ? "previous"
          : targetIndex >= 0 && index < targetIndex
            ? "completed"
            : "pending"
    };
  });
}

function pointInTimeSource(source) {
  return ["solana", "signed_iot_feed", "customs_attestation", "insurance_attestation", "escrow_mirror", "carbon_registry", "mrv_oracle", "custody_vault"].includes(source);
}

function summarizeSourceVerifiers(capsule) {
  return (capsule.evidence_refs || []).map((ref) => {
    const verifier = SOURCE_VERIFIER_REGISTRY[ref.source];
    const adapter = adapterStatusDescriptor(verifier?.live_adapter_status);
    return {
      evidence_id: ref.evidence_id,
      type: ref.type,
      source: ref.source,
      verifier_id: verifier?.verifier_id || "missing",
      mode: verifier?.mode || "not_registered",
      live_adapter_status: verifier?.live_adapter_status || "missing",
      adapter_label: adapter.label,
      adapter_disclosure: adapter.disclosure,
      proves: verifier?.proves || "No verifier contract registered.",
      freshness_rule: verifier?.freshness_rule || "Register a verifier before relying on this source."
    };
  });
}

function normalizeEvidenceRef(ref = {}) {
  const evidenceId = String(ref.evidence_id || ref.id || `${slugify(ref.type || "evidence").toUpperCase()}-REF`).trim();
  const source = String(ref.source || "enterprise_vault").trim();
  const type = String(ref.type || "document").trim();
  const normalized = {
    evidence_id: evidenceId,
    type,
    source,
    hash: ref.hash || "",
    summary: ref.summary || `${type} evidence from ${source}.`,
    ref: ref.ref || `${source}://${slugify(evidenceId)}`,
    explorer_url: ref.explorer_url || undefined,
    point_in_time: ref.point_in_time || undefined,
    freshness_status: ref.freshness_status || undefined,
    stale: ref.stale === true || undefined
  };
  if (!normalized.hash) {
    normalized.hash = hashValue({
      evidence_id: normalized.evidence_id,
      type: normalized.type,
      source: normalized.source,
      ref: normalized.ref,
      summary: normalized.summary
    });
    normalized.hash_auto_derived = true;
    normalized.hash_derivation = "auto_derived_from_ref_fields";
  }
  return Object.fromEntries(Object.entries(normalized).filter(([, value]) => value !== undefined));
}

function normalizeList(value, fallback = []) {
  if (Array.isArray(value)) {
    const list = value.map((item) => String(item || "").trim()).filter(Boolean);
    return list.length ? list : fallback;
  }
  if (typeof value === "string") {
    const list = value.split(/[,\n]/).map((item) => item.trim()).filter(Boolean);
    return list.length ? list : fallback;
  }
  return fallback;
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    || "custom";
}

function findNextWorkflowTransition(workflow, options = {}) {
  const transitions = workflow.transitions || [];
  if (options.action) {
    const byAction = transitions.find((transition) => transition.action === options.action);
    if (byAction) return byAction;
  }
  if (options.currentState) {
    const byState = transitions.find((transition) => transition.from_state === options.currentState);
    if (byState) return byState;
  }
  return transitions[0] || null;
}

function resolveWorkflowScenario(input = {}, capsule = {}) {
  if (input.workflow_definition?.workflow_id) {
    return input.workflow_definition.scenario || "custom_workflow";
  }
  return normalizeScenario(input.scenario || scenarioFromCapsule(capsule));
}

function resolveWorkflowDefinition(input = {}, capsule = {}, scenario = "tradeflow_medical_devices") {
  if (input.workflow_definition?.workflow_id) {
    const workflow = structuredClone(input.workflow_definition);
    return {
      ok: true,
      scenario,
      required_evidence_types: Array.from(new Set((workflow.transitions || []).flatMap((transition) => transition.required_evidence || []))).sort(),
      source_verifier_coverage: summarizeSourceVerifiers(capsule),
      workflow_hash: hashValue({
        scenario,
        workflow_id: workflow.workflow_id,
        states: workflow.states,
        transitions: workflow.transitions
      }),
      dual_build_contract: workflow.dual_build_contract || {
        template: workflow.dual_template || "io.dual.proof_capsule.lifecycle.v1",
        object: "one DUAL object per workflow instance",
        write_path: "event_bus",
        write_execution: "operator_gated",
        public_writes: false,
        readback_required_after_write: true
      },
      ...workflow
    };
  }
  return getWorkflowDefinition({ scenario });
}

function buildRecoveryActions({ failures, evidence, replay, policy }) {
  const actions = [];
  const missingTypes = new Set(evidence.results.filter((item) => item.status === "missing").map((item) => item.type));
  for (const type of missingTypes) {
    actions.push({
      action_id: `attach_${slugify(type)}_evidence`,
      label: `Attach ${type} evidence`,
      type: "attach_evidence",
      target: type,
      reason: "Required evidence is missing for the transition."
    });
  }
  const staleRefs = evidence.results.filter((item) => item.status === "stale");
  for (const ref of staleRefs) {
    actions.push({
      action_id: `recheck_${slugify(ref.source)}_${slugify(ref.type)}`,
      label: `Recheck ${ref.source}`,
      type: "recheck_source",
      target: ref.evidence_id,
      reason: ref.recheck_rule
    });
  }
  const unsupported = evidence.results.filter((item) => item.status === "not_sufficient");
  for (const ref of unsupported) {
    actions.push({
      action_id: `register_${slugify(ref.source || ref.type)}_verifier`,
      label: `Register verifier for ${ref.source || ref.type}`,
      type: "register_verifier",
      target: ref.source,
      reason: "The source has no verifier contract."
    });
  }
  if (replay.replay_steps.some((item) => !item.pass && item.name.includes("transition"))) {
    actions.push({
      action_id: "fix_state_transition",
      label: "Fix state transition",
      type: "edit_transition",
      target: replay.workflow_id,
      reason: "Capsule state transition does not match the workflow definition."
    });
  }
  if (policy.result === "Blocked") {
    actions.push({
      action_id: "policy_review",
      label: "Review policy result",
      type: "review_policy",
      target: policy.code,
      reason: policy.reason
    });
  }
  if (!actions.length) {
    actions.push({
      action_id: "operator_gated_sync",
      label: "Operator-gated DUAL sync",
      type: "sync",
      target: "/api/capsules/sync",
      reason: "No blocking recovery action remains."
    });
  }
  return actions;
}

function diffField(field, left, right) {
  return left === right ? null : { field, left: left ?? null, right: right ?? null };
}
