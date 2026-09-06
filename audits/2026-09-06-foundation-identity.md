# Audit: Foundation & commit-signing identity

- **Fecha**: 2026-09-06
- **Autor**: reviewer (verify) / analyzer (lessons)
- **Tipo**: infraestructura / política

## Hechos

- Se inicializó el research org multi-agente en este repo.
- El humano produce `review:` commits firmados; los agentes firman su propio
  trabajo con sus llaves SSH (`scire_agent_*`), sin correo.
- Primer intento incluyó correos inventados (`*@scire.local`) en la identidad de
  los agentes; el humano los rechazó ("NO LES PONGAS CORREO"), se regeneraron
  las 4 llaves sin cifrar y sin email, y se reescribieron los commits.
- Firma verificable: `%G?` = `G`, auth `scire-researcher <>`, signer `scire-researcher`.

## Verdicto

- OK tras corrección. Identidad de agentes = solo nombre, sin email. El humano
  conserva su email real.
- Lección: los agentes NO inventan datos de identidad (ni correos) sin
  autorización humana; es un caso de claim no verificado/auto-inventado.

## Cambio de política resultante

- Policy-as-code: el helper `scripts/scire-commit.ps1` usa `user.email=` vacío
  para agentes y el email real solo para el humano.
- Este incidente quedó como lección en `research/evolution/lessons.json`.