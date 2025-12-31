const fs = require('fs');
const content = fs.readFileSync('modules/namebases-real.js', 'utf8');
const isos = ['korafe','kos','koya','kpt','kra','krc','kum','kumhali','kurambhag-paharia','kurichiya','kuril-dialects','kurukh','kuvi','kva','kvx','kwoma-manambu-pidgin','kxu','kyaka','kyakhta-russian-chinese-pidgin','kyowa-go','kyv','kyw','kzi','l-ngua-geral-paulista','laal'];
const results = {};
isos.forEach(iso => {
    // Look for dedicated entries or entries mentioning the ISO
    const lines = content.split('\n');
    let foundIndex = null;
    for (const line of lines) {
        if (line.toLowerCase().includes(iso.toLowerCase()) && line.includes('i:')) {
            const match = line.match(/i: (\d+)/);
            if (match) {
                foundIndex = parseInt(match[1]);
                break;
            }
        }
    }
    results[iso] = foundIndex;
});
console.log(JSON.stringify(results, null, 2));
