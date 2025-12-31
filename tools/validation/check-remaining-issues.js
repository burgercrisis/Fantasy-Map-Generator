"use strict";

const fs = require('fs');
const filePath = 'modules/namebases-real.js';
const content = fs.readFileSync(filePath, 'utf8');

console.log('\n=== CHECKING FOR REMAINING ISSUES ===\n');

if (content.includes('Big Flowery')) {
  console.log('✗ "Big Flowery" still exists');
} else {
  console.log('✓ "Big Flowery" removed');
}

if (content.includes('BPh')) {
  console.log('✗ "BPh" still exists');
} else {
  console.log('✓ "BPh" removed');
}

if (content.includes('Riangular')) {
  console.log('✗ "Riangular" still exists');
} else {
  console.log('✓ "Riangular" removed');
}

const entries = content.split('\n').filter(l => l.includes('{ name:'));
console.log(`\nTotal entries: ${entries.length}\n`);

const primus = content.match(/Primus/g);
if (primus) {
  console.log(`✗ Found ${primus.length} Primus placeholders`);
} else {
  console.log('✓ No Primus placeholders');
}

const dedicated = content.match(/\(dedicated\)/g);
if (dedicated) {
  console.log(`✗ Found ${dedicated.length} "(dedicated)" suffixes`);
} else {
  console.log('✓ No "(dedicated)" suffixes');
}
