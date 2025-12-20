
const fs = require('fs');
const path = require('path');

const mixes = JSON.parse(fs.readFileSync('config/language-mixes.json', 'utf8').replace(/^\uFEFF/, ""));
const map = JSON.parse(fs.readFileSync('config/language-mixer-map.json', 'utf8').replace(/^\uFEFF/, ""));
const southAsia = JSON.parse(fs.readFileSync('tools/mixer-meta/wikipedia-languages-of-south-asia.json', 'utf8').replace(/^\uFEFF/, ""));

const mixByIso = new Map(mixes.map(m => [m.iso, m]));
const mapByIso = new Map(map.map(m => [m.iso, m]));

const baseToIsos = new Map();
for (const entry of map) {
    if (!entry.iso) continue;
    const lang = mixByIso.get(entry.iso);
    if (lang && (lang.tags || []).includes('family')) continue;
    const bases = entry.bases || [];
    for (const b of bases) {
        if (!baseToIsos.has(b)) baseToIsos.set(b, new Set());
        baseToIsos.get(b).add(entry.iso);
    }
}

console.log("ISO | Name | Bases | Shared With");
for (const item of southAsia.items) {
    const iso = item.iso;
    if (!iso) continue;
    const entry = mapByIso.get(iso);
    if (!entry) continue;
    
    const bases = entry.bases || [];
    let isUnique = true;
    const sharedWith = new Set();
    
    for (const b of bases) {
        const isos = baseToIsos.get(b);
        if (isos && isos.size > 1) {
            isUnique = false;
            for (const other of isos) {
                if (other !== iso) sharedWith.add(other);
            }
        }
    }
    
    if (!isUnique) {
        console.log(`${iso} | ${item.name} | [${bases.join(',')}] | ${Array.from(sharedWith).slice(0, 3).join(',')}...`);
    }
}
