const fs = require('fs');
const path = require('path');

const catalogPath = path.join('config', 'language-mixes.json');
const mapPath = path.join('config', 'language-mixer-map.json');

const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));

const range = ['khun', 'khv', 'khw', 'kiautschou-pidgin-german', 'kiche', 'kichwa', 'kiga', 'kij', 'kija', 'kikai', 'kikar', 'kiknur', 'kikuyu', 'kildin-sami', 'kili', 'kim-mun', 'kimaama-kimaghama', 'kimre-language', 'kinyarwanda', 'kio', 'kiong-nai', 'kip', 'kir-balar-language', 'kiranti', 'kiribati', 'kirundi', 'kirya-konzal-language', 'kituba', 'kiwai', 'kiwaian', 'kjq', 'kkn', 'kkt', 'klb', 'kle', 'klon', 'klr', 'kls'];

const candidates = [];

for (const iso of range) {
    const entry = catalog.find(e => e.iso === iso);
    if (!entry) continue;
    
    const mapEntry = map.find(e => e.iso === iso);
    if (!mapEntry) {
        candidates.push({ iso, name: entry.name, reason: 'missing_map' });
        continue;
    }
    
    if (mapEntry.bases.length === 0 || mapEntry.bases.includes('NO_UNIQ_BASE')) {
        candidates.push({ iso, name: entry.name, reason: 'NO_UNIQ_BASE' });
    }
}

console.log(JSON.stringify(candidates, null, 2));
