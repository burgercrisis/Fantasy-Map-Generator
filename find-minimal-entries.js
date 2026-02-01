const fs = require('fs');
const content = fs.readFileSync('E:/code/Fantasy-Map-Generator/modules/namebases-asia.js', 'utf8');

// Simple regex to find entries with cities below threshold
const entries = content.match(/\{[^}]*"name":\s*"([^"]*)"[^}]*"b":\s*"([^"]*)"[^}]*\}/g) || [];

console.log('Total entries found:', entries.length);

let needsReview = [];
entries.forEach((entry, idx) => {
  const nameMatch = entry.match(/"name":\s*"([^"]*)"/);
  const bMatch = entry.match(/"b":\s*"([^"]*)"/);
  
  if (nameMatch && bMatch) {
    const name = nameMatch[1];
    const citiesStr = bMatch[1];
    const cities = citiesStr.split(',').filter(c => c.trim().length > 0);
    
    // Check for entries with fewer than 20 cities
    if (cities.length < 20) {
      needsReview.push({ name, count: cities.length, sample: citiesStr.substring(0, 100) });
    }
  }
});

console.log('\nEntries with fewer than 20 cities:');
needsReview.sort((a, b) => a.count - b.count).forEach(e => {
  console.log(`  ${e.name}: ${e.count} cities - "${e.sample}..."`);
});

console.log('\nTotal entries needing review:', needsReview.length);
