// Snapshot: arranca el TUI y escribe TEXTO (sin Enter, para validar reflejo del input
// y que render en vivo funciona). No depende de Enter (que conwinpty no mapea).
import { spawn } from "node-pty";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";

const exe = process.platform === "win32" ? "node.exe" : "node";
const repo = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pty = spawn(exe, [join(repo, "bin", "scire.mjs"), "tui"], {
  name: "xterm-256color", cols: 100, rows: 28, cwd: repo, env: Object.assign({}, process.env),
});

let all = "";
pty.onData((d) => { all += d; });
pty.onExit(({ exitCode }) => {
  console.log("[exit]", exitCode);
  const clean = all.replace(/\x1b\[[0-9;?]*[A-Za-z]/g, "").replace(/\x1b\][^\x07]*\x07/g, "");
  console.log(clean.slice(0, 1500));
  const hasBanner = clean.includes("✦ SCIRE");
  const hasTextEcho = clean.includes("research");
  process.exit(hasBanner ? 0 : 2);
});
// Tipea texto (sin enter): debería reflejarse en el prompt
setTimeout(() => pty.write("research"), 2000);
setTimeout(() => {
  pty.kill();
}, 5000);