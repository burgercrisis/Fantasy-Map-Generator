"use strict";
const fs = require("node:fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..", "..");

const CONTINENT_FILES = [
  "modules/namebases-africa.js",
  "modules/namebases-asia.js",
  "modules/namebases-europe.js",
  "modules/namebases-northAmerica.js",
  "modules/namebases-southAmerica.js",
  "modules/namebases-oceania.js",
  "modules/namebases-fantasy.js"
];

const CONTINENT_MAP = {
  "modules/namebases-africa.js":       { name: "africa",         arrayName: "africaNameBases" },
  "modules/namebases-asia.js":         { name: "asia",           arrayName: "asiaNameBases" },
  "modules/namebases-europe.js":       { name: "europe",         arrayName: "europeNameBases" },
  "modules/namebases-northAmerica.js": { name: "northAmerica",   arrayName: "NorthAmericaNameBases" },
  "modules/namebases-southAmerica.js": { name: "southAmerica",   arrayName: "SouthAmericaNameBases" },
  "modules/namebases-oceania.js":      { name: "oceania",        arrayName: "oceaniaNameBases" },
  "modules/namebases-fantasy.js":      { name: "fantasy",        arrayName: "fantasyNameBases" }
};

// ── Shared loader ────────────────────────────────────────────────────────────

function loadAllNamebases() {
  const all = [];
  for (const file of CONTINENT_FILES) {
    const full = path.join(root, file);
    if (!fs.existsSync(full)) continue;
    const content = fs.readFileSync(full, "utf8");
    const context = { module: { exports: {} }, window: {} };
    const ctx = vm.createContext(context);
    try { vm.runInContext(content, ctx, { filename: file }); } catch (e) { console.error(`Error loading ${file}: ${e.message}`); continue; }
    const { arrayName } = CONTINENT_MAP[file];
    const entries = context.window[arrayName];
    if (Array.isArray(entries)) {
      entries.forEach(e => all.push({ ...e, _sourceFile: path.basename(file) }));
    }
  }
  return all;
}

function loadOneFile(file) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) return [];
  const content = fs.readFileSync(full, "utf8");
  const context = { module: { exports: {} }, window: {} };
  const ctx = vm.createContext(context);
  vm.runInContext(content, ctx, { filename: file });
  const { arrayName } = CONTINENT_MAP[file];
  return context.window[arrayName] || [];
}

// ── Subcommand: status ───────────────────────────────────────────────────────
// Unified status report (replaces report-namebase-status.js, report-placeholder-entries.js,
// report-placeholder-d-values.js, report-short-bases.js, report-remaining-cleanup-issues.js)

function cmdStatus({ brief, shortThreshold, json, outputFile } = {}) {
  const all = loadAllNamebases();
  const totalEntries = all.length;
  const dedupCount = all.filter(e => (e.name || "").includes("(dedicated)")).length;
  const lnrtCount = all.filter(e => e.d === "lnrt").length;
  const emptyDCount = all.filter(e => e.d === "").length;

  // Short bases
  const shortEntries = all.filter(e => {
    if (!e.b) return true;
    return e.b.split(",").filter(c => c.trim()).length < shortThreshold;
  });

  // Primus placeholders
  const primusEntries = all.filter(e => e.b && e.b.startsWith("Primus"));

  // _unq placeholders
  const unqEntries = all.filter(e => e.b && e.b.includes("_unq"));

  // By file
  const byFile = {};
  CONTINENT_FILES.forEach(f => {
    const entries = loadOneFile(f);
    const base = path.basename(f);
    byFile[base] = {
      entries: entries.length,
      short: entries.filter(e => !e.b || e.b.split(",").length < shortThreshold).length
    };
  });

  const results = {
    timestamp: new Date().toISOString(),
    totalEntries,
    dedupCount,
    placeholderD: lnrtCount,
    emptyD: emptyDCount,
    shortBases: shortEntries.length,
    shortThreshold,
    primus: primusEntries.length,
    unq: unqEntries.length,
    byFile
  };

  if (json) {
    const out = JSON.stringify(results, null, 2);
    if (outputFile) { fs.writeFileSync(path.join(root, outputFile), out, "utf8"); console.log(`Written to ${outputFile}`); }
    else console.log(out);
    return;
  }

  console.log("=== NAMEBASE STATUS REPORT ===\n");
  console.log("Generated:", results.timestamp);
  console.log(`Total entries: ${totalEntries}`);
  console.log(`Entries with (dedicated): ${dedupCount}`);
  console.log(`Placeholder d-values (lnrt): ${lnrtCount}`);
  console.log(`Empty d-values: ${emptyDCount}`);
  console.log(`Short bases (<${shortThreshold} cities): ${shortEntries.length}`);
  console.log(`Primus placeholders: ${primusEntries.length}`);
  console.log(`_unq placeholders: ${unqEntries.length}`);

  if (!brief) {
    console.log("\n--- BY FILE ---");
    for (const [file, data] of Object.entries(byFile)) {
      console.log(`  ${file}: ${data.entries} entries, ${data.short} short`);
    }
    if (shortEntries.length > 0) {
      console.log("\n--- SHORT BASE ENTRIES (first 15) ---");
      shortEntries.slice(0, 15).forEach(e => {
        const cities = e.b ? e.b.split(",").length : 0;
        const preview = (e.b || "").substring(0, 60);
        console.log(`  i:${e.i} [${e._sourceFile}] ${e.name} — ${cities} cities: ${preview}`);
      });
    }
  }
}

// ── Subcommand: integrity ────────────────────────────────────────────────────
// Checks index+name collisions (replaces check-namebase-integrity.js, check-namebase-collisions.js)

function cmdIntegrity() {
  const all = loadAllNamebases();
  const byIndex = new Map();
  const byName = new Map();
  let indexCollisions = 0;
  let nameCollisions = 0;

  all.forEach(e => {
    // Index collisions
    if (byIndex.has(e.i)) {
      const first = byIndex.get(e.i);
      console.error(`INDEX COLLISION: i:${e.i} — "${first.name}" (${first._sourceFile}) vs "${e.name}" (${e._sourceFile})`);
      indexCollisions++;
    } else {
      byIndex.set(e.i, e);
    }
    // Name collisions
    const lower = (e.name || "").toLowerCase().trim();
    if (byName.has(lower)) {
      const first = byName.get(lower);
      console.error(`NAME COLLISION: "${e.name}" — i:${first.i} (${first._sourceFile}) vs i:${e.i} (${e._sourceFile})`);
      nameCollisions++;
    } else {
      byName.set(lower, e);
    }
  });

  console.log(`\nTotal entries: ${all.length}`);
  console.log(`Unique indices: ${byIndex.size}`);
  console.log(`Unique names: ${byName.size}`);
  console.log(`Index collisions: ${indexCollisions}`);
  console.log(`Name collisions: ${nameCollisions}`);

  if (indexCollisions === 0 && nameCollisions === 0) console.log("\n✅ No collisions found.");
}

// ── Subcommand: validate ─────────────────────────────────────────────────────
// File syntax+UTF8 validation (replaces validate-namebases.js, validate-namebase-json.js)

function cmdValidate() {
  let errors = 0;
  CONTINENT_FILES.forEach(f => {
    const full = path.join(root, f);
    if (!fs.existsSync(full)) { console.log(`  SKIP (not found): ${f}`); return; }
    const content = fs.readFileSync(full, "utf8");

    // UTF-8 sanity check (mojibake indicator)
    if (/Ã[A-Za-z]/.test(content)) {
      console.error(`  UTF-8 WARNING: ${f} may contain mojibake`);
      errors++;
    }

    // JS syntax check
    const context = { module: { exports: {} }, window: {} };
    const ctx = vm.createContext(context);
    try {
      vm.runInContext(content, ctx, { filename: f });
      const { arrayName } = CONTINENT_MAP[f];
      if (!Array.isArray(context.window[arrayName])) {
        console.error(`  STRUCTURE ERROR: ${f} missing ${arrayName} array`);
        errors++;
      } else {
        console.log(`  OK: ${f} (${context.window[arrayName].length} entries)`);
      }
    } catch (e) {
      console.error(`  SYNTAX ERROR in ${f}: ${e.message}`);
      errors++;
    }
  });

  if (errors === 0) console.log("\n✅ All files valid.");
  else console.log(`\n⚠️  ${errors} issue(s) found.`);
}

// ── Subcommand: coverage ─────────────────────────────────────────────────────
// Mixer map coverage check (moved from check-mixer-map-coverage.js)

function cmdCoverage() {
  const mapPath = path.join(root, "config/language-mixer-map.json");
  const mixesPath = path.join(root, "config/language-mixes.json");
  if (!fs.existsSync(mapPath)) { console.error("language-mixer-map.json not found"); return; }
  if (!fs.existsSync(mixesPath)) { console.error("language-mixes.json not found"); return; }

  const map = JSON.parse(fs.readFileSync(mapPath, "utf8").replace(/^\uFEFF/, ""));
  const mixes = JSON.parse(fs.readFileSync(mixesPath, "utf8").replace(/^\uFEFF/, ""));

  const mapIsos = new Set(map.map(e => e.iso));
  const mixIsos = new Set(mixes.map(e => e.iso));

  const inMapNotCatalog = [...mapIsos].filter(iso => !mixIsos.has(iso));
  const inCatalogNotMap = [...mixIsos].filter(iso => !mapIsos.has(iso));

  console.log("Total ISO codes in mixer map:", mapIsos.size);
  console.log("Total ISO codes in mixer catalog:", mixIsos.size);
  console.log("In map but missing from catalog:", inMapNotCatalog.length);
  if (inMapNotCatalog.length) console.log("  " + inMapNotCatalog.join(", "));
  console.log("In catalog but missing from map:", inCatalogNotMap.length);
  if (inCatalogNotMap.length) console.log("  " + inCatalogNotMap.join(", "));
}

// ── Subcommand: inspect ──────────────────────────────────────────────────────
// Single entry lookup (moved from inspect-namebase-entry.js)

function cmdInspect({ index } = {}) {
  const target = parseInt(index, 10);
  if (isNaN(target)) { console.error("Usage: --subcmd=inspect --index=<number>"); process.exit(1); }
  const all = loadAllNamebases();
  const entry = all.find(e => e.i === target);
  if (!entry) {
    console.log(`Entry at index ${target} not found. Total entries: ${all.length}`);
    return;
  }
  const cityCount = entry.b ? entry.b.split(",").length : 0;
  console.log(`\n=== ENTRY i:${target} ===`);
  console.log(`  Name: ${entry.name}`);
  console.log(`  Source: ${entry._sourceFile}`);
  console.log(`  d: ${entry.d || "(empty)"}`);
  console.log(`  Cities: ${cityCount}`);
  if (entry.b) {
    console.log(`  First 5: ${entry.b.split(",").slice(0, 5).join(", ")}`);
    console.log(`  Full list:\n  ${entry.b}`);
  }
}

// ── Subcommand: duplicates ───────────────────────────────────────────────────
// Check for duplicate cities within entries (moved from check-duplicate-cities.js)

function cmdDuplicates() {
  const all = loadAllNamebases();
  let count = 0;
  all.forEach(e => {
    if (!e.b) return;
    const cities = e.b.split(",").map(c => c.trim()).filter(c => c);
    const unique = new Set(cities);
    if (unique.size < cities.length) {
      count++;
      console.log(`  i:${e.i} ${e.name} (${e._sourceFile}): ${cities.length} → ${unique.size} unique`);
    }
  });
  console.log(`\nEntries with duplicate cities: ${count}`);
  if (count === 0) console.log("✅ No duplicates found.");
}

// ── Subcommand: backups ──────────────────────────────────────────────────────
// List backup files (moved from list-backup-files.js)

function cmdBackups() {
  const modsDir = path.join(root, "modules");
  if (!fs.existsSync(modsDir)) { console.error("modules/ directory not found"); return; }
  const files = fs.readdirSync(modsDir).filter(f => f.includes(".backup"));
  console.log(`Backup files in modules/: ${files.length}\n`);
  files.forEach(f => {
    const stat = fs.statSync(path.join(modsDir, f));
    console.log(`  ${f} (${(stat.size / 1024).toFixed(1)} KB)`);
  });
}

// ── CLI ──────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const get = (flag) => { const a = args.find(x => x.startsWith(flag + "=")); return a ? a.split("=")[1] : null; };
const has = (flag) => args.includes(flag);

const subcmd = args[0] || "status";

switch (subcmd) {
  case "status":
    cmdStatus({ brief: has("--brief"), shortThreshold: parseInt(get("short-threshold") || "4", 10), json: has("--json"), outputFile: get("output") });
    break;
  case "integrity":
    cmdIntegrity();
    break;
  case "validate":
    cmdValidate();
    break;
  case "coverage":
    cmdCoverage();
    break;
  case "inspect":
    cmdInspect({ index: get("index") });
    break;
  case "duplicates":
    cmdDuplicates();
    break;
  case "backups":
    cmdBackups();
    break;
  case "help":
  default:
    console.log(`Usage: node tools/validation/check-namebases.js <subcmd> [options]

Subcommands:
  status              Full status report (entries, placeholders, d-values, short bases)
    --brief                  Summary only
    --short-threshold=N      Short base threshold (default: 4)
    --json                   JSON output
    --output=FILE            Write JSON to file

  integrity           Check index and name collisions

  validate            Validate JS syntax and UTF-8 of all namebase files

  coverage            Check mixer map vs catalog ISO code coverage

  inspect             Look up a single entry by index
    --index=<n>              Entry index (required)

  duplicates          Check for duplicate cities within entries

  backups             List backup files in modules/

Examples:
  node tools/validation/check-namebases.js status
  node tools/validation/check-namebases.js status --brief
  node tools/validation/check-namebases.js integrity
  node tools/validation/check-namebases.js validate
  node tools/validation/check-namebases.js coverage
  node tools/validation/check-namebases.js inspect --index=1857
  node tools/validation/check-namebases.js duplicates`);
}
