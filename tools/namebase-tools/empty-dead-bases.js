"use strict";

/**
 * Empty the `bases` of map rows that name a base that cannot produce anything.
 *
 * Run:  node tools/namebase-tools/empty-dead-bases.js --check
 *       node tools/namebase-tools/empty-dead-bases.js --write
 *
 * A row is "dead" when every one of its bases either does not exist in the
 * runtime array, or exists with an empty seed string. names-mixer.ts filters
 * both out, so such a row already produces nothing - it is just invisible about
 * it. Emptying the bases makes the state explicit and stops it being read as a
 * configured row with a base.
 *
 * This is the tail of the problem unpoint-wrong-bases.js addressed. That tool
 * emptied rows whose base resolved to the wrong language. This one empties the
 * rows where the base resolves to nothing at all: 46 of them, 23 pointing at an
 * entry with no seeds and 23 at an index that does not exist.
 */

const fs = require("node:fs");
const path = require("node:path");
const {root} = require("./namebase-lib");
const {loadNameBases, BUILTIN_DEFAULTS} = require("./load-namebases");

const write = process.argv.includes("--write");
const CONFIG_DIRS = [path.join(root, "config"), path.join(root, "public", "config")];

function readBracket(f) {
  const s = fs.readFileSync(f, "utf8");
  return JSON.parse(s.slice(s.indexOf("["), s.lastIndexOf("]") + 1));
}

const {nameBases: aggregated} = loadNameBases();
const {runtime} = BUILTIN_DEFAULTS.applyBuiltInOverlay(aggregated);

const mapJson = readBracket(path.join(CONFIG_DIRS[0], "language-mixer-map.json"));
const mapJs = readBracket(path.join(CONFIG_DIRS[0], "language-mixer-map.js"));
const catalog = readBracket(path.join(CONFIG_DIRS[0], "language-mixes-all.js"));
const catalogIsos = new Set(catalog.map(r => r.iso));

const missing = [];
let noSeeds = 0;
let absent = 0;
for (const row of mapJs) {
  if (!row.bases || !row.bases.length) continue;
  const usable = row.bases.filter(b => {
    const nb = runtime[b];
    if (!nb) { absent++; return false; }
    if (typeof nb.b !== "string" || !nb.b.length) { noSeeds++; return false; }
    return true;
  });
  if (!usable.length) {
    missing.push({iso: row.iso, selectable: catalogIsos.has(row.iso), bases: row.bases.slice()});
  }
}

console.log("");
console.log("empty-dead-bases " + (write ? "(APPLYING)" : "(dry run)"));
console.log("========================================");
console.log(`  map rows with bases        : ${mapJs.filter(r => r.bases && r.bases.length).length}`);
console.log(`  ...every base has no seeds : ${noSeeds}`);
console.log(`  ...base index does not exist : ${absent}`);
console.log(`  rows that produce nothing  : ${missing.length}`);
console.log(`  ...of those, user-selectable: ${missing.filter(m => m.selectable).length}`);
console.log("");
for (const m of missing.slice(0, 20)) {
  console.log(`  ${m.iso.padEnd(24)} bases ${JSON.stringify(m.bases)}${m.selectable ? "" : "   (not in catalog)"}`);
}
if (missing.length > 20) console.log(`  ... and ${missing.length - 20} more`);
console.log("");

if (!write) {
  console.log("Dry run. Re-run with --write to apply.");
  process.exit(0);
}

const doomed = new Set(missing.map(m => m.iso));
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
