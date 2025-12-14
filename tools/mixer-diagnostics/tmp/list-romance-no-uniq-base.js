"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..", "..", "..");

function readJson(rel) {
  const full = path.join(root, rel);
  const raw = fs.readFileSync(full, "utf8");
  return JSON.parse(raw);
}

function loadDefaultNameBases() {
  const sandbox = {window: {}};
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

  const bases = sandbox.window && sandbox.window.defaultNameBases;
  if (!Array.isArray(bases)) {
    throw new Error("defaultNameBases not populated; did namebases-all.js run?");
  }

  return bases;
}

function isFamilyEntry(entry) {
  return !!(entry && Array.isArray(entry.tags) && entry.tags.includes("family"));
}

function loadClaimedIsos() {
  const claims = readJson("tools/mixer-diagnostics/_no_uniq_base_claims.json");
  const out = new Set();
  for (const claim of claims && claims.claims ? claims.claims : []) {
    if (!claim || !Array.isArray(claim.isos)) continue;
    for (const iso of claim.isos) {
      if (typeof iso === "string" && iso) out.add(iso);
    }
  }
  return out;
}

function main() {
  const catalog = readJson("config/language-mixes.json");
  const mapRows = readJson("config/language-mixer-map.json");
  const nameBases = loadDefaultNameBases();
  const claimedIsos = loadClaimedIsos();

  const catalogByIso = new Map();
  for (const c of catalog) {
    if (!c || !c.iso) continue;
    catalogByIso.set(c.iso, c);
  }

  const mapByIso = new Map();
  for (const r of mapRows) {
    if (!r || !r.iso || !Array.isArray(r.bases)) continue;
    mapByIso.set(r.iso, r.bases);
  }

  // Uniqueness comparisons are computed over all mapping entries, excluding family-macro catalog entries.
  const comparisonIsos = [];
  for (const [iso] of mapByIso.entries()) {
    const entry = catalogByIso.get(iso);
    if (entry && isFamilyEntry(entry)) continue;
    comparisonIsos.push(iso);
  }

  const baseUseCount = new Map();
  for (const iso of comparisonIsos) {
    const bases = mapByIso.get(iso);
    if (!bases) continue;
    for (const b of bases) {
      if (typeof b !== "number") continue;
      baseUseCount.set(b, (baseUseCount.get(b) || 0) + 1);
    }
  }

  const noUniqBase = [];

  for (const [iso, entry] of catalogByIso.entries()) {
    if (isFamilyEntry(entry)) continue;
    if (entry.category !== "Romance") continue;
    if (claimedIsos.has(iso)) continue;

    const bases = mapByIso.get(iso);
    if (!bases) continue;

    const uniqueBases = bases.filter(b => typeof b === "number" && (baseUseCount.get(b) || 0) === 1);
    if (uniqueBases.length > 0) continue;

    noUniqBase.push({
      iso,
      name: entry.name || "",
      region: entry.region || "",
      family: entry.family || "",
      bases
    });
  }

  noUniqBase.sort((a, b) => a.iso.localeCompare(b.iso));

  console.log(`Romance NO_UNIQ_BASE candidates: ${noUniqBase.length}`);
  for (const r of noUniqBase) {
    console.log(`${r.iso}\t${r.name}\t${r.region}\t${r.family}\tbases=[${r.bases.join(",")}]`);
  }

  console.log(`\nnext5: ${noUniqBase.slice(0, 5).map(r => r.iso).join(",")}`);

  // Sanity: ensure namebases are loaded so we don't accidentally run against an empty array
  console.log(`Loaded defaultNameBases count: ${nameBases.length}`);
}

main();
