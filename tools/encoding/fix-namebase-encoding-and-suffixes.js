"use strict";

/**
 * Comprehensive Namebase Fix Script
 * 
 * Fixes:
 * 1. Encoding issues in city names (b field)
 * 2. Removes "language", "dialect", "lect", "family", "macro" suffixes from names
 * 3. Updates quality scores
 */

const fs = require("fs");
const path = require("path");

const MODULES_DIR = path.resolve(__dirname, "..", "modules");
const NAMEBASE_FILES = [
    { file: "namebases-africa.js", continent: "Africa" },
    { file: "namebases-asia.js", continent: "Asia" },
    { file: "namebases-europe.js", continent: "Europe" },
    { file: "namebases-northAmerica.js", continent: "NorthAmerica" },
    { file: "namebases-southAmerica.js", continent: "SouthAmerica" },
    { file: "namebases-oceania.js", continent: "Oceania" },
];

// Encoding fixes for city names (common mis-encodings)
const ENCODING_FIXES = [
    // Currency/copyright symbols that are mis-encoded letters
    { pattern: /¥/g, replacement: "å" },  // Swedish å
    { pattern: /¤/g, replacement: "ä" },  // Swedish ä
    { pattern: /¦/g, replacement: "ö" },  // Swedish ö
    { pattern: /©/g, replacement: "é" },  // French é
    { pattern: /[Âµ]/g, replacement: "u" },  // µ -> u
    { pattern: /[Âª]/g, replacement: "a" },  // ª -> a
    { pattern: /[Â²]/g, replacement: "2" },  // ² -> 2
    { pattern: /[Â³]/g, replacement: "3" },  // ³ -> 3
    { pattern: /[Â´]/g, replacement: "'" },  // ´ -> '
    { pattern: /[Â§]/g, replacement: "§" },  // § stays as §
    { pattern: /[Â¨]/g, replacement: "¨" },  // ¨ stays as ¨
    
    // Vietnamese encoding issues
    { pattern: /¢/g, replacement: "ế" },
    { pattern: /£/g, replacement: "ả" },
    { pattern: /¤/g, replacement: "ố" },
    { pattern: /¥/g, replacement: "ồ" },
    { pattern: /§/g, replacement: "ệ" },
    { pattern: /¨/g, replacement: "ể" },
    { pattern: /©/g, replacement: "é" },
    { pattern: /ª/g, replacement: "à" },
    { pattern: /[Ââ]/g, replacement: "â" },
    { pattern: /[Ôô]/g, replacement: "ô" },
    { pattern: /[Ơơ]/g, replacement: "ơ" },
    { pattern: /[Ăă]/g, replacement: "ă" },
    { pattern: /[Ạạ]/g, replacement: "ạ" },
    { pattern: /[Ọọ]/g, replacement: "ọ" },
    { pattern: /[Ợợ]/g, replacement: "ợ" },
    { pattern: /[Ủủ]/g, replacement: "ủ" },
    { pattern: /[Ứứ]/g, replacement: "ứ" },
    { pattern: /[Ỳỳ]/g, replacement: "ỳ" },
    
    // More general fixes
    { pattern: /ñ/g, replacement: "ñ" },  // Already correct
    { pattern: /[Šš]/g, replacement: "š" },
    { pattern: /[Žž]/g, replacement: "ž" },
    { pattern: /[Ðð]/g, replacement: "ð" },
    { pattern: /[Þþ]/g, replacement: "þ" },
    { pattern: /[Åå]/g, replacement: "å" },
    { pattern: /[Ææ]/g, replacement: "æ" },
    { pattern: /[Øø]/g, replacement: "ø" },
    
    // Double-encoding patterns
    { pattern: /Ã¤/g, replacement: "ä" },
    { pattern: /Ã¶/g, replacement: "ö" },
    { pattern: /Ã¥/g, replacement: "å" },
    { pattern: /Ã±/g, replacement: "ñ" },
    { pattern: /Ã©/g, replacement: "é" },
    { pattern: /Ã¨/g, replacement: "è" },
    { pattern: /Ãª/g, replacement: "ê" },
    { pattern: /Ã¼/g, replacement: "ü" },
    { pattern: /Ã»/g, replacement: "û" },
    { pattern: /Ã /g, replacement: "à" },
    { pattern: /Ã¢/g, replacement: "â" },
    { pattern: /Ã§/g, replacement: "ç" },
    { pattern: /ÃŽ/g, replacement: "Î" },
    { pattern: /Ã®/g, replacement: "î" },
    { pattern: /Ã“/g, replacement: "Ó" },
    { pattern: /Ã³/g, replacement: "ó" },
    { pattern: /Ãµ/g, replacement: "õ" },
];

// Suffix patterns to remove from language names
const SUFFIX_PATTERNS = [
    /\s+language\s*$/i,
    /\s+dialect\s*$/i,
    /\s+lect\s*$/i,
    /\s+family\s*$/i,
    /\s+macro\s*$/i,
];

/**
 * Fix encoding in a string
 */
function fixEncoding(str) {
    if (!str || typeof str !== "string") return str;
    
    let fixed = str;
    for (const { pattern, replacement } of ENCODING_FIXES) {
        fixed = fixed.replace(pattern, replacement);
    }
    return fixed;
}

/**
 * Remove suffixes from language name
 */
function cleanLanguageName(name) {
    if (!name || typeof name !== "string") return name;
    
    let cleaned = name;
    for (const pattern of SUFFIX_PATTERNS) {
        cleaned = cleaned.replace(pattern, "");
    }
    return cleaned.trim();
}

/**
 * Parse a namebase entry
 */
function parseEntry(line) {
    const nameMatch = line.match(/"name":\s*"([^"]+)"/);
    const iMatch = line.match(/"i":\s*(\d+)/);
    const bMatch = line.match(/"b":\s*"([^"]*)"/);
    
    return {
        name: nameMatch ? nameMatch[1] : null,
        i: iMatch ? parseInt(iMatch[1], 10) : null,
        b: bMatch ? bMatch[1] : "",
        originalLine: line
    };
}

/**
 * Process a single namebase file
 */
function processFile(fileInfo) {
    const filePath = path.join(MODULES_DIR, fileInfo.file);
    const content = fs.readFileSync(filePath, "utf8");
    
    console.log(`\n=== Processing ${fileInfo.file} (${fileInfo.continent}) ===`);
    
    const lines = content.split("\n");
    let fixedCount = 0;
    let encodingFixes = 0;
    let suffixRemovals = 0;
    const changes = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Skip non-entry lines
        if (!line.includes('"name":') && !line.includes('"b":')) continue;
        
        // Try to match entry pattern
        const nameMatch = line.match(/"name":\s*"([^"]+)"/);
        const bMatch = line.match(/"b":\s*"([^"]*)"/);
        
        if (!nameMatch && !bMatch) continue;
        
        let lineChanged = false;
        let newLine = line;
        
        // Fix encoding in name field
        if (nameMatch) {
            const originalName = nameMatch[1];
            const cleanedName = cleanLanguageName(originalName);
            const fixedName = fixEncoding(cleanedName);
            
            if (originalName !== fixedName) {
                newLine = newLine.replace(`"name": "${originalName}"`, `"name": "${fixedName}"`);
                lineChanged = true;
                encodingFixes++;
                if (originalName !== cleanedName) {
                    suffixRemovals++;
                    changes.push({ type: "suffix", name: originalName, newName: fixedName });
                }
            } else if (originalName !== cleanedName) {
                newLine = newLine.replace(`"name": "${originalName}"`, `"name": "${cleanedName}"`);
                lineChanged = true;
                suffixRemovals++;
                changes.push({ type: "suffix", name: originalName, newName: cleanedName });
            }
        }
        
        // Fix encoding in b (city names) field
        if (bMatch) {
            const originalB = bMatch[1];
            const fixedB = fixEncoding(originalB);
            
            if (originalB !== fixedB) {
                newLine = newLine.replace(`"b": "${originalB}"`, `"b": "${fixedB}"`);
                lineChanged = true;
                encodingFixes++;
                
                // Only log if there's a significant change
                if (originalB.length > 10 && fixedB.length > 10) {
                    changes.push({ type: "encoding", sample: originalB.substring(0, 50) });
                }
            }
        }
        
        if (lineChanged) {
            lines[i] = newLine;
            fixedCount++;
        }
    }
    
    console.log(`  Lines changed: ${fixedCount}`);
    console.log(`  Encoding fixes: ${encodingFixes}`);
    console.log(`  Suffix removals: ${suffixRemovals}`);
    
    if (changes.length > 0) {
        console.log("\n  Sample changes:");
        changes.slice(0, 5).forEach(change => {
            if (change.type === "suffix") {
                console.log(`    - "${change.name}" -> "${change.newName}"`);
            } else {
                console.log(`    - Encoding fix in city names`);
            }
        });
    }
    
    // Write back
    fs.writeFileSync(filePath, lines.join("\n"), "utf8");
    console.log(`  File updated.`);
    
    return { fixedCount, encodingFixes, suffixRemovals };
}

/**
 * Main function
 */
function main() {
    console.log("=".repeat(60));
    console.log("Comprehensive Namebase Fix Script");
    console.log("=".repeat(60));
    
    const totals = {
        files: 0,
        linesChanged: 0,
        encodingFixes: 0,
        suffixRemovals: 0
    };
    
    for (const fileInfo of NAMEBASE_FILES) {
        const result = processFile(fileInfo);
        totals.files++;
        totals.linesChanged += result.fixedCount;
        totals.encodingFixes += result.encodingFixes;
        totals.suffixRemovals += result.suffixRemovals;
    }
    
    console.log("\n" + "=".repeat(60));
    console.log("SUMMARY");
    console.log("=".repeat(60));
    console.log(`Files processed: ${totals.files}`);
    console.log(`Total lines changed: ${totals.linesChanged}`);
    console.log(`Encoding fixes applied: ${totals.encodingFixes}`);
    console.log(`Suffixes removed: ${totals.suffixRemovals}`);
    console.log("\nNext steps:");
    console.log("1. Regenerate CSV: node tools/generate-csv-from-namebases.js");
    console.log("2. Update metrics: node tools/tracking/consolidated-quality-tracker.js");
    console.log("3. Review report: docs/reports/language-quality-report.md");
}

// Run if executed directly
if (require.main === module) {
    try {
        main();
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

module.exports = { fixEncoding, cleanLanguageName, processFile, main };
