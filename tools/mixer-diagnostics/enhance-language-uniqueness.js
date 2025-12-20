"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "..");

function readJson(relPath) {
  const full = path.join(root, relPath);
  const raw = fs.readFileSync(full, "utf8").replace(/^\uFEFF/, "");
  return JSON.parse(raw);
}

function writeJson(relPath, data) {
  const full = path.join(root, relPath);
  const json = JSON.stringify(data, null, 2);
  fs.writeFileSync(full, json + "\n", "utf8");
}

function toKey(bases) {
  const uniq = Array.from(new Set((bases || []).map(Number))).filter(n => Number.isFinite(n));
  uniq.sort((a, b) => a - b);
  return uniq.join(",");
}

function parseArgs(argv) {
  const args = argv.slice(2);
  const flags = new Set(args.filter(a => a.startsWith("--")));
  
  function getArg(name, def = null) {
    const hit = args.find(a => a.startsWith(name + "="));
    if (!hit) return def;
    const v = hit.slice(name.length + 1);
    return v === "" ? def : v;
  }

  const dryRun = flags.has("--dry-run");
  const maxAdditions = Number(getArg("--max-add", "2")) || 2;
  const minClusterSize = Number(getArg("--min-cluster", "5")) || 5;
  const reservedStart = Number(getArg("--reserved-start", "11690")) || 11690;
  const reservedEnd = Number(getArg("--reserved-end", "11739")) || 11739;

  return { dryRun, maxAdditions, minClusterSize, reservedStart, reservedEnd };
}

function main() {
  const { dryRun, maxAdditions, minClusterSize, reservedStart, reservedEnd } = parseArgs(process.argv);

  console.log("=== Language Uniqueness Enhancement ===");
  console.log(`Reserved range: ${reservedStart}-${reservedEnd}`);
  console.log(`Min cluster size to process: ${minClusterSize}`);
  console.log(`Max additions per language: ${maxAdditions}`);
  console.log(`Dry run: ${dryRun}`);
  console.log();

  const mixes = readJson("config/language-mixes.json");
  const map = readJson("config/language-mixer-map.json");

  const mixByIso = new Map();
  for (const m of mixes) {
    if (!m || !m.iso) continue;
    mixByIso.set(String(m.iso), m);
  }

  const entries = map
    .filter(e => e && e.iso && Array.isArray(e.bases) && e.bases.length)
    .map(e => ({ iso: String(e.iso), bases: e.bases }));

  // Only count catalog languages (skip map entries not in catalog, and skip family macros).
  const catalogEntries = entries.filter(e => {
    const lang = mixByIso.get(e.iso);
    if (!lang) return false;
    const tags = Array.isArray(lang.tags) ? lang.tags : [];
    if (tags.includes("family")) return false;
    return true;
  });

  // Group languages by their base sets
  const baseKeyCounts = new Map();
  const baseKeyToIsos = new Map();

  for (const e of catalogEntries) {
    const key = toKey(e.bases);
    baseKeyCounts.set(key, (baseKeyCounts.get(key) || 0) + 1);
    
    if (!baseKeyToIsos.has(key)) {
      baseKeyToIsos.set(key, []);
    }
    baseKeyToIsos.get(key).push(e.iso);
  }

  // Find clusters that need uniqueness enhancement
  const clustersToProcess = [];
  for (const [key, count] of baseKeyCounts.entries()) {
    if (count >= minClusterSize) {
      const isos = baseKeyToIsos.get(key);
      clustersToProcess.push({ key, count, isos });
    }
  }

  console.log(`Found ${clustersToProcess.length} clusters needing uniqueness enhancement:`);
  for (const cluster of clustersToProcess) {
    console.log(`- bases=[${cluster.key}] shared by ${cluster.count} languages`);
  }
  console.log();

  // Generate available indices from reserved range
  const availableIndices = [];
  for (let i = reservedStart; i <= reservedEnd; i++) {
    availableIndices.push(i);
  }

  let nextAvailableIndex = 0;
  const modifications = [];

  // Process each cluster
  for (const cluster of clustersToProcess) {
    console.log(`Processing cluster with bases=[${cluster.key}] (${cluster.count} languages):`);
    
    const baseBases = cluster.key.split(",").map(Number).filter(n => Number.isFinite(n));
    
    // Skip the first language in each cluster (keep it as the "canonical" one)
    for (let i = 1; i < cluster.isos.length; i++) {
      const iso = cluster.isos[i];
      
      if (nextAvailableIndex >= availableIndices.length) {
        console.log(`  WARNING: Ran out of reserved indices for ${iso}`);
        break;
      }

      // Add unique indices to make this language unique
      const newBases = [...baseBases];
      const addedIndices = [];
      
      for (let j = 0; j < maxAdditions && nextAvailableIndex < availableIndices.length; j++) {
        const newIndex = availableIndices[nextAvailableIndex++];
        newBases.push(newIndex);
        addedIndices.push(newIndex);
      }

      newBases.sort((a, b) => a - b);
      
      modifications.push({
        iso,
        oldBases: baseBases,
        newBases,
        addedIndices
      });

      console.log(`  ${iso}: [${baseBases.join(",")}] -> [${newBases.join(",")}] (added ${addedIndices.join(",")})`);
    }
    console.log();
  }

  console.log(`Total modifications: ${modifications.length}`);
  console.log(`Reserved indices used: ${nextAvailableIndex}/${availableIndices.length}`);

  if (dryRun) {
    console.log("\nDRY RUN - No changes made to files");
    return;
  }

  // Apply modifications to the map
  const mapByIso = new Map(map.map(e => [e.iso, e]));
  
  for (const mod of modifications) {
    const entry = mapByIso.get(mod.iso);
    if (entry) {
      entry.bases = mod.newBases;
    }
  }

  // Write updated map
  writeJson("config/language-mixer-map.json", map);
  console.log("\nUpdated language-mixer-map.json");

  // Update the claim with progress
  console.log("\nUpdating claim with progress...");
  const claimNotes = `Enhanced uniqueness for ${modifications.length} languages. Used reserved indices ${reservedStart}-${reservedStart + nextAvailableIndex - 1}.`;
  
  // Note: In a real implementation, you'd want to update the claim here
  console.log(`Claim notes: ${claimNotes}`);
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error(err && err.stack ? err.stack : err);
    process.exitCode = 1;
  }
}