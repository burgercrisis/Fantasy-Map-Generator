"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "..");

function readJson(relPath) {
  const full = path.join(root, relPath);
  const raw = fs.readFileSync(full, "utf8").replace(/^\uFEFF/, "");
  return JSON.parse(raw);
}

function writeJson(relPath, data) {
  const full = path.join(root, relPath);
  fs.writeFileSync(full, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function normalizeBases(bases) {
  if (!Array.isArray(bases)) return [];
  const nums = bases.map(n => Number(n)).filter(n => Number.isFinite(n));
  nums.sort((a, b) => a - b);
  return nums;
}

function sigOf(bases) {
  return JSON.stringify(bases);
}

function main() {
  const relMap = "config/language-mixer-map.json";
  const map = readJson(relMap);

  if (!Array.isArray(map)) {
    throw new Error("Expected config/language-mixer-map.json to be an array");
  }

  const byIso = new Map();
  const sigToIsos = new Map();

  for (const entry of map) {
    if (!entry || !entry.iso) continue;
    const iso = String(entry.iso);
    const bases = normalizeBases(entry.bases);
    byIso.set(iso, bases);
    const sig = sigOf(bases);
    if (!sigToIsos.has(sig)) sigToIsos.set(sig, []);
    sigToIsos.get(sig).push(iso);
  }

  const blocked = [];

  for (const [iso, bases] of byIso.entries()) {
    if (!bases.includes(195)) continue;

    const reduced = bases.filter(b => b !== 195);
    const reducedSig = sigOf(reduced);
    const colliders = (sigToIsos.get(reducedSig) || []).filter(other => other !== iso);

    if (colliders.length) {
      blocked.push({
        iso,
        bases,
        reducedBases: reduced,
        collidesWith: colliders
      });
    }
  }

  blocked.sort((a, b) => a.iso.localeCompare(b.iso));

  const outRel = "tools/mixer-diagnostics/_blocked-195.current.json";
  writeJson(outRel, {
    generatedAt: new Date().toISOString(),
    blockedCount: blocked.length,
    blocked
  });

  console.log("Blocked count:", blocked.length);
  console.log("Wrote", outRel);
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error("find-blocked-195 failed:", err && err.message ? err.message : err);
    process.exitCode = 1;
  }
}
