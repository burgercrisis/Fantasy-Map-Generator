const fs = require('fs');
const path = require('path');

const mapPath = path.resolve(__dirname, '..', 'config', 'language-mixer-map.json');
console.error(`Reading from ${mapPath}`);
const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));

const baseCounts = {};
map.forEach(row => {
    row.bases.forEach(b => {
        if (typeof b === 'number') {
            baseCounts[b] = (baseCounts[b] || 0) + 1;
        }
    });
});

const noUniqBaseIsos = map.filter(row => {
    return !row.bases.some(b => typeof b === 'number' && baseCounts[b] === 1);
});

fs.writeFileSync('no_uniq_base_list.json', JSON.stringify(noUniqBaseIsos.slice(0, 25), null, 2));
console.error(`Found ${noUniqBaseIsos.length} ISOs without unique bases.`);
console.log('Done.');
