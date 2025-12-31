const fs = require('fs');

const content = fs.readFileSync('modules/namebases-real.js', 'utf-8');
const lines = content.split('\n');

// Find patterns with unq and extract unique language names
const unqPatterns = new Map();
lines.forEach((line, index) => {
  if (line.includes('unq') && line.includes('b:')) {
    const match = line.match(/b: "([^"]+)"/);
    if (match) {
      const b = match[1];
      // Extract the language name (before _unq)
      const unqMatches = b.match(/(\w+(?:-\w+)*)(?:_\d+)?_unq\d+/g);
      if (unqMatches) {
        const languageName = unqMatches[0].replace(/_\d+_unq\d+/, '');
        if (!unqPatterns.has(languageName)) {
          unqPatterns.set(languageName, []);
        }
        unqPatterns.get(languageName).push({ line: index + 1, full: b.substring(0, 100) });
      }
    }
  }
});

console.log(`Found ${unqPatterns.size} unique language patterns with unq placeholders:\n`);

let count = 0;
for (const [language, entries] of unqPatterns) {
  count++;
  console.log(`${count}. ${language}`);
  if (count >= 50) break;
}