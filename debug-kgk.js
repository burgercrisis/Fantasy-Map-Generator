
const fs = require('fs');
const map = JSON.parse(fs.readFileSync('config/language-mixer-map.json', 'utf8'));
const catalog = JSON.parse(fs.readFileSync('config/language-mixes.json', 'utf8'));

const catalogByIso = new Map();
for (const c of catalog) catalogByIso.set(c.iso, c);

const isFamily = iso => {
  const c = catalogByIso.get(iso);
  return !!(c && Array.isArray(c.tags) && c.tags.includes('family'));
};

const baseUseCount = new Map();
for (const entry of map) {
  if (isFamily(entry.iso)) continue;
  for (const b of entry.bases) {
    baseUseCount.set(b, (baseUseCount.get(b) || 0) + 1);
  }
}

console.log('agarabi bases:', map.find(e => e.iso === 'agarabi').bases);
const basesToCheck = map.find(e => e.iso === 'agarabi').bases;
for (const b of basesToCheck) {
  console.log(`Base ${b} use count:`, baseUseCount.get(b));
}
console.log('agarabi catalog entry:', catalogByIso.get('agarabi'));
