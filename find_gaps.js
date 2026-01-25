const fs = require('fs');
const content = fs.readFileSync('current_indices.txt', 'utf8');
const lines = content.split('\n').filter(l => l.trim());
console.log('Read ' + lines.length + ' lines');
const indices = new Set(lines.map(Number));
console.log('Unique indices: ' + indices.size);
const gaps = [];
for (let i = 0; i <= 2750; i++) {
    if (!indices.has(i)) gaps.push(i);
}
console.log('Found ' + gaps.length + ' gaps: ' + gaps.slice(0, 50).join(', ') + '...');
