"use strict";
/**
 * Verify the language-mixer-map against the MERGED nameBases array.
 * This simulates what the browser actually does: all continent files are merged,
 * sorted by index, collisions resolved (first wins), and the result is nameBases[].
 *
 * Run: node tools/utils/verify-merged-mapping.js
 */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "../..");
const CONFIG_DIR = path.join(root, "config");
const MODULES_DIR = path.join(root, "modules");

const CONTINENT_FILES = [
  "namebases-africa.js",
  "namebases-asia.js",
  "namebases-europe.js",
  "namebases-northAmerica.js",
  "namebases-southAmerica.js",
  "namebases-oceania.js",
  "namebases-unknown.js",
  "namebases-fantasy.js"
];

// Simulate the browser's merge logic from namebases-all.js
function buildMergedNameBases() {
  const all = [];
  for (const f of CONTINENT_FILES) {
    const content = fs.readFileSync(path.join(MODULES_DIR, f), "utf8");
    const re = /"i":\s*(\d+)/g;
    let m;
    while ((m = re.exec(content)) !== null) {
      const idx = parseInt(m[1], 10);
      const before = content.slice(0, m.index);
      const afterIdx = before.lastIndexOf('"name":');
      if (afterIdx === -1) continue;
      const nameMatch = content.slice(afterIdx, afterIdx + 200).match(/"name":\s*"([^"]+)"/);
      if (!nameMatch) continue;
      all.push({ i: idx, name: nameMatch[1].trim(), source: f });
    }
  }

  all.sort((a, b) => a.i - b.i);

  let maxIndex = all.reduce((max, b) => b.i > max ? b.i : max, 0);
  const byIndex = new Array(maxIndex + 1);
  const collisions = [];

  for (const b of all) {
    if (byIndex[b.i]) {
      collisions.push({ i: b.i, existing: byIndex[b.i].name, incoming: b.name, incomingSource: b.source });
      let j = maxIndex + 1;
      while (byIndex[j]) j++;
      byIndex[j] = { ...b, relocated: true };
      maxIndex = j;
      continue;
    }
    byIndex[b.i] = b;
  }

  console.log("Merged nameBases: " + maxIndex + " slots, " + collisions.length + " collisions");
  if (collisions.length > 0) {
    console.log("Collisions (first wins, second relocated):");
    for (const c of collisions.slice(0, 20)) {
      console.log("  index " + c.i + ": '" + c.existing + "' kept, '" + c.incoming + "' (" + c.incomingSource + ") relocated");
    }
    if (collisions.length > 20) console.log("  ... and " + (collisions.length - 20) + " more");
  }

  return { byIndex, collisions };
}

function main() {
  const { byIndex, collisions } = buildMergedNameBases();

  const map = JSON.parse(fs.readFileSync(path.join(CONFIG_DIR, "language-mixer-map.json"), "utf8"));
  const catalog = JSON.parse(fs.readFileSync(path.join(CONFIG_DIR, "language-mixes.json"), "utf8"));

  const isoToCatalog = {};
  for (const c of catalog) isoToCatalog[c.iso] = c;

  // For each map entry, resolve the base index through the merged array
  let validBase = 0, invalidBase = 0, selfMatch = 0, diffName = 0;
  const diffNameExamples = [];
  const invalidExamples = [];

  for (const entry of map) {
    const cat = isoToCatalog[entry.iso];
    if (!cat) continue;

    for (const b of (entry.bases || [])) {
      const base = byIndex[b];
      if (!base) {
        invalidBase++;
        if (invalidExamples.length < 10) invalidExamples.push(entry.iso + " -> index " + b + " (empty slot)");
        continue;
      }
      validBase++;
      if (base.name === cat.name) {
        selfMatch++;
      } else {
        diffName++;
        if (diffNameExamples.length < 20) {
          diffNameExamples.push(
            entry.iso + ": '" + cat.name + "' (" + cat.region + ") -> index " + b +
            " = '" + base.name + "' (" + base.source + ")" + (base.relocated ? " [RELOCATED]" : "")
          );
        }
      }
    }
  }

  console.log("\n=== Merged Array Verification ===");
  console.log("Valid base lookups:", validBase);
  console.log("Invalid base lookups (empty slot):", invalidBase);
  console.log("Self-matches (catalog name == base name):", selfMatch);
  console.log("Different-name bases:", diffName);

  if (diffNameExamples.length > 0) {
    console.log("\nExamples of different-name base assignments:");
    for (const ex of diffNameExamples) console.log("  " + ex);
  }
  if (invalidExamples.length > 0) {
    console.log("\nInvalid base lookups:");
    for (const ex of invalidExamples) console.log("  " + ex);
  }

  // Summary stats
  const totalMapEntries = map.length;
  const entriesWithSelfMatch = map.filter(e => {
    const cat = isoToCatalog[e.iso];
    if (!cat) return false;
    return e.bases.some(b => byIndex[b] && byIndex[b].name === cat.name);
  }).length;

  console.log("\n=== Summary ===");
  console.log("Total map entries:", totalMapEntries);
  console.log("Entries with self-matching base:", entriesWithSelfMatch + " (" + (entriesWithSelfMatch/totalMapEntries*100).toFixed(1) + "%)");
  console.log("Entries with fallback base:", (totalMapEntries - entriesWithSelfMatch) + " (" + ((totalMapEntries-entriesWithSelfMatch)/totalMapEntries*100).toFixed(1) + "%)");
  console.log("Invalid base references:", invalidBase);
}

main();
