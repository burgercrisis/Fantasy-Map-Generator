const fs = require('fs');
const path = require('path');

const modulesDir = path.join(__dirname, '../../modules');
const files = [
  'namebases-africa.js',
  'namebases-asia.js',
  'namebases-europe.js',
  'namebases-northAmerica.js',
  'namebases-southAmerica.js',
  'namebases-oceania.js',
  'namebases-unknown.js'
];

function checkCollisions() {
  const indices = {};
  let collisionCount = 0;

  files.forEach(filename => {
    const filePath = path.join(modulesDir, filename);
    if (!fs.existsSync(filePath)) return;
    
    const content = fs.readFileSync(filePath, 'utf8');
    const regex = /\{\s*"name":[\s\S]*?\}/g;
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      try {
        const obj = JSON.parse(match[0]);
        if (obj.i !== undefined) {
          if (!indices[obj.i]) indices[obj.i] = [];
          indices[obj.i].push({ name: obj.name, file: filename });
        }
      } catch (e) {}
    }
  });

  const collisions = Object.keys(indices).filter(i => indices[i].length > 1);
  console.log(`Found ${collisions.length} indices with collisions.`);
  
  collisions.slice(0, 50).forEach(i => {
    console.log(`Index ${i}:`);
    indices[i].forEach(entry => console.log(`  - ${entry.name} (${entry.file})`));
  });
}

checkCollisions();
