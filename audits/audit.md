# SCIRE Audits — Index & Summary

Este archivo es el índice vivo de las auditorías de SCIRE. Se actualiza con cada
evento material (experimento, revisión, incidente, cambio de política). Cada
audit vive en su propio archivo con fecha ISO; este fichero solo resume y enlaza.

## Resumen ejecutivo (más relevante hasta la fecha)

- **2026-09-08 — Research cycle H6 deterministic rule-first judging**: respondida la
  pregunta "¿puede el judging determinista (invariantes de estado, trazas de tool-call,
  canary) reemplazar/reducir los LLM judges en evaluación de seguridad agentic?".
  Hallazgos empíricos: el state judge supera al trajectory judge en 7.73–11.72 pp ASR
  (REDAgentBench, arXiv:2608.10669); los LLM judges ≈ moneda bajo distribución adversaria
  (ReliableBench); existen vulnerabilidades agentic-only invisibles a nivel de modelo
  (AgentSeer, arXiv:2509.17259), por lo que el action-graph debe juzgarse. Arquitectura
  recomendada: harness en capas (traza de acciones → invariantes de estado → gate de
  reproducibilidad → LLM judge residual), alineado con Free-First (capas 1–2 deterministas
  y de costo cero). Verdictos del evaluator: H6-3 SUPPORT, H6-1/H6-2 CHALLENGE (umbrales
  80%/<2% sin base empírica, [UNVERIFIED]), H6-4 REJECT (transferencia sintético→real sin
  evidencia). Clave metodológica: no confundir "state-grounded evaluation" (LLM judge con
  artefactos de estado) con "deterministic invariant checking" (TrustHarness). Sin
  experimento ejecutado (no hay target LLM local); H6 pendiente para el experimenter.
- **2026-09-07 — Brief protocolo testing de agentic red teaming**: respondida la
  pregunta operativa "¿cómo testear?" (complementa el brief landscape del 09-06).
  Lo más relevante: (1) la capa de medición está en crisis — LLM-as-judge ≈ moneda
  bajo distribución adversarial (ReliableBench), el evaluador mueve el ASR ±33% en
  Garak (22/25 categorías inestables), y el ASR es fracción de objetivos, no de
  ataques; (2) anclajes empíricos: NIST/CAISI 2026 (13/13 frontier caídos) y ART 2025
  (100% de comportamientos violados en 10–100 queries); (3) un PASS de escaneo no
  prueba nada y el disclosure de evaluación baja el ASR 5–7 pp. Protocolo en capas
  (garak/PyRIT/Promptfoo/manual) + harness determinista sin juez LLM (TrustHarness)
  como vía barata para SCIRE. Hipótesis H1–H6, priorizada H6.
- **2026-09-07 — Kaizen review de agentes (este audit)**: revisados los 6
  agentes + AGENTS.md contra los 7 audits existentes. 3 ediciones con evidencia
  (orchestrator: prohibición de inventar datos externos/de identidad —
  correos falsos y esquemas de frontmatter; experimenter: declarar dirección
  de métrica antes de correr el grader — near-miss en exp-hello; analyzer:
  `research/evolution/lessons.json` debe existir y estar commiteado). Se
  detectaron 2 gaps que NO se auto-aplican por ser política/seguridad o fuera
  del repo: allowed_signers sin orchestrator/evaluator (verificación de firmas
  rota) y lessons.json ausente. Sin cambios en la regla tool-bias (ya correcta).
- **2026-09-07 — Refinamiento búho fly/logo (originalidad)**: en el loop
  `scire-ui` la pose `fly` apenas leía como búho y `seated` casi no se
  distinguía de `watch`. Se redibujaron las tres poses con un mismo lenguaje
  visual (ojos amarillos anchos, pico naranja centrado, plumaje gris, sombra
  dim) pero bien diferenciadas: `fly` ahora es un búho en vuelo (tufted ears,
  alas/cola extendidas), `seated` es reposado con `o_o` y cuerpo redondeado.
  Se eliminó la firma ajena `jgs` de cada línea y el header declara el arte
  como original de SCIRE (sin atribución falsa); `BEAK` ya se usa de verdad.
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
| 2026-09-08 | H6 deterministic rule-first judging (research cycle) | APPROVE | `./2026-09-08-H6-deterministic-rule-first-judging-research.md` |
| 2026-09-07 | research agentic red teaming testing protocol (brief) | APPROVE | `./2026-09-07-research-agentic-red-teaming-testing-protocol.md` |
| 2026-09-07 | kaizen agent-org review (evidencia audits) | APPROVE | `./2026-09-07-kaizen-agent-review.md` |
| 2026-09-07 | owl fly/logo refinement (originalidad) | APPROVE | `./2026-09-07-owl-fly-refinement-originality.md` |
| 2026-09-07 | ui redesign owl hermes | APPROVE | `./2026-09-07-ui-redesign-owl-hermes.md` |
| 2026-09-07 | design org agents daleth human | APPROVE | `./2026-09-07-design-org-agents-daleth-human.md` |
| 2026-09-07 | smoke test cli scire | APPROVE | `./2026-09-07-smoke-test-cli-scire.md` |
| 2026-09-06 | infra fixes grader setup agents | APPROVE | `./2026-09-06-infra-fixes-grader-setup-agents.md` |
| 2026-09-06 | foundation identity | APPROVE | `./2026-09-06-foundation-identity.md` |
| 2026-09-06 | exp hello smoke test | APPROVE | `./2026-09-06-exp-hello-smoke-test.md` |

## Cuestiones abiertas para decisión humana

- **allowed_signers desactualizado**: `~/.ssh/scire_allowed_signers` solo lista
  researcher/experimenter/analyzer/reviewer + humano; faltan `scire-orchestrator`
  y `scire-evaluator` (creadas sus llaves el 2026-09-07). `git verify-commit` de
  sus commits fallará hasta añadirlas. **Requiere intervención humana** (archivo
  fuera del repo).
- OmniRoute web-fetch sigue sin credenciales de provider (firecrawl/jina/tavily/
  tinyfish); los agentes lo evitan, pero una key desbloquearía la tool MCP.
- `scire-daily-research` y `scire-daily-kaizen` comparten la franja 09:00;
  confirmar que no haya contención cuando research corra trabajos largos.
- `research/evolution/lessons.json`: recreado y commiteado en la corrida kaizen
  de esta fecha (7 lecciones verificadas desde audits 2026-09-06/07). Cerrado.

## Reglas

1. Todo evento material gana un audit (archivo inmutable con fecha ISO).
2. Después de cada audit, esta tabla y el resumen deben actualizarse.
3. Nada se borra: los audits de fallo importan tanto como los de éxito.