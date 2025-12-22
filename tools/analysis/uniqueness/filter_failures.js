const fs = require('fs');
const content = fs.readFileSync('failures_full.txt', 'utf8');
const lines = content.split('\n');
let currentIso = '';
let currentData = [];
for (const line of lines) {
    if (line.includes('|')) {
        if (currentIso && !currentData.some(d => d.includes('NO_UNIQ_BASE'))) {
            console.log(currentIso);
            currentData.forEach(d => console.log(d));
        }
        currentIso = line;
        currentData = [];
    } else if (line.trim()) {
        currentData.push(line);
    }
}
if (currentIso && !currentData.some(d => d.includes('NO_UNIQ_BASE'))) {
    console.log(currentIso);
    currentData.forEach(d => console.log(d));
}
