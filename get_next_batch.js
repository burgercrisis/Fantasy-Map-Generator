const fs = require('fs');
const report = fs.readFileSync('uniqueness_report.txt', 'utf8');
const lines = report.split('\n');
const noUniqIsos = [];

for (const line of lines) {
    if (line.includes('|NO_UNIQ_BASE')) {
        const iso = line.split('|')[0].trim();
        noUniqIsos.push(iso);
    }
}

console.log(JSON.stringify(noUniqIsos.slice(0, 25), null, 2));
