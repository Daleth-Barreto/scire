# Audit: 2026-09-07 — UI redesign (owl mascot) + Hermes scire-ui skill

## Facts

- **Problem (user request)**: "mejora la ui, el ascii esta feote" — the old
  owl rendered as a jumble of brackets; indent per line varied, so columns
  didn't line up and it did not read as an owl.
- **Rewrite**: `src/cli/owl.mjs` poses rebuilt from scratch with a consistent
  visual language and a fractional ANSI 24-bit palette (CYAN = SCIRE identity,
  YELLOW = eyes, ORANGE = beak, GRAY = plumage, DIM = shadow). All lines now
  aligned to the same gutter so left/right edges are symmetric.
  - watch = alert owl standing on a perch, wide-set open eyes, centered beak
  - fly = owl frontal with spread wings and pointed tail
  - seated = resting owl with `(o o)` eyes and mofletudo cheeks
- **Verification**: rendered the stripped-ANSI art for watch/fly/seated via
  `node -e "import owl; banner({pose})"` and confirmed each reads as an owl
  (head distinct, two level eyes, visible beak, pose-matched wings/perch,
  vertical symmetry, <= 16 lines each). `node --check` passes; `scire status`
  (watch), `scire help` (seated) and the fly pose render without crash.
- **Hermes hand-off**: new skill
  `C:\Users\aland\AppData\Local\hermes\skills\research\scire-ui\SKILL.md` so
  Hermes keeps improving the art with a render-and-refine loop. Registered cron
  `scire-ui-polish` (id ec89b8477a9e, `0 8 * * 1` weekly) with workdir
  C:\Projects\scire. `scire-daily-research` and `scire-daily-kaizen` still
  active.

## Verdict

`APPROVE` — owl readable and symmetric in all three poses; CLI + global
`npm link` unaffected; Hermes skill + cron wired for ongoing polish.

## Open issues

- Unicode glyph choice: the design intentionally stays mostly ASCII
  (`() / \ _ - | o ~ '`) for Windows console reliability; if the user wants
  fancier glyphs (◉ ★), a font check on the target terminal is required first.