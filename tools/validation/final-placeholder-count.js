"use strict";

/**
 * Final Placeholder Count Script
 *
 * Counts remaining placeholders in all continent namebase files.
 * Identifies entries where first city contains language name + 'a' suffix
 * indicating placeholder-generated city names needing replacement.
 *
 * Usage:
 *   node tools/validation/final-placeholder-count.js
 */

const { loadAllNamebases } = require('./namebase-loader');

const { allNamebases, metadata } = loadAllNamebases();

console.log('\n=== FINAL PLACEHOLDER CHECK ===\n');

const placeholders = [];

for (const nb of allNamebases) {
  if (!nb || !nb.b) continue;

  const name = nb.name.replace(/[^a-zA-Z]/g, '').toLowerCase();
  const bases = nb.b.split(',');

  if (bases.length < 5 && bases[0].includes(name + 'a,')) {
    placeholders.push({
      continent: nb._continent,
      name: nb.name,
      index: nb.i,
      count: bases.length,
      firstCity: bases[0]
    });
  }
}

console.log(`Total remaining placeholders: ${placeholders.length}\n`);

if (placeholders.length > 0) {
  console.log('== PLACEHOLDERS BY CONTINENT ==');
  const byContinent = {};
  for (const p of placeholders) {
    byContinent[p.continent] = (byContinent[p.continent] || 0) + 1;
  }
  for (const [continent, count] of Object.entries(byContinent)) {
    console.log(`  ${continent}: ${count}`);
  }

  if (placeholders.length <= 50) {
    console.log('\n== DETAILS ==\n');
    placeholders.forEach(p => {
      console.log(`[${p.continent}] ${p.name} (index ${p.index}, ${p.count} cities)`);
      console.log(`  First city: ${p.firstCity}`);
      console.log('');
    });
  }
} else {
  console.log('✓ No placeholders found - all fixed!\n');
}

console.log('=== SUMMARY ===\n');
console.log(`Total namebases: ${allNamebases.length}`);
console.log(`Remaining placeholders: ${placeholders.length}`);
console.log(`Quality: ${Math.round((allNamebases.length - placeholders.length) / allNamebases.length * 100)}%`);

console.log('\n== ENTRIES BY CONTINENT ==');
for (const m of metadata) {
  console.log(`  ${m.file}: ${m.count} entries`);
}
