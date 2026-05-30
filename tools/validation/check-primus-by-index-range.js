/**
 * Range Checker for Primus Placeholders
 * 
 * Scans entries by index range for Primus placeholders.
 * Shows progress of placeholder replacement in that range.
 * Displays sample replacements made in the checked area.
 * Uses the new continent-based namebase system.
 * 
 * Usage:
 *   node tools/validation/check-range.js [startIndex] [endIndex]
 *   Default range: 2150-2250
 */

const fs = require('fs');
const path = require('path');

const CONTINENT_FILES = [
  'modules/namebases-africa.js',
  'modules/namebases-asia.js',
  'modules/namebases-europe.js',
  'modules/namebases-northAmerica.js',
  'modules/namebases-southAmerica.js',
  'modules/namebases-oceania.js'
];

function loadContinentNamebases() {
  const namebases = [];
  for (const file of CONTINENT_FILES) {
    if (fs.existsSync(file)) {
      eval(fs.readFileSync(file, 'utf8'));
      const varName = file.replace('modules/namebases-', '').replace('.js', '');
      const capitalized = varName.charAt(0).toUpperCase() + varName.slice(1);
      const globalName = capitalized + 'NameBases';
      if (window[globalName] && Array.isArray(window[globalName])) {
        for (const nb of window[globalName]) {
          nb._sourceFile = path.basename(file);
        }
        namebases.push(...window[globalName]);
      }
    }
  }
  return namebases;
}

const startIndex = parseInt(process.argv[2] || '2150', 10);
const endIndex = parseInt(process.argv[3] || '2250', 10);

console.log(`\n=== CHECKING ENTRIES ${startIndex}-${endIndex} ===\n`);

const namebases = loadContinentNamebases();
const byIndex = new Map(namebases.filter(n => typeof n.i === 'number').map(n => [n.i, n]));

let primusInRange = 0;
const entriesInRange = [];

for (let i = startIndex; i <= endIndex; i++) {
  const nb = byIndex.get(i);
  if (nb && nb.b) {
    if (nb.b.includes('Primus')) {
      primusInRange++;
      console.log(`Index ${i}: ${nb.name} (from ${nb._sourceFile || 'unknown'})`);
      console.log(`  ${nb.b.substring(0, 100)}...`);
    }
    entriesInRange.push({ index: i, name: nb.name, hasPrimus: nb.b.includes('Primus'), source: nb._sourceFile });
  }
}

console.log(`\nPrimus entries in indices ${startIndex}-${endIndex}: ${primusInRange}`);
console.log(`Total entries in range: ${entriesInRange.length}`);

const nonPrimus = entriesInRange.filter(e => !e.hasPrimus);
if (nonPrimus.length > 0) {
  console.log(`\n--- Sample of non-Primus entries in range ---`);
  nonPrimus.slice(0, 5).forEach(e => {
    console.log(`Index ${e.index}: ${e.name} (from ${e.source})`);
  });
}
