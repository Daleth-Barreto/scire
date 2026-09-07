import { existsSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { run, log, ok, warn, err, scireDir } from "../lib/util.mjs";
import { tinytexInstalled, anyLatexInstalled } from "../lib/latex.mjs";

const AGENTS = ["orchestrator", "researcher", "experimenter", "analyzer", "evaluator", "reviewer"];

function apiUp() {
  const res = run("curl.exe", ["-s", "-o", "NUL", "-w", "%{http_code}", "http://localhost:20128/v1/models"], { silent: true, dontThrow: true });
  const code = (res.stdout || "").trim();
  return code.length > 0 && code !== "000";
}

export function cmdStatus() {
  log("scire status — chequeo del sistema");
  const repo = scireDir();

  const agents = AGENTS.map((a) => join(repo, ".opencode", "agents", a + ".md"));
  for (const f of agents) {
    existsSync(f) ? ok("agente " + f.split(/[\\\/]/).pop().replace(".md", "")) : err("falta " + f);
  }

  const keys = AGENTS.map((a) => join(homedir(), ".ssh", "scire_agent_" + a));
  for (const k of keys) {
    existsSync(k + ".pub")
      ? ok("clave SSH " + k.split(/[\\\/]/).pop() + " presente")
      : err("clave SSH faltante: " + k);
  }

  apiUp()
    ? ok("OmniRoute en localhost:20128 responde")
    : warn("OmniRoute parece caído (localhost:20128)");

  existsSync(join(repo, ".opencode", "opencode.json"))
    ? ok("config opencode.json presente")
    : err("falta .opencode/opencode.json");

  existsSync(join(repo, "workspace", "grader.py"))
    ? ok("grader.py presente")
    : err("falta workspace/grader.py");

  tinytexInstalled() || anyLatexInstalled()
    ? ok("LaTeX disponible (pdflatex" + (tinytexInstalled() ? " TinyTeX" : " sistema") + ")")
    : warn("No hay LaTeX — ejecuta `scire setup`");

  const audits = join(repo, "audits");
  existsSync(join(audits, "audit.md"))
    ? ok("audits/audit.md índice presente")
    : warn("falta audits/audit.md");

  log("");
  log("Consejo: `scire setup` instala lo que falta. `scire research \"pregunta\"` arranca el ciclo.");
}