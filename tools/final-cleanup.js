const fs = require('fs');

console.log('=== Final Cleanup ===\n');

// Read Africa
const africa = fs.readFileSync('modules/namebases-africa.js', 'utf8');
const lines = africa.split('\n');
let inChakato = false;
let chakatoStart = -1;
let chakatoEnd = -1;

// Find Chakato entry
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('"name": "Chakato language"')) {
        inChakato = true;
        chakatoStart = i;
    }
    if (inChakato && lines[i].includes('},')) {
        chakatoEnd = i;
        break;
    }
}

if (chakatoStart >= 0 && chakatoEnd >= 0) {
    console.log(`Found Chakato at lines ${chakatoStart + 1} to ${chakatoEnd + 1}`);
    
    // Remove the entry and clean up extra newlines
    const newLines = [
        ...lines.slice(0, chakatoStart),
        ...lines.slice(chakatoEnd + 1)
    ].filter((line, idx, arr) => {
        // Remove extra blank lines
        if (line.trim() === '' && idx > 0 && arr[idx - 1].trim() === '') {
            return false;
        }
        return true;
    });
    
    fs.writeFileSync('modules/namebases-africa.js', newLines.join('\n'), 'utf8');
    console.log('✓ Removed Chakato from Africa.js');
} else {
    console.log('Chakato not found in Africa.js');
}

// Read and check syntax
const fixedAfrica = fs.readFileSync('modules/namebases-africa.js', 'utf8');
if (fixedAfrica.includes('Chakato')) {
    console.log('⚠ Chakato still found in Africa.js!');
} else {
    console.log('✓ Chakato completely removed from Africa.js');
}

// Verify North America has Chakato
const na = fs.readFileSync('modules/namebases-northAmerica.js', 'utf8');
if (na.includes('"name": "Chakato"')) {
    console.log('✓ Chakato present in North America.js');
} else {
    console.log('⚠ Chakato not found in North America.js');
}

console.log('\n=== Done ===');
