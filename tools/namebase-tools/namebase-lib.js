"use strict";

/**
 * Shared namebase loading + integrity analysis.
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * Every namebase tool used to parse the data files independently, and several
 * of them did it wrong. The most common bug was a non-greedy regex like:
 *
 *     content.match(/window\.\w+NameBases\s*=\s*(\[[\s\S]*?\]);/)
 *
 * That stops at the FIRST `];` in the file. It silently truncated the array,
 * so the tools reported plausible-looking but wrong totals, and agents made
 * decisions on those numbers. Any tool that parses namebase data must use
 * `loadNameBaseFile` from here instead of rolling its own parser.
 *
 * The files are `window.<continent>NameBases = [ <valid JSON> ];`, so the
 * reliable parse is: find the assignment, slice from the first `[` to the
 * LAST `]`, and JSON.parse that.
 */

const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..", "..");

/** Continental namebase files, in canonical order. */
const CONTINENTS = [
  "africa",
  "asia",
  "europe",
  "northAmerica",
  "southAmerica",
  "oceania",
  "fantasy"
];

const NAMEBASE_DIR = path.join(root, "public", "modules");

/** Minimum authentic seeds an entry should carry to be considered substantiated. */
const SEED_FLOOR = 25;

/**
 * Languages whose seeds are legitimately shared across many entries, because
 * their speakers named places across continents. Used to avoid false
 * positives on the cross-entry contamination check.
 */
const COSMOPOLITAN_ALLOWLIST = new Set([
  "english",
  "french",
  "spanish",
  "castillian",
  "portuguese",
  "european portuguese",
  "arabic",
  "standard arabic",
  "egyptian arabic",
  "levantine arabic",
  "gulf arabic",
  "maghrebi arabic",
  "algerian arabic",
  "moroccan arabic",
  "dutch",
  "german",
  "italian",
  "afrikaans",
  "russian",
  "turkish",
  "persian",
  "hindi",
  "urdu",
  "chinese",
  "mandarin",
  "japanese",
  "korean",
  "swahili",
  "zulu",
  "xhosa",
  "afrikaans sign"
]);

/**
 * Suffixes used by the synthetic template padding that was bulk-injected into
 * ~190 entries: a one-to-three letter stem bolted onto a generic English
 * toponym ending, e.g. "Aport", "Aditside", "Abury", "Abridge".
 *
 * The stem length limit is the whole point. Real toponyms also end in these
 * words - Cape Town, Queenstown, Sasolburg, Middelburg, Port Elizabeth - so
 * matching on the suffix alone flags every good entry in the dataset. Capping
 * the stem at 3 characters separates the filler from the real thing: no
 * genuine settlement is called "Aport", but plenty are called "Queenstown".
 */
const TEMPLATE_SUFFIXES = [
  "port", "town", "side", "bury", "bridge", "vill", "vile", "kirk", "fort",
  "cre", "point", "ville", "burg", "berg", "view", "side", "wood", "ford",
  "hill", "dale", "brook", "gate"
];

/** Longest stem allowed before a word stops looking like template filler. */
const TEMPLATE_MAX_STEM = 3;

/** Longest total length allowed for template filler. */
const TEMPLATE_MAX_LENGTH = 10;

/** Strip everything but ASCII letters, lowercased. Used for padding detection. */
function alpha(s) {
  return String(s).replace(/[^A-Za-z]/g, "").toLowerCase();
}

/**
 * Parse one namebase file.
 *
 * @param {string} continent one of CONTINENTS
 * @returns {{continent: string, file: string, entries: object[], garbage: Array<{pos: number, value: unknown}>, raw: string}}
 */
function loadNameBaseFile(continent) {
  const file = path.join(NAMEBASE_DIR, `namebases-${continent}.js`);
  if (!fs.existsSync(file)) {
    throw new Error(`namebase file not found: ${file}`);
  }
  const raw = fs.readFileSync(file, "utf8");

  const marker = raw.indexOf("NameBases = [");
  if (marker === -1) {
    throw new Error(`no "NameBases = [" assignment found in ${file}`);
  }
  const start = raw.indexOf("[", marker);
  const end = raw.lastIndexOf("]");
  if (end <= start) {
    throw new Error(`could not locate end of array in ${file}`);
  }

  let parsed;
  try {
    parsed = JSON.parse(raw.slice(start, end + 1));
  } catch (err) {
    throw new Error(`${file} is not valid JSON: ${err.message}`);
  }

  // Rows that are not namebase objects. These are corruption: bare index
  // numbers or nulls spliced into the array. They must never be treated as
  // entries, and they must never be silently counted.
  const entries = [];
  const garbage = [];
  parsed.forEach((row, pos) => {
    if (row && typeof row === "object" && !Array.isArray(row) && row.name !== undefined) {
      entries.push({...row, __continent: continent, __pos: pos});
    } else {
      garbage.push({pos, value: row});
    }
  });

  return {continent, file, entries, garbage, raw};
}

/** Load every continental namebase file. */
function loadAll() {
  return CONTINENTS.map(loadNameBaseFile);
}

/** Split an entry's `b` field into trimmed, non-empty seeds. */
function seedsOf(entry) {
  if (!entry || typeof entry.b !== "string") return [];
  return entry.b.split(",").map(s => s.trim()).filter(Boolean);
}

/** Number of authentic-looking seeds on an entry (before any filtering). */
function seedCount(entry) {
  return seedsOf(entry).length;
}

/**
 * Detect the synthetic "language name + one random letter" padding, e.g.
 * Bhojpuri -> Bhojpurik, Bhojpurit, Bhojpurip ... appended purely to push the
 * seed count over the floor. 5,586 such seeds were injected across 542 entries.
 *
 * A single coincidence is not evidence: "Naron" is a real town in Eritrea and
 * "Argobba" the real name of the Ethiopian people. The injection always added
 * a *run* of them, and always at the end of the list, so a hit only counts
 * when there are at least three, or at least two sitting in the tail of the
 * seed list.
 *
 * @param {object} entry
 * @returns {string[]} the offending seeds
 */
function detectStemPadding(entry) {
  const base = alpha(entry.name || "");
  if (base.length < 3) return [];

  const seeds = seedsOf(entry);
  const hits = [];
  seeds.forEach((seed, idx) => {
    const a = alpha(seed);
    if (a.length === base.length + 1 && a.startsWith(base)) hits.push({seed, idx});
  });

  if (hits.length >= 3) return hits.map(h => h.seed);
  if (hits.length === 2) {
    const tailStart = Math.floor(seeds.length * (2 / 3));
    if (hits.every(h => h.idx >= tailStart)) return hits.map(h => h.seed);
  }
  return [];
}

/**
 * Detect generic template padding, e.g. an entry carrying a dozen of
 * Aport / Atown / Aside / Abury / Abridge. These come from a shared filler
 * vocabulary rather than from the language's own toponymy.
 *
 * Requires `min` such seeds so that a real entry containing one short
 * "burg"-ending town is never flagged on its own.
 *
 * @param {object} entry
 * @param {{min?: number}} [opts]
 * @returns {string[]} the offending seeds
 */
function detectTemplatePadding(entry, opts) {
  const min = (opts && opts.min) || 6;
  const hits = seedsOf(entry).filter(seed => {
    if (seed.length > TEMPLATE_MAX_LENGTH) return false;
    if (/[^A-Za-z]/.test(seed)) return false; // spaces/punctuation => real toponym
    const lower = seed.toLowerCase();
    for (const sfx of TEMPLATE_SUFFIXES) {
      if (!lower.endsWith(sfx)) continue;
      const stem = lower.length - sfx.length;
      if (stem >= 1 && stem <= TEMPLATE_MAX_STEM) return true;
    }
    return false;
  });
  return hits.length >= min ? hits : [];
}

/**
 * Seeds that cannot be place names. Highest-precision non-place detection:
 * anything starting with a digit is a date, a count, or a footnote marker,
 * never a toponym. The 2026-09 passes pasted research prose straight into
 * seed fields ("48 Sub-sections", "1847", "African-American Settlers").
 *
 * @param {object} entry
 * @returns {string[]} the offending seeds
 */
function detectNonPlaceTokens(entry) {
  return seedsOf(entry).filter(seed => /^\s*\d/.test(seed));
}

/** Seeds repeated inside a single entry. */
function findDuplicateSeeds(entry) {
  const seen = new Set();
  const dupes = new Set();
  for (const seed of seedsOf(entry)) {
    if (seen.has(seed)) dupes.add(seed);
    seen.add(seed);
  }
  return [...dupes];
}

/**
 * Build a global index of how many distinct entries use each seed.
 * A seed used by many unrelated languages is shared boilerplate, not an
 * authentic toponym for any of them.
 *
 * @param {object[]} entries
 * @returns {Map<string, number>}
 */
function buildSeedFrequency(entries) {
  const freq = new Map();
  for (const entry of entries) {
    for (const seed of new Set(seedsOf(entry))) {
      freq.set(seed, (freq.get(seed) || 0) + 1);
    }
  }
  return freq;
}

/**
 * Score an entry for cross-entry contamination.
 *
 * @param {object} entry
 * @param {Map<string, number>} freq from buildSeedFrequency
 * @param {{sharedWith?: number}} [opts] how many other entries a seed must
 *   appear in before it counts as shared. Default 20.
 * @returns {{shared: string[], cosmopolitan: boolean, ratio: number}}
 */
function contaminationFor(entry, freq, opts) {
  const sharedWith = (opts && opts.sharedWith) || 20;
  const cosmopolitan = COSMOPOLITAN_ALLOWLIST.has(alpha(entry.name || ""));
  const seeds = seedsOf(entry);
  const shared = cosmopolitan
    ? []
    : seeds.filter(seed => (freq.get(seed) || 0) > sharedWith);
  return {
    shared,
    cosmopolitan,
    ratio: seeds.length ? shared.length / seeds.length : 0
  };
}

/** Human label for an entry, used in all report output. */
function labelOf(entry) {
  return `${entry.name} (i=${entry.i})`;
}

module.exports = {
  root,
  CONTINENTS,
  NAMEBASE_DIR,
  SEED_FLOOR,
  COSMOPOLITAN_ALLOWLIST,
  alpha,
  loadNameBaseFile,
  loadAll,
  seedsOf,
  seedCount,
  detectStemPadding,
  detectTemplatePadding,
  detectNonPlaceTokens,
  findDuplicateSeeds,
  buildSeedFrequency,
  contaminationFor,
  labelOf
};
