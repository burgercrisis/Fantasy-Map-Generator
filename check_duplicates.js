const fs = require('fs');
const content = fs.readFileSync('modules/namebases-southAmerica.js', 'utf8');

// Find all language entries with their i values
const nameRegex = /"name": "([^"]+)",\s*\n\s*"i": (\d+)/g;
const entries = {};
for (const m of content.matchAll(nameRegex)) {
    const name = m[1];
    const i = parseInt(m[2]);
    if (!entries[name]) {
        entries[name] = [];
    }
    entries[name].push(i);
}

// Find duplicates
console.log('=== Duplicate Language Entries ===\n');
let hasDuplicates = false;
for (const [name, indices] of Object.entries(entries)) {
    if (indices.length > 1) {
        hasDuplicates = true;
        console.log(`${name}: ${indices.join(', ')}`);
    }
}

if (!hasDuplicates) {
    console.log('No duplicate names found');
}
