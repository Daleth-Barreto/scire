import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const REPO_ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))));

export function scireDir() {
  const env = process.env.SCIRE_DIR;
  if (env && existsSync(env)) return resolve(env);
  return REPO_ROOT;
}

export function findRepoRoot(start = process.cwd()) {
  let dir = resolve(start);
  for (;;) {
    if (existsSync(join(dir, "AGENTS.md"))) return dir;
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

export function log(msg, color = "\x1b[36m") {
  process.stdout.write(color + msg + "\x1b[0m\n");
}

export function ok(msg) {
  log("  \u2714 " + msg, "\x1b[32m");
}

export function warn(msg) {
  log("  \u26a0 " + msg, "\x1b[33m");
}

export function err(msg) {
  log("  \u2718 " + msg, "\x1b[31m");
}

export function resolveCmd(cmd) {
  if (process.platform !== "win32") return cmd;
  // En Windows, npm/uvx/etc. son .cmd y precisan el shell cmd.exe.
  // Devolvemos siempre el comando tal cual, y run() usará shell:true para
  // cualquier no-.exe, que es como funcionan los ejecutables de Windows.
  if (cmd.includes("\\") || cmd.includes("/")) {
    const lower = cmd.toLowerCase();
    return { file: cmd, needsShell: lower.endsWith(".cmd") || lower.endsWith(".bat") };
  }
  const res = spawnSync("where.exe", [cmd], { encoding: "utf8" });
  const hit = (res.stdout || "").trim().split(/\r?\n/)[0];
  if (hit && /\.(exe)$/i.test(hit)) {
    return { file: cmd, needsShell: false };
  }
  return { file: cmd, needsShell: true };
}

export function run(cmd, args, opts = {}) {
  const { file, needsShell } = resolveCmd(cmd);
  const res = spawnSync(file, args, {
    encoding: "utf8",
    stdio: opts.silent === true ? "pipe" : "inherit",
    cwd: opts.cwd || scireDir(),
    env: process.env,
    shell: needsShell === true,
  });
  if (opts.dontThrow) {
    return { ok: res.status === 0, status: res.status, stdout: res.stdout || "", stderr: res.stderr || "" };
  }
  if (res.status !== 0) {
    const msg = (res.stderr || "").trim() || (res.stdout || "").trim();
    throw new Error(`command failed: ${cmd} ${args.join(" ")}\n${msg}`);
  }
  return { ok: true, status: 0, stdout: res.stdout || "", stderr: res.stderr || "" };
}