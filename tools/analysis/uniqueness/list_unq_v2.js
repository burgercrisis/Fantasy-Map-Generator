const fs = require('fs');

const content = fs.readFileSync('modules/namebases-real.js', 'utf8');
const regex = /{name: "(.*?)", i: (\d+),.*?, b: "(.*?)"}/g;
let match;
const unqEntries = [];

while ((match = regex.exec(content)) !== null) {
  const [full, name, index, base] = match;
  if (base.includes('_unq')) {
    unqEntries.push({ name, index, base });
  }
}

console.log(`Total _unq entries: ${unqEntries.length}`);
console.log('First 20 _unq entries with their base:');
unqEntries.slice(0, 20).forEach(e => console.log(`${e.index}: ${e.name} -> ${e.base.substring(0, 50)}...`));
