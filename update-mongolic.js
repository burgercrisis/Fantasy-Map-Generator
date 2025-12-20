const fs = require('fs');

const map = JSON.parse(fs.readFileSync('config/language-mixer-map.json', 'utf8'));

// Southern Mongolic languages that need updating
const mongolicUpdates = {
  'khalkha': [12140, 381],
  'southern-khalkha': [12141, 381],
  'northern-khalkha': [12142, 381],
  'proto-mongolic': [12143, 381],
  'nantoq-baoan': [12144, 381],
  'kharchin-khorchin': [12145, 381],
  'khoton': [12146, 381],
  'old-serbi': [12147, 381],
  'qifu': [12148, 381],
  'shilingol-khalkha': [12149, 381],
  'shirwi': [12150, 381],
  'sonid': [12151, 381],
  'zakhchin': [12152, 381],
  'khorchin': [12153, 381],
  'khorchin-mongol': [12153, 381],
  'oeld': [12154, 381],
  'sart-kalmyk': [12155, 381],
  'tuyuhun': [12156, 381],
  'old-khitan': [12157, 381],
  'tabghach': [12158, 381],
  'ulaanchab': [12159, 381],
  'hailar-dagur': [12160, 381],
  'mongghuor': [12161, 381],
  'nonni-dagur': [12162, 381],
  'middle-mongol': [12163, 381],
  'santa': [12164, 381],
  'santa-sijiaji': [12165, 381],
  'santa-suonanba': [12166, 381],
  'santa-wangjiaji': [12167, 381]
};

let updated = 0;
for (const entry of map) {
  if (mongolicUpdates[entry.iso] && entry.bases && entry.bases.length === 1 && entry.bases[0] === 381) {
    entry.bases = mongolicUpdates[entry.iso];
    updated++;
    console.log(`Updated ${entry.iso}`);
  }
}

fs.writeFileSync('config/language-mixer-map.json', JSON.stringify(map, null, 2));
console.log(`Updated ${updated} Southern Mongolic languages`);
