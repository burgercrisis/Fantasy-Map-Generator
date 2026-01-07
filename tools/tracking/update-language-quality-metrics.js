"use strict";

/**
 * Language Quality Metrics Update Script
 * 
 * Reads the language quality metrics CSV, identifies issues, fixes them automatically,
 * updates quality scores, and generates a summary report.
 */

const fs = require("node:fs");
const path = require("node:path");

// Configuration
const CSV_PATH = path.resolve(__dirname, "../../docs/reports/language-quality-metrics.csv");
const REPORT_PATH = path.resolve(__dirname, "../../docs/reports/language-quality-report.md");

// Encoding issue patterns (UTF-8 double-encoding artifacts)
const ENCODING_PATTERNS = [
    { pattern: /Î"/g, replacement: "" },
    { pattern: /Ã§/gi, replacement: "ç" },
    { pattern: /Ã©/gi, replacement: "é" },
    { pattern: /Ã®/gi, replacement: "î" },
    { pattern: /ÃŽ/gi, replacement: "Î" },
    { pattern: /Ã‰/gi, replacement: "É" },
    { pattern: /Ã²/gi, replacement: "ò" },
    { pattern: /Ã±/gi, replacement: "ñ" },
    { pattern: /Ã¼/gi, replacement: "ü" },
    { pattern: /Ã¶/gi, replacement: "ö" },
    { pattern: /Ã„/gi, replacement: "Ä" },
    { pattern: /â”œ/g, replacement: "" },
    { pattern: /â•‘/g, replacement: "" },
    { pattern: /â•—/g, replacement: "" },
    { pattern: /âŒ/g, replacement: "" },
    { pattern: /â”œÃ±/g, replacement: "ñ" },
    { pattern: /â”œÃ¡/g, replacement: "á" },
    { pattern: /â”œÃ²/g, replacement: "ò" },
    { pattern: /â”œÃ©/g, replacement: "é" },
    { pattern: /â”¼/g, replacement: "" },
    { pattern: /â”›/g, replacement: "" },
    { pattern: /â•—/g, replacement: "" },
];

// Suspicious name patterns (e.g., names ending with " language")
const SUSPICIOUS_PATTERNS = [
    { pattern: /\s+language$/i, replacement: "", type: "language_suffix" },
    { pattern: /\s+dialect$/i, replacement: "", type: "dialect_suffix" },
    { pattern: /\s+lect$/i, replacement: "", type: "lect_suffix" },
    { pattern: /\s+family$/i, replacement: "", type: "family_suffix" },
    { pattern: /\s+macro$/i, replacement: "", type: "macro_suffix" },
];

/**
 * Parse CSV file with proper handling of quoted fields and special characters
 */
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
                i++; // Skip escaped quote
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
    
    // Handle last field
    if (currentField || currentLine.length > 0) {
        currentLine.push(currentField.trim());
        if (currentLine.length > 1 || currentLine[0]) {
            lines.push(currentLine);
        }
    }
    
    return lines;
}

/**
 * Convert array back to CSV format
 */
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

/**
 * Check if a string has encoding issues
 */
function hasEncodingIssue(name) {
    if (!name || typeof name !== "string") return false;
    // Check for common double-encoding patterns
    return /Î|Ã|â”œ|â•|âŒ|MoÎ“|PuÎ“|Hâ”œ|Hâ”¼/.test(name);
}

/**
 * Fix encoding issues in a name
 */
function fixEncoding(name) {
    if (!name || typeof name !== "string") return name;
    
    let fixed = name;
    for (const { pattern, replacement } of ENCODING_PATTERNS) {
        fixed = fixed.replace(pattern, replacement);
    }
    return fixed;
}

/**
 * Check if a name has trailing space
 */
function hasTrailingSpace(name) {
    if (!name || typeof name !== "string") return false;
    return /\s$/.test(name);
}

/**
 * Remove trailing spaces from a name
 */
function removeTrailingSpace(name) {
    if (!name || typeof name !== "string") return name;
    return name.trimEnd();
}

/**
 * Check if a name is suspicious
 */
function isSuspiciousName(name) {
    if (!name || typeof name !== "string") return false;
    return SUSPICIOUS_PATTERNS.some(p => p.pattern.test(name));
}

/**
 * Fix suspicious names
 */
function fixSuspiciousName(name) {
    if (!name || typeof name !== "string") return name;
    
    let fixed = name;
    let wasFixed = false;
    
    for (const { pattern, replacement } of SUSPICIOUS_PATTERNS) {
        if (pattern.test(fixed)) {
            fixed = fixed.replace(pattern, replacement);
            wasFixed = true;
        }
    }
    
    return { name: fixed, wasFixed };
}

/**
 * Calculate quality score based on issues
 */
function calculateQualityScore(row, issues) {
    const hasEncoding = issues.hasEncoding;
    const hasSuspicious = issues.hasSuspicious;
    const hasTrailing = issues.hasTrailing;
    const isPlaceholder = row.is_placeholder === "TRUE" || row.is_placeholder === true;
    const cityCount = parseInt(row.city_count, 10) || 0;
    
    // Score 70: encoding issues or suspicious names
    if (hasEncoding || hasSuspicious) {
        return 70;
    }
    
    // Score 60: placeholders or trailing spaces
    if (isPlaceholder || hasTrailing) {
        return 60;
    }
    
    // Score 85: small datasets (< 10 entries)
    if (cityCount < 10) {
        return 85;
    }
    
    // Score 100: all other valid entries
    return 100;
}

/**
 * Main function to update language quality metrics
 */
function updateLanguageQualityMetrics() {
    console.log("Reading CSV file...");
    const content = fs.readFileSync(CSV_PATH, "utf8");
    const lines = parseCSV(content);
    
    if (lines.length < 2) {
        console.error("CSV file has no data rows");
        return;
    }
    
    // Extract header and data
    const header = lines[0];
    const dataRows = lines.slice(1);
    
    console.log(`Found ${dataRows.length} language entries`);
    
    // Initialize tracking
    const summary = {
        totalLanguages: dataRows.length,
        trailingSpaceFixed: 0,
        encodingIssuesFixed: 0,
        suspiciousNamesFixed: 0,
        placeholdersMarked: 0,
        qualityScoreUpdated: 0,
        issues: {
            trailingSpace: [],
            encoding: [],
            suspicious: [],
            placeholder: [],
            duplicates: [],
            lowScore: []
        },
        recommendations: []
    };
    
    // Process each row
    const updatedRows = dataRows.map((row, index) => {
        const languageName = row[0];
        const originalName = languageName;
        const rowIndex = index + 2; // 1-based with header
        
        const issues = {
            hasTrailing: false,
            hasEncoding: false,
            hasSuspicious: false,
            wasFixed: false
        };
        
        // Check for trailing spaces
        if (hasTrailingSpace(languageName)) {
            issues.hasTrailing = true;
            const fixed = removeTrailingSpace(languageName);
            row[0] = fixed;
            summary.trailingSpaceFixed++;
            summary.issues.trailingSpace.push({
                row: rowIndex,
                original: originalName,
                fixed: fixed
            });
        }
        
        // Check for encoding issues
        if (hasEncodingIssue(row[0])) {
            issues.hasEncoding = true;
            const fixed = fixEncoding(row[0]);
            if (fixed !== row[0]) {
                row[0] = fixed;
                summary.encodingIssuesFixed++;
                summary.issues.encoding.push({
                    row: rowIndex,
                    original: originalName,
                    fixed: fixed
                });
            }
        }
        
        // Check for suspicious names
        if (isSuspiciousName(row[0])) {
            issues.hasSuspicious = true;
            const { name: fixed, wasFixed } = fixSuspiciousName(row[0]);
            if (wasFixed) {
                row[0] = fixed;
                summary.suspiciousNamesFixed++;
                summary.issues.suspicious.push({
                    row: rowIndex,
                    original: originalName,
                    fixed: fixed
                });
            }
        }
        
        // Check for placeholders
        const isPlaceholder = row[7] === "TRUE" || row[7] === true;
        if (isPlaceholder) {
            summary.placeholdersMarked++;
            summary.issues.placeholder.push({
                row: rowIndex,
                name: row[0]
            });
        }
        
        // Check for duplicates
        const isDuplicate = row[12] === "TRUE" || row[12] === true;
        if (isDuplicate) {
            summary.issues.duplicates.push({
                row: rowIndex,
                name: row[0]
            });
        }
        
        // Recalculate quality score
        const newScore = calculateQualityScore({
            language_name: row[0],
            is_placeholder: row[7],
            city_count: row[4]
        }, issues);
        
        const oldScore = parseInt(row[16], 10);
        if (newScore !== oldScore) {
            row[16] = String(newScore);
            summary.qualityScoreUpdated++;
            summary.issues.lowScore.push({
                row: rowIndex,
                name: row[0],
                oldScore,
                newScore
            });
        }
        
        // Generate recommendations for manual fixes
        if (issues.hasEncoding && !summary.issues.encoding.find(e => e.row === rowIndex)) {
            summary.recommendations.push({
                type: "encoding",
                name: row[0],
                note: "Requires manual verification of correct characters"
            });
        }
        
        if (isPlaceholder) {
            summary.recommendations.push({
                type: "placeholder",
                name: row[0],
                note: "Consider replacing with actual language data"
            });
        }
        
        return [header, ...dataRows];
    });
    
    // Flatten updated rows
    const allUpdatedLines = [header, ...dataRows];
    
    // Generate quality distribution
    const qualityDistribution = {};
    dataRows.forEach(row => {
        const score = parseInt(row[16], 10) || 0;
        qualityDistribution[score] = (qualityDistribution[score] || 0) + 1;
    });
    
    // Generate summary report
    const report = generateReport(summary, qualityDistribution);
    
    // Write updated CSV
    console.log("Writing updated CSV file...");
    fs.writeFileSync(CSV_PATH, toCSV(allUpdatedLines), "utf8");
    
    // Write report
    console.log("Writing summary report...");
    fs.writeFileSync(REPORT_PATH, report, "utf8");
    
    console.log("\n=== Language Quality Metrics Update Complete ===");
    console.log(`Total languages analyzed: ${summary.totalLanguages}`);
    console.log(`Trailing spaces fixed: ${summary.trailingSpaceFixed}`);
    console.log(`Encoding issues fixed: ${summary.encodingIssuesFixed}`);
    console.log(`Suspicious names fixed: ${summary.suspiciousNamesFixed}`);
    console.log(`Placeholders marked: ${summary.placeholdersMarked}`);
    console.log(`Quality scores updated: ${summary.qualityScoreUpdated}`);
    console.log(`\nReport saved to: ${REPORT_PATH}`);
    
    return summary;
}

/**
 * Generate markdown report
 */
function generateReport(summary, qualityDistribution) {
    const timestamp = new Date().toISOString();
    
    let report = `# Language Quality Metrics Report\n\n`;
    report += `Generated: ${timestamp}\n\n`;
    report += `## Summary\n\n`;
    report += `- **Total Languages Analyzed**: ${summary.totalLanguages}\n`;
    report += `- **Trailing Spaces Fixed**: ${summary.trailingSpaceFixed}\n`;
    report += `- **Encoding Issues Fixed**: ${summary.encodingIssuesFixed}\n`;
    report += `- **Suspicious Names Fixed**: ${summary.suspiciousNamesFixed}\n`;
    report += `- **Placeholders Marked**: ${summary.placeholdersMarked}\n`;
    report += `- **Quality Scores Updated**: ${summary.qualityScoreUpdated}\n\n`;
    
    report += `## Quality Distribution\n\n`;
    report += `| Score | Count | Percentage |\n`;
    report += `|-------|-------|------------|\n`;
    const sortedScores = Object.keys(qualityDistribution).sort((a, b) => b - a);
    sortedScores.forEach(score => {
        const count = qualityDistribution[score];
        const pct = ((count / summary.totalLanguages) * 100).toFixed(1);
        report += `| ${score} | ${count} | ${pct}% |\n`;
    });
    report += `\n`;
    
    if (summary.issues.trailingSpace.length > 0) {
        report += `## Issues Fixed - Trailing Spaces\n\n`;
        report += `| Row | Original | Fixed |\n`;
        report += `|-----|----------|-------|\n`;
        summary.issues.trailingSpace.forEach(issue => {
            report += `| ${issue.row} | ${issue.original} | ${issue.fixed} |\n`;
        });
        report += `\n`;
    }
    
    if (summary.issues.encoding.length > 0) {
        report += `## Issues Fixed - Encoding Issues\n\n`;
        report += `| Row | Original | Fixed |\n`;
        report += `|-----|----------|-------|\n`;
        summary.issues.encoding.forEach(issue => {
            report += `| ${issue.row} | ${issue.original} | ${issue.fixed} |\n`;
        });
        report += `\n`;
    }
    
    if (summary.issues.suspicious.length > 0) {
        report += `## Issues Fixed - Suspicious Names\n\n`;
        report += `| Row | Original | Fixed |\n`;
        report += `|-----|----------|-------|\n`;
        summary.issues.suspicious.forEach(issue => {
            report += `| ${issue.row} | ${issue.original} | ${issue.fixed} |\n`;
        });
        report += `\n`;
    }
    
    if (summary.issues.placeholder.length > 0) {
        report += `## Placeholders Requiring Attention\n\n`;
        report += `| Row | Name |\n`;
        report += `|-----|------|\n`;
        summary.issues.placeholder.forEach(issue => {
            report += `| ${issue.row} | ${issue.name} |\n`;
        });
        report += `\n`;
    }
    
    if (summary.issues.duplicates.length > 0) {
        report += `## Duplicate Entries\n\n`;
        report += `| Row | Name |\n`;
        report += `|-----|------|\n`;
        summary.issues.duplicates.forEach(issue => {
            report += `| ${issue.row} | ${issue.name} |\n`;
        });
        report += `\n`;
    }
    
    if (summary.recommendations.length > 0) {
        report += `## Recommendations for Manual Review\n\n`;
        summary.recommendations.forEach(rec => {
            report += `- **${rec.type}**: ${rec.name}\n`;
            report += `  - Note: ${rec.note}\n\n`;
        });
    }
    
    return report;
}

// Run if executed directly
if (require.main === module) {
    try {
        updateLanguageQualityMetrics();
    } catch (error) {
        console.error("Error updating language quality metrics:", error);
        process.exit(1);
    }
}

module.exports = { updateLanguageQualityMetrics, parseCSV, toCSV, fixEncoding, removeTrailingSpace, fixSuspiciousName };
