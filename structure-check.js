const fs = require('fs');
const content = fs.readFileSync('E:/code/Fantasy-Map-Generator/modules/namebases-europe.js', 'utf8');

// Check for different language entries
const languages = [
    'Bulgarian', 'Romanian', 'Albanian', 'Estonian', 'Welsh', 'Breton',
    'Lithuanian', 'Latvian', 'Luxembourgish', 'Catalan', 'Galician',
    'Friulian', 'Sardinian', 'Romansh'
];

console.log('Language entry search results:');
languages.forEach(lang => {
    const regex = new RegExp(`"name":\\s*"${lang}"`);
    const match = content.match(regex);
    console.log(`${lang}: ${match ? 'FOUND' : 'NOT FOUND'}`);
});

// Check for the patterns that should have been changed
const patterns = [
    'nic-GH', // Old code that should be replaced
    'nld',    // Old code that should be replaced  
    'lnrt',   // Old code that should be replaced
    'ro-IT',  // Wrong code for Italian languages
];

console.log('\nOld patterns search results:');
patterns.forEach(pattern => {
    const count = (content.match(new RegExp(pattern, 'g')) || []).length;
    console.log(`${pattern}: ${count} occurrences`);
});

// Show total file statistics
console.log(`\nFile statistics:`);
console.log(`Total characters: ${content.length}`);
console.log(`Total lines: ${content.split('\n').length}`);

// Show a sample of the file structure
console.log(`\nSample structure (first 1000 chars):`);
console.log(content.substring(0, 1000));