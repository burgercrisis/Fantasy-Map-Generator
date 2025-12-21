

const fs = require('fs');
const path = require('path');

const mixerMapPath = path.join(__dirname, 'config', 'language-mixer-map.json');
const mixerArray = JSON.parse(fs.readFileSync(mixerMapPath, 'utf8'));

const worker11Isos = [
  "ke-yagana", "kei-tanimbar", "kemi", "kemij-rvi", "kenaboi",
  "keuruu-evij-rvi", "kewa", "kfr", "kfy", "kgg"
];

console.log("Verifying Worker 11 Uniqueness...");

const mixerMap = {};
for (const item of mixerArray) {
  mixerMap[item.iso] = item;
}

const allBases = new Map(); // baseString -> ISOs

for (const item of mixerArray) {
  const basesStr = JSON.stringify(item.bases.slice().sort());
  if (!allBases.has(basesStr)) {
    allBases.set(basesStr, []);
  }
  allBases.get(basesStr).push(item.iso);
}

let failures = 0;
for (const iso of worker11Isos) {
  if (!mixerMap[iso]) {
    console.error(`FAIL: ${iso} not found in mixer map`);
    failures++;
    continue;
  }
  
  const basesStr = JSON.stringify(mixerMap[iso].bases.slice().sort());
  const sharing = allBases.get(basesStr);
  
  if (sharing.length > 1) {
    console.error(`FAIL: ${iso} shares bases with: ${sharing.filter(i => i !== iso).join(', ')}`);
    console.error(`      Bases: ${mixerMap[iso].bases.join(', ')}`);
    failures++;
  } else {
    console.log(`OK: ${iso} is unique.`);
  }
}

if (failures === 0) {
  console.log("SUCCESS: All Worker 11 ISOs are globally unique.");
  process.exit(0);
} else {
  console.error(`FAILED: ${failures} ISOs are not unique.`);
  process.exit(1);
}
