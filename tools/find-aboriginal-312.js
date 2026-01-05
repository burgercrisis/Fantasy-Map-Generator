const fs = require('fs');
const path = require('path');

const mixes = JSON.parse(fs.readFileSync('config/language-mixes.json', 'utf8'));
const map = JSON.parse(fs.readFileSync('config/language-mixer-map.json', 'utf8'));

const aboriginalIsos = mixes
  .filter(m => m.family === 'Australian Aboriginal')
  .map(m => m.iso);

console.log(`Found ${aboriginalIsos.length} Australian Aboriginal ISOs in catalog.`);

const mapEntries = map.filter(e => aboriginalIsos.includes(e.iso));

console.log(`Found ${mapEntries.length} mappings for these ISOs.`);

const with312 = mapEntries.filter(e => e.bases.includes(312));

console.log(`Found ${with312.length} mappings that include base 312.`);

if (with312.length > 0) {
  console.log('ISOs with base 312:');
  with312.forEach(e => console.log(`  - ${e.iso}: [${e.bases.join(', ')}]`));
}
