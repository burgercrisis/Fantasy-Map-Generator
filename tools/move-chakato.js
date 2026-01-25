const fs = require('fs');

console.log('=== Moving Chakato ===\n');

const africa = fs.readFileSync('modules/namebases-africa.js', 'utf8');
const northAmerica = fs.readFileSync('modules/namebases-northAmerica.js', 'utf8');

// Find Chakato entry
const chakatoStart = africa.indexOf('"name": "Chakato language"');
if (chakatoStart >= 0) {
    console.log('Found Chakato in Africa.js');
    
    // Find the full entry (from { to },)
    const entryStart = africa.lastIndexOf('{', chakatoStart);
    const entryEnd = africa.indexOf('},', chakatoStart) + 2;
    const chakatoEntry = africa.substring(entryStart, entryEnd);
    
    console.log('Entry:', chakatoEntry.substring(0, 100).replace(/\n/g, '\\n'));
    
    // Remove from Africa
    const fixedAfrica = africa.replace(chakatoEntry + '\n\n', '').replace(chakatoEntry + '\n', '');
    fs.writeFileSync('modules/namebases-africa.js', fixedAfrica, 'utf8');
    console.log('✓ Removed from Africa.js');
    
    // Add to North America (after Cherokee entry)
    const newChakato = `  {
    "name": "Chakato",
    "i": 20703,
    "min": 4,
    "max": 11,
    "d": "nic-GH",
    "m": 0,
    "b": "Lawrence,Topeka,Oklahoma City,Tulsa,Wichita,Kansas City,St. Louis,Springfield,Joplin,Pittsburg,Independence,Kansas"
  },`;

    const chinookStart = northAmerica.indexOf('"name": "Chinook Jargon"');
    if (chinookStart >= 0) {
        const beforeChinook = northAmerica.substring(0, chinookStart);
        const afterChinook = northAmerica.substring(chinookStart);
        const fixedNorthAmerica = beforeChinook + newChakato + '\n\n  ' + afterChinook;
        fs.writeFileSync('modules/namebases-northAmerica.js', fixedNorthAmerica, 'utf8');
        console.log('✓ Added to North America.js');
    }
} else {
    console.log('Chakato not found in Africa.js');
}

console.log('\n=== Done ===');
