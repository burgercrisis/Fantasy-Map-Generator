"use strict";
const fs = require("fs");
const path = require("path");

const NAMEBASE_FILES = [
  "modules/namebases-africa.js",
  "modules/namebases-asia.js",
  "modules/namebases-europe.js",
  "modules/namebases-northAmerica.js",
  "modules/namebases-southAmerica.js",
  "modules/namebases-oceania.js",
  "modules/namebases-unknown.js",
  "modules/namebases-fantasy.js",
  "modules/namebases-dedicated.js"
];

const CATALOG_PATH = "config/language-mixes.json";
const OUTPUT_DIR = "docs/plans/namebase-research";
const MIN_SEEDS_SMALL = 5;
const MIN_SEEDS_IDEAL = 20;

const PLACEHOLDER_PATTERNS = [
  /placeholder/i, /TODO/i, /FIXME/i, /XXX/i, /test/i,
  /Big\s+Flowery/i, /BPh/i,
  /Primus/i, /Secundus/i, /Tertius/i, /Quartus/i, /Quintus/i,
  /Sextus/i, /Septimus/i, /Octavus/i, /Nonus/i, /Decimus/i,
  /_unq\d+/i, /_u\d+/i
];

const MOJIBAKE_PATTERNS = [
  /Ã©/, /Ã¨/, /Ã /, /Ã¢/, /Ã´/, /Ã»/, /Ã¼/, /Ã¶/, /Ã¤/,
  /Ã«/, /Ã¯/, /Ã§/, /Ã±/, /Ã¸/, /Ã¥/, /Ã¦/, /Ã°/, /Ã¾/,
  /Â»/, /Â«/, /Â¼/, /Â½/, /Â¾/
];

function isPlaceholder(name) {
  if (name.length <= 2) return true;
  for (const p of PLACEHOLDER_PATTERNS) { if (p.test(name)) return true; }
  if (/^[A-Za-z]\s*\(/.test(name)) return true;
  if (/\(dedicated\)/i.test(name)) return true;
  return false;
}

function isMojibake(name) {
  for (const p of MOJIBAKE_PATTERNS) { if (p.test(name)) return true; }
  return false;
}

function checkMinMax(min, max) {
  const issues = [];
  if (min === null) issues.push("missing min");
  if (max === null) issues.push("missing max");
  if (min !== null && max !== null) {
    if (min < 2) issues.push("min too small (" + min + ")");
    if (min > 8) issues.push("min too large (" + min + ")");
    if (max < 4) issues.push("max too small (" + max + ")");
    if (max > 16) issues.push("max too large (" + max + ")");
    if (min > max) issues.push("min > max");
    if (max - min < 2) issues.push("range too narrow");
  }
  return issues;
}

function checkD(d, seedCount) {
  const issues = [];
  if (d === null) issues.push("missing d field");
  else if (d === "" && seedCount > 0) issues.push("d empty but has seeds");
  return issues;
}

function checkM(m) {
  const issues = [];
  if (m === null) issues.push("missing m field");
  else if (m === 0) issues.push("m=0 (no multi-word)");
  return issues;
}

function checkSeeds(seedCount, totalTokens) {
  const issues = [];
  if (seedCount === 0 && totalTokens === 0) issues.push("NO DATA (empty b field)");
  else if (seedCount === 0) issues.push("ALL NUMERIC (0 real seeds)");
  else if (seedCount < MIN_SEEDS_SMALL) issues.push("TOO FEW SEEDS (" + seedCount + ")");
  else if (seedCount < MIN_SEEDS_IDEAL) issues.push("LOW SEEDS (" + seedCount + ")");
  return issues;
}

function checkNumeric(seedCount, numericCount, totalTokens) {
  const issues = [];
  if (totalTokens > 0 && seedCount > 0) {
    const ratio = numericCount / totalTokens;
    if (ratio > 0.9) issues.push("HIGH NUMERIC (" + Math.round(ratio*100) + "%)");
  }
  return issues;
}

function fileToContinent(filename) {
  const m = {
    "namebases-africa.js": "Africa",
    "namebases-asia.js": "Asia",
    "namebases-europe.js": "Europe",
    "namebases-northAmerica.js": "North America",
    "namebases-southAmerica.js": "South America",
    "namebases-oceania.js": "Oceania",
    "namebases-unknown.js": "Unknown",
    "namebases-fantasy.js": "Fantasy",
    "namebases-dedicated.js": "Dedicated"
  };
  return m[filename] || "Unknown";
}

function isContinentMatch(fileContinent, catalogRegion) {
  if (!catalogRegion) return true;
  const r = catalogRegion.toLowerCase();
  const fc = fileContinent.toLowerCase();
  if (fc === "unknown" || fc === "fantasy" || fc === "dedicated") return true;
  if (fc === "africa") return r.includes("africa");
  if (fc === "asia") return r.includes("asia") || r.includes("sino") || r.includes("indo");
  if (fc === "europe") return r.includes("europe");
  if (fc === "north america") return r.includes("north america") || r.includes("caribbean") || r.includes("central america");
  if (fc === "south america") return r.includes("south america") || r.includes("latin");
  if (fc === "oceania") return r.includes("oceania") || r.includes("pacific") || r.includes("australia") || r.includes("papua") || r.includes("melanesia") || r.includes("micronesia") || r.includes("polynesia");
  return true;
}

// Load catalog
const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf8"));
const catalogByName = new Map();
catalog.forEach(c => { if (c.name) catalogByName.set(c.name.toLowerCase(), c); });

// Parse entries - handles both quoted and unquoted keys
function extractEntries(content, filename) {
  const entries = [];
  const re = /\{[^{}]*\}/g;
  let match;
  while ((match = re.exec(content)) !== null) {
    const block = match[0];
    // Try quoted keys first, then unquoted
    let nameM = block.match(/"name":\s*"([^"]+)"/);
    if (!nameM) nameM = block.match(/name:\s*"([^"]+)"/);
    let iM = block.match(/"i":\s*(\d+)/);
    if (!iM) iM = block.match(/i:\s*(\d+)/);
    if (!nameM || !iM) continue;

    const name = nameM[1];
    const idx = parseInt(iM[1], 10);

    let minM = block.match(/"min":\s*(\d+)/);
    if (!minM) minM = block.match(/min:\s*(\d+)/);
    let maxM = block.match(/"max":\s*(\d+)/);
    if (!maxM) maxM = block.match(/max:\s*(\d+)/);
    let dM = block.match(/"d":\s*"([^"]*)"/);
    if (!dM) dM = block.match(/d:\s*"([^"]*)"/);
    let mM = block.match(/"m":\s*([\d.]+)/);
    if (!mM) mM = block.match(/m:\s*([\d.]+)/);
    let bM = block.match(/"b":\s*"([^"]*)"/);
    if (!bM) bM = block.match(/b:\s*"([^"]*)"/);

    const min = minM ? parseInt(minM[1]) : null;
    const max = maxM ? parseInt(maxM[1]) : null;
    const d = dM ? dM[1] : null;
    const m = mM ? parseFloat(mM[1]) : null;
    const bField = bM ? bM[1] : "";
    const tokens = bField.split(",").map(s => s.trim()).filter(Boolean);
    const nameTokens = tokens.filter(t => !/^\d+$/.test(t));
    const numericTokens = tokens.filter(t => /^\d+$/.test(t));

    entries.push({
      name, i: idx, min, max, d, m, bField, filename,
      seedCount: nameTokens.length,
      numericCount: numericTokens.length,
      totalTokens: tokens.length,
      sampleSeeds: nameTokens.slice(0, 5).join(" | "),
      allSeeds: nameTokens.join(" | ")
    });
  }
  return entries;
}

const allEntries = [];
for (const file of NAMEBASE_FILES) {
  try {
    const content = fs.readFileSync(file, "utf8");
    const entries = extractEntries(content, file.replace("modules/", ""));
    allEntries.push(...entries);
    console.log(file + ": " + entries.length + " entries");
  } catch (e) {
    console.error("ERROR parsing " + file + ": " + e.message);
  }
}
console.log("Total: " + allEntries.length + " entries");

// Enrich with quality checks
const enriched = allEntries.map(entry => {
  const placeholder = isPlaceholder(entry.name);
  const mojibake = isMojibake(entry.name);
  const minMaxIssues = checkMinMax(entry.min, entry.max);
  const dIssues = checkD(entry.d, entry.seedCount);
  const mIssues = checkM(entry.m);
  const seedIssues = checkSeeds(entry.seedCount, entry.totalTokens);
  const numericIssues = checkNumeric(entry.seedCount, entry.numericCount, entry.totalTokens);
  const catalogEntry = catalogByName.get(entry.name.toLowerCase());
  const catalogMatch = !!catalogEntry;
  const catalogIso = catalogEntry ? catalogEntry.iso : null;
  const catalogRegion = catalogEntry ? catalogEntry.region : null;
  const catalogFamily = catalogEntry ? catalogEntry.family : null;
  const wikiUrl = catalogEntry ? (catalogEntry.wikipedia || "") : "";
  const fileC = fileToContinent(entry.filename);
  const continentMismatch = catalogRegion ? !isContinentMatch(fileC, catalogRegion) : false;

  const allIssues = [];
  if (placeholder) allIssues.push("PLACEHOLDER");
  if (mojibake) allIssues.push("MOJIBAKE");
  minMaxIssues.forEach(i => allIssues.push("MINMAX:" + i));
  dIssues.forEach(i => allIssues.push("D:" + i));
  mIssues.forEach(i => allIssues.push("M:" + i));
  seedIssues.forEach(i => allIssues.push("SEEDS:" + i));
  numericIssues.forEach(i => allIssues.push("NUMERIC:" + i));
  if (continentMismatch) allIssues.push("CONTINENT MISMATCH (file=" + fileC + ", catalog=" + catalogRegion + ")");
  if (!catalogMatch) allIssues.push("NOT IN CATALOG");

  let severity = "OK";
  if (entry.seedCount === 0) severity = "CRITICAL";
  else if (placeholder || mojibake || continentMismatch) severity = "HIGH";
  else if (allIssues.length > 0) severity = "MEDIUM";

  return {
    ...entry, placeholder, mojibake, minMaxIssues, dIssues, mIssues, seedIssues, numericIssues,
    catalogMatch, catalogIso, catalogRegion, catalogFamily, wikiUrl,
    continentMismatch, fileContinent: fileC, allIssues, severity
  };
});

fs.writeFileSync(path.join(OUTPUT_DIR, "data.json"), JSON.stringify(enriched, null, 2), "utf8");
console.log("Written data.json");

const critical = enriched.filter(e => e.severity === "CRITICAL").length;
const high = enriched.filter(e => e.severity === "HIGH").length;
const medium = enriched.filter(e => e.severity === "MEDIUM").length;
const ok = enriched.filter(e => e.severity === "OK").length;
console.log("CRITICAL=" + critical + " HIGH=" + high + " MEDIUM=" + medium + " OK=" + ok);
