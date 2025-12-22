/**
 * Unit tests for ResearchEngine
 */

const ResearchEngine = require('../src/ResearchEngine');

describe('ResearchEngine', () => {
  let engine;

  beforeEach(() => {
    engine = new ResearchEngine();
  });

  describe('constructor', () => {
    it('should initialize with default config', () => {
      expect(engine.config.minPlacenames).toBe(12);
      expect(engine.config.maxRetries).toBe(3);
      expect(engine.config.rateLimitMs).toBe(1000);
    });

    it('should accept custom config', () => {
      const customEngine = new ResearchEngine({ minPlacenames: 20 });
      expect(customEngine.config.minPlacenames).toBe(20);
    });

    it('should initialize source cache', () => {
      expect(engine.sourceCache).toBeInstanceOf(Map);
    });
  });

  describe('researchPlacenames', () => {
    it('should throw not implemented error', async () => {
      await expect(engine.researchPlacenames('test-language')).rejects.toThrow('researchPlacenames not yet implemented');
    });
  });

  describe('validateAuthenticity', () => {
    it('should handle empty placenames array', async () => {
      const result = await engine.validateAuthenticity([], 'test-language');
      expect(result.isValid).toBe(false);
      expect(result.confidence).toBe(0);
      expect(result.issues).toContain('No placenames provided for validation');
    });

    it('should validate placenames and return results', async () => {
      const result = await engine.validateAuthenticity(['Paris', 'Lyon', 'Marseille'], 'french');
      expect(result).toHaveProperty('isValid');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('geographicScore');
      expect(result).toHaveProperty('historicalScore');
      expect(result).toHaveProperty('phonologicalScore');
    });
  });

  describe('getFromMultipleSources', () => {
    it('should return results from multiple sources', async () => {
      const result = await engine.getFromMultipleSources('test-language');
      expect(Array.isArray(result)).toBe(true);
      // Should return array of source results, even if empty
    }, 10000); // Increase timeout for API calls
  });

  describe('researchFromWikipedia', () => {
    it('should research placenames from Wikipedia', async () => {
      const result = await engine.researchFromWikipedia('test-language');
      expect(Array.isArray(result)).toBe(true);
      // Should return array of placenames, even if empty
    }, 20000); // Increase timeout for Wikipedia API calls
  });

  describe('researchFromGeographicDatabases', () => {
    it('should research placenames from geographic databases', async () => {
      const result = await engine.researchFromGeographicDatabases('test-language');
      expect(Array.isArray(result)).toBe(true);
      // Should return array of placenames, even if empty
    }, 35000); // Increase timeout for geographic database API calls
  });

  describe('validatePhonologicalPatterns', () => {
    it('should validate phonological patterns', () => {
      const result = engine.validatePhonologicalPatterns(['Paris', 'Lyon'], 'french');
      expect(typeof result).toBe('boolean');
    });
  });

  describe('prioritizeAndResolveConflicts', () => {
    it('should prioritize and resolve conflicts', () => {
      const sourceResults = [
        {
          placenames: ['Paris', 'Lyon'],
          source: 'Wikipedia',
          reliability: 0.7,
          timestamp: new Date().toISOString()
        }
      ];
      const result = engine.prioritizeAndResolveConflicts(sourceResults);
      expect(Array.isArray(result)).toBe(true);
    });
  });
});