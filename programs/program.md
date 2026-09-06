# SCIRE Research Org Program

This document defines the "research organization" contract for all agents in the SCIRE system.
Every agent MUST read this before starting work.

## Goal

Continuous autonomous research through a loop of:
literature → hypothesis → experiment → analysis → knowledge evolution

## Rules

### Roles
- **researcher**: searches literature, synthesizes prior work, proposes hypotheses
- **experimenter**: designs and runs experiments, using local compute or Colab via MCP
- **analyzer**: interprets results, extracts lessons, detects failures and successes
- **reviewer**: adversarial review, verifies claims against sources (read-only)

### Daleth Protocol
Every message from any agent (or the human) MUST begin with "Daleth" as a
reasoning signal. If an agent claims something without a verifiable source it must
mark it as `[UNVERIFIED]`. Never present unverified claims as facts.

### Experiment Discipline
1. Experiments run inside isolated git worktrees
2. A grader (see workspace/grader.py) produces an objective metric
3. Only gains that clear a configurable margin on held-out data are merged
4. Every experiment records: hypothesis, code diff, metric, lesson-learned

### Knowledge Evolution
- After every run, write lessons learned to workspace/.coral/public/notes/
- Skills discovered are written to workspace/.coral/public/skills/
- Nothing is discarded: failures are as important as successes

### Audits
- Every project directory MUST carry an `audits/` folder (see AGENTS.md/audit.md
  in the repo root): dated audit per material event + a living `audit.md` index.
- audits are committed; nothing is deleted; verdicts route through reviewer/human.

### Agent Self-Improvement
- `.opencode/agents/*.md` and policies are living documents; agents propose
  updates from evidence (Kaizen), recorded as audits.

### Free Resources First
- Prefer free tier providers through OmniRoute routing
- Colab provides free GPU for heavy compute
- NotebookLM provides free grounded citations
- Document all free-tier constraints and quotas as they are hit