// Quick script to examine Swedish, Latvian, Lithuanian entries in namebases-europe.js
const fs = require('fs');

const content = fs.readFileSync('modules/namebases-europe.js', 'utf8');
const lines = content.split('\n');

function findEntry(languageName) {
  let found = false;
  let startLine = -1;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(languageName)) {
      found = true;
      startLine = i;
      break;
    }
  }
  
  if (found) {
    console.log(`\n=== ${languageName} Entry ===`);
    // Show 10 lines before and after the found entry
    const start = Math.max(0, startLine - 10);
    const end = Math.min(lines.length, startLine + 15);
    
    for (let i = start; i < end; i++) {
      console.log(`${i + 1}: ${lines[i]}`);
    }
  } else {
    console.log(`${languageName} entry not found`);
  }
}

// Find the priority European languages mentioned in the context
findEntry('Swedish (dedicated)');
findEntry('Latvian (dedicated)');
findEntry('Lithuanian (dedicated)');