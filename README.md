# SCIRE

**S**elf-driven **C**omputational **I**nvestigation & **R**esearch **E**ngine

Sistema autónomo de investigación multi-agente. Los agentes investigan literatura,
diseñan hipótesis, ejecutan experimentos en notebooks (Colab local/free), y
aprenden de cada intento.

## Arquitectura

```
├── .opencode/
│   ├── agents/          # 4 agentes: researcher, experimenter, analyzer, reviewer
│   └── opencode.json    # Config: OmniRoute, MCP (Colab + NotebookLM)
├── programs/
│   └── program.md       # Contrato del "research org"
├── workspace/
│   ├── seed/            # Código baseline para experimentos
│   └── grader.py        # Evaluación objetiva de experimentos
├── notebooks/           # Notebooks de investigación (Colab via MCP)
├── research/
│   ├── literature/      # Fuentes y referencias
│   ├── reports/         # Reportes y reviews
│   └── evolution/       # Lessons aprendidas (self-evolution)
└── src/mcp/             # Configs MCP servers
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
# Investigar un tema (researcher)
npm run research

# Utilizar notebooks:
#  - Colab MCP: crea celdas y ejecuta en tu notebook abierto
#  - NotebookLM: consulta con citas basadas en tu knowledge base
```

## Protocolo Daleth

`AGENTS.md` define el protocolo obligatorio: todo mensaje empieza con **Daleth**,
las afirmaciones sin fuente se marcan `[UNVERIFIED]`, los commits los firma el
agente que los produce y **solo las revisiones las firma el humano**.

## Commit signing

Ver `AGENTS.md` — cada agente firma su trabajo con su identidad GPG/SSH;
las revisiones son las únicas firmadas por el humano.