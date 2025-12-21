const fs = require('fs');
const content = fs.readFileSync('modules/namebases-real.js', 'utf8');

const indices = [21971, 21972, 21539, 22197, 21600, 23392, 1230, 1231, 1233, 1234];

indices.forEach(idx => {
  const regex = new RegExp('{name: \".*?\", i: ' + idx + ',.*?, b: \"(.*?)\"}');
  const match = content.match(regex);
  if (match) {
    console.log(`Index ${idx}: ${match[1].includes('_unq') ? 'HAS _unq' : 'REAL SEEDS'} -> ${match[1].substring(0, 50)}...`);
  } else {
    console.log(`Index ${idx} NOT FOUND`);
  }
});
