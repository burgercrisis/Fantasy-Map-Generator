const fs = require('fs');

const africa = fs.readFileSync('modules/namebases-africa.js', 'utf8');

// Find and fix Central Banda by searching for the pattern
// Looking for "Central Banda" followed by CAR-related cities
const searchPattern = /"b": "Central Banda,CAR,Bangassou,Bouar,M'Ba/;
const replacePattern = '"b": "Bangassou,Bouar,Bambari,Mbaïki,Koumba,Bamingui,Grebaya,Alindao,Mobaye,Kembé,Bria,Ippy,Sibut"';

if (searchPattern.test(africa)) {
    const fixedAfrica = africa.replace(searchPattern, replacePattern);
    fs.writeFileSync('modules/namebases-africa.js', fixedAfrica, 'utf8');
    console.log('Fixed Central Banda');
} else {
    // Try alternative pattern
    const altPattern = /"b": "Central Banda,CAR/;
    if (altPattern.test(africa)) {
        const fixedAfrica = africa.replace(altPattern, replacePattern);
        fs.writeFileSync('modules/namebases-africa.js', fixedAfrica, 'utf8');
        console.log('Fixed Central Banda (alt pattern)');
    } else {
        console.log('Pattern not found, checking what exists...');
        const match = africa.match(/"name": "Central Banda"[\s\S]{50,200}/);
        if (match) {
            console.log('Found entry:', match[0].substring(0, 200));
        }
    }
}
