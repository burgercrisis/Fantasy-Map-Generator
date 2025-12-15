"use strict";

const fs = require("node:fs");
const path = require("node:path");
const {execFileSync} = require("node:child_process");

const root = path.resolve(__dirname, "..", "..");
const deltasDirRel = path.join("tools", "mixer-deltas");
const deltasDirAbs = path.join(root, deltasDirRel);
const applyLockRelPath = path.join("tools", "mixer-core", "_apply-mixer-deltas.lock");
const applyLockAbsPath = path.join(root, applyLockRelPath);

function sleepSync(ms) {
  const n = Number(ms);
  if (!Number.isFinite(n) || n <= 0) return;
  if (typeof SharedArrayBuffer === "function" && typeof Atomics === "object" && typeof Atomics.wait === "function") {
    const sab = new SharedArrayBuffer(4);
    const arr = new Int32Array(sab);
    Atomics.wait(arr, 0, 0, n);
    return;
  }
  const end = Date.now() + n;
  while (Date.now() < end) {}
}

function getArgValue(argv, name) {
  const prefix = name + "=";
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === name) {
      const next = argv[i + 1];
      if (next && !next.startsWith("--")) return next;
      return "";
    }
    if (a.startsWith(prefix)) return a.slice(prefix.length);
  }
  return null;
}

function getNumericArg(argv, name, defaultValue) {
  const v = getArgValue(argv, name);
  if (v == null || v === "") return defaultValue;
  const n = Number(v);
  return Number.isFinite(n) ? n : defaultValue;
}

function acquireLock(absPath, opts, lockInfo) {
  fs.mkdirSync(path.dirname(absPath), {recursive: true});
  const waitMs = opts && Number.isFinite(Number(opts.waitMs)) ? Number(opts.waitMs) : 30000;
  const retryMs = opts && Number.isFinite(Number(opts.retryMs)) ? Number(opts.retryMs) : 200;
  const staleMs = opts && Number.isFinite(Number(opts.staleMs)) ? Number(opts.staleMs) : 120000;
  const forceLock = !!(opts && opts.forceLock);

  const startedAt = Date.now();
  const payload = Object.assign({pid: process.pid, createdAt: new Date().toISOString()}, lockInfo || {});
  const lockText = JSON.stringify(payload) + "\n";

  while (true) {
    try {
      const fd = fs.openSync(absPath, "wx");
      fs.writeFileSync(fd, lockText, "utf8");
      fs.closeSync(fd);
      return;
    } catch (err) {
      if (!err || err.code !== "EEXIST") throw err;
    }

    let ageMs = 0;
    try {
      ageMs = Date.now() - fs.statSync(absPath).mtimeMs;
    } catch (e) {
      ageMs = 0;
    }

    if (Number.isFinite(staleMs) && staleMs > 0 && ageMs > staleMs) {
      if (forceLock) {
        try {
          fs.unlinkSync(absPath);
        } catch (e) {}
        continue;
      }
      throw new Error(
        `apply-mixer-deltas lock appears stale: ${applyLockRelPath} (ageMs=${Math.round(ageMs)}). Delete it or pass --forceLock`
      );
    }

    if (Date.now() - startedAt > waitMs) {
      throw new Error(`Timed out waiting for apply-mixer-deltas lock: ${applyLockRelPath}`);
    }

    sleepSync(retryMs);
  }
}

function releaseLock(absPath) {
  try {
    fs.unlinkSync(absPath);
  } catch (e) {}
}

function withLock(absPath, opts, lockInfo, fn) {
  acquireLock(absPath, opts, lockInfo);
  try {
    return fn();
  } finally {
    releaseLock(absPath);
  }
}

function readJson(relPath) {
  const full = path.join(root, relPath);
  const raw = fs.readFileSync(full, "utf8");
  const s = raw?.codePointAt(0) === 0xfeff ? raw.slice(1) : raw;
  try {
    return JSON.parse(s);
  } catch (e) {
    const msg = e && e.message ? e.message : String(e);
    throw new Error(`[apply-mixer-deltas] Invalid JSON: ${relPath}. ${msg}`);
  }
}

function readOptionalJson(relPath) {
  try {
    return readJson(relPath);
  } catch (e) {
    if (e && (e.code === "ENOENT" || e.code === "ENOTDIR")) return null;
    throw e;
  }
}

function mergeSetBases(target, incoming, sourceLabel) {
  if (!incoming || typeof incoming !== "object") return;

  for (const [rawIso, rawBases] of Object.entries(incoming)) {
    const iso = normalizeIso(rawIso);
    if (!iso) continue;

    const bases = normalizeBases(rawBases);
    if (!bases.length) {
      throw new Error(`[apply-mixer-deltas] Empty/invalid setBases for ${iso} from ${sourceLabel}`);
    }

    if (Object.hasOwn(target, iso) && JSON.stringify(target[iso]) !== JSON.stringify(bases)) {
      throw new Error(`[apply-mixer-deltas] Conflicting setBases for ${iso} (from ${sourceLabel})`);
    }

    target[iso] = bases;
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
      if (e && e.code === "ENOENT") continue;
      throw e;
    }

    re.lastIndex = 0;
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
      throw new TypeError(`[apply-mixer-deltas] Invalid base for ${iso} from ${sourceLabel}`);
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

function applyToMap(map, setBases, pins, appendBases) {
  const mapByIso = new Map();
  for (const entry of Array.isArray(map) ? map : []) {
    if (entry?.iso == null) continue;
    mapByIso.set(String(entry.iso), entry);
  }

  let didMutate = false;

  for (const [iso, basesToSet] of Object.entries(setBases || {})) {
    const entry = mapByIso.get(iso);
    if (entry) {
      const prev = normalizeBases(entry.bases);
      const next = normalizeBases(basesToSet);
      if (!arraysEqual(prev, next)) {
        entry.bases = next;
        didMutate = true;
      }
      continue;
    }

    const newEntry = {iso, bases: normalizeBases(basesToSet)};
    map.push(newEntry);
    mapByIso.set(iso, newEntry);
    didMutate = true;
  }

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

function collectReferencedBasesWithSetBases(setBases, pins, appendBases) {
  const out = collectReferencedBases(pins, appendBases);
  for (const bases of Object.values(setBases || {})) {
    for (const b of Array.isArray(bases) ? bases : []) {
      const n = Number(b);
      if (Number.isFinite(n)) out.add(n);
    }
  }
  return out;
}

function validateIsosExistInCatalog({catalogIsos, setBases, pins, appendBases}) {
  const missing = new Set();

  for (const iso of Object.keys(setBases || {})) {
    if (!catalogIsos.has(iso)) missing.add(iso);
  }
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
    if (!entry?.iso) continue;
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
      otherOwners.sort((a, b) => a.localeCompare(b));
      collisions.push({iso, base: Number(base), owners: otherOwners});
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
  const argv = process.argv.slice(2);
  const args = new Set(argv);
  const checkOnly = args.has("--check");
  const noLock = args.has("--no-lock");
  const lockOpts = {
    waitMs: getNumericArg(argv, "--lockWaitMs", 30000),
    retryMs: getNumericArg(argv, "--lockRetryMs", 200),
    staleMs: getNumericArg(argv, "--lockStaleMs", 120000),
    forceLock: args.has("--forceLock"),
  };

  const body = () => {
    fs.mkdirSync(deltasDirAbs, {recursive: true});

    const compiledPinsRel = path.join(deltasDirRel, "_compiled-dedicated-pins.json");
    const compiledPinsBaseline = readOptionalJson(compiledPinsRel);

    const deltaFiles = listDeltaFiles();

    const setBases = {};
    const pins = {};
    const appendBases = {};

    if (compiledPinsBaseline?.pins) {
      mergePins(pins, compiledPinsBaseline.pins, compiledPinsRel);
    }

    for (const fileName of deltaFiles) {
      const rel = path.join(deltasDirRel, fileName);
      const json = readJson(rel);

      mergeSetBases(setBases, json.setBases || json.replaceBases || null, rel);
      mergePins(pins, json.dedicatedPins || json.pins || null, rel);
      mergeAppendBases(appendBases, json.appendBases || null, rel);
    }

    for (const [iso, base] of Object.entries(pins)) {
      appendBases[iso] = normalizeBases((appendBases[iso] || []).concat([base]));
    }

    const catalog = readJson(path.join("config", "language-mixes.json"));
    const catalogIsos = new Set(
      (Array.isArray(catalog) ? catalog : []).map(r => String(r?.iso || "")).filter(Boolean)
    );
    if (!validateIsosExistInCatalog({catalogIsos, setBases, pins, appendBases})) return;

    const namebaseIndices = loadNamebaseIndices();
    const referencedBases = collectReferencedBasesWithSetBases(setBases, pins, appendBases);
    const missingBases = Array.from(referencedBases)
      .filter(b => !namebaseIndices.has(b))
      .sort((a, b) => a - b);

    if (missingBases.length) {
      console.error("[apply-mixer-deltas] Missing base definitions for indices:");
      for (const b of missingBases) console.error(" -", b);
      process.exitCode = 1;
      return;
    }

    const mapRel = path.join("config", "language-mixer-map.json");
    const map = readJson(mapRel);

    const sortedSetEntries = Object.entries(setBases).sort((a, b) => a[0].localeCompare(b[0]));
    const sortedPinsEntries = Object.entries(pins).sort((a, b) => a[0].localeCompare(b[0]));
    const sortedAppendEntries = Object.entries(appendBases).sort((a, b) => a[0].localeCompare(b[0]));
    const setSorted = Object.fromEntries(sortedSetEntries);
    const pinsSorted = Object.fromEntries(sortedPinsEntries);
    const appendSorted = Object.fromEntries(sortedAppendEntries);

    const didMutateMap = applyToMap(map, setSorted, pinsSorted, appendSorted);
    if (!validatePinnedBasesAreUnique({map, pins: pinsSorted})) return;
    if (!checkOnly && didMutateMap) {
      writeJson(mapRel, map);
    }

    const sortedPins = Object.fromEntries(sortedPinsEntries);
    const nextCompiled = {version: 1, pins: sortedPins};
    const prevCompiledPins = compiledPinsBaseline?.pins ?? null;
    const didMutatePins = prevCompiledPins == null || JSON.stringify(prevCompiledPins) !== JSON.stringify(sortedPins);
    if (checkOnly) {
      if (didMutateMap || didMutatePins) {
        console.error("[apply-mixer-deltas] Artifacts are out of date vs deltas:");
        if (didMutatePins) console.error(" - tools/mixer-deltas/_compiled-dedicated-pins.json needs update");
        if (didMutateMap)
          console.error(" - config/language-mixer-map.json (and config/language-mixer-map.js) need update");
        process.exitCode = 1;
      }
      return;
    }

    if (didMutatePins) {
      writeJson(compiledPinsRel, nextCompiled);
    }

    execFileSync("node", [path.join(__dirname, "generate-language-mixer.js")], {encoding: "utf8"});
  };

  if (noLock) return body();
  return withLock(applyLockAbsPath, lockOpts, {mode: checkOnly ? "check" : "apply"}, body);
}

if (require.main === module) {
  main();
}
