const { execSync } = require('child_process');
const fs = require('fs');

const command = `node tools/mixer-diagnostics/report-language-mixer-premix-grades.js --below=50 --limit=50`;

try {
    const output = execSync(command, { encoding: 'utf8' });
    fs.writeFileSync('low_premix_isos.txt', output);
    console.log('Report saved to low_premix_isos.txt');
} catch (error) {
    fs.writeFileSync('low_premix_isos_error.txt', error.stdout || error.message);
    console.error('Error running diagnostic report');
}
