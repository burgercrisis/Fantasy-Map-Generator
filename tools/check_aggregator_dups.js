const fs = require('fs');
const content = fs.readFileSync('tools/data/namebase-aggregated.js', 'utf8');
const basesMatch = content.match(/"bases":\s*(\[[\s\S]*?\])/);
if (!basesMatch) {
  console.log('Could not find bases');
  process.exit(1);
}
const blocks = basesMatch[1].match(/\{[\s\S]*?\}/g);
const indexMap = {};
blocks.forEach(block => {
  const nameMatch = block.match(/"name":\s*"(.*?)"/);
  const indexMatch = block.match(/"i":\s*(\d+)/);
  if (indexMatch) {
    const i = indexMatch[1];
    if (!indexMap[i]) indexMap[i] = [];
    indexMap[i].push(nameMatch ? nameMatch[1] : 'unknown');
  }
});

const dups = Object.keys(indexMap).filter(i => indexMap[i].length > 1);
console.log('Duplicate Indices in Aggregator:', dups.length);
dups.forEach(i => {
  console.log(`${i}: ${JSON.stringify(indexMap[i])}`);
});
