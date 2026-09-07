# SCIRE

**S**elf-driven **C**omputational **I**nvestigation & **R**esearch **E**ngine

Sistema autónomo de investigación multi-agente. Los agentes investigan literatura,
diseñan hipótesis, ejecutan experimentos en notebooks (Colab local/free), y
aprenden de cada intento.

## Arquitectura

```
├── .opencode/
│   ├── agents/          # 4 agentes: researcher, experimenter, analyzer, reviewer
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
scire setup        # instala todo lo necesario (deps, uv, MCPs, LaTeX)

# Ciclo de investigación
scire research "pregunta"          # researcher → brief + hipótesis con citas
scire experiment <exp> <métrica>   # experimenter → run.py + grader
scire analyze                      # analyzer → lecciones
scire review                       # reviewer → veredicto adversarial

# LaTeX: todos los reportes se escriben en .tex y se compilan a PDF
scire report new reporte|audit|paper "título"   # crea plantilla en reports/
scire report compile <slug>                      # compila a PDF (pdflatex/xelatex)

# Trabajo con el proyecto
scire audit new "título"          # nuevo audit (fecha ISO)
scire audit index                 # regenera el índice audits/audit.md
scire commit <identidad> -m "msg" # commit firmado (agentes sin correo, humano en reviews)

# Utilidades
scire status                      # chequeo del sistema (agentes, claves, LaTeX, OmniRoute)
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