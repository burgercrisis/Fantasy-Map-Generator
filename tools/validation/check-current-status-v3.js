/**
 * Current Status Report (v3)
 * 
 * Most detailed status snapshot:
 * - Entry count and total bases
 * - Placeholder pattern detection
 * - 'd' value analysis (lnrt, empty)
 * - Short base identification with examples
 * - "(dedicated)" suffix check
 * 
 * Usage:
 *   node tools/validation/check-current-status-v3.js
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
const placeholderPatterns = [
  { name: 'English', pattern: /b:\s*"[^"]*English/i },
  { name: 'French', pattern: /b:\s*"[^"]*French/i },
  { name: 'Spanish', pattern: /b:\s*"[^"]*Spanish/i },
  { name: 'German', pattern: /b:\s*"[^"]*German/i },
  { name: 'Italian', pattern: /b:\s*"[^"]*Italian/i },
  { name: 'Portuguese', pattern: /b:\s*"[^"]*Portuguese/i },
  { name: 'Arabic', pattern: /b:\s*"[^"]*Arabic/i },
];

placeholderPatterns.forEach(p => {
  const matches = combinedContent.match(p.pattern);
  console.log(`${p.name} placeholders: ${matches ? matches.length : 0}`);
});

// Check d values
const lnrtMatches = combinedContent.match(/d:\s*"lnrt"/g);
const emptyDMatches = combinedContent.match(/d:\s*""/g);

console.log(`\n"d" values:`);
console.log(`  "lnrt": ${lnrtMatches ? lnrtMatches.length : 0}`);
console.log(`  Empty (""): ${emptyDMatches ? emptyDMatches.length : 0}`);

// Check base lengths
const basePattern = /b:\s*"([^"]+)"/g;
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

// Find entries with short bases
const entryBasePattern = /{[^}]*name:\s*"([^"]+)"[^}]*b:\s*"([^"]+)"[^}]*}/g;
const shortBaseEntries = [];
let entryMatch;
while ((entryMatch = entryBasePattern.exec(combinedContent)) !== null) {
  const cities = entryMatch[2].split(',');
  if (cities.length < 4) {
    shortBaseEntries.push({
      name: entryMatch[1],
      cities: cities.length,
      base: entryMatch[2]
    });
  }
}

if (shortBaseEntries.length > 0) {
  console.log(`\nEntries with short bases (< 4 cities): ${shortBaseEntries.length}`);
  shortBaseEntries.slice(0, 10).forEach(e => {
    console.log(`  ${e.name}: ${e.cities} cities - ${e.base}`);
  });
}

// Check for (dedicated) suffix
const dedicatedMatches = combinedContent.match(/name:\s*"[^"]*\(dedicated\)/g);
console.log(`\n(dedicated) suffix: ${dedicatedMatches ? dedicatedMatches.length : 0}`);
