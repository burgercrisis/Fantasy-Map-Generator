#!/usr/bin/env node
"use strict";

/**
 * Continent File Index Parser
 * 
 * Task C3: Create simple continent file index parser
 * 
 * This tool parses all continent namebase files and extracts language entries
 * with their indices and names to create a unified mapping.
 */

const fs = require('fs');
const path = require('path');

// Define the continent files to parse
const CONTINENT_FILES = [
  'namebases-africa.js',
  'namebases-asia.js', 
  'namebases-europe.js',
  'namebases-northAmerica.js',
  'namebases-oceania.js',
  'namebases-southAmerica.js'
];

/**
 * Parse a continent file and extract language entries
 */
function parseContinentFile(filename) {
  const filepath = path.join(__dirname, '../modules', filename);
  
  if (!fs.existsSync(filepath)) {
    console.warn(`⚠️  File not found: ${filename}`);
    return { filename, entries: [], error: 'File not found' };
  }

  try {
    const content = fs.readFileSync(filepath, 'utf8');
    
    // Extract the array from the file
    // Look for the pattern: window.ContinentNameBases = [
    const arrayMatch = content.match(/window\.\w+NameBases\s*=\s*\[([\s\S]*?)\];?\s*$/);
    
    if (!arrayMatch) {
      console.warn(`⚠️  Could not find namebase array in ${filename}`);
      return { filename, entries: [], error: 'Array pattern not found' };
    }

    // Extract individual entries by finding objects with "name" and "i" properties
    const entries = [];
    const entryRegex = /\{\s*"name":\s*"([^"]+)",\s*"i":\s*(\d+),/g;
    let match;
    
    while ((match = entryRegex.exec(arrayMatch[1])) !== null) {
      const name = match[1];
      const index = parseInt(match[2], 10);
      
      entries.push({
        name: name,
        index: index
      });
    }

    console.log(`✅ Parsed ${entries.length} entries from ${filename}`);
    return { filename, entries, error: null };

  } catch (error) {
    console.error(`❌ Error parsing ${filename}:`, error.message);
    return { filename, entries: [], error: error.message };
  }
}

/**
 * Validate indices and check for issues
 */
function validateIndices(allEntries) {
  const issues = [];
  const indexMap = new Map();
  
  // Check for duplicates and validate ranges
  allEntries.forEach(entry => {
    const key = `${entry.continent}:${entry.index}`;
    
    if (indexMap.has(entry.index)) {
      issues.push({
        type: 'duplicate_index',
        index: entry.index,
        continents: [indexMap.get(entry.index), entry.continent],
        names: [indexMap.get(`${entry.index}_name`), entry.name]
      });
    }
    
    indexMap.set(entry.index, entry.continent);
    indexMap.set(`${entry.index}_name`, entry.name);
    
    // Basic index validation (should be non-negative integer)
    if (!Number.isInteger(entry.index) || entry.index < 0) {
      issues.push({
        type: 'invalid_index',
        continent: entry.continent,
        name: entry.name,
        index: entry.index
      });
    }
  });
  
  return issues;
}

/**
 * Main parsing function
 */
function parseAllContinentFiles() {
  console.log('🌍 Starting continent file parsing...\n');
  
  const results = [];
  const allEntries = [];
  
  // Parse each continent file
  for (const filename of CONTINENT_FILES) {
    const continent = filename.replace('namebases-', '').replace('.js', '');
    console.log(`\n📂 Processing ${filename}:`);
    
    const result = parseContinentFile(filename);
    
    // Add continent info to entries
    result.entries.forEach(entry => {
      allEntries.push({
        ...entry,
        continent: continent
      });
    });
    
    results.push(result);
  }
  
  // Generate summary statistics
  console.log('\n📊 PARSING SUMMARY');
  console.log('=' .repeat(50));
  
  const continentStats = {};
  let totalEntries = 0;
  
  results.forEach(result => {
    const count = result.entries.length;
    const continent = result.filename.replace('namebases-', '').replace('.js', '');
    continentStats[continent] = count;
    totalEntries += count;
    
    console.log(`${continent.padEnd(15)}: ${count.toString().padStart(4)} entries`);
  });
  
  console.log('-'.repeat(50));
  console.log(`${'TOTAL'.padEnd(15)}: ${totalEntries.toString().padStart(4)} entries`);
  
  // Validate indices
  console.log('\n🔍 VALIDATION RESULTS');
  console.log('=' .repeat(50));
  
  const issues = validateIndices(allEntries);
  
  if (issues.length === 0) {
    console.log('✅ No validation issues found!');
  } else {
    console.log(`⚠️  Found ${issues.length} validation issues:`);
    
    issues.forEach((issue, index) => {
      console.log(`\n${index + 1}. ${issue.type.replace('_', ' ').toUpperCase()}`);
      
      switch (issue.type) {
        case 'duplicate_index':
          console.log(`   Index: ${issue.index}`);
          console.log(`   Continents: ${issue.continents.join(', ')}`);
          console.log(`   Names: ${issue.names.join(' vs ')}`);
          break;
        case 'invalid_index':
          console.log(`   Continent: ${issue.continent}`);
          console.log(`   Name: ${issue.name}`);
          console.log(`   Invalid index: ${issue.index}`);
          break;
      }
    });
  }
  
  // Generate unified mapping output
  console.log('\n🗺️  UNIFIED MAPPING PREVIEW');
  console.log('=' .repeat(50));
  
  // Sort by continent then by index
  const sortedEntries = allEntries.sort((a, b) => {
    if (a.continent !== b.continent) {
      return a.continent.localeCompare(b.continent);
    }
    return a.index - b.index;
  });
  
  // Show first 10 entries as preview
  console.log('First 10 entries:');
  sortedEntries.slice(0, 10).forEach(entry => {
    console.log(`  ${entry.continent.padEnd(15)} | Index ${entry.index.toString().padStart(4)} | ${entry.name}`);
  });
  
  if (sortedEntries.length > 10) {
    console.log(`  ... and ${sortedEntries.length - 10} more entries`);
  }
  
  // Generate JSON output for further processing
  const output = {
    metadata: {
      parsed_at: new Date().toISOString(),
      total_entries: totalEntries,
      continents: Object.keys(continentStats),
      validation_issues: issues.length,
      issues: issues
    },
    continent_statistics: continentStats,
    entries: sortedEntries
  };
  
  const outputPath = path.join(__dirname, 'data/continent-file-mapping.json');
  
  // Ensure data directory exists
  const dataDir = path.dirname(outputPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`\n💾 Full mapping saved to: ${outputPath}`);
  
  // Return summary for further processing
  return {
    success: true,
    total_entries: totalEntries,
    continent_stats: continentStats,
    issues: issues,
    output_file: outputPath
  };
}

// Run the parser
if (require.main === module) {
  const result = parseAllContinentFiles();
  
  console.log('\n🎯 PARSING COMPLETE');
  console.log('=' .repeat(50));
  console.log(`Status: ${result.success ? 'SUCCESS' : 'FAILED'}`);
  console.log(`Total entries: ${result.total_entries}`);
  console.log(`Validation issues: ${result.issues.length}`);
  console.log(`Output file: ${result.output_file}`);
}

module.exports = {
  parseContinentFile,
  parseAllContinentFiles,
  validateIndices
};