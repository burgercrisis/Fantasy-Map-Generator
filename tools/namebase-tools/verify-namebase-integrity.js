"use strict";

/**
 * Namebase integrity gate.
 *
 * Run:  node tools/namebase-tools/verify-namebase-integrity.js
 *       node tools/namebase-tools/verify-namebase-integrity.js --json
 *
 * Exits 0 when clean, 1 when any ERROR is present.
 *
 * DESIGN RULE: a check may only be an ERROR if it is mechanically decidable
 * and cannot be satisfied by writing more text. That is the entire point.
 * "Are these 40 place names authentic?" is a judgement call and is NOT an
 * error - it is a work item, reported as a WARNING, because a gate that
 * encodes a judgement call gets argued with and then disabled.
 *
 * What IS an error is the specific set of mechanical tells that the previous
 * verification passes left behind:
 *   - rows in the array that are not namebase objects
 *   - entries missing name or index
 *   - duplicate indices
 *   - synthetic padding (language name + a random letter, or a generic
 *     English toponym template) appended to reach the seed floor
 *   - the same seed listed twice in one entry
 *   - an entry claiming status COMPLETE while it is not actually complete
 *
 * The padding checks are the important ones. The previous process tracked
 * "does this entry have 25+ names" as its only metric, so the cheapest way to
 * move that metric was to append junk, and 8,277 such seeds were injected.
 * Making that an error removes the incentive entirely.
 *
 * ---------------------------------------------------------------------------
 * THE RATCHET
 * ---------------------------------------------------------------------------
 * A gate is only useful if it can be green, and it is only trusted if it
 * cannot be quietly widened. Some defects cannot be fixed safely in the same
 * change that introduces the gate - notably index collisions where two
 * different languages share one index, which needs an index migration that
 * also rewrites config/language-mixer-map.json.
 *
 * Rather than leave those permanently red (which trains everyone to ignore
 * red) or drop them (which loses them), they are recorded in
 * docs/verification/integrity-baseline.json. The gate then enforces:
 *
 *   actual count > baseline  -> FAIL. Known debt may shrink, never grow.
 *   actual count <= baseline -> pass, and report the improvement.
 *
 * So the gate is green today, any new collision fails immediately, and the
 * baseline becomes a visible debt ledger rather than a hidden excuse. Raising
 * a baseline requires --update-baseline, and that diff is the only way to make
 * things worse - which means it gets reviewed like any other change.
 */

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const {
  CONTINENTS,
  SEED_FLOOR,
  root,
  loadAll,
  seedCount,
  detectStemPadding,
  detectTemplatePadding,
  detectNonPlaceTokens,
  findDuplicateSeeds,
  buildSeedFrequency,
  contaminationFor,
  findPastedBlocks,
  detectSelfNamedSeeds,
  nearIdenticalPairs,
  continentMismatches,
  subsetDuplicates,
  alpha,
  labelOf
} = require("./namebase-lib");

const asJson = process.argv.includes("--json");
const quiet = process.argv.includes("--quiet");
const updateBaseline = process.argv.includes("--update-baseline");

const BASELINE_PATH = path.join(root, "docs", "verification", "integrity-baseline.json");

const errors = [];
const warnings = [];
const backlog = [];

const err = (code, file, msg) => errors.push({code, file, msg});
const warn = (code, file, msg) => warnings.push({code, file, msg});

// ---------------------------------------------------------------------------
// Load
// ---------------------------------------------------------------------------

let files;
try {
  files = loadAll();
} catch (e) {
  console.error(`[FATAL] could not load namebase files: ${e.message}`);
  process.exit(1);
}

// A continent that will not parse is a finding in its own right, not a reason to
// abandon every other check.
for (const f of files) {
  if (f.error) {
    err("S001", `namebases-${f.continent}.js`, `will not parse, so no check ran on it: ${f.error}`);
  }
}

// ---------------------------------------------------------------------------
// E001 / E002 - structural corruption
// ---------------------------------------------------------------------------

for (const f of files) {
  const short = `namebases-${f.continent}.js`;

  for (const g of f.garbage) {
    err(
      "E001",
      short,
      `array position ${g.pos} is ${JSON.stringify(g.value)} - a bare value where a ` +
        `namebase object is required. These are orphaned index references, not entries.`
    );
  }

  for (const e of f.entries) {
    if (e.i === undefined) {
      err("E002", short, `${e.name} has no "i" index.`);
    }
    if (typeof e.name !== "string" || !e.name.trim()) {
      err("E002", short, `array position ${e.__pos} has an empty name.`);
    }
  }
}

// ---------------------------------------------------------------------------
// E003 / E004 - duplicate indices
// ---------------------------------------------------------------------------

for (const f of files) {
  const short = `namebases-${f.continent}.js`;
  const byIndex = new Map();
  for (const e of f.entries) {
    if (e.i === undefined) continue;
    if (!byIndex.has(e.i)) byIndex.set(e.i, []);
    byIndex.get(e.i).push(e.name);
  }
  for (const [i, names] of byIndex) {
    if (names.length > 1) {
      err("E003", short, `index ${i} is used ${names.length}x: ${names.join(" | ")}`);
    }
  }
}

const globalIndex = new Map();
for (const f of files) {
  for (const e of f.entries) {
    if (e.i === undefined) continue;
    if (!globalIndex.has(e.i)) globalIndex.set(e.i, []);
    globalIndex.get(e.i).push(`${f.continent}:${e.name}`);
  }
}
for (const [i, where] of globalIndex) {
  if (where.length > 1) {
    err("E004", "multiple", `index ${i} is claimed by ${where.length} entries: ${where.join(" | ")}`);
  }
}

// ---------------------------------------------------------------------------
// E005 / E006 / E007 - synthetic padding and duplicates
// ---------------------------------------------------------------------------

const allEntries = files.flatMap(f => f.entries);

for (const e of allEntries) {
  const short = `namebases-${e.__continent}.js`;

  const stem = detectStemPadding(e);
  if (stem.length) {
    err(
      "E005",
      short,
      `${labelOf(e)} has ${stem.length} synthetic seed(s) formed by appending a ` +
        `letter to the language name: ${stem.slice(0, 6).join(", ")}` +
        `${stem.length > 6 ? ", ..." : ""}`
    );
  }

  const templ = detectTemplatePadding(e);
  if (templ.length) {
    err(
      "E006",
      short,
      `${labelOf(e)} has ${templ.length} generic template seed(s) ` +
        `(A+suffix filler): ${templ.slice(0, 6).join(", ")}` +
        `${templ.length > 6 ? ", ..." : ""}`
    );
  }

  const dupes = findDuplicateSeeds(e);
  if (dupes.length) {
    err("E007", short, `${labelOf(e)} repeats ${dupes.length} seed(s): ${dupes.slice(0, 8).join(", ")}`);
  }

  const nonPlace = detectNonPlaceTokens(e);
  if (nonPlace.length) {
    err(
      "E009",
      short,
      `${labelOf(e)} has ${nonPlace.length} seed(s) that cannot be place names ` +
        `(they start with a digit, so they are dates, counts or footnotes): ` +
        `${nonPlace.slice(0, 6).join(", ")}`
    );
  }
}

// ---------------------------------------------------------------------------
// W001 / W002 / E008 - completeness claims
// ---------------------------------------------------------------------------

const freq = buildSeedFrequency(allEntries);

// ---------------------------------------------------------------------------
// W011 - entries carrying an identical seed list
// ---------------------------------------------------------------------------
//
// 467 entries once carried invented place names. They were not random junk: an
// agent was asked to bring entries up to the 25-name floor and filled them with
// whatever was to hand, so a contiguous block of entries in the i=202539..203044
// range all shared one list of ~50 national capitals - Parakou, Wa, Faranah,
// Kumasi, Louga - prefixed by the entry's own name. Lotha, a Naga language of
// India, and Pengo, a language of Angola, ended up with identical seed lists,
// and a Tibetan language listed N'Djamena and Gao.
//
// The floor caused this, so no count-based check can catch it: an entry padded
// to exactly 25 passes every completeness rule. Detecting it properly needs a
// source per language, which is the research backlog, not a gate.
//
// What is left is a warning, not an error, because identical lists are also
// what a legitimate dialect continuum looks like. All 41 groups currently
// reported were checked and every one is a set of varieties of one language
// sharing one settlement area:
//
//   200236/200246/200247/200249  Doteli varieties      Doti, Nepal
//   200375/200376/200377          Monguor languages     Huzhu and Ledu, Qinghai
//   200455/200573                 Rana Tharu, Walungge  western Nepal
//   200500/200555/200559          Southern Tungusic, Udege, Ulch
//   907/1490/200770/200807        Veps dialects         Karelia
//   642/23005                     Standard Italian, Judeo-Italian
//   647/656                       Talian, Venetian
//   928/1085/1087                 Savonian, Tavastian, Hevaha
//   201259/201269/201270/201302   Idu Taraon, Miju, Zakhring   Arunachal
//
// So the check is reported, not enforced: a new group is worth a human look,
// and the ones that exist are documented here. The fabricated 467 were removed
// and are listed by index in docs/verification/research/padded-entries.md.

{
  const MIN = SEED_FLOOR;      // only complete lists are compared
  const groups = new Map();
  for (const e of allEntries) {
    const seeds = String(e.b || "").split(",").filter(Boolean).slice().sort();
    if (seeds.length < MIN) continue;
    const key = seeds.join("|");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(e);
  }
  for (const [, members] of groups) {
    if (members.length < 2) continue;
    const list = members.map(m => `i=${m.i} "${m.name}"`).join(", ");
    warn("W011", `namebases-${members[0].__continent}.js`,
      `${members.length} entries carry an identical ${String(members[0].b || "").split(",").length}-seed list: ` +
      `${list}. Legitimate for dialect varieties of one language; a sign of padding if the ` +
      `members are unrelated or span continents.`);
  }
}

for (const e of allEntries) {
  const short = `namebases-${e.__continent}.js`;
  const n = seedCount(e);
  const status = e.status;

  if (n === 0) {
    warn("W001", short, `${labelOf(e)} has zero seeds but is marked ${status || "(no status)"}.`);
  }

  if (n < SEED_FLOOR) {
    backlog.push({
      continent: e.__continent,
      name: e.name,
      i: e.i,
      seeds: n,
      status: status || "(none)"
    });
  }

  if (status === "COMPLETE" && n < SEED_FLOOR) {
    err(
      "E008",
      short,
      `${labelOf(e)} claims status COMPLETE but has only ${n} seed(s) ` +
        `(floor is ${SEED_FLOOR}). It must be marked WAITING until substantiated.`
    );
  }

  if (status === "COMPLETE" && n >= SEED_FLOOR) {
    const c = contaminationFor(e, freq);
    if (c.shared.length) {
      warn(
        "W003",
        short,
        `${labelOf(e)}: ${c.shared.length}/${n} seeds (${Math.round(c.ratio * 100)}%) are ` +
          `shared with 20+ other entries. Probably copy-paste contamination, ` +
          `e.g. ${c.shared.slice(0, 5).join(", ")}`
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

backlog.sort((a, b) => a.seeds - b.seeds || a.continent.localeCompare(b.continent));

const byContinent = {};
for (const e of allEntries) {
  byContinent[e.__continent] = byContinent[e.__continent] || {total: 0, short: 0, zero: 0};
  byContinent[e.__continent].total++;
  const n = seedCount(e);
  if (n === 0) byContinent[e.__continent].zero++;
  if (n < SEED_FLOOR) byContinent[e.__continent].short++;
}

// ---------------------------------------------------------------------------
// T001 - tools that read data files which no longer exist
// ---------------------------------------------------------------------------
//
// The namebase data used to live in modules/namebases-*.js. It now lives in
// public/modules/. 34 tools still hardcode the old path, so every one of them
// dies with ENOENT the moment it is run. Several of them were being used to
// measure progress during the September verification passes, which means the
// numbers those passes were steering by may have come from tools that could
// not have succeeded.
//
// This checks for the class rather than auditing each tool by hand, so the
// list cannot silently grow.

function walkJs(dir, out = []) {
  for (const e of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "node_modules" || e.name.startsWith(".")) continue;
      walkJs(full, out);
    } else if (e.isFile() && e.name.endsWith(".js")) {
      out.push(full);
    }
  }
  return out;
}

const toolsDir = path.join(root, "tools");
if (fs.existsSync(toolsDir)) {
  const stalePathRefs = [];
  // Two shapes appear in this codebase:
  //   "modules/namebases-africa.js"                       (single literal)
  //   path.join(root, "public/modules", "namebases-africa.js")   (multi-arg join)
  // Matching only the first would undercount by more than half.
  const patterns = [
    /["']((?:modules|config)\/namebases-[A-Za-z0-9._-]+\.js)["']/g,
    /path\.join\(\s*(?:root|__dirname)\s*,\s*["']([A-Za-z0-9._-]+)["']\s*,\s*["'](namebases-[A-Za-z0-9._-]+\.js)["']/g
  ];
  for (const toolPath of walkJs(toolsDir)) {
    const src = fs.readFileSync(toolPath, "utf8");
    for (const re of patterns) {
      let m;
      re.lastIndex = 0;
      while ((m = re.exec(src)) !== null) {
        const ref = m[2] ? `${m[1]}/${m[2]}` : m[1];
        const candidates = [path.join(root, ref), path.join(root, "public", ref)];
        if (!candidates.some(c => fs.existsSync(c))) {
          stalePathRefs.push({tool: path.relative(root, toolPath), ref});
        }
      }
    }
  }
  // One error per distinct tool, not per reference, so the count tracks tools.
  const byTool = new Map();
  for (const s of stalePathRefs) {
    if (!byTool.has(s.tool)) byTool.set(s.tool, s.ref);
  }
  for (const [tool, ref] of byTool) {
    const publicRef = path.join(root, "public", ref);
    const hint = fs.existsSync(publicRef)
      ? `It now lives at public/${ref}.`
      : "No file exists at either path - this data source was deleted outright.";
    err("T001", tool, `reads "${ref}", which does not exist. ${hint}`);
  }
}

// ---------------------------------------------------------------------------
// W004 - pasted blocks of seeds
// ---------------------------------------------------------------------------
//
// W003 ("shares N seeds with 20+ other entries") is too blunt to act on: related
// languages really do share toponyms, and so do diaspora languages that took
// their settlers' names. W004 narrows it to the thing that is never legitimate -
// a run of identical seeds, in the same order, appearing in 20+ unrelated
// entries. That is the copy-paste signature, and it is the list an agent should
// actually work from.

const pasted = findPastedBlocks(allEntries, {run: 8, minEntries: 20});
for (const [e, info] of pasted) {
  warn(
    "W004",
    `namebases-${e.__continent}.js`,
    `${labelOf(e)}: ${info.partners} entries across ${info.continents} continents all contain ` +
      `these 8 seeds - ${info.block.slice(0, 4).join(", ")}, ... Unrelated languages in different ` +
      `continents do not share settlements. Research this language's own toponyms.`
  );
}

// ---------------------------------------------------------------------------
// E010 - research labels pasted into seed fields
// ---------------------------------------------------------------------------
//
// "Javanese macro entry", "Ulch villages,Kamchatka,Russia",
// "Lunda Norte Province", "Harari People", "Annobonese Creole", "Zhoa town",
// "Gwedena,Dagan family,Papua New Guinea". No place is called any of these.
// They are research notes and administrative labels that were pasted into a seed
// field, and they generate nonsense because the Markov chain treats them as
// toponyms.
//
// This is an error, not a warning: the string is provably not a place name, and
// the cleaner removes it mechanically.

for (const e of allEntries) {
  const info = detectSelfNamedSeeds(e);
  for (const label of info.labels) {
    // Two different signals, and they must not share a severity.
    //
    // A seed that IS the entry's own name is how every padded batch was built -
    // the language seeds itself, then a generic city pool follows. Provably not
    // a settlement, so it is an error.
    //
    // A seed that merely CONTAINS the name inside a longer phrase is not. "Fadan
    // Ayu" is the headquarters of Sanga LGA, in the language Ayu, and it is a
    // real place; "Yoro LGA" would likewise be. The word "Ayu" happening to sit
    // inside a village name says nothing about provenance, so this is a warning.
    const isExact = alpha(label) === alpha(e.name);
    if (isExact) {
      err("E010", `namebases-${e.__continent}.js`,
        `${labelOf(e)} has the research label "${label}" in its seed list. That is a note, not a place name.`);
    } else {
      warn("E010", `namebases-${e.__continent}.js`,
        `${labelOf(e)} has the seed "${label}", which contains the language's own name. ` +
        `Real places do this - Fadan Ayu is the seat of Sanga LGA and the language is Ayu - ` +
        `so this is reported, not blocked.`);
    }
  }
}

// ---------------------------------------------------------------------------
// W005 - the same language entered twice
// ---------------------------------------------------------------------------
//
// Restricted to names that match once the "(dedicated)" marker is stripped,
// because a Jaccard of 0.9 between two genuinely DIFFERENT names is usually
// legitimate: Daur and Dagur, Tongzha and Telue, and the Doteli varieties
// Achhami/Baitadeli/Bajhangi genuinely share every settlement they have.
//
// "(dedicated)" is not a different name, it is a routing label, and
// dedupe-entries.js missed Anguillian Creole (dedicated) vs Anguillian Creole
// for exactly that reason while correctly leaving alone the other dedicated
// pairs in that file - Jamaican Maroon Creole 43 vs 20, Cochimi 35 vs 12,
// Navajo 53 vs 128 all differ in content.

const stripDedicated = s => alpha(s).replace(/dedicated$/, "");

for (const p of nearIdenticalPairs(allEntries, {threshold: 0.9, minSeeds: 8})) {
  if (stripDedicated(p.a.name) !== stripDedicated(p.b.name)) continue;
  const sameName = alpha(p.a.name) === alpha(p.b.name);
  warn(
    "W005",
    `namebases-${p.a.__continent}.js / ${p.b.__continent}.js`,
    `"${p.a.name}" and "${p.b.name}" are ${sameName ? "the same name" : "the same language, one marked (dedicated)"} ` +
      `with ${Math.round(p.jaccard * 100)}% identical seeds: i=${p.a.i} and i=${p.b.i} (${p.shared} shared). Delete one.`
  );
}

// ---------------------------------------------------------------------------
// W006 - the seeds say this entry is in the wrong continent file
// ---------------------------------------------------------------------------
//
// Which file a language lives in is organisational, not a claim about its
// toponymy - CONTINENT-ASSIGNMENTS.md says so explicitly. So a wrong file is
// only a problem when the SEEDS say so, and that is mechanically testable:
// work out which continent's entries use each seed most, and see whether an
// entry's seeds overwhelmingly belong somewhere else.
//
// This is how the misplaced entries were found. Research agents working the
// queues kept hitting entries that plainly were not there - Kosena in europe
// holding PNG Highlands towns, Wutunhua and Central Min holding Chinese towns,
// two Algerian Berber dialects in oceania. None of that is visible from a name.
//
// A warning, not an error, because the boundary cases are real: Siberian Tatar,
// Khakas and Mari are all transcontinental, and whether Mari El counts as
// europe or asia is a judgement the data cannot make.

for (const [e, info] of continentMismatches(allEntries, {minSeeds: 6, share: 0.7})) {
  warn(
    "W006",
    `namebases-${e.__continent}.js`,
    `${labelOf(e)}: ${Math.round(info.share * 100)}% of its seeds are used overwhelmingly by ` +
      `${info.to} entries, e.g. ${info.examples.slice(0, 3).join(", ")}. ` +
      `Either the entry or the file it is in is wrong.`
  );
}

// ---------------------------------------------------------------------------
// W007 - same name, smaller entry contained in the larger
// ---------------------------------------------------------------------------
//
// W005 compares set overlap, so it is blind to a 60-seed entry sitting inside a
// 132-seed twin of the same language: that scores Jaccard 0.45. The european
// agent spotted the case by hand - two Occitan entries, 25 seeds and 333, same
// name, Jaccard 0.05. Measured across the dataset there are 83 such pairs,
// four of them 100% contained.

for (const p of subsetDuplicates(allEntries, {minSeeds: 5, share: 0.7})) {
  warn(
    "W007",
    `namebases-${p.small.__continent}.js`,
    `${labelOf(p.small)} has ${p.total} seeds and ${p.inBig} of them are already in ` +
      `${labelOf(p.big)} (${Math.round(p.ratio * 100)}%). Delete the smaller.`
  );
}

// ---------------------------------------------------------------------------
// E011 - map rows must resolve to their own language AT RUNTIME
// ---------------------------------------------------------------------------
//
// Every other check in this file reads the AGGREGATOR array. The app does not.
// src/data/name-bases.ts overlays 43 built-in default namebases at fixed
// indices 0-42 on top of it, and it used to do so unconditionally - so 17 of
// those indices shipped a different language from the one in the data files:
//
//   i=6  app "Nordic"    data "Greek"       i=12  app "Japanese"  data "Portuguese"
//   i=11 app "Chinese"   data "Japanese"    i=14  app "Nahuatl"   data "Hungarian"
//   i=13 app "Portuguese" data "Nahuatl"    i=27  app "Quechua"   data "Swahili"
//
// 29 map rows referenced those indices, so `ces` generated Dwarven names and
// `por` generated Japanese ones, and no check here could see it. The overlay is
// now gap-fill only. This check re-validates the map against the RUNTIME array
// so the same class of disagreement cannot come back unnoticed.

{
  const {loadNameBases, BUILTIN_DEFAULTS} = require("./load-namebases");
  let runtime = null;
  try {
    const {nameBases: aggregated} = loadNameBases();
    runtime = BUILTIN_DEFAULTS.applyBuiltInOverlay(aggregated);
  } catch (e) {
    warn("W008", "runtime", `could not build the runtime array to check against: ${e.message}`);
  }

  if (runtime) {
    const readBrackets = f => {
      const s = fs.readFileSync(f, "utf8");
      return JSON.parse(s.slice(s.indexOf("["), s.lastIndexOf("]") + 1));
    };
    let mapRows = [];
    let catalogRows = [];
    try {
      mapRows = readBrackets(path.join(root, "config", "language-mixer-map.js"));
      catalogRows = readBrackets(path.join(root, "config", "language-mixes-all.js"));
    } catch (e) {
      warn("W008", "runtime", `could not read the mixer map: ${e.message}`);
    }

    if (mapRows.length && catalogRows.length) {
      const catalogName = new Map();
      for (const c of catalogRows) if (c && c.iso && c.name) catalogName.set(c.iso, c.name);
      const fold = s => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "");

      const mismatched = [];
      for (const row of mapRows) {
        const want = fold(catalogName.get(row.iso));
        if (!want) continue;
        const b = row.bases && row.bases[0];
        if (b === undefined) continue;
        const nb = runtime.runtime[b];
        if (!nb || !nb.name) continue;
        // Accept the namebase's own name, any of its parenthetical aliases
        // ("Kulung language (West Chadic)" answers to "West Chadic"), and a
        // prefix in either direction. Without the alias rule this flagged two
        // rows that are correct - including jamaican-patois -> Jamaican
        // Creole, which is a deliberate decision, since Jamaican Patois and
        // Jamaican Creole are the same language.
        const accepted = new Set([fold(nb.name)]);
        for (const p of String(nb.name || "").match(/\(([^)]+)\)/g) || []) {
          for (const part of p.replace(/[()]/g, "").split(/[,;/]/)) {
            const k = fold(part);
            if (k.length >= 3) accepted.add(k);
          }
        }
        let ok = false;
        for (const have of accepted) {
          if (!have) continue;
          if (have === want || have.startsWith(want) || want.startsWith(have)) { ok = true; break; }
        }
        if (!ok) {
          mismatched.push(`${row.iso} wants "${catalogName.get(row.iso)}" but resolves to "${nb.name}" at runtime index ${b}`);
        }
      }
      if (mismatched.length) {
        // A warning, not an error. A deliberate map decision - pointing one ISO
        // at another language's namebase because the two are the same language -
        // is indistinguishable in shape from a real bug, and a gate that cannot
        // tell those apart gets argued with and then switched off. The
        // catastrophic case this was written for, the built-in overlay
        // shadowing a real language, is prevented structurally below and
        // reported by W008.
        warn("W009", "config/language-mixer-map.js",
          `${mismatched.length} map row(s) resolve to a language whose name does not match the ` +
          `catalog name, in the RUNTIME array:\n      ` +
          mismatched.slice(0, 20).join("\n      ") +
          (mismatched.length > 20 ? `\n      ... and ${mismatched.length - 20} more` : ""));
      }
      if (runtime.conflicts.length) {
        warn("W008", "src/data/name-bases.ts",
          `${runtime.conflicts.length} of its 43 built-in defaults disagree with the data files about ` +
          `what lives at indices 0-42 (e.g. i=${runtime.conflicts[0].i} ships "${runtime.conflicts[0].ships}", ` +
          `built-in claims "${runtime.conflicts[0].builtinWouldBe}"). The data file wins, which is correct, ` +
          `but the built-in list is stale and should be reconciled.`);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// E012 - the built-in overlay must stay gap-fill only
// ---------------------------------------------------------------------------
//
// The regression that caused the shadowing was a single unconditional
// assignment: `merged[nb.i] = nb`. Nothing about the surrounding code would
// catch its return, because assigning a default over a real language is
// indistinguishable from doing it correctly. So the assignment itself is
// checked.
//
// If someone restores the unconditional write, the same 17 languages silently
// become a different language again, and every other check in this file - which
// reads the aggregator, not the runtime - stays green.

{
  const srcPath = path.join(root, "src", "data", "name-bases.ts");
  let src = "";
  try {
    src = fs.readFileSync(srcPath, "utf8");
  } catch (e) {
    warn("W008", "src/data/name-bases.ts", `could not read it to check the overlay: ${e.message}`);
  }
  if (src) {
    const fn = src.slice(src.indexOf("export function getDefaultNameBases"));
    const body = fn.slice(0, fn.indexOf("\n}"));
    const assigns = [...body.matchAll(/merged\s*\[\s*nb\.i\s*\]\s*=\s*nb\s*;/g)];
    if (assigns.length) {
      // The assignment is fine ONLY if it sits inside a guard. Look backwards
      // from the match for a conditional on the same slot.
      for (const m of assigns) {
        const before = body.slice(Math.max(0, m.index - 260), m.index);
        const guarded = /merged\s*\[\s*nb\.i\s*\]\s*===?\s*undefined\s*\)?\s*\{\s*$/.test(before.trimEnd()) ||
          /if\s*\(\s*merged\s*\[\s*nb\.i\s*\]/.test(before);
        if (!guarded) {
          err("E012", "src/data/name-bases.ts",
            "getDefaultNameBases() assigns a built-in default without first checking that the slot is " +
            "empty. That overwrites whichever real language the aggregator placed at that index, which is " +
            "how 17 languages silently became a different language. Guard the assignment on " +
            "`merged[nb.i] === undefined`.");
        }
      }
    }
  }
}

// ---------------------------------------------------------------------------
// W010 - the duplicate namebase tree
// ---------------------------------------------------------------------------
//
// This repo has two namebase trees. public/modules/ is the one src/index.html
// loads: vite's publicDir is "../public", so a src-relative "modules/x.js"
// resolves there at runtime, and stamp-assets.js computes the ?v= query params
// from there. modules/ is a duplicate that nothing serves - 4,746 entries
// against public/modules/'s 3,802 when last compared, every continent file
// differing.
//
// It used to be worse than dead weight. Twenty-nine tools read it, including
// check-language-mixer-guardrails.js and check-mixer-health.js, so those
// validated a dataset the app never loads. All 29 were repointed at
// public/modules/, so the duplicate is now inert.
//
// It was deleted in 6fe42a66 and restored afterwards at the repo owner's
// request, which is why this is a warning and not an error. The owner has seen
// it and chosen to keep it, so it must never fail a gate. But a second copy of
// data is worth knowing about, and reporting it is cheaper than an agent
// discovering it.

if (fs.existsSync(path.join(root, "modules"))) {
  const shadowNames = fs.readdirSync(path.join(root, "modules")).filter(n => n.startsWith("namebases-"));
  warn("W010", "modules/",
    `is present with ${shadowNames.length} namebase file(s) and is NOT the tree the app loads; ` +
    `public/modules/ is. Every tool was repointed at public/modules/, so this directory is ` +
    `currently inert, but edits made here have no effect on the app and no check reads it.`);
}

// ---------------------------------------------------------------------------
// M001 - the two copies of the mixer map must agree
// ---------------------------------------------------------------------------
//
// The map exists twice: config/language-mixer-map.js, which tools read and the
// guardrails validate, and public/config/language-mixer-map.js, which is the
// copy src/index.html actually loads (vite serves publicDir at the root). They
// drifted for one commit because dedupe-entries.js wrote them inside a loop
// that skipped any directory whose .json was absent - and only config/ has a
// .json, so the served copy was never updated while the tool reported success.
//
// This compares them. Divergence means the thing being validated and the thing
// being run are different files, which is the same class of hole as the
// guardrails having been checking a 3693-row file while the app loaded 4360.

const mapCopies = [
  ["config/language-mixer-map.js", "public/config/language-mixer-map.js"],
  ["config/language-mixer-map.json", "public/config/language-mixer-map.json"]
];
for (const [a, b] of mapCopies) {
  const pa = path.join(root, a);
  const pb = path.join(root, b);
  const ea = fs.existsSync(pa);
  const eb = fs.existsSync(pb);
  if (ea && eb) {
    if (fs.readFileSync(pa, "utf8") !== fs.readFileSync(pb, "utf8")) {
      err("M001", b, `differs from ${a}. The served copy and the validated copy must be identical.`);
    }
  } else if (ea && !eb && a.endsWith(".json")) {
    warn("M002", b, "not present. Only the .js is needed for serving; the .json source lives in config/.");
  } else if (eb && !ea) {
    err("M001", a, "missing while " + b + " exists.");
  }
}

// ---------------------------------------------------------------------------
// M003 - the generated .js copies must match their .json sources
// ---------------------------------------------------------------------------
//
// Four files are generated from two JSON sources:
//
//   config/language-mixes.json     -> config/language-mixes-all.js
//                                      public/config/language-mixes-all.js
//   config/language-mixer-map.json -> config/language-mixer-map.js
//                                      public/config/language-mixer-map.js
//
// M001 only checks that each pair of copies agrees with each other, so a .js
// that is stale in BOTH places passes. That is the common case: someone edits
// the JSON, which is the source of truth, and nothing regenerates the .js the
// app loads. The two files carry a header crediting
// tools/regenerate-js-from-json.js, but that script was not in the repository,
// so the regeneration had been done by hand - twice.
//
// tools/regenerate-js-from-json.js --check exits 1 on any mismatch, so this
// delegates rather than reimplementing the formatting.

{
  const { execFileSync } = require("node:child_process");
  const gen = path.join(root, "tools", "regenerate-js-from-json.js");
  if (fs.existsSync(gen)) {
    try {
      execFileSync(process.execPath, [gen, "--check"], { cwd: root, stdio: "pipe" });
    } catch (e) {
      const detail = String(e.stdout || "").split(/\r?\n/).filter(l => l.startsWith("DRIFT")).join("; ");
      err("M003", "config/", `generated .js copies are stale against their .json sources. ` +
        `Run: node tools/regenerate-js-from-json.js${detail ? "  (" + detail + ")" : ""}`);
    }
  } else {
    warn("M003", "tools/regenerate-js-from-json.js", "is missing, so the generated .js copies cannot be verified against their .json sources.");
  }
}

// ---------------------------------------------------------------------------
// M004 - the session's cleanup claims still hold, re-measured from disk
// ---------------------------------------------------------------------------
//
// This gate says the data is internally consistent. It does not say that a
// specific change still happened, and that distinction mattered: during the
// 2026-09-29 cleanup, a tool reported "0 pairs over the 25% overlap cap" from
// an in-memory counter while the file it had written had 20 violations, and a
// verification script reported entries "differing" because one side of its
// comparison had an extra field on it. Both were the same mistake - a count
// computed while building something is not evidence about the thing built.
//
// tools/namebase-tools/verify-session-changes.js re-measures the claims in a
// separate process against the files as they exist now. It deliberately
// overlaps with the checks above rather than replacing them.

{
  const { execFileSync } = require("node:child_process");
  const script = path.join(root, "tools", "namebase-tools", "verify-session-changes.js");
  if (fs.existsSync(script)) {
    try {
      execFileSync(process.execPath, [script, "--json"], { cwd: root, stdio: "pipe" });
    } catch (e) {
      let detail = "";
      try {
        const out = JSON.parse(String(e.stdout || "{}"));
        detail = (out.results || []).filter(r => !r.ok).map(r => `${r.name}${r.detail ? " (" + r.detail + ")" : ""}`).join("; ");
      } catch { detail = String(e.stdout || e.message).split(/\r?\n/).slice(0, 3).join(" "); }
      err("M004", "tools/namebase-tools/verify-session-changes.js", `session claims no longer hold. ${detail}`);
    }
  }
}

// ---------------------------------------------------------------------------
// S001 / S002 - the served data files must parse and run
// ---------------------------------------------------------------------------
//
// The seven continent files and the aggregator are loaded by src/index.html as
// plain classic scripts. A SyntaxError in any of them means the file does not
// execute at all, silently. public/modules/namebases-all.js carried one for
// three weeks: an orphaned `continue; }` pair that closed a block early. It
// went unnoticed because nothing type-checks the *contents* of a data file, no
// test loaded it, and nobody ran `node --check` on the served tree.
//
// This parses every served namebase file, then loads the whole set into a VM
// sandbox the way a browser would and checks that it produces a usable result.
// Parsing is not enough: namebases-all.js parsed-fine/ran-broken was exactly
// the class of defect that mattered.

const servedFiles = [
  ...CONTINENTS.map(c => `public/modules/namebases-${c}.js`),
  "public/modules/namebases-all.js"
];

for (const rel of servedFiles) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) {
    err("S001", rel, "served namebase file is missing. src/index.html loads it.");
    continue;
  }
  try {
    // Wrap like a classic script so `window.x = ...` parses as an assignment.
    new vm.Script(fs.readFileSync(full, "utf8"), {filename: rel});
  } catch (e) {
    err("S001", rel, `does not parse: ${e.message}. A SyntaxError here means the file never executes.`);
  }
}

if (!servedFiles.some(rel => err_has("S001"))) {
  const {execFileSync} = require("node:child_process");
  try {
    execFileSync(process.execPath, [path.join(root, "tools", "namebase-tools", "verify-aggregator-runs.js")], {
      stdio: "pipe",
      cwd: root
    });
  } catch (e) {
    const out = ((e.stdout || "") + (e.stderr || "")).toString().trim();
    err("S002", "public/modules/namebases-all.js", `aggregator does not run correctly:\n${out}`);
  }
}

function err_has(code) {
  return errors.some(x => x.code === code);
}

// ---------------------------------------------------------------------------
// Ratchet
// ---------------------------------------------------------------------------

const errorCounts = {};
for (const e of errors) errorCounts[e.code] = (errorCounts[e.code] || 0) + 1;

let baseline = {accepted: {}, notes: {}};
if (fs.existsSync(BASELINE_PATH)) {
  baseline = JSON.parse(fs.readFileSync(BASELINE_PATH, "utf8"));
}

if (updateBaseline) {
  const next = {
    _comment:
      "Known-debt ledger for verify-namebase-integrity.js. Each value is the " +
      "maximum tolerated count of that error class. A count above its entry " +
      "fails the gate. Lower it as debt is paid off. Raising one requires " +
      "--update-baseline and shows up as a diff that must be reviewed.",
    accepted: {},
    notes: baseline.notes || {}
  };
  for (const code of Object.keys(errorCounts).sort()) {
    next.accepted[code] = errorCounts[code];
    if (!next.notes[code]) next.notes[code] = "accepted debt - see AGENT-PLAYBOOK.md";
  }
  fs.writeFileSync(BASELINE_PATH, JSON.stringify(next, null, 2) + "\n", "utf8");
  console.log(`baseline written: ${BASELINE_PATH}`);
  for (const code of Object.keys(next.accepted)) {
    console.log(`  ${code} = ${next.accepted[code]}`);
  }
  process.exit(1);
}

// Split errors into ratcheted (at or under baseline) and newly-inflated.
const ratcheted = [];
const inflated = [];
const improved = [];
for (const e of errors) {
  const cap = baseline.accepted ? baseline.accepted[e.code] : undefined;
  if (cap === undefined) {
    inflated.push(e);
  } else if (errorCounts[e.code] > cap) {
    inflated.push(e);
  } else {
    ratcheted.push(e);
  }
}
for (const [code, actual] of Object.entries(errorCounts)) {
  const cap = baseline.accepted ? baseline.accepted[code] : undefined;
  if (cap !== undefined && actual < cap) {
    improved.push({code, actual, cap, delta: cap - actual});
  }
}

const blocking = inflated;
const ok = blocking.length === 0;

if (asJson) {
  console.log(
    JSON.stringify(
      {
        ok,
        seedFloor: SEED_FLOOR,
        totals: {
          entries: allEntries.length,
          garbageRows: files.reduce((a, f) => a + f.garbage.length, 0),
          belowFloor: backlog.length,
          zeroSeed: allEntries.filter(e => seedCount(e) === 0).length
        },
        byContinent,
        errorCounts,
        baseline: baseline.accepted || {},
        improved,
        blocking,
        ratcheted: ratcheted.length,
        warnings,
        backlog
      },
      null,
      2
    )
  );
  process.exit(ok ? 0 : 1);
}

console.log("");
console.log("namebase integrity");
console.log("==================");
for (const c of CONTINENTS) {
  const s = byContinent[c] || {total: 0, short: 0, zero: 0};
  console.log(
    `  ${c.padEnd(14)} ${String(s.total).padStart(5)} entries  ` +
      `${String(s.short).padStart(5)} below floor  ${String(s.zero).padStart(3)} zero-seed`
  );
}
console.log("");
console.log(`  total entries      : ${allEntries.length}`);
console.log(`  garbage array rows : ${files.reduce((a, f) => a + f.garbage.length, 0)}`);
console.log(`  below seed floor   : ${backlog.length}  (floor = ${SEED_FLOOR}, this is the work queue)`);
console.log("");

if (ratcheted.length) {
  console.log(`ACCEPTED DEBT (${ratcheted.length}) - within baseline, not blocking:`);
  const grouped = {};
  for (const e of ratcheted) (grouped[e.code] = grouped[e.code] || []).push(e);
  for (const code of Object.keys(grouped).sort()) {
    const cap = baseline.accepted[code];
    console.log(
      `  ${code}  ${grouped[code].length}/${cap} within baseline` +
        (baseline.notes && baseline.notes[code] ? `  - ${baseline.notes[code]}` : "")
    );
    for (const e of grouped[code].slice(0, quiet ? 2 : 5)) {
      console.log(`      [${e.file}] ${e.msg}`);
    }
    if (grouped[code].length > (quiet ? 2 : 5)) {
      console.log(`      ... and ${grouped[code].length - (quiet ? 2 : 5)} more`);
    }
  }
  console.log("");
}

for (const im of improved) {
  console.log(
    `  IMPROVED  ${im.code}: ${im.actual} (baseline ${im.cap}, ${im.delta} fixed) ` +
      `- lower the baseline to lock it in`
  );
}
if (improved.length) console.log("");

if (blocking.length) {
  console.log(`ERRORS (${blocking.length}) - these block a commit:`);
  const grouped = {};
  for (const e of blocking) (grouped[e.code] = grouped[e.code] || []).push(e);
  for (const code of Object.keys(grouped).sort()) {
    const cap = baseline.accepted ? baseline.accepted[code] : undefined;
    const over = cap !== undefined && errorCounts[code] > cap ? ` OVER BASELINE ${cap}` : "";
    console.log(`  ${code}  x${grouped[code].length}${over}`);
    for (const e of grouped[code].slice(0, quiet ? 3 : 12)) {
      console.log(`      [${e.file}] ${e.msg}`);
    }
    if (grouped[code].length > (quiet ? 3 : 12)) {
      console.log(`      ... and ${grouped[code].length - (quiet ? 3 : 12)} more`);
    }
  }
  console.log("");
}

if (warnings.length) {
  const grouped = {};
  for (const w of warnings) (grouped[w.code] = grouped[w.code] || []).push(w);
  console.log(`WARNINGS (${warnings.length}) - reported, not blocking:`);
  for (const code of Object.keys(grouped).sort()) {
    console.log(`  ${code}  x${grouped[code].length}`);
    for (const w of grouped[code].slice(0, quiet ? 2 : 6)) {
      console.log(`      [${w.file}] ${w.msg}`);
    }
    if (grouped[code].length > (quiet ? 2 : 6)) {
      console.log(`      ... and ${grouped[code].length - (quiet ? 2 : 6)} more`);
    }
  }
  console.log("");
}

if (backlog.length && !quiet) {
  console.log(`WORK QUEUE - lowest seed counts first (${backlog.length} entries):`);
  for (const b of backlog.slice(0, 40)) {
    console.log(
      `  ${b.continent.padEnd(14)} ${String(b.seeds).padStart(3)} seeds  ` +
        `i=${String(b.i).padEnd(7)} ${b.name}  [${b.status}]`
    );
  }
  if (backlog.length > 40) console.log(`  ... and ${backlog.length - 40} more`);
  console.log("");
}

if (!ok) {
  console.log("FAIL - " + blocking.length + " error(s). See docs/verification/AGENT-PLAYBOOK.md.");
  process.exit(1);
}

console.log(
  "OK - gate green. " + ratcheted.length + " within baseline, " + warnings.length +
    " warning(s), " + backlog.length + " entries still below the seed floor."
);
