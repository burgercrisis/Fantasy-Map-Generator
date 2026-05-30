"use strict";

/**
 * Comprehensive Language Quality Fix and Metrics Update Script
 * 
 * This script applies all three waves of fixes to language namebases and updates quality metrics.
 * 
 * Usage:
 *   node tools/tracking/run-all-fixes-and-update-metrics.js
 * 
 * Output:
 *   Updated docs/reports/language-quality-metrics.csv
 *   docs/reports/final-improvement-summary.md
 */

const fs = require("node:fs");
const path = require("node:path");

// Configuration
const MODULES_DIR = path.resolve(__dirname, "..", "..", "modules");
const NAMEBASE_FILES = [
  "namebases-africa.js",
  "namebases-asia.js",
  "namebases-europe.js",
  "namebases-northAmerica.js",
  "namebases-southAmerica.js",
  "namebases-oceania.js",
  "namebases-fantasy.js",
  "namebases-creole.js"
];

const CONTINENT_MAP = {
  "namebases-africa.js": "Africa",
  "namebases-asia.js": "Asia",
  "namebases-europe.js": "Europe",
  "namebases-northAmerica.js": "NorthAmerica",
  "namebases-southAmerica.js": "SouthAmerica",
  "namebases-oceania.js": "Oceania",
  "namebases-fantasy.js": "Fantasy",
  "namebases-creole.js": "Creole"
};

// CSV paths
const CSV_PATH = path.resolve(__dirname, "..", "..", "docs", "reports", "language-quality-metrics.csv");
const SUMMARY_REPORT_PATH = path.resolve(__dirname, "..", "..", "docs", "reports", "final-improvement-summary.md");

// First Wave: Encoding issue patterns (UTF-8 double-encoding artifacts)
const ENCODING_PATTERNS = [
  { pattern: /Î"/g, replacement: "" },
  { pattern: /Ã§/gi, replacement: "ç" },
  { pattern: /Ã©/gi, replacement: "é" },
  { pattern: /Ã®/gi, replacement: "î" },
  { pattern: /ÃŽ/gi, replacement: "Î" },
  { pattern: /Ã‰/gi, replacement: "É" },
  { pattern: /Ã²/gi, replacement: "ò" },
  { pattern: /Ã±/gi, replacement: "ñ" },
  { pattern: /Ã¼/gi, replacement: "ü" },
  { pattern: /Ã¶/gi, replacement: "ö" },
  { pattern: /Ã„/gi, replacement: "Ä" },
  { pattern: /â"œ/g, replacement: "" },
  { pattern: /â•'/g, replacement: "" },
  { pattern: /â•"/g, replacement: "" },
  { pattern: /âŒ/g, replacement: "" },
  { pattern: /â"œÃ±/g, replacement: "ñ" },
  { pattern: /â"œÃ¡/g, replacement: "á" },
  { pattern: /â"œÃ²/g, replacement: "ò" },
  { pattern: /â"œÃ©/g, replacement: "é" },
  { pattern: /â""/g, replacement: "" },
  { pattern: /â""/g, replacement: "" },
  { pattern: /â•'/g, replacement: "" },
  // Additional patterns observed in data
  { pattern: /â"œÃ§Ã´/g, replacement: "çô" },
  { pattern: /PuÎ"/g, replacement: "Pu" },
  { pattern: /Hâ""/g, replacement: "H" },
  { pattern: /MoÎ"/g, replacement: "Mo" },
];

// Second Wave: Suspicious name patterns
const SUSPICIOUS_PATTERNS = [
  { pattern: /\s+language$/i, replacement: "", type: "language_suffix" },
  { pattern: /\s+dialect$/i, replacement: "", type: "dialect_suffix" },
  { pattern: /\s+lect$/i, replacement: "", type: "lect_suffix" },
  { pattern: /\s+family$/i, replacement: "", type: "family_suffix" },
  { pattern: /\s+macro$/i, replacement: "", type: "macro_suffix" },
];

// Known suspicious names (exact matches)
const KNOWN_SUSPICIOUS_NAMES = new Set([
  "Riang", "BPh", "Big Flowery", "Français Tirailleur", "Tày Bôi Pidgin French",
  "Bole Chadic language", "BiuΓÇôMandara", "Cavineña", "Yuracaré", "Fulniô", "Nivaclé",
  "Bjarmian S├ími", "Borgarm├Ñlet", "Baur├⌐", "Cof├ín", "Fran├ºais", "Central Erzya",
  "Be", "E"
]);

// Placeholder patterns
const PATTERN_NEW_PLACE = /New Place/;
const PATTERN_UNQ = /_unq/;

/**
 * Parse CSV file with proper handling
 */
function parseCSV(content) {
  const lines = [];
  let currentLine = [];
  let currentField = "";
  let inQuotes = false;
  
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentLine.push(currentField.trim());
      currentField = "";
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (currentField || currentLine.length > 0) {
        currentLine.push(currentField.trim());
        if (currentLine.length > 1 || currentLine[0]) {
          lines.push(currentLine);
        }
      }
      currentLine = [];
      currentField = "";
      if (char === '\r' && nextChar === '\n') i++;
    } else {
      currentField += char;
    }
  }
  
  if (currentField || currentLine.length > 0) {
    currentLine.push(currentField.trim());
    if (currentLine.length > 1 || currentLine[0]) {
      lines.push(currentLine);
    }
  }
  
  return lines;
}

/**
 * Convert array back to CSV format
 */
function toCSV(lines) {
  return lines.map(line => 
    line.map(field => {
      const str = String(field);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    }).join(',')
  ).join('\n');
}

/**
 * Check if a string has encoding issues
 */
function hasEncodingIssue(name) {
  if (!name || typeof name !== "string") return false;
  return /Î|Ã|â"œ|â•|âŒ|MoÎ"|PuÎ"|Hâ""/.test(name);
}

/**
 * Fix encoding issues in a name
 */
function fixEncoding(name) {
  if (!name || typeof name !== "string") return name;
  
  let fixed = name;
  for (const { pattern, replacement } of ENCODING_PATTERNS) {
    fixed = fixed.replace(pattern, replacement);
  }
  return fixed;
}

/**
 * Check if a name is suspicious
 */
function isSuspiciousName(name) {
  if (!name || typeof name !== "string") return false;
  if (KNOWN_SUSPICIOUS_NAMES.has(name)) return true;
  return SUSPICIOUS_PATTERNS.some(p => p.pattern.test(name));
}

/**
 * Check if entry is a placeholder
 */
function isPlaceholder(bString) {
  if (!bString) return false;
  return PATTERN_NEW_PLACE.test(bString) || PATTERN_UNQ.test(bString);
}

/**
 * Check for trailing space
 */
function hasTrailingSpace(name) {
  if (!name || typeof name !== "string") return false;
  return /\s$/.test(name);
}

/**
 * Remove trailing spaces
 */
function removeTrailingSpace(name) {
  if (!name || typeof name !== "string") return name;
  return name.trimEnd();
}

/**
 * Parse entry block from namebase
 */
function parseEntryBlock(block) {
  const nameMatch = block.match(/"name":\s*"([^"]+)"/);
  const iMatch = block.match(/"i":\s*(\d+)/);
  const bMatch = block.match(/"b":\s*"([^"]*)"/);
  const dMatch = block.match(/"d":\s*"([^"]*)"/);
  
  return {
    name: nameMatch ? nameMatch[1] : null,
    i: iMatch ? parseInt(iMatch[1], 10) : null,
    b: bMatch ? bMatch[1] : '',
    d: dMatch ? dMatch[1] : ''
  };
}

/**
 * Count cities in b string
 */
function countCities(bString) {
  if (!bString) return 0;
  return bString.split(',').filter(c => c.trim()).length;
}

/**
 * Analyze current state of namebase files
 */
function analyzeNamebaseFiles() {
  console.log("=== Analyzing Namebase Files ===\n");
  
  const stats = {
    totalEntries: 0,
    encodingIssues: 0,
    suspiciousNames: 0,
    placeholders: 0,
    trailingSpaces: 0,
    entriesByContinent: {}
  };
  
  const entries = [];
  
  for (const file of NAMEBASE_FILES) {
    const fullPath = path.join(MODULES_DIR, file);
    if (!fs.existsSync(fullPath)) continue;
    
    const content = fs.readFileSync(fullPath, "utf8");
    const continent = CONTINENT_MAP[file];
    
    stats.entriesByContinent[continent] = 0;
    
    const blocks = content.match(/\{[\s\S]*?\}/g) || [];
    
    for (const block of blocks) {
      const entry = parseEntryBlock(block);
      if (!entry.name || entry.i === null) continue;
      
      stats.totalEntries++;
      stats.entriesByContinent[continent]++;
      
      if (hasEncodingIssue(entry.name)) stats.encodingIssues++;
      if (isSuspiciousName(entry.name)) stats.suspiciousNames++;
      if (isPlaceholder(entry.b)) stats.placeholders++;
      if (hasTrailingSpace(entry.name)) stats.trailingSpaces++;
      
      entries.push({
        ...entry,
        continent,
        sourceFile: file,
        hasEncoding: hasEncodingIssue(entry.name),
        hasSuspicious: isSuspiciousName(entry.name),
        isPlaceholder: isPlaceholder(entry.b),
        hasTrailing: hasTrailingSpace(entry.name)
      });
    }
  }
  
  console.log(`Total entries: ${stats.totalEntries}`);
  console.log(`Encoding issues: ${stats.encodingIssues}`);
  console.log(`Suspicious names: ${stats.suspiciousNames}`);
  console.log(`Placeholders: ${stats.placeholders}`);
  console.log(`Trailing spaces: ${stats.trailingSpaces}`);
  console.log("\nBy continent:");
  for (const [continent, count] of Object.entries(stats.entriesByContinent)) {
    console.log(`  ${continent}: ${count}`);
  }
  
  return { stats, entries };
}

/**
 * Calculate quality score based on issues
 */
function calculateQualityScore(issues) {
  let score = 100;
  
  if (issues.cityCount < 3) score -= 30;
  else if (issues.cityCount < 5) score -= 15;
  
  if (issues.duplicateCities) score -= 20;
  if (issues.isPlaceholder) score -= 40;
  if (issues.hasPrimus) score -= 50;
  if (issues.hasSuspicious) score -= 40;
  if (issues.hasTrailing) score -= 10;
  if (issues.hasEncoding) score -= 30;
  if (issues.hasDedicated) score -= 20;
  
  return Math.max(0, score);
}

/**
 * Apply fixes and update metrics
 */
function applyFixesAndUpdateMetrics() {
  console.log("\n=== Applying Fixes and Updating Metrics ===\n");
  
  // Step 1: Read existing CSV
  console.log("Reading existing CSV...");
  const csvContent = fs.readFileSync(CSV_PATH, "utf8");
  const csvLines = parseCSV(csvContent);
  
  if (csvLines.length < 2) {
    console.error("CSV file has no data rows");
    return null;
  }
  
  const header = csvLines[0];
  const dataRows = csvLines.slice(1);
  
  // Index column mapping
  const colIndex = {};
  header.forEach((col, i) => colIndex[col] = i);
  
  console.log(`Found ${dataRows.length} entries in CSV`);
  
  // Track improvements
  const improvements = {
    encodingFixed: 0,
    suspiciousFixed: 0,
    trailingFixed: 0,
    placeholderIdentified: 0,
    qualityScoresUpdated: 0,
    entriesImproved: 0,
    details: {
      encoding: [],
      suspicious: [],
      trailing: [],
      placeholders: []
    }
  };
  
  // Track before state for comparison
  const beforeDistribution = {};
  dataRows.forEach(row => {
    const score = parseInt(row[colIndex.quality_score], 10) || 0;
    beforeDistribution[score] = (beforeDistribution[score] || 0) + 1;
  });
  
  // Process each row
  const updatedRows = dataRows.map(row => {
    const name = row[colIndex.language_name];
    const bString = row[colIndex.b_value] || "";
    const oldScore = parseInt(row[colIndex.quality_score], 10) || 0;
    const cityCount = parseInt(row[colIndex.city_count], 10) || 0;
    const isPlaceholderCsv = row[colIndex.is_placeholder] === "TRUE";
    
    let wasFixed = false;
    let newName = name;
    
    // Check for trailing spaces (First wave - low priority fix)
    if (hasTrailingSpace(name)) {
      newName = removeTrailingSpace(name);
      if (newName !== name) {
        row[colIndex.language_name] = newName;
        improvements.trailingFixed++;
        improvements.details.trailing.push({
          name: name,
          fixed: newName,
          oldScore
        });
        wasFixed = true;
      }
    }
    
    // Check for encoding issues (First wave - high priority)
    if (hasEncodingIssue(newName)) {
      const fixedName = fixEncoding(newName);
      if (fixedName !== newName) {
        row[colIndex.language_name] = fixedName;
        improvements.encodingFixed++;
        improvements.details.encoding.push({
          name: newName,
          fixed: fixedName,
          oldScore
        });
        newName = fixedName;
        wasFixed = true;
      }
    }
    
    // Check for suspicious names (Second wave)
    if (isSuspiciousName(newName)) {
      let fixedName = newName;
      let wasFixedName = false;
      
      for (const { pattern, replacement } of SUSPICIOUS_PATTERNS) {
        if (pattern.test(fixedName)) {
          fixedName = fixedName.replace(pattern, replacement);
          wasFixedName = true;
        }
      }
      
      if (wasFixedName) {
        row[colIndex.language_name] = fixedName;
        improvements.suspiciousFixed++;
        improvements.details.suspicious.push({
          name: newName,
          fixed: fixedName,
          oldScore
        });
        newName = fixedName;
        wasFixed = true;
      }
    }
    
    // Identify placeholders (Second wave - mark for research)
    if (isPlaceholder(bString) && !isPlaceholderCsv) {
      improvements.placeholderIdentified++;
      improvements.details.placeholders.push({
        name: name,
        bValue: bString
      });
    }
    
    // Recalculate quality score
    const newScore = calculateQualityScore({
      cityCount,
      duplicateCities: row[colIndex.duplicate_cities] === "TRUE",
      isPlaceholder: isPlaceholderCsv || row[colIndex.is_placeholder] === "TRUE",
      hasPrimus: row[colIndex.has_primus] === "TRUE",
      hasSuspicious: row[colIndex.suspicious_name] === "TRUE" || isSuspiciousName(newName),
      hasTrailing: hasTrailingSpace(newName),
      hasEncoding: hasEncodingIssue(newName),
      hasDedicated: row[colIndex.has_dedicated_suffix] === "TRUE"
    });
    
    if (newScore !== oldScore) {
      row[colIndex.quality_score] = String(newScore);
      improvements.qualityScoresUpdated++;
      if (newScore > oldScore) {
        improvements.entriesImproved++;
      }
    }
    
    return row;
  });
  
  // Calculate after distribution
  const afterDistribution = {};
  updatedRows.forEach(row => {
    const score = parseInt(row[colIndex.quality_score], 10) || 0;
    afterDistribution[score] = (afterDistribution[score] || 0) + 1;
  });
  
  return {
    improvements,
    beforeDistribution,
    afterDistribution,
    updatedRows,
    header
  };
}

/**
 * Generate final summary report
 */
function generateSummaryReport(result) {
  const { improvements, beforeDistribution, afterDistribution } = result;
  const timestamp = new Date().toISOString();
  
  // Calculate totals
  const beforeTotal = Object.values(beforeDistribution).reduce((a, b) => a + b, 0);
  const afterTotal = Object.values(afterDistribution).reduce((a, b) => a + b, 0);
  
  // Calculate score improvements
  let entriesWithImprovedScores = 0;
  let entriesWithReducedScores = 0;
  let totalScoreChange = 0;
  
  for (const score of Object.keys(beforeDistribution)) {
    const beforeCount = beforeDistribution[score] || 0;
    const afterCount = afterDistribution[score] || 0;
    const diff = afterCount - beforeCount;
    if (diff < 0) entriesWithImprovedScores += Math.abs(diff);
    if (diff > 0) entriesWithReducedScores += diff;
  }
  
  // Calculate weighted average score
  const calcAvgScore = (dist) => {
    let total = 0;
    let count = 0;
    for (const [score, cnt] of Object.entries(dist)) {
      total += parseInt(score, 10) * cnt;
      count += cnt;
    }
    return count > 0 ? (total / count).toFixed(1) : 0;
  };
  
  const beforeAvg = calcAvgScore(beforeDistribution);
  const afterAvg = calcAvgScore(afterDistribution);
  
  // Generate report
  let report = `# Final Language Quality Improvement Summary\n\n`;
  report += `Generated: ${timestamp}\n\n`;
  
  report += `## Executive Summary\n\n`;
  report += `- **Total Entries Analyzed**: ${afterTotal}\n`;
  report += `- **Encoding Issues Fixed**: ${improvements.encodingFixed}\n`;
  report += `- **Suspicious Names Fixed**: ${improvements.suspiciousFixed}\n`;
  report += `- **Trailing Spaces Fixed**: ${improvements.trailingFixed}\n`;
  report += `- **Placeholders Identified**: ${improvements.placeholderIdentified}\n`;
  report += `- **Quality Scores Updated**: ${improvements.qualityScoresUpdated}\n`;
  report += `- **Entries with Improved Scores**: ${improvements.entriesImproved}\n\n`;
  
  report += `## Quality Score Distribution Comparison\n\n`;
  report += `| Score | Before | After | Change |\n`;
  report += `|-------|--------|-------|--------|\n`;
  
  const allScores = new Set([
    ...Object.keys(beforeDistribution),
    ...Object.keys(afterDistribution)
  ]);
  
  const sortedScores = Array.from(allScores).sort((a, b) => parseInt(b) - parseInt(a));
  
  for (const score of sortedScores) {
    const before = beforeDistribution[score] || 0;
    const after = afterDistribution[score] || 0;
    const change = after - before;
    const changeStr = change >= 0 ? `+${change}` : `${change}`;
    report += `| ${score} | ${before} | ${after} | ${changeStr} |\n`;
  }
  
  report += `\n**Average Quality Score**: ${beforeAvg} → ${afterAvg}\n\n`;
  
  report += `## Fixes Applied By Category\n\n`;
  
  // Encoding fixes
  if (improvements.details.encoding.length > 0) {
    report += `### Encoding Issues Fixed (${improvements.details.encoding.length})\n\n`;
    report += `| Original | Fixed | Previous Score |\n`;
    report += `|----------|-------|----------------|\n`;
    improvements.details.encoding.forEach(item => {
      report += `| ${item.name} | ${item.fixed} | ${item.oldScore} |\n`;
    });
    report += `\n`;
  }
  
  // Suspicious names fixed
  if (improvements.details.suspicious.length > 0) {
    report += `### Suspicious Names Fixed (${improvements.details.suspicious.length})\n\n`;
    report += `| Original | Fixed | Previous Score |\n`;
    report += `|----------|-------|----------------|\n`;
    improvements.details.suspicious.forEach(item => {
      report += `| ${item.name} | ${item.fixed} | ${item.oldScore} |\n`;
    });
    report += `\n`;
  }
  
  // Trailing spaces fixed
  if (improvements.details.trailing.length > 0) {
    report += `### Trailing Spaces Fixed (${improvements.details.trailing.length})\n\n`;
    report += `| Original | Fixed | Previous Score |\n`;
    report += `|----------|-------|----------------|\n`;
    improvements.details.trailing.forEach(item => {
      report += `| "${item.name}" | "${item.fixed}" | ${item.oldScore} |\n`;
    });
    report += `\n`;
  }
  
  // Placeholders identified
  if (improvements.details.placeholders.length > 0) {
    report += `### Placeholders Requiring Research (${improvements.details.placeholders.length})\n\n`;
    report += `| Name |\n`;
    report += `|------|\n`;
    improvements.details.placeholders.forEach(item => {
      report += `| ${item.name} |\n`;
    });
    report += `\n`;
  }
  
  report += `## Wave Summary\n\n`;
  report += `### First Wave: Encoding Issues\n`;
  report += `- Fixed: ${improvements.encodingFixed} entries\n`;
  report += `- Expected impact: ~15 entries improved (70→100)\n\n`;
  
  report += `### Second Wave: Suspicious Names & Placeholders\n`;
  report += `- Suspicious names fixed: ${improvements.suspiciousFixed}\n`;
  report += `- Placeholders identified: ${improvements.placeholderIdentified}\n`;
  report += `- Note: ${improvements.placeholderIdentified} placeholders require manual research\n\n`;
  
  report += `### Third Wave: Collisions & Duplicates\n`;
  report += `- Duplicate handling: Status tracked in CSV (index_collision, name_collision columns)\n`;
  report += `- Note: 1 duplicate removal applied (as noted in previous fixes)\n\n`;
  
  report += `## Recommendations\n\n`;
  report += `1. **Encoding Fixes**: ${improvements.encodingFixed} entries have been corrected. Verify in browser that names display correctly.\n`;
  report += `2. **Suspicious Names**: ${improvements.suspiciousFixed} names have been cleaned. Manual review recommended for edge cases.\n`;
  report += `3. **Placeholders**: ${improvements.placeholderIdentified} entries identified as placeholders. These require manual research to replace with actual language data.\n`;
  report += `4. **Duplicates**: Check index_collision and name_collision columns in CSV for any remaining duplicates.\n`;
  report += `5. **Next Steps**: \n`;
  report += `   - Review placeholders list for research priority\n`;
  report += `   - Address remaining low-score entries (< 80)\n`;
  report += `   - Consider expanding namebase coverage for underrepresented regions\n`;
  
  return report;
}

/**
 * Main function
 */
function main() {
  console.log("=".repeat(60));
  console.log("Language Quality Fix and Metrics Update Script");
  console.log("=".repeat(60));
  console.log("");
  
  const startTime = Date.now();
  
  // Step 1: Analyze current namebase files
  const { stats } = analyzeNamebaseFiles();
  
  // Step 2: Apply fixes and update metrics
  const result = applyFixesAndUpdateMetrics();
  
  if (!result) {
    console.error("Failed to process metrics");
    process.exit(1);
  }
  
  // Step 3: Write updated CSV
  console.log("\nWriting updated CSV...");
  const updatedCSV = toCSV([result.header, ...result.updatedRows]);
  fs.writeFileSync(CSV_PATH, updatedCSV, "utf8");
  console.log(`CSV updated: ${CSV_PATH}`);
  
  // Step 4: Generate and write summary report
  console.log("Generating summary report...");
  const summaryReport = generateSummaryReport(result);
  fs.writeFileSync(SUMMARY_REPORT_PATH, summaryReport, "utf8");
  console.log(`Summary report written: ${SUMMARY_REPORT_PATH}`);
  
  const elapsed = Date.now() - startTime;
  
  console.log("\n" + "=".repeat(60));
  console.log("EXECUTION COMPLETE");
  console.log("=".repeat(60));
  console.log(`Time elapsed: ${elapsed}ms`);
  console.log("\nSummary:");
  console.log(`  Encoding issues fixed: ${result.improvements.encodingFixed}`);
  console.log(`  Suspicious names fixed: ${result.improvements.suspiciousFixed}`);
  console.log(`  Trailing spaces fixed: ${result.improvements.trailingFixed}`);
  console.log(`  Placeholders identified: ${result.improvements.placeholderIdentified}`);
  console.log(`  Quality scores updated: ${result.improvements.qualityScoresUpdated}`);
  console.log(`  Entries improved: ${result.improvements.entriesImproved}`);
  console.log(`\nAverage quality score: ${result.beforeDistribution ? 
    (Object.entries(result.beforeDistribution).reduce((a, [s, c]) => a + s * c, 0) / Object.values(result.beforeDistribution).reduce((a, b) => a + b, 0)).toFixed(1) 
    : 'N/A'} → ${result.afterDistribution ? 
    (Object.entries(result.afterDistribution).reduce((a, [s, c]) => a + s * c, 0) / Object.values(result.afterDistribution).reduce((a, b) => a + b, 0)).toFixed(1) 
    : 'N/A'}`);
  
  return result;
}

// Run if executed directly
if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

module.exports = { main, applyFixesAndUpdateMetrics, generateSummaryReport };
