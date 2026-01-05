const fs = require('fs');

const backupFile = 'modules/namebases-real.backup-20251228-221152.js';
const continentFiles = [
  'modules/namebases-africa.js',
  'modules/namebases-asia.js',
  'modules/namebases-europe.js',
  'modules/namebases-northAmerica.js',
  'modules/namebases-oceania.js',
  'modules/namebases-southAmerica.js'
];
const mixerFile = 'config/language-mixer-map.js';

// 1. Build old index -> name map from backup
const oldIndexToName = {};
if (fs.existsSync(backupFile)) {
  console.log("Loading backup file...");
  const content = fs.readFileSync(backupFile, 'utf8');
  const entries = content.split('},');
  entries.forEach(entry => {
    const nameMatch = entry.match(/"name":\s*"([^"]+)"/);
    const iMatch = entry.match(/"i":\s*(\d+)/);
    if (nameMatch && iMatch) {
      oldIndexToName[parseInt(iMatch[1])] = nameMatch[1].trim();
    }
  });
  console.log(`Found ${Object.keys(oldIndexToName).length} names in backup.`);
} else {
  console.log("Backup file NOT found!");
}

// 2. Build name -> new index map from continent files
const nameToNewIndex = {};
const validIndices = new Set();
continentFiles.forEach(file => {
  if (!fs.existsSync(file)) return;
  const content = fs.readFileSync(file, 'utf8');
  const entries = content.split('},');
  entries.forEach(entry => {
    const nameMatch = entry.match(/"name":\s*"([^"]+)"/);
    const iMatch = entry.match(/"i":\s*(\d+)/);
    if (nameMatch && iMatch) {
      const name = nameMatch[1].trim();
      const index = parseInt(iMatch[1]);
      nameToNewIndex[name] = index;
      validIndices.add(index);
    }
  });
});
console.log(`Found ${Object.keys(nameToNewIndex).length} names in continent files.`);

// 3. Fix mixer map
let mixerContent = fs.readFileSync(mixerFile, 'utf8');
const mixerEntries = mixerContent.split('},');
let fixedCount = 0;

const newMixerEntries = mixerEntries.map(entry => {
  const basesMatch = entry.match(/"bases":\s*\[\s*([\d\s,]+)\s*\]/);
  if (basesMatch) {
    const bases = basesMatch[1].split(',').map(b => parseInt(b.trim())).filter(b => !isNaN(b));
    let changed = false;
    const newBases = bases.map(b => {
      if (!validIndices.has(b)) {
        const oldName = oldIndexToName[b];
        if (oldName && nameToNewIndex[oldName]) {
          // console.log(`Fixing index ${b} (name "${oldName}") -> ${nameToNewIndex[oldName]}`);
          fixedCount++;
          changed = true;
          return nameToNewIndex[oldName];
        } else if (oldName) {
           // Try case-insensitive and dedicated suffix
           const normalizedOld = oldName.toLowerCase();
           const match = Object.keys(nameToNewIndex).find(k => {
             const normalizedK = k.toLowerCase().replace(" (dedicated)", "");
             return normalizedK === normalizedOld;
           });
           if (match) {
             // console.log(`Fuzzy fixing index ${b} ("${oldName}" -> "${match}") -> ${nameToNewIndex[match]}`);
             fixedCount++;
             changed = true;
             return nameToNewIndex[match];
           }
        }
      }
      return b;
    });
    if (changed) {
      return entry.replace(/"bases":\s*\[\s*[\d\s,]+\s*\]/, `"bases": [${newBases.join(', ')}]`);
    }
  }
  return entry;
});

fs.writeFileSync(mixerFile, newMixerEntries.join('},'), 'utf8');
console.log(`\nSUCCESS: Fixed ${fixedCount} indices using backup mapping.`);
