"use strict";

/**
 * Backup Files Lister
 * 
 * Lists all continent namebase backup files in the modules directory.
 * Shows file names, sizes, and identifies the most recent backup per continent.
 * 
 * Usage:
 *   node tools/validation/check-backups.js
 */

const fs = require('fs');
const path = require('path');

const modulesDir = 'modules';
const continentPatterns = [
  'namebases-africa.js.backup',
  'namebases-asia.js.backup',
  'namebases-europe.js.backup',
  'namebases-northAmerica.js.backup',
  'namebases-southAmerica.js.backup',
  'namebases-oceania.js.backup',
  'namebases-fantasy.js.backup'
];
const legacyPattern = 'namebases-real.js.backup';

console.log('\n=== CONTINENT BACKUP FILES ===\n');

let totalBackups = 0;
const continents = {};

continentPatterns.forEach(pattern => {
  const continent = pattern.replace('namebases-', '').replace('.js.backup', '');
  const backups = fs.readdirSync(modulesDir)
    .filter(f => f.startsWith(pattern))
    .sort();
  
  if (backups.length > 0) {
    continents[continent] = backups;
    totalBackups += backups.length;
    console.log(`[${continent}]`);
    backups.forEach(f => {
      const stats = fs.statSync(path.join(modulesDir, f));
      console.log(`  ${f} (${stats.size} bytes)`);
    });
    console.log('');
  }
});

console.log('=== LEGACY MONOLITHIC BACKUPS ===\n');
const legacyBackups = fs.readdirSync(modulesDir)
  .filter(f => f.startsWith(legacyPattern))
  .sort();

legacyBackups.forEach(f => {
  const stats = fs.statSync(path.join(modulesDir, f));
  console.log(`${f} (${stats.size} bytes)`);
});

console.log('\n=== SUMMARY ===\n');
console.log(`Total continent backups: ${totalBackups}`);
console.log(`Total legacy backups: ${legacyBackups.length}`);
const allBackups = fs.readdirSync(modulesDir)
  .filter(f => f.includes('.js.backup') || f.includes('.backup-'))
  .length;
console.log(`Total all backups: ${allBackups}`);