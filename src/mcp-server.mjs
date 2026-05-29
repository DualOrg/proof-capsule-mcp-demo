import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  CAPSULE_SCHEMA_VERSION,
  CAPSULE_TYPES,
  SCENARIOS,
  SERVICE_NAME,
  SERVICE_VERSION,
  WRITE_BOUNDARY,
  capsuleToMarkdown,
  composeProofCapsule,
  defaultPolicy,
  evaluateCapsulePolicy,
  getWorkflowDefinition,
  handoff,
  listSourceVerifiers,
  listWorkflowTemplates,
  redTeamCapsule,
  replayWorkflowCapsule,
  scorecard,
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
        scenario: scenarioSchema.optional()
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

  return server;
}

export function demoMarkdown() {
  return capsuleToMarkdown(composeProofCapsule({ scenario: "tradeflow_medical_devices" }));
}
