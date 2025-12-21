const fs = require('fs');
const path = require('path');

const mapPath = path.join(__dirname, 'config', 'language-mixer-map.json');
const mapData = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
const map = {};
for (const entry of mapData) {
  map[entry.iso] = entry.bases;
}

const worker12Isos = [
  "admiralty",
  "afroasiatic-family",
  "alor-pantar",
  "angas-languages",
  "anim-languages",
  "aru",
  "aslians",
  "awin-pa",
  "awyu-dumut",
  "bade-languages"
];

const worker12Bases = {
  "admiralty": 13720,
  "afroasiatic-family": 13721,
  "alor-pantar": 13722,
  "angas-languages": 13723,
  "anim-languages": 13724,
  "aru": 13725,
  "aslians": 13726,
  "awin-pa": 13727,
  "awyu-dumut": 13728,
  "bade-languages": 13729
};

console.log("Verifying Worker 12 uniqueness...");

let failures = 0;
const allBases = Object.values(map);

for (const iso of worker12Isos) {
  const bases = map[iso];
  if (!bases) {
    console.error(`[FAIL] ISO ${iso} not found in map`);
    failures++;
    continue;
  }

  const expectedBase = worker12Bases[iso];
  if (!bases.includes(expectedBase)) {
    console.error(`[FAIL] ISO ${iso} missing expected dedicated base ${expectedBase}. Current bases: ${JSON.stringify(bases)}`);
    failures++;
    continue;
  }

  // Check if this base array is unique
  const matches = Object.entries(map).filter(([otherIso, otherBases]) => {
    return JSON.stringify(otherBases) === JSON.stringify(bases);
  });

  if (matches.length > 1) {
    console.error(`[FAIL] ISO ${iso} base array is NOT unique. Shared with: ${matches.map(m => m[0]).join(', ')}`);
    failures++;
  } else {
    console.log(`[OK] ISO ${iso} has dedicated base ${expectedBase} and unique base array.`);
  }
}

if (failures === 0) {
  console.log("\n[SUCCESS] All Worker 12 ISOs verified unique!");
  process.exit(0);
} else {
  console.error(`\n[FAILURE] ${failures} verification errors found.`);
  process.exit(1);
}
