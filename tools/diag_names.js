"use strict";
const fs = require('node:fs');
const path = require('node:path');

const backupPath = path.join(process.cwd(), 'modules/backups/namebases-real.backup-20251228-221152.js');
const backupContent = fs.readFileSync(backupPath, 'utf8');

const oldNames = new Set();
const backupMatches = backupContent.matchAll(/\{\s*"?name"?\s*:\s*"([^"]+)"\s*,\s*"?i"?\s*:\s*(\d+)/g);
for (const match of backupMatches) {
    oldNames.add(match[1]);
}
console.log(`Old names: ${oldNames.size}`);

const continentFiles = [
    'modules/namebases-europe.js',
    'modules/namebases-asia.js',
    'modules/namebases-oceania.js',
    'modules/namebases-africa.js',
    'modules/namebases-northAmerica.js',
    'modules/namebases-southAmerica.js',
    'modules/namebases-fantasy.js'
];

const newNames = new Set();
continentFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (!fs.existsSync(filePath)) return;
    const content = fs.readFileSync(filePath, 'utf8');
    // More robust regex to catch both "name": and name:
    const matches = content.matchAll(/\{\s*"?name"?\s*:\s*"([^"]+)"/g);
    for (const match of matches) {
        newNames.add(match[1]);
    }
});
console.log(`New names (clean matches): ${newNames.size}`);

let intersection = 0;
const missingFromNew = [];
for (const name of oldNames) {
    if (newNames.has(name)) {
        intersection++;
    } else {
        missingFromNew.push(name);
    }
}

console.log(`Intersection: ${intersection}`);
console.log(`Missing from new (first 50):`, missingFromNew.slice(0, 50));
