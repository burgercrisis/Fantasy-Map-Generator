"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..", "..");

function readJson(relPath) {
  const full = path.join(root, relPath);
  const raw = fs.readFileSync(full, "utf8").replace(/^\uFEFF/, "");
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

function parseArgs(argv) {
  const args = argv.slice(2);

  const onlyFailures = args.includes("--only-failures");
  const includeFamilies = args.includes("--include-families");
  const skipRegion = args.includes("--skip-region");
  const ignoreMiscRegion = !args.includes("--no-ignore-misc-region");

  const skipTagsArg = args.find(a => a.startsWith("--skip-tags="));
  const skipTags = skipTagsArg
    ? skipTagsArg
        .split("=")
        .slice(1)
        .join("=")
        .split(",")
        .map(s => s.trim())
        .filter(Boolean)
    : [];

  const onlyArg = args.find(a => a.startsWith("--only="));
  const only = onlyArg
    ? onlyArg
        .split("=")
        .slice(1)
        .join("=")
        .split(",")
        .map(s => s.trim())
        .filter(Boolean)
    : [];

  const limitArg = args.find(a => a.startsWith("--limit="));
  const limit = limitArg ? Math.max(0, parseInt(limitArg.split("=")[1], 10) || 0) : 80;

  const minShareArg = args.find(a => a.startsWith("--min-share="));
  const minShare = minShareArg ? Math.max(0, Math.min(1, parseFloat(minShareArg.split("=")[1]))) : 0.75;

  const minUsesArg = args.find(a => a.startsWith("--min-uses="));
  const minUses = minUsesArg ? Math.max(1, parseInt(minUsesArg.split("=")[1], 10) || 1) : 5;

  const help = args.includes("--help") || args.includes("-h");

  return {onlyFailures, includeFamilies, skipRegion, ignoreMiscRegion, skipTags, only, limit, minShare, minUses, help};
}

function printUsage() {
  console.log("Usage:");
  console.log("  node tools/mixer-diagnostics/report-language-mixer-linguistic-consistency.js [options]");
  console.log("");
  console.log("Options:");
  console.log("  --only=iso1,iso2       Restrict report to these ISO codes.");
  console.log("  --only-failures        Only print ISOs that have at least one mismatch.");
  console.log("  --include-families     Include tags:[\"family\"] pseudo-languages.");
  console.log("  --limit=N              Max ISOs to print (default: 80).");
  console.log("  --min-share=0.0..1.0   Base's dominant family/region share threshold to treat as meaningful (default: 0.75).");
  console.log("  --min-uses=N           Base must be used by at least N ISOs to infer dominant family/region (default: 5).");
  console.log("  --skip-region          Disable region mismatch checks (often noisy due to region label granularity).");
  console.log("  --no-ignore-misc-region By default, region mismatches are ignored when ISO region is 'Misc'. Use this to disable.");
  console.log("  --skip-tags=t1,t2      Skip catalog entries that have any of the specified tags (e.g. pidgin,creole,mixed).");
  console.log("");
  console.log("Notes:");
  console.log("  This is a heuristic audit. It flags bases that are strongly associated with one family/region");
  console.log("  but appear in an ISO whose catalog metadata doesn't match.");
}

function isFamilyEntry(entry) {
  return !!(entry && Array.isArray(entry.tags) && entry.tags.includes("family"));
}

function hasAnyTag(entry, tags) {
  if (!entry || !Array.isArray(entry.tags) || !entry.tags.length) return false;
  if (!Array.isArray(tags) || !tags.length) return false;
  const entryTags = new Set(entry.tags.map(t => String(t).toLowerCase()));
  return tags.some(t => entryTags.has(String(t).toLowerCase()));
}

function normalizeKey(s) {
  if (!s) return "";
  return String(s).trim().toLowerCase();
}

function pickDominant(counts) {
  let total = 0;
  for (const c of counts.values()) total += c;
  if (!total) return null;

  let topKey = "";
  let topCount = 0;
  for (const [k, c] of counts.entries()) {
    if (c > topCount) {
      topKey = k;
      topCount = c;
    }
  }

  return {
    key: topKey,
    count: topCount,
    total,
    share: topCount / total
  };
}

function main() {
  const parsed = parseArgs(process.argv);
  if (parsed.help) {
    printUsage();
    return;
  }

  const catalog = readJson("config/language-mixes.json");
  const mapRows = readJson("config/language-mixer-map.json");
  const nameBases = loadDefaultNameBases();

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

  const comparisonIsos = [];
  for (const [iso] of mapByIso.entries()) {
    const entry = catalogByIso.get(iso);
    if (!parsed.includeFamilies && entry && isFamilyEntry(entry)) continue;
    if (entry && hasAnyTag(entry, parsed.skipTags)) continue;
    comparisonIsos.push(iso);
  }

  const baseStats = new Map();

  const ensureBaseStats = b => {
    if (baseStats.has(b)) return baseStats.get(b);
    const v = {
      uses: 0,
      families: new Map(),
      categories: new Map(),
      regions: new Map()
    };
    baseStats.set(b, v);
    return v;
  };

  for (const iso of comparisonIsos) {
    const bases = mapByIso.get(iso);
    if (!bases) continue;
    const meta = catalogByIso.get(iso);
    if (!meta) continue;

    const family = normalizeKey(meta.family || meta.category);
    const category = normalizeKey(meta.category);
    const region = normalizeKey(meta.region);

    for (const b of bases) {
      if (typeof b !== "number" || !isFinite(b)) continue;
      const s = ensureBaseStats(b);
      s.uses += 1;
      if (family) s.families.set(family, (s.families.get(family) || 0) + 1);
      if (category) s.categories.set(category, (s.categories.get(category) || 0) + 1);
      if (region) s.regions.set(region, (s.regions.get(region) || 0) + 1);
    }
  }

  const targets = [];
  for (const [iso, meta] of catalogByIso.entries()) {
    if (!parsed.includeFamilies && isFamilyEntry(meta)) continue;
    if (hasAnyTag(meta, parsed.skipTags)) continue;
    if (!mapByIso.has(iso)) continue;
    targets.push(iso);
  }

  if (parsed.only && parsed.only.length) {
    const set = new Set(parsed.only);
    const filtered = targets.filter(iso => set.has(iso));
    targets.splice(0, targets.length, ...filtered);
  }
  targets.sort((a, b) => a.localeCompare(b));

  const results = [];

  for (const iso of targets) {
    const meta = catalogByIso.get(iso);
    const bases = mapByIso.get(iso);
    if (!meta || !bases) continue;

    const isoFamily = normalizeKey(meta.family || meta.category);
    const isoCategory = normalizeKey(meta.category);
    const isoRegion = normalizeKey(meta.region);

    const familyMismatches = [];
    const regionMismatches = [];

    for (const b of bases) {
      if (typeof b !== "number" || !isFinite(b)) continue;
      const s = baseStats.get(b);
      if (!s) continue;
      if (s.uses < parsed.minUses) continue;

      const domFamily = pickDominant(s.families);
      const domCategory = pickDominant(s.categories);
      if (
        domFamily &&
        domFamily.share >= parsed.minShare &&
        domFamily.key &&
        isoFamily &&
        domFamily.key !== isoFamily &&
        (!isoCategory || domFamily.key !== isoCategory) &&
        (!domCategory || !domCategory.key || (domCategory.key !== isoFamily && domCategory.key !== isoCategory))
      ) {
        familyMismatches.push({base: b, dominant: domFamily, dominantCategory: domCategory});
      }

      if (!parsed.skipRegion) {
        if (parsed.ignoreMiscRegion && isoRegion === "misc") {
          // no-op
        } else {
          const domRegion = pickDominant(s.regions);
          if (
            domRegion &&
            domRegion.share >= parsed.minShare &&
            domRegion.key &&
            isoRegion &&
            domRegion.key !== isoRegion
          ) {
            regionMismatches.push({base: b, dominant: domRegion});
          }
        }
      }
    }

    const mismatchCount = familyMismatches.length + regionMismatches.length;
    const baseCount = bases.filter(b => typeof b === "number" && isFinite(b)).length;
    const score = baseCount ? mismatchCount / baseCount : 0;

    results.push({
      iso,
      name: meta.name || "",
      family: meta.family || meta.category || "",
      region: meta.region || "",
      bases,
      familyMismatches,
      regionMismatches,
      mismatchCount,
      baseCount,
      score
    });
  }

  const filtered = parsed.onlyFailures
    ? results.filter(r => r.familyMismatches.length || r.regionMismatches.length)
    : results;

  filtered.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.mismatchCount !== a.mismatchCount) return b.mismatchCount - a.mismatchCount;
    return a.iso.localeCompare(b.iso);
  });

  const rows = filtered.slice(0, parsed.limit);

  for (const r of rows) {
    const status = [];
    if (r.familyMismatches.length) status.push(`famMismatch=${r.familyMismatches.length}`);
    if (r.regionMismatches.length) status.push(`regMismatch=${r.regionMismatches.length}`);
    const statusStr = status.length ? status.join(" ") : "OK";

    console.log(`${r.iso} | ${r.name} | family=${r.family} | region=${r.region} | ${statusStr}`);
    console.log(`  bases=${JSON.stringify(r.bases)}`);

    if (r.familyMismatches.length) {
      console.log("  family mismatches:");
      for (const m of r.familyMismatches) {
        const baseMeta = nameBases[m.base];
        const baseName = baseMeta && baseMeta.name ? String(baseMeta.name) : "";
        const baseLabel = baseName ? `${m.base} (${baseName})` : String(m.base);
        const domCat = m.dominantCategory && m.dominantCategory.key ? m.dominantCategory.key : "";
        const domCatSuffix = domCat ? ` domCategory=${domCat}` : "";
        console.log(
          `    - base ${baseLabel}: dominantFamily=${m.dominant.key}${domCatSuffix} share=${m.dominant.share.toFixed(2)} uses=${m.dominant.total}`
        );
      }
    }

    if (r.regionMismatches.length) {
      console.log("  region mismatches:");
      for (const m of r.regionMismatches) {
        const baseMeta = nameBases[m.base];
        const baseName = baseMeta && baseMeta.name ? String(baseMeta.name) : "";
        const baseLabel = baseName ? `${m.base} (${baseName})` : String(m.base);
        console.log(
          `    - base ${baseLabel}: dominantRegion=${m.dominant.key} share=${m.dominant.share.toFixed(2)} uses=${m.dominant.total}`
        );
      }
    }
  }

  const total = results.length;
  const failing = results.filter(r => r.familyMismatches.length || r.regionMismatches.length).length;

  console.log("");
  console.log("=== Language mixer linguistic consistency (heuristic) ===");
  console.log(`Targets (catalog+map, non-family by default): ${total}`);
  console.log(`Flagged (any mismatch): ${failing}`);
  console.log(
    `Parameters: minShare=${parsed.minShare} minUses=${parsed.minUses} skipRegion=${parsed.skipRegion ? "yes" : "no"} ignoreMiscRegion=${parsed.ignoreMiscRegion ? "yes" : "no"}`
  );
  if (parsed.skipTags && parsed.skipTags.length) {
    console.log(`Skip tags: ${parsed.skipTags.join(",")}`);
  }
}

if (require.main === module) main();
