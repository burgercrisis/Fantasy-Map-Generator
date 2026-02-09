const fs = require('fs');
const content = fs.readFileSync('modules/namebases-southAmerica.js', 'utf8');
const match = content.match(/window\.\w+NameBases\s*=\s*(\[[\s\S]*\])\s*;?\s*$/);
if (match) {
    try {
        const data = JSON.parse(match[1]);
        console.log('✅ Valid JSON:', data.length, 'entries');
    } catch(e) {
        console.log('❌ Invalid:', e.message);
    }
} else {
    console.log('❌ No match');
}