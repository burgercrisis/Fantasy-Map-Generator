const fs = require('fs');
const mixerMap = JSON.parse(fs.readFileSync('config/language-mixer-map.json', 'utf8'));

const results = mixerMap.filter(e => e.iso === 'che' || e.iso === 'chechen' || e.iso === 'ce');

console.log(JSON.stringify(results, null, 2));
