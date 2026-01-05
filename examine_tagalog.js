// Quick script to examine Tagalog entry in namebases-asia.js
const fs = require('fs');

const content = fs.readFileSync('modules/namebases-asia.js', 'utf8');
const lines = content.split('\n');

// Find Tagalog (dedicated)
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('Tagalog (dedicated)')) {
    console.log(`=== Tagalog entry at line ${i + 1} ===`);
    const start = Math.max(0, i - 2);
    const end = Math.min(lines.length, i + 15);
    
    for (let j = start; j < end; j++) {
      console.log(`${j + 1}: ${lines[j]}`);
    }
    break;
  }
}