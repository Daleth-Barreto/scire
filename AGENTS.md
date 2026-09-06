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
| experimenter | bash, edit, write, colab mcp | notebooks, workspace, src |
| analyzer | read, edit, write | research/evolution, workspace/.coral/public |
| reviewer | read, grep, webfetch | research/reports/reviews only |

## Free-First Policy

SCIRE prefers free-tier resources in this order:
1. OmniRoute free providers (router manages fallback)
2. Google Colab free GPU via Colab MCP
3. NotebookLM free via notebooklm-mcp
4. Local compute (no cost)

Document quota hits as lessons. Never burn paid quota when a free tier exists.

## Anti-Hallucination Ladder

- Tier 0: `[UNVERIFIED]` flag → agent knows it's guessing
- Tier 1: REVIEW MODE → reviewer cross-checks every claim
- Tier 2: human `Daleth` circuit-breaker → any message, any time
- Tier 3: REJECT verdict → never merged without human decision