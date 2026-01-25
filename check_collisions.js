const fs = require('fs');

const files = [
    'modules/namebases-africa.js',
    'modules/namebases-asia.js',
    'modules/namebases-europe.js'
];

function extractEntries(content) {
    const entries = [];
    const entryBlocks = content.split(/^\s*\{/m).slice(1);
    
    entryBlocks.forEach(block => {
        const nameMatch = block.match(/"?name"?\s*:\s*"([^"]+)"/);
        const iMatch = block.match(/"?i"?\s*:\s*(\d+)/);
        
        if (nameMatch && iMatch) {
            entries.push({
                name: nameMatch[1],
                i: parseInt(iMatch[1]),
                fullBlock: '  {' + block.split(/\n\s*\},/)[0] + '\n  },'
            });
        }
    });
    return entries;
}

files.forEach(file => {
    console.log(`Checking ${file} for name collisions...`);
    const content = fs.readFileSync(file, 'utf8');
    const entries = extractEntries(content);
    
    const names = {};
    const toRemove = new Set();
    
    entries.forEach((e, index) => {
        if (names[e.name]) {
            console.log(`Collision found for "${e.name}": indices ${names[e.name].i} and ${e.i}`);
            // We should keep the one that was ALREADY there before restoration if possible.
            // But how do we know? 
            // Usually higher indices are newer? Or maybe lower?
            // Actually, my script added restored ones to the end.
            // So the one at the end is the restored one.
            // If the user wants "ADDITIONS ONLY", maybe I should keep both?
            // But the collisions are bad.
        } else {
            names[e.name] = { i: e.i, index };
        }
    });
});
