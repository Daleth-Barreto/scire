import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { log, ok, warn, err, scireDir } from "../lib/util.mjs";

const AUDITS_DIR = "audits";

export function cmdAuditList() {
  const repo = scireDir();
  const dir = join(repo, AUDITS_DIR);
  if (!existsSync(dir)) {
    warn("No hay carpeta audits/. Crea un audit primero.");
    return;
  }
  log("Audits en " + AUDITS_DIR + "/ :");
  readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .sort()
    .forEach((f) => log("  • " + f, "\x1b[37m"));
}

export function cmdAuditNew([title]) {
  if (!title) {
    err("Título requerido: scire audit new \"<título>\"");
    process.exit(1);
  }
  const repo = scireDir();
  const dir = join(repo, AUDITS_DIR);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const date = new Date().toISOString().slice(0, 10);
  const fname = date + "-" + slug + ".md";
  const fpath = join(dir, fname);
  if (existsSync(fpath)) {
    err("Ya existe " + fpath);
    process.exit(1);
  }
  const content = [
    "# Audit: " + title,
    "",
    "- **Fecha**: " + date,
    "- **Tipo**: (experimento | review | incidente | política)",
    "",
    "## Hechos",
    "",
    "- (input, acciones, errores, versión)",
    "",
    "## Verdicto",
    "",
    "- (OK / FAIL / por decidir)",
    "",
    "## Lecciones",
    "",
    "- (candidatas; no verificado sin reproducción)",
  ].join("\n") + "\n";
  writeFileSync(fpath, content);
  ok("Audit creado: " + fpath + ". Rellena hechos y verdicto, luego `scire audit index`.");
}

export function cmdAuditIndex() {
  const repo = scireDir();
  const fpath = join(repo, AUDITS_DIR, "audit.md");
  if (!existsSync(fpath)) {
    warn("No existe audits/audit.md. Crea audits primero y luego `scire audit index`.");
    return;
  }
  const files = readdirSync(join(repo, AUDITS_DIR))
    .filter((f) => /^\d{4}-\d{2}-\d{2}-.+\.md$/.test(f))
    .sort()
    .reverse();
  const rows = files
    .map((f) => {
      const date = f.slice(0, 10);
      const title = f.slice(11).replace(/\.md$/, "").replace(/-/g, " ");
      return "| " + date + " | " + title + " | (verdicto) | `./" + f + "` |";
    })
    .join("\n");
  const table = [
    "## Índice de audits",
    "",
    "| Fecha | Audit | Verdicto | Enlace |",
    "|-------|-------|----------|--------|",
    rows,
    "",
  ].join("\n");
  const idx = readFileSync(fpath, "utf8");
  const updated = idx.includes("## Índice de audits")
    ? idx.replace(/## Índice de audits[\s\S]*?(?=\n## |$)/, table)
    : idx.replace(/\n?$/, "\n\n" + table);
  writeFileSync(fpath, updated);
  ok("Índice audit.md actualizado (" + files.length + " audits).");
}