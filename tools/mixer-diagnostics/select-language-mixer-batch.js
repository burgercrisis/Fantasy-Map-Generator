"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "..");

function readJson(relPath) {
  const full = path.join(root, relPath);
  const raw = fs.readFileSync(full, "utf8").replace(/^\uFEFF/, "");
  return JSON.parse(raw);
}

function toLower(str) {
  return (str || "").toString().toLowerCase();
}

function main() {
  const args = process.argv.slice(2);

  function getFlag(name) {
    return args.includes(name);
  }

  function getArgValue(prefix, defaultValue = null) {
    const arg = args.find(a => a.startsWith(prefix + "="));
    if (!arg) return defaultValue;
    const value = arg.slice(prefix.length + 1);
    return value === "" ? defaultValue : value;
  }

  const includeFamilies = getFlag("--include-families");
  const minSizeRaw = getArgValue("--min-size", "2");
  const minSize = Math.max(2, Number.isFinite(+minSizeRaw) ? +minSizeRaw : 2);

  const familyFilter = toLower(getArgValue("--family", ""));
  const categoryFilter = toLower(getArgValue("--category", ""));
  const regionFilter = toLower(getArgValue("--region", ""));

  const batchRaw = getArgValue("--batch", "1");
  const batchSizeRaw = getArgValue("--batch-size", "10");
  const batch = Math.max(1, Number.isFinite(+batchRaw) ? +batchRaw : 1);
  const batchSize = Math.max(1, Number.isFinite(+batchSizeRaw) ? +batchSizeRaw : 10);

  const mixes = readJson("config/language-mixes.json");
  const map = readJson("config/language-mixer-map.json");

  const mixByIso = new Map();
  for (const lang of mixes) {
    if (!lang || !lang.iso) continue;
    mixByIso.set(String(lang.iso), lang);
  }

  let consideredLanguages = 0;
  const clusters = new Map();

  for (const entry of map) {
    if (!entry || !entry.iso) continue;
    const iso = String(entry.iso);
    const lang = mixByIso.get(iso);
    if (!lang) continue;

    const tags = Array.isArray(lang.tags) ? lang.tags : [];
    const isFamilyMacro = tags.includes("family");
    if (isFamilyMacro && !includeFamilies) continue;

    const basesSource = Array.isArray(entry.bases) ? entry.bases : [];
    if (!basesSource.length) continue;

    const uniqueBases = Array.from(new Set(basesSource.map(b => Number(b)))).filter(
      b => !Number.isNaN(b)
    );
    if (!uniqueBases.length) continue;

    const bases = uniqueBases.sort((a, b) => a - b);
    const key = bases.join(",");

    const meta = {
      iso,
      name: lang.name || "",
      region: lang.region || "",
      family: lang.family || "",
      category: lang.category || "",
      tags,
      bases
    };

    if (familyFilter && !toLower(meta.family).includes(familyFilter)) continue;
    if (categoryFilter && !toLower(meta.category).includes(categoryFilter)) continue;
    if (regionFilter && !toLower(meta.region).includes(regionFilter)) continue;

    consideredLanguages++;

    if (!clusters.has(key)) clusters.set(key, []);
    clusters.get(key).push(meta);
  }

  const rawClusters = Array.from(clusters.entries());

  const multiClusters = rawClusters
    .map(([key, entries]) => ({ key, entries }))
    .filter(group => group.entries.length >= minSize);

  multiClusters.sort((a, b) => {
    if (b.entries.length !== a.entries.length) return b.entries.length - a.entries.length;
    return a.key.localeCompare(b.key);
  });

  const allEntries = [];
  for (const group of multiClusters) {
    for (const meta of group.entries) {
      allEntries.push({
        iso: meta.iso,
        name: meta.name,
        region: meta.region,
        family: meta.family,
        category: meta.category,
        tags: meta.tags,
        bases: meta.bases,
        clusterSize: group.entries.length,
        clusterKey: group.key
      });
    }
  }

  const totalDuplicateLanguages = allEntries.length;

  if (!totalDuplicateLanguages) {
    console.log("No duplicate-base languages found (size >=", minSize, ")");
    return;
  }

  const startIndex = (batch - 1) * batchSize + 1;
  const endIndex = startIndex + batchSize - 1;

  const batchEntries = [];
  for (let i = 0; i < allEntries.length; i++) {
    const index = i + 1;
    if (index < startIndex || index > endIndex) continue;
    batchEntries.push({ index, ...allEntries[i] });
  }

  console.log("=== Language Mixer duplicate-base languages (flattened) ===");
  console.log("Considered catalog languages (after filters):", consideredLanguages);
  console.log("Total duplicate-base languages (size >=", minSize, "):", totalDuplicateLanguages);
  console.log("Batch index:", batch, "Batch size:", batchSize);
  console.log("1-based index range:", startIndex + "-" + endIndex);
  console.log("");

  if (!batchEntries.length) {
    console.log("No entries in this batch range.");
    return;
  }

  const padWidth = String(endIndex).length;

  for (const item of batchEntries) {
    const tagsStr = item.tags && item.tags.length ? item.tags.join(",") : "";
    const indexStr = String(item.index).padStart(padWidth, " ");
    console.log(
      indexStr +
        ". " +
        item.iso +
        " | " +
        (item.name || "(no name)") +
        " | " +
        (item.region || "") +
        " | " +
        (item.family || "") +
        " | " +
        (item.category || "") +
        " | " +
        tagsStr +
        " | bases=[" +
        item.bases.join(",") +
        "] | clusterSize=" +
        item.clusterSize
    );
  }
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error(
      "Error while selecting language mixer duplicate-base batch:",
      err && err.message ? err.message : err
    );
    process.exitCode = 1;
  }
}
