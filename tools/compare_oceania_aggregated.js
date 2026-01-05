const fs = require('fs');

function getEntries(filePath, isAggregated = false) {
  const content = fs.readFileSync(filePath, 'utf8');
  let blocks;
  if (isAggregated) {
    const basesMatch = content.match(/"bases":\s*(\[[\s\S]*?\])/);
    if (!basesMatch) return {};
    blocks = basesMatch[1].match(/\{[\s\S]*?\}/g);
  } else {
    blocks = content.match(/\{[\s\S]*?\}/g);
  }
  
  const map = {};
  if (blocks) {
    blocks.forEach(block => {
      const nameMatch = block.match(/"name":\s*"(.*?)"/);
      const indexMatch = block.match(/"i":\s*(\d+)/);
      if (nameMatch && indexMatch) {
        map[indexMatch[1]] = nameMatch[1];
      }
    });
  }
  return map;
}

const aggregatedMap = getEntries('tools/data/namebase-aggregated.js', true);
const oceaniaMap = getEntries('modules/namebases-oceania.js');

console.log('--- 200xx Comparison: Oceania vs Aggregated ---');
const oceania200xx = Object.keys(oceaniaMap).filter(id => id.startsWith('200')).sort();

oceania200xx.forEach(id => {
  const name = oceaniaMap[id];
  if (aggregatedMap[id]) {
    if (aggregatedMap[id] === name) {
      console.log(`${id}: Match - "${name}"`);
    } else {
      console.log(`${id}: MISMATCH! Oceania: "${name}", Aggregated: "${aggregatedMap[id]}"`);
    }
  } else {
    console.log(`${id}: Missing from Aggregated - "${name}"`);
  }
});

console.log('\n--- 200xx in Aggregated but missing from Oceania ---');
Object.entries(aggregatedMap).forEach(([id, name]) => {
  if (id.startsWith('200') && !oceaniaMap[id]) {
     // Check if it sounds Oceanic
     const keywords = ['pacific', 'oceania', 'pidgin', 'pijin', 'bislama', 'tok pisin', 'hawaiian', 'papuan', 'australian', 'maori', 'samoan', 'fiji', 'tonga', 'cook islands'];
     const isOceanic = keywords.some(k => name.toLowerCase().includes(k));
     if (isOceanic) {
       console.log(`${id}: "${name}"`);
     }
  }
});
