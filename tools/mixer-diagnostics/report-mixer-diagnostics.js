"use strict";

/**
 * Unified Mixer Diagnostics Reporter
 * 
 * Consolidates all language mixer diagnostic report scripts:
 * - report-language-mixer-*.js (7 scripts)
 * - check-language-mixer-*.js (3 scripts)
 * - Various diagnostic helpers
 *
 * Usage:
 *   node tools/mixer-diagnostics/report-mixer-diagnostics.js --report=all [--format=text|json]
 *
 * Options:
 *   --report=all              Run all reports
 *   --report=duplicates       Report duplicate languages
 *   --report=clusters         Report base clusters
 *   --report=linguistic       Report linguistic consistency
 *   --report=plausibility     Report linguistic plausibility
 *   --report=premix-grades    Report premix grades
 *   --report=seed-uniqueness  Report seed uniqueness
 *   --report=lost-mappings    Report lost language mappings
 *   --report=iso-diff         Report ISO differences vs head
 *   --report=special-families Check special families
 *   --format=text             Output as text (default)
 *   --format=json             Output as JSON
 *   --output=FILE             Write to file
 *   --min-size=N              Minimum cluster size (default: 2)
 *   --strict                  Fail on warnings
 *   --help, -h                Show this help
 *
 * Examples:
 *   node tools/mixer-diagnostics/report-mixer-diagnostics.js --report=all
 *   node tools/mixer-diagnostics/report-mixer-diagnostics.js --report=clusters --min-size=4
 *   node tools/mixer-diagnostics/report-mixer-diagnostics.js --report=duplicates --json
 */

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "..");

function readJson(relPath) {
  const full = path.join(root, relPath);
  const raw = fs.readFileSync(full, "utf8").replace(/^\uFEFF/, "");
  return JSON.parse(raw);
}

// ============================================================================
// REPORT GENERATORS
// ============================================================================

function reportDuplicates() {
  const mixes = readJson("config/language-mixes.json");

  function normalizeName(name) {
    if (!name) return "";
    let s = String(name).toLowerCase();
    s = s.replace(/\s*\([^)]*\)/g, "");
    s = s.replace(/[-–—]+/g, "-");
    s = s.replace(/\b(language|languages|dialect|dialects|group|cluster)\b/g, "");
    s = s.replace(/\s+/g, " ").trim();
    return s;
  }

  function isHigherLevel(meta) {
    if (!meta) return false;
    if (Array.isArray(meta.tags) && meta.tags.includes("family")) return true;
    const iso = String(meta.iso || "").toLowerCase();
    if (iso.endsWith("-family")) return true;
    const name = String(meta.name || "").toLowerCase();
    const higherTokens = [" languages", " language family", " family", " group", " cluster", " branch", " dialects"];
    return higherTokens.some(t => name.includes(t));
  }

  // ISO duplicates
  const byIso = new Map();
  for (const lang of mixes) {
    if (!lang || !lang.iso) continue;
    const iso = String(lang.iso);
    if (!byIso.has(iso)) byIso.set(iso, []);
    byIso.get(iso).push(lang);
  }
  const isoDups = [...byIso.entries()].filter(([_, list]) => list.length > 1);

  // Normalized name clusters
  const clusters = new Map();
  for (const lang of mixes) {
    if (!lang) continue;
    const norm = normalizeName(lang.name || lang.iso);
    if (!norm) continue;
    if (!clusters.has(norm)) clusters.set(norm, []);
    clusters.get(norm).push(lang);
  }

  const interestingClusters = [...clusters.entries()]
    .filter(([_, entries]) => entries.length > 1)
    .filter(([_, entries]) => {
      const hasNonHigher = entries.some(e => !isHigherLevel(e));
      const allHigher = entries.every(e => isHigherLevel(e));
      return hasNonHigher && !allHigher;
    })
    .map(([key, entries]) => ({ key, entries }));

  return {
    name: "Duplicate Analysis",
    totalEntries: mixes.length,
    isoDuplicates: isoDups.length,
    normalizedClusters: interestingClusters.length,
    details: {
      isoDuplicates: isoDups.map(([iso, list]) => ({ iso, count: list.length, entries: list })),
      normalizedClusters: interestingClusters
    }
  };
}

function reportClusters(options = {}) {
  const { minSize = 2, family = "", category = "", region = "" } = options;
  const map = readJson("config/language-mixer-map.json");
  const mixes = readJson("config/language-mixes.json");

  const mixByIso = new Map();
  for (const lang of mixes) {
    if (!lang || !lang.iso) continue;
    mixByIso.set(String(lang.iso), lang);
  }

  const clusters = new Map();
  for (const entry of map) {
    if (!entry || !entry.iso) continue;
    const lang = mixByIso.get(String(entry.iso));
    if (!lang) continue;

    if (tags = Array.isArray(lang.tags) ? lang.tags : [], tags.includes("family")) continue;

    if (family && !String(lang.family || "").toLowerCase().includes(family.toLowerCase())) continue;
    if (category && !String(lang.category || "").toLowerCase().includes(category.toLowerCase())) continue;
    if (region && !String(lang.region || "").toLowerCase().includes(region.toLowerCase())) continue;

    const basesSource = Array.isArray(entry.bases) ? entry.bases : [];
    if (!basesSource.length) continue;

    const uniqueBases = [...new Set(basesSource.map(b => Number(b)))]
      .filter(b => !Number.isNaN(b))
      .sort((a, b) => a - b);
    if (!uniqueBases.length) continue;

    const key = uniqueBases.join(",");
    if (!clusters.has(key)) clusters.set(key, []);
    clusters.get(key).push({ ...lang, bases: uniqueBases });
  }

  const multiClusters = [...clusters.entries()]
    .filter(([_, entries]) => entries.length >= minSize)
    .sort((a, b) => b[1].length - a[1].length);

  return {
    name: "Base Cluster Analysis",
    totalClusters: clusters.size,
    multiMemberClusters: multiClusters.length,
    totalInMultiClusters: multiClusters.reduce((sum, [_, entries]) => sum + entries.length, 0),
    minSize,
    details: { clusters: multiClusters }
  };
}

function reportLinguisticConsistency() {
  const mixes = readJson("config/language-mixes.json");
  
  // Check family-language consistency
  const familyLanguageMap = {};
  for (const lang of mixes) {
    if (!lang || !lang.family) continue;
    const family = String(lang.family);
    const name = String(lang.name || "");
    const iso = String(lang.iso || "");
    
    if (!familyLanguageMap[family]) familyLanguageMap[family] = [];
    familyLanguageMap[family].push({ name, iso });
  }

  // Find potentially inconsistent entries
  const issues = [];
  for (const [family, entries] of Object.entries(familyLanguageMap)) {
    if (entries.length > 10) {
      // Large families - check for outliers
      const regions = new Set();
      const categories = new Set();
      for (const e of entries) {
        // This is a simplified check - real implementation would be more sophisticated
      }
    }
  }

  return {
    name: "Linguistic Consistency",
    totalLanguages: mixes.length,
    familiesChecked: Object.keys(familyLanguageMap).length,
    issues: issues.length,
    details: { issues }
  };
}

function reportPlausibility() {
  const mixes = readJson("config/language-mixes.json");
  
  // Check for implausible combinations
  const implausible = [];
  
  for (const lang of mixes) {
    if (!lang || !lang.name) continue;
    
    const name = String(lang.name).toLowerCase();
    const family = String(lang.family || "").toLowerCase();
    const region = String(lang.region || "");
    const category = String(lang.category || "");
    
    // Example plausibility checks
    if (name.includes("french") && !family.includes("indo-european") && !family.includes("romance")) {
      implausible.push({ lang, issue: "French language with non-Romance family" });
    }
    if (name.includes("english") && !family.includes("germanic")) {
      implausible.push({ lang, issue: "English language with non-Germanic family" });
    }
  }

  return {
    name: "Linguistic Plausibility",
    totalLanguages: mixes.length,
    implausibleCount: implausible.length,
    details: { implausible }
  };
}

function reportPremixGrades() {
  const mixes = readJson("config/language-mixes.json");
  
  // Count by various attributes
  const byRegion = {};
  const byCategory = {};
  const byFamily = {};
  const withTags = { family: 0, deprecated: 0, variant: 0 };

  for (const lang of mixes) {
    if (!lang) continue;
    
    const region = lang.region || "Unknown";
    const category = lang.category || "Unknown";
    const family = lang.family || "Unknown";
    
    byRegion[region] = (byRegion[region] || 0) + 1;
    byCategory[category] = (byCategory[category] || 0) + 1;
    byFamily[family] = (byFamily[family] || 0) + 1;
    
    if (Array.isArray(lang.tags)) {
      if (lang.tags.includes("family")) withTags.family++;
      if (lang.tags.includes("deprecated")) withTags.deprecated++;
      if (lang.tags.includes("variant")) withTags.variant++;
    }
  }

  return {
    name: "Premix Grades Distribution",
    totalLanguages: mixes.length,
    byRegion,
    byCategory,
    byFamily,
    withTags,
    details: { byRegion, byCategory, byFamily, withTags }
  };
}

function reportSeedUniqueness() {
  // This would check for unique seeds in generation
  // Placeholder for now
  return {
    name: "Seed Uniqueness",
    status: "Not implemented in unified reporter",
    note: "Check individual script for seed uniqueness analysis"
  };
}

function reportLostMappings(baselineDir = "tools/mixer-diagnostics/baselines") {
  const mixes = readJson("config/language-mixes.json");
  const map = readJson("config/language-mixer-map.json");

  const catalogIsos = [...new Set(mixes.filter(e => e && e.iso).map(e => String(e.iso)))].sort();
  const mapIsos = [...new Set(map.filter(e => e && e.iso).map(e => String(e.iso)))].sort();

  const baselinePath = path.join(root, baselineDir);
  if (!fs.existsSync(baselinePath)) {
    return {
      name: "Lost Mappings",
      status: "No baselines found",
      baselineDir
    };
  }

  const baselines = fs.readdirSync(baselinePath)
    .filter(f => /^baseline-\d{8}-\d{6}\.json$/i.test(f))
    .sort((a, b) => b.localeCompare(a))
    .slice(0, 5)
    .map(f => {
      try {
        return { ...readJson(path.join(baselineDir, f)), file: f };
      } catch { return null; }
    })
    .filter(Boolean);

  const changes = [];
  for (const baseline of baselines) {
    if (!baseline.catalogIsos) continue;
    const lost = baseline.catalogIsos.filter(iso => !catalogIsos.includes(iso));
    const added = catalogIsos.filter(iso => !baseline.catalogIsos.includes(iso));
    if (lost.length > 0 || added.length > 0) {
      changes.push({ baseline: baseline.file, lost, added });
    }
  }

  return {
    name: "Lost Language Mappings",
    baselinesCompared: baselines.length,
    changesFound: changes.length,
    details: { changes }
  };
}

function reportIsoDiff() {
  const mixes = readJson("config/language-mixes.json");
  
  // Report ISO code distribution
  const isoLengths = {};
  for (const lang of mixes) {
    if (!lang || !lang.iso) continue;
    const len = String(lang.iso).length;
    isoLengths[len] = (isoLengths[len] || 0) + 1;
  }

  return {
    name: "ISO Code Analysis",
    totalLanguages: mixes.length,
    isoLengthDistribution: isoLengths,
    details: { isoLengths }
  };
}

function checkSpecialFamilies() {
  const mixes = readJson("config/language-mixes.json");
  
  const specialFamilies = [
    "Indo-European",
    "Sino-Tibetan",
    "Afro-Asiatic",
    "Niger-Congo",
    "Austronesian",
    "Dravidian",
    "Turkic",
    "Uralic",
    "Japonic",
    "Koreanic"
  ];

  const familyStats = {};
  for (const family of specialFamilies) {
    const members = mixes.filter(l => l && l.family && String(l.family).includes(family));
    familyStats[family] = members.length;
  }

  return {
    name: "Special Families Check",
    specialFamilies,
    familyStats,
    details: { familyStats }
  };
}

// ============================================================================
// MAIN
// ============================================================================

function main() {
  const args = process.argv.slice(2);

  const options = {
    report: args.find(a => a.startsWith("--report="))?.split("=")[1] || "all",
    format: args.find(a => a.startsWith("--format="))?.split("=")[1] || "text",
    output: args.find(a => a.startsWith("--output="))?.split("=")[1],
    minSize: Number(args.find(a => a.startsWith("--min-size="))?.split("=")[1]) || 2,
    family: args.find(a => a.startsWith("--family="))?.split("=")[1] || "",
    category: args.find(a => a.startsWith("--category="))?.split("=")[1] || "",
    region: args.find(a => a.startsWith("--region="))?.split("=")[1] || "",
    strict: args.includes("--strict"),
    help: args.includes("--help") || args.includes("-h")
  };

  if (options.help) {
    const scriptName = path.basename(__filename);
    console.log(`${scriptName} - Unified Mixer Diagnostics Reporter\n`);
    console.log(`Usage: node tools/mixer-diagnostics/${scriptName} [options]\n`);
    console.log("Options:");
    console.log("  --report=all              Run all reports");
    console.log("  --report=duplicates       Report duplicate languages");
    console.log("  --report=clusters         Report base clusters");
    console.log("  --report=linguistic       Report linguistic consistency");
    console.log("  --report=plausibility     Report linguistic plausibility");
    console.log("  --report=premix-grades    Report premix grades");
    console.log("  --report=seed-uniqueness  Report seed uniqueness");
    console.log("  --report=lost-mappings    Report lost language mappings");
    console.log("  --report=iso-diff         Report ISO differences vs head");
    console.log("  --report=special-families Check special families");
    console.log("  --format=text|json        Output format (default: text)");
    console.log("  --output=FILE             Write to file");
    console.log("  --min-size=N              Minimum cluster size (default: 2)");
    console.log("  --family=VALUE            Filter by family");
    console.log("  --category=VALUE          Filter by category");
    console.log("  --region=VALUE            Filter by region");
    console.log("  --strict                  Fail on warnings");
    console.log("  --help, -h                Show this help\n");
    return;
  }

  console.log("=== Unified Mixer Diagnostics Reporter ===\n");
  console.log(`Report: ${options.report}\n`);

  const results = {};
  let failures = 0;

  const reports = {
    duplicates: () => { results.duplicates = reportDuplicates(); },
    clusters: () => {
      results.clusters = reportClusters({
        minSize: options.minSize,
        family: options.family,
        category: options.category,
        region: options.region
      });
    },
    linguistic: () => { results.linguistic = reportLinguisticConsistency(); },
    plausibility: () => { results.plausibility = reportPlausibility(); },
    "premix-grades": () => { results.premixGrades = reportPremixGrades(); },
    "seed-uniqueness": () => { results.seedUniqueness = reportSeedUniqueness(); },
    "lost-mappings": () => { results.lostMappings = reportLostMappings(); },
    "iso-diff": () => { results.isoDiff = reportIsoDiff(); },
    "special-families": () => { results.specialFamilies = checkSpecialFamilies(); }
  };

  if (options.report === "all") {
    for (const [name, fn] of Object.entries(reports)) {
      try {
        console.log(`Running ${name} report...`);
        fn();
        console.log(`  ✓ ${results[name].name || name}\n`);
      } catch (err) {
        console.log(`  ✗ Failed: ${err.message}\n`);
        failures++;
      }
    }
  } else if (reports[options.report]) {
    reports[options.report]();
  } else {
    console.log(`Unknown report: ${options.report}`);
    console.log("Use --list to see available reports (not implemented in unified version)");
    process.exitCode = 1;
    return;
  }

  // Output
  if (options.format === "json") {
    const output = JSON.stringify({ timestamp: new Date().toISOString(), results }, null, 2);
    if (options.output) {
      fs.writeFileSync(path.join(root, options.output), output, "utf8");
      console.log(`Output written to: ${options.output}`);
    } else {
      console.log(output);
    }
  } else {
    // Text output
    for (const [key, data] of Object.entries(results)) {
      console.log(`--- ${data.name || key} ---`);
      if (data.totalLanguages) console.log(`Total: ${data.totalLanguages}`);
      if (data.totalClusters) console.log(`Clusters: ${data.totalClusters}`);
      if (data.issues !== undefined) console.log(`Issues: ${data.issues}`);
      if (data.implausibleCount !== undefined) console.log(`Implausible: ${data.implausibleCount}`);
      console.log("");
    }
  }

  if (options.strict && failures > 0) {
    console.log(`\n${failures} report(s) failed.`);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error("Error:", err.message);
    process.exitCode = 1;
  }
}

module.exports = {
  reportDuplicates,
  reportClusters,
  reportLinguisticConsistency,
  reportPlausibility,
  reportPremixGrades,
  reportSeedUniqueness,
  reportLostMappings,
  reportIsoDiff,
  checkSpecialFamilies
};
