const fs = require('fs');

const content = fs.readFileSync('modules/namebases-real.js', 'utf8');

// Find the position of i:147
const i147Index = content.indexOf('"i":147');
if (i147Index === -1) {
    console.log('i:147 not found');
    return;
}

console.log('Found i:147 at position:', i147Index);

// Look for the next entry after i:147
const after147 = content.substring(i147Index);
const nextEntryMatch = after147.match(/\}, \{[^}]*"i":\d+[^}]*"name":"[^"]+"/);

if (nextEntryMatch) {
    const nextEntry = nextEntryMatch[0];
    console.log('\nNext entry after i:147:');
    console.log(nextEntry);

    // Extract the i number and name
    const iMatch = nextEntry.match(/"i":(\d+)/);
    const nameMatch = nextEntry.match(/"name":"([^"]+)"/);

    if (iMatch && nameMatch) {
        console.log('\nNext language to verify:');
        console.log(`- ${nameMatch[1]} (i: ${iMatch[1]})`);
    }
} else {
    console.log('Could not find next entry after i:147');
}
