# Audit: 2026-09-10 — Kaizen agent-org review (round 3, evidence from efficacy-delta + signature drift)

**Fecha**: 2026-09-10
**Autor**: analyzer / kaizen cron
**Tipo**: política / mejora continua (PDCA)

## Fecha de referencia
Revisión viva de los 6 agentes (`.opencode/agents/*.md`) y `AGENTS.md` contra los
audits de 2026-09-08 (H6, kaizen round 2) y 2026-09-09 (efficacy-delta), más
verificación de firmas en vivo con `git verify-commit`. Método: lectura fresca +
shock (\"qué NO defiende cada definición\") + reproducción de los claims de firmas.

## Ediciones aplicadas (cambio estrecho, con evidencia)

### researcher.md — la definición NO defendía contra umbrales inventados
- **Evidencia**: 2026-09-08 H6 — los umbrales 80% / <2% / 0.7 fueron inventados sin
  base empírica y rechazados por el evaluator (H6-1/H6-2 CHALLENGE, `[UNVERIFIED]`);
  2026-09-09 efficacy-delta — ED-2/ED-3 tuvieron que marcar explícitamente las barras
  (95%, 1.5x) como \"experimental target\" para pasar la revisión. El patrón se repitió
  dos ciclos seguidos: un número en un brief tiende a leerse como hallazgo si no se
  etiqueta.
- **Cambio**: nueva bala en Anti-Hallucination Protocol: un umbral de cobertura/recall
  en un brief es (a) un valor citado con fuente, O (b) un *target experimental*
  pre-especificado con su instrumento; nunca un hallazgo por estar declarado. Evidencia
  citada en el propio archivo.

### reviewer.md — la definición NO defendía contra drift de identidad/tool naming
- **Evidencia (reproducida en vivo esta corrida)**: `git verify-commit c938d41`
  (reviewer kaizen) reporta *Good signature for* **`scire-analyzer`**, aunque el commit
  fue autorado como `scire_agent_reviewer`. De igual forma, commits autorados como
  `scire-researcher`/`scire-orchestrator` (c3fa735/b1f63c0) verifican también como
  `scire-analyzer`. Es decir: la identidad de *header* (`-c user.name`) es cosmética;
  **la clave actualmente anclada firma por `scire-analyzer`** sin importar qué nombre se
  ponga. Además, `scire-orchestrator` y `scire-evaluator` siguen sin estar anclados en
  `~/.ssh/scire_allowed_signers` (solo researcher/experimenter/analyzer/reviewer +
  humano) — confirmado `missing key` en b1f63c0 y ac688ee en esta corrida.
- **Cambio**: nueva Responsibility 5 \"Allowed-signers drift check\" (antes de APPROVE,
  reconciliar el principal reportado por `git verify-commit` con `allowed_signers`;
  el header no es prueba de identidad) + nueva bala en Verification Protocol con la
  misma regla. Evidencia citada en el propio archivo.

## Hallazgo de trazabilidad: las firmas NO verifican lo que dicen los nombres
Confirmado con `git verify-commit` sobre 3 commits de 3 agentes distintos: el principal
del trust anchor es **scire-analyzer** en los tres. Implicación para AGENTS.md y los
skills (scire-kaizen, scire-research): las identidades `scire-orchestrator`,
`scire-evaluator`, `scire_agent_reviewer` etc. usadas en mensajes de commit no son
verificables contra el anchor, porque **las claves que existen en `~/.ssh/scire_agent_*`
están firmando todo como `scire-analyzer`** (o están rotas). Es un gap de trazabilidad
de política-as-code: el \"did the agent comply by inspecting the record\" de AGENTS.md
no se puede responder en firma, solo en nombre (cosmético).

## Gap que NO se auto-aplica (gate humano — seguridad, archivo fuera del repo)
- **`~/.ssh/scire_allowed_signers` desactualizado / mal configurado (prioridad alta,
  REABIERTO)**. No solo faltan `scire-orchestrator` y `scire-evaluator` (ya flaggeado
  round 2, sin resolver): además el naming de las llaves (`scire_agent_*`) NO coincide
  con los principals que el repo espera (`scire-*` hiphen) ni con las identidades de
  AGENTS.md / scire-kaizen (`scire_agent_*` underscore). Es doble mismatch:
  1. `allowed_signers` tiene 4 principals con guion (researcher/experimenter/analyzer/
     reviewer); las llaves de orchestrator/evaluator ni siquiera están.
  2. `scire-kaizen` skill usa `scire_agent_orchestrator` (underscore) como firma, y
     AGENTS.md usa `scire-orchestrator` (guion) — ninguno coincide de forma verificable
     con la clave real (todas firman como `scire-analyzer`).
  Acción humana manual: revisar qué clave `scire_agent_*` corresponde a cada agente,
  añadir orchestrator/evaluator al anchor, y/o alinear el naming (guion vs underscore).
  **Requiere intervención humana** (archivo fuera del repo, seguridad).

## Sin cambios (ya correcto, sin regresión)
- tool-bias rule (never `omniroute_omniroute_web_fetch`) correcta en los 6 agentes.
- Reglas de kaizen round 1 y round 2 (no-invent-identity, declare-metric-direction,
  signature-check de reviewer).
- lessons.json verificado: 13 lecciones tras el ciclo efficacy-delta.

## Verdict
`APPROVE` (revisión de definición) — 2 ediciones estrechas (researcher.md,
reviewer.md) motivadas por evidencia reproducible; 0 cambio de política amplio;
1 gap humano reabierto con confirmación en vivo: `allowed_signers` desactualizado +
doble mismatch de naming de claves.