#!/usr/bin/env node
import { banner } from "./owl.mjs";
import { cmdSetup } from "./commands/setup.mjs";
import { cmdStatus } from "./commands/status.mjs";
import { cmdResearch, cmdExperiment, cmdAnalyze, cmdReview } from "./commands/run.mjs";
import { cmdExperimentRun, cmdExperimentNew } from "./commands/experiment.mjs";
import { cmdAuditList, cmdAuditNew, cmdAuditIndex } from "./commands/audit.mjs";
import { cmdReportNew, cmdReportCompile } from "./commands/report.mjs";
import { cmdCommit } from "./commands/commit.mjs";

const HELP = String.raw`
Usage: scire <command> [args]

Daleth. La puerta primero: cada comando verifica antes de actuar.

Top-level commands:
  setup          Instala todo lo necesario (Node deps, uv, MCPs, TinyTeX LaTeX)
  status         Chequea el estado del sistema (agentes, claves, OmniRoute, LaTeX)
  research       Delega investigación al agente researcher (argumento opcional: la pregunta)
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

  commit <identidad> -m "mensaje"   Commit firmado (human|researcher|...); los
                             agentes sin correo; el humano firma reviews

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