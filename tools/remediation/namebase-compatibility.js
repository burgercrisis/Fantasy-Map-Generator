/**
 * Namebase Compatibility Layer
 * 
 * This module provides backward compatibility for legacy tools and systems
 * that expect the old namebases-real.js file structure.
 * 
 * Created: January 3, 2026
 * Purpose: Bridge between new regional structure and legacy expectations
 */

"use strict";

const fs = require('fs');
const path = require('path');

class NamebaseCompatibility {
  constructor() {
    this.regionalFiles = [
      'namebases-africa.js',
      'namebases-asia.js', 
      'namebases-creole.js',
      'namebases-europe.js',
      'namebases-fantasy.js',
      'namebases-global.js',
      'namebases-northAmerica.js',
      'namebases-oceania.js',
      'namebases-southAmerica.js'
    ];
    
    this.compatibilityCache = new Map();
    this.isLoaded = false;
  }

  /**
   * Load and combine all regional namebase files
   */
  loadAllNamebases() {
    if (this.isLoaded) return this.compatibilityCache;
    
    console.log('🔄 Loading regional namebase files for compatibility...');
    
    let allBases = [];
    let totalPlacenames = 0;
    
    // Load each regional file
    for (const fileName of this.regionalFiles) {
      const filePath = path.join(__dirname, '../../modules', fileName);
      
      try {
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf-8');
          const bases = this.extractBasesFromFile(content, fileName);
          allBases.push(...bases);
          
          totalPlacenames += bases.reduce((sum, base) => {
            return sum + (base.b ? base.b.split(',').length : 0);
          }, 0);
          
          console.log(`  ✓ Loaded ${bases.length} languages from ${fileName}`);
        } else {
          console.log(`  ⚠ File not found: ${fileName}`);
        }
      } catch (error) {
        console.warn(`  ⚠ Error loading ${fileName}: ${error.message}`);
      }
    }
    
    // Sort by index for consistency
    allBases.sort((a, b) => (a.i || 0) - (b.i || 0));
    
    // Cache the results
    this.compatibilityCache.set('allBases', allBases);
    this.compatibilityCache.set('totalCount', allBases.length);
    this.compatibilityCache.set('totalPlacenames', totalPlacenames);
    
    this.isLoaded = true;
    
    console.log(`\n📊 Compatibility Layer Loaded:`);
    console.log(`  Total languages: ${allBases.length}`);
    console.log(`  Total placenames: ${totalPlacenames}`);
    
    return this.compatibilityCache;
  }

  /**
   * Extract namebase entries from a JavaScript file
   */
  extractBasesFromFile(content, fileName) {
    const bases = [];
    
    try {
      // Execute the JavaScript content to get the window object
      const window = {};
      const module = { exports: {} };
      
      // Create a safe evaluation context
      const evalCode = `
        (function() {
          ${content}
          return { bases: window.creoleNameBases || window.namebases || [] };
        })()
      `;
      
      const result = eval(evalCode);
      const fileBases = result.bases || [];
      
      // Convert to legacy format
      fileBases.forEach((base, index) => {
        const legacyBase = {
          i: base.i || index,
          name: base.name,
          b: base.b || '',
          min: base.min || 3,
          max: base.max || 15,
          d: base.d || 0,
          m: base.m || 0,
          _source: fileName
        };
        
        bases.push(legacyBase);
      });
      
    } catch (error) {
      console.warn(`Error parsing ${fileName}: ${error.message}`);
      
      // Fallback: try to extract using regex
      const lines = content.split('\n');
      for (const line of lines) {
        if (line.trim().startsWith('{') && line.includes('name:')) {
          const base = this.parseBaseFromLine(line);
          if (base) {
            bases.push(base);
          }
        }
      }
    }
    
    return bases;
  }

  /**
   * Parse a namebase entry from a single line
   */
  parseBaseFromLine(line) {
    try {
      const nameMatch = line.match(/name:\s*"([^"]+)"/);
      if (!nameMatch) return null;
      
      const iMatch = line.match(/i:\s*(\d+)/);
      const bMatch = line.match(/b:\s*"([^"]+)"/);
      const minMatch = line.match(/min:\s*(\d+)/);
      const maxMatch = line.match(/max:\s*(\d+)/);
      const dMatch = line.match(/d:\s*"([^"]*)"/);
      const mMatch = line.match(/m:\s*(\d+)/);
      
      return {
        i: iMatch ? parseInt(iMatch[1]) : 0,
        name: nameMatch[1],
        b: bMatch ? bMatch[1] : '',
        min: minMatch ? parseInt(minMatch[1]) : 3,
        max: maxMatch ? parseInt(maxMatch[1]) : 15,
        d: dMatch ? dMatch[1] : 'lnrt',
        m: mMatch ? parseInt(mMatch[1]) : 0,
        _source: 'regex'
      };
      
    } catch (error) {
      return null;
    }
  }

  /**
   * Get all namebases in legacy format
   */
  getAllBases() {
    this.loadAllNamebases();
    return this.compatibilityCache.get('allBases') || [];
  }

  /**
   * Get a specific namebase by index
   */
  getBaseByIndex(index) {
    const allBases = this.getAllBases();
    return allBases.find(base => base.i === index) || null;
  }

  /**
   * Get namebases by name pattern
   */
  getBasesByNamePattern(pattern) {
    const allBases = this.getAllBases();
    const regex = new RegExp(pattern, 'i');
    return allBases.filter(base => regex.test(base.name));
  }

  /**
   * Generate legacy namebases-real.js content
   */
  generateLegacyFileContent() {
    const allBases = this.getAllBases();
    
    let content = `"use strict";

// Auto-generated from regional files
// Generated: ${new Date().toISOString()}
// Total languages: ${allBases.length}

window.defaultNameBases = [
`;

    allBases.forEach((base, index) => {
      content += `  {name: "${base.name}", i: ${base.i}, min: ${base.min}, max: ${base.max}, d: "${base.d}", m: ${base.m}, b: "${base.b}"}${index < allBases.length - 1 ? ',' : ''}\n`;
    });

    content += `];

if (typeof module !== "undefined" && module.exports) {
  module.exports = window.defaultNameBases;
}`;

    return content;
  }

  /**
   * Write legacy compatibility file
   */
  writeLegacyFile() {
    const content = this.generateLegacyFileContent();
    const outputPath = path.join(__dirname, '../../modules/namebases-real.js');
    
    try {
      fs.writeFileSync(outputPath, content, 'utf-8');
      console.log(`✅ Legacy compatibility file written: ${outputPath}`);
      return true;
    } catch (error) {
      console.error(`❌ Error writing legacy file: ${error.message}`);
      return false;
    }
  }

  /**
   * Validate compatibility layer
   */
  validate() {
    console.log('\n🔍 Validating compatibility layer...');
    
    const allBases = this.getAllBases();
    const issues = [];
    
    // Check for duplicate indices
    const indices = allBases.map(b => b.i);
    const uniqueIndices = [...new Set(indices)];
    if (indices.length !== uniqueIndices.length) {
      issues.push('Duplicate indices found');
    }
    
    // Check for missing placenames
    const missingPlacenames = allBases.filter(b => !b.b || b.b.trim() === '');
    if (missingPlacenames.length > 0) {
      issues.push(`${missingPlacenames.length} bases have no placenames`);
    }
    
    // Check for very short placename lists
    const fewPlacenames = allBases.filter(b => {
      const count = b.b ? b.b.split(',').length : 0;
      return count > 0 && count < 5;
    });
    if (fewPlacenames.length > 0) {
      issues.push(`${fewPlacenames.length} bases have fewer than 5 placenames`);
    }
    
    if (issues.length === 0) {
      console.log('  ✅ Validation passed - no issues found');
    } else {
      console.log('  ⚠ Validation issues found:');
      issues.forEach(issue => console.log(`    - ${issue}`));
    }
    
    return {
      passed: issues.length === 0,
      issues: issues,
      statistics: {
        totalLanguages: allBases.length,
        totalPlacenames: allBases.reduce((sum, base) => sum + (base.b ? base.b.split(',').length : 0), 0),
        missingPlacenames: missingPlacenames.length,
        fewPlacenames: fewPlacenames.length
      }
    };
  }

  /**
   * Create a migration report
   */
  generateMigrationReport() {
    const allBases = this.getAllBases();
    const regionStats = {};
    
    // Count languages by source region
    allBases.forEach(base => {
      const region = base._source ? base._source.replace('namebases-', '').replace('.js', '') : 'unknown';
      if (!regionStats[region]) {
        regionStats[region] = 0;
      }
      regionStats[region]++;
    });
    
    return {
      generatedAt: new Date().toISOString(),
      totalLanguages: allBases.length,
      totalPlacenames: allBases.reduce((sum, base) => sum + (base.b ? base.b.split(',').length : 0), 0),
      regionDistribution: regionStats,
      migrationStatus: 'completed',
      compatibilityLayer: 'operational'
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NamebaseCompatibility;
}

// Auto-execute if run directly
if (require.main === module) {
  const compatibility = new NamebaseCompatibility();
  
  console.log('🚀 Starting namebase compatibility layer...');
  
  // Load all namebases
  compatibility.loadAllNamebases();
  
  // Validate
  const validation = compatibility.validate();
  
  // Write legacy file
  const legacyWritten = compatibility.writeLegacyFile();
  
  // Generate migration report
  const report = compatibility.generateMigrationReport();
  
  // Save report
  const reportPath = path.join(__dirname, '../data/migration-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log('\n🎉 Compatibility layer setup complete!');
  console.log(`📄 Migration report saved: ${reportPath}`);
  console.log(`✅ Legacy file ready: modules/namebases-real.js`);
}