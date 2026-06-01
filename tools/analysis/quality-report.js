"use strict";
const fs = require("node:fs");
const path = require("node:path");

const DEFAULT_CSV = "docs/reports/language-metrics/language-quality-metrics.csv";
const MODULES_DIR = path.join(process.cwd(), "modules");

// ── Helpers ──────────────────────────────────────────────────────────────────

function loadQualityCsv(csvPath) {
  const resolved = csvPath || DEFAULT_CSV;
  if (!fs.existsSync(resolved)) { console.error(`CSV not found: ${resolved}`); process.exit(1); }
  const content = fs.readFileSync(resolved, "utf8");
  const lines = content.split("\n").filter(l => l.trim());
  const headers = lines[0].split(",");
  const colIndex = {};
  headers.forEach((col, i) => { colIndex[col] = i; });
  const rows = lines.slice(1).map(line => {
    const fields = line.split(",");
    return {
      language_name: fields[colIndex["language_name"]] || "",
      continent: fields[colIndex["continent"]] || "",
      city_count: parseInt(fields[colIndex["city_count"]], 10) || 0,
      quality_score: parseInt(fields[colIndex["quality_score"]], 10) || 0,
      source_file: fields[colIndex["source_file"]] || "",
      index: fields[colIndex["index"]] || ""
    };
  });
  return { rows, colIndex };
}

function loadNamebaseEntries(fileName) {
  const content = fs.readFileSync(path.join(MODULES_DIR, fileName), "utf8");
  const regex = /\{\s*"name":\s*"([^"]+)"\s*,\s*"i":\s*(\d+)\s*,[^}]*"b":\s*"([^"]+)"/g;
  const entries = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    entries.push({
      name: match[1],
      index: parseInt(match[2], 10),
      cityCount: match[3].split(",").filter(c => c.trim()).length,
      cities: match[3]
    });
  }
  return entries;
}

// ── Subcommand: threshold ────────────────────────────────────────────────────
// Analyze what causes a specific quality score (default: 85).

function cmdThreshold({ score = "85" } = {}) {
  const { rows } = loadQualityCsv();
  const target = +score;
  const matching = rows.filter(r => r.quality_score === target);

  console.log(`=== Analysis: Quality Score ${target} ===\n`);
  console.log(`Total entries with score ${target}: ${matching.length}\n`);

  // City count distribution
  const dist = {};
  matching.forEach(r => {
    const key = r.city_count;
    if (!dist[key]) dist[key] = [];
    dist[key].push(r);
  });
  console.log("City count distribution:");
  Object.keys(dist).sort((a, b) => +a - +b).forEach(k => {
    console.log(`  ${k} cities: ${dist[k].length} entries`);
  });

  console.log(`\nSample entries (first 30):`);
  matching.slice(0, 30).forEach(r => {
    console.log(`  ${r.language_name} (${r.continent}) - ${r.city_count} cities`);
  });

  const fewCities = matching.filter(r => r.city_count < 5);
  console.log(`\nEntries with < 5 cities: ${fewCities.length}`);
  fewCities.forEach(r => console.log(`  ${r.language_name} (${r.continent}) - ${r.city_count} cities`));
}

// ── Subcommand: low-quality ──────────────────────────────────────────────────
// List languages with low city counts from the CSV.

function cmdLowQuality({ cities = "6" } = {}) {
  const { rows } = loadQualityCsv();
  const threshold = +cities;
  const low = rows.filter(r => r.city_count <= threshold).sort((a, b) => a.city_count - b.city_count);

  console.log(`=== Languages with ≤ ${threshold} cities ===\n`);
  console.log(`Total: ${low.length}\n`);

  low.forEach(r => {
    console.log(`  ${r.city_count} cities | i:${r.index.padStart(4)} | ${r.language_name} (${r.source_file}) score:${r.quality_score}`);
  });
}

// ── Subcommand: continent-cities ─────────────────────────────────────────────
// List city counts per language for a specific namebase file.

function cmdContinentCities({ file, min = "25" } = {}) {
  if (!file) { console.error("Usage: --subcmd=continent-cities --file=namebases-europe.js --min=25"); process.exit(1); }
  const entries = loadNamebaseEntries(file);
  const threshold = +min;
  entries.sort((a, b) => a.cityCount - b.cityCount);

  const below = entries.filter(e => e.cityCount < threshold);

  console.log(`=== ${file}: Languages with < ${threshold} cities ===\n`);
  console.log(`Total entries: ${entries.length}`);
  console.log(`Below threshold: ${below.length}\n`);

  entries.forEach(e => {
    const flag = e.cityCount < threshold ? " ⚠️ NEEDS EXPANSION" : " ✓ OK";
    console.log(`  ${e.cityCount.toString().padStart(3)} cities | i:${e.index.toString().padStart(4)} | ${flag} | ${e.name}`);
  });

  if (below.length > 0) {
    console.log(`\n=== Detailed: Below threshold ===\n`);
    below.forEach(e => {
      const sample = e.cities.split(",").slice(0, 10).join(", ");
      console.log(`  ${e.name} (i:${e.index}) - ${e.cityCount} cities`);
      console.log(`    Sample: ${sample}...\n`);
    });
  }
}

// ── CLI ──────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const get = (flag) => { const a = args.find(x => x.startsWith(flag + "=")); return a ? a.split("=")[1] : null; };

const subcmd = args[0] || "threshold";

switch (subcmd) {
  case "threshold":
    cmdThreshold({ score: get("score") || "85" });
    break;
  case "low-quality":
    cmdLowQuality({ cities: get("cities") || "6" });
    break;
  case "continent-cities":
    cmdContinentCities({ file: get("file"), min: get("min") || "25" });
    break;
  case "help":
  default:
    console.log(`Usage: node tools/analysis/quality-report.js <subcmd> [options]

Subcommands:
  threshold         Analyze what drives a specific quality score
    --score=<n>           Quality score to analyze (default: 85)

  low-quality       List languages with low city counts from CSV
    --cities=<n>          Max city count threshold (default: 6)

  continent-cities  List city counts per language in a namebase file
    --file=<name>         Namebase file (required)
    --min=<n>             City count threshold (default: 25)

Examples:
  node tools/analysis/quality-report.js threshold --score=85
  node tools/analysis/quality-report.js low-quality --cities=5
  node tools/analysis/quality-report.js continent-cities --file=namebases-europe.js --min=25`);
}
