/**
 * Unit tests for ValidationSystem
 */

const ValidationSystem = require('../src/ValidationSystem');

describe('ValidationSystem', () => {
  let validator;

  beforeEach(() => {
    validator = new ValidationSystem();
  });

  describe('constructor', () => {
    it('should initialize with default config', () => {
      expect(validator.config.minPlacenamesPerGroup).toBe(12);
      expect(validator.config.maxValidationRetries).toBe(3);
      expect(validator.config.qualityThreshold).toBe(0.8);
    });

    it('should accept custom config', () => {
      const customValidator = new ValidationSystem({ minPlacenamesPerGroup: 20 });
      expect(customValidator.config.minPlacenamesPerGroup).toBe(20);
    });

    it('should initialize empty validation results', () => {
      expect(validator.validationResults).toEqual([]);
    });
  });

  describe('validateLinguisticAuthenticity', () => {
    it('should validate empty placenames array', async () => {
      const result = await validator.validateLinguisticAuthenticity([], 'test-language');
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('No placenames provided for validation');
    });
  });

  describe('testSystemCompatibility', () => {
    it('should test system compatibility', async () => {
      const result = await validator.testSystemCompatibility('test-file');
      expect(result.passed).toBe(false);
      expect(result.issues).toContain('File integrity test failed: File does not exist');
    });
  });

  describe('validateGenerationPatterns', () => {
    it('should validate generation patterns', async () => {
      const result = await validator.validateGenerationPatterns({});
      expect(result).toBe(false);
    });
  });

  describe('checkQualityThresholds', () => {
    it('should check quality thresholds', () => {
      const result = validator.checkQualityThresholds([], {});
      expect(result.passed).toBe(false);
      expect(result.issues).toContain('Insufficient placenames: 0 < 12 required');
    });
  });

  describe('validateGeographicAppropriateness', () => {
    it('should validate geographic appropriateness', async () => {
      const result = await validator.validateGeographicAppropriateness([], 'test-language');
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('No placenames provided for geographic validation');
    });
  });

  describe('testLanguageMixerIntegration', () => {
    it('should test language mixer integration', async () => {
      const result = await validator.testLanguageMixerIntegration({});
      expect(result.passed).toBe(false);
      expect(result.message).toContain('Language mixer mapping file has invalid structure');
    });
  });

  describe('flagProblematicReplacements', () => {
    it('should flag problematic replacements', () => {
      const result = validator.flagProblematicReplacements([]);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });

  describe('validateCharacterEncoding', () => {
    it('should validate character encoding', () => {
      const result = validator.validateCharacterEncoding([]);
      expect(result.isValid).toBe(true); // Empty array is considered valid
      expect(result.issues).toContain('No placenames provided for encoding validation');
    });
  });
});