// SCIRE owl mascot — original ASCII art. Daleth: sin copias, sin atribuciones falsas.
// Paleta:
//   CYAN  = identidad SCIRE
//   YELLOW = ojos del búho (mirada)
//   GRAY  = plumaje / estructura
//   DIM   = sombra
//   GREEN/RED/MAGENTA = check/error/aviso (véase lib/util.mjs)

const RESET = "\x1b[0m";
const CYAN = "\x1b[38;2;0;229;255m";
const EYES = "\x1b[38;2;255;214;10m";
const BEAK = "\x1b[38;2;255;110;60m";
const GRAY = "\x1b[38;2;150;165;180m";
const DIM = "\x1b[38;2;95;110;125m";
const bold = (r, g, b) => "\x1b[1;38;2;" + r + ";" + g + ";" + b + "m";

// ── Poses ────────────────────────────────────────────────────────────────

// VIGILANTE: setup / status / research — ojos abiertos, recto
const OWL_WATCH = [
  CYAN + "          ,------------------." + RESET,
  CYAN + "         /   " + EYES + "__" + RESET + CYAN + "        " + EYES + "__" + RESET + CYAN + "    \\" + RESET,
  CYAN + "        |   " + EYES + "/  \\" + RESET + CYAN + "      " + EYES + "/  \\" + RESET + CYAN + "    |" + RESET,
  CYAN + "        |   " + EYES + "|" + BEAK + "\u25cf" + RESET + CYAN + "|  (o)  |" + EYES + "\u25cf" + RESET + CYAN + "|    |" + RESET,
  CYAN + "        |   " + EYES + "\\__/" + RESET + CYAN + "        " + EYES + "\\__/" + RESET + CYAN + "    |" + RESET,
  GRAY + "        |      \\______/        |" + RESET,
  GRAY + "        |   " + RESET + BEAK + "\\______/" + RESET + GRAY + "       |" + RESET,
  GRAY + "        \\     " + RESET + GRAY + "______         |" + RESET,
  DIM + "         \\      \\_\\_\\_\\  __ _" + RESET,
  DIM + "          \\________\\_____\\_\\" + RESET,
];

// EN VUELO: report compile — alas desplegadas
const OWL_FLY = [
  DIM + "   ,'" + RESET + GRAY + "                " + RESET + DIM + "'.," + RESET,
  DIM + "  f" + RESET + CYAN + "    .------------------.    " + RESET + DIM + "h" + RESET,
  DIM + "  | " + RESET + CYAN + "   " + EYES + "o    " + RESET + CYAN + "__    " + EYES + "o" + RESET + CYAN + "     |\n" + RESET,
  DIM + "  | " + RESET + CYAN + "   " + EYES + "\\    " + RESET + BEAK + "__" + RESET + CYAN + "  /__  " + EYES + "/" + RESET + CYAN + "     |" + RESET,
  DIM + "  \\ " + RESET + GRAY + "     \\______/         /" + RESET,
  DIM + "   \\" + RESET + GRAY + "     \\______/        /" + RESET,
  DIM + "    \\" + RESET + GRAY + "______/\\_____/\\____/" + RESET,
];

// GUARDIÁN: help / audit — reposado
const OWL_SEATED = [
  CYAN + "          .------------------." + RESET,
  CYAN + "         /     " + EYES + "\u25cf  \u25cf" + RESET + CYAN + "       \\" + RESET,
  CYAN + "        |      " + BEAK + "\u25c0" + RESET + CYAN + "\\_/" + BEAK + "\u25b6" + RESET + CYAN + "       |" + RESET,
  CYAN + "        |        ( )        |" + RESET,
  GRAY + "        |        ('_')       |" + RESET,
  GRAY + "        |   " + RESET + GRAY + "\\_____________/" + RESET + GRAY + "  |" + RESET,
  GRAY + "        \\     " + RESET + GRAY + "\\________/" + RESET + GRAY + "      /" + RESET,
  DIM + "         \\__   \\______/   __/" + RESET,
  DIM + "            \\_ \\______/ _/" + RESET,
];

// ── Logo SCIRE ───────────────────────────────────────────────────────────

function scireLogo() {
  const c = bold(0, 229, 255);
  const w = RESET;
  return [
    c + "\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u258e \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u258a\u2588\u2588\u258e\u2588\u2588\u2588\u2588\u2588\u2588\u2588 \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u258e" + w,
    c + "\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255d\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255d\u2588\u2588\u256d\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2554\u2550\u2550\u2550\u255d\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255d" + w,
    c + "\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2556\u2588\u2588\u256d     \u2588\u2588\u256d\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255d\u2588\u2588\u2588\u2588\u2588\u2588\u2557  " + w,
    c + "\u255a\u2550\u2550\u2550\u2550\u2550\u2588\u2588\u256d\u2588\u2588\u256d     \u2588\u2588\u256d\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255d\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255d" + w,
    c + "\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2556\u255a\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u256d  \u2588\u2588\u256d\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557" + w,
    c + "\u255a\u2550\u2550\u2550\u2550\u2550\u255d \u255a\u2550\u2550\u2550\u2550\u2550\u255d\u255a\u2550\u255d\u255a\u2550\u255d  \u255a\u2550\u255d\u255a\u2550\u2550\u2550\u2550\u2550\u255d\u255a\u2550\u2550\u2550\u2550\u2550\u255d" + w,
  ];
}

// ── Banner ───────────────────────────────────────────────────────────────

const POSE = {
  watch: OWL_WATCH, // setup/status/research
  fly: OWL_FLY,    // report compile
  seated: OWL_SEATED, // help/audit
};

export function banner({ pose = "watch" } = {}) {
  for (const l of scireLogo()) process.stdout.write(l + "\n");
  const owl = POSE[pose] || OWL_WATCH;
  for (const l of owl) process.stdout.write("    " + l + "\n");
  process.stdout.write(
    "\n" + CYAN + "  \u2726 SCIRE" + DIM + " \u2014 " + RESET + "Self-driven Computational Investigation & Research Engine\n",
  );
  process.stdout.write(DIM + "  Verifica antes de afirmar. Cada sesión abre con tu firma.\n\n" + RESET);
}

export function tagline(sub = "genera \u00b7 investiga \u00b7 compila") {
  process.stdout.write(DIM + "  \u2500\u2500 " + RESET + CYAN + "scire" + RESET + DIM + " " + sub + RESET + "\n");
}