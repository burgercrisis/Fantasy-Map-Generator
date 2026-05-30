"use strict";

/**
 * Fix script for name collisions and duplicates in the namebase files.
 * 
 * Issues identified:
 * 1. "Língua Geral Paulista" appears twice at indices 13927 and 14013
 *    - The entry at 14013 conflicts with "Lezgin" language base in mixer map
 *    - Keep the first occurrence (13927), remove the duplicate (14013)
 * 
 * Usage: node tools/fixes/fix-collisions-and-duplicates.js
 */

const fs = require("fs");
const path = require("path");

const NAMEBASE_FILE = "modules/namebases-southAmerica.js";
const REPORT_FILE = "docs/reports/collision-fixes-report.md";

const fixesApplied = [];
const issuesDiscovered = [];

/**
 * Parse the namebase file and identify duplicates
 */
function parseNamebases(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const entries = [];
  
  // Parse JSON array from the file
  const jsonMatch = content.match(/window\.SouthAmericaNameBases\s*=\s*(\[[\s\S]*\]);/);
  if (!jsonMatch) {
    throw new Error("Could not parse namebase array from file");
  }
  
  try {
    const entriesArray = JSON.parse(jsonMatch[1]);
    return entriesArray;
  } catch (e) {
    throw new Error(`Failed to parse JSON: ${e.message}`);
  }
}

/**
 * Find duplicate entries by name
 */
function findDuplicates(entries) {
  const nameCounts = {};
  const duplicates = [];
  
  entries.forEach((entry, index) => {
    const name = entry.name;
    if (!nameCounts[name]) {
      nameCounts[name] = [];
    }
    nameCounts[name].push({ index, entry });
  });
  
  Object.entries(nameCounts).forEach(([name, occurrences]) => {
    if (occurrences.length > 1) {
      duplicates.push({ name, occurrences });
    }
  });
  
  return duplicates;
}

/**
 * Find index collisions (same index used for different names)
 */
function findIndexCollisions(entries) {
  const indexMap = new Map();
  const collisions = [];
  
  entries.forEach((entry) => {
    const i = entry.i;
    if (indexMap.has(i)) {
      collisions.push({
        index: i,
        existing: indexMap.get(i),
        new: entry
      });
    } else {
      indexMap.set(i, entry);
    }
  });
  
  return collisions;
}

/**
 * Check if an index is used in the language-mixer-map.js
 */
function isIndexUsedInMixerMap(index) {
  const mixerFile = "config/language-mixer-map.js";
  if (!fs.existsSync(mixerFile)) {
    return false;
  }
  
  const content = fs.readFileSync(mixerFile, "utf8");
  // Look for the index in bases arrays
  const regex = new RegExp(`\\[\\s*\\d+,\\s*${index}\\s*\\]|\\[\\s*${index}\\s*\\]`, 'g');
  return regex.test(content);
}

/**
 * Remove duplicate entry from the namebases file
 */
function removeDuplicateEntry(filePath, entryToRemove) {
  const content = fs.readFileSync(filePath, "utf8");
  
  // Build a regex to find and remove the duplicate entry
  // The entry format is:
  //   {
  //     "name": "Língua Geral Paulista",
  //     "i": 14013,
  //     ...
  //   }
  
  const name = entryToRemove.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const index = entryToRemove.i;
  
  // Match the entire object including leading comma if present
  const entryRegex = new RegExp(
    `,\\s*\\{\\s*"name":\\s*"${name}",\\s*"i":\\s*${index}[^}]*\\}`,
    'g'
  );
  
  const newContent = content.replace(entryRegex, '');
  
  // Also handle case where it's the first entry (no leading comma)
  const firstEntryRegex = new RegExp(
    `\\{\\s*"name":\\s*"${name}",\\s*"i":\\s*${index}[^}]*\\},?`,
    'g'
  );
  
  let finalContent = newContent;
  if (newContent.match(firstEntryRegex)) {
    finalContent = newContent.replace(firstEntryRegex, '');
  }
  
  fs.writeFileSync(filePath, finalContent);
  return true;
}

/**
 * Generate the report
 */
function generateReport() {
  const timestamp = new Date().toISOString();
  
  let report = `# Collision Fixes Report\n`;
  report += `Generated: ${timestamp}\n\n`;
  
  report += `## Summary\n\n`;
  report += `- **Collisions Fixed:** ${fixesApplied.length}\n`;
  report += `- **Duplicates Removed:** ${fixesApplied.filter(f => f.type === 'duplicate').length}\n`;
  report += `- **Additional Issues Discovered:** ${issuesDiscovered.length}\n\n`;
  
  if (fixesApplied.length > 0) {
    report += `## Fixes Applied\n\n`;
    fixesApplied.forEach((fix, i) => {
      report += `${i + 1}. **${fix.type}**: ${fix.description}\n`;
      report += `   - File: ${fix.file}\n`;
      report += `   - Index: ${fix.index}\n`;
      if (fix.reason) {
        report += `   - Reason: ${fix.reason}\n`;
      }
      report += `\n`;
    });
  }
  
  if (issuesDiscovered.length > 0) {
    report += `## Issues Requiring Further Review\n\n`;
    issuesDiscovered.forEach((issue, i) => {
      report += `${i + 1}. **${issue.type}**: ${issue.description}\n`;
      report += `   - Details: ${issue.details}\n`;
      report += `\n`;
    });
  }
  
  report += `## Verification Steps\n\n`;
  report += `1. Run the language mixer to verify no errors\n`;
  report += `2. Check that the duplicate entry is no longer present\n`;
  report += `3. Verify that language mappings using index ${fixesApplied.length > 0 ? fixesApplied[0].index : 'N/A'} still work correctly\n`;
  
  fs.writeFileSync(REPORT_FILE, report);
  console.log(`Report generated: ${REPORT_FILE}`);
}

/**
 * Main function
 */
function main() {
  console.log("=== Fix Script for Name Collisions and Duplicates ===\n");
  
  // Check if namebase file exists
  if (!fs.existsSync(NAMEBASE_FILE)) {
    console.error(`Error: Namebase file not found: ${NAMEBASE_FILE}`);
    process.exit(1);
  }
  
  // Parse the namebases
  console.log("Parsing namebase file...");
  const entries = parseNamebases(NAMEBASE_FILE);
  console.log(`Found ${entries.length} entries in ${NAMEBASE_FILE}\n`);
  
  // Find duplicates by name
  console.log("Checking for duplicate names...");
  const duplicates = findDuplicates(entries);
  
  if (duplicates.length > 0) {
    console.log(`Found ${duplicates.length} duplicate(s) by name:\n`);
    duplicates.forEach(dup => {
      console.log(`  "${dup.name}" appears ${dup.occurrences.length} times`);
      dup.occurrences.forEach(occ => {
        console.log(`    - Index ${occ.entry.i}, line ~${occ.index + 1}`);
      });
    });
    console.log("");
  }
  
  // Find index collisions
  console.log("Checking for index collisions...");
  const indexCollisions = findIndexCollisions(entries);
  
  if (indexCollisions.length > 0) {
    console.log(`Found ${indexCollisions.length} index collision(s):\n`);
    indexCollisions.forEach(col => {
      console.log(`  Index ${col.index}:`);
      console.log(`    - Existing: "${col.existing.name}"`);
      console.log(`    - New: "${col.new.name}"`);
    });
    console.log("");
  }
  
  // Process duplicates
  duplicates.forEach(dup => {
    // For each duplicate, we need to decide which one to keep
    // Strategy: Keep the one with the lowest index (first added), remove others
    
    // Sort by index
    dup.occurrences.sort((a, b) => a.entry.i - b.entry.i);
    
    // All but the first are duplicates to remove
    const toRemove = dup.occurrences.slice(1);
    
    toRemove.forEach(occ => {
      const index = occ.entry.i;
      
      // Check if this index is used in the mixer map
      const usedInMixer = isIndexUsedInMixerMap(index);
      
      if (usedInMixer) {
        issuesDiscovered.push({
          type: "Index Used in Mixer Map",
          description: `Index ${index} (${occ.entry.name}) is referenced in language-mixer-map.js`,
          details: `This index is used as a base for one or more language mappings. Removing this entry may break those mappings unless they are also updated.`
        });
        console.log(`WARNING: Index ${index} is used in language-mixer-map.js - manual review required`);
      } else {
        console.log(`Removing duplicate: "${occ.entry.name}" at index ${index}`);
        
        try {
          removeDuplicateEntry(NAMEBASE_FILE, occ.entry);
          fixesApplied.push({
            type: "duplicate",
            description: `Removed duplicate entry "${occ.entry.name}"`,
            file: NAMEBASE_FILE,
            index: index,
            reason: "Duplicate name found in namebase file"
          });
        } catch (e) {
          console.error(`Error removing duplicate: ${e.message}`);
        }
      }
    });
  });
  
  // Process index collisions
  indexCollisions.forEach(col => {
    // This shouldn't happen in practice since we use a Map to detect,
    // but if it does, we need to resolve it
    console.log(`Index collision at ${col.index}: "${col.existing.name}" vs "${col.new.name}"`);
    console.log("  This needs manual resolution.");
  });
  
  // Check for trailing spaces in names
  console.log("\nChecking for trailing spaces in names...");
  const trailingSpaceEntries = entries.filter(e => e.name !== e.name.trim());
  if (trailingSpaceEntries.length > 0) {
    console.log(`Found ${trailingSpaceEntries.length} entries with trailing/leading spaces:`);
    trailingSpaceEntries.forEach(e => {
      console.log(`  - "${e.name}" (index ${e.i})`);
      // Note: We're not automatically fixing these as they may be intentional
      issuesDiscovered.push({
        type: "Trailing/Leading Spaces",
        description: `Entry "${e.name}" has trailing or leading whitespace`,
        details: `Index: ${e.i}`
      });
    });
  } else {
    console.log("No entries with trailing/leading spaces found.");
  }
  
  // Check for suspicious names (very short, very long, unusual characters)
  console.log("\nChecking for suspicious names...");
  const suspiciousEntries = entries.filter(e => {
    if (e.name.length < 3) return true;
    if (e.name.length > 100) return true;
    if (/[<>&\[\]{}|\\^~`\x00-\x1f]/.test(e.name)) return true;
    return false;
  });
  
  if (suspiciousEntries.length > 0) {
    console.log(`Found ${suspiciousEntries.length} potentially suspicious entries:`);
    suspiciousEntries.forEach(e => {
      console.log(`  - "${e.name}" (index ${e.i})`);
    });
    issuesDiscovered.push({
      type: "Suspicious Names",
      description: `${suspiciousEntries.length} entries with unusual name characteristics`,
      details: `Entries with length < 3, > 100, or unusual characters`
    });
  } else {
    console.log("No suspicious entries found.");
  }
  
  // Generate report
  console.log("\n" + "=".repeat(50));
  console.log("Summary:");
  console.log(`  - Collisions Fixed: ${fixesApplied.length}`);
  console.log(`  - Duplicates Removed: ${fixesApplied.filter(f => f.type === 'duplicate').length}`);
  console.log(`  - Issues Requiring Review: ${issuesDiscovered.length}`);
  
  generateReport();
  
  console.log("\nDone!");
}

// Run the script
main();
