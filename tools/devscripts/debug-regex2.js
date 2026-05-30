const fs = require('fs');
const content = fs.readFileSync('modules/namebases-real.backup-20251228-221152.js', 'utf8');

console.log('File length:', content.length);
console.log('First 500 chars:');
console.log(content.substring(0, 500));

// Test the regex
console.log('\nTesting regex...');
const entryRegex = /\{"name":\s*"([^"]+)",\s*"i":\s*(\d+),\s*"min":\s*\d+,\s*"max":\s*\d+,\s*"d":\s*"([^"]*)",\s*"m":\s*[\d.]+,\s*"b":\s*"([^"]+)"\}/g;
const match = entryRegex.exec(content);
if (match) {
    console.log('\n✅ First match found:');
    console.log('Name:', match[1]);
    console.log('i:', match[2]);
    console.log('d:', match[3]);
    console.log('b (first 50 chars):', match[4].substring(0, 50));
} else {
    console.log('\n❌ No matches found');
    
    // Try alternative pattern
    console.log('\nTrying alternative pattern...');
    const altRegex = /\{"name":\s*"([^"]+)",\s*"i":\s*(\d+)/g;
    const altMatch = altRegex.exec(content);
    if (altMatch) {
        console.log('Alternative pattern found:', altMatch[1]);
    }
}
