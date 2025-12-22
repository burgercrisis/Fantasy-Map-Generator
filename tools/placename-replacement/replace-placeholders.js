#!/usr/bin/env node

/**
 * Placename Placeholder Replacement Tool
 * 
 * Main CLI entry point for systematically replacing placeholder placenames
 * with authentic, researched placenames in the Fantasy Map Generator.
 */

const path = require('path');
const PlaceholderScanner = require('./src/PlaceholderScanner');
const ResearchEngine = require('./src/ResearchEngine');
const ReplacementEngine = require('./src/ReplacementEngine');
const ValidationSystem = require('./src/ValidationSystem');
const ReportGenerator = require('./src/ReportGenerator');

class PlaceholderReplacementTool {
  constructor(options = {}) {
    this.options = {
      dryRun: false,
      createBackup: true,
      reportFormat: ['json', 'markdown'],
      namebaseFile: path.join(__dirname, '../../modules/namebases-real.js'),
      outputDir: path.join(__dirname, 'output'),
      ...options
    };

    this.scanner = new PlaceholderScanner(this.options.namebaseFile);
    this.researchEngine = new ResearchEngine();
    this.validationSystem = new ValidationSystem();
    this.reportGenerator = new ReportGenerator();
    
    // ReplacementEngine will be initialized with backup manager and file updater
    this.replacementEngine = null;
  }

  /**
   * Main execution method - orchestrates the entire replacement process
   */
  async run() {
    try {
      console.log('🔍 Starting Placename Placeholder Replacement Tool...');
      console.log(`📁 Target file: ${this.options.namebaseFile}`);
      console.log(`🔧 Mode: ${this.options.dryRun ? 'DRY RUN (Analysis Only)' : 'LIVE REPLACEMENT'}`);
      
      if (this.options.verbose) {
        console.log(`📊 Report formats: ${this.options.reportFormat.join(', ')}`);
        console.log(`📂 Output directory: ${this.options.outputDir}`);
        console.log(`💾 Create backup: ${this.options.createBackup ? 'Yes' : 'No'}`);
      }

      // Phase 1: Scan and analyze placeholders
      console.log('\n📊 Phase 1: Scanning for placeholders...');
      const startTime = Date.now();
      
      const placeholders = await this.scanner.scanPlaceholders();
      const scanReport = this.scanner.generateScanReport();
      
      const scanDuration = Date.now() - startTime;
      console.log(`✅ Found ${scanReport.summary.totalPlaceholders} placeholders across ${scanReport.summary.languageGroupsAffected} language groups (${scanDuration}ms)`);
      
      if (this.options.verbose) {
        console.log(`   📈 Pattern breakdown:`);
        console.log(`      - UNQ patterns: ${scanReport.summary.patternBreakdown.unqPatterns}`);
        console.log(`      - U patterns: ${scanReport.summary.patternBreakdown.uPatterns}`);
        console.log(`      - Truncated patterns: ${scanReport.summary.patternBreakdown.truncatedPatterns}`);
        console.log(`      - Mixed patterns: ${scanReport.summary.patternBreakdown.mixedPatterns}`);
      }

      if (this.options.dryRun) {
        console.log('\n📋 Dry run complete - generating analysis report...');
        const exportResults = await this.reportGenerator.exportMultipleFormats(scanReport, this.options.reportFormat);
        
        console.log('\n📊 Analysis reports generated:');
        Object.entries(exportResults.exports).forEach(([format, result]) => {
          if (result.success) {
            console.log(`  ✅ ${format.toUpperCase()}: ${result.filename} (${result.size} bytes)`);
          } else {
            console.log(`  ❌ ${format.toUpperCase()}: ${result.error}`);
          }
        });
        
        // Show top language groups by placeholder count
        const topGroups = scanReport.languageGroups.slice(0, 10);
        if (topGroups.length > 0) {
          console.log('\n🏆 Top 10 language groups by placeholder count:');
          topGroups.forEach((group, index) => {
            console.log(`  ${index + 1}. ${group.name}: ${group.totalPlaceholders} placeholders`);
          });
        }
        
        return {
          mode: 'analysis',
          scanReport,
          exportResults
        };
      }

      // Phase 2: Research authentic placenames
      console.log('\n🔬 Phase 2: Researching authentic placenames...');
      const researchStartTime = Date.now();
      
      const researchResults = await this.researchPlacenames(placeholders);
      
      const researchDuration = Date.now() - researchStartTime;
      console.log(`✅ Research completed in ${Math.round(researchDuration / 1000)}s`);

      // Phase 3: Apply replacements
      console.log('\n🔄 Phase 3: Applying replacements...');
      const replacementStartTime = Date.now();
      
      const replacementResults = await this.applyReplacements(researchResults);
      
      const replacementDuration = Date.now() - replacementStartTime;
      console.log(`✅ Replacements applied in ${Math.round(replacementDuration / 1000)}s`);

      // Phase 4: Validate results
      console.log('\n✅ Phase 4: Validating replacements...');
      const validationStartTime = Date.now();
      
      const validationResults = await this.validateReplacements(replacementResults);
      
      const validationDuration = Date.now() - validationStartTime;
      console.log(`✅ Validation completed in ${Math.round(validationDuration / 1000)}s`);

      // Phase 5: Generate final report
      console.log('\n📄 Phase 5: Generating final report...');
      const reportStartTime = Date.now();
      
      const finalReport = await this.generateFinalReport(replacementResults, validationResults);
      
      const reportDuration = Date.now() - reportStartTime;
      console.log(`✅ Final report generated in ${Math.round(reportDuration / 1000)}s`);

      // Summary
      const totalDuration = Date.now() - startTime;
      console.log('\n🎉 Placename replacement completed successfully!');
      console.log(`⏱️  Total execution time: ${Math.round(totalDuration / 1000)}s`);
      console.log(`📊 Summary:`);
      console.log(`   - Placeholders replaced: ${finalReport.summary.totalPlaceholders}`);
      console.log(`   - Language groups affected: ${finalReport.summary.languageGroupsAffected}`);
      console.log(`   - Success rate: ${(finalReport.summary.successfulReplacements / (finalReport.summary.successfulReplacements + finalReport.summary.failedReplacements) * 100).toFixed(1)}%`);
      console.log(`   - Average quality: ${(finalReport.summary.averageQuality * 100).toFixed(1)}%`);
      console.log(`   - System validation: ${finalReport.summary.overallValid ? '✅ PASSED' : '❌ FAILED'}`);
      
      if (finalReport.recommendations && finalReport.recommendations.length > 0) {
        console.log(`\n💡 Recommendations:`);
        finalReport.recommendations.forEach((rec, index) => {
          const icon = rec.type === 'critical' ? '🚨' : rec.type === 'high' ? '⚠️' : '💡';
          console.log(`   ${icon} ${rec.title}: ${rec.description}`);
        });
      }

      return finalReport;

    } catch (error) {
      console.error('❌ Error during placename replacement:', error.message);
      
      if (this.options.verbose) {
        console.error('Stack trace:', error.stack);
      }
      
      throw error;
    }
  }

  /**
   * Research authentic placenames for all identified placeholders
   */
  async researchPlacenames(placeholders) {
    console.log(`🔬 Researching placenames for ${placeholders.length} placeholder entries...`);
    
    const researchResults = new Map();
    let processedCount = 0;
    
    for (const placeholderEntry of placeholders) {
      try {
        const languageGroup = placeholderEntry.languageInfo.baseName;
        const placeholderCount = placeholderEntry.languageInfo.placeholderCount;
        
        console.log(`  📚 Researching ${languageGroup} (${placeholderCount} placeholders needed)...`);
        
        // Research placenames for this language group
        const researchResult = await this.researchEngine.researchPlacenames(languageGroup, Math.max(12, placeholderCount));
        
        // Validate authenticity of researched placenames
        const validationResult = await this.researchEngine.validateAuthenticity(researchResult.placenames || [], languageGroup);
        
        // Store combined result
        researchResults.set(placeholderEntry, {
          languageGroup,
          placeholderCount,
          researchResult,
          validationResult,
          timestamp: new Date().toISOString()
        });
        
        processedCount++;
        
        if (processedCount % 5 === 0) {
          console.log(`  ✅ Processed ${processedCount}/${placeholders.length} language groups`);
        }
        
        // Rate limiting to be respectful to external APIs
        await this.sleep(1000);
        
      } catch (error) {
        console.warn(`  ⚠️  Research failed for ${placeholderEntry.languageInfo.baseName}: ${error.message}`);
        
        // Store error result
        researchResults.set(placeholderEntry, {
          languageGroup: placeholderEntry.languageInfo.baseName,
          placeholderCount: placeholderEntry.languageInfo.placeholderCount,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    console.log(`✅ Research completed for ${processedCount} language groups`);
    return researchResults;
  }

  /**
   * Apply researched placenames to replace placeholders
   */
  async applyReplacements(researchResults) {
    console.log(`🔄 Applying replacements for ${researchResults.size} language groups...`);
    
    // Initialize replacement engine with backup manager
    const BackupManager = require('./src/BackupManager');
    const FileUpdater = require('./src/FileUpdater');
    
    const backupManager = new BackupManager();
    const fileUpdater = new FileUpdater();
    this.replacementEngine = new ReplacementEngine(backupManager, fileUpdater);
    
    // Create backup before any modifications
    const backupPath = await this.replacementEngine.createBackup(this.options.namebaseFile);
    console.log(`📦 Created backup: ${backupPath}`);
    
    const replacementMap = new Map();
    
    // Prepare replacement map
    for (const [placeholderEntry, researchData] of researchResults) {
      if (researchData.error) {
        console.warn(`  ⚠️  Skipping ${researchData.languageGroup} due to research error`);
        continue;
      }
      
      const validatedPlacenames = researchData.validationResult?.validatedPlacenames || 
                                 researchData.researchResult?.placenames || [];
      
      if (validatedPlacenames.length >= researchData.placeholderCount) {
        // Use only the number of placenames we need
        const neededPlacenames = validatedPlacenames.slice(0, researchData.placeholderCount);
        replacementMap.set(placeholderEntry.originalEntry, neededPlacenames);
      } else {
        console.warn(`  ⚠️  Insufficient placenames for ${researchData.languageGroup}: need ${researchData.placeholderCount}, got ${validatedPlacenames.length}`);
      }
    }
    
    // Apply replacements
    const replacementResults = await this.replacementEngine.applyReplacements(replacementMap);
    
    console.log(`✅ Applied ${replacementResults.successfulReplacements} successful replacements`);
    
    return {
      ...replacementResults,
      backupPath,
      researchResults
    };
  }

  /**
   * Validate the quality and compatibility of replacements
   */
  async validateReplacements(replacementResults) {
    console.log(`✅ Validating ${replacementResults.successfulReplacements} replacements...`);
    
    const validationResults = {
      overallValid: false,
      systemCompatibility: null,
      qualityAssessment: null,
      issues: [],
      recommendations: []
    };
    
    try {
      // Test system compatibility
      console.log('  🔧 Testing system compatibility...');
      validationResults.systemCompatibility = await this.validationSystem.testSystemCompatibility(this.options.namebaseFile);
      
      if (!validationResults.systemCompatibility.passed) {
        validationResults.issues.push('System compatibility test failed');
        validationResults.recommendations.push('Review system integration issues before proceeding');
      }
      
      // Assess replacement quality
      console.log('  📊 Assessing replacement quality...');
      const allReplacements = replacementResults.replacements || [];
      const qualityResults = [];
      
      for (const replacement of allReplacements) {
        if (replacement.result && replacement.result.newPlacenames) {
          const languageGroup = replacement.entry.name;
          const placenames = replacement.result.newPlacenames;
          
          const qualityCheck = this.validationSystem.checkQualityThresholds(placenames);
          qualityResults.push({
            languageGroup,
            ...qualityCheck
          });
        }
      }
      
      validationResults.qualityAssessment = {
        totalGroups: qualityResults.length,
        passedGroups: qualityResults.filter(r => r.passed).length,
        averageQuality: qualityResults.length > 0 
          ? qualityResults.reduce((sum, r) => sum + r.qualityScore, 0) / qualityResults.length 
          : 0,
        details: qualityResults
      };
      
      // Overall validation
      const compatibilityPassed = validationResults.systemCompatibility?.passed || false;
      const qualityPassed = validationResults.qualityAssessment.averageQuality >= 0.7;
      
      validationResults.overallValid = compatibilityPassed && qualityPassed;
      
      if (!qualityPassed) {
        validationResults.issues.push('Average quality score below threshold');
        validationResults.recommendations.push('Review low-quality replacements and consider additional research');
      }
      
      console.log(`✅ Validation completed - Overall valid: ${validationResults.overallValid}`);
      
    } catch (error) {
      validationResults.issues.push(`Validation error: ${error.message}`);
      console.error(`❌ Validation failed: ${error.message}`);
    }
    
    return validationResults;
  }

  /**
   * Generate comprehensive final report
   */
  async generateFinalReport(replacementResults, validationResults) {
    console.log('📄 Generating comprehensive final report...');
    
    try {
      // Create detailed change report
      const changeReport = await this.reportGenerator.createChangeReport(replacementResults.replacements || []);
      
      // Generate source citations
      const sourceCitations = this.reportGenerator.generateSourceCitations(replacementResults.researchResults ? Array.from(replacementResults.researchResults.values()) : []);
      
      // Calculate statistics
      const statistics = this.reportGenerator.calculateReplacementStatistics(replacementResults.replacements || []);
      
      // Create audit trail
      const auditTrail = this.reportGenerator.createAuditTrail([
        ...replacementResults.replacements || [],
        { type: 'validation', data: validationResults, timestamp: new Date().toISOString() }
      ]);
      
      // Combine all report data
      const finalReport = {
        metadata: {
          generatedAt: new Date().toISOString(),
          toolVersion: '1.0.0',
          namebaseFile: this.options.namebaseFile,
          backupPath: replacementResults.backupPath,
          dryRun: this.options.dryRun
        },
        summary: {
          totalPlaceholders: changeReport.summary?.totalPlaceholdersReplaced || 0,
          languageGroupsAffected: changeReport.summary?.languageGroupsAffected || 0,
          successfulReplacements: replacementResults.successfulReplacements || 0,
          failedReplacements: replacementResults.failedReplacements || 0,
          overallValid: validationResults.overallValid,
          averageQuality: validationResults.qualityAssessment?.averageQuality || 0
        },
        changeReport,
        sourceCitations,
        statistics,
        validationResults,
        auditTrail,
        recommendations: this.generateRecommendations(validationResults, statistics)
      };
      
      // Export in multiple formats
      const exportResults = await this.reportGenerator.exportMultipleFormats(finalReport, this.options.reportFormat);
      
      console.log('📊 Report generation completed:');
      Object.entries(exportResults.exports).forEach(([format, result]) => {
        if (result.success) {
          console.log(`  ✅ ${format.toUpperCase()}: ${result.filename}`);
        } else {
          console.log(`  ❌ ${format.toUpperCase()}: ${result.error}`);
        }
      });
      
      return {
        ...finalReport,
        exportResults
      };
      
    } catch (error) {
      console.error(`❌ Report generation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate recommendations based on validation and statistics
   */
  generateRecommendations(validationResults, statistics) {
    const recommendations = [];
    
    // System compatibility recommendations
    if (!validationResults.systemCompatibility?.passed) {
      recommendations.push({
        type: 'critical',
        title: 'System Compatibility Issues',
        description: 'Address system compatibility issues before using updated namebases',
        actions: ['Review compatibility test results', 'Fix integration issues', 'Re-run validation']
      });
    }
    
    // Quality recommendations
    const avgQuality = validationResults.qualityAssessment?.averageQuality || 0;
    if (avgQuality < 0.6) {
      recommendations.push({
        type: 'high',
        title: 'Low Quality Replacements',
        description: 'Many replacements have low quality scores',
        actions: ['Review research sources', 'Improve validation criteria', 'Consider manual review']
      });
    } else if (avgQuality < 0.8) {
      recommendations.push({
        type: 'medium',
        title: 'Moderate Quality Replacements',
        description: 'Quality is acceptable but could be improved',
        actions: ['Review failed validations', 'Consider additional sources']
      });
    }
    
    // Success rate recommendations
    const successRate = statistics?.successRate || 0;
    if (successRate < 0.8) {
      recommendations.push({
        type: 'high',
        title: 'Low Success Rate',
        description: 'Many replacement operations failed',
        actions: ['Review error logs', 'Improve research methodology', 'Check source availability']
      });
    }
    
    // Source diversity recommendations
    const sourceCount = Object.keys(statistics?.breakdown?.bySourceType || {}).length;
    if (sourceCount < 3) {
      recommendations.push({
        type: 'medium',
        title: 'Limited Source Diversity',
        description: 'Consider using more diverse research sources',
        actions: ['Add geographic databases', 'Include linguistic resources', 'Expand Wikipedia coverage']
      });
    }
    
    return recommendations;
  }

  /**
   * Utility method for rate limiting
   */
  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// CLI argument parsing
function parseArguments() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: args.includes('--dry-run') || args.includes('--analyze'),
    createBackup: !args.includes('--no-backup'),
    reportFormat: ['json', 'markdown'],
    verbose: args.includes('--verbose') || args.includes('-v'),
    help: args.includes('--help') || args.includes('-h')
  };

  // Parse report format options
  const formatIndex = args.findIndex(arg => arg.startsWith('--format='));
  if (formatIndex !== -1) {
    const formatArg = args[formatIndex].split('=')[1];
    options.reportFormat = formatArg.split(',').map(f => f.trim().toLowerCase());
  }

  // Parse output directory
  const outputIndex = args.findIndex(arg => arg.startsWith('--output='));
  if (outputIndex !== -1) {
    options.outputDir = args[outputIndex].split('=')[1];
  }

  // Parse namebase file path
  const fileIndex = args.findIndex(arg => arg.startsWith('--file='));
  if (fileIndex !== -1) {
    options.namebaseFile = args[fileIndex].split('=')[1];
  }

  if (options.help) {
    console.log(`
Placename Placeholder Replacement Tool

Usage: node replace-placeholders.js [options]

Options:
  --dry-run, --analyze           Analyze placeholders without making changes
  --no-backup                   Skip creating backup files (not recommended)
  --format=json,csv,markdown    Report output formats (default: json,markdown)
  --output=<directory>          Output directory for reports
  --file=<path>                 Path to namebase file to process
  --verbose, -v                 Enable verbose logging
  --help, -h                    Show this help message

Examples:
  node replace-placeholders.js --dry-run                    # Analyze placeholders only
  node replace-placeholders.js                              # Replace placeholders with backup
  node replace-placeholders.js --no-backup                  # Replace without backup (risky)
  node replace-placeholders.js --format=json,csv            # Generate JSON and CSV reports
  node replace-placeholders.js --output=./custom-reports    # Custom output directory
  node replace-placeholders.js --verbose --dry-run          # Verbose analysis mode

Report Formats:
  json        Machine-readable JSON format with full details
  csv         Comma-separated values for spreadsheet analysis
  markdown    Human-readable Markdown format for documentation

Safety Features:
  - Automatic backup creation before any modifications
  - Comprehensive validation of all changes
  - Rollback capability if issues are detected
  - Detailed audit trail of all operations

For more information, see: tools/placename-replacement/README.md
`);
    process.exit(0);
  }

  return options;
}

// Main execution
if (require.main === module) {
  const options = parseArguments();
  const tool = new PlaceholderReplacementTool(options);
  
  tool.run()
    .then(result => {
      console.log('\n✨ Tool execution completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Tool execution failed:', error.message);
      process.exit(1);
    });
}

module.exports = PlaceholderReplacementTool;