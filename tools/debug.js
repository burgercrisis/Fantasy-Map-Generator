const fs = require('fs');
const content = fs.readFileSync('E:/code/Fantasy-Map-Generator/modules/namebases-real.js', 'utf8');

// Simply print where the corruption is
const idx = content.indexOf('Béboto');
console.log('Béboto at:', idx);

// Find closing quote after
for(let i = idx + 6; i < idx + 50; i++) {
  if (content[i] === '"') {
    console.log('Closing quote at:', i);
    console.log('Char at i+1:', content[i+1], '(' + content.charCodeAt(i+1) + ')');
    console.log('Char at i+2:', content[i+2], '(' + content.charCodeAt(i+2) + ')');
    console.log('Next 100 chars:', JSON.stringify(content.substring(i, i+100)));
    break;
  }
}
