const fs = require('fs');

// Read the file in chunks to handle large size
const chunkSize = 8192;
const content = fs.readFileSync('modules/namebases-real.js', 'utf8');

// Simple approach: look for "i":147 pattern
const i147Pattern = /"i":147/;
if (i147Pattern.test(content)) {
    console.log('Found i:147 in file');

    // Find everything after i:147
    const i147Index = content.search(i147Pattern);
    const after147 = content.substring(i147Index);

    // Look for the next object after the one containing i:147
    const objectsAfter147 = after147.match(/\}, \{[^}]*"i":\d+[^}]*"name":"[^"]+"[^}]*\}/g);

    if (objectsAfter147 && objectsAfter147.length > 0) {
        const nextObject = objectsAfter147[0].substring(3); // Remove "}, {"
        console.log('\nNext language entry:');
        console.log(nextObject);

        // Extract i number and name
        const iMatch = nextObject.match(/"i":(\d+)/);
        const nameMatch = nextObject.match(/"name":"([^"]+)"/);

        if (iMatch && nameMatch) {
            console.log(`\nNext language to verify: ${nameMatch[1]} (i: ${iMatch[1]})`);
        }
    } else {
        console.log('Could not find next object after i:147');
    }
} else {
    console.log('i:147 not found in file');

    // Let's find what i numbers actually exist
    const iPattern = /"i":\d+/g;
    const matches = content.match(iPattern);
    if (matches) {
        const iNumbers = matches.map(m => parseInt(m.split(':')[1])).sort((a, b) => a - b);
        console.log('Found', iNumbers.length, 'i numbers');

        // Find numbers around 147
        const around147 = iNumbers.filter(i => i >= 140 && i <= 160);
        console.log('i numbers around 140-160:', around147);

        if (around147.length > 0) {
            const nextAfter147 = around147.find(i => i > 147);
            if (nextAfter147) {
                console.log('Next available i after 147:', nextAfter147);
            } else {
                console.log('No i number found after 147 in this range');
            }
        }
    }
}
