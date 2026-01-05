const fs = require('fs');
const path = require('path');

const modulesDir = 'modules';
const files = fs.readdirSync(modulesDir).filter(f => f.startsWith('namebases-') && f.endsWith('.js') && !f.includes('backup'));

let max = 0;
let indices = new Set();

files.forEach(f => {
    const content = fs.readFileSync(path.join(modulesDir, f), 'utf8');
    const matches = content.match(/"i":\s*(\d+)/g);
    if (matches) {
        matches.forEach(m => {
            const i = parseInt(m.match(/\d+/)[0]);
            indices.add(i);
            if (i < 20000 && i > max) max = i;
        });
    }
});

console.log('Max non-dedicated index:', max);

// Find dedicated max
let maxDedicated = 0;
indices.forEach(i => {
    if (i >= 20000 && i > maxDedicated) maxDedicated = i;
});
console.log('Max dedicated index:', maxDedicated);

// Find first gap
let firstGap = 1;
while (indices.has(firstGap)) {
    firstGap++;
}
console.log('First gap in indices:', firstGap);

// Find gap after 20000
let dedicatedGap = 20000;
while (indices.has(dedicatedGap)) {
    dedicatedGap++;
}
console.log('First gap in dedicated indices (20000+):', dedicatedGap);
