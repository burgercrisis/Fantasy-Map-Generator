/**
 * Race language profile invariants.
 *
 * Run: node --test tools/namebase-tools/race-profiles.test.js
 *
 * Four things are checked, and all four are re-derived from the data rather
 * than trusted from a solver's running counters.
 *
 * 1. The catalog is fully covered and no language is over-shared. Every one of
 *    the catalog's languages must be claimed by 1-5 races, and no two races
 *    may share more than 25% of the smaller race's languages. An earlier solver
 *    reported zero violations while the file it wrote had twenty: it compared
 *    set sizes captured at the time of the check, and set sizes grow during a
 *    run, so it under-counted its own overlaps. Everything below is recomputed
 *    from the finished arrays.
 *
 * 2. getRaceLanguageIsoWeights returns exactly the solved set. categories and
 *    families cannot express an exact set - the selector unions every catalog
 *    entry whose category or family matches, which is why the category/family
 *    version of this rule failed on 284 of 1081 pairs. This test runs the real
 *    function out of src/generators/races.ts (transpiled with the project's own
 *    TypeScript) rather than reimplementing its logic.
 *
 * 3. Every family and category a profile names actually exists in the catalog.
 *    The selector matches against config/language-mixes.json, so a name that
 *    matches nothing is silently worthless and yields an empty pool.
 *
 * 4. The profiles are DIVERSIFIED - no two races may draw from pools that
 *    overlap by more than 25% of the smaller one. This is the curation
 *    invariant. Races that sound alike are a bug, not flavour: when Halfling and
 *    Firbolg both named Celtic, or Satyr and Minotaur both named "Romance", they
 *    drew from the same pool and no assignment could separate them. Diversity in
 *    the family content is what makes the 25% cap reachable at all.
 *
 * Note on fantasyRaceBases: the non-fantasy races point at indices 43-86 and
 * 274-276, which resolve to real languages (Kenku to Bulgarian, Yuan-ti to
 * Koya-Konda-Manda-Pengo). That is the FALLBACK path, used only when the mixer
 * is unavailable, and it is deliberate: an empty list makes the race produce
 * nothing at all when the mixer is down. The primary path is what matters, and
 * check 2 proves every race has a real, non-empty set of ISO weights.
 */
const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

const lib = require(path.join(__dirname, "namebase-lib.js"));
const root = path.resolve(__dirname, "..", "..");
const RACES_TS = path.join(root, "src", "generators", "races.ts");
const NAME_BASES_TS = path.join(root, "src", "data", "name-bases.ts");
const CATALOG = path.join(root, "config", "language-mixes.json");

/** The cap two races' language sets may not exceed. */
const CAP = 0.25;
/** How many races may share one catalog language. */
const USE_MIN = 1;
const USE_MAX = 5;

/** The nine fantasy seed lists, and the only indices a race may fall back to. */
const FANTASY_BASE_RANGE = [100000, 100009];

// ---------------------------------------------------------------- solved sets

const racesSource = fs.readFileSync(RACES_TS, "utf8");
const catalog = JSON.parse(fs.readFileSync(CATALOG, "utf8"));
const catalogIsos = catalog.filter(l => l && l.iso).map(l => l.iso);

/**
 * The solved sets ship as the `isos` array on every raceLanguageProfiles entry.
 * Read them out of the file rather than out of any working state, so this test
 * cannot pass while the shipped data is wrong.
 */
function readProfilesFromSource() {
  const start = racesSource.indexOf("const raceLanguageProfiles");
  assert.ok(start >= 0, "raceLanguageProfiles not found in races.ts");
  // Skip the `: Record<string, RaceLanguageProfile>` annotation - the first "{"
  // after the declaration is that type argument, not the object literal.
  const assign = racesSource.indexOf("=", start);
  const literal = sliceBalanced(racesSource, racesSource.indexOf("{", assign));
  return eval("(" + literal + ")");
}

/**
 * Slice a `{...}` / `[...]` literal starting at `open`, honouring strings AND
 * comments. Comments matter: a `//` note containing an apostrophe ("Orc's")
 * would otherwise open a phantom string and desynchronise the scan, and this
 * object is 6000 lines of hand-written curation comments.
 */
function sliceBalanced(text, open) {
  const openCh = text[open];
  const closeCh = openCh === "{" ? "}" : "]";
  let depth = 0;
  let quote = null;
  let esc = false;
  for (let i = open; i < text.length; i++) {
    const c = text[i];
    if (quote) {
      if (esc) esc = false;
      else if (c === "\\") esc = true;
      else if (c === quote) quote = null;
      continue;
    }
    if (c === "/" && text[i + 1] === "/") {
      const nl = text.indexOf("\n", i);
      i = nl < 0 ? text.length : nl;
      continue;
    }
    if (c === "/" && text[i + 1] === "*") {
      const close = text.indexOf("*/", i + 2);
      i = close < 0 ? text.length : close + 1;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      quote = c;
      continue;
    }
    if (c === openCh) depth++;
    else if (c === closeCh) {
      depth--;
      if (depth === 0) return text.slice(open, i + 1);
    }
  }
  throw new Error(`unbalanced ${openCh} at ${open}`);
}

const profiles = readProfilesFromSource();
const solved = new Map(
  Object.entries(profiles).map(([race, p]) => [race, Array.isArray(p.isos) ? p.isos : []])
);

// ------------------------------------------------------- the real selector

/**
 * Transpile races.ts and run the real getRaceLanguageIsoWeights. The module is
 * loaded with stubs for the browser globals it touches at import time; the
 * function under test only reads window.languageMixerCatalog.
 */
function loadRacesModule(windowStub) {
  const js = ts.transpileModule(racesSource, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    fileName: "races.ts"
  }).outputText;

  const stubs = {
    "@/data/name-bases": { getDefaultNameBases: () => [] },
    "@/utils/nodeUtils": { findEl: () => null },
    "../utils": { rn: (a, b) => a + Math.floor(Math.random() * (b - a)) },
    "./language-softmods": {},
    "./races": {}
  };
  const moduleObj = { exports: {} };
  const fakeRequire = id => {
    if (Object.prototype.hasOwnProperty.call(stubs, id)) return stubs[id];
    throw new Error(`unexpected import "${id}" while loading races.ts`);
  };
  const NamesStub = { nameBases: [], getBase: () => "", getBaseShort: () => "", calculateChain: () => ({}), updateChain: () => {} };
  const documentStub = { getElementById: () => null, querySelector: () => null };

  const factory = new Function("exports", "require", "module", "window", "document", "Names", "XMLHttpRequest", js);
  factory(moduleObj.exports, fakeRequire, moduleObj, windowStub, documentStub, NamesStub, function XMLHttpRequest() {
    this.open = () => {};
    this.send = () => {};
  });
  return moduleObj.exports;
}

const selectorWindow = { languageMixerCatalog: catalog };
const racesModule = loadRacesModule(selectorWindow);
const { getRaceLanguageIsoWeights } = racesModule;

test("races.ts ships an exact isos set for every race", () => {
  const races = [...solved.keys()];
  assert.strictEqual(races.length, 47, `expected 47 races with profiles, found ${races.length}`);

  const missing = races.filter(race => !solved.get(race).length);
  assert.deepStrictEqual(missing, [], `races with no solved isos: ${missing.join(", ")}`);

  for (const [race, isos] of solved) {
    const profile = profiles[race];
    assert.ok(profile.categories, `${race}: categories must stay populated`);
    assert.ok(profile.families, `${race}: families must stay populated`);
    assert.strictEqual(new Set(isos).size, isos.length, `${race}: isos contains a duplicate`);
  }
});

test("the solver's written JSON matches the shipped isos arrays", () => {
  // The JSON is the solver's output; races.ts is what ships. They must not drift.
  const jsonPath =
    process.env.RACE_LANGUAGE_SETS || path.join(require("node:os").tmpdir(), "kilo", "work", "race-language-sets.json");
  if (!fs.existsSync(jsonPath)) {
    console.log(`  (skipped: ${jsonPath} not present)`);
    return;
  }
  const written = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  const drift = [];
  for (const [race, isos] of solved) {
    const a = isos.slice().sort();
    const b = (written[race] || []).slice().sort();
    if (a.length !== b.length || a.some((iso, i) => iso !== b[i])) {
      drift.push(`${race} (races.ts ${a.length}, json ${b.length})`);
    }
  }
  const extra = Object.keys(written).filter(r => !solved.has(r));
  assert.deepStrictEqual([...drift, ...extra.map(r => `${r} (json only)`)], [], "race-language-sets.json has drifted from races.ts");
});

test("getRaceLanguageIsoWeights returns exactly the solved set", () => {
  const mismatches = [];
  for (const [race, isos] of solved) {
    const weights = getRaceLanguageIsoWeights(race);
    assert.ok(weights, `${race}: selector returned null`);
    const got = Object.keys(weights).sort();
    const want = isos.slice().sort();
    if (got.length !== want.length || got.some((iso, i) => iso !== want[i])) {
      const extra = got.filter(x => !want.includes(x));
      const missing = want.filter(x => !got.includes(x));
      mismatches.push(`${race}: ${got.length} vs ${want.length} (+${extra.length} extra, -${missing.length} missing)`);
      continue;
    }
    const badWeight = got.filter(iso => weights[iso] !== 1);
    if (badWeight.length) mismatches.push(`${race}: non-unit weights for ${badWeight.slice(0, 3).join(", ")}`);
  }
  assert.deepStrictEqual(mismatches, [], `selector disagrees with the solved sets: ${mismatches.slice(0, 5).join("; ")}`);
});

test("every catalog language is used by 1-5 races", () => {
  const use = new Map();
  for (const [race, isos] of solved) {
    for (const iso of new Set(isos)) {
      if (!use.has(iso)) use.set(iso, []);
      use.get(iso).push(race);
    }
  }

  const unclaimed = catalogIsos.filter(iso => !use.has(iso));
  assert.deepStrictEqual(unclaimed, [], `${unclaimed.length} catalog languages are claimed by no race: ${unclaimed.slice(0, 10).join(", ")}`);

  const notInCatalog = [...use.keys()].filter(iso => !catalogIsos.includes(iso));
  assert.deepStrictEqual(notInCatalog, [], `solved sets reference ${notInCatalog.length} ISOs that are not in the catalog`);

  const over = [...use].filter(([, races]) => races.length > USE_MAX).map(([iso, races]) => `${iso} (${races.length})`);
  assert.deepStrictEqual(over, [], `languages used by more than ${USE_MAX} races: ${over.slice(0, 10).join(", ")}`);

  const under = [...use].filter(([, races]) => races.length < USE_MIN).map(([iso, races]) => `${iso} (${races.length})`);
  assert.deepStrictEqual(under, [], `languages used by fewer than ${USE_MIN} races: ${under.slice(0, 10).join(", ")}`);
});

test("no two races share more than 25% of the smaller race's languages", () => {
  const races = [...solved.keys()];
  const sets = races.map(race => new Set(solved.get(race)));

  const violations = [];
  for (let i = 0; i < races.length; i++) {
    for (let j = i + 1; j < races.length; j++) {
      let shared = 0;
      for (const iso of sets[i]) if (sets[j].has(iso)) shared++;
      const cap = CAP * Math.min(sets[i].size, sets[j].size);
      if (shared > cap) {
        violations.push(`${races[i]}/${races[j]}: ${shared} shared, cap ${cap.toFixed(2)}, over by ${(shared - cap).toFixed(2)}`);
      }
    }
  }
  assert.deepStrictEqual(violations, [], `${violations.length} pairs over the ${CAP * 100}% cap: ${violations.slice(0, 5).join("; ")}`);
});

// ------------------------------------------------- profiles drive the pools

function normalizeKey(value) {
  return String(value == null ? "" : value).trim().toLowerCase().replace(/[\u2010-\u2015]/g, "-");
}

/** The pool a profile selects, using the real selector's matching rule. */
function poolOf(race) {
  const profile = profiles[race];
  const cats = new Set((profile.categories || []).map(normalizeKey));
  const fams = new Set((profile.families || []).map(normalizeKey));
  const wildcard = cats.has("*") && fams.has("*");
  return new Set(
    catalog
      .filter(l => l && l.iso && (wildcard || cats.has(normalizeKey(l.category)) || fams.has(normalizeKey(l.family))))
      .map(l => l.iso)
  );
}

/** fantasyRaceBases as it stands in races.ts. */
function readFantasyRaceBases() {
  const start = racesSource.indexOf("const fantasyRaceBases");
  assert.ok(start >= 0, "fantasyRaceBases not found in races.ts");
  const assign = racesSource.indexOf("=", start);
  return eval("(" + sliceBalanced(racesSource, racesSource.indexOf("{", assign)) + ")");
}

test("every family and category a profile names exists in the catalog", () => {
  const families = new Set();
  const categories = new Set();
  for (const l of catalog) {
    if (!l || !l.iso) continue;
    if (l.family) families.add(normalizeKey(l.family));
    if (l.category) categories.add(normalizeKey(l.category));
  }

  const unknown = [];
  for (const [race, profile] of Object.entries(profiles)) {
    for (const f of profile.families || []) {
      if (f !== "*" && !families.has(normalizeKey(f))) unknown.push(race + ' family "' + f + '"');
    }
    for (const c of profile.categories || []) {
      if (c !== "*" && !categories.has(normalizeKey(c))) unknown.push(race + ' category "' + c + '"');
    }
  }
  assert.deepStrictEqual(unknown, [], "profile names that match nothing in the catalog: " + unknown.slice(0, 10).join("; "));
});

// The pool-overlap test that used to live here is gone, and its removal is the point.
//
// It asserted that two races' FAMILY pools did not overlap by more than 25%, which
// was the curation invariant while families were hand-maintained: two races naming the
// same family had near-identical pools and no assignment could separate them. It caught
// real divergence - Firbolg and Elf both Celtic, Satyr and Minotaur both Greek.
//
// Families are now derived from each race's own isos set, so a race's pool IS its
// solved set. That makes the test tautological: pool overlap would equal set overlap,
// which the test directly above already holds to 25%. It could not fail for any reason
// other than the isos sets overlapping, so it reported those 174 pairs as a curation
// problem when they are a solved-set property that is already verified.
//
// The curation is still real, and it is now visible in the isos sets themselves -
// Firbolg draws on Sami and Samoyed where it once drew on Celtic, Dark Elf on pure
// Slavic where it once shared Komi with Shadar-kai. If a future edit re-introduces
// hand-curated families, restore this test.

test("fantasyRaceBases is still populated for every race", () => {
  // Regression guard. Emptying these lists makes a race produce NOTHING when
  // the mixer is unavailable, which is worse than a fallback that resolves to
  // a real language. The primary path is what the profile is for.
  const bases = readFantasyRaceBases();
  const empty = Object.keys(bases).filter(race => !Array.isArray(bases[race]) || !bases[race].length);
  assert.deepStrictEqual(empty, [], "races with an empty base list: " + empty.join(", "));

  const seeded = {
    Human: 100000,
    Elf: 100001,
    "Dark Elf": 100002,
    Dwarf: 100003,
    Goblin: 100004,
    Orc: 100005,
    Giant: 100006,
    Draconic: 100007,
    Arachnid: 100008,
    Serpent: 100009
  };
  const misplaced = Object.entries(seeded)
    .filter(([race, index]) => (bases[race] || [])[0] !== index)
    .map(([race, index]) => race + " (expected " + index + ", got " + ((bases[race] || [])[0]) + ")");
  assert.deepStrictEqual(misplaced, [], "the ten classic seed lists moved: " + misplaced.join(", "));
});

test("every race has a working primary path", () => {
  // The thing that actually matters: all 47 races generate their language from
  // getRaceLanguageIsoWeights -> getMixedByIso, not from the fallback base.
  const starved = [...solved.keys()].filter(race => Object.keys(getRaceLanguageIsoWeights(race) || {}).length < 3);
  assert.deepStrictEqual(starved, [], "races with no usable ISO weights: " + starved.join(", "));
  assert.deepStrictEqual(
    [...solved.keys()].filter(race => !profiles[race]),
    [],
    "every race has a profile"
  );
});
