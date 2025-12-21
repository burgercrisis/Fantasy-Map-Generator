const fs = require('fs');
const content = fs.readFileSync('modules/namebases-real.js', 'utf8');
const isos = [
    'labrador-inuit-pidgin-french', 'lachi', 'laha', 'lahu', 'laiuse-romani',
    'lakota', 'lampung', 'land-dayak', 'lanping-bai-dialect', 'lao', 'latin-american-spanish',
    'laua', 'laven-bahnaric', 'lavi-bahnaric', 'law', 'laz',
    'lbe', 'lbj', 'leivu', 'lembena', 'lemi-region',
    'lepcha', 'levantine-arabic', 'lezgin', 'lhm'
];
const results = {};
isos.forEach(iso => {
    const lines = content.split('\n');
    let found = [];
    lines.forEach((line, idx) => {
        if (line.toLowerCase().includes(iso.toLowerCase()) && line.includes('i:')) {
            const match = line.match(/i: (\d+)/);
            if (match) {
                found.push({index: parseInt(match[1]), line: idx + 1});
            }
        }
    });
    results[iso] = found;
});
console.log(JSON.stringify(results, null, 2));
