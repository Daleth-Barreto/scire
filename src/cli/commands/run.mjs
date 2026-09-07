import { run, log } from "../lib/util.mjs";

function opencodeAgent(agent, prompt) {
  const args = ["run", "--agent", agent];
  if (prompt) args.push(prompt);
  log("scire " + agent + ": delegando a opencode (Daleth).");
  run("opencode", args, { docker: false });
}

export function cmdResearch(prompt) {
  const p = prompt || "Daleth. Usa websearch/webfetch/notebooklm_mcp para investigar y proponer hipótesis falsificables con citas.";
  opencodeAgent("researcher", p);
}

export function cmdExperiment(prompt) {
  const p = prompt || "Daleth. Diseña y ejecuta el experimento asignado, documenta result.json y ejecuta el grader.";
  opencodeAgent("experimenter", p);
}

export function cmdAnalyze(prompt) {
  const p = prompt || "Daleth. Analiza los últimos resultados, extrae lecciones verificadas y actualiza lessons.json.";
  opencodeAgent("analyzer", p);
}

export function cmdReview(prompt) {
  const p = prompt || "Daleth - REVIEW MODE. Revisa adversarialmente el último trabajo contra las fuentes. Veredicto escrito.";
  opencodeAgent("reviewer", p);
}