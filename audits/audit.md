# SCIRE Audits — Index & Summary

Este archivo es el índice vivo de las auditorías de SCIRE. Se actualiza con cada
evento material (experimento, revisión, incidente, cambio de política). Cada
audit vive en su propio archivo con fecha ISO; este fichero solo resume y enlaza.

## Resumen ejecutivo (más relevante hasta la fecha)

- **2026-09-07 — UI redesign (búho) + Hermes scire-ui**: la mascota ASCII se
  reescribió de cero; las tres poses (watch/fly/seated) ahora son simétricas,
  legibles y siguen un mismo lenguaje visual (ojos amarillos, pico, percha/alas/
  cola según la pose), con paleta ANSI 24-bit fraccionada. Skill nueva de Hermes
  `research/scire-ui` + cron semanal `scire-ui-polish` (lun 08:00) para que el
  arte se siga mejorando.
- **2026-09-07 — Diseño + org + Daleth-al-humano**: CLI `scire` rediseñada
  (búho 3 poses + logo ASCII con color, bin global re-linkeado, arreglado
  DEP0190 en run()). Dos agentes nuevos con base sota (orchestrator:
  descompone y delega; evaluator: falsación adversarial / método de choque).
  Daleth ahora es la firma del HUMANO (sesión + memoria en
  `.opencode/memory/session.json`); configuración previa (OmniRoute/Hermes/MCP/
  LaTeX) se detecta y ADOPTA sin modificarse. 6 agentes registrados + claves
  SSH para los 2 nuevos. Hermes: skill scire-research actualizada + nueva skill
  scire-kaizen con cron diario (mejora continua de agentes).
- **2026-09-06 — Fundación del sistema**: se creó la infraestructura base del
  research org (4 agentes con llaves SSH propias, protocolo Daleth, firma de
  commits por agente, cron diario en Hermes, gateway OmniRoute). El humano solo
  firma `review:` commits. Los agentes firman sin correo (después de corregir un
  intento inicial con emails falsos).
- **2026-09-06 — Smoke test exp-hello**: primer experimento completo en
  `workspace/` (hello.py + result.json + grader). PASS, exit 0, accuracy 0.9 vs
  baseline 0.8 (+12.50%, margen 5%). La infra de experimentos funciona de
  extremo a extremo.
- **2026-09-06 — Infra fixes**: bug del grader (esquema `metric`/`value`),
  setup.js destructivo que exponía la API key en texto plano (nunca llegó a git)
  y frontmatter de agentes inválido (`tools`/`permissions` → `permission`).

## Índice de audits

| Fecha | Audit | Verdicto | Enlace |
|-------|-------|----------|--------|
| 2026-09-07 | ui redesign owl hermes | APPROVE | `./2026-09-07-ui-redesign-owl-hermes.md` |
| 2026-09-07 | design org agents daleth human | APPROVE | `./2026-09-07-design-org-agents-daleth-human.md` |
| 2026-09-07 | smoke test cli scire | (verdicto) | `./2026-09-07-smoke-test-cli-scire.md` |
| 2026-09-06 | infra fixes grader setup agents | (verdicto) | `./2026-09-06-infra-fixes-grader-setup-agents.md` |
| 2026-09-06 | foundation identity | (verdicto) | `./2026-09-06-foundation-identity.md` |
| 2026-09-06 | exp hello smoke test | (verdicto) | `./2026-09-06-exp-hello-smoke-test.md` |

## Cuestiones abiertas para decisión humana

- OmniRoute web-fetch sigue sin credenciales de provider (firecrawl/jina/tavily/
  tinyfish); los agentes lo evitan, pero una key desbloquearía la tool MCP.
- `scire-daily-research` y `scire-daily-kaizen` comparten la franja 09:00;
  confirmar que no haya contención cuando research corra trabajos largos.

## Reglas

1. Todo evento material gana un audit (archivo inmutable con fecha ISO).
2. Después de cada audit, esta tabla y el resumen deben actualizarse.
3. Nada se borra: los audits de fallo importan tanto como los de éxito.