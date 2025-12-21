const fs = require('fs');
const path = require('path');

// 878 ISOs to process. Let's do 50 at a time (Batch 1 & 2 combined)
const allIsos = [
    // Batch 1 (25)
    "korafe","kos","koya","kpt","kra","krc","kum","kumhali","kurambhag-paharia","kurichiya","kuril-dialects","kurukh","kuvi","kva","kvx","kwoma-manambu-pidgin","kxu","kyaka","kyakhta-russian-chinese-pidgin","kyowa-go","kyv","kyw","kzi","l-ngua-geral-paulista","laal",
    // Batch 2 (25)
    "kurumba","kuu-rv-ludic","kwaza","kwinti","kxp","labrador-inuit-pidgin-french","lachi","lakota","lampung","lanping-bai-dialect","lhokpu","liberian-kreyol","libyan-arabic","light-warlpiri","limba","lingala","lingling","lisu","livvi","lmh","lmn","lolo-burmese","loloish","longjia-luren","longsang-zhuang"
];

const startIdx = 13938;

// 1. Update language-mixer-map.json
const mapPath = 'config/language-mixer-map.json';
const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));

allIsos.forEach((iso, i) => {
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

const catalogPath = 'config/language-mixes.json';
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

const newEntries = allIsos.map((iso, i) => {
    const catalogEntry = catalog.find(e => e.iso === iso);
    const name = catalogEntry ? catalogEntry.name : iso;
    const newIdx = startIdx + i;
    const unqs = Array.from({length: 10}, (_, j) => `${iso}_${newIdx}_unq${j+1}`).join(',');
    return `    {name: "${name} (dedicated)", i: ${newIdx}, min: 4, max: 11, d: "lnrt", m: 0, b: "${unqs}"},`;
}).join('\n');

const lastArrayEnd = nbContent.lastIndexOf('];');
if (lastArrayEnd === -1) {
    console.error('Could not find end of array in namebases-real.js');
    process.exit(1);
}

// Ensure there is a newline and indentation before inserting
const contentBefore = nbContent.substring(0, lastArrayEnd);
const finalContent = contentBefore.trimEnd() + (contentBefore.trimEnd().endsWith(',') ? '' : ',') + '\n' + newEntries + '\n];' + nbContent.substring(lastArrayEnd + 2);

fs.writeFileSync(nbPath, finalContent);
console.log('Updated namebases-real.js');
