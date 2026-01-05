const fs = require('fs');
const path = require('path');

const modulesDir = path.join(__dirname, '../modules');
const oceaniaPath = path.join(modulesDir, 'namebases-oceania.js');

const files = fs.readdirSync(modulesDir).filter(f => f.startsWith('namebases-') && f.endsWith('.js') && !f.includes('backup') && f !== 'namebases-oceania.js');

const oceaniaContent = fs.readFileSync(oceaniaPath, 'utf8');
const oceaniaIndices = [];
const oceaniaRegex = /"i":\s*(\d+),/g;
let match;
while ((match = oceaniaRegex.exec(oceaniaContent)) !== null) {
  oceaniaIndices.push(parseInt(match[1]));
}

console.log(`Checking ${oceaniaIndices.length} indices in Oceania against other files...`);

const collisions = [];

files.forEach(file => {
  const content = fs.readFileSync(path.join(modulesDir, file), 'utf8');
  const fileIndices = [];
  const regex = /"i":\s*(\d+),/g;
  while ((match = regex.exec(content)) !== null) {
    const idx = parseInt(match[1]);
    if (oceaniaIndices.includes(idx)) {
      collisions.push({ index: idx, file: file });
    }
  }
});

if (collisions.length > 0) {
  console.log('Collisions found:');
  collisions.forEach(c => console.log(`Index ${c.index} also found in ${c.file}`));
} else {
  console.log('No collisions found between Oceania and other files.');
}
