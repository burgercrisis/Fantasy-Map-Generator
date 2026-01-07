"use strict";

const { loadAllNamebases } = require('./namebase-loader');

const { allNamebases, metadata } = loadAllNamebases();

console.log('\n=== SCANNING ALL CONTINENT NAMEBASES FOR PLACEHOLDERS ===\n');
console.log('Looking for entries with < 5 cities or placeholder patterns...\n');

const placeholders = [];

for (const nb of allNamebases) {
  if (!nb || !nb.b) continue;

  const cities = nb.b.split(',');
  const firstCity = cities[0] || '';

  const isPlaceholder =
    cities.length < 4 ||
    firstCity.length < 4 ||
    cities.some(c => c.includes(nb.name.substring(0, 3).toLowerCase())) ||
    firstCity.includes(nb.name.replace(/[^a-zA-Z]/g, '').toLowerCase());

  if (isPlaceholder) {
    placeholders.push({
      continent: nb._continent,
      name: nb.name,
      index: nb.i,
      count: cities.length,
      firstCity: firstCity,
      baseSample: nb.b.substring(0, 60)
    });
  }
}

console.log(`=== FOUND ${placeholders.length} POTENTIAL PLACEHOLDERS ===\n`);

console.log('== BREAKDOWN BY CONTINENT ==');
const byContinent = {};
for (const p of placeholders) {
  byContinent[p.continent] = (byContinent[p.continent] || 0) + 1;
}
for (const [continent, count] of Object.entries(byContinent)) {
  console.log(`  ${continent}: ${count}`);
}

console.log('\n== FIRST 30 RESULTS ==\n');
placeholders.slice(0, 30).forEach(p => {
  console.log(`[${p.continent}] ${p.name} (index ${p.index}, ${p.count} cities)`);
  console.log(`  First city: ${p.firstCity}`);
  if (p.baseSample.length < 60) {
    console.log(`  Full base: ${p.baseSample}`);
  }
  console.log('');
});

console.log('=== SUMMARY ===\n');
console.log(`Total entries scanned: ${allNamebases.length}`);
console.log(`Placeholders found: ${placeholders.length}`);
console.log(`Quality: ${Math.round((allNamebases.length - placeholders.length) / allNamebases.length * 100)}%`);
console.log('\nEntries by continent:');
for (const m of metadata) {
  console.log(`  ${m.file}: ${m.count} entries`);
}
console.log('\nNOTE: Some entries may legitimately have fewer cities.');
console.log('Review each placeholder to determine if it needs authentic cities.');
