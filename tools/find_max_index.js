const fs = require('fs');
const path = require('path');
const modulesDir = 'modules';
const files = fs.readdirSync(modulesDir).filter(f => f.startsWith('namebases-') && f.endsWith('.js') && !f.includes('backup'));

console.log('Files found:', files);

let maxI = 0;
let maxEntry = null;

files.forEach(file => {
  const content = fs.readFileSync(path.join(modulesDir, file), 'utf8');
  const regex = /"i":\s*(\d+)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const i = parseInt(match[1]);
    if (i > maxI) {
      maxI = i;
      maxEntry = { i, file };
    }
  }
});

console.log('Max Index:', maxI);
console.log('Max Entry:', maxEntry);
