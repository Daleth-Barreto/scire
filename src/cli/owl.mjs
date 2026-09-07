// SCIRE owl mascot — original ASCII art. Daleth: sin copias, sin atribuciones falsas.
// Paleta:
//   CYAN  = identidad SCIRE
//   YELLOW = ojos del búho (mirada)
//   GRAY  = plumaje / estructura
//   DIM   = sombra / perchas
//   ORANGE= pico
//   GREEN/RED/MAGENTA = check/error/aviso (véase lib/util.mjs)

const p = (r, g, b) => "\x1b[1;38;2;" + r + ";" + g + ";" + b + "m";
const RESET = "\x1b[0m";
const CYAN = p(0, 229, 255);
const EYES = p(255, 214, 10);
const GRAY = p(150, 165, 180);
const DIM = p(95, 110, 125);
const BEAK = p(255, 110, 60);
const z = (c, s) => c + s + RESET;

const eye = z(EYES, "( o )");
const beak = z(BEAK, "/~~\\");

// ── Poses ────────────────────────────────────────────────────────────────

// VIGILANTE: setup / status / research — ojos abiertos, recto, en su percha
const OWL_WATCH = [
  `${CYAN}       .----------------.${RESET}`,
  `${CYAN}      /                  \\\\${RESET}`,
  `${CYAN}     |  ${eye}${CYAN}      ${eye}${CYAN}   |${RESET}`,
  `${CYAN}     |   \\_/        \\_/    |${RESET}`,
  `${CYAN}     |       \\      /      |${RESET}`,
  `${CYAN}     |        \\    /       |${RESET}`,
  `${CYAN}     |         ${beak}${CYAN}        |${RESET}`,
  `${GRAY}     |        (____)       |${RESET}`,
  `${GRAY}     |         |  |        |${RESET}`,
  `${GRAY}      \\       /    \\      /${RESET}`,
  `${GRAY}       \\     /      \\    /${RESET}`,
  `${DIM}        \\   /        \\  /${RESET}`,
  `${DIM}         \\_/          \\/${RESET}`,
  `${DIM}          |              |${RESET}`,
  `${DIM}           \\            /${RESET}`,
  `${DIM}            \\__________/${RESET}`,
];

// EN VUELO: report compile — alas desplegadas
const OWL_FLY = [
  `${CYAN}             _--__--_${RESET}`,
  `${CYAN}            /   __   \\${RESET}`,
  `${CYAN}      _.--  |  ${eye}${CYAN}  |  --._${RESET}`,
  `${CYAN}   ,-'      |    |    |      '-.${RESET}`,
  `${CYAN}  /         |  ${beak}${CYAN}    |         \\${RESET}`,
  `${CYAN}  \\         | (____) |         /${RESET}`,
  `${GRAY}   \\        |   |  |  |        /${RESET}`,
  `${GRAY}    \\        \\  |  |  /        /${RESET}`,
  `${GRAY}     \\        \\ | | | /        /${RESET}`,
  `${DIM}      '-.       \\|_|_|/       .-'${RESET}`,
  `${DIM}         '-.              .-'${RESET}`,
  `${DIM}            '--.      .--'${RESET}`,
  `${DIM}                '------'${RESET}`,
];

// GUARDIÁN: help / audit — reposado, párpados a media asta
const OWL_SEATED = [
  `${CYAN}        .-------------.${RESET}`,
  `${CYAN}       /      ___      \\\\${RESET}`,
  `${CYAN}      |      (o o)      |${RESET}`,
  `${CYAN}      |    .-'-_-'-.     |${RESET}`,
  `${CYAN}      |      ${beak}${CYAN}       |${RESET}`,
  `${CYAN}      |    \\______/     |${RESET}`,
  `${GRAY}      |   __|   |__     |${RESET}`,
  `${GRAY}       \\  \\     /     /${RESET}`,
  `${GRAY}        \\  \\_ _/     /${RESET}`,
  `${DIM}         \\   | |    /${RESET}`,
  `${DIM}          \\  | |   /${RESET}`,
  `${DIM}           \\_|_|_  /${RESET}`,
  `${DIM}             | |  /${RESET}`,
  `${DIM}             |_|${RESET}`,
];

// ── Logo SCIRE ───────────────────────────────────────────────────────────

function scireLogo() {
  const c = p(0, 229, 255);
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
