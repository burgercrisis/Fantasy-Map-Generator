"use strict";

const fs = require('fs');

const content = fs.readFileSync('modules/namebases-real.js', 'utf8');

// Extract all entries with nic-GH
const entries = [];
const regex = /\{([^}]*name:\s*"([^"]+)"[^}]*)\}/g;
let match;

while ((match = regex.exec(content)) !== null) {
  const fullEntry = match[0];
  const name = match[2];

  // Check if this entry has d: "nic-GH"
  if (fullEntry.includes('d: "nic-GH"')) {
    entries.push(name);
  }
}

console.log(`Languages with d: "nic-GH" (${entries.length} total):`);
console.log('========================================');

// Display in columns
const cols = 4;
for (let i = 0; i < entries.length; i += cols) {
  const row = entries.slice(i, i + cols);
  console.log(row.map(name => name.padEnd(30)).join(''));
}

console.log('\n\nFirst 50 entries:');
entries.slice(0, 50).forEach(name => {
  console.log(`  - ${name}`);
});
