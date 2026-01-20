"use strict";

/**
 * Continent File Quality Metrics Update Script
 * 
 * Reads language quality data directly from continent files,
 * identifies issues, fixes them automatically in the source files,
 * updates quality scores, and generates a summary report.
 * 
 * Usage: node tools/tracking/update-continent-quality-metrics.js [--fix] [--report]
 *   --fix    : Apply automatic fixes to continent files
 *   --report : Generate quality report
 *   (both enabled by default)
 */

const fs = require("node:fs");
const path = require("node:path");

// Configuration
const CONTINENTS_DIR = path.resolve(__dirname, "../../modules");
const REPORT_PATH = path.resolve(__dirname, "../../docs/reports/continent-quality-report.md");
const METRICS_PATH = path.resolve(__dirname, "../../docs/reports/continent-quality-metrics.json");

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
    { pattern: /âŒ�/g, replacement: "" },
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

// Quality issue thresholds
const QUALITY_THRESHOLDS = {
    excellent: 95,
    good: 85,
    acceptable: 70,
    poor: 50,
    critical: 0
};

/**
 * Load all continent files and extract namebase data
 */
function loadContinentFiles() {
    const continentFiles = [
        'namebases-africa.js',
        'namebases-asia.js', 
        'namebases-europe.js',
        'namebases-northAmerica.js',
        'namebases-southAmerica.js',
        'namebases-oceania.js',
        'namebases-fantasy.js'
    ];
    
    const data = {};
    
    for (const filename of continentFiles) {
        const filepath = path.join(CONTINENTS_DIR, filename);
        if (fs.existsSync(filepath)) {
            const content = fs.readFileSync(filepath, 'utf8');
            const match = content.match(/window\.(\w+)NameBases\s*=\s*(\[[\s\S]*?\]);/);
            if (match) {
                try {
                    // Use Function constructor to safely parse the array
                    const arrayStr = match[1].replace('window.', '') + ' = ' + match[2];
                    const func = new Function(arrayStr + '; return ' + match[1].replace('window.', '') + ';');
                    data[filename] = {
                        content: content,
                        namebases: func(),
                        continent: filename.replace('namebases-', '').replace('.js', ''),
                        globalName: match[1]
                    };
                } catch (e) {
                    console.error(`Error parsing ${filename}:`, e.message);
                }
            }
        }
    }
    
    return data;
}

/**
 * Analyze a single name for quality issues
 */
function analyzeName(name) {
    const issues = [];
    
    // Check for encoding issues
    if (/[ÎÃâ”œâ•âŒ]/.test(name)) {
        issues.push({ type: 'encoding', severity: 'high' });
    }
    
    // Check for suspicious patterns
    for (const { pattern, type } of SUSPICIOUS_PATTERNS) {
        if (pattern.test(name)) {
            issues.push({ type: type, severity: 'medium' });
        }
    }
    
    // Check for length issues
    if (name.length < 2) {
        issues.push({ type: 'too_short', severity: 'high' });
    }
    if (name.length > 60) {
        issues.push({ type: 'too_long', severity: 'low' });
    }
    
    // Check for case anomalies
    if (name === name.toUpperCase() && name.length > 1) {
        issues.push({ type: 'all_caps', severity: 'low' });
    }
    if (name === name.toLowerCase() && name.length > 1 && /[A-Z]/.test(name)) {
        issues.push({ type: 'mixed_case', severity: 'low' });
    }
    
    return issues;
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
 * Fix suspicious names
 */
function fixSuspiciousName(name) {
    if (!name || typeof name !== "string") return { name, fixed: false };
    
    let fixed = name;
    let wasFixed = false;
    
    for (const { pattern, replacement } of SUSPICIOUS_PATTERNS) {
        if (pattern.test(fixed)) {
            fixed = fixed.replace(pattern, replacement);
            wasFixed = true;
        }
    }
    
    return { name: fixed, fixed: wasFixed };
}

/**
 * Analyze all namebases in a continent file
 */
function analyzeContinentFile(filename, data) {
    const results = {
        filename: filename,
        continent: data.continent,
        languages: [],
        totalNames: 0,
        totalIssues: 0,
        encodingIssues: 0,
        suspiciousNames: 0,
        fixedCount: 0
    };
    
    for (const language of data.namebases) {
        const langResult = {
            name: language.name,
            index: language.i,
            names: [],
            issues: [],
            issueCount: 0,
            qualityScore: 100
        };
        
        const names = language.b ? language.b.split(',') : [];
        langResult.totalNames = names.length;
        results.totalNames += names.length;
        
        for (const name of names) {
            const issues = analyzeName(name);
            if (issues.length > 0) {
                langResult.issues.push({ name, issues });
                langResult.issueCount += issues.length;
                results.totalIssues += issues.length;
                
                for (const issue of issues) {
                    if (issue.type === 'encoding') {
                        results.encodingIssues++;
                    }
                    if (['language_suffix', 'dialect_suffix', 'lect_suffix', 'family_suffix', 'macro_suffix'].includes(issue.type)) {
                        results.suspiciousNames++;
                    }
                }
            }
            
            langResult.names.push({ name, issues, fixed: false });
        }
        
        // Calculate quality score
        if (langResult.totalNames > 0) {
            const issueRatio = langResult.issueCount / langResult.totalNames;
            langResult.qualityScore = Math.max(0, Math.round(100 - (issueRatio * 100)));
        }
        
        results.languages.push(langResult);
    }
    
    return results;
}

/**
 * Apply fixes to a continent file
 */
function applyFixes(filename, data) {
    let fixesApplied = 0;
    let content = data.content;
    
    for (const language of data.namebases) {
        const names = language.b ? language.b.split(',') : [];
        const fixedNames = [];
        
        for (const name of names) {
            let fixedName = name;
            let wasFixed = false;
            
            // Fix encoding issues
            if (/[ÎÃâ”œâ•âŒ]/.test(name)) {
                fixedName = fixEncoding(name);
                if (fixedName !== name) wasFixed = true;
            }
            
            // Fix suspicious patterns
            const { name: suspiciousFixed, fixed: suspiciousWasFixed } = fixSuspiciousName(name);
            if (suspiciousWasFixed) {
                fixedName = suspiciousFixed;
                wasFixed = true;
            }
            
            if (wasFixed) {
                fixesApplied++;
                content = content.replace(name, fixedName);
            }
            
            fixedNames.push(fixedName);
        }
        
        // Update the names in the language object
        language.b = fixedNames.join(',');
    }
    
    // Write back if fixes were applied
    if (fixesApplied > 0) {
        fs.writeFileSync(path.join(CONTINENTS_DIR, filename), content, 'utf8');
    }
    
    return fixesApplied;
}

/**
 * Generate quality report
 */
function generateReport(analyses) {
    const timestamp = new Date().toISOString();
    const totalLanguages = analyses.reduce((sum, a) => sum + a.languages.length, 0);
    const totalNames = analyses.reduce((sum, a) => sum + a.totalNames, 0);
    const totalIssues = analyses.reduce((sum, a) => sum + a.totalIssues, 0);
    const avgScore = analyses.reduce((sum, a) => sum + a.languages.reduce((s, l) => s + l.qualityScore, 0), 0) / totalLanguages;
    
    // Categorize by quality
    const byQuality = { excellent: [], good: [], acceptable: [], poor: [], critical: [] };
    for (const analysis of analyses) {
        for (const lang of analysis.languages) {
            const entry = {
                continent: analysis.continent,
                language: lang.name,
                index: lang.index,
                names: lang.totalNames,
                issues: lang.issueCount,
                score: lang.qualityScore
            };
            
            if (lang.qualityScore >= QUALITY_THRESHOLDS.excellent) byQuality.excellent.push(entry);
            else if (lang.qualityScore >= QUALITY_THRESHOLDS.good) byQuality.good.push(entry);
            else if (lang.qualityScore >= QUALITY_THRESHOLDS.acceptable) byQuality.acceptable.push(entry);
            else if (lang.qualityScore >= QUALITY_THRESHOLDS.poor) byQuality.poor.push(entry);
            else byQuality.critical.push(entry);
        }
    }
    
    let report = `# Continent Namebase Quality Report

Generated: ${timestamp}

## Summary

| Metric | Value |
|--------|-------|
| Total Languages | ${totalLanguages} |
| Total Place Names | ${totalNames} |
| Total Issues Found | ${totalIssues} |
| Average Quality Score | ${Math.round(avgScore)}/100 |

## Quality Distribution

| Category | Count | Threshold |
|----------|-------|-----------|
| Excellent | ${byQuality.excellent.length} | ${QUALITY_THRESHOLDS.excellent}+ |
| Good | ${byQuality.good.length} | ${QUALITY_THRESHOLDS.good}+ |
| Acceptable | ${byQuality.acceptable.length} | ${QUALITY_THRESHOLDS.acceptable}+ |
| Poor | ${byQuality.poor.length} | ${QUALITY_THRESHOLDS.poor}+ |
| Critical | ${byQuality.critical.length} | Below ${QUALITY_THRESHOLDS.critical} |

## Issues by Type

| Issue Type | Count |
|------------|-------|
| Encoding Issues | ${analyses.reduce((s, a) => s + a.encodingIssues, 0)} |
| Suspicious Names | ${analyses.reduce((s, a) => s + a.suspiciousNames, 0)} |

## By Continent

`;
    
    for (const analysis of analyses) {
        const contScore = Math.round(analysis.languages.reduce((s, l) => s + l.qualityScore, 0) / analysis.languages.length);
        report += `### ${analysis.continent}

- **Languages**: ${analysis.languages.length}
- **Total Names**: ${analysis.totalNames}
- **Total Issues**: ${analysis.totalIssues}
- **Average Score**: ${contScore}/100

`;
        
        // List languages with issues
        const langWithIssues = analysis.languages.filter(l => l.issueCount > 0);
        if (langWithIssues.length > 0) {
            report += `**Languages with issues (${langWithIssues.length}):**\n\n`;
            for (const lang of langWithIssues.slice(0, 10)) {
                report += `- ${lang.name} (i:${lang.index}): ${lang.issueCount} issues, score ${lang.qualityScore}/100\n`;
            }
            if (langWithIssues.length > 10) {
                report += `\n... and ${langWithIssues.length - 10} more\n`;
            }
            report += `\n`;
        }
    }
    
    return report;
}

/**
 * Save metrics as JSON for programmatic access
 */
function saveMetrics(analyses) {
    const metrics = {
        timestamp: new Date().toISOString(),
        summary: {
            totalLanguages: analyses.reduce((sum, a) => sum + a.languages.length, 0),
            totalNames: analyses.reduce((sum, a) => sum + a.totalNames, 0),
            totalIssues: analyses.reduce((sum, a) => sum + a.totalIssues, 0),
            encodingIssues: analyses.reduce((sum, a) => sum + a.encodingIssues, 0),
            suspiciousNames: analyses.reduce((sum, a) => sum + a.suspiciousNames, 0),
        },
        continents: {}
    };
    
    for (const analysis of analyses) {
        metrics.continents[analysis.continent] = {
            languages: analysis.languages.map(l => ({
                name: l.name,
                index: l.i,
                totalNames: l.totalNames,
                issueCount: l.issueCount,
                qualityScore: l.qualityScore,
                issues: l.issues.slice(0, 20) // Limit stored issues
            }))
        };
    }
    
    fs.writeFileSync(METRICS_PATH, JSON.stringify(metrics, null, 2), 'utf8');
    console.log(`Metrics saved to: ${METRICS_PATH}`);
}

/**
 * Main execution
 */
function main() {
    const args = process.argv.slice(2);
    const shouldFix = args.includes('--fix') || args.length === 0;
    const shouldReport = args.includes('--report') || args.length === 0;
    
    console.log('Loading continent files...');
    const continentData = loadContinentFiles();
    console.log(`Loaded ${Object.keys(continentData).length} continent files\n`);
    
    console.log('Analyzing namebases...');
    const analyses = [];
    
    for (const [filename, data] of Object.entries(continentData)) {
        console.log(`  Analyzing ${filename}...`);
        const analysis = analyzeContinentFile(filename, data);
        analyses.push(analysis);
        
        if (analysis.totalIssues > 0) {
            console.log(`    Found ${analysis.totalIssues} issues in ${analysis.languages.length} languages`);
        }
    }
    
    // Apply fixes if requested
    if (shouldFix) {
        console.log('\nApplying fixes...');
        let totalFixes = 0;
        for (const [filename, data] of Object.entries(continentData)) {
            const fixes = applyFixes(filename, data);
            if (fixes > 0) {
                console.log(`  ${filename}: ${fixes} fixes applied`);
                totalFixes += fixes;
            }
        }
        console.log(`Total fixes applied: ${totalFixes}`);
    }
    
    // Generate report if requested
    if (shouldReport) {
        console.log('\nGenerating quality report...');
        const report = generateReport(analyses);
        fs.writeFileSync(REPORT_PATH, report, 'utf8');
        console.log(`Report saved to: ${REPORT_PATH}`);
        
        // Also save metrics as JSON
        saveMetrics(analyses);
    }
    
    console.log('\nDone!');
}

// Run if executed directly
if (require.main === module) {
    main();
}

module.exports = {
    loadContinentFiles,
    analyzeContinentFile,
    applyFixes,
    analyzeName,
    fixEncoding,
    fixSuspiciousName
};
