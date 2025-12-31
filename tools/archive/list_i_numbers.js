const fs = require('fs');

const content = fs.readFileSync('modules/namebases-real.js', 'utf8');

// Find all i numbers
const iMatches = content.match(/"i":\d+/g);
if (iMatches) {
    const iNumbers = iMatches.map(m => parseInt(m.split(':')[1])).sort((a, b) => a - b);

    console.log('Total i numbers found:', iNumbers.length);
    console.log('First 20 i numbers:', iNumbers.slice(0, 20));
    console.log('i numbers around 140-160:', iNumbers.filter(i => i >= 140 && i <= 160));

    // Find the highest i number
    const maxI = Math.max(...iNumbers);
    console.log('Highest i number:', maxI);

    // Check if 147 exists
    const has147 = iNumbers.includes(147);
    console.log('Has i:147:', has147);

    if (!has147) {
        // Find the closest i numbers to 147
        const below147 = iNumbers.filter(i => i < 147).pop();
        const above147 = iNumbers.find(i => i > 147);
        console.log('Closest below 147:', below147);
        console.log('Closest above 147:', above147);
    }
} else {
    console.log('No i numbers found');
}
