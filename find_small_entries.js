const fs = require('fs');
const content = fs.readFileSync('modules/namebases-europe.js', 'utf8');

// Find all language entries with city counts
const namePattern = /"name": "([^"]+)"/g;
const bPattern = /"b": "([^"]+)"/;

let match;
let results = [];
let entryIndex = 0;

const entries = content.split('\n{');

entries.forEach((entry, idx) => {
  const nameMatch = entry.match(/"name": "([^"]+)"/);
  const bMatch = entry.match(/"b": "([^"]+)"/);
  
  if (nameMatch && bMatch) {
    const cityCount = bMatch[1].split(',').length;
    if (cityCount < 15) {
      console.log(`Entry ${idx}: ${nameMatch[1]} has ${cityCount} cities`);
    }
  }
});
