const fs = require('fs');
const content = fs.readFileSync('modules/namebases-asia.js', 'utf8');

console.log(`Total length: ${content.length} characters`);

// Find â sequences
let pos = 0;
while ((pos = content.indexOf('â', pos)) !== -1) {
    const end = content.indexOf(' ', pos);
    const snippet = content.substring(pos, Math.min(pos + 20, content.length));
    const bytes = Buffer.from(content.substring(pos, Math.min(pos + 5, content.length)));
    console.log(`Found â at position ${pos}`);
    console.log(`  Context: ${snippet.replace(/\n/g, '\\n').replace(/\r/g, '\\r')}`);
    console.log(`  Bytes: ${[...bytes].map(b => '0x' + b.toString(16)).join(' ')}`);
    pos++;
}
