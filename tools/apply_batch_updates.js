const fs = require('fs');
const path = 'config/language-mixer-map.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const batchUpdates = {
    'labrador-inuit-pidgin-french': 13929,
    'lachi': 13930,
    'laha': 13931,
    'lahu': 13932,
    'laiuse-romani': 13933,
    'lakota': 13934,
    'lampung': 13935,
    'land-dayak': 13936,
    'lanping-bai-dialect': 13937,
    'lao': 13963,
    'latin-american-spanish': 13964,
    'laua': 13965,
    'laven-bahnaric': 13966,
    'lavi-bahnaric': 13967,
    'law': 13968,
    'laz': 13969,
    'lbe': 13970,
    'lbj': 13971,
    'leivu': 13972,
    'lembena': 13973,
    'lemi-region': 13974,
    'lepcha': 13975,
    'levantine-arabic': 13976,
    'lezgin': 13977,
    'lhm': 13978
};

let updatedCount = 0;
data.forEach(entry => {
    if (batchUpdates[entry.iso]) {
        entry.bases = [batchUpdates[entry.iso]];
        updatedCount++;
    }
});

console.log(`Updated ${updatedCount} entries.`);
fs.writeFileSync(path, JSON.stringify(data, null, 2));
