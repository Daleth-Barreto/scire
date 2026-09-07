// SCIRE owl mascot — original "sig-sized" ASCII art, drawn for SCIRE.
// Three poses share the same visual language (head dome, wide-set yellow eyes,
// orange beak, gray plumage, dim shadow/perch). Each is small enough to stay
// clean on a Windows console (PowerShell + Windows Terminal) beside the logo.
//
// Paleta:
//   CYAN   = identidad SCIRE
//   YELLOW = ojos del búho
//   ORANGE = pico
//   GRAY   = plumaje / estructura
//   DIM    = sombra / percha
//
// Glyph set prefers plain ASCII () / \ _ - | o ~ ' that Windows consoles render
// reliably; only the block-letter logo uses Unicode box-drawing.

const p = (r, g, b) => "\x1b[1;38;2;" + r + ";" + g + ";" + b + "m";
const RESET = "\x1b[0m";
const CYAN = p(0, 229, 255);
const EYES = p(255, 214, 10);
const ORANGE = p(255, 110, 60);
const GRAY = p(150, 165, 180);
const DIM = p(95, 110, 125);

const e = (s) => EYES + s + RESET;
const o = (s) => ORANGE + s + RESET;
const g = (s) => GRAY + s + RESET;
const d = (s) => DIM + s + RESET;

// ── Poses ───────────────────────────────────────────────────────────────

// VIGILANTE: status / research — alert standing owl, wide-open eyes, tufted
// head dome, wings folded at the sides.
const OWL_WATCH = [
  `   ${d("(")}${g("\\___/")}${d(")")}`,
  `   ${g("(")}${e("o")}${g(" ")}${o("v")}${g(" ")}${e("o")}${g(")")}`,
  `  ${g("/|:")}${e(".")}${o("V")}${e(".")}${g(":|\\")}`,
  `   ${g("\\\\::::://")}`,
  `   ${g("-----")}\`"" ""\`${g("-----")}`,
];

// EN VUELO: report compile — wings spread wide, ear tufts raised, feathery
// tail flicking in flight. Same face grammar as watch, airborne body.
const OWL_FLY = [
  `   ${d("/\\")}${g("   ")}${d("/\\")}`,
  `  ${g("/( ")}${e("o")}${g(" ")}${o("v")}${g(" ")}${e("o")}${g(" )\\")}`,
  `  ${g("\\_\\_")}${d("/")}${g("__/")}`,
  `${d("  /")}${g("'")}${g(" '---' ")}${g("'")}${d("\\")}`,
  `    ${d("~")}${g("'---'")}${d("~")}`,
];

// GUARDIÁN: help / audit — resting on a perch, wings tucked, face relaxed
// (half closed eyes), rounder body.
const OWL_SEATED = [
  `   ${d("(")}${g("\\___/")}${d(")")}`,
  `   ${g("(")}${e("o")}${g("_")}${e("o")}${g(")")}`,
  `  ${g("/( ")}${o("v")}${g(" )\\")}`,
  `  ${g("( \\___/ )")}`,
  `   ${g("---")}\`"" ""\`${g("---")}${d("~~")}`,
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
  watch: OWL_WATCH, // status/research
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