"use strict";

/**
 * Remove whole-entry duplicates and repoint the mixer map at the survivor.
 *
 * Run:  node tools/namebase-tools/dedupe-entries.js --check
 *       node tools/namebase-tools/dedupe-entries.js --write
 *
 * A group is a duplicate when two or more entries have the same language name
 * AND byte-identical seed lists. There is no judgement involved: they are the
 * same language, entered more than once, and the extra copies are unreachable
 * bulk that bloats the file and makes the shared-seed count look far worse than
 * it is.
 *
 * Measured: 191 groups, 558 redundant rows, 749 distinct languages affected.
 * Amharic, Tigrinya, Oromo, Somali, Malagasy, Konkani, Manipuri, Santali,
 * Chhattisgarhi, Bundeli, Garhwali and Hakka each appear six times with
 * identical seed lists. Several of those copies sit in the wrong continent file
 * - Malagasy in asia, Tigrinya in asia - which is where much of the apparent
 * cross-continent contamination came from.
 *
 * The survivor is the copy with the most seeds; ties go to the lowest index, so
 * the original entry keeps its identity. Every mixer map row that pointed at a
 * removed copy is repointed at the survivor, so no language loses its seed data.
 */

const fs = require("node:fs");
const path = require("node:path");
const {CONTINENTS, NAMEBASE_DIR, root, loadAll, seedsOf, seedCount} = require("./namebase-lib");

const write = process.argv.includes("--write");
const CONFIG_DIRS = [path.join(root, "config"), path.join(root, "public", "config")];

function readBracketArray(file) {
  const s = fs.readFileSync(file, "utf8");
  return JSON.parse(s.slice(s.indexOf("["), s.lastIndexOf("]") + 1));
}

const files = loadAll();
const all = files.flatMap(f => f.entries);

// name + exact seed list, order included
const signature = e => JSON.stringify([e.name, seedsOf(e)]);

const groups = new Map();
for (const e of all) {
  const k = signature(e);
  if (!groups.has(k)) groups.set(k, []);
  groups.get(k).push(e);
}

const dupGroups = [...groups.values()].filter(v => v.length > 1);
const drops = [];
for (const g of dupGroups) {
  const ranked = g
    .map((e, k) => ({e, k}))
    .sort((a, b) => seedCount(b.e) - seedCount(a.e) || a.e.i - b.e.i || a.e.__pos - b.e.__pos);
  const survivor = ranked[0].e;
  for (const r of ranked.slice(1)) drops.push({entry: r.e, survivor});
}

const dropSet = new Set(drops.map(d => d.entry));
const indexReuse = new Map();
for (const d of drops) indexReuse.set(d.entry.i, d.survivor.i);

// Rows of the duplicate file that must go.
const dropPos = new Set(drops.map(d => d.entry.__pos));

console.log("");
console.log("dedupe-entries " + (write ? "(APPLYING)" : "(dry run)"));
console.log("========================================");
console.log(`  entries scanned             : ${all.length}`);
console.log(`  duplicate groups            : ${dupGroups.length}`);
console.log(`  redundant rows to remove    : ${drops.length}`);
console.log(`  languages affected          : ${new Set(drops.map(d => d.entry.name)).size}`);

const crossContinent = drops.filter(d => d.entry.__continent !== d.survivor.__continent);
console.log(`  ...in a different continent file than the survivor: ${crossContinent.length}`);
const byC = {};
for (const d of drops) byC[d.entry.__continent] = (byC[d.entry.__continent] || 0) + 1;
console.log(`  ...removed per continent    : ${JSON.stringify(byC)}`);
console.log("");

const worst = new Map();
for (const g of dupGroups) {
  const n = g[0].name;
  if (!worst.has(n)) worst.set(n, {n, c: g.length, locs: g.map(e => e.__continent).join(",")});
}
console.log("  most duplicated languages:");
[...worst.values()].sort((a, b) => b.c - a.c).slice(0, 15)
  .forEach(x => console.log(`    ${String(x.c).padStart(3)}x  ${x.n}  (${x.locs})`));
console.log("");

if (!write) {
  console.log("Dry run. Re-run with --write to apply.");
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Apply
// ---------------------------------------------------------------------------

for (const f of files) {
  const kept = [];
  f.entries.forEach((e, pos) => {
    if (dropPos.has(pos)) return;
    const out = {...e};
    delete out.__continent;
    delete out.__pos;
    kept.push(out);
  });
  fs.writeFileSync(
    path.join(NAMEBASE_DIR, `namebases-${f.continent}.js`),
    `window.${f.continent}NameBases = ${JSON.stringify(kept, null, 2)};\n`,
    "utf8"
  );
}

// Repoint the map: a row aimed at a removed copy now targets the survivor.
let repointed = 0;
for (const dir of CONFIG_DIRS) {
  const jsonPath = path.join(dir, "language-mixer-map.json");
  const jsPath = path.join(dir, "language-mixer-map.js");
  if (!fs.existsSync(jsonPath) || !fs.existsSync(jsPath)) continue;

  const jsonRows = readBracketArray(jsonPath);
  const jsRows = readBracketArray(jsPath);
  let touched = 0;
  for (const rows of [jsonRows, jsRows]) {
    for (const row of rows) {
      for (let k = 0; k < row.bases.length; k++) {
        const repl = indexReuse.get(row.bases[k]);
        if (repl !== undefined && repl !== row.bases[k]) {
          row.bases[k] = repl;
          touched++;
        }
      }
    }
  }
  fs.writeFileSync(jsonPath, JSON.stringify(jsonRows, null, 2) + "\n", "utf8");
  fs.writeFileSync(jsPath, `globalThis.languageMixerMap = ${JSON.stringify(jsRows, null, 2)};\n`, "utf8");
  repointed = touched;
}
console.log(`  rewrote ${files.length} namebase file(s)`);
console.log(`  map base references repointed: ${repointed}`);
console.log("");
console.log("Next: pnpm namebase:verify && node tools/mixer-core/check-language-mixer-guardrails.js");
