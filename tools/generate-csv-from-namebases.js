/**
 * CSV Generator from Namebase Files
 * 
 * Reads all continent namebase files and generates a comprehensive CSV
 * with quality metrics for each language.
 */

const fs = require('fs');
const path = require('path');

const CONTINENT_FILES = [
    { file: 'namebases-africa.js', continent: 'Africa' },
    { file: 'namebases-asia.js', continent: 'Asia' },
    { file: 'namebases-europe.js', continent: 'Europe' },
    { file: 'namebases-northAmerica.js', continent: 'NorthAmerica' },
    { file: 'namebases-southAmerica.js', continent: 'SouthAmerica' },
    { file: 'namebases-oceania.js', continent: 'Oceania' },
    { file: 'namebases-fantasy.js', continent: 'Fantasy' },
];

const MODULES_DIR = path.join(__dirname, '..', 'modules');
const CSV_PATH = path.join(__dirname, '..', 'docs', 'reports', 'language-metrics', 'language-quality-metrics.csv');

// CSV columns
const COLUMNS = [
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

// Encoding issue patterns
const ENCODING_PATTERNS = /[ÃâÃ§Ã©Ã¨ÃªÃ Ã¡Ã¢Ã³Ã´Ã±Ã¼Ã¶Â]/;

// Suspicious name patterns
const SUSPICIOUS_PATTERNS = /\s+(language|dialect|lect|family|macro)$/i;

// Placeholder patterns
const PLACEHOLDER_PATTERNS = /New Place|_unq/i;

function countCities(bString) {
    if (!bString) return 0;
    return bString.split(',').filter(c => c.trim()).length;
}

function getBaseSizeCategory(cityCount) {
    if (cityCount >= 100) return 'large';
    if (cityCount >= 50) return 'medium';
    if (cityCount >= 20) return 'normal';
    return 'small';
}

function calculateIndexRange(index) {
    const idx = parseInt(index, 10);
    if (idx < 1000) return '1-999';
    if (idx < 10000) return '1000-9999';
    if (idx < 20000) return '10000-19999';
    return '20000+';
}

function calculateQualityScore(issues) {
    let score = 100;
    
    if (issues.cityCount < 3) score -= 30;
    else if (issues.cityCount < 5) score -= 15;
    
    if (issues.duplicateCities) score -= 20;
    if (issues.isPlaceholder) score -= 40;
    if (issues.hasEncoding) score -= 30;
    if (issues.suspiciousName) score -= 40;
    if (issues.trailingSpace) score -= 10;
    
    return Math.max(0, score);
}

function parseEntryBlock(block) {
    const nameMatch = block.match(/"name":\s*"([^"]+)"/);
    const iMatch = block.match(/"i":\s*(\d+)/);
    const bMatch = block.match(/"b":\s*"([^"]*)"/);
    const dMatch = block.match(/"d":\s*"([^"]*)"/);
    const minMatch = block.match(/"min":\s*(\d+)/);
    const maxMatch = block.match(/"max":\s*(\d+)/);
    
    return {
        name: nameMatch ? nameMatch[1] : '',
        i: iMatch ? parseInt(iMatch[1], 10) : 0,
        b: bMatch ? bMatch[1] : '',
        d: dMatch ? dMatch[1] : '',
        min: minMatch ? parseInt(minMatch[1], 10) : 4,
        max: maxMatch ? parseInt(maxMatch[1], 10) : 11
    };
}

function generateCSV() {
    console.log('Generating CSV from namebase files...\n');
    
    const rows = [COLUMNS];
    const entriesByIndex = {};
    
    for (const { file, continent } of CONTINENT_FILES) {
        const filePath = path.join(MODULES_DIR, file);
        if (!fs.existsSync(filePath)) {
            console.log(`⚠ Skipping ${file} (not found)`);
            continue;
        }
        
        console.log(`Processing ${file}...`);
        const content = fs.readFileSync(filePath, 'utf8');
        const blocks = content.match(/\{[\s\S]*?\}/g) || [];
        
        for (const block of blocks) {
            const entry = parseEntryBlock(block);
            if (!entry.name || entry.i === null) continue;
            
            // Skip system placeholder entries (setBases aux)
            if (entry.name.includes('(setBases aux)')) continue;
            
            // Track for collision detection
            if (entriesByIndex[entry.i]) {
                entriesByIndex[entry.i].push(entry.name);
            } else {
                entriesByIndex[entry.i] = [entry.name];
            }
            
            // Calculate metrics
            const cityCount = countCities(entry.b);
            const issues = {
                cityCount,
                duplicateCities: false,
                isPlaceholder: PLACEHOLDER_PATTERNS.test(entry.b),
                hasEncoding: ENCODING_PATTERNS.test(entry.name),
                suspiciousName: SUSPICIOUS_PATTERNS.test(entry.name),
                trailingSpace: /\s$/.test(entry.name)
            };
            
            const qualityScore = calculateQualityScore(issues);
            const indexRange = calculateIndexRange(entry.i);
            
            // Check for name collision (same index, different name)
            const nameCollision = entriesByIndex[entry.i].length > 1 && 
                !entriesByIndex[entry.i].includes(entry.name);
            
            rows.push([
                entry.name,
                entry.i,
                continent,
                file,
                cityCount,
                getBaseSizeCategory(cityCount),
                'FALSE',
                issues.isPlaceholder ? 'TRUE' : 'FALSE',
                'FALSE',
                'FALSE',
                issues.suspiciousName ? 'TRUE' : 'FALSE',
                issues.trailingSpace ? 'TRUE' : 'FALSE',
                issues.hasEncoding ? 'TRUE' : 'FALSE',
                'FALSE',
                nameCollision ? 'TRUE' : 'FALSE',
                entry.d || 'empty',
                indexRange,
                qualityScore
            ]);
        }
    }
    
    // Write CSV
    const csvContent = rows.map(row => 
        row.map(field => {
            const str = String(field);
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return '"' + str.replace(/"/g, '""') + '"';
            }
            return str;
        }).join(',')
    ).join('\n');
    
    fs.writeFileSync(CSV_PATH, csvContent, 'utf8');
    
    console.log(`\n✓ CSV generated: ${CSV_PATH}`);
    console.log(`  Total entries: ${rows.length - 1}`);
    
    // Print summary
    const summary = {
        excellent: 0,
        good: 0,
        acceptable: 0,
        poor: 0,
    };
    
    for (let i = 1; i < rows.length; i++) {
        const score = parseInt(rows[i][17], 10);
        if (score >= 95) summary.excellent++;
        else if (score >= 85) summary.good++;
        else if (score >= 70) summary.acceptable++;
        else summary.poor++;
    }
    
    console.log(`\nQuality Distribution:`);
    console.log(`  Excellent (95+): ${summary.excellent}`);
    console.log(`  Good (85-94): ${summary.good}`);
    console.log(`  Acceptable (70-84): ${summary.acceptable}`);
    console.log(`  Poor (<70): ${summary.poor}`);
}

if (require.main === module) {
    try {
        generateCSV();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

module.exports = { generateCSV };
