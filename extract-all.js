const fs = require('fs');
const content = fs.readFileSync('modules/namebases-real.backup-20251228-221152.js', 'utf8');

console.log('=== EXTRACTING ALL 2750 LANGUAGES FROM BACKUP ===\n');

// Proper regex matching the actual file format
const entryRegex = /\{"name":\s*"([^"]+)",\s*"i":\s*(\d+),\s*"min":\s*\d+,\s*"max":\s*\d+,\s*"d":\s*"([^"]*)",\s*"m":\s*[\d.]+,\s*"b":\s*"([^"]+)"\}/g;

let match;
let allLanguages = [];
let count = 0;

console.log('Extracting languages...');
while ((match = entryRegex.exec(content)) !== null) {
    allLanguages.push({
        name: match[1],
        i: parseInt(match[2]),
        d: match[3],
        b: match[4]
    });
    count++;
    
    if (count % 500 === 0) {
        console.log(`Extracted ${count} languages...`);
    }
}

console.log(`\n✅ Successfully extracted ${allLanguages.length} languages\n`);

// Save to a temp JSON file for processing
const tempPath = 'modules/all-languages-temp.json';
fs.writeFileSync(tempPath, JSON.stringify(allLanguages, null, 2));
console.log(`Saved to ${tempPath}`);
