const fs = require('fs');
const { execSync } = require('child_process');

const files = [
    'modules/namebases-africa.js',
    'modules/namebases-asia.js',
    'modules/namebases-europe.js'
];

function extractEntries(content) {
    const entries = [];
    // This regex looks for objects starting with { and ending with }, and containing "i": or i:
    // It's tricky because of multi-line and nested braces (though unlikely here)
    // We'll look for the pattern of the objects in these files
    const entryBlocks = content.split(/^\s*\{/m).slice(1);
    
    entryBlocks.forEach(block => {
        // Find name and i
        const nameMatch = block.match(/"?name"?\s*:\s*"([^"]+)"/);
        const iMatch = block.match(/"?i"?\s*:\s*(\d+)/);
        const bMatch = block.match(/"?b"?\s*:\s*"([^"]+)"/);
        
        if (nameMatch && iMatch) {
            entries.push({
                name: nameMatch[1],
                i: parseInt(iMatch[1]),
                b: bMatch ? bMatch[1] : '',
                fullBlock: '  {' + block.split(/\n\s*\},/)[0] + '\n  },'
            });
        }
    });
    return entries;
}

let totalRestored = 0;

files.forEach(file => {
    console.log(`Processing ${file}...`);
    const currentContent = fs.readFileSync(file, 'utf8');
    let headContent;
    try {
        headContent = execSync(`git show HEAD:${file}`).toString();
    } catch (e) {
        console.error(`Could not get HEAD for ${file}`);
        return;
    }

    const currentEntries = extractEntries(currentContent);
    const headEntries = extractEntries(headContent);

    console.log(`Current: ${currentEntries.length}, HEAD: ${headEntries.length}`);

    const currentIndices = new Set(currentEntries.map(e => e.i));
    const missingEntries = headEntries.filter(e => !currentIndices.has(e.i));

    if (missingEntries.length > 0) {
        console.log(`Found ${missingEntries.length} missing entries in ${file}:`);
        missingEntries.forEach(e => console.log(`  - ${e.name} (i: ${e.i})`));

        // Restore missing entries
        let updatedContent = currentContent;
        // Find the insertion point: usually before ]; at the end
        const lastBracketIndex = updatedContent.lastIndexOf('];');
        if (lastBracketIndex !== -1) {
            let additions = '';
            missingEntries.forEach(e => {
                additions += `\n${e.fullBlock}\n`;
                totalRestored++;
            });
            updatedContent = updatedContent.slice(0, lastBracketIndex) + additions + updatedContent.slice(lastBracketIndex);
            fs.writeFileSync(file, updatedContent);
            console.log(`Restored ${missingEntries.length} entries to ${file}.`);
        }
    } else {
        console.log(`No missing entries in ${file}.`);
    }
});

console.log(`Total restored: ${totalRestored}`);
