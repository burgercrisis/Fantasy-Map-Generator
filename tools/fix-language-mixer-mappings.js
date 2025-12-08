"use strict";

// Helper script to automatically fix missing language->base mappings
// for the local Markov mixer (Names.getMixedByIso).
//
// It looks for catalog entries in config/language-mixes.json whose ISO
// codes are missing from config/language-mixer-map.json, and tries to
// infer a suitable base index from:
//   - the language's own ISO or name if it matches a namebase entry, or
//   - its lexifier or family, reusing the same base index as that
//     lexifier/family language where possible.
//
// The goal is to catch cases like Kituba (a Kongo-based creole) that
// should reuse the Kongo base, so the local mixer can generate names.
//
// Run from the project root:
//   node tools/fix-language-mixer-mappings.js
// Then regenerate the bundles:
//   node tools/generate-language-mixer.js
//
// The script is conservative:
//   - It only creates a mapping when it can find a single, unambiguous
//     base index to reuse.
//   - Otherwise it prints a report of unresolved ISOs so they can be
//     handled manually.

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

// Explicit overrides where we know exactly which base index to use.
// This is useful for creoles that clearly belong to a specific
// cluster but whose lexifier/family does not map cleanly to a single
// catalog entry.
//
// Keys are language ISOs from language-mixes.json; values are
// namebase indices from modules/namebases-fantasy.js.
const explicitIsoBaseMap = {
  // Pretoria Sotho is a Sotho-Tswana-based creole. Reuse the Tswana
  // base (index 152) so local mixing can work.
  "pretoria-sotho": 152
};

// Fallback mapping from common language tokens to base indices. This
// helps auto-map dialects and regional varieties like "Bolivian Spanish"
// or "Chilean Arabic" even when their names do not directly match a
// namebase entry.
const tokenBaseIndexMap = {
  // Romance / Latin
  spanish: 4,
  castilian: 4,
  latin: 4,
  portuguese: 13,
  french: 2,
  italian: 3,
  catalan: 2,

  // Germanic
  german: 0,
  dutch: 0,
  english: 1,
  swedish: 6,
  norwegian: 6,
  danish: 6,
  finnish: 9,
  icelandic: 6,

  // Slavic / related
  russian: 5,
  ukrainian: 5,
  polish: 5,
  czech: 5,
  serbian: 5,
  bulgarian: 5,

  // Semitic
  arabic: 18,
  aramaic: 23,
  hebrew: 23,
  akkadian: 23,
  mesopotamian: 23,

  // Uralic / Finnic / Sami buckets
  sami: 9,
  uralic: 9,

  // Other families / regions with dedicated bases
  basque: 20,
  celtic: 22,
  nigerian: 21,
  quechua: 27,
  nahuatl: 14,
  swahili: 28,
  mongolian: 31,
  chinese: 11,
  cantonese: 30,
  japanese: 12,
  korean: 10,
  vietnamese: 29,
  turkish: 16,
  berber: 17,
  hawaiian: 25
};

function readJson(relPath) {
  const full = path.join(root, relPath);
  const raw = fs.readFileSync(full, "utf8").replace(/^\uFEFF/, "");
  return JSON.parse(raw);
}

function writeJson(relPath, data) {
  const full = path.join(root, relPath);
  fs.writeFileSync(full, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log("Wrote", relPath.replace(/\\/g, "/"));
}

function loadNamebases() {
  const files = [
    path.join(root, "modules", "namebases-real.js"),
    path.join(root, "modules", "namebases-fantasy.js"),
    path.join(root, "modules", "namebases-creole.js")
  ];

  const re = /\{name:\s*"([^"]+)",\s*i:\s*(\d+)/g;
  const byName = new Map();
  const indices = new Set();

  for (const file of files) {
    let src;
    try {
      src = fs.readFileSync(file, "utf8");
    } catch (e) {
      console.error("Failed to read namebases file", file, e.message || e);
      continue;
    }

    let m;
    while ((m = re.exec(src))) {
      const name = m[1];
      const index = Number(m[2]);
      if (!Number.isNaN(index)) {
        const key = name.toLowerCase();
        if (!byName.has(key)) byName.set(key, index);
        indices.add(index);
      }
    }
  }

  return {byName, indices};
}

function main() {
  const mixes = readJson("config/language-mixes.json");
  let map = readJson("config/language-mixer-map.json");

  const namebases = loadNamebases();

  function resolveBaseByNameLike(name) {
    if (!name) return null;
    const raw = String(name).trim();
    if (!raw) return null;
    const lower = raw.toLowerCase();
    const variants = [];
    if (lower) variants.push(lower);

    const stripped = lower.replace(/\s+(language|languages|creole|creoles|family|group|dialect|dialects)$/g, "").trim();
    if (stripped && stripped !== lower && !variants.includes(stripped)) variants.push(stripped);

    const dehyphen = lower.replace(/[-–]+/g, " ").trim();
    if (dehyphen && !variants.includes(dehyphen)) variants.push(dehyphen);

    for (const key of variants) {
      const idx = namebases.byName.get(key);
      if (typeof idx === "number") return idx;
    }

    return null;
  }

  function resolveBaseByTokens(text) {
    if (!text) return null;
    const raw = String(text).toLowerCase();
    if (!raw) return null;
    const tokens = raw.split(/[^a-z]+/g).filter(Boolean);
    let resolved = null;
    for (const token of tokens) {
      const idx = tokenBaseIndexMap[token];
      if (typeof idx !== "number") continue;
      if (resolved == null) {
        resolved = idx;
      } else if (resolved !== idx) {
        return null;
      }
    }
    return resolved;
  }

  // First, normalize the existing map: drop any bases that do not
  // correspond to a real namebase index. If an entry ends up with no
  // valid bases, treat it as unmapped so we can try to infer a better
  // mapping (e.g. Alor Malay should reuse the Malay base instead of an
  // old, now-missing Malaccan base).
  const validBaseIndices = namebases.indices;
  const normalizedMap = [];
  const droppedIsos = [];

  for (const entry of map) {
    if (!entry || !entry.iso) continue;
    const bases = Array.isArray(entry.bases) ? entry.bases.filter(b => validBaseIndices.has(b)) : [];
    if (!bases.length) {
      droppedIsos.push(entry.iso);
      continue;
    }
    normalizedMap.push({iso: entry.iso, bases});
  }

  if (droppedIsos.length) {
    console.log(
      "Dropped mappings with invalid base indices:",
      droppedIsos.length,
      "=>",
      droppedIsos.join(", ")
    );
  }

  map = normalizedMap;

  const mappedIsos = new Set(map.map(e => e.iso));
  const mixesByIso = new Map(mixes.map(m => [m.iso, m]));
  const mapByIso = new Map(map.map(e => [e.iso, e]));

  const added = [];
  const unresolved = [];

  function findBaseIndexForLang(lang) {
    if (!lang) return null;

    if (lang.iso && Object.prototype.hasOwnProperty.call(explicitIsoBaseMap, lang.iso)) {
      return explicitIsoBaseMap[lang.iso];
    }

    if (lang.name) {
      const byName = namebases.byName.get(lang.name.toLowerCase());
      if (typeof byName === "number") return byName;
    }

    const lex = lang.lexifier || null;
    if (lex) {
      const lexMeta = mixes.find(m => m.name === lex || m.iso === (lex.iso || lex));
      if (lexMeta && lexMeta.iso) {
        const lexMap = mapByIso.get(lexMeta.iso);
        if (lexMap && Array.isArray(lexMap.bases) && lexMap.bases.length === 1) {
          return lexMap.bases[0];
        }
      }

      const lexIdx = resolveBaseByNameLike(lex);
      if (typeof lexIdx === "number") return lexIdx;
    }

    const family = lang.family || "";
    if (family) {
      const familyKey = family.replace(/-based$/i, "").trim();
      if (familyKey) {
        const famMeta = mixes.find(m => m.name === familyKey || m.iso === familyKey.toLowerCase());
        if (famMeta && famMeta.iso) {
          const famMap = mapByIso.get(famMeta.iso);
          if (famMap && Array.isArray(famMap.bases) && famMap.bases.length === 1) {
            return famMap.bases[0];
          }
        }

        const famIdx = resolveBaseByNameLike(familyKey);
        if (typeof famIdx === "number") return famIdx;
      }
    }

    const isoIdx = resolveBaseByNameLike(lang.iso || "");
    if (typeof isoIdx === "number") return isoIdx;

    const familyIdx = resolveBaseByNameLike(lang.family || "");
    if (typeof familyIdx === "number") return familyIdx;

    const categoryIdx = resolveBaseByNameLike(lang.category || "");
    if (typeof categoryIdx === "number") return categoryIdx;

    const nameTokenIdx = resolveBaseByTokens(lang.name || "");
    if (typeof nameTokenIdx === "number") return nameTokenIdx;

    const lexTokenIdx = resolveBaseByTokens(lang.lexifier || "");
    if (typeof lexTokenIdx === "number") return lexTokenIdx;

    const familyTokenIdx = resolveBaseByTokens(lang.family || "");
    if (typeof familyTokenIdx === "number") return familyTokenIdx;

    const isoTokenIdx = resolveBaseByTokens(lang.iso || "");
    if (typeof isoTokenIdx === "number") return isoTokenIdx;

    return null;
  }

  for (const lang of mixes) {
    if (!lang || !lang.iso) continue;
    if (mappedIsos.has(lang.iso)) continue; // already mapped

    const baseIndex = findBaseIndexForLang(lang);
    if (baseIndex == null) {
      unresolved.push(lang);
      continue;
    }

    map.push({iso: lang.iso, bases: [baseIndex]});
    mappedIsos.add(lang.iso);
    added.push({iso: lang.iso, base: baseIndex, name: lang.name || ""});
  }

  if (added.length) {
    // Keep original order + new entries sorted by iso for stability.
    const staticEntries = map.filter(e => !added.some(a => a.iso === e.iso));
    const newEntries = map.filter(e => added.some(a => a.iso === e.iso));

    newEntries.sort((a, b) => String(a.iso).localeCompare(String(b.iso)));

    const combined = staticEntries.concat(newEntries);
    writeJson("config/language-mixer-map.json", combined);
  } else {
    console.log("No new mappings added.");
  }

  console.log("Automatically added mappings:", added.length);
  if (added.length) {
    for (const a of added) {
      console.log(` - ${a.iso} (${a.name}) -> base index ${a.base}`);
    }
  }

  console.log("Unresolved languages with no mapping:", unresolved.length);
  if (unresolved.length) {
    for (const lang of unresolved) {
      console.log(
        ` - ${lang.iso || "(no iso)"} (${lang.name || "(no name)"}), family=${lang.family || ""}, lexifier=${
          lang.lexifier || ""
        }`
      );
    }
  }
}

if (require.main === module) main();
