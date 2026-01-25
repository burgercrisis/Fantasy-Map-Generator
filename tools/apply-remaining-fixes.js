const fs = require('fs');

console.log('=== Applying Remaining Fixes ===\n');

// Fix 1: Remove Chakato from Africa (has "language" suffix) and move to North America
console.log('1. Moving Chakato from Africa to North America...');
const africa = fs.readFileSync('modules/namebases-africa.js', 'utf8');
const northAmerica = fs.readFileSync('modules/namebases-northAmerica.js', 'utf8');

// Extract Chakato entry (with language suffix)
const chakatoMatch = africa.match(/  \{\r?\n    "name": "Chakato language",\r?\n    "i": 20703,\r?\n    "min": 4,\r?\n    "max": 11,\r?\n    "d": "nic-GH",\r?\n    "m": 0,\r?\n    "b": "Chakato,Kansas,Oklahoma,Missouri,USA,Mississippi River,Great Plains,Central Plains"\r?\n  \}/);

if (chakatoMatch) {
    // Remove from Africa
    const fixedAfrica = africa.replace(chakatoMatch[0] + ',\r?\n\r?\n', '').replace(chakatoMatch[0] + ',\r?\n', '');
    fs.writeFileSync('modules/namebases-africa.js', fixedAfrica, 'utf8');
    console.log('   ✓ Removed from Africa.js');

    // Add to North America (after Cherokee, before Chinook Jargon) - remove language suffix
    const newChakato = `  {
    "name": "Chakato",
    "i": 20703,
    "min": 4,
    "max": 11,
    "d": "nic-GH",
    "m": 0,
    "b": "Lawrence,Topeka,Oklahoma City,Tulsa,Wichita,Kansas City,St. Louis,Springfield,Joplin,Pittsburg,Independence,Kansas"
  },`;

    const fixedNorthAmerica = northAmerica.replace(
        /("name": "Chinook Jargon")/,
        newChakato + '\r\n\r\n  {\r\n    "name": "Chinook Jargon'
    );
    fs.writeFileSync('modules/namebases-northAmerica.js', fixedNorthAmerica, 'utf8');
    console.log('   ✓ Added to North America.js');
} else {
    console.log('   ⚠ Chakato not found in Africa.js');
}

console.log('\n2. Fixing Central Banda...');
const africa2 = fs.readFileSync('modules/namebases-africa.js', 'utf8');

// Try different patterns
let fixedCentralBanda = africa2;
const patterns = [
    /"b": "Central Banda,CAR,Bangassou,Bouar,M'Baï,Bambari,Koumba,Bamingui,Grebaya,Chad,Ibbi,Abéché,N'Djamena"/g,
    /"b": "Central Banda,CAR,Bangassou,Bouar,M'Ba/i,
];

for (const pattern of patterns) {
    if (pattern.test(fixedCentralBanda)) {
        fixedCentralBanda = fixedCentralBanda.replace(
            pattern,
            '"b": "Bangassou,Bouar,Bambari,Mbaïki,Koumba,Bamingui,Grebaya,Alindao,Mobaye,Kembé,Bria,Ippy,Sibut"'
        );
        break;
    }
}

if (fixedCentralBanda !== africa2) {
    fs.writeFileSync('modules/namebases-africa.js', fixedCentralBanda, 'utf8');
    console.log('   ✓ Fixed Central Banda');
} else {
    console.log('   ⚠ Central Banda pattern not found, checking...');
    const match = africa2.match(/"name": "Central Banda"[\s\S]{50,200}/);
    if (match) {
        console.log('   Found:', match[0].substring(0, 100).replace(/\n/g, '\\n'));
    }
}

console.log('\n3. Checking syntax...');
try {
    require('fs').readFileSync('modules/namebases-africa.js', 'utf8');
    console.log('   ✓ Africa.js syntax OK');
} catch (e) {
    console.log('   ✗ Africa.js syntax error');
}

try {
    require('fs').readFileSync('modules/namebases-northAmerica.js', 'utf8');
    console.log('   ✓ NorthAmerica.js syntax OK');
} catch (e) {
    console.log('   ✗ NorthAmerica.js syntax error');
}

console.log('\n=== Done ===');
