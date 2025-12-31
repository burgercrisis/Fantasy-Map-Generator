const fs = require('fs');

const content = fs.readFileSync('modules/namebases-real.js', 'utf-8');
const lines = content.split('\n');

let count = 0;
lines.forEach((line) => {
  if (line.includes('{ name:') && line.includes('b:')) {
    const bMatch = line.match(/b: "([^"]+)"/);
    if (bMatch) {
      const b = bMatch[1];
      const cities = b.split(',');
      const uniqueCities = new Set(cities);

      if (uniqueCities.size < cities.length) {
        count++;
      }
    }
  }
});

console.log(`Entries with duplicate cities: ${count}`);

if (count === 0) {
  console.log('✓ No duplicates found - all entries cleaned!');
}