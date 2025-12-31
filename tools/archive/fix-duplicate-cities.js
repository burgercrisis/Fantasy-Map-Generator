const fs = require('fs');

const content = fs.readFileSync('modules/namebases-real.js', 'utf-8');
const lines = content.split('\n');
let fixCount = 0;

console.log('Fixing duplicate city names...\n');

const fixedLines = lines.map((line, index) => {
  if (line.includes('{ name:') && line.includes('b:')) {
    const bMatch = line.match(/b: "([^"]+)"/);
    if (bMatch) {
      const b = bMatch[1];
      const cities = b.split(',');
      const uniqueCities = [...new Set(cities)]; // Remove duplicates

      if (uniqueCities.length !== cities.length) {
        const name = line.match(/name: "([^"]+)"/)?.[1] || 'Unknown';
        console.log(`Line ${index + 1}: "${name}" - ${cities.length} → ${uniqueCities.length} (removed ${cities.length - uniqueCities.length} duplicates)`);
        fixCount++;

        // Replace b field with unique cities
        const newB = uniqueCities.join(',');

        // Keep everything before b: and replace the b: field
        const beforeB = line.substring(0, bMatch.index);
        const afterB = line.substring(bMatch.index + bMatch[0].length);
        return `${beforeB}b: "${newB}"${afterB}`;
      }
    }
  }
  return line;
});

console.log(`\nTotal lines fixed: ${fixCount}`);

if (fixCount > 0) {
  fs.writeFileSync('modules/namebases-real.js', fixedLines.join('\n'), 'utf-8');
  console.log('✓ File updated with deduplicated city lists');
} else {
  console.log('✗ No duplicates found to fix');
}