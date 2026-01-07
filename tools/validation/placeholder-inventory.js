"use strict";

const { loadAllNamebases } = require('./namebase-loader');

const { allNamebases, metadata } = loadAllNamebases();

console.log('\n=== PLACEHOLDER INVENTORY - ALL CONTINENTS ===\n');

const entriesByContinent = {};
for (const m of metadata) {
  entriesByContinent[m.continent] = m.count;
}

console.log('Entries by continent:');
for (const m of metadata) {
  console.log(`  ${m.file}: ${m.count} entries`);
}
console.log('');

console.log('== ENTRIES WITH < 5 CITIES (NEED EXPANSION) ==\n');

const needsExpansion = [];
for (const nb of allNamebases) {
  if (!nb.b) continue;
  const cities = nb.b.split(',');
  if (cities.length < 5) {
    needsExpansion.push({
      continent: nb._continent,
      name: nb.name,
      index: nb.i,
      count: cities.length,
      baseSample: nb.b.substring(0, 50)
    });
  }
}

console.log(`Total entries needing expansion: ${needsExpansion.length}\n`);

console.log('== SAMPLE ENTRIES NEEDING FIX (first 20) ==\n');
needsExpansion.slice(0, 20).forEach(e => {
  console.log(`[${e.continent}] ${e.name} (index ${e.index}, ${e.count} cities)`);
  console.log(`  ${e.baseSample}...`);
  console.log('');
});

console.log('== BREAKDOWN BY CONTINENT ==');
const byContinent = {};
for (const e of needsExpansion) {
  byContinent[e.continent] = (byContinent[e.continent] || 0) + 1;
}
for (const [continent, count] of Object.entries(byContinent)) {
  const total = entriesByContinent[continent] || 1;
  const pct = Math.round(count / total * 100);
  console.log(`  ${continent}: ${count}/${total} (${pct}%)`);
}

console.log('\n== ACTION PLAN ==');
console.log('1. Research authentic cities for each language');
console.log('2. Create replacement entries with 6-10 authentic cities');
console.log('3. Replace in continent-specific batches');
console.log('4. Test each batch in application');
console.log('\n== NOTE ==');
console.log('This will require ongoing work. Each replacement needs research.');
console.log('Preserve all improvements (no "(dedicated)" suffixes, unique indices)');
