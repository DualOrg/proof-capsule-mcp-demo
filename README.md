# Proof Capsule MCP Demo

Proof Capsule is the use-case-agnostic DUAL primitive behind TradeFlow-style proof surfaces: a DUAL-anchored evidence envelope that binds claims, evidence references, policy checks, decisions, state, and external proof links into one verifiable object.

This sandbox exposes that primitive through a Streamable HTTP MCP endpoint and a small UI. In production it can read from a live DUAL object and execute operator-gated event-bus mint/sync writes.

The v0.7.1 model turns that surface into a SaaS package: universal multi-proof capsules, shareable proof rooms, scenario marketplace, agent-mode MCP aliases, workflow simulation, proof attachment, tenant onboarding, pricing/plan packaging, admin readiness, connector status, and the same operator-gated DUAL write boundary. Live writes remain operator-gated.

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

Run the public proof flow from the UI:

```text
Open http://127.0.0.1:4184
Click Run proof
Click Open public page
```

Run the benchmark-style reviewer path:

```text
Open http://127.0.0.1:4184
Click Reviewer mode
Click Run proof
Inspect the SaaS launch desk
Inspect the proof rail and reviewer support checklist
Open the public verifier
```

The public verifier route is also directly addressable:

```text
http://127.0.0.1:4184/proof/PC-UNIVERSAL-MULTI-PROOF-001?scenario=universal_proof_capsule&content_hash=...
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

The write path refuses public writes, uses constant-time operator-token comparison, applies a runtime-local invalid-token attempt cap, checks org balance before event-bus actions, writes only proof-envelope metadata/hashes/evidence refs, and re-reads DUAL before reporting success. The attempt cap is a best-effort process/serverless-instance guard; the primary shared control is the high-entropy operator token.

## MCP Surface

Tools:

- `get_capsule_status`
- `get_live_dual_status`
- `get_current_live_capsule`
- `create_capsule`
- `attach_proof`
- `evaluate_gate`
- `simulate_workflow`
- `verify_capsule`
- `publish_public_proof`
- `compose_proof_capsule`
- `verify_proof_capsule`
- `evaluate_capsule_policy`
- `red_team_capsule`
- `get_capsule_handoff`
- `run_proof_capsule`
- `get_public_verifier_page`
- `get_proof_room`
- `list_workflow_templates`
- `list_scenario_marketplace`
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
- `get_saas_readiness`
- `list_saas_plans`
- `create_tenant_onboarding_plan`
- `get_admin_control_plane`
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
- `capsule://scenario-marketplace`
- `capsule://source-verifiers`
- `capsule://verifier-marketplace`
- `capsule://proof-room`
- `capsule://agent-mode`
- `capsule://operator-runbook`
- `capsule://proof-runbook`
- `capsule://saas/readiness`
- `capsule://saas/plans`
- `capsule://saas/onboarding`
- `capsule://saas/admin`

Resource template:

- `capsule://demo/{scenario}`
- `capsule://workflow/{scenario}`
- `capsule://public-proof/{scenario}`
- `capsule://proof-room/{scenario}`
- Covered scenarios: `universal_proof_capsule`, `tradeflow_medical_devices`, `insurance_claim`, `agent_mandate_purchase`, `luxury_resale`, `carbon_credit`

Prompts:

- `proof_capsule_review`
- `mcp_client_handoff`
- `red_team_capsule_boundary`
- `design_proof_capsule_workflow`
- `operate_capsule_transition`
- `compare_capsule_versions`
- `publish_proof_capsule_verifier_page`
- `supercharge_proof_capsule`
- `launch_proof_capsule_saas_tenant`

## v0.7.1 SaaS Launch Desk

The public app now shows a SaaS control plane, not just a proof demo:

- **Commercial package:** Pilot room, Growth control plane, and Enterprise trust layer plans, with limits, selling motion, upgrade triggers, and customer-bound activation requirements.
- **Tenant onboarding:** generates a workspace id, plan, workflow seed, connector plan, launch steps, MCP first calls, write policy, and data boundary for a customer tenant.
- **Admin plane:** exposes launch readiness, proof operations, connector health, write governance, audit schema, support model, and incident runbook.
- **Connector readiness:** distinguishes live DUAL readback from demo/source-reference adapters that need tenant-specific production integration, both in the API payload and the visible UI badges.
- **Computed readiness:** `package_readiness_score` is derived from weighted package controls, with customer auth/billing kept as a visible tenant-activation holdback instead of a hardcoded score.
- **Pilot sales pack:** see [docs/proof-capsule-pilot-sales-pack.md](docs/proof-capsule-pilot-sales-pack.md) for buyer story, demo route, acceptance gates, and objection handling.

The honest SaaS boundary is explicit:

- Sellable now as a paid pilot or assisted B2B SaaS package.
- Public demo does not issue customer accounts, API keys, SSO sessions, invoices, or payment collection.
- Non-DUAL source systems remain structured refs until a tenant adapter or signed source feed is connected.
- DUAL writes remain server-side and operator-gated; public writes stay false.

REST endpoints:

- `GET|POST /api/saas/readiness`
- `GET /api/saas/plans`
- `GET|POST /api/saas/onboarding`
- `GET|POST /api/saas/admin`

## v0.6 Universal Proof Layer

The flagship scenario is `universal_proof_capsule`. It encapsulates:

- Solana point-in-time ownership proof;
- DUAL object/template/state/integrity proof;
- IPFS document hash proof;
- signed verifier attestation;
- non-executing payment preview;
- vault-held mandate boundary.

The proof room is the shareable evidence surface. It returns source proof cards, DUAL/block-explorer links, what the capsule proves, what it does not prove, downloadable bundle metadata, agent-mode calls, operator-console next actions, and the public-write boundary. It is available from:

- UI: run proof on the universal scenario;
- API: `GET /api/proof/room?scenario=universal_proof_capsule`;
- MCP: `get_proof_room`;
- resource: `capsule://proof-room/{scenario}`.

The scenario marketplace is the reusable template layer. It exposes templates for universal multi-proof, conditional trade, tokenised ownership, agent mandate, insurance claim, carbon credit, and invoice/payment release workflows. It is available from `GET /api/scenarios/marketplace`, MCP `list_scenario_marketplace`, and `capsule://scenario-marketplace`.

Agent mode uses short, generic verbs:

```text
create_capsule -> attach_proof -> evaluate_gate -> simulate_workflow -> verify_capsule -> publish_public_proof
```

`compare_capsules` and `red_team_capsule` remain the audit and adversarial checks. `sync_proof_capsule_live` and `mint_proof_capsule_live` are the only write tools and still require an authorised operator token.

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

## Public Proof Layer

`run_proof_capsule` is the one-click proof path. It composes or accepts a capsule, re-derives hashes, evaluates policy, verifies evidence refs, replays the workflow, builds the timeline, diagnoses recovery actions, dry-runs the transition queue, generates an agent handoff pack, scores readiness, and returns a public verifier page model.

`get_public_verifier_page` is the shareable read side. It returns the capsule summary, claims, evidence refs, source checks, policy decision, state transition, workflow replay, DUAL anchor, hash verification block, timeline, transition plan, recovery actions, and source links. The UI renders this at `/proof/:capsuleId`.

Public verifier links can be pinned with `content_hash` or `hash`. The page re-composes the capsule, checks the requested proof id and content hash against the derived capsule, and returns `link_integrity.status`:

- `link_verified`: proof id and content hash match the re-derived capsule.
- `link_unpinned`: the proof model verified, but the URL did not include both proof id and content hash.
- `link_mismatch`: the supplied proof id or content hash does not match; the response remains readable but `ok: false` and the page tells the reader not to rely on the link.

The `/proof/...` route is presentation-read-only: operator controls, JSON output, local mutation tools, and DUAL write buttons are hidden. The underlying write APIs and MCP write tools still require the server-side operator token.

The proof score is a 100-point operator-readiness score:

- 25 hash re-derivation
- 20 policy result
- 20 evidence refs
- 15 workflow replay
- 10 transition readiness
- 10 public-write boundary

`Approved with review` decisions can still score 98/100 when hashes, evidence, replay, transition planning, and public-write boundaries are clean. That is deliberate: the review requirement is visible instead of silently failing an otherwise publishable proof.

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
- `POST /api/proof/run`
- `GET /api/proof/public?scenario=...&proof_id=...&content_hash=...`
- `POST /api/proof/public`
- `GET /proof/:capsuleId?scenario=...`
- `GET /api/workflow/definition?scenario=...`
- `POST /api/workflow/build`
- `POST /api/workflow/replay`
- `POST /api/evidence/verify`
- `POST /api/transition/plan`
- `GET /api/source/verifiers`
- `GET /api/source/marketplace`
- `POST /api/agent/handoff`
- `GET|POST /api/saas/readiness`
- `GET /api/saas/plans`
- `GET|POST /api/saas/onboarding`
- `GET|POST /api/saas/admin`
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
