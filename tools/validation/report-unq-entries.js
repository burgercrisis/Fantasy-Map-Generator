/**
 * UNQ Entry Report
 *
 * Lists all entries containing unq patterns in their 'b' field.
 * Shows file location, line numbers, and sample city lists.
 *
 * Usage:
 *   node tools/validation/report-unq-entries.js
 */

"use strict";

const fs = require('fs');
const path = require('path');

const CONTINENT_FILES = [
  'modules/namebases-africa.js',
  'modules/namebases-asia.js',
  'modules/namebases-europe.js',
  'modules/namebases-northAmerica.js',
  'modules/namebases-southAmerica.js',
  'modules/namebases-oceania.js',
  'modules/namebases-fantasy.js'
];

const unqPatterns = [];
const unqByContinent = {};
let totalCount = 0;

console.log('\n=== UNQ ENTRY REPORT ===\n');

for (const filePath of CONTINENT_FILES) {
  if (!fs.existsSync(filePath)) continue;

  const content = fs.readFileSync(filePath, 'utf8');
  const continent = path.basename(filePath, '.js').replace('namebases-', '');
  const lines = content.split('\n');

  unqByContinent[continent] = [];

  lines.forEach((line, index) => {
    if (line.includes('unq') && line.includes('b:')) {
      const match = line.match(/b: "([^"]+)"/);
      if (match) {
        const entry = { continent, line: index + 1, b: match[1] };
        unqPatterns.push(entry);
        unqByContinent[continent].push(entry);
        totalCount++;
      }
    }
  });
}

console.log(`Found ${totalCount} lines with unq patterns across all continents:\n`);

const displayLimit = 50;
for (const [continent, patterns] of Object.entries(unqByContinent)) {
  if (patterns.length > 0) {
    console.log(`--- ${continent} (${patterns.length} entries) ---`);
    patterns.slice(0, 10).forEach((item, i) => {
      console.log(`${i + 1}. Line ${item.line}: ${item.b.substring(0, 70)}...`);
    });
    if (patterns.length > 10) {
      console.log(`  ... and ${patterns.length - 10} more in ${continent}`);
    }
    console.log('');
  }
}

if (unqPatterns.length > displayLimit) {
  console.log(`\n... and ${unqPatterns.length - displayLimit} more entries across all continents`);
}

if (totalCount === 0) {
  console.log('✓ No unq patterns found');
}