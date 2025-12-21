const fs = require('fs');
const path = require('path');

const modulesDir = path.join(process.cwd(), 'modules');
const files = fs.readdirSync(modulesDir).filter(f => f.startsWith('namebases-') && f.endsWith('.js'));

let maxStaticIndex = 0;
const staticEntries = [];

files.forEach(file => {
    const content = fs.readFileSync(path.join(modulesDir, file), 'utf8');
    const regex = /name:\s*\"([^\"]+)\",\s*i:\s*(\d+)/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
        const name = match[1];
        const id = parseInt(match[2], 10);
        if (!name.includes('(dedicated)') && !name.includes('(setBases aux)') && !name.includes('(aux)')) {
            if (id > maxStaticIndex) maxStaticIndex = id;
            staticEntries.push({ id, name, file });
        }
    }
});

console.log(`Max Static Index: ${maxStaticIndex}`);
console.log(`Total Static Entries: ${staticEntries.length}`);
if (staticEntries.length > 0) {
    console.log(`Last 5 static entries:`, JSON.stringify(staticEntries.slice(-5), null, 2));
}
