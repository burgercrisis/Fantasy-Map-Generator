"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "..");

function readJson(relPath) {
  const full = path.isAbsolute(relPath) ? relPath : path.join(root, relPath);
  const raw = fs.readFileSync(full, "utf8").replace(/^\uFEFF/, "");
  return JSON.parse(raw);
}

function parseArgs(argv) {
  const args = argv.slice(2);

  function getValue(prefix) {
    const hit = args.find(a => a.startsWith(prefix + "="));
    if (!hit) return null;
    return hit.slice(prefix.length + 1);
  }

  const isosRaw = getValue("--isos");
  const listPath = getValue("--list");
  const includeFamilies = args.includes("--include-families");

  const isos = (isosRaw || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);

  return { isos, listPath, includeFamilies };
}

function normalizeBases(bases) {
  const arr = Array.isArray(bases) ? bases : [];
  const unique = Array.from(new Set(arr.map(n => Number(n)))).filter(n => Number.isFinite(n));
  unique.sort((a, b) => a - b);
  return unique;
}

function buildIndexes(mixes, map, includeFamilies) {
  const mixByIso = new Map();
  for (const m of mixes) {
    if (!m || !m.iso) continue;
    mixByIso.set(String(m.iso), m);
  }

  const isoToBasesKey = new Map();
  const basesKeyToMembers = new Map();

  for (const entry of map) {
    if (!entry || !entry.iso) continue;
    const iso = String(entry.iso);
    const lang = mixByIso.get(iso);
    if (!lang) continue;

    const tags = Array.isArray(lang.tags) ? lang.tags : [];
    if (!includeFamilies && tags.includes("family")) continue;

    const bases = normalizeBases(entry.bases);
    if (!bases.length) continue;

    const key = bases.join(",");
    isoToBasesKey.set(iso, key);

    const members = basesKeyToMembers.get(key) || [];
    members.push({ iso, name: lang.name || "" });
    basesKeyToMembers.set(key, members);
  }

  for (const members of basesKeyToMembers.values()) {
    members.sort((a, b) => a.iso.localeCompare(b.iso));
  }

  return { mixByIso, isoToBasesKey, basesKeyToMembers };
}

function loadListIsos(listPath) {
  if (!listPath) return new Set();
  const data = readJson(listPath);
  const items = Array.isArray(data) ? data : (data && Array.isArray(data.items) ? data.items : []);
  const out = new Set();
  for (const item of items) {
    if (!item || item.skip) continue;
    if (item.iso) out.add(String(item.iso));
  }
  return out;
}

function main() {
  const opts = parseArgs(process.argv);

  if (!opts.isos.length) {
    console.error("Usage: node tools/mixer-diagnostics/report-baseset-members-for-isos.js --isos=iso1,iso2 [--list=path/to/list.json] [--include-families]");
    process.exitCode = 1;
    return;
  }

  const mixes = readJson("config/language-mixes.json");
  const map = readJson("config/language-mixer-map.json");

  const { mixByIso, isoToBasesKey, basesKeyToMembers } = buildIndexes(mixes, map, opts.includeFamilies);
  const listIsos = loadListIsos(opts.listPath);

  for (const iso of opts.isos) {
    const lang = mixByIso.get(iso);
    const key = isoToBasesKey.get(iso) || null;

    if (!lang) {
      console.log("===", iso, "===");
      console.log("Not in catalog");
      console.log("");
      continue;
    }

    if (!key) {
      console.log("===", iso, "===");
      console.log(lang.name || "(no name)");
      console.log("No bases[] mapping found (or empty/invalid)");
      console.log("");
      continue;
    }

    const members = basesKeyToMembers.get(key) || [];

    console.log("===", iso, "===");
    console.log(lang.name || "(no name)");
    console.log("bases=[" + key + "]");
    console.log("clusterSize=" + members.length);
    for (const m of members) {
      const inList = listIsos.has(m.iso) ? "in-list" : "";
      console.log("  " + m.iso + " | " + (m.name || "(no name)") + (inList ? " | " + inList : ""));
    }
    console.log("");
  }
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error(err && err.stack ? err.stack : String(err));
    process.exitCode = 1;
  }
}
