/**
 * Unit tests for PlaceholderScanner
 */

const PlaceholderScanner = require('../src/PlaceholderScanner');

describe('PlaceholderScanner', () => {
  let scanner;

  beforeEach(() => {
    scanner = new PlaceholderScanner('test-namebase.js');
  });

  describe('constructor', () => {
    it('should initialize with correct file path', () => {
      expect(scanner.namebaseFilePath).toBe('test-namebase.js');
    });

    it('should initialize empty placeholders array', () => {
      expect(scanner.placeholders).toEqual([]);
    });

    it('should initialize statistics object', () => {
      expect(scanner.statistics).toHaveProperty('totalPlaceholders');
      expect(scanner.statistics).toHaveProperty('unqPatterns');
      expect(scanner.statistics).toHaveProperty('uPatterns');
      expect(scanner.statistics).toHaveProperty('truncatedPatterns');
      expect(scanner.statistics).toHaveProperty('languageGroups');
    });
  });

  describe('scanPlaceholders', () => {
    it('should handle file not found error', async () => {
      await expect(scanner.scanPlaceholders()).rejects.toThrow('Failed to scan placeholders');
    });
  });

  describe('extractLanguageInfo', () => {
    it('should handle invalid entry', () => {
      expect(() => scanner.extractLanguageInfo({})).toThrow();
    });
  });

  describe('generateScanReport', () => {
    it('should generate scan report', () => {
      const report = scanner.generateScanReport();
      expect(report.summary).toHaveProperty('totalPlaceholders');
      expect(report.summary).toHaveProperty('patternBreakdown');
    });
  });

  describe('detectPlaceholderPatterns', () => {
    it('should detect placeholder patterns', () => {
      const patterns = scanner.detectPlaceholderPatterns([]);
      expect(Array.isArray(patterns)).toBe(true);
    });
  });

  describe('parseNamebaseFile', () => {
    it('should handle file not found error', async () => {
      await expect(scanner.parseNamebaseFile()).rejects.toThrow('Failed to parse namebase file');
    });
  });
});
