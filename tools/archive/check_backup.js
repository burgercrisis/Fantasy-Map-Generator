const fs = require('fs');

const backup = fs.readFileSync('modules/namebases-real.backup-20251228-221152.js', 'utf8').replace(/\r?\n/g, '');
const matches = backup.match(/"i":\d+/g);

if (matches) {
    const iNumbers = matches.map(m => parseInt(m.split(':')[1])).sort((a, b) => a - b);
    console.log('Backup file i numbers:');
    console.log('Min i:', Math.min(...iNumbers));
    console.log('Max i:', Math.max(...iNumbers));
    console.log('Total entries:', iNumbers.length);
    console.log('First 10:', iNumbers.slice(0, 10));
    console.log('Last 10:', iNumbers.slice(-10));

    // Check if i:148 exists
    const has148 = iNumbers.includes(148);
    console.log('Has i:148:', has148);

    if (has148) {
        const entryPattern = /"i":148[^}]*"name":"([^"]+)"/;
        const nameMatch = backup.match(entryPattern);
        if (nameMatch) {
            console.log('Language at i:148:', nameMatch[1]);
        }
    }
} else {
    console.log('No i numbers found in backup');
}
