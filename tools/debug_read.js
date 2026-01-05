const fs = require('fs');
const file = 'modules/namebases-oceania.js';
if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    console.log(`File exists. Length: ${content.length}`);
    const entries = content.split('},');
    console.log(`Number of entries: ${entries.length}`);
} else {
    console.log("File does not exist.");
}
