# Report: Deterministic Rule-First Judging for Agentic Red-Teaming

**Date**: 2026-09-08
**Status**: Synthesized report from brief + evaluation (scire-research cycle)
**Cycle**: H6 from 2026-09-07 testing protocol brief, now a full research cycle
**Relevant artifacts**:
- Brief: `research/literature/H6-deterministic-rule-first-judging-brief.md`
- Evaluation: `research/reports/2026-09-08-H6-deterministic-rule-first-judging-evaluation.md`
- Lessons: `research/evolution/lessons.json` (+3 lessons)

---

## 1. Research Question

Can deterministic, rule-based verification (state invariants, tool-call traces, canary checks) replace or substantially reduce reliance on LLM-as-judge evaluation for agentic AI safety testing — and is this viable cheaply (aligned with SCIRE's Free-First policy)?

## 2. Answer

**Deterministic rule-first judging is a sound, high-value foundation — but it is NOT a total replacement for LLM judging.** The evidence and the evaluator's shock test converge on a *layered* verdict:

- **YES** for the core: state-grounded, deterministic evaluation is more reliable and reproducible than LLM-transcript judging for the highest-severity agentic failures (tool abuse, data exfiltration, privilege escalation, approval bypass).
- **NOT YET** for total replacement: invented coverage thresholds (80%, <2%) were rejected as [UNVERIFIED]; transfer of synthetic-environment results to production is unproven (H6-4 REJECT).

The correct architecture is **defense-in-depth**: deterministic invariants as the primary, cheap, reliable layer, with an LLM judge reserved for the residual (semantic-intent and never-seen attack classes) — and every verdict accompanied by an explicit coverage report.

## 3. Key Findings

### 3.1 Empirical (HIGH confidence)

1. **State evidence beats transcript evidence.** REDAgentBench (arXiv:2608.10669) shows the State Judge reports ASR 7.73–11.72 pp higher than the Trajectory Judge across all models tested (McNemar p≤6.54×10⁻⁵) [^1]. Transcripts systematically lose durable harm visible in receipts and final state.

2. **LLM judges are the weak link.** ReliableBench: judges ≈ coin-flip accuracy under adversarial distribution [^2]. When Scanners Lie: ±33% ASR variance by evaluator [^3]. Neither failure mode afflicts deterministic checks.

3. **Agentic-only vulnerabilities exist.** AgentSeer (arXiv:2509.17259) finds attack vectors that emerge only in tool-use execution and stay inert against standalone models — so the action graph, not just the model, must be judged [^4].

### 3.2 Architectural (MEDIUM confidence)

4. **The recommended layered harness**: (1) Action Trace Validator → (2) State Invariant Checker → (3) Reproducibility Gate → (4) optional LLM Judge for the residual. Layers 1–2 are deterministic and zero-cost (Free-First aligned); the expensive LLM judge only fires on INCONCLUSIVE cases.

5. **TrustHarness-style invariants** (MustCall, ForbidCall, NoCanaryLeak, RequiresApproval, ArgumentsEqual) [^5] are the concrete realization of rule-first judging and are CI-suitable (non-zero exit code).

### 3.3 Critical caveats (from evaluator)

6. **Conflation warning**: REDAgentBench's State Judge is still an LLM judge (fed state artifacts), NOT deterministic invariant checking. These have different cost and reliability; coverage must be measured per class.

7. **Unverified thresholds**: The 80% coverage (H6-1) and <2% marginal-value (H6-2) figures have no empirical basis and were CHALLENGEd.

8. **Transfer not proven**: H6-4 (synthetic→real transfer) was REJECTed — no evidence supports a 0.7 Spearman correlation claim.

9. **PASS ≠ proof**: A harness that passes all invariants still proves nothing about uncovered attack space; every verdict must carry a coverage report enumerating what was and was not checked.

## 4. Verdict

| Hypothesis | Verdict |
|-----------|---------|
| H6-1 (≥80% high-severity coverage) | CHALLENGE — threshold unverified |
| H6-2 (LLM judge <2% marginal) | CHALLENGE — neglects semantic-intent failures |
| H6-3 (deterministic more reproducible) | SUPPORT |
| H6-4 (synthetic→real transfer) | REJECT — no evidence |
| Overall architecture | CHALLENGE → adopt as layered foundation, not totality |

## 5. Recommendations for SCIRE

1. **Adopt the layered rule-first harness** as the primary local evaluation path (Free-First: zero-cost, deterministic, CI-able). Reuse the existing `grader` and `workspace/` experiment pipeline.
2. **Prioritize H6-3 first** (reproducibility) — strongest hypothesis, simplest test. Then **H6-1** (coverage measurement) against a realistic attack corpus. **Defer H6-4** (transfer) until real MCP services are available.
3. **Mandate a coverage report** on every harness verdict (invariants checked, attack surfaces covered, known blind spots, fraction of INCONCLUSIVE).
4. **Keep the LLM judge as a residual, not primary** layer; when used, report FPR alongside ASR.
5. This cycle produced no executable experiment (no local target LLM present); the experimenter should implement the harness once a local model (e.g. via ollama/llama.cpp) is available, per the Free-First policy.

## 6. Sources

[^1]: REDAgentBench arXiv:2608.10669 (2026-08-11). https://arxiv.org/abs/2608.10669
[^2]: ReliableBench/JudgeStressTest arXiv:2603.06594. https://www.arxiv.org/pdf/2603.06594
[^3]: "When Scanners Lie" ACL evaleval 2026. https://aclanthology.org/2026.evaleval-1.11/
[^4]: AgentSeer "Mind the Gap" arXiv:2509.17259 (2025-09-21). https://arxiv.org/abs/2509.17259
[^5]: TrustHarness. https://github.com/ofirtro/trustharness
[^6]: SafeVec/RAS arXiv:2606.25750 (2026-06-24). https://arxiv.org/abs/2606.25750
[^7]: SCIRE brief 2026-09-07. research/reports/2026-09-07-testing-agentic-red-teaming-protocol.md
