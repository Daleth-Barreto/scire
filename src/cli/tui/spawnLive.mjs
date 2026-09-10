// Runner asíncrono "líve" para el TUI: lanza un proceso y entrega su stdout/
// stderr por chunks en tiempo real (en lugar de spawnSync bloqueante que solo
// entrega el final). Útil para `opencode run --agent ...` y para compilación
// LaTeX cuyos logs se quieren ver en vivo mientras el agente trabaja.
import { spawn } from "node:child_process";

/**
 * Resuelve el comando a un ejecutable (misma lógica que util.run, pero async).
 * En Windows: busca .cmd/.bat vía where.exe, o usa la ruta tal cual.
 */
import { resolveCmd } from "../lib/util.mjs";

/**
 * Ejecuta un comando y entrega la salida en vivo.
 * @param {string} cmd
 * @param {string[]} args
 * @param {{
 *   cwd?: string,
 *   env?: object,
 *   signal?: AbortSignal,
 *   onStdout?: (chunk: string) => void,
 *   onStderr?: (chunk: string) => void,
 *   onExit?: (code: number|null, signal: string|null) => void,
 * }} opts
 * @returns {Promise<{ code: number|null, signal: string|null }>}
 */
export function runLive(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const { file, needsShell } = resolveCmd(cmd);
    const env = opts.env || process.env;

    let child;
    if (needsShell) {
      // cmd.exe /c sin shell:true → evita DEP0190
      const line = [file, ...args.map((a) => '"' + String(a).replace(/"/g, '^"') + '"')].join(" ");
      child = spawn(process.env.ComSpec || "cmd.exe", ["/d", "/s", "/c", line], {
        env,
        cwd: opts.cwd,
        windowsVerbatimArguments: true,
        stdio: ["ignore", "pipe", "pipe"],
      });
    } else {
      child = spawn(file, args, {
        env,
        cwd: opts.cwd,
        stdio: ["ignore", "pipe", "pipe"],
      });
    }

    if (opts.signal) {
      const onAbort = () => child && child.kill("SIGTERM");
      if (opts.signal.aborted) onAbort();
      else opts.signal.addEventListener("abort", onAbort, { once: true });
    }

    let outBuf = "";
    let errBuf = "";
    child.stdout.on("data", (b) => {
      outBuf += b.toString();
      if (opts.onStdout) opts.onStdout(b.toString());
    });
    child.stderr.on("data", (b) => {
      errBuf += b.toString();
      if (opts.onStderr) opts.onStderr(b.toString());
    });
    child.on("error", reject);
    child.on("close", (code, signal) => {
      if (opts.onExit) opts.onExit(code, signal);
      resolve({ code, signal, stdout: outBuf, stderr: errBuf });
    });
  });
}