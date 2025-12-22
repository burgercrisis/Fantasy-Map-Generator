const fs = require('fs');
const content = fs.readFileSync('modules/namebases-real.js', 'utf8');
const regex = /\{name: \"(.*?)\", i: (\d+),.*?, b: \"(.*?)\"\}/g;
let unqCount = 0;
let dedicatedCount = 0;
let match;
while ((match = regex.exec(content)) !== null) {
    const name = match[1];
    const b = match[3];
    if (name.includes('(dedicated)')) {
        dedicatedCount++;
        if (b.includes('_unq')) {
            unqCount++;
        }
    }
}
console.log('Dedicated entries:', dedicatedCount);
console.log('Dedicated entries with _unq:', unqCount);
