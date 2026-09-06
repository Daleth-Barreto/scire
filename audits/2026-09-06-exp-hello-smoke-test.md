# Audit: Smoke test exp-hello (infra de experimentos)

- **Fecha**: 2026-09-06
- **Autor**: experimenter (scire-experimenter)
- **Tipo**: experimento / infraestructura

## Hechos

- Se creó `workspace/exp-hello/` con `hello.py` que imprime `scire-ok`.
- Se escribió `result.json` con los campos obligatorios: `metric=accuracy`,
  `value=0.9`, `baseline=0.8`, `hypothesis="smoke test"`,
  `lessons="infra works"`, `date=2026-09-06T16:54:04`.
- Ejecución: `python workspace/grader.py workspace/exp-hello accuracy
  --baseline 0.8 --higher-is-better` → `PASS: accuracy = 0.9 (baseline 0.8,
  rel. change +12.50%, needed >= +5.00%)`, exit code 0.
- La métrica `accuracy` se evaluó con `--higher-is-better` (semántica estándar
  de precisión: mayor es mejor).

## Verdicto

- OK. El pipeline mínimo (directorio de experimento + `result.json` + grader)
  funciona de extremo a extremo en `workspace/`. Grader exit 0.

## Notas / lecciones (pendientes de verificación por analyzer)

- La plantilla del grader exige `--baseline` y la dirección correcta de mejora
  (higher-is-better vs lower-is-better); invocar sin `--higher-is-better`
  habría dado FAIL (cambio relativo -12.50%). Candidato de lección para
  `research/evolution/lessons.json`: verificar semántica de métrica antes de
  correr el grader.