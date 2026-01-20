const fs = require('fs');
const content = fs.readFileSync('modules/namebases-europe.js', 'utf8');
const lines = content.split('\n');

// Find the line number for Spanish Global
const lineNum = lines.findIndex(line => line.includes('Spanish Global'));
console.log('Spanish Global found at line:', lineNum + 1); // 1-indexed

if (lineNum !== -1) {
    // Print the entry
    for (let i = lineNum; i < Math.min(lineNum + 15, lines.length); i++) {
        console.log(lines[i]);
    }
} else {
    console.log('Spanish Global not found');
}
