"use strict";

/**
 * Language/Namebase Quality Metrics Tracker
 * 
 * Generates a comprehensive CSV tracking file with quality and implementation metrics
 * for every language/namebase in the Fantasy Map Generator.
 * 
 * Usage:
 *   node tools/tracking/language-quality-tracker.js
 * 
 * Output:
 *   reports/language-quality-metrics.csv
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const MODULES_DIR = path.join(__dirname, '..', '..', 'modules');

const NAMEBASE_FILES = [
  'namebases-africa.js',
  'namebases-asia.js',
  'namebases-europe.js',
  'namebases-northAmerica.js',
  'namebases-southAmerica.js',
  'namebases-oceania.js',
  'namebases-fantasy.js',
  'namebases-creole.js'
];

const CONTINENT_MAP = {
  'namebases-africa.js': 'Africa',
  'namebases-asia.js': 'Asia',
  'namebases-europe.js': 'Europe',
  'namebases-northAmerica.js': 'NorthAmerica',
  'namebases-southAmerica.js': 'SouthAmerica',
  'namebases-oceania.js': 'Oceania',
  'namebases-fantasy.js': 'Fantasy',
  'namebases-creole.js': 'Creole'
};

const SUSPICIOUS_NAMES = new Set([
  'Riang', 'BPh', 'Big Flowery', 'Français Tirailleur', 'Tày Bôi Pidgin French',
  'Bole Chadic language', 'BiuΓÇôMandara', 'Cavineña', 'Yuracaré', 'Fulniô', 'Nivaclé',
  'Bjarmian S├ími', 'Borgarm├Ñlet', 'Baur├⌐', 'Cof├ín', 'Fran├ºais', 'Central Erzya',
  'Be', 'E'
]);

const PATTERN_DEDICATED = /\(dedicated\)/;
const PATTERN_NEW_PLACE = /New Place/;
const PATTERN_UNQ = /_unq/;
const PATTERN_PRIMUS = /Primus/;
const PATTERN_ENCODING = /[^\x20-\x7E\u00A0-\u00FF]/;
const PATTERN_TRAILING_SPACE = /\s$/;

function parseEntryBlock(block) {
  const nameMatch = block.match(/"name":\s*"([^"]+)"/);
  const iMatch = block.match(/"i":\s*(\d+)/);
  const bMatch = block.match(/"b":\s*"([^"]*)"/);
  const dMatch = block.match(/"d":\s*"([^"]*)"/);
  
  return {
    name: nameMatch ? nameMatch[1] : null,
    i: iMatch ? parseInt(iMatch[1], 10) : null,
    b: bMatch ? bMatch[1] : '',
    d: dMatch ? dMatch[1] : ''
  };
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

function getIndexRange(i) {
  if (i < 1000) return '1-999';
  if (i < 10000) return '1000-9999';
  if (i < 20000) return '10000-19999';
  return '20000+';
}

function loadNamebaseData(file) {
  const fullPath = path.join(MODULES_DIR, file);
  if (!fs.existsSync(fullPath)) return [];
  
  const content = fs.readFileSync(fullPath, 'utf8');
  const continent = CONTINENT_MAP[file];
  
  const entries = [];
  const blocks = content.match(/\{[\s\S]*?\}/g) || [];
  
  for (const block of blocks) {
    const entry = parseEntryBlock(block);
    if (entry.name && entry.i !== null) {
      entries.push({
        ...entry,
        _continent: continent,
        _sourceFile: file,
        _block: block
      });
    }
  }
  
  return entries;
}

function runAllChecks() {
  console.log('=== Language Quality Metrics Tracker ===\n');
  
  const allEntries = [];
  const indexMap = new Map();
  const nameMap = new Map();
  
  for (const file of NAMEBASE_FILES) {
    const entries = loadNamebaseData(file);
    allEntries.push(...entries);
  }
  
  console.log(`Total entries loaded: ${allEntries.length}\n`);
  
  const metrics = allEntries.map(entry => {
    const cityCount = countCities(entry.b);
    const duplicateCities = hasDuplicateCities(entry.b);
    const placeholder = isPlaceholder(entry.b, entry.name);
    const suspicious = isSuspiciousName(entry.name);
    const hasTrailingSpace = PATTERN_TRAILING_SPACE.test(entry.name);
    const hasEncodingIssue = PATTERN_ENCODING.test(entry.name);
    const hasPrimus = PATTERN_PRIMUS.test(entry.b);
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
    if (cityCount < 3) baseSizeCategory = 'very_small';
    else if (cityCount < 5) baseSizeCategory = 'small';
    else if (cityCount > 15) baseSizeCategory = 'large';
    
    const dValue = entry.d || 'empty';
    
    return {
      language_name: entry.name,
      index: entry.i,
      continent: entry._continent,
      source_file: entry._sourceFile,
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
        hasTrailingSpace, hasEncodingIssue, hasPrimus, hasDedicated
      })
    };
  });
  
  const qualityIssues = metrics.filter(m => 
    m.quality_score < 100 || m.is_placeholder || m.has_primus || 
    m.suspicious_name || m.index_collision || m.name_collision
  );
  
  console.log(`Entries with quality issues: ${qualityIssues.length}`);
  console.log(`Overall quality: ${((1 - qualityIssues.length / metrics.length) * 100).toFixed(1)}%\n`);
  
  return metrics;
}

function calculateQualityScore({
  cityCount, duplicateCities, placeholder, suspicious,
  hasTrailingSpace, hasEncodingIssue, hasPrimus, hasDedicated
}) {
  let score = 100;
  
  if (cityCount < 3) score -= 30;
  else if (cityCount < 5) score -= 15;
  
  if (duplicateCities) score -= 20;
  if (placeholder) score -= 40;
  if (hasPrimus) score -= 50;
  if (suspicious) score -= 40;
  if (hasTrailingSpace) score -= 10;
  if (hasEncodingIssue) score -= 30;
  if (hasDedicated) score -= 20;
  
  return Math.max(0, score);
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
  
  report.push('=== LANGUAGE QUALITY SUMMARY REPORT ===\n');
  
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
  
  const reportsDir = path.join(__dirname, '..', '..', 'docs', 'reports', 'language-metrics');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  const csvPath = path.join(reportsDir, 'language-quality-metrics.csv');
  fs.writeFileSync(csvPath, csv, 'utf8');
  console.log(`CSV written to: ${csvPath}`);
  
  const summaryPath = path.join(reportsDir, 'language-quality-summary.txt');
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
