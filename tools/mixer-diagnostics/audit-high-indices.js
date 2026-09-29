const fs = require('fs');
const path = require('path');
const {realWorldNameBases} = require('../namebase-tools/load-namebases');

const map = JSON.parse(fs.readFileSync('config/language-mixer-map.json', 'utf8'));

const nbIndices = {};
realWorldNameBases().forEach(base => {
    if (typeof base.i !== 'number') return;
    if (base.i >= 13900) {
        if (!nbIndices[base.i]) nbIndices[base.i] = [];
        nbIndices[base.i].push(base.name);
    }
});

const mapIndices = {};
map.forEach(r => {
    r.bases.forEach(b => {
        if (typeof b === 'number' && b >= 13900) {
            if (!mapIndices[b]) mapIndices[b] = [];
            mapIndices[b].push(r.iso);
        }
    });
});

console.log('--- Namebases-real.js High Indices ---');
Object.keys(nbIndices).sort((a,b) => a-b).forEach(idx => {
    console.log(`${idx}: ${nbIndices[idx].join(', ')}`);
});

console.log('\n--- Language-mixer-map.json High Indices ---');
Object.keys(mapIndices).sort((a,b) => a-b).forEach(idx => {
    console.log(`${idx}: ${mapIndices[idx].join(', ')}`);
});

const allHighIndices = new Set([...Object.keys(nbIndices), ...Object.keys(mapIndices)]);
console.log('\n--- Discrepancies ---');
allHighIndices.forEach(idx => {
    const nb = nbIndices[idx] || [];
    const mp = mapIndices[idx] || [];
    if (nb.length !== 1 || mp.length !== 1) {
        console.log(`Index ${idx}: NB count=${nb.length}, MAP count=${mp.length}`);
        if (nb.length > 1) console.log(`  NB Duplicates: ${nb.join(' | ')}`);
        if (mp.length > 1) console.log(`  MAP Duplicates: ${mp.join(' | ')}`);
        if (nb.length === 0) console.log(`  Missing in NB!`);
        if (mp.length === 0) console.log(`  Missing in MAP!`);
    }
});
