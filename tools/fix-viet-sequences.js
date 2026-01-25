const fs = require('fs');
const content = fs.readFileSync('modules/namebases-asia.js', 'utf8');
let fixed = content;

// Find and fix Vietnamese sequences
// âœ should be ư
fixed = fixed.replace(/âœ/g, 'ư');

// Fix any remaining â sequences that aren't part of regular words
// Look for â followed by a combining character or special character
const test = /â[^a-zA-Z0-9]/.test(fixed);
if (test) {
    console.log('Still found â sequences - checking context...');
    const matches = [...fixed.matchAll(/â[^a-zA-Z0-9\s]*/g)];
    for (const m of matches.slice(0, 3)) {
        console.log(`  Found: "${m[0]}" at ${m.index}`);
    }
} else {
    console.log('No â sequences found (excluding regular words)');
}

if (fixed !== content) {
    fs.writeFileSync('modules/namebases-asia.js', fixed, 'utf8');
    console.log('Fixed encoding issues');
}
