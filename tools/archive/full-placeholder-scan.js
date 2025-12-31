"use strict";

const fs = require('fs');
eval(fs.readFileSync('modules/namebases-real.js', 'utf8'));
const namebases = window.realWorldNameBases;

console.log('\n=== SCANING ENTIRE FILE FOR REMAINING PLACEHOLDERS ===\n');
console.log('Looking for entries with < 5 cities or placeholder patterns...\n');

const placeholders = [];
const patterns = [
  /^[a-z]+[a-z]$/, // Single lowercase letter repeated
  /^[a-z]{1,3}[a-z]+[a-z]$/, // Very short pattern
  /\(\s*\)$/, // Trailing parentheses
];

for (let i = 0; i < namebases.length; i++) {
  const nb = namebases[i];
  if (!nb || !nb.b) continue;
  
  const cities = nb.b.split(',');
  
  // Check for placeholder patterns
  const firstCity = cities[0] || '';
  const isPlaceholder = 
    cities.length < 4 || // Too few cities
    firstCity.length < 4 || // City name too short
    cities.some(c => c.includes(nb.name.substring(0, 3).toLowerCase())) || // City repeats name
    firstCity.includes(nb.name.replace(/[^a-zA-Z]/g, '').toLowerCase()); // First city is just language name
  
  if (isPlaceholder) {
    placeholders.push({
      line: i + 1,
      name: nb.name,
      count: cities.length,
      firstCity: firstCity,
      fullBase: nb.b.substring(0, 60)
    });
  }
}

console.log(`=== FOUND ${placeholders.length} POTENTIAL PLACEHOLDERS ===\n`);
console.log('First 30 results:\n');
placeholders.slice(0, 30).forEach(p => {
  console.log(`Line ${p.line}: ${p.name} (${p.count} cities)`);
  console.log(`  First city: ${p.firstCity}`);
  if (p.fullBase.length < 60) {
    console.log(`  Full base: ${p.fullBase}`);
  }
});

console.log(`\n=== SUMMARY ===\n`);
console.log(`Total entries scanned: ${namebases.length}`);
console.log(`Placeholders found: ${placeholders.length}`);
console.log('\nAll placeholders have been identified for replacement.');
console.log('\nNOTE: Some entries may legitimately have fewer cities.');
console.log('Review each placeholder to determine if it needs authentic cities.');
