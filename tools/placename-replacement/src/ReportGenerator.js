/**
 * ReportGenerator - Creates comprehensive documentation and reports
 * 
 * Responsible for:
 * - Generating detailed before/after reports
 * - Creating source citations and audit trails
 * - Calculating replacement statistics
 * - Supporting multiple output formats
 */
class ReportGenerator {
  constructor(config = {}) {
    this.config = {
      outputFormats: ['json', 'csv', 'markdown'],
      includeSourceCitations: true,
      generateStatistics: true,
      ...config
    };
    this.reports = [];
  }

  /**
   * Create comprehensive change report organized by language group
   * @param {Array} replacements - Array of replacement operations
   * @returns {Promise<Object>} Detailed change report
   */
  async createChangeReport(replacements) {
    if (!Array.isArray(replacements)) {
      throw new Error('Replacements must be an array');
    }

    const report = {
      metadata: {
        generatedAt: new Date().toISOString(),
        totalReplacements: replacements.length,
        reportVersion: '1.0.0'
      },
      summary: {
        languageGroupsAffected: 0,
        totalPlaceholdersReplaced: 0,
        successfulReplacements: 0,
        failedReplacements: 0,
        coverageRate: 0
      },
      languageGroups: {},
      detailedChanges: [],
      sourceCitations: {},
      statistics: {}
    };

    // Track language groups and organize replacements
    const languageGroupMap = new Map();
    let totalPlaceholdersReplaced = 0;
    let successfulReplacements = 0;
    let failedReplacements = 0;

    replacements.forEach((replacement, index) => {
      try {
        const languageGroup = this._extractLanguageGroup(replacement);
        const changeRecord = this._createChangeRecord(replacement, index);
        
        // Track by language group
        if (!languageGroupMap.has(languageGroup)) {
          languageGroupMap.set(languageGroup, {
            name: languageGroup,
            replacements: [],
            statistics: {
              totalPlaceholders: 0,
              successfulReplacements: 0,
              failedReplacements: 0,
              sourcesUsed: new Set()
            }
          });
        }

        const groupData = languageGroupMap.get(languageGroup);
        groupData.replacements.push(changeRecord);

        // Update statistics
        if (changeRecord.success) {
          successfulReplacements++;
          groupData.statistics.successfulReplacements++;
          totalPlaceholdersReplaced += changeRecord.placeholdersReplaced || 0;
          groupData.statistics.totalPlaceholders += changeRecord.placeholdersReplaced || 0;

          // Track sources used
          if (changeRecord.sources) {
            changeRecord.sources.forEach(source => {
              groupData.statistics.sourcesUsed.add(source.name || source);
            });
          }
        } else {
          failedReplacements++;
          groupData.statistics.failedReplacements++;
        }

        report.detailedChanges.push(changeRecord);

      } catch (error) {
        console.warn(`Error processing replacement ${index}:`, error.message);
        failedReplacements++;
        
        report.detailedChanges.push({
          index,
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Populate summary statistics
    report.summary.languageGroupsAffected = languageGroupMap.size;
    report.summary.totalPlaceholdersReplaced = totalPlaceholdersReplaced;
    report.summary.successfulReplacements = successfulReplacements;
    report.summary.failedReplacements = failedReplacements;
    report.summary.coverageRate = replacements.length > 0 ? successfulReplacements / replacements.length : 0;

    // Convert language group map to object and clean up sets
    languageGroupMap.forEach((groupData, languageGroup) => {
      groupData.statistics.sourcesUsed = Array.from(groupData.statistics.sourcesUsed);
      report.languageGroups[languageGroup] = groupData;
    });

    // Generate source citations
    if (this.config.includeSourceCitations) {
      report.sourceCitations = this.generateSourceCitations(replacements);
    }

    // Generate detailed statistics
    if (this.config.generateStatistics) {
      report.statistics = this.calculateReplacementStatistics(replacements);
    }

    // Store report for future reference
    this.reports.push(report);

    return report;
  }

  /**
   * Generate source citations for replacement placenames
   * @param {Array} researchResults - Research results with source information
   * @returns {Object} Formatted source citations
   */
  generateSourceCitations(researchResults) {
    if (!Array.isArray(researchResults)) {
      return {};
    }

    const citations = {
      bySource: {},
      byLanguageGroup: {},
      summary: {
        totalSources: 0,
        sourceTypes: new Set(),
        reliabilityDistribution: {}
      }
    };

    researchResults.forEach((result, index) => {
      try {
        const languageGroup = this._extractLanguageGroup(result);
        const sources = this._extractSources(result);

        sources.forEach(source => {
          const sourceKey = source.name || source.url || `source_${index}`;
          
          // Track by source
          if (!citations.bySource[sourceKey]) {
            citations.bySource[sourceKey] = {
              name: source.name || sourceKey,
              url: source.url || '',
              type: source.type || 'unknown',
              reliability: source.reliability || 0.5,
              languageGroups: new Set(),
              placenamesProvided: [],
              firstUsed: new Date().toISOString(),
              usageCount: 0
            };
          }

          const sourceData = citations.bySource[sourceKey];
          sourceData.languageGroups.add(languageGroup);
          sourceData.usageCount++;
          
          if (result.newPlacenames) {
            sourceData.placenamesProvided.push(...result.newPlacenames);
          }

          // Track by language group
          if (!citations.byLanguageGroup[languageGroup]) {
            citations.byLanguageGroup[languageGroup] = {
              sources: [],
              totalPlacenames: 0,
              averageReliability: 0
            };
          }

          const langGroupData = citations.byLanguageGroup[languageGroup];
          if (!langGroupData.sources.find(s => s.name === sourceKey)) {
            langGroupData.sources.push({
              name: sourceKey,
              url: source.url || '',
              reliability: source.reliability || 0.5,
              placenamesCount: result.newPlacenames ? result.newPlacenames.length : 0
            });
          }

          // Update summary statistics
          citations.summary.sourceTypes.add(source.type || 'unknown');
          
          const reliabilityRange = this._getReliabilityRange(source.reliability || 0.5);
          citations.summary.reliabilityDistribution[reliabilityRange] = 
            (citations.summary.reliabilityDistribution[reliabilityRange] || 0) + 1;
        });

      } catch (error) {
        console.warn(`Error processing research result ${index} for citations:`, error.message);
      }
    });

    // Clean up sets and calculate averages
    Object.keys(citations.bySource).forEach(sourceKey => {
      const sourceData = citations.bySource[sourceKey];
      sourceData.languageGroups = Array.from(sourceData.languageGroups);
    });

    Object.keys(citations.byLanguageGroup).forEach(langGroup => {
      const langData = citations.byLanguageGroup[langGroup];
      langData.totalPlacenames = langData.sources.reduce((sum, source) => sum + source.placenamesCount, 0);
      langData.averageReliability = langData.sources.length > 0 
        ? langData.sources.reduce((sum, source) => sum + source.reliability, 0) / langData.sources.length 
        : 0;
    });

    citations.summary.totalSources = Object.keys(citations.bySource).length;
    citations.summary.sourceTypes = Array.from(citations.summary.sourceTypes);

    return citations;
  }

  /**
   * Calculate replacement coverage and success rates
   * @param {Array} replacements - Replacement operations to analyze
   * @returns {Object} Statistics including coverage and success rates
   */
  calculateReplacementStatistics(replacements) {
    if (!Array.isArray(replacements)) {
      return {
        totalOperations: 0,
        successRate: 0,
        failureRate: 0,
        coverageByLanguageGroup: {},
        placeholderTypeDistribution: {},
        averageReplacementsPerGroup: 0,
        qualityMetrics: {}
      };
    }

    const stats = {
      totalOperations: replacements.length,
      successfulOperations: 0,
      failedOperations: 0,
      successRate: 0,
      failureRate: 0,
      coverageByLanguageGroup: {},
      placeholderTypeDistribution: {
        unq: 0,
        u: 0,
        truncated: 0,
        mixed: 0,
        unknown: 0
      },
      averageReplacementsPerGroup: 0,
      qualityMetrics: {
        averageConfidence: 0,
        highQualityReplacements: 0,
        mediumQualityReplacements: 0,
        lowQualityReplacements: 0
      },
      timeMetrics: {
        totalProcessingTime: 0,
        averageTimePerReplacement: 0,
        fastestReplacement: null,
        slowestReplacement: null
      }
    };

    const languageGroupStats = new Map();
    let totalConfidence = 0;
    let confidenceCount = 0;
    let totalProcessingTime = 0;
    const processingTimes = [];

    replacements.forEach((replacement, index) => {
      try {
        const languageGroup = this._extractLanguageGroup(replacement);
        const isSuccessful = this._isReplacementSuccessful(replacement);
        
        // Track success/failure
        if (isSuccessful) {
          stats.successfulOperations++;
        } else {
          stats.failedOperations++;
        }

        // Track by language group
        if (!languageGroupStats.has(languageGroup)) {
          languageGroupStats.set(languageGroup, {
            total: 0,
            successful: 0,
            failed: 0,
            placeholdersReplaced: 0,
            averageConfidence: 0,
            confidenceSum: 0,
            confidenceCount: 0
          });
        }

        const groupStats = languageGroupStats.get(languageGroup);
        groupStats.total++;
        
        if (isSuccessful) {
          groupStats.successful++;
          groupStats.placeholdersReplaced += replacement.placeholdersReplaced || 0;
        } else {
          groupStats.failed++;
        }

        // Track placeholder types
        if (replacement.originalPlaceholders) {
          replacement.originalPlaceholders.forEach(placeholder => {
            const type = this._classifyPlaceholderType(placeholder);
            stats.placeholderTypeDistribution[type]++;
          });
        }

        // Track quality metrics
        const confidence = replacement.confidence || replacement.researchResult?.confidence || 0;
        if (confidence > 0 && isSuccessful) { // Only count quality for successful replacements
          totalConfidence += confidence;
          confidenceCount++;
          groupStats.confidenceSum += confidence;
          groupStats.confidenceCount++;

          if (confidence >= 0.8) {
            stats.qualityMetrics.highQualityReplacements++;
          } else if (confidence >= 0.5) {
            stats.qualityMetrics.mediumQualityReplacements++;
          } else {
            stats.qualityMetrics.lowQualityReplacements++;
          }
        }

        // Track timing metrics
        const processingTime = replacement.processingTime || 0;
        if (processingTime > 0) {
          totalProcessingTime += processingTime;
          processingTimes.push(processingTime);
        }

      } catch (error) {
        console.warn(`Error processing replacement ${index} for statistics:`, error.message);
        stats.failedOperations++;
      }
    });

    // Calculate final statistics
    stats.successRate = stats.totalOperations > 0 ? stats.successfulOperations / stats.totalOperations : 0;
    stats.failureRate = stats.totalOperations > 0 ? stats.failedOperations / stats.totalOperations : 0;
    stats.qualityMetrics.averageConfidence = confidenceCount > 0 ? totalConfidence / confidenceCount : 0;

    // Calculate language group coverage
    languageGroupStats.forEach((groupStats, languageGroup) => {
      groupStats.averageConfidence = groupStats.confidenceCount > 0 
        ? groupStats.confidenceSum / groupStats.confidenceCount 
        : 0;
      
      stats.coverageByLanguageGroup[languageGroup] = {
        totalOperations: groupStats.total,
        successfulOperations: groupStats.successful,
        failedOperations: groupStats.failed,
        successRate: groupStats.total > 0 ? groupStats.successful / groupStats.total : 0,
        placeholdersReplaced: groupStats.placeholdersReplaced,
        averageConfidence: groupStats.averageConfidence
      };
    });

    stats.averageReplacementsPerGroup = languageGroupStats.size > 0 
      ? stats.successfulOperations / languageGroupStats.size 
      : 0;

    // Calculate timing metrics
    if (processingTimes.length > 0) {
      stats.timeMetrics.totalProcessingTime = totalProcessingTime;
      stats.timeMetrics.averageTimePerReplacement = totalProcessingTime / processingTimes.length;
      stats.timeMetrics.fastestReplacement = Math.min(...processingTimes);
      stats.timeMetrics.slowestReplacement = Math.max(...processingTimes);
    }

    return stats;
  }

  /**
   * Export report in multiple formats (JSON, CSV, Markdown)
   * @param {Object} report - Report data to export
   * @param {Array} formats - Array of formats to generate
   * @returns {Promise<Object>} Paths to generated report files
   */
  async exportMultipleFormats(report, formats = ['json', 'csv', 'markdown']) {
    if (!report || typeof report !== 'object') {
      throw new Error('Report data is required for export');
    }

    if (!Array.isArray(formats)) {
      throw new Error('Formats must be an array');
    }

    const fs = require('fs').promises;
    const path = require('path');
    const os = require('os');

    const results = {
      exports: {},
      errors: [],
      timestamp: new Date().toISOString()
    };

    // Create output directory
    const outputDir = path.join(process.cwd(), 'reports', 'placename-replacement');
    await fs.mkdir(outputDir, { recursive: true });

    // Generate timestamp for filenames
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const baseFilename = `placename-replacement-report-${timestamp}`;

    for (const format of formats) {
      try {
        let normalizedFormat = format.toLowerCase();
        let content;
        let filename;
        let filePath;

        switch (normalizedFormat) {
          case 'json':
            content = this._exportAsJSON(report);
            filename = `${baseFilename}.json`;
            filePath = path.join(outputDir, filename);
            break;

          case 'csv':
            content = this._exportAsCSV(report);
            filename = `${baseFilename}.csv`;
            filePath = path.join(outputDir, filename);
            break;

          case 'markdown':
          case 'md':
            content = this._exportAsMarkdown(report);
            filename = `${baseFilename}.md`;
            filePath = path.join(outputDir, filename);
            // Always use 'md' as the key for consistency
            normalizedFormat = 'md';
            break;

          default:
            throw new Error(`Unsupported format: ${format}`);
        }

        // Write file
        await fs.writeFile(filePath, content, 'utf8');

        results.exports[normalizedFormat] = {
          path: filePath,
          filename: filename,
          size: content.length,
          success: true
        };

      } catch (error) {
        results.errors.push({
          format: format,
          error: error.message,
          timestamp: new Date().toISOString()
        });

        results.exports[format] = {
          success: false,
          error: error.message
        };
      }
    }

    return results;
  }

  /**
   * Generate human-readable summary report
   * @param {Object} reportData - Raw report data
   * @returns {string} Formatted human-readable report
   */
  generateHumanReadableReport(reportData) {
    if (!reportData || typeof reportData !== 'object') {
      return 'No report data available';
    }

    const lines = [];
    
    // Header
    lines.push('# Placename Replacement Report');
    lines.push('');
    lines.push(`Generated: ${reportData.metadata?.generatedAt || new Date().toISOString()}`);
    lines.push(`Report Version: ${reportData.metadata?.reportVersion || '1.0.0'}`);
    lines.push('');

    // Executive Summary
    lines.push('## Executive Summary');
    lines.push('');
    if (reportData.summary) {
      lines.push(`- **Total Replacement Operations**: ${reportData.summary.totalReplacements || 0}`);
      lines.push(`- **Language Groups Affected**: ${reportData.summary.languageGroupsAffected || 0}`);
      lines.push(`- **Placeholders Replaced**: ${reportData.summary.totalPlaceholdersReplaced || 0}`);
      lines.push(`- **Successful Replacements**: ${reportData.summary.successfulReplacements || 0}`);
      lines.push(`- **Failed Replacements**: ${reportData.summary.failedReplacements || 0}`);
      lines.push(`- **Overall Success Rate**: ${((reportData.summary.coverageRate || 0) * 100).toFixed(1)}%`);
    }
    lines.push('');

    // Language Groups Overview
    if (reportData.languageGroups && Object.keys(reportData.languageGroups).length > 0) {
      lines.push('## Language Groups Overview');
      lines.push('');
      
      const sortedGroups = Object.entries(reportData.languageGroups)
        .sort(([,a], [,b]) => (b.statistics?.totalPlaceholders || 0) - (a.statistics?.totalPlaceholders || 0));

      sortedGroups.forEach(([groupName, groupData]) => {
        lines.push(`### ${groupName}`);
        lines.push('');
        lines.push(`- **Total Placeholders**: ${groupData.statistics?.totalPlaceholders || 0}`);
        lines.push(`- **Successful Replacements**: ${groupData.statistics?.successfulReplacements || 0}`);
        lines.push(`- **Failed Replacements**: ${groupData.statistics?.failedReplacements || 0}`);
        lines.push(`- **Sources Used**: ${groupData.statistics?.sourcesUsed?.length || 0}`);
        
        if (groupData.statistics?.sourcesUsed?.length > 0) {
          lines.push(`- **Primary Sources**: ${groupData.statistics.sourcesUsed.slice(0, 3).join(', ')}`);
        }
        lines.push('');
      });
    }

    // Quality Metrics
    if (reportData.statistics?.qualityMetrics) {
      lines.push('## Quality Metrics');
      lines.push('');
      const qm = reportData.statistics.qualityMetrics;
      lines.push(`- **Average Confidence**: ${(qm.averageConfidence * 100).toFixed(1)}%`);
      lines.push(`- **High Quality Replacements**: ${qm.highQualityReplacements || 0} (≥80% confidence)`);
      lines.push(`- **Medium Quality Replacements**: ${qm.mediumQualityReplacements || 0} (50-79% confidence)`);
      lines.push(`- **Low Quality Replacements**: ${qm.lowQualityReplacements || 0} (<50% confidence)`);
      lines.push('');
    }

    // Source Citations Summary
    if (reportData.sourceCitations?.summary) {
      lines.push('## Source Citations Summary');
      lines.push('');
      const sc = reportData.sourceCitations.summary;
      lines.push(`- **Total Sources Used**: ${sc.totalSources || 0}`);
      lines.push(`- **Source Types**: ${sc.sourceTypes?.join(', ') || 'None'}`);
      
      if (sc.reliabilityDistribution) {
        lines.push('- **Reliability Distribution**:');
        Object.entries(sc.reliabilityDistribution).forEach(([range, count]) => {
          lines.push(`  - ${range}: ${count} sources`);
        });
      }
      lines.push('');
    }

    // Performance Metrics
    if (reportData.statistics?.timeMetrics) {
      lines.push('## Performance Metrics');
      lines.push('');
      const tm = reportData.statistics.timeMetrics;
      if (tm.totalProcessingTime > 0) {
        lines.push(`- **Total Processing Time**: ${tm.totalProcessingTime.toFixed(2)}ms`);
        lines.push(`- **Average Time per Replacement**: ${tm.averageTimePerReplacement.toFixed(2)}ms`);
        lines.push(`- **Fastest Replacement**: ${tm.fastestReplacement.toFixed(2)}ms`);
        lines.push(`- **Slowest Replacement**: ${tm.slowestReplacement.toFixed(2)}ms`);
      } else {
        lines.push('- No timing data available');
      }
      lines.push('');
    }

    // Recommendations
    lines.push('## Recommendations');
    lines.push('');
    
    const successRate = reportData.summary?.coverageRate || 0;
    if (successRate < 0.8) {
      lines.push('- **Action Required**: Success rate is below 80%. Review failed replacements and consider additional research sources.');
    } else if (successRate < 0.95) {
      lines.push('- **Good Progress**: Success rate is acceptable but could be improved. Consider reviewing failed cases.');
    } else {
      lines.push('- **Excellent Results**: High success rate achieved. System is performing well.');
    }

    const avgConfidence = reportData.statistics?.qualityMetrics?.averageConfidence || 0;
    if (avgConfidence < 0.6) {
      lines.push('- **Quality Concern**: Average confidence is low. Consider using more reliable sources or additional validation.');
    } else if (avgConfidence < 0.8) {
      lines.push('- **Quality Acceptable**: Confidence levels are reasonable but could be improved.');
    } else {
      lines.push('- **High Quality**: Excellent confidence levels in replacements.');
    }

    lines.push('');
    lines.push('---');
    lines.push('');
    lines.push('*This report was generated automatically by the Placename Replacement System*');

    return lines.join('\n');
  }

  /**
   * Create machine-readable audit trail
   * @param {Array} operations - Array of all operations performed
   * @returns {Object} Structured audit trail data
   */
  createAuditTrail(operations) {
    if (!Array.isArray(operations)) {
      return {
        auditTrail: [],
        summary: {
          totalOperations: 0,
          operationTypes: {},
          timespan: null,
          systemInfo: this._getSystemInfo()
        }
      };
    }

    const auditTrail = {
      version: '1.0.0',
      generatedAt: new Date().toISOString(),
      operations: [],
      summary: {
        totalOperations: operations.length,
        operationTypes: {},
        timespan: null,
        systemInfo: this._getSystemInfo()
      },
      integrity: {
        checksum: null,
        operationHashes: []
      }
    };

    let earliestTimestamp = null;
    let latestTimestamp = null;

    operations.forEach((operation, index) => {
      try {
        const auditEntry = this._createAuditEntry(operation, index);
        auditTrail.operations.push(auditEntry);

        // Track operation types
        const opType = auditEntry.operationType;
        auditTrail.summary.operationTypes[opType] = (auditTrail.summary.operationTypes[opType] || 0) + 1;

        // Track timespan
        const timestamp = new Date(auditEntry.timestamp);
        if (!earliestTimestamp || timestamp < earliestTimestamp) {
          earliestTimestamp = timestamp;
        }
        if (!latestTimestamp || timestamp > latestTimestamp) {
          latestTimestamp = timestamp;
        }

        // Generate operation hash for integrity
        const operationHash = this._generateOperationHash(auditEntry);
        auditTrail.integrity.operationHashes.push(operationHash);

      } catch (error) {
        console.warn(`Error creating audit entry for operation ${index}:`, error.message);
        
        // Add error entry to audit trail
        auditTrail.operations.push({
          index,
          operationType: 'error',
          timestamp: new Date().toISOString(),
          error: error.message,
          originalOperation: operation
        });
      }
    });

    // Set timespan
    if (earliestTimestamp && latestTimestamp) {
      auditTrail.summary.timespan = {
        start: earliestTimestamp.toISOString(),
        end: latestTimestamp.toISOString(),
        durationMs: latestTimestamp.getTime() - earliestTimestamp.getTime()
      };
    }

    // Generate overall checksum
    auditTrail.integrity.checksum = this._generateAuditChecksum(auditTrail);

    return auditTrail;
  }

  /**
   * Generate summary statistics for replacement operations
   * @param {Array} replacements - Replacement operations
   * @returns {Object} Summary statistics and metrics
   */
  generateSummaryStatistics(replacements) {
    if (!Array.isArray(replacements)) {
      return {
        overview: {
          totalOperations: 0,
          successRate: 0,
          averageConfidence: 0
        },
        breakdown: {},
        trends: {},
        recommendations: []
      };
    }

    const summary = {
      overview: {
        totalOperations: replacements.length,
        successfulOperations: 0,
        failedOperations: 0,
        successRate: 0,
        averageConfidence: 0,
        totalPlaceholdersReplaced: 0
      },
      breakdown: {
        byLanguageGroup: {},
        byPlaceholderType: {},
        byQualityLevel: {
          high: 0,    // ≥ 0.8 confidence
          medium: 0,  // 0.5-0.79 confidence
          low: 0      // < 0.5 confidence
        },
        bySourceType: {}
      },
      trends: {
        confidenceDistribution: [],
        processingTimeDistribution: [],
        successRateByLanguageFamily: {}
      },
      recommendations: []
    };

    let totalConfidence = 0;
    let confidenceCount = 0;
    const confidenceValues = [];
    const processingTimes = [];

    replacements.forEach((replacement, index) => {
      try {
        const isSuccessful = this._isReplacementSuccessful(replacement);
        const languageGroup = this._extractLanguageGroup(replacement);
        const confidence = replacement.confidence || replacement.researchResult?.confidence || 0;

        // Update overview
        if (isSuccessful) {
          summary.overview.successfulOperations++;
          summary.overview.totalPlaceholdersReplaced += replacement.placeholdersReplaced || 0;
        } else {
          summary.overview.failedOperations++;
        }

        // Track confidence
        if (confidence > 0) {
          totalConfidence += confidence;
          confidenceCount++;
          confidenceValues.push(confidence);

          // Quality level breakdown
          if (confidence >= 0.8) {
            summary.breakdown.byQualityLevel.high++;
          } else if (confidence >= 0.5) {
            summary.breakdown.byQualityLevel.medium++;
          } else {
            summary.breakdown.byQualityLevel.low++;
          }
        }

        // Language group breakdown
        if (!summary.breakdown.byLanguageGroup[languageGroup]) {
          summary.breakdown.byLanguageGroup[languageGroup] = {
            total: 0,
            successful: 0,
            failed: 0,
            averageConfidence: 0,
            totalPlaceholders: 0
          };
        }

        const langStats = summary.breakdown.byLanguageGroup[languageGroup];
        langStats.total++;
        if (isSuccessful) {
          langStats.successful++;
          langStats.totalPlaceholders += replacement.placeholdersReplaced || 0;
        } else {
          langStats.failed++;
        }

        // Placeholder type breakdown
        if (replacement.originalPlaceholders) {
          replacement.originalPlaceholders.forEach(placeholder => {
            const type = this._classifyPlaceholderType(placeholder);
            summary.breakdown.byPlaceholderType[type] = (summary.breakdown.byPlaceholderType[type] || 0) + 1;
          });
        }

        // Source type breakdown
        if (replacement.researchResult?.sources) {
          replacement.researchResult.sources.forEach(source => {
            const sourceType = source.type || this._inferSourceType(source.name || '');
            summary.breakdown.bySourceType[sourceType] = (summary.breakdown.bySourceType[sourceType] || 0) + 1;
          });
        }

        // Processing time tracking
        if (replacement.processingTime) {
          processingTimes.push(replacement.processingTime);
        }

      } catch (error) {
        console.warn(`Error processing replacement ${index} for summary statistics:`, error.message);
        summary.overview.failedOperations++;
      }
    });

    // Calculate final overview statistics
    summary.overview.successRate = summary.overview.totalOperations > 0 
      ? summary.overview.successfulOperations / summary.overview.totalOperations 
      : 0;
    
    summary.overview.averageConfidence = confidenceCount > 0 
      ? totalConfidence / confidenceCount 
      : 0;

    // Calculate language group averages
    Object.keys(summary.breakdown.byLanguageGroup).forEach(langGroup => {
      const stats = summary.breakdown.byLanguageGroup[langGroup];
      stats.successRate = stats.total > 0 ? stats.successful / stats.total : 0;
      
      // Calculate average confidence for this language group
      const langConfidences = [];
      replacements.forEach(replacement => {
        if (this._extractLanguageGroup(replacement) === langGroup) {
          const confidence = replacement.confidence || replacement.researchResult?.confidence || 0;
          if (confidence > 0) {
            langConfidences.push(confidence);
          }
        }
      });
      
      stats.averageConfidence = langConfidences.length > 0 
        ? langConfidences.reduce((sum, conf) => sum + conf, 0) / langConfidences.length 
        : 0;
    });

    // Generate trends
    if (confidenceValues.length > 0) {
      summary.trends.confidenceDistribution = this._calculateDistribution(confidenceValues, 10);
    }

    if (processingTimes.length > 0) {
      summary.trends.processingTimeDistribution = this._calculateDistribution(processingTimes, 10);
    }

    // Generate recommendations
    summary.recommendations = this._generateRecommendations(summary);

    return summary;
  }

  /**
   * Create detailed before/after comparison report
   * @param {Object} beforeData - Data before replacements
   * @param {Object} afterData - Data after replacements
   * @returns {Object} Detailed comparison report
   */
  createBeforeAfterComparison(beforeData, afterData) {
    // Implementation will be added in subsequent tasks
    throw new Error('createBeforeAfterComparison not yet implemented');
  }

  // Helper methods

  /**
   * Extract language group from replacement data
   * @private
   * @param {Object} replacement - Replacement operation data
   * @returns {string} Language group name
   */
  _extractLanguageGroup(replacement) {
    if (!replacement) return 'unknown';
    
    return replacement.languageGroup || 
           replacement.entry?.name || 
           replacement.name || 
           'unknown';
  }

  /**
   * Create a detailed change record for a replacement
   * @private
   * @param {Object} replacement - Replacement operation
   * @param {number} index - Index of the replacement
   * @returns {Object} Detailed change record
   */
  _createChangeRecord(replacement, index) {
    const record = {
      index,
      timestamp: replacement.timestamp || new Date().toISOString(),
      languageGroup: this._extractLanguageGroup(replacement),
      success: this._isReplacementSuccessful(replacement),
      placeholdersReplaced: 0,
      beforeAfter: {
        original: [],
        replaced: []
      },
      sources: [],
      confidence: 0,
      issues: []
    };

    try {
      // Extract placeholder information
      if (replacement.originalPlaceholders) {
        record.beforeAfter.original = replacement.originalPlaceholders;
        record.placeholdersReplaced = replacement.originalPlaceholders.length;
      }

      if (replacement.newPlacenames) {
        record.beforeAfter.replaced = replacement.newPlacenames;
      }

      // Extract source information
      if (replacement.researchResult?.sources) {
        record.sources = replacement.researchResult.sources;
      } else if (replacement.sources) {
        record.sources = replacement.sources;
      }

      // Extract confidence and quality metrics
      record.confidence = replacement.confidence || 
                         replacement.researchResult?.confidence || 0;

      // Extract any issues or warnings
      if (replacement.issues) {
        record.issues = replacement.issues;
      } else if (replacement.researchResult?.issues) {
        record.issues = replacement.researchResult.issues;
      }

      // Add metadata if available
      if (replacement.entry) {
        record.metadata = {
          entryIndex: replacement.entry.i,
          minLength: replacement.entry.min,
          maxLength: replacement.entry.max,
          dominantLetters: replacement.entry.d,
          multiplier: replacement.entry.m
        };
      }

    } catch (error) {
      record.success = false;
      record.issues.push(`Error creating change record: ${error.message}`);
    }

    return record;
  }

  /**
   * Extract sources from research result
   * @private
   * @param {Object} result - Research result
   * @returns {Array} Array of source objects
   */
  _extractSources(result) {
    const sources = [];

    if (result.researchResult?.sources) {
      sources.push(...result.researchResult.sources);
    } else if (result.sources) {
      sources.push(...result.sources);
    }

    // Ensure each source has required properties
    return sources.map(source => ({
      name: source.name || source.source || 'Unknown Source',
      url: source.url || '',
      type: source.type || this._inferSourceType(source.name || source.source || ''),
      reliability: source.reliability || 0.5
    }));
  }

  /**
   * Infer source type from source name
   * @private
   * @param {string} sourceName - Name of the source
   * @returns {string} Inferred source type
   */
  _inferSourceType(sourceName) {
    const name = sourceName.toLowerCase();
    
    if (name.includes('wikipedia')) return 'encyclopedia';
    if (name.includes('openstreetmap') || name.includes('osm')) return 'geographic_database';
    if (name.includes('geonames')) return 'geographic_database';
    if (name.includes('government') || name.includes('official')) return 'government';
    if (name.includes('academic') || name.includes('university')) return 'academic';
    if (name.includes('linguistic') || name.includes('language')) return 'linguistic';
    
    return 'unknown';
  }

  /**
   * Get reliability range for grouping
   * @private
   * @param {number} reliability - Reliability score (0-1)
   * @returns {string} Reliability range category
   */
  _getReliabilityRange(reliability) {
    if (reliability >= 0.8) return 'high';
    if (reliability >= 0.6) return 'medium';
    if (reliability >= 0.4) return 'low';
    return 'very_low';
  }

  /**
   * Check if a replacement operation was successful
   * @private
   * @param {Object} replacement - Replacement operation
   * @returns {boolean} True if successful
   */
  _isReplacementSuccessful(replacement) {
    if (replacement.success !== undefined && replacement.success !== null) {
      return Boolean(replacement.success);
    }

    if (replacement.result?.hasChanges !== undefined) {
      return replacement.result.hasChanges;
    }

    if (replacement.newPlacenames && replacement.newPlacenames.length > 0) {
      return true;
    }

    return false;
  }

  /**
   * Classify placeholder type from placeholder string
   * @private
   * @param {string} placeholder - Placeholder string
   * @returns {string} Placeholder type classification
   */
  _classifyPlaceholderType(placeholder) {
    if (!placeholder || typeof placeholder !== 'string') {
      return 'unknown';
    }

    const trimmed = placeholder.trim();
    
    if (/_\d+_unq\d+$/.test(trimmed)) {
      return 'unq';
    }
    
    if (/_\d+_u\d+$/.test(trimmed)) {
      return 'u';
    }
    
    if (/_\d+_unq$/.test(trimmed)) {
      return 'truncated';
    }
    
    if (/_\d+_(unq|u)/.test(trimmed)) {
      return 'mixed';
    }
    
    return 'unknown';
  }

  // Export format methods

  /**
   * Export report as JSON
   * @private
   * @param {Object} report - Report data
   * @returns {string} JSON formatted report
   */
  _exportAsJSON(report) {
    return JSON.stringify(report, null, 2);
  }

  /**
   * Export report as CSV
   * @private
   * @param {Object} report - Report data
   * @returns {string} CSV formatted report
   */
  _exportAsCSV(report) {
    const lines = [];
    
    // Header
    lines.push('Language Group,Total Placeholders,Successful Replacements,Failed Replacements,Success Rate,Average Confidence,Sources Used');
    
    // Data rows
    if (report.languageGroups) {
      Object.entries(report.languageGroups).forEach(([groupName, groupData]) => {
        const stats = groupData.statistics || {};
        const successRate = stats.successfulReplacements && stats.totalPlaceholders 
          ? (stats.successfulReplacements / (stats.successfulReplacements + stats.failedReplacements)).toFixed(3)
          : '0.000';
        
        const avgConfidence = this._calculateGroupAverageConfidence(groupData.replacements || []);
        const sourcesUsed = stats.sourcesUsed ? stats.sourcesUsed.join('; ') : '';
        
        lines.push([
          `"${groupName}"`,
          stats.totalPlaceholders || 0,
          stats.successfulReplacements || 0,
          stats.failedReplacements || 0,
          successRate,
          avgConfidence.toFixed(3),
          `"${sourcesUsed}"`
        ].join(','));
      });
    }
    
    return lines.join('\n');
  }

  /**
   * Export report as Markdown
   * @private
   * @param {Object} report - Report data
   * @returns {string} Markdown formatted report
   */
  _exportAsMarkdown(report) {
    return this.generateHumanReadableReport(report);
  }

  /**
   * Calculate average confidence for a group's replacements
   * @private
   * @param {Array} replacements - Array of replacement operations
   * @returns {number} Average confidence score
   */
  _calculateGroupAverageConfidence(replacements) {
    if (!Array.isArray(replacements) || replacements.length === 0) {
      return 0;
    }

    let totalConfidence = 0;
    let count = 0;

    replacements.forEach(replacement => {
      const confidence = replacement.confidence || 0;
      if (confidence > 0) {
        totalConfidence += confidence;
        count++;
      }
    });

    return count > 0 ? totalConfidence / count : 0;
  }

  // Audit trail helper methods

  /**
   * Create audit entry for an operation
   * @private
   * @param {Object} operation - Operation to audit
   * @param {number} index - Operation index
   * @returns {Object} Audit entry
   */
  _createAuditEntry(operation, index) {
    const entry = {
      index,
      operationType: this._determineOperationType(operation),
      timestamp: operation.timestamp || new Date().toISOString(),
      languageGroup: this._extractLanguageGroup(operation),
      success: this._isReplacementSuccessful(operation),
      details: {
        placeholdersReplaced: operation.placeholdersReplaced || 0,
        confidence: operation.confidence || operation.researchResult?.confidence || 0,
        sources: this._extractSourcesForAudit(operation)
      },
      changes: {
        before: operation.originalPlaceholders || [],
        after: operation.newPlacenames || []
      },
      metadata: {
        processingTime: operation.processingTime || 0,
        retryCount: operation.retryCount || 0,
        validationPassed: operation.validationPassed !== false
      }
    };

    // Add error information if operation failed
    if (!entry.success && operation.error) {
      entry.error = {
        message: operation.error.message || operation.error,
        code: operation.error.code || 'UNKNOWN_ERROR',
        stack: operation.error.stack || null
      };
    }

    return entry;
  }

  /**
   * Determine operation type from operation data
   * @private
   * @param {Object} operation - Operation to classify
   * @returns {string} Operation type
   */
  _determineOperationType(operation) {
    if (operation.operationType) {
      return operation.operationType;
    }

    if (operation.originalPlaceholders && operation.newPlacenames) {
      return 'placeholder_replacement';
    }

    if (operation.researchResult) {
      return 'research_operation';
    }

    if (operation.validationResult) {
      return 'validation_operation';
    }

    return 'unknown_operation';
  }

  /**
   * Extract sources for audit trail
   * @private
   * @param {Object} operation - Operation with source data
   * @returns {Array} Array of source information
   */
  _extractSourcesForAudit(operation) {
    const sources = [];

    if (operation.researchResult?.sources) {
      sources.push(...operation.researchResult.sources.map(source => ({
        name: source.name || 'Unknown',
        type: source.type || 'unknown',
        reliability: source.reliability || 0,
        url: source.url || ''
      })));
    }

    if (operation.sources) {
      sources.push(...operation.sources.map(source => ({
        name: source.name || source,
        type: source.type || 'unknown',
        reliability: source.reliability || 0,
        url: source.url || ''
      })));
    }

    return sources;
  }

  /**
   * Generate operation hash for integrity checking
   * @private
   * @param {Object} auditEntry - Audit entry to hash
   * @returns {string} Hash of the operation
   */
  _generateOperationHash(auditEntry) {
    const crypto = require('crypto');
    
    // Create a deterministic string representation
    const hashData = {
      index: auditEntry.index,
      operationType: auditEntry.operationType,
      languageGroup: auditEntry.languageGroup,
      success: auditEntry.success,
      placeholdersReplaced: auditEntry.details?.placeholdersReplaced || 0,
      beforeCount: auditEntry.changes?.before?.length || 0,
      afterCount: auditEntry.changes?.after?.length || 0
    };

    const hashString = JSON.stringify(hashData, Object.keys(hashData).sort());
    return crypto.createHash('sha256').update(hashString).digest('hex').substring(0, 16);
  }

  /**
   * Generate audit checksum for integrity
   * @private
   * @param {Object} auditTrail - Complete audit trail
   * @returns {string} Checksum of the audit trail
   */
  _generateAuditChecksum(auditTrail) {
    const crypto = require('crypto');
    
    const checksumData = {
      version: auditTrail.version,
      totalOperations: auditTrail.summary.totalOperations,
      operationHashes: auditTrail.integrity.operationHashes
    };

    const checksumString = JSON.stringify(checksumData, Object.keys(checksumData).sort());
    return crypto.createHash('sha256').update(checksumString).digest('hex');
  }

  /**
   * Get system information for audit trail
   * @private
   * @returns {Object} System information
   */
  _getSystemInfo() {
    const os = require('os');
    
    return {
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      hostname: os.hostname(),
      user: os.userInfo().username,
      timestamp: new Date().toISOString()
    };
  }

  // Statistics helper methods

  /**
   * Calculate distribution of values into bins
   * @private
   * @param {Array} values - Array of numeric values
   * @param {number} bins - Number of bins to create
   * @returns {Array} Distribution data
   */
  _calculateDistribution(values, bins = 10) {
    if (!Array.isArray(values) || values.length === 0) {
      return [];
    }

    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    const binSize = range / bins;

    const distribution = Array(bins).fill(0).map((_, i) => ({
      min: min + (i * binSize),
      max: min + ((i + 1) * binSize),
      count: 0,
      percentage: 0
    }));

    values.forEach(value => {
      let binIndex = Math.floor((value - min) / binSize);
      if (binIndex >= bins) binIndex = bins - 1; // Handle edge case where value equals max
      distribution[binIndex].count++;
    });

    // Calculate percentages
    distribution.forEach(bin => {
      bin.percentage = (bin.count / values.length) * 100;
    });

    return distribution;
  }

  /**
   * Generate recommendations based on summary statistics
   * @private
   * @param {Object} summary - Summary statistics
   * @returns {Array} Array of recommendation strings
   */
  _generateRecommendations(summary) {
    const recommendations = [];

    // Success rate recommendations
    if (summary.overview.successRate < 0.7) {
      recommendations.push('CRITICAL: Success rate is below 70%. Review failed operations and improve research sources.');
    } else if (summary.overview.successRate < 0.9) {
      recommendations.push('MODERATE: Success rate could be improved. Consider additional validation or research sources.');
    }

    // Confidence recommendations
    if (summary.overview.averageConfidence < 0.6) {
      recommendations.push('QUALITY: Average confidence is low. Use more reliable sources or additional validation.');
    }

    // Language group specific recommendations
    Object.entries(summary.breakdown.byLanguageGroup).forEach(([langGroup, stats]) => {
      if (stats.successRate < 0.5) {
        recommendations.push(`LANGUAGE: ${langGroup} has low success rate (${(stats.successRate * 100).toFixed(1)}%). Needs focused attention.`);
      }
    });

    // Source diversity recommendations
    const sourceTypeCount = Object.keys(summary.breakdown.bySourceType).length;
    if (sourceTypeCount < 2) {
      recommendations.push('SOURCES: Consider using more diverse source types for better coverage and reliability.');
    }

    // Quality distribution recommendations
    const totalQuality = summary.breakdown.byQualityLevel.high + 
                        summary.breakdown.byQualityLevel.medium + 
                        summary.breakdown.byQualityLevel.low;
    
    if (totalQuality > 0) {
      const highQualityPercentage = (summary.breakdown.byQualityLevel.high / totalQuality) * 100;
      if (highQualityPercentage < 50) {
        recommendations.push('QUALITY: Less than 50% of replacements are high quality. Review research methodology.');
      }
    }

    // Default positive recommendation
    if (recommendations.length === 0) {
      recommendations.push('EXCELLENT: System is performing well with high success rates and quality metrics.');
    }

    return recommendations;
  }
}

module.exports = ReportGenerator;