/**
 * Current Status Report (v2)
 * 
 * Alternative status snapshot with additional metrics:
 * - Placeholder counts by language
 * - 'd' value distribution
 * - Base length statistics and shortest bases
 * 
 * Usage:
 *   node tools/validation/check-current-status-v2.js
 */

const fs = require('fs');
const path = require('path');

const continentFiles = [
  'modules/namebases-africa.js',
  'modules/namebases-asia.js',
  'modules/namebases-europe.js',
  'modules/namebases-northAmerica.js',
  'modules/namebases-southAmerica.js',
  'modules/namebases-oceania.js'
];

let combinedContent = '';
continentFiles.forEach(file => {
  if (fs.existsSync(file)) {
    combinedContent += fs.readFileSync(file, 'utf8') + '\n';
  }
});

console.log('Current Status of continent namebase files:\n');

// Count entries
const entryPattern = /{ name: "([^"]+)", i: (\d+)/g;
const matches = [...combinedContent.matchAll(entryPattern)];
console.log(`Total entries: ${matches.length}`);

// Check for placeholder names in "b" property
const placeholders = {
  'English': combinedContent.match(/"b":\s*"[^"]*English/gi),
  'French': combinedContent.match(/"b":\s*"[^"]*French/gi),
  'Spanish': combinedContent.match(/"b":\s*"[^"]*Spanish/gi),
  'German': combinedContent.match(/"b":\s*"[^"]*German/gi),
  'Italian': combinedContent.match(/"b":\s*"[^"]*Italian/gi),
  'Portuguese': combinedContent.match(/"b":\s*"[^"]*Portuguese/gi),
  'Arabic': combinedContent.match(/"b":\s*"[^"]*Arabic/gi),
};

Object.entries(placeholders).forEach(([key, matches]) => {
  console.log(`${key} placeholders: ${matches ? matches.length : 0}`);
});

// Check d values
const lnrtMatches = combinedContent.match(/"d":\s*"lnrt"/g);
const emptyDMatches = combinedContent.match(/"d":\s*""/g);

console.log(`\n"d" values:`);
console.log(`  "lnrt": ${lnrtMatches ? lnrtMatches.length : 0}`);
console.log(`  Empty (""): ${emptyDMatches ? emptyDMatches.length : 0}`);

// Check base lengths
const basePattern = /"b":\s*"([^"]+)"/g;
let baseMatch;
const bases = [];
while ((baseMatch = basePattern.exec(combinedContent)) !== null) {
  const cities = baseMatch[1].split(',');
  bases.push(cities.length);
}

const shortBases = bases.filter(b => b < 4).length; // min is typically 4
const avgBases = (bases.reduce((a, b) => a + b, 0) / bases.length).toFixed(1);

console.log(`\nBase Statistics:`);
console.log(`  Total bases: ${bases.length}`);
console.log(`  Short bases (< 4 cities): ${shortBases}`);
console.log(`  Average cities per base: ${avgBases}`);
console.log(`  Min cities: ${Math.min(...bases)}`);
console.log(`  Max cities: ${Math.max(...bases)}`);

// Find shortest bases
const allBaseMatches = [...combinedContent.matchAll(basePattern)];
allBaseMatches.sort((a, b) => a[1].length - b[1].length);
console.log(`\nShortest base (first 3):`);
allBaseMatches.slice(0, 3).forEach(m => {
  console.log(`  ${m[1]} (${m[1].split(',').length} cities)`);
});
