const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'modules', 'namebases-africa.js');

console.log('=== Forro São Tomé Encoding Fix Script ===\n');

// Read the file in different encodings to understand the issue
console.log('Step 1: Reading file in different encodings...');

const binaryContent = fs.readFileSync(filePath, 'binary');
const utf8Content = fs.readFileSync(filePath, 'utf8');
const latin1Content = fs.readFileSync(filePath, 'latin1');

console.log('File sizes:');
console.log('  Binary:', binaryContent.length, 'bytes');
console.log('  UTF-8:', utf8Content.length, 'bytes');
console.log('  Latin-1:', latin1Content.length, 'bytes');

// Find the Forro entry and analyze
console.log('\nStep 2: Analyzing Forro São Tomé entry...');

const forroMarker = '"name": "Forro São Tomé"';
const utf8MarkerPos = utf8Content.indexOf(forroMarker);
const latin1MarkerPos = latin1Content.indexOf(forroMarker);

console.log('Forro marker position in UTF-8:', utf8MarkerPos);
console.log('Forro marker position in Latin-1:', latin1MarkerPos);

if (utf8MarkerPos !== -1) {
    console.log('\n✅ Found Forro São Tomé in UTF-8 content');

    // Extract the line
    const lines = utf8Content.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('Forro São Tomé')) {
            console.log('\nForro line (UTF-8):', lines[i]);

            // Check for the specific water names
            if (lines[i].includes('Água Grande')) {
                const bytes = Buffer.from('Água Grande', 'utf8').toString('hex');
                console.log('Expected bytes for "Água Grande":', bytes);

                const foundIndex = lines[i].indexOf('Água Grande');
                const context = lines[i].substring(foundIndex, foundIndex + 20);
                const contextBytes = Buffer.from(context, 'utf8').toString('hex');
                console.log('Actual bytes in file:', contextBytes);

                if (contextBytes.includes('c381677561')) {
                    console.log('✅ "Água Grande" is properly encoded');
                } else {
                    console.log('❌ "Água Grande" encoding issue detected');
                }
            }

            if (lines[i].includes('Água Izé')) {
                const bytes = Buffer.from('Água Izé', 'utf8').toString('hex');
                console.log('\nExpected bytes for "Água Izé":', bytes);

                const foundIndex = lines[i].indexOf('Água Izé');
                const context = lines[i].substring(foundIndex, foundIndex + 15);
                const contextBytes = Buffer.from(context, 'utf8').toString('hex');
                console.log('Actual bytes in file:', contextBytes);

                if (contextBytes.includes('c38167756149')) {
                    console.log('✅ "Água Izé" is properly encoded');
                } else {
                    console.log('❌ "Água Izé" encoding issue detected');
                }
            }
        }
    }
}

// Check the binary content for double-encoding
console.log('\nStep 3: Analyzing binary content for double-encoding...');

const binaryForroPos = binaryContent.indexOf('Forro SÃ£o TomÃ©');
if (binaryForroPos !== -1) {
    console.log('❌ Double-encoding detected: "Forro SÃ£o TomÃ©" found in binary');
    console.log('This indicates UTF-8 bytes were interpreted as Latin-1 and re-encoded');

    // The fix: we need to read the file as binary, fix the double-encoding, then write as UTF-8
    console.log('\nStep 4: Applying fix...');

    let fixedContent = binaryContent;

    // Fix double-encoded UTF-8 sequences
    // Double-encoded "Á" (c3 81) appears as "Ã" (c3 81 in Latin-1)
    // Double-encoded "ã" (c3 a3) appears as "Ã£" (c3 a3 in Latin-1)
    // Double-encoded "é" (c3 a9) appears as "Ã©" (c3 a9 in Latin-1)

    const doubleEncodingMap = {
        'Ã\u0081': 'Á',  // Double-encoded Á
        'Ã£': 'ã',       // Double-encoded ã
        'Ã©': 'é',       // Double-encoded é
        'Ã\u0080': 'À',  // Double-encoded À
        'Ã\u0089': 'É',  // Double-encoded É
    };

    let fixCount = 0;
    for (const [corrupted, correct] of Object.entries(doubleEncodingMap)) {
        const oldLength = fixedContent.length;
        fixedContent = fixedContent.replace(new RegExp(corrupted, 'g'), correct);
        const newLength = fixedContent.length;
        if (oldLength !== newLength) {
            console.log(`  Fixed ${oldLength - newLength} occurrences of "${corrupted}" -> "${correct}"`);
            fixCount += (oldLength - newLength);
        }
    }

    if (fixCount > 0) {
        console.log(`\nTotal fixes applied: ${fixCount}`);

        // Write the fixed content back as UTF-8
        fs.writeFileSync(filePath, fixedContent, 'utf8');
        console.log('✅ File updated successfully');

        // Verify the fix
        console.log('\nStep 5: Verifying fix...');
        const verifyContent = fs.readFileSync(filePath, 'utf8');
        const verifyForroPos = verifyContent.indexOf('Forro São Tomé');

        if (verifyForroPos !== -1) {
            console.log('✅ "Forro São Tomé" now appears correctly in UTF-8');

            // Check water names
            if (verifyContent.includes('Água Grande') && verifyContent.includes('Água Izé')) {
                console.log('✅ Both "Água Grande" and "Água Izé" are properly encoded');
            }
        } else {
            console.log('❌ Fix verification failed');
        }
    } else {
        console.log('\n⚠️  No double-encoding patterns found to fix');
        console.log('The file may already be properly encoded, or the issue is different');

        // Try alternative approach: fix specific known issues
        console.log('\nTrying alternative fix for specific place names...');

        let alternativeFixed = utf8Content;

        // Direct replacements for known issues
        alternativeFixed = alternativeFixed.replace(/Ã°gua Grande/g, 'Água Grande');
        alternativeFixed = alternativeFixed.replace(/AÂgua Grande/g, 'Água Grande');
        alternativeFixed = alternativeFixed.replace(/Ã°gua Izé/g, 'Água Izé');
        alternativeFixed = alternativeFixed.replace(/AÂgua Izé/g, 'Água Izé');
        alternativeFixed = alternativeFixed.replace(/SÃ£o TomÃ©/g, 'São Tomé');

        if (alternativeFixed !== utf8Content) {
            console.log('✅ Alternative fix applied');
            fs.writeFileSync(filePath, alternativeFixed, 'utf8');
            console.log('✅ File updated with alternative fix');

            // Verify
            const finalCheck = fs.readFileSync(filePath, 'utf8');
            if (finalCheck.includes('Água Grande') && finalCheck.includes('Água Izé')) {
                console.log('✅ All encoding issues resolved!');
            }
        } else {
            console.log('⚠️  Alternative fix also found no issues');
            console.log('The encoding may already be correct');
        }
    }

} else {
    console.log('✅ No double-encoding detected in binary content');

    // Check if the file is already correct
    if (utf8Content.includes('Água Grande') && utf8Content.includes('Água Izé')) {
        console.log('✅ File appears to be correctly encoded');
        console.log('✅ "Água Grande" and "Água Izé" are present');
    } else {
        console.log('⚠️  Water names not found in expected format');
    }
}

console.log('\n=== Fix Process Complete ===');
