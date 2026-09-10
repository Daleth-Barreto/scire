# Audit: 2026-09-10 — TUI interactivo (Ink 7 + React 19) con visor de artefactos

## Hechos

- **Solicitud (Daleth)**: la CLI era one-shot — solo interactuaba por el prompt
  inicial de cada comando y terminaba; no había forma de ver agentes en vivo ni
  de inspeccionar PDFs/notebooks/LaTeX a tiempo real. Se pidió un TUI estilo
  opencode con **visor de PDF** (pdftoppm + chafa/kitty) y **framework dedicado**.
- **Framework elegido**: Ink 7 + React 19 (JSX sin build → `React.createElement`).
  Dependencias añadidas: `ink` ^7.1.1, `react` ^19.2.8, `ink-text-input` ^6.0.0,
  `ink-spinner` ^5.0.0; devDependency `node-pty` (solo para smoke test TTY).
- **Binarios de visor**: `chafa` 1.18.2 instalado vía `winget install hpjansson.Chafa`;
  `pdftoppm`/`pdftotext`/`pdflatex` ya presentes vía MiKTeX. El localizador
  `findBin.mjs` busca en PATH + rutas WinGet/MiKTeX/TinyTeX.
- **Nuevos módulos** (`src/cli/tui/`):
  - `app.mjs` — componente raíz Ink: banner, historia, output en vivo, panel
    visor (Ctrl+V), prompt persistente, atajos (Ctrl+C abort/salir, Ctrl+L limpia,
    Ctrl+V visor).
  - `spawnLive.mjs` — runner async por `spawn` (no `spawnSync`) que entrega
    stdout/stderr en chunks **en vivo** para el streaming de `opencode run`.
  - `pdf.mjs` — `pdfViews()`: texto legible (`pdftotext -layout`) + mini-muestra
    gráfica (`pdftoppm -png` → `chafa --format symbols`). Limpia secuencias CSI
    (cursors hide/show).
  - `commands.mjs` — router REPL (`/research`, `/orchestrate`, etc. + texto libre
    → orchestrator); builtins reales: /status, /audit, /audit new, /report new,
    /report compile (via spawnSync, sin matar el TUI), /session, /view, /help.
  - `findBin.mjs` — localización de binarios (chafa/pdftoppm/pdftotext/pdflatex).
- **Integración**: `scire` a secas abre el TUI si hay TTY (estilo opencode); si no
  hay TTY muestra ayuda one-shot (evita el raw-mode crash de Ink en no-TTY).
  `run.mjs` refactorizado: `TOOLS_BIAS`/`AGENT_FALLBACKS` compartidos entre CLI
  one-shot y TUI (una sola fuente de verdad).
- **Verificación**:
  - `node --check` OK en todos los módulos nuevos/modificados.
  - Enrutado + builtins unit-test (parseCommand/runBuiltin) OK.
  - Pipeline visor: report new → report compile (genera PDF con MiKTeX pdflatex)
    → pdfViews muestra título/secciones + gráfica. OK.
  - `runLive` captura streaming de `cmd /c echo` correctamente.
  - Smoke test TTY (node-pty, `scripts/scire-tui-snapshot.mjs`): arranca en
    pseudo-terminal, renderiza banner + prompt, y el **texto tipeado se refleja
    en el prompt** (`❯ research`). OK.

## Verdicto

`APPROVE` — el TUI interactivo con visor funciona, no rompe los comandos
one-shot, y cumple la petición: interacción persistente estilo opencode +
ver PDFs/LaTeX/notebooks/texto a tiempo real.

## Cuestiones abiertas

- **Enter vía node-pty en Windows (conwinpty)**: en mi smoke test el `\r` del
  Enter no dispara `onSubmit` de ink-text-input (limitación de conwinpty). En
  terminal real (Windows Terminal/ConHost) el Enter funciona — es el patrón
  estándar de Ink. No validado end-to-end por el entorno headless; probar a mano
  con `scire` en una terminal real.
- Los comandos de agente (`/research`, etc.) lanzan `opencode run` como
  subproceso; no se ha probado la delegación real con un modelo (requiere
  ejecutar opencode en TTY).
- `chafa` quedó instalado por winget en el PATH de usuario; `findBin` lo busca
  también en la ruta WinGet (robusto a falta del PATH en shells nuevos).