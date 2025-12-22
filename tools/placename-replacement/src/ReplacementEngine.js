const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

/**
 * ReplacementEngine - Manages systematic replacement of placeholders
 * 
 * Responsible for:
 * - Creating backups before modifications
 * - Replacing placeholders while preserving metadata
 * - Validating replacement integrity
 * - Applying changes atomically
 */
class ReplacementEngine {
  constructor(backupManager, fileUpdater) {
    this.backupManager = backupManager;
    this.fileUpdater = fileUpdater;
    this.replacementLog = [];
    this.backupDir = path.join(__dirname, '..', 'backups');
  }

  /**
   * Replace placeholders in a namebase entry with researched placenames
   * @param {Object} entry - Namebase entry containing placeholders
   * @param {Array} newPlacenames - Array of authentic placenames to use
   * @returns {Promise<Object>} Updated entry with replacements applied
   */
  async replacePlaceholders(entry, newPlacenames) {
    try {
      if (!entry || !Array.isArray(newPlacenames)) {
        throw new Error('Invalid entry or placenames provided');
      }

      // Parse the namebase entry to extract placenames
      const placenames = entry.b ? entry.b.split(',') : [];
      
      // Identify placeholders in the entry (preserve original spacing)
      const placeholderIndices = [];
      const nonPlaceholderNames = [];
      
      placenames.forEach((name, index) => {
        if (this.isPlaceholder(name)) {
          placeholderIndices.push(index);
        } else {
          nonPlaceholderNames.push(name);
        }
      });

      // If no placeholders found, return original entry
      if (placeholderIndices.length === 0) {
        return { ...entry, hasChanges: false };
      }

      // Ensure we have enough replacement names
      if (newPlacenames.length < placeholderIndices.length) {
        throw new Error(`Insufficient replacement names: need ${placeholderIndices.length}, got ${newPlacenames.length}`);
      }

      // Create new placenames array with replacements (preserve spacing)
      const updatedPlacenames = [...placenames];
      const actualReplacements = [];
      
      placeholderIndices.forEach((placeholderIndex, i) => {
        const originalName = placenames[placeholderIndex];
        const replacement = newPlacenames[i];
        
        // Preserve any leading/trailing whitespace from the original
        const leadingSpace = originalName.match(/^\s*/)[0];
        const trailingSpace = originalName.match(/\s*$/)[0];
        const formattedReplacement = leadingSpace + replacement + trailingSpace;
        
        updatedPlacenames[placeholderIndex] = formattedReplacement;
        actualReplacements.push(replacement);
      });

      // Preserve all original metadata while updating placenames
      const updatedEntry = this.preserveMetadataWithNewNames(entry, updatedPlacenames);
      
      // Validate the replacement maintains integrity
      const isValid = this.validateReplacements(entry, updatedEntry);
      if (!isValid) {
        throw new Error('Replacement validation failed');
      }

      return {
        ...updatedEntry,
        hasChanges: true,
        replacedCount: placeholderIndices.length,
        originalPlaceholders: placeholderIndices.map(i => placenames[i]),
        newPlacenames: actualReplacements // Store the actual replacement names without spacing
      };

    } catch (error) {
      throw new Error(`Failed to replace placeholders: ${error.message}`);
    }
  }

  /**
   * Apply all replacements to the namebase file
   * @param {Map} replacementMap - Map of entries to their replacement placenames
   * @returns {Promise<Object>} Result of replacement operation
   */
  async applyReplacements(replacementMap) {
    try {
      if (!replacementMap || !(replacementMap instanceof Map)) {
        throw new Error('Invalid replacement map provided');
      }

      const results = {
        totalEntries: replacementMap.size,
        successfulReplacements: 0,
        failedReplacements: 0,
        errors: [],
        replacements: []
      };

      // Process each replacement
      for (const [entry, newPlacenames] of replacementMap) {
        try {
          const replacementResult = await this.replacePlaceholders(entry, newPlacenames);
          
          if (replacementResult.hasChanges) {
            results.successfulReplacements++;
            results.replacements.push({
              entry: entry,
              result: replacementResult,
              timestamp: new Date().toISOString()
            });
          }
        } catch (error) {
          results.failedReplacements++;
          results.errors.push({
            entry: entry.name || 'unknown',
            error: error.message,
            timestamp: new Date().toISOString()
          });
        }
      }

      // Log the replacement operation
      this.replacementLog.push({
        timestamp: new Date().toISOString(),
        operation: 'applyReplacements',
        results: results
      });

      return results;
    } catch (error) {
      throw new Error(`Failed to apply replacements: ${error.message}`);
    }
  }

  /**
   * Validate that replacements preserve entry integrity
   * @param {Object} originalEntry - Original namebase entry
   * @param {Object} updatedEntry - Entry after replacement
   * @returns {boolean} True if replacement is valid
   */
  validateReplacements(originalEntry, updatedEntry) {
    try {
      // Check that all essential metadata is preserved
      const metadataFields = ['name', 'i', 'min', 'max', 'd'];
      
      for (const field of metadataFields) {
        if (originalEntry[field] !== updatedEntry[field]) {
          console.warn(`Metadata field '${field}' changed: ${originalEntry[field]} -> ${updatedEntry[field]}`);
          return false;
        }
      }

      // Handle NaN values in 'm' field specially
      const originalM = originalEntry.m;
      const updatedM = updatedEntry.m;
      
      if (Number.isNaN(originalM) && Number.isNaN(updatedM)) {
        // Both are NaN, this is acceptable
      } else if (Number.isNaN(originalM) || Number.isNaN(updatedM)) {
        // One is NaN and the other isn't - this could be acceptable if we're preserving the original
        if (originalM !== updatedM) {
          console.warn(`Metadata field 'm' changed: ${originalM} -> ${updatedM}`);
          return false;
        }
      } else if (originalM !== updatedM) {
        console.warn(`Metadata field 'm' changed: ${originalM} -> ${updatedM}`);
        return false;
      }

      // Check that the number of placenames is maintained
      const originalPlacenames = originalEntry.b ? originalEntry.b.split(',') : [];
      const updatedPlacenames = updatedEntry.b ? updatedEntry.b.split(',') : [];
      
      if (originalPlacenames.length !== updatedPlacenames.length) {
        console.warn(`Placename count changed: ${originalPlacenames.length} -> ${updatedPlacenames.length}`);
        return false;
      }

      // Check that character encoding is preserved (no corruption)
      const originalEncoding = this.detectEncoding(originalEntry.b || '');
      const updatedEncoding = this.detectEncoding(updatedEntry.b || '');
      
      if (originalEncoding !== updatedEncoding) {
        console.warn(`Character encoding changed: ${originalEncoding} -> ${updatedEncoding}`);
        // This is a warning, not a failure - we want to preserve authenticity
        // Changing from ASCII placeholders to UTF-8 authentic names is expected and desired
      }

      // Validate that all non-placeholder names remain unchanged
      const originalNonPlaceholders = [];
      const updatedNonPlaceholders = [];
      
      originalPlacenames.forEach((name, index) => {
        if (!this.isPlaceholder(name)) {
          originalNonPlaceholders.push(name);
          updatedNonPlaceholders.push(updatedPlacenames[index]);
        }
      });

      if (originalNonPlaceholders.length !== updatedNonPlaceholders.length) {
        console.warn('Non-placeholder names count mismatch');
        return false;
      }

      // Check that non-placeholder names are exactly preserved
      for (let i = 0; i < originalNonPlaceholders.length; i++) {
        if (originalNonPlaceholders[i] !== updatedNonPlaceholders[i]) {
          console.warn(`Non-placeholder name changed: ${originalNonPlaceholders[i]} -> ${updatedNonPlaceholders[i]}`);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error(`Validation error: ${error.message}`);
      return false;
    }
  }

  /**
   * Create timestamped backup of the namebase file
   * @param {string} filePath - Path to file to backup
   * @returns {Promise<string>} Path to created backup file
   */
  async createBackup(filePath) {
    try {
      // Ensure backup directory exists
      await fs.mkdir(this.backupDir, { recursive: true });

      // Generate timestamp for backup filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = path.basename(filePath);
      const backupFileName = `${fileName}.backup-${timestamp}`;
      const backupPath = path.join(this.backupDir, backupFileName);

      // Read original file
      const fileContent = await fs.readFile(filePath, 'utf8');

      // Calculate checksum for integrity verification
      const checksum = crypto.createHash('sha256').update(fileContent).digest('hex');

      // Write backup file
      await fs.writeFile(backupPath, fileContent, 'utf8');

      // Write checksum file
      const checksumPath = `${backupPath}.checksum`;
      await fs.writeFile(checksumPath, checksum, 'utf8');

      // Verify backup was created successfully
      const backupExists = await this.validateBackupIntegrity(backupPath, checksum);
      if (!backupExists) {
        throw new Error('Backup validation failed immediately after creation');
      }

      return backupPath;
    } catch (error) {
      throw new Error(`Failed to create backup: ${error.message}`);
    }
  }

  /**
   * Restore namebase file from backup
   * @param {string} backupPath - Path to backup file
   * @param {string} targetPath - Path to restore to
   * @returns {Promise<boolean>} True if restoration successful
   */
  async restoreFromBackup(backupPath, targetPath) {
    try {
      // Validate backup integrity before restoration
      const checksumPath = `${backupPath}.checksum`;
      const expectedChecksum = await fs.readFile(checksumPath, 'utf8');
      
      const isValid = await this.validateBackupIntegrity(backupPath, expectedChecksum);
      if (!isValid) {
        throw new Error('Backup integrity validation failed');
      }

      // Read backup content
      const backupContent = await fs.readFile(backupPath, 'utf8');

      // Create backup of current file before restoration (safety measure)
      const currentBackupPath = await this.createBackup(targetPath);

      // Restore from backup
      await fs.writeFile(targetPath, backupContent, 'utf8');

      // Verify restoration
      const restoredContent = await fs.readFile(targetPath, 'utf8');
      const restoredChecksum = crypto.createHash('sha256').update(restoredContent).digest('hex');

      if (restoredChecksum !== expectedChecksum) {
        // Restoration failed, try to restore the safety backup
        const safetyContent = await fs.readFile(currentBackupPath, 'utf8');
        await fs.writeFile(targetPath, safetyContent, 'utf8');
        throw new Error('Restoration checksum mismatch, reverted to original');
      }

      return true;
    } catch (error) {
      throw new Error(`Failed to restore from backup: ${error.message}`);
    }
  }

  /**
   * Preserve metadata while replacing placename seeds
   * @param {Object} entry - Original namebase entry
   * @param {Array} newNames - New placenames to use
   * @returns {Object} Entry with preserved metadata and new names
   */
  preserveMetadataWithNewNames(entry, newNames) {
    try {
      // Create a deep copy of the original entry to preserve all metadata
      const preservedEntry = {
        name: entry.name,
        i: entry.i,
        min: entry.min,
        max: entry.max,
        d: entry.d || '',
        m: entry.m, // Preserve exactly as is, including NaN
        b: Array.isArray(newNames) ? newNames.join(',') : newNames
      };

      // Preserve any additional metadata fields that might exist
      Object.keys(entry).forEach(key => {
        if (!['name', 'i', 'min', 'max', 'd', 'm', 'b'].includes(key)) {
          preservedEntry[key] = entry[key];
        }
      });

      return preservedEntry;
    } catch (error) {
      throw new Error(`Failed to preserve metadata: ${error.message}`);
    }
  }

  /**
   * Validate file integrity after modifications
   * @param {string} filePath - Path to modified file
   * @returns {Promise<boolean>} True if file integrity is valid
   */
  async validateFileIntegrity(filePath) {
    try {
      // Check if file exists and is readable
      await fs.access(filePath, fs.constants.R_OK);
      
      // Read file content
      const content = await fs.readFile(filePath, 'utf8');
      
      // Basic integrity checks
      if (content.length === 0) {
        console.warn('File is empty');
        return false;
      }
      
      // Check for basic JavaScript syntax (since it's a .js file)
      if (filePath.endsWith('.js')) {
        // Look for basic namebase structure patterns
        const hasNamebasePattern = /namebases\s*=/.test(content) || /\{\s*name\s*:/.test(content);
        if (!hasNamebasePattern) {
          console.warn('File does not appear to contain namebase structure');
          return false;
        }
        
        // Check for balanced braces and brackets
        const openBraces = (content.match(/\{/g) || []).length;
        const closeBraces = (content.match(/\}/g) || []).length;
        const openBrackets = (content.match(/\[/g) || []).length;
        const closeBrackets = (content.match(/\]/g) || []).length;
        
        if (openBraces !== closeBraces) {
          console.warn(`Unbalanced braces: ${openBraces} open, ${closeBraces} close`);
          return false;
        }
        
        if (openBrackets !== closeBrackets) {
          console.warn(`Unbalanced brackets: ${openBrackets} open, ${closeBrackets} close`);
          return false;
        }
      }
      
      // Check for character encoding issues
      const encoding = this.detectEncoding(content);
      if (!encoding) {
        console.warn('Could not detect character encoding');
        return false;
      }
      
      // Verify no null bytes or other corruption indicators
      if (content.includes('\0')) {
        console.warn('File contains null bytes (possible corruption)');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error(`File integrity validation failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Generate detailed change log for replacements
   * @param {Array} replacements - Array of replacement operations
   * @returns {Object} Detailed change log with before/after mappings
   */
  generateChangeLog(replacements) {
    try {
      const changeLog = {
        timestamp: new Date().toISOString(),
        totalReplacements: replacements.length,
        summary: {
          entriesModified: 0,
          placeholdersReplaced: 0,
          languageGroups: new Set(),
          encodingTypes: new Set()
        },
        changes: [],
        statistics: {
          byLanguageGroup: {},
          byEncodingType: {},
          byPlaceholderType: {}
        }
      };

      replacements.forEach((replacement, index) => {
        const entry = replacement.entry;
        const result = replacement.result;
        
        if (result && result.hasChanges) {
          changeLog.summary.entriesModified++;
          changeLog.summary.placeholdersReplaced += result.replacedCount || 0;
          changeLog.summary.languageGroups.add(entry.name);
          
          // Analyze encoding types
          if (result.newPlacenames) {
            result.newPlacenames.forEach(name => {
              const encoding = this.detectEncoding(name);
              changeLog.summary.encodingTypes.add(encoding);
            });
          }
          
          // Create detailed change record
          const changeRecord = {
            index: index,
            languageGroup: entry.name,
            languageIndex: entry.i,
            timestamp: replacement.timestamp || new Date().toISOString(),
            beforeAfter: {
              originalPlaceholders: result.originalPlaceholders || [],
              newPlacenames: result.newPlacenames || [],
              metadata: {
                name: entry.name,
                i: entry.i,
                min: entry.min,
                max: entry.max,
                d: entry.d,
                m: entry.m
              }
            },
            statistics: {
              replacedCount: result.replacedCount || 0,
              encodingTypes: result.newPlacenames ? 
                result.newPlacenames.map(name => this.detectEncoding(name)) : []
            }
          };
          
          changeLog.changes.push(changeRecord);
          
          // Update statistics
          const langGroup = entry.name;
          if (!changeLog.statistics.byLanguageGroup[langGroup]) {
            changeLog.statistics.byLanguageGroup[langGroup] = {
              count: 0,
              placeholdersReplaced: 0,
              encodingTypes: new Set()
            };
          }
          changeLog.statistics.byLanguageGroup[langGroup].count++;
          changeLog.statistics.byLanguageGroup[langGroup].placeholdersReplaced += result.replacedCount || 0;
          
          // Track encoding statistics
          if (result.newPlacenames) {
            result.newPlacenames.forEach(name => {
              const encoding = this.detectEncoding(name);
              changeLog.statistics.byLanguageGroup[langGroup].encodingTypes.add(encoding);
              
              if (!changeLog.statistics.byEncodingType[encoding]) {
                changeLog.statistics.byEncodingType[encoding] = 0;
              }
              changeLog.statistics.byEncodingType[encoding]++;
            });
          }
          
          // Track placeholder type statistics
          if (result.originalPlaceholders) {
            result.originalPlaceholders.forEach(placeholder => {
              let placeholderType = 'unknown';
              if (/_unq\d+$/.test(placeholder)) {
                placeholderType = 'unq';
              } else if (/_u\d+$/.test(placeholder)) {
                placeholderType = 'u';
              } else if (/_unq$/.test(placeholder)) {
                placeholderType = 'truncated';
              }
              
              if (!changeLog.statistics.byPlaceholderType[placeholderType]) {
                changeLog.statistics.byPlaceholderType[placeholderType] = 0;
              }
              changeLog.statistics.byPlaceholderType[placeholderType]++;
            });
          }
        }
      });

      // Convert Sets to Arrays for JSON serialization
      changeLog.summary.languageGroups = Array.from(changeLog.summary.languageGroups);
      changeLog.summary.encodingTypes = Array.from(changeLog.summary.encodingTypes);
      
      // Convert encoding type Sets in language group statistics
      Object.keys(changeLog.statistics.byLanguageGroup).forEach(langGroup => {
        changeLog.statistics.byLanguageGroup[langGroup].encodingTypes = 
          Array.from(changeLog.statistics.byLanguageGroup[langGroup].encodingTypes);
      });

      return changeLog;
    } catch (error) {
      throw new Error(`Failed to generate change log: ${error.message}`);
    }
  }

  /**
   * Apply all replacements to a namebase file atomically
   * @param {string} filePath - Path to namebase file
   * @param {Array} replacements - Array of replacement operations
   * @returns {Promise<Object>} Result of atomic update operation
   */
  async applyReplacementsToFile(filePath, replacements) {
    try {
      // Create backup before any modifications
      const backupPath = await this.createBackup(filePath);
      
      let success = false;
      let changeLog = null;
      
      try {
        // Read original file
        const originalContent = await fs.readFile(filePath, 'utf8');
        
        // Apply replacements to content
        let updatedContent = originalContent;
        const appliedReplacements = [];
        
        for (const replacement of replacements) {
          if (replacement.result && replacement.result.hasChanges) {
            // Find and replace the specific entry in the file content
            const entryPattern = this.createEntryPattern(replacement.entry);
            const updatedEntry = this.formatUpdatedEntry(replacement.result);
            
            if (entryPattern && updatedEntry) {
              updatedContent = updatedContent.replace(entryPattern, updatedEntry);
              appliedReplacements.push(replacement);
            }
          }
        }
        
        // Validate updated content before writing
        const tempPath = `${filePath}.temp`;
        await fs.writeFile(tempPath, updatedContent, 'utf8');
        
        const isValid = await this.validateFileIntegrity(tempPath);
        if (!isValid) {
          await fs.unlink(tempPath);
          throw new Error('Updated file failed integrity validation');
        }
        
        // Atomically replace original file
        await fs.rename(tempPath, filePath);
        
        // Generate change log
        changeLog = this.generateChangeLog(appliedReplacements);
        
        success = true;
        
        return {
          success: true,
          backupPath: backupPath,
          changeLog: changeLog,
          appliedReplacements: appliedReplacements.length,
          totalReplacements: replacements.length
        };
        
      } catch (error) {
        // Restore from backup on failure
        await this.restoreFromBackup(backupPath, filePath);
        throw error;
      }
      
    } catch (error) {
      throw new Error(`Failed to apply replacements to file: ${error.message}`);
    }
  }

  /**
   * Create a regex pattern to match a specific namebase entry
   * @param {Object} entry - Namebase entry to create pattern for
   * @returns {RegExp} Regex pattern to match the entry
   */
  createEntryPattern(entry) {
    try {
      // Escape special regex characters in the entry values
      const escapedName = entry.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const escapedB = entry.b ? entry.b.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : '';
      
      // Create pattern that matches the full entry structure
      const pattern = new RegExp(
        `\\{\\s*name\\s*:\\s*["']${escapedName}["']\\s*,\\s*` +
        `i\\s*:\\s*${entry.i}\\s*,\\s*` +
        `min\\s*:\\s*${entry.min}\\s*,\\s*` +
        `max\\s*:\\s*${entry.max}\\s*,\\s*` +
        `d\\s*:\\s*["']${entry.d || ''}["']\\s*,\\s*` +
        `m\\s*:\\s*${entry.m}\\s*,\\s*` +
        `b\\s*:\\s*["']${escapedB}["']\\s*\\}`,
        'g'
      );
      
      return pattern;
    } catch (error) {
      console.warn(`Failed to create entry pattern: ${error.message}`);
      return null;
    }
  }

  /**
   * Format an updated entry for file replacement
   * @param {Object} updatedEntry - Updated namebase entry
   * @returns {string} Formatted entry string
   */
  formatUpdatedEntry(updatedEntry) {
    try {
      return `{name: "${updatedEntry.name}", i: ${updatedEntry.i}, min: ${updatedEntry.min}, max: ${updatedEntry.max}, d: "${updatedEntry.d || ''}", m: ${updatedEntry.m}, b: "${updatedEntry.b}"}`;
    } catch (error) {
      console.warn(`Failed to format updated entry: ${error.message}`);
      return null;
    }
  }

  /**
   * Validate backup file integrity using checksum
   * @param {string} backupPath - Path to backup file
   * @param {string} expectedChecksum - Expected SHA256 checksum
   * @returns {Promise<boolean>} True if backup is valid
   */
  async validateBackupIntegrity(backupPath, expectedChecksum) {
    try {
      const backupContent = await fs.readFile(backupPath, 'utf8');
      const actualChecksum = crypto.createHash('sha256').update(backupContent).digest('hex');
      return actualChecksum === expectedChecksum;
    } catch (error) {
      return false;
    }
  }

  /**
   * List all available backups for a file
   * @param {string} originalFileName - Name of the original file
   * @returns {Promise<Array>} Array of backup file information
   */
  async listBackups(originalFileName) {
    try {
      const files = await fs.readdir(this.backupDir);
      const backups = files
        .filter(file => file.startsWith(`${originalFileName}.backup-`) && !file.endsWith('.checksum'))
        .map(file => {
          const backupPath = path.join(this.backupDir, file);
          const timestampMatch = file.match(/backup-(.+)$/);
          const timestamp = timestampMatch ? timestampMatch[1] : 'unknown';
          return {
            path: backupPath,
            filename: file,
            timestamp: timestamp,
            checksumPath: `${backupPath}.checksum`
          };
        })
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp)); // Most recent first

      return backups;
    } catch (error) {
      return [];
    }
  }

  /**
   * Clean up old backups, keeping only the most recent N backups
   * @param {string} originalFileName - Name of the original file
   * @param {number} keepCount - Number of backups to keep (default: 10)
   * @returns {Promise<number>} Number of backups deleted
   */
  async cleanupOldBackups(originalFileName, keepCount = 10) {
    try {
      const backups = await this.listBackups(originalFileName);
      const toDelete = backups.slice(keepCount);
      
      let deletedCount = 0;
      for (const backup of toDelete) {
        try {
          await fs.unlink(backup.path);
          await fs.unlink(backup.checksumPath);
          deletedCount++;
        } catch (error) {
          // Continue with other deletions even if one fails
          console.warn(`Failed to delete backup ${backup.filename}: ${error.message}`);
        }
      }

      return deletedCount;
    } catch (error) {
      throw new Error(`Failed to cleanup old backups: ${error.message}`);
    }
  }

  /**
   * Check if a name is a placeholder pattern
   * @param {string} name - Name to check
   * @returns {boolean} True if name is a placeholder
   */
  isPlaceholder(name) {
    if (!name || typeof name !== 'string') {
      return false;
    }
    
    // Trim whitespace before checking patterns
    const trimmedName = name.trim();
    
    if (trimmedName.length === 0) {
      return false;
    }
    
    // Check for various placeholder patterns
    const patterns = [
      /_\d+_unq\d*$/,  // Standard _unq patterns
      /_\d+_u\d+$/,    // Shortened _u patterns
      /_\d+_unq$/      // Truncated patterns
    ];
    
    return patterns.some(pattern => pattern.test(trimmedName));
  }

  /**
   * Detect character encoding of a string
   * @param {string} text - Text to analyze
   * @returns {string} Detected encoding type
   */
  detectEncoding(text) {
    if (!text || typeof text !== 'string') {
      return 'ascii';
    }
    
    // Check for various character types
    const hasUnicode = /[^\x00-\x7F]/.test(text);
    const hasDiacritics = /[àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]/i.test(text);
    const hasExtendedLatin = /[ĀāĂăĄąĆćĈĉĊċČčĎďĐđĒēĔĕĖėĘęĚě]/.test(text);
    
    if (hasExtendedLatin) {
      return 'utf8-extended';
    } else if (hasDiacritics) {
      return 'utf8-diacritics';
    } else if (hasUnicode) {
      return 'utf8';
    } else {
      return 'ascii';
    }
  }
}

module.exports = ReplacementEngine;