"use strict";
const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");

const NAMEBASES_REAL = path.join(process.cwd(), "modules", "namebases-real.js");

// ── Helpers ──────────────────────────────────────────────────────────────────

function loadRealNamebases() {
  if (!fs.existsSync(NAMEBASES_REAL)) { console.error("modules/namebases-real.js not found"); process.exit(1); }
  return fs.readFileSync(NAMEBASES_REAL, "utf8");
}

function parseEntries(content) {
  const regex = /\{name:\s*"(.*?)",\s*i:\s*(\d+),\s*p:\s*"(.*?)",\s*b:\s*"(.*?)",\s*d:\s*"(.*?)"\}/g;
  const entries = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    entries.push({ name: match[1], i: parseInt(match[2], 10), p: match[3], b: match[4], d: match[5] });
  }
  return entries;
}

// ── Subcommand: count ────────────────────────────────────────────────────────
// Count total dedicated entries and those using _unq placeholder seeds.

function cmdCount() {
  const content = loadRealNamebases();
  const entries = parseEntries(content);
  let dedicatedCount = 0;
  let unqCount = 0;
  entries.forEach(e => {
    if (e.name.includes("(dedicated)")) {
      dedicatedCount++;
      if (e.b.includes("_unq")) unqCount++;
    }
  });
  console.log(`Dedicated entries: ${dedicatedCount}`);
  console.log(`Dedicated entries with _unq: ${unqCount}`);
  console.log(`Dedicated entries with real seeds: ${dedicatedCount - unqCount}`);
}

// ── Subcommand: list ─────────────────────────────────────────────────────────
// List all entries still using _unq placeholder seeds.

function cmdList({ limit = "20" } = {}) {
  const content = loadRealNamebases();
  const entries = parseEntries(content);
  const unqEntries = entries.filter(e => e.b.includes("_unq"));
  console.log(`Total _unq entries: ${unqEntries.length}\n`);
  console.log(`First ${limit} _unq entries:`);
  unqEntries.slice(0, +limit).forEach(e => {
    const basePreview = e.b.substring(0, 60) + (e.b.length > 60 ? "..." : "");
    console.log(`  ${e.i}: ${e.name} -> ${basePreview}`);
  });
}

// ── Subcommand: report ───────────────────────────────────────────────────────
// Run the seed-uniqueness diagnostic and filter/show results.

function cmdReport({ limit = "5000" } = {}) {
  console.log("Running seed uniqueness report...\n");
  try {
    const output = execSync(
      `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures --limit=${limit}`,
      { encoding: "utf8", maxBuffer: 100 * 1024 * 1024 }
    );
    const lines = output.split("\n");
    let failureCount = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.includes("|") && line.includes("map")) {
        if (line.includes("|uniqBase") && (line.includes("|strict<1") || line.includes("|norm<10"))) {
          failureCount++;
          const parts = line.split("|").map(p => p.trim());
          const details = (i + 1 < lines.length) ? lines[i + 1].trim() : "";
          console.log(`${parts[0]} | ${parts[1]} | ${parts.slice(3).join(" | ")} | ${details}`);
        }
      }
    }
    console.log(`\nFound ${failureCount} fixable failures (have unique bases but fail thresholds).`);
  } catch (e) {
    console.error("Error running report:", e.message);
  }
}

// ── Subcommand: fix ──────────────────────────────────────────────────────────
// Replace _unq placeholders with real seeds for a given ISO.

function cmdFix({ iso, seeds } = {}) {
  if (!iso || !seeds) {
    console.error("Usage: node audit-uniqueness.js fix --iso=<code> --seeds=\"Seed1,Seed2,Seed3\"");
    process.exit(1);
  }

  const seedList = seeds.split(",").map(s => s.trim()).filter(s => s);
  if (seedList.length < 5) {
    console.warn(`Warning: Only ${seedList.length} seeds provided for ${iso}. Quality might be low.`);
  }

  let content = loadRealNamebases();
  const unqRegex = new RegExp(`b: "(${iso}_(\\d+)_unq1,.*?)"`, "g");
  let match = unqRegex.exec(content);

  if (!match) {
    // Try finding via language-mixer-map.json
    const mixerMapPath = path.join(process.cwd(), "config", "language-mixer-map.json");
    if (fs.existsSync(mixerMapPath)) {
      const mixerMap = JSON.parse(fs.readFileSync(mixerMapPath, "utf8"));
      const mapEntry = mixerMap.find(e => e.iso === iso);
      if (mapEntry && mapEntry.bases && mapEntry.bases.length > 0) {
        const index = mapEntry.bases[0];
        const indexRegex = new RegExp(`{name: ".*?", i: ${index},.*?, b: "(.*?)"}`, "g");
        match = indexRegex.exec(content);
      }
    }
  }

  if (!match) {
    console.error(`Could not find dedicated entry for ISO: ${iso}`);
    process.exit(1);
  }

  content = content.replace(match[1], seedList.join(","));
  fs.writeFileSync(NAMEBASES_REAL, content, "utf8");
  console.log(`Successfully updated ${iso} with ${seedList.length} real seeds.`);
}

// ── CLI ──────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const get = (flag) => { const a = args.find(x => x.startsWith(flag + "=")); return a ? a.split("=")[1] : null; };

const subcmd = args[0] || "count";

switch (subcmd) {
  case "count":
    cmdCount();
    break;
  case "list":
    cmdList({ limit: get("limit") || "20" });
    break;
  case "report":
    cmdReport({ limit: get("limit") || "5000" });
    break;
  case "fix":
    cmdFix({ iso: get("iso"), seeds: get("seeds") });
    break;
  case "help":
  default:
    console.log(`Usage: node tools/analysis/audit-uniqueness.js <subcmd> [options]

Subcommands:
  count             Count dedicated and _unq placeholder entries

  list              List entries with _unq placeholders
    --limit=<n>           Number of entries to show (default: 20)

  report            Run seed-uniqueness diagnostic and show fixable failures
    --limit=<n>           Max failures to process (default: 5000)

  fix               Replace _unq placeholders with real seeds
    --iso=<code>          ISO code to fix
    --seeds="S1,S2,..."   Comma-separated seed list

Examples:
  node tools/analysis/audit-uniqueness.js count
  node tools/analysis/audit-uniqueness.js list --limit=50
  node tools/analysis/audit-uniqueness.js report
  node tools/analysis/audit-uniqueness.js fix --iso=agarabi --seeds="Foo,Bar,Baz"`);
}
