# Audit: Infra fixes — grader schema bug & setup.js key leak

- **Fecha**: 2026-09-06
- **Autor**: analyzer (scire-analyzer)
- **Tipo**: infraestructura / seguridad

## Hechos

1. **grader.py bug**: `result.json` guarda la métrica en `metric` y el valor en
   `value`, pero el grader buscaba `result[<metric>]` como clave top-level → todo
   experimento devolvía ERROR (exit 2). Corregido: valida `result.metric == args.metric`
   y lee `result.value`. Verificado: PASS/FAIL/ERROR funcionan.
2. **setup.js key leak**: al ejecutarse, `node src/setup.js` reescribía
   `opencode.json` borrando plugins (opencode-plugin, opencode-sessions) y los 3
   MCPs, e inyectaba `OMNIROUTE_API_KEY` en texto plano dentro del archivo
   versionado. Ninguna key llegó a git (verificado con `git grep` en el historial).
   Corregido: setup preserva `plugin`/`mcp` existentes y usa `{env:OMNIROUTE_API_KEY}`.
3. **agent frontmatter inválido**: los 4 `.opencode/agents/*.md` usaban `tools:`
   como lista (deprecated, espera objeto) y `permissions:` (key correcta es
   `permission:`). OpenCode no cargaba la config. Corregido a formato `permission`.

## Verdicto

- OK tras corrección. Pipeline de experimentos funciona de punta a punta;
  opencode carga los 4 agentes; la API key queda fuera del repo.

## Lecciones (pendientes verificación)

- El setup no debe regenerar config de forma destructiva: merge, nunca overwrite.
- `[UNVERIFIED]` previo ya lo era: los agentes no asumen esquemas; validar contra
  docs del runtime antes de fijar formatos.