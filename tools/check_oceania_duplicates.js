const fs = require('fs');

const file = 'modules/namebases-oceania.js';
const content = fs.readFileSync(file, 'utf8');
const entries = content.split('},');

console.log(`Checking ${entries.length} entries in ${file}...`);
const names = {};
let duplicatesCount = 0;
entries.forEach(entry => {
  const nameMatch = entry.match(/"name":\s*"([^"]+)"/);
  if (nameMatch) {
    const name = nameMatch[1];
    if (names[name]) {
      console.log(`Duplicate name found: "${name}"`);
      duplicatesCount++;
    }
    names[name] = true;
  }
});
console.log(`Duplicate check complete. Found ${duplicatesCount} duplicates.`);
