"use strict";
const fs = require('node:fs');
const path = require('node:path');

const files = [
    'modules/namebases-europe.js',
    'modules/namebases-asia.js',
    'modules/namebases-oceania.js',
    'modules/namebases-africa-restored.js',
    'modules/namebases-northAmerica.js',
    'modules/namebases-southAmerica.js',
    'modules/namebases-fantasy.js'
];

let maxIdx = -1;
files.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (!fs.existsSync(filePath)) {
        console.log('Not found:', file);
        return;
    }
    const content = fs.readFileSync(filePath, 'utf8');
    const matches = content.match(/\"i\"\s*:\s*(\d+)/g);
    if (matches) {
        matches.forEach(m => {
            const val = parseInt(m.match(/\d+/)[0]);
            if (val > maxIdx) maxIdx = val;
        });
    }
});
console.log('Max index found in continent files:', maxIdx);
