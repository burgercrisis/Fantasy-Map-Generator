const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../modules/namebases-africa.js');
let content = fs.readFileSync(filePath, 'utf8');

// Match "name": "Some Name " and replace with "name": "Some Name"
const regex = /"name":\s*"([^"]+)\s+"/g;
let count = 0;

const newContent = content.replace(regex, (match, p1) => {
  count++;
  return `"name": "${p1.trim()}"`;
});

if (count > 0) {
  fs.writeFileSync(filePath, newContent);
  console.log(`Cleaned up ${count} names with trailing spaces in namebases-oceania.js`);
} else {
  console.log('No trailing spaces found in namebases-oceania.js names');
}
