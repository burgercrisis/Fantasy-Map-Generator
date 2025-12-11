"use strict";

// Normalize Romance entries in config/language-mixes.json.
//
// Goals (kept intentionally conservative and idempotent):
// - For languages where category === "Romance":
//   - Ensure a region is present; if missing, default to "Europe".
//   - Ensure a family is present; if missing, default to "Romance".
// - Do not overwrite any existing region or family the catalog already has.
// - Preserve global sort convention used by other tools (region + name).
//
// Run from project root:
//   node tools/update-romance.js
// Then regenerate the mixer bundles if needed:
//   node tools/generate-language-mixer.js

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

function readJson(relPath) {
  const full = path.join(root, relPath);
  const raw = fs.readFileSync(full, "utf8");
  const clean = raw.replace(/^\uFEFF/, "");
  return JSON.parse(clean);
}

function writeJson(relPath, data) {
  const full = path.join(root, relPath);
  fs.writeFileSync(full, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log("Wrote", relPath.replace(/\\/g, "/"));
}

function isRomanceLanguage(entry) {
  return entry && entry.category === "Romance";
}

function normalizeRomanceEntry(entry) {
  let changed = false;

  // Only fill in missing region; do not override explicit regions.
  if (!entry.region) {
    entry.region = "Europe";
    changed = true;
  }

  // Only fill in missing family; do not override explicit families
  // like "Aragonese", "Astur-Leonese", "Corsican", etc.
  if (!entry.family) {
    entry.family = "Romance";
    changed = true;
  }

  return changed;
}

function main() {
  const mixes = readJson("config/language-mixes.json");

  const originalMixIsos = new Set(
    Array.isArray(mixes)
      ? mixes.filter(e => e && e.iso).map(e => String(e.iso))
      : []
  );

  let updatedCount = 0;

  for (const entry of mixes) {
    if (!isRomanceLanguage(entry)) continue;
    if (normalizeRomanceEntry(entry)) updatedCount++;
  }

  // Keep stable UI grouping by region+name, as in other tools.
  mixes.sort((a, b) => {
    const ak = (a.region || "") + (a.name || "");
    const bk = (b.region || "") + (b.name || "");
    return ak.localeCompare(bk);
  });

  const finalMixIsos = new Set(
    Array.isArray(mixes)
      ? mixes.filter(e => e && e.iso).map(e => String(e.iso))
      : []
  );
  for (const iso of originalMixIsos) {
    if (!finalMixIsos.has(iso)) {
      console.error(
        "[update-romance] refusing to write config/language-mixes.json; would drop ISO",
        iso
      );
      return;
    }
  }

  writeJson("config/language-mixes.json", mixes);
  console.log("Romance entries updated:", updatedCount);
}

if (require.main === module) main();

