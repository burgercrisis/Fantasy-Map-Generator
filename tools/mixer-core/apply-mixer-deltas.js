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

function arraysEqual(a, b) {
  if (a === b) return true;
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
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

  let didMutate = false;

  for (const [iso, base] of Object.entries(pins)) {
    const entry = mapByIso.get(iso);
    if (entry) {
      const prev = normalizeBases(entry.bases);
      const next = prev.includes(base) ? prev : normalizeBases(prev.concat([base]));
      if (!arraysEqual(prev, next)) {
        entry.bases = next;
        didMutate = true;
      }
      continue;
    }

    const newEntry = {iso, bases: [base]};
    map.push(newEntry);
    mapByIso.set(iso, newEntry);
    didMutate = true;
  }

  for (const [iso, basesToAdd] of Object.entries(appendBases)) {
    const entry = mapByIso.get(iso);
    if (entry) {
      const prev = normalizeBases(entry.bases);
      const next = normalizeBases(prev.concat(basesToAdd));
      if (!arraysEqual(prev, next)) {
        entry.bases = next;
        didMutate = true;
      }
      continue;
    }

    const newEntry = {iso, bases: normalizeBases(basesToAdd)};
    map.push(newEntry);
    mapByIso.set(iso, newEntry);
    didMutate = true;
  }

  return didMutate;
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

function validateIsosExistInCatalog({catalogIsos, pins, appendBases}) {
  const missing = new Set();

  for (const iso of Object.keys(pins || {})) {
    if (!catalogIsos.has(iso)) missing.add(iso);
  }
  for (const iso of Object.keys(appendBases || {})) {
    if (!catalogIsos.has(iso)) missing.add(iso);
  }

  if (missing.size) {
    const list = Array.from(missing).sort((a, b) => a.localeCompare(b));
    console.error("[apply-mixer-deltas] Delta references ISO(s) missing from config/language-mixes.json:");
    for (const iso of list) console.error(" -", iso);
    process.exitCode = 1;
    return false;
  }

  return true;
}

function validatePinnedBasesAreUnique({map, pins}) {
  const baseOwners = new Map();
  for (const entry of Array.isArray(map) ? map : []) {
    if (!entry || !entry.iso) continue;
    const iso = String(entry.iso);
    const bases = Array.isArray(entry.bases) ? entry.bases : [];
    for (const b of bases) {
      const n = Number(b);
      if (!Number.isFinite(n)) continue;
      let owners = baseOwners.get(n);
      if (!owners) {
        owners = new Set();
        baseOwners.set(n, owners);
      }
      owners.add(iso);
    }
  }

  const collisions = [];
  for (const [iso, base] of Object.entries(pins || {})) {
    const owners = baseOwners.get(Number(base));
    if (!owners) continue;
    const otherOwners = Array.from(owners).filter(o => o !== iso);
    if (otherOwners.length) {
      collisions.push({iso, base: Number(base), owners: otherOwners.sort((a, b) => a.localeCompare(b))});
    }
  }

  if (collisions.length) {
    collisions.sort((a, b) => a.base - b.base || a.iso.localeCompare(b.iso));
    console.error("[apply-mixer-deltas] Dedicated base pins are not globally unique:");
    for (const c of collisions) {
      console.error(` - base ${c.base} pinned to ${c.iso}, but also used by: ${c.owners.join(", ")}`);
    }
    process.exitCode = 1;
    return false;
  }

  return true;
}

function main() {
  const args = new Set(process.argv.slice(2));
  const checkOnly = args.has("--check");

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

  const catalog = readJson(path.join("config", "language-mixes.json"));
  const catalogIsos = new Set((Array.isArray(catalog) ? catalog : []).map(r => String(r?.iso || "")).filter(Boolean));
  if (!validateIsosExistInCatalog({catalogIsos, pins, appendBases})) return;

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

  const sortedPinsEntries = Object.entries(pins).sort((a, b) => a[0].localeCompare(b[0]));
  const sortedAppendEntries = Object.entries(appendBases).sort((a, b) => a[0].localeCompare(b[0]));
  const pinsSorted = Object.fromEntries(sortedPinsEntries);
  const appendSorted = Object.fromEntries(sortedAppendEntries);

  const didMutateMap = applyToMap(map, pinsSorted, appendSorted);
  if (!validatePinnedBasesAreUnique({map, pins: pinsSorted})) return;
  if (!checkOnly && didMutateMap) {
    writeJson(mapRel, map);
  }

  const sortedPins = Object.fromEntries(sortedPinsEntries);
  const nextCompiled = {version: 1, pins: sortedPins};
  const prevCompiledPins = compiledPinsBaseline && compiledPinsBaseline.pins ? compiledPinsBaseline.pins : null;
  const didMutatePins = prevCompiledPins == null || JSON.stringify(prevCompiledPins) !== JSON.stringify(sortedPins);
  if (checkOnly) {
    if (didMutateMap || didMutatePins) {
      console.error("[apply-mixer-deltas] Artifacts are out of date vs deltas:");
      if (didMutatePins) console.error(" - tools/mixer-deltas/_compiled-dedicated-pins.json needs update");
      if (didMutateMap) console.error(" - config/language-mixer-map.json (and config/language-mixer-map.js) need update");
      process.exitCode = 1;
    }
    return;
  }

  if (didMutatePins) {
    writeJson(compiledPinsRel, nextCompiled);
  }

  if (didMutateMap) {
    execFileSync("node", [path.join(__dirname, "generate-language-mixer.js")], {encoding: "utf8"});
  }
}

if (require.main === module) {
  main();
}
