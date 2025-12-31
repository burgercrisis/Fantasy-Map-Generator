"use strict";

const fs = require('fs');
const filePath = 'modules/namebases-real.js';
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');
const result = [];
let removed = 0;

lines.forEach(line => {
  const trimmed = line.trim();
  if (trimmed.includes('name: "Big Flowery "') ||
      trimmed.includes('name: "BPh "') ||
      trimmed.includes('name: "Riangular')) {
    console.log(`Removing: ${trimmed.substring(0, 60)}...`);
    removed++;
  } else {
    result.push(line);
  }
});

if (removed > 0) {
  fs.writeFileSync(filePath, result.join('\n'), 'utf8');
  console.log(`\n✓ Removed ${removed} entries with trailing spaces or fake names\n`);
} else {
  console.log('\nNo entries to remove\n');
}
