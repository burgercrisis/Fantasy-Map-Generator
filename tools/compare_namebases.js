const fs = require('fs');

// Read both files
const formattedFile = fs.readFileSync('modules/namebases-real.js', 'utf8');
const singleLineFile = fs.readFileSync('modules/namebases-real.single-line-backup.js', 'utf8');

// Parse both files to extract language data
const parseLanguages = (content) => {
    const start = content.indexOf('[');
    const end = content.lastIndexOf(']');
    const jsonStr = content.substring(start, end + 1);
    return JSON.parse(jsonStr);
};

const formattedLanguages = parseLanguages(formattedFile);
const singleLineLanguages = parseLanguages(singleLineFile);

// Compare languages to find differences
console.log(`Formatted file: ${formattedLanguages.length} languages`);
console.log(`Single-line file: ${singleLineLanguages.length} languages`);

// Find languages with different names
const differences = [];
for (const formattedLang of formattedLanguages) {
    const singleLineLang = singleLineLanguages.find(l => l.i === formattedLang.i);
    if (singleLineLang && singleLineLang.b !== formattedLang.b) {
        differences.push({
            i: formattedLang.i,
            name: formattedLang.name,
            formatted: formattedLang.b,
            singleLine: singleLineLang.b
        });
    }
}

console.log('\nLanguages with different names:');
differences.forEach(diff => {
    console.log(`\ni: ${diff.i} - ${diff.name}`);
    console.log(`Formatted: ${diff.formatted.substring(0, 100)}...`);
    console.log(`Single-line: ${diff.singleLine.substring(0, 100)}...`);
});

console.log(`\nTotal differences found: ${differences.length}`);
