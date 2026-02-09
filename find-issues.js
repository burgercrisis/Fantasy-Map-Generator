const fs = require('fs');  
const content = fs.readFileSync('modules/namebases-real.js', 'utf8');  
const match = content.match(/\[[\s\S]*?\]/);  
if (!match) { console.log('Could not find array'); process.exit(1); }  
const entries = JSON.parse(match[0]);  
console.log('Total entries: ' + entries.length);  
const issues = [];  
