"use strict";
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const MODULES_DIR = path.join(process.cwd(), "modules");
const CONFIG_DIR = path.join(process.cwd(), "config");

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Load all continental namebases by executing each file in a sandbox. */
function loadBasesViaSandbox() {
  const files = [
    "namebases-europe.js", "namebases-africa.js", "namebases-asia.js",
    "namebases-northAmerica.js", "namebases-southAmerica.js",
    "namebases-oceania.js", "namebases-fantasy.js"
  ];
  const varNames = {
    "namebases-europe.js": "EuropeNameBases",
    "namebases-africa.js": "AfricaNameBases",
    "namebases-asia.js": "AsiaNameBases",
    "namebases-northAmerica.js": "NorthAmericaNameBases",
    "namebases-southAmerica.js": "SouthAmericaNameBases",
    "namebases-oceania.js": "OceaniaNameBases",
    "namebases-fantasy.js": "fantasyNameBases"
  };

  const sandbox = { window: {}, module: { exports: {} }, exports: {}, console, nameBases: [] };
  sandbox.exports = sandbox.module.exports;
  sandbox.globalThis = sandbox;
  const context = vm.createContext(sandbox);
  const allBases = [];

  for (const file of files) {
    const filePath = path.join(MODULES_DIR, file);
    if (!fs.existsSync(filePath)) continue;
    const src = fs.readFileSync(filePath, "utf8");
    vm.runInContext(src, context);
    const varName = varNames[file];
    const fileBases = sandbox.window[varName] || [];
    fileBases.forEach(b => {
      if (b && typeof b.i === "number") allBases.push({ ...b, sourceFile: file });
    });
  }
  return allBases;
}

/** Load all continental namebases via regex (no VM execution needed). */
function loadBasesViaRegex() {
  const files = fs.readdirSync(MODULES_DIR).filter(f => /^namebases-.*\.js$/.test(f) && !f.includes("backup") && !f.includes("single-line"));
  const allBases = [];
  files.forEach(file => {
    const content = fs.readFileSync(path.join(MODULES_DIR, file), "utf8");
    const regex = /\{[^}]*name:\s*"([^"]+)"[^}]*i:\s*(\d+)/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      allBases.push({ name: match[1], i: parseInt(match[2], 10), sourceFile: file });
    }
  });
  return allBases;
}

/** Index a base array by its `i` field. */
function indexById(bases) {
  const map = new Map();
  bases.forEach(b => { if (!map.has(b.i)) map.set(b.i, []); map.get(b.i).push(b); });
  return map;
}

/** Index a base array by lowercase name. */
function indexByName(bases) {
  const map = new Map();
  bases.forEach(b => {
    const key = (b.name || "").toLowerCase().trim();
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(b);
  });
  return map;
}

// ── Subcommand: collisions ───────────────────────────────────────────────────
// Detects duplicate `i` values across all namebase files (index collisions).

function cmdCollisions({ method = "regex" } = {}) {
  const bases = method === "sandbox" ? loadBasesViaSandbox() : loadBasesViaRegex();
  const byId = indexById(bases);
  const collisions = [];
  byId.forEach((entries, id) => {
    if (entries.length > 1) collisions.push({ index: id, entries });
  });

  if (collisions.length === 0) {
    console.log("✅ No index collisions found.");
  } else {
    console.log(`⚠️  Found ${collisions.length} index collision(s):\n`);
    collisions.forEach(c => {
      console.log(`  i:${c.index}`);
      c.entries.forEach(e => console.log(`    "${e.name}" (${e.sourceFile})`));
      console.log();
    });
  }

  // Also check for name collisions
  const byName = indexByName(bases);
  const nameDups = [];
  byName.forEach((entries, name) => {
    if (entries.length > 1) nameDups.push({ name, entries });
  });

  if (nameDups.length > 0) {
    console.log(`⚠️  Found ${nameDups.length} name collision(s):\n`);
    nameDups.forEach(c => {
      console.log(`  "${c.name}"`);
      c.entries.forEach(e => console.log(`    i:${e.i} (${e.sourceFile})`));
      console.log();
    });
  }

  return { collisions, nameDups };
}

// ── Subcommand: mixer-map ────────────────────────────────────────────────────
// Audits language-mixer-map.json: checks every mapped index exists in namebases.

function cmdMixerMap() {
  const bases = loadBasesViaRegex();
  const byId = indexById(bases);

  const mixerMap = JSON.parse(fs.readFileSync(path.join(CONFIG_DIR, "language-mixer-map.json"), "utf8"));
  const issues = [];

  mixerMap.forEach(entry => {
    (entry.bases || []).forEach(baseIndex => {
      if (!byId.has(baseIndex)) {
        issues.push(`ISO ${entry.iso} maps to non-existent index ${baseIndex}`);
      }
    });
  });

  if (issues.length === 0) {
    console.log("✅ All mixer map indices resolve to valid namebase entries.");
  } else {
    console.log(`⚠️  Found ${issues.length} mixer map issue(s):\n`);
    issues.forEach(i => console.log(`  ${i}`));
  }

  return issues;
}

// ── Subcommand: stats ────────────────────────────────────────────────────────
// Quick summary: how many entries per continent file, total count.

function cmdStats() {
  const files = fs.readdirSync(MODULES_DIR).filter(f => /^namebases-.*\.js$/.test(f) && !f.includes("backup") && !f.includes("single-line"));
  let total = 0;
  console.log("Namebase file stats:\n");
  files.forEach(file => {
    const content = fs.readFileSync(path.join(MODULES_DIR, file), "utf8");
    const matches = content.match(/\{/g);
    const count = matches ? matches.length : 0;
    total += count;
    console.log(`  ${file}: ${count} entries`);
  });
  console.log(`\n  Total: ${total} entries`);
}

// ── Subcommand: list ─────────────────────────────────────────────────────────
// List entries in a specific namebase file with optional filter.

function cmdList({ file, minCities, maxCities } = {}) {
  if (!file) { console.error("Usage: --subcmd=list --file=namebases-europe.js"); process.exit(1); }
  const content = fs.readFileSync(path.join(MODULES_DIR, file), "utf8");
  const entryRegex = /\{\s*"name":\s*"([^"]+)"[^}]*"i":\s*(\d+)[^}]*"b":\s*"([^"]+)"/g;
  const entries = [];
  let match;
  while ((match = entryRegex.exec(content)) !== null) {
    const cityCount = match[3].split(",").filter(c => c.trim()).length;
    entries.push({ name: match[1], index: parseInt(match[2]), cityCount, cities: match[3] });
  }

  if (minCities !== undefined) entries.splice(0, entries.length, ...entries.filter(e => e.cityCount <= (+minCities)));
  if (maxCities !== undefined) entries.splice(0, entries.length, ...entries.filter(e => e.cityCount >= (+maxCities)));

  entries.sort((a, b) => a.cityCount - b.cityCount);

  const filterDesc = minCities !== undefined ? ` (≤${minCities} cities)` : "";
  console.log(`Entries in ${file}${filterDesc}: ${entries.length}\n`);
  entries.forEach(e => {
    const flag = e.cityCount < 25 ? " ⚠️" : "";
    console.log(`  ${e.cityCount.toString().padStart(3)} cities | i:${e.index.toString().padStart(4)} | ${e.name}${flag}`);
  });
}

// ── CLI ──────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const get = (flag) => { const a = args.find(x => x.startsWith(flag + "=")); return a ? a.split("=")[1] : null; };
const has = (flag) => args.includes(flag);

const subcmd = args[0] || "collisions";

switch (subcmd) {
  case "collisions":
    cmdCollisions({ method: get("method") || "regex" });
    break;
  case "mixer-map":
    cmdMixerMap();
    break;
  case "stats":
    cmdStats();
    break;
  case "list":
    cmdList({ file: get("file"), minCities: get("min"), maxCities: get("max") });
    break;
  case "help":
  default:
    console.log(`Usage: node tools/analysis/audit-namebases.js <subcmd> [options]

Subcommands:
  collisions        Detect index and name collisions across namebase files
    --method=regex|sandbox   Parsing method (default: regex)

  mixer-map         Audit language-mixer-map.json indices against namebases

  stats             Show entry counts per namebase file

  list              List entries in a file, sorted by city count
    --file=<name>            Namebase file (required)
    --min=<n>                Filter: city count ≤ n
    --max=<n>                Filter: city count ≥ n

Examples:
  node tools/analysis/audit-namebases.js collisions
  node tools/analysis/audit-namebases.js mixer-map
  node tools/analysis/audit-namebases.js stats
  node tools/analysis/audit-namebases.js list --file=namebases-europe.js --min=10`);
}
