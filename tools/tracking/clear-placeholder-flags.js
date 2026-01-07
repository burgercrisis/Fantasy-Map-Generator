/**
 * Clear is_placeholder flag for entries that now have "(setBases aux)" suffix
 * 
 * The metrics script uses the is_placeholder column to determine score.
 * After converting "(dedicated)" → "(setBases aux)", we need to clear
 * the is_placeholder flag so these entries can get score 40+ instead of 60.
 */

const fs = require("node:fs");
const path = require("path");

const CSV_PATH = path.join(__dirname, "..", "..", "docs", "reports", "language-quality-metrics.csv");

function parseCSV(content) {
    const lines = [];
    let currentLine = [];
    let currentField = "";
    let inQuotes = false;
    
    for (let i = 0; i < content.length; i++) {
        const char = content[i];
        const nextChar = content[i + 1];
        
        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                currentField += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            currentLine.push(currentField.trim());
            currentField = "";
        } else if ((char === '\n' || char === '\r') && !inQuotes) {
            if (currentField || currentLine.length > 0) {
                currentLine.push(currentField.trim());
                if (currentLine.length > 1 || currentLine[0]) {
                    lines.push(currentLine);
                }
            }
            currentLine = [];
            currentField = "";
            if (char === '\r' && nextChar === '\n') {
                i++;
            }
        } else {
            currentField += char;
        }
    }
    
    if (currentField || currentLine.length > 0) {
        currentLine.push(currentField.trim());
        if (currentLine.length > 1 || currentLine[0]) {
            lines.push(currentLine);
        }
    }
    
    return lines;
}

function toCSV(lines) {
    return lines.map(line => 
        line.map(field => {
            const str = String(field);
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return '"' + str.replace(/"/g, '""') + '"';
            }
            return str;
        }).join(',')
    ).join('\n');
}

function clearPlaceholderFlags() {
    console.log("📋 Clearing placeholder flags for converted entries...\n");
    
    const content = fs.readFileSync(CSV_PATH, "utf8");
    const lines = parseCSV(content);
    
    if (lines.length < 2) {
        console.error("CSV file has no data rows");
        return;
    }
    
    const header = lines[0];
    const dataRows = lines.slice(1);
    
    console.log(`Found ${dataRows.length} language entries`);
    
    // Find is_placeholder column index
    const placeholderColIndex = header.findIndex(h => 
        h.toLowerCase().includes('placeholder') || h === 'is_placeholder'
    );
    
    if (placeholderColIndex === -1) {
        console.error("Could not find is_placeholder column in header");
        return;
    }
    
    console.log(`is_placeholder column found at index ${placeholderColIndex}`);
    
    // Find name column (usually index 0 or first column)
    const nameColIndex = 0;
    
    let flagsCleared = 0;
    let alreadyCleared = 0;
    
    dataRows.forEach((row, index) => {
        const name = row[nameColIndex];
        const isPlaceholder = row[placeholderColIndex];
        
        // Check if entry has "(setBases aux)" suffix but still has placeholder flag
        if (name && name.includes("(setBases aux)")) {
            if (isPlaceholder === "TRUE" || isPlaceholder === true) {
                row[placeholderColIndex] = "FALSE";
                flagsCleared++;
                console.log(`  ✓ Cleared: ${name}`);
            } else if (isPlaceholder === "FALSE") {
                alreadyCleared++;
            }
        }
    });
    
    console.log(`\n📊 Results:`);
    console.log(`   Placeholder flags cleared: ${flagsCleared}`);
    console.log(`   Already cleared: ${alreadyCleared}`);
    console.log(`   No changes needed: ${dataRows.length - flagsCleared - alreadyCleared}`);
    
    // Write updated CSV
    const newContent = toCSV([header, ...dataRows]);
    fs.writeFileSync(CSV_PATH, newContent, "utf8");
    
    console.log("\n✅ CSV updated successfully!");
    
    return { flagsCleared, alreadyCleared };
}

if (require.main === module) {
    try {
        clearPlaceholderFlags();
    } catch (error) {
        console.error("Error clearing placeholder flags:", error);
        process.exit(1);
    }
}

module.exports = { clearPlaceholderFlags };
