const fs = require('fs');
const path = require('path');

const modulesDir = path.join(__dirname, '../modules');
const files = fs.readdirSync(modulesDir).filter(f => f.startsWith('namebases-') && f.endsWith('.js') && !f.includes('backup'));

console.log(`Checking ${files.length} namebase files for global collisions...`);

const indexMap = new Map(); // index -> [file, name]
const collisions = [];

files.forEach(file => {
  const content = fs.readFileSync(path.join(modulesDir, file), 'utf8');
  const regex = /\{\s*"name":\s*"([^"]+)",\s*"i":\s*(\d+)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const name = match[1];
    const idx = parseInt(match[2]);
    if (indexMap.has(idx)) {
      const existing = indexMap.get(idx);
      collisions.push({
        index: idx,
        entries: [
          { file: existing.file, name: existing.name },
          { file: file, name: name }
        ]
      });
    } else {
      indexMap.set(idx, { file: file, name: name });
    }
  }
});

if (collisions.length > 0) {
  console.log('Global collisions found:');
  collisions.forEach(c => {
    console.log(`Index ${c.index} collision:`);
    c.entries.forEach(e => console.log(`  - ${e.name} in ${e.file}`));
  });
} else {
  console.log('No global collisions found across all continent files.');
}
