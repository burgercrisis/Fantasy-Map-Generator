const fs = require('fs');

const content = fs.readFileSync('modules/namebases-real.js', 'utf8');

// Find all i numbers
const iPattern = /"i":\d+/g;
const matches = content.match(iPattern);

if (matches) {
    const iNumbers = matches.map(m => parseInt(m.split(':')[1])).sort((a, b) => a - b);

    console.log('Total entries:', iNumbers.length);
    console.log('Min i:', Math.min(...iNumbers));
    console.log('Max i:', Math.max(...iNumbers));

    // Show first 10 and last 10
    console.log('\nFirst 10 i numbers:', iNumbers.slice(0, 10));
    console.log('Last 10 i numbers:', iNumbers.slice(-10));

    // Check if 147 exists
    const has147 = iNumbers.includes(147);
    console.log('\nHas i:147:', has147);

    if (!has147) {
        // Find what's around 147
        const below147 = iNumbers.filter(i => i < 147).pop();
        const above147 = iNumbers.find(i => i > 147);

        console.log('Closest below 147:', below147);
        console.log('Closest above 147:', above147);

        // Let's find the actual highest completed verification
        const highestCompleted = iNumbers.filter(i => i <= 147).pop();
        console.log('Highest i ≤ 147:', highestCompleted);

        if (highestCompleted !== undefined) {
            // Find that entry
            const entryPattern = new RegExp(`"i":${highestCompleted}[^}]*"name":"([^"]+)"`);
            const nameMatch = content.match(entryPattern);
            if (nameMatch) {
                console.log(`Language at i:${highestCompleted}: ${nameMatch[1]}`);
            }
        }
    }
} else {
    console.log('No i numbers found in file');
}
