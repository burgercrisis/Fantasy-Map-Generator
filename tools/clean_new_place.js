const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../modules/namebases-africa.js');
let content = fs.readFileSync(filePath, 'utf8');

// Replace ,New Place with nothing
const regex = /,New Place/g;
let count = 0;

const newContent = content.replace(regex, (match) => {
  count++;
  return '';
});

if (count > 0) {
  fs.writeFileSync(filePath, newContent);
  console.log(`Cleaned up ${count} "New Place" placeholders in namebases-oceania.js`);
} else {
  console.log('No "New Place" placeholders found in namebases-oceania.js');
}
