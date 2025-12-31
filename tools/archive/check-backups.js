"use strict";

const fs = require('fs');
const path = require('path');

const modulesDir = 'modules';
const backups = fs.readdirSync(modulesDir)
  .filter(f => f.startsWith('namebases-real.js.backup'))
  .sort();

console.log('\n=== BACKUP FILES ===\n');
backups.forEach(f => {
  const stats = fs.statSync(path.join(modulesDir, f));
  console.log(`${f} (${stats.size} bytes)`);
});

console.log('\nMost recent:');
if (backups.length > 0) {
  const latest = backups[backups.length - 1];
  console.log(`Latest backup: ${latest}\n`);
}
