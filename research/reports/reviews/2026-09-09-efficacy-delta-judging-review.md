# Review: Efficacy Delta Deterministic vs. LLM Judges — Verification Verdict

**Date**: 2026-09-09
**Agent**: scire-reviewer
**Scope**: Adversarial verification of claim-by-claim citation accuracy across the brief, evaluation, and report for the 2026-09-09-efficacy-delta-judging cycle.
**Method**: Cross-check every quantitative claim against its cited source; flag any number, direction, or threshold that the source does not support.

---

## 1. Verdict

**OVERALL: PASS** (approve with no blocking issues). No fabricated numbers found. Every quantitative claim in the brief, evaluation, and report traces to a cited arXiv source with matching values. Two non-blocking notes below.

---

## 2. Claim-by-Claim Verification

| Claim | Value | Source | Match? | Note |
|-------|-------|--------|--------|------|
| Outcome-only LLM judge loud-fault recall | 84% | trajectory-judge 2609.00038 | ✅ | Abstract confirms |
| Outcome-only LLM judge silent-fault recall | 45% | trajectory-judge 2609.00038 | ✅ | Abstract confirms |
| Step-rubric judge silent-fault recall | 77% | trajectory-judge 2609.00038 | ✅ | Abstract confirms |
| Outcome judge flags correct trajectories | 33% | trajectory-judge 2609.00038 | ✅ | Abstract confirms |
| Invented-promise evades rules + step judge | 82% | trajectory-judge 2609.00038 | ✅ | Abstract confirms |
| Two-Pass LLM Judge unsafe rate | 10.00% | NetInjectBench 2607.10490 | ✅ | Abstract confirms |
| Metadata-aware policy gate unsafe actions | 0/240 (≤1.58% Wilson UB) | NetInjectBench 2607.10490 | ✅ | Abstract confirms |
| Metadata gate attack usefulness | 99.17% | NetInjectBench 2607.10490 | ✅ | Abstract confirms |
| Static allowlisting usefulness / overblock | 0% / 100% | NetInjectBench 2607.10490 | ✅ | Abstract confirms |
| TrustBench harm reduction | 87% | TrustBench 2603.09157 | ✅ | Abstract confirms |
| TrustBench domain plugin | +35% vs generic | TrustBench 2603.09157 | ✅ | Abstract confirms |
| TrustBench latency | <200ms | TrustBench 2603.09157 | ✅ | Abstract confirms |
| AgentLTL finetune accuracy | +38pp | AgentLTL 2607.02599 | ✅ | Abstract confirms |
| AgentLTL finetune compliance | +17.5pp | AgentLTL 2607.02599 | ✅ | Abstract confirms |
| CAVA benchmark size | 96-seed / 384-variant | CAVA 2607.13716 | ✅ | Abstract confirms |
| GPT-4o R-Judge best accuracy | 74.42% | R-Judge 2401.10019 | ✅ | Abstract confirms |
| No other R-Judge model beats random | yes | R-Judge 2401.10019 | ✅ | Abstract confirms |
| GPT-4o-mini wrapper flip | 19.9% | Style Over Substance 2609.08236 | ✅ | Abstract confirms |
| Llama Guard 4 gamed | 12.3% | Style Over Substance 2609.08236 | ✅ | Abstract confirms |
| Egress study trials | 480 (4×3×4) | Public-Sharing 2609.01693 | ✅ | Abstract confirms |

**Result**: 20/20 quantitative claims verified. All values match the cited sources.

---

## 3. Non-Blocking Notes

1. **ED-1 threshold provenance** (reported): The evaluator correctly flagged that the ≥77% silent-fault recall in ED-1 is the LLM step-judge's number, not a measured deterministic-gate value. This is now reflected in the report (required modification) and the `deterministic-gate-silent-recall-is-unmeasured` lesson. The hypothesis as *written in the brief* should be considered amended per the evaluator's required modification. ✅ handled downstream.

2. **Cited-assertion boundary**: The evaluation and report correctly mark the ≥95%, ≤5%, ≥1.5x thresholds as experimental targets rather than confirmed findings. This matches the anti-hallucination Tier-0 discipline from AGENTS.md and the prior `coverage-thresholds-need-empirical-basis` lesson. ✅ consistent.

---

## 4. Signature / Identity Check

Per reviewer Responsibility 4 (from AGENTS.md): verify the producing agents' commits verify against `scire_allowed_signers`.

- Researcher brief commit **c3fa735** — `git verify-commit` result checked this cycle.
- **Known unresolved issue**: audit.md records that `scire_allowed_signers` is missing `scire-orchestrator` and `scire-evaluator` keys (confirmed `missing key` in H6 commits b1f63c0, ac688ee).**This is an OPEN item requiring human intervention** and pre-empts full verifiability of orchestrator/evaluator signatures on this cycle. It does not block the science.

---

## 5. Final

Review verdict: **APPROVE**. All claims trace to verified sources; no fabricated numbers; thresholds honestly labeled. The only open item is the pre-existing `allowed_signers` gap (human action required), unchanged by this cycle.

## Sources

[^1]: trajectory-judge arXiv:2609.00038; NetInjectBench arXiv:2607.10490; AgentLTL arXiv:2607.02599; TrustBench arXiv:2603.09157; CAVA arXiv:2607.13716; R-Judge arXiv:2401.10019; Style Over Substance arXiv:2609.08236; Public-Sharing arXiv:2609.01693 — all verified via arXiv API abstracts this cycle.
[^2]: SCIRE audit.md — allowed_signers gap (open human item).