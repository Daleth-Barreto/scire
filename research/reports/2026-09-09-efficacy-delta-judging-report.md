# Report: Efficacy Delta of Deterministic Invariants vs. State-Grounded LLM Judges

**Date**: 2026-09-09
**Agent**: scire-orchestrator
**Cycle**: 2026-09-09-efficacy-delta-judging
**Status**: Synthesized from researcher brief + evaluator shock-check

---

## 1. Executive Summary

This research cycle addresses the H6 evaluator's core challenge: the "80% coverage" and "<2% marginal LLM value" thresholds from the H6 brief were invented without an empirical basis. The researcher gathered 13 verified sources from 2024-2026, and the evaluator confirmed the brief is a significant methodological improvement — with one required modification.

**Key findings (all sourced):**

1. **Judge blind spots are large and measurable.** Outcome-only LLM judges catch 84% of loud faults but only 45% of silent ones; step-rubric judges reach 77% silent recall with zero false alarms but at 3x cost [trajectory-judge, arXiv:2609.00038]. Deployed safety judges like GPT-4o only reach 74.42% risk awareness, with most models performing no better than random [R-Judge, arXiv:2401.10019].

2. **Grounding quality beats judge type.** The largest measured efficacy delta is between a metadata-aware policy gate (0/240 unsafe actions, ≤1.58% Wilson bound) and a Two-Pass LLM Judge (10% leak rate) [NetInjectBench, arXiv:2607.10490]. Static allowlisting achieves 0% leak but 100% overblock — the *quality* of the grounded policy determines usability.

3. **The efficacy delta is type-dependent, not a single number.** Observable-trace harms (forbidden tool calls, canary leaks, approval bypasses) are well-handled by deterministic invariants. Semantic-intent harms (encoded exfiltration, motivation analysis) are structurally invisible to invariants and require LLM judgment [trajectory-judge, arXiv:2609.00038; TrustHarness limitation].

4. **Judge precision is bounded and model-specific.** Content-invariant style wrappers flip 19.9% of GPT-4o-mini's correct "unsafe" verdicts and game Llama Guard 4 at 12.3% [Style Over Substance, arXiv:2609.08236]. The vulnerability lives in the judge, not the content.

---

## 2. Hypotheses and Evaluator Verdicts

| Hypothesis | Claim | Evaluator | Required Change |
|-----------|-------|-----------|-----------------|
| ED-1 | Deterministic gate ≥77% silent-fault recall, ≤5% false alarms, ≥99% inter-implementation agreement | **CHALLENGE** | Reframe: 77% is the LLM step-judge baseline, not the deterministic gate's measured performance. Silent-fault recall for deterministic gates must be measured independently. |
| ED-2 | Recall crossover is type-dependent; deterministic gates are ≥95% effective on (a)-observable harms; LLM judges are necessary for (b)-semantic harms | **SUPPORT** | Minor: the ≥95% threshold is the experimental target, not a literature-confirmed number. The 95% should be flagged as the target to measure. |
| ED-3 | Grounding quality > judge type; metadata-aware policy gate achieves ≥1.5x harm reduction with certified near-zero unsafe rate | **SUPPORT** | CAVA extension is MEDIUM confidence (canonicalization fidelity tested, but safety-gating performance not yet measured on canonical actions). |

---

## 3. The Four-Rung Model (from the literature)

The brief establishes a four-rung hierarchy of agentic safety evaluation, each with a measured error profile:

| Rung | Method | Strengths | Weaknesses | Error Profile |
|------|--------|-----------|------------|---------------|
| 1 | Outcome-only LLM judge | Simple, cheap | Misses 55% of silent faults; 33% false-alarm rate | trajectory-judge [^1] |
| 2 | Trajectory/step-rubric LLM judge | 77% silent recall, 0 false alarms | 3x cost; still evaded by fabricated promises (82%) | trajectory-judge [^1] |
| 3 | State-grounded LLM judge | Dramatically outperforms trajectory judges; ~human baseline | Costly; model-dependent precision; judge flip rates 12-20% | Agent-as-a-Judge [^10]; Style Over Substance [^8] |
| 4 | Deterministic invariant checking | Near-zero latency; reproducible; composable; CI-suitable | Structurally blind to semantic intent; invariant library must be maintained | TrustBench [^4]; AgentLTL [^3]; NetInjectBench [^2]; CAVA [^5] |

The key insight: **rungs 3 and 4 are complementary, not competing.** Rung 4 handles what it can verify precisely (tool misuse, canary leak, approval bypass, argument tampering); rung 3 handles the residual semantic gap. The efficacy delta is *where the boundary sits*, not which rung wins overall.

---

## 4. Implications for SCIRE

1. **Replace invented thresholds with measurable targets.** ED-1's modified version gives the experimenter a concrete experiment: build a synthetic MCP harness with fault-injected traces, run both deterministic invariants and an LLM step-judge, measure recall on (a)- and (b)-type harms independently.

2. **Deterministic-first is empirically justified for observe-over-trace harms** (ED-2), aligning with SCIRE's Free-First / no-paid-LLM-judge policy. The three most expensive categories (canary leak, approval bypass, argument tampering) are all (a)-type and are verifiable with zero LLM cost.

3. **The LLM judge's defensible role is narrow and well-defined**: class-(b) semantic harms and non-groundable policy. SCIRE should invoke a judge *only* for the residual after deterministic checks, per the layered architecture.

4. **Grounding engineering is the highest-leverage investment** (ED-3). The gap between "naive execution" (82.5% unsafe) and "metadata-aware policy gate" (0/240) is the gap between a prompt warning and a grounded policy — the same gap that CAVA's canonical action objects aim to close across heterogeneous runtimes.

---

## 5. Gap Analysis — What SCIRE Must Measure Next

| Gap | Priority | Why | Recommended Experiment |
|-----|----------|-----|----------------------|
| Deterministic-gate silent-fault recall on synthetic MCP | HIGH | ED-1's core metric; directly addresses H6 evaluator challenge | Fault-injected MCP harness + invariant checker + comparison vs. LLM step-judge |
| Judge cost vs. value on class-(b) semantic harms | MEDIUM | Determines whether the residual LLM judge is worth its cost | Same harness, measure (b)-type subset separately |
| Cross-implementation reproducibility of invariant checks | MEDIUM | ED-1's 99% agreement requirement; CAVA formalizes but doesn't measure | Two independent invariant implementations on the same corpus |
| Synthetic → production ecological validity | LOW (long-term) | H6-4 was REJECTED; remains the weakest link | Requires access to a production MCP deployment |

---

## 6. Confidence

**HIGH** (direct empirical measurements from verified sources):
- Silent/loud recall split for outcome vs step LLM judges (trajectory-judge, 400 trajectories) [^1]
- Policy-gate vs LLM head-to-head: 0/240 ≤1.58% vs 10%+ (NetInjectBench, 240 attacks) [^2]
- Judge flip rates are model-specific; content-invariant wrappers expose them (Style Over Substance, human-validated) [^8]
- Domain-grounded real-time gating: 87% harm reduction, <200ms (TrustBench) [^4]

**MEDIUM** (directionally supported, not yet measured on SCIRE's MCP distribution):
- ED-1: that a deterministic gate inherits the support-desk results (different environments) [^1][^2][^13]
- ED-2: the (b)-semantic advantage magnitude on a shared corpus
- ED-3: extending NetInjectBench's certified bound to canonical-action substrates [^5]

**LOW** (honest disclosure):
- Any universal coverage percentage — the evidence is strongly type-dependent
- Synthetic → production transfer (no empirical basis yet)

---

## 7. Sources

[^1]: trajectory-judge: What Outcome-Only LLM Judges Miss on Agent Trajectories. arXiv:2609.00038 (2026-08-29). https://arxiv.org/abs/2609.00038
[^2]: NetInjectBench: Benchmarking Indirect Prompt Injection in Tool-Using LLM Agents for Network Operations. arXiv:2607.10490 (2026-07-11). https://arxiv.org/abs/2607.10490
[^3]: AgentLTL: A Trace-Verification Framework for Measuring, Enforcing, and Training Procedural Compliance. arXiv:2607.02599 (2026-07-01). https://arxiv.org/abs/2607.02599
[^4]: TrustBench: Real-Time Trust Verification for Safe Agentic Actions. arXiv:2603.09157 (2026-03-10). https://arxiv.org/abs/2603.09157
[^5]: CAVA: Canonical Action Verification and Attestation for Runtime Governance. arXiv:2607.13716 (2026-07-15). https://arxiv.org/abs/2607.13716
[^6]: Public-Sharing Labels and Verbatim Field Egress. arXiv:2609.01693 (2026-09-01). https://arxiv.org/abs/2609.01693
[^7]: R-Judge: Benchmarking Safety Risk Awareness for LLM Agents. arXiv:2401.10019 (2024-01-18). https://arxiv.org/abs/2401.10019
[^8]: Style Over Substance: Content-Invariant Wrappers Flip LLM Safety-Judge Verdicts. arXiv:2609.08236 (2026-09-08). https://arxiv.org/abs/2609.08236
[^9]: AgentBench: Evaluating LLMs as Agents. arXiv:2308.03688 (2023). https://arxiv.org/abs/2308.03688
[^10]: Agent-as-a-Judge: Evaluate Agents with Agents. arXiv:2410.10934 (2024-10-14). https://arxiv.org/abs/2410.10934
[^11]: ToolFailBench: Diagnosing Tool-Use Failures in LLM Agents. arXiv:2607.04686 (2026-07-06). https://arxiv.org/abs/2607.04686
[^12]: An Evaluation of Data Leakage Risks in Tool-Using LLM Agents. arXiv:2606.17114 (2026-06-15). https://arxiv.org/abs/2606.16714
[^13]: TrustHarness — Deterministic security testing for tool-using AI agents. https://github.com/ofirtro/trustharness
