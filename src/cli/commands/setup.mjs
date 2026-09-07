import { existsSync } from "node:fs";
import { join } from "node:path";
import { run, log, ok, warn, err, scireDir } from "../lib/util.mjs";
import { installTinyTeX, tinytexInstalled, anyLatexInstalled } from "../lib/latex.mjs";

const REQUIRED = [
  { bin: "node", why: "runtime de la CLI y opencode" },
  { bin: "npm", why: "gestor de paquetes" },
  { bin: "git", why: "control de versiones firmado" },
  { bin: "uv", why: "gestor de entornos Python / colab-mcp" },
  { bin: "opencode", why: "harness de agentes" },
  { bin: "omniroute", why: "gateway de modelos (API local)" },
  { bin: "notebooklm-mcp", why: "MCP NotebookLM (citas fundamentadas)" },
];

function has(bin) {
  const res = run("where.exe", [bin], { silent: true, dontThrow: true });
  return res.ok;
}

async function installMissing({ forceTiny = false } = {}) {
  const missing = REQUIRED.filter((r) => !has(r.bin));
  for (const r of missing) {
    warn(binLabel(r.bin) + " no encontrado (" + r.why + ")");
  }

  // npm install del proyecto
  if (existsSync(join(scireDir(), "package.json"))) {
    log("npm install (deps del proyecto)...");
    run("npm", ["install"]);
  }

  // opencode (npm global nunca funciona bien: es per-user npx). Comprobamos.
  if (!has("opencode")) {
    // opencode se instala vía script oficial; si node/npm existe, usamos npx.
    ok("opencode no está en PATH; se invocará vía `npx opencode-ai` en la CLI.");
  }

  // uv (Python) - via el instalador oficial si hace falta
  if (!has("uv")) {
    log("Instalando uv...");
    run("powershell.exe", [
      "-NoProfile",
      "-ExecutionPolicy",
      "Bypass",
      "-Command",
      "irm https://astral.sh/uv/install.ps1 | iex",
    ]);
  }

  if (!has("colab-mcp")) {
    log("Instalando colab-mcp (herramienta uv)...");
    run("uv", ["tool", "install", "colab-mcp"], { silent: false });
  }

  // NotebookLM MCP se corre con npx on-demand; no precisa instalación global.
  ok("NotebookLM MCP se ejecuta vía `npx notebooklm-mcp@latest`.");

  // OmniRoute
  if (!has("omniroute")) {
    log("Instalando OmniRoute global...");
    run("npx", ["-y", "omniroute@latest", "install"]);
  }

  // LaTeX: detecta cualquiera en el sistema; TinyTeX si no hay o con --tinytex
  if (forceTiny) {
    await installTinyTeX(); // fuerza descarga TinyTeX-managed
  } else if (!tinytexInstalled() && !anyLatexInstalled()) {
    await installTinyTeX();
  } else {
    warn("TeX ya disponible en el sistema; TinyTeX se omite (usa `scire setup --tinytex` para forzarlo).");
  }
}

export async function cmdSetup(args = []) {
  const forceTiny = args.includes("--tinytex");
  log("scire setup — instalando todo lo necesario.");
  await installMissing({ forceTiny });
  ok("Setup completo. Revisa `scire status`.");
}

function binLabel(b) {
  const aliases = { node: "node", nota: "n/a" };
  return aliases[b] || b;
}