"use strict";

/**
 * Empty the `bases` of map rows that point at the wrong language.
 *
 * Run:  node tools/namebase-tools/unpoint-wrong-bases.js --check
 *       node tools/namebase-tools/unpoint-wrong-bases.js --write
 *
 * WHY
 * ---
 * A map row tells the mixer which real language's place names to use for an ISO
 * code. When repair-mixer-map.js could not find a namebase for a row's language
 * it deliberately left the row pointing wherever it already pointed, on the
 * theory that a wrong pointer was no worse than no pointer.
 *
 * It is worse. names-mixer.ts:1900 skips an ISO whose entry has an empty bases
 * array, so an empty row makes the language visibly unavailable. A row pointing
 * at the wrong entry makes the app silently generate a different language's
 * names. Sampling the map found rows like:
 *
 *     classical-arabic  ->  Chhattisgarhi
 *     onobasulu         ->  Tigrinya
 *     boze              ->  Aymara
 *     bonin-english     ->  Rif
 *
 * Asking for Classical Arabic and getting Chhattisgarhi surnames is a far worse
 * failure than being told Classical Arabic is not available yet.
 *
 * A row is emptied only when its index does not resolve, or resolves to a
 * namebase whose name does not match the ISO's language under exact, alias or
 * prefix rules. Alias and prefix matching matter: "x-raute" is a real ISO alias
 * for "Raute", and emptying that row would be just as wrong as leaving it.
 */

const fs = require("node:fs");
const path = require("node:path");
const {root} = require("./namebase-lib");
const {loadNameBases} = require("./load-namebases");

const write = process.argv.includes("--write");
const CONFIG_DIRS = [path.join(root, "config"), path.join(root, "public", "config")];

function readBracket(f) {
  const s = fs.readFileSync(f, "utf8");
  return JSON.parse(s.slice(s.indexOf("["), s.lastIndexOf("]") + 1));
}

const norm = s =>
  String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "");

const {nameBases: sparse, populated} = loadNameBases();
const byName = new Map();
for (const e of populated) {
  const k = norm(e.name);
  if (k && !byName.has(k)) byName.set(k, e);
}
const nameKeys = [...byName.keys()];

const mapJson = readBracket(path.join(CONFIG_DIRS[0], "language-mixer-map.json"));
const mapJs = readBracket(path.join(CONFIG_DIRS[0], "language-mixer-map.js"));
const catalog = readBracket(path.join(CONFIG_DIRS[0], "language-mixes-all.js"));
const isoName = new Map();
for (const r of catalog) if (r && r.iso && r.name) isoName.set(r.iso, String(r.name));

/** All names an entry legitimately answers to: its own, plus parentheticals. */
function aliasesOf(e) {
  const out = new Set([norm(e.name)]);
  for (const p of String(e.name || "").match(/\(([^)]+)\)/g) || []) {
    for (const part of p.replace(/[()]/g, "").split(/[,;/]/)) {
      const k = norm(part);
      if (k.length >= 3) out.add(k);
    }
  }
  return out;
}
const aliasIndex = new Map();
for (const e of populated) for (const k of aliasesOf(e)) {
  if (!aliasIndex.has(k)) aliasIndex.set(k, []);
  if (!aliasIndex.get(k).includes(e)) aliasIndex.get(k).push(e);
}

function isSane(rowIso, idx) {
  const want = norm(isoName.get(rowIso));
  if (!want) return true;              // no catalog name to check against
  const nb = sparse[idx];
  if (!nb) return false;               // dangling
  if (aliasesOf(nb).has(want)) return true;
  // prefix, either direction
  for (const k of nameKeys) {
    if (k.length >= 4 && (k === want || k.startsWith(want) || want.startsWith(k))) {
      // only accept if the candidate actually claims this name
      if (aliasIndex.get(k) && aliasIndex.get(k).some(e => e.i === nb.i)) return true;
    }
  }
  return false;
}

const bad = [];
for (const row of mapJs) {
  const b = row.bases[0];
  if (b === undefined) continue;
  if (!isSane(row.iso, b)) {
    const want = isoName.get(row.iso);
    const nb = sparse[b];
    bad.push({iso: row.iso, want: want || "(not in catalog)", pointsAt: nb ? nb.name : "(nothing)"});
  }
}

console.log("");
console.log("unpoint-wrong-bases " + (write ? "(APPLYING)" : "(dry run)"));
console.log("========================================");
console.log(`  map rows total              : ${mapJs.length}`);
console.log(`  rows pointing at wrong/absent language : ${bad.length}`);
console.log("");
console.log("  sample (these languages become unavailable rather than wrong):");
for (const r of bad.slice(0, 25)) {
  console.log(`    ${r.iso.padEnd(24)} wants "${r.want}"  but points at "${r.pointsAt}"`);
}
if (bad.length > 25) console.log(`    ... and ${bad.length - 25} more`);
console.log("");

if (!write) {
  console.log("Dry run. Re-run with --write to apply.");
  process.exit(0);
}

const doomed = new Set(bad.map(r => r.iso));
const empty = rows => {
  let n = 0;
  for (const row of rows) {
    if (doomed.has(row.iso) && row.bases.length) { row.bases = []; n++; }
  }
  return n;
};
let changed = empty(mapJson);
changed += empty(mapJs);

fs.writeFileSync(path.join(CONFIG_DIRS[0], "language-mixer-map.json"), JSON.stringify(mapJson, null, 2) + "\n", "utf8");
for (const dir of CONFIG_DIRS) {
  fs.writeFileSync(path.join(dir, "language-mixer-map.js"), `globalThis.languageMixerMap = ${JSON.stringify(mapJs, null, 2)};\n`, "utf8");
}
console.log(`  rows emptied: ${changed}`);
console.log("  languages affected are now skipped by names-mixer.ts instead of");
console.log("  silently generating another language's names.");
