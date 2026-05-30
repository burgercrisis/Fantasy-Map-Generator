/**
 * Single Entry Inspector
 * 
 * Displays the content of a specific entry by index.
 * Used for quick inspection of specific problematic entries.
 * Uses the new continent-based namebase system.
 * 
 * Usage:
 *   node tools/validation/check-line-1857.js [index]
 *   Default index: 1857
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

const targetIndex = parseInt(process.argv[2] || '1857', 10);

console.log(`\n=== INSPECTING ENTRY AT INDEX ${targetIndex} ===\n`);

const namebases = loadContinentNamebases();
const byIndex = new Map(namebases.filter(n => typeof n.i === 'number').map(n => [n.i, n]));

const entry = byIndex.get(targetIndex);

if (entry) {
  console.log(`Found entry at index ${targetIndex}:`);
  console.log(`  Name: ${entry.name}`);
  console.log(`  Index (i): ${entry.i}`);
  console.log(`  Source file: ${entry._sourceFile || 'unknown'}`);
  console.log(`  Min: ${entry.min}, Max: ${entry.max}`);
  console.log(`  Diversity (d): ${entry.d}`);
  console.log(`  Multiplier (m): ${entry.m}`);
  console.log(`  Cities count: ${entry.b ? entry.b.split(',').length : 0}`);
  console.log(`  First 5 cities: ${entry.b ? entry.b.split(',').slice(0, 5).join(', ') : 'N/A'}`);
  console.log(`\n  Full cities list:\n  ${entry.b}`);
} else {
  console.log(`Entry at index ${targetIndex} not found.`);
  console.log(`\nAvailable indices sample: ${Array.from(byIndex.keys()).slice(0, 20).join(', ')}...`);
  console.log(`Total entries: ${byIndex.size}`);
}
