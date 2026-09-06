import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createOmniRouteProvider } from "@omniroute/opencode-provider";

const __dirname = dirname(fileURLToPath(import.meta.url));
const configPath = join(__dirname, "..", ".opencode", "opencode.json");

const baseURL = process.env.OMNIROUTE_BASE_URL ?? "http://localhost:20128";
const apiKey = process.env.OMNIROUTE_API_KEY
  ? process.env.OMNIROUTE_API_KEY
  : "{env:OMNIROUTE_API_KEY}";

const provider = createOmniRouteProvider({
  baseURL,
  apiKey,
  models: ["auto", "claude-opus-4-7", "gpt-5.5", "gemini-3-pro", "qwen:free"],
  modelLabels: { auto: "Auto-Combo (fallback)" },
});

mkdirSync(dirname(configPath), { recursive: true });

let existing = {};
try {
  existing = JSON.parse(readFileSync(configPath, "utf8"));
} catch {
  existing = {};
}

const config = {
  ...existing,
  plugin: existing.plugin ?? ["@omniroute/opencode-plugin", "opencode-sessions"],
  provider: {
    ...(existing.provider ?? {}),
    omniroute: provider,
  },
  mcp: existing.mcp ?? {
    colab: {
      type: "stdio",
      command: "uvx",
      args: ["git+https://github.com/googlecolab/colab-mcp"],
      timeout: 30000,
    },
    notebooklm: {
      type: "stdio",
      command: "npx",
      args: ["notebooklm-mcp@latest"],
      timeout: 30000,
    },
    omniroute: {
      type: "stdio",
      command: "omniroute",
      args: ["--mcp"],
      timeout: 30000,
    },
  },
};

writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n");
console.log("Daleth. opencode.json escrita con provider OmniRoute (plugins/MCP preservados).");