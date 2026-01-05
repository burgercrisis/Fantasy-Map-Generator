const fs = require('fs');
const path = require('path');
const modulesDir = 'modules';
const files = fs.readdirSync(modulesDir).filter(f => f.startsWith('namebases-') && f.endsWith('.js') && !f.includes('backup') && !f.includes('single-line'));

const allEntries = [];

files.forEach(file => {
  const content = fs.readFileSync(path.join(modulesDir, file), 'utf8');
  // Match objects { ... }
  const blocks = content.match(/\{[\s\S]*?\}/g);
  
  if (blocks) {
    blocks.forEach(block => {
      const nameMatch = block.match(/"name":\s*"(.*?)"/);
      const indexMatch = block.match(/"i":\s*(\d+)/);
      if (nameMatch && indexMatch) {
        allEntries.push({
          name: nameMatch[1],
          i: indexMatch[1],
          file: file
        });
      }
    });
  }
});

const indices = allEntries.map(e => e.i);
const dupIndices = [...new Set(indices.filter((idx, i) => indices.indexOf(idx) !== i))];

const collisionDetails = dupIndices.map(idx => {
  return {
    index: idx,
    entries: allEntries.filter(e => e.i === idx)
  };
});

console.log('Index Collisions Count:', collisionDetails.length);
console.log('Index Collisions (Top 20):', JSON.stringify(collisionDetails.slice(0, 20), null, 2));

const nameCounts = {};
allEntries.forEach(e => {
  const key = e.name.toLowerCase().trim();
  if (!nameCounts[key]) nameCounts[key] = [];
  nameCounts[key].push(e);
});

const dupNames = Object.keys(nameCounts).filter(k => nameCounts[k].length > 1);
const nameCollisionDetails = dupNames.map(name => {
  return {
    name: name,
    entries: nameCounts[name]
  };
});

console.log('Name Collisions Count:', nameCollisionDetails.length);
console.log('Name Collisions (Top 20):', JSON.stringify(nameCollisionDetails.slice(0, 20), null, 2));
