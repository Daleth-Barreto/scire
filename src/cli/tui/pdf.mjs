// Visor de PDF a tiempo real: `pdftoppm` rasteriza el PDF a PNG de baja
// resolución y `chafa` lo convierte a bloques ANSI (symbols/blocks) para
// mostrarlo en la terminal. Fallback a texto si falta chafa (pdftotext).
// Flujo:  pdf -> pdftoppm -png -r <res> page-%d.png
//             -> chafa --format symbols --colors 256 --size WxH page-N.png
import { existsSync, mkdirSync, readdirSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { findBin } from "./findBin.mjs";

export function pdfText(pdfPath, maxLines = 400) {
  const bin = findBin("pdftotext");
  if (!bin) return "[UNVERIFIED] No hay pdftotext (instala MiKTeX/TinyTeX).";
  const res = spawnSync(bin, ["-layout", "-nopgbrk", pdfPath, "-"], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const txt = (res.stdout || "").trim();
  if (!txt) return "(PDF sin texto, o página es imagen).";
  const lines = txt.split(/\r?\n/);
  return lines.slice(0, maxLines).join("\n") + (lines.length > maxLines ? `\n… (${lines.length - maxLines} líneas más)` : "");
}

/**
 * Renderiza la página 1 (o la deseada) de un PDF a arte ANSI para el TUI.
 * @param {string} pdfPath ruta absoluta al PDF
 * @param {{ page?: number, width?: number, height?: number, res?: number, cacheDir?: string }} opts
 * @returns {string} arte ANSI (o mensaje de error/fallback)
 */
export function pdfToAnsi(pdfPath, { page = 1, width = 60, height = 24, res = 80, cacheDir } = {}) {
  const chafaBin = findBin("chafa");
  const ppBin = findBin("pdftoppm");
  if (!ppBin) return pdfText(pdfPath);
  if (!chafaBin) {
    // Fallback sin chafa: solo texto
    return pdfText(pdfPath);
  }

  // Rasteriza la página
  const dir = cacheDir || join(tmpdir(), "scire-pdf-cache");
  mkdirSync(dir, { recursive: true });
  const base = join(dir, "pg");
  _cleanDir(dir);
  const pngPath = join(dir, `pg-${page}.png`);
  const res1 = spawnSync(ppBin, ["-png", "-r", String(res), "-f", String(page), "-l", String(page), pdfPath, base], {
    encoding: "utf8",
  });
  if (res1.status !== 0 || !existsSync(pngPath)) {
    return pdfText(pdfPath) || "[UNVERIFIED] No se pudo rasterizar el PDF.";
  }
  const art = spawnSync(chafaBin, ["--format", "symbols", "--colors", "256", "--size", `${width}x${height}`, pngPath], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  if (art.status !== 0) return pdfText(pdfPath);
  const out = (art.stdout || "")
    .replace(/\x1b\[\?[0-9]+[hl]/g, "")
    .replace(/\x1b\[\??[0-9;]*[a-zA-Z]/g, "")
    .trimEnd();
  return out.trimEnd();
}

/**
 * Vista combinada: texto legible (pdftotext) + mini-muestra gráfica (chafa).
 * @returns {string}
 */
export function pdfViews(pdfPath, { maxTextLines = 200, page = 1, width = 60, height = 14, res = 110, cacheDir } = {}) {
  const txt = pdfText(pdfPath, maxTextLines);
  const art = findBin("chafa") && findBin("pdftoppm")
    ? pdfToAnsi(pdfPath, { page, width, height, res, cacheDir })
    : null;
  const name = pdfPath.split(/[\\\/]/).pop();
  const parts = [`─ PDF ${name} · vista de texto ─`, txt];
  if (art) {
    parts.push("", "", `─ PDF ${name} · vista gráfica (página ${page}) ─`, art);
  }
  return parts.join("\n");
}

function _cleanDir(dir) {
  try {
    for (const f of readdirSync(dir)) {
      if (f.startsWith("pg-")) {
        unlinkSync(join(dir, f));
      }
    }
  } catch {
    /* ignore */
  }
}