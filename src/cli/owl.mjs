const OWL = [
  "        .---------------------.",
  "       /                       \\",
  "      |   __             __     |",
  "      |  /  \\           /  \\    |",
  "      | |    |  ......  |    |   |",
  "      |  \\__/   .-||-.  \\__/    |",
  "      |        |  ()  |          |",
  "      |         \\____/           |",
  "      |       .----------.       |",
  "      |      /            \\      |",
  "       \\    /   SCIRE owl   \\    /",
  "        \\  /                \\  /",
  "         `---------------------'",
];

export function banner({ silent = false } = {}) {
  if (silent) return;
  process.stdout.write("\n");
  process.stdout.write("  SCIRE — Self-driven Computational Investigation & Research Engine\n");
  process.stdout.write("  ─────────────────────────────────────────────────────────────\n");
  for (const line of OWL) process.stdout.write("  " + line + "\n");
  process.stdout.write("  ─────────────────────────────────────────────────────────────\n");
  process.stdout.write(
    "  Daleth. CLI v0.1.0 — genera, investiga, compila. Si no lo verificas, no lo afirmes.\n",
  );
}