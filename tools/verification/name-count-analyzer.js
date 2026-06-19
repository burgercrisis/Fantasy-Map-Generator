"use strict";
/**
 * Name Count Analyzer
 * 
 * Analyzes all namebase entries and reports on name counts per entry.
 * Identifies entries that don't meet the minimum threshold.
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
    const bMatch = match[0].match(/"b"\s*:\s*"([^"]*)"/);
    const b = bMatch ? bMatch[1] : "";
    const names = b.split(",").filter(n => n.trim());
    entries.push({ name, i, names, sourceFile: path.basename(filePath), nameCount: names.length });
  }
  return entries;
}

function main() {
  console.log("=== Name Count Analyzer ===\n");
  
  const allEntries = [];
  
  for (const file of NAMEBASE_FILES) {
    const filePath = path.join(MODULES_DIR, file);
    if (!fs.existsSync(filePath)) continue;
    const entries = parseNamebaseFile(filePath);
    allEntries.push(...entries);
  }
  
  // Analyze name counts
  const below25 = allEntries.filter(e => e.nameCount < 25);
  const below50 = allEntries.filter(e => e.nameCount < 50);
  const below80 = allEntries.filter(e => e.nameCount < 80);
  const zero = allEntries.filter(e => e.nameCount === 0);
  
  console.log(`Total entries: ${allEntries.length}`);
  console.log(`Entries with 0 names: ${zero.length}`);
  console.log(`Entries with <25 names: ${below25.length}`);
  console.log(`Entries with <50 names: ${below50.length}`);
  console.log(`Entries with <80 names: ${below80.length}`);
  
  // Generate report
  let report = `# Name Count Analysis Report\n\n`;
  report += `**Generated**: ${new Date().toISOString()}\n\n`;
  report += `## Summary\n\n`;
  report += `- **Total entries**: ${allEntries.length}\n`;
  report += `- **Entries with 0 names**: ${zero.length}\n`;
  report += `- **Entries with <25 names**: ${below25.length}\n`;
  report += `- **Entries with <50 names**: ${below50.length}\n`;
  report += `- **Entries with <80 names**: ${below80.length}\n\n`;
  
  report += `## Distribution\n\n`;
  report += `| Name Count | Entries |\n|------------|----------|\n`;
  const ranges = [
    [0, 0], [1, 10], [11, 24], [25, 49], [50, 79], [80, 99], [100, 149], [150, 199], [200, Infinity]
  ];
  for (const [min, max] of ranges) {
    const count = allEntries.filter(e => e.nameCount >= min && e.nameCount <= max).length;
    const label = max === Infinity ? `${min}+` : `${min}-${max}`;
    report += `| ${label} | ${count} |\n`;
  }
  report += `\n`;
  
  if (zero.length > 0) {
    report += `## ⚠️ Entries with ZERO Names (CRITICAL)\n\n`;
    for (const entry of zero) {
      report += `- **${entry.name}** (i:${entry.i}) in ${entry.sourceFile}\n`;
    }
    report += `\n`;
  }
  
  if (below25.length > 0) {
    report += `## Entries Below Minimum (<25 names)\n\n`;
    report += `| Language | Index | File | Count |\n|----------|-------|------|-------|\n`;
    for (const entry of below25.sort((a, b) => a.nameCount - b.nameCount)) {
      report += `| ${entry.name} | ${entry.i} | ${entry.sourceFile} | ${entry.nameCount} |\n`;
    }
    report += `\n`;
  }
  
  // Per-file breakdown
  report += `## Per-File Breakdown\n\n`;
  for (const file of NAMEBASE_FILES) {
    const fileEntries = allEntries.filter(e => e.sourceFile === file);
    if (fileEntries.length === 0) continue;
    const fileBelow25 = fileEntries.filter(e => e.nameCount < 25).length;
    const avgCount = Math.round(fileEntries.reduce((s, e) => s + e.nameCount, 0) / fileEntries.length);
    report += `### ${file}\n\n`;
    report += `- Entries: ${fileEntries.length}\n`;
    report += `- Below minimum: ${fileBelow25}\n`;
    report += `- Average names per entry: ${avgCount}\n\n`;
  }
  
  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }
  fs.writeFileSync(path.join(REPORTS_DIR, "name-count-report.md"), report);
  
  console.log(`\nReport written to docs/verification/reports/name-count-report.md`);
}

main();
