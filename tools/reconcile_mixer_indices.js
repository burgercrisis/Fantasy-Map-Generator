"use strict";
const fs = require('node:fs');
const path = require('node:path');

// 1. Load the original mapping (Old Index -> Name) from the backup
const backupPath = path.join(process.cwd(), 'modules/namebases-real.js.backup-before-batch1');
const backupContent = fs.readFileSync(backupPath, 'utf8');

const oldIndexToName = new Map();
// Look for { name: "Name", i: 123, ... }
const backupMatches = backupContent.matchAll(/\{\s*"?name"?\s*:\s*"([^"]+)"\s*,\s*"?i"?\s*:\s*(\d+)/g);
for (const match of backupMatches) {
    oldIndexToName.set(parseInt(match[2]), match[1]);
}
console.log(`Loaded ${oldIndexToName.size} names from backup.`);

// 2. Load the new mapping (Name -> { File, New Index }) from the continental files
const continentFiles = [
    'modules/namebases-europe.js',
    'modules/namebases-asia.js',
    'modules/namebases-oceania.js',
    'modules/namebases-africa.js',
    'modules/namebases-northAmerica.js',
    'modules/namebases-southAmerica.js',
    'modules/namebases-fantasy.js'
];

const nameToNewInfo = new Map();
continentFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${file}`);
        return;
    }
    const content = fs.readFileSync(filePath, 'utf8');
    // Look for { name: "Name", i: 456, ... } or { "name": "Name", "i": 456, ... }
    const matches = content.matchAll(/\{\s*"?name"?\s*:\s*"([^"]+)"\s*,\s*"?i"?\s*:\s*(\d+)/g);
    for (const match of matches) {
        nameToNewInfo.set(match[1], { file, index: parseInt(match[2]) });
    }
});
console.log(`Loaded ${nameToNewInfo.size} entries from new continental files.`);

// 3. Create the reconciliation map (Old Index -> New Index)
const oldToNewIndex = new Map();
let resolved = 0;
let missing = 0;

for (const [oldIndex, name] of oldIndexToName.entries()) {
    if (nameToNewInfo.has(name)) {
        oldToNewIndex.set(oldIndex, nameToNewInfo.get(name).index);
        resolved++;
    } else {
        missing++;
        // console.warn(`Could not find new index for "${name}" (Old ID: ${oldIndex})`);
    }
}
console.log(`Reconciliation Map: ${resolved} resolved, ${missing} missing.`);

// 4. Update language-mixer-map.js
const mixerMapPath = path.join(process.cwd(), 'config/language-mixer-map.js');
let mixerMapContent = fs.readFileSync(mixerMapPath, 'utf8');

// The file has structures like "bases": [1, 2, 3]
// We need to find all numbers inside these arrays and replace them if they exist in our map
const updatedContent = mixerMapContent.replace(/("bases"\s*:\s*\[)([\s\d,]*)(\])/g, (match, prefix, content, suffix) => {
    const ids = content.split(',').map(s => s.trim()).filter(s => s !== '');
    const newIds = ids.map(idStr => {
        const id = parseInt(idStr);
        if (oldToNewIndex.has(id)) {
            return oldToNewIndex.get(id);
        }
        return id; // Keep as is if not found
    });
    return `${prefix}${newIds.join(', ')}${suffix}`;
});

if (updatedContent !== mixerMapContent) {
    fs.writeFileSync(mixerMapPath, updatedContent, 'utf8');
    console.log(`Updated language-mixer-map.js successfully.`);
} else {
    console.log(`No changes needed or no matches found in language-mixer-map.js.`);
}
