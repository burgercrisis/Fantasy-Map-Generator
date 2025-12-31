const fs = require('fs');

const content = fs.readFileSync('modules/namebases-real.js', 'utf-8');

// Extract unique unq patterns
const unqPatternRegex = /(\w+(?:-\w+)*)_\d{5}_unq\d+/g;
const uniquePatterns = new Set();

let match;
while ((match = unqPatternRegex.exec(content)) !== null) {
  const languageName = match[1];
  uniquePatterns.add(languageName);
}

console.log(`Found ${uniquePatterns.size} unique language patterns still with unq placeholders:\n`);

const sortedPatterns = Array.from(uniquePatterns).sort();
sortedPatterns.forEach((pattern, i) => {
  console.log(`${i + 1}. ${pattern}`);
});

// Also check for patterns without the 5-digit number
const simplePatternRegex = /(\w+(?:-\w+)*)_unq\d+/g;
const simplePatterns = new Set();

while ((match = simplePatternRegex.exec(content)) !== null) {
  const languageName = match[1];
  simplePatterns.add(languageName);
}

if (simplePatterns.size > 0 && JSON.stringify([...simplePatterns].sort()) !== JSON.stringify(sortedPatterns)) {
  console.log(`\n\nSimple patterns (without digit suffix):`);
  Array.from(simplePatterns).sort().forEach((pattern, i) => {
    console.log(`${i + 1}. ${pattern}`);
  });
}