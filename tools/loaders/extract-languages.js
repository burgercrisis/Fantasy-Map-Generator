const fs = require('fs');
const content = fs.readFileSync('modules/namebases-real.backup-20251228-221152.js', 'utf8');

// More flexible regex to handle different spacing
const entryRegex = /\{"name":\s*"([^"]+)",\s*"i":\s*(\d+),\s*"min":\s*\d+,\s*"max":\s*\d+,\s*"d":\s*"([^"]*)",\s*"m":\s*[\d.]+,\s*"b":\s*"([^"]+)"\}/g;

let match;
let allLanguages = [];
let count = 0;
const maxToExtract = 2750;

console.log('Extracting languages from backup...');

while ((match = entryRegex.exec(content)) !== null && count < maxToExtract) {
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

console.log(`✅ Successfully extracted ${allLanguages.length} languages\n`);

// Save all languages to a temporary file for processing
const tempData = JSON.stringify(allLanguages, null, 2);
fs.writeFileSync('modules/all-languages-temp.json', tempData);
console.log('Saved to modules/all-languages-temp.json');
