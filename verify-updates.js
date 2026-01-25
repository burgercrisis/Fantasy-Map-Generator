
const fs = require('fs');
const content = fs.readFileSync('modules/namebases-real.backup-20251228-221152.js', 'utf8');
console.log('\nVerification Results:');
console.log('Bulgarian with bg-BG:', content.includes('"d": "bg-BG"') ? '✅' : '❌');
console.log('Romanian with București:', content.includes('București') ? '✅' : '❌');
console.log('Albanian with sq-AL:', content.includes('"d": "sq-AL"') ? '✅' : '❌');
