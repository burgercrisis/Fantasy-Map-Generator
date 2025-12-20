const fs = require('fs');
const map = JSON.parse(fs.readFileSync('config/language-mixer-map.json', 'utf8'));
const targetBases = [490, 454, 455, 471, 472, 473, 497, 481, 509, 468];
const results = [];

map.forEach(item => {
  if (item.bases.some(b => targetBases.includes(b))) {
    results.push(item.iso);
  }
});

console.log(results.join(','));
