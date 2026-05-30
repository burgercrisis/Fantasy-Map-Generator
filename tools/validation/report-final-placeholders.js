/**
 * Placeholder Detection Report
 *
 * Final check for remaining placeholders in all continent namebase files.
 * Identifies entries where first city matches pattern: LanguageName + 'a,'
 * Indicates placeholder-generated names needing authentic city replacement.
 *
 * Usage:
 *   node tools/validation/report-final-placeholders.js

const { loadAllNamebases } = require('./namebase-loader');

const { allNamebases } = loadAllNamebases();

console.log('\n=== CHECKING FOR REMAINING PLACEHOLDERS ===\n');

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
      count: bases.length
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

  console.log('\n== PLACEHOLDER DETAILS ==\n');
  placeholders.forEach(p => {
    console.log(`[${p.continent}] ${p.name} (index ${p.index}, ${p.count} cities)`);
  });
  console.log('');
} else {
  console.log('✓ No placeholders found - all fixed!\n');
}

console.log('=== SUMMARY ===\n');
console.log(`Total namebases: ${allNamebases.length}`);
console.log(`Remaining placeholders: ${placeholders.length}`);
console.log(`Quality: ${Math.round((allNamebases.length - placeholders.length) / allNamebases.length * 100)}%`);
