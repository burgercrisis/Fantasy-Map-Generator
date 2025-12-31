const fs = require('fs');

const content = fs.readFileSync('modules/namebases-real.js', 'utf8');
const pattern = /{ name: "([^"]+)", i: (\d+)/g;
const matches = [...content.matchAll(pattern)];

const ids = matches.map(m => parseInt(m[2]));
const uniqueIds = new Set(ids);
const duplicateIds = ids.filter(id => !uniqueIds.delete(id));
const uniqueDuplicates = [...new Set(duplicateIds)].sort((a, b) => a - b);

console.log('Total entries:', matches.length);
console.log('Duplicate IDs:', duplicateIds.length);
console.log('Unique duplicate IDs:', uniqueDuplicates.length);
console.log('\nFirst 20 duplicate IDs:');
uniqueDuplicates.slice(0, 20).forEach(id => {
  const count = ids.filter(i => i === id).length;
  const names = matches.filter(m => parseInt(m[2]) === id).map(m => m[1]);
  console.log(`  ID ${id}: appears ${count} times - ${names.join(', ')}`);
});
