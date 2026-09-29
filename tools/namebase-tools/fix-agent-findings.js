"use strict";

/**
 * One-off repair for three defects found by research agents, kept as a script
 * so the reasoning and the exact edit are reviewable rather than lost.
 *
 * Run:  node tools/namebase-tools/fix-agent-findings.js --check
 *       node tools/namebase-tools/fix-agent-findings.js --write
 *
 * 1. i=1187 "Cauque Mayan language" is a duplicate of i=200938 "Cauque Mayan"
 *    whose 19 seeds are mostly Solola/Atitlan KAQCHIKEL and TZ'UTUJIL villages
 *    - San Antonio Palopo, San Lucas Toliman, Santiago Atitlan, Tzununa,
 *    Panajachel - which belong to different Mayan languages entirely. The
 *    language is documented in exactly one village, Santa Maria Cauque in the
 *    municipality of Santiago Sacatepequez, which i=200938 already holds.
 *    So i=1187 is deleted rather than cleaned: there is nothing in it that is
 *    not either a duplicate or another people's place. The mixer-map row
 *    x-cauque-mayan-language is repointed at 200938.
 *
 * 2. i=20106 "Anguillian Creole (dedicated)" and i=200625 "Anguillian Creole"
 *    have byte-identical 38-seed lists. The other (dedicated) pairs in this
 *    file are genuinely different - Jamaican Maroon Creole 43 vs 20, Cochimi 35
 *    vs 12, Navajo 53 vs 128 - so only this one is removed. The map row sop
 *    points at the deleted index, so it is repointed at 200625.
 *
 * 3. The map row jamaican-patois is empty, but Jamaican Patois IS Jamaican
 *    Creole English (ISO jam, Glottocode jama1262) and entry 200632 already
 *    holds it at 32 seeds. An agent was right to decline creating a second
 *    entry and reported the map key instead.
 */

const fs = require("node:fs");
const path = require("node:path");
const {NAMEBASE_DIR, root, loadAll, seedsOf} = require("./namebase-lib");

const write = process.argv.includes("--write");
const CONFIG_DIRS = [path.join(root, "config"), path.join(root, "public", "config")];

function readBracket(f) {
  const s = fs.readFileSync(f, "utf8");
  return JSON.parse(s.slice(s.indexOf("["), s.lastIndexOf("]") + 1));
}

const REMOVE = [
  {i: 1187, keep: 200938, reason: "duplicate of 200938; its other 16 seeds are Kaqchikel/Tz'utujil villages"},
  {i: 20106, keep: 200625, reason: "byte-identical to 200625 (both 'Anguillian Creole', 38 seeds)"}
];
const REPOINT = [
  {iso: "x-cauque-mayan-language", from: 1187, to: 200938},
  {iso: "sop", from: 20106, to: 200625},
  {iso: "jamaican-patois", from: null, to: 200632}
];

const files = loadAll();
const all = files.flatMap(f => f.entries);
const byI = new Map(all.map(e => [e.i, e]));

console.log("");
console.log("fix-agent-findings " + (write ? "(APPLYING)" : "(dry run)"));
console.log("========================================");
for (const r of REMOVE) {
  const e = byI.get(r.i);
  const k = byI.get(r.keep);
  if (!e) { console.log(`  i=${r.i} not found`); continue; }
  console.log(
    `  remove i=${r.i} "${e.name}" (${seedsOf(e).length} seeds) -> keep i=${r.keep} "${k ? k.name : "?"}"  [${r.reason}]`
  );
}
for (const r of REPOINT) {
  console.log(`  repoint ${r.iso}: ${r.from === null ? "(empty)" : r.from} -> ${r.to}`);
}
console.log("");

if (!write) {
  console.log("Dry run. Re-run with --write to apply.");
  process.exit(0);
}

const dropI = new Set(REMOVE.map(r => r.i));
for (const f of files) {
  const cleaned = f.entries
    .filter(e => !dropI.has(e.i))
    .map(({__continent, __pos, ...rest}) => rest);
  fs.writeFileSync(
    path.join(NAMEBASE_DIR, `namebases-${f.continent}.js`),
    `window.${f.continent}NameBases = ${JSON.stringify(cleaned, null, 2)};\n`,
    "utf8"
  );
}

const repointBy = new Map(REPOINT.map(r => [r.iso, r.to]));
const jsonPath = path.join(CONFIG_DIRS[0], "language-mixer-map.json");
const jsonRows = readBracket(jsonPath);
let changed = 0;
for (const rows of [jsonRows]) {
  for (const row of rows) {
    const to = repointBy.get(row.iso);
    if (to !== undefined && row.bases[0] !== to) { row.bases = [to]; changed++; }
  }
}
const jsRows = readBracket(path.join(CONFIG_DIRS[0], "language-mixer-map.js"));
for (const row of jsRows) {
  const to = repointBy.get(row.iso);
  if (to !== undefined && row.bases[0] !== to) { row.bases = [to]; changed++; }
}
fs.writeFileSync(jsonPath, JSON.stringify(jsonRows, null, 2) + "\n", "utf8");
for (const dir of CONFIG_DIRS) {
  fs.writeFileSync(path.join(dir, "language-mixer-map.js"), `globalThis.languageMixerMap = ${JSON.stringify(jsRows, null, 2)};\n`, "utf8");
}
console.log(`  removed ${dropI.size} entr(ies), repointed ${changed} map row reference(s)`);
