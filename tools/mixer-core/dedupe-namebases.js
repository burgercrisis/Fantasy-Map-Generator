const fs = require('fs');
const path = require('path');

const namebasesPath = path.join(process.cwd(), 'modules', 'namebases-real.js');
const content = fs.readFileSync(namebasesPath, 'utf8');

const lines = content.split('\n');
const seenIndices = new Set();
const uniqueLines = [];
let removedCount = 0;

for (const line of lines) {
    const match = line.match(/i: (\d+)/);
    if (match) {
        const index = parseInt(match[1]);
        if (seenIndices.has(index)) {
            removedCount++;
            continue; // Skip duplicate
        }
        seenIndices.add(index);
    }
    uniqueLines.push(line);
}

fs.writeFileSync(namebasesPath, uniqueLines.join('\n'));
console.log(`Removed ${removedCount} duplicate entries from namebases-real.js`);
