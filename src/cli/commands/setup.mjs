import { existsSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { run, log, ok, warn, err, ask, scireDir } from "../lib/util.mjs";
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

// ── Detección de config previa: se ADOPTA, no se pisa ────────────────────
function detectExisting() {
  const found = [];
  const envKey = process.env.OMNIROUTE_API_KEY;
  const authJson = join(homedir(), ".config", "omniroute", "auth.json");

  if (has("omniroute")) found.push("OmniRoute: binario instalado");
  if (envKey) found.push("OmniRoute: OMNIROUTE_API_KEY definida como variable de entorno");
  else if (existsSync(authJson)) found.push("OmniRoute: auth en ~/.config/omniroute/auth.json");

  const hermesCfg = join(homedir(), "AppData", "Local", "hermes", "config.yaml");
  if (existsSync(hermesCfg)) found.push("Hermes: config detectada (" + hermesCfg + ")");

  const oo = join(scireDir(), ".opencode", "opencode.json");
  if (existsSync(oo)) found.push("opencode: config MCP ya existe (" + oo + ")");

  if (anyLatexInstalled() || tinytexInstalled()) found.push("LaTeX: compilador ya disponible en el sistema");

  return found;
}

async function installMissing({ forceTiny = false } = {}) {
  const missing = REQUIRED.filter((r) => !has(r.bin));
  for (const r of missing) {
    warn(binLabel(r.bin) + " no encontrado (" + r.why + ")");
  }

  // npm install del proyecto (solo si hay deps guardadas)
  if (existsSync(join(scireDir(), "package.json")) && existsSync(join(scireDir(), "node_modules"))) {
    log("npm deps ya instaladas; solo re-firma si falta algo (omito npm install).");
  } else if (existsSync(join(scireDir(), "package.json"))) {
    log("npm install (deps del proyecto)...");
    run("npm", ["install"]);
  }

  // opencode: se invoca vía npx si no está global.
  if (!has("opencode")) {
    ok("opencode no está en PATH; se invocará vía `npx opencode-ai` en la CLI.");
  }

  // uv (Python)
  if (!has("uv")) {
    const yes = await ask("Instalar uv (gestor de entornos Python)?");
    if (!yes) return;
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
    const yes = await ask("Instalar colab-mcp (herramienta uv)?");
    if (!yes) return;
    log("Instalando colab-mcp (herramienta uv)...");
    run("uv", ["tool", "install", "colab-mcp"], { silent: false });
  }

  // NotebookLM MCP se corre con npx on-demand; no precisa instalación global.
  ok("NotebookLM MCP se ejecuta vía `npx notebooklm-mcp@latest`.");

  // OmniRoute: solo si NO hay config previa (bin, env var o auth.json).
  if (!has("omniroute") && !process.env.OMNIROUTE_API_KEY) {
    const yes = await ask("Instalar OmniRoute global (no hay configuración previa detectada)?");
    if (yes) {
      log("Instalando OmniRoute global...");
      run("npx", ["-y", "omniroute@latest", "install"]);
    } else {
      warn("OmniRoute no instalado; los comandos que dependen del gateway fallarán.");
    }
  } else {
    ok("OmniRoute: se adopta la configuración existente (no se modifica).");
  }

  // LaTeX: detecta cualquiera en el sistema; TinyTeX solo con --tinytex.
  if (forceTiny) {
    await installTinyTeX(); // fuerza descarga TinyTeX-managed
  } else if (!tinytexInstalled() && !anyLatexInstalled()) {
    const yes = await ask("No hay compilador LaTeX. Descargar TinyTeX (~150MB)?");
    if (yes) await installTinyTeX();
    else warn("LaTeX no instalado; `scire report compile` no funcionará.");
  } else {
    warn("TeX ya disponible en el sistema; TinyTeX se omite (usa `scire setup --tinytex` para forzarlo).");
  }
}

export async function cmdSetup(args = []) {
  const forceTiny = args.includes("--tinytex");
  const yes = args.includes("--yes");
  log("scire setup — instalando lo que falta, adoptando lo que ya existe.");

  const existing = detectExisting();
  if (existing.length) {
    ok("Config previa detectada (se adopta, NO se modifica):");
    for (const e of existing) log("    - " + e, "\x1b[2m");
    if (!yes) {
      const proceed = await ask(
        "¿Continuar con el resto del setup respetando esa configuración previa?",
        { yesIsDefault: true },
      );
      if (!proceed) {
        warn("Setup cancelado; no se tocó nada.");
        return;
      }
    }
  } else {
    log("No se detectó configuración previa; setup desde cero.");
  }

  await installMissing({ forceTiny });
  ok("Setup completo. Revisa `scire status`.");
}

function binLabel(b) {
  const aliases = { node: "node", nota: "n/a" };
  return aliases[b] || b;
}