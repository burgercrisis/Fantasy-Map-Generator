const fs = require('fs');
const content = fs.readFileSync('modules/namebases-real.backup-20251228-221152.js', 'utf8');

// Look at actual format
console.log('Looking for language entry patterns...');
const lines = content.split('\n');
for (let i = 0; i < Math.min(50, lines.length); i++) {
    const line = lines[i].trim();
    if (line.startsWith('"name":') || line.includes('"i":') || line.includes('"b":')) {
        console.log(`Line ${i}: ${line}`);
    }
}

// Try to find entries
console.log('\nSearching for entries...');
const entryPattern = /\{\s*"name":\s*"([^"]+)",\s*"i":\s*(\d+),/g;
let match;
let entries = [];
while ((match = entryPattern.exec(content)) !== null) {
    entries.push(match[1]);
    if (entries.length >= 10) break;
}

console.log('Found entries:', entries.join(', '));
