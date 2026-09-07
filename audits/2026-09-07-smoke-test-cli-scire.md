# Audit: Smoke test CLI scire

- **Fecha**: 2026-09-07
- **Autor**: analyzer (scire-analyzer)
- **Tipo**: infraestructura

## Hechos

- Se construyó la CLI `scire` (Node ESM, bin `scire`) con búho ASCII como
  mascota y subcomandos: setup, status, research, experiment, analyze, review,
  audit, report, commit.
- **LaTeX**: se detecta cualquier pdflatex del sistema (se encontró MiKTeX
  25.12); TinyTeX-managed solo si `scire setup --tinytex` (el usuario eligió
  TinyTeX, pero al existir MiKTeX no se fuerza la descarga de ~150MB —
  conflicto reportado, decisión: usar el TeX presente).
- Verificado end-to-end:
  - `scire status` → 12 checks verdes.
  - `scire report new audit "..."` + `scire report compile` → PDF generado
    correctamente con MiKTeX.
  - `scire experiment run exp-hello accuracy --baseline 0.8 --higher-is-better`
    → PASS (+12.50%).
  - `scire audit new` + `scire audit index` → índice actualizado (4 audits).
  - `scire setup` detecta deps presentes y omite descargas innecesarias.
- Bugs corregidos durante el build: `run()` no resolvía `.cmd` en Windows
  (npm ENOENT), check de OmniRoute daba falso negativo (401 con silent:false),
  y status marcaba "TinyTeX no instalado" pese a existir MiKTeX.

## Verdicto

- OK. La CLI es funcional de punta a punta; todo el ciclo (status, experiment
  con grader, audit index, report LaTeX) probado en vivo.

## Lecciones

- `[UNVERIFIED→VERIFIED]` En Windows, spawnSync no ejecuta `.cmd` sin
  `shell:true`; los bins npm/uvx de PATH exigen ese caso. Aprendido por
  reproducción (npm ENOENT).
- La preferencia del usuario (TinyTeX) debe honrarse pero con detección de
  alternativas ya instaladas: no descargar 150MB si hay pdflatex útil.