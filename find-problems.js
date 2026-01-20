const fs = require('fs');

// Search for problematic languages in working files
const files = [
    'modules/namebases-europe.js',
    'modules/namebases-southAmerica.js'
];

const problemNames = [
    'Spanish Global',
    'Kemi Sami', 
    'Catalan',
    'Rémois',  // Note: might have accent
    'International Sign',
    'Mineiro',
    "O'odham"
];

files.forEach(file => {
    console.log('\nSearching in:', file);
    const content = fs.readFileSync(file, 'utf8');
    
    problemNames.forEach(problem => {
        if (content.includes(problem)) {
            const idx = content.indexOf(problem);
            console.log('  Found:', problem, 'at position', idx);
            // Show context
            const start = Math.max(0, idx - 50);
            const end = Math.min(content.length, idx + problem.length + 200);
            console.log('  Context:', content.substring(start, end));
        } else {
            console.log('  Not found:', problem);
        }
    });
});
