const fs = require('fs');
const files = ['modules/namebases-real.js', 'modules/namebases-fantasy.js'];
const indices = Array.from({length: 50}, (_, i) => i + 55); // 55 to 104

indices.forEach(i => {
    let found = false;
    for (const file of files) {
        const src = fs.readFileSync(file, 'utf8');
        const match = src.match(new RegExp('{name: "([^"]+)", i: ' + i + ','));
        if (match) {
            console.log(i + ': ' + match[1] + ' (' + file + ')');
            found = true;
            break;
        }
    }
    if (!found) {
        console.log(i + ': not found');
    }
});
