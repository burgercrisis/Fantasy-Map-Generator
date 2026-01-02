const fs = require('fs');
let content = fs.readFileSync('E:/code/Fantasy-Map-Generator/modules/namebases-real.js', 'utf8');

// Find the exact pattern
const idx = content.indexOf('Béboto');
if (idx > 0) {
  console.log('Found Béboto at:', idx);
  // Find the closing quote
  const closeIdx = content.indexOf('"', idx);
  console.log('Closing quote at:', closeIdx);
  if (closeIdx > idx) {
    const before = content.substring(0, closeIdx + 1);
    const after = content.substring(closeIdx + 1);
    // Check if there's corruption after
    if (after.startsWith('â') || after.startsWith(',')) {
      // Find where the real next entry starts
      const realEnd = after.indexOf('  },');
      if (realEnd > 0) {
        content = before + after.substring(realEnd);
        console.log('Removed', realEnd, 'characters of corruption');
      }
    }
  }
}
fs.writeFileSync('E:/code/Fantasy-Map-Generator/modules/namebases-real.js', content);
console.log('Done');
