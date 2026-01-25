const fs = require('fs');

console.log('=== Properly Remove Chakato from Africa ===\n');

const africa = fs.readFileSync('modules/namebases-africa.js', 'utf8');

// Find and remove the Chakato entry completely
// Pattern: {"name":"Chakato language","i":20703,...,"b":"Chakato,Kansas,..."} followed by ,\n\n{
const pattern = /\{\s*"name":\s*"Chakato language",\s*"i":\s*20703,\s*"min":\s*4,\s*"max":\s*11,\s*"d":\s*"nic-GH",\s*"m":\s*0,\s*"b":\s*"Chakato,Kansas,Oklahoma,Missouri,USA,Mississippi River,Great Plains,Central Plains"\s*\},?\s*\{/g;

if (pattern.test(africa)) {
    const fixed = africa.replace(pattern, '{');
    fs.writeFileSync('modules/namebases-africa.js', fixed, 'utf8');
    console.log('✓ Removed Chakato entry from Africa.js');
} else {
    console.log('Pattern not found, trying alternative...');
    
    // Alternative: Find the entry and remove it with its surrounding context
    const lines = africa.split('\n');
    const newLines = [];
    let skip = false;
    
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('"name": "Chakato language"')) {
            skip = true;
            continue;
        }
        if (skip) {
            if (lines[i].includes('},')) {
                skip = false;
                // Don't add the closing brace of the Chakato entry
                // but DO add the opening brace of the next entry
                newLines.push('  {');
            }
            continue;
        }
        newLines.push(lines[i]);
    }
    
    const fixed = newLines.join('\n');
    fs.writeFileSync('modules/namebases-africa.js', fixed, 'utf8');
    console.log('✓ Removed Chakato entry (alternative method)');
}

console.log('\n=== Done ===');
