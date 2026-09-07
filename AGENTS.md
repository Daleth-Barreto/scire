# SCIRE — Agent Protocol & Commit Rules

SCIRE is an autonomous research system. This document is the binding contract
for every agent AND every human who works in this repository.

## ⚡ Daleth Protocol (the HUMAN's session marker)

**Daleth is the human's signature**, not the agents'. Each human session opens
with the human's name/signature (e.g. "Daleth" or the name they gave in
`scire session new`). It is the door between sessions — and the memory anchor
of who is speaking.

**Rules**
1. The human opens sessions and messages with their signature. If the system
   detects the human no longer leads with it, it suggests opening a new session
   (`scire session new`). Memory belongs to sessions; a new session = a fresh
   door.
2. AGENTS NEVER impersonate the human's signature. Agents do NOT begin messages
   with "Daleth" to fake authority.
3. Every agent MUST ground its claims regardless of the protocol word:
   - When about to hallucinate, write `[UNVERIFIED]` next to the claim.
   - If a claim has a source, cite it inline `[^n]`.
   - If sources conflict, report the conflict. Never silently pick one.
4. The human's circuit-breaker still works: if the human types their signature
   and nothing else, every agent STOPS, re-reads its last output, and lists any
   unverified claims it made.

**Memory & sessions (improving general memory)**
- `scire session new` asks the human's name once and stores it in
  `.opencode/memory/session.json` (identity: name, marker, openedAt).
- A session is a memory unit: each session anchors who spoke and when. New
  goals should be explicit about whether they continue or replace prior work.
- Agents persist knowledge in `research/evolution/lessons.json`, `audits/`,
  and per-run artifacts. Memory is evidence, not vibes: nothing enters memory
  without a traceable source or artifact.
- Setup DETECTS and ADOPTS existing configuration (OmniRoute, Hermes, MCP,
  LaTeX) and does NOT modify it without explicit human authorization.

---

## Git Commit Signing Rules

Each agent has its own signing identity. The human only signs reviews.

### Agent identities
| Agent | Git identity | Signs what |
|-------|--------------|------------|
| orchestrator | `scire-orchestrator` | plans, synthesized deliverables |
| researcher | `scire-researcher` | research briefs, hypotheses, literature |
| experimenter | `scire-experimenter` | code, experiments, results |
| analyzer | `scire-analyzer` | lessons, insights, evolution |
| evaluator | `scire-evaluator` | verdicts, audits of refutations |
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

1. **human** gives a research goal (opens with their signature).
2. **orchestrator** → decomposes the goal, delegates each subtask to a
   specialist, and gates each deliverable by evidence.
3. **researcher** → produces brief + hypotheses with citations.
4. **experimenter** → creates worktree, runs experiment, grader decides.
5. **evaluator** → shock method: actively tries to FALSIFY hypotheses/results
   (Popper/TRIAGE-style). Verdict: SUPPORT/CHALLENGE/REJECT.
6. **analyzer** → extracts lessons, updates `research/evolution/lessons.json`.
7. **reviewer** → verifies every claim, checks citations, gives verdict.
8. **human** reviews final and signs with `Reviewed-by: <HUMAN>`.

The orchestrator may run steps 3–7 in any evidence-gated order, with a redesign
loop (max 3 retries) before escalating the blockage to the human.

## Roles & Tools Matrix

| Agent | Tools | Writes to |
|-------|-------|-----------|
| orchestrator | websearch, webfetch, read, task, bash | research/literature, research/reports, audits |
| researcher | websearch, webfetch, read, notebooklm, bash | research/literature, research/reports |
| experimenter | bash, edit, write, colab mcp | notebooks, workspace, src, audits of experiments |
| analyzer | read, edit, write | research/evolution, workspace/.coral/public, audits |
| evaluator | read, grep, webfetch, bash (read-only), task | research/reports, audits (verdicts) |
| reviewer | read, grep, webfetch | research/reports/reviews, audits (verdicts) |

**Tool-bias rule (applies to all agents):** prefer built-in `webfetch`/
`websearch` over MCP web tools; NEVER use `omniroute_omniroute_web_fetch`
unless a web-fetch provider credential is confirmed present.

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