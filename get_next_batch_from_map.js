const fs = require('fs');
const path = require('path');

const mapPath = path.resolve('config/language-mixer-map.json');
const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));

const nextBatch = [];
for (const entry of map) {
    const hasDedicated = entry.bases.some(b => typeof b === 'number' && b >= 13938);
    if (!hasDedicated) {
        // We only care about those that are actually NO_UNIQ_BASE.
        // For now, let's assume if it doesn't have a dedicated index, it's a candidate.
        // We can refine this by checking if it's in the previous no_uniq_base_list.json.
        nextBatch.push(entry.iso);
    }
    if (nextBatch.length === 25) break;
}

console.log(JSON.stringify(nextBatch, null, 2));
