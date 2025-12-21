const fs = require('fs');
const content = fs.readFileSync('modules/namebases-real.js', 'utf8');
const indices = [13926, 13937, 13938, 13962, 13963, 13987];
indices.forEach(i => {
    console.log(`Index ${i}: ${content.indexOf('i: ' + i + ',') !== -1}`);
});
