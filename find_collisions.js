const fs = require('fs');
const content = fs.readFileSync('modules/namebases-all.js.backup', 'utf8');
const entries = [];
const namePattern = /\{\s*"name":\s*"([^"]+)"\s*,\s*"i":\s*(\d+)/g;
let match;
while ((match = namePattern.exec(content)) !== null) {
    entries.push({ name: match[1], i: parseInt(match[2], 10) });
}
const indexMap = {};
const collisions = [];
for (const entry of entries) {
    if (indexMap[entry.i]) {
        collisions.push({ i: entry.i, name1: indexMap[entry.i], name2: entry.name });
    } else {
        indexMap[entry.i] = entry.name;
    }
}
console.log('Found ' + collisions.length + ' collisions in backup');
console.log(JSON.stringify(collisions.slice(0, 50), null, 2));
