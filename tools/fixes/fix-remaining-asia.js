const fs = require('fs');

// Fix remaining encoding issues based on quality report
const files = {
    'modules/namebases-africa.js': [
        { find: /Bunun \(Isbukun\)/g, replace: 'Bunun' } // Wait, this is in Asia
    ],
    'modules/namebases-asia.js': [
        // Based on quality report, these have encoding issues
        // Let's find and fix them
    ]
};

// Let's scan for remaining encoding issues
const content = fs.readFileSync('modules/namebases-asia.js', 'utf8');

// Common remaining patterns after our fixes
const patterns = [
    { find: /Ã©/g, replace: 'é' },
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
    { find: /Ã/g, replace: '' }, // Incomplete
    { find: /Â/g, replace: '' }, // Leftover
    { find: /â€™/g, replace: "'" },
    { find: /â€"/g, replace: '"' },
];

let fixed = content;
let count = 0;

for (const p of patterns) {
    const before = fixed.length;
    fixed = fixed.replace(p.find, p.replace);
    if (fixed.length !== before) count++;
}

if (count > 0) {
    fs.writeFileSync('modules/namebases-asia.js', fixed, 'utf8');
    console.log(`Fixed ${count} encoding patterns in asia.js`);
} else {
    console.log('No encoding patterns found');
}
