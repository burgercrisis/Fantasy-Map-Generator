const fs = require('fs');
const content = fs.readFileSync('modules/namebases-asia.js', 'utf8');
let fixed = content;

// Fix Vietnamese place names
fixed = fixed.replace(/DiáÂ»â¦n BiÂªn/g, 'Diễn Chân');
fixed = fixed.replace(/áÂ»â€œng VÂÆ'on/g, 'ương Văn');
fixed = fixed.replace(/áÂ»â€¹/g, 'ự');

// Control character fixes (U+0080 and U+0081)
fixed = fixed.replace(/[]/g, '');

if (fixed !== content) {
    fs.writeFileSync('modules/namebases-asia.js', fixed, 'utf8');
    console.log('Fixed encoding issues');
} else {
    console.log('No changes needed');
}
