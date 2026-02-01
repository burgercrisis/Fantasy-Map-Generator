const fs = require('fs');

function validateFile(path, name) {
    try {
        const content = fs.readFileSync(path, 'utf8');
        const jsonMatch = content.match(/window\.\w+NameBases\s*=\s*(\[[\s\S]*\])\s*;?\s*$/);
        if (jsonMatch) {
            const data = JSON.parse(jsonMatch[1]);
            console.log(`✅ ${name}: ${data.length} entries`);
            return true;
        }
        console.log `⚠️ ${name}: Could not extract JSON`;
        return false;
    } catch(e) {
        console.log(`❌ ${name}: ${e.message}`);
        return false;
    }
}

console.log('Validating namebase files...');
validateFile('modules/namebases-africa.js', 'Africa');
validateFile('modules/namebases-asia.js', 'Asia');
validateFile('modules/namebases-europe.js', 'Europe');
validateFile('modules/namebases-northAmerica.js', 'NorthAmerica');
validateFile('modules/namebases-southAmerica.js', 'SouthAmerica');
validateFile('modules/namebases-oceania.js', 'Oceania');