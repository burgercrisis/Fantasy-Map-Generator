"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "..", "..");

function stripBom(s) {
  if (!s) return s;
  return s.charCodeAt(0) === 0xfeff ? s.slice(1) : s;
}

function readJson(rel) {
  const full = path.join(root, rel);
  const raw = fs.readFileSync(full, "utf8");
  return JSON.parse(stripBom(raw));
}

function isFamilyEntry(entry) {
  return !!(entry && Array.isArray(entry.tags) && entry.tags.includes("family"));
}

function main() {
  const claims = readJson("tools/mixer-diagnostics/_no_uniq_base_claims.json");
  const catalog = readJson("config/language-mixes.json");

  const catalogByIso = new Map();
  for (const c of catalog) {
    if (!c || !c.iso) continue;
    catalogByIso.set(c.iso, c);
  }

  const mappings = [];
  const warnings = [];

  for (const claim of (claims.claims || [])) {
    if (!claim || !Array.isArray(claim.isos) || typeof claim.notes !== "string") continue;
    const claimedSet = new Set(claim.isos);

    const rx = /-\s*([^\s>]+)->(\d+)/g;
    let m;
    while ((m = rx.exec(claim.notes))) {
      const iso = m[1];
      const base = Number(m[2]);
      if (!Number.isFinite(base)) continue;

      if (!claimedSet.has(iso)) {
        warnings.push(`claim workerId=${claim.workerId} batchId=${claim.batchId}: note mapping ${iso}->${base} not in claim.isos`);
        continue;
      }

      const entry = catalogByIso.get(iso);
      if (!entry || isFamilyEntry(entry) || entry.category !== "Romance") continue;

      mappings.push({
        workerId: claim.workerId,
        batchId: claim.batchId,
        iso,
        base,
        name: entry.name || ""
      });
    }
  }

  mappings.sort((a, b) => a.base - b.base || a.iso.localeCompare(b.iso));

  console.log(`Romance dedicated base mappings found in claims: ${mappings.length}`);
  for (const r of mappings) {
    console.log(`${r.base}\t${r.iso}\t${r.name}\tworkerId=${r.workerId}\t${r.batchId}`);
  }

  if (warnings.length) {
    console.log("\nWARNINGS:");
    for (const w of warnings) console.log(w);
  }
}

main();
