const fs = require('fs');

const content = fs.readFileSync('modules/namebases-real.js', 'utf8');

// Find all entries and their i numbers
const entries = [];
let currentPos = 0;
let braceCount = 0;
let inString = false;
let escapeNext = false;
const arrayStart = content.indexOf('[');
const afterArrayStart = content.substring(arrayStart + 1);

for (let i = 0; i < afterArrayStart.length; i++) {
    const char = afterArrayStart[i];

    if (escapeNext) {
        escapeNext = false;
        continue;
    }

    if (char === '\\') {
        escapeNext = true;
        continue;
    }

    if (char === '"' && !escapeNext) {
        inString = !inString;
        continue;
    }

    if (!inString) {
        if (char === '{') {
            if (braceCount === 0) {
                currentPos = i;
            }
            braceCount++;
        } else if (char === '}') {
            braceCount--;
            if (braceCount === 0) {
                const objectStr = afterArrayStart.substring(currentPos, i + 1);
                const nameMatch = objectStr.match(/"name":"([^"]+)"/);
                const iMatch = objectStr.match(/"i":(\d+)/);

                if (nameMatch && iMatch) {
                    entries.push({
                        name: nameMatch[1],
                        i: parseInt(iMatch[1]),
                        object: objectStr
                    });
                }
            }
        }
    }
}

// Sort entries by i number
entries.sort((a, b) => a.i - b.i);

console.log('Total entries:', entries.length);
console.log('First 20 entries:');
entries.slice(0, 20).forEach(entry => {
    console.log(`${entry.name} (i: ${entry.i})`);
});

console.log('\nEntries around i:100-200:');
const around100to200 = entries.filter(entry => entry.i >= 100 && entry.i <= 200);
around100to200.forEach(entry => {
    console.log(`${entry.name} (i: ${entry.i})`);
});

console.log('\nHighest i in early range:', Math.max(...entries.filter(e => e.i < 1000).map(e => e.i)));

// Check if there's a gap in the sequence
const maxConsecutive = [];
for (let i = 0; i < entries.length; i++) {
    if (i === 0 || entries[i].i === entries[i - 1].i + 1) {
        maxConsecutive.push(entries[i]);
    } else {
        break;
    }
}
console.log('\nConsecutive entries from start:', maxConsecutive.length);
console.log('Last consecutive entry:', maxConsecutive[maxConsecutive.length - 1]?.name, '(i: ' + maxConsecutive[maxConsecutive.length - 1]?.i + ')');
