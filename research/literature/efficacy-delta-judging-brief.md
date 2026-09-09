# Brief: Efficacy Delta of Deterministic Invariants vs. State-Grounded LLM Judges in Agentic Safety

**Date**: 2026-09-09
**Agent**: scire-researcher
**Status**: New brief. Follows the H6 deterministic-rule-first brief (2026-09-08); addresses the gap the evaluator flagged: the **80% / <2% / 0.7 thresholds were invented without an empirical basis** [^audit]. This brief gathers the literature that can actually ground a coverage threshold, and converts it into measurable, falsifiable hypotheses about the *delta* between deterministic invariant checking and state-grounded LLM judging.
**Priority**: HIGH — directly answers the H6 CHALLENGE and the audit's "distinguish state-grounded from deterministic judging" lesson.

---

## 1. Executive Summary

Previous H6 work claimed determinism is preferable to LLM judging, but its quantitative thresholds (≥80% coverage, <2% marginal judge value, >0.7 transfer) were `[UNVERIFIED]` estimates that the evaluator correctly REJECTED for lack of a basis [^audit]. This brief compiles the empirical evidence that actually exists for the **efficacy delta** — how much better (or worse) deterministic invariant checks are than both transcript-only and state-grounded LLM judges at *detecting* and *verifying* agentic safety failures.

**Three findings anchor the delta:**

1. **Judge blind spots are measurable and large.** The trajectory-judge study constructs ground truth by fault injection and measures exactly what judges miss: an outcome-only LLM judge catches 84% of "loud" faults but only **45% of "silent" ones** (where the customer-visible outcome survives), and flags **33% of correct trajectories** as faulty [^1]. NetInjectBench reports a Two-Pass LLM Judge still lets **10.00%** of unsafe tool-actions through vs. **0/240** (≤1.58% Wilson upper bound) for a metadata-aware policy gate [^2]. These are the *fuel* for a coverage-floor estimate.

2. **Deterministic, judge-free evaluation is now a mature category with reported performance and cost.** AgentLTL produces a deterministic, judge-free compliance score that improves blocked-wrong-tool via block-and-warn harness on 5/7 models and gains **+38pp accuracy / +17.5pp compliance** under finetuning [^3]. TrustBench, a real-time pre-execution trust gate, reduced harmful actions **by 87%**, with domain-specific plugins adding **35% more harm reduction** than generic checks at **<200ms latency** [^4]. CAVA formalizes canonical action verification and reports a 96-seed / 384-variant benchmark over semantic equivalence, wrapper bypass, false-positive control, and approval binding [^5]. A deterministic trace-scoring study (no LLM judge) isolates label-driven data egress cleanly with byte-identical controls across 480 trials [^6].

3. **State-grounded ≠ deterministic — and both are distinct from outcome-only judging.** The audit's critical lesson is that "state-grounded evaluation" (an LLM judge handed state artifacts) is *not* the same as "deterministic invariant checking" [^audit]. The literature now lets us separate all four rungs — outcome-only, trajectory, state-grounded LLM judge, deterministic invariants — and assign each a measured error profile [^1][^2][^3][^7].

**The core message**: the efficacy delta is **not** "determinism always wins." It is *type-dependent*. Deterministic invariants are near-exact at detecting *what happens* (tool misuse, canary leak, approval bypass, unauthorized state mutation) and are cheap, reproducible, and composable [^3][^4][^5]. They are structurally blind to *purely semantic* intent and to gates whose policy cannot be stated over the observable trace [^1][^8]. The open scientific question — which this brief converts into hypotheses — is **where the recall/precision crossover sits on a given attack distribution**, and whether a defensible coverage threshold can be certified rather than assumed.

---

## 2. The Evidence Base

### 2.1 trajectory-judge: the ground-truth measurement of the blind spot (arXiv:2609.00038)

The single most relevant study for H6. It builds a **deterministic tool-using support-desk environment** with a scripted oracle policy that always succeeds, then a **fault injector** that breaks exactly one thing at a known step. Faults are stratified by whether the customer-visible outcome survives ("silent") or not ("loud"). Five judges are scored on detection, step localization, fault typing, calibration, and cost over 400 trajectories [^1]:

| Judge | Silent-fault recall | Loud-fault recall | False alarms |
|-------|--------------------|--------------------|--------------|
| Outcome-only LLM judge (production default) | **45%** | **84%** | flags **33% of correct** trajectories |
| Step-rubric LLM judge | **77%** | — | **zero** false alarms at 3× cost |
| Programmatic rules [^1] | asserted (deterministic) | — | rules miss the *literal* case |

Additional decisive results: **no judge reads the final reply** — an invented promise appended to a perfect trajectory evades the rules entirely and the step judge **82% of the time**. The authors **argue evaluation must stratify recall by outcome survival** and release all verdicts + an offline analysis pipeline [^1]. This is the cleanest existing surface on which to validate a coverage threshold.

### 2.2 TrustBench: real-time, pre-execution deterministic gating (arXiv:2603.09157)

TrustBench moves from post-hoc grading to **action verification before execution** — domain-specific plugins assert safety requirements, and the framework reduced harmful actions **by 87%** overall, with domain plugins beating generic verification by **35%** more harm reduction, at **<200ms** latency [^4]. Direct evidence that a deterministic gate at the decision point outperforms post-hoc judging in *prevention*, which is the operating regime SCIRE's Free-First harness cares about.

### 2.3 NetInjectBench: the policy-gate vs. LLM-judge head-to-head (arXiv:2607.10490)

A 130-scenario network-ops benchmark with 240 attack instances, separating untrusted artifact text, trusted policy metadata, and evaluation labels [^2]:

| Defense | Unsafe tool-action rate |
|---------|------------------------|
| Naive execution | 82.50% |
| Prompt-only safety | 25.63% |
| Self-Reminder | 21.67% |
| Spotlighting | 18.33% |
| Two-Pass LLM Judge | 10.00% |
| **Static allowlisting** | 5.00% — but **0% usefulness / 100% overblock** on approved changes |
| **Metadata-aware policy gate** | **0/240** (≤1.58% Wilson upper bound) with **99.17%** attack-scenario usefulness and **100%** approved-change usefulness |

This is the sharpest engineered comparison: a deterministic, metadata-grounding policy gate reaches **0 unsafe actions** while preserving usefulness, where every LLM-judge variant still leaks 10–26%. It also documents the *failure mode of over-rigid determinism* (static allowlisting = total overblock), proving the delta is conditional on how the policy is grounded [^2].

### 2.4 AgentLTL: judge-free procedural compliance (arXiv:2607.02599)

FO-LTL over agent traces yields a **deterministic, judge-free compliance score** used for both online gating and as a dense reward. Block-and-warn harnessing improves compliance on 5/7 models; finetuning yields **+38pp accuracy and +17.5pp compliance** on held-out patterns including unseen tool aliases. Demonstrates that deterministic trace verification is not merely diagnostics — it is a **trainable signal** [^3].

### 2.5 CAVA: canonical action verification & attestation (arXiv:2607.13716)

A runtime-semantics layer converting heterogeneous agent activity (coding hooks, SDK tools, browser automation, API gateways) into **canonical runtime action objects**, with a 96-seed / 384-variant benchmark over semantic equivalence, semantic separation, wrapper bypass, **false-positive control**, approval binding, receipt reproducibility, attestation tamper detection, and runtime portability [^5]. This is the substrate that makes "state-grounded deterministic" verifiable across heterogeneous runtimes — precisely the heterogeneity that defeats single-format invariant checks.

### 2.6 R-Judge: how bad LLM judges are at risk awareness (arXiv:2401.10019)

569 records across 27 risk scenarios; the best model (GPT-4o) reaches **74.42%**, and **no other model significantly exceeds random**. Finetuning on safety judgment helps; prompting does not [^7]. Establishes the *lower bound* of judge capability: human-grade risk awareness is not a property frontier models have by default.

### 2.7 Style Over Substance: judge flip rates (arXiv:2609.08236)

Keeps reply content byte-identical and adds content-invariant style wrappers; any verdict flip is by construction a judge error. Findings are **model-specific, not universal**: a token-refusal wrapper flips **19.9%** of GPT-4o-mini's correct "unsafe" verdicts (noise floor 0.5%, still 18.2% under majority-of-three) yet moves Claude only 0.4%; deployed Llama Guard 4 is deterministically gamed (educational-course framing flips 12.3%); a rewritten grading prompt cuts the attack tenfold on the identical model — **the vulnerability lives in the judge, not the content** [^8]. Human validation: 100% content invariance, ~90% of flips are judge errors (kappa 0.95–1.0). This is the direct *precision* ceiling for LLM judges that any deterministic alternative is compared against.

### 2.8 Supporting / adjacent sources

| Source | Contribution |
|--------|--------------|
| AgentBench (arXiv:2308.03688) [^9] | The task-completion benchmark TrustBench/others build on; ground for why outcome-metrics miss procedure. |
| Agent-as-a-Judge (arXiv:2410.10934) [^10] | Agentic judges hand state to the judge ("intermediate feedback for the entire task-solving process") — the *state-grounded LLM judge* prototype; dramatically outperforms LLM-as-a-Judge. |
| ToolFailBench (arXiv:2607.04686) [^11] | Rule classifier + 2 LLM judges by majority vote label 1k traces; even Judges need aggregation; tool-use failure modes are systematic per-model (Always-Call). |
| Public-Sharing egress study (arXiv:2609.01693) [^6] | Deterministic trace scoring (no LLM judge), byte-identical controls, 480 trials — clean causal isolation of label effects; model-dependent associations. |
| AI Safety Institute / Korea AI Safety Institute leakage study (arXiv:2606.17114) [^12] | Non-adversarial operational leakage is first-order risk *distinct* from exfiltration; LLM-judge rubrics show "interpretation gaps" — judges misread their own task. |

---

## 3. Falsifiable Hypotheses

All three hypotheses state a **measurable delta** and a **pre-specified falsification condition**, so the experimenter/evaluator can either support or refute without relitigating undefined thresholds. Each cites the instrument it should be tested on.

### ED-1: Deterministic invariants dominate LLM judges on silent-fault recall with zero marginal false alarms

**Claim (directions of the delta)**: On the trajectory-judge support-desk + fault-injector design, a checkable *policy gate* (deterministic invariants over the trace: forbidden tool, canary leak, approval binding, argument equality [^1][^2][^5]) will achieve **silent-fault recall ≥77% and loud-fault recall ≥95% with false-alarm rate ≤2%**, matching or beating the step-rubric LLM judge (77% silent, 0 false alarms [^1]) while being ≥2× cheaper and with zero judge-scoring variance.

**Falsification condition (sufficient to refute)**: If on a held-out quarter of the fault-injected corpus the deterministic gate's silent-fault recall is **<70%**, **or** its false-alarm rate exceeds **5%** on the correct-trajectory cohort, OR it fails to reproduce its own verdict across two independent implementations (agreement <99%) — then determinism does not in fact dominate, and the gate needs an LLM judge to reach usable recall/precision.

**Why it is falsifiable**: silent recall is measurable exactly because ground truth is known by construction (fault injector) [^1]; policy-gate vs LLM head-to-heads already report 0 vs 10% leak under a stricter metric [^2]; the reproducibility leg is the same inter-implementation kappa the H6-3 hypothesis requires [^audit].

### ED-2: The recall crossover between determinism and LLM judging is type-dependent — semantic and non-groundable gates are the ONLY place LLM judges add value

**Claim**: The efficacy delta is **not** a single number. Group failures by whether the violating property is (a) observable over the tool-call trace / state snapshot, or (b) only semantically inferable (intent, encoded/transformed exfiltration, "wrong way" compliance). For class (a), a deterministic gate is **≥95% as effective** as a state-grounded LLM judge at detecting the harm. For class (b), LLM judges add material recall — and deterministic invariants add **~0** — so for (b) the state-grounded judge is necessary to close the gap that determinism cannot reach.

**Falsification condition (sufficient to refute)**: If, over a curated corpus stratified into (a)-observable and (b)-semantic harms, the state-grounded LLM judge beats the deterministic gate by **<10 points (pp) of recall on class (a)**; or if the deterministic gate matches the state-grounded judge on **class (b)** by more than chance (i.e. determinism is not actually blind to semantics), then the characterization is wrong.

**Why it is falsifiable**: the (a)/(b) split is precisely the distinction the audit demands between deterministic and state-grounded judging [^audit]; TrustHarness explicitly concedes (b)-encoded exfiltration [^13], while trajectory-judge proves semantics-only attacks (a fabricated promise) evade rules but also evade LLM step judges 82% of the time [^1] — so the (b)-advantage must be measured, not assumed.

### ED-3: Grounding decides the delta more than the judge type — metadata/policy grounding can certify near-zero unsafe actions that no LLM-on-text judge achieves

**Claim**: The largest observed efficacy delta in the literature is not deterministic-vs-LLM *per se* but whether the checker is **grounded in trusted, non-artifact state (metadata, policy, canonical action objects)** versus operating on untrusted text. A metadata-aware policy gate achieves **≥1.5× greater harm reduction** than the best LLM judge on the same corpus, and reaches a **statistically certified near-zero unsafe-action rate (upper bound <2%)** while preserving usefulness — extending NetInjectBench's 0/240 / ≤1.58% result [^2] under the canonical-action substrate of CAVA [^5].

**Falsification condition (sufficient to refute)**: If, on the NetInjectBench 130-scenario corpus or an equivalent, the metadata/policy-grounded gate fails to reach **≥99% attack-scenario usefulness while holding unsafe actions ≤ 2%** (with a Wilson 95% bound), OR if a state-grounded LLM judge matches that certified bound **without** metadata grounding, then grounding is not the decisive variable and the claim collapses to "use a better judge."

**Why it is falsifiable**: NetInjectBench already reports the (0/240, ≤1.58%, 99.17%+100% usefulness) point to beat [^2]; CAVA provides the canonicalization enabling it across heterogeneous runtimes [^5]; the "certified bound" is a standard Wilson interval the evaluator can verify directly.

---

## 4. Gap Analysis — what is still unmeasured

The literature answers **directions** of the delta precisely but leaves the **magnitude for SCIRE's specific distribution** open:

| Gap | Why | Evidence |
|-----|-----|----------|
| **Coverage threshold on a *synthetic MCP* corpus** | trajectory-judge uses a support-desk env, NetInjectBench a network-ops env — neither is a TrustHarness-style MCP surface with canary/approval gates | [^1][^2][^4][^13] |
| **Judge cost vs. value on class-(b) semantic harms** | No study reports the *marginal* recall (b) judges add over a (a)-invariant gate on the *same* corpus | [^1][^8] |
| **Cross-implementation reproducibility of invariant checks** | H6-3 raised it; CAVA formalizes canonicalization but does not report inter-implementation kappa on a shared corpus | [^5][^audit] |
| **Transfer of synthetic-environment results to production** | H6-4 REJECTED for lack of evidence; no source yet validates Spearman-correlation transfer | [^audit][^4] |
| **The inflation/overblock failure of determinism** | Static allowlisting = 0% usefulness; the *right* determinism (grounded policy) avoids it — under-explored | [^2] |

---

## 5. What This Means for SCIRE

1. **A defensible coverage threshold is now *testable*, not invented.** ED-1 gives the experimenter a concrete instrument (fault-injected support-desk/MCP harness) and a pre-specified falsification bar (silent-recall ≥70%, false alarms ≤5%, inter-implementation agreement ≥99%). This replaces the unevidenced "80%" with a number we can actually measure and defend.
2. **Deterministic-first is empirically justified for observe-over-trace harms** (ED-1/ED-2), aligning with SCIRE's Free-First / no-paid-LLM-judge policy [^2][^4][^6].
3. **The LLM judge's real, defensible role is narrow and well-defined**: class-(b) semantic harms and non-groundable policy — and even there, judge precision is bounded by known wrapper flip rates [^8] and risk-awareness floors [^7]. SCIRE should invoke a (free, state-grounded) judge *only* for the residual, per H6's Layer-3 architecture [^audit].
4. **Grounding beats judge-type (ED-3)** — the highest-leverage engineering is binding checks to trusted, non-artifact metadata and canonical action objects, which is exactly what CAVA and the grounded policy gate demonstrate [^2][^5].

---

## 6. Sources

[^1]: trajectory-judge: What Outcome-Only LLM Judges Miss on Agent Trajectories. arXiv:2609.00038 (2026-08-29). Deterministic support-desk env; 400 trajectories; outcome judge 84% loud / 45% silent recall with 33% of correct trajectories flagged; step-rubric 77% silent, 0 false alarms, invented-promise evades rules and step judge 82%; stratify by outcome survival. https://arxiv.org/abs/2609.00038
[^2]: NetInjectBench: Benchmarking Indirect Prompt Injection in Tool-Using LLM Agents for Network Operations. arXiv:2607.10490 (2026-07-11). 130 scenarios / 240 attacks; naive 82.50%, prompt-only 25.63%, Self-Reminder 21.67%, Spotlighting 18.33%, Two-Pass LLM Judge 10.00% unsafe tool-action rate; static allowlisting 5.00% but 0% usefulness/100% overblock; metadata-aware policy gate 0/240 (≤1.58% Wilson 95% UB), 99.17% attack usefulness, 100% approved usefulness. https://arxiv.org/abs/2607.10490
[^3]: AgentLTL: A Trace-Verification Framework for Measuring, Enforcing, and Training Procedural Compliance in Tool-Using LLM Agents. arXiv:2607.02599 (2026-07-01). FO-LTL; deterministic judge-free compliance score; block-and-warn improves compliance 5/7 models; finetune +38pp accuracy / +17.5pp compliance. https://arxiv.org/abs/2607.02599
[^4]: TrustBench: Real-Time Trust Verification for Safe Agentic Actions. arXiv:2603.09157 (2026-03-10). Pre-execution action verification; reduces harmful actions 87%; domain plugins +35% over generic; <200ms latency. https://arxiv.org/abs/2603.09157
[^5]: CAVA: Canonical Action Verification and Attestation for Runtime Governance of Agentic AI Systems. arXiv:2607.13716 (2026-07-15). Canonical action objects; 96-seed/384-variant benchmark: semantic equivalence/separation, wrapper bypass, false-positive control, approval binding, receipt reproducibility, tamper detection. https://arxiv.org/abs/2607.13716
[^6]: Public-Sharing Labels and Verbatim Field Egress in an MCP-to-A2A Agent Configuration. arXiv:2609.01693 (2026-09-01). Deterministic trace scoring (no LLM judge), byte-identical controls, 4 models × 3 arms × 4 repeats = 480 trials; model-dependent label association. https://arxiv.org/abs/2609.01693
[^7]: R-Judge: Benchmarking Safety Risk Awareness for LLM Agents. arXiv:2401.10019 (2024-01-18). 569 records / 27 scenarios / 10 risk types; best GPT-4o 74.42%, no other model beats random; finetuning helps, prompting fails. https://arxiv.org/abs/2401.10019
[^8]: Style Over Substance: Content-Invariant Wrappers Flip LLM Safety-Judge Verdicts. arXiv:2609.08236 (2026-09-08). ≥600 replies × 7 wrappers × 8 judges; token-refusal flips 19.9% GPT-4o-mini unsafe verdicts (noise 0.5%), Llama Guard 4 gamed 12.3% by educational framing, gpt-oss-safeguard-20b immune; 100% content invariance, ~90% flips judge errors (kappa 0.95–1.0). https://arxiv.org/abs/2609.08236
[^9]: AgentBench: Evaluating LLMs as Agents. arXiv:2308.03688 (2023). 8 environments; task-completion evaluation that post-hoc/real-time trust methods build on. https://arxiv.org/abs/2308.03688
[^10]: Agent-as-a-Judge: Evaluate Agents with Agents. arXiv:2410.10934 (2024-10-14). State-grounded agentic judge: intermediate feedback over whole task; dramatically outperforms LLM-as-a-Judge, ≈ human baseline (DevAI benchmark). https://arxiv.org/abs/2410.10934
[^11]: ToolFailBench: Diagnosing Tool-Use Failures in LLM Agents. arXiv:2607.04686 (2026-07-06). 1k tasks; rule classifier + 2 LLM judges (majority); Tool-Skip/Result-Ignore/Output-Fabrication/Unnecessary-Tool-Use; per-model failure modes. https://arxiv.org/abs/2607.04686
[^12]: An Evaluation of Data Leakage Risks in Tool-Using LLM Agents in Realistic Scenarios. arXiv:2606.17114 (2026-06-15). SAI Singapore + SAI Korea; 12 non-adversarial tasks; judges show "interpretation gaps"/role-reversal; operational leakage distinct from adversarial exfiltration. https://arxiv.org/abs/2606.17114
[^13]: TrustHarness — Deterministic security testing for tool-using AI agents with synthetic MCP environments (MustCall/ForbidCall/NoCanaryLeak/RequiresApproval/ArgumentsEqual). https://github.com/ofirtro/trustharness (from prior H6 brief [^audit]). Concedes it cannot detect semantically encoded exfiltration.

[^audit]: SCIRE Audit 2026-09-08 — H6 Deterministic Rule-First Judging. Research cycle verdict: H6-3 SUPPORT; H6-1/H6-2 CHALLENGE (thresholds unevidenced); H6-4 REJECT. Key lesson: distinguish *state-grounded evaluation* from *deterministic invariant checking*. `audits/2026-09-08-H6-deterministic-rule-first-judging-research.md`. Prior brief: `research/literature/H6-deterministic-rule-first-judging-brief.md`.

---

## 7. Confidence

**HIGH confidence** (direct, current, ground-truth experiments):
- Silent/loud recall split for outcome vs step LLM judges: trajectory-judge, 400 fault-injected trajectories [^1].
- Policy-gate vs LLM head-to-head (0/240 ≤1.58% vs 10%+): NetInjectBench, 240 attacks [^2].
- Judge flip rates are model-specific and content-invariant wrappers expose them: Style Over Substance, human-validated [^8].
- Domain-grounded real-time gating effective in prevention: TrustBench 87% / +35% [^4].

**MEDIUM confidence** (strong but partly inferred / not yet run on SCIRE's MCP distribution):
- ED-1: that a *TrustHarness-style MCP gate* inherits the support-desk results — the supporting studies use different environments; coverage on synthetic MCP must be measured [^1][^2][^13].
- ED-2: the (b)-semantic recall advantage is directionally supported but its magnitude on a shared (a)+(b) corpus is unmeasured.
- ED-3: extending NetInjectBench's certified bound to canonical-action substrates assumes CAVA's generalizability [^5].

**LOW confidence** (speculative):
- Any single "universal" coverage number — the evidence is strongly type-dependent, which is precisely why ED-1/ED-2/ED-3 are stated as directional deltas with pre-specified bars rather than fixed percentages [^8][^audit].