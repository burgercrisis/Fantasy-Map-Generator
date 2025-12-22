const fs = require('fs');
const path = require('path');

const batchIsos = ["kurumba","kuu-rv-ludic","kwaza","kwinti","kxp","labrador-inuit-pidgin-french","lachi","lakota","lampung","lanping-bai-dialect","lhokpu","liberian-kreyol","libyan-arabic","light-warlpiri","limba","lingala","lingling","lisu","livvi","lmh","lmn","lolo-burmese","loloish","longjia-luren","longsang-zhuang"];
const startIdx = 13963;

// 1. Update language-mixer-map.json
const mapPath = 'config/language-mixer-map.json';
const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));

batchIsos.forEach((iso, i) => {
    const entry = map.find(e => e.iso === iso);
    if (entry) {
        const newIdx = startIdx + i;
        if (!entry.bases.includes(newIdx)) {
            entry.bases.push(newIdx);
        }
    } else {
        console.warn(`ISO ${iso} not found in map`);
    }
});

fs.writeFileSync(mapPath, JSON.stringify(map, null, 2));
console.log('Updated language-mixer-map.json');

// 2. Update namebases-real.js
const nbPath = 'modules/namebases-real.js';
let nbContent = fs.readFileSync(nbPath, 'utf8');

// Find the catalog to get names for the ISOs
const catalogPath = 'config/language-mixes.json';
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

const newEntries = batchIsos.map((iso, i) => {
    const catalogEntry = catalog.find(e => e.iso === iso);
    const name = catalogEntry ? catalogEntry.name : iso;
    const newIdx = startIdx + i;
    const unqs = Array.from({length: 10}, (_, j) => `${iso}_${newIdx}_unq${j+1}`).join(',');
    return `    {name: "${name} (dedicated)", i: ${newIdx}, min: 4, max: 11, d: "lnrt", m: 0, b: "${unqs}"},`;
}).join('\n');

// Insert before the last ];
const lastArrayEnd = nbContent.lastIndexOf('];');
if (lastArrayEnd === -1) {
    console.error('Could not find end of array in namebases-real.js');
    process.exit(1);
}

// Check if we need a comma before inserting
let insertionPoint = lastArrayEnd;
const contentBefore = nbContent.substring(0, lastArrayEnd).trim();
if (!contentBefore.endsWith(',')) {
    // Find the last } and add a comma
    const lastBrace = contentBefore.lastIndexOf('}');
    if (lastBrace !== -1) {
        nbContent = nbContent.substring(0, lastBrace + 1) + ',' + nbContent.substring(lastBrace + 1);
        insertionPoint = nbContent.lastIndexOf('];');
    }
}

const finalContent = nbContent.substring(0, insertionPoint) + newEntries + '\n' + nbContent.substring(insertionPoint);
fs.writeFileSync(nbPath, finalContent);
console.log('Updated namebases-real.js');
