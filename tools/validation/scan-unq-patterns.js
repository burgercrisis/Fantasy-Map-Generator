const fs = require('fs');

const content = fs.readFileSync('modules/namebases-real.js', 'utf-8');
const lines = content.split('\n');

// Find patterns with unq
const unqPatterns = [];
lines.forEach((line, index) => {
  if (line.includes('unq') && line.includes('b:')) {
    const match = line.match(/b: "([^"]+)"/);
    if (match) {
      unqPatterns.push({ line: index + 1, b: match[1] });
    }
  }
});

console.log(`Found ${unqPatterns.length} lines with unq patterns:`);
unqPatterns.slice(0, 30).forEach((item, i) => {
  console.log(`${i + 1}. Line ${item.line}: ${item.b.substring(0, 80)}...`);
});

if (unqPatterns.length > 30) {
  console.log(`\n... and ${unqPatterns.length - 30} more`);
}