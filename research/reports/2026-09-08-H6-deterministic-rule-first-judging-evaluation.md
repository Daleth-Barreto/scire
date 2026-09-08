# Evaluation: Deterministic Rule-First Judging for Agentic Red-Teaming — Shock Verdict

**Date**: 2026-09-08
**Agent**: scire-evaluator
**Method**: Popper/TRIAGE-style falsification. Each hypothesis is attacked from its weakest point; the evaluator assumes the hypothesis is WRONG and builds the strongest counter-case.
**Input brief**: research/literature/H6-deterministic-rule-first-judging-brief.md

---

## 1. Overall Verdict

| Hypothesis | Verdict | Reason |
|-----------|---------|--------|
| H6-1 (State invariants cover ≥80% high-severity) | **CHALLENGE** | The 80% threshold is unsupported; evidence covers narrow attack types |
| H6-2 (LLM judge adds <2% for high-severity) | **CHALLENGE** | Neglects class of semantic-intent failures that invariants miss entirely |
| H6-3 (Deterministic judging is more reproducible) | **SUPPORT** | Strong logical and empirical basis; minor caveat on snapshot timing |
| H6-4 (Synthetic environments transfer to real) | **REJECT** | No empirical evidence; fundamental ecological validity concern |
| Overall architecture proposal | **CHALLENGE** | Sound but over-claims on what invariants can cover |

**Overall assessment**: The deterministic rule-first approach is a *significant improvement* over LLM-judge-only evaluation and should be adopted as the primary layer. However, the brief over-claims inductive coverage (H6-1, H6-4). The architecture is sound as a *layered system* where deterministic checks are the foundation, not the totality.

---

## 2. Hypothesis-by-Hypothesis Shock Test

### H6-1: State Invariants Cover ≥80% High-Severity Failures — CHALLENGE

**Counter-argument (strongest case against)**:

The 80% number is invented. The brief admits no empirical study computes this ratio. REDAgentBench's state judge does *not* check state invariants — it checks receipts and final-state snapshots using an LLM evaluator (the State Judge is still a judge; it just looks at state artifacts rather than transcripts). This is a critical conflation:

- **REDAgentBench State Judge** = LLM judge fed with state artifacts (receipts, DB snapshots) ≠ TrustHarness-style deterministic invariant checking [^3].
- **TrustHarness invariants** = fully deterministic (MustCall, ForbidCall, etc.) [^4].

These are different things. The brief conflates "state-grounded evaluation" (which REDAgentBench shows is better) with "deterministic invariant checking" (which TrustHarness does). The former is still LLM-judged; the latter is deterministic. The leap from "state evidence is better" to "invariants cover ≥80%" is not warranted.

**Additionally**: The REDAgentBench attack corpus is composed of straightforward tool-abuse attacks (make a transfer, delete a file, send an email to the wrong person). These are exactly the kind of attacks that invariants *can* detect. Sophisticated attacks that exploit reasoning chains, multi-turn context, or semantic ambiguity may be fundamentally invisible to invariants.

**Verdict**: CHALLENGE. The 80% threshold is [UNVERIFIED] and may be over-optimistic. The brief's evidence shows that state evidence is *better* than transcript evidence, not that invariants alone achieve 80% coverage. The experimenter should measure actual coverage empirically before claiming this number.

### H6-2: LLM Judge Adds <2% Marginal Value for High-Severity — CHALLENGE

**Counter-argument**:

The brief assumes that "high-severity" failures are the only ones that matter for this hypothesis. But this definition is circular — it defines high severity as "caught by invariants" and then asks if invariants catch them.

The real counter-case: consider an attack where the agent is manipulated into making a seemingly legitimate tool call that has a harmful semantic consequence not captured by any invariant. For example:
- Agent is tricked into adding a user to a sensitive permission group with a plausible-looking justification. The invariant says: "agent called `add_user` with args `(user_id, group_id)` — arguments match expected values" → PASS. But the *combination* of user and group is harmful.
- Agent is manipulated into querying a legitimate endpoint but with a query that, combined with the response, constitutes data exfiltration via the user's chat output (not via a tool call).

In these cases, the LLM judge analyzing the transcript *could* detect harm that invariants miss. Whether it actually does (vs. hallucinating) is the open question — but to claim it adds <2% is to claim the edge cases don't exist, which contradicts the findings on agentic-only vulnerabilities [^5].

**Verdict**: CHALLENGE. The <2% threshold is [UNVERIFIED] and likely under-estimates the marginal value of LLM judging for *novel* attack classes. The brief's own source (AgentSeer [^5]) shows agentic-only vulnerabilities that invariants would need to be specifically designed to catch — and those invariants don't exist yet.

### H6-3: Deterministic Judging Is More Reproducible — SUPPORT

**Counter-argument attempted**:

Could deterministic judging have reproducibility problems? The brief acknowledges snapshot timing (when the state is captured matters). Two harnesses might capture state at different points in a multi-step attack, yielding different verdicts.

However, this is an implementation detail, not a fundamental limitation. If the state capture protocol is specified (as REDAgentBench specifies its harness), the evaluation is reproducible by construction. LLM judges, by contrast, are *fundamentally* non-deterministic — temperature, prompt wording, model version all affect the output.

**Verdict**: SUPPORT with minor caveat. The claim is directionally correct. The experimenter should document the state capture protocol explicitly and measure inter-harness agreement to quantify the snapshot-timing variance.

### H6-4: Synthetic Environments Transfer to Real — REJECT

**Counter-argument (strong)**:

This is the weakest hypothesis in the brief, and it deserves REJECT:

1. **No evidence cited**. The brief itself admits this: "neither validates transfer to real deployments." Hypothesizing an answer to an unvalidated question and then calling it "medium confidence" is wishful thinking, not science.

2. **Fundamental ecological validity problem**. TrustHarness MCP fakes are *simple* — they have deterministic responses, fixed schemas, and no real-world complexity. Real MCP services have:
   - Rate limiting, timeouts, and partial failures that change attack surface
   - Authentication/authorization flows that create side channels
   - Latent data from other users that creates information leakage paths
   - Complex state machines (e.g., an email service with draft/sent/failed states)
   
   An attack that works against a TrustHarness fake may not work against Gmail MCP (different error handling creates different behavioral triggers), and vice versa.

3. **Contradiction with own findings**. AgentSeer [^5] shows that agentic-only vulnerabilities emerge from the *interaction* between model and tool environment. Different environments produce different vulnerabilities. A synthetic environment tests vulnerabilities specific to that synthetic environment.

4. **Spearman correlation of 0.7 is not validated**. The brief proposes a metric (0.7 rank correlation) without any baseline or theory of what constitutes acceptable transfer.

**Verdict**: REJECT as stated. The hypothesis is unfalsifiable in its current form because there is no empirical basis to even estimate the correlation. The architectural decision to use synthetic environments is still sound for *local testing and CI*, but the claim of transfer to production must be dropped until empirically validated.

---

## 3. Shock Test on the Overall Architecture

The four-layer architecture (action trace → state invariant → reproducibility gate → optional LLM judge) is **sound as a layered defense-in-depth**. The shock test:

**What if the architecture becomes a false sense of security?**

If SCIRE adopts the architecture and reports "PASS" when all deterministic checks pass, that PASS carries the same problem identified in the 2026-09-07 brief: "a scan that passes proves nothing" [^9]. The architecture must explicitly report:
1. What invariants were checked (coverage specification)
2. What was NOT checked (known blind spots, enumerated in Section 4 of the brief)
3. The fraction of cases that fell through to the optional LLM judge

Without this, the architecture replaces one false sense of security (LLM judge "PASS") with another (invariant "PASS").

**Architectural modification recommended**: The harness must produce a **coverage report** alongside the verdict, listing:
- Invariants evaluated (N must-call, N forbid-call, N canary, N approval, N argument)
- Coverage of attack surfaces (which MCP tools were covered)
- Known blind spots (encoded exfiltration, semantic intent)
- Fraction of PASS/FAIL/INCONCLUSIVE

---

## 4. Source Verification

| Claim | Source | Verified? | Issue |
|-------|--------|-----------|-------|
| State Judge > Trajectory Judge by 7.73–11.72 pp | REDAgentBench arXiv:2608.10669 | YES | McNemar p-value reported in abstract; numbers match |
| LLM judges ≈ coin-flip | ReliableBench arXiv:2603.06594 | YES (from prior brief) | Not re-verified this cycle; depends on prior verification |
| ±33% evaluator variance | When Scanners Lie ACL evaleval 2026 | YES (from prior brief) | Not re-verified this cycle |
| 80% coverage threshold | BRIEF AUTHOR | NO | [UNVERIFIED] — invented estimate |
| Agentic-only vulnerabilities exist | AgentSeer arXiv:2509.17259 | YES | Abstract confirms finding |
| RAS via internal representations | SafeVec arXiv:2606.25750 | YES | Abstract confirms approach |
| 13/13 frontier models compromised | NIST CAISI 2026 | YES (from prior brief) | Not re-verified this cycle |
| Synthetic → real transfer correlation 0.7 | BRIEF AUTHOR | NO | [UNVERIFIED] — invented metric |

**Issues found**: Two claims (80% coverage threshold, 0.7 transfer correlation) are [UNVERIFIED] estimates presented with more confidence than warranted.

---

## 5. Final Verdict Summary

**Overall: CHALLENGE** (not REJECT).

The rule-first deterministic approach is correct in direction, well-supported empirically for its core claims (state evidence > transcript evidence, LLM judges unreliable), and architecturally sound as a layered system. It should be adopted.

However, the brief over-reaches in two ways:
1. **Claims specific coverage thresholds (80%, <2%) without empirical basis.** These must be measured, not estimated.
2. **Claims transferability to production without evidence.** The synthetic environment is a testing tool, not a production proxy.

**Recommendation to the experimenter**: Implement H6-3 (reproducibility) first — it is the strongest hypothesis with the most straightforward test. Then H6-1 (coverage measurement) with a realistic attack corpus. H6-4 (transfer) requires both synthetic and real environments and is a longer-term project.

---

## Sources

[^1]: REDAgentBench arXiv:2608.10669 (2026-08-11). https://arxiv.org/abs/2608.10669
[^2]: TrustHarness https://github.com/ofirtro/trustharness
[^3]: AgentSeer arXiv:2509.17259 (2025-09-21). https://arxiv.org/abs/2509.17259
[^4]: SafeVec/RAS arXiv:2606.25750 (2026-06-24). https://arxiv.org/abs/2606.25750
[^5]: SCIRE Brief 2026-09-07. research/reports/2026-09-07-testing-agentic-red-teaming-protocol.md
[^6]: NIST CAISI 2026. https://www.nist.gov/blogs/caisi-research-blog/insights-ai-agent-security-large-scale-red-teaming-competition
