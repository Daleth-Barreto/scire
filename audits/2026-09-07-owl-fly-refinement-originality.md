# Audit: 2026-09-07 — owl fly/logo refinement (pose consistency + originality)

## Facts

- **Trigger**: weekly `scire-ui` cron loop. Rendered all three poses; the `fly`
  pose (`(9v9) (_^((\ ^^^^`) barely read as an owl (odd eyes, wings as bare
  carets), and `seated` was nearly identical to `watch` (only the eye-direction
  differed), so the pose family lacked differentiation.
- **Refinement**: redrew the poses in `src/cli/owl.mjs` to share one visual
  grammar (head dome, wide-set yellow eyes, centered orange beak, gray plumage,
  dim shadow/perch) while remaining distinct:
  - `watch` = alert standing owl, open `o v o` eyes, folded wings
  - `fly` = airborne owl, ear tufts, spread/stroked wings and flicking tail
  - `seated` = resting owl, half-closed `o_o` eyes, rounder tucked body
- **Originality**: dropped the stray `jgs` (Joan Stark) signature from every
  line and rewrote the file header to state the art is original to SCIRE —
  this is our own arrangement, not a copied public-domain owl. `BEAK` (used
  as `o()`) now actually appears in the art instead of being a dead constant.
- **Verification**: rendered stripped-ANSI art for watch/fly/seated — each
  reads as an owl (head vs body, two level wide-set eyes, visible beak,
  pose-appropriate wings/perch, vertical symmetry, `<= 5` lines each well
  inside the 80-col budget). `node --check` passes. `scire status` (watch),
  `scire help`, `scire --help` all exit 0. ANSI 24-bit palette confirmed in
  raw output (eyes 255,214,10; beak 255,110,60; gray 150,165,180; dim
  95,110,125).

## Verdict

`APPROVE` — all three poses now share consistent visual language, the
previously-weak `fly` reads as a flying owl at a glance, `seated` is clearly
distinct from `watch`, and the art is now original to SCIRE (no false
attribution). Scope limited to `src/cli/owl.mjs` + this audit.

## Open issues

- Unicode accents in the owl (◉ ★) still avoided deliberately; plain ASCII
  keeps Windows-console rendering reliable. A font check is required before
  introducing any rare glyph.