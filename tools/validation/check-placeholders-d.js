"use strict";

const fs = require('fs');

const content = fs.readFileSync('modules/namebases-real.js', 'utf8');

// Count occurrences of d: "lnrt"
const lnrtMatches = content.match(/d:\s*"lnrt"/g);
const lnrtCount = lnrtMatches ? lnrtMatches.length : 0;

// Count all d: "..." patterns
const dMatches = content.match(/d:\s*"[^"]*"/g);
const dCount = dMatches ? dMatches.length : 0;

console.log('Entries with d: "lnrt":', lnrtCount);
console.log('Total d entries:', dCount);
console.log('Percentage:', ((lnrtCount / dCount) * 100).toFixed(1) + '%');

// Show d value distribution
const dCounts = {};
content.replace(/d:\s*"([^"]*)"/g, (match, d) => {
  dCounts[d] = (dCounts[d] || 0) + 1;
});

console.log('\nd value distribution:');
Object.entries(dCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 15) // Show top 15
  .forEach(([d, count]) => {
    console.log(`  "${d}": ${count}`);
  });
