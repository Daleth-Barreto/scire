import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";

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

export async function ask(question, { yesIsDefault = false } = {}) {
  const suffix = yesIsDefault ? " [Y/n] " : " [y/N] ";
  const rl = readline.createInterface({ input: stdin, output: stdout });
  try {
    const line = await rl.question(question + suffix);
    const a = line.trim().toLowerCase();
    if (a === "" ) return yesIsDefault;
    return a === "y" || a === "s" || a === "si";
  } finally {
    rl.close();
  }
}

export function loadJson(file) {
  if (!existsSync(file)) return null;
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

export function saveJson(file, data) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
}

export function resolveCmd(cmd) {
  if (process.platform !== "win32") return { file: cmd, needsShell: false };
  const lower = cmd.toLowerCase();
  if (cmd.includes("\\") || cmd.includes("/")) {
    return { file: cmd, needsShell: lower.endsWith(".cmd") || lower.endsWith(".bat") };
  }
  const res = spawnSync("where.exe", [cmd], { encoding: "utf8" });
  const hits = (res.stdout || "").trim().split(/\r?\n/).filter(Boolean);
  const cmdBat = hits.find((h) => /\.(cmd|bat)$/i.test(h));
  if (cmdBat) return { file: cmdBat, needsShell: true };
  return { file: cmd, needsShell: false };
}

function cmdQuote(s) {
  return '"' + String(s).replace(/"/g, '^"') + '"';
}

export function run(cmd, args, opts = {}) {
  const { file, needsShell } = resolveCmd(cmd);
  const stdio = opts.silent === true ? "pipe" : "inherit";
  let res;
  if (needsShell) {
    // cmd.exe /c sin shell:true → evita DEP0190
    const line = [file, ...args.map(cmdQuote)].join(" ");
    res = spawnSync(process.env.ComSpec || "cmd.exe", ["/d", "/s", "/c", line], {
      encoding: "utf8",
      stdio,
      cwd: opts.cwd || scireDir(),
      env: process.env,
      windowsVerbatimArguments: true,
    });
  } else {
    res = spawnSync(file, args, {
      encoding: "utf8",
      stdio,
      cwd: opts.cwd || scireDir(),
      env: process.env,
    });
  }
  if (opts.dontThrow) {
    return { ok: res.status === 0, status: res.status, stdout: res.stdout || "", stderr: res.stderr || "" };
  }
  if (res.status !== 0) {
    const msg = (res.stderr || "").trim() || (res.stdout || "").trim();
    throw new Error(`command failed: ${cmd} ${args.join(" ")}\n${msg}`);
  }
  return { ok: true, status: 0, stdout: res.stdout || "", stderr: res.stderr || "" };
}