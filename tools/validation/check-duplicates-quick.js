/**
 * Quick Duplicate ID Checker
 *
 * Rapid check for duplicate index (i:) values in namebase entries.
 * Reports which IDs appear multiple times and what names use them.
 *
 * Usage:
 *   node tools/validation/check-duplicates-quick.js
 */

const fs = require('fs');
const path = require('path');

const continentFiles = [
  'namebases-africa.js',
  'namebases-asia.js',
  'namebases-europe.js',
  'namebases-northAmerica.js',
  'namebases-southAmerica.js',
  'namebases-oceania.js',
  'namebases-fantasy.js'
];

const modulesPath = path.join(__dirname, '..', '..', 'modules');

function parseJSArray(content) {
  const start = content.indexOf('[');
  const end = content.lastIndexOf('];');
  if (start === -1 || end === -1) return [];
  const jsStr = content.slice(start, end + 1);
  try {
    return new Function(`return ${jsStr}`)();
  } catch (e) {
    return [];
  }
}

const allMatches = [];

continentFiles.forEach(file => {
  const filePath = path.join(modulesPath, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const pattern = /{ name: "([^"]+)", i: (\d+)/g;
    const matches = [...content.matchAll(pattern)];
    matches.forEach(m => {
      allMatches.push({ name: m[1], id: parseInt(m[2]), file });
    });
  }
});

const ids = allMatches.map(m => m.id);
const uniqueIds = new Set(ids);
const duplicateIds = ids.filter(id => !uniqueIds.delete(id));
const uniqueDuplicates = [...new Set(duplicateIds)].sort((a, b) => a - b);

console.log('Total entries:', allMatches.length);
console.log('Duplicate IDs:', duplicateIds.length);
console.log('Unique duplicate IDs:', uniqueDuplicates.length);
console.log('\nFirst 20 duplicate IDs:');
uniqueDuplicates.slice(0, 20).forEach(id => {
  const count = ids.filter(i => i === id).length;
  const names = allMatches.filter(m => m.id === id).map(m => `${m.name} (${m.file})`);
  console.log(`  ID ${id}: appears ${count} times - ${names.join(', ')}`);
});
