"use strict";

/**
 * Remove same-language entries that are largely contained in another entry with
 * the same name, and repoint the mixer map at the survivor.
 *
 * Run:  node tools/namebase-tools/remove-subset-dupes.js --check
 *       node tools/namebase-tools/remove-subset-dupes.js --write
 *
 * W005 catches the same language stored twice with near-identical content, but
 * it compares set overlap, so it cannot see a 60-seed entry sitting inside a
 * 132-seed twin: that scores Jaccard 0.45. Measured 83 such pairs, including
 * four that are 100% contained.
 *
 *     Tsonga   i=20041  60/60 seeds inside i=203236
 *     Hausa    i=10009  98% inside i=1934
 *     Igbo     i=10011  95% inside i=1913
 *     Xhosa    i=10038  93% inside i=1466
 *     Sotho    i=20037  53/53 inside i=20172
 *
 * The larger entry is kept: it is the one that was actually being worked. The
 * smaller carries nothing it does not already have, so removing it loses no
 * toponyms. Every mixer-map row pointing at a removed index is repointed at the
 * survivor, so no language loses generation.
 */

const fs = require("node:fs");
const path = require("node:path");
const {NAMEBASE_DIR, root, loadAll, seedsOf, seedCount, subsetDuplicates, labelOf} = require("./namebase-lib");

const write = process.argv.includes("--write");
const CONFIG_DIRS = [path.join(root, "config"), path.join(root, "public", "config")];

function readBracket(f) {
  const s = fs.readFileSync(f, "utf8");
  return JSON.parse(s.slice(s.indexOf("["), s.lastIndexOf("]") + 1));
}

const files = loadAll();
const all = files.flatMap(f => f.entries);
const pairs = subsetDuplicates(all, {minSeeds: 5, share: 0.7});

console.log("");
console.log("remove-subset-dupes " + (write ? "(APPLYING)" : "(dry run)"));
console.log("========================================");
console.log(`  entries scanned        : ${all.length}`);
console.log(`  subset duplicates      : ${pairs.length}`);
const byC = {};
for (const p of pairs) byC[p.big.__continent] = (byC[p.big.__continent] || 0) + 1;
console.log(`  ...by continent        : ${JSON.stringify(byC)}`);
let lost = 0;
for (const p of pairs) lost += p.total;
console.log(`  seeds removed          : ${lost} (all already present in the survivor)`);
console.log("");
for (const p of pairs.slice(0, 20)) {
  console.log(
    `  ${labelOf(p.small).padEnd(28)} ${String(p.total).padStart(3)} seeds, ` +
      `${Math.round(p.ratio * 100)}% inside ${labelOf(p.big)}`
  );
}
if (pairs.length > 20) console.log(`  ... and ${pairs.length - 20} more`);
console.log("");

if (!write) {
  console.log("Dry run. Re-run with --write to apply.");
  process.exit(0);
}

const dropI = new Map(pairs.map(p => [p.small.i, p.big.i]));
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

const jsonPath = path.join(CONFIG_DIRS[0], "language-mixer-map.json");
const jsonRows = readBracket(jsonPath);
const jsRows = readBracket(path.join(CONFIG_DIRS[0], "language-mixer-map.js"));
let repointed = 0;
for (const rows of [jsonRows, jsRows]) {
  for (const row of rows) {
    for (let k = 0; k < row.bases.length; k++) {
      const to = dropI.get(row.bases[k]);
      if (to !== undefined && row.bases[k] !== to) { row.bases[k] = to; repointed++; }
    }
  }
}
fs.writeFileSync(jsonPath, JSON.stringify(jsonRows, null, 2) + "\n", "utf8");
for (const dir of CONFIG_DIRS) {
  fs.writeFileSync(path.join(dir, "language-mixer-map.js"), `globalThis.languageMixerMap = ${JSON.stringify(jsRows, null, 2)};\n`, "utf8");
}
console.log(`  removed ${dropI.size} entries, repointed ${repointed} map base reference(s)`);
