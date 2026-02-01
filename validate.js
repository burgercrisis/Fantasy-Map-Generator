const fs = require('fs');
const path = require('path');

function validateFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const name = path.basename(filePath);
        const match = content.match(/window\.\w+NameBases\s*=\s*(\[[\s\S]*\])\s*;?\s*$/);
        if (match) {
            const data = JSON.parse(match[1]);
            console.log(`✅ ${name}: ${data.length} entries`);
            return true;
        }
        console.log(`⚠️ ${name}: No match`);
        return false;
    } catch(e) {
        console.log(`❌ ${name}: ${e.message}`);
        return false;
    }
}

console.log('Validating...');
['modules/namebases-africa.js', 'modules/namebases-asia.js', 'modules/namebases-europe.js', 'modules/namebases-northAmerica.js', 'modules/namebases-southAmerica.js', 'modules/namebases-oceania.js'].forEach(validateFile);