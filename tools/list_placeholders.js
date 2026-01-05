const fs = require('fs');
const continentFiles = [
  'modules/namebases-africa.js',
  'modules/namebases-asia.js',
  'modules/namebases-europe.js',
  'modules/namebases-northAmerica.js',
  'modules/namebases-oceania.js',
  'modules/namebases-southAmerica.js'
];

const placeholders = new Set();
continentFiles.forEach(file => {
  if (!fs.existsSync(file)) return;
  const content = fs.readFileSync(file, 'utf8');
  const entries = content.split('},');
  entries.forEach(entry => {
    if (entry.includes('New Place') || entry.includes('_unq')) {
      const nameMatch = entry.match(/"name":\s*"([^"]+)"/);
      if (nameMatch) {
        placeholders.add(nameMatch[1]);
      }
    }
  });
});

console.log("Languages with placeholders:");
Array.from(placeholders).sort().forEach(p => console.log(p));
