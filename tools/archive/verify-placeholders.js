"use strict";

const fs = require('fs');
eval(fs.readFileSync('modules/namebases-real.js', 'utf8'));
const namebases = window.realWorldNameBases;

console.log('\n=== CHECKING LINES 425-539 FOR PLACEHOLDERS ===\n');
console.log('Lines 425-475 (first 50 entries):\n');

const placeholders = [];
for (let i = 424; i < Math.min(539, namebases.length); i++) {
  const nb = namebases[i];
  if (!nb || !nb.b) continue;
  
  const cities = nb.b.split(',');
  if (cities.length < 6 && cities.length > 0) {
    const sample = cities.slice(0, 3).join(',');
    if (cities[0].includes(nb.name.substring(0, 4).toLowerCase()) ||
        cities[0].includes(nb.name.replace(/[^a-zA-Z]/g, '').toLowerCase())) {
      placeholders.push({
        line: i + 1,
        name: nb.name,
        count: cities.length,
        firstCities: sample,
        fullBase: nb.b.substring(0, 60)
      });
    }
  }
}

console.log(`Found ${placeholders.length} potential placeholders:\n`);
placeholders.slice(0, 20).forEach(p => {
  console.log(`Line ${p.line}: ${p.name} (${p.count} cities)`);
  console.log(`  First: ${p.firstCities}`);
  console.log(`  Full: ${p.fullBase}...`);
});

if (placeholders.length === 0) {
  console.log('No obvious placeholders found in lines 425-539');
  console.log('\nChecking total namebases...');
  const totalPlaceholders = namebases.filter(nb => {
    if (!nb.b) return false;
    const cities = nb.b.split(',');
    const first = cities[0] || '';
    const nameBase = nb.name.replace(/[^a-zA-Z]/g, '').toLowerCase();
    return first.includes(nameBase) || cities.length < 4;
  });
  console.log(`Total with obvious placeholders: ${totalPlaceholders.length}`);
}
