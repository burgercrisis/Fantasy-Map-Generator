"use strict";

// Check for catalog languages that would fail in the local Markov mixer
// (Names.getMixedByIso) because they have no usable mapped bases.
//
// A language is treated as a failure for the local mixer if:
//   - Its ISO code from config/language-mixes.json is missing in
//     config/language-mixer-map.json, OR
//   - It has a mapping entry but the bases array is empty, OR
//   - All mapped base indices point to non-existent namebases.
//
// This script does NOT try to actually build Markov chains; it only
// validates mapping coverage and base index sanity.
//
// Run from the project root:
//   node tools/check-markov-mixer-failures.js

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

function readJson(relPath) {
  const full = path.join(root, relPath);
  const raw = fs.readFileSync(full, "utf8").replace(/^\uFEFF/, "");
  return JSON.parse(raw);
}

function loadValidBaseIndices() {
  const files = [
    path.join(root, "modules", "namebases-real.js"),
    path.join(root, "modules", "namebases-fantasy.js"),
    path.join(root, "modules", "namebases-creole.js")
  ];

  const indices = new Set();
  const re = /\{name:\s*"([^"]+)",\s*i:\s*(\d+)/g;

  for (const file of files) {
    let src;
    try {
      src = fs.readFileSync(file, "utf8");
    } catch (e) {
      console.error("Failed to read", file, e.message || e);
      continue;
    }

    let m;
    while ((m = re.exec(src))) {
      const idx = Number(m[2]);
      if (!Number.isNaN(idx)) indices.add(idx);
    }
  }

  return indices;
}

function main() {
  const mixes = readJson("config/language-mixes.json");
  const map = readJson("config/language-mixer-map.json");

  const validBaseIndices = loadValidBaseIndices();

  const mapByIso = new Map(map.map(e => [e.iso, e]));
  const catalogIsos = new Set(mixes.map(m => m.iso));

  const noMap = [];
  const emptyBases = [];
  const allBasesInvalid = [];
  const partiallyInvalid = [];

  for (const lang of mixes) {
    if (!lang || !lang.iso) continue;

    // Skip family-only pseudo-languages; they don't appear in the mixer
    // dropdown (see renderMixerLanguageOptions in namesbase-editor.js).
    if (Array.isArray(lang.tags) && lang.tags.indexOf("family") !== -1) continue;

    const entry = mapByIso.get(lang.iso);
    if (!entry) {
      noMap.push(lang);
      continue;
    }

    if (!Array.isArray(entry.bases) || !entry.bases.length) {
      emptyBases.push({lang, entry});
      continue;
    }

    const invalid = entry.bases.filter(b => !validBaseIndices.has(b));

    if (invalid.length === entry.bases.length) {
      allBasesInvalid.push({lang, entry, invalid});
    } else if (invalid.length > 0) {
      partiallyInvalid.push({lang, entry, invalid});
    }
  }

  const mapOnly = map.filter(e => !catalogIsos.has(e.iso));

  const totalCatalog = mixes.length;
  const totalFailures = noMap.length + emptyBases.length + allBasesInvalid.length;

  console.log("=== Markov mixer failure check ===");
  console.log("Total catalog entries:", totalCatalog);
  console.log("Languages that will fail in local mixer (no usable bases):", totalFailures);
  console.log("  - Missing mapping entries:", noMap.length);
  console.log("  - Mapped but bases array empty:", emptyBases.length);
  console.log("  - Mapped but all bases invalid:", allBasesInvalid.length);
  console.log("");

  if (noMap.length) {
    console.log("-- Missing mapping for catalog languages (no entry in language-mixer-map.json) --");
    for (const lang of noMap) {
      console.log(
        ` - ${lang.iso || "(no iso)"} (${lang.name || "(no name)"}), region=${lang.region || ""}, category=${
          lang.category || ""
        }`
      );
    }
    console.log("");
  }

  if (emptyBases.length) {
    console.log("-- Entries with empty bases array (cannot build mixed base) --");
    for (const {lang, entry} of emptyBases) {
      console.log(
        ` - ${lang.iso || entry.iso || "(no iso)"} (${lang.name || "(no name)"}), bases=[]`
      );
    }
    console.log("");
  }

  if (allBasesInvalid.length) {
    console.log("-- Entries where all mapped bases point to non-existent indices --");
    for (const {lang, entry, invalid} of allBasesInvalid) {
      console.log(
        ` - ${lang.iso || entry.iso || "(no iso)"} (${lang.name || "(no name)"}), bases=${JSON.stringify(
          entry.bases
        )}, invalid=${JSON.stringify(invalid)}`
      );
    }
    console.log("");
  }

  if (partiallyInvalid.length) {
    console.log("-- Entries with a mix of valid and invalid base indices (will work, but mapping is messy) --");
    for (const {lang, entry, invalid} of partiallyInvalid) {
      console.log(
        ` - ${lang.iso || entry.iso || "(no iso)"} (${lang.name || "(no name)"}), bases=${JSON.stringify(
          entry.bases
        )}, invalid=${JSON.stringify(invalid)}`
      );
    }
    console.log("");
  }

  if (mapOnly.length) {
    console.log("-- Mapping entries whose ISO does not exist in the catalog (never used by mixer UI) --");
    for (const e of mapOnly) {
      console.log(` - ${e.iso}, bases=${JSON.stringify(e.bases || [])}`);
    }
    console.log("");
  }

  const unresolvedSnippetEntries = new Map();

  for (const lang of noMap) {
    if (lang && lang.iso) unresolvedSnippetEntries.set(lang.iso, lang);
  }

  for (const item of emptyBases) {
    const lang = item && item.lang;
    const entry = item && item.entry;
    const iso = (lang && lang.iso) || (entry && entry.iso);
    if (iso) unresolvedSnippetEntries.set(iso, lang || entry);
  }

  for (const item of allBasesInvalid) {
    const lang = item && item.lang;
    const entry = item && item.entry;
    const iso = (lang && lang.iso) || (entry && entry.iso);
    if (iso) unresolvedSnippetEntries.set(iso, lang || entry);
  }

  if (unresolvedSnippetEntries.size) {
    console.log("-- Suggested explicitIsoBaseMap snippet for unresolved ISO codes (fill in base indices) --");
    console.log("const explicitIsoBaseMap = {");

    const entries = Array.from(unresolvedSnippetEntries.entries());
    entries.sort((a, b) => String(a[0]).localeCompare(String(b[0])));

    for (const [iso, meta] of entries) {
      const name = meta && meta.name ? String(meta.name) : "";
      const comment = name ? ` // ${name}` : "";
      console.log(`  "${iso}": /* TODO baseIndex */ 0,${comment}`);
    }

    console.log("};");
    console.log("");
  }

  if (!totalFailures && !partiallyInvalid.length && !mapOnly.length) {
    console.log("All catalog languages have usable local mixer mappings and base indices look consistent.");
  }
}

if (require.main === module) main();
