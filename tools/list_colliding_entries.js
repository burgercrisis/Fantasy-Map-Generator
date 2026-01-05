const fs = require('fs');
const path = require('path');
const modulesDir = 'modules';

const oceaniaIndices = [20005, 20010, 20013, 20014, 20015, 20016, 20020, 20021, 20022, 20023, 20024, 20025, 20027, 20028, 20029, 20031];

const files = ['namebases-europe.js', 'namebases-africa.js', 'namebases-asia.js'];
const collidingEntries = [];

files.forEach(file => {
  const content = fs.readFileSync(path.join(modulesDir, file), 'utf8');
  const blocks = content.match(/\{[\s\S]*?\}/g);
  if (blocks) {
    blocks.forEach(block => {
      const match = block.match(/"i":\s*(\d+)/);
      if (match) {
        const i = parseInt(match[1]);
        if (oceaniaIndices.includes(i)) {
          const nameMatch = block.match(/"name":\s*"(.*?)"/);
          collidingEntries.push({
            file,
            name: nameMatch ? nameMatch[1] : 'unknown',
            i,
            block
          });
        }
      }
    });
  }
});

console.log(JSON.stringify(collidingEntries, null, 2));
