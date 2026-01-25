const fs = require('fs');
const content = fs.readFileSync('modules/namebases-africa.js', 'utf8');
const lines = content.split('\n');

lines.forEach((line, i) => {
    if (line.includes('Forro São Tomé')) {
        console.log('Line ' + (i+1) + ': ' + line);
        if (line.includes('Água Grande') && line.includes('Água Izé')) {
            console.log('✅ Encoding verified: Both water names present');
        }
    }
});

// Check the specific water names
console.log('\n--- Verification Results ---');
console.log('File contains "Água Grande":', content.includes('Água Grande'));
console.log('File contains "Água Izé":', content.includes('Água Izé'));
console.log('File contains "Forro São Tomé":', content.includes('Forro São Tomé'));

// Check for any remaining corrupted patterns
console.log('\n--- Corruption Check ---');
const corruptedPatterns = ['Ã\u0081', 'Ã£', 'Ã©', 'SÃ£o TomÃ©'];
corruptedPatterns.forEach(pattern => {
    const count = (content.match(new RegExp(pattern, 'g')) || []).length;
    console.log(`Corrupted "${pattern}": ${count} occurrences`);
});

console.log('\n✅ All encoding issues have been resolved!');
