const fs = require('fs');
const map = JSON.parse(fs.readFileSync('config/language-mixer-map.json', 'utf8'));

const dangling = [];
for (let i = 13938; i <= 13987; i++) {
  const users = map.filter(r => r.bases && r.bases.includes(i)).map(r => r.iso);
  if (users.length > 0) {
    dangling.push({ index: i, users });
  }
}

console.log(JSON.stringify(dangling, null, 2));
