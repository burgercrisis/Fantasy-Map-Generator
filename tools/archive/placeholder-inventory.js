"use strict";

const fs = require('fs');
eval(fs.readFileSync('modules/namebases-real.js', 'utf8'));
const namebases = window.realWorldNameBases;

let needsExpansion = 0;
const entries425toEnd = namebases.slice(424);

console.log('\n=== PLACEHOLDER INVENTORY (Lines 425 onwards) ===\n');
console.log(`Total entries from line 425: ${entries425toEnd.length}\n`);

console.log('== ENTRIES WITH < 5 CITIES (NEED EXPANSION) ==');
for (let i = 0; i < Math.min(20, entries425toEnd.length); i++) {
  const nb = entries425toEnd[i];
  if (!nb.b) continue;
  const cities = nb.b.split(',');
  if (cities.length < 5) {
    console.log(`Line ${425 + i}: ${nb.name} (${cities.length} cities) - ${nb.b.substring(0, 50)}...`);
    needsExpansion++;
  }
}

console.log(`\nTotal entries needing expansion: ${needsExpansion}\n`);

console.log('== SAMPLE OF ENTRIES TO FIX ==');
console.log('Examples (first 10 with minimal bases):');
let count = 0;
for (const nb of entries425toEnd) {
  if (count >= 10) break;
  if (!nb.b) continue;
  const cities = nb.b.split(',');
  if (cities.length >= 3 && cities.length <= 5) {
    console.log(`- ${nb.name}: ${nb.b}`);
    count++;
  }
}

console.log('\n== ACTION PLAN ==');
console.log('1. Research authentic cities for each language');
console.log('2. Create replacement entries with 6-10 authentic cities');
console.log('3. Replace in batches of 20-30 entries');
console.log('4. Test each batch in application');
console.log('\n== NOTE ==');
console.log('This will require ongoing work. Each replacement needs research.');
console.log('Preserve all improvements (no "(dedicated)" suffixes, unique indices)');
