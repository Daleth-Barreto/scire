import { join } from "node:path";
import { run, err, scireDir } from "../lib/util.mjs";

export function cmdCommit([identity, ...rest]) {
  const repo = scireDir();
  const ps1 = join(repo, "scripts", "scire-commit.ps1");
  const i = rest.indexOf("-m");
  const msg = i >= 0 ? rest.slice(i + 1).join(" ") : "commit via scire";
  const extra = i >= 0 ? rest.slice(0, i).filter((a) => a !== "-m") : rest.filter((a) => a.charAt(0) === "-");
  if (!identity) {
    err("Uso: scire commit <human|orchestrator|researcher|experimenter|analyzer|evaluator|reviewer> -m \"mensaje\"");
    process.exit(1);
  }
  const args = ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", ps1, "-Identity", identity, "-Message", msg];
  if (extra.length) args.push("-ExtraArgs", (extra.join(" ")));
  const res = run("powershell.exe", args, { dontThrow: true, silent: false });
  process.exit(res.status === 0 ? 0 : 1);
}