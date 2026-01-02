const fs = require('fs');
const content = fs.readFileSync('E:/code/Fantasy-Map-Generator/modules/namebases-real.js', 'utf8');

// The closing quote after Béboto is at 60433
// The next entry starts at 60510 (the "  },{" pattern)
// Fix by removing everything between 60433 and 60510, keeping the closing quote

const fixed = content.substring(0, 60434) + content.substring(60510);
fs.writeFileSync('E:/code/Fantasy-Map-Generator/modules/namebases-real.js', fixed);
console.log('Fixed! New length:', fixed.length);
console.log('Removed:', 60510 - 60434, 'characters');
