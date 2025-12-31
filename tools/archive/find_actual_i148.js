const fs = require('fs');

const content = fs.readFileSync('modules/namebases-real.js', 'utf8');

// Find all entries and their i numbers
const entries = [];
let currentPos = 0;
let braceCount = 0;
let inString = false;
let escapeNext = false;
const arrayStart = content.indexOf('[');
const afterArrayStart = content.substring(arrayStart + 1);

for (let i = 0; i < afterArrayStart.length; i++) {
    const char = afterArrayStart[i];

    if (escapeNext) {
        escapeNext = false;
        continue;
    }

    if (char === '\\') {
        escapeNext = true;
        continue;
    }

    if (char === '"' && !escapeNext) {
        inString = !inString;
        continue;
    }

    if (!inString) {
        if (char === '{') {
            if (braceCount === 0) {
                currentPos = i;
            }
            braceCount++;
        } else if (char === '}') {
            braceCount--;
            if (braceCount === 0) {
                const objectStr = afterArrayStart.substring(currentPos, i + 1);
                const nameMatch = objectStr.match(/"name":"([^"]+)"/);
                const iMatch = objectStr.match(/"i":(\d+)/);

                if (nameMatch && iMatch) {
                    entries.push({
                        name: nameMatch[1],
                        i: parseInt(iMatch[1]),
                        object: objectStr
                    });
                }
            }
        }
    }
}

// Sort entries by i number
entries.sort((a, b) => a.i - b.i);

// Find entry at i:148
const i148Entry = entries.find(entry => entry.i === 148);

if (i148Entry) {
    console.log('Found entry at i:148:');
    console.log(`Language: ${i148Entry.name}`);
    console.log('Object:', i148Entry.object);
} else {
    console.log('No entry found at i:148');

    // Find entries around 148
    const around148 = entries.filter(entry => entry.i >= 140 && entry.i <= 160);
    console.log('\nEntries around i:140-160:');
    around148.forEach(entry => {
        console.log(`${entry.name} (i: ${entry.i})`);
    });

    // Find what comes after the highest verified entry (assuming verification was correct)
    const highestVerified = entries.find(entry => entry.i === 147);
    if (highestVerified) {
        console.log('\nFound verified entry at i:147:', highestVerified.name);

        const nextEntry = entries.find(entry => entry.i > 147);
        if (nextEntry) {
            console.log('\nNext entry to verify:');
            console.log(`${nextEntry.name} (i: ${nextEntry.i})`);
        }
    } else {
        console.log('\nEntry at i:147 not found');

        // Find the closest to 147
        const below147 = entries.filter(entry => entry.i < 147).pop();
        const above147 = entries.find(entry => entry.i > 147);

        if (below147) console.log('Closest below 147:', `${below147.name} (i: ${below147.i})`);
        if (above147) console.log('Closest above 147:', `${above147.name} (i: ${above147.i})`);
    }
}
