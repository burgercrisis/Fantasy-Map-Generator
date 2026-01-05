// Quick script to examine more European language entries in namebases-europe.js
const fs = require('fs');

const content = fs.readFileSync('modules/namebases-europe.js', 'utf8');
const lines = content.split('\n');

function findNextDedicated(startIndex) {
  for (let i = startIndex; i < lines.length; i++) {
    if (lines[i].includes('(dedicated)') && !lines[i].includes('Swedish (dedicated)') && 
        !lines[i].includes('Latvian (dedicated)') && !lines[i].includes('Lithuanian (dedicated)')) {
      return i;
    }
  }
  return -1;
}

// Find the next few dedicated entries after Swedish, Latvian, Lithuanian
let startIndex = 0;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('Lithuanian (dedicated)')) {
    startIndex = i + 1;
    break;
  }
}

console.log(`Looking for dedicated entries starting from index ${startIndex}...`);

for (let j = 0; j < 5; j++) { // Find next 5 dedicated entries
  const foundIndex = findNextDedicated(startIndex);
  if (foundIndex !== -1) {
    console.log(`\n=== Found dedicated entry at line ${foundIndex + 1} ===`);
    const start = Math.max(0, foundIndex - 2);
    const end = Math.min(lines.length, foundIndex + 12);
    
    for (let i = start; i < end; i++) {
      console.log(`${i + 1}: ${lines[i]}`);
    }
    startIndex = foundIndex + 1;
  } else {
    break;
  }
}