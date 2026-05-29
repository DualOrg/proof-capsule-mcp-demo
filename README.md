# Proof Capsule MCP Demo

Proof Capsule is the use-case-agnostic DUAL primitive behind TradeFlow-style proof surfaces: a DUAL-anchored evidence envelope that binds claims, evidence references, policy checks, decisions, state, and external proof links into one verifiable object.

This sandbox exposes that primitive through a Streamable HTTP MCP endpoint and a small UI. In production it can read from a live DUAL object and execute operator-gated event-bus mint/sync writes.

The v0.4 model adds the operator workflow layer on top of replay: workflow builder, evidence intake checks, transition dry-runs, recovery actions, lifecycle timeline, verifier modules, capsule compare, and agent handoff packs. Live writes remain operator-gated.

## Scope

- Local demo path: `sandbox/proof-capsule-mcp-demo`
- UI: `http://127.0.0.1:4184`
- MCP endpoint: `http://127.0.0.1:4184/mcp`
- Boundary: public read/generate/verify; operator-gated DUAL mint/sync
- Live DUAL writes: enabled when DUAL env vars and `DUAL_WRITE_MODE=event_bus` are configured
- Wallet actions: disabled
- Operator tokens: accepted only by server-side write endpoints/tools
- Raw evidence storage: not performed

## Run

```bash
npm install
npm run check
PORT=4184 npm start
```

Then in another terminal:

```bash
npm run smoke:mcp
npm run proof:rederive
```

## Live DUAL Setup

Required server-side environment:

```bash
DUAL_API_URL=https://api-testnet.dual.network
DUAL_API_KEY=...
DUAL_ORG_ID=69b935b4187e903f826bbe71
DUAL_WRITE_MODE=event_bus
DUAL_PROOF_CAPSULE_TEMPLATE_ID=...
DUAL_PROOF_CAPSULE_OBJECT_ID=...
DEMO_OPERATOR_TOKEN=... # minimum 32 random characters
DEMO_OPERATOR_ATTEMPT_LIMIT=12
DEMO_OPERATOR_ATTEMPT_WINDOW_MS=300000
```

Create or discover the DUAL template/object:

```bash
npm run setup:dual-live
```

Then verify readback:

```bash
npm run proof:dual
```

Run one controlled operator-gated write:

```bash
npm run proof:dual:write
```

The write path refuses public writes, uses constant-time operator-token comparison, applies a small invalid-token attempt cap, checks org balance before event-bus actions, writes only proof-envelope metadata/hashes/evidence refs, and re-reads DUAL before reporting success.

## MCP Surface

Tools:

- `get_capsule_status`
- `get_live_dual_status`
- `get_current_live_capsule`
- `compose_proof_capsule`
- `verify_proof_capsule`
- `evaluate_capsule_policy`
- `red_team_capsule`
- `get_capsule_handoff`
- `list_workflow_templates`
- `get_workflow_definition`
- `replay_workflow_capsule`
- `list_source_verifiers`
- `list_verifier_marketplace`
- `verify_evidence_refs`
- `build_workflow_draft`
- `plan_transition_queue`
- `diagnose_capsule`
- `get_proof_timeline`
- `compare_capsules`
- `generate_agent_handoff_pack`
- `sync_proof_capsule_live`
- `mint_proof_capsule_live`

Resources:

- `capsule://manifest`
- `capsule://schema`
- `capsule://policy/default`
- `capsule://demo/tradeflow-medical-devices`
- `capsule://scorecard`
- `capsule://dual/status`
- `capsule://dual/current`
- `capsule://workflows`
- `capsule://source-verifiers`
- `capsule://verifier-marketplace`
- `capsule://operator-runbook`

Resource template:

- `capsule://demo/{scenario}`
- `capsule://workflow/{scenario}`
- Covered scenarios: `tradeflow_medical_devices`, `insurance_claim`, `agent_mandate_purchase`, `luxury_resale`, `carbon_credit`

Prompts:

- `proof_capsule_review`
- `mcp_client_handoff`
- `red_team_capsule_boundary`
- `design_proof_capsule_workflow`
- `operate_capsule_transition`
- `compare_capsule_versions`

## Workflow Model

The reusable DUAL architecture is:

```text
DUAL template -> DUAL object -> event-bus transition -> policy gate -> readback -> hash replay
```

The MCP can model any workflow that can be represented as:

```text
subject + claims + evidence refs + source verifiers + policy gate + decision + state transition
```

Each scenario now exposes a workflow definition with:

- allowed states and transitions;
- required evidence types per transition;
- point-in-time freshness/recheck rules;
- source verifier contracts for Solana, DUAL, IPFS, telemetry, customs, insurance, escrow, registries, vaults, and attestations;
- DUAL build contract: one object per workflow instance, event-bus writes, operator gate, public writes off, readback after write.

`replay_workflow_capsule` proves the capsule is not just a hash bundle. It checks that the declared state transition is allowed by the workflow, required evidence exists, all evidence sources have verifier contracts, policy did not block the transition, hashes re-derive, and the write boundary remains operator-gated.

## Operator Workflow Layer

The app is now usable as a small operating console, not only a verifier:

- **Workflow builder:** creates a draft workflow definition and draft capsule from states, evidence types, sources, and value.
- **Evidence intake:** accepts source refs, derives hashes when a caller does not provide one, checks required evidence categories, and labels refs as verified, stale, missing, or not sufficient.
- **Transition queue:** dry-runs the next state transition and returns the exact operator-gated sync payload without executing it.
- **Recovery:** diagnoses missing evidence, unsupported sources, policy blocks, stale refs, and workflow-state mismatches with concrete recovery actions.
- **Proof timeline:** renders the lifecycle state trail with state, evidence, decision, hash, and DUAL link context.
- **Verifier marketplace:** exposes source verifier modules for Solana, DUAL, IPFS, telemetry, customs, insurance, escrow, policy/admin systems, enterprise vaults, signed tool logs, registries, luxury/custody sources, and carbon registries.
- **Capsule compare:** compares two capsule versions and shows evidence, state, decision, policy, and hash changes.
- **Agent handoff:** packages MCP calls, resources, next allowed actions, replay status, timeline hash, and write-boundary caveats for another agent.

All of these are public read/dry-run operations. The only state-changing paths remain `sync_proof_capsule_live`, `mint_proof_capsule_live`, `POST /api/capsules/sync`, and `POST /api/capsules/mint`, and those still require the operator token.

## Proof Semantics

The demo uses:

```text
sha256(JSON.stringify(stableSort(value)))
```

Stable content hashes exclude `generated_at`. Envelope hashes include `generated_at` and represent a fresh attestation.

The default TradeFlow capsule includes:

- Solana ownership proof reference
- IPFS bill of lading hash
- signed telemetry reference
- customs/compliance attestation
- insurance attestation
- settlement mirror proof
- buyer mandate proof
- DUAL object/template/state/integrity explorer links from the existing TradeFlow demo anchor

The static compose/verify path still works without credentials. The live path stores the Proof Capsule as a DUAL object and returns object/template explorer links plus readback verification.

The non-TradeFlow capsules use demo DUAL references and distinct source systems so the MCP surface proves that Proof Capsule is not a TradeFlow-only wrapper:

- insurance claim evidence: policy admin, enterprise vault, signed tool logs, DUAL-style report and mandate references;
- agent mandate purchase: agent identity, budget, counterparty, approval, and payment-preview proofs;
- luxury resale ownership: Solana ownership, brand authentication, appraisal, vault custody, escrow, and buyer mandate proofs;
- carbon credit offset: registry issuance, MRV, verifier attestation, Solana holder proof, retirement preview, and offset mandate proofs.

The UI shows three provenance bands:

- supplied by caller: subject, claims, and evidence references;
- anchored externally: Solana, IPFS, vault, telemetry, policy, payment-preview, and DUAL references;
- re-derived locally: policy, decision, and capsule hashes.

## Production Deployment

The app is Vercel-ready. Public endpoints:

- `GET /api/status`
- `GET /api/dual/status`
- `GET /api/capsule/current`
- `GET /api/capsule/demo?scenario=...`
- `POST /api/capsule/verify`
- `POST /api/capsule/evaluate`
- `POST /api/capsule/red-team`
- `POST /api/capsule/diagnose`
- `POST /api/capsule/timeline`
- `POST /api/capsule/compare`
- `GET /api/workflow/definition?scenario=...`
- `POST /api/workflow/build`
- `POST /api/workflow/replay`
- `POST /api/evidence/verify`
- `POST /api/transition/plan`
- `GET /api/source/verifiers`
- `GET /api/source/marketplace`
- `POST /api/agent/handoff`
- `GET|POST /mcp`

Operator-gated endpoints:

- `POST /api/capsules/sync`
- `POST /api/capsules/mint`

Production smoke:

```bash
npm run smoke:prod -- https://your-deployment.example
```

## Safety

Public calls do not write to DUAL. Live writes are available only through the operator-gated API/MCP tools and require server-side credentials plus a high-entropy `DEMO_OPERATOR_TOKEN`. The token is never echoed in responses, and weak tokens shorter than 32 characters keep live writes disabled.

The `/mcp` endpoint enables permissive CORS for demo MCP clients. For a hardened production service, replace that with an explicit allow-list.
