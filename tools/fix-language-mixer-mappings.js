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
  const file = path.join(root, "modules", "namebases-fantasy.js");
  const src = fs.readFileSync(file, "utf8");

  const re = /\{name:\s*"([^"]+)",\s*i:\s*(\d+)/g;
  const byName = new Map();
  const indices = new Set();

  let m;
  while ((m = re.exec(src))) {
    const name = m[1];
    const index = Number(m[2]);
    if (!Number.isNaN(index)) {
      byName.set(name.toLowerCase(), index);
      indices.add(index);
    }
  }

  return {byName, indices};
}

function main() {
  const mixes = readJson("config/language-mixes.json");
  let map = readJson("config/language-mixer-map.json");

  const namebases = loadNamebases();

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

    // 0) Explicit overrides by ISO.
    if (lang.iso && Object.prototype.hasOwnProperty.call(explicitIsoBaseMap, lang.iso)) {
      return explicitIsoBaseMap[lang.iso];
    }

    // 1) Direct namebase by exact name match.
    if (lang.name) {
      const idx = namebases.byName.get(lang.name.toLowerCase());
      if (typeof idx === "number") return idx;
    }

    // 2) Try lexifier: reuse the same base index as the lexifier language.
    const lex = lang.lexifier || null;
    if (lex) {
      const lexMeta = mixes.find(m => m.name === lex || m.iso === (lex.iso || lex));
      if (lexMeta && lexMeta.iso) {
        const lexMap = mapByIso.get(lexMeta.iso);
        if (lexMap && Array.isArray(lexMap.bases) && lexMap.bases.length === 1) {
          return lexMap.bases[0];
        }
      }
    }

    // 3) Try family (e.g. Kongo-based -> Kongo).
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
      }
    }

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
