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
  //   path.join(root, "modules", "namebases-africa.js")   (multi-arg join)
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
  const r = detectSelfNamedSeeds(e);
  if (r.label) {
    err(
      "E010",
      `namebases-${e.__continent}.js`,
      `${labelOf(e)} has the research label "${r.label}" in its seed list. ` +
        `That is a note, not a place name.`
    );
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
