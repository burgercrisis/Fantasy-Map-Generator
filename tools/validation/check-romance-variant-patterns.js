"use strict";

/**
 * Pattern Match Verification Script
 * 
 * Checks for specific Romance language variant patterns in namebases.
 * Used for validating regional language variant naming conventions.
 * 
 * Usage:
 *   node tools/validation/check-remaining-patterns.js
 */

const fs = require('fs');

const continentFiles = [
    'modules/namebases-europe.js',
    'modules/namebases-africa.js',
    'modules/namebases-asia.js',
    'modules/namebases-northAmerica.js',
    'modules/namebases-southAmerica.js',
    'modules/namebases-oceania.js'
];

let combinedContent = '';
for (const file of continentFiles) {
    if (fs.existsSync(file)) {
        combinedContent += fs.readFileSync(file, 'utf8') + '\n';
    }
}

// Specific patterns to check for regional variants
const patterns = ['andalusiromancea','ansoa','balearica','banataa','barranquenhoa','benasquesea','berciana','bergamasquea','bolivianspanisha','bolognesea','bragoneana','brazilianportuguesea','brianzo','brivasca','britishlatina','bukoviniana','burgundiana','canzesa','cantabriana','castiliana','castilianoleon','catalana'];
let found = patterns.filter(p => combinedContent.includes(p));
console.log('Patterns found: ' + found.length);
found.forEach(p => console.log('- ' + p));
