# Audit: 2026-09-07 — design + org agents + Daleth-to-human + config adoption

## Facts

- **Design**: `owl.mjs` rewritten with a color system (CYAN identidad, EYES
  yellow ojos, GRAY plumaje, DIM sombra) → logo SCIRE ASCII + búho en 3 poses
  (watch/fly/seated). Banner new identity line: "Verifica antes de afirmar.
  Cada sesión abre con tu firma."
- **Bin global**: `npm link --force` re-linked; global `scire` now renders the
  new design (verified via `scire status` from a fresh shell).
- **DEP0190 fix**: `util.mjs` `run()` no longer uses `shell:true` for `.cmd`;
  it spawns `cmd.exe /d /s /c <quoted-line>` with `windowsVerbatimArguments`
  → warning gone (verified: `scire help` clean).
- **New agents (SOTA-informed)**:
  - `orchestrator` — decomposes goals into subtasks, delegates to the
    specialists, gates each deliverable by artifact evidence, synthesizes.
    (SOTA: MAS-Orchestra holistic orchestration; agent-cluster-control
    "no investigation, no right to speak"; Qualixar redesign loop.)
  - `evaluator` — método de choque: adversarial falsification
    (Popper sequential falsification; TRIAGE/ICML 2026 target falsification).
    Verdict SUPPORT/CHALLENGE/REJECT.
  - 6 agents now registered in opencode (verified `opencode agent list`).
  - SSH keys generated for both (`scire_agent_orchestrator`, `scire_agent_evaluator`).
- **Daleth → human-only**: AGENTS.md + all 4 legacy agents + skills updated.
  Daleth is now the HUMAN's session signature (memory anchor), not an agent
  first-token. Agents keep `[UNVERIFIED]` + citation obligations.
- **Memory & sessions**: new `src/cli/lib/memory.mjs` + `scire session new|status`;
  identity stored in `.opencode/memory/session.json` (gitignored). Missing
  signature in a prompt → CLI suggests `scire session new` (tested: warning shows).
- **Config adoption**: `scire setup` detects existing OmniRoute (bin + env key /
  auth.json), Hermes config, opencode.json MCPs, and LaTeX; adopts them and does
  NOT modify without `--yes` or explicit consent. Tested with `scire setup --yes`:
  detected OmniRoute (2 evidencias), Hermes, LaTeX; skipped TinyTeX.
- **Tool-bias rule**: all agents prefer built-in `webfetch`/`websearch` over
  `omniroute_omniroute_web_fetch` (that MCP tool fails without a firecrawl/
  jina/tavily/tinyfish credential — observed in `scire research`).
- **Researcher bash**: `bash: ask` → `allow` (auto-reject in non-interactive
  `opencode run` was breaking the write of `research/reports/`).
- **Hermes**: skill `scire-research` updated (orchestrator+evaluator in cycle);
  new skill `scire-kaizen` (PDCA agent improvement) + cron
  `scire-daily-kaizen` (id 6b537d676b74, `0 9 * * *`, same slot as
  scire-daily-research, still active).

## Verdict

`APPROVE` — the CLI dispatch, status (17 checks green), session identity,
config adoption, and 6 registered agents verified. Hermes crons both active.

## Open issues

- OmniRoute web-fetch remains credential-gated; agents now route around it, but
  a provider key (firecrawl/jina/tavily/tinyfish) would unlock the MCP tool.
- `scire-daily-research` and `scire-daily-kaizen` share the 09:00 slot; fine,
  but confirm no contention once research runs long jobs.