const fs = require('fs');
const path = require('path');

const backupPath = path.resolve(__dirname, '../modules/namebases-africa.js.backup');
const targetPath = path.resolve(__dirname, '../modules/namebases-africa.js');

console.log(`Reading from: ${backupPath}`);
console.log(`Writing to: ${targetPath}`);

try {
    if (!fs.existsSync(backupPath)) {
        console.error('Backup file not found!');
        process.exit(1);
    }

    const content = fs.readFileSync(backupPath, 'utf8');
    fs.writeFileSync(targetPath, content, 'utf8');
    console.log(`Successfully restored namebases-africa.js (${content.length} bytes)`);
} catch (err) {
    console.error('Error restoring file:', err);
    process.exit(1);
}
