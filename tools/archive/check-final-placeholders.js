"use strict";

const fs = require('fs');
eval(fs.readFileSync('modules/namebases-real.js', 'utf8'));
const namebases = window.realWorldNameBases;

console.log('\n=== CHECKING FOR REMAINING PLACEHOLDERS ===\n');

let count = 0;
const placeholders = [];

for (let i = 0; i < namebases.length; i++) {
  const nb = namebases[i];
  if (!nb || !nb.b) continue;
  
  const name = nb.name.replace(/[^a-zA-Z]/g, '').toLowerCase();
  const bases = nb.b.split(',');
  
  if (bases.length < 5 && bases[0].includes(name + 'a,')) {
    count++;
    placeholders.push({
      line: i + 1,
      name: nb.name,
      count: bases.length
    });
  }
}

console.log(`Total remaining placeholders: ${count}\n`);

if (count > 0) {
  console.log('Placeholders found:');
  placeholders.forEach(p => {
    console.log(`  Line ${p.line}: ${p.name} (${p.count} cities)`);
  });
} else {
  console.log('✓ No placeholders found - all fixed!\n');
}

console.log('\n=== SUMMARY ===\n');
console.log(`Total namebases: ${namebases.length}`);
console.log(`Remaining placeholders: ${count}`);
console.log(`Quality: ${Math.round((namebases.length - count) / namebases.length * 100)}%`);
