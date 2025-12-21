const fs = require('fs');
const path = require('path');

const namebasesPath = 'modules/namebases-real.js';
const appendText = fs.readFileSync('tools/mixer-core/append-batch-2.txt', 'utf8');

let content = fs.readFileSync(namebasesPath, 'utf8');

// Find the last ];
const lastIndex = content.lastIndexOf('];');
if (lastIndex === -1) {
    throw new Error('Could not find closing ]; in namebases-real.js');
}

const newContent = content.slice(0, lastIndex) + appendText + content.slice(lastIndex);

fs.writeFileSync(namebasesPath, newContent);
console.log('Successfully appended Batch 2 to namebases-real.js');
