const { execSync } = require('child_process');
const fs = require('fs');

function validate(file) {
    try {
        const content = fs.readFileSync(file, 'utf8');
        const match = content.match(/window\.\w+NameBases\s*=\s*(\[[\s\S]*\])\s*;?\s*$/);
        if (match) {
            JSON.parse(match[1]);
            return true;
        }
        return false;
    } catch(e) {
        return false;
    }
}

console.log('Validating files...');
const files = [
    'modules/namebases-africa.js',
    'modules/namebases-europe.js',
    'modules/namebases-northAmerica.js',
    'modules/namebases-oceania.js',
    'modules/namebases-southAmerica.js'
];

let allValid = true;
files.forEach(f => {
    if (validate(f)) {
        console.log('✅ ' + f.split('/').pop());
    } else {
        console.log('❌ ' + f.split('/').pop());
        allValid = false;
    }
});

if (allValid) {
    console.log('\nAll files valid. Staging and committing...');
    try {
        execSync('git add -A', { cwd: 'E:/code/Fantasy-Map-Generator', stdio: 'inherit' });
        console.log('Staged successfully');
    } catch(e) {
        console.log('Stage error:', e.message);
    }
} else {
    console.log('\n❌ Some files invalid - not committing');
}