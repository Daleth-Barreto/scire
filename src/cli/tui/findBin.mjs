// Localiza binarios externos usados por el visor (chafa, pdftoppm, pdftotext,
// pdflatex) en Windows y resto de plataformas. Privilegia el PATH y luego rutas
// conocidas de instalación (WinGet, MiKTeX, TinyTeX).
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { resolveCmd, run } from "../lib/util.mjs";

const WINGET_PACKAGES = join(homedir(), "AppData", "Local", "Microsoft", "WinGet", "Packages");
const MIKTEX_BIN = join(homedir(), "AppData", "Local", "Programs", "MiKTeX", "miktex", "bin", "x64");
const TINYTEX_BIN = join(homedir(), "AppData", "Roaming", "TinyTeX", "bin", "windows");

const CANDIDATES = {
  chafa: [
    "chafa.exe",
    join(WINGET_PACKAGES, "hpjansson.Chafa_Microsoft.Winget.Source_8wekyb3d8bbwe", "chafa-1.18.2-1-x86_64-win", "Chafa.exe"),
    join(WINGET_PACKAGES, "hpjansson.Chafa_Microsoft.Winget.Source_8wekyb3d8bbwe", "chafa-1.18.2-1-x86_64-win", "chafa.exe"),
  ],
  pdftoppm: [join(MIKTEX_BIN, "pdftoppm.exe")],
  pdftotext: [join(MIKTEX_BIN, "pdftotext.exe")],
  pdflatex: [join(MIKTEX_BIN, "pdflatex.exe"), join(TINYTEX_BIN, "pdflatex.exe")],
};

export function findBin(name) {
  if (process.platform !== "win32") {
    const { file } = resolveCmd(name);
    return file;
  }
  for (const p of CANDIDATES[name] || []) {
    if (existsSync(p)) return p;
  }
  // PATH lookup
  const res = run("where.exe", [name], { silent: true, dontThrow: true });
  if (res.ok && res.stdout) return res.stdout.trim().split(/\r?\n/)[0];
  return null;
}

export function chafaAvailable() {
  return findBin("chafa") !== null;
}

export function pdfToolsAvailable() {
  return findBin("pdftoppm") !== null && findBin("pdftotext") !== null;
}

export function latexAvailable() {
  return findBin("pdflatex") !== null;
}