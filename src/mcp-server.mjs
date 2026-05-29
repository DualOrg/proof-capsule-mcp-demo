import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  CAPSULE_SCHEMA_VERSION,
  CAPSULE_TYPES,
  SCENARIOS,
  SERVICE_NAME,
  SERVICE_VERSION,
  WRITE_BOUNDARY,
  attachProofToCapsule,
  buildProofTimeline,
  buildProofRoom,
  buildPublicVerifierPage,
  buildWorkflowDraft,
  capsuleToMarkdown,
  compareCapsules,
  composeProofCapsule,
  createCapsule,
  defaultPolicy,
  diagnoseCapsule,
  evaluateGate,
  evaluateCapsulePolicy,
  generateAgentHandoffPack,
  getWorkflowDefinition,
  handoff,
  listScenarioMarketplace,
  listVerifierMarketplace,
  listSourceVerifiers,
  listWorkflowTemplates,
  planTransitionQueue,
  publishPublicProof,
  redTeamCapsule,
  replayWorkflowCapsule,
  runProofCapsule,
  simulateWorkflow,
  scorecard,
  verifyEvidenceRefs,
  verifyProofCapsule
} from "./capsule-core.mjs";
import {
  getCurrentCapsuleLive,
  getDualStatusLive,
  liveServiceDescriptor,
  mintProofCapsule,
  readiness,
  requireOperator,
  syncProofCapsule
} from "./dual-live.mjs";

const READ_ONLY_ANNOTATIONS = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true
};

const WRITE_ANNOTATIONS = {
  readOnlyHint: false,
  destructiveHint: true,
  idempotentHint: false
};

const TOOL_META = {
  "dual.liveWrites": "operator_gated",
  "dual.writeBoundary": WRITE_BOUNDARY
};

const scenarioSchema = z.enum(SCENARIOS);
const capsuleTypeSchema = z.enum(CAPSULE_TYPES);
const unknownRecord = z.record(z.string(), z.unknown());
const unknownRecordArray = z.array(unknownRecord);

const descriptorOutputSchema = {
  ok: z.boolean(),
  service: z.string(),
  version: z.string(),
  schema_version: z.string(),
  transport: z.string(),
  endpoint: z.string(),
  mode: z.string(),
  project: z.string(),
  writeBoundary: z.string(),
  liveDualWrites: z.boolean(),
  publicWrites: z.boolean(),
  operatorTokenAccepted: z.boolean(),
  dual: unknownRecord.optional(),
  tools: z.array(z.string()),
  resources: z.array(z.string()),
  resourceTemplates: z.array(z.string()),
  prompts: z.array(z.string()),
  supported_capsule_types: z.array(z.string()),
  supported_scenarios: z.array(z.string()),
  sourceBoundary: z.string()
};

const capsuleOutputSchema = {
  schema_version: z.string(),
  capsule_id: z.string(),
  capsule_type: z.string(),
  subject: unknownRecord,
  claims: unknownRecordArray,
  evidence_refs: unknownRecordArray,
  external_anchors: unknownRecordArray,
  policy: unknownRecord,
  decision: unknownRecord,
  state_transition: unknownRecord,
  dual_anchor: unknownRecord,
  write_boundary: unknownRecord,
  generated_at: z.string(),
  hashes: z.record(z.string(), z.string()),
  hash_semantics: unknownRecord,
  verification_contract: unknownRecord,
  content_preview_hash: z.string()
};

function jsonText(value) {
  return {
    content: [{ type: "text", text: JSON.stringify(value, null, 2) }],
    structuredContent: value
  };
}

function textPrompt(text) {
  return {
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text
        }
      }
    ]
  };
}

function capsuleInputSchema() {
  return {
    scenario: scenarioSchema.optional(),
    capsule_id: z.string().optional(),
    capsule_type: capsuleTypeSchema.optional(),
    subject: z.record(z.string(), z.unknown()).optional(),
    claims: z.array(z.record(z.string(), z.unknown())).optional(),
    evidence_refs: z.array(z.record(z.string(), z.unknown())).optional(),
    external_anchors: z.array(z.record(z.string(), z.unknown())).optional(),
    policy: z.record(z.string(), z.unknown()).optional(),
    decision: z.record(z.string(), z.unknown()).optional(),
    state_transition: z.record(z.string(), z.unknown()).optional(),
    dual_anchor: z.record(z.string(), z.unknown()).optional()
  };
}

export function getMcpDescriptor() {
  return liveServiceDescriptor();
}

export function createMcpServer() {
  const server = new McpServer({
    name: SERVICE_NAME,
    version: SERVICE_VERSION
  });

  server.registerResource(
    "manifest",
    "capsule://manifest",
    {
      title: "Proof Capsule MCP Manifest",
      description: "Self-describing MCP manifest for the Proof Capsule demo.",
      mimeType: "application/json"
    },
    async (uri) => ({ contents: [{ uri: uri.href, text: JSON.stringify(liveServiceDescriptor(), null, 2) }] })
  );

  server.registerResource(
    "schema",
    "capsule://schema",
    {
      title: "Proof Capsule Schema",
      description: "Canonical fields and hash semantics for a DUAL Proof Capsule.",
      mimeType: "application/json"
    },
    async (uri) => ({
      contents: [{
        uri: uri.href,
        text: JSON.stringify({
          schema_version: CAPSULE_SCHEMA_VERSION,
          canonical_fields: [
            "capsule_id",
            "capsule_type",
            "subject",
            "claims",
            "evidence_refs",
            "external_anchors",
            "policy",
            "decision",
            "state_transition",
            "dual_anchor",
            "hashes",
            "write_boundary"
          ],
          hash_semantics: "Stable content hashes exclude generated_at. Envelope hash includes generated_at for fresh attestations.",
          write_boundary: WRITE_BOUNDARY
        }, null, 2)
      }]
    })
  );

  server.registerResource(
    "default-policy",
    "capsule://policy/default",
    {
      title: "Default Proof Capsule Policy",
      description: "Demo policy defining supported proof categories, sources, thresholds, and live-write boundary.",
      mimeType: "application/json"
    },
    async (uri) => ({ contents: [{ uri: uri.href, text: JSON.stringify(defaultPolicy(), null, 2) }] })
  );

  server.registerResource(
    "tradeflow-demo",
    "capsule://demo/tradeflow-medical-devices",
    {
      title: "TradeFlow Medical Devices Proof Capsule",
      description: "A composed Proof Capsule for the Singapore to Australia TradeFlow scenario.",
      mimeType: "application/json"
    },
    async (uri) => ({ contents: [{ uri: uri.href, text: JSON.stringify(composeProofCapsule({ scenario: "tradeflow_medical_devices" }), null, 2) }] })
  );

  server.registerResource(
    "scorecard",
    "capsule://scorecard",
    {
      title: "Proof Capsule Demo Scorecard",
      description: "Acceptance criteria and current score-claim boundary.",
      mimeType: "application/json"
    },
    async (uri) => ({ contents: [{ uri: uri.href, text: JSON.stringify(scorecard(), null, 2) }] })
  );

  server.registerResource(
    "workflows",
    "capsule://workflows",
    {
      title: "Proof Capsule Workflow Templates",
      description: "Reusable DUAL workflow definitions that bind proof capsules to state transitions.",
      mimeType: "application/json"
    },
    async (uri) => ({ contents: [{ uri: uri.href, text: JSON.stringify(listWorkflowTemplates(), null, 2) }] })
  );

  server.registerResource(
    "scenario-marketplace",
    "capsule://scenario-marketplace",
    {
      title: "Proof Capsule Scenario Marketplace",
      description: "Use-case templates for trade, ownership, agent mandates, insurance, carbon, invoice/payment release, and universal multi-proof capsules.",
      mimeType: "application/json"
    },
    async (uri) => ({ contents: [{ uri: uri.href, text: JSON.stringify(listScenarioMarketplace(), null, 2) }] })
  );

  server.registerResource(
    "source-verifiers",
    "capsule://source-verifiers",
    {
      title: "Proof Capsule Source Verifier Registry",
      description: "Source-system verifier contracts and point-in-time proof boundaries.",
      mimeType: "application/json"
    },
    async (uri) => ({ contents: [{ uri: uri.href, text: JSON.stringify(listSourceVerifiers(), null, 2) }] })
  );

  server.registerResource(
    "verifier-marketplace",
    "capsule://verifier-marketplace",
    {
      title: "Proof Capsule Verifier Marketplace",
      description: "Selectable verifier modules for source facts such as Solana, DUAL, IPFS, vaults, telemetry, registries, and payment mirrors.",
      mimeType: "application/json"
    },
    async (uri) => ({ contents: [{ uri: uri.href, text: JSON.stringify(listVerifierMarketplace(), null, 2) }] })
  );

  server.registerResource(
    "proof-room",
    "capsule://proof-room",
    {
      title: "Universal Proof Capsule Room",
      description: "Shareable proof room for the flagship universal multi-proof capsule.",
      mimeType: "application/json"
    },
    async (uri) => ({
      contents: [{
        uri: uri.href,
        text: JSON.stringify(buildProofRoom({
          scenario: "universal_proof_capsule",
          base_url: "https://proof-capsule-mcp-demo.vercel.app",
          endpoint: "https://proof-capsule-mcp-demo.vercel.app/mcp"
        }), null, 2)
      }]
    })
  );

  server.registerResource(
    "agent-mode",
    "capsule://agent-mode",
    {
      title: "Proof Capsule Agent Mode",
      description: "Agent-facing read/write boundary and recommended MCP tool sequence.",
      mimeType: "application/json"
    },
    async (uri) => ({
      contents: [{
        uri: uri.href,
        text: JSON.stringify({
          ok: true,
          mode: "agent_operable_verifier",
          read_tools: ["create_capsule", "attach_proof", "evaluate_gate", "simulate_workflow", "verify_capsule", "publish_public_proof", "compare_capsules", "red_team_capsule"],
          write_tools: ["sync_proof_capsule_live", "mint_proof_capsule_live"],
          default_sequence: ["create_capsule", "attach_proof", "evaluate_gate", "simulate_workflow", "verify_capsule", "publish_public_proof"],
          public_writes: false,
          operator_gate: "required for write tools",
          boundary: WRITE_BOUNDARY
        }, null, 2)
      }]
    })
  );

  server.registerResource(
    "operator-runbook",
    "capsule://operator-runbook",
    {
      title: "Proof Capsule Operator Runbook",
      description: "Read-only runbook for evidence intake, transition dry-run, recovery, timeline review, and operator-gated DUAL sync.",
      mimeType: "application/json"
    },
    async (uri) => ({
      contents: [{
        uri: uri.href,
        text: JSON.stringify({
          ok: true,
          sequence: [
            "compose_proof_capsule",
            "verify_evidence_refs",
            "replay_workflow_capsule",
            "diagnose_capsule",
            "plan_transition_queue",
            "sync_proof_capsule_live only when an authorised operator supplies the token",
            "get_current_live_capsule",
            "get_proof_timeline"
          ],
          public_writes: false,
          operator_gate: "required for live DUAL writes",
          secret_policy: "Never put operator tokens in read-only tool calls or shared handoff packs."
        }, null, 2)
      }]
    })
  );

  server.registerResource(
    "proof-runbook",
    "capsule://proof-runbook",
    {
      title: "Proof Capsule Public Proof Runbook",
      description: "Read-only runbook for one-click proof runs and public verifier pages.",
      mimeType: "application/json"
    },
    async (uri) => ({
      contents: [{
        uri: uri.href,
        text: JSON.stringify({
          ok: true,
          public_flow: [
            "run_proof_capsule",
            "review proof_score and steps",
            "open public_verifier.public_url",
            "share get_public_verifier_page output with humans or agents",
            "use plan_transition_queue and operator-gated sync only after approval"
          ],
          public_page_sections: [
            "claims",
            "evidence_refs",
            "source_checks",
            "policy_decision",
            "workflow_replay",
            "dual_anchor",
            "hashes",
            "timeline",
            "transition_plan"
          ],
          public_writes: false,
          raw_payload_stored: false,
          boundary: WRITE_BOUNDARY
        }, null, 2)
      }]
    })
  );

  server.registerResource(
    "dual-status",
    "capsule://dual/status",
    {
      title: "Live DUAL Status",
      description: "DUAL readback and operator-gated write readiness.",
      mimeType: "application/json"
    },
    async (uri) => ({ contents: [{ uri: uri.href, text: JSON.stringify(await getDualStatusLive(), null, 2) }] })
  );

  server.registerResource(
    "dual-current-capsule",
    "capsule://dual/current",
    {
      title: "Current Live Proof Capsule",
      description: "The current capsule from live DUAL readback when configured, otherwise local seed.",
      mimeType: "application/json"
    },
    async (uri) => ({ contents: [{ uri: uri.href, text: JSON.stringify(await getCurrentCapsuleLive(), null, 2) }] })
  );

  server.registerResource(
    "scenario-template",
    new ResourceTemplate("capsule://demo/{scenario}", {
      list: async () => ({
        resources: SCENARIOS.map((scenario) => ({
          uri: `capsule://demo/${scenario}`,
          name: `${scenario}-capsule`,
          title: `${scenario.replaceAll("_", " ")} Proof Capsule`,
          description: "Generated demo Proof Capsule resource.",
          mimeType: "application/json"
        }))
      }),
      complete: {
        scenario: (value) => SCENARIOS.filter((scenario) => scenario.startsWith(value || ""))
      }
    }),
    {
      title: "Scenario Proof Capsule",
      description: "Read a demo Proof Capsule by scenario slug.",
      mimeType: "application/json"
    },
    async (uri, variables) => ({
      contents: [{
        uri: uri.href,
        text: JSON.stringify(composeProofCapsule({ scenario: variables.scenario }), null, 2)
      }]
    })
  );

  server.registerResource(
    "workflow-template",
    new ResourceTemplate("capsule://workflow/{scenario}", {
      list: async () => ({
        resources: SCENARIOS.map((scenario) => ({
          uri: `capsule://workflow/${scenario}`,
          name: `${scenario}-workflow`,
          title: `${scenario.replaceAll("_", " ")} Workflow Definition`,
          description: "DUAL lifecycle/state-machine definition for this Proof Capsule scenario.",
          mimeType: "application/json"
        }))
      }),
      complete: {
        scenario: (value) => SCENARIOS.filter((scenario) => scenario.startsWith(value || ""))
      }
    }),
    {
      title: "Scenario Workflow Definition",
      description: "Read a reusable DUAL workflow definition by scenario slug.",
      mimeType: "application/json"
    },
    async (uri, variables) => ({
      contents: [{
        uri: uri.href,
        text: JSON.stringify(getWorkflowDefinition({ scenario: variables.scenario }), null, 2)
      }]
    })
  );

  server.registerResource(
    "public-proof-template",
    new ResourceTemplate("capsule://public-proof/{scenario}", {
      list: async () => ({
        resources: SCENARIOS.map((scenario) => ({
          uri: `capsule://public-proof/${scenario}`,
          name: `${scenario}-public-proof`,
          title: `${scenario.replaceAll("_", " ")} Public Verifier Page`,
          description: "Public verifier page model for this Proof Capsule scenario.",
          mimeType: "application/json"
        }))
      }),
      complete: {
        scenario: (value) => SCENARIOS.filter((scenario) => scenario.startsWith(value || ""))
      }
    }),
    {
      title: "Scenario Public Verifier Page",
      description: "Read a public verifier page model by scenario slug.",
      mimeType: "application/json"
    },
    async (uri, variables) => ({
      contents: [{
        uri: uri.href,
        text: JSON.stringify(buildPublicVerifierPage({
          scenario: variables.scenario,
          base_url: "https://proof-capsule-mcp-demo.vercel.app",
          endpoint: "https://proof-capsule-mcp-demo.vercel.app/mcp"
        }), null, 2)
      }]
    })
  );

  server.registerResource(
    "proof-room-template",
    new ResourceTemplate("capsule://proof-room/{scenario}", {
      list: async () => ({
        resources: SCENARIOS.map((scenario) => ({
          uri: `capsule://proof-room/${scenario}`,
          name: `${scenario}-proof-room`,
          title: `${scenario.replaceAll("_", " ")} Proof Room`,
          description: "Shareable proof room model for this Proof Capsule scenario.",
          mimeType: "application/json"
        }))
      }),
      complete: {
        scenario: (value) => SCENARIOS.filter((scenario) => scenario.startsWith(value || ""))
      }
    }),
    {
      title: "Scenario Proof Room",
      description: "Read a shareable proof room model by scenario slug.",
      mimeType: "application/json"
    },
    async (uri, variables) => ({
      contents: [{
        uri: uri.href,
        text: JSON.stringify(buildProofRoom({
          scenario: variables.scenario,
          base_url: "https://proof-capsule-mcp-demo.vercel.app",
          endpoint: "https://proof-capsule-mcp-demo.vercel.app/mcp"
        }), null, 2)
      }]
    })
  );

  server.registerTool(
    "get_capsule_status",
    {
      title: "Get Capsule Status",
      description: "Return the Proof Capsule MCP manifest, supported scenarios, and live-write boundary.",
      inputSchema: {},
      outputSchema: descriptorOutputSchema,
      annotations: READ_ONLY_ANNOTATIONS,
      _meta: TOOL_META
    },
    async () => jsonText(liveServiceDescriptor())
  );

  server.registerTool(
    "get_live_dual_status",
    {
      title: "Get Live DUAL Status",
      description: "Return DUAL readback readiness, object/template IDs, and operator-gated write boundary.",
      inputSchema: {},
      annotations: READ_ONLY_ANNOTATIONS,
      _meta: TOOL_META
    },
    async () => jsonText(await getDualStatusLive())
  );

  server.registerTool(
    "get_current_live_capsule",
    {
      title: "Get Current Live Capsule",
      description: "Return the current Proof Capsule from live DUAL readback when configured, otherwise the local seed capsule.",
      inputSchema: {
        scenario: scenarioSchema.optional()
      },
      annotations: READ_ONLY_ANNOTATIONS,
      _meta: TOOL_META
    },
    async (input) => jsonText(await getCurrentCapsuleLive(input))
  );

  server.registerTool(
    "create_capsule",
    {
      title: "Create Capsule",
      description: "Agent-friendly alias for composing a capsule, verifying it, and returning the proof-room model.",
      inputSchema: capsuleInputSchema(),
      annotations: READ_ONLY_ANNOTATIONS,
      _meta: TOOL_META
    },
    async (input) => jsonText(createCapsule(input))
  );

  server.registerTool(
    "attach_proof",
    {
      title: "Attach Proof",
      description: "Attach an evidence/proof reference to a capsule, recompose hashes, and re-check evidence sufficiency.",
      inputSchema: {
        capsule: z.record(z.string(), z.unknown()).optional(),
        scenario: scenarioSchema.optional(),
        proof_ref: z.record(z.string(), z.unknown()).optional(),
        evidence_ref: z.record(z.string(), z.unknown()).optional(),
        evidence_id: z.string().optional(),
        type: z.string().optional(),
        source: z.string().optional(),
        summary: z.string().optional(),
        ref: z.string().optional(),
        uri: z.string().optional(),
        hash: z.string().optional(),
        explorer_url: z.string().url().optional(),
        workflow_definition: z.record(z.string(), z.unknown()).optional()
      },
      annotations: READ_ONLY_ANNOTATIONS,
      _meta: TOOL_META
    },
    async (input) => jsonText(attachProofToCapsule(input))
  );

  server.registerTool(
    "evaluate_gate",
    {
      title: "Evaluate Gate",
      description: "Agent-friendly gate evaluator: policy, evidence, workflow replay, and transition dry-run without writes.",
      inputSchema: {
        capsule: z.record(z.string(), z.unknown()).optional(),
        scenario: scenarioSchema.optional(),
        workflow_definition: z.record(z.string(), z.unknown()).optional(),
        policy: z.record(z.string(), z.unknown()).optional(),
        action: z.string().optional(),
        transition_action: z.string().optional(),
        dry_run: z.boolean().optional()
      },
      annotations: READ_ONLY_ANNOTATIONS,
      _meta: TOOL_META
    },
    async (input) => jsonText(evaluateGate(input))
  );

  server.registerTool(
    "simulate_workflow",
    {
      title: "Simulate Workflow",
      description: "Simulate a capsule through its workflow states and show which transitions are verified, ready, or missing evidence.",
      inputSchema: {
        capsule: z.record(z.string(), z.unknown()).optional(),
        scenario: scenarioSchema.optional(),
        workflow_definition: z.record(z.string(), z.unknown()).optional(),
        action: z.string().optional(),
        transition_action: z.string().optional()
      },
      annotations: READ_ONLY_ANNOTATIONS,
      _meta: TOOL_META
    },
    async (input) => jsonText(simulateWorkflow(input))
  );

  server.registerTool(
    "verify_capsule",
    {
      title: "Verify Capsule",
      description: "Agent-friendly alias for verify_proof_capsule.",
      inputSchema: {
        capsule: z.record(z.string(), z.unknown()).optional(),
        scenario: scenarioSchema.optional()
      },
      annotations: READ_ONLY_ANNOTATIONS,
      _meta: TOOL_META
    },
    async (input) => jsonText(verifyProofCapsule(input))
  );

  server.registerTool(
    "compose_proof_capsule",
    {
      title: "Compose Proof Capsule",
      description: "Compose a deterministic Proof Capsule from a scenario or caller-supplied capsule fields.",
      inputSchema: capsuleInputSchema(),
      outputSchema: capsuleOutputSchema,
      annotations: READ_ONLY_ANNOTATIONS,
      _meta: TOOL_META
    },
    async (input) => jsonText(composeProofCapsule(input))
  );

  server.registerTool(
    "verify_proof_capsule",
    {
      title: "Verify Proof Capsule",
      description: "Re-derive Proof Capsule hashes and check policy/evidence/write-boundary invariants.",
      inputSchema: {
        capsule: z.record(z.string(), z.unknown()).optional(),
        scenario: scenarioSchema.optional()
      },
      outputSchema: {
        ok: z.boolean(),
        accepted: z.boolean(),
        policy_ok: z.boolean(),
        verification_level: z.string(),
        caveats: z.array(z.string()),
        checks: z.array(z.record(z.string(), z.unknown())),
        hashes: z.record(z.string(), z.unknown()),
        policy_evaluation: unknownRecord,
        write_boundary: unknownRecord
      },
      annotations: READ_ONLY_ANNOTATIONS,
      _meta: TOOL_META
    },
    async (input) => jsonText(verifyProofCapsule(input))
  );

  server.registerTool(
    "evaluate_capsule_policy",
    {
      title: "Evaluate Capsule Policy",
      description: "Evaluate whether a capsule satisfies the required proof categories, sources, and mandate thresholds.",
      inputSchema: {
        capsule: z.record(z.string(), z.unknown()).optional(),
        scenario: scenarioSchema.optional(),
        policy: z.record(z.string(), z.unknown()).optional()
      },
      outputSchema: {
        ok: z.boolean(),
        result: z.string(),
        code: z.string(),
        blockedOrEscalated: z.boolean(),
        reason: z.string(),
        missing_required_anchor_types: z.array(z.string()),
        unsupported_sources: unknownRecordArray,
        value_usd: z.number(),
        max_value_usd: z.number(),
        human_review_threshold_usd: z.number(),
        evidence_anchor_summary: unknownRecordArray,
        decision_content_hash: z.string()
      },
      annotations: READ_ONLY_ANNOTATIONS,
      _meta: TOOL_META
    },
    async (input) => jsonText(evaluateCapsulePolicy(input))
  );

  server.registerTool(
    "red_team_capsule",
    {
      title: "Red Team Capsule",
      description: "Run deterministic adversarial scenarios against the Proof Capsule verifier.",
      inputSchema: {
        attack: z.enum(["live_write_escalation", "missing_evidence", "unsupported_chain", "hash_tamper", "stale_ownership", "clean_capsule"]).optional(),
        scenario: scenarioSchema.optional()
      },
      outputSchema: {
        ok: z.boolean(),
        attack: z.string(),
        blocked: z.boolean(),
        code: z.string(),
        reason: z.string(),
        expected_result: z.string(),
        matchedExpectation: z.boolean(),
        decision_content_hash: z.string(),
        write_boundary: unknownRecord,
        remediation: z.string()
      },
      annotations: READ_ONLY_ANNOTATIONS,
      _meta: TOOL_META
    },
    async (input) => jsonText(redTeamCapsule(input))
  );

  server.registerTool(
    "get_capsule_handoff",
    {
      title: "Get Capsule MCP Handoff",
      description: "Return connection details and first calls for an MCP client.",
      inputSchema: {
        endpoint: z.string().url().optional()
      },
      outputSchema: {
        ok: z.boolean(),
        endpoint: z.string(),
        client_config: z.record(z.string(), z.unknown()),
        first_calls: z.array(z.string()),
        write_boundary: z.string()
      },
      annotations: READ_ONLY_ANNOTATIONS,
      _meta: TOOL_META
    },
    async ({ endpoint }) => jsonText(handoff(endpoint))
  );

  server.registerTool(
    "run_proof_capsule",
    {
      title: "Run Proof Capsule",
      description: "One-click read-only proof run: verify hashes, policy, evidence, workflow replay, transition plan, recovery, handoff, and public verifier page.",
      inputSchema: {
        scenario: scenarioSchema.optional(),
        capsule: z.record(z.string(), z.unknown()).optional(),
        workflow_definition: z.record(z.string(), z.unknown()).optional(),
        endpoint: z.string().optional(),
        base_url: z.string().optional(),
        action: z.string().optional(),
        transition_action: z.string().optional()
      },
      annotations: READ_ONLY_ANNOTATIONS,
      _meta: TOOL_META
    },
    async (input) => jsonText(runProofCapsule(input))
  );

  server.registerTool(
    "get_public_verifier_page",
    {
      title: "Get Public Verifier Page",
      description: "Return the shareable public verifier page model for a Proof Capsule without executing a write.",
      inputSchema: {
        scenario: scenarioSchema.optional(),
        capsule: z.record(z.string(), z.unknown()).optional(),
        workflow_definition: z.record(z.string(), z.unknown()).optional(),
        endpoint: z.string().optional(),
        base_url: z.string().optional(),
        proof_id: z.string().optional(),
        public_proof_id: z.string().optional(),
        capsule_id: z.string().optional(),
        id: z.string().optional(),
        content_hash: z.string().optional(),
        hash: z.string().optional()
      },
      annotations: READ_ONLY_ANNOTATIONS,
      _meta: TOOL_META
    },
    async (input) => jsonText(buildPublicVerifierPage(input))
  );

  server.registerTool(
    "publish_public_proof",
    {
      title: "Publish Public Proof",
      description: "Agent-friendly public proof publisher: returns a tamper-evident public verifier URL and proof-room model without executing writes.",
      inputSchema: {
        scenario: scenarioSchema.optional(),
        capsule: z.record(z.string(), z.unknown()).optional(),
        workflow_definition: z.record(z.string(), z.unknown()).optional(),
        endpoint: z.string().optional(),
        base_url: z.string().optional(),
        proof_id: z.string().optional(),
        public_proof_id: z.string().optional(),
        capsule_id: z.string().optional(),
        id: z.string().optional(),
        content_hash: z.string().optional(),
        hash: z.string().optional()
      },
      annotations: READ_ONLY_ANNOTATIONS,
      _meta: TOOL_META
    },
    async (input) => jsonText(publishPublicProof(input))
  );

  server.registerTool(
    "get_proof_room",
    {
      title: "Get Proof Room",
      description: "Return the shareable evidence room: source cards, DUAL links, proof limitations, downloads, agent mode, and operator boundary.",
      inputSchema: {
        scenario: scenarioSchema.optional(),
        capsule: z.record(z.string(), z.unknown()).optional(),
        workflow_definition: z.record(z.string(), z.unknown()).optional(),
        endpoint: z.string().optional(),
        base_url: z.string().optional(),
        proof_id: z.string().optional(),
        content_hash: z.string().optional()
      },
      annotations: READ_ONLY_ANNOTATIONS,
      _meta: TOOL_META
    },
    async (input) => jsonText(buildProofRoom(input))
  );

  server.registerTool(
    "list_workflow_templates",
    {
      title: "List Workflow Templates",
      description: "List reusable DUAL Proof Capsule workflow/state-machine templates.",
      inputSchema: {},
      annotations: READ_ONLY_ANNOTATIONS,
      _meta: TOOL_META
    },
    async () => jsonText(listWorkflowTemplates())
  );

  server.registerTool(
    "list_scenario_marketplace",
    {
      title: "List Scenario Marketplace",
      description: "List proof-capsule scenario templates for trade, ownership, agent mandates, insurance, carbon, invoice/payment release, and universal multi-proof workflows.",
      inputSchema: {},
      annotations: READ_ONLY_ANNOTATIONS,
      _meta: TOOL_META
    },
    async () => jsonText(listScenarioMarketplace())
  );

  server.registerTool(
    "get_workflow_definition",
    {
      title: "Get Workflow Definition",
      description: "Return the DUAL lifecycle/state-machine definition for a Proof Capsule scenario.",
      inputSchema: {
        scenario: scenarioSchema.optional()
      },
      annotations: READ_ONLY_ANNOTATIONS,
      _meta: TOOL_META
    },
    async (input) => jsonText(getWorkflowDefinition(input))
  );

  server.registerTool(
    "replay_workflow_capsule",
    {
      title: "Replay Workflow Capsule",
      description: "Replay a capsule through its DUAL workflow definition: transition, evidence, source verifier, policy, hash, and write-boundary checks.",
      inputSchema: {
        capsule: z.record(z.string(), z.unknown()).optional(),
        scenario: scenarioSchema.optional(),
        workflow_definition: z.record(z.string(), z.unknown()).optional()
      },
      annotations: READ_ONLY_ANNOTATIONS,
      _meta: TOOL_META
    },
    async (input) => jsonText(replayWorkflowCapsule(input))
  );

  server.registerTool(
    "list_source_verifiers",
    {
      title: "List Source Verifiers",
      description: "List source verifier contracts for point-in-time external proof refs.",
      inputSchema: {},
      annotations: READ_ONLY_ANNOTATIONS,
      _meta: TOOL_META
    },
    async () => jsonText(listSourceVerifiers())
  );

  server.registerTool(
    "list_verifier_marketplace",
    {
      title: "List Verifier Marketplace",
      description: "List selectable verifier modules and their source-fact boundaries for workflow design and evidence intake.",
      inputSchema: {
        sources: z.array(z.string()).optional(),
        selected_sources: z.array(z.string()).optional()
      },
      annotations: READ_ONLY_ANNOTATIONS,
      _meta: TOOL_META
    },
    async (input) => jsonText(listVerifierMarketplace(input))
  );

  server.registerTool(
    "verify_evidence_refs",
    {
      title: "Verify Evidence References",
      description: "Normalize and check evidence refs against required workflow evidence and source verifier contracts.",
      inputSchema: {
        scenario: scenarioSchema.optional(),
        capsule: z.record(z.string(), z.unknown()).optional(),
        workflow_definition: z.record(z.string(), z.unknown()).optional(),
        evidence_refs: z.array(z.record(z.string(), z.unknown())).optional(),
        required_evidence: z.array(z.string()).optional()
      },
      annotations: READ_ONLY_ANNOTATIONS,
      _meta: TOOL_META
    },
    async (input) => jsonText(verifyEvidenceRefs(input))
  );

  server.registerTool(
    "build_workflow_draft",
    {
      title: "Build Workflow Draft",
      description: "Generate a reusable Proof Capsule workflow draft, policy, evidence refs, and draft capsule from operator-supplied process fields.",
      inputSchema: {
        title: z.string().optional(),
        workflow_title: z.string().optional(),
        subject_type: z.string().optional(),
        subject_id: z.string().optional(),
        subject_label: z.string().optional(),
        states: z.union([z.array(z.string()), z.string()]).optional(),
        evidence_types: z.union([z.array(z.string()), z.string()]).optional(),
        required_evidence: z.union([z.array(z.string()), z.string()]).optional(),
        sources: z.union([z.array(z.string()), z.string()]).optional(),
        selected_sources: z.union([z.array(z.string()), z.string()]).optional(),
        policy_gate: z.string().optional(),
        action: z.string().optional(),
        actor: z.string().optional(),
        value_usd: z.number().optional(),
        max_value_usd: z.number().optional(),
        human_review_threshold_usd: z.number().optional()
      },
      annotations: READ_ONLY_ANNOTATIONS,
      _meta: TOOL_META
    },
    async (input) => jsonText(buildWorkflowDraft(input))
  );

  server.registerTool(
    "plan_transition_queue",
    {
      title: "Plan Transition Queue",
      description: "Dry-run the next workflow transition and return the operator-gated DUAL sync payload without executing it.",
      inputSchema: {
        scenario: scenarioSchema.optional(),
        capsule: z.record(z.string(), z.unknown()).optional(),
        workflow_definition: z.record(z.string(), z.unknown()).optional(),
        evidence_refs: z.array(z.record(z.string(), z.unknown())).optional(),
        action: z.string().optional(),
        transition_action: z.string().optional(),
        actor: z.string().optional(),
        from_state: z.string().optional(),
        dry_run: z.boolean().optional()
      },
      annotations: READ_ONLY_ANNOTATIONS,
      _meta: TOOL_META
    },
    async (input) => jsonText(planTransitionQueue(input))
  );

  server.registerTool(
    "diagnose_capsule",
    {
      title: "Diagnose Capsule",
      description: "Return failure and recovery actions for evidence, policy, workflow replay, and transition issues.",
      inputSchema: {
        scenario: scenarioSchema.optional(),
        capsule: z.record(z.string(), z.unknown()).optional(),
        workflow_definition: z.record(z.string(), z.unknown()).optional()
      },
      annotations: READ_ONLY_ANNOTATIONS,
      _meta: TOOL_META
    },
    async (input) => jsonText(diagnoseCapsule(input))
  );

  server.registerTool(
    "get_proof_timeline",
    {
      title: "Get Proof Timeline",
      description: "Return a lifecycle timeline with state, evidence, decision, hash, and DUAL link context.",
      inputSchema: {
        scenario: scenarioSchema.optional(),
        capsule: z.record(z.string(), z.unknown()).optional(),
        workflow_definition: z.record(z.string(), z.unknown()).optional()
      },
      annotations: READ_ONLY_ANNOTATIONS,
      _meta: TOOL_META
    },
    async (input) => jsonText(buildProofTimeline(input))
  );

  server.registerTool(
    "compare_capsules",
    {
      title: "Compare Capsules",
      description: "Compare two capsules or scenario versions and show evidence, state, policy, decision, and hash changes.",
      inputSchema: {
        scenario: scenarioSchema.optional(),
        left_scenario: scenarioSchema.optional(),
        right_scenario: scenarioSchema.optional(),
        left: z.record(z.string(), z.unknown()).optional(),
        right: z.record(z.string(), z.unknown()).optional()
      },
      annotations: READ_ONLY_ANNOTATIONS,
      _meta: TOOL_META
    },
    async (input) => jsonText(compareCapsules(input))
  );

  server.registerTool(
    "generate_agent_handoff_pack",
    {
      title: "Generate Agent Handoff Pack",
      description: "Produce an MCP handoff pack with calls, resources, next allowed actions, replay status, and write-boundary caveats.",
      inputSchema: {
        scenario: scenarioSchema.optional(),
        capsule: z.record(z.string(), z.unknown()).optional(),
        workflow_definition: z.record(z.string(), z.unknown()).optional(),
        endpoint: z.string().optional()
      },
      annotations: READ_ONLY_ANNOTATIONS,
      _meta: TOOL_META
    },
    async (input) => jsonText(generateAgentHandoffPack(input))
  );

  server.registerTool(
    "sync_proof_capsule_live",
    {
      title: "Sync Proof Capsule Live",
      description: "Operator-gated live DUAL update: sync a verified Proof Capsule to the configured DUAL object. Public callers cannot execute this without the server-side operator token.",
      inputSchema: {
        operator_token: z.string(),
        scenario: scenarioSchema.optional(),
        capsule: z.record(z.string(), z.unknown()).optional(),
        audit: z.record(z.string(), z.unknown()).optional()
      },
      annotations: WRITE_ANNOTATIONS,
      _meta: TOOL_META
    },
    async ({ operator_token, ...input }) => {
      requireOperator(operator_token, { source: "sync_proof_capsule_live" });
      return jsonText(await syncProofCapsule(input));
    }
  );

  server.registerTool(
    "mint_proof_capsule_live",
    {
      title: "Mint Proof Capsule Live",
      description: "Operator-gated live DUAL mint: mint a new Proof Capsule object from the configured template. Refuses duplicate canonical minting unless force=true.",
      inputSchema: {
        operator_token: z.string(),
        scenario: scenarioSchema.optional(),
        capsule: z.record(z.string(), z.unknown()).optional(),
        audit: z.record(z.string(), z.unknown()).optional(),
        force: z.boolean().optional()
      },
      annotations: WRITE_ANNOTATIONS,
      _meta: TOOL_META
    },
    async ({ operator_token, ...input }) => {
      requireOperator(operator_token, { source: "mint_proof_capsule_live" });
      return jsonText(await mintProofCapsule(input));
    }
  );

  server.registerPrompt(
    "proof_capsule_review",
    {
      title: "Review a Proof Capsule",
      description: "Checklist prompt for reviewing a Proof Capsule proof bundle.",
      argsSchema: {
        capsuleId: z.string().optional()
      }
    },
    ({ capsuleId }) => textPrompt([
      `Review Proof Capsule ${capsuleId || "the supplied capsule"} for:`,
      "1. Clear source boundary between external facts and DUAL proof envelope.",
      "2. First-class evidence refs for every required claim.",
      "3. Stable content hashes split from fresh envelope hashes.",
    "4. Explicit live-write boundary: public writes disabled; DUAL writes only through operator-gated paths.",
      "5. Human-readable verifier result and caveats."
    ].join("\n"))
  );

  server.registerPrompt(
    "mcp_client_handoff",
    {
      title: "MCP Client Handoff",
      description: "Explain how an MCP client should connect and verify a capsule.",
      argsSchema: {
        endpoint: z.string().optional()
      }
    },
    ({ endpoint }) => textPrompt(`Connect to ${endpoint || "http://127.0.0.1:4184/mcp"}, read capsule://manifest and capsule://dual/status, call compose_proof_capsule, then verify_proof_capsule. Do not send secrets unless you are deliberately invoking an operator-gated live write tool.`)
  );

  server.registerPrompt(
    "red_team_capsule_boundary",
    {
      title: "Red Team Capsule Boundary",
      description: "Generate red-team checks for live-write, stale-source, and tamper cases.",
      argsSchema: {
        scenario: z.string().optional()
      }
    },
    ({ scenario }) => textPrompt(`Red-team ${scenario || "the proof capsule"} against missing evidence, unsupported source systems, stale ownership, hash tampering, public-write exposure, and un-gated live DUAL write escalation. Current DUAL readiness: ${JSON.stringify(readiness())}`)
  );

  server.registerPrompt(
    "design_proof_capsule_workflow",
    {
      title: "Design a Proof Capsule Workflow",
      description: "Convert a business process into a DUAL template/object/event-bus workflow with source verifier contracts.",
      argsSchema: {
        workflow: z.string().optional()
      }
    },
    ({ workflow }) => textPrompt([
      `Design a DUAL Proof Capsule workflow for: ${workflow || "the supplied process"}.`,
      "Return: subject, states, allowed transitions, required evidence per transition, source verifier contracts, freshness rules, DUAL template fields, event-bus actions, readback checks, and public/operator write boundary.",
      "Treat external facts as point-in-time and DUAL as the governed proof/state layer."
    ].join("\n"))
  );

  server.registerPrompt(
    "operate_capsule_transition",
    {
      title: "Operate Capsule Transition",
      description: "Guide an agent through evidence intake, dry-run, recovery, and operator-gated sync for one transition.",
      argsSchema: {
        scenario: z.string().optional(),
        transition: z.string().optional()
      }
    },
    ({ scenario, transition }) => textPrompt([
      `Operate transition ${transition || "next"} for ${scenario || "the supplied Proof Capsule"}.`,
      "Call verify_evidence_refs, replay_workflow_capsule, diagnose_capsule, and plan_transition_queue before any write.",
      "Only call sync_proof_capsule_live if an authorised operator explicitly supplies the token; never put tokens in read-only calls."
    ].join("\n"))
  );

  server.registerPrompt(
    "compare_capsule_versions",
    {
      title: "Compare Capsule Versions",
      description: "Guide an agent through comparing two Proof Capsule versions and explaining decision/hash changes.",
      argsSchema: {
        left: z.string().optional(),
        right: z.string().optional()
      }
    },
    ({ left, right }) => textPrompt([
      `Compare Proof Capsule versions ${left || "left"} and ${right || "right"}.`,
      "Use compare_capsules, then explain evidence changes, state transition changes, policy/decision changes, and which hashes changed.",
      "If a change requires live source recheck or operator-gated DUAL sync, call that out explicitly."
    ].join("\n"))
  );

  server.registerPrompt(
    "publish_proof_capsule_verifier_page",
    {
      title: "Publish Proof Capsule Verifier Page",
      description: "Guide an agent through generating and sharing a public proof page without weakening the write boundary.",
      argsSchema: {
        scenario: z.string().optional()
      }
    },
    ({ scenario }) => textPrompt([
      `Prepare a public verifier page for ${scenario || "the supplied Proof Capsule"}.`,
      "Call run_proof_capsule first, inspect proof_score, source checks, replay steps, and DUAL anchor links.",
      "Share the public verifier URL only if publicWrites=false and no raw evidence payloads or operator tokens are included.",
      "If the proof is not ready, return the recovery actions instead of claiming the page is verifier-ready."
    ].join("\n"))
  );

  server.registerPrompt(
    "supercharge_proof_capsule",
    {
      title: "Supercharge Proof Capsule",
      description: "Guide an agent through creating a multi-proof capsule, publishing a proof room, and preserving the DUAL write boundary.",
      argsSchema: {
        workflow: z.string().optional()
      }
    },
    ({ workflow }) => textPrompt([
      `Supercharge this workflow as a DUAL Proof Capsule: ${workflow || "the supplied process"}.`,
      "Use create_capsule or build_workflow_draft, attach_proof for each source ref, evaluate_gate, simulate_workflow, verify_capsule, get_proof_room, and publish_public_proof.",
      "Return what the capsule proves, what it does not prove, DUAL object/template/state links, source proof cards, agent-mode MCP calls, and operator-gated next steps.",
      "Do not call sync_proof_capsule_live or mint_proof_capsule_live unless an authorised operator explicitly supplies the token."
    ].join("\n"))
  );

  return server;
}

export function demoMarkdown() {
  return capsuleToMarkdown(composeProofCapsule({ scenario: "tradeflow_medical_devices" }));
}
