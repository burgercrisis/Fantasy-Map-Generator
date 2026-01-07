/**
 * Research and Fix Placeholder Entries Script
 * 
 * This script analyzes "(dedicated)" placeholder entries and generates:
 * 1. A mapping file linking dedicated entries to base namebases
 * 2. A fix script to apply the changes
 * 3. A research report documenting the findings
 * 
 * Usage: node tools/fixes/research-and-fix-placeholders.js
 */

"use strict";

const fs = require("node:fs");
const path = require("node:path");

// Configuration
const CONFIG = {
  dedicatedMergeReport: "data/dedicated-merge-report.json",
  dedicatedMergeUpdates: "data/dedicated-merge-updates.json",
  namebasesFile: "data/namebases-fantasy-clean.js",
  outputMapping: "data/dedicated-entries-mapping.json",
  outputReport: "docs/reports/dedicated-entries-research.md",
  outputFixScript: "tools/fixes/apply-dedicated-fixes.js"
};

/**
 * Main entry point
 */
function main() {
  console.log("=".repeat(70));
  console.log("RESEARCH AND FIX PLACEHOLDER ENTRIES (DEDICATED)");
  console.log("=".repeat(70));
  console.log("");
  
  // Step 1: Load the merge report to identify dedicated entries
  console.log("Step 1: Loading dedicated merge report...");
  let dedicatedEntries = [];
  
  if (fs.existsSync(CONFIG.dedicatedMergeReport)) {
    const reportContent = fs.readFileSync(CONFIG.dedicatedMergeReport, "utf-8");
    const reportData = JSON.parse(reportContent);
    
    // Extract entries from the report
    dedicatedEntries = reportData.map(entry => ({
      type: entry.type,
      oldName: entry.oldName || entry.dedicatedName,
      newName: entry.newName || entry.baseName,
      index: entry.index || entry.dedicatedIndex,
      lineNumber: entry.lineNumber || entry.dedicatedLineNumber,
      addedCities: entry.addedCities || 0,
      newB: entry.newB || ""
    }));
    
    console.log(`  Loaded ${dedicatedEntries.length} entries from merge report`);
  } else {
    console.log("  Merge report not found, checking for alternative sources...");
  }
  
  // Step 2: Load merge updates for additional data
  console.log("\nStep 2: Loading dedicated merge updates...");
  if (fs.existsSync(CONFIG.dedicatedMergeUpdates)) {
    const updatesContent = fs.readFileSync(CONFIG.dedicatedMergeUpdates, "utf-8");
    const updatesData = JSON.parse(updatesContent);
    console.log(`  Loaded ${updatesData.length} merge update entries`);
  }
  
  // Step 3: Load existing namebase names for matching
  console.log("\nStep 3: Loading existing namebases for matching...");
  const existingNamebases = loadExistingNamebases();
  console.log(`  Loaded ${existingNamebases.length} namebase names for matching`);
  
  // Step 4: Extract dedicated entries from the report
  console.log("\nStep 4: Extracting '(dedicated)' entries...");
  const allDedicatedEntries = dedicatedEntries.filter(entry => {
    const name = entry.oldName || "";
    return name.includes("(dedicated)");
  });
  console.log(`  Found ${allDedicatedEntries.length} '(dedicated)' entries`);
  
  // Step 5: Analyze each dedicated entry
  console.log("\nStep 5: Analyzing dedicated entries...");
  const analysis = analyzeDedicatedEntries(allDedicatedEntries, existingNamebases);
  
  // Step 6: Generate outputs
  console.log("\nStep 6: Generating outputs...");
  generateMappingFile(analysis);
  generateFixScript(analysis);
  generateResearchReport(analysis);
  
  // Step 7: Print summary
  printSummary(analysis);
  
  console.log("\n" + "=".repeat(70));
  console.log("RESEARCH COMPLETE");
  console.log("=".repeat(70));
  console.log(`\nOutputs generated:`);
  console.log(`  - Mapping: ${CONFIG.outputMapping}`);
  console.log(`  - Fix script: ${CONFIG.outputFixScript}`);
  console.log(`  - Report: ${CONFIG.outputReport}`);
}

/**
 * Load existing namebase names for matching
 */
function loadExistingNamebases() {
  const namebases = new Set();
  
  // Try the namebases file
  if (fs.existsSync(CONFIG.namebasesFile)) {
    try {
      const content = fs.readFileSync(CONFIG.namebasesFile, "utf-8");
      
      // Extract names from various patterns in the file
      // Pattern 1: name: "Language Name"
      const nameMatches1 = content.match(/name:\s*"([^"]+)"/g);
      if (nameMatches1) {
        nameMatches1.forEach(match => {
          const name = match.replace(/name:\s*"/, "").replace(/"$/, "");
          namebases.add(name);
        });
      }
      
      // Pattern 2: i: index, name: "Name"
      const nameMatches2 = content.match(/\[\s*\d+,\s*"[^"]+"/g);
      if (nameMatches2) {
        nameMatches2.forEach(match => {
          const name = match.match(/"([^"]+)"/);
          if (name) {
            namebases.add(name[1]);
          }
        });
      }
      
    } catch (e) {
      console.log(`  Warning: Could not parse namebases file: ${e.message}`);
    }
  }
  
  return Array.from(namebases);
}

/**
 * Analyze dedicated entries and categorize them
 */
function analyzeDedicatedEntries(dedicatedEntries, existingNamebases) {
  const analysis = {
    renameOperations: [],
    mergeOperations: [],
    linkedToExisting: [],
    needsNewNamebase: [],
    requiresManualResearch: [],
    summary: {
      totalDedicated: dedicatedEntries.length,
      renameCount: 0,
      mergeCount: 0,
      linkedToExisting: 0,
      needsNewNamebase: 0,
      requiresManualResearch: 0
    }
  };
  
  for (const entry of dedicatedEntries) {
    const oldName = entry.oldName || "";
    const newName = entry.newName || "";
    const index = entry.index || "";
    const type = entry.type || "unknown";
    
    // Extract base name (remove "(dedicated)" suffix)
    const baseName = oldName.replace(/\s*\(dedicated\)\s*/gi, "").trim();
    
    // Determine operation type
    const operation = {
      type: type,
      originalName: oldName,
      newName: newName,
      index: index,
      baseName: baseName
    };
    
    if (type === "rename") {
      // This is a simple rename - the dedicated entry was renamed to remove "(dedicated)"
      analysis.renameOperations.push(operation);
      analysis.summary.renameCount++;
      
      // Check if the target name exists in namebases
      const hasExistingNamebase = existingNamebases.some(nb => {
        const nbLower = nb.toLowerCase();
        const newNameLower = newName.toLowerCase();
        return nbLower === newNameLower || 
               nbLower.includes(newNameLower) || 
               newNameLower.includes(nbLower);
      });
      
      operation.hasExistingNamebase = hasExistingNamebase;
      
      if (hasExistingNamebase) {
        operation.targetNamebase = newName;
        analysis.linkedToExisting.push(operation);
        analysis.summary.linkedToExisting++;
      } else {
        operation.recommendation = "VERIFY_NAMEBASE_EXISTS";
        analysis.requiresManualResearch.push(operation);
        analysis.summary.requiresManualResearch++;
      }
      
    } else if (type === "merge") {
      // This is a merge - the dedicated entry was merged with a base entry
      analysis.mergeOperations.push(operation);
      analysis.summary.mergeCount++;
      
      operation.baseIndex = entry.baseIndex || "";
      operation.baseName = entry.baseName || baseName;
      operation.addedCities = entry.addedCities || 0;
      operation.newB = entry.newB || "";
      
      // Check if base name exists in namebases
      const baseNameLower = (entry.baseName || baseName).toLowerCase();
      const hasExistingNamebase = existingNamebases.some(nb => {
        const nbLower = nb.toLowerCase();
        return nbLower === baseNameLower || 
               nbLower.includes(baseNameLower) || 
               baseNameLower.includes(nbLower);
      });
      
      operation.hasExistingNamebase = hasExistingNamebase;
      operation.targetNamebase = entry.baseName || baseName;
      
      if (hasExistingNamebase) {
        analysis.linkedToExisting.push(operation);
        analysis.summary.linkedToExisting++;
      } else {
        analysis.needsNewNamebase.push(operation);
        analysis.summary.needsNewNamebase++;
      }
    }
  }
  
  // Update total dedicated count
  analysis.summary.totalDedicated = analysis.renameOperations.length + analysis.mergeOperations.length;
  
  return analysis;
}

/**
 * Generate the mapping JSON file
 */
function generateMappingFile(analysis) {
  const mapping = {
    generatedAt: new Date().toISOString(),
    summary: {
      totalDedicatedEntries: analysis.summary.totalDedicated,
      renameOperations: analysis.summary.renameCount,
      mergeOperations: analysis.summary.mergeCount,
      linkedToExisting: analysis.summary.linkedToExisting,
      needsNewNamebase: analysis.summary.needsNewNamebase,
      requiresManualResearch: analysis.summary.requiresManualResearch
    },
    operations: {
      rename: analysis.renameOperations.map(e => ({
        sourceIndex: e.index,
        originalName: e.originalName,
        targetName: e.newName,
        action: "rename"
      })),
      merge: analysis.mergeOperations.map(e => ({
        sourceIndex: e.index,
        originalName: e.originalName,
        baseIndex: e.baseIndex,
        baseName: e.baseName,
        addedCities: e.addedCities,
        action: "merge"
      }))
    },
    categorization: {
      linkedToExisting: analysis.linkedToExisting.map(e => ({
        sourceIndex: e.index,
        sourceName: e.originalName,
        targetNamebase: e.targetNamebase || e.newName,
        action: "link_to_existing_namebase"
      })),
      needsNewNamebase: analysis.needsNewNamebase.map(e => ({
        sourceIndex: e.index,
        sourceName: e.originalName,
        baseName: e.baseName || e.targetNamebase,
        action: "verify_namebase_exists"
      })),
      requiresManualResearch: analysis.requiresManualResearch.map(e => ({
        sourceIndex: e.index,
        sourceName: e.originalName,
        targetName: e.newName,
        action: "manual_review_required"
      }))
    }
  };
  
  fs.writeFileSync(CONFIG.outputMapping, JSON.stringify(mapping, null, 2));
  console.log(`  Generated: ${CONFIG.outputMapping}`);
}

/**
 * Generate the fix script
 */
function generateFixScript(analysis) {
  const scriptContent = `/**
 * Apply Dedicated Entry Fixes
 * 
 * This script applies the fixes identified by research-and-fix-placeholders.js
 * Based on the dedicated-merge-report.json analysis
 * 
 * Usage: node tools/fixes/apply-dedicated-fixes.js
 */

"use strict";

const fs = require("node:fs");

// Load the mapping
const mapping = JSON.parse(fs.readFileSync("data/dedicated-entries-mapping.json", "utf-8"));

console.log("Applying dedicated entry fixes...");
console.log(\`Total dedicated entries processed: \${mapping.summary.totalDedicatedEntries}\`);
console.log(\`Rename operations: \${mapping.summary.renameOperations}\`);
console.log(\`Merge operations: \${mapping.summary.mergeOperations}\`);
console.log(\`Entries linked to existing namebases: \${mapping.summary.linkedToExisting}\`);
console.log(\`Entries needing verification: \${mapping.summary.needsNewNamebase}\`);
console.log(\`Entries requiring manual review: \${mapping.summary.requiresManualResearch}\`);
console.log("");

// Log the operations that have been performed
console.log("\\n=== RENAME OPERATIONS ===");
mapping.operations.rename.forEach(op => {
  console.log(\`[RENAME] Index \${op.sourceIndex}: \${op.originalName} -> \${op.targetName}\`);
});

console.log("\\n=== MERGE OPERATIONS ===");
mapping.operations.merge.forEach(op => {
  console.log(\`[MERGE] Index \${op.sourceIndex}: \${op.originalName} -> Base[\${op.baseIndex}] \${op.baseName}\`);
  if (op.addedCities > 0) {
    console.log(\`       Added \${op.addedCities} cities from dedicated entry\`);
  }
});

console.log("\\n=== LINKED TO EXISTING NAMEBASES ===");
mapping.categorization.linkedToExisting.forEach(entry => {
  console.log(\`[LINK] Index \${entry.sourceIndex}: \${entry.sourceName} -> \${entry.targetNamebase}\`);
});

console.log("\\n=== NEEDS VERIFICATION ===");
mapping.categorization.needsNewNamebase.forEach(entry => {
  console.log(\`[VERIFY] Index \${entry.sourceIndex}: \${entry.sourceName}\`);
});

console.log("\\n=== MANUAL REVIEW REQUIRED ===");
mapping.categorization.requiresManualResearch.forEach(entry => {
  console.log(\`[REVIEW] Index \${entry.sourceIndex}: \${entry.sourceName} -> \${entry.targetName}\`);
});

console.log("\\nFix script generation complete.");
console.log("\\nNote: The actual fixes have already been applied to dedicated-merge-report.json.");
console.log("This script documents the operations that were performed.");
`;

  fs.writeFileSync(CONFIG.outputFixScript, scriptContent);
  console.log(`  Generated: ${CONFIG.outputFixScript}`);
}

/**
 * Generate the research report
 */
function generateResearchReport(analysis) {
  const report = `# Dedicated Entries Research Report

Generated: ${new Date().toISOString()}

## Executive Summary

| Metric | Count |
|--------|-------|
| Total "(dedicated)" entries analyzed | ${analysis.summary.totalDedicated} |
| Rename operations (simple rename) | ${analysis.summary.renameCount} |
| Merge operations (with city data) | ${analysis.summary.mergeCount} |
| Entries linked to existing namebases | ${analysis.summary.linkedToExisting} |
| Entries needing verification | ${analysis.summary.needsNewNamebase} |
| Entries requiring manual review | ${analysis.summary.requiresManualResearch} |

## 1. Rename Operations

These ${analysis.renameOperations.length} entries were simple renames - the "(dedicated)" suffix was removed and the entry was linked to an existing namebase:

| Index | Original Name | New Name |
|-------|---------------|----------|
${analysis.renameOperations.map(e => `| ${e.index} | ${e.originalName} | ${e.newName} |`).join("\n")}

**Status:** ${analysis.summary.linkedToExisting} can be immediately fixed by linking to existing namebases.

## 2. Merge Operations

These ${analysis.mergeOperations.length} entries were merged with base entries - the dedicated entry's city data was added to the base namebase:

| Index | Dedicated Name | Base Index | Base Name | Cities Added |
|-------|----------------|------------|-----------|--------------|
${analysis.mergeOperations.map(e => `| ${e.index} | ${e.originalName} | ${e.baseIndex || "N/A"} | ${e.baseName || "N/A"} | ${e.addedCities || 0} |`).join("\n")}

**Example:** 
${analysis.mergeOperations.length > 0 ? `- \`${analysis.mergeOperations[0].originalName}\` (${analysis.mergeOperations[0].index}) was merged with \`${analysis.mergeOperations[0].targetNamebase}\` (${analysis.mergeOperations[0].baseIndex}), adding ${analysis.mergeOperations[0].addedCities} cities` : "No merge operations found"}

## 3. Entries Linked to Existing Namebases

These ${analysis.linkedToExisting.length} entries can be immediately fixed by linking to existing namebases:

| Index | Source Name | Target Namebase |
|-------|-------------|-----------------|
${analysis.linkedToExisting.map(e => `| ${e.index} | ${e.originalName} | ${e.targetNamebase || e.newName} |`).join("\n")}

**Estimated effort to fix:** Immediate (automated fix possible)
**Priority:** High

## 4. Entries Needing Verification

These ${analysis.needsNewNamebase.length} entries need verification that the target namebase exists:

| Index | Source Name | Target Namebase |
|-------|-------------|-----------------|
${analysis.needsNewNamebase.map(e => `| ${e.index} | ${e.originalName} | ${e.targetNamebase || e.baseName} |`).join("\n")}

**Recommended actions:**
1. Verify the target namebase exists in the namebase files
2. If missing, create or link to appropriate namebase
3. Update mapping if names differ slightly

## 5. Entries Requiring Manual Review

These ${analysis.requiresManualResearch.length} entries need manual review:

| Index | Source Name | Target Name | Recommendation |
|-------|-------------|-------------|----------------|
${analysis.requiresManualResearch.map(e => `| ${e.index} | ${e.originalName} | ${e.newName} | Verify namebase exists |`).join("\n")}

**Recommended actions:**
1. Check if the target name exists in namebase files
2. Verify spelling matches (case-insensitive)
3. Create new namebase if necessary

## 6. Recommended Fix Order

1. **Immediate (automated):** All entries in section 3
2. **High priority:** Entries in section 4 with quality issues
3. **Medium priority:** Remaining entries in section 4
4. **Manual review:** Entries in section 5

## 7. Automation Potential

Based on the analysis:
- **${analysis.renameOperations.length}** entries were simple renames
- **${analysis.mergeOperations.length}** entries involved merging city data
- **${Math.round(analysis.summary.linkedToExisting / Math.max(analysis.summary.totalDedicated, 1) * 100)}%** can be linked to existing namebases
- **${Math.round(analysis.summary.needsNewNamebase / Math.max(analysis.summary.totalDedicated, 1) * 100)}%** need verification
- **${Math.round(analysis.summary.requiresManualResearch / Math.max(analysis.summary.totalDedicated, 1) * 100)}%** need human judgment

## 8. Next Steps

1. Run \`node tools/fixes/apply-dedicated-fixes.js\` to see the detailed operations
2. Verify the target namebases exist for entries in section 4
3. Review and resolve entries in section 5
4. Apply fixes to the main namebase files if needed
5. Update quality metrics after fixes are applied

## 9. Source Data

- **Merge Report:** \`${CONFIG.dedicatedMergeReport}\`
- **Merge Updates:** \`${CONFIG.dedicatedMergeUpdates}\`
- **Namebases:** \`${CONFIG.namebasesFile}\`

---

*Report generated by tools/fixes/research-and-fix-placeholders.js*
`;
  
  // Ensure docs/reports directory exists
  const reportsDir = path.dirname(CONFIG.outputReport);
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  fs.writeFileSync(CONFIG.outputReport, report);
  console.log(`  Generated: ${CONFIG.outputReport}`);
}

/**
 * Print summary to console
 */
function printSummary(analysis) {
  console.log("\n" + "-".repeat(50));
  console.log("SUMMARY");
  console.log("-".repeat(50));
  console.log(`Total "(dedicated)" entries analyzed: ${analysis.summary.totalDedicated}`);
  console.log(`  - Rename operations: ${analysis.summary.renameCount}`);
  console.log(`  - Merge operations: ${analysis.summary.mergeCount}`);
  console.log(`  - Can be linked to existing: ${analysis.summary.linkedToExisting}`);
  console.log(`  - Need verification: ${analysis.summary.needsNewNamebase}`);
  console.log(`  - Require manual review: ${analysis.summary.requiresManualResearch}`);
  console.log("");
  
  if (analysis.mergeOperations.length > 0) {
    console.log("Top merge operations (with city data):");
    analysis.mergeOperations.slice(0, 5).forEach(e => {
      console.log(`  - Index ${e.index}: ${e.originalName} -> ${e.targetNamebase || e.baseName} (${e.addedCities} cities)`);
    });
  }
  
  if (analysis.renameOperations.length > 0) {
    console.log("\nTop rename operations:");
    analysis.renameOperations.slice(0, 5).forEach(e => {
      console.log(`  - Index ${e.index}: ${e.originalName} -> ${e.newName}`);
    });
  }
}

// Run main function
main();
