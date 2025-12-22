/**
 * PlaceholderScanner - Identifies and analyzes placeholder entries in namebase files
 * 
 * Responsible for:
 * - Scanning namebases-real.js for placeholder patterns
 * - Extracting language group and ISO code information
 * - Generating comprehensive analysis reports
 */
class PlaceholderScanner {
  constructor(namebaseFilePath) {
    this.namebaseFilePath = namebaseFilePath;
    this.placeholders = [];
    this.statistics = {
      totalPlaceholders: 0,
      unqPatterns: 0,
      uPatterns: 0,
      truncatedPatterns: 0,
      languageGroups: new Set()
    };
  }

  /**
   * Scan for all placeholder patterns in the namebase file
   * @returns {Promise<Array>} Array of placeholder entries found
   */
  async scanPlaceholders() {
    try {
      // Parse the namebase file
      const namebaseEntries = await this.parseNamebaseFile();
      
      // Reset statistics
      this.statistics = {
        totalPlaceholders: 0,
        unqPatterns: 0,
        uPatterns: 0,
        truncatedPatterns: 0,
        mixedPatterns: 0,
        languageGroups: new Set()
      };
      
      this.placeholders = [];
      
      // Process each namebase entry
      namebaseEntries.forEach((entry, entryIndex) => {
        const languageInfo = this.extractLanguageInfo(entry);
        
        if (languageInfo.hasPlaceholders) {
          // Add to language groups set
          this.statistics.languageGroups.add(languageInfo.baseName);
          
          // Count placeholder types
          languageInfo.placeholders.forEach(placeholder => {
            this.statistics.totalPlaceholders++;
            
            switch (placeholder.type) {
              case 'unq':
                this.statistics.unqPatterns++;
                break;
              case 'u':
                this.statistics.uPatterns++;
                break;
              case 'truncated':
                this.statistics.truncatedPatterns++;
                break;
              case 'mixed':
                this.statistics.mixedPatterns++;
                break;
            }
          });
          
          // Store the entry with placeholder information
          this.placeholders.push({
            entryIndex,
            languageInfo,
            originalEntry: entry
          });
        }
      });
      
      return this.placeholders;
    } catch (error) {
      throw new Error(`Failed to scan placeholders: ${error.message}`);
    }
  }

  /**
   * Extract language group information from a namebase entry
   * @param {Object} entry - Namebase entry to analyze
   * @returns {Object} Language information including ISO code, family, region
   */
  extractLanguageInfo(entry) {
    const info = {
      name: entry.name || 'Unknown',
      index: entry.i || 0,
      minLength: entry.min || 0,
      maxLength: entry.max || 0,
      dominantLetters: entry.d || '',
      multiplier: entry.m || 0,
      placenames: entry.b ? entry.b.split(',') : []
    };
    
    // Try to extract ISO code or language identifier from the name
    // Many entries follow patterns like "Language (dedicated)" or contain ISO codes
    const nameMatch = entry.name.match(/^(.+?)\s*\(dedicated\)$/);
    if (nameMatch) {
      info.baseName = nameMatch[1].trim();
    } else {
      info.baseName = entry.name;
    }
    
    // Extract potential ISO codes or language identifiers
    const isoMatch = info.baseName.match(/^([a-z]{2,3})$/i);
    if (isoMatch) {
      info.potentialISO = isoMatch[1].toLowerCase();
    }
    
    // Detect if this entry contains placeholders
    const placeholders = this.detectPlaceholderPatterns(info.placenames);
    info.hasPlaceholders = placeholders.length > 0;
    info.placeholderCount = placeholders.length;
    info.placeholders = placeholders;
    
    return info;
  }

  /**
   * Generate comprehensive analysis report of placeholder scan
   * @returns {Object} Detailed report with statistics and findings
   */
  generateScanReport() {
    const report = {
      summary: {
        totalPlaceholders: this.statistics.totalPlaceholders,
        languageGroupsAffected: this.statistics.languageGroups.size,
        patternBreakdown: {
          unqPatterns: this.statistics.unqPatterns,
          uPatterns: this.statistics.uPatterns,
          truncatedPatterns: this.statistics.truncatedPatterns,
          mixedPatterns: this.statistics.mixedPatterns
        }
      },
      languageGroups: [],
      detailedFindings: []
    };
    
    // Group placeholders by language
    const languageGroupMap = new Map();
    
    this.placeholders.forEach(placeholderEntry => {
      const langName = placeholderEntry.languageInfo.baseName;
      
      if (!languageGroupMap.has(langName)) {
        languageGroupMap.set(langName, {
          name: langName,
          index: placeholderEntry.languageInfo.index,
          totalPlaceholders: 0,
          placeholderTypes: {
            unq: 0,
            u: 0,
            truncated: 0,
            mixed: 0
          },
          examples: []
        });
      }
      
      const langGroup = languageGroupMap.get(langName);
      langGroup.totalPlaceholders += placeholderEntry.languageInfo.placeholderCount;
      
      // Count types and collect examples
      placeholderEntry.languageInfo.placeholders.forEach(placeholder => {
        langGroup.placeholderTypes[placeholder.type]++;
        if (langGroup.examples.length < 5) { // Limit examples
          langGroup.examples.push(placeholder.original);
        }
      });
    });
    
    // Convert map to array and sort by placeholder count
    report.languageGroups = Array.from(languageGroupMap.values())
      .sort((a, b) => b.totalPlaceholders - a.totalPlaceholders);
    
    // Add detailed findings
    report.detailedFindings = this.placeholders.map(entry => ({
      languageName: entry.languageInfo.baseName,
      index: entry.languageInfo.index,
      placeholderCount: entry.languageInfo.placeholderCount,
      placeholders: entry.languageInfo.placeholders,
      totalPlacenames: entry.languageInfo.placenames.length
    }));
    
    // Add timestamp
    report.generatedAt = new Date().toISOString();
    
    return report;
  }

  /**
   * Export analysis results in different formats
   * @param {Object} report - Report object from generateScanReport
   * @param {string} format - Output format: 'json', 'csv', 'markdown'
   * @returns {string} Formatted report content
   */
  exportReport(report, format = 'json') {
    switch (format.toLowerCase()) {
      case 'json':
        return JSON.stringify(report, null, 2);
        
      case 'csv':
        return this._generateCSVReport(report);
        
      case 'markdown':
        return this._generateMarkdownReport(report);
        
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  /**
   * Generate CSV format report
   * @private
   */
  _generateCSVReport(report) {
    const lines = [
      'Language Name,Index,Total Placeholders,UNQ Patterns,U Patterns,Truncated Patterns,Mixed Patterns,Example Placeholders'
    ];
    
    report.languageGroups.forEach(group => {
      const examples = group.examples.join('; ');
      lines.push([
        group.name,
        group.index,
        group.totalPlaceholders,
        group.placeholderTypes.unq,
        group.placeholderTypes.u,
        group.placeholderTypes.truncated,
        group.placeholderTypes.mixed,
        `"${examples}"`
      ].join(','));
    });
    
    return lines.join('\n');
  }

  /**
   * Generate Markdown format report
   * @private
   */
  _generateMarkdownReport(report) {
    const lines = [
      '# Placeholder Analysis Report',
      '',
      `Generated: ${report.generatedAt}`,
      '',
      '## Summary',
      '',
      `- **Total Placeholders**: ${report.summary.totalPlaceholders}`,
      `- **Language Groups Affected**: ${report.summary.languageGroupsAffected}`,
      `- **UNQ Patterns**: ${report.summary.patternBreakdown.unqPatterns}`,
      `- **U Patterns**: ${report.summary.patternBreakdown.uPatterns}`,
      `- **Truncated Patterns**: ${report.summary.patternBreakdown.truncatedPatterns}`,
      `- **Mixed Patterns**: ${report.summary.patternBreakdown.mixedPatterns}`,
      '',
      '## Language Groups by Placeholder Count',
      '',
      '| Language Name | Index | Total Placeholders | UNQ | U | Truncated | Mixed | Examples |',
      '|---------------|-------|-------------------|-----|---|-----------|-------|----------|'
    ];
    
    report.languageGroups.forEach(group => {
      const examples = group.examples.slice(0, 3).join(', ');
      lines.push(`| ${group.name} | ${group.index} | ${group.totalPlaceholders} | ${group.placeholderTypes.unq} | ${group.placeholderTypes.u} | ${group.placeholderTypes.truncated} | ${group.placeholderTypes.mixed} | ${examples} |`);
    });
    
    return lines.join('\n');
  }

  /**
   * Detect specific placeholder patterns in namebase entries
   * @param {Array} names - Array of names to check for placeholders
   * @returns {Array} Array of detected placeholder patterns
   */
  detectPlaceholderPatterns(names) {
    const placeholders = [];
    
    // Regular expressions for different placeholder patterns
    // Updated to handle cases where language base might be empty or start with underscore
    const patterns = {
      unq: /^(.*)_(\d+)_unq(\d+)$/,           // language_index_unq1, language_index_unq2, etc.
      u: /^(.*)_(\d+)_u(\d+)$/,               // language_index_u1, language_index_u2, etc.
      truncated: /^(.*)_(\d+)_unq$/,          // Truncated patterns ending with _unq
      mixed: /^(.*)_(\d+)_(unq|u)$/           // Mixed patterns that might be incomplete
    };
    
    names.forEach(name => {
      for (const [patternType, regex] of Object.entries(patterns)) {
        const match = name.match(regex);
        if (match) {
          placeholders.push({
            original: name,
            type: patternType,
            languageBase: match[1] || '', // Handle empty language base
            index: match[2],
            sequence: match[3] || null
          });
          break; // Only match the first pattern type
        }
      }
    });
    
    return placeholders;
  }

  /**
   * Parse namebase file and extract all entries
   * @returns {Promise<Array>} Array of parsed namebase entries
   */
  async parseNamebaseFile() {
    const fs = require('fs').promises;
    
    try {
      // Read the namebase file
      const fileContent = await fs.readFile(this.namebaseFilePath, 'utf8');
      
      // Extract the array content from the JavaScript file
      // The file contains: window.realWorldNameBases = [...]
      const arrayMatch = fileContent.match(/window\.realWorldNameBases\s*=\s*(\[[\s\S]*\]);?/);
      if (!arrayMatch) {
        throw new Error('Could not find realWorldNameBases array in file');
      }
      
      // Parse the array content as JSON-like structure
      // We need to handle the JavaScript object format
      const arrayContent = arrayMatch[1];
      
      // Use eval in a safe context to parse the JavaScript array
      // This is necessary because the file contains JavaScript objects, not JSON
      const namebaseEntries = eval(`(${arrayContent})`);
      
      if (!Array.isArray(namebaseEntries)) {
        throw new Error('Parsed content is not an array');
      }
      
      return namebaseEntries;
    } catch (error) {
      throw new Error(`Failed to parse namebase file: ${error.message}`);
    }
  }
}

module.exports = PlaceholderScanner;