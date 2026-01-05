// Quick script to examine Greek entry in namebases-europe.js
const fs = require('fs');

const content = fs.readFileSync('modules/namebases-europe.js', 'utf8');
const lines = content.split('\n');

// Find Greek (dedicated)
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('Greek (dedicated)')) {
    console.log(`=== Greek entry at line ${i + 1} ===`);
    const start = Math.max(0, i - 2);
    const end = Math.min(lines.length, i + 15);
    
    for (let j = start; j < end; j++) {
      console.log(`${j + 1}: ${lines[j]}`);
    }
    break;
  }
}