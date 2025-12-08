"use strict";

// Check coverage and metadata quality for several special language groups
// that previously had separate (empty) update scripts:
//   - Hmong-Mien / Yao
//   - language isolates / unclassified
//   - Paleosiberian / Arctic fringe families
//   - Uralic and related branches
//
// This script is **read-only**: it does not modify any files. It
// summarizes how many catalog entries fall into each group and how
// complete their metadata is (region, category, family).
//
// Run from project root:
//   node tools/check-special-families.js

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

function readJson(relPath) {
  const full = path.join(root, relPath);
  const raw = fs.readFileSync(full, "utf8").replace(/^\uFEFF/, "");
  return JSON.parse(raw);
}

function hasToken(value, tokens) {
  if (!value) return false;
  const lower = String(value).toLowerCase();
  return tokens.some(t => lower.includes(t));
}

function buildGroups(mixes) {
  return [
    {
      id: "hmong_mien",
      label: "Hmong-Mien / Yao",
      match(lang) {
        return (
          hasToken(lang.family, ["hmong", "mien", "yao", "hmong-mien"]) ||
          hasToken(lang.category, ["hmong", "mien", "yao", "hmong-mien"]) ||
          hasToken(lang.name, ["hmong", "mien", "yao"])
        );
      }
    },
    {
      id: "isolates_unclassified",
      label: "Language isolates / unclassified",
      match(lang) {
        return (
          hasToken(lang.category, ["language isolate"]) ||
          hasToken(lang.family, ["language isolate"]) ||
          hasToken(lang.category, ["unclassified"]) ||
          hasToken(lang.family, ["unclassified"])
        );
      }
    },
    {
      id: "paleosiberian_arctic",
      label: "Paleosiberian / Arctic fringe",
      match(lang) {
        const catTokens = [
          "chukotko-kamchatkan",
          "yeniseian",
          "yukaghir",
          "eskimo",
          "aleut",
          "nivkh"
        ];
        const regionTokens = ["siberia", "arctic"];
        return (
          hasToken(lang.category, catTokens) ||
          hasToken(lang.family, catTokens) ||
          hasToken(lang.region, regionTokens)
        );
      }
    },
    {
      id: "uralic_cluster",
      label: "Uralic / Finnic / Sami / Ugric cluster",
      match(lang) {
        const famTokens = [
          "uralic",
          "finnic",
          "sami",
          "samoyed",
          "samoyedic",
          "mordvin",
          "permic",
          "ugric"
        ];
        return (
          hasToken(lang.family, famTokens) ||
          hasToken(lang.category, famTokens)
        );
      }
    }
  ];
}

function summarizeGroup(label, entries) {
  const total = entries.length;
  if (!total) {
    console.log(`=== ${label} ===`);
    console.log("No matching catalog entries found.\n");
    return {
      label,
      total,
      missingRegion: 0,
      missingFamily: 0,
      missingCategory: 0
    };
  }

  let missingRegion = 0;
  let missingFamily = 0;
  let missingCategory = 0;

  for (const lang of entries) {
    if (!lang.region) missingRegion++;
    if (!lang.family) missingFamily++;
    if (!lang.category) missingCategory++;
  }

  const sample = entries
    .slice(0, 12)
    .map(l => `${l.iso || "(no iso)"} (${l.name || "(no name)"})`);

  console.log(`=== ${label} ===`);
  console.log("Total catalog entries:", total);
  console.log("Missing region:", missingRegion);
  console.log("Missing family:", missingFamily);
  console.log("Missing category:", missingCategory);
  console.log("Sample:");
  sample.forEach(s => console.log("  -", s));
  console.log("");

  return {label, total, missingRegion, missingFamily, missingCategory};
}

function main() {
  const mixes = readJson(path.join("config", "language-mixes.json"));

  const groups = buildGroups(mixes);
  const summaries = [];

  for (const group of groups) {
    const entries = mixes.filter(group.match);
    const summary = summarizeGroup(group.label, entries);
    summaries.push(summary);
  }

  // Overall summary
  console.log("=== Combined summary for special families ===");
  let grandTotal = 0;
  let grandMissingRegion = 0;
  let grandMissingFamily = 0;
  let grandMissingCategory = 0;

  for (const s of summaries) {
    grandTotal += s.total;
    grandMissingRegion += s.missingRegion;
    grandMissingFamily += s.missingFamily;
    grandMissingCategory += s.missingCategory;
  }

  console.log("Groups analyzed:");
  summaries.forEach(s => {
    console.log(
      ` - ${s.label}: total=${s.total}, missing region=${s.missingRegion},` +
        ` missing family=${s.missingFamily}, missing category=${s.missingCategory}`
    );
  });

  console.log("");
  console.log("Grand totals across all special groups:");
  console.log("  Total entries:", grandTotal);
  console.log("  Missing region:", grandMissingRegion);
  console.log("  Missing family:", grandMissingFamily);
  console.log("  Missing category:", grandMissingCategory);
  console.log("");
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error(
      "Error while checking special language families:",
      err && err.message ? err.message : err
    );
    process.exitCode = 1;
  }
}
