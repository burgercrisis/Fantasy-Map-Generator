"use strict";

const fs = require('fs');
const filePath = 'modules/namebases-real.js';
let content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

const suspiciousEntries = [
  { name: 'Bum', reason: 'fake language' },
  { name: 'Ita', reason: 'fake abbreviation' },
  { name: 'Big Flowery', reason: 'fake language' },
  { name: 'BPh', reason: 'abbreviation' }
];

let removed = 0;
const result = [];

lines.forEach(line => {
  const trimmed = line.trim();
  let shouldRemove = false;
  
  suspiciousEntries.forEach(entry => {
    if (line.includes(`name: "${entry.name}"`) ||
        line.includes(`name: '${entry.name}'`)) {
      shouldRemove = true;
      console.log(`Removing: ${entry.name} (${entry.reason})`);
      removed++;
    }
  });
  
  if (!shouldRemove) {
    result.push(line);
  }
});

if (removed > 0) {
  fs.writeFileSync(filePath, result.join('\n'), 'utf8');
  console.log(`\n✓ Removed ${removed} suspicious entries\n`);
} else {
  console.log('\nNo suspicious entries found\n');
}
