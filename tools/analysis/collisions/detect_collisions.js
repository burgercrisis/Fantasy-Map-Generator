const fs = require('fs');
const path = require('path');

const modulesDir = path.join(process.cwd(), 'modules');
const files = fs.readdirSync(modulesDir).filter(f => f.startsWith('namebases-') && f.endsWith('.js'));

const indexMap = new Map();
const collisions = [];

files.forEach(file => {
    const content = fs.readFileSync(path.join(modulesDir, file), 'utf8');
    // regex to match {name: "...", i: 123, ...}
    const regex = /name:\s*\"([^\"]+)\",\s*i:\s*(\d+)/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
        const name = match[1];
        const id = parseInt(match[2], 10);
        if (indexMap.has(id)) {
            collisions.push({
                id,
                existing: indexMap.get(id),
                incoming: { name, file }
            });
        } else {
            indexMap.set(id, { name, file });
        }
    }
});

fs.writeFileSync('collisions_full.json', JSON.stringify(collisions, null, 2));
console.log(`Found ${collisions.length} collisions. Report saved to collisions_full.json`);
