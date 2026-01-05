// Quick script to examine Japanese entry in namebases-asia.js
const fs = require('fs');

const content = fs.readFileSync('modules/namebases-asia.js', 'utf8');
const lines = content.split('\n');

// Find Japanese (dedicated)
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('Japanese (dedicated)')) {
    console.log(`=== Japanese entry at line ${i + 1} ===`);
    const start = Math.max(0, i - 2);
    const end = Math.min(lines.length, i + 15);
    
    for (let j = start; j < end; j++) {
      console.log(`${j + 1}: ${lines[j]}`);
    }
    break;
  }
}