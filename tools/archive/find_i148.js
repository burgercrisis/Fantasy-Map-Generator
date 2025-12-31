const fs = require('fs');

const content = fs.readFileSync('modules/namebases-real.js', 'utf8');

// Look for i:148 specifically
const i148Match = content.match(/"i":148[^}]*"name":"[^"]*"[^}]*"b":"[^"]*"/);
if (i148Match) {
    console.log('Found i:148 entry:');
    console.log(i148Match[0]);
} else {
    // Try broader search
    const broaderMatch = content.match(/"i":148[^}]+/);
    if (broaderMatch) {
        console.log('Found i:148 entry (broader):');
        console.log(broaderMatch[0]);
    } else {
        console.log('i:148 not found');

        // Let's find what i numbers are around 148
        const allMatches = content.match(/"i":\d+/g);
        if (allMatches) {
            const iNumbers = allMatches.map(m => parseInt(m.split(':')[1])).sort((a, b) => a - b);
            const around148 = iNumbers.filter(i => i >= 140 && i <= 160);
            console.log('i numbers around 148:', around148);
        }
    }
}
