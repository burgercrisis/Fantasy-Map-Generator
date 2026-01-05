const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../modules/namebases-africa.js');
let content = fs.readFileSync(filePath, 'utf8');

// Parse the array of objects
// This is a bit tricky with window.africaNameBases = [...]
// I'll use a simpler approach: find all dedicated and non-dedicated entries with same base name

const regex = /{\s*"name":\s*"([^"]+)"\s*,\s*"i":\s*(\d+),\s*"min":\s*(\d+),\s*"max":\s*(\d+),\s*"d":\s*"([^"]*)",\s*"m":\s*([\d.]+),\s*"b":\s*"([^"]*)"\s*}/g;

let entries = [];
let match;
while ((match = regex.exec(content)) !== null) {
    entries.push({
        fullMatch: match[0],
        name: match[1],
        i: parseInt(match[2]),
        min: parseInt(match[3]),
        max: parseInt(match[4]),
        d: match[5],
        m: parseFloat(match[6]),
        b: match[7]
    });
}

let baseToDedicated = new Map();
let baseToNonDedicated = new Map();

entries.forEach(e => {
    let base = e.name.replace(' (dedicated)', '').trim();
    if (e.name.includes('(dedicated)')) {
        baseToDedicated.set(base, e);
    } else {
        if (!baseToNonDedicated.has(base)) baseToNonDedicated.set(base, []);
        baseToNonDedicated.get(base).push(e);
    }
});

let removedCount = 0;
let mergedCount = 0;

for (let [base, dedicated] of baseToDedicated.entries()) {
    if (baseToNonDedicated.has(base)) {
        let nonDedicatedList = baseToNonDedicated.get(base);
        nonDedicatedList.forEach(nd => {
            // Merge b values
            let dedicatedB = dedicated.b.split(',');
            let nonDedicatedB = nd.b.split(',');
            let mergedB = Array.from(new Set([...dedicatedB, ...nonDedicatedB])).filter(n => n !== 'New Place');
            dedicated.b = mergedB.join(',');
            
            // Remove non-dedicated from content
            content = content.replace(nd.fullMatch + ',\n', '');
            content = content.replace(nd.fullMatch + '\n', '');
            content = content.replace(',\n' + nd.fullMatch, '');
            removedCount++;
        });
        
        // Update dedicated in content
        const newDedicatedStr = `{
    "name": "${dedicated.name}",
    "i": ${dedicated.i},
    "min": ${dedicated.min},
    "max": ${dedicated.max},
    "d": "${dedicated.d}",
    "m": ${dedicated.m},
    "b": "${dedicated.b}"
  }`;
        content = content.replace(dedicated.fullMatch, newDedicatedStr);
        mergedCount++;
    }
}

fs.writeFileSync(filePath, content);
console.log(`Merged ${mergedCount} dedicated entries and removed ${removedCount} duplicates in namebases-africa.js`);
