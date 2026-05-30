"use strict";
const fs = require('node:fs');
const path = require('node:path');

const files = [
    'modules/namebases-europe.js',
    'modules/namebases-asia.js',
    'modules/namebases-oceania.js',
    'modules/namebases-africa.js',
    'modules/namebases-northAmerica.js',
    'modules/namebases-southAmerica.js'
];

files.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (!fs.existsSync(filePath)) {
        console.log('File not found:', file);
        return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Improved regex to find objects with name 'New Place' or ending in '_unq'
    // Matches { ... "name": "New Place" ... } or { ... "name": "xxx_unq" ... }
    const placeholderRegex = /\{\s*\"name\"\s*:\s*\"(New Place|.*?_unq)\"[\s\S]*?\}\s*(,\s*)?/g;
    
    const originalCount = (content.match(/\{/g) || []).length;
    let cleanedContent = content.replace(placeholderRegex, '');
    
    // Cleanup syntax errors introduced by removal
    cleanedContent = cleanedContent.replace(/,\s*,/g, ',');
    cleanedContent = cleanedContent.replace(/\[\s*,/g, '[');
    cleanedContent = cleanedContent.replace(/,\s*\]/g, ']');
    
    const newCount = (cleanedContent.match(/\{/g) || []).length;
    
    if (originalCount !== newCount) {
        fs.writeFileSync(filePath, cleanedContent, 'utf8');
        console.log(`Cleaned ${file}: Removed ${originalCount - newCount} placeholders.`);
    } else {
        console.log(`No placeholders found in ${file}.`);
    }
});
