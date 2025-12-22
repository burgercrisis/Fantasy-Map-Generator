/**
 * ValidationSystem - Ensures quality and compatibility of replacements
 * 
 * Responsible for:
 * - Validating linguistic authenticity of placenames
 * - Testing system compatibility after replacements
 * - Ensuring quality thresholds are maintained
 * - Flagging issues for manual review
 */
class ValidationSystem {
  constructor(config = {}) {
    this.config = {
      minPlacenamesPerGroup: 12,
      maxValidationRetries: 3,
      qualityThreshold: 0.8,
      ...config
    };
    this.validationResults = [];
  }

  /**
   * Validate linguistic authenticity of placenames for a language group
   * @param {Array} placenames - Placenames to validate
   * @param {string} languageGroup - Language group for context
   * @returns {Promise<Object>} Validation result with authenticity scores
   */
  async validateLinguisticAuthenticity(placenames, languageGroup) {
    if (!Array.isArray(placenames) || placenames.length === 0) {
      return {
        isValid: false,
        confidence: 0,
        issues: ['No placenames provided for validation'],
        validatedPlacenames: [],
        linguisticScore: 0,
        geographicScore: 0,
        historicalScore: 0
      };
    }

    const results = {
      isValid: false,
      confidence: 0,
      issues: [],
      validatedPlacenames: [],
      linguisticScore: 0,
      geographicScore: 0,
      historicalScore: 0
    };

    try {
      // Use the ResearchEngine for authenticity validation
      const ResearchEngine = require('./ResearchEngine');
      const researchEngine = new ResearchEngine();
      
      const authenticityResult = await researchEngine.validateAuthenticity(placenames, languageGroup);
      
      // Map the research engine results to our format
      results.isValid = authenticityResult.isValid;
      results.confidence = authenticityResult.confidence;
      results.issues = authenticityResult.issues || [];
      results.validatedPlacenames = authenticityResult.validatedPlacenames || [];
      results.linguisticScore = authenticityResult.phonologicalScore || 0;
      results.geographicScore = authenticityResult.geographicScore || 0;
      results.historicalScore = authenticityResult.historicalScore || 0;

      return results;

    } catch (error) {
      console.warn(`Linguistic authenticity validation failed for ${languageGroup}:`, error.message);
      return {
        isValid: false,
        confidence: 0,
        issues: [`Validation error: ${error.message}`],
        validatedPlacenames: [],
        linguisticScore: 0,
        geographicScore: 0,
        historicalScore: 0
      };
    }
  }

  /**
   * Test system compatibility after namebase updates
   * @param {string} updatedFilePath - Path to updated namebase file
   * @returns {Promise<Object>} Compatibility test results
   */
  async testSystemCompatibility(updatedFilePath) {
    const results = {
      passed: false,
      issues: [],
      tests: {
        fileIntegrity: { passed: false, message: '' },
        languageMixerIntegration: { passed: false, message: '' },
        nameGeneration: { passed: false, message: '' },
        mappingConsistency: { passed: false, message: '' }
      },
      timestamp: new Date().toISOString()
    };

    try {
      // Test 1: File integrity
      const integrityResult = await this._testFileIntegrity(updatedFilePath);
      results.tests.fileIntegrity = integrityResult;
      if (!integrityResult.passed) {
        results.issues.push(`File integrity test failed: ${integrityResult.message}`);
      }

      // Test 2: Language mixer integration
      const mixerResult = await this.testLanguageMixerIntegration(updatedFilePath);
      results.tests.languageMixerIntegration = mixerResult;
      if (!mixerResult.passed) {
        results.issues.push(`Language mixer integration failed: ${mixerResult.message}`);
      }

      // Test 3: Name generation functionality
      const generationResult = await this._testNameGeneration(updatedFilePath);
      results.tests.nameGeneration = generationResult;
      if (!generationResult.passed) {
        results.issues.push(`Name generation test failed: ${generationResult.message}`);
      }

      // Test 4: Mapping consistency
      const mappingResult = await this._testMappingConsistency(updatedFilePath);
      results.tests.mappingConsistency = mappingResult;
      if (!mappingResult.passed) {
        results.issues.push(`Mapping consistency test failed: ${mappingResult.message}`);
      }

      // Overall pass/fail determination
      results.passed = Object.values(results.tests).every(test => test.passed);

      return results;

    } catch (error) {
      results.issues.push(`System compatibility test error: ${error.message}`);
      results.tests.fileIntegrity.message = `Error during testing: ${error.message}`;
      return results;
    }
  }

  /**
   * Validate that name generation patterns work correctly
   * @param {Object} namebase - Namebase entry to test
   * @returns {Promise<boolean>} True if generation patterns are valid
   */
  async validateGenerationPatterns(namebase) {
    try {
      if (!namebase || typeof namebase !== 'object') {
        return false;
      }

      // Check required fields
      const requiredFields = ['name', 'i', 'min', 'max', 'd', 'm', 'b'];
      for (const field of requiredFields) {
        if (namebase[field] === undefined || namebase[field] === null) {
          return false;
        }
      }

      // Validate field types and ranges
      if (typeof namebase.name !== 'string' || namebase.name.length === 0) {
        return false;
      }

      if (!Number.isInteger(namebase.i) || namebase.i < 0) {
        return false;
      }

      if (!Number.isInteger(namebase.min) || namebase.min < 1) {
        return false;
      }

      if (!Number.isInteger(namebase.max) || namebase.max < namebase.min) {
        return false;
      }

      if (typeof namebase.d !== 'string') {
        return false;
      }

      if (typeof namebase.m !== 'number' || namebase.m < 0 || namebase.m > 1) {
        return false;
      }

      // Validate placenames
      if (typeof namebase.b !== 'string') {
        return false;
      }

      const placenames = namebase.b.split(',').filter(name => name.trim().length > 0);
      if (placenames.length === 0) {
        return false;
      }

      // Check that placenames meet minimum quality standards
      const validPlacenames = placenames.filter(name => {
        const trimmed = name.trim();
        return trimmed.length >= 2 && 
               trimmed.length <= 50 && 
               /^[a-zA-Z\u00C0-\u017F\u0100-\u024F\u1E00-\u1EFF\s\-'\.]+$/.test(trimmed);
      });

      // At least 70% of placenames should be valid
      const validityRatio = validPlacenames.length / placenames.length;
      if (validityRatio < 0.7) {
        return false;
      }

      return true;

    } catch (error) {
      console.warn('Generation pattern validation error:', error.message);
      return false;
    }
  }

  /**
   * Check that quality thresholds are maintained
   * @param {Array} placenames - Placenames to check
   * @param {Object} qualityCriteria - Quality criteria to apply
   * @returns {Object} Quality assessment results
   */
  checkQualityThresholds(placenames, qualityCriteria = {}) {
    const criteria = {
      minCount: this.config.minPlacenamesPerGroup,
      minQualityScore: this.config.qualityThreshold,
      maxLength: 50,
      minLength: 2,
      ...qualityCriteria
    };

    const results = {
      passed: false,
      count: placenames.length,
      qualityScore: 0,
      issues: [],
      validPlacenames: [],
      flaggedForReview: []
    };

    // Check minimum count requirement
    if (placenames.length < criteria.minCount) {
      results.issues.push(`Insufficient placenames: ${placenames.length} < ${criteria.minCount} required`);
      results.flaggedForReview.push({
        type: 'insufficient_data',
        message: `Only ${placenames.length} placenames found, need ${criteria.minCount}`,
        severity: 'high'
      });
    }

    // Assess quality of each placename
    let totalQualityScore = 0;
    const qualityScores = [];

    placenames.forEach((placename, index) => {
      const quality = this._assessPlacenameQuality(placename, criteria);
      qualityScores.push(quality);
      totalQualityScore += quality.score;

      if (quality.score >= criteria.minQualityScore) {
        results.validPlacenames.push(placename);
      } else {
        results.issues.push(`Low quality placename: "${placename}" (score: ${quality.score.toFixed(2)})`);
        results.flaggedForReview.push({
          type: 'low_quality',
          placename: placename,
          score: quality.score,
          issues: quality.issues,
          severity: quality.score < 0.3 ? 'high' : 'medium'
        });
      }
    });

    // Calculate overall quality score
    results.qualityScore = placenames.length > 0 ? totalQualityScore / placenames.length : 0;

    // Determine if thresholds are met
    results.passed = (
      placenames.length >= criteria.minCount &&
      results.qualityScore >= criteria.minQualityScore &&
      results.validPlacenames.length >= Math.ceil(criteria.minCount * 0.8) // At least 80% must be valid
    );

    // Add summary statistics
    results.statistics = {
      totalPlacenames: placenames.length,
      validPlacenames: results.validPlacenames.length,
      averageQuality: results.qualityScore,
      passRate: placenames.length > 0 ? results.validPlacenames.length / placenames.length : 0,
      qualityDistribution: this._calculateQualityDistribution(qualityScores)
    };

    return results;
  }

  /**
   * Validate geographic and historical appropriateness
   * @param {Array} placenames - Placenames to validate
   * @param {string} languageGroup - Language group for context
   * @returns {Promise<Object>} Geographic validation results
   */
  async validateGeographicAppropriateness(placenames, languageGroup) {
    if (!Array.isArray(placenames) || placenames.length === 0) {
      return {
        isValid: false,
        confidence: 0,
        issues: ['No placenames provided for geographic validation'],
        validatedPlacenames: [],
        geographicScore: 0,
        historicalScore: 0
      };
    }

    const results = {
      isValid: false,
      confidence: 0,
      issues: [],
      validatedPlacenames: [],
      geographicScore: 0,
      historicalScore: 0
    };

    try {
      // Use the ResearchEngine for geographic validation
      const ResearchEngine = require('./ResearchEngine');
      const researchEngine = new ResearchEngine();
      
      // Validate geographic appropriateness
      const geographicValidation = await researchEngine._validateGeographicAppropriateness(placenames, languageGroup);
      results.geographicScore = geographicValidation.score;
      results.issues.push(...geographicValidation.issues);
      
      // Validate historical accuracy
      const historicalValidation = researchEngine._validateHistoricalAccuracy(placenames, languageGroup);
      results.historicalScore = historicalValidation.score;
      results.issues.push(...historicalValidation.issues);
      
      // Calculate overall confidence
      results.confidence = (results.geographicScore + results.historicalScore) / 2;
      
      // Filter placenames that pass validation
      results.validatedPlacenames = placenames.filter(name => {
        const geographicallyValid = geographicValidation.validNames ? geographicValidation.validNames.includes(name) : true;
        const historicallyValid = historicalValidation.validNames ? historicalValidation.validNames.includes(name) : true;
        return geographicallyValid && historicallyValid;
      });
      
      // Overall validation passes if confidence is above threshold
      results.isValid = results.confidence >= 0.6 && results.validatedPlacenames.length >= Math.min(8, placenames.length * 0.7);
      
      return results;

    } catch (error) {
      console.warn(`Geographic appropriateness validation failed for ${languageGroup}:`, error.message);
      return {
        isValid: false,
        confidence: 0,
        issues: [`Geographic validation error: ${error.message}`],
        validatedPlacenames: [],
        geographicScore: 0,
        historicalScore: 0
      };
    }
  }

  /**
   * Test integration with language mixer mappings
   * @param {Object} updatedNamebases - Updated namebase data
   * @returns {Promise<boolean>} True if mixer integration works
   */
  async testLanguageMixerIntegration(updatedNamebases) {
    try {
      const result = {
        passed: false,
        message: '',
        details: {
          mappingFileExists: false,
          mappingFileValid: false,
          indexConsistency: false,
          namebaseCompatibility: false
        }
      };

      // Check if this is a file path or namebase data
      let namebaseData;
      if (typeof updatedNamebases === 'string') {
        // It's a file path, try to load the namebase data
        namebaseData = await this._loadNamebaseFile(updatedNamebases);
      } else {
        namebaseData = updatedNamebases;
      }

      if (!namebaseData) {
        result.message = 'Could not load namebase data';
        return result;
      }

      // Test 1: Check if language mixer mapping file exists
      const mappingFilePath = this._getLanguageMixerMappingPath();
      result.details.mappingFileExists = await this._fileExists(mappingFilePath);
      
      if (!result.details.mappingFileExists) {
        result.message = 'Language mixer mapping file not found';
        return result;
      }

      // Test 2: Validate mapping file structure
      const mappingData = await this._loadMappingFile(mappingFilePath);
      result.details.mappingFileValid = this._validateMappingStructure(mappingData);
      
      if (!result.details.mappingFileValid) {
        result.message = 'Language mixer mapping file has invalid structure';
        return result;
      }

      // Test 3: Check index consistency between namebases and mappings
      result.details.indexConsistency = this._checkIndexConsistency(namebaseData, mappingData);
      
      if (!result.details.indexConsistency) {
        result.message = 'Index inconsistency between namebases and mappings';
        return result;
      }

      // Test 4: Test namebase compatibility with mixer system
      result.details.namebaseCompatibility = await this._testNamebaseCompatibility(namebaseData);
      
      if (!result.details.namebaseCompatibility) {
        result.message = 'Namebase entries are not compatible with mixer system';
        return result;
      }

      result.passed = true;
      result.message = 'Language mixer integration test passed';
      return result;

    } catch (error) {
      return {
        passed: false,
        message: `Language mixer integration test error: ${error.message}`,
        details: {}
      };
    }
  }

  /**
   * Flag potentially problematic replacements for manual review
   * @param {Array} replacements - Replacement operations to review
   * @returns {Array} Array of flagged replacements requiring attention
   */
  flagProblematicReplacements(replacements) {
    const flagged = [];

    if (!Array.isArray(replacements)) {
      return flagged;
    }

    replacements.forEach((replacement, index) => {
      const flags = this._analyzeReplacementForIssues(replacement, index);
      if (flags.length > 0) {
        flagged.push({
          replacementIndex: index,
          replacement: replacement,
          flags: flags,
          severity: this._calculateSeverity(flags),
          recommendedAction: this._getRecommendedAction(flags)
        });
      }
    });

    // Sort by severity (high first)
    flagged.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });

    return flagged;
  }

  /**
   * Validate character encoding compatibility
   * @param {Array} placenames - Placenames with potential special characters
   * @returns {Object} Encoding compatibility results
   */
  validateCharacterEncoding(placenames) {
    const results = {
      isValid: true,
      issues: [],
      encodingTypes: new Set(),
      compatibilityScore: 1.0,
      validatedPlacenames: [],
      problematicPlacenames: []
    };

    if (!Array.isArray(placenames)) {
      results.isValid = false;
      results.issues.push('Invalid input: placenames must be an array');
      results.compatibilityScore = 0;
      return results;
    }

    if (placenames.length === 0) {
      results.issues.push('No placenames provided for encoding validation');
      return results;
    }

    try {
      placenames.forEach((placename, index) => {
        if (typeof placename !== 'string') {
          results.issues.push(`Placename at index ${index} is not a string`);
          results.problematicPlacenames.push({ index, name: placename, issue: 'not_string' });
          return;
        }

        // Detect encoding type
        const encoding = this._detectEncodingType(placename);
        results.encodingTypes.add(encoding);

        // Check for compatibility issues
        const compatibilityIssues = this._checkEncodingCompatibility(placename, encoding);
        
        if (compatibilityIssues.length === 0) {
          results.validatedPlacenames.push(placename);
        } else {
          results.problematicPlacenames.push({
            index,
            name: placename,
            encoding,
            issues: compatibilityIssues
          });
          results.issues.push(`"${placename}": ${compatibilityIssues.join(', ')}`);
        }
      });

      // Calculate compatibility score
      const validCount = results.validatedPlacenames.length;
      results.compatibilityScore = placenames.length > 0 ? validCount / placenames.length : 1.0;

      // Overall validation passes if most placenames are compatible
      results.isValid = results.compatibilityScore >= 0.8;

      // Add summary information
      results.summary = {
        totalPlacenames: placenames.length,
        validPlacenames: validCount,
        problematicPlacenames: results.problematicPlacenames.length,
        encodingTypes: Array.from(results.encodingTypes),
        compatibilityScore: results.compatibilityScore
      };

      return results;

    } catch (error) {
      results.isValid = false;
      results.issues.push(`Character encoding validation error: ${error.message}`);
      results.compatibilityScore = 0;
      return results;
    }
  }

  /**
   * Assess the quality of a single placename
   * @private
   * @param {string} placename - Placename to assess
   * @param {Object} criteria - Quality criteria
   * @returns {Object} Quality assessment with score and issues
   */
  _assessPlacenameQuality(placename, criteria) {
    const assessment = {
      score: 0,
      issues: [],
      passed: false
    };

    if (!placename || typeof placename !== 'string') {
      assessment.issues.push('Invalid placename: not a string');
      return assessment;
    }

    const trimmed = placename.trim();
    let score = 0.5; // Base score

    // Length validation
    if (trimmed.length < criteria.minLength) {
      assessment.issues.push(`Too short: ${trimmed.length} < ${criteria.minLength}`);
      score -= 0.3;
    } else if (trimmed.length > criteria.maxLength) {
      assessment.issues.push(`Too long: ${trimmed.length} > ${criteria.maxLength}`);
      score -= 0.2;
    } else if (trimmed.length >= 3 && trimmed.length <= 20) {
      score += 0.2; // Ideal length range
    }

    // Character composition validation
    const hasValidChars = /^[a-zA-Z\u00C0-\u017F\u0100-\u024F\u1E00-\u1EFF\s\-'\.]+$/.test(trimmed);
    if (hasValidChars) {
      score += 0.2;
    } else {
      assessment.issues.push('Contains invalid characters');
      score -= 0.4;
    }

    // Capitalization validation
    const isProperlyCapitalized = /^[A-Z\u00C0-\u017F\u0100-\u024F\u1E00-\u1EFF]/.test(trimmed);
    if (isProperlyCapitalized) {
      score += 0.1;
    } else {
      assessment.issues.push('Not properly capitalized');
      score -= 0.1;
    }

    // Check for problematic patterns
    const problematicPatterns = [
      { pattern: /^\s+|\s+$/, issue: 'Leading/trailing whitespace' },
      { pattern: /\s{2,}/, issue: 'Multiple consecutive spaces' },
      { pattern: /^[0-9]/, issue: 'Starts with number' },
      { pattern: /[0-9]{3,}/, issue: 'Contains long number sequence' },
      { pattern: /^(test|example|placeholder|dummy)/i, issue: 'Appears to be test data' },
      { pattern: /[<>{}[\]()]/, issue: 'Contains markup characters' }
    ];

    for (const { pattern, issue } of problematicPatterns) {
      if (pattern.test(trimmed)) {
        assessment.issues.push(issue);
        score -= 0.15;
      }
    }

    // Bonus for linguistic authenticity indicators
    if (this._hasLinguisticAuthenticityMarkers(trimmed)) {
      score += 0.1;
    }

    // Final score normalization
    assessment.score = Math.max(0, Math.min(1, score));
    assessment.passed = assessment.score >= criteria.minQualityScore;

    return assessment;
  }

  /**
   * Check if placename has linguistic authenticity markers
   * @private
   * @param {string} placename - Placename to check
   * @returns {boolean} True if has authenticity markers
   */
  _hasLinguisticAuthenticityMarkers(placename) {
    const authenticityMarkers = [
      // Common place name elements across languages
      /berg|burg|dorf|heim|hausen/i, // German
      /ville|sur|sous|saint/i, // French
      /san|santa|del|de la/i, // Spanish/Italian
      /al-|ibn|abu|beit/i, // Arabic
      /shan|he|bei|nan/i, // Chinese
      /kawa|yama|machi|shi/i, // Japanese
      /grad|gorod|sk|ovo/i, // Slavic
      /ton|ham|ford|wick/i // English
    ];

    return authenticityMarkers.some(pattern => pattern.test(placename));
  }

  /**
   * Calculate quality distribution statistics
   * @private
   * @param {Array} qualityScores - Array of quality assessment objects
   * @returns {Object} Distribution statistics
   */
  _calculateQualityDistribution(qualityScores) {
    if (qualityScores.length === 0) {
      return { high: 0, medium: 0, low: 0 };
    }

    const distribution = { high: 0, medium: 0, low: 0 };

    qualityScores.forEach(assessment => {
      if (assessment.score >= 0.7) {
        distribution.high++;
      } else if (assessment.score >= 0.4) {
        distribution.medium++;
      } else {
        distribution.low++;
      }
    });

    return distribution;
  }

  /**
   * Analyze a replacement for potential issues
   * @private
   * @param {Object} replacement - Replacement operation to analyze
   * @param {number} index - Index of the replacement
   * @returns {Array} Array of flag objects
   */
  _analyzeReplacementForIssues(replacement, index) {
    const flags = [];

    if (!replacement || typeof replacement !== 'object') {
      flags.push({
        type: 'invalid_replacement',
        message: 'Replacement is not a valid object',
        severity: 'high'
      });
      return flags;
    }

    // Check for missing required fields
    const requiredFields = ['languageGroup', 'originalPlaceholders', 'newPlacenames'];
    for (const field of requiredFields) {
      if (!replacement[field]) {
        flags.push({
          type: 'missing_field',
          field: field,
          message: `Missing required field: ${field}`,
          severity: 'high'
        });
      }
    }

    if (replacement.newPlacenames && Array.isArray(replacement.newPlacenames)) {
      // Check for insufficient replacements
      const minRequired = this.config.minPlacenamesPerGroup;
      if (replacement.newPlacenames.length < minRequired) {
        flags.push({
          type: 'insufficient_replacements',
          count: replacement.newPlacenames.length,
          required: minRequired,
          message: `Only ${replacement.newPlacenames.length} replacements, need ${minRequired}`,
          severity: 'medium'
        });
      }

      // Check for duplicate placenames
      const duplicates = this._findDuplicates(replacement.newPlacenames);
      if (duplicates.length > 0) {
        flags.push({
          type: 'duplicate_placenames',
          duplicates: duplicates,
          message: `Duplicate placenames found: ${duplicates.join(', ')}`,
          severity: 'medium'
        });
      }

      // Check for low-quality placenames
      const lowQualityNames = replacement.newPlacenames.filter(name => {
        const quality = this._assessPlacenameQuality(name, { minQualityScore: 0.5 });
        return quality.score < 0.5;
      });

      if (lowQualityNames.length > 0) {
        flags.push({
          type: 'low_quality_names',
          names: lowQualityNames,
          message: `Low quality placenames: ${lowQualityNames.slice(0, 3).join(', ')}${lowQualityNames.length > 3 ? '...' : ''}`,
          severity: 'medium'
        });
      }

      // Check for potential cultural sensitivity issues
      const sensitivityIssues = this._checkCulturalSensitivity(replacement.newPlacenames, replacement.languageGroup);
      if (sensitivityIssues.length > 0) {
        flags.push({
          type: 'cultural_sensitivity',
          issues: sensitivityIssues,
          message: `Potential cultural sensitivity issues detected`,
          severity: 'high'
        });
      }
    }

    // Check research quality
    if (replacement.researchResult) {
      if (replacement.researchResult.confidence < 0.6) {
        flags.push({
          type: 'low_research_confidence',
          confidence: replacement.researchResult.confidence,
          message: `Low research confidence: ${(replacement.researchResult.confidence * 100).toFixed(1)}%`,
          severity: 'medium'
        });
      }

      if (!replacement.researchResult.sources || replacement.researchResult.sources.length === 0) {
        flags.push({
          type: 'no_sources',
          message: 'No research sources provided',
          severity: 'high'
        });
      }
    }

    return flags;
  }

  /**
   * Find duplicate values in an array
   * @private
   * @param {Array} array - Array to check for duplicates
   * @returns {Array} Array of duplicate values
   */
  _findDuplicates(array) {
    const seen = new Set();
    const duplicates = new Set();

    for (const item of array) {
      const normalized = item.toLowerCase().trim();
      if (seen.has(normalized)) {
        duplicates.add(item);
      } else {
        seen.add(normalized);
      }
    }

    return Array.from(duplicates);
  }

  /**
   * Check for cultural sensitivity issues
   * @private
   * @param {Array} placenames - Placenames to check
   * @param {string} languageGroup - Language group context
   * @returns {Array} Array of sensitivity issues
   */
  _checkCulturalSensitivity(placenames, languageGroup) {
    const issues = [];
    const normalizedLanguage = (languageGroup || '').toLowerCase();

    // Define potentially problematic patterns for different cultural contexts
    const sensitivityRules = [
      {
        condition: (lang) => lang.includes('indigenous') || lang.includes('native'),
        patterns: [/new\s+/i, /saint|santa/i, /fort\s+/i, /port\s+/i],
        message: 'Colonial naming patterns may be inappropriate for indigenous languages'
      },
      {
        condition: (lang) => lang.includes('arabic') || lang.includes('muslim') || lang.includes('islamic'),
        patterns: [/saint|santa|san\s+/i, /cristo|church/i, /cathedral/i],
        message: 'Christian religious references may be inappropriate for Islamic cultures'
      },
      {
        condition: (lang) => lang.includes('jewish') || lang.includes('hebrew'),
        patterns: [/christmas|easter|saint/i, /church|cathedral/i],
        message: 'Christian religious references may be inappropriate for Jewish cultures'
      },
      {
        condition: (lang) => lang.includes('chinese') || lang.includes('mandarin'),
        patterns: [/port\s+/i, /fort\s+/i, /victoria|elizabeth|george/i],
        message: 'Western colonial names may be inappropriate for Chinese contexts'
      }
    ];

    for (const rule of sensitivityRules) {
      if (rule.condition(normalizedLanguage)) {
        for (const placename of placenames) {
          for (const pattern of rule.patterns) {
            if (pattern.test(placename)) {
              issues.push({
                placename: placename,
                pattern: pattern.source,
                message: rule.message
              });
            }
          }
        }
      }
    }

    return issues;
  }

  /**
   * Calculate overall severity from flags
   * @private
   * @param {Array} flags - Array of flag objects
   * @returns {string} Overall severity level
   */
  _calculateSeverity(flags) {
    if (flags.some(flag => flag.severity === 'high')) {
      return 'high';
    }
    if (flags.some(flag => flag.severity === 'medium')) {
      return 'medium';
    }
    return 'low';
  }

  /**
   * Get recommended action based on flags
   * @private
   * @param {Array} flags - Array of flag objects
   * @returns {string} Recommended action
   */
  _getRecommendedAction(flags) {
    const highSeverityFlags = flags.filter(flag => flag.severity === 'high');
    
    if (highSeverityFlags.length > 0) {
      if (highSeverityFlags.some(flag => flag.type === 'cultural_sensitivity')) {
        return 'Manual review required for cultural sensitivity';
      }
      if (highSeverityFlags.some(flag => flag.type === 'no_sources')) {
        return 'Additional research required - no sources provided';
      }
      if (highSeverityFlags.some(flag => flag.type === 'missing_field')) {
        return 'Fix missing required fields before proceeding';
      }
      return 'Manual review required due to high severity issues';
    }

    const mediumSeverityFlags = flags.filter(flag => flag.severity === 'medium');
    if (mediumSeverityFlags.length > 2) {
      return 'Consider manual review due to multiple medium severity issues';
    }

    if (mediumSeverityFlags.some(flag => flag.type === 'insufficient_replacements')) {
      return 'Additional research needed to meet minimum replacement count';
    }

    return 'Monitor - proceed with caution';
  }

  /**
   * Test file integrity
   * @private
   * @param {string} filePath - Path to file to test
   * @returns {Promise<Object>} Test result
   */
  async _testFileIntegrity(filePath) {
    try {
      const fs = require('fs').promises;
      
      // Check if file exists
      const exists = await this._fileExists(filePath);
      if (!exists) {
        return { passed: false, message: 'File does not exist' };
      }

      // Check if file is readable
      const content = await fs.readFile(filePath, 'utf8');
      if (!content || content.length === 0) {
        return { passed: false, message: 'File is empty or unreadable' };
      }

      // Check if file has valid JavaScript structure
      try {
        // Look for the expected namebase array structure
        const arrayMatch = content.match(/window\.realWorldNameBases\s*=\s*(\[[\s\S]*\]);?/);
        if (!arrayMatch) {
          return { passed: false, message: 'File does not contain expected namebase array structure' };
        }

        // Try to parse the array content
        const arrayContent = arrayMatch[1];
        const namebaseEntries = eval(`(${arrayContent})`);
        
        if (!Array.isArray(namebaseEntries)) {
          return { passed: false, message: 'Namebase content is not a valid array' };
        }

        if (namebaseEntries.length === 0) {
          return { passed: false, message: 'Namebase array is empty' };
        }

        return { passed: true, message: `File integrity verified - ${namebaseEntries.length} entries found` };

      } catch (parseError) {
        return { passed: false, message: `File parsing error: ${parseError.message}` };
      }

    } catch (error) {
      return { passed: false, message: `File integrity test error: ${error.message}` };
    }
  }

  /**
   * Test name generation functionality
   * @private
   * @param {string} filePath - Path to namebase file
   * @returns {Promise<Object>} Test result
   */
  async _testNameGeneration(filePath) {
    try {
      const namebaseData = await this._loadNamebaseFile(filePath);
      if (!namebaseData) {
        return { passed: false, message: 'Could not load namebase data for generation test' };
      }

      // Test a sample of namebase entries
      const sampleSize = Math.min(10, namebaseData.length);
      const sampleEntries = namebaseData.slice(0, sampleSize);
      
      let validEntries = 0;
      const issues = [];

      for (const entry of sampleEntries) {
        const isValid = await this.validateGenerationPatterns(entry);
        if (isValid) {
          validEntries++;
        } else {
          issues.push(`Entry "${entry.name}" (index ${entry.i}) failed generation pattern validation`);
        }
      }

      const successRate = validEntries / sampleEntries.length;
      
      if (successRate < 0.8) {
        return { 
          passed: false, 
          message: `Low generation pattern success rate: ${(successRate * 100).toFixed(1)}%. Issues: ${issues.slice(0, 3).join('; ')}` 
        };
      }

      return { 
        passed: true, 
        message: `Name generation test passed - ${validEntries}/${sampleEntries.length} entries valid (${(successRate * 100).toFixed(1)}%)` 
      };

    } catch (error) {
      return { passed: false, message: `Name generation test error: ${error.message}` };
    }
  }

  /**
   * Test mapping consistency
   * @private
   * @param {string} filePath - Path to namebase file
   * @returns {Promise<Object>} Test result
   */
  async _testMappingConsistency(filePath) {
    try {
      const namebaseData = await this._loadNamebaseFile(filePath);
      if (!namebaseData) {
        return { passed: false, message: 'Could not load namebase data for mapping test' };
      }

      // Check for duplicate indices
      const indices = namebaseData.map(entry => entry.i);
      const uniqueIndices = new Set(indices);
      
      if (indices.length !== uniqueIndices.size) {
        return { passed: false, message: 'Duplicate indices found in namebase entries' };
      }

      // Check for sequential consistency (indices should be reasonably sequential)
      const sortedIndices = [...indices].sort((a, b) => a - b);
      const gaps = [];
      
      for (let i = 1; i < sortedIndices.length; i++) {
        const gap = sortedIndices[i] - sortedIndices[i - 1];
        if (gap > 100) { // Allow some gaps but flag large ones
          gaps.push(`Gap of ${gap} between indices ${sortedIndices[i - 1]} and ${sortedIndices[i]}`);
        }
      }

      if (gaps.length > 5) {
        return { 
          passed: false, 
          message: `Too many large gaps in index sequence: ${gaps.slice(0, 3).join('; ')}` 
        };
      }

      // Check for valid names
      const invalidNames = namebaseData.filter(entry => 
        !entry.name || 
        typeof entry.name !== 'string' || 
        entry.name.trim().length === 0
      );

      if (invalidNames.length > 0) {
        return { 
          passed: false, 
          message: `${invalidNames.length} entries have invalid names` 
        };
      }

      return { 
        passed: true, 
        message: `Mapping consistency verified - ${namebaseData.length} entries, index range ${sortedIndices[0]}-${sortedIndices[sortedIndices.length - 1]}` 
      };

    } catch (error) {
      return { passed: false, message: `Mapping consistency test error: ${error.message}` };
    }
  }

  /**
   * Load namebase file
   * @private
   * @param {string} filePath - Path to namebase file
   * @returns {Promise<Array>} Namebase entries
   */
  async _loadNamebaseFile(filePath) {
    try {
      const fs = require('fs').promises;
      const content = await fs.readFile(filePath, 'utf8');
      
      const arrayMatch = content.match(/window\.realWorldNameBases\s*=\s*(\[[\s\S]*\]);?/);
      if (!arrayMatch) {
        return null;
      }
      
      const arrayContent = arrayMatch[1];
      return eval(`(${arrayContent})`);
      
    } catch (error) {
      console.warn('Failed to load namebase file:', error.message);
      return null;
    }
  }

  /**
   * Check if file exists
   * @private
   * @param {string} filePath - Path to check
   * @returns {Promise<boolean>} True if file exists
   */
  async _fileExists(filePath) {
    try {
      const fs = require('fs').promises;
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get language mixer mapping file path
   * @private
   * @returns {string} Path to mapping file
   */
  _getLanguageMixerMappingPath() {
    const path = require('path');
    // Assume the mapping file is in the config directory relative to the project root
    return path.join(process.cwd(), 'config', 'language-mixer-map.json');
  }

  /**
   * Load mapping file
   * @private
   * @param {string} filePath - Path to mapping file
   * @returns {Promise<Object>} Mapping data
   */
  async _loadMappingFile(filePath) {
    try {
      const fs = require('fs').promises;
      const content = await fs.readFile(filePath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      console.warn('Failed to load mapping file:', error.message);
      return null;
    }
  }

  /**
   * Validate mapping file structure
   * @private
   * @param {Object} mappingData - Mapping data to validate
   * @returns {boolean} True if structure is valid
   */
  _validateMappingStructure(mappingData) {
    if (!mappingData || typeof mappingData !== 'object') {
      return false;
    }

    // Check if it has the expected structure (ISO codes mapping to indices)
    for (const [key, value] of Object.entries(mappingData)) {
      if (typeof key !== 'string' || !Number.isInteger(value)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check index consistency between namebases and mappings
   * @private
   * @param {Array} namebaseData - Namebase entries
   * @param {Object} mappingData - Mapping data
   * @returns {boolean} True if consistent
   */
  _checkIndexConsistency(namebaseData, mappingData) {
    if (!namebaseData || !mappingData) {
      return false;
    }

    const namebaseIndices = new Set(namebaseData.map(entry => entry.i));
    const mappingIndices = new Set(Object.values(mappingData));

    // Check if all mapping indices exist in namebase
    for (const mappingIndex of mappingIndices) {
      if (!namebaseIndices.has(mappingIndex)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Test namebase compatibility with mixer system
   * @private
   * @param {Array} namebaseData - Namebase entries
   * @returns {Promise<boolean>} True if compatible
   */
  async _testNamebaseCompatibility(namebaseData) {
    if (!Array.isArray(namebaseData)) {
      return false;
    }

    // Test a sample of entries for compatibility
    const sampleSize = Math.min(5, namebaseData.length);
    const sampleEntries = namebaseData.slice(0, sampleSize);

    for (const entry of sampleEntries) {
      const isValid = await this.validateGenerationPatterns(entry);
      if (!isValid) {
        return false;
      }
    }

    return true;
  }

  /**
   * Detect encoding type of a string
   * @private
   * @param {string} text - Text to analyze
   * @returns {string} Encoding type
   */
  _detectEncodingType(text) {
    if (!text || typeof text !== 'string') {
      return 'invalid';
    }

    // Check for ASCII (basic Latin characters only)
    if (/^[\x00-\x7F]*$/.test(text)) {
      return 'ascii';
    }

    // Check for common diacritics (Latin-1 Supplement and Latin Extended-A)
    if (/^[\x00-\x7F\u00C0-\u017F]*$/.test(text)) {
      return 'latin-extended';
    }

    // Check for extended Latin characters
    if (/^[\x00-\x7F\u00C0-\u024F]*$/.test(text)) {
      return 'latin-extended-b';
    }

    // Check for Cyrillic
    if (/[\u0400-\u04FF]/.test(text)) {
      return 'cyrillic';
    }

    // Check for Greek
    if (/[\u0370-\u03FF]/.test(text)) {
      return 'greek';
    }

    // Check for Arabic
    if (/[\u0600-\u06FF]/.test(text)) {
      return 'arabic';
    }

    // Check for CJK (Chinese, Japanese, Korean)
    if (/[\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF]/.test(text)) {
      return 'cjk';
    }

    // Default to UTF-8 for other Unicode characters
    return 'utf8-other';
  }

  /**
   * Check encoding compatibility issues
   * @private
   * @param {string} text - Text to check
   * @param {string} encoding - Detected encoding type
   * @returns {Array} Array of compatibility issues
   */
  _checkEncodingCompatibility(text, encoding) {
    const issues = [];

    // Check for problematic characters that might cause issues
    const problematicPatterns = [
      { pattern: /[\u0000-\u001F]/, issue: 'Contains control characters' },
      { pattern: /[\uFFFE\uFFFF]/, issue: 'Contains invalid Unicode characters' },
      { pattern: /[\uD800-\uDFFF]/, issue: 'Contains unpaired surrogate characters' }
    ];

    for (const { pattern, issue } of problematicPatterns) {
      if (pattern.test(text)) {
        issues.push(issue);
      }
    }

    // Check for encoding-specific issues
    switch (encoding) {
      case 'ascii':
        // ASCII is generally safe
        break;
        
      case 'latin-extended':
      case 'latin-extended-b':
        // Check for normalization issues
        if (text !== text.normalize('NFC')) {
          issues.push('Text is not in NFC normalized form');
        }
        break;
        
      case 'cyrillic':
      case 'greek':
      case 'arabic':
        // Check for mixed scripts (potential security issue)
        if (/[a-zA-Z]/.test(text)) {
          issues.push('Mixed Latin and non-Latin scripts detected');
        }
        break;
        
      case 'cjk':
        // CJK characters might have display issues in some contexts
        if (text.length > 20) {
          issues.push('CJK text may be too long for display');
        }
        break;
        
      case 'utf8-other':
        // Unknown Unicode ranges might have compatibility issues
        issues.push('Contains characters from uncommon Unicode ranges');
        break;
        
      case 'invalid':
        issues.push('Invalid or non-string input');
        break;
    }

    // Check for length issues
    if (text.length === 0) {
      issues.push('Empty string');
    } else if (text.length > 100) {
      issues.push('Text is unusually long');
    }

    // Check for whitespace issues
    if (text !== text.trim()) {
      issues.push('Contains leading or trailing whitespace');
    }

    if (/\s{2,}/.test(text)) {
      issues.push('Contains multiple consecutive spaces');
    }

    return issues;
  }
}

module.exports = ValidationSystem;