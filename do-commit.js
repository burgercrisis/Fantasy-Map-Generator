const { execSync } = require('child_process');
const fs = require('fs');

try {
    execSync('git add -A', { cwd: 'E:/code/Fantasy-Map-Generator', stdio: 'inherit' });
    console.log('Files staged');
    
    const result = execSync('git commit -F E:/code/Fantasy-Map-Generator/commit-wave.txt', { 
        cwd: 'E:/code/Fantasy-Map-Generator',
        stdio: 'pipe' 
    });
    console.log(result.toString());
} catch(e) {
    console.log('Error:', e.message);
}