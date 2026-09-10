import { run, log, ok, warn } from "../lib/util.mjs";
import { openSession, assertHandlerMark } from "../lib/memory.mjs";

// Sesgo de herramientas SCIRE: primero las built-in del harness; los MCP
// solo si son necesarios. omniroute_omniroute_web_fetch requiere credenciales
// de provider (firecrawl/jina/tavily/tinyfish) que el clúster no siempre tiene.
export const TOOLS_BIAS =
  "Preferencia de herramientas: usa SIEMPRE las built-in (webfetch, websearch, read, glob, grep) " +
  "antes que los MCP; en particular NO uses omniroute_omniroute_web_fetch ni colab si el built-in `webfetch`/`websearch` sirve.";

export function workingPrompt(prompt, fallback) {
  const p = prompt || fallback;
  return p + "\n\n" + TOOLS_BIAS;
}

export const AGENT_FALLBACKS = {
  researcher:
    "Investiga la pregunta asignada con citas verificables: busca literatura, sintetiza el estado del arte y propone hipótesis falsificables.",
  orchestrator:
    "Actúa como orquestador: descompón el objetivo en subtareas, delega a researcher/experimenter/analyzer/evaluator/reviewer, y sintetiza el entregable final con trazabilidad.",
  evaluator:
    "Método de choque: intenta FALSAR el trabajo asignado (hipótesis, resultados o brief). Busca contra-evidencia, fracturas lógicas y artefactos que lo refuten. Veredicto: SUPPORT / CHALLENGE / REJECT con evidencia.",
  experimenter:
    "Diseña y ejecuta el experimento asignado, documenta result.json y ejecuta el grader.",
  analyzer:
    "Analiza los últimos resultados, extrae lecciones verificadas y actualiza lessons.json.",
  reviewer:
    "REVIEW MODE. Revisa adversarialmente el último trabajo contra las fuentes. Veredicto escrito.",
};

export function opencodeAgent(agent, prompt) {
  const args = ["run", "--agent", agent];
  if (prompt) args.push(prompt);
  log("scire " + agent + ": delegando a opencode.");
  run("opencode", args, { cwd: undefined });
  ok("scire " + agent + ": terminado.");
}

function assertSession(prompt) {
  const session = openSession();
  assertHandlerMark(prompt, session.name);
  return session;
}

export function cmdResearch(prompt) {
  const session = assertSession(prompt);
  opencodeAgent("researcher", workingPrompt(prompt, AGENT_FALLBACKS.researcher));
}

export function cmdOrchestrate(prompt) {
  const session = assertSession(prompt);
  opencodeAgent("orchestrator", workingPrompt(prompt, AGENT_FALLBACKS.orchestrator));
}

export function cmdEvaluate(prompt) {
  const session = assertSession(prompt);
  opencodeAgent("evaluator", workingPrompt(prompt, AGENT_FALLBACKS.evaluator));
}

export function cmdExperiment(prompt) {
  const session = assertSession(prompt);
  opencodeAgent("experimenter", workingPrompt(prompt, AGENT_FALLBACKS.experimenter));
}

export function cmdAnalyze(prompt) {
  const session = assertSession(prompt);
  opencodeAgent("analyzer", workingPrompt(prompt, AGENT_FALLBACKS.analyzer));
}

export function cmdReview(prompt) {
  const session = assertSession(prompt);
  opencodeAgent("reviewer", workingPrompt(prompt, AGENT_FALLBACKS.reviewer));
}