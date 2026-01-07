"use strict";

const fs = require('fs');
const path = require('path');

const CONTINENT_FILES = [
  'namebases-africa.js',
  'namebases-asia.js',
  'namebases-europe.js',
  'namebases-northAmerica.js',
  'namebases-southAmerica.js',
  'namebases-oceania.js',
  'namebases-fantasy.js',
  'namebases-creole.js'
];

const MODULES_DIR = path.join(__dirname, '..', '..', 'modules');

function parseContinentFile(filename) {
  const filepath = path.join(MODULES_DIR, filename);
  if (!fs.existsSync(filepath)) {
    return { filename, content: null, error: 'File not found' };
  }

  const content = fs.readFileSync(filepath, 'utf-8');
  return { filename, content, error: null };
}

const unqPatterns = new Map();

for (const filename of CONTINENT_FILES) {
  const result = parseContinentFile(filename);
  if (result.error || !result.content) {
    console.log(`Skipping ${filename}: ${result.error || 'No content'}`);
    continue;
  }

  const lines = result.content.split('\n');
  const continent = filename.replace('namebases-', '').replace('.js', '');

  lines.forEach((line, index) => {
    if (line.includes('unq') && line.includes('b:')) {
      const match = line.match(/b: "([^"]+)"/);
      if (match) {
        const b = match[1];
        const unqMatches = b.match(/(\w+(?:-\w+)*)(?:_\d+)?_unq\d+/g);
        if (unqMatches) {
          const languageName = unqMatches[0].replace(/_\d+_unq\d+/, '');
          if (!unqPatterns.has(languageName)) {
            unqPatterns.set(languageName, []);
          }
          unqPatterns.get(languageName).push({
            line: index + 1,
            file: continent,
            full: b.substring(0, 100)
          });
        }
      }
    }
  });
}

console.log(`Found ${unqPatterns.size} unique language patterns with unq placeholders across ${CONTINENT_FILES.length} files:\n`);

let count = 0;
for (const [language, entries] of unqPatterns) {
  count++;
  console.log(`${count}. ${language} (${entries.length} occurrences)`);
  entries.slice(0, 3).forEach(e => {
    console.log(`   [${e.file}:${e.line}] ${e.full}`);
  });
  if (count >= 50) break;
}