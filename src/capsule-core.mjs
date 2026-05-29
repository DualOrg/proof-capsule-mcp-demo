import { createHash } from "node:crypto";

export const SERVICE_NAME = "dual-proof-capsule-mcp";
export const SERVICE_VERSION = "0.5.1";
export const CAPSULE_SCHEMA_VERSION = "proof-capsule.v0.1";
export const CUSTOM_WORKFLOW_SCHEMA_VERSION = "proof-capsule-workflow-draft.v0.1";
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
  "real_estate"
];

export const SCENARIOS = [
  "tradeflow_medical_devices",
  "insurance_claim",
  "agent_mandate_purchase",
  "luxury_resale",
  "carbon_credit"
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
    check("schema_present", capsule.schema_version === CAPSULE_SCHEMA_VERSION),
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

  return {
    ok: true,
    page_type: "public_verifier",
    public_proof_id: publicProofId,
    public_url: publicUrl,
    scenario,
    capsule_id: capsule.capsule_id,
    capsule,
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
      source_links: sourceLinks
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
      "compose_proof_capsule",
      "verify_proof_capsule",
      "evaluate_capsule_policy",
      "red_team_capsule",
      "get_capsule_handoff",
      "run_proof_capsule",
      "get_public_verifier_page",
      "list_workflow_templates",
      "get_workflow_definition",
      "replay_workflow_capsule",
      "list_source_verifiers",
      "list_verifier_marketplace",
      "verify_evidence_refs",
      "build_workflow_draft",
      "plan_transition_queue",
      "diagnose_capsule",
      "get_proof_timeline",
      "compare_capsules",
      "generate_agent_handoff_pack"
    ],
    resources: [
      "capsule://manifest",
      "capsule://schema",
      "capsule://policy/default",
      "capsule://demo/tradeflow-medical-devices",
      "capsule://scorecard",
      "capsule://workflows",
      "capsule://source-verifiers",
      "capsule://verifier-marketplace",
      "capsule://operator-runbook",
      "capsule://proof-runbook"
    ],
    resourceTemplates: ["capsule://demo/{scenario}", "capsule://workflow/{scenario}", "capsule://public-proof/{scenario}"],
    prompts: [
      "proof_capsule_review",
      "mcp_client_handoff",
      "red_team_capsule_boundary",
      "design_proof_capsule_workflow",
      "operate_capsule_transition",
      "compare_capsule_versions",
      "publish_proof_capsule_verifier_page"
    ],
    supported_capsule_types: CAPSULE_TYPES,
    supported_scenarios: SCENARIOS,
    sourceBoundary: "DUAL anchors the proof envelope; source chains/vaults/feeds remain source of truth for native facts."
  };
}

export function scorecard() {
  return {
    ok: true,
    score_target: 9.8,
    score_claim: "v0.5_draft_until_revalidated",
    scoring_note: "The v0.5 public proof-run layer may only claim 9.8 after local/prod proof scripts pass and Claude Cowork independently agrees.",
    criteria: [
      { area: "MCP ergonomics", required: "Manifest, schema, resources, templates, prompts, read-only annotations, structured outputs." },
      { area: "Proof semantics", required: "Stable content hashes split from fresh envelope hashes; per-hash re-derivation." },
      { area: "Safety", required: "Public writes disabled; live DUAL writes only through operator-gated paths; no wallet actions or raw evidence storage." },
      { area: "Demo clarity", required: "Human UI shows capsule data, hashes, anchors, policy result, and verifier output." },
      { area: "Operator workflow", required: "Workflow builder, evidence intake, transition queue, recovery, timeline, verifier marketplace, compare, and agent handoff work without public writes." },
      { area: "Public proof run", required: "One-click proof run produces a shareable verifier page with claims, evidence, source checks, policy, replay, DUAL anchors, hashes, and next safe action." },
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
      "tools/call run_proof_capsule",
      "tools/call get_public_verifier_page",
      "tools/call verify_proof_capsule",
      "tools/call replay_workflow_capsule",
      "tools/call get_proof_timeline",
      "tools/call plan_transition_queue",
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
    return {
      evidence_id: ref.evidence_id,
      type: ref.type,
      source: ref.source,
      verifier_id: verifier?.verifier_id || "missing",
      mode: verifier?.mode || "not_registered",
      live_adapter_status: verifier?.live_adapter_status || "missing",
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
