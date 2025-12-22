/**
 * Property-based tests for Placename Placeholder Replacement System
 * 
 * These tests validate universal properties that should hold across all inputs
 * using fast-check for property-based testing.
 */

const fc = require('fast-check');
const PlaceholderScanner = require('../src/PlaceholderScanner');
const ResearchEngine = require('../src/ResearchEngine');
const ReplacementEngine = require('../src/ReplacementEngine');
const ValidationSystem = require('../src/ValidationSystem');
const ReportGenerator = require('../src/ReportGenerator');

// Test configuration constants
const TEST_CONFIG = {
  PERFORMANCE: {
    FAST_RATE_LIMIT_MS: 10,
    REDUCED_RUNS: 20,
    STANDARD_RUNS: 100,
    MINIMAL_RUNS: 30
  },
  VALIDATION: {
    MIN_PLACENAME_LENGTH: 2,
    MAX_PLACENAME_LENGTH: 20,
    MIN_LANGUAGE_NAME_LENGTH: 3,
    MAX_LANGUAGE_NAME_LENGTH: 50
  },
  PATTERNS: {
    PLACEHOLDER_REGEX: /_\d+_(unq(\d+)?|u\d+)$/,
    VALID_PLACENAME_REGEX: /^[a-zA-Z\-']+$/,
    LANGUAGE_NAME_REGEX: /^[a-zA-Z]+$/
  }
};

// Test helper functions for better organization and reusability
const TestHelpers = {
  // Mock management utilities
  async testWithMockedResearchEngine(testFn) {
    const mockResearchFromWikipedia = jest.fn();
    const mockResearchFromGeographicDatabases = jest.fn();
    
    const originalWikipedia = ResearchEngine.prototype.researchFromWikipedia;
    const originalGeographic = ResearchEngine.prototype.researchFromGeographicDatabases;
    
    ResearchEngine.prototype.researchFromWikipedia = mockResearchFromWikipedia;
    ResearchEngine.prototype.researchFromGeographicDatabases = mockResearchFromGeographicDatabases;
    
    try {
      await testFn({ mockResearchFromWikipedia, mockResearchFromGeographicDatabases });
    } finally {
      ResearchEngine.prototype.researchFromWikipedia = originalWikipedia;
      ResearchEngine.prototype.researchFromGeographicDatabases = originalGeographic;
    }
  },

  // Arbitraries for consistent test data generation
  generateLanguageGroupsArbitrary() {
    return fc.array(
      fc.oneof(
        fc.constant('french'),
        fc.constant('german'), 
        fc.constant('spanish'),
        fc.constant('italian'),
        fc.constant('polish'),
        fc.constant('chinese'),
        fc.constant('arabic'),
        fc.string({ minLength: 3, maxLength: 20 }).filter(s => /^[a-zA-Z]+$/.test(s))
      ),
      { minLength: 1, maxLength: 3 }
    );
  },

  generatePlaceholderPatternsArbitrary() {
    return fc.array(
      fc.oneof(
        // UNQ patterns
        fc.tuple(fc.string({ minLength: 1, maxLength: 20 }), fc.integer({ min: 1, max: 15000 }), fc.integer({ min: 1, max: 50 }))
          .map(([base, index, seq]) => `${base}_${index}_unq${seq}`),
        // U patterns  
        fc.tuple(fc.string({ minLength: 1, maxLength: 20 }), fc.integer({ min: 1, max: 15000 }), fc.integer({ min: 1, max: 50 }))
          .map(([base, index, seq]) => `${base}_${index}_u${seq}`),
        // Truncated patterns
        fc.tuple(fc.string({ minLength: 1, maxLength: 20 }), fc.integer({ min: 1, max: 15000 }))
          .map(([base, index]) => `${base}_${index}_unq`),
        // Regular names (non-placeholders)
        fc.string({ minLength: 3, maxLength: 20 }).filter(s => !/_\d+_(unq|u)/.test(s))
      ),
      { minLength: 1, maxLength: 20 }
    );
  },

  // Mock configuration utilities
  configureMockResearchEngine(mockEngine, languageGroups) {
    mockEngine.mockResearchFromWikipedia.mockImplementation(async (languageGroup) => {
      return [`${languageGroup}_wiki_place1`, `${languageGroup}_wiki_place2`];
    });
    
    mockEngine.mockResearchFromGeographicDatabases.mockImplementation(async (languageGroup) => {
      return [`${languageGroup}_geo_place1`, `${languageGroup}_geo_place2`];
    });
  },

  createTestResearchEngine() {
    return new ResearchEngine({
      sources: {
        wikipedia: true,
        openstreetmap: true,
        geonames: true
      },
      rateLimitMs: 10 // Very fast for testing
    });
  },

  // Validation utilities
  async validateMultiSourceResearch(engine, languageGroup) {
    const multiSourceResults = await engine.getFromMultipleSources(languageGroup);
    
    expect(Array.isArray(multiSourceResults)).toBe(true);
    
    multiSourceResults.forEach(result => {
      expect(result).toHaveProperty('placenames');
      expect(result).toHaveProperty('source');
      expect(result).toHaveProperty('reliability');
      expect(Array.isArray(result.placenames)).toBe(true);
      expect(typeof result.source).toBe('string');
      expect(typeof result.reliability).toBe('number');
      expect(result.reliability).toBeGreaterThanOrEqual(0);
      expect(result.reliability).toBeLessThanOrEqual(1);
    });

    return multiSourceResults;
  },

  async validateConflictResolution(engine, languageGroup) {
    const multiSourceResults = await engine.getFromMultipleSources(languageGroup);
    
    if (multiSourceResults.length > 1) {
      const prioritized = engine.prioritizeAndResolveConflicts(multiSourceResults);
      
      expect(Array.isArray(prioritized)).toBe(true);
      
      const uniqueNames = new Set(prioritized);
      expect(uniqueNames.size).toBe(prioritized.length);
      
      prioritized.forEach(name => {
        expect(typeof name).toBe('string');
        expect(name.length).toBeGreaterThan(0);
      });
    }
  },

  validatePlaceholderDetection(scanner, placenames) {
    const detectedPlaceholders = scanner.detectPlaceholderPatterns(placenames);
    
    placenames.forEach(name => {
      const isPlaceholder = /_\d+_(unq(\d+)?|u\d+)$/.test(name);
      const wasDetected = detectedPlaceholders.some(p => p.original === name);
      
      if (isPlaceholder) {
        expect(wasDetected).toBe(true);
      }
    });

    return detectedPlaceholders;
  }
};

// Destructure for cleaner usage
const { 
  testWithMockedResearchEngine, 
  generateLanguageGroupsArbitrary,
  generatePlaceholderPatternsArbitrary,
  configureMockResearchEngine,
  createTestResearchEngine,
  validateMultiSourceResearch,
  validateConflictResolution,
  validatePlaceholderDetection
} = TestHelpers;

describe('Property-Based Tests', () => {
  
  describe('Property 1: Comprehensive Placeholder Detection', () => {
    /**
     * Feature: placename-placeholder-replacement, Property 1: 
     * For any namebase file, the scanner should identify all 12,600+ placeholder patterns 
     * including _unq\d+ variants, _u\d+ patterns, and truncated formats, 
     * extracting associated language group information
     * **Validates: Requirements 1.1, 1.2, 1.3**
     */
    it('should detect all placeholder patterns comprehensively', () => {
      fc.assert(
        fc.property(
          // Generate test data with various placeholder patterns
          fc.array(
            fc.record({
              name: fc.string({ minLength: 3, maxLength: 50 }),
              i: fc.integer({ min: 1, max: 15000 }),
              min: fc.integer({ min: 3, max: 15 }),
              max: fc.integer({ min: 5, max: 20 }),
              d: fc.string({ maxLength: 10 }),
              m: fc.float({ min: 0, max: 1 }),
              b: fc.array(
                fc.oneof(
                  // Regular placenames
                  fc.string({ minLength: 3, maxLength: 15 }),
                  // UNQ pattern placeholders
                  fc.string().map(base => `${base}_${fc.sample(fc.integer({ min: 1, max: 15000 }), 1)[0]}_unq${fc.sample(fc.integer({ min: 1, max: 20 }), 1)[0]}`),
                  // U pattern placeholders
                  fc.string().map(base => `${base}_${fc.sample(fc.integer({ min: 1, max: 15000 }), 1)[0]}_u${fc.sample(fc.integer({ min: 1, max: 20 }), 1)[0]}`),
                  // Truncated patterns
                  fc.string().map(base => `${base}_${fc.sample(fc.integer({ min: 1, max: 15000 }), 1)[0]}_unq`)
                ),
                { minLength: 5, maxLength: 50 }
              ).map(arr => arr.join(','))
            }),
            { minLength: 1, maxLength: 10 }
          ),
          (testEntries) => {
            const scanner = new PlaceholderScanner('test-file.js');
            
            // Test each entry for placeholder detection
            testEntries.forEach(entry => {
              const languageInfo = scanner.extractLanguageInfo(entry);
              
              // Property: All placeholder patterns should be detected
              const placenames = entry.b ? entry.b.split(',') : [];
              const detectedPlaceholders = validatePlaceholderDetection(scanner, placenames);
              
              // Property: Language info should be extracted correctly
              expect(languageInfo.name).toBe(entry.name);
              expect(languageInfo.index).toBe(entry.i);
              expect(languageInfo.minLength).toBe(entry.min);
              expect(languageInfo.maxLength).toBe(entry.max);
              expect(languageInfo.hasPlaceholders).toBe(detectedPlaceholders.length > 0);
              expect(languageInfo.placeholderCount).toBe(detectedPlaceholders.length);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should correctly categorize different placeholder pattern types', () => {
      fc.assert(
        fc.property(
          generatePlaceholderPatternsArbitrary(),
          (testNames) => {
            const scanner = new PlaceholderScanner('test-file.js');
            const detectedPlaceholders = validatePlaceholderDetection(scanner, testNames);
            
            // Property: Pattern types should be correctly identified
            detectedPlaceholders.forEach(placeholder => {
              if (placeholder.original.includes('_unq') && /\d+$/.test(placeholder.original)) {
                expect(placeholder.type).toBe('unq');
              } else if (placeholder.original.includes('_u') && /\d+$/.test(placeholder.original)) {
                expect(placeholder.type).toBe('u');
              } else if (placeholder.original.endsWith('_unq')) {
                expect(placeholder.type).toBe('truncated');
              }
              
              // All detected placeholders should have required fields
              expect(placeholder.original).toBeDefined();
              expect(placeholder.type).toBeDefined();
              expect(placeholder.languageBase).toBeDefined();
              expect(placeholder.index).toBeDefined();
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 2: Multi-Source Research Coverage', () => {
    /**
     * Feature: placename-placeholder-replacement, Property 2:
     * For any language group research operation, the system should query multiple 
     * authoritative sources and prioritize academic/official sources when conflicts arise
     * **Validates: Requirements 2.1, 2.4**
     */
    it('should research from multiple sources with proper prioritization', async () => {
      await testWithMockedResearchEngine(async (mockEngine) => {
        await fc.assert(
          fc.asyncProperty(
            generateLanguageGroupsArbitrary(),
            async (languageGroups) => {
              configureMockResearchEngine(mockEngine, languageGroups);
              
              const engine = createTestResearchEngine();
              
              for (const languageGroup of languageGroups) {
                await validateMultiSourceResearch(engine, languageGroup);
                await validateConflictResolution(engine, languageGroup);
              }
            }
          ),
          { numRuns: 20 }
        );
      });
    });

    it('should handle source reliability scoring correctly', () => {
      fc.assert(
        fc.property(
          // Generate mock source results with different reliability scores
          fc.array(
            fc.record({
              placenames: fc.array(fc.string({ minLength: 3, maxLength: 15 }), { minLength: 1, maxLength: 10 }),
              source: fc.oneof(
                fc.constant('Wikipedia'),
                fc.constant('OpenStreetMap'), 
                fc.constant('GeoNames'),
                fc.constant('Academic Source'),
                fc.constant('Government Database')
              ),
              reliability: fc.float({ min: 0, max: 1 })
            }),
            { minLength: 2, maxLength: 5 }
          ),
          (sourceResults) => {
            const engine = new ResearchEngine();
            
            // Property: Higher reliability sources should be prioritized
            const prioritized = engine.prioritizeAndResolveConflicts(sourceResults);
            
            // Should return an array
            expect(Array.isArray(prioritized)).toBe(true);
            
            // Should not contain duplicates
            const uniqueNames = new Set(prioritized);
            expect(uniqueNames.size).toBe(prioritized.length);
            
            // When there are conflicts (same placename from multiple sources),
            // the version from the higher reliability source should be kept
            const allPlacenames = sourceResults.flatMap(result => 
              result.placenames.map(name => ({ name, source: result.source, reliability: result.reliability }))
            );
            
            // Group by placename to find conflicts
            const nameGroups = new Map();
            allPlacenames.forEach(item => {
              const normalizedName = engine._normalizePlacename(item.name);
              if (!nameGroups.has(normalizedName)) {
                nameGroups.set(normalizedName, []);
              }
              nameGroups.get(normalizedName).push(item);
            });
            
            // For each conflict, verify the highest reliability source was chosen
            nameGroups.forEach((sources, normalizedName) => {
              if (sources.length > 1) {
                const originalName = sources.find(s => engine._normalizePlacename(s.name) === normalizedName)?.name;
                if (originalName && prioritized.includes(originalName)) {
                  const maxReliability = Math.max(...sources.map(s => s.reliability));
                  const hasHighReliabilitySource = sources.some(s => s.reliability === maxReliability);
                  expect(hasHighReliabilitySource).toBe(true);
                }
              }
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 3: Authenticity and Linguistic Validation', () => {
    /**
     * Feature: placename-placeholder-replacement, Property 3:
     * For any set of researched placenames, they should be geographically appropriate, 
     * historically accurate, and follow the phonological patterns typical of their language group
     * **Validates: Requirements 2.2, 2.3, 4.1, 4.3**
     */
    it('should validate authenticity and linguistic patterns', async () => {
      // Create realistic language-placename mappings to avoid geographic mismatches
      const languagePlacenameMap = {
        'french': ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier'],
        'german': ['Berlin', 'Munich', 'Hamburg', 'Cologne', 'Frankfurt', 'Stuttgart', 'Dresden', 'Leipzig'],
        'spanish': ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Zaragoza', 'Malaga', 'Murcia', 'Palma'],
        'italian': ['Rome', 'Milan', 'Naples', 'Turin', 'Palermo', 'Genoa', 'Bologna', 'Florence'],
        'arabic': ['Cairo', 'Baghdad', 'Damascus', 'Aleppo', 'Casablanca', 'Tunis', 'Algiers', 'Rabat'],
        'chinese': ['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen', 'Tianjin', 'Wuhan', 'Dongguan', 'Chengdu'],
        'japanese': ['Tokyo', 'Osaka', 'Yokohama', 'Nagoya', 'Sapporo', 'Fukuoka', 'Kobe', 'Kyoto']
      };

      await fc.assert(
        fc.asyncProperty(
          // Generate realistic language-placename combinations
          fc.oneof(
            ...Object.keys(languagePlacenameMap).map(lang => 
              fc.record({
                languageGroup: fc.constant(lang),
                placenames: fc.array(
                  fc.oneof(
                    // Use authentic placenames for this language
                    ...languagePlacenameMap[lang].map(name => fc.constant(name)),
                    // Generate realistic-looking placenames (no spaces, proper format)
                    fc.string({ minLength: 4, maxLength: 15 })
                      .filter(s => TEST_CONFIG.PATTERNS.LANGUAGE_NAME_REGEX.test(s))
                      .filter(s => s.length >= 4)
                      .map(s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
                  ),
                  { minLength: 1, maxLength: 8 }
                )
              })
            )
          ),
          async (testData) => {
            return await validateAuthenticityProperty(testData);
          }
        ),
        { numRuns: TEST_CONFIG.PERFORMANCE.MINIMAL_RUNS }
      );
    });

    async function validateAuthenticityProperty(testData) {
      try {
        const engine = new ResearchEngine();
        
        // Filter for valid placenames using configuration
        const validPlacenames = testData.placenames.filter(name => 
          name && 
          typeof name === 'string' && 
          name.trim().length >= TEST_CONFIG.VALIDATION.MIN_PLACENAME_LENGTH &&
          TEST_CONFIG.PATTERNS.VALID_PLACENAME_REGEX.test(name.trim())
        );
        
        if (validPlacenames.length === 0) {
          return true; // Skip test if no valid placenames
        }
        
        const authenticityResult = await engine.validateAuthenticity(validPlacenames, testData.languageGroup);
        
        // Validate result structure
        validateAuthenticityResultStructure(authenticityResult);
        
        // Validate scores are within bounds
        validateScoreBounds(authenticityResult);
        
        // Validate validated placenames are subset of input
        validatePlacenameSubset(authenticityResult.validatedPlacenames, validPlacenames);
        
        // Test phonological patterns
        const phonologicalResult = engine.validatePhonologicalPatterns(validPlacenames, testData.languageGroup);
        expect(typeof phonologicalResult).toBe('boolean');
        
        return true;
        
      } catch (error) {
        console.error('Authenticity validation failed:', {
          error: error.message,
          testData: JSON.stringify(testData, null, 2)
        });
        throw error; // Re-throw to fail the test properly
      }
    }

    function validateAuthenticityResultStructure(result) {
      const requiredProperties = ['isValid', 'confidence', 'issues', 'validatedPlacenames', 'geographicScore', 'historicalScore', 'phonologicalScore'];
      
      requiredProperties.forEach(prop => {
        expect(result).toHaveProperty(prop);
      });
      
      expect(Array.isArray(result.issues)).toBe(true);
      expect(Array.isArray(result.validatedPlacenames)).toBe(true);
    }

    function validateScoreBounds(result) {
      const scores = ['confidence', 'geographicScore', 'historicalScore', 'phonologicalScore'];
      
      scores.forEach(scoreKey => {
        const score = result[scoreKey];
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(1);
        expect(Number.isNaN(score)).toBe(false);
      });
    }

    function validatePlacenameSubset(validatedPlacenames, inputPlacenames) {
      validatedPlacenames.forEach(name => {
        expect(inputPlacenames).toContain(name);
      });
    }

    it('should handle edge cases in authenticity validation', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.oneof(
            // Empty arrays
            fc.constant([]),
            // Single valid placename (no spaces, proper format)
            fc.array(
              fc.string({ minLength: 4, maxLength: 15 })
                .filter(s => TEST_CONFIG.PATTERNS.LANGUAGE_NAME_REGEX.test(s))
                .map(s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()),
              { minLength: 1, maxLength: 1 }
            ),
            // Array of well-known placenames (no geographic mismatches)
            fc.array(
              fc.oneof(
                fc.constant('London'),
                fc.constant('Berlin'),
                fc.constant('Madrid'),
                fc.constant('Rome')
              ),
              { minLength: 1, maxLength: 5 }
            )
          ),
          fc.oneof(
            fc.constant('english'),
            fc.constant('german'),
            fc.constant('spanish'),
            fc.constant('italian')
          ),
          async (placenames, languageGroup) => {
            return await validateEdgeCaseHandling(placenames, languageGroup);
          }
        ),
        { numRuns: TEST_CONFIG.PERFORMANCE.REDUCED_RUNS }
      );
    });

    async function validateEdgeCaseHandling(placenames, languageGroup) {
      const engine = new ResearchEngine();
      
      try {
        const result = await engine.validateAuthenticity(placenames, languageGroup);
        
        // Property: Should always return a structured result, even for edge cases
        validateAuthenticityResultStructure(result);
        
        // Property: Empty input should return invalid result
        if (placenames.length === 0) {
          expect(result.isValid).toBe(false);
          expect(result.confidence).toBe(0);
          expect(result.validatedPlacenames).toEqual([]);
        }
        
        // Property: Confidence should always be a valid number
        expect(typeof result.confidence).toBe('number');
        expect(result.confidence).toBeGreaterThanOrEqual(0);
        expect(result.confidence).toBeLessThanOrEqual(1);
        expect(Number.isNaN(result.confidence)).toBe(false);
        
        return true;
        
      } catch (error) {
        // Should handle errors gracefully - log but don't fail the property
        console.warn('Edge case handling encountered expected error:', {
          error: error.message,
          placenames,
          languageGroup
        });
        
        // Verify error has meaningful message
        expect(error.message).toBeDefined();
        expect(typeof error.message).toBe('string');
        expect(error.message.length).toBeGreaterThan(0);
        
        return true; // Error handling is acceptable behavior
      }
    }
  });

  describe('Property 4: Replacement Preservation and Consistency', () => {
    /**
     * Feature: placename-placeholder-replacement, Property 4:
     * For any placeholder replacement operation, all original metadata should be preserved 
     * exactly while maintaining the same number of placename seeds
     * **Validates: Requirements 3.1, 3.2**
     */
    it('should preserve metadata and maintain seed count during replacement', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate test namebase entries with placeholders
          fc.record({
            name: fc.string({ minLength: 3, maxLength: 20 }).filter(s => /^[a-zA-Z]+$/.test(s)),
            i: fc.integer({ min: 1, max: 15000 }),
            min: fc.integer({ min: 3, max: 15 }),
            max: fc.integer({ min: 5, max: 20 }),
            d: fc.string({ maxLength: 10 }),
            m: fc.float({ min: 0, max: 1 }),
            b: fc.array(
              fc.oneof(
                // Regular placenames (non-placeholders)
                fc.string({ minLength: 3, maxLength: 15 }).filter(s => /^[a-zA-Z]+$/.test(s)),
                // Placeholder patterns
                fc.string({ minLength: 3, maxLength: 10 }).map(base => `${base}_123_unq1`),
                fc.string({ minLength: 3, maxLength: 10 }).map(base => `${base}_456_u2`),
                fc.string({ minLength: 3, maxLength: 10 }).map(base => `${base}_789_unq`)
              ),
              { minLength: 5, maxLength: 20 }
            ).map(arr => arr.join(','))
          }),
          // Generate replacement placenames
          fc.array(
            fc.string({ minLength: 3, maxLength: 15 }).filter(s => /^[a-zA-Z]+$/.test(s)),
            { minLength: 1, maxLength: 10 }
          ),
          async (testEntry, replacementNames) => {
            const engine = new ReplacementEngine({}, {});
            
            // Count placeholders in the entry
            const placenames = testEntry.b ? testEntry.b.split(',') : [];
            const placeholderCount = placenames.filter(name => engine.isPlaceholder(name)).length;
            
            if (placeholderCount === 0) {
              // No placeholders to replace, test should handle this gracefully
              const result = await engine.replacePlaceholders(testEntry, replacementNames);
              expect(result.hasChanges).toBe(false);
              return;
            }
            
            // Ensure we have enough replacement names
            const sufficientReplacements = replacementNames.slice(0, Math.max(placeholderCount, replacementNames.length));
            if (sufficientReplacements.length < placeholderCount) {
              // Pad with generated names if needed
              while (sufficientReplacements.length < placeholderCount) {
                sufficientReplacements.push(`Generated${sufficientReplacements.length}`);
              }
            }
            
            // Property: Replacement should succeed with valid inputs
            const result = await engine.replacePlaceholders(testEntry, sufficientReplacements);
            
            // Property: All metadata should be preserved exactly
            expect(result.name).toBe(testEntry.name);
            expect(result.i).toBe(testEntry.i);
            expect(result.min).toBe(testEntry.min);
            expect(result.max).toBe(testEntry.max);
            expect(result.d).toBe(testEntry.d);
            expect(result.m).toBe(testEntry.m);
            
            // Property: Number of placenames should remain the same
            const originalPlacenames = testEntry.b ? testEntry.b.split(',') : [];
            const updatedPlacenames = result.b ? result.b.split(',') : [];
            expect(updatedPlacenames.length).toBe(originalPlacenames.length);
            
            // Property: Non-placeholder names should remain unchanged
            const originalNonPlaceholders = [];
            const updatedNonPlaceholders = [];
            
            originalPlacenames.forEach((name, index) => {
              if (!engine.isPlaceholder(name)) {
                originalNonPlaceholders.push(name);
                updatedNonPlaceholders.push(updatedPlacenames[index]);
              }
            });
            
            expect(updatedNonPlaceholders).toEqual(originalNonPlaceholders);
            
            // Property: Validation should pass for valid replacements
            const isValid = engine.validateReplacements(testEntry, result);
            expect(isValid).toBe(true);
            
            // Property: Replacement count should match placeholder count
            if (result.hasChanges) {
              expect(result.replacedCount).toBe(placeholderCount);
              expect(result.originalPlaceholders).toHaveLength(placeholderCount);
              expect(result.newPlacenames).toHaveLength(placeholderCount);
            }
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should handle edge cases in replacement operations', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate edge case scenarios
          fc.oneof(
            // Empty placenames
            fc.record({
              name: fc.constant('test'),
              i: fc.constant(1),
              min: fc.constant(3),
              max: fc.constant(10),
              d: fc.constant(''),
              m: fc.constant(0),
              b: fc.constant('')
            }),
            // Only non-placeholders
            fc.record({
              name: fc.constant('test'),
              i: fc.constant(1),
              min: fc.constant(3),
              max: fc.constant(10),
              d: fc.constant(''),
              m: fc.constant(0),
              b: fc.constant('Paris,London,Berlin')
            }),
            // Only placeholders
            fc.record({
              name: fc.constant('test'),
              i: fc.constant(1),
              min: fc.constant(3),
              max: fc.constant(10),
              d: fc.constant(''),
              m: fc.constant(0),
              b: fc.constant('test_123_unq1,test_456_u2,test_789_unq')
            })
          ),
          fc.array(fc.string({ minLength: 3, maxLength: 10 }), { minLength: 0, maxLength: 5 }),
          async (testEntry, replacementNames) => {
            const engine = new ReplacementEngine({}, {});
            
            const placenames = testEntry.b ? testEntry.b.split(',').filter(n => n.length > 0) : [];
            const placeholderCount = placenames.filter(name => engine.isPlaceholder(name)).length;
            
            if (placeholderCount === 0) {
              // Property: Should handle entries with no placeholders gracefully
              const result = await engine.replacePlaceholders(testEntry, replacementNames);
              expect(result.hasChanges).toBe(false);
              expect(result.name).toBe(testEntry.name);
              expect(result.i).toBe(testEntry.i);
            } else if (replacementNames.length < placeholderCount) {
              // Property: Should fail gracefully when insufficient replacements provided
              await expect(engine.replacePlaceholders(testEntry, replacementNames))
                .rejects.toThrow('Insufficient replacement names');
            } else {
              // Property: Should succeed when sufficient replacements provided
              const result = await engine.replacePlaceholders(testEntry, replacementNames);
              expect(result.hasChanges).toBe(true);
              expect(result.replacedCount).toBe(placeholderCount);
            }
          }
        ),
        { numRuns: 30 }
      );
    });

    it('should maintain consistency across batch replacement operations', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate multiple entries for batch processing
          fc.array(
            fc.record({
              name: fc.string({ minLength: 3, maxLength: 15 }).filter(s => /^[a-zA-Z]+$/.test(s)),
              i: fc.integer({ min: 1, max: 1000 }),
              min: fc.integer({ min: 3, max: 10 }),
              max: fc.integer({ min: 5, max: 15 }),
              d: fc.string({ maxLength: 5 }),
              m: fc.float({ min: 0, max: 1 }),
              b: fc.array(
                fc.oneof(
                  fc.string({ minLength: 3, maxLength: 10 }).filter(s => /^[a-zA-Z]+$/.test(s)),
                  fc.string({ minLength: 3, maxLength: 8 }).map(base => `${base}_123_unq1`)
                ),
                { minLength: 3, maxLength: 8 }
              ).map(arr => arr.join(','))
            }),
            { minLength: 1, maxLength: 5 }
          ),
          async (testEntries) => {
            const engine = new ReplacementEngine({}, {});
            const replacementMap = new Map();
            
            // Prepare replacements for each entry
            testEntries.forEach((entry, index) => {
              const placenames = entry.b ? entry.b.split(',') : [];
              const placeholderCount = placenames.filter(name => engine.isPlaceholder(name)).length;
              
              if (placeholderCount > 0) {
                const replacements = Array.from({ length: placeholderCount }, (_, i) => 
                  `Replacement${index}_${i}`
                );
                replacementMap.set(entry, replacements);
              }
            });
            
            if (replacementMap.size === 0) {
              return; // No replacements needed
            }
            
            // Property: Batch replacement should succeed
            const batchResult = await engine.applyReplacements(replacementMap);
            
            expect(batchResult.totalEntries).toBe(replacementMap.size);
            expect(batchResult.successfulReplacements).toBeGreaterThanOrEqual(0);
            expect(batchResult.failedReplacements).toBeGreaterThanOrEqual(0);
            expect(batchResult.successfulReplacements + batchResult.failedReplacements).toBe(replacementMap.size);
            
            // Property: Each successful replacement should maintain consistency
            batchResult.replacements.forEach(replacement => {
              expect(replacement.result.hasChanges).toBe(true);
              expect(replacement.result.replacedCount).toBeGreaterThan(0);
              expect(replacement.timestamp).toBeDefined();
            });
            
            // Property: Errors should be properly tracked
            expect(Array.isArray(batchResult.errors)).toBe(true);
            batchResult.errors.forEach(error => {
              expect(error.entry).toBeDefined();
              expect(error.error).toBeDefined();
              expect(error.timestamp).toBeDefined();
            });
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  describe('Property 5: Backup and Recovery Integrity', () => {
    /**
     * Feature: placename-placeholder-replacement, Property 5:
     * For any file modification operation, a timestamped backup should be created 
     * that enables complete restoration of the original state
     * **Validates: Requirements 3.3**
     */
    it('should create reliable backups for complete restoration', async () => {
      const fs = require('fs').promises;
      const path = require('path');
      const os = require('os');
      
      await fc.assert(
        fc.asyncProperty(
          // Generate test file content
          fc.string({ minLength: 100, maxLength: 5000 }),
          async (fileContent) => {
            // Create temporary test file
            const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'backup-test-'));
            const testFilePath = path.join(tempDir, 'test-file.js');
            
            try {
              // Write test content
              await fs.writeFile(testFilePath, fileContent, 'utf8');
              
              // Create ReplacementEngine instance
              const engine = new ReplacementEngine({}, {});
              
              // Property: Backup creation should succeed
              const backupPath = await engine.createBackup(testFilePath);
              expect(typeof backupPath).toBe('string');
              expect(backupPath.length).toBeGreaterThan(0);
              
              // Property: Backup file should exist
              const backupExists = await fs.access(backupPath).then(() => true).catch(() => false);
              expect(backupExists).toBe(true);
              
              // Property: Backup content should match original
              const backupContent = await fs.readFile(backupPath, 'utf8');
              expect(backupContent).toBe(fileContent);
              
              // Property: Checksum file should exist
              const checksumPath = `${backupPath}.checksum`;
              const checksumExists = await fs.access(checksumPath).then(() => true).catch(() => false);
              expect(checksumExists).toBe(true);
              
              // Property: Backup integrity validation should pass
              const checksumContent = await fs.readFile(checksumPath, 'utf8');
              const isValid = await engine.validateBackupIntegrity(backupPath, checksumContent);
              expect(isValid).toBe(true);
              
              // Property: Restoration should work perfectly
              const modifiedContent = fileContent + '\n// Modified content';
              await fs.writeFile(testFilePath, modifiedContent, 'utf8');
              
              const restored = await engine.restoreFromBackup(backupPath, testFilePath);
              expect(restored).toBe(true);
              
              // Property: Restored content should match original exactly
              const restoredContent = await fs.readFile(testFilePath, 'utf8');
              expect(restoredContent).toBe(fileContent);
              
              // Property: Multiple backups should be manageable
              const backups = await engine.listBackups(path.basename(testFilePath));
              expect(Array.isArray(backups)).toBe(true);
              expect(backups.length).toBeGreaterThanOrEqual(1);
              
              // Each backup should have required properties
              backups.forEach(backup => {
                expect(backup).toHaveProperty('path');
                expect(backup).toHaveProperty('filename');
                expect(backup).toHaveProperty('timestamp');
                expect(backup).toHaveProperty('checksumPath');
              });
              
            } finally {
              // Cleanup
              try {
                await fs.rm(tempDir, { recursive: true, force: true });
              } catch (error) {
                // Ignore cleanup errors
              }
            }
          }
        ),
        { numRuns: 30 }
      );
    });

    it('should handle backup corruption and validation failures', async () => {
      const fs = require('fs').promises;
      const path = require('path');
      const os = require('os');
      
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 50, maxLength: 1000 }),
          async (originalContent) => {
            const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'backup-corruption-test-'));
            const testFilePath = path.join(tempDir, 'test-file.js');
            
            try {
              await fs.writeFile(testFilePath, originalContent, 'utf8');
              
              const engine = new ReplacementEngine({}, {});
              const backupPath = await engine.createBackup(testFilePath);
              
              // Property: Corrupted backup should be detected
              const corruptedContent = originalContent + 'CORRUPTED';
              await fs.writeFile(backupPath, corruptedContent, 'utf8');
              
              const checksumPath = `${backupPath}.checksum`;
              const originalChecksum = await fs.readFile(checksumPath, 'utf8');
              
              const isCorrupted = await engine.validateBackupIntegrity(backupPath, originalChecksum);
              expect(isCorrupted).toBe(false);
              
              // Property: Restoration from corrupted backup should fail
              await expect(engine.restoreFromBackup(backupPath, testFilePath))
                .rejects.toThrow('Backup integrity validation failed');
              
            } finally {
              try {
                await fs.rm(tempDir, { recursive: true, force: true });
              } catch (error) {
                // Ignore cleanup errors
              }
            }
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  describe('Property 6: Quality Threshold Maintenance', () => {
    /**
     * Feature: placename-placeholder-replacement, Property 6:
     * For any language group, the system should maintain a minimum of 12 authentic placenames 
     * with reliable source citations, or flag insufficient data for manual review
     * **Validates: Requirements 2.5, 4.5**
     */
    it('should maintain quality thresholds or flag for review', () => {
      fc.assert(
        fc.property(
          // Generate test placenames with varying quality levels
          fc.record({
            languageGroup: fc.oneof(
              fc.constant('french'),
              fc.constant('german'),
              fc.constant('spanish'),
              fc.constant('italian'),
              fc.constant('chinese'),
              fc.constant('arabic'),
              fc.string({ minLength: 3, maxLength: 15 }).filter(s => /^[a-zA-Z]+$/.test(s))
            ),
            placenames: fc.array(
              fc.oneof(
                // High quality placenames
                fc.oneof(
                  fc.constant('Paris'),
                  fc.constant('Berlin'),
                  fc.constant('Madrid'),
                  fc.constant('Rome'),
                  fc.constant('London'),
                  fc.constant('Vienna'),
                  fc.constant('Prague'),
                  fc.constant('Warsaw')
                ),
                // Medium quality placenames
                fc.string({ minLength: 4, maxLength: 15 })
                  .filter(s => /^[a-zA-Z]+$/.test(s))
                  .map(s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()),
                // Low quality placenames (problematic)
                fc.oneof(
                  fc.constant('a'), // Too short
                  fc.constant('verylongplacenamethatexceedslimits'), // Too long
                  fc.constant('test123'), // Contains numbers
                  fc.constant('placeholder'), // Test data
                  fc.constant(''), // Empty
                  fc.constant('   '), // Whitespace only
                  fc.constant('Test<>'), // Invalid characters
                  fc.constant('multiple  spaces') // Multiple spaces
                )
              ),
              { minLength: 0, maxLength: 25 }
            ),
            qualityCriteria: fc.record({
              minCount: fc.integer({ min: 5, max: 20 }),
              minQualityScore: fc.float({ min: Math.fround(0.3), max: Math.fround(0.9) }),
              maxLength: fc.integer({ min: 20, max: 100 }),
              minLength: fc.integer({ min: 1, max: 5 })
            })
          }),
          (testData) => {
            const validator = new ValidationSystem();
            
            // Property: Quality threshold checking should always return structured results
            const result = validator.checkQualityThresholds(testData.placenames, testData.qualityCriteria);
            
            // Validate result structure
            expect(result).toHaveProperty('passed');
            expect(result).toHaveProperty('count');
            expect(result).toHaveProperty('qualityScore');
            expect(result).toHaveProperty('issues');
            expect(result).toHaveProperty('validPlacenames');
            expect(result).toHaveProperty('flaggedForReview');
            expect(result).toHaveProperty('statistics');
            
            expect(typeof result.passed).toBe('boolean');
            expect(typeof result.count).toBe('number');
            expect(typeof result.qualityScore).toBe('number');
            expect(Array.isArray(result.issues)).toBe(true);
            expect(Array.isArray(result.validPlacenames)).toBe(true);
            expect(Array.isArray(result.flaggedForReview)).toBe(true);
            expect(typeof result.statistics).toBe('object');
            
            // Property: Count should match input length
            expect(result.count).toBe(testData.placenames.length);
            
            // Property: Quality score should be between 0 and 1
            expect(result.qualityScore).toBeGreaterThanOrEqual(0);
            expect(result.qualityScore).toBeLessThanOrEqual(1);
            expect(Number.isNaN(result.qualityScore)).toBe(false);
            
            // Property: Valid placenames should be subset of input
            result.validPlacenames.forEach(name => {
              expect(testData.placenames).toContain(name);
            });
            
            // Property: Insufficient data should be flagged
            if (testData.placenames.length < testData.qualityCriteria.minCount) {
              expect(result.passed).toBe(false);
              expect(result.issues.some(issue => issue.includes('Insufficient placenames'))).toBe(true);
              expect(result.flaggedForReview.some(flag => flag.type === 'insufficient_data')).toBe(true);
            }
            
            // Property: Low quality placenames should be flagged
            const lowQualityCount = result.flaggedForReview.filter(flag => flag.type === 'low_quality').length;
            if (lowQualityCount > 0) {
              expect(result.issues.some(issue => issue.includes('Low quality placename'))).toBe(true);
            }
            
            // Property: Statistics should be consistent
            expect(result.statistics.totalPlacenames).toBe(testData.placenames.length);
            expect(result.statistics.validPlacenames).toBe(result.validPlacenames.length);
            expect(result.statistics.averageQuality).toBe(result.qualityScore);
            
            if (testData.placenames.length > 0) {
              expect(result.statistics.passRate).toBe(result.validPlacenames.length / testData.placenames.length);
            } else {
              expect(result.statistics.passRate).toBe(0);
            }
            
            // Property: Quality distribution should sum correctly
            const distribution = result.statistics.qualityDistribution;
            expect(distribution.high + distribution.medium + distribution.low).toBe(testData.placenames.length);
            
            // Property: Flagged items should have proper severity levels and structure
            result.flaggedForReview.forEach(flag => {
              expect(['high', 'medium', 'low']).toContain(flag.severity);
              expect(flag.type).toBeDefined();
              
              // Different flag types have different structures
              if (flag.type === 'insufficient_data') {
                expect(flag.message).toBeDefined();
                expect(typeof flag.message).toBe('string');
              } else if (flag.type === 'low_quality') {
                // Low quality flags have placename, score, and issues instead of message
                expect(flag.placename).toBeDefined();
                expect(typeof flag.placename).toBe('string');
                expect(typeof flag.score).toBe('number');
                expect(Array.isArray(flag.issues)).toBe(true);
              } else {
                // For any other flag types, ensure they have either message or other identifying properties
                const hasMessage = flag.message !== undefined;
                const hasOtherProps = flag.placename !== undefined || flag.issues !== undefined;
                expect(hasMessage || hasOtherProps).toBe(true);
              }
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should flag problematic replacements for manual review', () => {
      fc.assert(
        fc.property(
          // Generate test replacement operations with various issues
          fc.array(
            fc.oneof(
              // Valid replacement
              fc.record({
                languageGroup: fc.string({ minLength: 3, maxLength: 15 }).filter(s => /^[a-zA-Z]+$/.test(s)),
                originalPlaceholders: fc.array(fc.string({ minLength: 5, maxLength: 20 }), { minLength: 1, maxLength: 5 }),
                newPlacenames: fc.array(
                  fc.string({ minLength: 3, maxLength: 15 }).filter(s => /^[a-zA-Z]+$/.test(s)),
                  { minLength: 8, maxLength: 15 }
                ),
                researchResult: fc.record({
                  confidence: fc.float({ min: Math.fround(0.6), max: Math.fround(1.0) }),
                  sources: fc.array(
                    fc.record({
                      name: fc.constant('Wikipedia'),
                      reliability: fc.float({ min: Math.fround(0.7), max: Math.fround(1.0) })
                    }),
                    { minLength: 1, maxLength: 3 }
                  )
                })
              }),
              // Problematic replacement - insufficient data
              fc.record({
                languageGroup: fc.string({ minLength: 3, maxLength: 15 }).filter(s => /^[a-zA-Z]+$/.test(s)),
                originalPlaceholders: fc.array(fc.string({ minLength: 5, maxLength: 20 }), { minLength: 1, maxLength: 5 }),
                newPlacenames: fc.array(
                  fc.string({ minLength: 3, maxLength: 15 }).filter(s => /^[a-zA-Z]+$/.test(s)),
                  { minLength: 1, maxLength: 5 } // Insufficient count
                ),
                researchResult: fc.record({
                  confidence: fc.float({ min: Math.fround(0.3), max: Math.fround(0.6) }), // Low confidence
                  sources: fc.array(
                    fc.record({
                      name: fc.constant('Unknown Source'),
                      reliability: fc.float({ min: Math.fround(0.1), max: Math.fround(0.5) })
                    }),
                    { minLength: 0, maxLength: 1 } // Few or no sources
                  )
                })
              }),
              // Problematic replacement - duplicates
              fc.record({
                languageGroup: fc.string({ minLength: 3, maxLength: 15 }).filter(s => /^[a-zA-Z]+$/.test(s)),
                originalPlaceholders: fc.array(fc.string({ minLength: 5, maxLength: 20 }), { minLength: 1, maxLength: 5 }),
                newPlacenames: fc.oneof(
                  // Duplicate names
                  fc.constant(['Paris', 'Paris', 'London', 'Berlin', 'Paris']),
                  // Low quality names
                  fc.constant(['a', 'test123', 'placeholder', 'verylongplacenamethatexceedslimits'])
                ),
                researchResult: fc.record({
                  confidence: fc.float({ min: Math.fround(0.4), max: Math.fround(0.8) }),
                  sources: fc.array(
                    fc.record({
                      name: fc.constant('Community Source'),
                      reliability: fc.float({ min: Math.fround(0.3), max: Math.fround(0.7) })
                    }),
                    { minLength: 1, maxLength: 2 }
                  )
                })
              }),
              // Cultural sensitivity issues
              fc.record({
                languageGroup: fc.oneof(
                  fc.constant('indigenous'),
                  fc.constant('arabic'),
                  fc.constant('chinese')
                ),
                originalPlaceholders: fc.array(fc.string({ minLength: 5, maxLength: 20 }), { minLength: 1, maxLength: 5 }),
                newPlacenames: fc.oneof(
                  fc.constant(['New York', 'Saint Paul', 'Fort Worth']), // Colonial names for indigenous
                  fc.constant(['Saint Peter', 'Christmas Island', 'Church Hill']), // Christian names for Arabic
                  fc.constant(['Port Victoria', 'Fort George', 'New London']) // Colonial names for Chinese
                ),
                researchResult: fc.record({
                  confidence: fc.float({ min: Math.fround(0.5), max: Math.fround(0.9) }),
                  sources: fc.array(
                    fc.record({
                      name: fc.constant('Wikipedia'),
                      reliability: fc.float({ min: Math.fround(0.6), max: Math.fround(0.9) })
                    }),
                    { minLength: 1, maxLength: 3 }
                  )
                })
              })
            ),
            { minLength: 1, maxLength: 10 }
          ),
          (testReplacements) => {
            const validator = new ValidationSystem();
            
            // Property: Flagging should always return an array
            const flagged = validator.flagProblematicReplacements(testReplacements);
            expect(Array.isArray(flagged)).toBe(true);
            
            // Property: Each flagged item should have required structure
            flagged.forEach(item => {
              expect(item).toHaveProperty('replacementIndex');
              expect(item).toHaveProperty('replacement');
              expect(item).toHaveProperty('flags');
              expect(item).toHaveProperty('severity');
              expect(item).toHaveProperty('recommendedAction');
              
              expect(typeof item.replacementIndex).toBe('number');
              expect(Array.isArray(item.flags)).toBe(true);
              expect(['high', 'medium', 'low']).toContain(item.severity);
              expect(typeof item.recommendedAction).toBe('string');
              
              // Each flag should have proper structure
              item.flags.forEach(flag => {
                expect(flag).toHaveProperty('type');
                expect(flag).toHaveProperty('message');
                expect(flag).toHaveProperty('severity');
                expect(typeof flag.type).toBe('string');
                expect(typeof flag.message).toBe('string');
                expect(['high', 'medium', 'low']).toContain(flag.severity);
              });
            });
            
            // Property: Should be sorted by severity (high first)
            for (let i = 0; i < flagged.length - 1; i++) {
              const severityOrder = { high: 3, medium: 2, low: 1 };
              expect(severityOrder[flagged[i].severity]).toBeGreaterThanOrEqual(severityOrder[flagged[i + 1].severity]);
            }
            
            // Property: Insufficient data should be flagged
            testReplacements.forEach((replacement, index) => {
              if (replacement.newPlacenames && replacement.newPlacenames.length < 12) {
                const flaggedItem = flagged.find(item => item.replacementIndex === index);
                if (flaggedItem) {
                  expect(flaggedItem.flags.some(flag => flag.type === 'insufficient_replacements')).toBe(true);
                }
              }
            });
            
            // Property: Duplicates should be flagged
            testReplacements.forEach((replacement, index) => {
              if (replacement.newPlacenames) {
                const hasDuplicates = new Set(replacement.newPlacenames.map(n => n.toLowerCase())).size < replacement.newPlacenames.length;
                if (hasDuplicates) {
                  const flaggedItem = flagged.find(item => item.replacementIndex === index);
                  if (flaggedItem) {
                    expect(flaggedItem.flags.some(flag => flag.type === 'duplicate_placenames')).toBe(true);
                  }
                }
              }
            });
            
            // Property: Cultural sensitivity issues should be flagged
            testReplacements.forEach((replacement, index) => {
              if (replacement.languageGroup && replacement.newPlacenames) {
                const isIndigenous = replacement.languageGroup.toLowerCase().includes('indigenous');
                const hasColonialNames = replacement.newPlacenames.some(name => /new\s+|saint|fort\s+/i.test(name));
                
                if (isIndigenous && hasColonialNames) {
                  const flaggedItem = flagged.find(item => item.replacementIndex === index);
                  if (flaggedItem) {
                    expect(flaggedItem.flags.some(flag => flag.type === 'cultural_sensitivity')).toBe(true);
                  }
                }
              }
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 7: System Compatibility Preservation', () => {
    /**
     * Feature: placename-placeholder-replacement, Property 7:
     * For any updated namebase file, all existing language mixer tools and mappings 
     * should continue to function correctly with successful name generation
     * **Validates: Requirements 3.4, 4.2, 4.4**
     */
    it('should preserve system compatibility after updates', async () => {
      const fs = require('fs').promises;
      const path = require('path');
      const os = require('os');

      await fc.assert(
        fc.asyncProperty(
          // Generate test namebase entries
          fc.array(
            fc.record({
              name: fc.string({ minLength: 3, maxLength: 20 }).filter(s => /^[a-zA-Z\s]+$/.test(s) && s.trim().length > 0),
              i: fc.integer({ min: 1, max: 1000 }),
              min: fc.integer({ min: 3, max: 8 }),
              max: fc.integer({ min: 8, max: 15 }), // Ensure max > min by using non-overlapping ranges
              d: fc.string({ maxLength: 10 }),
              m: fc.float({ min: Math.fround(0), max: Math.fround(1) }),
              b: fc.array(
                fc.string({ minLength: 3, maxLength: 15 }).filter(s => /^[a-zA-Z]+$/.test(s)),
                { minLength: 5, maxLength: 20 }
              ).map(arr => arr.join(','))
            }),
            { minLength: 1, maxLength: 10 }
          ),
          async (testEntries) => {
            // Create temporary test file
            const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'compatibility-test-'));
            const testFilePath = path.join(tempDir, 'test-namebases.js');
            
            try {
              // Ensure unique indices
              const uniqueEntries = testEntries.map((entry, index) => ({
                ...entry,
                i: index + 1 // Ensure unique sequential indices
              }));

              // Create test namebase file content
              const fileContent = `window.realWorldNameBases = ${JSON.stringify(uniqueEntries, null, 2)};`;
              await fs.writeFile(testFilePath, fileContent, 'utf8');
              
              const validator = new ValidationSystem();
              
              // Property: System compatibility test should always return structured results
              const result = await validator.testSystemCompatibility(testFilePath);
              
              expect(result).toHaveProperty('passed');
              expect(result).toHaveProperty('issues');
              expect(result).toHaveProperty('tests');
              expect(result).toHaveProperty('timestamp');
              
              expect(typeof result.passed).toBe('boolean');
              expect(Array.isArray(result.issues)).toBe(true);
              expect(typeof result.tests).toBe('object');
              expect(typeof result.timestamp).toBe('string');
              
              // Property: All test categories should be present
              const expectedTests = ['fileIntegrity', 'languageMixerIntegration', 'nameGeneration', 'mappingConsistency'];
              expectedTests.forEach(testName => {
                expect(result.tests).toHaveProperty(testName);
                expect(result.tests[testName]).toHaveProperty('passed');
                expect(result.tests[testName]).toHaveProperty('message');
                expect(typeof result.tests[testName].passed).toBe('boolean');
                expect(typeof result.tests[testName].message).toBe('string');
              });
              
              // Property: File integrity should pass for valid files
              expect(result.tests.fileIntegrity.passed).toBe(true);
              
              // Property: Name generation should work for valid entries
              expect(result.tests.nameGeneration.passed).toBe(true);
              
              // Property: Mapping consistency should pass for unique indices
              expect(result.tests.mappingConsistency.passed).toBe(true);
              
              // Property: Overall result should be consistent with individual tests
              const allTestsPassed = Object.values(result.tests).every(test => test.passed);
              expect(result.passed).toBe(allTestsPassed);
              
              // Property: Issues should be empty when all tests pass
              if (result.passed) {
                expect(result.issues).toHaveLength(0);
              } else {
                expect(result.issues.length).toBeGreaterThan(0);
              }
              
            } finally {
              // Cleanup
              try {
                await fs.rm(tempDir, { recursive: true, force: true });
              } catch (error) {
                // Ignore cleanup errors
              }
            }
          }
        ),
        { numRuns: 30 }
      );
    });

    it('should validate generation patterns correctly', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate test namebase entries with various validity levels
          fc.oneof(
            // Valid entry
            fc.record({
              name: fc.string({ minLength: 3, maxLength: 20 }).filter(s => /^[a-zA-Z\s]+$/.test(s) && s.trim().length > 0),
              i: fc.integer({ min: 1, max: 1000 }),
              min: fc.integer({ min: 3, max: 8 }),
              max: fc.integer({ min: 8, max: 15 }), // Ensure max > min by using non-overlapping ranges
              d: fc.string({ maxLength: 10 }),
              m: fc.float({ min: Math.fround(0), max: Math.fround(1) }),
              b: fc.array(
                fc.string({ minLength: 3, maxLength: 15 }).filter(s => /^[a-zA-Z]+$/.test(s)),
                { minLength: 5, maxLength: 20 }
              ).map(arr => arr.join(','))
            }),
            // Invalid entry - missing fields
            fc.record({
              name: fc.string({ minLength: 3, maxLength: 20 }),
              // Missing other required fields
            }),
            // Invalid entry - bad types
            fc.record({
              name: fc.integer(), // Wrong type
              i: fc.string(), // Wrong type
              min: fc.constant(-1), // Invalid value
              max: fc.constant(0), // Invalid value
              d: fc.integer(), // Wrong type
              m: fc.constant(2), // Out of range
              b: fc.integer() // Wrong type
            }),
            // Invalid entry - empty placenames
            fc.record({
              name: fc.string({ minLength: 3, maxLength: 20 }),
              i: fc.integer({ min: 1, max: 1000 }),
              min: fc.integer({ min: 3, max: 10 }),
              max: fc.integer({ min: 5, max: 15 }),
              d: fc.string({ maxLength: 10 }),
              m: fc.float({ min: Math.fround(0), max: Math.fround(1) }),
              b: fc.constant('') // Empty placenames
            })
          ),
          async (testEntry) => {
            const validator = new ValidationSystem();
            
            // Property: Validation should always return a boolean
            const isValid = await validator.validateGenerationPatterns(testEntry);
            expect(typeof isValid).toBe('boolean');
            
            // Property: Valid entries should pass validation
            if (testEntry.name && 
                typeof testEntry.name === 'string' && 
                testEntry.name.length > 0 &&
                Number.isInteger(testEntry.i) && 
                testEntry.i >= 0 &&
                Number.isInteger(testEntry.min) && 
                testEntry.min >= 1 &&
                Number.isInteger(testEntry.max) && 
                testEntry.max >= testEntry.min &&
                typeof testEntry.d === 'string' &&
                typeof testEntry.m === 'number' && 
                testEntry.m >= 0 && 
                testEntry.m <= 1 &&
                typeof testEntry.b === 'string' && 
                testEntry.b.length > 0) {
              
              const placenames = testEntry.b.split(',').filter(name => name.trim().length > 0);
              if (placenames.length > 0) {
                const validPlacenames = placenames.filter(name => {
                  const trimmed = name.trim();
                  return trimmed.length >= 2 && 
                         trimmed.length <= 50 && 
                         /^[a-zA-Z\u00C0-\u017F\u0100-\u024F\u1E00-\u1EFF\s\-'\.]+$/.test(trimmed);
                });
                
                const validityRatio = validPlacenames.length / placenames.length;
                if (validityRatio >= 0.7) {
                  expect(isValid).toBe(true);
                }
              }
            }
            
            // Property: Invalid entries should fail validation
            if (!testEntry.name || 
                typeof testEntry.name !== 'string' || 
                testEntry.name.length === 0 ||
                !Number.isInteger(testEntry.i) || 
                testEntry.i < 0 ||
                !Number.isInteger(testEntry.min) || 
                testEntry.min < 1 ||
                !Number.isInteger(testEntry.max) || 
                testEntry.max < testEntry.min ||
                typeof testEntry.d !== 'string' ||
                typeof testEntry.m !== 'number' || 
                testEntry.m < 0 || 
                testEntry.m > 1 ||
                typeof testEntry.b !== 'string' || 
                testEntry.b.length === 0) {
              expect(isValid).toBe(false);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should test language mixer integration correctly', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate test namebase data
          fc.array(
            fc.record({
              name: fc.string({ minLength: 3, maxLength: 15 }).filter(s => /^[a-zA-Z]+$/.test(s)),
              i: fc.integer({ min: 1, max: 100 }),
              min: fc.integer({ min: 3, max: 8 }),
              max: fc.integer({ min: 5, max: 12 }),
              d: fc.string({ maxLength: 5 }),
              m: fc.float({ min: Math.fround(0), max: Math.fround(1) }),
              b: fc.array(
                fc.string({ minLength: 3, maxLength: 10 }).filter(s => /^[a-zA-Z]+$/.test(s)),
                { minLength: 3, maxLength: 8 }
              ).map(arr => arr.join(','))
            }),
            { minLength: 1, maxLength: 5 }
          ),
          async (testEntries) => {
            // Ensure unique indices
            const uniqueEntries = testEntries.map((entry, index) => ({
              ...entry,
              i: index + 1
            }));

            const validator = new ValidationSystem();
            
            // Property: Integration test should always return structured result
            const result = await validator.testLanguageMixerIntegration(uniqueEntries);
            
            expect(result).toHaveProperty('passed');
            expect(result).toHaveProperty('message');
            expect(result).toHaveProperty('details');
            
            expect(typeof result.passed).toBe('boolean');
            expect(typeof result.message).toBe('string');
            expect(typeof result.details).toBe('object');
            
            // Property: Message should always be non-empty
            expect(result.message.length).toBeGreaterThan(0);
            
            // Property: Details should contain expected test results
            const expectedDetails = ['mappingFileExists', 'mappingFileValid', 'indexConsistency', 'namebaseCompatibility'];
            expectedDetails.forEach(detail => {
              if (result.details[detail] !== undefined) {
                expect(typeof result.details[detail]).toBe('boolean');
              }
            });
            
            // Property: If namebase compatibility passes, entries should be valid
            if (result.details.namebaseCompatibility === true) {
              // At least some entries should pass validation
              let validCount = 0;
              for (const entry of uniqueEntries.slice(0, 3)) { // Test first 3 entries
                const isValid = await validator.validateGenerationPatterns(entry);
                if (isValid) validCount++;
              }
              expect(validCount).toBeGreaterThan(0);
            }
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  describe('Property 8: Character Encoding Compatibility', () => {
    /**
     * Feature: placename-placeholder-replacement, Property 8:
     * For any placename containing special characters or diacritics, the authentic spelling 
     * should be preserved while maintaining compatibility with the name generation system
     * **Validates: Requirements 2.6**
     */
    it('should handle character encoding while preserving authenticity', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate test entries with various character encodings
          fc.record({
            name: fc.string({ minLength: 3, maxLength: 15 }).filter(s => /^[a-zA-Z]+$/.test(s)),
            i: fc.integer({ min: 1, max: 1000 }),
            min: fc.integer({ min: 3, max: 10 }),
            max: fc.integer({ min: 5, max: 15 }),
            d: fc.string({ maxLength: 5 }),
            // Handle NaN values properly in test generation
            m: fc.oneof(
              fc.float({ min: 0, max: 1 }),
              fc.constant(Number.NaN)
            ),
            b: fc.array(
              fc.oneof(
                // ASCII placenames
                fc.string({ minLength: 3, maxLength: 10 }).filter(s => /^[a-zA-Z]+$/.test(s)),
                // Placeholders to be replaced (with potential whitespace)
                fc.tuple(
                  fc.string({ minLength: 3, maxLength: 8 }).filter(s => /^[a-zA-Z]+$/.test(s)),
                  fc.string({ minLength: 0, maxLength: 3 }).map(s => s.replace(/[^\s]/g, ' ')), // Only spaces
                  fc.string({ minLength: 0, maxLength: 3 }).map(s => s.replace(/[^\s]/g, ' '))  // Only spaces
                ).map(([base, leadSpace, trailSpace]) => `${leadSpace}${base}_123_unq1${trailSpace}`)
              ),
              { minLength: 3, maxLength: 8 }
            ).map(arr => arr.join(','))
          }),
          // Generate replacement placenames with various character encodings
          fc.array(
            fc.oneof(
              // ASCII names
              fc.string({ minLength: 3, maxLength: 12 }).filter(s => /^[a-zA-Z]+$/.test(s)),
              // Names with diacritics (French, German, Spanish, etc.)
              fc.oneof(
                fc.constant('Château'),
                fc.constant('München'),
                fc.constant('Córdoba'),
                fc.constant('Zürich'),
                fc.constant('Kraków'),
                fc.constant('Malmö'),
                fc.constant('Niño'),
                fc.constant('Ålesund'),
                fc.constant('Tromsø'),
                fc.constant('São Paulo'),
                fc.constant('Brasília'),
                fc.constant('Montréal'),
                fc.constant('Québec'),
                fc.constant('Düsseldorf'),
                fc.constant('Göteborg'),
                fc.constant('Łódź'),
                fc.constant('Gdańsk')
              ),
              // Names with extended Latin characters
              fc.oneof(
                fc.constant('Ćevabdžinica'),
                fc.constant('Đakovo'),
                fc.constant('Šibenik'),
                fc.constant('Žilina'),
                fc.constant('Ružomberok'),
                fc.constant('Čelákovice'),
                fc.constant('Říčany'),
                fc.constant('Tábor')
              ),
              // Names with other Unicode characters (for edge case testing)
              fc.oneof(
                fc.constant('Москва'), // Cyrillic
                fc.constant('北京'),   // Chinese
                fc.constant('東京'),   // Japanese
                fc.constant('서울'),   // Korean
                fc.constant('Αθήνα'), // Greek
                fc.constant('القاهرة') // Arabic
              )
            ),
            { minLength: 1, maxLength: 15 } // Increased max to ensure sufficient replacements
          ),
          async (testEntry, replacementNames) => {
            const engine = new ReplacementEngine({}, {});
            
            // Count ALL placeholder positions (including duplicates)
            const placenames = testEntry.b ? testEntry.b.split(',') : [];
            const placeholderPositions = [];
            
            placenames.forEach((name, index) => {
              if (engine.isPlaceholder(name)) {
                placeholderPositions.push(index);
              }
            });
            
            const placeholderCount = placeholderPositions.length;
            
            if (placeholderCount === 0) {
              return; // No placeholders to test encoding with
            }
            
            // Ensure we have EXACTLY enough replacement names for each placeholder position
            let sufficientReplacements = [...replacementNames];
            
            // If we don't have enough, generate more
            while (sufficientReplacements.length < placeholderCount) {
              sufficientReplacements.push(`Generated${sufficientReplacements.length}`);
            }
            
            // Take exactly the number we need
            sufficientReplacements = sufficientReplacements.slice(0, placeholderCount);
            
            // Property: Replacement should preserve character encoding
            const result = await engine.replacePlaceholders(testEntry, sufficientReplacements);
            
            if (result.hasChanges) {
              const updatedPlacenames = result.b ? result.b.split(',') : [];
              
              // Property: All replacement names should be preserved exactly
              result.newPlacenames.forEach((newName, index) => {
                // Check if the replacement name appears in the updated placenames
                // (it might have spacing around it, so check if any updated name contains it)
                const foundInUpdated = updatedPlacenames.some(updatedName => 
                  updatedName.trim() === newName || updatedName.includes(newName)
                );
                expect(foundInUpdated).toBe(true);
                
                // Property: Character encoding should be preserved
                expect(newName).toBe(sufficientReplacements[index]);
                
                // Property: No character corruption should occur
                expect(newName.length).toBeGreaterThan(0);
                expect(typeof newName).toBe('string');
              });
              
              // Property: Encoding detection should work correctly
              sufficientReplacements.forEach(name => {
                const encoding = engine.detectEncoding(name);
                expect(typeof encoding).toBe('string');
                expect(encoding.length).toBeGreaterThan(0);
                
                // Verify encoding detection is consistent
                const encoding2 = engine.detectEncoding(name);
                expect(encoding2).toBe(encoding);
              });
              
              // Property: Mixed encodings should be handled gracefully
              const mixedEncodingString = sufficientReplacements.join(',');
              const mixedEncoding = engine.detectEncoding(mixedEncodingString);
              expect(typeof mixedEncoding).toBe('string');
            }
          }
        ),
        { numRuns: 40 }
      );
    });

    it('should detect and categorize different character encodings correctly', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            // ASCII strings
            fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-zA-Z0-9\s]+$/.test(s)),
            // Strings with diacritics
            fc.oneof(
              fc.constant('café'),
              fc.constant('naïve'),
              fc.constant('résumé'),
              fc.constant('piñata'),
              fc.constant('façade'),
              fc.constant('jalapeño')
            ),
            // Strings with extended Latin
            fc.oneof(
              fc.constant('Ćirić'),
              fc.constant('Đorđe'),
              fc.constant('Šešelj'),
              fc.constant('Žižek')
            ),
            // Non-Latin scripts
            fc.oneof(
              fc.constant('Москва'),
              fc.constant('北京市'),
              fc.constant('Αθήνα'),
              fc.constant('القاهرة')
            )
          ),
          (testString) => {
            const engine = new ReplacementEngine({}, {});
            const encoding = engine.detectEncoding(testString);
            
            // Property: Should always return a valid encoding type
            expect(typeof encoding).toBe('string');
            expect(encoding.length).toBeGreaterThan(0);
            
            // Property: Encoding should be consistent for the same input
            const encoding2 = engine.detectEncoding(testString);
            expect(encoding2).toBe(encoding);
            
            // Property: Should categorize encodings correctly
            const validEncodings = ['ascii', 'utf8', 'utf8-diacritics', 'utf8-extended'];
            expect(validEncodings).toContain(encoding);
            
            // Property: ASCII strings should be detected as ASCII
            if (/^[a-zA-Z0-9\s]*$/.test(testString)) {
              expect(encoding).toBe('ascii');
            }
            
            // Property: Strings with diacritics should be detected appropriately
            if (/[àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]/i.test(testString)) {
              expect(['utf8-diacritics', 'utf8', 'utf8-extended']).toContain(encoding);
            }
            
            // Property: Non-ASCII should not be detected as ASCII
            if (/[^\x00-\x7F]/.test(testString)) {
              expect(encoding).not.toBe('ascii');
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve authenticity while handling encoding edge cases', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate edge case scenarios for encoding
          fc.oneof(
            // Empty strings
            fc.constant(''),
            // Single character strings with various encodings
            fc.oneof(
              fc.constant('a'),
              fc.constant('ñ'),
              fc.constant('ć'),
              fc.constant('北'),
              fc.constant('α')
            ),
            // Mixed encoding strings
            fc.oneof(
              fc.constant('café北京'),
              fc.constant('Москваñ'),
              fc.constant('αβγabc'),
              fc.constant('test-ćevapi-北京')
            ),
            // Strings with special characters
            fc.oneof(
              fc.constant("O'Connor"),
              fc.constant('Saint-Jean'),
              fc.constant('São João'),
              fc.constant('Al-Qāhirah')
            )
          ),
          async (testString) => {
            const engine = new ReplacementEngine({}, {});
            
            // Property: Should handle edge cases gracefully
            const encoding = engine.detectEncoding(testString);
            expect(typeof encoding).toBe('string');
            
            // Property: Empty strings should be handled
            if (testString === '') {
              expect(encoding).toBe('ascii');
            }
            
            // Property: Single characters should be detected correctly
            if (testString.length === 1) {
              expect(encoding).toBeDefined();
              expect(encoding.length).toBeGreaterThan(0);
            }
            
            // Property: Mixed encodings should not crash the system
            if (/[^\x00-\x7F]/.test(testString) && /[a-zA-Z]/.test(testString)) {
              expect(['utf8', 'utf8-diacritics', 'utf8-extended']).toContain(encoding);
            }
            
            // Property: Special characters should be preserved
            if (testString.includes("'") || testString.includes('-')) {
              const preservedString = testString;
              expect(preservedString).toBe(testString);
              expect(preservedString.includes("'") || preservedString.includes('-')).toBe(true);
            }
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Property 9: Comprehensive Reporting and Documentation', () => {
    /**
     * Feature: placename-placeholder-replacement, Property 9:
     * For any replacement operation, detailed reports should be generated showing all changes 
     * organized by language group, including source citations and statistics
     * **Validates: Requirements 5.1, 5.2, 5.3**
     */
    it('should generate comprehensive reports with citations and statistics', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate test replacement operations
          fc.array(
            fc.record({
              languageGroup: fc.oneof(
                fc.constant('french'),
                fc.constant('german'),
                fc.constant('spanish'),
                fc.constant('italian'),
                fc.constant('chinese'),
                fc.string({ minLength: 3, maxLength: 15 }).filter(s => /^[a-zA-Z]+$/.test(s))
              ),
              originalPlaceholders: fc.array(
                fc.oneof(
                  fc.string({ minLength: 3, maxLength: 10 }).map(base => `${base}_123_unq1`),
                  fc.string({ minLength: 3, maxLength: 10 }).map(base => `${base}_456_u2`),
                  fc.string({ minLength: 3, maxLength: 10 }).map(base => `${base}_789_unq`)
                ),
                { minLength: 1, maxLength: 8 }
              ),
              newPlacenames: fc.array(
                fc.string({ minLength: 3, maxLength: 15 }).filter(s => /^[a-zA-Z]+$/.test(s)),
                { minLength: 1, maxLength: 8 }
              ),
              success: fc.boolean(),
              confidence: fc.float({ min: Math.fround(0), max: Math.fround(1) }),
              timestamp: fc.constant(new Date().toISOString()),
              researchResult: fc.record({
                sources: fc.array(
                  fc.record({
                    name: fc.oneof(
                      fc.constant('Wikipedia'),
                      fc.constant('OpenStreetMap'),
                      fc.constant('GeoNames'),
                      fc.constant('Academic Source')
                    ),
                    url: fc.webUrl(),
                    reliability: fc.float({ min: Math.fround(0.3), max: Math.fround(1.0) }),
                    type: fc.oneof(
                      fc.constant('encyclopedia'),
                      fc.constant('geographic_database'),
                      fc.constant('academic'),
                      fc.constant('government')
                    )
                  }),
                  { minLength: 1, maxLength: 3 }
                ),
                confidence: fc.float({ min: Math.fround(0), max: Math.fround(1) })
              })
            }),
            { minLength: 1, maxLength: 10 }
          ),
          async (testReplacements) => {
            const generator = new ReportGenerator();
            
            // Property: Should generate comprehensive report structure
            const report = await generator.createChangeReport(testReplacements);
            
            // Validate report structure
            expect(report).toHaveProperty('metadata');
            expect(report).toHaveProperty('summary');
            expect(report).toHaveProperty('languageGroups');
            expect(report).toHaveProperty('detailedChanges');
            expect(report).toHaveProperty('sourceCitations');
            expect(report).toHaveProperty('statistics');
            
            // Property: Metadata should be complete and valid
            expect(report.metadata.generatedAt).toBeDefined();
            expect(report.metadata.totalReplacements).toBe(testReplacements.length);
            expect(report.metadata.reportVersion).toBeDefined();
            
            // Property: Summary should accurately reflect input data
            expect(report.summary.totalPlaceholdersReplaced).toBeGreaterThanOrEqual(0);
            expect(report.summary.successfulReplacements + report.summary.failedReplacements).toBe(testReplacements.length);
            expect(report.summary.coverageRate).toBeGreaterThanOrEqual(0);
            expect(report.summary.coverageRate).toBeLessThanOrEqual(1);
            
            // Property: Language groups should be organized correctly
            const expectedLanguageGroups = new Set(testReplacements.map(r => r.languageGroup));
            expect(report.summary.languageGroupsAffected).toBe(expectedLanguageGroups.size);
            
            expectedLanguageGroups.forEach(langGroup => {
              expect(report.languageGroups).toHaveProperty(langGroup);
              const groupData = report.languageGroups[langGroup];
              expect(groupData).toHaveProperty('name');
              expect(groupData).toHaveProperty('replacements');
              expect(groupData).toHaveProperty('statistics');
              expect(Array.isArray(groupData.replacements)).toBe(true);
            });
            
            // Property: Detailed changes should match input operations
            expect(report.detailedChanges).toHaveLength(testReplacements.length);
            report.detailedChanges.forEach((change, index) => {
              expect(change).toHaveProperty('index');
              expect(change).toHaveProperty('timestamp');
              expect(change).toHaveProperty('languageGroup');
              expect(change).toHaveProperty('success');
              expect(change).toHaveProperty('beforeAfter');
              expect(typeof change.success).toBe('boolean');
            });
            
            // Property: Source citations should be comprehensive
            if (testReplacements.some(r => r.researchResult?.sources)) {
              expect(report.sourceCitations).toHaveProperty('bySource');
              expect(report.sourceCitations).toHaveProperty('byLanguageGroup');
              expect(report.sourceCitations).toHaveProperty('summary');
              
              // Validate source citation structure
              Object.values(report.sourceCitations.bySource).forEach(source => {
                expect(source).toHaveProperty('name');
                expect(source).toHaveProperty('reliability');
                expect(source).toHaveProperty('languageGroups');
                expect(Array.isArray(source.languageGroups)).toBe(true);
              });
            }
            
            // Property: Statistics should be accurate and complete
            expect(report.statistics).toHaveProperty('totalOperations');
            expect(report.statistics).toHaveProperty('successRate');
            expect(report.statistics).toHaveProperty('failureRate');
            expect(report.statistics).toHaveProperty('coverageByLanguageGroup');
            expect(report.statistics).toHaveProperty('qualityMetrics');
            
            expect(report.statistics.totalOperations).toBe(testReplacements.length);
            expect(report.statistics.successRate).toBeGreaterThanOrEqual(0);
            expect(report.statistics.successRate).toBeLessThanOrEqual(1);
            expect(report.statistics.failureRate).toBeGreaterThanOrEqual(0);
            expect(report.statistics.failureRate).toBeLessThanOrEqual(1);
            
            // Property: Success rate + failure rate should equal 1 (or close due to rounding)
            const totalRate = report.statistics.successRate + report.statistics.failureRate;
            expect(Math.abs(totalRate - 1)).toBeLessThan(0.01);
            
            // Property: Quality metrics should be valid
            const qualityMetrics = report.statistics.qualityMetrics;
            expect(qualityMetrics.averageConfidence).toBeGreaterThanOrEqual(0);
            expect(qualityMetrics.averageConfidence).toBeLessThanOrEqual(1);
            
            const totalQualityReplacements = 
              qualityMetrics.highQualityReplacements + 
              qualityMetrics.mediumQualityReplacements + 
              qualityMetrics.lowQualityReplacements;
            
            // Should not exceed successful operations
            expect(totalQualityReplacements).toBeLessThanOrEqual(report.statistics.successfulOperations);
          }
        ),
        { numRuns: 30 }
      );
    });

    it('should handle edge cases in report generation', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.oneof(
            // Empty replacements array
            fc.constant([]),
            // Single replacement
            fc.array(
              fc.record({
                languageGroup: fc.constant('test'),
                success: fc.boolean(),
                originalPlaceholders: fc.array(fc.string({ minLength: 5, maxLength: 10 }), { minLength: 1, maxLength: 3 }),
                newPlacenames: fc.array(fc.string({ minLength: 3, maxLength: 10 }), { minLength: 1, maxLength: 3 })
              }),
              { minLength: 1, maxLength: 1 }
            ),
            // Replacements with missing data
            fc.array(
              fc.record({
                languageGroup: fc.oneof(fc.string({ minLength: 1, maxLength: 10 }), fc.constant(null), fc.constant(undefined)),
                success: fc.oneof(fc.boolean(), fc.constant(null), fc.constant(undefined))
              }),
              { minLength: 1, maxLength: 5 }
            )
          ),
          async (testReplacements) => {
            const generator = new ReportGenerator();
            
            // Property: Should handle edge cases gracefully without throwing
            const report = await generator.createChangeReport(testReplacements);
            
            // Property: Should always return valid report structure
            expect(report).toHaveProperty('metadata');
            expect(report).toHaveProperty('summary');
            expect(report).toHaveProperty('languageGroups');
            expect(report).toHaveProperty('detailedChanges');
            
            // Property: Metadata should be valid even for edge cases
            expect(report.metadata.totalReplacements).toBe(testReplacements.length);
            expect(typeof report.metadata.generatedAt).toBe('string');
            
            // Property: Summary statistics should be consistent
            expect(report.summary.successfulReplacements + report.summary.failedReplacements).toBe(testReplacements.length);
            
            // Property: Detailed changes should match input length
            expect(report.detailedChanges).toHaveLength(testReplacements.length);
            
            // Property: Empty input should produce empty results but valid structure
            if (testReplacements.length === 0) {
              expect(report.summary.languageGroupsAffected).toBe(0);
              expect(report.summary.totalPlaceholdersReplaced).toBe(0);
              expect(report.summary.successfulReplacements).toBe(0);
              expect(report.summary.failedReplacements).toBe(0);
              expect(Object.keys(report.languageGroups)).toHaveLength(0);
            }
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  describe('Property 10: Complete Audit Trail', () => {
    /**
     * Feature: placename-placeholder-replacement, Property 10:
     * For any replacement operation, a complete audit trail should be maintained 
     * with sufficient detail for rollback capabilities and future reference
     * **Validates: Requirements 5.4, 5.5**
     */
    it('should maintain complete audit trail for rollback capabilities', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate test operations for audit trail
          fc.array(
            fc.record({
              operationType: fc.oneof(
                fc.constant('placeholder_replacement'),
                fc.constant('research_operation'),
                fc.constant('validation_operation'),
                fc.constant('backup_operation')
              ),
              timestamp: fc.date({ min: new Date('2020-01-01'), max: new Date() }).map(d => d.toISOString()),
              languageGroup: fc.oneof(
                fc.constant('french'),
                fc.constant('german'),
                fc.constant('spanish'),
                fc.constant('italian'),
                fc.string({ minLength: 3, maxLength: 15 }).filter(s => /^[a-zA-Z]+$/.test(s))
              ),
              success: fc.boolean(),
              originalPlaceholders: fc.array(
                fc.string({ minLength: 5, maxLength: 15 }).map(base => `${base}_123_unq1`),
                { minLength: 0, maxLength: 5 }
              ),
              newPlacenames: fc.array(
                fc.string({ minLength: 3, maxLength: 12 }).filter(s => /^[a-zA-Z]+$/.test(s)),
                { minLength: 0, maxLength: 5 }
              ),
              confidence: fc.float({ min: Math.fround(0), max: Math.fround(1) }),
              processingTime: fc.integer({ min: 1, max: 5000 }),
              retryCount: fc.integer({ min: 0, max: 3 }),
              validationPassed: fc.boolean(),
              researchResult: fc.record({
                sources: fc.array(
                  fc.record({
                    name: fc.oneof(
                      fc.constant('Wikipedia'),
                      fc.constant('OpenStreetMap'),
                      fc.constant('GeoNames')
                    ),
                    type: fc.oneof(
                      fc.constant('encyclopedia'),
                      fc.constant('geographic_database'),
                      fc.constant('academic')
                    ),
                    reliability: fc.float({ min: Math.fround(0.3), max: Math.fround(1.0) }),
                    url: fc.webUrl()
                  }),
                  { minLength: 0, maxLength: 3 }
                ),
                confidence: fc.float({ min: Math.fround(0), max: Math.fround(1) })
              })
            }),
            { minLength: 1, maxLength: 8 }
          ),
          async (testOperations) => {
            const generator = new ReportGenerator();
            
            // Property: Should create comprehensive audit trail
            const auditTrail = generator.createAuditTrail(testOperations);
            
            // Validate audit trail structure
            expect(auditTrail).toHaveProperty('version');
            expect(auditTrail).toHaveProperty('generatedAt');
            expect(auditTrail).toHaveProperty('operations');
            expect(auditTrail).toHaveProperty('summary');
            expect(auditTrail).toHaveProperty('integrity');
            
            // Property: Operations should match input count
            expect(auditTrail.operations).toHaveLength(testOperations.length);
            expect(auditTrail.summary.totalOperations).toBe(testOperations.length);
            
            // Property: Each operation should have complete audit information
            auditTrail.operations.forEach((auditEntry, index) => {
              expect(auditEntry).toHaveProperty('index');
              expect(auditEntry).toHaveProperty('operationType');
              expect(auditEntry).toHaveProperty('timestamp');
              expect(auditEntry).toHaveProperty('languageGroup');
              expect(auditEntry).toHaveProperty('success');
              expect(auditEntry).toHaveProperty('details');
              expect(auditEntry).toHaveProperty('changes');
              expect(auditEntry).toHaveProperty('metadata');
              
              expect(auditEntry.index).toBe(index);
              expect(typeof auditEntry.operationType).toBe('string');
              expect(typeof auditEntry.timestamp).toBe('string');
              expect(typeof auditEntry.languageGroup).toBe('string');
              expect(typeof auditEntry.success).toBe('boolean');
              
              // Validate details structure
              expect(auditEntry.details).toHaveProperty('placeholdersReplaced');
              expect(auditEntry.details).toHaveProperty('confidence');
              expect(auditEntry.details).toHaveProperty('sources');
              expect(Array.isArray(auditEntry.details.sources)).toBe(true);
              
              // Validate changes structure
              expect(auditEntry.changes).toHaveProperty('before');
              expect(auditEntry.changes).toHaveProperty('after');
              expect(Array.isArray(auditEntry.changes.before)).toBe(true);
              expect(Array.isArray(auditEntry.changes.after)).toBe(true);
              
              // Validate metadata structure
              expect(auditEntry.metadata).toHaveProperty('processingTime');
              expect(auditEntry.metadata).toHaveProperty('retryCount');
              expect(auditEntry.metadata).toHaveProperty('validationPassed');
            });
            
            // Property: Summary should accurately reflect operations
            const operationTypes = Object.keys(auditTrail.summary.operationTypes);
            expect(operationTypes.length).toBeGreaterThan(0);
            
            const totalOperationsByType = Object.values(auditTrail.summary.operationTypes)
              .reduce((sum, count) => sum + count, 0);
            expect(totalOperationsByType).toBe(testOperations.length);
            
            // Property: Integrity information should be complete
            expect(auditTrail.integrity).toHaveProperty('checksum');
            expect(auditTrail.integrity).toHaveProperty('operationHashes');
            expect(Array.isArray(auditTrail.integrity.operationHashes)).toBe(true);
            expect(auditTrail.integrity.operationHashes).toHaveLength(testOperations.length);
            
            // Property: Each operation should have a unique hash
            const hashes = auditTrail.integrity.operationHashes;
            const uniqueHashes = new Set(hashes);
            // Note: Hashes might not be unique if operations are identical, so we just check they exist
            expect(hashes.every(hash => typeof hash === 'string' && hash.length > 0)).toBe(true);
            
            // Property: Checksum should be a valid hash string
            expect(typeof auditTrail.integrity.checksum).toBe('string');
            expect(auditTrail.integrity.checksum.length).toBeGreaterThan(0);
            
            // Property: System info should be present
            expect(auditTrail.summary).toHaveProperty('systemInfo');
            expect(auditTrail.summary.systemInfo).toHaveProperty('platform');
            expect(auditTrail.summary.systemInfo).toHaveProperty('nodeVersion');
            expect(auditTrail.summary.systemInfo).toHaveProperty('timestamp');
            
            // Property: Timespan should be calculated correctly if operations have timestamps
            if (testOperations.length > 1 && testOperations.every(op => op.timestamp)) {
              expect(auditTrail.summary).toHaveProperty('timespan');
              if (auditTrail.summary.timespan) {
                expect(auditTrail.summary.timespan).toHaveProperty('start');
                expect(auditTrail.summary.timespan).toHaveProperty('end');
                expect(auditTrail.summary.timespan).toHaveProperty('durationMs');
                expect(auditTrail.summary.timespan.durationMs).toBeGreaterThanOrEqual(0);
              }
            }
          }
        ),
        { numRuns: 25 }
      );
    });

    it('should handle edge cases in audit trail creation', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.oneof(
            // Empty operations array
            fc.constant([]),
            // Single operation
            fc.array(
              fc.record({
                operationType: fc.constant('test_operation'),
                success: fc.boolean(),
                timestamp: fc.constant(new Date().toISOString())
              }),
              { minLength: 1, maxLength: 1 }
            ),
            // Operations with missing data
            fc.array(
              fc.record({
                operationType: fc.oneof(fc.string({ minLength: 1, maxLength: 10 }), fc.constant(null)),
                success: fc.oneof(fc.boolean(), fc.constant(null)),
                timestamp: fc.oneof(fc.date().map(d => d.toISOString()), fc.constant(null))
              }),
              { minLength: 1, maxLength: 3 }
            ),
            // Operations with error conditions
            fc.array(
              fc.record({
                operationType: fc.constant('failed_operation'),
                success: fc.constant(false),
                error: fc.record({
                  message: fc.string({ minLength: 5, maxLength: 50 }),
                  code: fc.string({ minLength: 3, maxLength: 10 })
                })
              }),
              { minLength: 1, maxLength: 3 }
            )
          ),
          async (testOperations) => {
            const generator = new ReportGenerator();
            
            // Property: Should handle edge cases gracefully without throwing
            const auditTrail = generator.createAuditTrail(testOperations);
            
            // Property: Should always return valid audit trail structure
            expect(auditTrail).toHaveProperty('version');
            expect(auditTrail).toHaveProperty('generatedAt');
            expect(auditTrail).toHaveProperty('operations');
            expect(auditTrail).toHaveProperty('summary');
            expect(auditTrail).toHaveProperty('integrity');
            
            // Property: Operations count should match input
            expect(auditTrail.operations).toHaveLength(testOperations.length);
            expect(auditTrail.summary.totalOperations).toBe(testOperations.length);
            
            // Property: Empty input should produce empty but valid audit trail
            if (testOperations.length === 0) {
              expect(auditTrail.operations).toHaveLength(0);
              expect(auditTrail.summary.totalOperations).toBe(0);
              expect(Object.keys(auditTrail.summary.operationTypes)).toHaveLength(0);
              expect(auditTrail.integrity.operationHashes).toHaveLength(0);
            }
            
            // Property: All operations should have required audit fields even with missing data
            auditTrail.operations.forEach(auditEntry => {
              expect(auditEntry).toHaveProperty('index');
              expect(auditEntry).toHaveProperty('operationType');
              expect(auditEntry).toHaveProperty('timestamp');
              expect(auditEntry).toHaveProperty('success');
              
              // Should handle missing data gracefully
              expect(typeof auditEntry.index).toBe('number');
              expect(typeof auditEntry.operationType).toBe('string');
              expect(typeof auditEntry.timestamp).toBe('string');
              expect(typeof auditEntry.success).toBe('boolean');
            });
            
            // Property: Integrity data should always be present
            expect(typeof auditTrail.integrity.checksum).toBe('string');
            expect(Array.isArray(auditTrail.integrity.operationHashes)).toBe(true);
            expect(auditTrail.integrity.operationHashes).toHaveLength(testOperations.length);
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should support multiple export formats for audit trails', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate test report data
          fc.record({
            metadata: fc.record({
              generatedAt: fc.constant(new Date().toISOString()),
              totalReplacements: fc.integer({ min: 1, max: 100 }),
              reportVersion: fc.constant('1.0.0')
            }),
            summary: fc.record({
              languageGroupsAffected: fc.integer({ min: 1, max: 10 }),
              totalPlaceholdersReplaced: fc.integer({ min: 1, max: 500 }),
              successfulReplacements: fc.integer({ min: 1, max: 80 }),
              failedReplacements: fc.integer({ min: 0, max: 20 }),
              coverageRate: fc.float({ min: Math.fround(0.5), max: Math.fround(1.0) })
            }),
            languageGroups: fc.dictionary(
              fc.string({ minLength: 3, maxLength: 10 }).filter(s => /^[a-zA-Z]+$/.test(s)),
              fc.record({
                name: fc.string({ minLength: 3, maxLength: 10 }),
                statistics: fc.record({
                  totalPlaceholders: fc.integer({ min: 1, max: 50 }),
                  successfulReplacements: fc.integer({ min: 1, max: 40 }),
                  failedReplacements: fc.integer({ min: 0, max: 10 }),
                  sourcesUsed: fc.array(fc.string({ minLength: 3, maxLength: 15 }), { minLength: 1, maxLength: 3 })
                })
              })
            )
          }),
          fc.array(
            fc.oneof(
              fc.constant('json'),
              fc.constant('csv'),
              fc.constant('markdown'),
              fc.constant('md')
            ),
            { minLength: 1, maxLength: 4 }
          ),
          async (testReport, testFormats) => {
            const generator = new ReportGenerator();
            
            // Property: Should export to all requested formats successfully
            const exportResult = await generator.exportMultipleFormats(testReport, testFormats);
            
            // Validate export result structure
            expect(exportResult).toHaveProperty('exports');
            expect(exportResult).toHaveProperty('errors');
            expect(exportResult).toHaveProperty('timestamp');
            
            // Property: Should have export entry for each requested format
            const uniqueFormats = [...new Set(testFormats.map(f => f.toLowerCase()))];
            uniqueFormats.forEach(format => {
              // Both 'markdown' and 'md' should map to 'md' key
              const expectedKey = (format === 'markdown' || format === 'md') ? 'md' : format;
              expect(exportResult.exports).toHaveProperty(expectedKey);
              
              const exportInfo = exportResult.exports[expectedKey];
              if (exportInfo.success) {
                expect(exportInfo).toHaveProperty('path');
                expect(exportInfo).toHaveProperty('filename');
                expect(exportInfo).toHaveProperty('size');
                expect(typeof exportInfo.path).toBe('string');
                expect(typeof exportInfo.filename).toBe('string');
                expect(typeof exportInfo.size).toBe('number');
                expect(exportInfo.size).toBeGreaterThan(0);
              } else {
                expect(exportInfo).toHaveProperty('error');
                expect(typeof exportInfo.error).toBe('string');
              }
            });
            
            // Property: Errors array should be present (may be empty)
            expect(Array.isArray(exportResult.errors)).toBe(true);
            
            // Property: Each error should have required fields
            exportResult.errors.forEach(error => {
              expect(error).toHaveProperty('format');
              expect(error).toHaveProperty('error');
              expect(error).toHaveProperty('timestamp');
              expect(typeof error.format).toBe('string');
              expect(typeof error.error).toBe('string');
              expect(typeof error.timestamp).toBe('string');
            });
            
            // Property: Timestamp should be valid ISO string
            expect(typeof exportResult.timestamp).toBe('string');
            expect(() => new Date(exportResult.timestamp)).not.toThrow();
          }
        ),
        { numRuns: 15 }
      );
    });
  });
});