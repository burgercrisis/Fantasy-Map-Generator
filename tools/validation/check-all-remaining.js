/**
 * All Remaining Short Bases Checker
 * 
 * Scans all continent-based namebase entries for entries with fewer than 5 cities.
 * Shows all problematic entries in a single pass for comprehensive review.
 * Uses the new continent-based namebase system.
 * 
 * Usage:
 *   node tools/validation/check-all-remaining.js
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

console.log('\n=== CHECKING ALL ENTRIES WITH <5 CITIES ===\n');

const namebases = loadContinentNamebases();
let count = 0;
const maxDisplay = 30;
const problematic = [];

for (const nb of namebases) {
  if (!nb || !nb.b) continue;
  
  const cities = nb.b.split(',');
  if (cities.length < 5) {
    count++;
    if (count <= maxDisplay) {
      const index = typeof nb.i === 'number' ? nb.i : '?';
      console.log(`Index ${index}: ${nb.name} (${cities.length} cities) [${nb._sourceFile || 'unknown'}]`);
    }
    problematic.push({ index: nb.i, name: nb.name, count: cities.length, source: nb._sourceFile });
  }
}

if (count > maxDisplay) {
  console.log(`... and ${count - maxDisplay} more`);
}

console.log(`\nTotal entries with <5 cities: ${count}`);

const byContinent = {};
for (const p of problematic) {
  const source = p.source || 'unknown';
  if (!byContinent[source]) byContinent[source] = 0;
  byContinent[source]++;
}

console.log('\n=== BY SOURCE FILE ===');
for (const [source, num] of Object.entries(byContinent)) {
  console.log(`  ${source}: ${num}`);
}
