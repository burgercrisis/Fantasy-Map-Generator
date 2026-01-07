/**
 * User-Mentioned Lines Checker
 * 
 * Validates specific entry indices mentioned by users as needing attention.
 * Checks each entry for placeholder patterns indicating incomplete data.
 * Helps track which user-reported entries have been fixed.
 * Uses the new continent-based namebase system.
 * 
 * Usage:
 *   node tools/validation/check-user-lines.js
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

console.log('\n=== CHECKING USER-MENTIONED ENTRIES ===\n');

const targetIndices = [406, 426, 427, 438, 451, 468, 481, 484, 487, 488, 491, 493, 500, 506, 525, 539];

const namebases = loadContinentNamebases();
const byIndex = new Map(namebases.filter(n => typeof n.i === 'number').map(n => [n.i, n]));

const needsFixing = [];

targetIndices.forEach(index => {
  const nb = byIndex.get(index);
  if (!nb || !nb.b) return;
  
  const cities = nb.b.split(',');
  const firstCity = cities[0] || '';
  const nameLower = nb.name.replace(/[^a-zA-Z]/g, '').toLowerCase();
  
  if (cities.length < 5 && firstCity.includes(nameLower + 'a,')) {
    needsFixing.push({
      index: index,
      name: nb.name,
      count: cities.length,
      firstCity: firstCity,
      sample: nb.b.substring(0, 50)
    });
  }
});

console.log(`Entries checked: ${targetIndices.length}`);
console.log(`Issues found: ${needsFixing.length}\n`);

if (needsFixing.length > 0) {
  console.log('\n=== ISSUES REQUIRING FIX ===\n');
  needsFixing.forEach(issue => {
    console.log(`Index ${issue.index}: ${issue.name}`);
    console.log(`  Cities: ${issue.count}`);
    console.log(`  First city: ${issue.firstCity}`);
    console.log(`  Sample: ${issue.sample}`);
  });
  console.log('');
}

if (needsFixing.length === 0) {
  console.log('✓ All user-mentioned entries already fixed!\n');
}
