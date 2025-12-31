const fs = require('fs');

const content = fs.readFileSync('modules/namebases-real.js', 'utf8');

// Find all i numbers
const allMatches = content.match(/"i":\d+/g);
if (allMatches) {
    const iNumbers = allMatches.map(m => parseInt(m.split(':')[1])).sort((a, b) => a - b);

    // Find the first i number greater than 147
    const nextI = iNumbers.find(i => i > 147);

    if (nextI) {
        console.log('Next i number after 147:', nextI);

        // Find the entry for this i number
        const entryRegex = new RegExp(`"i":${nextI}[^}]+`);
        const entryMatch = content.match(entryRegex);

        if (entryMatch) {
            console.log('\nEntry for i:' + nextI + ':');
            console.log(entryMatch[0]);

            // Extract just the name
            const nameMatch = entryMatch[0].match(/"name":"([^"]+)"/);
            if (nameMatch) {
                console.log('\nLanguage name:', nameMatch[1]);
            }
        }
    } else {
        console.log('No i number found after 147');
    }
} else {
    console.log('No i numbers found');
}
