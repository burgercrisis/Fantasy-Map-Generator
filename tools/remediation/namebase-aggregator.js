/**
 * Namebase Aggregator System
 * 
 * This module combines all regional namebase files into a single structure
 * that maintains compatibility with the existing language mixer system.
 * 
 * Created: January 3, 2026
 * Purpose: Restore language mixer functionality after file structure migration
 */

"use strict";

const fs = require('fs');
const path = require('path');

class NamebaseAggregator {
  constructor() {
    this.regionalFiles = [
      'namebases-africa.js',
      'namebases-asia.js',
      'namebases-europe.js',
      'namebases-fantasy.js',
      'namebases-northAmerica.js',
      'namebases-oceania.js',
      'namebases-southAmerica.js'
    ];

    this.continentArrays = {
      'namebases-africa.js': 'AfricaNameBases',
      'namebases-asia.js': 'AsiaNameBases',
      'namebases-europe.js': 'EuropeNameBases',
      'namebases-fantasy.js': 'FantasyNameBases',
      'namebases-northAmerica.js': 'NorthAmericaNameBases',
      'namebases-oceania.js': 'OceaniaNameBases',
      'namebases-southAmerica.js': 'SouthAmericaNameBases'
    };

    this.aggregatedBases = [];
    this.regionMappings = {};
    this.totalLanguages = 0;
    this.totalPlacenames = 0;
  }

  /**
   * Load and parse a regional namebase file
   */
  loadRegionalFile(fileName) {
    const filePath = path.join(__dirname, '../../modules', fileName);

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const vm = require('vm');
      const context = { window: {} };
      vm.runInContext(content, context, { filename: fileName });

      const arrayName = this.continentArrays[fileName];
      const entries = context.window[arrayName] || [];
      const region = fileName.replace('namebases-', '').replace('.js', '');

      console.log(`Loading ${fileName} (${region})...`);

      const entriesWithRegion = entries.map((entry, idx) => ({
        name: entry.name,
        index: entry.i,
        minLength: entry.min,
        maxLength: entry.max,
        d: entry.d,
        m: entry.m,
        placenames: entry.b ? entry.b.split(',').map(s => s.trim()).filter(s => s) : [],
        region: region,
        lineNumber: idx + 1,
        raw: JSON.stringify(entry)
      }));

      this.regionMappings[region] = {
        file: fileName,
        arrayName: arrayName,
        entries: entriesWithRegion.length,
        placenames: entriesWithRegion.reduce((sum, entry) => sum + entry.placenames.length, 0)
      };

      console.log(`  ✓ Loaded ${entriesWithRegion.length} languages, ${this.regionMappings[region].placenames} placenames`);

      return entriesWithRegion;

    } catch (error) {
      console.warn(`  ⚠ Failed to load ${fileName}: ${error.message}`);
      return [];
    }
  }

  /**
   * Parse namebase entries from JavaScript file content
   */
  parseNamebaseEntries(content) {
    return [];
  }

  parseEntry(line, lineNumber) {
    return null;
  }
      }
    }
    
    return entries;
  }

  /**
   * Parse a single namebase entry
   */
  parseEntry(line, lineNumber) {
    try {
      // Extract name
      const nameMatch = line.match(/name:\s*"([^"]+)"/);
      if (!nameMatch) return null;
      
      const entry = {
        name: nameMatch[1],
        lineNumber: lineNumber,
        raw: line
      };
      
      // Extract index
      const indexMatch = line.match(/i:\s*(\d+)/);
      if (indexMatch) {
        entry.index = parseInt(indexMatch[1]);
      }
      
      // Extract placenames
      const placenameMatch = line.match(/b:\s*"([^"]+)"/);
      if (placenameMatch) {
        entry.placenames = placenameMatch[1].split(',').map(s => s.trim()).filter(s => s);
      }
      
      // Extract min/max length
      const minMatch = line.match(/min:\s*(\d+)/);
      const maxMatch = line.match(/max:\s*(\d+)/);
      if (minMatch) entry.minLength = parseInt(minMatch[1]);
      if (maxMatch) entry.maxLength = parseInt(maxMatch[1]);
      
      // Extract other properties
      const dMatch = line.match(/d:\s*(\d+)/);
      const mMatch = line.match(/m:\s*(\d+)/);
      if (dMatch) entry.d = parseInt(dMatch[1]);
      if (mMatch) entry.m = parseInt(mMatch[1]);
      
      return entry;
      
    } catch (error) {
      console.warn(`Error parsing entry at line ${lineNumber}: ${error.message}`);
      return null;
    }
  }

  /**
   * Aggregate all regional files
   */
  aggregate() {
    console.log('🔄 Starting namebase aggregation...\n');
    
    this.aggregatedBases = [];
    this.totalLanguages = 0;
    this.totalPlacenames = 0;
    
    // Load each regional file
    for (const fileName of this.regionalFiles) {
      const entries = this.loadRegionalFile(fileName);
      this.aggregatedBases.push(...entries);
      this.totalLanguages += entries.length;
      this.totalPlacenames += entries.reduce((sum, entry) => sum + (entry.placenames ? entry.placenames.length : 0), 0);
    }
    
    // Sort by index for consistency
    this.aggregatedBases.sort((a, b) => (a.index || 0) - (b.index || 0));
    
    console.log('\n📊 Aggregation Summary:');
    console.log(`  Total languages: ${this.totalLanguages}`);
    console.log(`  Total placenames: ${this.totalPlacenames}`);
    console.log(`  Average placenames per language: ${(this.totalPlacenames / this.totalLanguages).toFixed(1)}`);
    
    return this.aggregatedBases;
  }

  /**
   * Generate legacy-compatible format for language mixer
   */
  generateLegacyFormat() {
    console.log('\n🔧 Generating legacy-compatible format...');
    
    const legacyFormat = {
      totalLanguages: this.totalLanguages,
      totalPlacenames: this.totalPlacenames,
      regions: this.regionMappings,
      bases: []
    };
    
    // Convert to legacy format with i and b properties
    this.aggregatedBases.forEach((entry, index) => {
      const legacyEntry = {
        i: entry.index || index,
        name: entry.name,
        b: entry.placenames ? entry.placenames.join(',') : ''
      };
      
      // Add optional properties if they exist
      if (entry.minLength !== undefined) legacyEntry.min = entry.minLength;
      if (entry.maxLength !== undefined) legacyEntry.max = entry.maxLength;
      if (entry.d !== undefined) legacyEntry.d = entry.d;
      if (entry.m !== undefined) legacyEntry.m = entry.m;
      
      legacyFormat.bases.push(legacyEntry);
    });
    
    console.log(`  ✓ Generated ${legacyFormat.bases.length} legacy entries`);
    
    return legacyFormat;
  }

  /**
   * Export aggregated data in multiple formats
   */
  exportFormats() {
    const legacyFormat = this.generateLegacyFormat();
    
    // Export as JavaScript module for browser compatibility
    const jsExport = `
// Auto-generated namebase aggregator
// Generated: ${new Date().toISOString()}
// Total languages: ${this.totalLanguages}
// Total placenames: ${this.totalPlacenames}

window.namebaseAggregator = ${JSON.stringify(legacyFormat, null, 2)};

// Legacy compatibility
window.defaultNameBases = window.namebaseAggregator.bases.map(base => ({
  i: base.i,
  name: base.name,
  b: base.b,
  min: base.min || 3,
  max: base.max || 15,
  d: base.d || 0,
  m: base.m || 0
}));

console.log('Namebase aggregator loaded:', {
  totalLanguages: ${this.totalLanguages},
  totalPlacenames: ${this.totalPlacenames},
  regions: ${Object.keys(this.regionMappings).length}
});
`;
    
    return {
      legacy: legacyFormat,
      javascript: jsExport,
      statistics: {
        totalLanguages: this.totalLanguages,
        totalPlacenames: this.totalPlacenames,
        regions: this.regionMappings,
        aggregationDate: new Date().toISOString()
      }
    };
  }

  /**
   * Validate aggregated data
   */
  validate() {
    console.log('\n🔍 Validating aggregated data...');
    
    const issues = [];
    
    // Check for missing indices
    const indices = this.aggregatedBases.map(b => b.index).filter(i => i !== undefined);
    const uniqueIndices = [...new Set(indices)];
    if (indices.length !== uniqueIndices.length) {
      issues.push('Duplicate indices found');
    }
    
    // Check for missing placenames
    const missingPlacenames = this.aggregatedBases.filter(b => !b.placenames || b.placenames.length === 0);
    if (missingPlacenames.length > 0) {
      issues.push(`${missingPlacenames.length} bases have no placenames`);
    }
    
    // Check for very short placename lists
    const fewPlacenames = this.aggregatedBases.filter(b => b.placenames && b.placenames.length < 5);
    if (fewPlacenames.length > 0) {
      issues.push(`${fewPlacenames.length} bases have fewer than 5 placenames`);
    }
    
    if (issues.length === 0) {
      console.log('  ✓ Validation passed - no issues found');
    } else {
      console.log('  ⚠ Validation issues found:');
      issues.forEach(issue => console.log(`    - ${issue}`));
    }
    
    return {
      passed: issues.length === 0,
      issues: issues,
      statistics: {
        totalLanguages: this.totalLanguages,
        totalPlacenames: this.totalPlacenames,
        missingPlacenames: missingPlacenames.length,
        fewPlacenames: fewPlacenames.length
      }
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NamebaseAggregator;
}

// Auto-execute if run directly
if (require.main === module) {
  const aggregator = new NamebaseAggregator();
  aggregator.aggregate();
  const exported = aggregator.exportFormats();
  const validation = aggregator.validate();
  
  console.log('\n💾 Exporting data...');
  
  // Write aggregated data to files
  const outputDir = path.join(__dirname, '../data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(outputDir, 'namebase-aggregated.json'),
    JSON.stringify(exported.legacy, null, 2)
  );
  
  fs.writeFileSync(
    path.join(outputDir, 'namebase-aggregated.js'),
    exported.javascript
  );
  
  fs.writeFileSync(
    path.join(outputDir, 'namebase-statistics.json'),
    JSON.stringify(exported.statistics, null, 2)
  );
  
  fs.writeFileSync(
    path.join(outputDir, 'namebase-validation.json'),
    JSON.stringify(validation, null, 2)
  );
  
  console.log('  ✓ Exported to ../data/');
  console.log('\n🎉 Namebase aggregation complete!');
}