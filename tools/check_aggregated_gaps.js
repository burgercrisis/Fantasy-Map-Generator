const fs = require('fs');
const content = fs.readFileSync('tools/data/namebase-aggregated.js', 'utf8');
const regex = /"i":\s*(\d+)/g;
let indices = new Set();
let match;
while ((match = regex.exec(content)) !== null) {
    indices.add(parseInt(match[1]));
}
let max = 0;
indices.forEach(i => {
    if (i < 20000 && i > max) max = i;
});
console.log('Max non-dedicated index:', max);
let gap = 0;
while (indices.has(gap)) gap++;
console.log('First gap:', gap);
let count = 0;
let gaps = [];
for (let i = 0; i < 20000; i++) {
    if (!indices.has(i)) {
        count++;
        if (gaps.length < 100) gaps.push(i);
    }
}
console.log('Total gaps below 20000:', count);
console.log('First 100 gaps:', gaps);
