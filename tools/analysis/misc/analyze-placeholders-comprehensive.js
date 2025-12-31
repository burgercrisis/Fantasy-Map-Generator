"use strict";

const fs = require('fs');
eval(fs.readFileSync('modules/namebases-real.js', 'utf8'));
const namebases = window.realWorldNameBases;

console.log('\n=== PLACEHOLDER ANALYSIS (Line 425 onwards) ===\n');

const results = { 
  expansionNeeded: [],
  legitimateVariants: [],
  suspiciousPlaceholders: []
};

namebases.forEach((nb, idx) => {
  if (idx < 424) return;
  
  if (!nb.name || !nb.b) return;
  
  const cities = nb.b.split(',');
  
  if (cities.length < 5) {
    results.expansionNeeded.push({
      index: idx,
      name: nb.name,
      count: cities.length,
      sample: nb.b.substring(0, 50)
    });
  } else if (cities.length < 8) {
    if (nb.name.includes('French') || nb.name.includes('Italian') || 
        nb.name.includes('Spanish') || nb.name.includes('Portuguese') ||
        nb.name.includes('Romanian') || nb.name.includes('Catalan')) {
      results.legitimateVariants.push({
        index: idx,
        name: nb.name,
        count: cities.length,
        sample: nb.b.substring(0, 50)
      });
    } else {
      results.suspiciousPlaceholders.push({
        index: idx,
        name: nb.name,
        count: cities.length,
        sample: nb.b.substring(0, 50)
      });
    }
  }
});

console.log(`\n== NEEDS EXPANSION (< 5 cities) ==`);
console.log(`Total: ${results.expansionNeeded.length}`);
results.expansionNeeded.slice(0, 20).forEach(r => {
  console.log(`  Index ${r.index}: ${r.name} (${r.count} cities)`);
  console.log(`    Sample: ${r.sample}...`);
});

console.log(`\n== LEGITIMATE VARIANTS (5-7 cities) ==`);
console.log(`Total: ${results.legitimateVariants.length}`);
results.legitimateVariants.slice(0, 15).forEach(r => {
  console.log(`  Index ${r.index}: ${r.name} (${r.count} cities)`);
});

console.log(`\n== SUSPICIOUS PLACEHOLDERS (5-7 cities, not major dialect) ==`);
console.log(`Total: ${results.suspiciousPlaceholders.length}`);
results.suspiciousPlaceholders.forEach(r => {
  console.log(`  Index ${r.index}: ${r.name} (${r.count} cities)`);
  console.log(`    Sample: ${r.sample}...`);
});

console.log('\n=== TOTAL NEEDING ATTENTION ===');
console.log(`Expansion needed: ${results.expansionNeeded.length}`);
console.log(`Legitimate variants: ${results.legitimateVariants.length}`);
console.log(`Suspicious placeholders: ${results.suspiciousPlaceholders.length}`);
console.log(`Total: ${results.expansionNeeded.length + results.legitimateVariants.length + results.suspiciousPlaceholders.length}`);
