const fs = require('fs');
const path = require('path');

const modulesDir = 'modules';
const files = fs.readdirSync(modulesDir).filter(f => f.startsWith('namebases-') && f.endsWith('.js') && !f.includes('backup'));

let indices = new Set();

files.forEach(f => {
    const content = fs.readFileSync(path.join(modulesDir, f), 'utf8');
    const matches = content.match(/"i":\s*(\d+)/g);
    if (matches) {
        matches.forEach(m => {
            const i = parseInt(m.match(/\d+/)[0]);
            indices.add(i);
        });
    }
});

let gaps = [];
let check = 1;
while (gaps.length < 50) {
    if (!indices.has(check)) {
        gaps.push(check);
    }
    check++;
}
console.log('Next 50 gaps in non-dedicated range:', gaps);

let dedicatedGaps = [];
check = 20000;
while (dedicatedGaps.length < 100) {
    if (!indices.has(check)) {
        dedicatedGaps.push(check);
    }
    check++;
}
console.log('Next 100 gaps in dedicated range:', dedicatedGaps);
