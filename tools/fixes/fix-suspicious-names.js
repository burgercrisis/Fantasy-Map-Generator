"use strict";

/**
 * Comprehensive Fix Script for Suspicious Names and Placeholders
 * 
 * Fixes the following issues:
 * 1. Removes " language" suffix from entries
 * 2. Removes "dialect" suffix from entries
 * 3. Removes "family" suffix from entries
 * 4. Removes "lect" suffix from entries
 * 5. Removes "macro" suffix from entries
 * 6. Handles special cases (Nâma, ǂʼAmkoe)
 * 7. Identifies placeholders marked with (dedicated) or (setBases aux)
 */

const fs = require("node:fs");
const path = require("node:path");

// Configuration
const SOURCE_FILE = path.join(__dirname, "..", "..", "data", "temp_real_languages.js");
const OUTPUT_FILE = path.join(__dirname, "..", "..", "data", "temp_real_languages_fixed.js");
const REPORT_FILE = path.join(__dirname, "..", "..", "docs", "reports", "name-fixes-report.md");
const PLACEHOLDER_REPORT = path.join(__dirname, "..", "..", "docs", "reports", "placeholder-research-needed.md");

// Patterns to fix
const FIX_PATTERNS = [
  { suffix: " language", replacement: "", description: "Remove 'language' suffix" },
  { suffix: " Language", replacement: "", description: "Remove 'Language' suffix" },
  { suffix: " dialect", replacement: "", description: "Remove 'dialect' suffix" },
  { suffix: " Dialect", replacement: "", description: "Remove 'Dialect' suffix" },
  { suffix: " family", replacement: "", description: "Remove 'family' suffix" },
  { suffix: " Family", replacement: "", description: "Remove 'Family' suffix" },
  { suffix: " lect", replacement: "", description: "Remove 'lect' suffix" },
  { suffix: " Lect", replacement: "", description: "Remove 'Lect' suffix" },
  { suffix: " macro", replacement: "", description: "Remove 'macro' suffix" },
  { suffix: " Macro", replacement: "", description: "Remove 'Macro' suffix" },
];

// Special cases that should NOT be modified
const SPECIAL_CASES = [
  "Nâma",           // Valid name with special character
  "ǂʼAmkoe",        // Valid click language name with proper consonants
  "Gǃui",           // Valid click language
  "Juǃhoan",        // Valid click language
  "Taa",            // Valid click language
  "Kxʼa",           // Valid click language
];

// Placeholder markers
const PLACEHOLDER_MARKERS = [
  "(dedicated)",
  "(setBases aux)",
];

// Stats tracking
const stats = {
  namesFixed: 0,
  placeholdersFound: 0,
  specialCasesKept: 0,
  issuesRequiringManualAttention: [],
};

/**
 * Main execution function
 */
function main() {
  console.log("Starting comprehensive name fix script...\n");

  try {
    // Read source file
    console.log(`Reading source file: ${SOURCE_FILE}`);
    const sourceContent = fs.readFileSync(SOURCE_FILE, "utf8");
    
    // Parse the namebase entries
    const entries = parseEntries(sourceContent);
    console.log(`Found ${entries.length} namebase entries\n`);

    // Process each entry
    const processedEntries = entries.map((entry, index) => {
      return processEntry(entry, index);
    });

    // Generate reports
    const fixesReport = generateFixesReport(processedEntries);
    const placeholderReport = generatePlaceholderReport(processedEntries);
    const manualIssuesReport = generateManualIssuesReport(processedEntries);

    // Write output file
    const outputContent = generateOutputFile(processedEntries);
    fs.writeFileSync(OUTPUT_FILE, outputContent, "utf8");
    console.log(`\nFixed file written to: ${OUTPUT_FILE}`);

    // Write reports
    fs.writeFileSync(REPORT_FILE, fixesReport, "utf8");
    console.log(`Fixes report written to: ${REPORT_FILE}`);

    fs.writeFileSync(PLACEHOLDER_REPORT, placeholderReport, "utf8");
    console.log(`Placeholder report written to: ${PLACEHOLDER_REPORT}`);

    // Print summary
    printSummary();

  } catch (error) {
    console.error("Error executing fix script:", error);
    process.exit(1);
  }
}

/**
 * Parse namebase entries from source file
 */
function parseEntries(content) {
  const entries = [];
  
  // Extract entries using regex pattern matching
  const entryPattern = /\{\s*name:\s*"([^"]+)",\s*i:\s*(\d+),[^}]*b:\s*"([^"]*)"\s*\}/g;
  let match;
  
  while ((match = entryPattern.exec(content)) !== null) {
    entries.push({
      name: match[1],
      index: parseInt(match[2]),
      bases: match[3].split(",").filter(b => b.trim()),
      lineMatch: match[0],
      lineNumber: getLineNumber(content, match.index)
    });
  }
  
  return entries;
}

/**
 * Get line number from content position
 */
function getLineNumber(content, position) {
  return content.substring(0, position).split("\n").length;
}

/**
 * Process a single namebase entry
 */
function processEntry(entry, index) {
  const processed = {
    ...entry,
    originalName: entry.name,
    fixedName: entry.name,
    changes: [],
    isPlaceholder: false,
    requiresManualAttention: false,
    manualAttentionReason: ""
  };

  // Check for special cases
  if (SPECIAL_CASES.includes(entry.name)) {
    processed.specialCasesKept = true;
    return processed;
  }

  // Check for placeholder markers
  for (const marker of PLACEHOLDER_MARKERS) {
    if (entry.name.includes(marker)) {
      processed.isPlaceholder = true;
      stats.placeholdersFound++;
      return processed;
    }
  }

  // Apply fix patterns
  for (const pattern of FIX_PATTERNS) {
    if (entry.name.endsWith(pattern.suffix)) {
      processed.fixedName = entry.name.replace(new RegExp(pattern.suffix + "$"), pattern.replacement);
      processed.changes.push({
        type: pattern.description,
        from: entry.name,
        to: processed.fixedName
      });
      stats.namesFixed++;
      break; // Only apply one fix per entry
    }
  }

  // Special handling for ǂʼAmkoe (index 20319, quality_score=70)
  if (entry.name === "ǂʼAmkoe" || entry.name.includes("Amkoe")) {
    if (entry.index === 20319) {
      if (entry.name !== "ǂʼAmkoe") {
        processed.fixedName = "ǂʼAmkoe";
        processed.changes.push({
          type: "Correct click consonant spelling",
          from: entry.name,
          to: processed.fixedName
        });
        stats.namesFixed++;
      }
    } else {
      // Check for duplicates
      processed.requiresManualAttention = true;
      processed.manualAttentionReason = `Potential duplicate of ǂʼAmkoe at index ${entry.index}`;
      stats.issuesRequiringManualAttention.push({
        entry,
        reason: processed.manualAttentionReason
      });
    }
  }

  // Check for very high indices (20000+) that may indicate issues
  if (entry.index >= 20000) {
    processed.highIndexWarning = true;
    if (processed.fixedName !== entry.originalName || processed.changes.length === 0) {
      // If we fixed something with high index, flag for review
      processed.requiresManualAttention = true;
      processed.manualAttentionReason = `High index ${entry.index} with potential issues - needs verification`;
      stats.issuesRequiringManualAttention.push({
        entry,
        reason: processed.manualAttentionReason
      });
    }
  }

  return processed;
}

/**
 * Generate fixes report
 */
function generateFixesReport(processedEntries) {
  let report = `# Name Fixes Report\n\n`;
  report += `Generated: ${new Date().toISOString()}\n\n`;
  
  const fixedEntries = processedEntries.filter(e => e.changes && e.changes.length > 0);
  report += `## Summary\n\n`;
  report += `- Total entries processed: ${processedEntries.length}\n`;
  report += `- Entries fixed: ${fixedEntries.length}\n`;
  report += `- Placeholders identified: ${stats.placeholdersFound}\n\n`;

  report += `## Fixed Entries\n\n`;
  report += `| Original Name | Fixed Name | Type | Index |\n`;
  report += `|--------------|-----------|------|-------|\n`;
  
  for (const entry of fixedEntries) {
    for (const change of entry.changes) {
      report += `| ${change.from} | ${change.to} | ${change.type} | ${entry.index} |\n`;
    }
  }

  report += `\n## Special Cases (Not Modified)\n\n`;
  for (const special of SPECIAL_CASES) {
    report += `- ${special}\n`;
  }

  return report;
}

/**
 * Generate placeholder report for research
 */
function generatePlaceholderReport(processedEntries) {
  const placeholders = processedEntries.filter(e => e.isPlaceholder);
  
  let report = `# Placeholder Research Needed\n\n`;
  report += `Generated: ${new Date().toISOString()}\n\n`;
  
  report += `## Summary\n\n`;
  report += `Total placeholders requiring research: ${placeholders.length}\n\n`;
  
  report += `## Placeholder List\n\n`;
  report += `Each placeholder needs:\n`;
  report += `- Actual language name data\n`;
  report += `- Proper cultural authenticity verification\n`;
  report += `- Geographic region validation\n\n`;
  
  report += `| Index | Placeholder Name | Bases Count |\n`;
  report += `|-------|-----------------|-------------|\n`;
  
  for (const entry of placeholders) {
    report += `| ${entry.index} | ${entry.originalName} | ${entry.bases.length} |\n`;
  }

  report += `\n## Detailed Information\n\n`;
  
  for (const entry of placeholders) {
    report += `### ${entry.originalName} (Index: ${entry.index})\n\n`;
    report += `**Current bases:**\n`;
    if (entry.bases.length > 0) {
      for (const base of entry.bases.slice(0, 10)) {
        report += `- ${base}\n`;
      }
      if (entry.bases.length > 10) {
        report += `- ... and ${entry.bases.length - 10} more\n`;
      }
    } else {
      report += `- No bases defined\n`;
    }
    report += `\n**Research needed:**\n`;
    report += `- [ ] Verify actual language name\n`;
    report += `- [ ] Confirm cultural authenticity\n`;
    report += `- [ ] Validate geographic region\n`;
    report += `- [ ] Check for duplicates\n`;
    report += `- [ ] Review naming conventions\n\n`;
  }

  return report;
}

/**
 * Generate manual issues report
 */
function generateManualIssuesReport(processedEntries) {
  const manualIssues = processedEntries.filter(e => e.requiresManualAttention);
  
  let report = `# Manual Attention Required\n\n`;
  report += `Generated: ${new Date().toISOString()}\n\n`;
  
  report += `## Summary\n\n`;
  report += `Total issues requiring manual attention: ${manualIssues.length}\n\n`;
  
  report += `## Issues by Category\n\n`;
  
  // Group by reason
  const byReason = {};
  for (const entry of manualIssues) {
    const reason = entry.manualAttentionReason;
    if (!byReason[reason]) {
      byReason[reason] = [];
    }
    byReason[reason].push(entry);
  }
  
  for (const [reason, entries] of Object.entries(byReason)) {
    report += `### ${reason}\n\n`;
    for (const entry of entries) {
      report += `- **${entry.originalName}** (Index: ${entry.index})\n`;
      report += `  - Bases: ${entry.bases.length} defined\n`;
      if (entry.bases.length > 0) {
        report += `  - Sample: ${entry.bases.slice(0, 3).join(", ")}\n`;
      }
    }
    report += `\n`;
  }

  report += `## ǂʼAmkoe Specific Issues\n\n`;
  const amkoeEntries = processedEntries.filter(e => 
    e.originalName.includes("Amkoe") || e.originalName.includes("amkoe")
  );
  
  if (amkoeEntries.length > 0) {
    for (const entry of amkoeEntries) {
      report += `### Index ${entry.index}: ${entry.originalName}\n\n`;
      report += `**Quality Score:** 70 (indicates potential issues)\n\n`;
      report += `**Bases:** ${entry.bases.length} defined\n`;
      if (entry.bases.length > 0) {
        report += `**Sample bases:**\n`;
        for (const base of entry.bases.slice(0, 5)) {
          report += `- ${base}\n`;
        }
      }
      report += `\n**Verification needed:**\n`;
      report += `- [ ] Confirm this is a valid language name\n`;
      report += `- [ ] Check for duplicate entries\n`;
      report += `- [ ] Verify click consonant representation\n`;
      report += `- [ ] Validate geographic authenticity\n\n`;
    }
  } else {
    report += `No ǂʼAmkoe entries found with quality_score=70 issues.\n\n`;
  }

  return report;
}

/**
 * Generate output file content
 */
function generateOutputFile(processedEntries) {
  let output = `"use strict";\n\n`;
  output += `window.realWorldNameBases = [\n`;
  
  for (let i = 0; i < processedEntries.length; i++) {
    const entry = processedEntries[i];
    const name = entry.isPlaceholder ? entry.originalName : entry.fixedName;
    const bases = entry.bases.join(",");
    
    output += `  {name: "${name}", i: ${entry.index}, min: 4, max: 12, d: "lnrt", m: 0, b: "${bases}"}${i < processedEntries.length - 1 ? "," : ""}\n`;
  }
  
  output += `];\n`;
  
  return output;
}

/**
 * Print summary to console
 */
function printSummary() {
  console.log("\n" + "=".repeat(60));
  console.log("FIX SCRIPT COMPLETED SUCCESSFULLY");
  console.log("=".repeat(60));
  console.log(`\nResults:`);
  console.log(`  - Suspicious names fixed: ${stats.namesFixed}`);
  console.log(`  - Placeholders identified for research: ${stats.placeholdersFound}`);
  console.log(`  - Special cases preserved: ${SPECIAL_CASES.length}`);
  console.log(`  - Issues requiring manual attention: ${stats.issuesRequiringManualAttention.length}`);
  
  if (stats.issuesRequiringManualAttention.length > 0) {
    console.log(`\nManual attention issues:`);
    for (const issue of stats.issuesRequiringManualAttention) {
      console.log(`  - ${issue.entry.originalName} (${issue.reason})`);
    }
  }
  
  console.log(`\nOutput files:`);
  console.log(`  - ${OUTPUT_FILE}`);
  console.log(`  - ${REPORT_FILE}`);
  console.log(`  - ${PLACEHOLDER_REPORT}`);
}

// Export for testing
module.exports = {
  FIX_PATTERNS,
  SPECIAL_CASES,
  PLACEHOLDER_MARKERS,
  processEntry,
  parseEntries,
  generateFixesReport,
  generatePlaceholderReport,
  generateManualIssuesReport
};

// Run if executed directly
if (require.main === module) {
  main();
}
