const fs = require('fs');
const content = fs.readFileSync('modules/namebases-real.js', 'utf8');
const lines = content.split('\n');

const isoMap = {};
lines.forEach((line, index) => {
    if (line.includes('(dedicated)') && line.includes('i:')) {
        const nameMatch = line.match(/name: "([^"]+)"/);
        const indexMatch = line.match(/i: (\d+)/);
        if (nameMatch && indexMatch) {
            const name = nameMatch[1].replace(' (dedicated)', '').toLowerCase();
            const idx = parseInt(indexMatch[1]);
            if (!isoMap[name]) isoMap[name] = [];
            isoMap[name].push({line: index + 1, index: idx, content: line.trim()});
        }
    }
});

for (const name in isoMap) {
    if (isoMap[name].length > 1) {
        console.log(`Duplicate ISO: ${name}`);
        isoMap[name].forEach(entry => {
            console.log(`  Line ${entry.line}: Index ${entry.index}`);
        });
    }
}
