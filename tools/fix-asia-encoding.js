const fs = require('fs');
const content = fs.readFileSync('modules/namebases-asia.js', 'utf8');
let fixed = content;
let changes = 0;

// Common UTF-8 double-encoding patterns
const patterns = [
    { find: /áÂ»â€¦/g, replace: 'ễ' },
    { find: /áÂ»â€/g, replace: 'ươ' },
    { find: /áÂ»â¹/g, replace: 'ự' },
    { find: /Ã¢/g, replace: 'â' },
    { find: /Ã¡/g, replace: 'á' },
    { find: /Ã /g, replace: 'à' },
    { find: /Ã©/g, replace: 'é' },
    { find: /Ã­/g, replace: 'í' },
    { find: /Ã³/g, replace: 'ó' },
    { find: /Ã±/g, replace: 'ñ' },
    { find: /Ã§/g, replace: 'ç' },
    { find: /Ã¼/g, replace: 'ü' },
    { find: /Ã¶/g, replace: 'ö' },
    { find: /Ã¢/g, replace: 'â' },
    { find: /Ãª/g, replace: 'ê' },
    { find: /Ã®/g, replace: 'î' },
    { find: /Ã´/g, replace: 'ô' },
    { find: /Ã¹/g, replace: 'ù' },
    { find: /Ã»/g, replace: 'û' },
    { find: /Ã€/g, replace: 'À' },
    { find: /Ã/g, replace: 'Á' },
    { find: /Ã‚/g, replace: 'Â' },
    { find: /Ãƒ/g, replace: 'Ã' },
    { find: /Ã„/g, replace: 'Ä' },
    { find: /Ã…/g, replace: 'Å' },
    { find: /Ã†/g, replace: 'Æ' },
    { find: /Ã‡/g, replace: 'Ç' },
    { find: /Ãˆ/g, replace: 'È' },
    { find: /Ã‰/g, replace: 'É' },
    { find: /ÃŠ/g, replace: 'Ê' },
    { find: /Ã‹/g, replace: 'Ë' },
    { find: /ÃŒ/g, replace: 'Ì' },
    { find: /Ã/g, replace: 'Í' },
    { find: /ÃŽ/g, replace: 'Î' },
    { find: /Ã/g, replace: 'Ï' },
    { find: /Ã/g, replace: 'Ð' },
    { find: /Ã‘/g, replace: 'Ñ' },
    { find: /Ã’/g, replace: 'Ò' },
    { find: /Ã“/g, replace: 'Ó' },
    { find: /Ã”/g, replace: 'Ô' },
    { find: /Ã•/g, replace: 'Õ' },
    { find: /Ã–/g, replace: 'Ö' },
    { find: /Ã˜/g, replace: 'Ø' },
    { find: /Ã™/g, replace: 'Ù' },
    { find: /Ãš/g, replace: 'Ú' },
    { find: /Ã›/g, replace: 'Û' },
    { find: /Ãœ/g, replace: 'Ü' },
    { find: /Ã/g, replace: 'Ý' },
    { find: /Ãž/g, replace: 'Þ' },
    { find: /Ã/g, replace: '' }, // Incomplete sequences
    { find: /Â/g, replace: '' }, // Leftover from double-encoding
    { find: /â€/g, replace: '–' },
    { find: /â€™/g, replace: "'" },
    { find: /â€"/g, replace: '"' },
    { find: /â€˜/g, replace: "'" },
    { find: /â€¦/g, replace: '...' },
    { find: /â€³/g, replace: '' },
    { find: /â€¤/g, replace: '-' },
    { find: /â€¥/g, replace: '' },
    { find: /â€¦/g, replace: '' },
    { find: /â€/g, replace: '–' },
    { find: /â•"/g, replace: '' },
    { find: /â•'/g, replace: '' },
    { find: /â•’/g, replace: '' },
    { find: /â•"/g, replace: '' },
    { find: /â•'/g, replace: '' },
];

for (const p of patterns) {
    const before = fixed.length;
    fixed = fixed.replace(p.find, p.replace);
    if (fixed.length !== before) {
        changes++;
    }
}

if (changes > 0) {
    fs.writeFileSync('modules/namebases-asia.js', fixed, 'utf8');
    console.log(`Applied ${changes} encoding fixes to asia.js`);
} else {
    console.log('No changes needed');
}
