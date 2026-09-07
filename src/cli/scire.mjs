#!/usr/bin/env node
import { banner } from "./owl.mjs";
import { cmdSetup } from "./commands/setup.mjs";
import { cmdStatus } from "./commands/status.mjs";
import {
  cmdResearch,
  cmdOrchestrate,
  cmdEvaluate,
  cmdExperiment,
  cmdAnalyze,
  cmdReview,
} from "./commands/run.mjs";
import { cmdExperimentRun, cmdExperimentNew } from "./commands/experiment.mjs";
import { cmdAuditList, cmdAuditNew, cmdAuditIndex } from "./commands/audit.mjs";
import { cmdReportNew, cmdReportCompile } from "./commands/report.mjs";
import { cmdCommit } from "./commands/commit.mjs";
import { createSession, loadSession } from "./lib/memory.mjs";

const HELP = String.raw`
Usage: scire <command> [args]

El protocolo Daleth rige al humano: cada sesión abre con tu firma.
Agentes verifican y citan; no fingen. Config previa se adopta, no se pisa.

Top-level commands:
  session        Abre/consulta la sesión (pide tu firma la primera vez)
  setup          Instala lo que falta; detecta y ADOPTA config previa (OmniRoute, Hermes, MCP) sin tocarla sin permiso
  status         Chequea el estado del sistema (agentes, claves, OmniRoute, LaTeX)
  research       Delega investigación al agente researcher (argumento opcional: la pregunta)
  orchestrate    Delega al agente orchestrator: descompone y coordina todo el ciclo
  evaluate       Delega al agente evaluator: método de choque (falsación adversarial)
  experiment     Delega un experimento al agente experimenter
  analyze        Delega análisis/lecciones al agente analyzer
  review         Delega revisión adversarial al agente reviewer

  audit          Lista los audits del proyecto (audits/)
  audit new "título"   Crea un audit nuevo con fecha ISO
  audit index          Regenera el índice audits/audit.md

  experiment new <nombre>    Crea workspace/exp-<nombre>/ con run.py + result.json
  experiment run <dir> <métrica> [--baseline 0.8] [--higher-is-better]
                             Ejecuta el grader sobre workspace/<dir>

  report new <reporte|audit|paper> [título]   Crea plantilla LaTeX en reports/
  report compile <slug>       Compila reports/<slug>.tex a PDF (requiere LaTeX)

  commit <identidad> -m "mensaje"   Commit firmado (human|orchestrator|researcher|experimenter|analyzer|evaluator|reviewer);
                             los agentes sin correo; el humano firma reviews

  help           Muestra esta ayuda
`;

const [cmd, ...args] = process.argv.slice(2);

switch (cmd) {
  case undefined:
  case "":
  case "help":
  case "--help":
  case "-h":
    banner();
    process.stdout.write(HELP);
    break;
  case "session":
    banner();
    if (args[0] === "new") {
      createSession(args[1]);
    } else {
      const s = loadSession();
      if (s) process.stdout.write("  Sesión activa: " + s.name + " (desde " + (s.openedAt || "?") + ")\n");
      else process.stdout.write("  No hay sesión. Usa `scire session new`.\n");
    }
    break;
  case "setup":
    banner();
    cmdSetup(args).catch((e) => {
      console.error(String(e).split("\n").slice(0, 3).join("\n"));
      process.exit(1);
    });
    break;
  case "status":
    banner();
    cmdStatus();
    break;
  case "research":
    banner();
    cmdResearch(args.join(" "));
    break;
  case "orchestrate":
    banner();
    cmdOrchestrate(args.join(" "));
    break;
  case "evaluate":
    banner();
    cmdEvaluate(args.join(" "));
    break;
  case "experiment":
    if (args[0] === "new") {
      banner();
      cmdExperimentNew(args.slice(1));
    } else if (args[0] === "run") {
      banner();
      const flags = parseFlags(args.slice(2));
      cmdExperimentRun(args.slice(1, 3), flags);
    } else {
      banner();
      cmdExperiment(args.join(" "));
    }
    break;
  case "analyze":
    banner();
    cmdAnalyze(args.join(" "));
    break;
  case "review":
    banner();
    cmdReview(args.join(" "));
    break;
  case "audit":
    banner();
    if (args[0] === "new") cmdAuditNew(args.slice(1));
    else if (args[0] === "index") cmdAuditIndex();
    else cmdAuditList();
    break;
  case "commit":
    banner();
    cmdCommit(args);
    break;
  case "report":
    banner();
    if (args[0] === "new") {
      const kind = args[1];
      const title = args.slice(2).join(" ");
      cmdReportNew([kind], title ? [title] : []);
    } else if (args[0] === "compile") cmdReportCompile(args.slice(1));
    else {
      process.stdout.write("Uso: scire report new|compile ...\n");
    }
    break;
  default:
    banner();
    console.error("Comando desconocido: " + cmd);
    process.stdout.write(HELP);
    process.exit(1);
}

function parseFlags(argv) {
  let baseline = null;
  let higherIsBetter = false;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--baseline") {
      baseline = parseFloat(argv[++i]);
    } else if (argv[i] === "--higher-is-better") {
      higherIsBetter = true;
    }
  }
  return { baseline, higherIsBetter };
}