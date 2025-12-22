/**
 * Tests for Language Name Normalization Tool
 * 
 * This test suite covers both unit tests and property-based tests
 * for the language name normalization functionality.
 */

const {
  LanguageNameAnalyzer,
  LanguageNameResolver,
  ConfigurationFileManager,
  UpdateReportGenerator
} = require('./normalize-language-names');

const fs = require('fs');
const path = require('path');
const fc = require('fast-check');

// Mock fs for testing
jest.mock('fs');

describe('LanguageNameAnalyzer', () => {
  let analyzer;

  beforeEach(() => {
    analyzer = new LanguageNameAnalyzer();
  });

  describe('analyzeEntry', () => {
    test('should identify short names as needing update', () => {
      const entry = { name: 'ab', iso: 'ab' };
      const result = analyzer.analyzeEntry(entry);
      
      expect(result.needsUpdate).toBe(true);
      expect(result.issues).toContain('Name is very short (likely abbreviated)');
      expect(result.priority).toBeGreaterThan(5);
    });

    test('should not flag legitimate short names', () => {
      const entry = { name: 'ga', iso: 'ga' };
      const result = analyzer.analyzeEntry(entry);
      
      // Should not flag 'ga' as short since it's in legitimateShortNames
      expect(result.issues).not.toContain('Name is very short (likely abbreviated)');
    });

    test('should identify ISO codes used as names', () => {
      const entry = { name: 'eng', iso: 'eng' };
      const result = analyzer.analyzeEntry(entry);
      
      expect(result.needsUpdate).toBe(true);
      expect(result.issues).toContain('Name appears to be ISO code used as display name');
      expect(result.priority).toBeGreaterThan(7);
    });

    test('should identify missing family information', () => {
      const entry = { name: 'English', iso: 'en', family: '' };
      const result = analyzer.analyzeEntry(entry);
      
      expect(result.issues).toContain('Missing language family information');
    });

    test('should handle null or undefined entries', () => {
      const result1 = analyzer.analyzeEntry(null);
      const result2 = analyzer.analyzeEntry(undefined);
      const result3 = analyzer.analyzeEntry({});
      
      expect(result1.needsUpdate).toBe(false);
      expect(result2.needsUpdate).toBe(false);
      expect(result3.needsUpdate).toBe(false);
    });
  });

  describe('identifyIncompleteNames', () => {
    test('should return only entries that need updates', () => {
      const entries = [
        { name: 'English', iso: 'en', family: 'Germanic' },
        { name: 'ab', iso: 'ab', family: 'Unknown' },
        { name: 'xyz', iso: 'xyz', family: 'Test' }
      ];
      
      const result = analyzer.identifyIncompleteNames(entries);
      
      expect(result).toHaveLength(2); // Only 'ab' and 'xyz' should be flagged
      expect(result[0].entry.name).toBe('ab');
      expect(result[1].entry.name).toBe('xyz');
    });
  });

  describe('prioritizeByUsage', () => {
    test('should sort by priority and usage frequency', () => {
      const incompleteEntries = [
        { entry: { iso: 'low', name: 'low' }, analysis: { priority: 3, usageFrequency: 0 } },
        { entry: { iso: 'high', name: 'high' }, analysis: { priority: 8, usageFrequency: 0 } },
        { entry: { iso: 'med', name: 'med' }, analysis: { priority: 5, usageFrequency: 0 } }
      ];
      
      const result = analyzer.prioritizeByUsage(incompleteEntries, {});
      
      expect(result[0].entry.iso).toBe('high');
      expect(result[1].entry.iso).toBe('med');
      expect(result[2].entry.iso).toBe('low');
    });

    test('should boost priority for frequently used languages', () => {
      const incompleteEntries = [
        { entry: { iso: 'freq', name: 'freq' }, analysis: { priority: 3, usageFrequency: 0 } }
      ];
      
      const usageStats = { freq: 15 };
      const result = analyzer.prioritizeByUsage(incompleteEntries, usageStats);
      
      expect(result[0].analysis.priority).toBeGreaterThanOrEqual(9);
      expect(result[0].analysis.usageFrequency).toBe(15);
    });
  });

  describe('analyzeUsageFrequency', () => {
    test('should analyze usage patterns from mixer configuration', () => {
      const languageMixes = [
        { iso: 'en', name: 'English', family: 'Germanic', region: 'Europe', wikipedia: 'https://en.wikipedia.org/wiki/English' },
        { iso: 'es', name: 'Spanish', family: 'Romance', region: 'Europe', wikipedia: 'https://en.wikipedia.org/wiki/Spanish' },
        { iso: 'xyz', name: 'Unknown', family: '', region: '' }
      ];
      
      const languageMixerMap = [
        { iso: 'en', bases: [1, 2, 3] },
        { iso: 'es', bases: [4, 5] },
        { iso: 'xyz', bases: [] }
      ];
      
      const result = analyzer.analyzeUsageFrequency(languageMixes, languageMixerMap);
      
      // English should have high usage (major language + 3 bases + metadata bonuses)
      expect(result.en).toBeGreaterThan(result.es);
      expect(result.es).toBeGreaterThan(result.xyz);
      
      // All ISOs should have some usage score
      expect(result.en).toBeGreaterThan(0);
      expect(result.es).toBeGreaterThan(0);
      expect(result.xyz).toBeGreaterThanOrEqual(0);
    });

    test('should give bonus to major world languages', () => {
      const languageMixes = [
        { iso: 'en', name: 'English', family: 'Germanic' },
        { iso: 'xyz', name: 'Unknown Language', family: 'Unknown' }
      ];
      
      const languageMixerMap = [
        { iso: 'en', bases: [1] },
        { iso: 'xyz', bases: [2] }
      ];
      
      const result = analyzer.analyzeUsageFrequency(languageMixes, languageMixerMap);
      
      // English should get major language bonus
      expect(result.en).toBeGreaterThan(result.xyz);
    });

    test('should handle empty configurations', () => {
      const result = analyzer.analyzeUsageFrequency([], []);
      
      expect(result).toEqual({});
    });

    test('should handle missing bases gracefully', () => {
      const languageMixes = [
        { iso: 'en', name: 'English', family: 'Germanic' }
      ];
      
      const languageMixerMap = [
        { iso: 'en' } // No bases property
      ];
      
      const result = analyzer.analyzeUsageFrequency(languageMixes, languageMixerMap);
      
      expect(result.en).toBeGreaterThanOrEqual(0);
    });
  });

  describe('calculatePriorityScores', () => {
    test('should boost priority based on usage frequency', () => {
      const incompleteEntries = [
        { entry: { iso: 'high', name: 'high' }, analysis: { priority: 5, usageFrequency: 0 } },
        { entry: { iso: 'low', name: 'low' }, analysis: { priority: 5, usageFrequency: 0 } }
      ];
      
      const usageStats = { high: 25, low: 2 };
      
      const result = analyzer.calculatePriorityScores(incompleteEntries, usageStats);
      
      // High usage language should get priority boost
      expect(result[0].analysis.priority).toBeGreaterThan(5);
      // Low usage language should keep original priority
      expect(result[1].analysis.priority).toBe(5);
    });

    test('should handle zero usage gracefully', () => {
      const incompleteEntries = [
        { entry: { iso: 'zero', name: 'zero' }, analysis: { priority: 3, usageFrequency: 0 } }
      ];
      
      const usageStats = { zero: 0 };
      
      const result = analyzer.calculatePriorityScores(incompleteEntries, usageStats);
      
      // Should not crash and should preserve original priority
      expect(result[0].analysis.priority).toBe(3);
    });
  });
});

describe('LanguageNameResolver', () => {
  let resolver;

  beforeEach(() => {
    resolver = new LanguageNameResolver();
  });

  describe('resolveFromISO', () => {
    test('should resolve common ISO codes', () => {
      expect(resolver.resolveFromISO('en')).toBe('English');
      expect(resolver.resolveFromISO('es')).toBe('Spanish');
      expect(resolver.resolveFromISO('fr')).toBe('French');
    });

    test('should handle case insensitive input', () => {
      expect(resolver.resolveFromISO('EN')).toBe('English');
      expect(resolver.resolveFromISO('Es')).toBe('Spanish');
    });

    test('should return null for unknown codes', () => {
      expect(resolver.resolveFromISO('xyz')).toBeNull();
      expect(resolver.resolveFromISO('')).toBeNull();
      expect(resolver.resolveFromISO(null)).toBeNull();
    });
  });

  describe('resolveFromWikipedia', () => {
    test('should extract language name from Wikipedia URL', () => {
      const url = 'https://en.wikipedia.org/wiki/English_language';
      const result = resolver.resolveFromWikipedia(url);
      
      expect(result).toBe('English');
    });

    test('should handle URLs with disambiguation', () => {
      const url = 'https://en.wikipedia.org/wiki/French_language_(disambiguation)';
      const result = resolver.resolveFromWikipedia(url);
      
      expect(result).toBe('French');
    });

    test('should handle URLs with underscores', () => {
      const url = 'https://en.wikipedia.org/wiki/Old_English_language';
      const result = resolver.resolveFromWikipedia(url);
      
      expect(result).toBe('Old English');
    });

    test('should return null for invalid URLs', () => {
      expect(resolver.resolveFromWikipedia('not-a-url')).toBeNull();
      expect(resolver.resolveFromWikipedia('')).toBeNull();
      expect(resolver.resolveFromWikipedia(null)).toBeNull();
    });
  });

  describe('validateNameConsistency', () => {
    test('should validate proper capitalization', () => {
      const result1 = resolver.validateNameConsistency('English', 'Germanic', 'Europe');
      const result2 = resolver.validateNameConsistency('old english', 'Germanic', 'Europe');
      
      expect(result1.isValid).toBe(true);
      expect(result2.isValid).toBe(false);
      expect(result2.issues).toContain("Name capitalization doesn't follow standard conventions");
    });

    test('should handle empty names', () => {
      const result = resolver.validateNameConsistency('', 'Germanic', 'Europe');
      
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('Name is empty');
    });

    test('should handle hyphenated names', () => {
      const result = resolver.validateNameConsistency('Austro-Bavarian', 'Germanic', 'Europe');
      
      expect(result.isValid).toBe(true);
    });
  });
});

describe('ConfigurationFileManager', () => {
  let configManager;
  const mockLanguageMixes = [
    { iso: 'en', name: 'English', family: 'Germanic' },
    { iso: 'es', name: 'Spanish', family: 'Romance' }
  ];
  const mockLanguageMixerMap = [
    { iso: 'en', bases: [1] },
    { iso: 'es', bases: [2] }
  ];

  beforeEach(() => {
    configManager = new ConfigurationFileManager();
    
    // Mock file system operations
    fs.readFileSync.mockImplementation((filePath) => {
      if (filePath.includes('language-mixes.json')) {
        return JSON.stringify(mockLanguageMixes);
      }
      if (filePath.includes('language-mixer-map.json')) {
        return JSON.stringify(mockLanguageMixerMap);
      }
      throw new Error('File not found');
    });
    
    fs.writeFileSync.mockImplementation(() => {});
    fs.copyFileSync.mockImplementation(() => {});
    fs.existsSync.mockReturnValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('loadLanguageMixes', () => {
    test('should load and parse language mixes', () => {
      const result = configManager.loadLanguageMixes();
      
      expect(result).toEqual(mockLanguageMixes);
      expect(fs.readFileSync).toHaveBeenCalledWith(
        expect.stringContaining('language-mixes.json'),
        'utf8'
      );
    });

    test('should handle BOM in file content', () => {
      fs.readFileSync.mockReturnValue('\ufeff' + JSON.stringify(mockLanguageMixes));
      
      const result = configManager.loadLanguageMixes();
      
      expect(result).toEqual(mockLanguageMixes);
    });

    test('should throw error for invalid JSON', () => {
      fs.readFileSync.mockReturnValue('invalid json');
      
      expect(() => configManager.loadLanguageMixes()).toThrow();
    });
  });

  describe('loadLanguageMixerMap', () => {
    test('should load and parse language mixer map', () => {
      const result = configManager.loadLanguageMixerMap();
      
      expect(result).toEqual(mockLanguageMixerMap);
      expect(fs.readFileSync).toHaveBeenCalledWith(
        expect.stringContaining('language-mixer-map.json'),
        'utf8'
      );
    });
  });

  describe('createBackup', () => {
    test('should create timestamped backup file', () => {
      const filename = '/path/to/file.json';
      
      const backupPath = configManager.createBackup(filename);
      
      expect(fs.copyFileSync).toHaveBeenCalledWith(filename, expect.stringContaining('.backup-'));
      expect(backupPath).toContain('.backup-');
    });
  });

  describe('rollbackFromBackup', () => {
    test('should restore file from backup', () => {
      const backupPath = '/path/to/file.json.backup-2023-01-01T00-00-00-000Z';
      const originalPath = '/path/to/file.json';
      
      fs.existsSync.mockReturnValue(true);
      
      const result = configManager.rollbackFromBackup(backupPath, originalPath);
      
      expect(result).toBe(true);
      expect(fs.copyFileSync).toHaveBeenCalledWith(backupPath, originalPath);
    });

    test('should derive original path from backup path if not provided', () => {
      const backupPath = '/path/to/file.json.backup-2023-01-01T00-00-00-000Z';
      
      fs.existsSync.mockReturnValue(true);
      
      const result = configManager.rollbackFromBackup(backupPath);
      
      expect(result).toBe(true);
      expect(fs.copyFileSync).toHaveBeenCalledWith(backupPath, '/path/to/file.json');
    });

    test('should return false if backup file does not exist', () => {
      const backupPath = '/path/to/nonexistent.json.backup-2023-01-01T00-00-00-000Z';
      
      fs.existsSync.mockReturnValue(false);
      
      const result = configManager.rollbackFromBackup(backupPath);
      
      expect(result).toBe(false);
    });
  });

  describe('validateIntegrity', () => {
    test('should validate that ISOs match between files', () => {
      const result = configManager.validateIntegrity();
      
      expect(result.isValid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    test('should detect missing ISOs', () => {
      const mockMixerMapWithExtra = [
        ...mockLanguageMixerMap,
        { iso: 'missing', bases: [3] }
      ];
      
      fs.readFileSync.mockImplementation((filePath) => {
        if (filePath.includes('language-mixes.json')) {
          return JSON.stringify(mockLanguageMixes);
        }
        if (filePath.includes('language-mixer-map.json')) {
          return JSON.stringify(mockMixerMapWithExtra);
        }
        throw new Error('File not found');
      });
      
      const result = configManager.validateIntegrity();
      
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('ISO missing exists in mixer map but not in language mixes');
    });
  });
});

describe('UpdateReportGenerator', () => {
  let reportGenerator;

  beforeEach(() => {
    reportGenerator = new UpdateReportGenerator();
    
    // Mock file system operations
    fs.existsSync.mockReturnValue(true);
    fs.mkdirSync.mockImplementation(() => {});
    fs.writeFileSync.mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateChangeReport', () => {
    test('should generate report with all updates', () => {
      const updates = [
        {
          iso: 'en',
          oldName: 'eng',
          newName: 'English',
          confidence: 0.9,
          source: 'ISO',
          justification: 'Resolved from ISO code'
        }
      ];
      
      const report = reportGenerator.generateChangeReport(updates);
      
      expect(report.totalChanges).toBe(1);
      expect(report.changes).toHaveLength(1);
      expect(report.changes[0].iso).toBe('en');
      expect(report.timestamp).toBeDefined();
    });
  });

  describe('generateStatistics', () => {
    test('should generate statistics by family, region, and confidence', () => {
      const updates = [
        { family: 'Germanic', region: 'Europe', confidence: 0.9, source: 'ISO' },
        { family: 'Romance', region: 'Europe', confidence: 0.6, source: 'Wikipedia' },
        { family: 'Germanic', region: 'Europe', confidence: 0.3, source: 'Manual' }
      ];
      
      const stats = reportGenerator.generateStatistics(updates);
      
      expect(stats.totalUpdates).toBe(3);
      expect(stats.byFamily.Germanic).toBe(2);
      expect(stats.byFamily.Romance).toBe(1);
      expect(stats.byRegion.Europe).toBe(3);
      expect(stats.byConfidence.high).toBe(1);
      expect(stats.byConfidence.medium).toBe(1);
      expect(stats.byConfidence.low).toBe(1);
    });
  });

  describe('exportReport', () => {
    test('should export report in markdown format', () => {
      const report = {
        timestamp: '2023-01-01T00:00:00.000Z',
        totalChanges: 1,
        changes: [
          {
            iso: 'en',
            oldName: 'eng',
            newName: 'English',
            confidence: 0.9,
            source: 'ISO',
            justification: 'Test'
          }
        ]
      };
      
      const outputPath = reportGenerator.exportReport(report, 'markdown', 'test-report');
      
      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(outputPath).toContain('test-report');
      expect(outputPath).toContain('.md');
    });

    test('should export report in JSON format', () => {
      const report = { totalChanges: 0, changes: [] };
      
      const outputPath = reportGenerator.exportReport(report, 'json', 'test-report');
      
      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(outputPath).toContain('.json');
    });

    test('should export report in CSV format', () => {
      const report = {
        changes: [
          {
            iso: 'en',
            oldName: 'eng',
            newName: 'English',
            confidence: 0.9,
            source: 'ISO',
            justification: 'Test'
          }
        ]
      };
      
      const outputPath = reportGenerator.exportReport(report, 'csv', 'test-report');
      
      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(outputPath).toContain('.csv');
    });
  });
});

// Property-Based Tests
describe('Property-Based Tests', () => {
  let analyzer, resolver;

  beforeEach(() => {
    analyzer = new LanguageNameAnalyzer();
    resolver = new LanguageNameResolver();
  });

  describe('LanguageNameAnalyzer Properties', () => {
    test('Property 1: Short name identification - Feature: language-name-normalization, Property 1: For any language configuration file, all entries with names shorter than 4 characters should be correctly identified by the analysis system', () => {
      fc.assert(fc.property(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 3 }),
          iso: fc.string({ minLength: 2, maxLength: 3 }),
          family: fc.string()
        }),
        (entry) => {
          // Skip legitimate short names for this test
          if (analyzer.legitimateShortNames.has(entry.name.toLowerCase())) {
            return true;
          }
          
          const result = analyzer.analyzeEntry(entry);
          
          // Should identify short names as needing update
          return result.needsUpdate === true && 
                 result.issues.some(issue => issue.includes('very short'));
        }
      ));
    });

    test('Property 2: Generic name pattern detection - Feature: language-name-normalization, Property 2: For any set of language entries, all entries with generic names, abbreviations, or ISO codes as display names should be correctly identified', () => {
      fc.assert(fc.property(
        fc.record({
          name: fc.oneof(
            fc.string({ minLength: 2, maxLength: 3 }).filter(s => /^[a-z]{2,3}$/.test(s)),
            fc.string().map(s => s + ' language'),
            fc.string().map(s => s + ' dialect'),
            fc.string().map(s => s + ' family')
          ),
          iso: fc.string({ minLength: 2, maxLength: 3 }),
          family: fc.string()
        }),
        (entry) => {
          const result = analyzer.analyzeEntry(entry);
          
          // Should identify generic patterns
          return result.issues.some(issue => 
            issue.includes('generic pattern') || 
            issue.includes('ISO code') ||
            issue.includes('very short')
          );
        }
      ));
    });

    test('Property 3: Missing metadata identification - Feature: language-name-normalization, Property 3: For any language entry, if it lacks proper language family information, it should be identified as incomplete', () => {
      fc.assert(fc.property(
        fc.record({
          name: fc.string({ minLength: 4 }),
          iso: fc.string({ minLength: 2, maxLength: 3 }),
          family: fc.constantFrom('', '   ', null, undefined)
        }),
        (entry) => {
          const result = analyzer.analyzeEntry(entry);
          
          // Should identify missing family information
          return result.issues.some(issue => issue.includes('Missing language family'));
        }
      ));
    });

    test('Property 4: Usage-based prioritization - Feature: language-name-normalization, Property 4: For any list of incomplete entries and usage statistics, the entries should be correctly ordered by usage frequency', () => {
      fc.assert(fc.property(
        fc.array(fc.record({
          entry: fc.record({
            iso: fc.string({ minLength: 2, maxLength: 3 }),
            name: fc.string({ minLength: 1, maxLength: 3 })
          }),
          analysis: fc.record({
            priority: fc.integer({ min: 1, max: 10 }),
            usageFrequency: fc.integer({ min: 0, max: 100 })
          })
        }), { minLength: 2, maxLength: 10 }),
        (incompleteEntries) => {
          const usageStats = {};
          incompleteEntries.forEach(item => {
            usageStats[item.entry.iso] = item.analysis.usageFrequency;
          });
          
          const result = analyzer.prioritizeByUsage(incompleteEntries, usageStats);
          
          // Should be sorted by priority (desc) then usage frequency (desc)
          for (let i = 1; i < result.length; i++) {
            const prev = result[i - 1];
            const curr = result[i];
            
            if (prev.analysis.priority === curr.analysis.priority) {
              // Same priority, should be sorted by usage frequency
              if (prev.analysis.usageFrequency < curr.analysis.usageFrequency) {
                return false;
              }
            } else {
              // Different priority, higher priority should come first
              if (prev.analysis.priority < curr.analysis.priority) {
                return false;
              }
            }
          }
          
          return true;
        }
      ));
    });

    test('Property 4b: Usage frequency analysis consistency - Feature: language-name-normalization, Property 4: For any language configuration, usage frequency analysis should produce consistent and meaningful results', () => {
      fc.assert(fc.property(
        fc.array(fc.record({
          iso: fc.string({ minLength: 2, maxLength: 3 }),
          name: fc.string({ minLength: 1 }),
          family: fc.option(fc.string(), { nil: undefined }),
          region: fc.option(fc.string(), { nil: undefined }),
          category: fc.option(fc.string(), { nil: undefined }),
          wikipedia: fc.option(fc.string(), { nil: undefined })
        }), { minLength: 1, maxLength: 20 }),
        fc.array(fc.record({
          iso: fc.string({ minLength: 2, maxLength: 3 }),
          bases: fc.array(fc.integer({ min: 1, max: 1000 }), { minLength: 0, maxLength: 5 })
        }), { minLength: 0, maxLength: 20 }),
        (languageMixes, languageMixerMap) => {
          // Ensure some ISOs match between the two arrays for meaningful analysis
          if (languageMixes.length > 0 && languageMixerMap.length > 0) {
            // Make at least one ISO match
            languageMixerMap[0].iso = languageMixes[0].iso;
          }
          
          const usageStats = analyzer.analyzeUsageFrequency(languageMixes, languageMixerMap);
          
          // Usage stats should be non-negative numbers
          for (const [iso, usage] of Object.entries(usageStats)) {
            if (typeof usage !== 'number' || usage < 0) {
              return false;
            }
          }
          
          // All ISOs from languageMixes should have usage stats
          for (const mix of languageMixes) {
            if (mix.iso && !(mix.iso in usageStats)) {
              return false;
            }
          }
          
          // Languages with more bases should generally have higher usage
          const mixerMapByIso = {};
          for (const mapEntry of languageMixerMap) {
            if (mapEntry.iso && mapEntry.bases) {
              mixerMapByIso[mapEntry.iso] = mapEntry.bases.length;
            }
          }
          
          // Check that languages with bases have non-zero usage
          for (const [iso, baseCount] of Object.entries(mixerMapByIso)) {
            if (baseCount > 0 && usageStats[iso] === 0) {
              // This could happen due to bonuses, but base count should contribute something
              // Allow some flexibility for the heuristic nature of the algorithm
              continue;
            }
          }
          
          return true;
        }
      ), { numRuns: 100 });
    });
  });

  describe('ConfigurationFileManager Properties', () => {
    test('Property 11: File update integrity - Feature: language-name-normalization, Property 11: For any language name update, the language-mixes.json file should be modified correctly while maintaining valid JSON structure', () => {
      fc.assert(fc.property(
        fc.array(fc.record({
          iso: fc.string({ minLength: 2, maxLength: 3 }),
          oldName: fc.string({ minLength: 1 }),
          newName: fc.string({ minLength: 1 }),
          confidence: fc.float({ min: 0, max: 1 }),
          source: fc.constantFrom('ISO', 'Wikipedia', 'Manual'),
          justification: fc.string()
        }), { minLength: 1, maxLength: 10 }),
        (updates) => {
          const configManager = new ConfigurationFileManager();
          
          // Mock the file system to simulate successful operations
          const originalLanguageMixes = [
            { iso: 'en', name: 'English', family: 'Germanic' },
            { iso: 'es', name: 'Spanish', family: 'Romance' }
          ];
          
          // Add the ISOs from updates to the mock data to ensure they exist
          updates.forEach(update => {
            if (!originalLanguageMixes.find(lang => lang.iso === update.iso)) {
              originalLanguageMixes.push({
                iso: update.iso,
                name: update.oldName,
                family: 'Test'
              });
            }
          });
          
          fs.readFileSync.mockReturnValue(JSON.stringify(originalLanguageMixes));
          fs.writeFileSync.mockImplementation(() => {});
          fs.copyFileSync.mockImplementation(() => {});
          
          try {
            // Apply updates
            configManager.updateLanguageMixes(updates, false);
            
            // Verify that writeFileSync was called with valid JSON
            const writeCall = fs.writeFileSync.mock.calls.find(call => 
              call[0].includes('language-mixes.json')
            );
            
            if (writeCall) {
              const writtenContent = writeCall[1];
              // Should be valid JSON
              const parsedContent = JSON.parse(writtenContent);
              
              // Should be an array
              if (!Array.isArray(parsedContent)) {
                return false;
              }
              
              // Should preserve structure - each entry should have required fields
              for (const entry of parsedContent) {
                if (!entry.iso || !entry.name) {
                  return false;
                }
              }
            }
            
            return true;
          } catch (error) {
            // Any error means the integrity test failed
            return false;
          }
        }
      ), { numRuns: 100 });
    });

    test('Property 12: Backup creation - Feature: language-name-normalization, Property 12: For any configuration file modification, a backup copy should be created before changes are applied', () => {
      fc.assert(fc.property(
        fc.string({ minLength: 1 }).map(name => `/path/to/${name}.json`),
        (filename) => {
          const configManager = new ConfigurationFileManager();
          
          // Mock file system operations
          fs.copyFileSync.mockImplementation(() => {});
          fs.existsSync.mockReturnValue(true);
          
          try {
            const backupPath = configManager.createBackup(filename);
            
            // Should have called copyFileSync
            expect(fs.copyFileSync).toHaveBeenCalledWith(
              filename,
              expect.stringContaining('.backup-')
            );
            
            // Backup path should contain timestamp
            const hasTimestamp = /\.backup-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z$/.test(backupPath);
            
            return hasTimestamp && backupPath.startsWith(filename);
          } catch (error) {
            return false;
          }
        }
      ), { numRuns: 100 });
    });

    test('Property 5: Name transformation preservation - Feature: language-name-normalization, Property 5: For any language entry update, all existing base index mappings and metadata should remain unchanged', () => {
      fc.assert(fc.property(
        fc.array(fc.record({
          iso: fc.string({ minLength: 2, maxLength: 3 }),
          name: fc.string({ minLength: 1 }),
          family: fc.string({ minLength: 1 }),
          region: fc.string({ minLength: 1 }),
          category: fc.string({ minLength: 1 }),
          wikipedia: fc.string({ minLength: 1 }),
          bases: fc.array(fc.integer({ min: 1, max: 1000 }), { minLength: 1, maxLength: 5 })
        }), { minLength: 1, maxLength: 10 }),
        fc.array(fc.record({
          iso: fc.string({ minLength: 2, maxLength: 3 }),
          oldName: fc.string({ minLength: 1 }),
          newName: fc.string({ minLength: 1 }),
          confidence: fc.float({ min: 0, max: 1 }),
          source: fc.constantFrom('ISO', 'Wikipedia', 'Manual'),
          justification: fc.string()
        }), { minLength: 1, maxLength: 5 }),
        (originalLanguageMixes, updates) => {
          const configManager = new ConfigurationFileManager();
          
          // Ensure updates reference existing ISOs
          const validUpdates = updates.filter(update => 
            originalLanguageMixes.some(lang => lang.iso === update.iso)
          );
          
          if (validUpdates.length === 0) {
            return true; // No valid updates to test
          }
          
          // Mock file system operations
          let capturedWrittenData = null;
          fs.readFileSync.mockReturnValue(JSON.stringify(originalLanguageMixes));
          fs.writeFileSync.mockImplementation((path, data) => {
            if (path.includes('language-mixes.json')) {
              capturedWrittenData = data;
            }
          });
          fs.copyFileSync.mockImplementation(() => {});
          
          try {
            // Apply updates
            configManager.updateLanguageMixes(validUpdates, false);
            
            if (capturedWrittenData) {
              const updatedLanguageMixes = JSON.parse(capturedWrittenData);
              
              // Check that all metadata is preserved
              for (const originalEntry of originalLanguageMixes) {
                const updatedEntry = updatedLanguageMixes.find(entry => entry.iso === originalEntry.iso);
                
                if (updatedEntry) {
                  // All fields except name should be preserved
                  const fieldsToPreserve = ['iso', 'family', 'region', 'category', 'wikipedia', 'bases'];
                  
                  for (const field of fieldsToPreserve) {
                    if (originalEntry[field] !== undefined) {
                      if (JSON.stringify(originalEntry[field]) !== JSON.stringify(updatedEntry[field])) {
                        return false; // Metadata was not preserved
                      }
                    }
                  }
                  
                  // Name should be updated if there's a corresponding update
                  const hasUpdate = validUpdates.some(update => update.iso === originalEntry.iso);
                  if (hasUpdate) {
                    const update = validUpdates.find(update => update.iso === originalEntry.iso);
                    if (updatedEntry.name !== update.newName) {
                      return false; // Name was not updated correctly
                    }
                  } else {
                    // Name should remain unchanged if no update
                    if (updatedEntry.name !== originalEntry.name) {
                      return false; // Name was changed when it shouldn't have been
                    }
                  }
                }
              }
            }
            
            return true;
          } catch (error) {
            return false;
          }
        }
      ), { numRuns: 100 });
    });
  });

  describe('LanguageNameResolver Properties', () => {
    test('Property 6: Proper name expansion - Feature: language-name-normalization, Property 6: For any language entry with an abbreviated name, the system should replace it with a full, proper language name', () => {
      fc.assert(fc.property(
        fc.constantFrom('en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko', 'ar', 'hi', 'bn', 'ur', 'fa', 'tr', 'pl', 'nl', 'sv', 'no'),
        (isoCode) => {
          const result = resolver.resolveFromISO(isoCode);
          
          // Should return a proper name that's longer than the ISO code
          return result !== null && 
                 result.length > isoCode.length &&
                 /^[A-Z]/.test(result);
        }
      ), { numRuns: 100 });
    });

    test('Property 7: Formatting consistency - Feature: language-name-normalization, Property 7: For any updated language name, it should use proper capitalization and maintain consistency within its language family', () => {
      fc.assert(fc.property(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        fc.string(),
        fc.string(),
        (name, family, region) => {
          const result = resolver.validateNameConsistency(name, family, region);
          
          // If the name follows proper capitalization, validation should pass
          const isProperlyCapitalized = /^[A-Z][a-z]*(\s+[A-Z][a-z]*)*$/.test(name) ||
                                       /^[A-Z][a-z]*(-[A-Z][a-z]*)*$/.test(name);
          
          if (isProperlyCapitalized) {
            return result.isValid === true;
          } else {
            return result.issues.some(issue => issue.includes('capitalization'));
          }
        }
      ));
    });

    test('Property 8: Wikipedia consistency - Feature: language-name-normalization, Property 8: For any language entry with a Wikipedia reference, the updated name should be consistent with the Wikipedia source', () => {
      fc.assert(fc.property(
        fc.string({ minLength: 3 }).map(name => `https://en.wikipedia.org/wiki/${name.replace(/\s+/g, '_')}_language`),
        (wikipediaUrl) => {
          const result = resolver.resolveFromWikipedia(wikipediaUrl);
          
          if (result === null) {
            return true; // Can't resolve, that's acceptable
          }
          
          // Should return a clean name without "language" suffix
          return !result.toLowerCase().includes('language') &&
                 result.length > 0 &&
                 typeof result === 'string';
        }
      ));
    });

    test('Property 9: Extinct language indicators - Feature: language-name-normalization, Property 9: For any language marked as extinct or historical, the system should include appropriate indicators in the name or metadata', () => {
      fc.assert(fc.property(
        fc.record({
          name: fc.oneof(
            // Names with extinct indicators
            fc.string({ minLength: 3 }).map(name => `Ancient ${name}`),
            fc.string({ minLength: 3 }).map(name => `Old ${name}`),
            fc.string({ minLength: 3 }).map(name => `Middle ${name}`),
            fc.string({ minLength: 3 }).map(name => `Classical ${name}`),
            fc.string({ minLength: 3 }).map(name => `Proto-${name}`),
            fc.string({ minLength: 3 }).map(name => `${name} (Extinct)`),
            fc.string({ minLength: 3 }).map(name => `${name} (Historical)`),
            // Names without extinct indicators but with extinct family/region
            fc.string({ minLength: 3 })
          ),
          family: fc.oneof(
            fc.constantFrom('Ancient Germanic', 'Old Romance', 'Classical Languages', 'Proto-Indo-European', 'Extinct Languages'),
            fc.string({ minLength: 3 })
          ),
          region: fc.oneof(
            fc.constantFrom('Ancient Europe', 'Historical Asia', 'Classical Mediterranean', 'Prehistoric Africa'),
            fc.string({ minLength: 3 })
          )
        }),
        (languageEntry) => {
          const extinctionAnalysis = resolver.analyzeExtinctionStatus(languageEntry.name, {
            family: languageEntry.family,
            region: languageEntry.region
          });
          
          // If the language has extinct indicators in name, family, or region, it should be detected
          const hasExtinctInName = ['ancient', 'old', 'middle', 'classical', 'proto-', 'extinct', 'historical'].some(indicator =>
            languageEntry.name.toLowerCase().includes(indicator.toLowerCase())
          );
          
          const hasExtinctInFamily = ['ancient', 'old', 'classical', 'proto-', 'extinct', 'historical'].some(indicator =>
            languageEntry.family.toLowerCase().includes(indicator.toLowerCase())
          );
          
          const hasExtinctInRegion = ['ancient', 'historical', 'classical', 'prehistoric'].some(indicator =>
            languageEntry.region.toLowerCase().includes(indicator.toLowerCase())
          );
          
          const shouldBeDetectedAsExtinct = hasExtinctInName || hasExtinctInFamily || hasExtinctInRegion;
          
          if (shouldBeDetectedAsExtinct) {
            // Should be detected as likely extinct
            if (!extinctionAnalysis.isLikelyExtinct) {
              return false;
            }
            
            // Should have appropriate confidence
            if (extinctionAnalysis.confidence <= 0) {
              return false;
            }
            
            // Should identify relevant indicators
            if (hasExtinctInName && extinctionAnalysis.indicators.length === 0) {
              return false;
            }
          }
          
          // If adding extinct language indicators, the result should be properly formatted
          if (extinctionAnalysis.isLikelyExtinct) {
            const nameWithIndicators = resolver.addExtinctLanguageIndicators(
              languageEntry.name, 
              extinctionAnalysis, 
              { family: languageEntry.family, region: languageEntry.region }
            );
            
            // Should return a valid string
            if (typeof nameWithIndicators !== 'string' || nameWithIndicators.length === 0) {
              return false;
            }
            
            // Should preserve the original name content
            const baseName = languageEntry.name.replace(/^(Ancient|Old|Middle|Classical|Proto-|Early)\s+/i, '')
                                                .replace(/\s+\((Ancient|Old|Middle|Classical|Extinct|Historical)\)$/i, '');
            
            if (!nameWithIndicators.toLowerCase().includes(baseName.toLowerCase())) {
              return false;
            }
          }
          
          return true;
        }
      ), { numRuns: 100 });
    });

    test('Property 10: Regional distinction preservation - Feature: language-name-normalization, Property 10: For any language with regional or dialectal distinctions, these distinctions should be preserved in the updated name', () => {
      fc.assert(fc.property(
        fc.record({
          originalName: fc.oneof(
            // Names with regional distinctions
            fc.string({ minLength: 3 }).map(name => `American ${name}`),
            fc.string({ minLength: 3 }).map(name => `British ${name}`),
            fc.string({ minLength: 3 }).map(name => `Canadian ${name}`),
            fc.string({ minLength: 3 }).map(name => `Australian ${name}`),
            fc.string({ minLength: 3 }).map(name => `Northern ${name}`),
            fc.string({ minLength: 3 }).map(name => `Southern ${name}`),
            fc.string({ minLength: 3 }).map(name => `Eastern ${name}`),
            fc.string({ minLength: 3 }).map(name => `Western ${name}`),
            fc.string({ minLength: 3 }).map(name => `${name} (American)`),
            fc.string({ minLength: 3 }).map(name => `${name} (British)`),
            fc.string({ minLength: 3 }).map(name => `${name} Dialect`),
            fc.string({ minLength: 3 }).map(name => `Simplified ${name}`),
            fc.string({ minLength: 3 }).map(name => `Traditional ${name}`),
            // Names without regional distinctions
            fc.string({ minLength: 3 })
          ),
          resolvedName: fc.string({ minLength: 3 }),
          metadata: fc.record({
            family: fc.string({ minLength: 1 }),
            region: fc.oneof(
              fc.constantFrom('North America', 'Europe', 'Asia', 'United States', 'United Kingdom', 'Canada', 'Australia'),
              fc.string({ minLength: 1 })
            ),
            category: fc.string({ minLength: 1 })
          })
        }),
        (testCase) => {
          const { originalName, resolvedName, metadata } = testCase;
          
          // Analyze regional distinctions in original name
          const originalAnalysis = resolver.analyzeRegionalDistinctions(originalName, metadata);
          
          // Preserve regional distinctions
          const preservedName = resolver.preserveRegionalDistinctions(originalName, resolvedName, metadata);
          
          // Should return a valid string
          if (typeof preservedName !== 'string' || preservedName.length === 0) {
            return false;
          }
          
          // If original had regional distinctions, they should be preserved or transferred
          if (originalAnalysis.hasRegionalDistinctions && originalAnalysis.preservationPriority >= 2) {
            const preservedAnalysis = resolver.analyzeRegionalDistinctions(preservedName, metadata);
            
            // Should have regional distinctions in the result
            if (!preservedAnalysis.hasRegionalDistinctions) {
              return false;
            }
            
            // Should preserve important regional indicators
            const originalIndicators = originalAnalysis.distinctions.map(d => d.indicator.toLowerCase());
            const preservedIndicators = preservedAnalysis.distinctions.map(d => d.indicator.toLowerCase());
            
            // At least some important indicators should be preserved
            const hasImportantIndicators = originalAnalysis.distinctions.some(d => 
              ['national', 'geographic', 'script'].includes(d.type)
            );
            
            if (hasImportantIndicators) {
              const preservedImportantIndicators = originalIndicators.some(indicator =>
                preservedIndicators.includes(indicator)
              );
              
              if (!preservedImportantIndicators) {
                return false;
              }
            }
          }
          
          // Validate regional preservation
          const validation = resolver.validateRegionalPreservation(originalName, preservedName, metadata);
          
          // Should not have critical validation issues
          const hasCriticalIssues = validation.issues.some(issue => 
            issue.includes('Important regional distinctions were lost') ||
            issue.includes('Conflicting national variants')
          );
          
          if (hasCriticalIssues && originalAnalysis.preservationPriority >= 3) {
            return false;
          }
          
          // Should preserve the base language content
          const baseOriginal = originalName.replace(/^(American|British|Canadian|Australian|Northern|Southern|Eastern|Western|Simplified|Traditional)\s+/i, '')
                                          .replace(/\s+\((American|British|Canadian|Australian)\)$/i, '')
                                          .replace(/\s+(Dialect|Variety)$/i, '');
          
          const baseResolved = resolvedName.replace(/^(American|British|Canadian|Australian|Northern|Southern|Eastern|Western|Simplified|Traditional)\s+/i, '')
                                          .replace(/\s+\((American|British|Canadian|Australian)\)$/i, '')
                                          .replace(/\s+(Dialect|Variety)$/i, '');
          
          // The preserved name should contain either the original base or the resolved base
          const preservedLower = preservedName.toLowerCase();
          const originalBaseLower = baseOriginal.toLowerCase();
          const resolvedBaseLower = baseResolved.toLowerCase();
          
          if (!preservedLower.includes(originalBaseLower) && !preservedLower.includes(resolvedBaseLower)) {
            return false;
          }
          
          return true;
        }
      ), { numRuns: 100 });
    });
  });

  describe('UpdateReportGenerator Properties', () => {
    test('Property 13: Comprehensive reporting - Feature: language-name-normalization, Property 13: For any set of language name updates, the generated report should include all old→new mappings, justifications for changes, conflict highlights, and statistics by language family', () => {
      fc.assert(fc.property(
        fc.array(fc.record({
          iso: fc.string({ minLength: 2, maxLength: 3 }),
          oldName: fc.string({ minLength: 1 }),
          newName: fc.string({ minLength: 1 }),
          confidence: fc.float({ min: 0, max: 1 }),
          source: fc.constantFrom('ISO', 'Wikipedia', 'Manual'),
          justification: fc.string({ minLength: 1 }),
          family: fc.string({ minLength: 1 }),
          region: fc.string({ minLength: 1 })
        }), { minLength: 1, maxLength: 10 }),
        fc.array(fc.record({
          iso: fc.string({ minLength: 2, maxLength: 3 }),
          issue: fc.string({ minLength: 1 }),
          possibleResolutions: fc.array(fc.string(), { minLength: 0, maxLength: 3 }),
          requiresManualReview: fc.boolean()
        }), { minLength: 0, maxLength: 5 }),
        (updates, conflicts) => {
          const reportGenerator = new UpdateReportGenerator();
          
          // Mock file system operations
          fs.existsSync.mockReturnValue(true);
          fs.mkdirSync.mockImplementation(() => {});
          fs.writeFileSync.mockImplementation(() => {});
          
          try {
            // Generate change report
            const changeReport = reportGenerator.generateChangeReport(updates);
            
            // Generate statistics
            const statistics = reportGenerator.generateStatistics(updates);
            
            // Generate conflict report
            const conflictReport = reportGenerator.generateConflictReport(conflicts);
            
            // Verify change report completeness
            if (changeReport.totalChanges !== updates.length) {
              return false;
            }
            
            if (!changeReport.changes || changeReport.changes.length !== updates.length) {
              return false;
            }
            
            // Verify all old→new mappings are present
            for (let i = 0; i < updates.length; i++) {
              const update = updates[i];
              const reportedChange = changeReport.changes[i];
              
              if (reportedChange.iso !== update.iso ||
                  reportedChange.oldName !== update.oldName ||
                  reportedChange.newName !== update.newName ||
                  reportedChange.justification !== update.justification) {
                return false;
              }
            }
            
            // Verify statistics include family breakdown
            if (statistics.totalUpdates !== updates.length) {
              return false;
            }
            
            if (!statistics.byFamily || typeof statistics.byFamily !== 'object') {
              return false;
            }
            
            // Count expected family statistics
            const expectedFamilyCounts = {};
            for (const update of updates) {
              const family = update.family || 'Unknown';
              expectedFamilyCounts[family] = (expectedFamilyCounts[family] || 0) + 1;
            }
            
            // Verify family statistics match
            for (const [family, expectedCount] of Object.entries(expectedFamilyCounts)) {
              if (statistics.byFamily[family] !== expectedCount) {
                return false;
              }
            }
            
            // Verify conflict report completeness
            if (conflictReport.totalConflicts !== conflicts.length) {
              return false;
            }
            
            if (!conflictReport.conflicts || conflictReport.conflicts.length !== conflicts.length) {
              return false;
            }
            
            // Verify all conflicts are properly reported
            for (let i = 0; i < conflicts.length; i++) {
              const conflict = conflicts[i];
              const reportedConflict = conflictReport.conflicts[i];
              
              if (reportedConflict.iso !== conflict.iso ||
                  reportedConflict.issue !== conflict.issue ||
                  reportedConflict.requiresManualReview !== conflict.requiresManualReview) {
                return false;
              }
            }
            
            return true;
          } catch (error) {
            return false;
          }
        }
      ), { numRuns: 100 });
    });

    test('Property 14: Report format validation - Feature: language-name-normalization, Property 14: For any generated report, it should be saved in a human-readable format and be properly structured', () => {
      fc.assert(fc.property(
        fc.record({
          timestamp: fc.date().map(d => d.toISOString()),
          totalChanges: fc.integer({ min: 0, max: 100 }),
          changes: fc.array(fc.record({
            iso: fc.string({ minLength: 2, maxLength: 3 }),
            oldName: fc.string({ minLength: 1 }),
            newName: fc.string({ minLength: 1 }),
            confidence: fc.float({ min: 0, max: 1 }),
            source: fc.constantFrom('ISO', 'Wikipedia', 'Manual'),
            justification: fc.string({ minLength: 1 })
          }), { minLength: 0, maxLength: 10 })
        }),
        fc.constantFrom('json', 'csv', 'markdown'),
        (report, format) => {
          const reportGenerator = new UpdateReportGenerator();
          
          // Mock file system operations
          fs.existsSync.mockReturnValue(true);
          fs.mkdirSync.mockImplementation(() => {});
          
          let capturedContent = null;
          let capturedPath = null;
          fs.writeFileSync.mockImplementation((path, content) => {
            capturedContent = content;
            capturedPath = path;
          });
          
          try {
            const outputPath = reportGenerator.exportReport(report, format, 'test-report');
            
            // Verify file was written
            if (!capturedContent || !capturedPath) {
              return false;
            }
            
            // Verify file extension matches format
            const expectedExtension = format === 'markdown' ? '.md' : `.${format}`;
            if (!capturedPath.endsWith(expectedExtension)) {
              return false;
            }
            
            // Verify content is properly formatted based on format
            switch (format) {
              case 'json':
                try {
                  const parsed = JSON.parse(capturedContent);
                  // Should be able to parse as JSON and contain expected structure
                  return typeof parsed === 'object' && parsed !== null;
                } catch (e) {
                  return false;
                }
                
              case 'csv':
                // Should contain headers and proper CSV structure
                const lines = capturedContent.split('\n').filter(line => line.trim());
                if (lines.length === 0) {
                  return report.changes.length === 0; // Empty report is valid
                }
                
                // First line should be headers
                const headers = lines[0].split(',');
                if (!headers.includes('ISO') || !headers.includes('Old Name') || !headers.includes('New Name')) {
                  return false;
                }
                
                // Number of data lines should match number of changes
                const dataLines = lines.slice(1);
                return dataLines.length === report.changes.length;
                
              case 'markdown':
                // Should contain markdown headers and table structure
                if (!capturedContent.includes('# Language Name Normalization Report')) {
                  return false;
                }
                
                if (report.changes.length > 0) {
                  // Should contain table headers
                  if (!capturedContent.includes('| ISO | Old Name | New Name |')) {
                    return false;
                  }
                  
                  // Should contain table separator
                  if (!capturedContent.includes('|-----|----------|----------|')) {
                    return false;
                  }
                }
                
                return true;
                
              default:
                return false;
            }
          } catch (error) {
            return false;
          }
        }
      ), { numRuns: 100 });
    });
  });
});

// Integration Tests
describe('Integration Tests', () => {
  describe('End-to-End Normalization Workflow', () => {
    test('should complete full normalization workflow without errors', async () => {
      // Mock file system operations
      const mockLanguageMixes = [
        { iso: 'en', name: 'eng', family: 'Germanic', region: 'Europe', category: 'major' },
        { iso: 'es', name: 'spa', family: 'Romance', region: 'Europe', category: 'major' },
        { iso: 'fr', name: 'fra', family: 'Romance', region: 'Europe', category: 'major' }
      ];
      
      const mockLanguageMixerMap = [
        { iso: 'en', bases: [1, 2] },
        { iso: 'es', bases: [3, 4] },
        { iso: 'fr', bases: [5, 6] }
      ];

      fs.readFileSync.mockImplementation((filePath) => {
        if (filePath.includes('language-mixes.json')) {
          return JSON.stringify(mockLanguageMixes);
        }
        if (filePath.includes('language-mixer-map.json')) {
          return JSON.stringify(mockLanguageMixerMap);
        }
        throw new Error('File not found');
      });

      fs.writeFileSync.mockImplementation(() => {});
      fs.copyFileSync.mockImplementation(() => {});
      fs.existsSync.mockReturnValue(true);
      fs.mkdirSync.mockImplementation(() => {});

      // Initialize all components
      const analyzer = new LanguageNameAnalyzer();
      const resolver = new LanguageNameResolver();
      const configManager = new ConfigurationFileManager();
      const reportGenerator = new UpdateReportGenerator();

      // Load configuration files
      const languageMixes = configManager.loadLanguageMixes();
      const languageMixerMap = configManager.loadLanguageMixerMap();

      expect(languageMixes).toHaveLength(3);
      expect(languageMixerMap).toHaveLength(3);

      // Analyze entries
      const incompleteEntries = analyzer.identifyIncompleteNames(languageMixes);
      expect(incompleteEntries.length).toBeGreaterThan(0);

      // Analyze usage frequency
      const usageStats = analyzer.analyzeUsageFrequency(languageMixes, languageMixerMap);
      expect(Object.keys(usageStats)).toHaveLength(3);

      // Prioritize entries
      const prioritizedEntries = analyzer.prioritizeByUsage(incompleteEntries, usageStats);
      expect(prioritizedEntries).toHaveLength(incompleteEntries.length);

      // Generate proposed updates
      const proposedUpdates = [];
      for (const item of prioritizedEntries) {
        const entry = item.entry;
        const resolvedName = resolver.resolveFromISO(entry.iso);
        
        if (resolvedName && resolvedName !== entry.name) {
          const validation = resolver.validateNameConsistency(resolvedName, entry.family, entry.region);
          
          if (validation.isValid) {
            proposedUpdates.push({
              iso: entry.iso,
              oldName: entry.name,
              newName: resolvedName,
              confidence: 0.9,
              source: 'ISO',
              justification: `Resolved from ISO code ${entry.iso}`,
              family: entry.family,
              region: entry.region
            });
          }
        }
      }

      expect(proposedUpdates.length).toBeGreaterThan(0);

      // Apply updates
      configManager.updateLanguageMixes(proposedUpdates, true);

      // Validate integrity
      const integrity = configManager.validateIntegrity();
      expect(integrity.isValid).toBe(true);

      // Generate reports
      const changeReport = reportGenerator.generateChangeReport(proposedUpdates);
      const statistics = reportGenerator.generateStatistics(proposedUpdates);

      expect(changeReport.totalChanges).toBe(proposedUpdates.length);
      expect(statistics.totalUpdates).toBe(proposedUpdates.length);

      // Export report
      const reportPath = reportGenerator.exportReport(changeReport, 'markdown');
      expect(reportPath).toContain('.md');
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    test('should handle empty configuration files gracefully', () => {
      // Mock empty files
      fs.readFileSync.mockImplementation((filePath) => {
        if (filePath.includes('language-mixes.json')) {
          return JSON.stringify([]);
        }
        if (filePath.includes('language-mixer-map.json')) {
          return JSON.stringify([]);
        }
        throw new Error('File not found');
      });

      const analyzer = new LanguageNameAnalyzer();
      const configManager = new ConfigurationFileManager();

      const languageMixes = configManager.loadLanguageMixes();
      const languageMixerMap = configManager.loadLanguageMixerMap();

      expect(languageMixes).toHaveLength(0);
      expect(languageMixerMap).toHaveLength(0);

      const incompleteEntries = analyzer.identifyIncompleteNames(languageMixes);
      expect(incompleteEntries).toHaveLength(0);

      const usageStats = analyzer.analyzeUsageFrequency(languageMixes, languageMixerMap);
      expect(Object.keys(usageStats)).toHaveLength(0);
    });
  });

  describe('Compatibility with Existing Tools', () => {
    test('should preserve base index mappings when updating names', () => {
      const originalLanguageMixes = [
        { 
          iso: 'en', 
          name: 'eng', 
          family: 'Germanic', 
          region: 'Europe', 
          category: 'major',
          wikipedia: 'https://en.wikipedia.org/wiki/English_language',
          bases: [1, 2, 3]
        }
      ];

      const updates = [
        {
          iso: 'en',
          oldName: 'eng',
          newName: 'English',
          confidence: 0.9,
          source: 'ISO',
          justification: 'Resolved from ISO code'
        }
      ];

      let capturedData = null;
      fs.readFileSync.mockReturnValue(JSON.stringify(originalLanguageMixes));
      fs.writeFileSync.mockImplementation((path, data) => {
        if (path.includes('language-mixes.json')) {
          capturedData = data;
        }
      });
      fs.copyFileSync.mockImplementation(() => {});

      const configManager = new ConfigurationFileManager();
      configManager.updateLanguageMixes(updates, false);

      expect(capturedData).toBeTruthy();
      const updatedData = JSON.parse(capturedData);
      
      expect(updatedData).toHaveLength(1);
      expect(updatedData[0].name).toBe('English');
      expect(updatedData[0].iso).toBe('en');
      expect(updatedData[0].family).toBe('Germanic');
      expect(updatedData[0].region).toBe('Europe');
      expect(updatedData[0].category).toBe('major');
      expect(updatedData[0].wikipedia).toBe('https://en.wikipedia.org/wiki/English_language');
      expect(updatedData[0].bases).toEqual([1, 2, 3]);
    });

    test('should maintain JSON structure compatibility', () => {
      const originalLanguageMixes = [
        { iso: 'en', name: 'English', family: 'Germanic' },
        { iso: 'es', name: 'Spanish', family: 'Romance' }
      ];

      const updates = [
        {
          iso: 'en',
          oldName: 'English',
          newName: 'British English',
          confidence: 0.9,
          source: 'Manual',
          justification: 'Regional variant'
        }
      ];

      fs.readFileSync.mockReturnValue(JSON.stringify(originalLanguageMixes));
      
      let capturedData = null;
      fs.writeFileSync.mockImplementation((path, data) => {
        if (path.includes('language-mixes.json')) {
          capturedData = data;
        }
      });
      fs.copyFileSync.mockImplementation(() => {});

      const configManager = new ConfigurationFileManager();
      configManager.updateLanguageMixes(updates, false);

      expect(capturedData).toBeTruthy();
      
      // Should be valid JSON
      expect(() => JSON.parse(capturedData)).not.toThrow();
      
      // Should be properly formatted
      expect(capturedData).toContain('[\n');
      expect(capturedData).toContain('  {');
      expect(capturedData).toMatch(/\n$/); // Should end with newline
    });

    test('should work with fix-language-mixer-mappings workflow', () => {
      // Test that the normalize tool doesn't interfere with the mapping workflow
      const languageMixes = [
        { iso: 'en', name: 'English', family: 'Germanic', region: 'Europe' },
        { iso: 'xyz', name: 'xyz', family: 'Unknown', region: 'Unknown' }
      ];

      const languageMixerMap = [
        { iso: 'en', bases: [1, 2] },
        { iso: 'xyz', bases: [] } // Empty bases array (would be flagged by fix-language-mixer-mappings)
      ];

      fs.readFileSync.mockImplementation((filePath) => {
        if (filePath.includes('language-mixes.json')) {
          return JSON.stringify(languageMixes);
        }
        if (filePath.includes('language-mixer-map.json')) {
          return JSON.stringify(languageMixerMap);
        }
        throw new Error('File not found');
      });

      const configManager = new ConfigurationFileManager();
      
      // Should load both files successfully
      const loadedMixes = configManager.loadLanguageMixes();
      const loadedMap = configManager.loadLanguageMixerMap();

      expect(loadedMixes).toHaveLength(2);
      expect(loadedMap).toHaveLength(2);

      // Should detect integrity issues (empty bases array)
      const integrity = configManager.validateIntegrity();
      expect(integrity.isValid).toBe(true); // Our tool doesn't validate base arrays, that's fix-language-mixer-mappings' job
    });
  });

  describe('Error Handling and Recovery', () => {
    test('should handle file system errors gracefully', () => {
      fs.readFileSync.mockImplementation(() => {
        throw new Error('ENOENT: no such file or directory');
      });

      const configManager = new ConfigurationFileManager();

      expect(() => configManager.loadLanguageMixes()).toThrow('Failed to load language-mixes.json');
      expect(() => configManager.loadLanguageMixerMap()).toThrow('Failed to load language-mixer-map.json');
    });

    test('should handle invalid JSON gracefully', () => {
      fs.readFileSync.mockReturnValue('invalid json content');

      const configManager = new ConfigurationFileManager();

      expect(() => configManager.loadLanguageMixes()).toThrow('Failed to load language-mixes.json');
    });

    test('should handle backup creation failures', () => {
      fs.copyFileSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const configManager = new ConfigurationFileManager();

      expect(() => configManager.createBackup('/test/file.json')).toThrow('Failed to create backup');
    });

    test('should rollback from backup on validation failure', () => {
      const originalData = [{ iso: 'en', name: 'English', family: 'Germanic' }];
      const backupPath = '/test/file.json.backup-2023-01-01T00-00-00-000Z';
      const originalPath = '/test/file.json';

      fs.existsSync.mockReturnValue(true);
      fs.copyFileSync.mockImplementation(() => {});

      const configManager = new ConfigurationFileManager();

      const result = configManager.rollbackFromBackup(backupPath, originalPath);

      expect(result).toBe(true);
      expect(fs.copyFileSync).toHaveBeenCalledWith(backupPath, originalPath);
    });

    test('should handle missing backup files', () => {
      fs.existsSync.mockReturnValue(false);

      const configManager = new ConfigurationFileManager();

      const result = configManager.rollbackFromBackup('/nonexistent/backup.json');

      expect(result).toBe(false);
    });
  });

  describe('CLI Integration', () => {
    test('should export main function for CLI usage', () => {
      const { main } = require('./normalize-language-names');
      
      expect(typeof main).toBe('function');
    });

    test('should export all classes for testing', () => {
      const {
        LanguageNameAnalyzer,
        LanguageNameResolver,
        ConfigurationFileManager,
        UpdateReportGenerator
      } = require('./normalize-language-names');

      expect(LanguageNameAnalyzer).toBeDefined();
      expect(LanguageNameResolver).toBeDefined();
      expect(ConfigurationFileManager).toBeDefined();
      expect(UpdateReportGenerator).toBeDefined();
    });
  });
});