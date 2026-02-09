const { execSync } = require('child_process');
try {
    execSync('git add modules/namebases-southAmerica.js', { cwd: 'E:/code/Fantasy-Map-Generator', stdio: 'inherit' });
    console.log('Staged');
    
    // Write message to file
    require('fs').writeFileSync('E:/code/Fantasy-Map-Generator/msg.txt', 'Fix Siriano geographic mismatch');
    
    const result = execSync('git commit -F E:/code/Fantasy-Map-Generator/msg.txt', { 
        cwd: 'E:/code/Fantasy-Map-Generator',
        stdio: 'pipe' 
    });
    console.log(result.toString());
} catch(e) {
    console.log('Error:', e.message);
}