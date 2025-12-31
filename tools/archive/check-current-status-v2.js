const fs = require('fs');

const content = fs.readFileSync('modules/namebases-real.js', 'utf8');

console.log('Current Status of namebases-real.js:\n');

// Count entries
const entryPattern = /{ name: "([^"]+)", i: (\d+)/g;
const matches = [...content.matchAll(entryPattern)];
console.log(`Total entries: ${matches.length}`);

// Check for placeholder names in "b" property
const placeholders = {
  'English': content.match(/"b":\s*"[^"]*English/gi),
  'French': content.match(/"b":\s*"[^"]*French/gi),
  'Spanish': content.match(/"b":\s*"[^"]*Spanish/gi),
  'German': content.match(/"b":\s*"[^"]*German/gi),
  'Italian': content.match(/"b":\s*"[^"]*Italian/gi),
  'Portuguese': content.match(/"b":\s*"[^"]*Portuguese/gi),
  'Arabic': content.match(/"b":\s*"[^"]*Arabic/gi),
};

Object.entries(placeholders).forEach(([key, matches]) => {
  console.log(`${key} placeholders: ${matches ? matches.length : 0}`);
});

// Check d values
const lnrtMatches = content.match(/"d":\s*"lnrt"/g);
const emptyDMatches = content.match(/"d":\s*""/g);

console.log(`\n"d" values:`);
console.log(`  "lnrt": ${lnrtMatches ? lnrtMatches.length : 0}`);
console.log(`  Empty (""): ${emptyDMatches ? emptyDMatches.length : 0}`);

// Check base lengths
const basePattern = /"b":\s*"([^"]+)"/g;
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

// Find shortest bases
const allBaseMatches = [...content.matchAll(basePattern)];
allBaseMatches.sort((a, b) => a[1].length - b[1].length);
console.log(`\nShortest base (first 3):`);
allBaseMatches.slice(0, 3).forEach(m => {
  console.log(`  ${m[1]} (${m[1].split(',').length} cities)`);
});
