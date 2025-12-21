const fs = require('fs');

const content = fs.readFileSync('modules/namebases-real.js', 'utf8');
const regex = /{name: "(.*?)", i: (\d+),.*?, b: "(.*?)"}/g;
let match;
const unqEntries = [];

while ((match = regex.exec(content)) !== null) {
  const [full, name, index, base] = match;
  if (base.includes('_unq')) {
    unqEntries.push({ name, index, base });
  }
}

const caucasianIndices = [669, 670, 13969, 13974, 13917, 8617];
caucasianIndices.forEach(idx => {
  const found = unqEntries.find(e => parseInt(e.index) === idx);
  if (found) {
    console.log(`Index ${idx} (${found.name}) HAS _unq placeholders: ${found.base.substring(0, 50)}...`);
  } else {
    console.log(`Index ${idx} does NOT have _unq placeholders.`);
  }
});
