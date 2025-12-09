"use strict";

// Helper: report exact duplicate language names in config/language-mixes.json.
// This is stricter than the normalized-name clusters in
// report-language-mixer-duplicates.js: it only flags entries whose
// `name` field is byte-for-byte identical (after simple trimming).
//
// Usage (from project root):
//   node tools/check-language-mixer-name-duplicates.js
//
// Output:
//   - Summary counts
//   - Per-duplicate-name listing with ISO codes and basic metadata

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "..");

function readJson(relPath) {
  const full = path.join(root, relPath);
  const raw = fs.readFileSync(full, "utf8").replace(/^\uFEFF/, "");
  return JSON.parse(raw);
}

function main() {
  const mixes = readJson("config/language-mixes.json");

  const byName = new Map();

  for (const lang of mixes) {
    if (!lang || !lang.name) continue;
    const name = String(lang.name).trim();
    if (!name) continue;
    if (!byName.has(name)) byName.set(name, []);
    byName.get(name).push(lang);
  }

  const dups = [];

  for (const [name, list] of byName.entries()) {
    if (list.length <= 1) continue;
    dups.push({name, list});
  }

  dups.sort((a, b) => a.name.localeCompare(b.name));

  console.log("=== Exact duplicate language names in catalog ===");
  console.log("Total catalog entries:", mixes.length);
  console.log("Names with duplicates:", dups.length);
  console.log("");

  if (!dups.length) {
    console.log("All language names are unique (by exact string match).\n");
    return;
  }

  for (const {name, list} of dups) {
    console.log(`Name: ${name} (count=${list.length})`);
    for (const lang of list) {
      console.log(
        `  - iso=${lang.iso || ""}, region=${lang.region || ""}, family=${lang.family || ""}, category=${
          lang.category || ""
        }, tags=${Array.isArray(lang.tags) ? lang.tags.join(",") : ""}`
      );
    }
    console.log("");
  }
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error(
      "Error while checking for exact language name duplicates:",
      err && err.message ? err.message : err
    );
    process.exitCode = 1;
  }
}
