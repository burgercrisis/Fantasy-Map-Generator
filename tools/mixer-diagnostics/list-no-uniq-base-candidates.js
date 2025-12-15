"use strict";

const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..", "..");

function stripBom(s) {
  if (!s) return s;
  return s.codePointAt(0) === 0xfeff ? s.slice(1) : s;
}

function readJson(rel) {
  const full = path.join(root, rel);
  const raw = fs.readFileSync(full, "utf8");
  return JSON.parse(stripBom(raw));
}

function isFamilyEntry(entry) {
  return !!(entry && Array.isArray(entry.tags) && entry.tags.includes("family"));
}

function parseArgs(argv) {
  const args = argv.slice(2);
  const out = {flags: new Set(), kv: new Map()};

  for (const a of args) {
    if (!a.startsWith("--")) continue;
    const eq = a.indexOf("=");
    if (eq === -1) {
      out.flags.add(a.slice(2));
      continue;
    }
    const k = a.slice(2, eq);
    const v = a.slice(eq + 1);
    out.kv.set(k, v);
  }

  return out;
}

function getArgString(parsed, key, defaultValue = "") {
  if (!parsed.kv.has(key)) return defaultValue;
  const v = parsed.kv.get(key);
  return v === undefined || v === null ? defaultValue : String(v);
}

function getArgInt(parsed, key, defaultValue) {
  const raw = getArgString(parsed, key, "");
  if (!raw) return defaultValue;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) ? n : defaultValue;
}

function normalizeClaimExcludeMode(v) {
  const s = String(v || "").toLowerCase();
  if (s === "none") return "none";
  if (s === "any") return "any";
  return "in_progress";
}

function loadClaimedIsos(excludeMode) {
  if (excludeMode === "none") return new Set();

  const claims = readJson("tools/mixer-diagnostics/_no_uniq_base_claims.json");
  const out = new Set();

  for (const claim of claims?.claims ? claims.claims : []) {
    if (!claim || !Array.isArray(claim.isos)) continue;
    if (excludeMode === "in_progress" && claim.status !== "in_progress") continue;

    for (const iso of claim.isos) {
      if (typeof iso === "string" && iso) out.add(iso);
    }
  }

  return out;
}

function printUsage() {
  process.stdout.write(
    [
      "Usage:",
      "  pnpm exec -- node tools/mixer-diagnostics/list-no-uniq-base-candidates.js [options]",
      "",
      "Options:",
      "  --category=VALUE           Filter catalog entries by category (exact match)",
      "  --family=VALUE             Filter by family (exact match)",
      "  --region=VALUE             Filter by region (exact match)",
      "  --limit=N                  Max rows to print (default: 200)",
      "  --next=N                   Print nextN ISO codes comma-separated (default: 5)",
      "  --exclude-claims=MODE      MODE=in_progress|any|none (default: in_progress)",
      "  --include-families         Include tags:[\"family\"] catalog entries in the scan",
      "",
      "Example:",
      "  pnpm exec -- node tools/mixer-diagnostics/list-no-uniq-base-candidates.js --category=Romance --limit=200 --next=10",
      "",
    ].join("\n"),
  );
}

function main() {
  const parsed = parseArgs(process.argv);
  if (parsed.flags.has("help") || parsed.flags.has("h")) {
    printUsage();
    return;
  }

  const includeFamilies = parsed.flags.has("include-families");
  const limit = Math.max(0, getArgInt(parsed, "limit", 200));
  const nextN = Math.max(0, getArgInt(parsed, "next", 5));

  const category = getArgString(parsed, "category", "").trim();
  const family = getArgString(parsed, "family", "").trim();
  const region = getArgString(parsed, "region", "").trim();

  const excludeMode = normalizeClaimExcludeMode(getArgString(parsed, "exclude-claims", "in_progress"));
  const claimedIsos = loadClaimedIsos(excludeMode);

  const catalog = readJson("config/language-mixes.json");
  const mapRows = readJson("config/language-mixer-map.json");

  const catalogByIso = new Map();
  for (const c of catalog) {
    if (!c?.iso) continue;
    catalogByIso.set(c.iso, c);
  }

  const mapByIso = new Map();
  for (const r of mapRows) {
    if (!r?.iso || !Array.isArray(r.bases)) continue;
    mapByIso.set(r.iso, r.bases);
  }

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

  const candidates = [];

  for (const [iso, entry] of catalogByIso.entries()) {
    if (!includeFamilies && isFamilyEntry(entry)) continue;
    if (claimedIsos.has(iso)) continue;

    if (category && entry.category !== category) continue;
    if (family && entry.family !== family) continue;
    if (region && entry.region !== region) continue;

    const bases = mapByIso.get(iso);
    if (!bases) continue;

    const uniqueBases = bases.filter(b => typeof b === "number" && (baseUseCount.get(b) || 0) === 1);
    if (uniqueBases.length > 0) continue;

    candidates.push({
      iso,
      name: entry.name || "",
      region: entry.region || "",
      category: entry.category || "",
      family: entry.family || "",
      bases,
    });
  }

  candidates.sort((a, b) => a.iso.localeCompare(b.iso));

  process.stdout.write(
    [
      `NO_UNIQ_BASE candidates: ${candidates.length}`,
      `excludeClaims=${excludeMode} includeFamilies=${includeFamilies ? "yes" : "no"}`,
      category ? `filter.category=${category}` : "",
      family ? `filter.family=${family}` : "",
      region ? `filter.region=${region}` : "",
      "",
    ]
      .filter(Boolean)
      .join("\n") + "\n",
  );

  for (const r of candidates.slice(0, limit)) {
    process.stdout.write(`${r.iso}\t${r.name}\t${r.region}\t${r.category}\t${r.family}\tbases=[${r.bases.join(",")}]\n`);
  }

  process.stdout.write(
    "\n" +
      `next${nextN}: ${candidates
        .slice(0, nextN)
        .map(r => r.iso)
        .join(",")}\n`,
  );
}

main();
