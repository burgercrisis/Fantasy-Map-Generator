const { execSync } = require('child_process');
const fs = require('fs');

const isos = 'papuan-malay,sangiric,serui-malay,shompen,southern-nicobarese,teressa-nicobarese,makassar-branch,selaru,barito,nicobarese,anq,oon,akj,akm,nll,mailu,mnb,barai,yareba';
const command = `node tools/mixer-diagnostics/report-language-mixer-premix-grades.js --only-isos=${isos}`;

try {
    const output = execSync(command, { encoding: 'utf8' });
    fs.writeFileSync('premix_verification.txt', output);
    console.log('Report saved to premix_verification.txt');
} catch (error) {
    fs.writeFileSync('premix_verification_error.txt', error.stdout || error.message);
    console.error('Error running diagnostic report');
}
