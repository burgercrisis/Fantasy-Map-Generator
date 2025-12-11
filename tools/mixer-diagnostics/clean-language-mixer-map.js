"use strict";

// Diagnostic helper for config/language-mixer-map.json: finds entries whose ISO
// does not exist in config/language-mixes.json so you can see which mappings
// are "orphaned" relative to the current catalog.
//
// Under the no-deletion policy for languages, this script is **read-only by
// default**: it reports how many entries would be dropped and shows a sample,
// but it does **not** modify any files unless you pass `--apply`.
//
// Usage (from project root):
//   node tools/mixer-diagnostics/clean-language-mixer-map.js [--apply]
//
// When `--apply` is provided, the script will rewrite
// config/language-mixer-map.json to keep only ISOs that exist in the catalog.
// This should be used sparingly and never as part of routine uniqueness passes.
// After an applied run, regenerate the mixer bundles with:
//   node tools/mixer-core/generate-language-mixer.js

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
  const apply = process.argv.includes("--apply");

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

  if (apply) {
    console.log(
      "[no-op] --apply requested, but this tool is now diagnostic-only and will not rewrite config/language-mixer-map.json."
    );
  } else {
    console.log(
      "[dry-run] Not writing config/language-mixer-map.json; pass --apply was previously used to rewrite the file, but is now disabled."
    );
  }

  console.log("Total map entries before:", map.length);
  console.log("Total map entries after (if applied):", kept.length);
  console.log("Dropped entries:", dropped.length);

  if (dropped.length) {
    console.log("\nSample of entries that would be dropped (up to 50):");
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
