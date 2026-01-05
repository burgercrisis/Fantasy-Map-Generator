const fs = require('fs');
const path = require('path');

const continentFiles = [
  'modules/namebases-africa.js',
  'modules/namebases-asia.js',
  'modules/namebases-europe.js',
  'modules/namebases-northAmerica.js',
  'modules/namebases-oceania.js',
  'modules/namebases-southAmerica.js'
];

const mixerFile = 'config/language-mixer-map.js';

// 1. Build name -> index map and index set from continent files
const nameToIndex = {};
const validIndices = new Set();

function normalize(s) {
  return s.toLowerCase()
    .replace(/\s*\(dedicated\)/g, '')
    .replace(/\s*\(burkina\)/g, '')
    .replace(/-/g, ' ')
    .replace(/_/g, ' ')
    .trim();
}

continentFiles.forEach(file => {
  if (!fs.existsSync(file)) return;
  const content = fs.readFileSync(file, 'utf8');
  const entries = content.split('},');
  entries.forEach(entry => {
    const nameMatch = entry.match(/"name":\s*"([^"]+)"/);
    const iMatch = entry.match(/"i":\s*(\d+)/);
    if (nameMatch && iMatch) {
      const fullName = nameMatch[1];
      const index = parseInt(iMatch[1]);
      validIndices.add(index);
      
      nameToIndex[normalize(fullName)] = index;
    }
  });
});

// 2. Load mixer map
let mixerContent = fs.readFileSync(mixerFile, 'utf8');

// 3. Find missing indices and try to fix
const mixerEntries = mixerContent.split('},');
let updatedCount = 0;
let failCount = 0;

const newMixerEntries = mixerEntries.map(entry => {
  const isoMatch = entry.match(/"iso":\s*"([^"]+)"/);
  const basesMatch = entry.match(/"bases":\s*\[\s*([\d\s,]+)\s*\]/);
  
  if (isoMatch && basesMatch) {
    const iso = isoMatch[1];
    const normalizedIso = normalize(iso);
    const basesStr = basesMatch[1];
    const bases = basesStr.split(',').map(b => parseInt(b.trim())).filter(b => !isNaN(b));
    
    let entryChanged = false;
    const newBases = bases.map(b => {
      if (!validIndices.has(b)) {
        // Missing index!
        if (nameToIndex[normalizedIso]) {
          console.log(`Fixing ISO "${iso}": ${b} -> ${nameToIndex[normalizedIso]}`);
          updatedCount++;
          entryChanged = true;
          return nameToIndex[normalizedIso];
        } else {
          // Try fuzzy match
          const keys = Object.keys(nameToIndex);
          const match = keys.find(k => k === normalizedIso || k.includes(normalizedIso) || normalizedIso.includes(k));
          if (match) {
            console.log(`Fuzzy match for ISO "${iso}" (found "${match}"): ${b} -> ${nameToIndex[match]}`);
            updatedCount++;
            entryChanged = true;
            return nameToIndex[match];
          }
          // console.log(`FAILED to fix ISO "${iso}" (current index ${b} is missing)`);
          failCount++;
        }
      }
      return b;
    });
    
    if (entryChanged) {
      const newBasesStr = newBases.join(', ');
      return entry.replace(/"bases":\s*\[\s*[\d\s,]+\s*\]/, `"bases": [${newBasesStr}]`);
    }
  }
  return entry;
});

if (updatedCount > 0) {
  fs.writeFileSync(mixerFile, newMixerEntries.join('},'), 'utf8');
  console.log(`\nSUCCESS: Updated ${updatedCount} additional indices in mixer map.`);
} else {
  console.log("\nNo additional changes made to mixer map.");
}

if (failCount > 0) {
  console.log(`STILL MISSING: ${failCount} indices could not be resolved.`);
}
