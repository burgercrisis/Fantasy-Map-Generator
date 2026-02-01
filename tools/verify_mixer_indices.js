"use strict";
const fs = require('node:fs');
const path = require('node:path');

const continentFiles = [
    'modules/namebases-europe.js',
    'modules/namebases-asia.js',
    'modules/namebases-oceania.js',
    'modules/namebases-africa-restored.js',
    'modules/namebases-northAmerica.js',
    'modules/namebases-southAmerica.js',
    'modules/namebases-fantasy.js'
];

const validIndices = new Set();
continentFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (!fs.existsSync(filePath)) return;
    const content = fs.readFileSync(filePath, 'utf8');
    const matches = content.match(/\"i\"\s*:\s*(\d+)/g);
    if (matches) {
        matches.forEach(m => {
            validIndices.add(parseInt(m.match(/\d+/)[0]));
        });
    }
});

console.log(`Total unique indices in continent files: ${validIndices.size}`);

const mixerMapPath = path.join(process.cwd(), 'config/language-mixer-map.js');
const mixerMapContent = fs.readFileSync(mixerMapPath, 'utf8');

// Extract all base IDs from mixer map
// Format is "bases": [1, 2, 3] or "bases": [1]
const baseMatches = mixerMapContent.match(/\"bases\"\s*:\s*\[([\s\d,]*)\]/g);
const invalidBases = [];

if (baseMatches) {
    baseMatches.forEach(match => {
        const ids = match.match(/\[([\s\d,]*)\]/)[1].split(',').map(s => s.trim()).filter(s => s !== '');
        ids.forEach(idStr => {
            const id = parseInt(idStr);
            if (!validIndices.has(id)) {
                invalidBases.push(id);
            }
        });
    });
}

if (invalidBases.length > 0) {
    console.log(`Found ${invalidBases.length} invalid base indices in mixer map.`);
    console.log('Sample invalid indices:', invalidBases.slice(0, 10));
} else {
    console.log('All indices in mixer map are valid!');
}
