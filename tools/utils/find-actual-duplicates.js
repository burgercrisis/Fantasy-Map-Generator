const fs = require('fs');

const content = fs.readFileSync('modules/namebases-real.js', 'utf-8');
const lines = content.split('\n');

// Find lines with actual duplicate city names (same city repeated)
const problematicLines = [];

lines.forEach((line, index) => {
  if (line.includes('{ name:') && line.includes('b:')) {
    const bMatch = line.match(/b: "([^"]+)"/);
    if (bMatch) {
      const b = bMatch[1];
      const cities = b.split(',');
      const uniqueCities = new Set(cities);

      // Check if there are duplicates (unique count is less than total)
      if (uniqueCities.size < cities.length) {
        problematicLines.push({
          lineNum: index + 1,
          name: line.match(/name: "([^"]+)"/)?.[1] || 'Unknown',
          totalCities: cities.length,
          uniqueCities: uniqueCities.size,
          duplicates: cities.length - uniqueCities.size,
          b: b
        });
      }
    }
  }
});

console.log(`Found ${problematicLines.length} lines with actual duplicate city names:\n`);

problematicLines.forEach((item, i) => {
  console.log(`${i + 1}. Line ${item.lineNum}: "${item.name}"`);
  console.log(`   Total: ${item.totalCities}, Unique: ${item.uniqueCities}, Duplicates: ${item.duplicates}`);
  console.log(`   First 100 chars: ${item.b.substring(0, 100)}\n`);
});

console.log(`\nTotal problematic entries to fix: ${problematicLines.length}`);