const fs = require('fs');
const path = require('path');
const modulesDir = 'modules';
const files = fs.readdirSync(modulesDir).filter(f => f.startsWith('namebases-') && f.endsWith('.js') && !f.includes('backup') && !f.includes('single-line'));

const allEntries = [];

files.forEach(file => {
  const content = fs.readFileSync(path.join(modulesDir, file), 'utf8');
  const nameMatches = [...content.matchAll(/"name":\s*"(.*?)"/g)];
  const indexMatches = [...content.matchAll(/"i":\s*(\d+)/g)];
  
  nameMatches.forEach((match, i) => {
    allEntries.push({
      name: match[1],
      i: indexMatches[i] ? indexMatches[i][1] : null,
      file: file
    });
  });
});

const indices = allEntries.map(e => e.i).filter(i => i !== null);
const dupIndices = [...new Set(indices.filter((idx, i) => indices.indexOf(idx) !== i))];

const collisionDetails = dupIndices.map(idx => {
  return {
    index: idx,
    entries: allEntries.filter(e => e.i === idx)
  };
});

console.log('Index Collisions:', JSON.stringify(collisionDetails, null, 2));

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

console.log('Name Collisions:', JSON.stringify(nameCollisionDetails, null, 2));
