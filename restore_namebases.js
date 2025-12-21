const fs = require('fs');
const path = require('path');

const lostFile = 'e:/code/Fantasy-Map-Generator/truly_lost_namebases.txt';
const targetFile = 'e:/code/Fantasy-Map-Generator/modules/namebases-real.js';

try {
    const lostContent = fs.readFileSync(lostFile, 'utf8');
    const lostLines = lostContent.split('\n')
        .filter(line => line.trim().startsWith('-'))
        .map(line => line.substring(1)); // Remove the '-' prefix

    const targetContent = fs.readFileSync(targetFile, 'utf8');
    const targetLines = targetContent.split('\n');

    // Find the closing ];
    const closingIndex = targetLines.findIndex(line => line.trim() === '];');

    if (closingIndex !== -1) {
        // Insert lost lines before the closing ];
        targetLines.splice(closingIndex, 0, ...lostLines);
        
        // Ensure there's a comma after the last existing entry if needed
        // (Actually, the lost lines already have commas at the end, and the last existing one likely does too)
        
        fs.writeFileSync(targetFile, targetLines.join('\n'), 'utf8');
        console.log(`Successfully restored ${lostLines.length} namebases.`);
    } else {
        console.error('Could not find the closing ]; in ' + targetFile);
    }
} catch (err) {
    console.error('Error:', err);
}
