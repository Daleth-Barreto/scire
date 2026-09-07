import { join } from "node:path";
import { ok, warn, log, loadJson, saveJson, scireDir } from "./util.mjs";

const MEM = ".opencode/memory/session.json";

export function sessionFile() {
  return join(scireDir(), MEM);
}

export function loadSession() {
  return loadJson(sessionFile());
}

export function saveSession(s) {
  saveJson(sessionFile(), s);
}

export function ensureIdentity() {
  const s = loadSession();
  if (s && s.name) return s;
  return createSession();
}

export function createSession(nameArg) {
  log("scire: no hay identidad de sesión aún.", "\x1b[36m");
  let name = (nameArg || "").trim();
  if (!name) {
    const answered = (awaitReadline("  ¿Cómo te llamas? (esa será tu firma en cada sesión): ") || "").toString().trim();
    name = answered || "humano";
  }
  const s = {
    name,
    marker: "Daleth",
    openedAt: new Date().toISOString(),
    version: 1,
  };
  saveSession(s);
  ok("Identidad guardada en " + sessionFile() + " como: " + name);
  return s;
}

export function openSession() {
  return ensureIdentity();
}

export function closeSession() {
  const s = loadSession();
  if (s) {
    s.closedAt = new Date().toISOString();
    s.version = (s.version || 1) + 1;
    saveSession(s);
  }
  warn("Sesión cerrada. La próxima vez empieza otra sesión con tu firma.");
}

export function isHandler(text, name) {
  if (!text) return false;
  const t = text.trim().toLowerCase();
  const who = (name || "daleth").toLowerCase();
  const first = t.split(/[\s,.;:¿?!]+/)[0];
  return t.startsWith(who) || first === who || first === "daleth";
}

export function assertHandlerMark(text, name) {
  if (!isHandler(text, name)) {
    warn(
      "No detecto tu firma (" + (name || "Daleth") + ") al inicio de tu petición. " +
        "Según el protocolo, cada sesión abre con tu firma. " +
        "Si ya no la dices, sugiere abrir otra sesión (`scire session new`).",
    );
    return false;
  }
  return true;
}

import { createInterface } from "node:readline/promises";
import { stdin as rlIn, stdout as rlOut } from "node:process";
function awaitReadline(q) {
  const rl = createInterface({ input: rlIn, output: rlOut });
  return rl.question(q).finally(() => rl.close());
}