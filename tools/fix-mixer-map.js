const fs = require('fs');
const path = require('path');

const mapPath = 'e:/code/Fantasy-Map-Generator/config/language-mixer-map.json';
const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));

let changes = 0;

map.forEach(entry => {
  // Update Harari/Argobba lects to use index 312
  if (['harari', 'harari-east-gurage', 'argobba', 'amharic-argobba'].includes(entry.iso)) {
    console.log(`Updating ${entry.iso}: ${JSON.stringify(entry.bases)} -> [312]`);
    entry.bases = [312];
    changes++;
  }

  // Remove redundant indices from Italian dialects
  if (entry.iso === 'ligurian' || entry.iso === 'cremun-s') {
    const oldBases = [...entry.bases];
    entry.bases = entry.bases.filter(b => b !== 873 && b !== 804);
    if (entry.bases.length === 0) entry.bases = [3]; // Fallback to Italian base
    if (JSON.stringify(oldBases) !== JSON.stringify(entry.bases)) {
      console.log(`Updating ${entry.iso}: ${JSON.stringify(oldBases)} -> ${JSON.stringify(entry.bases)}`);
      changes++;
    }
  }
});

if (changes > 0) {
  fs.writeFileSync(mapPath, JSON.stringify(map, null, 2));
  console.log(`Applied ${changes} changes to language-mixer-map.json`);
} else {
  console.log('No changes needed in language-mixer-map.json');
}
