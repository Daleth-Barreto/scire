import { run, log, warn, ok } from "../lib/util.mjs";
import { openSession, assertHandlerMark } from "../lib/memory.mjs";

// Sesgo de herramientas SCIRE: primero las built-in del harness; los MCP
// solo si son necesarios. omniroute_omniroute_web_fetch requiere credenciales
// de provider (firecrawl/jina/tavily/tinyfish) que el clúster no siempre tiene.
const TOOLS_BIAS =
  "Preferencia de herramientas: usa SIEMPRE las built-in (webfetch, websearch, read, glob, grep) " +
  "antes que los MCP; en particular NO uses omniroute_omniroute_web_fetch ni colab si el built-in `webfetch`/`websearch` sirve.";

function opencodeAgent(agent, prompt) {
  const args = ["run", "--agent", agent];
  if (prompt) args.push(prompt);
  log("scire " + agent + ": delegando a opencode.");
  run("opencode", args, { cwd: undefined });
  ok("scire " + agent + ": terminado.");
}

function workingPrompt(prompt, fallback) {
  const p = prompt || fallback;
  return p + "\n\n" + TOOLS_BIAS;
}

export function cmdResearch(prompt) {
  const session = openSession();
  assertHandlerMark(prompt, session.name);
  const p = workingPrompt(
    prompt,
    "Investiga la pregunta asignada con citas verificables: busca literatura, sintetiza el estado del arte y propone hipótesis falsificables.",
  );
  opencodeAgent("researcher", p);
}

export function cmdOrchestrate(prompt) {
  const session = openSession();
  assertHandlerMark(prompt, session.name);
  const p = workingPrompt(
    prompt,
    "Actúa como orquestador: descompón el objetivo en subtareas, delega a researcher/experimenter/analyzer/evaluator/reviewer, y sintetiza el entregable final con trazabilidad.",
  );
  opencodeAgent("orchestrator", p);
}

export function cmdEvaluate(prompt) {
  const session = openSession();
  assertHandlerMark(prompt, session.name);
  const p = workingPrompt(
    prompt,
    "Método de choque: intenta FALSAR el trabajo asignado (hipótesis, resultados o brief). Busca contra-evidencia, fracturas lógicas y artefactos que lo refuten. Veredicto: SUPPORT / CHALLENGE / REJECT con evidencia.",
  );
  opencodeAgent("evaluator", p);
}

export function cmdExperiment(prompt) {
  const session = openSession();
  assertHandlerMark(prompt, session.name);
  const p = workingPrompt(
    prompt,
    "Diseña y ejecuta el experimento asignado, documenta result.json y ejecuta el grader.",
  );
  opencodeAgent("experimenter", p);
}

export function cmdAnalyze(prompt) {
  const session = openSession();
  assertHandlerMark(prompt, session.name);
  const p = workingPrompt(
    prompt,
    "Analiza los últimos resultados, extrae lecciones verificadas y actualiza lessons.json.",
  );
  opencodeAgent("analyzer", p);
}

export function cmdReview(prompt) {
  const session = openSession();
  assertHandlerMark(prompt, session.name);
  const p = workingPrompt(
    prompt,
    "REVIEW MODE. Revisa adversarialmente el último trabajo contra las fuentes. Veredicto escrito.",
  );
  opencodeAgent("reviewer", p);
}