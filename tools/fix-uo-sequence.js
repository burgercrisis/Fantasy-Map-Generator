const fs = require('fs');
const content = fs.readFileSync('modules/namebases-asia.js', 'utf8');
let fixed = content;

// Fix the garbled UTF-8 sequence âœ which should be ư
// 0xc3 0xa2 0xc2 0x9c represents âœ
fixed = fixed.replace(/âœ/g, 'ư');

if (fixed !== content) {
    fs.writeFileSync('modules/namebases-asia.js', fixed, 'utf8');
    console.log('Fixed âœ → ư');
} else {
    console.log('No changes');
}
