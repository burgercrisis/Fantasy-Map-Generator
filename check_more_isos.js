const fs = require('fs');
const mixerMap = JSON.parse(fs.readFileSync('config/language-mixer-map.json', 'utf8'));

const names = ['ket', 'yemba', 'yerukala', 'mator', 'nganasan', 'kamas'];
const results = mixerMap.filter(e => names.includes(e.iso) || names.some(n => e.iso.includes(n)));

console.log(JSON.stringify(results, null, 2));
