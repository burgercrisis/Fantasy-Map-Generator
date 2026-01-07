#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const MODULES_DIR = path.join(__dirname, "..", "..", "modules");
const DATA_DIR = path.join(__dirname, "data");

const NAMEBASE_FILES = [
  "namebases-africa.js",
  "namebases-asia.js",
  "namebases-europe.js",
  "namebases-northAmerica.js",
  "namebases-oceania.js",
  "namebases-southAmerica.js",
  "namebases-fantasy.js",
  "namebases-creole.js"
];

function getNamebaseType(filename) {
  return filename
    .replace("namebases-", "")
    .replace(".js", "");
}

function parseNamebaseFile(filename) {
  const fullPath = path.join(MODULES_DIR, filename);
  if (!fs.existsSync(fullPath)) {
    return { filename, type: getNamebaseType(filename), entries: [], error: "File not found" };
  }

  try {
    const content = fs.readFileSync(fullPath, "utf8");
    const type = getNamebaseType(filename);
    const entries = [];

    const arrayMatch = content.match(/window\.\w+NameBases\s*=\s*\[([\s\S]*?)\];?\s*$/);
    if (!arrayMatch) {
      return { filename, type, entries: [], error: "Array pattern not found" };
    }

    const entryRegex = /\{\s*"name":\s*"([^"]+)",\s*"i":\s*(\d+),/g;
    let match;

    while ((match = entryRegex.exec(arrayMatch[1])) !== null) {
      entries.push({
        name: match[1],
        index: parseInt(match[2], 10),
        type: type
      });
    }

    return { filename, type, entries, error: null };
  } catch (error) {
    return { filename, type: getNamebaseType(filename), entries: [], error: error.message };
  }
}

function validateEntries(allEntries) {
  const issues = [];
  const indexMap = new Map();

  allEntries.forEach(entry => {
    if (!Number.isInteger(entry.index) || entry.index < 0) {
      issues.push({ type: "invalid_index", entry });
    }

    const key = entry.index;
    if (indexMap.has(key)) {
      const existing = indexMap.get(key);
      issues.push({
        type: "duplicate_index",
        index: entry.index,
        entries: [existing, entry]
      });
    } else {
      indexMap.set(key, entry);
    }
  });

  return issues;
}

function parseAllNamebaseFiles() {
  console.log("Parsing namebase files...\n");

  const results = [];
  const allEntries = [];

  NAMEBASE_FILES.forEach(filename => {
    console.log(`Processing ${filename}...`);
    const result = parseNamebaseFile(filename);
    results.push(result);

    if (result.entries.length > 0) {
      console.log(`  Found ${result.entries.length} entries`);
      allEntries.push(...result.entries);
    }

    if (result.error) {
      console.log(`  Warning: ${result.error}`);
    }
  });

  console.log("\n=== Parsing Summary ===\n");

  const stats = {};
  results.forEach(r => {
    stats[r.type] = r.entries.length;
  });

  Object.entries(stats)
    .sort(([,a], [,b]) => b - a)
    .forEach(([type, count]) => {
      console.log(`${type.padEnd(15)}: ${count} entries`);
    });
  console.log(`${"─".repeat(20)}`);
  console.log(`${"TOTAL".padEnd(15)}: ${allEntries.length} entries`);

  console.log("\n=== Validation ===\n");
  const issues = validateEntries(allEntries);

  if (issues.length === 0) {
    console.log("No validation issues found.\n");
  } else {
    console.log(`Found ${issues.length} issues:\n`);
    issues.forEach((issue, i) => {
      if (issue.type === "duplicate_index") {
        console.log(`${i+1}. Duplicate index ${issue.index}:`);
        issue.entries.forEach(e => {
          console.log(`   - ${e.name} (${e.type})`);
        });
      } else if (issue.type === "invalid_index") {
        console.log(`${i+1}. Invalid index: ${JSON.stringify(issue.entry)}`);
      }
    });
    console.log();
  }

  console.log("=== Sample Entries ===\n");
  allEntries.slice(0, 10).forEach((entry, i) => {
    console.log(`${(i+1).toString().padStart(2)}. ${entry.name} (i:${entry.index}) [${entry.type}]`);
  });

  if (allEntries.length > 10) {
    console.log(`  ... and ${allEntries.length - 10} more entries`);
  }

  const output = {
    metadata: {
      parsed_at: new Date().toISOString(),
      total_entries: allEntries.length,
      files_processed: NAMEBASE_FILES.length,
      validation_issues: issues.length,
      issues: issues
    },
    continent_statistics: stats,
    entries: allEntries.sort((a, b) => a.index - b.index)
  };

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const outputPath = path.join(DATA_DIR, "continent-file-mapping.json");
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`\nData saved to: ${outputPath}`);

  return output;
}

if (require.main === module) {
  parseAllNamebaseFiles();
}

module.exports = {
  parseNamebaseFile,
  parseAllNamebaseFiles,
  validateEntries
};
