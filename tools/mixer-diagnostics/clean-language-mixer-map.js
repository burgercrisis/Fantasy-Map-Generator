"use strict";

// Clean up config/language-mixer-map.json by removing entries whose ISO
// does not exist in config/language-mixes.json. This keeps the mixer map
// aligned with the catalog while preserving all catalog-mapped languages.
//
// Usage (from project root):
//   node tools/clean-language-mixer-map.js
//
// After running this, you should regenerate the mixer bundles:
//   node tools/generate-language-mixer.js

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

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

function main() {
  const mixes = readJson("config/language-mixes.json");
  const map = readJson("config/language-mixer-map.json");

  const catalogIsos = new Set();
  for (const lang of mixes) {
    if (!lang || !lang.iso) continue;
    catalogIsos.add(String(lang.iso));
  }

  const kept = [];
  const dropped = [];

  for (const entry of map) {
    if (!entry || !entry.iso) continue;
    const iso = String(entry.iso);
    if (catalogIsos.has(iso)) {
      kept.push(entry);
    } else {
      dropped.push(entry);
    }
  }

  writeJson("config/language-mixer-map.json", kept);

  console.log("Total map entries before:", map.length);
  console.log("Total map entries after:", kept.length);
  console.log("Dropped entries:", dropped.length);

  if (dropped.length) {
    console.log("\nSample of dropped entries (up to 50):");
    dropped.slice(0, 50).forEach(e => {
      console.log(` - ${e.iso}, bases=${JSON.stringify(e.bases || [])}`);
    });
    if (dropped.length > 50) {
      console.log("... and", dropped.length - 50, "more.");
    }
  }
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error(
      "Error while cleaning language-mixer-map.json:",
      err && err.message ? err.message : err
    );
    process.exitCode = 1;
  }
}
