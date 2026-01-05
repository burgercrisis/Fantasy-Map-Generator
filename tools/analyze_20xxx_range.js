const fs = require('fs');
const path = require('path');
const modulesDir = 'modules';
const files = fs.readdirSync(modulesDir).filter(f => f.startsWith('namebases-') && f.endsWith('.js') && !f.includes('backup'));

const regionUsage = {};

files.forEach(file => {
  const content = fs.readFileSync(path.join(modulesDir, file), 'utf8');
  const regex = /"i":\s*(20\d+)/g;
  let match;
  const indices = [];
  while ((match = regex.exec(content)) !== null) {
    indices.push(parseInt(match[1]));
  }
  if (indices.length > 0) {
    regionUsage[file] = {
      min: Math.min(...indices),
      max: Math.max(...indices),
      count: indices.length,
      indices: indices.sort((a,b) => a-b)
    };
  }
});

console.log(JSON.stringify(regionUsage, null, 2));
