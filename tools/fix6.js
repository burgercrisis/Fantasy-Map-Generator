const fs = require('fs');
let content = fs.readFileSync('E:/code/Fantasy-Map-Generator/modules/namebases-real.js', 'utf8');

// Find the exact byte position
const searchStr = 'Béboto';
const idx = content.indexOf(searchStr);
console.log('Béboto found at byte position:', idx);

// Get the raw bytes around this position
console.log('Raw bytes after Béboto:');
for (let i = idx + searchStr.length; i < Math.min(idx + searchStr.length + 100, content.length); i++) {
  console.log(`  [${i}]: ${content.charCodeAt(i)} = '${content[i]}'`);
}

// Find where "  },{" starts after the corruption
let endMarker = -1;
for (let i = idx + searchStr.length + 1; i < Math.min(idx + 500, content.length); i++) {
  if (content[i] === '}' && content[i+1] === ',' && content[i+2] === '{') {
    endMarker = i;
    console.log('End marker },{ found at:', i);
    break;
  }
}

if (endMarker > 0) {
  // Create fixed content
  const fixedContent = content.substring(0, idx + searchStr.length) + '"' + content.substring(endMarker);
  fs.writeFileSync('E:/code/Fantasy-Map-Generator/modules/namebases-real.js', fixedContent);
  console.log('Fixed! Removed', endMarker - (idx + searchStr.length + 1), 'characters');
  console.log('New file size:', fixedContent.length);
}
