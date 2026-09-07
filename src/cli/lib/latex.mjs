import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { run, log, ok, warn, err } from "./util.mjs";

const TINYTEX_DIR = join(homedir(), "AppData", "Roaming", "TinyTeX");
const TINYTEX_BIN = join(TINYTEX_DIR, "bin", "windows");
const TINYTEX_URL = "https://yihui.org/tinytex/TinyTeX-1.zip";
const TINYTEX_INSTALLER = "C:\\Users\\aland\\AppData\\Local\\Temp\\opencode\\TinyTeX-1.zip";

export function findPdfLaTeX() {
  // 1) Preferencia explícita TinyTeX (SCIRE-managed)
  const tiny = [join(TINYTEX_BIN, "pdflatex.exe"), join(TINYTEX_BIN, "xelatex.exe")]
    .find((p) => existsSync(p));
  if (tiny) return tiny;
  // 2) Cualquier TeX ya instalado en el sistema (MiKTeX, TeX Live, ...)
  const res = run("where.exe", ["pdflatex"], { silent: true, dontThrow: true });
  if (res.ok && res.stdout) return res.stdout.trim().split("\n")[0];
  return null;
}

export function tinytexInstalled() {
  return [join(TINYTEX_BIN, "pdflatex.exe"), join(TINYTEX_BIN, "xelatex.exe")]
    .some((p) => existsSync(p));
}

export function anyLatexInstalled() {
  return findPdfLaTeX() !== null;
}

export async function installTinyTeX() {
  if (tinytexInstalled()) {
    ok("TinyTeX (SCIRE-managed) ya instalado");
    return true;
  }
  if (anyLatexInstalled()) {
    warn("Ya hay un TeX en el sistema (pdflatex disponible). Se usará ese; TinyTeX solo si 'scire setup --tinytex'.");
    return true;
  }
  log("Descargando TinyTeX (≈150 MB) desde https://yihui.org/tinytex/ ...");
  run("powershell.exe", [
    "-NoProfile",
    "-Command",
    "Invoke-WebRequest -Uri " + TINYTEX_URL + " -OutFile " + TINYTEX_INSTALLER,
  ]);
  ok("Zip descargado");
  log("Extrayendo a " + TINYTEX_DIR + " ...");
  run("powershell.exe", [
    "-NoProfile",
    "-Command",
    "Expand-Archive -Path " + TINYTEX_INSTALLER + " -DestinationPath " + TINYTEX_DIR + " -Force",
  ]);
  if (!findPdfLaTeX()) {
    err("No se encontró pdflatex.exe tras extraer. Revisa TINYTEX_DIR=" + TINYTEX_DIR);
    return false;
  }
  ok("TinyTeX instalado en " + TINYTEX_DIR);
  return true;
}

export function compileTex(src, { outdir = process.cwd(), runTimes = 2 } = {}) {
  const latex = findPdfLaTeX();
  if (!latex) {
    err("No hay pdflatex. Ejecuta `scire setup` (instala LaTeX).");
    return null;
  }
  log("Compilando " + src + " (x" + runTimes + ") ...");
  for (let i = 0; i < runTimes; i++) {
    run(latex, ["-interaction=nonstopmode", "-halt-on-error", "-output-directory=" + outdir, src]);
  }
  const base = src.replace(/\.tex$/i, "");
  const pdf = join(outdir, base.replace(/.*[\\\/]/, "") + ".pdf");
  if (existsSync(pdf)) {
    ok("PDF generado: " + pdf);
    return pdf;
  }
  err("No se generó PDF (errores de LaTeX). Revisa el log.");
  return null;
}