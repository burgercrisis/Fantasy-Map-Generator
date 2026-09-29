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
const TEMPLATE_MAX_STEM = 4;

/** Longest total length allowed for template filler. */
const TEMPLATE_MAX_LENGTH = 12;

/**
 * How many DIFFERENT template suffixes must appear on the same stem before that
 * stem is called filler regardless of stem length.
 *
 * This catches a family the stem-length cap alone misses. The Media Lengua entry
 * (i=200955) ends with MediaLenguatown, MediaLenguaville, MediaLenguaburg,
 * MediaLenguaview, MediaLenguaside - one stem, five suffixes, no real place
 * named any of them. No genuine toponym set reuses one stem across four or more
 * unrelated English endings.
 */
const TEMPLATE_STEM_FANOUT = 4;

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

/**
 * Load every continental namebase file.
 *
 * A file that will not parse is reported through its `error` field rather than
 * thrown. One malformed continent used to abort the entire gate, so a stray
 * character in one file blinded every check for every other continent - and an
 * agent part-way through an edit could take the whole toolchain down for
 * everyone else. A broken file is now a finding, not a crash.
 *
 * @returns {Array<{continent: string, file: string, entries: object[], garbage: object[], error: string|null}>}
 */
function loadAll() {
  return CONTINENTS.map(continent => {
    try {
      return loadNameBaseFile(continent);
    } catch (err) {
      return {
        continent,
        file: path.join(NAMEBASE_DIR, `namebases-${continent}.js`),
        entries: [],
        garbage: [],
        error: err.message,
        raw: ""
      };
    }
  });
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
  const seeds = seedsOf(entry);

  // THE ONLY RELIABLE SIGNAL
  // -----------------------
  // One stem, several different English toponym endings: Karenictown,
  // Karenicville, Karenicburg, Karenicview, Karenicside, ... No genuine
  // toponym set reuses one stem across four or more unrelated endings.
  //
  // The tempting alternative - "short stem + suffix", e.g. Aport, Adutown,
  // Amedford - is NOT usable. Raising the stem cap to catch "Amedford"
  // (stem 4) also flags Boksburg, Vryburg, Bellville, Kirkwood, Fochville,
  // Winburg, Rouxville and Hopetown, all of which are real South African
  // places. The -burg/-ville/-town family is saturated with real names whose
  // stems are 3-4 characters, so the two cases are not separable by shape. Only
  // the fanout shape separates them, so only the fanout shape is used.
  const fanout = new Map();
  for (const seed of seeds) {
    if (/[^A-Za-z]/.test(seed)) continue;
    const lower = seed.toLowerCase();
    for (const sfx of TEMPLATE_SUFFIXES) {
      if (!lower.endsWith(sfx)) continue;
      const stem = lower.slice(0, lower.length - sfx.length);
      if (stem.length < 3) continue;
      if (!fanout.has(stem)) fanout.set(stem, new Set());
      fanout.get(stem).add(sfx);
      break;
    }
  }

  const out = new Set();
  for (const [stem, sfxSet] of fanout) {
    if (sfxSet.size < TEMPLATE_STEM_FANOUT) continue;
    for (const seed of seeds) {
      if (!/[^A-Za-z]/.test(seed) && seed.toLowerCase().startsWith(stem)) out.add(seed);
    }
  }

  // Once an entry is known to be templated, also take its short-stem filler.
  // The fanout above proved the entry is generated, so the shape test that is
  // unsafe on its own is safe here as corroboration rather than sole evidence.
  if (out.size) {
    for (const seed of seeds) {
      if (out.has(seed)) continue;
      if (seed.length > TEMPLATE_MAX_LENGTH || /[^A-Za-z]/.test(seed)) continue;
      const lower = seed.toLowerCase();
      for (const sfx of TEMPLATE_SUFFIXES) {
        if (!lower.endsWith(sfx)) continue;
        const stem = lower.length - sfx.length;
        if (stem >= 1 && stem <= TEMPLATE_MAX_STEM) { out.add(seed); break; }
      }
    }
  }

  return out.size >= min ? [...out] : [];
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

/**
 * Seeds that are the language's own name, or a research label containing it.
 *
 * Two grades, because the two are not equally wrong:
 *
 *   - a seed that IS the language name, e.g. "Bhojpuri" in the Bhojpuri entry.
 *     The quality standards reject it outright ("It is NOT a language name used
 *     as a place name"). It is occasionally genuine, though: the Ari language of
 *     New Guinea lives in two villages, one of which is also called Ari. So this
 *     is a warning.
 *
 *   - a seed that CONTAINS the language name plus more words, e.g.
 *     "Javanese macro entry", "Ulch villages,Kamchatka,Russia",
 *     "Itelmen villages", "Gwedena,Dagan family,Papua New Guinea". No place is
 *     called that. These are research labels that were pasted into a seed field.
 *     This is an error.
 *
 * @param {object} entry
 * @returns {{labels: string[], selfNamed: string|null}}
 */
function detectSelfNamedSeeds(entry) {
  const base = alpha(entry.name || "");
  if (base.length < 3) return {labels: [], selfNamed: null};
  const seeds = seedsOf(entry);
  const labels = [];
  let selfNamed = null;
  for (const seed of seeds) {
    const a = alpha(seed);
    if (!a) continue;
    if (a === base) {
      if (selfNamed === null) selfNamed = seed;
      continue;
    }
    // Contains the language name AND the seed is more than one word.
    if (a !== base && a.includes(base) && /\s/.test(seed.trim())) {
      labels.push(seed);
    }
  }
  return {labels, selfNamed};
}

/**
 * Pairs of distinct entries whose seed sets are near-identical.
 *
 * Exact duplicates are caught elsewhere, but near-identical ones survive it:
 * two entries with the same toponyms in a different order, or with two or three
 * names swapped. Observed: Sawi and Tamagario at Jaccard 1.00 over a
 * byte-identical 30-name list, Fore and Usarufa at 1.00, Mekeo and Koita at
 * 0.94. Two unrelated languages do not share 90% of their settlement names.
 *
 * @param {object[]} entries
 * @param {{threshold?: number, minSeeds?: number}} [opts]
 * @returns {Array<{a: object, b: object, jaccard: number, shared: number}>}
 */
function nearIdenticalPairs(entries, opts) {
  const threshold = (opts && opts.threshold) || 0.9;
  const minSeeds = (opts && opts.minSeeds) || 8;

  const sets = entries.map(e => ({e, s: new Set(seedsOf(e))}));
  const out = [];
  for (let i = 0; i < sets.length; i++) {
    if (sets[i].s.size < minSeeds) continue;
    for (let j = i + 1; j < sets.length; j++) {
      if (sets[j].s.size < minSeeds) continue;
      // Cheap reject on size ratio before intersecting.
      const [small, large] =
        sets[i].s.size <= sets[j].s.size ? [sets[i].s, sets[j].s] : [sets[j].s, sets[i].s];
      if (small.size / large.size < threshold) continue;
      let inter = 0;
      for (const v of small) if (large.has(v)) inter++;
      if (!inter) continue;
      const union = sets[i].s.size + sets[j].s.size - inter;
      const jac = inter / union;
      if (jac >= threshold) {
        out.push({a: sets[i].e, b: sets[j].e, jaccard: Math.round(jac * 100) / 100, shared: inter});
      }
    }
  }
  out.sort((x, y) => y.jaccard - x.jaccard);
  return out;
}

/**
 * Long runs of identical seeds shared by a small number of entries.
 *
 * findPastedBlocks needs 20+ holders, which is right for catching boilerplate
 * sprayed across the whole dataset but blind to a block copied between just two
 * or three entries. Observed: Kunimaipa and Tauade share 38 seeds in a row,
 * Gaagudju and Panyjima 27, Murrinh Patha and Ngaanyatjarra 26. A run of 15+
 * identical names in the same order is not linguistic relatedness.
 *
 * @param {object[]} entries
 * @param {{run?: number, minHolders?: number}} [opts]
 * @returns {Map<object, {block: string[], partners: number}>}
 */
function findLongSharedRuns(entries, opts) {
  const run = (opts && opts.run) || 15;
  const minHolders = (opts && opts.minHolders) || 2;

  const bySeed = new Map();
  for (const e of entries) {
    for (const s of new Set(seedsOf(e))) {
      if (!bySeed.has(s)) bySeed.set(s, []);
      bySeed.get(s).push(e);
    }
  }

  const found = new Map();
  for (const e of entries) {
    const seeds = seedsOf(e);
    for (let i = 0; i + run <= seeds.length; i++) {
      const win = seeds.slice(i, i + run);
      let anchor = win[0];
      let best = Infinity;
      for (const s of win) {
        const c = (bySeed.get(s) || []).length;
        if (c < best) { best = c; anchor = s; }
      }
      const holders = new Set();
      for (const p of bySeed.get(anchor) || []) {
        if (p === e) continue;
        const ps = new Set(seedsOf(p));
        if (win.every(s => ps.has(s))) holders.add(p);
      }
      if (holders.size < minHolders) continue;
      for (const p of holders) {
        for (const target of [e, p]) {
          const prev = found.get(target);
          if (!prev || win.length > prev.block.length) {
            found.set(target, {block: win, partners: holders.size + 1});
          }
        }
      }
    }
  }
  return found;
}

/** Human label for an entry, used in all report output. */
function labelOf(entry) {
  return `${entry.name} (i=${entry.i})`;
}

/**
 * Find blocks of consecutive seeds that were copy-pasted between entries.
 *
 * The plain "how many seeds does this entry share with other entries" metric
 * over-reports badly. Related languages genuinely share toponyms - Moldovan and
 * Romanian, Occitan and its dialects, the Caribbean creoles - and so do the
 * diaspora languages that took their settlers' European names. Flagging those
 * would push an agent to delete real, correct data.
 *
 * What is not legitimate is a run of identical seeds, in the same order,
 * appearing in 20+ unrelated entries. That is the signature of a block being
 * pasted around, and it is what produced the West African city list turning up
 * in Javanese, Petjo, Kaera and Ngamber. Requiring contiguity AND order makes
 * this precise where the frequency metric is not.
 *
 * @param {object[]} entries
 * @param {{run?: number, minEntries?: number}} [opts]
 * @returns {Map<object, {block: string[], partners: number}>}
 */
function findPastedBlocks(entries, opts) {
  const run = (opts && opts.run) || 8;
  const minEntries = (opts && opts.minEntries) || 20;

  const bySeed = new Map();
  for (const e of entries) {
    for (const s of new Set(seedsOf(e))) {
      if (!bySeed.has(s)) bySeed.set(s, []);
      bySeed.get(s).push(e);
    }
  }

  const windows = new Map();
  for (const e of entries) {
    const seeds = seedsOf(e);
    for (let i = 0; i + run <= seeds.length; i++) {
      const win = seeds.slice(i, i + run);
      // Anchor on the rarest seed in the window: the commonest is useless
      // because by definition it appears everywhere.
      let anchor = win[0];
      let best = Infinity;
      for (const s of win) {
        const c = (bySeed.get(s) || []).length;
        if (c < best) { best = c; anchor = s; }
      }
      const anchorList = bySeed.get(anchor) || [];
      if (anchorList.length > minEntries) continue;
      for (const partner of anchorList) {
        if (partner === e) continue;
        const pSeeds = new Set(seedsOf(partner));
        if (!win.every(s => pSeeds.has(s))) continue;
        const key = win.join("|");
        if (!windows.has(key)) windows.set(key, {block: win, holders: new Set()});
        const w = windows.get(key);
        w.holders.add(e);
        w.holders.add(partner);
      }
    }
  }

  const out = new Map();
  for (const w of windows.values()) {
    if (w.holders.size < minEntries) continue;
    for (const e of w.holders) {
      const prev = out.get(e);
      if (!prev || w.block.length > prev.block.length) {
        out.set(e, {block: w.block, partners: w.holders.size});
      }
    }
  }
  return out;
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
  findPastedBlocks,
  detectSelfNamedSeeds,
  nearIdenticalPairs,
  findLongSharedRuns,
  labelOf
};
