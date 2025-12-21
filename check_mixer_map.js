const fs = require('fs');
const mixerMap = JSON.parse(fs.readFileSync('config/language-mixer-map.json', 'utf8'));

const isos = ['ava', 'che', 'kva', 'abkhaz', 'adyghe'];
const results = mixerMap.filter(e => isos.includes(e.iso));

console.log(JSON.stringify(results, null, 2));
