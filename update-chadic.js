const fs = require('fs');

const map = JSON.parse(fs.readFileSync('config/language-mixer-map.json', 'utf8'));

// Chadic languages that need updating (from the cluster report)
const chadicUpdates = {
  'ron-chadic': [12121, 132, 112, 120],
  'ron-language': [12122, 132, 277],
  'saba-chadic-language': [12123, 132, 112],
  'sarua-language': [12124, 132, 120],
  'sha-chadic-language': [12084, 132, 277],
  'siri-chadic-language': [12085, 132, 112, 120],
  'south-bauchi': [12086, 132, 277],
  'southern-gabri-language': [12087, 132, 112],
  'tal-language': [12088, 132, 120],
  'tambas-language': [12089, 132, 277],
  'tamki-language': [12090, 132, 112],
  'teshenawa-language': [12091, 132, 120],
  'tobanga-language': [12092, 132, 277],
  'toram-language': [12093, 132, 112, 120],
  'tumak-language': [12094, 132, 277],
  'ubi-language': [12095, 132, 112],
  'warji-language': [12096, 132, 120],
  'west-chadic': [12097, 132, 277],
  'yiwom-language': [12098, 132, 112],
  'zizilivakan-language': [12099, 132, 120],
  'zulgo-gemzek-language': [12100, 132, 277],
  'jimi-language-nigeria': [12101, 132, 112, 120],
  'kajakse-language': [12102, 132, 277],
  'kanakuru-language': [12103, 132, 112],
  'karai-karai': [12104, 132, 120],
  'kariya-language': [12105, 132, 277],
  'kera-chadic-language': [12106, 132, 112, 120],
  'kholok-language': [12107, 132, 277],
  'kimre-language': [12108, 132, 112],
  'kir-balar-language': [12109, 132, 120]
};

let updated = 0;
for (const entry of map) {
  if (chadicUpdates[entry.iso] && entry.bases && entry.bases.length === 1 && entry.bases[0] === 132) {
    entry.bases = chadicUpdates[entry.iso];
    updated++;
    console.log(`Updated ${entry.iso}`);
  }
}

fs.writeFileSync('config/language-mixer-map.json', JSON.stringify(map, null, 2));
console.log(`Updated ${updated} Chadic languages`);
