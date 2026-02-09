const { execSync } = require('child_process');
console.log('Checking status...');
try {
    const status = execSync('git status', { cwd: 'E:/code/Fantasy-Map-Generator', encoding: 'utf8' });
    console.log(status);
} catch(e) {
    console.log('Error:', e.message);
}