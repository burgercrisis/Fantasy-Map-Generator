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

const unqPatternRegex = /(\w+(?:-\w+)*)_\d{5}_unq\d+/g;
const simplePatternRegex = /(\w+(?:-\w+)*)_unq\d+/g;

const uniquePatterns = new Set();
const simplePatterns = new Set();
const patternsByContinent = {};

console.log('\n=== REMAINING UNQ PATTERN ANALYSIS ===\n');

for (const filePath of CONTINENT_FILES) {
  if (!fs.existsSync(filePath)) continue;

  const content = fs.readFileSync(filePath, 'utf8');
  const continent = path.basename(filePath, '.js').replace('namebases-', '');

  patternsByContinent[continent] = new Set();

  let match;
  while ((match = unqPatternRegex.exec(content)) !== null) {
    const languageName = match[1];
    uniquePatterns.add(languageName);
    patternsByContinent[continent].add(languageName);
  }

  while ((match = simplePatternRegex.exec(content)) !== null) {
    const languageName = match[1];
    simplePatterns.add(languageName);
  }
}

console.log(`Found ${uniquePatterns.size} unique language patterns still with unq placeholders:\n`);

const sortedPatterns = Array.from(uniquePatterns).sort();
sortedPatterns.forEach((pattern, i) => {
  console.log(`${i + 1}. ${pattern}`);
});

console.log('\n=== BY CONTINENT ===\n');
for (const [continent, patterns] of Object.entries(patternsByContinent)) {
  if (patterns.size > 0) {
    console.log(`${continent}: ${patterns.size} patterns`);
    Array.from(patterns).sort().forEach(p => console.log(`  - ${p}`));
    console.log('');
  }
}

const simpleOnly = [...simplePatterns].filter(p => !uniquePatterns.has(p));
if (simpleOnly.length > 0) {
  console.log('\n=== SIMPLE PATTERNS (without digit suffix) ===\n');
  simpleOnly.sort().forEach((pattern, i) => {
    console.log(`${i + 1}. ${pattern}`);
  });
}
