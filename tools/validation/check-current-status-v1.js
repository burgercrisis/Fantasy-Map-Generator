/**
 * Current Status Report (v1)
 * 
 * Generates a status snapshot of continent namebase files:
 * - Counts placeholder patterns by language name (English, French, etc.)
 * - Analyzes base lengths and statistics
 * - Identifies short bases (< 3 cities)
 * 
 * Usage:
 *   node tools/validation/check-current-status-v1.js
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

// Check for placeholder patterns
const patterns = [
  { name: 'English', regex: /"b":\s*"[^"]*English/g },
  { name: 'French', regex: /"b":\s*"[^"]*French/g },
  { name: 'Spanish', regex: /"b":\s*"[^"]*Spanish/g },
  { name: 'German', regex: /"b":\s*"[^"]*German/g },
  { name: 'Italian', regex: /"b":\s*"[^"]*Italian/g },
  { name: 'Portuguese', regex: /"b":\s*"[^"]*Portuguese/g },
  { name: 'Arabic', regex: /"b":\s*"[^"]*Arabic/g },
  { name: 'lnrt', regex: /"d":\s*"lnrt"/g },
  { name: 'Empty d', regex: /"d":\s*""/g },
  { name: 'Short base (< 3 cities)', regex: /"b":\s*"[^"]{0,20}"/g }
];

console.log('Current Status of continent namebase files:\n');

patterns.forEach(pattern => {
  const matches = combinedContent.match(pattern.regex);
  console.log(`${pattern.name}: ${matches ? matches.length : 0} occurrences`);
});

// Check base lengths
const basePattern = /"b":\s*"([^"]+)"/g;
const bases = [];
let match;
while ((match = basePattern.exec(combinedContent)) !== null) {
  const cities = match[1].split(',');
  bases.push(cities.length);
}

const shortBases = bases.filter(b => b < 3).length;
const avgBases = (bases.reduce((a, b) => a + b, 0) / bases.length).toFixed(1);

console.log(`\nBase Statistics:`);
console.log(`  Total bases: ${bases.length}`);
console.log(`  Short bases (< 3 cities): ${shortBases}`);
console.log(`  Average cities per base: ${avgBases}`);
console.log(`  Min cities: ${Math.min(...bases)}`);
console.log(`  Max cities: ${Math.max(...bases)}`);
