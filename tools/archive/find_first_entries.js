const fs = require('fs');

const content = fs.readFileSync('modules/namebases-real.js', 'utf8');

// Find the first few entries by looking for the pattern after the array starts
const arrayStart = content.indexOf('[');
if (arrayStart === -1) {
    console.log('Could not find array start');
    return;
}

const afterArrayStart = content.substring(arrayStart + 1);

// Extract first few objects
const objects = [];
let currentPos = 0;
let braceCount = 0;
let inString = false;
let escapeNext = false;

for (let i = 0; i < afterArrayStart.length && objects.length < 10; i++) {
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
                objects.push(objectStr);
            }
        }
    }
}

console.log('First', objects.length, 'entries:');
objects.forEach((obj, index) => {
    const nameMatch = obj.match(/"name":"([^"]+)"/);
    const iMatch = obj.match(/"i":(\d+)/);

    if (nameMatch && iMatch) {
        console.log(`${index + 1}. ${nameMatch[1]} (i: ${iMatch[1]})`);
    } else {
        console.log(`${index + 1}. Could not parse: ${obj.substring(0, 100)}...`);
    }
});
