/**
 * Unit tests for ReportGenerator
 */

const ReportGenerator = require('../src/ReportGenerator');

describe('ReportGenerator', () => {
  let generator;

  beforeEach(() => {
    generator = new ReportGenerator();
  });

  describe('constructor', () => {
    it('should initialize with default config', () => {
      expect(generator.config.outputFormats).toEqual(['json', 'csv', 'markdown']);
      expect(generator.config.includeSourceCitations).toBe(true);
      expect(generator.config.generateStatistics).toBe(true);
    });

    it('should accept custom config', () => {
      const customGenerator = new ReportGenerator({ outputFormats: ['json'] });
      expect(customGenerator.config.outputFormats).toEqual(['json']);
    });

    it('should initialize empty reports array', () => {
      expect(generator.reports).toEqual([]);
    });
  });

  describe('createChangeReport', () => {
    it('should create comprehensive change report for empty replacements', async () => {
      const report = await generator.createChangeReport([]);
      
      expect(report).toHaveProperty('metadata');
      expect(report).toHaveProperty('summary');
      expect(report).toHaveProperty('languageGroups');
      expect(report).toHaveProperty('detailedChanges');
      expect(report.metadata.totalReplacements).toBe(0);
      expect(report.summary.languageGroupsAffected).toBe(0);
    });

    it('should process replacement operations correctly', async () => {
      const replacements = [
        {
          languageGroup: 'english',
          success: true,
          originalPlaceholders: ['test_1_unq1', 'test_1_unq2'],
          newPlacenames: ['London', 'Manchester'],
          confidence: 0.8,
          sources: [{ name: 'Wikipedia', type: 'encyclopedia', reliability: 0.9 }]
        }
      ];

      const report = await generator.createChangeReport(replacements);
      
      expect(report.metadata.totalReplacements).toBe(1);
      expect(report.summary.languageGroupsAffected).toBe(1);
      expect(report.summary.successfulReplacements).toBe(1);
      expect(report.languageGroups.english).toBeDefined();
      expect(report.detailedChanges).toHaveLength(1);
    });

    it('should handle invalid input gracefully', async () => {
      await expect(generator.createChangeReport(null)).rejects.toThrow('Replacements must be an array');
      await expect(generator.createChangeReport('invalid')).rejects.toThrow('Replacements must be an array');
    });
  });

  describe('generateSourceCitations', () => {
    it('should return empty citations for empty input', () => {
      const citations = generator.generateSourceCitations([]);
      
      expect(citations).toHaveProperty('bySource');
      expect(citations).toHaveProperty('byLanguageGroup');
      expect(citations).toHaveProperty('summary');
      expect(citations.summary.totalSources).toBe(0);
    });

    it('should generate citations from research results', () => {
      const researchResults = [
        {
          languageGroup: 'english',
          researchResult: {
            sources: [
              { name: 'Wikipedia', url: 'https://en.wikipedia.org', type: 'encyclopedia', reliability: 0.9 }
            ]
          },
          newPlacenames: ['London', 'York']
        }
      ];

      const citations = generator.generateSourceCitations(researchResults);
      
      expect(citations.summary.totalSources).toBe(1);
      expect(citations.bySource.Wikipedia).toBeDefined();
      expect(citations.byLanguageGroup.english).toBeDefined();
    });

    it('should handle invalid input gracefully', () => {
      const citations = generator.generateSourceCitations(null);
      expect(citations).toEqual({});
      
      const citations2 = generator.generateSourceCitations('invalid');
      expect(citations2).toEqual({});
    });
  });

  describe('calculateReplacementStatistics', () => {
    it('should return default statistics for empty input', () => {
      const stats = generator.calculateReplacementStatistics([]);
      
      expect(stats.totalOperations).toBe(0);
      expect(stats.successRate).toBe(0);
      expect(stats.failureRate).toBe(0);
      expect(stats).toHaveProperty('coverageByLanguageGroup');
      expect(stats).toHaveProperty('placeholderTypeDistribution');
      expect(stats).toHaveProperty('qualityMetrics');
    });

    it('should calculate statistics for replacement operations', () => {
      const replacements = [
        {
          languageGroup: 'english',
          success: true,
          originalPlaceholders: ['test_1_unq1'],
          placeholdersReplaced: 1,
          confidence: 0.8
        },
        {
          languageGroup: 'french',
          success: false,
          originalPlaceholders: ['test_2_u1'],
          confidence: 0.3
        }
      ];

      const stats = generator.calculateReplacementStatistics(replacements);
      
      expect(stats.totalOperations).toBe(2);
      expect(stats.successfulOperations).toBe(1);
      expect(stats.failedOperations).toBe(1);
      expect(stats.successRate).toBe(0.5);
      expect(stats.coverageByLanguageGroup.english).toBeDefined();
      expect(stats.coverageByLanguageGroup.french).toBeDefined();
    });

    it('should handle invalid input gracefully', () => {
      const stats = generator.calculateReplacementStatistics(null);
      expect(stats.totalOperations).toBe(0);
      
      const stats2 = generator.calculateReplacementStatistics('invalid');
      expect(stats2.totalOperations).toBe(0);
    });
  });

  describe('exportMultipleFormats', () => {
    it('should export report in multiple formats', async () => {
      const report = { metadata: { generatedAt: new Date().toISOString() }, summary: { totalReplacements: 0 } };
      const result = await generator.exportMultipleFormats(report, ['json']);
      
      expect(result).toHaveProperty('exports');
      expect(result).toHaveProperty('errors');
      expect(result).toHaveProperty('timestamp');
      expect(result.exports.json).toBeDefined();
    });

    it('should handle invalid input gracefully', async () => {
      await expect(generator.exportMultipleFormats(null, ['json'])).rejects.toThrow('Report data is required for export');
      await expect(generator.exportMultipleFormats({}, 'invalid')).rejects.toThrow('Formats must be an array');
    });

    it('should handle unsupported formats', async () => {
      const report = { metadata: { generatedAt: new Date().toISOString() } };
      const result = await generator.exportMultipleFormats(report, ['unsupported']);
      
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].format).toBe('unsupported');
      expect(result.exports.unsupported.success).toBe(false);
    });
  });

  describe('generateHumanReadableReport', () => {
    it('should generate human readable report', () => {
      const reportData = {
        metadata: { generatedAt: new Date().toISOString(), reportVersion: '1.0.0' },
        summary: { 
          totalReplacements: 5,
          languageGroupsAffected: 2,
          totalPlaceholdersReplaced: 10,
          successfulReplacements: 4,
          failedReplacements: 1,
          coverageRate: 0.8
        }
      };

      const humanReport = generator.generateHumanReadableReport(reportData);
      
      expect(typeof humanReport).toBe('string');
      expect(humanReport).toContain('# Placename Replacement Report');
      expect(humanReport).toContain('Executive Summary');
      expect(humanReport).toContain('Total Replacement Operations**: 5');
      expect(humanReport).toContain('Overall Success Rate**: 80.0%');
    });

    it('should handle empty or invalid data', () => {
      const emptyReport = generator.generateHumanReadableReport(null);
      expect(emptyReport).toBe('No report data available');
      
      const emptyReport2 = generator.generateHumanReadableReport({});
      expect(typeof emptyReport2).toBe('string');
      expect(emptyReport2).toContain('# Placename Replacement Report');
    });
  });

  describe('createAuditTrail', () => {
    it('should create audit trail for empty operations', () => {
      const auditTrail = generator.createAuditTrail([]);
      
      expect(auditTrail).toHaveProperty('operations');
      expect(auditTrail).toHaveProperty('summary');
      expect(auditTrail.summary.totalOperations).toBe(0);
      expect(auditTrail.summary).toHaveProperty('systemInfo');
    });

    it('should create audit trail for operations', () => {
      const operations = [
        {
          languageGroup: 'english',
          success: true,
          originalPlaceholders: ['test_1_unq1'],
          newPlacenames: ['London'],
          timestamp: new Date().toISOString()
        }
      ];

      const auditTrail = generator.createAuditTrail(operations);
      
      expect(auditTrail.operations).toHaveLength(1);
      expect(auditTrail.summary.totalOperations).toBe(1);
      expect(auditTrail.operations[0]).toHaveProperty('operationType');
      expect(auditTrail.operations[0]).toHaveProperty('timestamp');
      expect(auditTrail.integrity).toHaveProperty('checksum');
      expect(auditTrail.integrity).toHaveProperty('operationHashes');
    });

    it('should handle invalid input gracefully', () => {
      const auditTrail = generator.createAuditTrail(null);
      expect(auditTrail.summary.totalOperations).toBe(0);
      
      const auditTrail2 = generator.createAuditTrail('invalid');
      expect(auditTrail2.summary.totalOperations).toBe(0);
    });
  });

  describe('generateSummaryStatistics', () => {
    it('should generate summary statistics for empty input', () => {
      const summary = generator.generateSummaryStatistics([]);
      
      expect(summary).toHaveProperty('overview');
      expect(summary).toHaveProperty('breakdown');
      expect(summary).toHaveProperty('trends');
      expect(summary).toHaveProperty('recommendations');
      expect(summary.overview.totalOperations).toBe(0);
      expect(summary.overview.successRate).toBe(0);
    });

    it('should generate summary statistics for replacement operations', () => {
      const replacements = [
        {
          languageGroup: 'english',
          success: true,
          originalPlaceholders: ['test_1_unq1'],
          placeholdersReplaced: 1,
          confidence: 0.8,
          researchResult: {
            sources: [{ name: 'Wikipedia', type: 'encyclopedia' }]
          }
        },
        {
          languageGroup: 'french',
          success: false,
          originalPlaceholders: ['test_2_u1'],
          confidence: 0.3
        }
      ];

      const summary = generator.generateSummaryStatistics(replacements);
      
      expect(summary.overview.totalOperations).toBe(2);
      expect(summary.overview.successfulOperations).toBe(1);
      expect(summary.overview.failedOperations).toBe(1);
      expect(summary.overview.successRate).toBe(0.5);
      expect(summary.breakdown.byLanguageGroup.english).toBeDefined();
      expect(summary.breakdown.byLanguageGroup.french).toBeDefined();
      expect(summary.recommendations).toBeInstanceOf(Array);
    });

    it('should handle invalid input gracefully', () => {
      const summary = generator.generateSummaryStatistics(null);
      expect(summary.overview.totalOperations).toBe(0);
      
      const summary2 = generator.generateSummaryStatistics('invalid');
      expect(summary2.overview.totalOperations).toBe(0);
    });
  });

  describe('createBeforeAfterComparison', () => {
    it('should throw not implemented error', () => {
      expect(() => generator.createBeforeAfterComparison({}, {})).toThrow('createBeforeAfterComparison not yet implemented');
    });
  });
});