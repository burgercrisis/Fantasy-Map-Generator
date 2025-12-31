const fs = require('fs');

const content = fs.readFileSync('modules/namebases-real.js', 'utf8');

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

console.log('Current Status of namebases-real.js:\n');

patterns.forEach(pattern => {
  const matches = content.match(pattern.regex);
  console.log(`${pattern.name}: ${matches ? matches.length : 0} occurrences`);
});

// Check base lengths
const basePattern = /"b":\s*"([^"]+)"/g;
const bases = [];
let match;
while ((match = basePattern.exec(content)) !== null) {
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
