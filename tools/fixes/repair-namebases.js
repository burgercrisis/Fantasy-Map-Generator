"use strict";
const fs = require('node:fs');
const path = require('node:path');

const files = [
    'modules/namebases-europe.js',
    'modules/namebases-asia.js',
    'modules/namebases-oceania.js',
    'modules/namebases-africa.js',
    'modules/namebases-northAmerica.js',
    'modules/namebases-southAmerica.js',
    'modules/namebases-fantasy.js'
];

files.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (!fs.existsSync(filePath)) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // 1. Fix Nested Smashed Objects: "b": ""name": "..."
    // This happens when an object was stringified into the 'b' field incorrectly.
    const nestedRegex = /"b":\s*""name":\s*"([^"]+)"\s*,\s*"i":\s*(\d+)\s*,\s*"min":\s*(\d+)\s*,\s*"max":\s*(\d+)\s*,\s*"d":\s*"([^"]*)"\s*,\s*"m":\s*([\d.]+)\s*,\s*"b":\s*"([^"]+)"/g;
    
    const nestedMatches = content.match(nestedRegex);
    if (nestedMatches) {
        console.log(`Found ${nestedMatches.length} nested objects in ${file}`);
        content = content.replace(nestedRegex, (match, name, i, min, max, d, m, b) => {
            modified = true;
            return `"b": "${b}"`; // Keep the innermost 'b' data, the rest is redundant duplication
        });
    }

    // 2. Fix Dangling Raw Data after object closing: },name1,name2...
    // Pattern: },names followed by anything that isn't a { or [
    // We target the specific case where names are dumped outside the object
    const danglingRegex = /\}\s*,([a-zA-Z\u00C0-\u017F][a-zA-Z0-9\s,.'\-\u00C0-\u017F]*)\s*\},/g;
    const danglingMatches = content.match(danglingRegex);
    if (danglingMatches) {
        console.log(`Found ${danglingMatches.length} dangling name blocks in ${file}`);
        content = content.replace(danglingRegex, (match, names) => {
            modified = true;
            return `,${names.trim()}},`;
        });
    }

    // 2.5 Fix the "Korean" specific corruption where the object header is missing
    // or names are dumped directly after the closing brace of the previous object.
    // Example: },yang,Cheorwon...},
    const smashRegex = /\}\s*,\s*([a-zA-Z\u00C0-\u017F][^\{]*)\s*\},/g;
    const smashMatches = content.match(smashRegex);
    if (smashMatches) {
        console.log(`Found ${smashMatches.length} smashed entries in ${file}`);
        content = content.replace(smashRegex, (match, names) => {
            modified = true;
            return `,${names.trim()}},`;
        });
    }
    
    // 3. Fix double closing braces and other syntax errors
    const syntaxRegex = /"b":\s*"([^"]+)"\s*"\s*\}\s*,/g;
    if (content.match(syntaxRegex)) {
        content = content.replace(syntaxRegex, (match, b) => {
            modified = true;
            return `"b": "${b}"\n  },`;
        });
    }

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Successfully repaired ${file}`);
    } else {
        console.log(`No corruption patterns found in ${file}`);
    }
});
