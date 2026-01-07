"use strict";

const { loadAllNamebases } = require('./namebase-loader');

const { allNamebases, metadata } = loadAllNamebases();

console.log('\n=== FINAL PLACEHOLDER VERIFICATION ===\n');

let countByContinent = {};
let countAll = 0;
const placeholders = [];

for (const nb of allNamebases) {
  if (!nb || !nb.b) continue;

  const cities = nb.b.split(',');
  const firstCity = cities[0] || '';
  const nameBase = nb.name.replace(/[^a-zA-Z]/g, '').toLowerCase();

  if (cities.length < 6 && firstCity.includes(nameBase)) {
    countAll++;
    countByContinent[nb._continent] = (countByContinent[nb._continent] || 0) + 1;
    placeholders.push({
      continent: nb._continent,
      name: nb.name,
      index: nb.i,
      count: cities.length,
      firstCity: firstCity
    });
  }
}

console.log('== PLACEHOLDERS BY CONTINENT ==');
for (const [continent, count] of Object.entries(countByContinent)) {
  console.log(`  ${continent}: ${count}`);
}

console.log('\n== PLACEHOLDER DETAILS ==\n');
for (const p of placeholders) {
  console.log(`[${p.continent}] ${p.name} (index ${p.index}, ${p.count} cities)`);
  console.log(`  First city: ${p.firstCity}`);
  console.log('');
}

console.log('=== FINAL RESULTS ===\n');
console.log(`Total placeholders: ${countAll}`);
console.log(`Total namebases: ${allNamebases.length}`);
console.log(`Quality: ${Math.round((allNamebases.length - countAll) / allNamebases.length * 100)}%`);

console.log('\n== ENTRIES BY CONTINENT ==');
for (const m of metadata) {
  console.log(`  ${m.file}: ${m.count} entries`);
}
