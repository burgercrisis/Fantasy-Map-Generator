const fs = require('fs');
const path = require('path');

const modulesDir = 'modules';
const files = fs.readdirSync(modulesDir).filter(f => f.startsWith('namebases-') && f.endsWith('.js') && !f.includes('backup'));

let indices = new Set();

files.forEach(f => {
    const content = fs.readFileSync(path.join(modulesDir, f), 'utf8');
    const regex = /"i":\s*(\d+)/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
        indices.add(parseInt(match[1]));
    }
});

let regularGaps = [];
for (let i = 0; i < 20000; i++) {
    if (!indices.has(i)) {
        regularGaps.push(i);
        if (regularGaps.length >= 200) break;
    }
}

let dedicatedGaps = [];
for (let i = 20000; i < 30000; i++) {
    if (!indices.has(i)) {
        dedicatedGaps.push(i);
        if (dedicatedGaps.length >= 200) break;
    }
}

console.log('Regular gaps ( < 20000):');
console.log(JSON.stringify(regularGaps));
console.log('Dedicated gaps ( >= 20000):');
console.log(JSON.stringify(dedicatedGaps));
