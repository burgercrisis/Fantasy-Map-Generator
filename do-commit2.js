const { execSync } = require('child_process');
try {
    execSync('git add modules/namebases-southAmerica.js', { cwd: 'E:/code/Fantasy-Map-Generator', stdio: 'inherit' });
    const result = execSync('git commit -m "Fix Siriano: Italy → Colombian Amazon"', { 
        cwd: 'E:/code/Fantasy-Map-Generator',
        stdio: 'pipe' 
    });
    console.log(result.toString());
} catch(e) {
    console.log('Error:', e.message);
}