const fs = require('fs');

const lostFile = 'e:/code/Fantasy-Map-Generator/lost_namebases.txt';
const addedFile = 'e:/code/Fantasy-Map-Generator/added_namebases.txt';

function extractIds(filePath, prefix) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const ids = new Set();
    const regex = /i:\s*(\d+)/;
    
    for (const line of lines) {
        if (line.trim().startsWith(prefix)) {
            const match = line.match(regex);
            if (match) {
                ids.add(parseInt(match[1]));
            }
        }
    }
    return ids;
}

const lostIds = extractIds(lostFile, '-');
const addedIds = extractIds(addedFile, '+');

const trulyLostIds = [...lostIds].filter(id => !addedIds.has(id));

console.log(`Total lost IDs: ${lostIds.size}`);
console.log(`Total added IDs: ${addedIds.size}`);
console.log(`Truly lost IDs: ${trulyLostIds.length}`);

fs.writeFileSync('e:/code/Fantasy-Map-Generator/truly_lost_ids.json', JSON.stringify(trulyLostIds, null, 2));
