const fs = require('fs');
const content = fs.readFileSync('modules/namebases-asia.js', 'utf8');
let fixed = content;

// The sequence is: â followed by U+009C (STRING TERMINATOR)
// Let me try matching by looking at the bytes
// 0xC3 0xA2 = â (U+00E2 in UTF-8)
// 0xC2 0x9C = � (U+009C in UTF-8, which is STRING TERMINATOR)

const problematic = '\u00e2\u009c';
const replacement = 'ư';

if (content.includes(problematic)) {
    fixed = content.replace(new RegExp(problematic, 'g'), replacement);
    fs.writeFileSync('modules/namebases-asia.js', fixed, 'utf8');
    console.log(`Fixed ${problematic} → ${replacement}`);
} else {
    console.log('Pattern not found');
    // Let's check what's actually at position 146229
    console.log(`Char at 146229: "${content[146229]}" (U+${content.charCodeAt(146229).toString(16)})`);
    console.log(`Next chars: "${content.substring(146229, 146235)}"`);
}
