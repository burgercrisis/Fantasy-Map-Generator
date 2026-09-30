"use strict";

/**
 * check-cross-country-padding - find namebase entries whose seed list is
 * geographically inconsistent with the language they belong to.
 *
 * WHY THIS CHECK EXISTS
 * --------------------
 * Every other check in tools/namebase-tools looks at the SHAPE of a seed list:
 * is it a template, is it a pasted block, is it duplicated, does it contain a
 * digit or a research label. All of those pass on a block of perfectly genuine
 * place names from the wrong continent. The West African city list that turns
 * up inside a Javanese entry is 27 real towns, correctly spelled, in the
 * correct order, with no metadata attached - there is nothing for a shape check
 * to object to. The only thing wrong with it is where it is, and geography is
 * the one property the dataset does not record anywhere.
 *
 * So this check asks a different question. For every seed, is there a country
 * that has a settlement by that name? Then: do the seeds that resolve point at
 * one country, and is that country the one the language's own catalog entry
 * says it should be?
 *
 * THE EVIDENCE LADDER
 * -------------------
 *   resolves to exactly one country  -> STRONG. The gazetteer claims no other
 *                                      country has a place by that name.
 *   resolves to several countries    -> WEAK. "San Jose" is real in a dozen
 *                                      countries, so it says nothing. Counted
 *                                      in the denominator, never the numerator.
 *   resolves to nothing              -> NO EVIDENCE. The gazetteer is silent.
 *
 * Only strong resolutions can put a country in the numerator, and an entry needs
 * MIN_RESOLVABLE strong resolutions AND MIN_SHARE of its resolvable seeds to be
 * judged at all. That is what keeps a three-seed entry off the report.
 *
 * WHY "UNRESOLVED" IS A REAL VERDICT AND NOT A SOFT PASS
 * ------------------------------------------------------
 * The catalog's `region` field is coarse on purpose - it is one of 33 labels,
 * most of them a whole continent. "Asia" admits 50 countries and "Europe" 46.
 * Two consequences, and they are not the same thing:
 *
 *   1. The region CAN exclude a country. If a language catalogued as East Asian
 *      carries a seed list that is unanimously Nigerian, the region has been
 *      used correctly and the seeds are wrong. That is a finding.
 *
 *   2. The region CANNOT pick a country, and more importantly it cannot
 *      exclude a country on the same continent. Sinhala is catalogued
 *      "Asia", its seeds are Sri Lankan, Sri Lanka is in Asia, and the entry is
 *      correct. Flagging it would be flagging the label, not the data. So when
 *      the resolved country is on the same continent as the region but outside
 *      the label's country set, the verdict is UNRESOLVED: the region is too
 *      coarse to judge this entry, and it is reported separately rather than
 *      counted as a failure.
 *
 * Labels that delimit no country set at all - Atlantic, Indian Ocean, Pacific,
 * Misc, Eurasia, Americas, The Americas, Latin America, Ancient Mesopotamia -
 * are always UNRESOLVED by construction.
 *
 * The line between the two classes is CONTINENT-level, which is the coarsest
 * test that still means something. A language of one continent carrying a
 * unanimously foreign-continent seed list is a defect in the seed list. A
 * language of one continent carrying another country of the same continent is
 * either a mislabelled region or a subtler form of the same defect, and the
 * data does not distinguish them.
 *
 * TRANSCOUNTINENTAL GUARD
 * -----------------------
 * A country that genuinely spans continents - Russia, Turkey, Kazakhstan,
 * Egypt, Indonesia, France - belongs in the country set of every region label it
 * legitimately touches. Russian is catalogued "Siberia" and its seeds are
 * Russian; without the guard that is a finding, and it is nonsense. The
 * transcontinental list is applied to the region sets, not to the verdict, so
 * it widens what "implied by the region" can mean rather than special-casing
 * individual languages.
 *
 * WHAT IT WILL NOT FIND
 * ---------------------
 * Village-level seeds. The gazetteer holds 40-60 settlements per country, so
 * an entry padded with 88 East Timorese hamlets resolves to almost nothing and
 * the entry is invisible here. Padding built from capital cities and other
 * top-50 places is found; padding built from the countryside is not. That is a
 * deliberate trade: a gazetteer deep enough to see village names would have to
 * guess, and a guessed country is worse than no answer. The check reports its
 * own resolution rate so the blind spot stays visible.
 *
 * USAGE
 *   node tools/namebase-tools/check-cross-country-padding.js [--verbose] [--strict]
 *   --verbose  also list the unresolved entries, per-entry detail, and
 *              gazetteer hygiene
 *   --strict   exit 1 when there are findings; default is exit 0
 */

const path = require("node:path");
const lib = require("./namebase-lib.js");
const { resolveCountry, COUNTRY_CITIES, normalizePlace } = require("./country-gazetteer.js");

const root = lib.root;

/** An entry needs at least this many single-country resolutions to be judged. */
const MIN_RESOLVABLE = 5;

/** ...and this share of its resolvable seeds pointing at one country. */
const MIN_SHARE = 0.8;

/** Example seeds printed per finding. */
const MAX_EXAMPLES = 6;

/**
 * Languages named for the country they are spoken in rather than the country
 * they come from: "Vietnamese US", "American Finnish", "Australian Kriol",
 * "New Zealand Pidgin English", "Canadian French". Their seeds are EXPECTED to
 * be host-country settlements, so a US city list under "Vietnamese US" is the
 * data being right and the catalog region being wrong - not cross-country
 * padding. Such entries are reported as unresolved, with the reason, rather
 * than dropped.
 *
 * The test is on the language NAME and requires a second word, so a language
 * simply called "Irish" or "Welsh" is not caught by it. Those entries are in
 * any case consistent with their region and never reach this test.
 */
const DIASPORA_HOST =
  /\b(us|u\.s\.|american|british|uk|australian|canadian|new zealand)\b/i;
const isDiasporaName = name => DIASPORA_HOST.test(name || "") && /\S+\s+\S+/.test(name || "");

// ---------------------------------------------------------------------------
// REGION_COUNTRIES
//
// One entry per region label used in config/language-mixes.json, holding the
// ISO 3166-1 alpha-2 codes that label admits. A label mapped to an empty array
// delimits no country set and can never exclude anything, so entries carrying
// it are reported unresolved rather than flagged.
// ---------------------------------------------------------------------------

const AFRICA = ["AO", "BF", "BI", "BJ", "BW", "CD", "CF", "CG", "CI", "CM", "CV", "DJ", "DZ", "EG", "EH", "ER", "ET", "GA", "GH", "GM", "GN", "GQ", "GW", "KE", "KM", "LR", "LS", "LY", "MA", "MG", "ML", "MR", "MU", "MW", "MZ", "NA", "NE", "NG", "RE", "RW", "SC", "SD", "SH", "SL", "SN", "SO", "SS", "ST", "SZ", "TD", "TG", "TN", "TZ", "UG", "YT", "ZA", "ZM", "ZW"];

const ASIA = ["AF", "AE", "AM", "AZ", "BD", "BH", "BN", "BT", "CN", "GE", "HK", "ID", "IL", "IN", "IQ", "IR", "JO", "JP", "KG", "KH", "KP", "KR", "KW", "KZ", "LA", "LB", "LK", "MM", "MN", "MO", "MV", "MY", "NP", "OM", "PH", "PK", "PS", "QA", "RU", "SA", "SG", "SY", "TH", "TJ", "TL", "TM", "TR", "TW", "UZ", "VN", "YE"];

const EUROPE = ["AD", "AL", "AT", "AX", "BA", "BE", "BG", "BY", "CH", "CY", "CZ", "DE", "DK", "EE", "ES", "FI", "FO", "FR", "GB", "GG", "GI", "GR", "HR", "HU", "IE", "IM", "IS", "IT", "JE", "LI", "LT", "LU", "LV", "MC", "MD", "ME", "MK", "MT", "NL", "NO", "PL", "PT", "RO", "RS", "RU", "SE", "SI", "SK", "SJ", "SM", "TR", "UA", "VA", "XK"];

const NORTH_AMERICA = ["CA", "GL", "US"];
const CENTRAL_AMERICA = ["BZ", "CR", "GT", "HN", "MX", "NI", "PA", "SV"];
const CARIBBEAN = ["AG", "AW", "BB", "BL", "BM", "BQ", "BS", "CU", "CW", "DM", "DO", "GD", "HT", "JM", "KN", "KY", "LC", "MF", "MS", "PR", "SX", "TC", "TT", "VC", "VG", "VI"];
const SOUTH_AMERICA = ["AR", "BO", "BR", "CL", "CO", "EC", "FK", "GF", "GY", "PE", "PY", "SR", "UY", "VE"];

const OCEANIA = ["AS", "AU", "CC", "CK", "CX", "FJ", "FM", "GU", "KI", "MH", "MP", "NC", "NF", "NR", "NU", "NZ", "PF", "PN", "PG", "PW", "SB", "TK", "TO", "TV", "VU", "WF", "WS"];

const ARCTIC = ["CA", "DK", "FI", "GL", "IS", "NO", "RU", "SE", "SJ", "US"];
const SIBERIA = ["RU"];
const CAUCASUS = ["AM", "AZ", "GE", "IR", "RU", "TR"];
const CENTRAL_ASIA = ["AF", "AZ", "CN", "KG", "KZ", "MN", "RU", "TJ", "TM", "UZ"];
const EAST_ASIA = ["CN", "HK", "JP", "KP", "KR", "MN", "MO", "TW"];
const SOUTH_ASIA = ["AF", "BD", "BT", "IN", "LK", "MV", "NP", "PK"];
const SOUTHEAST_ASIA = ["BN", "ID", "KH", "LA", "MM", "MY", "PH", "SG", "TH", "TL", "VN"];
const NORTH_AFRICA = ["DZ", "EG", "EH", "LY", "MA", "SD", "TN"];
const HORN_OF_AFRICA = ["DJ", "ER", "ET", "KE", "SO", "UG"];
const GULF_OF_GUINEA = ["AO", "BJ", "CG", "CI", "CM", "GA", "GH", "GQ", "NG", "ST"];
const UPPER_GUINEA = ["GN", "GW", "LR", "SL"];
const MIDDLE_EAST = ["AE", "BH", "CY", "EG", "IL", "IQ", "IR", "JO", "KW", "LB", "OM", "PS", "QA", "SA", "SY", "TR", "YE"];
const WEST_ASIA = ["AM", "AZ", "BH", "GE", "IL", "IQ", "IR", "JO", "LB", "PS", "QA", "SA", "SY", "TR", "YE"];
const AUSTRALIA = ["AU", "CC", "CX", "NF"];

/**
 * Countries that genuinely span continents, added to every region label they
 * legitimately touch. Without this, a Russian language catalogued "Siberia" or
 * "Asia" reads as a finding purely because Russia is not in that list.
 */
const SPANS = {
  RU: ["Asia", "Europe", "Siberia", "Caucasus", "Arctic", "Central Asia"],
  TR: ["Asia", "Europe", "Middle East", "West Asia", "Caucasus"],
  KZ: ["Asia", "Central Asia"],
  UZ: ["Asia", "Central Asia"],
  KG: ["Asia", "Central Asia"],
  TJ: ["Asia", "Central Asia"],
  TM: ["Asia", "Central Asia"],
  AZ: ["Asia", "Caucasus", "West Asia", "Central Asia"],
  AM: ["Asia", "Caucasus", "West Asia"],
  GE: ["Asia", "Caucasus", "West Asia"],
  EG: ["Africa", "Asia", "Middle East", "North Africa"],
  CY: ["Asia", "Europe", "Middle East"],
  PS: ["Asia", "Middle East"],
  IQ: ["Asia", "Middle East", "West Asia"],
  SY: ["Asia", "Middle East", "West Asia"],
  LB: ["Asia", "Middle East", "West Asia"],
  IL: ["Asia", "Middle East", "West Asia"],
  JO: ["Asia", "Middle East", "West Asia"],
  SA: ["Asia", "Middle East", "West Asia"],
  KW: ["Asia", "Middle East", "West Asia"],
  QA: ["Asia", "Middle East", "West Asia"],
  BH: ["Asia", "Middle East", "West Asia"],
  AE: ["Asia", "Middle East", "West Asia"],
  OM: ["Asia", "Middle East", "West Asia"],
  YE: ["Asia", "Middle East", "West Asia"],
  IR: ["Asia", "Middle East", "West Asia", "Caucasus"],
  AF: ["Asia", "South Asia", "Central Asia", "Middle East"],
  MN: ["Asia", "East Asia", "Central Asia"],
  IN: ["Asia", "South Asia", "Southeast Asia"],
  NP: ["Asia", "South Asia"],
  LK: ["Asia", "South Asia"],
  ID: ["Asia", "Southeast Asia", "East Asia"],
  MY: ["Asia", "Southeast Asia", "East Asia"],
  TL: ["Asia", "Southeast Asia"],
  MM: ["Asia", "Southeast Asia"],
  BT: ["Asia", "South Asia", "Sino-Tibetan region"],
  CN: ["Asia", "East Asia", "Central Asia", "Sino-Tibetan region"],
  DZ: ["Africa", "North Africa"],
  MA: ["Africa", "North Africa"],
  TN: ["Africa", "North Africa"],
  LY: ["Africa", "North Africa"],
  SD: ["Africa", "North Africa", "Middle East"],
  FR: ["Europe", "Africa"],
  ES: ["Europe", "Africa", "South America"],
  PT: ["Europe", "Africa", "South America"],
  NL: ["Europe", "Africa", "South America"],
  MX: ["North America", "Central America", "Mesoamerica", "Latin America", "Americas", "The Americas"],
  GT: ["Central America", "Mesoamerica", "Latin America", "Americas", "The Americas"],
  BZ: ["Central America", "Mesoamerica", "Latin America", "Americas", "The Americas"],
  SV: ["Central America", "Mesoamerica", "Latin America", "Americas", "The Americas"],
  HN: ["Central America", "Mesoamerica", "Latin America", "Americas", "The Americas"],
  NI: ["Central America", "Mesoamerica", "Latin America", "Americas", "The Americas"],
  CR: ["Central America", "Mesoamerica", "Latin America", "Americas", "The Americas"],
  PA: ["Central America", "Mesoamerica", "Latin America", "Americas", "The Americas"],
  CU: ["Caribbean", "Americas", "The Americas", "Latin America"],
  JM: ["Caribbean", "Americas", "The Americas", "Latin America"],
  HT: ["Caribbean", "Americas", "The Americas", "Latin America"],
  DO: ["Caribbean", "Americas", "The Americas", "Latin America"],
  PR: ["Caribbean", "Americas", "The Americas", "Latin America"],
  TT: ["Caribbean", "Americas", "The Americas", "Latin America"],
  US: ["North America", "Americas", "The Americas", "Latin America", "Arctic"],
  CA: ["North America", "Americas", "The Americas", "Latin America", "Arctic"],
  AU: ["Oceania", "Australia"],
  NZ: ["Oceania", "Australia"],
  PG: ["Oceania", "Australia"],
  FJ: ["Oceania", "Australia"],
  WS: ["Oceania", "Australia"],
  CK: ["Oceania", "Australia"],
  NF: ["Oceania", "Australia"],
  GL: ["North America", "Arctic", "Europe"],
  CI: ["Africa", "Gulf of Guinea"],
  GH: ["Africa", "Gulf of Guinea"],
  NG: ["Africa", "Gulf of Guinea"],
  GN: ["Africa", "Upper Guinea"],
  GW: ["Africa", "Upper Guinea"],
  SL: ["Africa", "Upper Guinea"],
  LR: ["Africa", "Upper Guinea"],
  ST: ["Africa", "Gulf of Guinea"],
  GQ: ["Africa", "Gulf of Guinea"],
  CM: ["Africa", "Gulf of Guinea"],
  GA: ["Africa", "Gulf of Guinea"],
  CG: ["Africa", "Gulf of Guinea"],
  BJ: ["Africa", "Gulf of Guinea"],
  CV: ["Africa", "Upper Guinea"],
  GW_: null
};

const union = (...groups) => new Set(groups.flat().filter(Boolean));

/** Country code -> continent codes. Multi-valued where a country spans two. */
const CONTINENT = {};
const continents = (name, codes) => {
  for (const c of codes) (CONTINENT[c] ||= []).push(name);
};
continents("AF", AFRICA);
continents("AS", ASIA);
continents("EU", EUROPE);
continents("NA", NORTH_AMERICA);
continents("CA", CENTRAL_AMERICA);
continents("CB", CARIBBEAN);
continents("SA", SOUTH_AMERICA);
continents("OC", OCEANIA);
continents("AN", ["AQ", "BV", "GS", "HM", "TF"]);
continents("EU", ["AD", "SM", "MC", "VA", "LI", "AX", "FO", "GG", "JE", "IM", "GI"]);
continents("AF", ["SH", "YT", "RE", "YT"]);
continents("AS", ["TW", "HK", "MO"]);

/** Extra continent memberships for the codes that span or sit oddly. */
const EXTRA_CONTINENT = {
  RU: ["EU", "AS"],
  TR: ["EU", "AS"],
  KZ: ["AS"],
  UZ: ["AS"],
  KG: ["AS"],
  TJ: ["AS"],
  TM: ["AS"],
  AZ: ["AS"],
  AM: ["AS"],
  GE: ["AS"],
  CY: ["AS", "EU"],
  PS: ["AS"],
  EG: ["AS", "AF"],
  FR: ["AF"],
  ES: ["AF", "SA"],
  PT: ["AF", "SA"],
  NL: ["AF", "SA"],
  GL: ["EU"],
  AQ: ["AN"],
  GS: ["AN"]
};
for (const [code, list] of Object.entries(EXTRA_CONTINENT)) {
  CONTINENT[code] = [...new Set([...(CONTINENT[code] || []), ...list])];
}

const REGION_COUNTRIES = {
  Africa: union(AFRICA),
  Asia: union(ASIA),
  Europe: union(EUROPE),
  "North America": union(NORTH_AMERICA),
  "Central America": union(CENTRAL_AMERICA),
  Caribbean: union(CARIBBEAN),
  "South America": union(SOUTH_AMERICA),
  Oceania: union(OCEANIA),
  Arctic: union(ARCTIC),
  Siberia: union(SIBERIA),
  Caucasus: union(CAUCASUS),
  "Central Asia": union(CENTRAL_ASIA),
  "East Asia": union(EAST_ASIA),
  "South Asia": union(SOUTH_ASIA),
  "Southeast Asia": union(SOUTHEAST_ASIA),
  Mesoamerica: union(CENTRAL_AMERICA),
  "North Africa": union(NORTH_AFRICA),
  "Horn of Africa": union(HORN_OF_AFRICA),
  "Gulf of Guinea": union(GULF_OF_GUINEA),
  "Upper Guinea": union(UPPER_GUINEA),
  "Middle East": union(MIDDLE_EAST),
  "West Asia": union(WEST_ASIA),
  Australia: union(AUSTRALIA),
  "Sino-Tibetan region": union(["CN", "NP", "IN", "MM", "BT"]),
  // Labels that delimit no country set at all. Anything carrying one of these
  // is reported as unresolved: there is nothing to compare the seeds against.
  Atlantic: new Set(),
  "Indian Ocean": new Set(),
  Pacific: new Set(),
  Misc: new Set(),
  Eurasia: new Set(),
  Americas: new Set(),
  "The Americas": new Set(),
  "Latin America": new Set(),
  "Ancient Mesopotamia": new Set()
};

// Widen every region a transcontinental country legitimately touches.
//
// Coarse labels are skipped on purpose. "The Americas" and "Latin America"
// are not country sets that happen to be incomplete, they are labels that
// deliberately do not draw a border at all, and admitting the United States to
// them would make them look like a country set that excludes French Guiana.
// A region's PRIMARY continent: the continent shared by most of the countries
// the label admits. The union is not usable as a test, because a single
// transcontinental member bridges the whole region - Russia and Turkey inside
// "Europe" would otherwise make Georgia and Kazakhstan look European, and a
// language catalogued as European with unanimously Georgian seeds is exactly
// the defect this check is here to find.
//
// Snapshot taken before the SPANS widening below, so the transcontinental
// guard cannot influence the test it is guarding.
const REGION_CONTINENTS = new Map();
for (const [region, set] of Object.entries(REGION_COUNTRIES)) {
  const tally = new Map();
  for (const code of set) for (const c of CONTINENT[code] || []) tally.set(c, (tally.get(c) || 0) + 1);
  let primary = null;
  let best = 0;
  for (const [c, n] of tally) {
    if (n > best) {
      best = n;
      primary = c;
    }
  }
  REGION_CONTINENTS.set(region, primary);
}

// Widen every region a transcontinental country legitimately touches.
//
// Coarse labels are skipped on purpose. "The Americas" and "Latin America"
// are not country sets that happen to be incomplete, they are labels that
// deliberately do not draw a border at all, and admitting the United States to
// them would make them look like a country set that excludes French Guiana.
for (const [code, regions] of Object.entries(SPANS)) {
  if (!regions) continue;
  for (const region of regions) {
    const set = REGION_COUNTRIES[region];
    if (set && set.size) set.add(code);
  }
}

/** Is this country on the continent its region's own definition is about? */
function regionSpansContinent(region, countryCode) {
  const primary = REGION_CONTINENTS.get(region);
  if (!primary) return false;
  return (CONTINENT[countryCode] || []).includes(primary);
}

// ---------------------------------------------------------------------------
// Inputs
// ---------------------------------------------------------------------------

const catalog = require(path.join(root, "config", "language-mixes.json"));
const mixer = require(path.join(root, "config", "language-mixer-map.json"));

const isoToRow = new Map();
for (const row of catalog) isoToRow.set(row.iso, row);

/** namebase index -> the ISO codes the mixer map says can reach it. */
const indexToIsos = new Map();
for (const row of Object.values(mixer)) {
  for (const i of row.bases || []) {
    if (!indexToIsos.has(i)) indexToIsos.set(i, new Set());
    indexToIsos.get(i).add(row.iso);
  }
}

const files = lib.loadAll();
const entries = files.flatMap(f => f.entries);
const brokenFiles = files.filter(f => f.error);

/**
 * Score one entry's seeds against the gazetteer.
 *
 * @param {object} entry
 * @returns {{strong: number, weak: number, byCountry: Map<string, {count: number, examples: string[]}>, top: string|null}}
 */
function scoreSeeds(entry) {
  const byCountry = new Map();
  let strong = 0;
  let weak = 0;
  for (const seed of lib.seedsOf(entry)) {
    const hit = resolveCountry(seed);
    if (hit === null) continue;
    if (Array.isArray(hit)) {
      weak++;
      continue;
    }
    strong++;
    if (!byCountry.has(hit)) byCountry.set(hit, {count: 0, examples: []});
    const rec = byCountry.get(hit);
    rec.count++;
    if (rec.examples.length < MAX_EXAMPLES) rec.examples.push(seed);
  }
  let top = null;
  for (const [code, rec] of byCountry) {
    if (!top || rec.count > byCountry.get(top).count) top = code;
  }
  return {strong, weak, byCountry, top};
}

/** Analyze every entry. */
function analyze() {
  const findings = [];
  const unresolved = [];
  let judged = 0;
  let reachable = 0;
  let withCatalogRow = 0;
  let seedsSeen = 0;
  let seedsStrong = 0;
  let seedsWeak = 0;

  for (const entry of entries) {
    const isos = indexToIsos.get(entry.i);
    if (isos && isos.size) reachable++;
    const rows = [...isos || []].map(iso => isoToRow.get(iso)).filter(Boolean);
    if (!rows.length) continue;
    withCatalogRow++;

    const seeds = lib.seedsOf(entry);
    if (!seeds.length) continue;
    seedsSeen += seeds.length;

    const score = scoreSeeds(entry);
    seedsStrong += score.strong;
    seedsWeak += score.weak;
    if (!score.strong) continue;

    const resolvable = score.strong + score.weak;
    const rec = score.byCountry.get(score.top);
    const share = resolvable ? rec.count / resolvable : 0;
    if (rec.count < MIN_RESOLVABLE || share < MIN_SHARE) continue;
    judged++;

    // The catalog region of the language, and the countries that label admits.
    // A namebase index can be reachable from more than one catalog row, and
    // those rows do not always agree on a region, so the test is against all
    // of them: the seeds only have to be consistent with one.
    const regions = [...new Set(rows.map(r => r.region))];
    const region = regions[0];
    const admittedList = regions.map(r => ({region: r, set: REGION_COUNTRIES[r]})).filter(x => x.set);
    const base = {
      entry,
      name: entry.name,
      i: entry.i,
      iso: rows[0].iso,
      region,
      regions,
      category: rows[0].category,
      family: rows[0].family,
      country: score.top,
      count: rec.count,
      resolvable,
      share,
      seeds: seeds.length,
      examples: rec.examples,
      otherCountries: [...score.byCountry.keys()].filter(c => c !== score.top)
    };

    if (!admittedList.length) {
      unresolved.push({
        ...base,
        why: `region "${regions.join(" / ")}" is not mapped to a country set`
      });
      continue;
    }
    if (admittedList.every(x => x.set.size === 0)) {
      unresolved.push({
        ...base,
        why: `region "${regions.join(" / ")}" is too coarse to judge`
      });
      continue;
    }
    if (admittedList.some(x => x.set.has(score.top))) continue;
    if (isDiasporaName(entry.name)) {
      unresolved.push({
        ...base,
        why: `diaspora label: "${entry.name}" is named for ${score.top}, so its seeds are expected there`
      });
      continue;
    }

    // The region excludes this country. Whether that makes the SEEDS wrong or
    // the LABEL wrong is decided at continent level, because a continental
    // label cannot exclude one of its own countries.
    if (admittedList.some(x => regionSpansContinent(x.region, score.top))) {
      unresolved.push({
        ...base,
        why: `region "${regions.join(" / ")}" does not name ${score.top}, but spans its continent`
      });
      continue;
    }
    findings.push(base);
  }

  findings.sort((a, b) => b.count - a.count || b.resolvable - a.resolvable);
  unresolved.sort((a, b) => b.count - a.count);
  return {
    findings,
    unresolved,
    judged,
    reachable,
    withCatalogRow,
    seedsSeen,
    seedsStrong,
    seedsWeak
  };
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const verbose = args.includes("--verbose");
const strict = args.includes("--strict");

function gazetteerHygiene() {
  const codes = Object.keys(COUNTRY_CITIES);
  const thin = codes
    .map(c => [c, new Set(COUNTRY_CITIES[c].map(normalizePlace)).size])
    .filter(([, n]) => n < 25)
    .sort((a, b) => a[1] - b[1]);
  const owner = new Map();
  let shared = 0;
  for (const [code, names] of Object.entries(COUNTRY_CITIES)) {
    for (const name of new Set(names.map(normalizePlace))) {
      if (owner.has(name)) shared++;
      else owner.set(name, code);
    }
  }
  return {countries: codes.length, names: owner.size, shared, thin};
}

const result = analyze();
const hygiene = gazetteerHygiene();

console.log("check-cross-country-padding - seeds vs the country they come from");
console.log("");
if (brokenFiles.length) {
  console.log(`WARNING ${brokenFiles.length} namebase file(s) failed to parse:`);
  for (const f of brokenFiles) console.log(`  ${f.continent}: ${f.error}`);
}
console.log(`entries loaded        ${entries.length}`);
console.log(`reachable via mixer   ${result.reachable}`);
console.log(`with a catalog row    ${result.withCatalogRow}`);
console.log(
  `seed resolution       ${result.seedsStrong} single-country, ${result.seedsWeak} ambiguous, ` +
    `of ${result.seedsSeen} seeds (${pct(result.seedsStrong, result.seedsSeen)} single-country)`
);
console.log(`judged (majority)     ${result.judged}`);
console.log(`gazetteer             ${hygiene.countries} countries, ${hygiene.names} names, ` +
  `${hygiene.shared} shared between countries`);
console.log("");

if (!result.findings.length) {
  console.log("FINDINGS 0 - no entry carries a seed list from a country its region excludes.");
} else {
  console.log(`FINDINGS ${result.findings.length} - seed list is from a country the catalog region excludes:`);
  console.log("");
  for (const f of result.findings) {
    const regionText = f.regions.length > 1 ? `${f.region} +${f.regions.length - 1}` : f.region;
    console.log(
      `  ${lib.labelOf(f.entry)}  [${f.iso}] region=${regionText} category=${f.category} family=${f.family}` +
        `  ->  ${f.country}  ${f.count}/${f.resolvable} resolvable (${pct(f.count, f.resolvable)}), ${f.seeds} seeds`
    );
    console.log(`      example seeds: ${f.examples.join(", ")}`);
    if (f.otherCountries.length) {
      console.log(`      also resolves to: ${f.otherCountries.join(", ")}`);
    }
  }
  console.log("");
  console.log(
    "  A finding is a defect in the SEED LIST or in the catalog REGION; the two are not always" +
      " separable from here. Read the category and family above: an Afroasiatic language whose" +
      " seeds are Algerian is a mislabelled region, a Turkic language whose seeds are Georgian" +
      " is a pasted list."
  );
}

console.log("");
console.log(
  `UNRESOLVED ${result.unresolved.length} - a country dominates the seeds, but the catalog region is ` +
    "too coarse to call it a defect:"
);
for (const u of result.unresolved.slice(0, verbose ? 999 : 12)) {
  console.log(
    `  ${lib.labelOf(u.entry)}  [${u.iso}] region=${u.region} -> ${u.country} ` +
      `${u.count}/${u.resolvable} :: ${u.why}`
  );
}
if (result.unresolved.length > 12 && !verbose) {
  console.log(`  ... ${result.unresolved.length - 12} more (--verbose)`);
}

if (verbose) {
  console.log("");
  console.log("gazetteer hygiene");
  if (hygiene.thin.length) {
    console.log(`  ${hygiene.thin.length} countries hold fewer than 25 names, so a padded list built from them resolves weakly:`);
    console.log("  " + hygiene.thin.map(([c, n]) => `${c}=${n}`).join(" "));
  } else {
    console.log("  every country holds at least 25 names");
  }
  console.log("");
  console.log("region labels with no country set (always unresolved):");
  console.log(
    "  " +
      Object.entries(REGION_COUNTRIES)
        .filter(([, set]) => set.size === 0)
        .map(([k]) => k)
        .join(", ")
  );
}

function pct(n, d) {
  return d ? `${Math.round((n / d) * 1000) / 10}%` : "n/a";
}

process.exit(strict && result.findings.length ? 1 : 0);
