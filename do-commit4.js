const { execSync } = require('child_process');
const fs = require('fs');

try {
    // Force add
    execSync('git add -f modules/namebases-southAmerica.js', { 
        cwd: 'E:/code/Fantasy-Map-Generator', 
        stdio: 'inherit' 
    });
    console.log('Force added');
    
    // Write message
    fs.writeFileSync('E:/code/Fantasy-Map-Generator/msg.txt', 'Fix Siriano: Italy → Colombian Amazon\n\n- Replaced Siena, Firenze with Mitú, Carurú, Inírida, etc.\n- All 25 cities authentic Vaupés Department, Colombia');
    
    const result = execSync('git commit -F E:/code/Fantasy-Map-Generator/msg.txt', { 
        cwd: 'E:/code/Fantasy-Map-Generator',
        stdio: 'pipe' 
    });
    console.log(result.toString());
} catch(e) {
    console.log('Error:', e.message);
    console.log(e.stdout?.toString());
    console.log(e.stderr?.toString());
}