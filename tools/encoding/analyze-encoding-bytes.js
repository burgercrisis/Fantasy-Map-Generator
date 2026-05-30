const fs = require('fs');
const content = fs.readFileSync('E:/code/Fantasy-Map-Generator/modules/namebases-africa.js');

// Find the problematic sequences
const text = content.toString('utf8');
const lines = text.split('\n');
const line261 = lines[261 - 1]; // Line numbers are 1-indexed

console.log('Line 261 content around Pantufo:');
const pantufoIndex = line261.indexOf('Pantufo,');
if (pantufoIndex >= 0) {
    console.log(line261.substring(pantufoIndex, pantufoIndex + 50));
}

// Find the byte positions of the corrupted sequences
const pantufoBytes = content.indexOf(Buffer.from('Pantufo,'));
if (pantufoBytes >= 0) {
    console.log('\nRaw bytes around Pantufo:');
    const slice = content.slice(pantufoBytes, pantufoBytes + 60);
    console.log(slice.toString('hex'));
    
    // Find the corrupted sequences
    // The issue appears to be that "Á" (C3 81 in UTF-8) is corrupted to something else
    const corrupted1 = Buffer.from([0xC3, 0x82, 0x67, 0x75, 0x61]); // Ãgua (corrupted Á)
    const corrupted2 = Buffer.from([0xC2, 0x82, 0x67, 0x75, 0x61]); // ‚gua (different corruption
}
