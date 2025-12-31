"use strict";

const fs = require('fs');
eval(fs.readFileSync('modules/namebases-real.js', 'utf8'));
const namebases = window.realWorldNameBases;

console.log('\n=== COMPREHENSIVE STATE CHECK ===\n');
console.log(`Total namebases: ${namebases.length}\n`);

let smallBases = [];
let trailingSpaces = [];
let fakeNames = [];

namebases.forEach((nb, idx) => {
  if (!nb.name) return;
  const cities = nb.b ? nb.b.split(',') : [];
  
  if (cities.length < 3) {
    smallBases.push({ idx: idx + 1, name: nb.name, count: cities.length });
  }
  
  if (nb.name !== nb.name.trim()) {
    trailingSpaces.push({ idx: idx + 1, name: nb.name, trimmed: nb.name.trim() });
  }
  
  const lowerName = nb.name.toLowerCase();
  if (lowerName.includes('riangular') || lowerName.includes('big flowery') || lowerName === 'bph' || lowerName === 'ita' || lowerName === 'bum') {
    fakeNames.push({ idx: idx + 1, name: nb.name });
  }
});

console.log(`=== SMALL BASES (< 3 cities) ===`);
console.log(`Count: ${smallBases.length}\n`);
smallBases.forEach(s => console.log(`  Line ${s.idx}: ${s.name} (${s.count} cities)`));

console.log(`\n=== TRILING SPACES ===`);
console.log(`Count: ${trailingSpaces.length}\n`);
trailingSpaces.forEach(s => console.log(`  Line ${s.idx}: "${s.name}"`));

console.log(`\n=== FAKE/SUSPICIOUS NAMES ===`);
console.log(`Count: ${fakeNames.length}\n`);
fakeNames.forEach(s => console.log(`  Line ${s.idx}: ${s.name}`));

const primus = namebases.filter(nb => nb.b && nb.b.includes('Primus'));
console.log(`\n=== PRIMUS PLACEHOLDERS ===`);
console.log(`Count: ${primus.length}\n`);
primus.forEach(nb => console.log(`  Index ${nb.i}: ${nb.name}`));

const dedicated = namebases.filter(nb => nb.name.includes('(dedicated)'));
console.log(`\n=== "(DEDICATED)" SUFFIXES ===`);
console.log(`Count: ${dedicated.length}\n`);

const uniqueIndices = new Set(namebases.map(nb => nb.i));
console.log(`\n=== INDEX UNIQUENESS ===`);
console.log(`Total indices: ${namebases.length}`);
console.log(`Unique indices: ${uniqueIndices.size}`);
console.log(`Duplicates: ${namebases.length - uniqueIndices.size}`);

console.log('\n=== SUMMARY ===\n');
console.log(`✓ Primus placeholders: ${primus.length} (should be 0)`);
console.log(`✓ "(dedicated)" suffixes: ${dedicated.length} (should be 0 after renames)`);
console.log(`✓ Fake/suspicious: ${fakeNames.length} (should be 0)`);
console.log(`✓ Small bases: ${smallBases.length} (should be expanded)`);
console.log(`✓ Trailing spaces: ${trailingSpaces.length} (should be 0)`);
console.log(`✓ Duplicate indices: ${namebases.length - uniqueIndices.size} (should be 0)`);
console.log('\n');
