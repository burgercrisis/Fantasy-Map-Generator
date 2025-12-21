const fs = require('fs');
const path = require('path');

const isos = [
  "kuril-ainu", "kuril-dialects", "kurukh", "kuvi", "kva", "kvx", "kwoma-manambu-pidgin", "kxu", "kyaka", "kyakhta-russian-chinese-pidgin", "kyowa-go", "kyv", "kyw", "kzi", "l-ngua-geral-paulista", "laal", "labrador-inuit-pidgin-french", "lachi", "laha", "lahu", "laiuse-romani", "lakota", "lampung", "land-dayak", "lanping-bai-dialect"
];

const startIdx = 13988;
const mapPath = 'config/language-mixer-map.json';
const nbPath = 'modules/namebases-real.js';
const deltaDir = 'tools/mixer-deltas';

if (!fs.existsSync(deltaDir)) fs.mkdirSync(deltaDir, { recursive: true });

const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
let nbContent = fs.readFileSync(nbPath, 'utf8');

const deltas = [];
let newNbEntries = "";

isos.forEach((iso, i) => {
  const idx = startIdx + i;
  const row = map.find(r => r.iso === iso);
  if (row) {
    const oldBases = [...row.bases];
    // Filter out any existing high indices that might be non-unique
    row.bases = row.bases.filter(b => typeof b !== 'number' || b < 13000);
    row.bases.push(idx);
    
    deltas.push({
      iso,
      oldBases,
      newBases: row.bases,
      addedIndex: idx
    });

    const name = iso.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ') + " (dedicated)";
    let seeds = [];
    for (let j = 1; j <= 10; j++) {
      seeds.push(`${iso}_${idx}_unq${j}`);
    }
    newNbEntries += `    {name: "${name}", i: ${idx}, min: 4, max: 11, d: "lnrt", m: 0, b: "${seeds.join(',')}"},\n`;
  }
});

// Write Map
fs.writeFileSync(mapPath, JSON.stringify(map, null, 2));

// Write Namebases
const lastEntryMatch = nbContent.match(/},\s*];/);
if (lastEntryMatch) {
  nbContent = nbContent.replace(/},\s*];/, `},\n${newNbEntries}    ];`);
  fs.writeFileSync(nbPath, nbContent);
}

// Write Delta
const timestamp = new Date().toISOString().split('T')[0];
const deltaFile = path.join(deltaDir, `${timestamp}-worker-no-uniq-base-batch3.json`);
fs.writeFileSync(deltaFile, JSON.stringify({
  batch: 3,
  timestamp: new Date().toISOString(),
  deltas
}, null, 2));

console.log(`Successfully processed 25 ISOs (Batch 3). New indices: ${startIdx} to ${startIdx + 24}`);
