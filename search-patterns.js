const fs = require('fs');

// Search for specific patterns in all namebase files
const files = [
  'modules/namebases-africa.js',
  'modules/namebases-asia.js',
  'modules/namebases-europe.js',
  'modules/namebases-northAmerica.js',
  'modules/namebases-southAmerica.js',
  'modules/namebases-oceania.js'
];

const patterns = ['New York', 'New Zealand', 'Fiji', 'Ocean', 'Island'];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  
  console.log(`\n=== ${file} ===`);
  
  lines.forEach((line, i) => {
    patterns.forEach(pattern => {
      if (line.includes(pattern)) {
        console.log(`Line ${i+1}: ${line.substring(0, 250)}`);
      }
    });
  });
});
