const fs = require('fs');
const path = require('path');

const modulesDir = path.join(__dirname, '../modules');
const africaPath = path.join(modulesDir, 'namebases-africa.js');

const files = fs.readdirSync(modulesDir).filter(f => f.startsWith('namebases-') && f.endsWith('.js') && !f.includes('backup') && f !== 'namebases-africa.js');

const africaContent = fs.readFileSync(africaPath, 'utf8');
const africaIndices = [];
const africaRegex = /"i":\s*(\d+),/g;
let match;
while ((match = africaRegex.exec(africaContent)) !== null) {
  africaIndices.push(parseInt(match[1]));
}

console.log(`Checking ${africaIndices.length} indices in Africa against other files...`);

const collisions = [];

files.forEach(file => {
  const content = fs.readFileSync(path.join(modulesDir, file), 'utf8');
  const fileIndices = [];
  const regex = /"i":\s*(\d+),/g;
  while ((match = regex.exec(content)) !== null) {
    const idx = parseInt(match[1]);
    if (africaIndices.includes(idx)) {
      collisions.push({ index: idx, file: file });
    }
  }
});

if (collisions.length > 0) {
  console.log('Collisions found:');
  collisions.forEach(c => console.log(`Index ${c.index} also found in ${c.file}`));
} else {
  console.log('No collisions found between Africa and other files.');
}
