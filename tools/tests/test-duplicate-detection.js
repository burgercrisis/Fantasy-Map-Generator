const fs = require('fs');

const content = fs.readFileSync('modules/namebases-real.js', 'utf-8');
const lines = content.split('\n');

// Test with specific problematic line
const testLine = lines.find(line => line.includes('Kyakhta Russian-Chinese Pidgin'));
if (testLine) {
  const bMatch = testLine.match(/b: "([^"]+)"/);
  if (bMatch) {
    const b = bMatch[1];
    const cities = b.split(',');
    const uniqueCities = new Set(cities);

    console.log('Test line analysis:');
    console.log('Total cities:', cities.length);
    console.log('Unique cities:', uniqueCities.size);
    console.log('Has duplicates:', uniqueCities.size < cities.length);

    console.log('\nFirst 15 cities:');
    cities.slice(0, 15).forEach((city, i) => console.log(`  ${i}: ${city}`));
  }
}

// Now find all lines with duplicates
const problematicLines = [];

lines.forEach((line, index) => {
  if (line.includes('{ name:') && line.includes('b:')) {
    const bMatch = line.match(/b: "([^"]+)"/);
    if (bMatch) {
      const b = bMatch[1];
      const cities = b.split(',');
      const uniqueCities = new Set(cities);

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

console.log(`\n\nFound ${problematicLines.length} lines with duplicate city names:\n`);

problematicLines.slice(0, 30).forEach((item, i) => {
  console.log(`${i + 1}. Line ${item.lineNum}: "${item.name}"`);
  console.log(`   Total: ${item.totalCities}, Unique: ${item.uniqueCities}, Duplicates: ${item.duplicates}\n`);
});