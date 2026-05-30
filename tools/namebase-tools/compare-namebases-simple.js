const fs = require('fs');

// Read both files
const formattedFile = fs.readFileSync('modules/namebases-real.js', 'utf8');
const singleLineFile = fs.readFileSync('modules/namebases-real.single-line-backup.js', 'utf8');

// Extract just the language entries for comparison
const extractLanguageEntry = (content, i) => {
    const pattern = new RegExp(`"i":${i}[^}]*}`, 'i');
    const match = content.match(pattern);
    return match ? match[0] : null;
};

// Check specific languages that were verified in the corrupted session
const verifiedLanguages = [86, 87]; // South Estonian A & B

console.log('Comparing verified languages from corrupted session:\n');

for (const i of verifiedLanguages) {
    const formattedEntry = extractLanguageEntry(formattedFile, i);
    const singleLineEntry = extractLanguageEntry(singleLineFile, i);

    console.log(`Language i: ${i}`);
    console.log(`Formatted: ${formattedEntry}`);
    console.log(`Single-line: ${singleLineEntry}`);

    if (formattedEntry && singleLineEntry) {
        const formattedNames = formattedEntry.match(/"b":\s*"([^"]+)"/);
        const singleLineNames = singleLineEntry.match(/"b":\s*"([^"]+)"/);

        if (formattedNames && singleLineNames) {
            if (formattedNames[1] !== singleLineNames[1]) {
                console.log('*** DIFFERENCE FOUND ***');
                console.log(`Formatted names: ${formattedNames[1]}`);
                console.log(`Single-line names: ${singleLineNames[1]}`);
            } else {
                console.log('*** NO DIFFERENCE ***');
            }
        }
    }
    console.log('---\n');
}
