const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'modules', 'namebases-africa.js');
const content = fs.readFileSync(filePath, 'binary');

// Search for the specific Forro São Tomé entry and analyze byte patterns
const startMarker = '"name": "Forro São Tomé"';
const startPos = content.indexOf(startMarker);

if (startPos !== -1) {
    console.log('Found Forro São Tomé entry at position:', startPos);

    // Extract the entry (until the next closing brace)
    let entryEnd = content.indexOf('},', startPos);
    if (entryEnd === -1) entryEnd = content.indexOf('\n}', startPos);

    const entry = content.substring(startPos, entryEnd + 2);
    console.log('Entry length:', entry.length);

    // Analyze specific byte patterns around "Água"
    const aguaPatterns = ['Água', 'Ã°gua', 'AÂgua', 'Á gua', 'AÁgua', 'Ã¡gua'];
    console.log('\nByte analysis for water-related terms:');

    aguaPatterns.forEach(pattern => {
        const bytes = Buffer.from(pattern, 'utf8').toString('hex');
        console.log(`  "${pattern}" bytes: ${bytes}`);
    });

    // Look for any non-UTF-8 sequences in the entry
    console.log('\nSearching for potential encoding issues:');
    const suspectPatterns = [
        /Ã[\x80-\xBF]/g,  // Corrupted UTF-8 continuation bytes
        /[Â-ÿ][Â-ÿ]/g,    // Double-byte sequences that should be single chars
    ];

    let issueCount = 0;
    for (const pattern of suspectPatterns) {
        const matches = entry.match(pattern);
        if (matches) {
            console.log(`Found ${matches.length} potential issues with pattern:`, pattern);
            issueCount += matches.length;
        }
    }

    // Check if "Água" appears correctly
    const aguaGrandeHex = Buffer.from('Água Grande', 'utf8').toString('hex');
    console.log('\nExpected bytes for "Água Grande":', aguaGrandeHex);

    // Now check what we actually have
    const actualAguaIndex = entry.indexOf('Água Grande');
    if (actualAguaIndex !== -1) {
        const context = entry.substring(actualAguaIndex, actualAguaIndex + 50);
        const contextBytes = Buffer.from(context, 'utf8').toString('hex');
        console.log('Actual bytes found:', contextBytes);

        // Check if it matches expected
        if (contextBytes.includes(aguaGrandeHex)) {
            console.log('✅ "Água Grande" appears to be properly encoded');
        } else {
            console.log('❌ "Água Grande" encoding mismatch');
        }
    } else {
        console.log('❌ "Água Grande" not found in entry');
    }

    // Check "Água Izé"
    const aguaIzeHex = Buffer.from('Água Izé', 'utf8').toString('hex');
    console.log('\nExpected bytes for "Água Izé":', aguaIzeHex);

    const actualIzeIndex = entry.indexOf('Água Izé');
    if (actualIzeIndex !== -1) {
        const context = entry.substring(actualIzeIndex, actualIzeIndex + 50);
        const contextBytes = Buffer.from(context, 'utf8').toString('hex');
        console.log('Actual bytes found:', contextBytes);

        if (contextBytes.includes(aguaIzeHex)) {
            console.log('✅ "Água Izé" appears to be properly encoded');
        } else {
            console.log('❌ "Água Izé" encoding mismatch');
        }
    } else {
        console.log('❌ "Água Izé" not found in entry');
    }

    console.log('\nTotal potential encoding issues found:', issueCount);

} else {
    console.log('Forro São Tomé entry not found in the file');
}

// Also check for any other Forro-related entries that might have issues
console.log('\n--- Searching for other Forro entries ---');
const forroMatches = content.match(/Forro[^}]+}/g);
if (forroMatches) {
    console.log('Found', forroMatches.length, 'Forro entries');
    forroMatches.forEach((match, i) => {
        console.log(`Entry ${i + 1}:`, match.substring(0, 100) + '...');
    });
}
