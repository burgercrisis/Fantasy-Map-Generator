const fs = require('fs');
const content = fs.readFileSync('E:/code/Fantasy-Map-Generator/modules/namebases-europe.js', 'utf8');

// Search for specific patterns
const patterns = [
    'Bulgarian',
    'bg-BG', 
    'Albanian',
    'sq-AL',
    'Romanian',
    'ro-RO',
    'București',
    'Estonian',
    'et-EE'
];

patterns.forEach(pattern => {
    const regex = new RegExp(pattern);
    const match = content.match(regex);
    console.log(`${pattern}: ${match ? 'FOUND' : 'NOT FOUND'}`);
});

// Show context around Romanian entry
const romanianIndex = content.indexOf('Romanian');
if (romanianIndex > -1) {
    console.log('\nRomanian entry context:');
    console.log(content.substring(romanianIndex, romanianIndex + 500));
}

// Show context around Bulgarian entry  
const bulgarianIndex = content.indexOf('Bulgarian');
if (bulgarianIndex > -1) {
    console.log('\nBulgarian entry context:');
    console.log(content.substring(bulgarianIndex, bulgarianIndex + 500));
} else {
    console.log('\nBulgarian entry not found - checking for encoding issues...');
}