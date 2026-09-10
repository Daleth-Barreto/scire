// Command router for the TUI REPL. Takes a raw prompt string typed by the
// human, parses the slash-command prefix, and routes to the right handler.
// Returns a { type, agent?, prompt?, artifact? } descriptor that the TUI
// app uses to spawn agents or display artefacts.
import { join } from "node:path";
import { existsSync, readdirSync, readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { scireDir } from "../lib/util.mjs";
import { findBin } from "./findBin.mjs";

const CMD_MAP = {
  "/research":    { type: "agent", agent: "researcher" },
  "/orchestrate": { type: "agent", agent: "orchestrator" },
  "/evaluate":    { type: "agent", agent: "evaluator" },
  "/experiment":  { type: "agent", agent: "experimenter" },
  "/analyze":     { type: "agent", agent: "analyzer" },
  "/review":      { type: "agent", agent: "reviewer" },
};

const BUILTIN = ["/status", "/audit", "/report", "/view", "/help", "/session", "/quit", "/exit"];

export function parseCommand(raw) {
  const text = (raw || "").trim();
  if (!text) return null;

  // slash commands
  const spaceIdx = text.indexOf(" ");
  const cmd = spaceIdx > 0 ? text.slice(0, spaceIdx) : text;
  const body = spaceIdx > 0 ? text.slice(spaceIdx + 1).trim() : "";

  if (CMD_MAP[cmd]) {
    return { type: "agent", agent: CMD_MAP[cmd].agent, prompt: body, raw: text };
  }

  if (cmd === "/status") {
    return { type: "builtin", action: "status", raw: text };
  }
  if (cmd === "/audit") {
    return { type: "builtin", action: "audit", sub: body, raw: text };
  }
  if (cmd === "/report") {
    return { type: "builtin", action: "report", sub: body, raw: text };
  }
  if (cmd === "/view") {
    return { type: "view", path: body, raw: text };
  }
  if (cmd === "/session") {
    return { type: "builtin", action: "session", sub: body, raw: text };
  }
  if (cmd === "/help") {
    return { type: "builtin", action: "help", raw: text };
  }
  if (cmd === "/quit" || cmd === "/exit") {
    return { type: "quit", raw: text };
  }

  // bare text → treat as agent prompt with orchestrator
  return { type: "agent", agent: "orchestrator", prompt: text, raw: text };
}

export function getHelpText() {
  return `
  Comandos de agente (delega a opencode):
    /research <pregunta>       → researcher
    /orchestrate <objetivo>    → orchestrator (default si escribes texto libre)
    /evaluate <trabajo>        → evaluator (falsación adversarial)
    /experiment <diseño>       → experimenter
    /analyze <resultados>      → analyzer
    /review <trabajo>          → reviewer (revisión adversarial)

  Comandos built-in:
    /status                    Chequeo del sistema
    /audit                     Lista audits
    /audit new <título>        Crea un audit
    /report new <tipo> [título]  Crea plantilla LaTeX
    /report compile <slug>     Compila LaTeX → PDF
    /view <archivo>            Visor de artefacto (PDF, .tex, .ipynb, .md)
    /session [new <nombre>]    Gestión de sesión
    /help                      Muestra esta ayuda
    /quit                      Salir

  Texto sin prefijo / = /orchestrate
`;
}

/** Ejecuta un comando built-in y devuelve output plano para mostrar en el panel */
export function runBuiltin(action, sub) {
  const repo = scireDir();
  switch (action) {
    case "help": return getHelpText();

    case "status": {
      const lines = [];
      const agents = ["orchestrator", "researcher", "experimenter", "analyzer", "evaluator", "reviewer"];
      for (const a of agents) {
        const f = join(repo, ".opencode", "agents", a + ".md");
        lines.push(existsSync(f) ? `  ✔ agente ${a}` : `  ✘ falta agente ${a}`);
      }
      const audits = join(repo, "audits");
      lines.push(existsSync(join(audits, "audit.md")) ? "  ✔ audits/audit.md" : "  ✘ falta audits/audit.md");
      return lines.join("\n");
    }

    case "audit": {
      const subSafe = sub || "";
      if (subSafe.startsWith("new ")) {
        return auditNewTui(subSafe.slice(4).trim());
      }
      const dir = join(repo, "audits");
      if (!existsSync(dir)) return "  No hay carpeta audits/.";
      const files = readdirSync(dir).filter((f) => f.endsWith(".md")).sort();
      return files.map((f) => "  • " + f).join("\n") || "  (vacío)";
    }

    case "report": {
      const subSafe = sub || "";
      if (subSafe.startsWith("compile ")) {
        return reportCompileTui(subSafe.slice(8).trim());
      }
      if (subSafe.startsWith("new ")) {
        return reportNewTui(subSafe.slice(4).trim());
      }
      return "  Uso: /report new <tipo> [título]  |  /report compile <slug>";
    }

    case "session": {
      try {
        const s = JSON.parse(readFileSync(join(repo, ".opencode", "memory", "session.json"), "utf8"));
        return `  Sesión activa: ${s.name} (desde ${s.openedAt || "?"})`;
      } catch {
        return "  No hay sesión. Usa `scire session new`.";
      }
    }

    default:
      return `  Acción desconocida: ${action}`;
  }
}

/** Detecta tipo de archivo para el visor */
export function detectFileType(filePath) {
  const ext = (filePath || "").split(".").pop().toLowerCase();
  return {
    pdf: ext === "pdf",
    tex: ext === "tex",
    ipynb: ext === "ipynb",
    md: ["md", "markdown"].includes(ext),
    json: ext === "json",
    py: ext === "py",
  };
}

/** Lee y renderiza un artefacto para el visor */
export function readArtifact(filePath) {
  if (!existsSync(filePath)) return `  Archivo no encontrado: ${filePath}`;
  const types = detectFileType(filePath);
  if (types.tex || types.md || types.py || types.json) {
    const content = readFileSync(filePath, "utf8");
    const lines = content.split(/\r?\n/);
    return lines.slice(0, 500).join("\n");
  }
  if (types.ipynb) {
    return renderNotebook(filePath);
  }
  if (types.pdf) {
    return "__PDF__:" + filePath;  // signaling marker for the app
  }
  return readFileSync(filePath, "utf8");
}

function renderNotebook(filePath) {
  const raw = JSON.parse(readFileSync(filePath, "utf8"));
  const cells = raw.cells || [];
  return cells.map((cell, i) => {
    const src = (cell.source || []).join("");
    const typ = cell.cell_type === "code" ? `[code ${i}]` : `[md ${i}]`;
    return typ + "\n" + src;
  }).join("\n\n");
}

const TEX_TPL = (docClass, body) =>
  `\\documentclass[11pt]{${docClass}}\n` +
  "\\usepackage[utf8]{inputenc}\n" +
  "\\usepackage[margin=2.5cm]{geometry}\n" +
  "\\usepackage{hyperref}\n" +
  "\\usepackage{amssymb,amsmath}\n" +
  body;

function auditNewTui(title) {
  if (!title) return "  Uso: /audit new \"<título>\"";
  const repo = scireDir();
  const dir = join(repo, "audits");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const date = new Date().toISOString().slice(0, 10);
  const fpath = join(dir, `${date}-${slug}.md`);
  if (existsSync(fpath)) return "  Ya existe " + fpath;
  writeFileSync(fpath, [
    "# Audit: " + title, "",
    "- **Fecha**: " + date,
    "- **Tipo**: (experimento | review | incidente | política)", "",
    "## Hechos", "",
    "- (input, acciones, errores, versión)", "",
    "## Verdicto", "",
    "- (OK / FAIL / por decidir)", "",
    "## Lecciones", "",
    "- (candidatas; no verificado sin reproducción)",
  ].join("\n") + "\n");
  return `  Audit creado: ${fpath}\n  Rellena hechos/verdicto y luego: /audit (ver índice)`;
}

function reportNewTui(args) {
  const [kind, ...titleRest] = (args || "").split(/\s+/).filter(Boolean);
  const title = titleRest.join(" ");
  if (!kind) return "  Uso: /report new <reporte|audit|paper> [título]";
  if (!["reporte", "audit", "paper"].includes(kind)) return `  Plantilla desconocida: ${kind} (reporte | audit | paper)`;
  const repo = scireDir();
  const dir = join(repo, "reports");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const slug = (title || `${kind}-${new Date().toISOString().slice(0, 10)}`)
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const fpath = join(dir, slug + ".tex");
  if (existsSync(fpath)) return "  Ya existe " + fpath;
  const t = title || `Reporte ${kind}`;
  let body;
  if (kind === "audit") {
    body = `\\title{Audit: ${t}}\n\\author{SCIRE}\n\\date{\\today}\n\\begin{document}\n\\maketitle\n\\section{Hechos}\n\\section{Verdicto}\n\\section{Lecciones}\n\\end{document}\n`;
  } else if (kind === "paper") {
    body = `\\title{${t}}\n\\author{SCIRE Research Org}\n\\date{\\today}\n\\begin{document}\n\\maketitle\n\\begin{abstract}\\end{abstract}\n\\section{Introducción}\n\\section{Antecedentes}\n\\section{Métodos}\n\\section{Resultados}\n\\section{Discusión}\n\\section{Conclusiones y trabajo futuro}\n\\end{document}\n`;
  } else {
    body = `\\title{${t}}\n\\author{SCIRE Researcher}\n\\date{\\today}\n\\begin{document}\n\\maketitle\n\\section{Objetivo}\n\\section{Método}\n\\section{Resultados}\n\\section{Discusión}\n\\section{Conclusiones}\n\\end{document}\n`;
  }
  writeFileSync(fpath, TEX_TPL(kind === "paper" ? "article" : "article", body));
  return `  Plantilla creada: ${fpath}\n  Edítala y usa: /report compile ${slug}`;
}

function reportCompileTui(slug) {
  const pdfBin = findBin("pdflatex");
  if (!pdfBin) return "  No hay pdflatex. Ejecuta: scire setup";
  const repo = scireDir();
  const src = slug.endsWith(".tex") ? slug : join(repo, "reports", slug + ".tex");
  if (!existsSync(src)) return "  No existe " + src;
  // spawnSync de child_process (importado arriba) — síncrono, no mata el TUI
  const outdir = slug.endsWith(".tex") ? "." : join(repo, "reports");
  let res;
  try {
    res = spawnSync(pdfBin, ["-interaction=nonstopmode", "-halt-on-error", "-output-directory=" + outdir, src], { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
  } catch (e) {
    return "  Error compilando: " + (e.message || e);
  }
  const base = src.replace(/\.tex$/i, "");
  const pdf = join(outdir === "." ? src.replace(/[\\/][^\\/]*$/, "") : outdir, base.split(/[\\/]/).pop() + ".pdf");
  const pdfExists = existsSync(pdf);
  const tail = (res.stderr || (res.stdout || "").split("\n").slice(-6).join("\n")).slice(-400);
  return pdfExists
    ? `  ✅ PDF generado: ${pdf}\n  Véelo con: /view ${pdf}`
    : `  ❌ No se generó PDF. Últimas líneas del log:\n${tail}`;
}
