const fs = require('fs');
const map = JSON.parse(fs.readFileSync('config/language-mixer-map.json', 'utf8'));

const index = 13914;
const users = map.filter(r => r.bases && r.bases.includes(index)).map(r => r.iso);
fs.writeFileSync('index_users_output.txt', `Users of index ${index}: ${users.join(', ')}`);
