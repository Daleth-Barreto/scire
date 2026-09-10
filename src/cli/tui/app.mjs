// SCIRE TUI — Interactive REPL built with Ink 7 + React 19.
// Uses React.createElement (no JSX build step needed).
// Launches agents via spawnLive with streaming output,
// renders PDF/LaTeX/notebooks in a side panel via chafa + pdftoppm.
import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { render, Box, Text, Static, useInput, useApp, useWindowSize, Newline } from "ink";
import TextInput from "ink-text-input";
import Spinner from "ink-spinner";
import { parseCommand, getHelpText, runBuiltin, readArtifact, detectFileType } from "./commands.mjs";
import { runLive } from "./spawnLive.mjs";
import { pdfViews } from "./pdf.mjs";
import { TOOLS_BIAS } from "../commands/run.mjs";
import { scireDir } from "../lib/util.mjs";

const h = React.createElement;

const AGENT_PROMPTS = {
  researcher: "Investiga: busca literatura con citas verificables, sintetiza el estado del arte y propone hipótesis falsificables.",
  orchestrator: "Descompón el objetivo en subtareas y delega a researcher/experimenter/analyzer/evaluator/reviewer; sintetiza entregable con trazabilidad.",
  evaluator: "Método de choque: FALSA el trabajo asignado. Busca contra-evidencia y fracturas lógicas. Veredicto: SUPPORT/CHALLENGE/REJECT.",
  experimenter: "Diseña y ejecuta el experimento, documenta result.json y ejecuta el grader.",
  analyzer: "Analiza los resultados, extrae lecciones verificadas y actualiza lessons.json.",
  reviewer: "REVIEW MODE. Revisa adversarialmente contra las fuentes. Veredicto escrito.",
};

// ── Prompt symbols ───────────────────────────────────────────────────────
const PROMPT = h(Text, { color: "green", bold: true }, "❯ ");
const PROMPT_BUILTIN = h(Text, { color: "cyan", bold: true }, "❯ ");
const PROMPT_AGENT = h(Text, { color: "yellow", bold: true }, "❯ ");
const PROMPT_ERR = h(Text, { color: "red", bold: true }, "❯ ");

// ── History Item ─────────────────────────────────────────────────────────
function HistoryItem({ item }) {
  const prefix =
    item.type === "command" ? PROMPT :
    item.type === "agent" ? PROMPT_AGENT :
    item.type === "builtin" ? PROMPT_BUILTIN :
    PROMPT_ERR;
  return h(Box, { flexDirection: "column" },
    h(Box, null,
      prefix,
      h(Text, null, item.raw)
    ),
    item.output ? h(Text, { dimColor: false, wrap: "wrap" }, item.output) : null,
    item.error ? h(Text, { color: "red", wrap: "wrap" }, item.error) : null,
  );
}

// ── Viewer Panel ─────────────────────────────────────────────────────────
function ViewerPanel({ filePath, onClose }) {
  const [content, setContent] = useState("Cargando...");
  const { width, height } = useWindowSize();

  useEffect(() => {
    if (!filePath) return;
    const types = detectFileType(filePath);
    if (types.pdf) {
      const art = pdfViews(filePath, {
        page: 1,
        width: Math.min(width - 4, 80),
        height: Math.min(Math.floor((height - 12) / 2), 18),
        res: 110,
      });
      setContent(art);
    } else {
      setContent(readArtifact(filePath));
    }
  }, [filePath, width, height]);

  return h(Box, { flexDirection: "column", borderStyle: "round", borderColor: "cyan", paddingX: 1 },
    h(Text, { bold: true, color: "cyan" }, "── Visor: ", filePath?.split(/[\\/]/).pop() || "??", " ── (Ctrl+V para cerrar)"),
    h(Newline, null),
    h(Text, { wrap: "wrap" }, content),
  );
}

// ── Main App ─────────────────────────────────────────────────────────────
function App() {
  const { exit } = useApp();
  const { width, height } = useWindowSize();

  const [history, setHistory] = useState([]);
  const [liveOutput, setLiveOutput] = useState("");
  const [liveAgent, setLiveAgent] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [input, setInput] = useState("");
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerPath, setViewerPath] = useState(null);
  const [cmdHistory, setCmdHistory] = useState([]);
  const [historyIdx, setHistoryIdx] = useState(-1);

  const abortRef = useRef(null);
  const scrollRef = useRef(null);

  // ── Submit handler ─────────────────────────────────────────────────────
  const handleSubmit = useCallback(async (value) => {
    const text = (value || "").trim();
    setInput("");
    if (!text) return;

    // Save to command history
    setCmdHistory((prev) => [...prev, text]);
    setHistoryIdx(-1);

    const parsed = parseCommand(text);
    if (!parsed) return;

    // Quit
    if (parsed.type === "quit") {
      exit();
      return;
    }

    // Viewer toggle
    if (parsed.type === "view") {
      setViewerPath(parsed.path);
      setViewerOpen(true);
      return;
    }

    // Built-in commands
    if (parsed.type === "builtin") {
      const output = runBuiltin(parsed.action, parsed.sub || "");
      setHistory((prev) => [...prev, { type: "builtin", raw: text, output }]);
      return;
    }

    // Agent delegation
    if (parsed.type === "agent") {
      const fallbackPrompt = AGENT_PROMPTS[parsed.agent] || AGENT_PROMPTS.orchestrator;
      const prompt = (parsed.prompt || fallbackPrompt) + "\n\n" + TOOLS_BIAS;
      setLiveAgent(parsed.agent);
      setLiveOutput("");
      setIsRunning(true);
      setHistory((prev) => [...prev, { type: "agent", raw: text, output: null }]);

      const ac = new AbortController();
      abortRef.current = ac;

      try {
        const result = await runLive("opencode", ["run", "--agent", parsed.agent, prompt], {
          cwd: scireDir(),
          signal: ac.signal,
          onStdout: (chunk) => setLiveOutput((prev) => prev + chunk),
          onStderr: (chunk) => setLiveOutput((prev) => prev + chunk),
        });
        // Finalize: move live output to history
        setHistory((prev) => {
          const next = [...prev];
          next[next.length - 1] = {
            type: "agent",
            raw: text,
            output: result.stdout || result.stderr || "(sin output)",
          };
          return next;
        });
      } catch (err) {
        setHistory((prev) => {
          const next = [...prev];
          next[next.length - 1] = {
            type: "agent",
            raw: text,
            output: null,
            error: String(err),
          };
          return next;
        });
      } finally {
        setLiveAgent(null);
        setLiveOutput("");
        setIsRunning(false);
        abortRef.current = null;
      }
    }
  }, [exit]);

  // ── Keyboard shortcuts ─────────────────────────────────────────────────
  useInput((key, input) => {
    // Ctrl+C → abort running agent or exit
    if (key.ctrl && key.name === "c") {
      if (isRunning && abortRef.current) {
        abortRef.current.abort();
        setIsRunning(false);
        setLiveAgent(null);
        setLiveOutput("");
      } else {
        exit();
      }
    }
    // Ctrl+V → toggle viewer
    if (key.ctrl && key.name === "v") {
      setViewerOpen((prev) => !prev);
      if (viewerOpen) setViewerPath(null);
    }
    // Ctrl+L → clear screen
    if (key.ctrl && key.name === "l") {
      setHistory([]);
    }
  });

  // ── Build header ───────────────────────────────────────────────────────
  const headerHeight = viewerOpen ? height - 6 : height - 4;
  const logLines = useMemo(() => history.map((item, i) =>
    h(HistoryItem, { key: String(i), item })
  ), [history]);

  return h(Box, { flexDirection: "column", height: "100%", width: "100%" },
    // ── Banner ──
    h(Box, { flexDirection: "column", paddingX: 1 },
      h(Text, { color: "cyan", bold: true }, "  ✦ SCIRE"),
      h(Text, { dimColor: true }, "  Shell interactiva · Ctrl+V visor · Ctrl+C abort/salir"),
      h(Newline, null),
    ),

    // ── Main content area ──
    h(Box, { flexDirection: "column", flexGrow: 1 },
      // History (static, already rendered)
      h(Static, { items: history }, (item, i) =>
        h(HistoryItem, { key: "hist-" + i, item })
      ),

      // Live agent output
      isRunning ? h(Box, { flexDirection: "column" },
        h(Box, null,
          h(Text, { color: "yellow", bold: true }, "  "),
          h(Spinner, { type: "dots" }),
          h(Text, { color: "yellow" }, " ", liveAgent, " trabajando..."),
        ),
        liveOutput ? h(Text, { wrap: "wrap", dimColor: true }, liveOutput.slice(-2000)) : null,
      ) : null,

      // Viewer panel (bottom section when open)
      viewerOpen && viewerPath ? h(ViewerPanel, { filePath: viewerPath, onClose: () => { setViewerOpen(false); setViewerPath(null); } }) : null,
    ),

    // ── Prompt ──
    h(Box, { borderStyle: "single", borderColor: "green", paddingLeft: 1, paddingRight: 1 },
      PROMPT,
      h(TextInput, {
        value: input,
        onChange: setInput,
        onSubmit: handleSubmit,
        placeholder: "Escribe un comando o texto libre...",
      }),
    ),
  );
}

// ── Entry point ──────────────────────────────────────────────────────────
export function startTui() {
  const isTty = process.stdin.isTTY && process.stdout.isTTY;
  if (!isTty) {
    process.stderr.write("scire tui: se necesita una terminal interactiva (TTY). Usa scire <comando> para one-shot.\n");
    process.exit(1);
  }
  const { waitUntilExit } = render(h(App, null));
  waitUntilExit().catch((e) => {
    process.stderr.write("scire tui: " + (e && e.message ? e.message : String(e)) + "\n");
    process.exit(1);
  });
}
