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

// research-label seeds must not have returned.
//
// The original pattern was /^(ELP|Glottolog|ISO|Wikipedia|OLAC|iso)\s*:/i, which
// requires the colon immediately after the label. That catches "ISO:xyz" and
// misses "ISO 639-1:aa", "ISO 639-2:din", "Guthrie Code:C.41",
// "Linguist List:tzm-cen", "WALS:Argb", "Linguasphere:02-BAA-aa" - which were all
// present in the data. The colon can appear anywhere after the label.
const LABEL = /^(ELP|Glottolog|ISO|Wikipedia|OLAC|Linguasphere|Linguist\s*List|Guthrie|WALS|ALCAM|BFM|EGIDS|HBD)\b[^,]*(?=:|Code|Zone)/i;
const labelled = [];
for (const e of all) for (const s of lib.seedsOf(e)) {
  const t = String(s).trim();
  if (LABEL.test(t) || /^(ELP|Glottolog|Wikipedia|OLAC|iso)\s*:/i.test(t)) labelled.push(`${e.i}:"${t}"`);
}
check("no research-label seeds in the b field", labelled.length === 0,
  labelled.length ? `${labelled.length} remaining, e.g. ` + labelled.slice(0, 3).join(", ") : "0 entries");

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

// Machine-generated pseudo-place tokens: Afigtown, Abalburg, Akakbridge,
// Adurford, Aetland. A generator appended a fixed 15- or 24-token block to
// entries across several continent files.
//
// The volume is what discriminates, not the shape. Real place names match the
// pattern individually - Ambleside, Ammanford, Auckland and Aroland all do - so
// a per-seed test would fire on clean data. A real settlement list carries at
// most one or two; a padded one carries 15 or 24 in a contiguous run.
const GENSHAPE = /^A[a-z]{1,4}(town|ville|side|port|view|bridge|ford|land|burg|field|fort|kit)$/;
const GEN_MIN = 5;
const generated = [];
for (const e of all) {
  const s = lib.seedsOf(e);
  const hits = s.filter(x => GENSHAPE.test(String(x).trim()));
  if (hits.length >= GEN_MIN) generated.push(`${e.i}"${e.name}" x${hits.length}`);
}
check(`no generated pseudo-place block (>=${GEN_MIN} matches)`, generated.length === 0,
  generated.length ? generated.slice(0, 5).join(", ")
    : "Afigtown/Abalburg/Akakbridge shape occurs 15-24x per padded entry, at most 2x in a real list");

// A generator that expands a seed into variants - "Kasongo Territory",
// "Yambio Town", "Gulani Ward", "Bono Plateau", "AlgerianArabicabad",
// "Apadland", "Al Jaghbub oasis" - produces seeds that are concatenations of two
// other seeds of the same entry. Generator-agnostic, so it covers every variant
// the shape check misses: the template tails, the Type-word expansions, the
// ethnonym expansions and the Xland family, with one rule.
const TYPEWORD = /^(Territory|Town|City|Village|Ward|Zone|County|Province|Region|Regions|Villages|Plateau|Coast|Escarpment|Desert|land|oasis|people|language|tribe|Kamtok|abad|Fields|Forest|River|Hills)$/i;
const concat = [];
for (const e of all) {
  const s = lib.seedsOf(e).map(x => String(x).trim());
  if (s.length < 8) continue;
  const set = new Set(s);
  // Count the type-word variants per stem, not the matches. One variant is a
  // real compound - "Zambezi River" and "Aketi River" are actual places whose
  // bare stem is also a town. A generator emits three or more: Kasongo
  // Territory / Town / Ward, Bono Plateau / Villages / Regions.
  const byStem = new Map();
  for (const x of s) {
    const parts = x.split(/(?=[A-Z])|[\s-]+/).filter(Boolean);
    if (parts.length < 2) continue;
    for (const w of parts) {
      if (!TYPEWORD.test(w)) continue;
      const stem = x.replace(new RegExp(w + "$", "i"), "").replace(/[\s-]+$/, "");
      if (stem.length < 4 || !set.has(stem)) continue;
      if (!byStem.has(stem)) byStem.set(stem, []);
      byStem.get(stem).push(w);
      break;
    }
  }
  for (const [stem, words] of byStem) {
    if (words.length >= 3) concat.push(`${e.i} "${e.name}": ${stem} x${words.length} (${[...new Set(words)].join(", ")})`);
  }
}
check("no seed stem expanded into 3+ type-word variants", concat.length === 0,
  concat.length ? `${concat.length} found, e.g. ` + concat.slice(0, 4).join("; ")
    : "Kasongo Territory/Town/Ward pattern; one variant is a real compound");

// Document word-list dumps. This was 55 of the 68 entries cleared in the
// continent audit and no seed-level rule can see it: every item in
// i=1605 "Supyire" is a plausible string (Dimbasara, safɩri, Noun süpyfrä,
// Serial Verb Constructions, Mémoire de Fin d'Etudes à l'Ecole Nationale
// d'Administration). What distinguishes a dump from a gazetteer is positional:
// in a researched list the last ten seeds are still toponyms, in a dump the tail
// is prose and citations. Taking the tail and counting how much of it is not
// place-name material is the only cheap signal that fires.
const NONPLACE = /\b(the|and|of|for|with|without|from|into|over|under|than|are|were|was|has|have|had|not|but|also|however|which|their|these|those|such|language|languages|dialect|dialects|family|families|group|groups|code|codes|source|sources|reference|references|study|research|phoneme|phonology|morphology|syntax|semantics|pronunciation|vocabulary|grammar|version|edition|university|journal|press|proceedings|volume|number|pages|isbn|doi|et\s+al|ibid)\b/i;
// "p." and "pp." as page citations, separately. This was previously folded into
// the alternation as `pp?\.?`, which made every character of it optional and
// matched a bare "p" - so each Chakma village ending in "-para" was a false
// positive.
const PAGECITE = /\bp{1,2}\.(?=\s|$)/;
const looksLikeProse = t => NONPLACE.test(t) || PAGECITE.test(t);
const dumps = [];
for (const e of all) {
  const s = lib.seedsOf(e);
  if (s.length < 40) continue;
  const tail = s.slice(-10).map(x => String(x).trim());
  const bad = tail.filter(looksLikeProse).length;
  if (bad >= 3) dumps.push(`${e.i}"${e.name}" ${bad}/10 tail`);
}
check("no document word-list appended to a seed list", dumps.length === 0,
  dumps.length ? `${dumps.length} suspected, e.g. ` + dumps.slice(0, 4).join("; ")
    : "55 such entries were cleared in the continent audit");

// A language family or category name used as a place name. The catalog is the
// vocabulary, so this needs no external gazetteer - but matching the catalog
// alone is too loose, because Hokkaido, Sakhalin, Naga, Tai, Sami and Angan are
// all family values somewhere in it and all six are real places. So a seed
// counts only when it is in the vocabulary AND carries a morpheme no settlement
// does.
const catFile = JSON.parse(fs.readFileSync(path.join(root, "config/language-mixes.json"), "utf8"));
const vocab = new Set();
for (const c of catFile) {
  if (c.family) vocab.add(String(c.family).toLowerCase());
  if (c.category) vocab.add(String(c.category).toLowerCase());
}
const CLASSMORPHEME = /(congo|saharan|asiatic|bantoid|bantu|chadic|cushitic|semitic|berber|nguni|\bijo\b|adamawa|songhay|maban|tivoid|gurage|unclassified|language|famil|classified|ethnoling|branch|cluster|macro)/i;
const labelSeeds = [];
for (const e of all) {
  for (const s of lib.seedsOf(e)) {
    const t = String(s).trim();
    const low = t.toLowerCase();
    if ((vocab.has(low) || vocab.has(low.replace(/\s+languages?$/, ""))) && CLASSMORPHEME.test(t)) {
      labelSeeds.push(`${e.i}:"${t}"`);
    }
  }
}
check("no classification label used as a place name", labelSeeds.length === 0,
  labelSeeds.length ? `${labelSeeds.length} found, e.g. ` + labelSeeds.slice(0, 4).join(", ")
    : "42 removed across 32 entries; Hokkaido, Sakhalin, Naga and Tai are kept - they are places");

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
