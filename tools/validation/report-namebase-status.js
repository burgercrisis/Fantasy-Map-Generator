"use strict";

/**
 * Unified Validation Status Checker
 * 
 * Single tool for checking the status of continent namebase files.
 * Replaces and consolidates:
 *   - check-current-status-v1.js
 *   - check-current-status-v2.js
 *   - check-current-status-v3.js
 * 
 * Usage:
 *   node tools/validation/check-status.js [options]
 *
 * Options:
 *   --brief           Show only summary statistics
 *   --detailed        Show detailed output including examples (default)
 *   --short-bases=N   Threshold for "short base" (default: 4)
 *   --placeholders    Show placeholder counts by language
 *   --dedicated       Check for (dedicated) suffix usage
 *   --json            Output in JSON format
 *   --output=FILE     Write results to file
 *   --help, -h        Show this help
 *
 * Examples:
 *   node tools/validation/check-status.js
 *   node tools/validation/check-status.js --brief
 *   node tools/validation/check-status.js --placeholders --dedicated
 *   node tools/validation/check-status.js --json --output=status.json
 */

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "..");

const continentFiles = [
  "modules/namebases-africa.js",
  "modules/namebases-asia.js",
  "modules/namebases-europe.js",
  "modules/namebases-northAmerica.js",
  "modules/namebases-southAmerica.js",
  "modules/namebases-oceania.js"
];

// ============================================================================
// ANALYSIS FUNCTIONS
// ============================================================================

function loadContent() {
  let combinedContent = "";
  for (const file of continentFiles) {
    const fullPath = path.join(root, file);
    if (fs.existsSync(fullPath)) {
      combinedContent += fs.readFileSync(fullPath, "utf8") + "\n";
    }
  }
  return combinedContent;
}

function analyzeEntries(content) {
  // Count entries by counting "name" keys which are unique per entry
  const namePattern = /"name":\s*"/g;
  const matches = content.match(namePattern);
  return matches ? matches.length : 0;
}

function analyzePlaceholders(content) {
  const patterns = [
    { name: "English", regex: /"b":\s*"[^"]*English/gi },
    { name: "French", regex: /"b":\s*"[^"]*French/gi },
    { name: "Spanish", regex: /"b":\s*"[^"]*Spanish/gi },
    { name: "German", regex: /"b":\s*"[^"]*German/gi },
    { name: "Italian", regex: /"b":\s*"[^"]*Italian/gi },
    { name: "Portuguese", regex: /"b":\s*"[^"]*Portuguese/gi },
    { name: "Arabic", regex: /"b":\s*"[^"]*Arabic/gi }
  ];

  const results = {};
  for (const { name, regex } of patterns) {
    const matches = content.match(regex);
    results[name] = matches ? matches.length : 0;
  }
  return results;
}

function analyzeDValues(content) {
  const lnrtMatches = content.match(/"d":\s*"lnrt"/g);
  const emptyMatches = content.match(/"d":\s*""/g);
  
  return {
    lnrt: lnrtMatches ? lnrtMatches.length : 0,
    empty: emptyMatches ? emptyMatches.length : 0
  };
}

function analyzeBaseStats(content, shortThreshold = 4) {
  const basePattern = /"b":\s*"([^"]+)"/g;
  let match;
  const bases = [];
  
  while ((match = basePattern.exec(content)) !== null) {
    const cities = match[1].split(",");
    bases.push({ count: cities.length, sample: match[1] });
  }

  const cityCounts = bases.map(b => b.count);
  const shortBases = cityCounts.filter(c => c < shortThreshold).length;
  const avgCities = cityCounts.length > 0 
    ? (cityCounts.reduce((a, b) => a + b, 0) / cityCounts.length).toFixed(1)
    : 0;

  // Find entries with shortest bases
  const sortedByLength = [...bases].sort((a, b) => a.count - b.count);
  
  return {
    totalBases: bases.length,
    shortBases,
    shortThreshold,
    averageCities: avgCities,
    minCities: cityCounts.length > 0 ? Math.min(...cityCounts) : 0,
    maxCities: cityCounts.length > 0 ? Math.max(...cityCounts) : 0,
    shortestBases: sortedByLength.slice(0, 10).map(b => ({
      cities: b.count,
      sample: b.sample.substring(0, 50)
    }))
  };
}

function analyzeShortBaseEntries(content, shortThreshold = 4) {
  const entryBasePattern = /\{"[^}]*"name":\s*"([^"]+)"[^}]*"b":\s*"([^"]+)"[^}]*\}/g;
  const shortEntries = [];
  let match;
  
  while ((match = entryBasePattern.exec(content)) !== null) {
    const cities = match[2].split(",");
    if (cities.length < shortThreshold) {
      shortEntries.push({
        name: match[1],
        cities: cities.length,
        base: match[2].substring(0, 80)
      });
    }
  }

  return shortEntries;
}

function analyzeDedicatedSuffix(content) {
  const matches = content.match(/"name":\s*"[^"]*\(dedicated\)/g);
  return matches ? matches.length : 0;
}

function analyzeByFile(content) {
  const filePattern = /modules\/namebases-([a-zA-Z]+)\.js/g;
  const results = {};

  for (const file of continentFiles) {
    const name = file.replace("modules/namebases-", "").replace(".js", "");
    const fileContent = fs.readFileSync(path.join(root, file), "utf8");
    
    const entries = (fileContent.match(/"name":\s*"/g) || []).length;
    const bases = (fileContent.match(/"b":\s*"[^"]+"/g) || []).length;
    
    results[name] = { entries, bases };
  }

  return results;
}

// ============================================================================
// MAIN
// ============================================================================

function main() {
  const args = process.argv.slice(2);

  // Parse options
  const options = {
    brief: args.includes("--brief"),
    detailed: args.includes("--detailed") || !args.includes("--brief"),
    shortBases: Number(args.find(a => a.startsWith("--short-bases="))?.split("=")[1]) || 4,
    placeholders: args.includes("--placeholders"),
    dedicated: args.includes("--dedicated"),
    json: args.includes("--json"),
    output: args.find(a => a.startsWith("--output="))?.split("=")[1],
    help: args.includes("--help") || args.includes("-h")
  };

  if (options.help) {
    const scriptName = path.basename(__filename);
    console.log(`${scriptName} - Unified Validation Status Checker\n`);
    console.log("Single tool for checking the status of continent namebase files.\n");
    console.log("Usage: node tools/validation/${scriptName} [options]\n");
    console.log("Options:");
    console.log("  --brief            Show only summary statistics");
    console.log("  --detailed         Show detailed output including examples (default)");
    console.log("  --short-bases=N    Threshold for 'short base' (default: 4)");
    console.log("  --placeholders     Show placeholder counts by language");
    console.log("  --dedicated        Check for (dedicated) suffix usage");
    console.log("  --json             Output in JSON format");
    console.log("  --output=FILE      Write results to file");
    console.log("  --help, -h         Show this help\n");
    console.log("Examples:");
    console.log(`  node tools/validation/${scriptName}`);
    console.log(`  node tools/validation/${scriptName} --brief`);
    console.log(`  node tools/validation/${scriptName} --placeholders --dedicated`);
    return;
  }

  const content = loadContent();

  // Run all analyses
  const results = {
    timestamp: new Date().toISOString(),
    summary: {
      totalEntries: analyzeEntries(content),
      placeholders: analyzePlaceholders(content),
      dValues: analyzeDValues(content),
      baseStats: analyzeBaseStats(content, options.shortBases),
      dedicatedSuffix: analyzeDedicatedSuffix(content),
      byFile: analyzeByFile(content)
    }
  };

  // Additional detailed analyses
  if (options.detailed) {
    results.detailed = {
      shortBaseEntries: analyzeShortBaseEntries(content, options.shortBases)
    };
  }

  // Output
  if (options.json) {
    const output = JSON.stringify(results, null, 2);
    if (options.output) {
      fs.writeFileSync(path.join(root, options.output), output, "utf8");
      console.log(`Output written to: ${options.output}`);
    } else {
      console.log(output);
    }
    return;
  }

  // Human-readable output
  console.log("=== VALIDATION STATUS REPORT ===\n");
  console.log("Generated:", results.timestamp);
  console.log("");

  // Summary
  console.log("--- SUMMARY ---\n");
  console.log(`Total entries: ${results.summary.totalEntries}`);
  console.log(`Total bases: ${results.summary.baseStats.totalBases}`);
  console.log("");

  // By file
  console.log("--- BY FILE ---\n");
  for (const [name, data] of Object.entries(results.summary.byFile)) {
    console.log(`${name}: ${data.entries} entries, ${data.bases} bases`);
  }
  console.log("");

  // Placeholders
  if (options.placeholders || options.detailed) {
    console.log("--- PLACEHOLDERS ---\n");
    const totalPlaceholders = Object.values(results.summary.placeholders).reduce((a, b) => a + b, 0);
    console.log(`Total placeholder entries: ${totalPlaceholders}`);
    for (const [lang, count] of Object.entries(results.summary.placeholders)) {
      if (count > 0) console.log(`  ${lang}: ${count}`);
    }
    console.log("");
  }

  // D values
  console.log("--- 'd' VALUES ---\n");
  console.log(`"lnrt": ${results.summary.dValues.lnrt}`);
  console.log(`Empty (""): ${results.summary.dValues.empty}`);
  console.log("");

  // Base statistics
  console.log("--- BASE STATISTICS ---\n");
  console.log(`Total bases: ${results.summary.baseStats.totalBases}`);
  console.log(`Short bases (< ${options.shortBases} cities): ${results.summary.baseStats.shortBases}`);
  console.log(`Average cities per base: ${results.summary.baseStats.averageCities}`);
  console.log(`Min cities: ${results.summary.baseStats.minCities}`);
  console.log(`Max cities: ${results.summary.baseStats.maxCities}`);
  console.log("");

  // Dedicated suffix
  if (options.dedicated) {
    console.log("--- (dedicated) SUFFIX ---\n");
    console.log(`Entries with (dedicated) suffix: ${results.summary.dedicatedSuffix}`);
    console.log("");
  }

  // Short base examples
  if (options.detailed && results.summary.baseStats.shortBases > 0) {
    console.log("--- SHORT BASE EXAMPLES ---\n");
    const examples = results.summary.baseStats.shortestBases.slice(0, 5);
    examples.forEach((ex, i) => {
      console.log(`${i + 1}. ${ex.cities} cities: "${ex.sample}..."`);
    });
    console.log("");

    if (results.detailed && results.detailed.shortBaseEntries) {
      const entries = results.detailed.shortBaseEntries.slice(0, 10);
      if (entries.length > 0) {
        console.log("--- ENTRIES WITH SHORT BASES ---\n");
        entries.forEach(e => {
          console.log(`  ${e.name}: ${e.cities} cities`);
        });
        console.log("");
      }
    }
  }

  // Write output file if requested
  if (options.output) {
    fs.writeFileSync(path.join(root, options.output), JSON.stringify(results, null, 2), "utf8");
    console.log(`\nDetailed JSON output written to: ${options.output}`);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  analyzeEntries,
  analyzePlaceholders,
  analyzeDValues,
  analyzeBaseStats,
  analyzeDedicatedSuffix
};
