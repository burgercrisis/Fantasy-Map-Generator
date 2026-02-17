"use strict";

/**
 * Consolidated Language/Namebase Quality Metrics Tracker
 *
 * Reads from all continental namebase files (excluding fantasy and all),
 * identifies issues, and generates quality reports.
 *
 * Continental files:
 *   - namebases-africa.js
 *   - namebases-asia.js
 *   - namebases-europe.js
 *   - namebases-northAmerica.js
 *   - namebases-southAmerica.js
 *   - namebases-oceania.js
 *   - namebases-unknown.js
 *
 * Note: Creole languages are already distributed within continent files.
 *
 * Usage: node tools/tracking/consolidated-quality-tracker.js
 *
 * Output:
 *   reports/consolidated-quality-metrics.csv
 *   reports/consolidated-quality-summary.txt
 */

const fs = require('fs');
const path = require('path');

const MODULES_DIR = path.join(__dirname, '..', '..', 'modules');
const REPORTS_DIR = path.join(__dirname, '..', '..', 'docs', 'reports');

const CONTINENT_FILES = [
    'namebases-africa.js',
    'namebases-asia.js',
    'namebases-europe.js',
    'namebases-northAmerica.js',
    'namebases-southAmerica.js',
    'namebases-oceania.js',
    'namebases-unknown.js'
];

const SUSPICIOUS_NAMES = new Set([
    'BPh', 'Big Flowery', 'Français Tirailleur', 'Tày Bôi Pidgin French',
    'Bole Chadic language', 'BiuΓÇôMandara',
    'Bjarmian S├ími', 'Borgarm├Ñlet', 'Baur├⌐', 'Cof├ín', 'Fran├ºais',
    'E'
]);

const PATTERN_DEDICATED = /\(dedicated\)/;
const PATTERN_NEW_PLACE = /New Place/;
const PATTERN_UNQ = /_unq/;
const PATTERN_PRIMUS = /Primus/;
const PATTERN_ENCODING = /[^\x20-\x7E\u00A0-\u00FF]/;
const PATTERN_TRAILING_SPACE = /\s$/;

const EXCEPTIONS_ENCODING = new Set([
    'Nǁng', 'Gǃui', 'Ekoka ǃKung', 'ǂAmkoe', 'ǂKx\'ao\'ae',
    'Maramureș', 'Żejtun dialect'
]);

const EXCEPTIONS_DUPLICATE = new Set([
    'Tłįch', 'Cook Islands Māori Pidgin', 'Tây Bồi Pidgin French', 'ǂKx\'ao\'ae'
]);

function detectContinentFromFilename(filename) {
    const mapping = {
        'namebases-africa.js': 'Africa',
        'namebases-asia.js': 'Asia',
        'namebases-europe.js': 'Europe',
        'namebases-northAmerica.js': 'NorthAmerica',
        'namebases-southAmerica.js': 'SouthAmerica',
        'namebases-oceania.js': 'Oceania',
        'namebases-unknown.js': 'Unknown'
    };
    return mapping[filename] || 'Unknown';
}

function parseNamebaseFile(content) {
    const entries = [];
    
    // Remove the window assignment line if present
    const cleanContent = content
        .replace(/^window\.\w+NameBases\s*=\s*/, '')
        .replace(/^module\.exports\s*=\s*window\.\w+NameBases;?\s*$/, '')
        .replace(/^\[/, '')
        .replace(/\]\s*;?\s*$/, '');
    
    // Match: "name": "...", "i": N pattern
    const namePattern = /"name":\s*"([^"]+)",\s*"i":\s*(\d+)/g;
    
    let match;
    while ((match = namePattern.exec(cleanContent)) !== null) {
        const startPos = match.index;
        const name = match[1];
        const i = parseInt(match[2], 10);
        
        // Find the end of this entry block
        let endPos = cleanContent.indexOf('},', startPos);
        if (endPos === -1) endPos = cleanContent.indexOf('}\n', startPos);
        if (endPos === -1) endPos = cleanContent.indexOf('}', startPos);
        if (endPos === -1) endPos = cleanContent.length - 1;
        
        const entryBlock = cleanContent.substring(startPos, endPos + 2);
        const dMatch = entryBlock.match(/"d":\s*"([^"]*)"/);
        const bMatch = entryBlock.match(/"b":\s*"([^"]*)"/);
        
        entries.push({
            name: name,
            i: i,
            d: dMatch ? dMatch[1] : '',
            b: bMatch ? bMatch[1] : ''
        });
    }
    
    return entries;
}

function countCities(bString) {
    if (!bString) return 0;
    return bString.split(',').filter(c => c.trim()).length;
}

function hasDuplicateCities(bString) {
    if (!bString) return false;
    const cities = bString.split(',').map(c => c.trim());
    return new Set(cities).size < cities.length;
}

function isPlaceholder(bString, name) {
    if (!bString) return false;
    if (PATTERN_NEW_PLACE.test(bString) || PATTERN_UNQ.test(bString)) return true;
    
    const cities = bString.split(',').filter(c => c.trim());
    if (cities.length < 5 && cities[0]) {
        const normalizedName = name.replace(/[^a-zA-Z]/g, '').toLowerCase();
        if (cities[0].toLowerCase().includes(normalizedName + 'a,')) return true;
    }
    
    return false;
}

function isSuspiciousName(name) {
    if (SUSPICIOUS_NAMES.has(name)) return true;
    if (name === name.toUpperCase() && name.length > 1 && name.length < 4) return true;
    return false;
}

function calculateQualityScore({cityCount, duplicateCities, placeholder, suspicious, hasTrailingSpace, hasEncodingIssue, hasPrimus, hasDedicated, indexCollision, nameCollision, languageName}) {
    let score = 100;
    
    if (cityCount < 3) score -= 30;
    else if (cityCount < 5) score -= 15;
    
    if (duplicateCities && !EXCEPTIONS_DUPLICATE.has(languageName)) score -= 20;
    if (placeholder) score -= 40;
    if (hasPrimus) score -= 50;
    if (suspicious) score -= 40;
    if (hasTrailingSpace) score -= 10;
    if (hasEncodingIssue && !EXCEPTIONS_ENCODING.has(languageName)) score -= 30;
    if (hasDedicated) score -= 20;
    if (indexCollision) score -= 15;
    if (nameCollision) score -= 15;
    
    return Math.max(0, score);
}

function getIndexRange(i) {
    if (i < 1000) return '1-999';
    if (i < 10000) return '1000-9999';
    if (i < 20000) return '10000-19999';
    return '20000+';
}

function loadAllNamebases() {
    const allEntries = [];
    
    for (const filename of CONTINENT_FILES) {
        const filepath = path.join(MODULES_DIR, filename);
        
        if (!fs.existsSync(filepath)) {
            console.log(`  ⚠️  ${filename} not found, skipping`);
            continue;
        }
        
        const content = fs.readFileSync(filepath, 'utf8');
        const entries = parseNamebaseFile(content);
        const continent = detectContinentFromFilename(filename);
        
        // Add continent info to each entry
        for (const entry of entries) {
            entry.continent = continent;
            entry.sourceFile = filename;
        }
        
        console.log(`  ✅ ${filename}: ${entries.length} languages`);
        allEntries.push(...entries);
    }
    
    return allEntries;
}

function runAllChecks() {
    console.log('=== Consolidated Quality Metrics Tracker ===\n');
    console.log('Loading from continental namebase files...');
    
    const allEntries = loadAllNamebases();
    console.log(`\nTotal entries loaded: ${allEntries.length}\n`);
    
    // Track index and name collisions
    const indexMap = new Map();
    const nameMap = new Map();
    
    const metrics = allEntries.map(entry => {
        const cityCount = countCities(entry.b);
        const duplicateCities = hasDuplicateCities(entry.b);
        const placeholder = isPlaceholder(entry.b, entry.name);
        const suspicious = isSuspiciousName(entry.name);
        const hasTrailingSpace = PATTERN_TRAILING_SPACE.test(entry.name);
        const hasEncodingIssue = PATTERN_ENCODING.test(entry.name || '');
        const hasPrimus = PATTERN_PRIMUS.test(entry.b || '');
        const hasDedicated = PATTERN_DEDICATED.test(entry.name);
        
        const indexCollision = indexMap.has(entry.i);
        if (!indexCollision) {
            indexMap.set(entry.i, entry.name);
        }
        
        const nameKey = entry.name.toLowerCase();
        const nameCollision = nameMap.has(nameKey);
        if (!nameCollision) {
            nameMap.set(nameKey, entry.i);
        }
        
        let baseSizeCategory = 'normal';
        if (cityCount < 25) baseSizeCategory = 'small';
        else if (cityCount >= 50) baseSizeCategory = 'large';
        
        const dValue = entry.d || 'empty';
        
        return {
            language_name: entry.name,
            index: entry.i,
            continent: entry.continent,
            source_file: entry.sourceFile,
            city_count: cityCount,
            base_size_category: baseSizeCategory,
            duplicate_cities: duplicateCities,
            is_placeholder: placeholder,
            has_primus: hasPrimus,
            has_dedicated_suffix: hasDedicated,
            suspicious_name: suspicious,
            has_trailing_space: hasTrailingSpace,
            has_encoding_issue: hasEncodingIssue,
            index_collision: indexCollision,
            name_collision: nameCollision,
            d_value: dValue,
            index_range: getIndexRange(entry.i),
            quality_score: calculateQualityScore({
                cityCount, duplicateCities, placeholder, suspicious,
                hasTrailingSpace, hasEncodingIssue, hasPrimus, hasDedicated,
                indexCollision, nameCollision, languageName: entry.name
            })
        };
    });
    
    const qualityIssues = metrics.filter(m => 
        m.quality_score < 100 || m.is_placeholder || m.has_primus || 
        m.suspicious_name || m.index_collision || m.name_collision
    );
    
    const indexCollisions = metrics.filter(m => m.index_collision).length;
    
    console.log(`Entries with quality issues: ${qualityIssues.length}`);
    console.log(`Overall quality: ${((1 - qualityIssues.length / metrics.length) * 100).toFixed(1)}%`);
    console.log(`Index collisions (intentional): ${indexCollisions}\n`);
    
    return metrics;
}

function generateCSV(metrics) {
    const headers = [
        'language_name',
        'index',
        'continent',
        'source_file',
        'city_count',
        'base_size_category',
        'duplicate_cities',
        'is_placeholder',
        'has_primus',
        'has_dedicated_suffix',
        'suspicious_name',
        'has_trailing_space',
        'has_encoding_issue',
        'index_collision',
        'name_collision',
        'd_value',
        'index_range',
        'quality_score'
    ];
    
    const csvRows = [headers.join(',')];
    
    for (const m of metrics) {
        const row = headers.map(h => {
            const value = m[h];
            if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
            if (value === null || value === undefined) return '';
            return String(value).includes(',') ? `"${String(value).replace(/"/g, '""')}"` : value;
        });
        csvRows.push(row.join(','));
    }
    
    return csvRows.join('\n');
}

function generateSummaryReport(metrics) {
    const report = [];
    
    report.push('=== CONSOLIDATED LANGUAGE QUALITY SUMMARY REPORT ===\n');
    
    const byContinent = {};
    const bySizeCategory = {};
    const byQualityScore = { excellent: 0, good: 0, fair: 0, poor: 0, critical: 0 };
    
    for (const m of metrics) {
        byContinent[m.continent] = (byContinent[m.continent] || 0) + 1;
        bySizeCategory[m.base_size_category] = (bySizeCategory[m.base_size_category] || 0) + 1;
        
        if (m.quality_score >= 95) byQualityScore.excellent++;
        else if (m.quality_score >= 80) byQualityScore.good++;
        else if (m.quality_score >= 60) byQualityScore.fair++;
        else if (m.quality_score >= 40) byQualityScore.poor++;
        else byQualityScore.critical++;
    }
    
    report.push('BY CONTINENT:');
    for (const [continent, count] of Object.entries(byContinent)) {
        report.push(`  ${continent}: ${count}`);
    }
    report.push('');
    
    report.push('BY BASE SIZE CATEGORY:');
    for (const [category, count] of Object.entries(bySizeCategory)) {
        report.push(`  ${category}: ${count}`);
    }
    report.push('');
    
    report.push('BY QUALITY SCORE:');
    report.push(`  Excellent (95+): ${byQualityScore.excellent}`);
    report.push(`  Good (80-94): ${byQualityScore.good}`);
    report.push(`  Fair (60-79): ${byQualityScore.fair}`);
    report.push(`  Poor (40-59): ${byQualityScore.poor}`);
    report.push(`  Critical (<40): ${byQualityScore.critical}`);
    report.push('');
    
    const placeholderCount = metrics.filter(m => m.is_placeholder).length;
    const primusCount = metrics.filter(m => m.has_primus).length;
    const suspiciousCount = metrics.filter(m => m.suspicious_name).length;
    const collisionCount = metrics.filter(m => m.index_collision || m.name_collision).length;
    
    report.push('CRITICAL ISSUES:');
    report.push(`  Placeholders: ${placeholderCount}`);
    report.push(`  Primus entries: ${primusCount}`);
    report.push(`  Suspicious names: ${suspiciousCount}`);
    report.push(`  Index/name collisions: ${collisionCount}`);
    report.push('');
    
    return report.join('\n');
}

function main() {
    const startTime = Date.now();
    
    const metrics = runAllChecks();
    const csv = generateCSV(metrics);
    const summaryReport = generateSummaryReport(metrics);
    
    if (!fs.existsSync(REPORTS_DIR)) {
        fs.mkdirSync(REPORTS_DIR, { recursive: true });
    }
    
    const csvPath = path.join(REPORTS_DIR, 'consolidated-quality-metrics.csv');
    fs.writeFileSync(csvPath, csv, 'utf8');
    console.log(`CSV written to: ${csvPath}`);
    
    const summaryPath = path.join(REPORTS_DIR, 'consolidated-quality-summary.txt');
    fs.writeFileSync(summaryPath, summaryReport, 'utf8');
    console.log(`Summary written to: ${summaryPath}`);
    
    const elapsed = Date.now() - startTime;
    console.log(`\nCompleted in ${elapsed}ms`);
    
    console.log('\n' + summaryReport);
}

if (require.main === module) {
    try {
        main();
    } catch (err) {
        console.error('Error:', err && err.message ? err.message : err);
        process.exitCode = 1;
    }
}

module.exports = { runAllChecks, generateCSV, generateSummaryReport };
