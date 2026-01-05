const fs = require('fs');
const content = fs.readFileSync('modules/namebases-oceania.js', 'utf8');
const names = content.match(/"name":\s*"[^"]+"/g);
const counts = {};
names.forEach(n => {
  counts[n] = (counts[n] || 0) + 1;
});

for (const n in counts) {
  if (counts[n] > 1) {
    console.log(`${n}: ${counts[n]}`);
  }
}
