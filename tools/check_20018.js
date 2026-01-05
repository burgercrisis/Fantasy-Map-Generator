const fs = require('fs');
const path = require('path');
const modulesDir = 'modules';
const files = ['namebases-asia.js', 'namebases-europe.js'];

files.forEach(file => {
  const content = fs.readFileSync(path.join(modulesDir, file), 'utf8');
  const blocks = content.match(/\{[\s\S]*?\}/g);
  if (blocks) {
    blocks.forEach(block => {
      if (block.includes('"i": 20018')) {
        console.log(`${file}: ${block}`);
      }
    });
  }
});
