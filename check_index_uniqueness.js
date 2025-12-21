const fs = require('fs');
const path = require('path');

const map = JSON.parse(fs.readFileSync('config/language-mixer-map.json', 'utf8'));

const baseUseCount = new Map();
map.forEach(row => {
  if (row.bases) {
    row.bases.forEach(b => {
      if (typeof b === 'number') {
        baseUseCount.set(b, (baseUseCount.get(b) || 0) + 1);
      }
    });
  }
});

const nonUniqueBases = [];
for (const [b, count] of baseUseCount.entries()) {
  if (count > 1) {
    nonUniqueBases.push({ index: b, count });
  }
}

console.log(`Total non-unique indices: ${nonUniqueBases.length}`);
nonUniqueBases.sort((a, b) => b.count - a.count);
console.log('Top non-unique indices:', nonUniqueBases.slice(0, 10));

const myIndices = [];
for (let i = 13938; i <= 13987; i++) {
  if (baseUseCount.get(i) > 1) {
    myIndices.push({ index: i, count: baseUseCount.get(i) });
  }
}
console.log('My assigned indices (13938-13987) that are non-unique:', myIndices);
