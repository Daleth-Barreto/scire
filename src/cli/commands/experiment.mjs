import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { run, log, ok, warn, err, scireDir } from "../lib/util.mjs";

export function cmdExperimentRun([dir, metric], { baseline, higherIsBetter }) {
  const repo = scireDir();
  const expDir = join(repo, "workspace", dir);
  if (!existsSync(expDir)) {
    err("No existe el experimento workspace/" + dir);
    process.exit(1);
  }
  if (!metric) {
    err("Necesitas la métrica: scire experiment run <dir> <metric> --baseline 0.8");
    process.exit(1);
  }
  const args = ["workspace/grader.py", "workspace/" + dir, metric];
  if (baseline != null) args.push("--baseline", String(baseline));
  if (higherIsBetter) args.push("--higher-is-better");
  log("Ejecutando grader...");
  const res = run("python.exe", args, { silent: false, dontThrow: true });
  process.exit(res.status === 0 ? 0 : 1);
}

export function cmdExperimentNew([name]) {
  if (!name) {
    err("Nombre del experimento requerido: scire experiment new <nombre>");
    process.exit(1);
  }
  const repo = scireDir();
  const expDir = join(repo, "workspace", "exp-" + name);
  if (existsSync(expDir)) {
    err("Ya existe " + expDir);
    process.exit(1);
  }
  mkdirSync(expDir, { recursive: true });
  writeFileSync(
    join(expDir, "result.json"),
    JSON.stringify(
      {
        metric: "accuracy",
        value: 0.0,
        baseline: 0.8,
        hypothesis: "Descríbela según el brief del researcher",
        lessons: "",
        date: new Date().toISOString().replace(/\.\d+Z$/, "Z"),
      },
      null,
      2,
    ) + "\n",
  );
  writeFileSync(
    join(expDir, "run.py"),
    '# Daleth. Experiment scaffold — implementa tu lógica.\n\nif __name__ == "__main__":\n    print("exp-' + name + ' no implementado")\n',
  );
  ok("Experiment workspace/exp-" + name + " creado (result.json + run.py). Edita y corre: scire experiment run " + name + " <metric> --baseline 0.8 --higher-is-better");
}