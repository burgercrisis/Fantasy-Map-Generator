const fs = require('fs');
const mixerMap = JSON.parse(fs.readFileSync('config/language-mixer-map.json', 'utf8'));

const worker9Isos = [
  "kamono",
  "kanak",
  "kanasi",
  "kandawo",
  "kangjia",
  "kanite",
  "kannada",
  "kanuri",
  "kap",
  "kapampangan"
];

console.log("Verifying Worker 9 Batch Uniqueness...");

let allUnique = true;
const seenBases = new Map();

// First, build a map of all base arrays in the mixer map to find duplicates
for (const entry of mixerMap) {
  const iso = entry.iso;
  const bases = entry.bases;
  if (!bases) continue;
  const baseKey = bases.join(',');
  if (!seenBases.has(baseKey)) {
    seenBases.set(baseKey, []);
  }
  seenBases.get(baseKey).push(iso);
}

// Check worker 9 ISOs specifically
const isoToEntry = new Map(mixerMap.map(e => [e.iso, e]));

for (const iso of worker9Isos) {
  const entry = isoToEntry.get(iso);
  if (!entry) {
    console.error(`[ERROR] ISO ${iso} not found in mixer map!`);
    allUnique = false;
    continue;
  }
  
  const baseKey = entry.bases.join(',');
  const owners = seenBases.get(baseKey);
  
  if (owners.length > 1) {
    console.error(`[COLLISION] ISO ${iso} shares bases [${baseKey}] with: ${owners.filter(o => o !== iso).join(', ')}`);
    allUnique = false;
  } else {
    console.log(`[OK] ISO ${iso} has unique bases.`);
  }
}

if (allUnique) {
  console.log("\nSUCCESS: All Worker 9 ISOs have globally unique base arrays.");
  process.exit(0);
} else {
  console.error("\nFAILURE: Some Worker 9 ISOs still have collisions.");
  process.exit(1);
}
