# SCIRE

**S**elf-driven **C**omputational **I**nvestigation & **R**esearch **E**ngine

Sistema autónomo de investigación multi-agente. Los agentes investigan literatura,
diseñan hipótesis, ejecutan experimentos en notebooks (Colab local/free), y
aprenden de cada intento.

## Arquitectura

```
├── .opencode/
│   ├── agents/          # 6 agentes: orchestrator, researcher, experimenter, analyzer, evaluator, reviewer
│   ├── memory/          # Identidad/sesión del humano (local, no commitear)
│   └── opencode.json    # Config: OmniRoute, MCP (Colab + NotebookLM + OmniRoute)
├── programs/
│   └── program.md       # Contrato del "research org"
├── workspace/
│   ├── exp-*/           # Experimentos (run.py + result.json)
│   ├── seed/            # Código baseline para experimentos
│   └── grader.py        # Evaluación objetiva de experimentos
├── notebooks/           # Notebooks de investigación (Colab via MCP)
├── research/
│   ├── literature/      # Fuentes y referencias
│   ├── reports/         # Reportes y reviews
│   └── evolution/       # Lessons aprendidas (self-evolution)
├── audits/              # Audits inmutables + audit.md (índice vivo)
├── reports/             # Reportes LaTeX (.tex → .pdf)
└── src/
    ├── cli/             # CLI `scire` (búho, setup, status, ...)
    └── mcp/             # Configs MCP servers
```

## Requisitos

- **OmniRoute** (routing de 352+ providers, gratis): `https://github.com/diegosouzapw/OmniRoute`
- **OpenCode** (harness): `https://github.com/opencode-ai/opencode`
- Python 3.10+, `uv` (para Colab MCP), Node 18+ (para NotebookLM MCP)
- Hermes (opcional, orquestación remota): `https://github.com/NousResearch/hermes-agent`

## Configuración

```bash
npm install

# OmniRoute (API gateway)
npx omniroute@latest install   # o seguir docs del repo OmniRoute

# Verificar MCP servers
# Colab: abre un notebook en https://colab.research.google.com
# NotebookLM: npx notebooklm-mcp@latest setup_auth (login una vez)
```

## Uso

```bash
# Instalar la CLI globalmente (búho mascota)
npm install -g .
scire setup        # detecta y ADOPTA config previa (OmniRoute/Hermes/MCP); instala lo que falta

# Shell interactiva TUI (estilo opencode) — arranca con `scire` a secas en terminal
scire              # abre la shell interactiva si hay TTY (o `scire tui`)
```

### TUI — shell interactiva con visor de artefactos a tiempo real

La CLI tiene un modo REPL interactivo construido con **Ink 7 + React 19**. Una
vez dentro (con `scire` o `scire tui`):

```text
❯ /help                    # lista comandos
❯ /status                  # chequeo del sistema
❯ /orchestrate <objetivo>  # o texto libre (equivale a /orchestrate)
❯ /research <pregunta>     # researcher
❯ /evaluate <trabajo>      # evaluator (falsación adversarial)
❯ /experiment <diseño>     # experimenter
❯ /analyze <resultados>    # analyzer
❯ /review <trabajo>        # reviewer
❯ /audit                   # lista audits
❯ /audit new "<título>"    # crea audit
❯ /report new <tipo> [título]  # crea plantilla LaTeX
❯ /report compile <slug>   # compila LaTeX → PDF (y verás el PDF con /view)
❯ /view <archivo>          # visor de PDF/LaTeX/.ipynb/texto (Ctrl+V alterna panel)
```

- Salida de agentes **en vivo** (spoña el `opencode run` y muestra el streaming).
- Ctrl+C cancela el agente en curso (o sale si no hay agente).
- **Visor de PDF**: `pdftoppm` + `chafa` renderizan páginas como arte ANSI y
  `pdftotext` ofrece el texto legible — para ver reportes LaTeX compilados al
  momento. El visor también abre archivos `.tex`, notebooks `.ipynb` y texto.
- Comandos one-shot (`scire status`, `scire research ...`, etc.) siguen disponibles.

# Sesión e identidad (Daleth es la firma del humano)
scire session new "tu firma"       # abre sesión (pide tu nombre/firma la primera vez)
scire session                      # consulta la sesión activa

Ciclo de investigación (orquestado):
scire orchestrate "objetivo"        # orchestrator → descompone, delega y sintetiza
scire research "pregunta"          # researcher → brief + hipótesis con citas
scire experiment <exp> <métrica>   # experimenter → run.py + grader
scire analyze                      # analyzer → lecciones
scire evaluate                     # evaluator → método de choque (falsación adversarial)
scire review                       # reviewer → veredicto adversarial

# LaTeX: todos los reportes se escriben en .tex y se compilan a PDF
scire report new reporte|audit|paper "título"   # crea plantilla en reports/
scire report compile <slug>                      # compila a PDF (pdflatex/xelatex)

# Trabajo con el proyecto
scire audit new "título"          # nuevo audit (fecha ISO)
scire audit index                 # regenera el índice audits/audit.md
scire commit <identidad> -m "msg" # commit firmado (agentes sin correo, humano en reviews)

# Utilidades
scire status                      # chequeo del sistema (6 agentes, claves, LaTeX, OmniRoute)
```

La CLI detecta **cualquier** LaTeX del sistema (MiKTeX, TeX Live, ...); si no hay uno,
`scire setup` descarga TinyTeX (≈150 MB). Si quieres forzar TinyTeX: `scire setup --tinytex`.

## Protocolo Daleth

`AGENTS.md` define el protocolo obligatorio: todo mensaje empieza con **Daleth**,
las afirmaciones sin fuente se marcan `[UNVERIFIED]`, los commits los firma el
agente que los produce y **solo las revisiones las firma el humano**.

## Commit signing

Ver `AGENTS.md` — cada agente firma su trabajo con su identidad GPG/SSH;
las revisiones son las únicas firmadas por el humano.