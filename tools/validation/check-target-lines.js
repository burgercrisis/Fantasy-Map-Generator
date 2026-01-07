/**
 * Target Entries Placeholder Checker
 * 
 * Checks a predefined set of entry indices for placeholder entries.
 * Scans for entries with fewer than 5 cities as indicators of incomplete data.
 * Used to track progress on specific entries requiring attention.
 * Uses the new continent-based namebase system.
 * 
 * Usage:
 *   node tools/validation/check-target-lines.js
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
        namebases.push(...window[globalName]);
      }
    }
  }
  return namebases;
}

console.log('\n=== CHECKING USER-MENTIONED ENTRIES ===');

const targetIndices = [406, 426, 427, 428, 429, 430, 434, 435, 438, 439, 4451, 468, 475, 480, 481, 488, 486, 491, 493, 497, 498, 500, 501, 506, 508, 510, 523, 525, 539, 359, 362, 393, 399, 400, 401, 402, 405, 406, 408, 411, 412, 414, 431, 433, 434, 407, 408, 409, 410, 411, 412, 413, 414, 415, 416, 417, 418];

const namebases = loadContinentNamebases();
const byIndex = new Map(namebases.filter(n => typeof n.i === 'number').map(n => [n.i, n]));

let foundCount = 0;

targetIndices.forEach(index => {
  const nb = byIndex.get(index);
  if (!nb || !nb.b) return;
  
  const cities = nb.b.split(',');
  const firstCity = cities[0] || '';
  
  if (cities.length < 5) {
    foundCount++;
    console.log(`Index ${index}: ${nb.name} (${cities.length} cities)`);
    console.log(`  First: ${firstCity}`);
    console.log(`  Full: ${nb.b.substring(0, 60)}...`);
  }
});

console.log('\n=== SUMMARY ===');
console.log(`Total namebase entries loaded: ${namebases.length}`);
console.log(`Target entries checked: ${targetIndices.length}`);
console.log(`Entries with <5 cities found: ${foundCount}`);
