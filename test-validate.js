const fs = require('fs');
const content = fs.readFileSync('modules/namebases-africa.js', 'utf8');
try {
    // Try to parse - extract just the array portion
    const jsonMatch = content.match(/window\.AfricaNameBases\s*=\s*(\[[\s\S]*\])\s*;?\s*$/);
    if (jsonMatch) {
        JSON.parse(jsonMatch[1]);
        console.log('✅ JSON valid');
    }
} catch(e) {
    console.log('❌ JSON invalid:', e.message);
}