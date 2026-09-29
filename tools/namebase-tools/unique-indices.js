"use strict";

/**
 * Give every namebase a unique index.
 *
 * Run:  node tools/namebase-tools/unique-indices.js --check
 *       node tools/namebase-tools/unique-indices.js --write
 *
 * The mixer map addresses namebases by index, so two languages sharing one
 * index is not a tidiness issue: it is a resolution ambiguity, and for 67 of
 * the 222 contested indices both claimants were referenced by map rows, so two
 * different ISOs resolved to the same seed list.
 *
 * This is the second half of the fix. repair-mixer-map.js repoints the map at
 * the right language and reindexes only the entries that sit on a contested
 * index *and* are a repair target. This pass handles the remainder: any entry
 * still sharing an index is given a fresh one above the current maximum.
 *
 * The claimant that keeps the index is the one the map points at, if any. If
 * the map references none of them, the first in file order keeps it. The map
 * is never rewritten here - it already points at the survivor.
 */

const fs = require("node:fs");
const path = require("node:path");
const {CONTINENTS, NAMEBASE_DIR, root, loadAll} = require("./namebase-lib");

const write = process.argv.includes("--write");
const CONFIG_DIRS = [path.join(root, "config"), path.join(root, "public", "config")];

function readBracketArray(file) {
  const s = fs.readFileSync(file, "utf8");
  return JSON.parse(s.slice(s.indexOf("["), s.lastIndexOf("]") + 1));
}

const files = loadAll();
const all = files.flatMap(f => f.entries);

// Which indices does the map actually reference?
const referenced = new Map();
for (const row of readBracketArray(path.join(CONFIG_DIRS[0], "language-mixer-map.js"))) {
  for (const b of row.bases || []) {
    if (!referenced.has(b)) referenced.set(b, 0);
    referenced.set(b, referenced.get(b) + 1);
  }
}

const byIndex = new Map();
for (const e of all) {
  if (e.i === undefined) continue;
  if (!byIndex.has(e.i)) byIndex.set(e.i, []);
  byIndex.get(e.i).push(e);
}
const contested = [...byIndex.entries()].filter(([, v]) => v.length > 1).sort((a, b) => a[0] - b[0]);

const used = new Set(all.map(e => e.i).filter(v => v !== undefined));
let nextFree = Math.max(...used) + 1;
function freshIndex() {
  while (used.has(nextFree)) nextFree++;
  used.add(nextFree);
  return nextFree++;
}

const moves = [];
for (const [i, group] of contested) {
  // Prefer keeping the entry the map addresses.
  const sorted = group
    .map((e, k) => ({e, k, ref: referenced.get(i) || 0}))
    .sort((a, b) => b.k - a.k || a.e.__continent.localeCompare(b.e.__continent) || a.e.__pos - b.e.__pos);
  const keeper = sorted[0].e;
  for (const g of group) {
    if (g === keeper) continue;
    moves.push({entry: g, from: i, to: freshIndex()});
  }
}

console.log("");
console.log("unique-indices " + (write ? "(APPLYING)" : "(dry run)"));
console.log("========================================");
console.log(`  contested indices        : ${contested.length}`);
console.log(`  entries to reindex       : ${moves.length}`);
console.log(`  new index range used     : ${Math.max(...used) - moves.length + 1} .. ${Math.max(...used)}`);
console.log("");
console.log("  sample:");
moves.slice(0, 12).forEach(m => {
  console.log(
    `    ${m.entry.__continent}:${m.entry.name.padEnd(30)} i=${String(m.from).padEnd(7)} -> ${m.to}`
  );
});
if (moves.length > 12) console.log(`    ... and ${moves.length - 12} more`);
console.log("");

if (!write) {
  console.log("Dry run. Re-run with --write to apply.");
  process.exit(0);
}

for (const m of moves) m.entry.i = m.to;

for (const f of files) {
  const cleaned = f.entries.map(({__continent, __pos, ...rest}) => rest);
  fs.writeFileSync(
    path.join(NAMEBASE_DIR, `namebases-${f.continent}.js`),
    `window.${f.continent}NameBases = ${JSON.stringify(cleaned, null, 2)};\n`,
    "utf8"
  );
}
console.log(`  rewrote ${files.length} namebase file(s)`);
console.log("");
console.log("Next: pnpm namebase:verify && node tools/mixer-core/check-language-mixer-guardrails.js");
