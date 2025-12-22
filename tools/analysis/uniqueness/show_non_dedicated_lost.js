const fs = require('fs');

const lostFile = 'e:/code/Fantasy-Map-Generator/lost_namebases.txt';
const trulyLostIds = JSON.parse(fs.readFileSync('e:/code/Fantasy-Map-Generator/truly_lost_ids.json', 'utf8'));
const trulyLostIdsSet = new Set(trulyLostIds);

const lostContent = fs.readFileSync(lostFile, 'utf8');
const lines = lostContent.split('\n');

const regex = /i:\s*(\d+)/;

for (const line of lines) {
    if (line.trim().startsWith('-')) {
        const match = line.match(regex);
        if (match) {
            const id = parseInt(match[1]);
            if (trulyLostIdsSet.has(id)) {
                if (!line.includes('(dedicated)')) {
                    console.log(`Non-dedicated truly lost: ${line.trim()}`);
                }
            }
        }
    }
}
