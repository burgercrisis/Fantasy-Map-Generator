"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..", "..");

function readJson(rel) {
  const full = path.join(root, rel);
  const raw = fs.readFileSync(full, "utf8").replace(/^\uFEFF/, "");
  return JSON.parse(raw);
}

function loadDefaultNameBases() {
  const sandbox = {window: {}, module: {exports: {}}, exports: {}, console, nameBases: []};
  sandbox.exports = sandbox.module.exports;
  sandbox.globalThis = sandbox;
  const context = vm.createContext(sandbox);

  const files = [
    path.join(root, "modules", "namebases-real.js"),
    path.join(root, "modules", "namebases-fantasy.js"),
    path.join(root, "modules", "namebases-creole.js"),
    path.join(root, "modules", "namebases-all.js")
  ];

  for (const full of files) {
    const src = fs.readFileSync(full, "utf8");
    vm.runInContext(src, context, {filename: full});
  }

  const bases = sandbox.window?.defaultNameBases;
  if (!Array.isArray(bases)) {
    throw new TypeError("defaultNameBases not populated; did namebases-all.js run?");
  }

  return bases;
}

function splitSeeds(blob) {
  if (!blob || typeof blob !== "string") return [];
  return blob
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
}

function isSyntheticFillerToken(iso, seed) {
  if (!iso || !seed) return false;
  const s = String(seed).trim();
  if (!s) return false;
  const re = new RegExp(`^${iso}_(?:unq|fill)\\d+$`, "i");
  return re.test(s);
}

function isFamilyEntry(entry) {
  return !!(entry && Array.isArray(entry.tags) && entry.tags.includes("family"));
}

function parseArgs(argv) {
  const args = argv.slice(2);
  const out = {
    below: null,
    limit: 200,
    onlyIsos: null,
    allowFillers: false,
    json: false,
    help: args.includes("--help") || args.includes("-h")
  };

  for (const a of args) {
    if (a === "--json") out.json = true;
    if (a === "--allow-fillers" || a === "--fast-pass") out.allowFillers = true;
    if (a.startsWith("--below=")) out.below = Number(a.split("=")[1]);
    if (a.startsWith("--limit=")) out.limit = Number(a.split("=")[1]);
    if (a.startsWith("--only-isos=")) {
      out.onlyIsos = a
        .split("=")[1]
        .split(",")
        .map(s => s.trim())
        .filter(Boolean);
    }
  }

  if (!Number.isFinite(out.limit) || out.limit <= 0) out.limit = 200;
  if (out.below != null && !Number.isFinite(out.below)) out.below = null;

  return out;
}

function gradeFromCount(count) {
  if (count >= 50) return "A";
  if (count >= 40) return "GAP";
  if (count >= 30) return "B";
  if (count >= 20) return "C";
  if (count >= 10) return "D";
  return "F";
}

function main() {
  const {below, limit, onlyIsos, allowFillers, json, help} = parseArgs(process.argv);
  if (help) {
    console.log("Usage:");
    console.log(
      "  node tools/mixer-diagnostics/report-language-mixer-premix-grades.js [--below=50] [--limit=200] [--only-isos=iso1,iso2] [--allow-fillers|--fast-pass] [--json]"
    );
    console.log("");
    console.log("Grade bands:");
    console.log("  A: >=50");
    console.log("  GAP: 40-49 (explicit bucket for the original threshold wording)");
    console.log("  B: 30-39");
    console.log("  C: 20-29");
    console.log("  D: 10-19");
    console.log("  F: 0-9");
    console.log("");
    console.log("Synthetic filler tokens:");
    console.log("  By default, synthetic filler tokens are excluded from premix counts.");
    console.log("  Use --allow-fillers (or --fast-pass) to include them.");
    console.log("  Detected fillers match: <iso>_(unq|fill)<digits> (e.g., eng_unq1)");
    return;
  }

  const catalog = readJson("config/language-mixes.json");
  const mapRows = readJson("config/language-mixer-map.json");
  const nameBases = loadDefaultNameBases();

  const mapByIso = new Map();
  for (const r of mapRows) {
    if (!r?.iso || !Array.isArray(r.bases)) continue;
    mapByIso.set(String(r.iso), r.bases);
  }

  const target = [];
  for (const entry of catalog) {
    if (!entry?.iso) continue;
    if (isFamilyEntry(entry)) continue;
    const iso = String(entry.iso);
    if (onlyIsos && !onlyIsos.includes(iso)) continue;
    target.push(iso);
  }

  const rows = [];
  for (const iso of target) {
    const bases = mapByIso.get(iso);
    const premix = new Set();
    const fillers = new Set();
    if (Array.isArray(bases)) {
      for (const b of bases) {
        if (typeof b !== "number") continue;
        const base = nameBases[b];
        const seeds = base ? splitSeeds(base.b) : [];
        for (const s of seeds) {
          if (isSyntheticFillerToken(iso, s)) fillers.add(s);
          else premix.add(s);
        }
      }
    }

    const count = premix.size + (allowFillers ? fillers.size : 0);
    const grade = gradeFromCount(count);

    if (below != null && count >= below) continue;

    rows.push({iso, count, grade, fillerCount: fillers.size, fillerSamples: Array.from(fillers).slice(0, 5)});
  }

  rows.sort((a, b) => a.count - b.count || a.iso.localeCompare(b.iso));

  const limited = rows.slice(0, limit);

  const fillerRows = rows
    .filter(r => r.fillerCount > 0)
    .sort((a, b) => b.fillerCount - a.fillerCount || a.iso.localeCompare(b.iso));

  const totalFillerTokens = fillerRows.reduce((acc, r) => acc + r.fillerCount, 0);

  if (json) {
    process.stdout.write(
      JSON.stringify(
        {
          targetIsos: target.length,
          allowFillers,
          fillerUsage: {
            isosWithFillers: fillerRows.length,
            totalFillerTokens
          },
          rows: limited
        },
        null,
        2
      ) + "\n"
    );
    return;
  }

  console.log("Target ISOs:", target.length);
  if (below != null) console.log("Filter: count <", below);
  if (onlyIsos) console.log("Only ISOs:", onlyIsos.join(","));
  console.log("Allow fillers:", allowFillers);
  console.log("");

  console.log("iso | premixCount | grade");
  console.log("--- | ---------- | -----");
  for (const r of limited) {
    console.log(`${r.iso} | ${r.count} | ${r.grade}`);
  }

  if (fillerRows.length) {
    console.log("");
    console.log("Synthetic filler usage (detected in premix inputs):");
    console.log("  ISOs with fillers:", fillerRows.length);
    console.log("  Total filler tokens:", totalFillerTokens);
    if (!allowFillers) {
      console.log("  Note: filler tokens are excluded from premixCount by default.");
      console.log("        Re-run with --allow-fillers (or --fast-pass) to include them.");
    }
    console.log("");
    console.log("iso | fillerCount | sampleFillers");
    console.log("--- | ---------- | -------------");
    for (const r of fillerRows) {
      const sample = r.fillerSamples.join(",");
      console.log(`${r.iso} | ${r.fillerCount} | ${sample}`);
    }
  }
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error(err?.stack ? err.stack : err);
    process.exitCode = 1;
  }
}
