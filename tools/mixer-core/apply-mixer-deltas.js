"use strict";

const fs = require("node:fs");
const path = require("node:path");
const {execFileSync} = require("node:child_process");

const root = path.resolve(__dirname, "..", "..");
const deltasDirRel = path.join("tools", "mixer-deltas");
const deltasDirAbs = path.join(root, deltasDirRel);

function readJson(relPath) {
  const full = path.join(root, relPath);
  const raw = fs.readFileSync(full, "utf8");
  const s = raw?.codePointAt(0) === 0xfeff ? raw.slice(1) : raw;
  return JSON.parse(s);
}

function readOptionalJson(relPath) {
  try {
    return readJson(relPath);
  } catch (e) {
    return null;
  }
}

function writeJson(relPath, data) {
  const full = path.join(root, relPath);
  fs.mkdirSync(path.dirname(full), {recursive: true});
  fs.writeFileSync(full, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log("Wrote", relPath.replaceAll("\\", "/"));
}

function loadNamebaseIndices() {
  const files = [
    path.join(root, "modules", "namebases-real.js"),
    path.join(root, "modules", "namebases-fantasy.js"),
    path.join(root, "modules", "namebases-creole.js")
  ];

  const indices = new Set();
  const re = /\{name:\s*"[^"]+",\s*i:\s*(\d+)/g;

  for (const file of files) {
    let src;
    try {
      src = fs.readFileSync(file, "utf8");
    } catch (e) {
      continue;
    }

    let m;
    while ((m = re.exec(src))) {
      const index = Number(m[1]);
      if (!Number.isNaN(index)) indices.add(index);
    }
  }

  return indices;
}

function listDeltaFiles() {
  if (!fs.existsSync(deltasDirAbs)) return [];
  const entries = fs.readdirSync(deltasDirAbs, {withFileTypes: true});
  const files = [];

  for (const e of entries) {
    if (!e.isFile()) continue;
    if (!e.name.toLowerCase().endsWith(".json")) continue;
    if (e.name.startsWith("_")) continue;
    files.push(e.name);
  }

  files.sort((a, b) => a.localeCompare(b));
  return files;
}

function normalizeIso(iso) {
  return String(iso || "").trim();
}

function normalizeBases(bases) {
  const out = [];
  const seen = new Set();
  for (const b of Array.isArray(bases) ? bases : []) {
    const n = Number(b);
    if (!Number.isFinite(n)) continue;
    if (seen.has(n)) continue;
    seen.add(n);
    out.push(n);
  }
  out.sort((a, b) => a - b);
  return out;
}

function mergePins(target, incoming, sourceLabel) {
  if (!incoming || typeof incoming !== "object") return;

  for (const [rawIso, rawBase] of Object.entries(incoming)) {
    const iso = normalizeIso(rawIso);
    const base = Number(rawBase);

    if (!iso) continue;
    if (!Number.isFinite(base)) {
      throw new Error(`[apply-mixer-deltas] Invalid base for ${iso} from ${sourceLabel}`);
    }

    if (Object.hasOwn(target, iso) && Number(target[iso]) !== base) {
      throw new Error(`[apply-mixer-deltas] Conflicting dedicated pin for ${iso}: ${target[iso]} vs ${base} (from ${sourceLabel})`);
    }

    target[iso] = base;
  }
}

function mergeAppendBases(target, incoming, sourceLabel) {
  if (!incoming || typeof incoming !== "object") return;

  for (const [rawIso, rawBases] of Object.entries(incoming)) {
    const iso = normalizeIso(rawIso);
    if (!iso) continue;

    const bases = normalizeBases(rawBases);
    if (!bases.length) continue;

    const existing = target[iso] || [];
    target[iso] = normalizeBases(existing.concat(bases));
  }
}

function applyToMap(map, pins, appendBases) {
  const mapByIso = new Map();
  for (const entry of Array.isArray(map) ? map : []) {
    if (!entry || entry.iso == null) continue;
    mapByIso.set(String(entry.iso), entry);
  }

  for (const [iso, base] of Object.entries(pins)) {
    const entry = mapByIso.get(iso);
    if (entry) {
      const bases = normalizeBases(entry.bases);
      if (!bases.includes(base)) bases.push(base);
      entry.bases = normalizeBases(bases);
      continue;
    }

    const newEntry = {iso, bases: [base]};
    map.push(newEntry);
    mapByIso.set(iso, newEntry);
  }

  for (const [iso, basesToAdd] of Object.entries(appendBases)) {
    const entry = mapByIso.get(iso);
    if (entry) {
      entry.bases = normalizeBases((entry.bases || []).concat(basesToAdd));
      continue;
    }

    const newEntry = {iso, bases: normalizeBases(basesToAdd)};
    map.push(newEntry);
    mapByIso.set(iso, newEntry);
  }
}

function collectReferencedBases(pins, appendBases) {
  const out = new Set();
  for (const b of Object.values(pins || {})) {
    const n = Number(b);
    if (Number.isFinite(n)) out.add(n);
  }
  for (const bases of Object.values(appendBases || {})) {
    for (const b of Array.isArray(bases) ? bases : []) {
      const n = Number(b);
      if (Number.isFinite(n)) out.add(n);
    }
  }
  return out;
}

function main() {
  fs.mkdirSync(deltasDirAbs, {recursive: true});

  const compiledPinsRel = path.join(deltasDirRel, "_compiled-dedicated-pins.json");
  const compiledPinsBaseline = readOptionalJson(compiledPinsRel);

  const deltaFiles = listDeltaFiles();

  const pins = {};
  const appendBases = {};

  if (compiledPinsBaseline && compiledPinsBaseline.pins) {
    mergePins(pins, compiledPinsBaseline.pins, compiledPinsRel);
  }

  for (const fileName of deltaFiles) {
    const rel = path.join(deltasDirRel, fileName);
    const json = readJson(rel);

    mergePins(pins, json.dedicatedPins || json.pins || null, rel);
    mergeAppendBases(appendBases, json.appendBases || null, rel);
  }

  for (const [iso, base] of Object.entries(pins)) {
    appendBases[iso] = normalizeBases((appendBases[iso] || []).concat([base]));
  }

  const namebaseIndices = loadNamebaseIndices();
  const referencedBases = collectReferencedBases(pins, appendBases);
  const missingBases = Array.from(referencedBases).filter(b => !namebaseIndices.has(b)).sort((a, b) => a - b);

  if (missingBases.length) {
    console.error("[apply-mixer-deltas] Missing base definitions for indices:");
    for (const b of missingBases) console.error(" -", b);
    process.exitCode = 1;
    return;
  }

  const mapRel = path.join("config", "language-mixer-map.json");
  const map = readJson(mapRel);
  applyToMap(map, pins, appendBases);
  writeJson(mapRel, map);

  const sortedPins = Object.fromEntries(
    Object.entries(pins)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([iso, base]) => [iso, base])
  );
  writeJson(compiledPinsRel, {version: 1, pins: sortedPins});

  execFileSync("node", [path.join(__dirname, "generate-language-mixer.js")], {encoding: "utf8"});
}

if (require.main === module) {
  main();
}
