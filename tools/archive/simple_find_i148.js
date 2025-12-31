const fs = require('fs');

// Read the file and remove line breaks to fix the formatting
const content = fs.readFileSync('modules/namebases-real.js', 'utf8');
const cleanContent = content.replace(/\r?\n/g, '');

// Now try to find i:148
const i148Pattern = /"i":148[^}]*}/;
const match = cleanContent.match(i148Pattern);

if (match) {
    console.log('Found i:148 entry:');
    console.log(match[0]);

    // Extract the name
    const nameMatch = match[0].match(/"name":"([^"]+)"/);
    if (nameMatch) {
        console.log('\nLanguage name:', nameMatch[1]);
    }
} else {
    console.log('i:148 not found');

    // Let's find what i numbers exist around 148
    const iPattern = /"i":\d+/g;
    const matches = cleanContent.match(iPattern);

    if (matches) {
        const iNumbers = matches.map(m => parseInt(m.split(':')[1])).sort((a, b) => a - b);
        const around148 = iNumbers.filter(i => i >= 140 && i <= 160);

        console.log('i numbers around 140-160:', around148);

        // Find the next after 147
        const nextAfter147 = iNumbers.find(i => i > 147);
        if (nextAfter147) {
            console.log('Next i after 147:', nextAfter147);

            // Find that entry
            const entryPattern = new RegExp(`"i":${nextAfter147}[^}]*"name":"([^"]+)"`);
            const entryMatch = cleanContent.match(entryPattern);

            if (entryMatch) {
                console.log('Next language:', entryMatch[1]);
            }
        }
    }
}
