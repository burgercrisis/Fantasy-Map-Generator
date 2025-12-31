const fs = require('fs');

// Read backup file to find good click language entries
const backupContent = fs.readFileSync('modules/namebases-real.js.backup-2025-12-23T14-13-48-162Z', 'utf-8');

const lines = backupContent.split('\n');
const clickEntries = [];

for (const line of lines) {
  if (line.includes('Click') && line.includes('i: 3')) {
    // Find entry number for click languages (they're in 353-364 range)
    const match = line.match(/i:\s*(\d{3})/);
    if (match) {
      const index = parseInt(match[1]);
      if (index >= 353 && index <= 364) {
        clickEntries.push({ line, index });
      }
    }
  }
}

console.log(`Found ${clickEntries.length} click entries in backup:`);
for (const entry of clickEntries) {
  console.log(`Index ${entry.index}: ${entry.line.substring(0, 120)}...`);
}
