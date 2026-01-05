/**
 * Duplicate Placename Fixer
 * 
 * This module removes duplicate placenames within language bases to improve
 * name diversity and quality.
 * 
 * Created: January 3, 2026
 * Purpose: Phase 3 - Remove remaining duplicate issues
 */

"use strict";

const fs = require('fs');
const path = require('path');

class DuplicatePlacenameFixer {
  constructor() {
    this.processedFiles = 0;
    this.totalDuplicatesRemoved = 0;
    this.fileResults = {};
  }

  /**
   * Process a namebase file to remove duplicate placenames
   */
  processNamebaseFile(filePath) {
    console.log(`Processing ${filePath} for duplicates...`);
    
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      const processedLines = [];
      let duplicatesRemoved = 0;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        if (line.includes('b:') && line.includes('{name:')) {
          const processedLine = this.removeDuplicatesFromLine(line);
          if (processedLine !== line) {
            duplicatesRemoved++;
          }
          processedLines.push(processedLine);
        } else {
          processedLines.push(line);
        }
      }
      
      // Write processed content
      if (duplicatesRemoved > 0) {
        const backupPath = `${filePath}.backup-${Date.now()}`;
        fs.writeFileSync(backupPath, content, 'utf-8');
        fs.writeFileSync(filePath, processedLines.join('\n'), 'utf-8');
        console.log(`  ✅ Removed duplicates from ${duplicatesRemoved} entries`);
        console.log(`  📋 Backup created: ${backupPath}`);
      } else {
        console.log(`  ✓ No duplicates found`);
      }
      
      this.processedFiles++;
      this.totalDuplicatesRemoved += duplicatesRemoved;
      this.fileResults[filePath] = duplicatesRemoved;
      
      return duplicatesRemoved;
      
    } catch (error) {
      console.error(`  ❌ Error processing ${filePath}: ${error.message}`);
      return 0;
    }
  }

  /**
   * Remove duplicates from a single namebase entry line
   */
  removeDuplicatesFromLine(line) {
    try {
      // Extract placenames
      const placenameMatch = line.match(/b:\s*"([^"]*)"/);
      if (!placenameMatch) return line;
      
      const placenames = placenameMatch[1].split(',').map(s => s.trim()).filter(s => s);
      
      // Remove duplicates while preserving order
      const uniquePlacenames = [];
      const seen = new Set();
      
      for (const placename of placenames) {
        if (!seen.has(placename)) {
          uniquePlacenames.push(placename);
          seen.add(placename);
        }
      }
      
      // If duplicates were found, reconstruct the line
      if (uniquePlacenames.length !== placenames.length) {
        const newPlacenameString = uniquePlacenames.join(',');
        const newLine = line.replace(/b:\s*"[^"]*"/, `b: "${newPlacenameString}"`);
        return newLine;
      }
      
      return line;
      
    } catch (error) {
      console.warn(`Error processing line: ${error.message}`);
      return line;
    }
  }

  /**
   * Process all namebase files
   */
  processAllNamebaseFiles() {
    const namebaseFiles = [
      'modules/namebases-africa.js',
      'modules/namebases-asia.js',
      'modules/namebases-creole.js',
      'modules/namebases-europe.js',
      'modules/namebases-fantasy.js',
      'modules/namebases-global.js',
      'modules/namebases-northAmerica.js',
      'modules/namebases-oceania.js',
      'modules/namebases-southAmerica.js'
    ];
    
    console.log('🧹 Starting duplicate placename removal process...\n');
    
    for (const file of namebaseFiles) {
      if (fs.existsSync(file)) {
        this.processNamebaseFile(file);
        console.log('');
      } else {
        console.log(`⚠ File not found: ${file}`);
      }
    }
    
    console.log('📊 Duplicate Removal Summary:');
    console.log(`Files processed: ${this.processedFiles}`);
    console.log(`Total duplicates removed: ${this.totalDuplicatesRemoved}`);
    
    // Generate report
    const report = {
      timestamp: new Date().toISOString(),
      totalDuplicatesRemoved: this.totalDuplicatesRemoved,
      filesProcessed: this.processedFiles,
      fileResults: this.fileResults,
      status: this.totalDuplicatesRemoved > 0 ? 'completed' : 'no_duplicates_found'
    };
    
    const reportPath = path.join(__dirname, '../data/duplicate-removal-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📄 Report saved: ${reportPath}`);
    
    return report;
  }

  /**
   * Validate that duplicates have been removed
   */
  validateNoDuplicates(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      let duplicateCount = 0;
      
      for (const line of lines) {
        if (line.includes('b:')) {
          const placenameMatch = line.match(/b:\s*"([^"]*)"/);
          if (placenameMatch) {
            const placenames = placenameMatch[1].split(',').map(s => s.trim()).filter(s => s);
            const uniqueCount = new Set(placenames).size;
            if (uniqueCount !== placenames.length) {
              duplicateCount += (placenames.length - uniqueCount);
            }
          }
        }
      }
      
      console.log(`  Remaining duplicates in ${path.basename(filePath)}: ${duplicateCount}`);
      return duplicateCount === 0;
      
    } catch (error) {
      console.error(`Validation error: ${error.message}`);
      return false;
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DuplicatePlacenameFixer;
}

// Auto-execute if run directly
if (require.main === module) {
  const fixer = new DuplicatePlacenameFixer();
  
  console.log('🔧 Duplicate Placename Fixer');
  console.log('==============================\n');
  
  // Process all files
  const report = fixer.processAllNamebaseFiles();
  
  // Validate results
  console.log('\n🔍 Validating results...');
  const namebaseFiles = [
    'modules/namebases-africa.js',
    'modules/namebases-asia.js',
    'modules/namebases-creole.js',
    'modules/namebases-europe.js',
    'modules/namebases-fantasy.js',
    'modules/namebases-global.js',
    'modules/namebases-northAmerica.js',
    'modules/namebases-oceania.js',
    'modules/namebases-southAmerica.js'
  ];
  
  let validationPassed = true;
  for (const file of namebaseFiles) {
    if (fs.existsSync(file)) {
      const passed = fixer.validateNoDuplicates(file);
      if (!passed) validationPassed = false;
    }
  }
  
  if (validationPassed) {
    console.log('✅ All validations passed - no duplicates remaining!');
  } else {
    console.log('⚠ Some duplicates still remain - manual review needed');
  }
  
  console.log('\n🎉 Duplicate removal process complete!');
}