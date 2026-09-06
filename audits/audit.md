# SCIRE Audits — Index & Summary

Este archivo es el índice vivo de las auditorías de SCIRE. Se actualiza con cada
evento material (experimento, revisión, incidente, cambio de política). Cada
audit vive en su propio archivo con fecha ISO; este fichero solo resume y enlaza.

## Resumen ejecutivo (más relevante hasta la fecha)

- **2026-09-06 — Fundación del sistema**: se creó la infraestructura base del
  research org (4 agentes con llaves SSH propias, protocolo Daleth, firma de
  commits por agente, cron diario en Hermes, gateway OmniRoute). El humano solo
  firma `review:` commits. Los agentes firman sin correo (después de corregir un
  intento inicial con emails falsos).
- **2026-09-06 — Smoke test exp-hello**: primer experimento completo en
  `workspace/` (hello.py + result.json + grader). PASS, exit 0, accuracy 0.9 vs
  baseline 0.8 (+12.50%, margen 5%). La infra de experimentos funciona de
  extremo a extremo.

## Índice de audits

| Fecha | Audit | Verdicto | Enlace |
|-------|-------|----------|--------|
| 2026-09-06 | Foundation & commit-signing identity | OK (corregido a sin-email) | `./2026-09-06-foundation-identity.md` |
| 2026-09-06 | Smoke test exp-hello (infra de experimentos) | OK (grader exit 0) | `./2026-09-06-exp-hello-smoke-test.md` |

## Cuestiones abiertas para decisión humana

- Ninguna por ahora.

## Reglas

1. Todo evento material gana un audit (archivo inmutable con fecha ISO).
2. Después de cada audit, esta tabla y el resumen deben actualizarse.
3. Nada se borra: los audits de fallo importan tanto como los de éxito.