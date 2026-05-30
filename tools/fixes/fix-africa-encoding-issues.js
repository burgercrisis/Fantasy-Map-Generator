const fs = require('fs');

console.log('=== Comprehensive Africa Place Name Fix ===\n');

let africa = fs.readFileSync('modules/namebases-africa.js', 'utf8');

// Fix all encoding issues in the b (place names) field
const fixes = [
    // Portuguese names
    [/SÃ£o/g, 'São'],
    [/JoÃ£o/g, 'João'],
    [/PaÃ­s/g, 'País'],
    [/PaÃ­s/g, 'País'],
    [/PaÃ\xad/g, 'País'],

    // Cameroon/Africa specific
    [/CamÃ£o/g, 'Camarão'],
    [/CaixÃ£o/g, 'Caixão'],
    [/AntÃ³nio/g, 'António'],
    [/MicondÃ³/g, 'Micondó'],
    [/JoÃºlio/g, 'Júlio'],
    [/TombÃ¡/g, 'Tombá'],
    
    // French African
    [/GourmanchÃ©/g, 'Gourmanché'],
    [/GhadamÃ¨s/g, 'Ghadamès'],
    
    // More Portuguese
    [/PaÃ\xad/g, 'País'],
    [/Ponta Baleia/g, 'Ponta Baleia'], // This might be getting overwritten
    [/PaÃ­s/g, 'País'],
    
    // Generic encoding patterns
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
    [/Â/g, ''],
];

let totalFixes = 0;
for (const [pattern, replacement] of fixes) {
    const before = africa.length;
    africa = africa.replace(pattern, replacement);
    if (africa.length !== before) {
        totalFixes++;
    }
}

if (totalFixes > 0) {
    fs.writeFileSync('modules/namebases-africa.js', africa, 'utf8');
    console.log(`✓ Applied ${totalFixes} encoding fixes`);
} else {
    console.log('No changes detected');
}

// Check specific problematic entries
const checks = [
    'Angolar São',
    'São João',
    'Gourmanché',
];

for (const check of checks) {
    if (africa.includes(check)) {
        console.log(`✓ Found "${check}"`);
    }
}

console.log('\n=== Done ===');
