"use strict";


const fs = require("fs");
const path = require("path");

const {readJson, writeJson, writeText, toTsv, root} = require("../mixer-core/_report-utils");

function toLower(s) {
  return (s || "").toString().toLowerCase();
}

function parseArgs(argv) {
  const args = argv.slice(2);

  function hasFlag(name) {
    return args.includes(name);
  }

  function findValue(prefix, defaultValue = null) {
    const hit = args.find(a => a.startsWith(prefix + "="));
    if (!hit) return defaultValue;
    const value = hit.slice(prefix.length + 1);
    return value === "" ? defaultValue : value;
  }

  const minBaseUsesRaw = findValue("--min-base-uses", "5");
  const domRaw = findValue("--dominance-threshold", "0.85");
  const limitRaw = findValue("--limit", "100");

  const minBaseUses = Number(minBaseUsesRaw);
  const dominanceThreshold = Number(domRaw);
  const limit = Number(limitRaw);

  return {
    includeFamilies: hasFlag("--include-families"),
    minBaseUses: Number.isFinite(minBaseUses) && minBaseUses > 0 ? minBaseUses : 5,
    dominanceThreshold:
      Number.isFinite(dominanceThreshold) && dominanceThreshold > 0 && dominanceThreshold <= 1
        ? dominanceThreshold
        : 0.85,
    limit: Number.isFinite(limit) && limit > 0 ? limit : 100,
    outJson: findValue("--out-json", ""),
    outTsv: findValue("--out-tsv", ""),
    familyFilter: toLower(findValue("--family", "")),
    categoryFilter: toLower(findValue("--category", "")),
    regionFilter: toLower(findValue("--region", "")),
  };
}

function loadBaseIndexToNameMap() {
  const files = [
    path.join(root, "modules", "namebases-real.js"),
    path.join(root, "modules", "namebases-fantasy.js"),
    path.join(root, "modules", "namebases-creole.js"),
  ];

  const byIndex = new Map();
  const re = /\{name:\s*"([^"]+)",\s*i:\s*(\d+)/g;

  for (const file of files) {
    let src;
    try {
      src = fs.readFileSync(file, "utf8");
    } catch {
      continue;
    }

    let m;
    while ((m = re.exec(src))) {
      const name = m[1];
      const idx = Number(m[2]);
      if (Number.isNaN(idx)) continue;
      if (!byIndex.has(idx)) byIndex.set(idx, name);
    }
  }

  return byIndex;
}

function tally(map, key) {
  const k = key == null ? "" : String(key);
  map.set(k, (map.get(k) || 0) + 1);
}

function topNCounts(countMap, n = 3) {
  const entries = Array.from(countMap.entries());
  entries.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  return entries.slice(0, n).map(([k, c]) => ({value: k, count: c}));
}

function dominantOf(countMap, total) {
  const top = topNCounts(countMap, 1)[0] || {value: "", count: 0};
  const dominance = total > 0 ? top.count / total : 0;
  return {value: top.value, count: top.count, dominance};
}

function normalizeBases(bases) {
  if (!Array.isArray(bases)) return [];
  return Array.from(new Set(bases.map(b => Number(b)))).filter(b => !Number.isNaN(b)).sort((a, b) => a - b);
}

function main() {
  const opts = parseArgs(process.argv);

  const mixes = readJson("config/language-mixes.json");
  const map = readJson("config/language-mixer-map.json");
  const baseIndexToName = loadBaseIndexToNameMap();

  const mixByIso = new Map();
  for (const lang of mixes) {
    if (!lang || !lang.iso) continue;
    mixByIso.set(String(lang.iso), lang);
  }

  // Pass 1: compute base usage distributions over catalog languages.
  const baseStats = new Map();

  function ensureBase(b) {
    if (!baseStats.has(b)) {
      baseStats.set(b, {
        base: b,
        total: 0,
        families: new Map(),
        categories: new Map(),
        regions: new Map(),
      });
    }
    return baseStats.get(b);
  }

  for (const entry of map) {
    if (!entry || !entry.iso) continue;
    const iso = String(entry.iso);
    const lang = mixByIso.get(iso);
    if (!lang) continue;

    const tags = Array.isArray(lang.tags) ? lang.tags : [];
    const isFamilyMacro = tags.includes("family");
    if (isFamilyMacro && !opts.includeFamilies) continue;

    const family = lang.family || "";
    const category = lang.category || "";
    const region = lang.region || "";

    const bases = normalizeBases(entry.bases);
    if (!bases.length) continue;

    for (const b of bases) {
      const st = ensureBase(b);
      st.total++;
      tally(st.families, family);
      tally(st.categories, category);
      tally(st.regions, region);
    }
  }

  // Compute dominant labels for bases.
  const baseSummary = new Map();
  for (const [b, st] of baseStats.entries()) {
    baseSummary.set(b, {
      base: b,
      baseName: baseIndexToName.get(b) || "?",
      total: st.total,
      family: dominantOf(st.families, st.total),
      category: dominantOf(st.categories, st.total),
      region: dominantOf(st.regions, st.total),
      topFamilies: topNCounts(st.families, 3),
      topCategories: topNCounts(st.categories, 3),
      topRegions: topNCounts(st.regions, 3),
    });
  }

  // Pass 2: score languages whose bases look out-of-distribution.
  const issues = [];
  const perIso = new Map();

  function ensureIso(iso, lang) {
    if (!perIso.has(iso)) {
      perIso.set(iso, {
        iso,
        name: (lang && lang.name) || "",
        family: (lang && lang.family) || "",
        category: (lang && lang.category) || "",
        region: (lang && lang.region) || "",
        score: 0,
        issueCount: 0,
      });
    }
    return perIso.get(iso);
  }

  const FAMILY_WEIGHT = 3;
  const CATEGORY_WEIGHT = 2;
  const REGION_WEIGHT = 1;

  function considerMismatch(dim, isoMetaValue, dom) {
    if (!dom || !dom.value) return null;
    if (!isoMetaValue) return null;
    if (isoMetaValue === dom.value) return null;
    if (dom.dominance < opts.dominanceThreshold) return null;
    return {dominant: dom.value, dominance: dom.dominance};
  }

  for (const entry of map) {
    if (!entry || !entry.iso) continue;
    const iso = String(entry.iso);
    const lang = mixByIso.get(iso);
    if (!lang) continue;

    const tags = Array.isArray(lang.tags) ? lang.tags : [];
    const isFamilyMacro = tags.includes("family");
    if (isFamilyMacro && !opts.includeFamilies) continue;

    if (opts.familyFilter && !toLower(lang.family).includes(opts.familyFilter)) continue;
    if (opts.categoryFilter && !toLower(lang.category).includes(opts.categoryFilter)) continue;
    if (opts.regionFilter && !toLower(lang.region).includes(opts.regionFilter)) continue;

    const bases = normalizeBases(entry.bases);
    if (!bases.length) continue;

    const isoRow = ensureIso(iso, lang);

    for (const b of bases) {
      const bs = baseSummary.get(b);
      if (!bs) continue;
      if (bs.total < opts.minBaseUses) continue;

      const familyMismatch = considerMismatch("family", lang.family || "", bs.family);
      const categoryMismatch = considerMismatch("category", lang.category || "", bs.category);
      const regionMismatch = considerMismatch("region", lang.region || "", bs.region);

      if (!familyMismatch && !categoryMismatch && !regionMismatch) continue;

      let score = 0;
      const reasons = [];

      if (familyMismatch) {
        score += FAMILY_WEIGHT * familyMismatch.dominance;
        reasons.push(
          `family(${lang.family || ""} != ${familyMismatch.dominant}, dom=${familyMismatch.dominance.toFixed(2)})`
        );
      }
      if (categoryMismatch) {
        score += CATEGORY_WEIGHT * categoryMismatch.dominance;
        reasons.push(
          `category(${lang.category || ""} != ${categoryMismatch.dominant}, dom=${categoryMismatch.dominance.toFixed(
            2
          )})`
        );
      }
      if (regionMismatch) {
        score += REGION_WEIGHT * regionMismatch.dominance;
        reasons.push(
          `region(${lang.region || ""} != ${regionMismatch.dominant}, dom=${regionMismatch.dominance.toFixed(2)})`
        );
      }

      isoRow.score += score;
      isoRow.issueCount += 1;

      issues.push({
        iso,
        name: lang.name || "",
        langFamily: lang.family || "",
        langCategory: lang.category || "",
        langRegion: lang.region || "",
        base: b,
        baseName: bs.baseName,
        baseUses: bs.total,
        dominantFamily: bs.family.value,
        dominantFamilyDominance: bs.family.dominance,
        dominantCategory: bs.category.value,
        dominantCategoryDominance: bs.category.dominance,
        dominantRegion: bs.region.value,
        dominantRegionDominance: bs.region.dominance,
        score,
        reasons: reasons.join("; "),
      });
    }
  }

  const summary = Array.from(perIso.values())
    .filter(r => r.issueCount > 0)
    .sort((a, b) => b.score - a.score || b.issueCount - a.issueCount || a.iso.localeCompare(b.iso));

  const printed = summary.slice(0, opts.limit);

  console.log("=== Language Mixer linguistic plausibility triage (heuristic) ===");
  console.log("Catalog languages:", mixes.length);
  console.log("Map entries:", map.length);
  console.log("Bases observed in catalog mappings:", baseSummary.size);
  console.log("minBaseUses:", opts.minBaseUses);
  console.log("dominanceThreshold:", opts.dominanceThreshold);
  console.log("Languages flagged:", summary.length);
  console.log("");

  if (!summary.length) {
    console.log("No suspicious mappings found under current thresholds.");
  } else {
    console.log(`Top ${printed.length} languages by score:`);
    for (const row of printed) {
      console.log(
        `- ${row.iso} | score=${row.score.toFixed(2)} | issues=${row.issueCount} | ${row.name} | ${row.region} | ${row.family} | ${row.category}`
      );
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    options: opts,
    summary,
    issues,
  };

  if (opts.outJson) {
    writeJson(opts.outJson, report);
  }

  if (opts.outTsv) {
    const columns = [
      "iso",
      "name",
      "langRegion",
      "langFamily",
      "langCategory",
      "base",
      "baseName",
      "baseUses",
      "dominantFamily",
      "dominantFamilyDominance",
      "dominantCategory",
      "dominantCategoryDominance",
      "dominantRegion",
      "dominantRegionDominance",
      "score",
      "reasons",
    ];
    writeText(opts.outTsv, toTsv(issues, columns));
  }
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error(
      "Error while reporting language mixer linguistic plausibility:",
      err && err.message ? err.message : err
    );
    process.exitCode = 1;
  }
}
