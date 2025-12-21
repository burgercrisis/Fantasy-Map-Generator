const fs = require('fs');
const path = require('path');

const deltaPath = path.join(process.cwd(), 'tools', 'mixer-deltas', '2025-12-21-triage-batch-1.json');
const namebasesPath = path.join(process.cwd(), 'modules', 'namebases-real.js');

const delta = JSON.parse(fs.readFileSync(deltaPath, 'utf8'));
const namebasesContent = fs.readFileSync(namebasesPath, 'utf8');

const missing = [];
const mismatched = [];

for (const item of delta) {
  const iso = item.iso;
  const dedicatedBase = item.bases[item.bases.length - 1];
  
  // Search for the index in namebases
  const regex = new RegExp(`i: ${dedicatedBase},`);
  const match = namebasesContent.match(regex);
  
  if (!match) {
    missing.push({iso, index: dedicatedBase});
  } else {
    // Check if the name matches (roughly)
    // We expect something like {name: "Language Name (dedicated)", i: 14025, ...}
    const lineRegex = new RegExp(`\\{name: "([^"]+)", i: ${dedicatedBase},`);
    const lineMatch = namebasesContent.match(lineRegex);
    if (lineMatch) {
      console.log(`OK: ${iso} -> index ${dedicatedBase} (${lineMatch[1]})`);
    } else {
      mismatched.push({iso, index: dedicatedBase});
    }
  }
}

console.log('\nSummary:');
console.log(`Missing: ${missing.length}`);
console.log(`Mismatched: ${mismatched.length}`);

if (missing.length > 0) {
  console.log('Missing items:', JSON.stringify(missing, null, 2));
}
