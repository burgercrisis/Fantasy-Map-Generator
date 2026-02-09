const fs = require('fs');

const files = [
    'modules/namebases-africa.js',
    'modules/namebases-asia.js',
    'modules/namebases-europe.js',
    'modules/namebases-oceania.js',
    'modules/namebases-southAmerica.js'
];

let allValid = true;
files.forEach(file => {
    try {
        const content = fs.readFileSync(file, 'utf8');
        const match = content.match(/window\.\w+NameBases\s*=\s*(\[[\s\S]*\])\s*;?\s*$/);
        if (match) {
            JSON.parse(match[1]);
            console.log('✅ ' + file.split('/').pop());
        } else {
            console.log('⚠️ ' + file.split('/').pop() + ' - No match');
            allValid = false;
        }
    } catch(e) {
        console.log('❌ ' + file.split('/').pop() + ' - ' + e.message);
        allValid = false;
    }
});

if (allValid) {
    console.log('\n✅ All files valid!');
} else {
    console.log('\n❌ Some files invalid');
}