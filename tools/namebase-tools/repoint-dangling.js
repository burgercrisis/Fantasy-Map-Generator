"use strict";

/**
 * Repoint mixer-map rows whose index does not resolve.
 *
 * Run:  node tools/namebase-tools/repoint-dangling.js --check
 *       node tools/namebase-tools/repoint-dangling.js --write
 *
 * A map row is only useful if the index it names actually holds a namebase in
 * the merged array the app reads. 548 of the 4410 rows did not: the index
 * existed in no continent file at all. Those came from the stale
 * config/language-mixer-map.json, which had 2440 rows pointing at indices that
 * were already gone before this work started.
 *
 * Rows are matched to a namebase by the same rules as repair-mixer-map.js -
 * exact normalised name, then alias, then prefix. Rows whose language has no
 * namebase at all are left alone and reported, because pointing them somewhere
 * arbitrary would be worse than leaving them visibly unresolved.
 *
 * The prefix rule is deliberately narrow, because it has produced wrong
 * repairs. "karasuk" prefix-matches "karas" with a one-character difference,
 * which offered a row a pointer at a Trans-New Guinea entry, and "gonga"
 * matched a Tai language. Neither is a variant spelling; they are unrelated
 * languages whose names happen to share a prefix. A prefix match is therefore
 * only accepted when the shorter name is most of the longer one, and anything
 * that fails that test is reported as ambiguous for a human rather than
 * repaired. Ambiguous rows are never written.
 */

const fs = require("node:fs");
const path = require("node:path");
const {CONTINENTS, root} = require("./namebase-lib");
const {loadNameBases} = require("./load-namebases");

const write = process.argv.includes("--write");
const CONFIG_DIRS = [path.join(root, "config"), path.join(root, "public", "config")];

function readBracketArray(file) {
  const s = fs.readFileSync(file, "utf8");
  return JSON.parse(s.slice(s.indexOf("["), s.lastIndexOf("]") + 1));
}

const norm = s =>
  String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "");

// The merged array is what the browser addresses, so that is the reference.
// `sparse` is index-addressed exactly as the app sees it; `populated` is the
// same data compacted. Resolvability must be tested against `sparse`: an entry
// can have a declared `i` that is not its array position, and the mixer map
// addresses the position.
const {populated, nameBases: sparse} = loadNameBases();
const byName = new Map();
for (const e of populated) {
  const k = norm(e.name);
  if (!k || byName.has(k)) continue;
  byName.set(k, e);
}
const nameKeys = [...byName.keys()];

const catalog = readBracketArray(path.join(CONFIG_DIRS[0], "language-mixes-all.js"));
const isoName = new Map();
for (const r of catalog) if (r && r.iso && r.name) isoName.set(r.iso, String(r.name));

const mapJson = readBracketArray(path.join(CONFIG_DIRS[0], "language-mixer-map.json"));
const mapJs = readBracketArray(path.join(CONFIG_DIRS[0], "language-mixer-map.js"));

// A prefix match must be between names that are mostly the same length, and
// both sides must be long enough for "same name, one letter different" to mean
// something. Otherwise a short name that merely starts the same way gets
// offered as the target for a different language.
const PREFIX_MIN_LEN = 5;
const PREFIX_RATIO = 0.8;
const ambiguous = [];

function findTarget(want) {
  if (!want) return null;
  if (byName.has(want)) return byName.get(want);
  // alias: any entry whose parenthetical matches
  for (const e of populated) {
    for (const paren of String(e.name || "").match(/\(([^)]+)\)/g) || []) {
      for (const part of paren.replace(/[()]/g, "").split(/[,;/]/)) {
        if (norm(part) === want) return e;
      }
    }
  }
  let best = null;
  let bestLen = Infinity;
  for (const k of nameKeys) {
    if (k.length < PREFIX_MIN_LEN || want.length < PREFIX_MIN_LEN) continue;
    if (!(k.startsWith(want) || want.startsWith(k))) continue;
    const shorter = Math.min(k.length, want.length);
    const longer = Math.max(k.length, want.length);
    if (shorter / longer < PREFIX_RATIO) {
      if (!ambiguous.some(a => a.want === want && a.candidate === k))
        ambiguous.push({want, candidate: k, toName: byName.get(k).name, to: byName.get(k).i});
      continue;
    }
    const d = Math.abs(k.length - want.length);
    if (d < bestLen) { bestLen = d; best = byName.get(k); }
  }
  return best;
}

const repairs = new Map();
const unresolvable = [];
for (const row of mapJs) {
  const b = row.bases[0];
  if (sparse[b]) continue;
  const name = isoName.get(row.iso);
  const target = findTarget(norm(name));
  if (target) repairs.set(row.iso, {from: b, to: target.i, toName: target.name, iso: row.iso, name});
  else unresolvable.push({iso: row.iso, name, b});
}

console.log("");
console.log("repoint-dangling " + (write ? "(APPLYING)" : "(dry run)"));
console.log("========================================");
console.log(`  map rows total            : ${mapJs.length}`);
console.log(`  rows whose index resolves : ${mapJs.length - repairs.size - unresolvable.length}`);
console.log(`  dangling, fixable by name : ${repairs.size}`);
console.log(`  ambiguous prefix matches  : ${ambiguous.length}`);
console.log(`  dangling, no namebase     : ${unresolvable.length}`);
console.log("");
console.log("  sample repairs:");
[...repairs.values()].slice(0, 10).forEach(r =>
  console.log(`    ${r.iso.padEnd(22)} i=${String(r.from).padEnd(7)} -> ${String(r.to).padEnd(7)} ${r.name} (${r.toName})`)
);
console.log("");
if (ambiguous.length) {
  console.log("  AMBIGUOUS - near-miss names that are NOT the same language, needs a human:");
  ambiguous.slice(0, 10).forEach(a =>
    console.log(`    "${a.want}" vs "${a.candidate}" -> i=${a.to} ${a.toName}  (left as-is, not repaired)`)
  );
  console.log("");
}
console.log("  sample unresolvable (no namebase exists for this language):");
unresolvable.slice(0, 10).forEach(r => console.log(`    ${r.iso.padEnd(22)} "${r.name}"  -> i=${r.b}`));
console.log("");

if (!write) {
  console.log("Dry run. Re-run with --write to apply.");
  process.exit(0);
}

const fix = rows => {
  let n = 0;
  for (const row of rows) {
    const r = repairs.get(row.iso);
    if (r && row.bases[0] !== r.to) { row.bases = [r.to]; n++; }
  }
  return n;
};

// Write each file independently. Do NOT gate the .js on the .json existing:
// only config/language-mixer-map.json is tracked; public/config/ holds just the
// .js, because that is the copy the browser loads. An earlier version of
// dedupe-entries.js skipped a whole directory when its .json was absent, which
// silently left the served map stale and committed that drift.
let changed = 0;
const jsonPath = path.join(CONFIG_DIRS[0], "language-mixer-map.json");
if (fs.existsSync(jsonPath)) {
  const rows = readBracketArray(jsonPath);
  changed += fix(rows);
  fs.writeFileSync(jsonPath, JSON.stringify(rows, null, 2) + "\n", "utf8");
}
const jsRows = readBracketArray(path.join(CONFIG_DIRS[0], "language-mixer-map.js"));
changed += fix(jsRows);
for (const dir of CONFIG_DIRS) {
  fs.writeFileSync(path.join(dir, "language-mixer-map.js"), `globalThis.languageMixerMap = ${JSON.stringify(jsRows, null, 2)};\n`, "utf8");
}
console.log(`  map rows repointed: ${changed}`);
console.log("");
console.log("Next: pnpm build && node tools/namebase-tools/verify-built-output.js");
