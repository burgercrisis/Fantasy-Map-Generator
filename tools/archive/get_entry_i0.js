const fs = require('fs');

const content = fs.readFileSync('modules/namebases-real.js', 'utf8').replace(/\r?\n/g, '');

// Find German (i:0)
const germanPattern = /"i":0[^}]*}/;
const match = content.match(germanPattern);

if (match) {
    console.log('German (i:0) entry:');
    console.log(match[0]);

    // Extract the names
    const bMatch = match[0].match(/"b":"([^"]+)"/);
    if (bMatch) {
        const names = bMatch[1].split(',');
        console.log('\nNames count:', names.length);
        console.log('First 10 names:', names.slice(0, 10));
        console.log('Last 10 names:', names.slice(-10));
    }
} else {
    console.log('German (i:0) not found');
}
