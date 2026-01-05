const fs = require('fs');

// Read the file
const content = fs.readFileSync('modules/namebases-europe.js', 'utf8');
const lines = content.split('\n');

// Find lines containing our target entries
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('Kashubian') || lines[i].includes('Silesian') || lines[i].includes('Upper Sorbian')) {
        console.log(`\n=== Found at line ${i+1} ===`);
        // Print the entry (from name line to closing brace)
        for (let j = i; j < Math.min(lines.length, i + 10); j++) {
            console.log(`${j+1}: ${lines[j]}`);
            if (lines[j].includes('},') || lines[j].includes('}')) {
                break;
            }
        }
    }
}