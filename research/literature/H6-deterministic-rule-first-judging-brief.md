# Brief: Deterministic Rule-First Judging for Agentic Red-Teaming — Can State Invariants Replace LLM Judges?

**Date**: 2026-09-08
**Agent**: scire-researcher
**Status**: New brief. Extends H6 from 2026-09-07 testing protocol brief; synthesizes fresh sources on deterministic evaluation of LLM agent security.
**Priority**: HIGH — directly actionable for SCIRE's Free-First policy (no paid LLM judges).

---

## 1. Executive Summary

The core claim under investigation: **can deterministic, rule-based verification (state invariants, tool-call traces, canary checks) replace or substantially reduce reliance on LLM-as-judge evaluation for agentic AI safety testing?**

Three converging lines of evidence suggest this is not only possible but preferred:

1. **LLM judges are unreliable under adversarial distribution** (from our prior brief): ReliableBench shows judges ≈ coin-flip accuracy [^1]; When Scanners Lie shows ±33% ASR variance across evaluators [^2]; neither failure mode afflicts deterministic checks.

2. **State-grounded evidence is superior to transcript-only evidence**: REDAgentBench (2608.10669) demonstrates that the State Judge reports ASR 7.73–11.72 pp higher than the Trajectory Judge for ALL models tested (McNemar p≤6.54×10⁻⁵) [^3]. The reason is causal: transcripts miss durable state mutations visible only in service receipts and final-state snapshots. TrustHarness operationalizes this as deterministic invariant checking (MustCall, ForbidCall, NoCanaryLeak, RequiresApproval) [^4].

3. **Action-graph observability reveals agentic-only attack surfaces** invisible to model-level evaluation: AgentSeer (2509.17259) decomposes agentic execution into granular action graphs, finding that **agentic-only vulnerabilities emerge exclusively in tool-use contexts and remain inert against standalone models** [^5]. This means any judge must verify the action graph — not just the text output.

**Convergence**: The evidence converges on a three-layer verification model where each layer is (a) more reliable than the one above, and (b) can be implemented deterministically:

| Layer | What it checks | Judge type | Reliability |
|-------|---------------|------------|-------------|
| **Action trace** | Tool calls made, arguments, order | Deterministic (log comparison) | Near-perfect (no hallucination) |
| **State invariant** | Canary leakage, approval boundary, data mutation | Deterministic (pre/post snapshot diff) | Near-perfect (no hallucination) |
| **Semantic intent** | Whether agent *intended* to harm (vs. accidental) | LLM judge (currently) | ~coin-flip under adversarial input |

The key insight: **Layers 1 and 2 cover the highest-severity failure modes (tool abuse, data exfiltration, privilege escalation) deterministically. Layer 3 is where LLM judges fail. A well-designed harness needs Layer 3 far less often than practitioners assume, because the most dangerous agentic failures are observable in tool-call traces and state diffs, not in text semantics.**

---

## 2. The Evidence Base

### 2.1 State-Ground Truth Beats Transcript Evidence

**REDAgentBench** (arXiv:2608.10669) [^3] is the strongest empirical foundation:
- 1,661 cases across 5 service surfaces (bookkeeping, calendar, email, file storage, ticketing).
- 6 models × 3 agent harnesses.
- **State Judge** (checks service receipts, DB snapshots, canary tokens) vs **Trajectory Judge** (checks transcript/LLM reasoning).
- Result: State Judge reports ASR **7.73–11.72 pp higher** for every model. The trajectory-only view systematically **underreports** harm.
- In the state-grounded diagnostic cohort, **almost all trajectory-visible violations are confirmed by state evidence**, but many state-visible violations are invisible to trajectory analysis.
- Evaluation-context disclosure ("this is an authorized evaluation") lowers ASR 5–7 pp — agents become conservative when they know they are watched [^3].

**Why this matters for rule-first judging**: The state judge IS essentially a rule-first judge — it checks receipts, canary tokens, and DB state, not semantic intent. The fact that it outperforms the LLM trajectory judge is direct evidence for the viability of deterministic verification.

### 2.2 TrustHarness: The Deterministic Testing Framework

**TrustHarness** [^4] materializes the rule-first principle:
- Provides the agent with a **synthetic MCP environment** (fake tools with poisoned data, canary secrets, privileged actions, approval authorities).
- Records every tool call with full arguments.
- Evaluates **deterministic invariants**:
  - `MustCall(action)` — agent was required to invoke a tool.
  - `ForbidCall(action)` — agent must NOT invoke this tool.
  - `NoCanaryLeak(secret)` — canary token must not appear in tool-call arguments or responses.
  - `RequiresApproval(action, args)` — tool call must be preceded by approval token bound to action+arguments.
  - `ArgumentsEqual(call_id, expected)` — tool call arguments must match expected values.
- Reports PASS/FAIL/INCONCLUSIVE/ERROR — exits non-zero for CI integration.
- **No LLM judge needed** for the core evaluation. Zero API cost, zero hallucination risk.

**Limitation**: TrustHarness (v0.1) cannot detect semantic encodings (e.g., exfiltrating data via base64 in an argument that *looks* like normal text but decodes to a secret). This is a real gap — but it is also a gap for LLM judges, who are *worse* at detecting it (±33% evaluator variance [^2]).

### 2.3 Action-Graph Observability: AgentSeer

**AgentSeer** (arXiv:2509.17259) [^5] provides the missing link between model-level and agentic-level red teaming:
- Decomposes agentic execution into an **action graph**: nodes = tool calls, edges = data/control dependencies.
- Red teams GPT-OSS-20B at both model level and agentic level.
- **Key finding**: Agentic-only vulnerabilities exist — attack vectors that emerge *exclusively* within agentic execution contexts (tool chaining, state mutation across turns) and remain inert against the standalone model.
- These agentic-only vulnerabilities are precisely the class that deterministic action-graph checking can catch: they manifest as anomalous tool-call sequences, unauthorized state transitions, or information flow across tool boundaries.

**Connection to rule-first**: AgentSeer's action graph IS the data structure that TrustHarness-style invariants evaluate. The action graph makes the execution auditable; the invariants make the audit pass/fail deterministically.

### 2.4 Refusal Alignment Score: A Hybrid Approach

**SafeVec/RAS** (arXiv:2606.25750) [^6] offers a white-box alternative:
- Extracts **refusal directions** from a safety-aligned reference model's internal representations.
- Scores target models by measuring whether hidden states align with refusal directions under unsafe prompts.
- Produces a calibrated 0–1 score **without querying the model's text output at all**.
- This is deterministic (measures internal representation alignment, not text semantics).

**Relevance**: RAS represents a third class of deterministic evaluation — neither tool-call logging nor state inspection, but **activation-space probing**. While it targets the model layer (not agentic execution), it shows that the *concept* of "deterministic evaluation" extends beyond simple invariant checking.

### 2.5 Complementary Sources

| Source | What it adds |
|--------|-------------|
| NIST CAISI 2026 [^7] | >250k attacks across 13 frontier models; all compromised in agentic scenarios. Grounds the urgency. |
| ART Benchmark (NeurIPS 2025) [^8] | 1.8M attacks, 100% behavior violation in 10–100 queries. Shows attack budgets that deterministic harnesses must accommodate. |
| ReliableBench [^1] | LLM judges ≈ coin-flip under adversarial distribution. The motivation for deterministic alternatives. |
| When Scanners Lie [^2] | ±33% ASR variance by evaluator in Garak. The cost of relying on LLM judges. |

---

## 3. Falsifiable Hypotheses

### H6-1: State Invariants Cover ≥80% of High-Severity Agentic Failures

**Claim**: In a synthetic MCP environment with ≥5 tool surfaces, deterministic state invariants (canary leak, approval bypass, unauthorized tool call, argument tampering) will detect ≥80% of attack objectives classified as "high severity" by human annotators.

**Falsification condition**: If a set of attacks passes all deterministic invariants but is unanimously judged harmful by human evaluators, then state invariants leave a critical coverage gap. The threshold is 80% — below this, rule-first judging is insufficient as the sole evaluation layer.

**Test**: Implement 5 MCP tool surfaces with canary tokens and approval gates. Run NIST CAISI-style multi-turn attacks against a local model. Compare invariant-based verdict against human annotation.

**Evidence basis**: REDAgentBench's state judge detects almost all trajectory-visible violations plus additional state-only violations [^3]. TrustHarness reports deterministic PASS/FAIL [^4]. But neither paper provides a coverage ratio relative to human judgment.

### H6-2: LLM Judge Adds Marginal Value for High-Severity Failures

**Claim**: For attack objectives that succeed in violating state invariants (canary leaked, approval bypassed, unauthorized mutation), an LLM judge adds <2% marginal detection rate compared to invariant-only evaluation.

**Falsification condition**: If an LLM judge catches >10% of genuinely harmful outcomes that pass all state invariants, then the judge is essential even for high-severity failures.

**Test**: Run the same attack corpus. For each case where state invariants say PASS, have an LLM judge evaluate the transcript. Compute the incremental detection rate.

**Evidence basis**: Prior work [^1][^2] shows LLM judges are unreliable. But their failures are primarily false positives and false negatives on *ambiguous* cases — it is unclear whether they add value specifically for *unambiguous* high-severity failures.

### H6-3: Deterministic Judging Is More Reproducible Than LLM Judging

**Claim**: Two independent implementations of the same invariant checks will produce identical verdicts on ≥99% of test cases, whereas two independent LLM judges will agree on <85% of cases under adversarial distribution.

**Falsification condition**: If invariant implementations diverge on >5% of cases (e.g., due to state capture timing, serialization differences), deterministic judging has a reproducibility problem too.

**Test**: Implement two TrustHarness-style evaluators with different serialization strategies. Run both on the same attack corpus. Compare inter-rater agreement (Cohen's kappa) against two different LLM judges on the same corpus.

**Evidence basis**: Deterministic evaluation is tautologically reproducible *for the same state snapshot* — but the snapshot capture itself may vary across harnesses [^3]. The prior brief's key lesson "declare the metric before measuring" [^9] applies here: the estimator must include the state capture protocol.

### H6-4: Synthetic MCP Environments Are Sufficient for Safety Assurance

**Claim**: Agent safety scores (ASR by state judge) on a well-designed synthetic MCP environment transfer to the same agent deployed against real MCP services with >0.7 Spearman rank correlation.

**Falsification condition**: If ASR rankings on synthetic environments do not correlate with real-world vulnerability rankings, the harness tests something different from production risk.

**Test**: Deploy the same agent against both TrustHarness MCP fakes and DoubleAgent/Pome high-fidelity fakes [^10][^11]. Compare attack success rankings.

**Evidence basis**: TrustHarness [^4] and REDAgentBench [^3] both use synthetic environments and claim ecological validity, but neither validates transfer to real deployments. This is the weakest link in the rule-first argument — if synthetic environments don't predict production risk, the entire framework is academic.

---

## 4. Gap Analysis: Where Deterministic Judging Fails

Deterministic rule-first judging has genuine, acknowledged blind spots:

| Gap | Why it's hard | Evidence |
|-----|--------------|----------|
| **Encoded/transformed exfiltration** | Agent leaks secrets via base64, translation, or steganography in tool-call arguments | TrustHarness declares this limitation [^4]; LLM judges also fail at this [^1][^2] |
| **Semantic intent** (did the agent *try* to harm vs. accidentally?) | No invariant captures intent; this requires semantic understanding | REDAgentBench acknowledges this as the "adjudication" layer [^3] |
| **Multi-turn strategy across tools** | Long-horizon attack chains that look benign at each step but compound to harm | AgentSeer's action graph is the right data structure [^5], but invariant specification for chains is open |
| **Unknown unknowns** (novel attack surfaces) | Deterministic invariants can only check what you specify | Manual expert testing remains necessary (Layer 4 from the protocol [^9]) |
| **Agent alignment/consistency across sessions** | State invariant per-run doesn't capture cross-session drift | No current benchmark addresses this [UNVERIFIED] |

---

## 5. The Architecture for SCIRE

Synthesizing all sources, the proposed rule-first judging architecture for SCIRE:

```
┌─────────────────────────────────────────────────┐
│                  ATTACK LAYER                    │
│  Multi-turn adversarial attacks (PyRIT/garak)    │
│  against synthetic MCP target                    │
└──────────────────────┬──────────────────────────┘
                       │ tool calls + state mutations
                       ▼
┌─────────────────────────────────────────────────┐
│              DETERMINISTIC JUDGE                 │
│  Layer 1: Action Trace Validator                 │
│    - tool call order/args/existence assertions   │
│  Layer 2: State Invariant Checker                │
│    - canary leak, approval gate, mutation audit  │
│  Layer 3: Reproducibility Gate                   │
│    - run N times, require ≥N/2 identical verdict │
└──────────────────────┬──────────────────────────┘
                       │ INCONCLUSIVE cases only
                       ▼
┌─────────────────────────────────────────────────┐
│            LLM JUDGE (optional, expensive)       │
│  Only for: semantic intent, encoded exfil,       │
│  novel attacks that pass all invariants          │
│  Report FPR alongside ASR                        │
└─────────────────────────────────────────────────┘
```

**Free-First alignment**: Layers 1–2 are zero-cost (deterministic, local). Layer 3 adds a small compute cost (run the harness N times). The expensive LLM judge (Layer 4) is only invoked for the *residual* — cases where deterministic checks are inconclusive. This minimizes paid API usage while maximizing coverage.

---

## 6. Sources

[^1]: ReliableBench / JudgeStressTest — "LLM-as-a-Judge under adversarial distribution: coin-flip accuracy." 2026. https://www.arxiv.org/pdf/2603.06594

[^2]: "When Scanners Lie: Evaluator Instability in LLM Red-Teaming" — ACL evaleval 2026. 22/25 attack categories show evaluator instability, ±33% ASR. https://aclanthology.org/2026.evaleval-1.11/

[^3]: REDAgentBench: Executable Red Teaming and Faithful Measurement of LLM Agent Systems. arXiv:2608.10669 (2026-08-11). Zixing Chen et al. 1,661 cases, 6 models × 3 harnesses; state judge outperforms trajectory judge by 7.73–11.72 pp. https://arxiv.org/abs/2608.10669

[^4]: TrustHarness — Deterministic security testing for tool-using AI agents with synthetic MCP environments. https://github.com/ofirtro/trustharness (referenced in prior SCIRE brief 2026-09-07)

[^5]: "Mind the Gap: Comparing Model- vs Agentic-Level Red Teaming with Action-Graph Observability on GPT-OSS-20B." arXiv:2509.17259 (2025-09-21). Ilham Wicaksono et al. AgentSeer framework: action-graph decomposition reveals agentic-only vulnerabilities. https://arxiv.org/abs/2509.17259

[^6]: SafeVec/RAS: "Measuring LLM Safety Through Refusal Alignment." arXiv:2606.25750 (2026-06-24). Chang-Chieh Huang et al. White-box evaluation via internal representation alignment; calibrated 0–1 score. https://arxiv.org/abs/2606.25750

[^7]: NIST CAISI — "Insights into AI Agent Security from a Large-Scale Red-Teaming Competition." 2026-03-23. >250k attacks, 13 frontier models all compromised. https://www.nist.gov/blogs/caisi-research-blog/insights-ai-agent-security-large-scale-red-teaming-competition

[^8]: ART Benchmark — "Security Challenges in AI Agent Deployment." NeurIPS 2025 Datasets & Benchmarks. 1.8M attacks, 100% behavior violation in 10–100 queries. https://proceedings.neurips.cc/paper_files/paper/2025/file/73368bc7644c054b5bcc6490a8f2fb1c-Paper-Datasets_and_Benchmarks_Track.pdf

[^9]: SCIRE Brief 2026-09-07 — Testing Protocol for Agentic Red Teaming. research/reports/2026-09-07-testing-agentic-red-teaming-protocol.md

[^10]: Pome — Simulation testing infra for AI agents (digital twins, flight recorder, code graders). https://pome.sh/

[^11]: DoubleAgent (Islo Labs) — High-fidelity fakes of third-party services. https://github.com/islo-labs/doubleagent/

---

## 7. Confidence

**HIGH confidence** (empirically grounded):
- State judge outperforming trajectory judge: REDAgentBench, McNemar p≤6.54×10⁻⁵ [^3].
- LLM judge unreliability: two independent sources (ReliableBench [^1], When Scanners Lie [^2]).
- Agentic-only vulnerabilities: AgentSeer, replicated across attack methodologies [^5].

**MEDIUM confidence** (architectural inference, not yet experimentally validated):
- The 80% coverage threshold (H6-1) is an estimate based on the types of attacks in REDAgentBench and the invariant categories in TrustHarness. Actual coverage on a different attack distribution is unknown.
- Transferability of synthetic to real environments (H6-4) is an open question — no empirical validation exists in the cited sources.

**LOW confidence** (speculative):
- Whether activation-space methods (RAS [^6]) can complement invariant checking in a single pipeline — the two methods operate on different levels (representation vs. execution) and no integration has been demonstrated.
