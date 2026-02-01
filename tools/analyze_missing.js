"use strict";
const fs = require('node:fs');
const path = require('node:path');

const backupPath = path.join(process.cwd(), 'modules/backups/namebases-real.backup-20251228-221152.js');
const backupContent = fs.readFileSync(backupPath, 'utf8');

const continentFiles = [
    'modules/namebases-europe.js',
    'modules/namebases-asia.js',
    'modules/namebases-oceania.js',
    'modules/namebases-africa.js',
    'modules/namebases-northAmerica.js',
    'modules/namebases-southAmerica.js',
    'modules/namebases-fantasy.js',
    'modules/namebases-unknown.js'
];

const existingNames = new Set();
continentFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (!fs.existsSync(filePath)) return;
    const content = fs.readFileSync(filePath, 'utf8');
    const matches = content.matchAll(/\{\s*"?name"?\s*:\s*"([^"]+)"/g);
    for (const match of matches) {
        existingNames.add(match[1]);
    }
});

// Extract all entries from backup as objects
// Note: The backup is a JS file, we'll use a regex to extract the objects
const entryRegex = /\{\s*"?name"?\s*:\s*"([^"]+)"[\s\S]*?\}\s*(?=,|\s*\])/g;
const missingEntries = [];

let match;
while ((match = entryRegex.exec(backupContent)) !== null) {
    const name = match[1];
    if (!existingNames.has(name)) {
        missingEntries.push(match[0]);
    }
}

console.log(`Found ${missingEntries.length} missing entries in backup.`);

// Sample some missing entries to see the "d" field
missingEntries.slice(0, 20).forEach(entry => {
    const nameMatch = entry.match(/"name"\s*:\s*"([^"]+)"/);
    const dMatch = entry.match(/"d"\s*:\s*"([^"]+)"/);
    console.log(`Name: ${nameMatch ? nameMatch[1] : '???'}, d: ${dMatch ? dMatch[1] : '???'}`);
});

// Write missing entries to a temporary file for inspection
fs.writeFileSync('tmp/missing_entries.json', JSON.stringify(missingEntries, null, 2));
