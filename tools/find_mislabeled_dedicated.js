const fs = require('fs');
const path = require('path');

const modulesDir = 'modules';
const files = fs.readdirSync(modulesDir).filter(f => f.startsWith('namebases-') && f.endsWith('.js') && !f.includes('backup'));

let mislabeledDedicated = [];

files.forEach(f => {
    const content = fs.readFileSync(path.join(modulesDir, f), 'utf8');
    const regex = /{\s*"name":\s*"([^"]+dedicated[^"]*)"\s*,\s*"i":\s*(\d+)/gi;
    let match;
    while ((match = regex.exec(content)) !== null) {
        const name = match[1];
        const i = parseInt(match[2]);
        if (i < 20000) {
            mislabeledDedicated.push({ file: f, name, i });
        }
    }
});

console.log('Dedicated namebases with index < 20000:');
mislabeledDedicated.forEach(m => console.log(`  - ${m.file}: "${m.name}" (i:${m.i})`));
