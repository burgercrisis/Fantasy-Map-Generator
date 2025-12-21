const fs = require('fs');
const path = require('path');

const mapPath = 'config/language-mixer-map.json';
const nbPath = 'modules/namebases-real.js';
const deltaDir = 'tools/mixer-deltas';

const batch3Isos = [
  "kuril-dialects", "kurukh", "kuvi", "kva", "kvx", "kwoma-manambu-pidgin", "kxu", "kyaka", "kyakhta-russian-chinese-pidgin", "kyowa-go", "kyv", "kyw", "kzi", "l-ngua-geral-paulista", "laal", "labrador-inuit-pidgin-french", "lachi", "laha", "lahu", "laiuse-romani", "lakota", "lampung", "land-dayak", "lanping-bai-dialect", "lao"
];

const startIdx = 14000;

// 1. Update Map
const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
const delta = {
  date: new Date().toISOString().split('T')[0],
  batch: "batch3",
  changes: []
};

batch3Isos.forEach((iso, i) => {
  const newIdx = startIdx + i;
  const entry = map.find(r => r.iso === iso);
  if (entry) {
    const oldBases = [...entry.bases];
    // Filter out any previously assigned dedicated indices (13000+)
    entry.bases = entry.bases.filter(b => typeof b !== 'number' || b < 13000);
    entry.bases.push(newIdx);
    delta.changes.push({ iso, oldBases, newBases: entry.bases, assignedIndex: newIdx });
  } else {
    console.warn(`ISO ${iso} not found in map!`);
  }
});

fs.writeFileSync(mapPath, JSON.stringify(map, null, 2));
console.log('Updated language-mixer-map.json');

// 2. Update namebases-real.js
let nbContent = fs.readFileSync(nbPath, 'utf8');
let newEntries = "";

batch3Isos.forEach((iso, i) => {
  const newIdx = startIdx + i;
  const name = iso.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ') + " (dedicated)";
  let seeds = [];
  for (let j = 1; j <= 10; j++) {
    seeds.push(`${iso}_${newIdx}_unq${j}`);
  }
  const b = seeds.join(',');
  newEntries += `    {name: "${name}", i: ${newIdx}, min: 4, max: 11, d: "lnrt", m: 0, b: "${b}"},\n`;
});

// Insert before the closing ];
const lastMatch = nbContent.match(/},\s*];/);
if (lastMatch) {
  nbContent = nbContent.replace(/},\s*];/, `},\n${newEntries}    ];`);
  fs.writeFileSync(nbPath, nbContent);
  console.log('Updated modules/namebases-real.js');
} else {
  console.error('Could not find insertion point in namebases-real.js');
}

// 3. Create Delta File
if (!fs.existsSync(deltaDir)) fs.mkdirSync(deltaDir, { recursive: true });
const deltaFile = path.join(deltaDir, `${delta.date}-batch3.json`);
fs.writeFileSync(deltaFile, JSON.stringify(delta, null, 2));
console.log(`Created delta file: ${deltaFile}`);
