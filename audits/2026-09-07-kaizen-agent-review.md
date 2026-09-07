# Audit: 2026-09-07 — Kaizen review of agent org (evidence from audits)

- **Fecha**: 2026-09-07
- **Autor**: analyzer (scire-analyzer) — via scire-kaizen cron
- **Tipo**: política / mejora continua (PDCA)

## Context

Los 6 agentes (`.opencode/agents/*.md`) y `AGENTS.md` se revisaron en vivo
contra los 7 audits existentes en `audits/` para detectar fallos repetidos,
gaps de permiso, herramientas mal preferidas y hand-offs que evitarían
incidentes. Método: lectura fresca de definiciones + evaluación adversarial
(qué NO defiende cada definición).

## Ediciones aplicadas (cambio estrecho, con evidencia)

### 1. orchestrator.md — prohibición de inventar datos externos/de identidad
- **Evidencia**: `2026-09-06-foundation-identity.md` (correos falsos
  `*@scire.local` rechazados por el humano) y `2026-09-06-infra-fixes-...`
  (frontmatter `tools:`/`permissions:` inválido; formato de key API en claro).
- **Cambio**: en Anti-Hallucination Protocol, regla explícita: nunca inventar
  correos, usernames, esquemas de config, keys o formatos de tool; validar
  contra el runtime/docs y marcar `[UNVERIFIED]` si no.

### 2. experimenter.md — declarar dirección de métrica antes de gradear
- **Evidencia**: `2026-09-06-exp-hello-smoke-test.md` (near-miss: accuracy
  0.9 vs baseline 0.8 sin `--higher-is-better` lee -12.50% y daría FAIL).
- **Cambio**: en Experiment Discipline paso 5, exigir `--higher-is-better` /
  `--lower-is-better` y documentar el riesgo de invertir el veredicto.

### 3. analyzer.md — lessons.json debe existir y estar commiteado
- **Evidencia**: `foundation-identity` cita `research/evolution/lessons.json`,
  pero `find` confirma que el archivo NO existe en el repo.
- **Cambio**: en Responsibility 4, exigir que el archivo exista y se commitee;
  si falta mientras los audits lo citan, recrearlo/backfill.

## Sin cambios (ya correcto)

- **Tool-bias rule** (`omniroute_omniroute_web_fetch`): ya codificada en los 6
  agentes y AGENTS.md. Nada que tocar.

## Gaps detectados que NO se auto-aplican (gate humano)

1. **`~/.ssh/scire_allowed_signers` sin `scire-orchestrator` ni `scire-evaluator`**.
   Sus llaves se crearon el 2026-09-07, pero el trust anchor (allowed_signers)
   no las lista → `git verify-commit` de sus commits fallará. Es un archivo
   fuera del repo y de seguridad; se FLAGEA para `review:` humano, no se edita
   aquí.
2. **`research/evolution/lessons.json` ausente**: se asigna al analyzer
   re-crearlo/backfill en una corrida posterior (acción de escritura, se
   registra como cuestión abierta).

## Mantenimiento de auditoría

- `audit.md`: resumen ejecutivo actualizado + 4 filas con `(verdicto)` →
  `APPROVE` (todas las audits tenían veredicto APPROVE/OK en su archivo).

## Verdict

`APPROVE` — 3 ediciones estrechas de definiciones de agente, cada una
motivada por un audit específico (no vibes); 0 cambio de política amplio;
2 gaps humanos identificados e indexados para decisión.
