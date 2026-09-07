import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { log, ok, warn, err, scireDir } from "../lib/util.mjs";
import { compileTex } from "../lib/latex.mjs";

const TEMPLATES = {
  report: (title, author) => [
    "% SCIRE report template — compilado por `scire report`",
    "\\documentclass[11pt]{article}",
    "\\usepackage[utf8]{inputenc}",
    "\\usepackage[margin=2.5cm]{geometry}",
    "\\usepackage{hyperref}",
    '\\usepackage{amssymb,amsmath}',
    "\\title{" + (title || "Reporte SCIRE") + "}",
    "\\author{" + (author || "SCIRE Researcher") + "}",
    "\\date{\\today}",
    "\\begin{document}",
    "\\maketitle",
    "\\section{Objetivo}",
    "\\section{Método}",
    "\\section{Resultados}",
    "\\section{Discusión}",
    "\\section{Conclusiones}",
    "\\end{document}",
  ].join("\n") + "\n",

  audit: (title, author) => [
    "% SCIRE audit template",
    "\\documentclass[11pt]{article}",
    "\\usepackage[utf8]{inputenc}",
    "\\usepackage[margin=2.5cm]{geometry}",
    "\\usepackage{amssymb,amsmath}",
    "\\title{Audit: " + (title || "Sin título") + "}",
    "\\author{" + (author || "SCIRE") + "}",
    "\\date{\\today}",
    "\\begin{document}",
    "\\maketitle",
    "\\section{Hechos}",
    "\\section{Verdicto}",
    "\\section{Lecciones}",
    "\\end{document}",
  ].join("\n") + "\n",

  paper: (title, author) => [
    "% SCIRE paper template",
    "\\documentclass[11pt]{article}",
    "\\usepackage[utf8]{inputenc}",
    "\\usepackage[margin=2.5cm]{geometry}",
    "\\usepackage{hyperref}",
    "\\usepackage{amssymb,amsmath}",
    "\\usepackage{graphicx}",
    "\\title{" + (title || "Paper SCIRE") + "}",
    "\\author{" + (author || "SCIRE Research Org") + "}",
    "\\date{\\today}",
    "\\begin{document}",
    "\\maketitle",
    "\\begin{abstract}",
    "\\end{abstract}",
    "\\section{Introducción}",
    "\\section{Antecedentes}",
    "\\section{Métodos}",
    "\\section{Resultados}",
    "\\section{Discusión}",
    "\\section{Conclusiones y trabajo futuro}",
    "\\bibliographystyle{plain}",
    "\\bibliography{refs}",
    "\\end{document}",
  ].join("\n") + "\n",
};

export function cmdReportNew([kind], args) {
  if (!kind && !args[0]) {
    err("Uso: scire report new <reporte|audit|paper> [título]");
    process.exit(1);
  }
  const tpl = TEMPLATES[kind];
  if (!tpl) {
    err("Plantilla desconocida: " + kind + " (reporte | audit | paper)");
    process.exit(1);
  }
  const repo = scireDir();
  const reportsDir = join(repo, "reports");
  if (!existsSync(reportsDir)) mkdirSync(reportsDir, { recursive: true });
  const slug = (args[0] || kind + "-" + new Date().toISOString().slice(0, 10))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const fpath = join(reportsDir, slug + ".tex");
  if (existsSync(fpath)) {
    err("Ya existe " + fpath);
    process.exit(1);
  }
  writeFileSync(fpath, tpl(args[0] || kind, undefined));
  ok("Plantilla creada: " + fpath + ". Edítala y ejecuta `scire report compile " + slug + "`.");
}

export function cmdReportCompile([slugOrPath]) {
  if (!slugOrPath) {
    err("Uso: scire report compile <slug|path.tex>");
    process.exit(1);
  }
  const repo = scireDir();
  let src = slugOrPath.endsWith(".tex") ? slugOrPath : join(repo, "reports", slugOrPath + ".tex");
  if (!existsSync(src)) {
    const alt = join(repo, slugOrPath.endsWith(".tex") ? slugOrPath : slugOrPath + ".tex");
    if (existsSync(alt)) src = alt;
    else {
      err("No existe " + src);
      process.exit(1);
    }
  }
  log("Compilando " + src + " ...");
  compileTex(src, { outdir: dirname(src) });
}