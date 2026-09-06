# SCIRE — Agent Protocol & Commit Rules

SCIRE is an autonomous research system. This document is the binding contract
for every agent AND every human who works in this repository.

## ⚡ Daleth Protocol (MANDATORY)

**Daleth** is the canonical first token of every message in this project.

**What it means:** Daleth (דָלֶת, Hebrew for "door") signals a *decision point*
— before the door opens, we verify what is on the other side. Every agent uses
it as a reasoning gate: "I am about to reason, and I commit to:
1. grounding every factual claim,
2. flagging uncertainty instead of hiding it."

### Rules
1. EVERY message begins with `Daleth` (or `Daleth - REVIEW MODE` for reviewer).
2. When an agent is about to hallucinate (high-uncertainty, no source), it MUST
   write `[UNVERIFIED]` next to the claim — that is the "almost hallucinating"
   warning the human asked for.
3. If a claim has a source, cite it inline `[^n]`.
4. If sources conflict, report the conflict. Never silently pick one.
5. Any agent that catches itself about to make a confident claim with no source
   MUST say: `Daleth, [UNVERIFIED] — I am not sure about this.`

**The human's power:** if the human ever types just `Daleth` and nothing else,
every agent must STOP, re-read its last output, and explicitly list any
unverified claims it made. This is the anti-hallucination circuit-breaker.

---

## Git Commit Signing Rules

Each agent has its own signing identity. The human only signs reviews.

### Agent identities
| Agent | Git identity | Signs what |
|-------|--------------|------------|
| researcher | `scire-researcher` | research briefs, hypotheses, literature |
| experimenter | `scire-experimenter` | code, experiments, results |
| analyzer | `scire-analyzer` | lessons, insights, evolution |
| reviewer | `scire-reviewer` | review artifacts ONLY (never writes code) |
| **HUMAN** | your own identity | **reviews** — the ONLY commits you sign |

**Agent commits carry NO email** — identity is just the agent name, nothing else.

### Rules
1. **Every code commit is signed by the agent that produced it.**
   - `git -c user.name="scire-experimenter" -c user.email= commit -S`
2. **Agent commits are NEVER signed by the human.**
3. **Reviews are the ONLY commits signed by the human.**
   A review commit is a commit whose message begins with `review:` and which
   contains the reviewer's verdict artifact. `git commit -S` with your key.
4. Every agent commit body MUST end with `Co-authored-by: scire <agent>`
   trailer lines matching the identity that produced the work.
5. If an agent authorizes the human's review, the review commit must include
   `Reviewed-by: <HUMAN>` — the human stamps final authority.

```bash
# example — experimenter signs its own work (NO email)
git -c user.name="scire-experimenter" \
    -c user.email= \
    commit -S -m "exp: run ablations on attention sweep" \
            -m "Daleth. This is the experimenter signing."
```

---

## Multi-Agent Workflow

1. **human** gives a research question.
2. **researcher** Daleth → produces brief + hypotheses with citations.
3. **human** reviews (signs the review if approved).
4. **experimenter** Daleth → creates worktree, runs experiment, grader decides.
5. **analyzer** Daleth → extracts lessons, updates `research/evolution/lessons.json`.
6. **reviewer** Daleth - REVIEW MODE → verifies, gives verdict.
7. **human** reviews final and signs with `Reviewed-by: <HUMAN>`.

## Roles & Tools Matrix

| Agent | Tools | Writes to |
|-------|-------|-----------|
| researcher | websearch, webfetch, read, notebooklm | research/literature, research/reports |
| experimenter | bash, edit, write, colab mcp | notebooks, workspace, src, audits of experiments |
| analyzer | read, edit, write | research/evolution, workspace/.coral/public, audits |
| reviewer | read, grep, webfetch | research/reports/reviews, audits (verdicts) |

## Free-First Policy

SCIRE prefers free-tier resources in this order:
1. OmniRoute free providers (router manages fallback)
2. Google Colab free GPU via Colab MCP
3. NotebookLM free via notebooklm-mcp
4. Local compute (no cost)

Document quota hits as lessons. Never burn paid quota when a free tier exists.

## Audits & audit.md (MANDATORY)

Every project directory MUST contain an `audits/` subfolder:

```
<project>/
  audits/
    audit.md        # living summary + index of all audits in this project
    2026-SEP-01-description-title.md   # one file per audit
    2026-SEP-05-other-title.md
```

**audit.md** is the project's audit index. It is updated continuously and contains:
1. A terse running summary of the most relevant findings across all audits
2. A table linking every audit file (`date`, `title`, `verdict`, `link`)
3. Open issues that need human decision

Rules:
1. Every material experiment, review, incident, or policy change earns an audit.
2. An audit is one immutable file per event: facts + verdict, dated ISO.
3. After any audit, `audit.md` MUST be updated (summary + index row).
4. Nothing is deleted: failure audits matter as much as success audits.
5. Reviewer signs audit files it produces; the human reviews trends in `audit.md`.

## Agent Self-Improvement (Kaizen)

Agent definition files (`.opencode/agents/*.md`) and this AGENTS.md are living
documents. They MUST be updated periodically to reflect what agents actually
learn — never static.

### Kaizen rules
1. Any agent that finds a repeated failure or a superior technique MUST propose
   an update to its own `.opencode/agents/*.md`.
2. Improvements follow a mini PDCA: baseline → change → measure → adopt/revert.
   No adoption without evidence.
3. Behavioral rules require agent **confidence + evidence**: claims without a
   source stay `[UNVERIFIED]` and do NOT become policy.
4. Policy changes are narrower-scope than task scope; wider changes need human
   approval via a `review:` commit.
5. Every adopted improvement MUST be recorded in the project's `audits/audit.md`
   (policy-change audit) — see Audits policy.
6. Humans stay on the gate: nothing auto-applies a policy change without a
   reviewable diff and human decision on significant changes.

## Policy-as-Code & Traceability

Rules should be enforceable, not just descriptive:
1. Every policy MUST be machine-checkable where possible (grader, commit
   signing, allowed_signers, file-permission matrices).
2. Every decision bears a reason string traceable to evidence, not vibes.
3. Audit trail: each run records what was done, which agent, which rule, and the
   outcome — so a reviewer can answer "did the agent comply?" by inspecting the
   record, not by guessing.
4. If a policy can't be checked automatically, it MUST have an audit step
   (reviewer) attached.

## Failure Journal & Lessons

1. Failure events are immutable facts: input, tool calls, error, version.
2. Diagnosis (root cause) is a *candidate until verified* — the failing agent
   does NOT auto-promote its own diagnosis to lesson.
3. A lesson only becomes reusable after reproduction, evidence, or human review
   (verified lessons only; weak candidates expire).
4. Write lessons to `research/evolution/lessons.json`; link them back to the
   source audit in `audits/`.

## Anti-Hallucination Ladder

- Tier 0: `[UNVERIFIED]` flag → agent knows it's guessing
- Tier 1: REVIEW MODE → reviewer cross-checks every claim
- Tier 2: human `Daleth` circuit-breaker → any message, any time
- Tier 3: REJECT verdict → never merged without human decision