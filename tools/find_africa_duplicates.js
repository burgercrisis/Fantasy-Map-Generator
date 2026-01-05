const fs = require('fs');
const content = fs.readFileSync('e:/code/Fantasy-Map-Generator/modules/namebases-africa.js', 'utf8');
const regex = /"name":\s*"([^"]+)"/g;
const names = new Map();
let match;
while ((match = regex.exec(content)) !== null) {
    const fullName = match[1];
    let baseName = fullName.replace(' (dedicated)', '').trim();
    if (!names.has(baseName)) {
        names.set(baseName, []);
    }
    names.get(baseName).push(fullName);
}

for (const [baseName, fullNames] of names) {
    if (fullNames.length > 1) {
        console.log(`Duplicate found for "${baseName}": ${fullNames.join(', ')}`);
    }
}
