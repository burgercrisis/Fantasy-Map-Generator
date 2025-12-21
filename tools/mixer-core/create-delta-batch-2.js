const fs = require('fs');
const path = require('path');

const targetIsos = [
  "korafe", "kos", "koya", "kpt", "kra", "krc", "kum", "kumhali", "kurambhag-paharia", "kurichiya",
  "kuril-dialects", "kurukh", "kuvi", "kva", "kvx", "kwoma-manambu-pidgin", "kxu", "kyaka",
  "kyakhta-russian-chinese-pidgin", "kyowa-go", "kyv", "kyw", "kzi", "l-ngua-geral-paulista", "laal"
];

const mixerMap = JSON.parse(fs.readFileSync('config/language-mixer-map.json', 'utf8'));
const delta = [];
let nextIndex = 14110;

for (const iso of targetIsos) {
    const entry = mixerMap.find(e => e.iso === iso);
    if (entry) {
        const newBases = [...entry.bases, nextIndex];
        delta.push({
            iso: iso,
            bases: newBases
        });
        nextIndex++;
    } else {
        console.error(`ISO not found in map: ${iso}`);
    }
}

fs.writeFileSync('tools/mixer-deltas/2025-12-21-triage-batch-2.json', JSON.stringify(delta, null, 2));
console.log('Created tools/mixer-deltas/2025-12-21-triage-batch-2.json');
