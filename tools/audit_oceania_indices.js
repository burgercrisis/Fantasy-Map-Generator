const fs = require('fs');

const oceaniaFile = 'modules/namebases-oceania.js';
const aggregatedFile = 'tools/data/namebase-aggregated.js';

const oceaniaContent = fs.readFileSync(oceaniaFile, 'utf8');
const aggregatedContent = fs.readFileSync(aggregatedFile, 'utf8');

const oceaniaEntries = oceaniaContent.split('},');
const aggregatedEntries = aggregatedContent.split('},');

const aggregatedIndices = {};
aggregatedEntries.forEach(entry => {
    const iMatch = entry.match(/"i":\s*(\d+)/);
    const nameMatch = entry.match(/"name":\s*"([^"]+)"/);
    if (iMatch && nameMatch) {
        aggregatedIndices[parseInt(iMatch[1])] = nameMatch[1];
    }
});

console.log(`Auditing Oceania indices against aggregated file...`);
let collisionCount = 0;
oceaniaEntries.forEach(entry => {
    const iMatch = entry.match(/"i":\s*(\d+)/);
    const nameMatch = entry.match(/"name":\s*"([^"]+)"/);
    if (iMatch && nameMatch) {
        const index = parseInt(iMatch[1]);
        const name = nameMatch[1];
        
        if (aggregatedIndices[index] && aggregatedIndices[index] !== name) {
            console.log(`COLLISION: Index ${index} is "${name}" in Oceania but "${aggregatedIndices[index]}" in Aggregated.`);
            collisionCount++;
        }
    }
});

console.log(`Audit complete. Found ${collisionCount} collisions.`);
