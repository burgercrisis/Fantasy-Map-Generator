const fs = require('fs');

const content = fs.readFileSync('modules/namebases-real.js', 'utf8');

console.log('Current Status of namebases-real.js:\n');

// Count entries
const entryPattern = /{ name: "([^"]+)", i: (\d+)/g;
const matches = [...content.matchAll(entryPattern)];
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
  const matches = content.match(p.pattern);
  console.log(`${p.name} placeholders: ${matches ? matches.length : 0}`);
});

// Check d values
const lnrtMatches = content.match(/d:\s*"lnrt"/g);
const emptyDMatches = content.match(/d:\s*""/g);

console.log(`\n"d" values:`);
console.log(`  "lnrt": ${lnrtMatches ? lnrtMatches.length : 0}`);
console.log(`  Empty (""): ${emptyDMatches ? emptyDMatches.length : 0}`);

// Check base lengths
const basePattern = /b:\s*"([^"]+)"/g;
let baseMatch;
const bases = [];
while ((baseMatch = basePattern.exec(content)) !== null) {
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
while ((entryMatch = entryBasePattern.exec(content)) !== null) {
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
const dedicatedMatches = content.match(/name:\s*"[^"]*\(dedicated\)/g);
console.log(`\n(dedicated) suffix: ${dedicatedMatches ? dedicatedMatches.length : 0}`);
