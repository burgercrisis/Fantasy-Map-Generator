"use strict";
/**
 * Collision Audit Tool
 * 
 * Scans all modules/namebases-*.js files for index collisions and produces
 * a comprehensive report at docs/verification/reports/collision-report.md
 */

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..", "..");
const MODULES_DIR = path.join(ROOT, "modules");
const REPORTS_DIR = path.join(ROOT, "docs", "verification", "reports");

const NAMEBASE_FILES = [
  "namebases-africa.js",
  "namebases-asia.js",
  "namebases-europe.js",
  "namebases-northAmerica.js",
  "namebases-southAmerica.js",
  "namebases-oceania.js",
  "namebases-unknown.js",
  "namebases-fantasy.js",
  "namebases-dedicated.js",
];

function parseNamebaseFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const entries = [];
  
  // Extract all objects with name and i fields
  // Match patterns like: { "name": "...", "i": N, ... }
  const objectRegex = /\{[^{}]*"name"\s*:\s*"([^"]+)"[^{}]*"i"\s*:\s*(\d+)[^{}]*\}/g;
  let match;
  while ((match = objectRegex.exec(content)) !== null) {
    const name = match[1];
    const i = parseInt(match[2], 10);
    
    // Extract the b field
    const bMatch = match[0].match(/"b"\s*:\s*"([^"]*)"/);
    const b = bMatch ? bMatch[1] : "";
    const names = b.split(",").filter(n => n.trim());
    
    entries.push({ name, i, b, names, sourceFile: path.basename(filePath) });
  }
  
  return entries;
}

function main() {
  console.log("=== Collision Audit Tool ===\n");
  
  // Parse all files
  const allEntries = [];
  const fileStats = {};
  
  for (const file of NAMEBASE_FILES) {
    const filePath = path.join(MODULES_DIR, file);
    if (!fs.existsSync(filePath)) {
      console.log(`WARNING: ${file} not found, skipping`);
      continue;
    }
    const entries = parseNamebaseFile(filePath);
    fileStats[file] = entries.length;
    allEntries.push(...entries);
    console.log(`Parsed ${file}: ${entries.length} entries`);
  }
  
  console.log(`\nTotal entries: ${allEntries.length}`);
  
  // Group by index
  const byIndex = new Map();
  for (const entry of allEntries) {
    if (!byIndex.has(entry.i)) {
      byIndex.set(entry.i, []);
    }
    byIndex.get(entry.i).push(entry);
  }
  
  // Find collisions
  const collisions = [];
  for (const [index, entries] of byIndex) {
    if (entries.length > 1) {
      collisions.push({ index, entries });
    }
  }
  
  // Classify collisions
  const sameFileDuplicates = [];
  const crossContinentSameName = [];
  const crossContinentDifferentName = [];
  
  for (const collision of collisions) {
    const { index, entries } = collision;
    const files = new Set(entries.map(e => e.sourceFile));
    const names = new Set(entries.map(e => e.name));
    
    if (files.size === 1) {
      // Same file
      sameFileDuplicates.push(collision);
    } else if (names.size === 1) {
      // Cross-continent, same name
      crossContinentSameName.push(collision);
    } else {
      // Cross-continent, different name (BUG)
      crossContinentDifferentName.push(collision);
    }
  }
  
  // Generate report
  let report = `# Collision Audit Report\n\n`;
  report += `**Generated**: ${new Date().toISOString()}\n\n`;
  report += `## Summary\n\n`;
  report += `- **Total entries**: ${allEntries.length}\n`;
  report += `- **Unique indices**: ${byIndex.size}\n`;
  report += `- **Collisions**: ${collisions.length}\n`;
  report += `  - Same-file duplicates: ${sameFileDuplicates.length}\n`;
  report += `  - Cross-continent same name: ${crossContinentSameName.length}\n`;
  report += `  - Cross-continent different name (BUG): ${crossContinentDifferentName.length}\n\n`;
  
  report += `## File Statistics\n\n`;
  report += `| File | Entries |\n|------|----------|\n`;
  for (const [file, count] of Object.entries(fileStats)) {
    report += `| ${file} | ${count} |\n`;
  }
  report += `\n`;
  
  if (crossContinentDifferentName.length > 0) {
    report += `## ⚠️ CROSS-CONTINENT DIFFERENT-NAME COLLISIONS (MUST FIX)\n\n`;
    for (const collision of crossContinentDifferentName) {
      report += `### Index ${collision.index}\n\n`;
      for (const entry of collision.entries) {
        report += `- **${entry.name}** in ${entry.sourceFile} (${entry.names.length} names)\n`;
      }
      report += `\n`;
    }
  }
  
  if (crossContinentSameName.length > 0) {
    report += `## Cross-Continent Same-Name Entries\n\n`;
    report += `These may be intentional (same language in multiple continents) or may need cleanup.\n\n`;
    for (const collision of crossContinentSameName) {
      report += `### Index ${collision.index}: ${collision.entries[0].name}\n\n`;
      for (const entry of collision.entries) {
        report += `- ${entry.sourceFile} (${entry.names.length} names)\n`;
      }
      report += `\n`;
    }
  }
  
  if (sameFileDuplicates.length > 0) {
    report += `## Same-File Duplicates\n\n`;
    for (const collision of sameFileDuplicates) {
      report += `### Index ${collision.index}: ${collision.entries[0].name}\n\n`;
      report += `- ${collision.entries[0].sourceFile} (${collision.entries.length} copies)\n\n`;
    }
  }
  
  // Write report
  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }
  fs.writeFileSync(path.join(REPORTS_DIR, "collision-report.md"), report);
  
  console.log(`\nReport written to docs/verification/reports/collision-report.md`);
  console.log(`Collisions found: ${collisions.length}`);
  console.log(`  Same-file duplicates: ${sameFileDuplicates.length}`);
  console.log(`  Cross-continent same name: ${crossContinentSameName.length}`);
  console.log(`  Cross-continent different name: ${crossContinentDifferentName.length}`);
  
  // Exit with error if there are Type C collisions
  if (crossContinentDifferentName.length > 0) {
    console.log(`\n⚠️  ${crossContinentDifferentName.length} Type C collisions found! Must fix before proceeding.`);
    process.exit(1);
  }
  
  console.log("\n✅ No critical collisions found.");
}

main();
