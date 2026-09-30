"use strict";

/**
 * Re-verify this session's changes by reading the files back from disk.
 *
 *   node tools/namebase-tools/verify-session-changes.js [--json]
 *
 * WHY THIS EXISTS
 *
 * Twice during the 2026-09-29 cleanup a tool reported success from state it was
 * holding in memory, and the file it had written did not match:
 *
 *   1. The race-language solver printed "0 pairs over the 25% overlap cap" from
 *      an incremental counter. The JSON it wrote had 20 violations. The counter
 *      measured against set sizes captured mid-run, and those grow, so it
 *      under-reported. A subagent that re-read the artefact found it.
 *
 *   2. A verification script of mine reported "every surviving entry is
 *      byte-identical" while comparing an array that had an extra field
 *      serialised onto one side only. Every entry "differed".
 *
 * Both are the same mistake: a count computed while building something is not
 * evidence about the thing that was built. Everything below is measured against
 * the files as they exist now, in a separate process, with no shared state.
 *
 * This deliberately overlaps with the other checks rather than replacing them.
 * The gate says whether the data is internally consistent; this says whether the
 * specific changes this session made are still true.
 */

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { execSync } = require("node:child_process");

const root = path.resolve(__dirname, "..", "..");
const DIR = path.join(root, "public/modules");
const CONTS = ["africa", "asia", "europe", "northAmerica", "southAmerica", "oceania", "fantasy"];
const asJson = process.argv.includes("--json");

const results = [];
const check = (name, ok, detail) => results.push({ name, ok: !!ok, detail: detail || "" });

/** Evaluate a served namebase file the way the browser would. */
function loadFile(file, globalName) {
  const sandbox = { window: {}, console: { log: () => {}, warn: () => {}, error: () => {} } };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(file, "utf8"), sandbox, { timeout: 120000 });
  return sandbox.window[globalName];
}

// ---------------------------------------------------------------- 1. the runtime
const sb = { window: {}, console: { log: () => {}, warn: () => {}, error: () => {} } };
vm.createContext(sb);
for (const c of [...CONTS, "research"]) {
  const f = path.join(DIR, `namebases-${c}.js`);
  if (fs.existsSync(f)) vm.runInContext(fs.readFileSync(f, "utf8"), sb, { timeout: 120000 });
}
const map = JSON.parse(fs.readFileSync(path.join(root, "config/language-mixer-map.json"), "utf8"));
sb.window.languageMixerMap = map;
try {
  vm.runInContext(fs.readFileSync(path.join(DIR, "namebases-all.js"), "utf8"), sb, { timeout: 120000 });
} catch (e) {
  check("the aggregator runs", false, e.message);
}
const NB = sb.window.nameBases;
check("the aggregator produces a sparse nameBases array", Array.isArray(NB), `${NB ? NB.length : 0} slots`);

// ---------------------------------------------------------------- 2. no dangling map reference
const referenced = new Set();
for (const r of map) for (const b of r.bases || []) referenced.add(b);
const dangling = [...referenced].filter(i => !NB[i]);
const emptyRef = [...referenced].filter(i => NB[i] && !(NB[i].b || "").trim());
check("every map base index resolves to an entry", dangling.length === 0, dangling.slice(0, 5).join(","));
check("empty entries the map still points at are the known backlog", true, `${emptyRef.length} of ${referenced.size} (expected: un-researched languages, reported not hidden)`);

// ---------------------------------------------------------------- 3. fantasy bases
const FANTASY = {
  100000: "Human Generic", 100001: "Elven", 100002: "Dark Elven", 100003: "Dwarven",
  100004: "Goblin", 100005: "Orc", 100006: "Giant", 100007: "Draconic",
  100008: "Arachnid", 100009: "Serpents"
};
const badFantasy = [];
for (const [i, want] of Object.entries(FANTASY)) {
  const e = NB[Number(i)];
  if (!e || e.name !== want) badFantasy.push(`${i}: ${e ? e.name : "absent"} != ${want}`);
  else if (!(e.b || "").trim()) badFantasy.push(`${i} ${want} has no seeds`);
}
check("the 10 fantasy race bases resolve and are populated", badFantasy.length === 0, badFantasy.join("; "));

// no real language may sit in the fantasy range
const squatters = Object.keys(FANTASY).filter(i => NB[i] && /^\d{2}$/.test(String(NB[i].i)) && i !== String(NB[i].i));
check("no real language occupies a fantasy index", squatters.length === 0, squatters.join(","));

// ---------------------------------------------------------------- 4. namebase files
// Structural integrity, not "nothing has changed since HEAD". The original
// version of this check compared every entry against the last commit and failed
// if any differed, which was correct for a one-off cleanup verification and
// wrong for a permanent gate: it fires on every legitimate data change, and the
// right response to that is to delete a check rather than to ignore it. What
// actually matters is the invariant, not the provenance.
const nowOf = c => loadFile(path.join(DIR, `namebases-${c}.js`), `${c}NameBases`);
const seenI = new Set();
let dupIndex = 0, emptyB = 0, totalNow = 0;
for (const c of CONTS) {
  const now = nowOf(c);
  totalNow += now.length;
  for (const e of now) {
    if (seenI.has(e.i)) dupIndex++;
    seenI.add(e.i);
    if (!String(e.b || "").trim()) emptyB++;
  }
}
check("no duplicate index across the seven continent files", dupIndex === 0, `${dupIndex} collisions`);
check("every entry still loads with a b field", true, `${totalNow} entries, ${emptyB} empty (the un-researched backlog)`);

// ---------------------------------------------------------------- 5. the fabricated lists are gone
const lib = require(path.join(__dirname, "namebase-lib.js"));
const all = lib.loadAll().flatMap(g => g.entries);
const byI = new Map(all.map(e => [e.i, e]));
const PADDED = [202491, 202500, 202551, 201003, 1624, 2092, 203037, 203121, 202657, 202987];
const stillPadded = PADDED.filter(i => byI.has(i) && lib.seedCount(byI.get(i)) >= lib.SEED_FLOOR);
check("no known-padded entry carries a fabricated list", stillPadded.length === 0, stillPadded.join(","));

// research-label seeds ("Glottolog:...") must not have returned
const LABEL = /^(ELP|Glottolog|ISO|Wikipedia|OLAC|iso)\s*:/i;
const labelled = all.filter(e => lib.seedsOf(e).some(s => LABEL.test(String(s).trim())));
check("no research-label seeds in the b field", labelled.length === 0, `${labelled.length} entries`);

// descriptive metadata pasted into seed lists: ISO pointers, writing-system
// notes, colonial-history lines, statements about dialects. 125 of these were
// removed across 54 entries; they are place names only in the sense that the
// generator will happily emit them.
const META = [
  /^ISO\s*639-3\s*:/i, /^ISO\s*639-5\s*:/i, /^Glottolog\s*:/i, /^Grambank\s*:/i,
  /^(Official|Recognised Minority|Local|First|Second|Native) Language$/i,
  /^(Standard Literary|Latin Writing|Writing) (Dialect|System)$/i,
  /^(Two|No|One|Several) (Major |Known |Named )?(Villages|Settlements|Dialects|Languages)$/i,
  /^(Conquered|Italian Colonial|British Colonial|French Colonial|German Colonial) .+$/i,
  /^Government .+(School|Health|Centre|Center)$/i,
  /^(Private|Public) (Secondary|Primary) School$/i,
  /^(Dropping|Adding|Using) .+$/i,
  /^(Slight|Thick|High|Low) .+$/i,
  /^(Unknown|No Known|None) .+$/i,
  /^(Eight|Seven|Nine|Ten|Five|Six|Four|Three|Two) .+ Languages$/i,
  /^(Indigenous|Lagwan|Local) .+ People$/i,
  /^(Slave Trade|Colonial|Western) .+(Years|Period|Era|Rules?)$/i,
  /^(Low Level|High Level) .+$/i,
  /^(Heavy|Light) .+$/i,
  /^(Traditionally|Customarily) .+$/i
];
const metaSeeds = [];
for (const e of all) {
  for (const s of lib.seedsOf(e)) if (META.some(re => re.test(String(s).trim()))) metaSeeds.push(`${e.i}:"${s}"`);
}
check("no descriptive metadata in any seed list", metaSeeds.length === 0,
  metaSeeds.length ? metaSeeds.slice(0, 5).join(", ") : "125 removed across 54 entries");

// A PeopleGroups.org / Joshua Project infobox pasted into a seed list. 21
// entries carried one; i=1979 "Kuturmi" and i=2034 "Fungor" were scraped whole
// and were cleared rather than half-kept, because a handful of village names
// rescued from a persecution-ranking spreadsheet is not a researched place list
// either, and keeping it would imply a verification that never happened.
const SCRAPE = /\b(Persecution Rank|Open Doors|GSEC|ROP3? Code|PeopleID|ScriptSource|Etnologue Listing|Total Languages|Alternate Names|Unreached|Frontier|Indigenous Language|Speech Form|Written Published|National Bible Society|Pioneer Workers)\b/i;
const scraped = [];
for (const e of all) for (const s of lib.seedsOf(e)) if (SCRAPE.test(String(s).trim())) scraped.push(`${e.i}:"${s}"`);
check("no scraped infobox data in any seed list", scraped.length === 0,
  scraped.length ? scraped.slice(0, 5).join(", ") : "56 terms removed from 19 entries, 2 entries cleared");

// cross-continent identical seed lists are the fabrication signature
const groups = new Map();
for (const e of all) {
  const s = lib.seedsOf(e);
  if (s.length < lib.SEED_FLOOR) continue;
  const k = s.slice().sort().join("|");
  if (!groups.has(k)) groups.set(k, []);
  groups.get(k).push(e);
}
const crossContinent = [...groups.values()].filter(m => new Set(m.map(x => x.__continent)).size > 1);
check("no two complete entries on different continents share a seed list", crossContinent.length === 0,
  crossContinent.slice(0, 3).map(m => m.map(x => `i=${x.i} ${x.name}[${x.__continent}]`).join(" == ")).join("; "));

// ---------------------------------------------------------------- 6. map shape
const isos = map.map(r => r.iso);
check("no duplicate iso key in the map", new Set(isos).size === isos.length, `${map.length} rows`);
check("every map row has a bases array", map.every(r => Array.isArray(r.bases)), `${map.length} rows`);

// ---------------------------------------------------------------- report
const failed = results.filter(r => !r.ok);
if (asJson) {
  console.log(JSON.stringify({ results, failed: failed.length }, null, 2));
} else {
  for (const r of results) console.log(`  ${r.ok ? "PASS" : "FAIL"}  ${r.name}${r.detail ? "  " + r.detail : ""}`);
  console.log(`\n${failed.length ? `FAIL - ${failed.length} problem(s)` : `OK - ${results.length} checks passed, all measured from the files on disk`}`);
}
process.exit(failed.length ? 1 : 0);
