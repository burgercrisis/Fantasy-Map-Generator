const fs = require('fs');
const path = require('path');
const modulesDir = 'modules';
const files = fs.readdirSync(modulesDir).filter(f => f.startsWith('namebases-') && f.endsWith('.js') && !f.includes('backup') && !f.includes('single-line'));

const allEntries = [];

files.forEach(file => {
  const content = fs.readFileSync(path.join(modulesDir, file), 'utf8');
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

const oceaniaEntries = allEntries.filter(e => e.file === 'namebases-oceania.js');
const oceaniaIndices = oceaniaEntries.map(e => e.i);

const oceaniaCollisions = [];
oceaniaIndices.forEach(idx => {
  const matches = allEntries.filter(e => e.i === idx);
  if (matches.length > 1) {
    oceaniaCollisions.push({
      index: idx,
      entries: matches
    });
  }
});

// Remove duplicate collision reports
const uniqueOceaniaCollisions = [];
const reportedIndices = new Set();
oceaniaCollisions.forEach(c => {
  if (!reportedIndices.has(c.index)) {
    uniqueOceaniaCollisions.push(c);
    reportedIndices.add(c.index);
  }
});

console.log('Oceania Collisions Count:', uniqueOceaniaCollisions.length);
console.log('Oceania Collisions:', JSON.stringify(uniqueOceaniaCollisions, null, 2));
