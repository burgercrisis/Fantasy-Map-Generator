const fs = require('fs');
const path = require('path');

// Read the file content as binary to check actual bytes
const filePath = path.join(__dirname, 'modules', 'namebases-africa.js');
const binaryContent = fs.readFileSync(filePath, 'binary');

// Convert to UTF-8 string for comparison
const utf8Content = fs.readFileSync(filePath, 'utf8');

// Find the line containing "Água Grande"
const lines = utf8Content.split('\n');
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('Água Grande') || lines[i].includes('Água Izé')) {
        console.log(`Line ${i + 1}:`);
        console.log(lines[i]);

        // Show the actual bytes in the line
        const lineBytes = Buffer.from(lines[i], 'utf8').toString('hex');
        console.log('Line bytes (hex):', lineBytes);

        // Look for the specific patterns in the binary content
        const aguaGrandeHex = Buffer.from('Água Grande', 'utf8').toString('hex');
        console.log('Expected "Água Grande" bytes:', aguaGrandeHex);

        // Check if there are corrupted versions
        const corruptedHex1 = Buffer.from('Ã\u0081gua Grande', 'binary').toString('hex'); // Wrong UTF-8
        console.log('Corrupted version 1 hex:', corruptedHex1);

        // Also check the actual binary content
        console.log('\nBinary analysis:');
        const position = binaryContent.indexOf('Água Grande');
        if (position !== -1) {
            console.log('Found "Água Grande" at position:', position);
            const context = binaryContent.substring(position, position + 50);
            console.log('Context bytes:', Buffer.from(context, 'binary').toString('hex'));
        } else {
            console.log('"Água Grande" not found in binary content');
            // Try to find similar patterns
            const similarPatterns = ['Ã', 'Á', 'Ã', '°'];
            for (const pattern of similarPatterns) {
                const pos = binaryContent.indexOf(pattern);
                if (pos !== -1) {
                    console.log(`Found "${pattern}" at position ${pos}`);
                }
            }
        }
    }
}

// More comprehensive check
console.log('\n--- Comprehensive UTF-8 Analysis ---');

// Check all occurrences of "Água" in the file
const aguaMatches = utf8Content.match(/Água[^,]*?/g);
if (aguaMatches) {
    console.log('Found "Água" occurrences:', aguaMatches);
    aguaMatches.forEach(match => {
        const bytes = Buffer.from(match, 'utf8').toString('hex');
        console.log(`  "${match}" bytes: ${bytes}`);
    });
} else {
    console.log('No "Água" found with proper UTF-8');

    // Check for corrupted versions
    const corruptedMatches = utf8Content.match(/Ã[^,]*?gua[^,]*?/g);
    if (corruptedMatches) {
        console.log('Found corrupted versions:', corruptedMatches);
    } else {
        console.log('No corrupted versions found either');
    }
}
