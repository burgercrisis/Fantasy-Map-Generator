const fs = require('fs');
const content = fs.readFileSync('modules/namebases-oceania.js', 'utf8');
const regex = /"d":\s*"(.*?)"/g;
const counts = {};
let match;
while ((match = regex.exec(content)) !== null) {
  const d = match[1];
  counts[d] = (counts[d] || 0) + 1;
}
console.log(JSON.stringify(counts, null, 2));
