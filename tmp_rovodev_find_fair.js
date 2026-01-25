const fs = require('fs');

// Find the specific fair quality entry (60-79 score)
console.log('=== Finding Fair Quality Entry (60-79) ===\n');

const content = fs.readFileSync('docs/reports/consolidated-quality-metrics.csv', 'utf8');
const lines = content.split('\n');

// Skip header
for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes(',60,79')) {
    const parts = line.split(',');
    console.log(`Found fair entry at line ${i}:`);
    console.log(`  Language: ${parts[0]}`);
    console.log(`  Index: ${parts[1]}`);
    console.log(`  Score: ${parts[12]}`);
    console.log(`  Continent: ${parts[3]}`);
    console.log(`  File: ${parts[5]}`);
    break;
  }
}