const fs = require('fs');

console.log('=== Comprehensive Africa Encoding Fix ===\n');

const africa = fs.readFileSync('modules/namebases-africa.js', 'utf8');
let fixed = africa;

// Common Portuguese/African encoding issues
const fixes = [
    // São Tomé and Príncipe creoles
    [/SÃ£o/g, 'São'],
    [/TomÃ©/g, 'Tomé'],
    [/Angola/g, 'Angola'], // Sometimes garbled
    
    // French African languages
    [/GourmanchÃ©/g, 'Gourmanché'],
    [/GhadamÃ¨s/g, 'Ghadamès'],
    
    // Portuguese
    [/SÃ£o/g, 'São'],
    [/PaÃ­s/g, 'País'],
    
    // Common mojibake patterns
    [/Ã§/g, 'ç'],
    [/Ã©/g, 'é'],
    [/Ã¨/g, 'è'],
    [/Ãª/g, 'ê'],
    [/Ã /g, 'à'],
    [/Ã¡/g, 'á'],
    [/Ã¢/g, 'â'],
    [/Ã³/g, 'ó'],
    [/Ã´/g, 'ô'],
    [/Ã±/g, 'ñ'],
    [/Ã¼/g, 'ü'],
    [/Ã¶/g, 'ö'],
    [/Ã„/g, 'Ä'],
    [/Ã‰/g, 'É'],
    
    // Control characters and special
    [/â€/g, '–'],
    [/â€™/g, "'"],
    [/â€"/g, '"'],
    [/Â/g, ''], // Remove leftover from double-encoding
    
    // Specific patterns found
    [/S£o/g, 'São'],
    [/PalÃ©/g, 'Palé'],
    [/SÃ£o/g, 'São'],
    [/TomÃ©/g, 'Tomé'],
];

let count = 0;
for (const [pattern, replacement] of fixes) {
    const before = fixed.length;
    fixed = fixed.replace(pattern, replacement);
    if (fixed.length !== before) {
        count++;
    }
}

if (count > 0) {
    fs.writeFileSync('modules/namebases-africa.js', fixed, 'utf8');
    console.log(`✓ Applied ${count} encoding fixes to Africa.js`);
} else {
    console.log('No changes detected');
}

// Verify some specific entries
const entries = [
    'Angolar',
    'Forro',
    'Gourmanché',
    'Ghadamès',
];

for (const entry of entries) {
    if (fixed.includes(entry)) {
        console.log(`✓ Found "${entry}"`);
    }
}

console.log('\n=== Done ===');
