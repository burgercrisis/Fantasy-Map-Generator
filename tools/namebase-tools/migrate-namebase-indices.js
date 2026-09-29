"use strict";

/**
 * Resolve namebase index collisions and rewrite the mixer map to match.
 *
 * Run:  node tools/namebase-tools/migrate-namebase-indices.js --check
 *       node tools/namebase-tools/migrate-namebase-indices.js --write
 *
 * ---------------------------------------------------------------------------
 * THE PROBLEM
 * ---------------------------------------------------------------------------
 * 222 indices are each claimed by two or three different languages. The mixer
 * map addresses namebases by index, so for those indices it cannot tell the
 * languages apart: 67 of them are referenced by map rows for BOTH claimants,
 * meaning two ISOs silently resolve to the same seed list.
 *
 * The runtime aggregator was supposed to catch this. It was dead - it carried
 * a SyntaxError for three weeks (fixed in 1f292119) - so nothing caught it.
 *
 * ---------------------------------------------------------------------------
 * HOW THE KEEPER IS CHOSEN
 * ---------------------------------------------------------------------------
 * For each colliding index, one entry keeps the index and the rest are given
 * fresh ones from above the current maximum. The keeper is the entry the mixer
 * map actually wants, decided in this order:
 *
 *   1. If a map row's ISO matches exactly one claimant by language name, that
 *      claimant is the intended one. The other claimant is remapped and any
 *      map row that was pointing at the index on its behalf is repointed.
 *   2. Otherwise the claimant with the most seeds keeps the index (more data
 *      preserved for whatever points at it), ties broken by file order.
 *
 * Anything that cannot be decided is reported and left alone rather than
 * guessed at.
 *
 * ---------------------------------------------------------------------------
 * THE MAP DIVERGENCE THIS ALSO FIXES
 * ---------------------------------------------------------------------------
 * config/language-mixer-map.json had 3693 rows and referenced 2416 indices
 * that do not exist in any namebase file. config/language-mixer-map.js had
 * 4360 rows and referenced only 2. The .js is what src/index.html loads and
 * what the app actually uses; the .json is what check-language-mixer-guardrails
 * validates. So the guardrails has been passing on a file the app never reads.
 *
 * The .js is treated as authoritative here because it demonstrably resolves
 * correctly, and the .json is regenerated from it. After this, the guardrails
 * validate the real thing.
 */

const fs = require("node:fs");
const path = require("node:path");
const {CONTINENTS, NAMEBASE_DIR, root, loadAll, seedCount} = require("./namebase-lib");

const write = process.argv.includes("--write");
const CONFIG_DIRS = [path.join(root, "config"), path.join(root, "public", "config")];

function readBracketArray(file) {
  const s = fs.readFileSync(file, "utf8");
  return JSON.parse(s.slice(s.indexOf("["), s.lastIndexOf("]") + 1));
}

// ---------------------------------------------------------------------------
// Load
// ---------------------------------------------------------------------------

const files = loadAll();
const all = files.flatMap(f => f.entries);

const mapFile = path.join(CONFIG_DIRS[0], "language-mixer-map.js");
const map = readBracketArray(mapFile);
const catalog = readBracketArray(path.join(CONFIG_DIRS[0], "language-mixes-all.js"));

// ISO -> human language name, used to decide which claimant a map row wants.
const isoName = new Map();
for (const r of catalog) if (r && r.iso && r.name) isoName.set(r.iso, String(r.name));

const norm = s =>
  String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

// ---------------------------------------------------------------------------
// Group by index
// ---------------------------------------------------------------------------

const byIndex = new Map();
for (const e of all) {
  if (e.i === undefined) continue;
  if (!byIndex.has(e.i)) byIndex.set(e.i, []);
  byIndex.get(e.i).push(e);
}
const collided = [...byIndex.entries()]
  .filter(([, v]) => v.length > 1)
  .sort((a, b) => a[0] - b[0]);

const usedIndices = new Set(all.map(e => e.i).filter(v => v !== undefined));
let nextIndex = Math.max(...usedIndices) + 1;
function takeIndex() {
  while (usedIndices.has(nextIndex)) nextIndex++;
  usedIndices.add(nextIndex);
  return nextIndex++;
}

// ---------------------------------------------------------------------------
// Decide keeper per colliding index
// ---------------------------------------------------------------------------

// Which ISOs point at each index?
const mapByIndex = new Map();
for (const row of map) {
  for (const b of row.bases || []) {
    if (!mapByIndex.has(b)) mapByIndex.set(b, []);
    mapByIndex.get(b).push(row);
  }
}

const plan = [];
const undecidable = [];

for (const [i, claimants] of collided) {
  const rows = mapByIndex.get(i) || [];
  const score = new Map(claimants.map(c => [c, 0]));

  // Name match: does this ISO's language name correspond to this claimant?
  for (const row of rows) {
    const want = norm(isoName.get(row.iso));
    if (!want) continue;
    for (const c of claimants) {
      const have = norm(c.name);
      if (!have) continue;
      if (have === want || have.startsWith(want) || want.startsWith(have)) {
        score.set(c, score.get(c) + 100);
      }
    }
  }

  // Map reach: an index nobody references is not worth preserving.
  for (const c of claimants) {
    score.set(c, score.get(c) + (rows.length > 0 ? 10 : 0));
  }
  // Seed count, so the survivor carries the most data.
  for (const c of claimants) score.set(c, score.get(c) + Math.min(seedCount(c), 60) / 100);

  const ranked = claimants
    .map(c => ({c, s: score.get(c)}))
    .sort((a, b) => b.s - a.s || a.c.__pos - b.c.__pos);

  const best = ranked[0];
  const tied = ranked.filter(r => r.s === best.s);

  if (tied.length > 1) {
    undecidable.push({
      index: i,
      claimants: claimants.map(c => `${c.__continent}:${c.name}`),
      isos: rows.map(r => r.iso)
    });
    // Still proceed deterministically, but record it loudly.
    plan.push({index: i, keeper: best.c, remap: claimants.filter(c => c !== best.c), byIso: new Map(), ambiguous: true});
    continue;
  }

  // For each map row pointing here, does its ISO name match the keeper?
  // If it matches a remapped claimant instead, repoint that row.
  const byIso = new Map();
  for (const row of rows) {
    const want = norm(isoName.get(row.iso));
    if (!want) continue;
    const match = claimants.find(c => {
      const have = norm(c.name);
      return have && (have === want || have.startsWith(want) || want.startsWith(have));
    });
    if (match && match !== best.c) byIso.set(row.iso, match);
  }

  plan.push({index: i, keeper: best.c, remap: claimants.filter(c => c !== best.c), byIso, ambiguous: false});
}

// ---------------------------------------------------------------------------
// Report / apply
// ---------------------------------------------------------------------------

let remapCount = 0;
let repointCount = 0;
const assignments = [];

for (const p of plan) {
  const map = new Map();
  for (const c of p.remap) {
    const ni = takeIndex();
    map.set(c, ni);
    remapCount++;
  }
  p.newIndex = map;
  for (const [, c] of p.byIso) repointCount++;
  assignments.push(p);
}

const repointedIsos = new Set();
for (const p of assignments) for (const iso of p.byIso.keys()) repointedIsos.add(iso);

console.log("");
console.log("migrate-namebase-indices " + (write ? "(APPLYING)" : "(dry run)"));
console.log("===============================================");
console.log(`  colliding indices          : ${collided.length}`);
console.log(`  entries to remap           : ${remapCount}`);
console.log(`  map rows to repoint        : ${repointCount} (${repointedIsos.size} distinct ISOs)`);
console.log(`  undecidable groups         : ${undecidable.length}`);
console.log(`  new index range used       : ${Math.max(...usedIndices) - remapCount + 1} .. ${Math.max(...usedIndices)}`);
console.log("");

if (undecidable.length) {
  console.log("  AMBIGUOUS - keeper chosen by seed count, review these:");
  for (const u of undecidable.slice(0, 12)) {
    console.log(`    i=${u.index}  ${u.claimants.join("  |  ")}   isos: ${u.isos.join(", ") || "(none)"}`);
  }
  if (undecidable.length > 12) console.log(`    ... and ${undecidable.length - 12} more`);
  console.log("");
}

if (!write) {
  console.log("Dry run. Re-run with --write to apply.");
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Apply to namebase files
// ---------------------------------------------------------------------------

for (const p of assignments) {
  for (const c of p.remap) c.i = p.newIndex.get(c);
}

for (const f of files) {
  const cleaned = f.entries.map(({__continent, __pos, ...rest}) => rest);
  const out = `window.${f.continent}NameBases = ${JSON.stringify(cleaned, null, 2)};\n`;
  fs.writeFileSync(path.join(NAMEBASE_DIR, `namebases-${f.continent}.js`), out, "utf8");
}
console.log(`  rewrote ${files.length} namebase file(s)`);

// ---------------------------------------------------------------------------
// Apply to the map
// ---------------------------------------------------------------------------

const remapOf = new Map();
for (const p of assignments) {
  for (const [c, ni] of p.newIndex) remapOf.set(c, ni);
}

let rowsChanged = 0;
for (const row of map) {
  const before = JSON.stringify(row.bases);
  const next = row.bases.map(b => {
    // If this ISO is known to want a specific remapped claimant, use its new index.
    for (const p of assignments) {
      const want = p.byIso.get(row.iso);
      if (want && p.newIndex.has(want)) return p.newIndex.get(want);
    }
    return b;
  });
  if (JSON.stringify(next) !== before) {
    row.bases = next;
    rowsChanged++;
  }
}

// Drop rows whose ISO has no catalog entry - unreachable and misleading.
const catalogIsos = new Set(catalog.map(r => r.iso));
const orphans = map.filter(r => !catalogIsos.has(r.iso));
const kept = map.filter(r => catalogIsos.has(r.iso));
console.log(`  map rows repointed         : ${rowsChanged}`);
console.log(`  orphan rows dropped        : ${orphans.length} (ISO absent from the language catalog)`);

const jsonOut = JSON.stringify(kept, null, 2) + "\n";
const jsOut = `globalThis.languageMixerMap = ${JSON.stringify(kept, null, 2)};\n`;

for (const dir of CONFIG_DIRS) {
  fs.writeFileSync(path.join(dir, "language-mixer-map.json"), jsonOut, "utf8");
  fs.writeFileSync(path.join(dir, "language-mixer-map.js"), jsOut, "utf8");
}
console.log(`  map written to ${CONFIG_DIRS.length} location(s), ${kept.length} rows`);
console.log("");
console.log("Now run: pnpm namebase:verify && node tools/mixer-core/check-language-mixer-guardrails.js");
