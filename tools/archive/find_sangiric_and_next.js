const fs = require('fs');

const content = fs.readFileSync('modules/namebases-real.js', 'utf8');

// First, let's find Sangiric (i:147)
const sangiricPattern = /"i":147/;
const sangiricIndex = content.search(sangiricPattern);

if (sangiricIndex !== -1) {
    console.log('Found Sangiric (i:147) at position:', sangiricIndex);

    // Extract the Sangiric object
    const beforeSangiric = content.substring(0, sangiricIndex);
    const sangiricStart = beforeSangiric.lastIndexOf('{');
    const sangiricEnd = content.indexOf('}', sangiricIndex);

    if (sangiricStart !== -1 && sangiricEnd !== -1) {
        const sangiricObject = content.substring(sangiricStart, sangiricEnd + 1);
        console.log('\nSangiric object:');
        console.log(sangiricObject);

        // Now find the next object after Sangiric
        const afterSangiric = content.substring(sangiricEnd + 1);
        const nextObjectMatch = afterSangiric.match(/^\s*,\s*\{[^}]*"i":\d+[^}]*"name":"[^"]+"[^}]*\}/);

        if (nextObjectMatch) {
            const nextObject = nextObjectMatch[0].replace(/^\s*,\s*\{/, '{').replace(/\}$/, '}');
            console.log('\nNext language object:');
            console.log(nextObject);

            // Extract name and i number
            const nameMatch = nextObject.match(/"name":"([^"]+)"/);
            const iMatch = nextObject.match(/"i":(\d+)/);

            if (nameMatch && iMatch) {
                console.log(`\nNext language to verify: ${nameMatch[1]} (i: ${iMatch[1]})`);
            }
        } else {
            console.log('\nCould not find next object after Sangiric');
            console.log('Checking if Sangiric is the last entry...');

            // Check if there's anything after Sangiric
            const remainingContent = content.substring(sangiricEnd + 1).trim();
            if (remainingContent === ']' || remainingContent === '}];') {
                console.log('Sangiric appears to be the last entry in the array');
            } else {
                console.log('Remaining content after Sangiric:', remainingContent.substring(0, 200));
            }
        }
    }
} else {
    console.log('Sangiric (i:147) not found');

    // Let's find what i numbers actually exist
    const iPattern = /"i":\d+/g;
    const matches = content.match(iPattern);
    if (matches) {
        const iNumbers = matches.map(m => parseInt(m.split(':')[1])).sort((a, b) => a - b);
        console.log('Found', iNumbers.length, 'i numbers');

        // Check the highest i numbers
        const highestI = iNumbers.slice(-10);
        console.log('Highest 10 i numbers:', highestI);

        // Check if 147 exists
        if (iNumbers.includes(147)) {
            console.log('i:147 exists');
        } else {
            console.log('i:147 does not exist');
            const closestBelow = iNumbers.filter(i => i < 147).pop();
            console.log('Closest i below 147:', closestBelow);
        }
    }
}
