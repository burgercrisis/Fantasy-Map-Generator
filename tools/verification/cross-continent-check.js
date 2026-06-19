"use strict";
/**
 * Cross-Continent Duplicate Checker
 * 
 * Detects languages that appear in multiple continent files.
 * These may be intentional (cross-continent languages) or errors.
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
  const objectRegex = /\{[^{}]*"name"\s*:\s*"([^"]+)"[^{}]*"i"\s*:\s*(\d+)[^{}]*\}/g;
  let match;
  while ((match = objectRegex.exec(content)) !== null) {
    const name = match[1];
    const i = parseInt(match[2], 10);
    entries.push({ name, i, sourceFile: path.basename(filePath) });
  }
  return entries;
}

function main() {
  console.log("=== Cross-Continent Duplicate Checker ===\n");
  
  const allEntries = [];
  
  for (const file of NAMEBASE_FILES) {
    const filePath = path.join(MODULES_DIR, file);
    if (!fs.existsSync(filePath)) continue;
    const entries = parseNamebaseFile(filePath);
    allEntries.push(...entries);
  }
  
  // Group by name (case-insensitive)
  const byName = new Map();
  for (const entry of allEntries) {
    const key = entry.name.toLowerCase();
    if (!byName.has(key)) {
      byName.set(key, []);
    }
    byName.get(key).push(entry);
  }
  
  // Find duplicates
  const duplicates = [];
  for (const [name, entries] of byName) {
    if (entries.length > 1) {
      const files = new Set(entries.map(e => e.sourceFile));
      if (files.size > 1) {
        duplicates.push({ name, entries });
      }
    }
  }
  
  console.log(`Total entries: ${allEntries.length}`);
  console.log(`Cross-continent duplicates: ${duplicates.length}`);
  
  // Generate report
  let report = `# Cross-Continent Duplicate Report\n\n`;
  report += `**Generated**: ${new Date().toISOString()}\n\n`;
  report += `## Summary\n\n`;
  report += `- **Total entries**: ${allEntries.length}\n`;
  report += `- **Cross-continent duplicates**: ${duplicates.length}\n\n`;
  
  if (duplicates.length > 0) {
    report += `## Duplicate Languages\n\n`;
    report += `| Language | Files | Indices | Action Needed? |\n|----------|-------|---------|----------------|\n`;
    for (const dup of duplicates.sort((a, b) => a.name.localeCompare(b.name))) {
      const files = dup.entries.map(e => e.sourceFile.replace("namebases-", "").replace(".js", "")).join(", ");
      const indices = dup.entries.map(e => e.i).join(", ");
      report += `| ${dup.name} | ${files} | ${indices} | Review |\n`;
    }
    report += `\n`;
    
    report += `## Detailed Entries\n\n`;
    for (const dup of duplicates.sort((a, b) => a.name.localeCompare(b.name))) {
      report += `### ${dup.name}\n\n`;
      for (const entry of dup.entries) {
        report += `- **${entry.sourceFile}** (i:${entry.i})\n`;
      }
      report += `\n`;
    }
  } else {
    report += `✅ No cross-continent duplicates found.\n`;
  }
  
  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }
  fs.writeFileSync(path.join(REPORTS_DIR, "cross-continent-audit.md"), report);
  
  console.log(`\nReport written to docs/verification/reports/cross-continent-audit.md`);
}

main();
