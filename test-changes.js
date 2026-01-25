const fs = require('fs');
const content = fs.readFileSync('E:/code/Fantasy-Map-Generator/modules/namebases-europe.js', 'utf8');
console.log('File size:', content.length);
console.log('First 100 chars:', content.substring(0, 100));
console.log('Bulgarian entry:', content.includes('"bg-BG"') ? 'FOUND' : 'NOT FOUND');
console.log('Romanian entry:', content.includes('București') ? 'FOUND' : 'NOT FOUND');
console.log('Albanian entry:', content.includes('"sq-AL"') ? 'FOUND' : 'NOT FOUND');
console.log('Lines:', content.split('\n').length);