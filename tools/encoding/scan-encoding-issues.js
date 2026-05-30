"use strict";

/**
 * Unified Encoding Issues Scanner
 * 
 * Single tool for scanning namebase files for encoding problems.
 * Replaces and consolidates:
 *   - scan-encoding-issues.js
 *   - targeted-encoding-scanner.js
 *   - deep-encoding-scanner.js
 *   - comprehensive-encoding-verification.js
 * 
 * Usage:
 *   node tools/encoding/scan-encoding.js [options]
 *
 * Options:
 *   --brief           Show only summary statistics
 *   --detailed        Show detailed issue listings (default)
 *   --shallow         Quick scan for common issues only
 *   --deep            Deep scan including all pattern checks
 *   --mojibake        Focus on mojibake detection
 *   --scripts         Show script distribution analysis
 *   --fix-mode        Generate fix suggestions (not implemented)
 *   --json            Output in JSON format
 *   --output=FILE     Write results to file
 *   --help, -h        Show this help
 *
 * Examples:
 *   node tools/encoding/scan-encoding.js
 *   node tools/encoding/scan-encoding.js --deep --json
 *   node tools/encoding/scan-encoding.js --mojibake --output=encoding-report.json
 */

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "..");

const namebaseFiles = [
  "modules/namebases-africa.js",
  "modules/namebases-asia.js",
  "modules/namebases-europe.js",
  "modules/namebases-northAmerica.js",
  "modules/namebases-southAmerica.js",
  "modules/namebases-oceania.js"
];

// ============================================================================
// MOJIBAKE PATTERNS (from targeted-encoding-scanner.js)
// ============================================================================

const mojibakePatterns = [
  { pattern: /Ã¡/g, char: "á", langs: ["Portuguese", "Spanish", "Catalan"], desc: "á double-encoded" },
  { pattern: /Ã /g, char: "à", langs: ["Portuguese", "French", "Italian"], desc: "à double-encoded" },
  { pattern: /Ã¢/g, char: "â", langs: ["Portuguese", "French"], desc: "â double-encoded" },
  { pattern: /Ã£/g, char: "ã", langs: ["Portuguese"], desc: "ã double-encoded" },
  { pattern: /Ã¤/g, char: "ä", langs: ["German", "Swedish"], desc: "ä double-encoded" },
  { pattern: /Ã§/g, char: "ç", langs: ["Portuguese", "French", "Turkish"], desc: "ç double-encoded" },
  { pattern: /Ã©/g, char: "é", langs: ["French", "Portuguese", "Spanish"], desc: "é double-encoded" },
  { pattern: /Ã¨/g, char: "è", langs: ["French", "Italian"], desc: "è double-encoded" },
  { pattern: /Ãª/g, char: "ê", langs: ["French", "Portuguese"], desc: "ê double-encoded" },
  { pattern: /Ã«/g, char: "ë", langs: ["Dutch", "French"], desc: "ë double-encoded" },
  { pattern: /Ã­/g, char: "í", langs: ["Spanish", "Portuguese", "Icelandic"], desc: "í double-encoded" },
  { pattern: /Ã®/g, char: "î", langs: ["French", "Romanian"], desc: "î double-encoded" },
  { pattern: /Ã¯/g, char: "ï", langs: ["French", "Icelandic"], desc: "ï double-encoded" },
  { pattern: /Ã³/g, char: "ó", langs: ["Portuguese", "Spanish"], desc: "ó double-encoded" },
  { pattern: /Ã´/g, char: "ô", langs: ["Portuguese", "French"], desc: "ô double-encoded" },
  { pattern: /Ãµ/g, char: "õ", langs: ["Portuguese"], desc: "õ double-encoded" },
  { pattern: /Ã¶/g, char: "ö", langs: ["German", "Swedish", "Turkish"], desc: "ö double-encoded" },
  { pattern: /Ã¹/g, char: "ù", langs: ["French", "Italian"], desc: "ù double-encoded" },
  { pattern: /Ã»/g, char: "û", langs: ["French"], desc: "û double-encoded" },
  { pattern: /Ã¼/g, char: "ü", langs: ["German", "Turkish"], desc: "ü double-encoded" },
  { pattern: /Ã±/g, char: "ñ", langs: ["Spanish"], desc: "ñ double-encoded" },
  { pattern: /Ã/g, char: "Â", langs: ["General"], desc: "UTF-8 artifact" },
  { pattern: /Â/g, char: "", langs: ["General"], desc: "U+00A2 artifact" }
];

// ============================================================================
// ENCODING PATTERNS (from scan-encoding-issues.js)
// ============================================================================

const encodingPatterns = [
  { pattern: /[àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]/g, name: "Accented Latin characters" },
  { pattern: /[Ã¡Ã¢Ã£Ã¤Ã§Ã©ÃªÃ«Ã­Ã®Ã¯Ã³Ã´ÃµÃ¶ÃºÃ»Ã¼Ã±]/g, name: "UTF-8 double encoding (Portuguese/Spanish)" },
  { pattern: /[ÂÃ]/g, name: "UTF-8 artifacts (Ã series)" },
  { pattern: /Ä/g, name: "Potential encoding issue (Ä)" },
  { pattern: /['']/g, name: "Smart quote issues" },
  { pattern: /"/g, name: "Smart quote issues" }
];

// ============================================================================
// SCRIPT DETECTION
// ============================================================================

const scriptPatterns = [
  { range: /[\u0041-\u005A\u0061-\u007A]/, name: "Latin" },
  { range: /[\u0400-\u04FF]/, name: "Cyrillic" },
  { range: /[\u0370-\u03FF]/, name: "Greek" },
  { range: /[\u0600-\u06FF]/, name: "Arabic" },
  { range: /[\u0590-\u05FF]/, name: "Hebrew" },
  { range: /[\u0E00-\u0E7F]/, name: "Thai" },
  { range: /[\u4E00-\u9FFF]/, name: "CJK" },
  { range: /[\u0900-\u097F]/, name: "Devanagari" }
];

function detectScript(text) {
  for (const { range, name } of scriptPatterns) {
    if (range.test(text)) return name;
  }
  return "Latin";
}

// ============================================================================
// ANALYSIS FUNCTIONS
// ============================================================================

function scanFile(filePath, options) {
  const issues = [];
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split("\n");

  lines.forEach((line, lineNum) => {
    // Skip comments and structure lines
    if (line.trim().startsWith("//") || line.trim().startsWith("{") || line.trim().startsWith("}")) {
      return;
    }

    // Extract language entry
    const match = line.match(/\{"[^}]*"name":\s*"([^"]+)"[^}]*"b":\s*"([^"]+)"[^}]*\}/);
    if (!match) return;

    const languageName = match[1];
    const cities = match[2];

    // Check for mojibake patterns
    if (options.mojibake || options.deep) {
      mojibakePatterns.forEach(({ pattern, char, langs, desc }) => {
        if (pattern.test(cities)) {
          const isLanguageMatch = langs.some(lang => 
            languageName.toLowerCase().includes(lang.toLowerCase())
          );
          if (isLanguageMatch || options.deep) {
            issues.push({
              file: path.basename(filePath),
              line: lineNum + 1,
              language: languageName,
              type: "mojibake",
              pattern: desc,
              expected: char,
              severity: "critical",
              sample: cities.substring(0, 100)
            });
          }
        }
      });
    }

    // Check for general encoding patterns (shallow/deep)
    if (!options.mojibake || options.deep) {
      encodingPatterns.forEach(({ pattern, name }) => {
        if (pattern.test(line)) {
          issues.push({
            file: path.basename(filePath),
            line: lineNum + 1,
            language: languageName,
            type: "encoding",
            pattern: name,
            severity: "warning",
            sample: line.substring(0, 150)
          });
        }
      });
    }
  });

  return issues;
}

function analyzeFileStats(filePath) {
  const stats = {
    path: filePath,
    exists: false,
    size: 0,
    lineCount: 0,
    entries: 0,
    scripts: new Set()
  };

  if (!fs.existsSync(filePath)) {
    return stats;
  }

  stats.exists = true;
  const content = fs.readFileSync(filePath, "utf8");
  stats.size = content.length;
  const lines = content.split("\n");
  stats.lineCount = lines.length;

  lines.forEach(line => {
    if (line.includes('"name":')) {
      stats.entries++;

      const nameMatch = line.match(/"name":\s*"([^"]+)"/);
      if (nameMatch) {
        stats.scripts.add(detectScript(nameMatch[1]));
      }
    }
  });

  stats.scripts = [...stats.scripts];
  return stats;
}

function groupIssuesByType(issues) {
  const byType = {};
  issues.forEach(issue => {
    if (!byType[issue.type]) byType[issue.type] = [];
    byType[issue.type].push(issue);
  });
  return byType;
}

function groupIssuesByFile(issues) {
  const byFile = {};
  issues.forEach(issue => {
    if (!byFile[issue.file]) byFile[issue.file] = [];
    byFile[issue.file].push(issue);
  });
  return byFile;
}

// ============================================================================
// MAIN
// ============================================================================

function main() {
  const args = process.argv.slice(2);

  // Parse options
  const options = {
    brief: args.includes("--brief"),
    detailed: args.includes("--detailed") || !args.includes("--brief") && !args.includes("--shallow"),
    shallow: args.includes("--shallow"),
    deep: args.includes("--deep"),
    mojibake: args.includes("--mojibake"),
    scripts: args.includes("--scripts"),
    json: args.includes("--json"),
    output: args.find(a => a.startsWith("--output="))?.split("=")[1],
    help: args.includes("--help") || args.includes("-h")
  };

  // Determine scan mode
  if (options.mojibake) {
    // Mojibake-focused mode
  } else if (options.shallow && !options.deep) {
    // Shallow mode - basic checks only
  } else if (options.deep) {
    // Deep mode - all checks
  } else if (!options.shallow && !options.deep && !options.mojibake) {
    // Default - standard checks
    options.deep = true;
  }

  if (options.help) {
    const scriptName = path.basename(__filename);
    console.log(`${scriptName} - Unified Encoding Issues Scanner\n`);
    console.log("Single tool for scanning namebase files for encoding problems.\n");
    console.log(`Usage: node tools/encoding/${scriptName} [options]\n`);
    console.log("Options:");
    console.log("  --brief           Show only summary statistics");
    console.log("  --detailed        Show detailed issue listings (default)");
    console.log("  --shallow         Quick scan for common issues only");
    console.log("  --deep            Deep scan including all pattern checks");
    console.log("  --mojibake        Focus on mojibake detection");
    console.log("  --scripts         Show script distribution analysis");
    console.log("  --json            Output in JSON format");
    console.log("  --output=FILE     Write results to file");
    console.log("  --help, -h        Show this help\n");
    console.log("Examples:");
    console.log(`  node tools/encoding/${scriptName}`);
    console.log(`  node tools/encoding/${scriptName} --deep --json`);
    console.log(`  node tools/encoding/${scriptName} --mojibake --output=encoding-report.json`);
    return;
  }

  console.log("=== UNIFIED ENCODING ISSUES SCANNER ===\n");

  let allIssues = [];
  const fileStats = [];

  // Scan all files
  namebaseFiles.forEach(file => {
    if (!fs.existsSync(path.join(root, file))) {
      console.log(`File not found: ${file}`);
      return;
    }

    console.log(`Scanning: ${file}`);
    const issues = scanFile(file, options);
    allIssues = allIssues.concat(issues);
    fileStats.push(analyzeFileStats(file));
    console.log(`  Found ${issues.length} issues\n`);
  });

  const results = {
    timestamp: new Date().toISOString(),
    options: {
      mode: options.mojibake ? "mojibake" : (options.shallow ? "shallow" : "deep"),
      filesScanned: namebaseFiles.length
    },
    summary: {
      totalIssues: allIssues.length,
      byType: Object.fromEntries(Object.entries(groupIssuesByType(allIssues)).map(([k, v]) => [k, v.length])),
      byFile: Object.fromEntries(Object.entries(groupIssuesByFile(allIssues)).map(([k, v]) => [k, v.length]))
    },
    fileStats,
    issues: options.detailed ? allIssues : undefined
  };

  // Script analysis
  if (options.scripts || options.detailed) {
    const allScripts = new Set();
    fileStats.forEach(f => f.scripts.forEach(s => allScripts.add(s)));
    results.summary.scripts = [...allScripts];
  }

  // Output
  if (options.json) {
    const output = JSON.stringify(results, null, 2);
    if (options.output) {
      fs.writeFileSync(path.join(root, options.output), output, "utf8");
      console.log(`\nOutput written to: ${options.output}`);
    } else {
      console.log(output);
    }
    return;
  }

  // Human-readable output
  console.log("=== SUMMARY ===\n");
  console.log(`Total issues found: ${results.summary.totalIssues}`);

  // By type
  console.log("\n--- BY TYPE ---\n");
  for (const [type, count] of Object.entries(results.summary.byType)) {
    console.log(`${type}: ${count}`);
  }

  // By file
  console.log("\n--- BY FILE ---\n");
  for (const [file, count] of Object.entries(results.summary.byFile)) {
    console.log(`${file}: ${count} issues`);
  }

  // File statistics
  console.log("\n--- FILE STATISTICS ---\n");
  fileStats.forEach(f => {
    console.log(`${f.path}:`);
    console.log(`  Size: ${(f.size / 1024).toFixed(2)} KB`);
    console.log(`  Lines: ${f.lineCount}`);
    console.log(`  Entries: ${f.entries}`);
    console.log(`  Scripts: ${f.scripts.join(", ")}`);
  });

  // Script distribution
  if (options.scripts) {
    console.log("\n--- SCRIPT DISTRIBUTION ---\n");
    console.log(`Scripts detected: ${results.summary.scripts.join(", ")}`);
  }

  // Detailed issues
  if (options.detailed && allIssues.length > 0) {
    console.log("\n--- DETAILED ISSUES (first 30) ---\n");
    allIssues.slice(0, 30).forEach((issue, idx) => {
      console.log(`${idx + 1}. [${issue.file}:${issue.line}] ${issue.language}`);
      console.log(`   Type: ${issue.type}, Pattern: ${issue.pattern}`);
      if (issue.expected) console.log(`   Expected: ${issue.expected}`);
      console.log(`   Sample: ${issue.sample.substring(0, 80)}...`);
      console.log("");
    });
  }

  // Final verdict
  console.log("=== FINAL VERDICT ===\n");
  if (results.summary.totalIssues === 0) {
    console.log("✅ No encoding issues detected!");
  } else {
    console.log(`❌ Found ${results.summary.totalIssues} encoding issues`);
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
  scanFile,
  analyzeFileStats,
  mojibakePatterns,
  encodingPatterns
};
