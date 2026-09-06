import { writeFileSync, mkdirSync } from "node:fs";
import { createOmniRouteProvider } from "@omniroute/opencode-provider";

const provider = createOmniRouteProvider({
  baseURL: "http://localhost:20128",
  apiKey: process.env.OMNIROUTE_API_KEY ?? "sk_omniroute",
  models: ["auto", "claude-opus-4-7", "gpt-5.5", "gemini-3-pro", "qwen:free"],
  modelLabels: { auto: "Auto-Combo (fallback)" },
});

mkdirSync(".opencode", { recursive: true });
const config = {
  $schema: "https://opencode.ai/config.json",
  provider: { omniroute: provider },
};
writeFileSync(".opencode/opencode.json", JSON.stringify(config, null, 2));
console.log("Daleth. opencode.json escrita con provider OmniRoute.");