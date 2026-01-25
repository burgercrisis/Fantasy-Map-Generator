"use strict";

/**
 * Unified Language Mixer Health Checker
 * 
 * Single entry point for all language mixer health diagnostics.
 * Replaces and consolidates:
 *   - run-language-mixer-health.js
 *   - check-language-mixer-coverage.js
 *   - check-language-mixer-failures.js
 *   - mixer-doctor.js (simplified mode)
 * 
 * Usage:
 *   node tools/mixer-core/check-mixer-health.js [options]
 *
 * Options:
 *   --quick           Run only essential checks (coverage + failures)
 *   --full            Run all diagnostics including baseline comparison
 *   --strict          Fail on warnings in addition to errors
 *   --no-family-diff  Skip family diff check
 *   --no-coverage     Skip coverage check
 *   --no-failures     Skip failures check
 *   --no-name-dups    Skip name duplicate check
 *   --no-fuzzy-dups   Skip fuzzy duplicate check
 *   --no-base-clusters Skip base cluster analysis
 *   --min-size=N      Minimum cluster size for base cluster report (default: 2)
 *   --family=VALUE    Filter base clusters by family
 *   --category=VALUE  Filter base clusters by category
 *   --region=VALUE    Filter base clusters by region
 *   --baseline-dir=DIR Path to baseline snapshots directory
 *   --max-baselines=N Number of baselines to compare (default: 5)
 *   --output=FILE     Write summary to file
 *   --json            Output in JSON format
 *
 * Examples:
 *   node tools/mixer-core/check-mixer-health.js --quick
 *   node tools/mixer-core/check-mixer-health.js --full --strict
 *   node tools/mixer-core/check-mixer-health.js --full --min-size=4 --family=Uralic
 */

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const root = path.resolve(__dirname, "..", "..");

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function readJson(relPath) {
  const full = path.join(root, relPath);
  const raw = fs.readFileSync(full, "utf8").replace(/^\uFEFF/, "");
  return JSON.parse(raw);
}

function runScript(relativePath, args = []) {
  const scriptPath = path.join(root, relativePath);
  const cmdArgs = [scriptPath].concat(args);
  try {
    return { ok: true, stdout: execFileSync("node", cmdArgs, { encoding: "utf8" }), stderr: "" };
  } catch (err) {
    return {
      ok: false,
      stdout: err.stdout ? String(err.stdout) : "",
      stderr: err.stderr ? String(err.stderr) : err.message
    };
  }
}

// ============================================================================
// INDIVIDUAL CHECKS (Internal helpers)
// ============================================================================

/**
 * Check ISO coverage between map and catalog
 */
function checkCoverage() {
  const map = readJson("config/language-mixer-map.json");
  const mixes = readJson("config/language-mixes.json");

  const mapIsos = new Set(map.map(e => e.iso));
  const mixIsos = new Set(mixes.map(e => e.iso));

  const inMapNotCatalog = [...mapIsos].filter(iso => !mixIsos.has(iso)).sort();
  const inCatalogNotMap = [...mixIsos].filter(iso => !mapIsos.has(iso)).sort();

  return {
    name: "Coverage Check",
    passed: inMapNotCatalog.length === 0 && inCatalogNotMap.length === 0,
    stats: {
      totalInMap: mapIsos.size,
      totalInCatalog: mixIsos.size,
      missingFromCatalog: inMapNotCatalog.length,
      missingFromMap: inCatalogNotMap.length
    },
    details: {
      missingFromCatalog: inMapNotCatalog,
      missingFromMap: inCatalogNotMap
    }
  };
}

/**
 * Check for languages that would fail in Markov mixer
 */
function checkFailures() {
  const map = readJson("config/language-mixer-map.json");
  const mixes = readJson("config/language-mixes.json");

  // Load valid base indices
  const files = [
    path.join(root, "modules", "namebases-real.js"),
    path.join(root, "modules", "namebases-fantasy.js"),
    path.join(root, "modules", "namebases-creole.js")
  ];
  const validBaseIndices = new Set();
  const re = /\{\s*name:\s*"([^"]+)",\s*i:\s*(\d+)/g;
  for (const file of files) {
    try {
      const src = fs.readFileSync(file, "utf8");
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(src))) {
        const idx = Number(m[2]);
        if (!Number.isNaN(idx)) validBaseIndices.add(idx);
      }
    } catch (e) { /* ignore */ }
  }

  const mapByIso = new Map(map.map(e => [e.iso, e]));
  const catalogIsos = new Set(mixes.map(m => m.iso));

  const noMap = [];
  const emptyBases = [];
  const allBasesInvalid = [];
  const partiallyInvalid = [];

  for (const lang of mixes) {
    if (!lang || !lang.iso) continue;
    if (Array.isArray(lang.tags) && lang.tags.indexOf("family") !== -1) continue;

    const entry = mapByIso.get(lang.iso);
    if (!entry) {
      noMap.push(lang);
      continue;
    }

    if (!Array.isArray(entry.bases) || !entry.bases.length) {
      emptyBases.push({ lang, entry });
      continue;
    }

    const invalid = entry.bases.filter(b => !validBaseIndices.has(b));
    if (invalid.length === entry.bases.length) {
      allBasesInvalid.push({ lang, entry, invalid });
    } else if (invalid.length > 0) {
      partiallyInvalid.push({ lang, entry, invalid });
    }
  }

  const totalFailures = noMap.length + emptyBases.length + allBasesInvalid.length;

  return {
    name: "Failure Check",
    passed: totalFailures === 0,
    stats: {
      totalCatalog: mixes.length,
      totalFailures,
      missingMapping: noMap.length,
      emptyBases: emptyBases.length,
      allBasesInvalid: allBasesInvalid.length,
      partiallyInvalid: partiallyInvalid.length
    },
    details: {
      missingMapping: noMap,
      emptyBases,
      allBasesInvalid,
      partiallyInvalid
    }
  };
}

/**
 * Check for exact duplicate language names
 */
function checkNameDuplicates() {
  const mixes = readJson("config/language-mixes.json");
  const byName = new Map();

  for (const lang of mixes) {
    if (!lang || !lang.name) continue;
    const name = String(lang.name).trim();
    if (!name) continue;
    if (!byName.has(name)) byName.set(name, []);
    byName.get(name).push(lang);
  }

  const dups = [];
  for (const [name, list] of byName.entries()) {
    if (list.length > 1) dups.push({ name, count: list.length, entries: list });
  }

  return {
    name: "Name Duplicate Check",
    passed: dups.length === 0,
    stats: {
      totalEntries: mixes.length,
      duplicateNames: dups.length
    },
    details: { duplicates: dups }
  };
}

/**
 * Check for ISO duplicates and normalized name clusters
 */
function checkFuzzyDuplicates() {
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
    name: "Fuzzy Duplicate Check",
    passed: isoDups.length === 0 && interestingClusters.length === 0,
    stats: {
      isoDuplicates: isoDups.length,
      normalizedClusters: interestingClusters.length
    },
    details: {
      isoDuplicates: isoDups.map(([iso, list]) => ({ iso, count: list.length, entries: list })),
      normalizedClusters: interestingClusters
    }
  };
}

/**
 * Check base cluster overlaps
 */
function checkBaseClusters(options = {}) {
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

    const tags = Array.isArray(lang.tags) ? lang.tags : [];
    if (tags.includes("family")) continue;

    if (family && !String(lang.family || "").toLowerCase().includes(family.toLowerCase())) continue;
    if (category && !String(lang.category || "").toLowerCase().includes(category.toLowerCase())) continue;
    if (region && !String(lang.region || "").toLowerCase().includes(region.toLowerCase())) continue;

    const basesSource = Array.isArray(entry.bases) ? entry.bases : [];
    if (!basesSource.length) continue;

    const uniqueBases = [...new Set(basesSource.map(b => Number(b)))].filter(b => !Number.isNaN(b)).sort((a, b) => a - b);
    if (!uniqueBases.length) continue;

    const key = uniqueBases.join(",");
    if (!clusters.has(key)) clusters.set(key, []);
    clusters.get(key).push({ ...lang, bases: uniqueBases });
  }

  const multiClusters = [...clusters.entries()]
    .filter(([_, entries]) => entries.length >= minSize)
    .sort((a, b) => b[1].length - a[1].length);

  return {
    name: "Base Cluster Check",
    passed: multiClusters.length === 0,
    stats: {
      totalClusters: clusters.size,
      multiMemberClusters: multiClusters.length,
      totalInMultiClusters: multiClusters.reduce((sum, [_, entries]) => sum + entries.length, 0)
    },
    details: { clusters: multiClusters }
  };
}

/**
 * Compare against baseline snapshots
 */
function checkBaselines(baselineDir, maxBaselines = 5) {
  const mixes = readJson("config/language-mixes.json");
  const map = readJson("config/language-mixer-map.json");

  const catalogIsos = [...new Set(mixes.filter(e => e && e.iso).map(e => String(e.iso)))].sort();
  const mapIsos = [...new Set(map.filter(e => e && e.iso).map(e => String(e.iso)))].sort();

  // List baselines
  const baselinePath = path.join(root, baselineDir);
  if (!fs.existsSync(baselinePath)) {
    return { name: "Baseline Check", passed: true, stats: { message: "No baselines found" }, details: {} };
  }

  const baselines = fs.readdirSync(baselinePath)
    .filter(f => /^baseline-\d{8}-\d{6}\.json$/i.test(f))
    .sort((a, b) => b.localeCompare(a))
    .slice(0, maxBaselines)
    .map(f => {
      try {
        return { ...readJson(path.join(baselineDir, f)), file: f };
      } catch { return null; }
    })
    .filter(Boolean);

  if (baselines.length === 0) {
    return { name: "Baseline Check", passed: true, stats: { message: "No valid baselines" }, details: {} };
  }

  // Check for lost mappings compared to baselines
  const lostMappings = [];
  for (const baseline of baselines) {
    if (!baseline.catalogIsos) continue;
    const lost = baseline.catalogIsos.filter(iso => !catalogIsos.includes(iso));
    const added = catalogIsos.filter(iso => !baseline.catalogIsos.includes(iso));
    if (lost.length > 0 || added.length > 0) {
      lostMappings.push({
        baseline: baseline.file,
        lostFromCatalog: lost,
        addedToCatalog: added
      });
    }
  }

  return {
    name: "Baseline Check",
    passed: lostMappings.length === 0,
    stats: {
      baselinesCompared: baselines.length,
      changesFound: lostMappings.length
    },
    details: { baselineChanges: lostMappings }
  };
}

// ============================================================================
// MAIN ORCHESTRATOR
// ============================================================================

function main() {
  const args = process.argv.slice(2);

  // Parse options
  const options = {
    mode: args.includes("--full") ? "full" : (args.includes("--quick") ? "quick" : "standard"),
    strict: args.includes("--strict"),
    noFamilyDiff: args.includes("--no-family-diff"),
    noCoverage: args.includes("--no-coverage"),
    noFailures: args.includes("--no-failures"),
    noNameDups: args.includes("--no-name-dups"),
    noFuzzyDups: args.includes("--no-fuzzy-dups"),
    noBaseClusters: args.includes("--no-base-clusters"),
    output: args.find(a => a.startsWith("--output="))?.split("=")[1],
    json: args.includes("--json"),
    baselineDir: args.find(a => a.startsWith("--baseline-dir="))?.split("=")[1] || "tools/mixer-diagnostics/baselines",
    maxBaselines: Number(args.find(a => a.startsWith("--max-baselines="))?.split("=")[1]) || 5,
    minSize: Number(args.find(a => a.startsWith("--min-size="))?.split("=")[1]) || 2,
    family: args.find(a => a.startsWith("--family="))?.split("=")[1] || "",
    category: args.find(a => a.startsWith("--category="))?.split("=")[1] || "",
    region: args.find(a => a.startsWith("--region="))?.split("=")[1] || ""
  };

  if (args.includes("--help") || args.includes("-h")) {
    console.log(__filename.split("/").pop() + " - Unified Language Mixer Health Checker\n");
    console.log("Usage: node " + __filename.split("/").pop() + " [options]\n");
    console.log("Options:");
    console.log("  --quick              Run only essential checks (coverage + failures)");
    console.log("  --full               Run all diagnostics including baseline comparison");
    console.log("  --strict             Fail on warnings in addition to errors");
    console.log("  --no-family-diff     Skip family diff check");
    console.log("  --no-coverage        Skip coverage check");
    console.log("  --no-failures        Skip failures check");
    console.log("  --no-name-dups       Skip name duplicate check");
    console.log("  --no-fuzzy-dups      Skip fuzzy duplicate check");
    console.log("  --no-base-clusters   Skip base cluster analysis");
    console.log("  --min-size=N         Minimum cluster size for base cluster report (default: 2)");
    console.log("  --family=VALUE       Filter base clusters by family");
    console.log("  --category=VALUE     Filter base clusters by category");
    console.log("  --region=VALUE       Filter base clusters by region");
    console.log("  --baseline-dir=DIR   Path to baseline snapshots directory");
    console.log("  --max-baselines=N    Number of baselines to compare (default: 5)");
    console.log("  --output=FILE        Write summary to file");
    console.log("  --json               Output in JSON format");
    console.log("  --help, -h           Show this help message");
    return;
  }

  const results = [];
  let allPassed = true;

  console.log("=== Unified Language Mixer Health Check ===\n");
  console.log("Mode:", options.mode.toUpperCase());
  if (options.strict) console.log("Strict mode: enabled\n");

  // Run family diff (if not disabled)
  if (!options.noFamilyDiff) {
    const familyDiff = runScript("tools/mixer-core/diff-language-families.js");
    const hasChanges = familyDiff.stdout && !familyDiff.stdout.includes("No differences");
    if (familyDiff.ok && hasChanges) {
      console.log("=== Family Diff ===");
      console.log(familyDiff.stdout);
    }
  }

  // Coverage check (always run)
  if (!options.noCoverage) {
    const coverage = checkCoverage();
    results.push(coverage);
    allPassed = allPassed && coverage.passed;
    console.log(`[${coverage.passed ? "PASS" : "FAIL"}] ${coverage.name}`);
    console.log(`  Total in map: ${coverage.stats.totalInMap}, in catalog: ${coverage.stats.totalInCatalog}`);
    if (coverage.stats.missingFromMap > 0) {
      console.log(`  Missing from map: ${coverage.stats.missingFromMap}`);
      if (!options.json) coverage.details.missingFromMap.slice(0, 5).forEach(iso => console.log(`    - ${iso}`));
    }
    if (!options.strict && !coverage.passed) allPassed = true; // Coverage issues are warnings in non-strict mode
  }

  // Failures check (always run)
  if (!options.noFailures) {
    const failures = checkFailures();
    results.push(failures);
    allPassed = allPassed && failures.passed;
    console.log(`[${failures.passed ? "PASS" : "FAIL"}] ${failures.name}`);
    console.log(`  Total failures: ${failures.stats.totalFailures}`);
    if (failures.stats.missingMapping > 0) console.log(`    - Missing mapping: ${failures.stats.missingMapping}`);
    if (failures.stats.emptyBases > 0) console.log(`    - Empty bases: ${failures.stats.emptyBases}`);
    if (failures.stats.allBasesInvalid > 0) console.log(`    - All bases invalid: ${failures.stats.allBasesInvalid}`);
    if (!failures.passed && options.strict) {
      console.log("  Details (first 5 each):");
      failures.details.missingMapping.slice(0, 5).forEach(l => console.log(`    Missing: ${l.iso} (${l.name})`));
      failures.details.emptyBases.slice(0, 5).forEach(({ lang }) => console.log(`    Empty: ${lang.iso} (${lang.name})`));
      failures.details.allBasesInvalid.slice(0, 5).forEach(({ lang }) => console.log(`    Invalid: ${lang.iso} (${lang.name})`));
    }
  }

  // Name duplicates check
  if (!options.noNameDups) {
    const nameDups = checkNameDuplicates();
    results.push(nameDups);
    allPassed = allPassed && nameDups.passed;
    console.log(`[${nameDups.passed ? "PASS" : "FAIL"}] ${nameDups.name}`);
    console.log(`  Duplicate names: ${nameDups.stats.duplicateNames}`);
    if (!nameDups.passed && options.strict) {
      nameDups.details.duplicates.slice(0, 5).forEach(d => console.log(`    "${d.name}" (${d.count} entries)`));
    }
  }

  // Fuzzy duplicates check
  if (!options.noFuzzyDups) {
    const fuzzyDups = checkFuzzyDuplicates();
    results.push(fuzzyDups);
    allPassed = allPassed && fuzzyDups.passed;
    console.log(`[${fuzzyDups.passed ? "PASS" : "FAIL"}] ${fuzzyDups.name}`);
    console.log(`  ISO duplicates: ${fuzzyDups.stats.isoDuplicates}, Normalized clusters: ${fuzzyDups.stats.normalizedClusters}`);
    if (!fuzzyDups.passed && options.strict) {
      fuzzyDups.details.isoDuplicates.slice(0, 3).forEach(d => console.log(`    ISO: ${d.iso} (${d.count} entries)`));
      fuzzyDups.details.normalizedClusters.slice(0, 3).forEach(c => console.log(`    Cluster: "${c.key}" (${c.entries.length} entries)`));
    }
  }

  // Base clusters check
  if (!options.noBaseClusters) {
    const baseClusters = checkBaseClusters({
      minSize: options.minSize,
      family: options.family,
      category: options.category,
      region: options.region
    });
    results.push(baseClusters);
    allPassed = allPassed && baseClusters.passed;
    console.log(`[${baseClusters.passed ? "PASS" : "WARN"}] ${baseClusters.name}`);
    console.log(`  Multi-member clusters: ${baseClusters.stats.multiMemberClusters}`);
    if (baseClusters.stats.multiMemberClusters > 0) {
      console.log(`  Total languages in clusters: ${baseClusters.stats.totalInMultiClusters}`);
      if (options.mode === "full") {
        baseClusters.details.clusters.slice(0, 5).forEach(([key, entries]) => {
          console.log(`    Bases [${key}]: ${entries.length} languages`);
          entries.slice(0, 3).forEach(e => console.log(`      - ${e.iso}: ${e.name}`));
        });
      }
    }
  }

  // Baseline comparison (full mode only)
  if (options.mode === "full") {
    const baselines = checkBaselines(options.baselineDir, options.maxBaselines);
    results.push(baselines);
    allPassed = allPassed && baselines.passed;
    console.log(`[${baselines.passed ? "PASS" : "WARN"}] ${baselines.name}`);
    console.log(`  Baselines compared: ${baselines.stats.baselinesCompared}`);
    if (baselines.details.baselineChanges && baselines.details.baselineChanges.length > 0) {
      console.log("  Changes detected:");
      baselines.details.baselineChanges.slice(0, 3).forEach(c => {
        if (c.lostFromCatalog.length > 0) console.log(`    Lost: ${c.lostFromCatalog.slice(0, 3).join(", ")}`);
        if (c.addedToCatalog.length > 0) console.log(`    Added: ${c.addedToCatalog.slice(0, 3).join(", ")}`);
      });
    }
  }

  // Summary
  console.log("\n=== Summary ===");
  const passedCount = results.filter(r => r.passed).length;
  console.log(`Checks passed: ${passedCount}/${results.length}`);
  console.log(`Overall: ${allPassed ? "PASS" : "FAIL"}`);

  // Output file
  if (options.output) {
    const output = options.json
      ? JSON.stringify({ timestamp: new Date().toISOString(), results, passed: allPassed }, null, 2)
      : results.map(r => `[${r.passed ? "PASS" : "FAIL"}] ${r.name}`).join("\n");
    fs.writeFileSync(path.join(root, options.output), output, "utf8");
    console.log(`\nOutput written to: ${options.output}`);
  }

  if (!allPassed) process.exitCode = 1;
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
  checkCoverage,
  checkFailures,
  checkNameDuplicates,
  checkFuzzyDuplicates,
  checkBaseClusters,
  checkBaselines
};
