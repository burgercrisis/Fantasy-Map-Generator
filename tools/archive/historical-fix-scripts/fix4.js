const fs = require('fs');
let content = fs.readFileSync('E:/code/Fantasy-Map-Generator/modules/namebases-real.js', 'utf8');

// The corruption is: after Béboto" there's garbage ending with },{
// Find the exact location
const searchStr = 'Béboto';
const idx = content.indexOf(searchStr);
if (idx > 0) {
  console.log('Found at:', idx);
  
  // Show some context
  console.log('Context:', content.substring(idx, idx + 100).split('').map(c => c.charCodeAt(0)).join(', '));
  
  // Find the closing },{ pattern after corruption
  // It should be: },{
  // followed by new line, whitespace, "name"
  const pattern = '},{';
  let found = -1;
  for(let i = idx + 50; i < Math.min(idx + 500, content.length); i++) {
    if (content.substring(i, i + 2) === '},' && content[i+2] === '{') {
      found = i;
      console.log('Found },{ at:', i);
      break;
    }
  }
  
  if (found > 0) {
    const goodContent = content.substring(0, idx + searchStr.length) + '"' + content.substring(found);
    fs.writeFileSync('E:/code/Fantasy-Map-Generator/modules/namebases-real.js', goodContent);
    console.log('Fixed!');
    console.log('Removed', found - (idx + searchStr.length), 'characters');
  }
} else {
  console.log('Not found');
}
