const fs = require('fs');
const content = fs.readFileSync('modules/namebases-oceania.js', 'utf8');
const names = [];
const indices = [];
const nameMatches = content.matchAll(/"name":\s*"(.*?)"/g);
const indexMatches = content.matchAll(/"i":\s*(\d+)/g);
for (const match of nameMatches) names.push(match[1]);
for (const match of indexMatches) indices.push(match[1]);

const dupNames = names.filter((n, i) => names.indexOf(n) !== i);
const dupIndices = indices.filter((n, i) => indices.indexOf(n) !== i);

console.log('Duplicate Names:', JSON.stringify([...new Set(dupNames)], null, 2));
console.log('Duplicate Indices:', JSON.stringify([...new Set(dupIndices)], null, 2));

const entriesWithDupIndices = indices.map((idx, i) => ({ name: names[i], i: idx }))
  .filter(e => dupIndices.includes(e.i));
console.log('Entries with Duplicate Indices:', JSON.stringify(entriesWithDupIndices, null, 2));
