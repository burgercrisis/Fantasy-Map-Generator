const fs = require('fs');
let content = fs.readFileSync('E:/code/Fantasy-Map-Generator/modules/namebases-real.js', 'utf8');
const bad = 'â"œâŒ"châ"œâŒ",Bitkine,Bousso,Fianga,Bâ"œâŒ"râ"œâŒ"';
console.log('Searching for:', bad.length, 'bytes');
const idx = content.indexOf(bad);
console.log('Found at:', idx);
if (idx > 0) {
  content = content.substring(0, idx) + '"' + content.substring(idx + bad.length + 1);
  fs.writeFileSync('E:/code/Fantasy-Map-Generator/modules/namebases-real.js', content);
  console.log('Fixed');
} else {
  console.log('Not found, trying different search');
  // Try to find any occurrence of the pattern
  const match = content.match(/Béboto[^"]*"/);
  if (match) {
    console.log('Found pattern:', match[0].substring(0, 50));
  }
}
