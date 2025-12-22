const fs = require('fs');
const path = require('path');

const mixerMapPath = path.resolve(__dirname, 'config/language-mixer-map.json');
let mixerMap = JSON.parse(fs.readFileSync(mixerMapPath, 'utf8'));

const updates = {
  'abkhaz': [13969],
  'adyghe': [13974],
  'chechen': [8617],
  'kva': [13917],
  'ava': [20583]
};

mixerMap.forEach(entry => {
  if (updates[entry.iso]) {
    console.log(`Updating ${entry.iso}: ${JSON.stringify(entry.bases)} -> ${JSON.stringify(updates[entry.iso])}`);
    entry.bases = updates[entry.iso];
  }
});

fs.writeFileSync(mixerMapPath, JSON.stringify(mixerMap, null, 2), 'utf8');
console.log('Successfully updated language-mixer-map.json');
