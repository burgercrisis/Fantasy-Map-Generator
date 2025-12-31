"use strict";

const fs = require('fs');
eval(fs.readFileSync('modules/namebases-real.js', 'utf8'));
const namebases = window.realWorldNameBases;

console.log('\n=== CHECKING REMAINING USER-MENTIONED LINES ===\n');

const targetLines = [406, 426, 427, 438, 451, 469, 472, 474, 475, 480, 481, 484, 486, 488, 491, 493, 500, 506, 508, 510, 523, 359, 362, 363, 386, 387, 389, 390, 391, 392, 393, 399, 400, 401, 402, 405, 409, 414];

let placeholdersFound = [];

targetLines.forEach(lineNum => {
  if (lineNum - 1 < namebases.length) {
    const nb = namebases[lineNum - 1];
    if (!nb || !nb.b) return;
    
    const cities = nb.b.split(',');
    const firstCity = cities[0] || '';
    
    if (cities.length < 5 && firstCity.toLowerCase().includes(nb.name.replace(/[^a-zA-Z]/g, '').toLowerCase())) {
      placeholdersFound.push({
        line: lineNum,
        name: nb.name,
        count: cities.length,
        firstCity: firstCity,
        sample: nb.b.substring(0, 50)
      });
    }
  }
});

console.log(`Total user-mentioned lines: ${targetLines.length}`);
console.log(`Placeholders found in user-mentioned lines: ${placeholdersFound.length}\n`);

if (placeholdersFound.length > 0) {
  console.log('=== PLACEHOLDERS IN USER-MENTIONED LINES ===');
  placeholdersFound.forEach(p => {
    console.log(`Line ${p.line}: ${p.name}`);
    console.log(`  First city: ${p.firstCity} (${p.count} cities)`);
    console.log(`  Sample: ${p.sample.substring(0, 60)}...`);
  });
} else {
  console.log('\n✓ No placeholders found in user-mentioned lines');
  console.log('All placeholders have been replaced!\n');
}

console.log('\n=== SUMMARY ===');
console.log(`Total namebases: ${namebases.length}`);
