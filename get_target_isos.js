const fs = require('fs');
const map = JSON.parse(fs.readFileSync('config/language-mixer-map.json', 'utf8'));
const isos = ['barito', 'nicobarese'];
const items = map.filter(m => isos.includes(m.iso));
fs.writeFileSync('target_isos_info.json', JSON.stringify(items, null, 2));
