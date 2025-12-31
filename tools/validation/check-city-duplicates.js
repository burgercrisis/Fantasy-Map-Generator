const fs = require('fs');

const content = fs.readFileSync('modules/namebases-real.js', 'utf-8');
const lines = content.split('\n');

// Find lines with duplicate city names in b field
const problematicLines = [];

lines.forEach((line, index) => {
  if (line.includes('{ name:') && line.includes('b:')) {
    const bMatch = line.match(/b: "([^"]+)"/);
    if (bMatch) {
      const b = bMatch[1];
      const cities = b.split(',');
      const uniqueCities = new Set(cities);

      // Check if there are duplicates (more cities than unique or way too many cities)
      if (cities.length > 12 || (cities.length > 20 && uniqueCities.size < cities.length * 0.3)) {
        problematicLines.push({
          lineNum: index + 1,
          name: line.match(/name: "([^"]+)"/)?.[1] || 'Unknown',
          totalCities: cities.length,
          uniqueCities: uniqueCities.size,
          b: b.substring(0, 100) + '...'
        });
      }
    }
  }
});

console.log(`Found ${problematicLines.length} lines with duplicate city issues:\n`);

problematicLines.slice(0, 20).forEach((item, i) => {
  console.log(`${i + 1}. Line ${item.lineNum}: "${item.name}"`);
  console.log(`   Total cities: ${item.totalCities}, Unique: ${item.uniqueCities}`);
  console.log(`   Preview: ${item.b}\n`);
});

if (problematicLines.length > 20) {
  console.log(`... and ${problematicLines.length - 20} more`);
}