const fs = require('fs');
let content = fs.readFileSync('E:/code/Fantasy-Map-Generator/modules/namebases-real.js', 'utf8');

// The corruption is: after Béboto" there's more garbage
// Find the exact location
const searchStr = 'Béboto';
const idx = content.indexOf(searchStr);
if (idx > 0) {
  console.log('Found at:', idx);
  // Show bytes after
  for(let i = idx; i < Math.min(idx + 200, content.length); i++) {
    if (content.charCodeAt(i) > 127) {
      console.log('Pos', i, ': char code', content.charCodeAt(i), '=', JSON.stringify(content[i]));
    }
  }
  
  // Find where the real "  },{" starts after the corruption
  const nextEntry = content.indexOf('  },{\n    "name": "Kwaza', idx);
  console.log('Next entry at:', nextEntry);
  
  if (nextEntry > idx) {
    const goodContent = content.substring(0, idx + searchStr.length) + '"' + content.substring(nextEntry);
    fs.writeFileSync('E:/code/Fantasy-Map-Generator/modules/namebases-real.js', goodContent);
    console.log('Fixed! New length:', goodContent.length);
  }
} else {
  console.log('Not found');
}
