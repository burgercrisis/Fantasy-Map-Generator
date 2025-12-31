const fs = require('fs');

const content = fs.readFileSync('modules/namebases-real.js', 'utf8');
const startIdx = content.indexOf('[');
const arrayContent = content.substring(startIdx + 1, content.lastIndexOf(']'));
const entries = arrayContent.split('}, {');

for (let i = 0; i < entries.length; i++) {
    const entry = entries[i].trim();
    const iMatch = entry.match(/"i": (\d+)/);
    const nameMatch = entry.match(/"name": "([^"]+)"/);
    const bMatch = entry.match(/"b": "([^"]+)"/);

    if (iMatch && nameMatch && bMatch) {
        const iNum = parseInt(iMatch[1]);
        if (iNum === 95) {
            console.log('Language:', nameMatch[1]);
            console.log('Index:', iNum);
            console.log('Names:', bMatch[1]);
            console.log('Total names:', bMatch[1].split(',').length);
            break;
        }
    }
}
