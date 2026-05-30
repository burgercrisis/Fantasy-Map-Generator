const fs = require('fs');
const path = require('path');

// Check all namebase files
const namebaseFiles = [
    'modules/namebases-europe.js',
    'modules/namebases-all.js', 
    'modules/namebases-real.single-line-backup.js',
    'modules/namebases-real.backup-20251228-221152.js'
];

console.log('Namebase file analysis:');
namebaseFiles.forEach(file => {
    if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        console.log(`${file}: ${content.length} chars, ${content.split('\n').length} lines`);
        
        // Check for specific languages
        const languages = ['Bulgarian', 'Romanian', 'Albanian', 'Estonian'];
        languages.forEach(lang => {
            const count = (content.match(new RegExp(lang, 'g')) || []).length;
            if (count > 0) {
                console.log(`  - ${lang}: ${count} occurrences`);
            }
        });
    } else {
        console.log(`${file}: NOT FOUND`);
    }
});

// Also check if there are any other large files
console.log('\nChecking for larger files...');
const files = fs.readdirSync('modules/');
files.forEach(file => {
    const filePath = path.join('modules/', file);
    if (fs.statSync(filePath).isFile() && file.includes('namebase')) {
        const stats = fs.statSync(filePath);
        console.log(`${file}: ${stats.size} bytes`);
    }
});