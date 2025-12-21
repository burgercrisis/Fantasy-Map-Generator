const fs = require('fs');
const path = require('path');

const content = fs.readFileSync('modules/namebases-real.js', 'utf8');
const indices = [1133, 1134, 1135, 1136];

indices.forEach(i => {
  const regex = new RegExp('{name: ".*?", i: ' + i + ',.*?}');
  const match = content.match(regex);
  if (match) {
    console.log(match[0]);
  } else {
    console.log(`Index ${i} not found`);
  }
});
