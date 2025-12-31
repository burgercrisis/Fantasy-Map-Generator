const fs = require('fs');

const content = fs.readFileSync('modules/namebases-real.js', 'utf8');

// Look for the pattern "i":148
const i148Pattern = /"i":148/;
const i148Index = content.search(i148Pattern);

if (i148Index !== -1) {
    console.log('Found i:148 at position:', i148Index);

    // Extract a reasonable chunk around i:148 to see the full object
    const start = Math.max(0, i148Index - 100);
    const end = Math.min(content.length, i148Index + 500);
    const chunk = content.substring(start, end);

    console.log('\nContext around i:148:');
    console.log(chunk);

    // Try to extract the complete object
    const objectStart = chunk.lastIndexOf('{');
    const objectEnd = chunk.indexOf('}', objectStart);

    if (objectStart !== -1 && objectEnd !== -1) {
        const fullObject = chunk.substring(objectStart, objectEnd + 1);
        console.log('\nComplete object for i:148:');
        console.log(fullObject);

        // Extract the name
        const nameMatch = fullObject.match(/"name":"([^"]+)"/);
        if (nameMatch) {
            console.log('\nLanguage name:', nameMatch[1]);
        }
    }
} else {
    console.log('i:148 not found');

    // Let's find what i numbers exist around this area
    const iPattern = /"i":\d+/g;
    const matches = content.match(iPattern);
    if (matches) {
        const iNumbers = matches.map(m => parseInt(m.split(':')[1])).sort((a, b) => a - b);

        // Find the range around 148
        const range = iNumbers.filter(i => i >= 140 && i <= 160);
        console.log('i numbers in range 140-160:', range);

        if (range.length > 0) {
            const nextAfter147 = range.find(i => i > 147);
            if (nextAfter147) {
                console.log('Next i after 147:', nextAfter147);
            } else {
                console.log('No i found after 147 in this range');

                // Check what's the highest i
                const maxI = Math.max(...iNumbers);
                console.log('Highest i in file:', maxI);
            }
        }
    }
}
