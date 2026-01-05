const fs = require('fs');
const content = fs.readFileSync('modules/namebases-oceania.js', 'utf8');
const indices = content.match(/"i":\s*\d+/g);
const counts = {};
indices.forEach(i => {
  counts[i] = (counts[i] || 0) + 1;
});

for (const i in counts) {
  if (counts[i] > 1) {
    console.log(`${i}: ${counts[i]}`);
  }
}
