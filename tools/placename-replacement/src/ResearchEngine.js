/**
 * ResearchEngine - Handles research and validation of authentic placenames
 * 
 * Responsible for:
 * - Researching placenames from multiple authoritative sources
 * - Validating authenticity and linguistic appropriateness
 * - Managing source prioritization and conflict resolution
 */
class ResearchEngine {
  constructor(config = {}) {
    this.config = {
      minPlacenames: 12,
      maxRetries: 3,
      rateLimitMs: 1000,
      sources: {
        wikipedia: true,
        openstreetmap: true,
        geonames: true
      },
      ...config
    };
    this.sourceCache = new Map();
  }

  /**
   * Research placenames for a specific language group
   * @param {string} languageGroup - Language group identifier
   * @param {number} count - Minimum number of placenames to find
   * @returns {Promise<Object>} Research result with placenames and sources
   */
  async researchPlacenames(languageGroup, count = 12) {
    console.log(`🔬 Researching placenames for ${languageGroup} (need ${count} placenames)...`);
    
    try {
      // Check cache first
      const cacheKey = `${languageGroup}_${count}`;
      if (this.sourceCache.has(cacheKey)) {
        console.log(`  📋 Using cached results for ${languageGroup}`);
        return this.sourceCache.get(cacheKey);
      }
      
      const researchResult = {
        languageGroup,
        requestedCount: count,
        placenames: [],
        sources: [],
        confidence: 0,
        timestamp: new Date().toISOString(),
        notes: []
      };
      
      // Get placenames from multiple sources
      const sourceResults = await this.getFromMultipleSources(languageGroup);
      
      if (sourceResults.length === 0) {
        researchResult.notes.push('No sources returned results');
        console.log(`  ⚠️  No research sources returned results for ${languageGroup}`);
        return researchResult;
      }
      
      // Prioritize and resolve conflicts between sources
      const prioritizedPlacenames = this.prioritizeAndResolveConflicts(sourceResults);
      
      if (prioritizedPlacenames.length === 0) {
        researchResult.notes.push('No valid placenames found after filtering');
        console.log(`  ⚠️  No valid placenames found for ${languageGroup} after filtering`);
        return researchResult;
      }
      
      // Take the number we need, but ensure we have at least some results
      const selectedPlacenames = prioritizedPlacenames.slice(0, Math.max(count, 8));
      
      researchResult.placenames = selectedPlacenames;
      researchResult.sources = sourceResults;
      researchResult.confidence = this._calculateResearchConfidence(sourceResults, selectedPlacenames.length, count);
      
      if (selectedPlacenames.length < count) {
        researchResult.notes.push(`Found ${selectedPlacenames.length} placenames, requested ${count}`);
      }
      
      console.log(`  ✅ Found ${selectedPlacenames.length} placenames for ${languageGroup} (confidence: ${(researchResult.confidence * 100).toFixed(1)}%)`);
      
      // Cache the result
      this.sourceCache.set(cacheKey, researchResult);
      
      return researchResult;
      
    } catch (error) {
      console.error(`  ❌ Research failed for ${languageGroup}:`, error.message);
      return {
        languageGroup,
        requestedCount: count,
        placenames: [],
        sources: [],
        confidence: 0,
        timestamp: new Date().toISOString(),
        error: error.message,
        notes: [`Research error: ${error.message}`]
      };
    }
  }

  /**
   * Validate authenticity of placenames for a language group
   * @param {Array} placenames - Array of placenames to validate
   * @param {string} languageGroup - Language group for validation context
   * @returns {Promise<Object>} Validation result with confidence scores
   */
  async validateAuthenticity(placenames, languageGroup) {
    if (!Array.isArray(placenames) || placenames.length === 0) {
      return {
        isValid: false,
        confidence: 0,
        issues: ['No placenames provided for validation'],
        validatedPlacenames: []
      };
    }
    
    const validationResults = {
      isValid: true,
      confidence: 0,
      issues: [],
      validatedPlacenames: [],
      geographicScore: 0,
      historicalScore: 0,
      phonologicalScore: 0
    };
    
    try {
      // Validate geographic appropriateness
      const geographicValidation = await this._validateGeographicAppropriateness(placenames, languageGroup);
      validationResults.geographicScore = geographicValidation.score;
      validationResults.issues.push(...geographicValidation.issues);
      
      // Validate historical accuracy
      const historicalValidation = this._validateHistoricalAccuracy(placenames, languageGroup);
      validationResults.historicalScore = historicalValidation.score;
      validationResults.issues.push(...historicalValidation.issues);
      
      // Validate phonological patterns
      const phonologicalValidation = this._validatePhonologicalPatternsDetailed(placenames, languageGroup);
      validationResults.phonologicalScore = phonologicalValidation.score;
      validationResults.issues.push(...phonologicalValidation.issues);
      
      // Calculate overall confidence score
      const scores = [
        validationResults.geographicScore,
        validationResults.historicalScore,
        validationResults.phonologicalScore
      ];
      validationResults.confidence = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      
      // Filter placenames that pass validation
      validationResults.validatedPlacenames = placenames.filter(name => {
        return this._isPlacenameAuthentic(name, languageGroup, {
          geographic: geographicValidation.validNames || [],
          historical: historicalValidation.validNames || [],
          phonological: phonologicalValidation.validNames || []
        });
      });
      
      // Overall validation passes if confidence is above threshold
      validationResults.isValid = validationResults.confidence >= 0.6 && validationResults.validatedPlacenames.length >= Math.min(8, placenames.length * 0.7);
      
      return validationResults;
      
    } catch (error) {
      console.warn(`Authenticity validation failed for ${languageGroup}:`, error.message);
      return {
        isValid: false,
        confidence: 0,
        issues: [`Validation error: ${error.message}`],
        validatedPlacenames: []
      };
    }
  }

  /**
   * Validate geographic appropriateness of placenames
   * @param {Array} placenames - Placenames to validate
   * @param {string} languageGroup - Language group for context
   * @returns {Promise<Object>} Geographic validation result
   */
  async _validateGeographicAppropriateness(placenames, languageGroup) {
    const result = {
      score: 0.5, // Default neutral score
      issues: [],
      validNames: []
    };
    
    try {
      // Get expected regions for this language group
      const expectedRegions = this._getRegionsForLanguageGroup(languageGroup);
      const regionNames = this._getRegionNames(expectedRegions);
      
      let validCount = 0;
      
      for (const placename of placenames) {
        // Check if placename appears to be from expected geographic regions
        const isGeographicallyAppropriate = this._checkGeographicMatch(placename, languageGroup, regionNames);
        
        if (isGeographicallyAppropriate) {
          validCount++;
          result.validNames.push(placename);
        } else {
          result.issues.push(`"${placename}" may not be geographically appropriate for ${languageGroup}`);
        }
      }
      
      result.score = placenames.length > 0 ? validCount / placenames.length : 0;
      
      if (result.score < 0.5) {
        result.issues.push(`Low geographic appropriateness score (${(result.score * 100).toFixed(1)}%) for ${languageGroup}`);
      }
      
      return result;
      
    } catch (error) {
      result.issues.push(`Geographic validation error: ${error.message}`);
      return result;
    }
  }

  /**
   * Validate historical accuracy of placenames
   * @param {Array} placenames - Placenames to validate
   * @param {string} languageGroup - Language group for context
   * @returns {Object} Historical validation result
   */
  _validateHistoricalAccuracy(placenames, languageGroup) {
    const result = {
      score: 0.7, // Default optimistic score for historical accuracy
      issues: [],
      validNames: []
    };
    
    try {
      // Check for anachronistic or inappropriate names
      const problematicPatterns = [
        /new\s+/i,           // "New" prefix often indicates colonial naming
        /saint\s+/i,         // Saint names may not be appropriate for non-Christian cultures
        /\d+/,               // Numbers in place names are often modern
        /^(north|south|east|west)\s+/i  // Cardinal directions may indicate modern administrative naming
      ];
      
      let validCount = 0;
      
      for (const placename of placenames) {
        let isHistoricallyAppropriate = true;
        
        // Check against problematic patterns
        for (const pattern of problematicPatterns) {
          if (pattern.test(placename)) {
            isHistoricallyAppropriate = false;
            result.issues.push(`"${placename}" contains potentially anachronistic elements`);
            break;
          }
        }
        
        // Additional checks for specific language groups
        if (isHistoricallyAppropriate) {
          isHistoricallyAppropriate = this._checkLanguageSpecificHistoricalRules(placename, languageGroup);
          if (!isHistoricallyAppropriate) {
            result.issues.push(`"${placename}" may not be historically appropriate for ${languageGroup}`);
          }
        }
        
        if (isHistoricallyAppropriate) {
          validCount++;
          result.validNames.push(placename);
        }
      }
      
      result.score = placenames.length > 0 ? validCount / placenames.length : 0.7;
      
      return result;
      
    } catch (error) {
      result.issues.push(`Historical validation error: ${error.message}`);
      return result;
    }
  }

  /**
   * Validate phonological patterns of placenames (detailed results)
   * @param {Array} placenames - Placenames to validate
   * @param {string} languageGroup - Language group for pattern validation
   * @returns {Object} Phonological validation result with score and issues
   */
  _validatePhonologicalPatternsDetailed(placenames, languageGroup) {
    const result = {
      score: 0.5, // Default neutral score
      issues: [],
      validNames: []
    };
    
    if (!Array.isArray(placenames) || placenames.length === 0) {
      result.issues.push('No placenames provided for phonological validation');
      return result;
    }
    
    try {
      // Get phonological rules for the language group
      const phonologicalRules = this._getPhonologicalRules(languageGroup);
      
      let validCount = 0;
      
      for (const placename of placenames) {
        const isPhonologicallyValid = this._checkPhonologicalPatterns(placename, phonologicalRules);
        
        if (isPhonologicallyValid) {
          validCount++;
          result.validNames.push(placename);
        } else {
          result.issues.push(`"${placename}" does not follow expected phonological patterns for ${languageGroup}`);
        }
      }
      
      result.score = validCount / placenames.length;
      
      if (result.score < 0.4) {
        result.issues.push(`Low phonological consistency score (${(result.score * 100).toFixed(1)}%) for ${languageGroup}`);
      }
      
      return result;
      
    } catch (error) {
      result.issues.push(`Phonological validation error: ${error.message}`);
      result.score = 0.5; // Neutral score on error
      return result;
    }
  }

  /**
   * Check if a placename is geographically appropriate
   * @param {string} placename - Placename to check
   * @param {string} languageGroup - Language group
   * @param {Array} regionNames - Expected region names
   * @returns {boolean} True if geographically appropriate
   */
  _checkGeographicMatch(placename, languageGroup, regionNames) {
    // Simple heuristic: check if placename contains elements common to the region
    const normalizedName = placename.toLowerCase();
    const normalizedLanguage = languageGroup.toLowerCase();
    
    // Language-specific geographic indicators
    const geographicIndicators = this._getGeographicIndicators(languageGroup);
    
    // Check for positive indicators
    for (const indicator of geographicIndicators.positive || []) {
      if (normalizedName.includes(indicator.toLowerCase())) {
        return true;
      }
    }
    
    // Check for negative indicators (names that suggest wrong region)
    for (const indicator of geographicIndicators.negative || []) {
      if (normalizedName.includes(indicator.toLowerCase())) {
        return false;
      }
    }
    
    // Special case: check if placename is a well-known city for this language group
    const wellKnownPlaces = this._getWellKnownPlacesForLanguage(languageGroup);
    if (wellKnownPlaces.includes(normalizedName)) {
      return true;
    }
    
    // Default to true if no strong indicators either way (more permissive)
    return true;
  }

  /**
   * Check language-specific historical appropriateness rules
   * @param {string} placename - Placename to check
   * @param {string} languageGroup - Language group
   * @returns {boolean} True if historically appropriate
   */
  _checkLanguageSpecificHistoricalRules(placename, languageGroup) {
    const normalizedLanguage = languageGroup.toLowerCase();
    const normalizedName = placename.toLowerCase();
    
    // Language-specific historical rules
    if (normalizedLanguage.includes('arabic') || normalizedLanguage.includes('muslim')) {
      // Arabic names should not contain Christian references
      if (/saint|santa|san\s+|cristo|church/i.test(placename)) {
        return false;
      }
    }
    
    if (normalizedLanguage.includes('chinese') || normalizedLanguage.includes('mandarin')) {
      // Chinese names should not contain Western colonial elements
      if (/port\s+|fort\s+|victoria|elizabeth/i.test(placename)) {
        return false;
      }
    }
    
    if (normalizedLanguage.includes('indigenous') || normalizedLanguage.includes('native')) {
      // Indigenous names should not contain colonial elements
      if (/new\s+|saint|fort\s+|port\s+/i.test(placename)) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Get phonological rules for a language group
   * @param {string} languageGroup - Language group
   * @returns {Object} Phonological rules object
   */
  _getPhonologicalRules(languageGroup) {
    const normalizedLanguage = languageGroup.toLowerCase();
    
    // Simplified phonological rules - in a real implementation, this would be much more comprehensive
    const rules = {
      allowedSounds: [],
      forbiddenSounds: [],
      commonPatterns: [],
      syllableStructure: 'CV', // Default consonant-vowel pattern
      maxLength: 15
    };
    
    // Language-specific phonological patterns
    if (normalizedLanguage.includes('chinese')) {
      rules.commonPatterns = ['ng', 'zh', 'ch', 'sh'];
      rules.forbiddenSounds = ['th', 'v', 'f'];
      rules.syllableStructure = 'CV';
    } else if (normalizedLanguage.includes('arabic')) {
      rules.commonPatterns = ['al-', 'ibn', 'abu'];
      rules.forbiddenSounds = ['p', 'v'];
      rules.syllableStructure = 'CVC';
    } else if (normalizedLanguage.includes('japanese')) {
      rules.commonPatterns = ['ka', 'ki', 'ku', 'ke', 'ko', 'sa', 'shi', 'su', 'se', 'so'];
      rules.forbiddenSounds = ['l', 'v', 'th'];
      rules.syllableStructure = 'CV';
    } else if (normalizedLanguage.includes('german')) {
      rules.commonPatterns = ['sch', 'ch', 'tz', 'berg', 'burg', 'dorf'];
      rules.syllableStructure = 'CVC';
    } else if (normalizedLanguage.includes('french')) {
      rules.commonPatterns = ['eau', 'eux', 'ille', 'tion'];
      rules.syllableStructure = 'CV';
    }
    
    return rules;
  }

  /**
   * Check if a placename follows phonological patterns
   * @param {string} placename - Placename to check
   * @param {Object} rules - Phonological rules
   * @returns {boolean} True if follows patterns
   */
  _checkPhonologicalPatterns(placename, rules) {
    const normalizedName = placename.toLowerCase();
    
    // Check length
    if (normalizedName.length > rules.maxLength) {
      return false;
    }
    
    // Check for forbidden sounds
    for (const sound of rules.forbiddenSounds || []) {
      if (normalizedName.includes(sound)) {
        return false;
      }
    }
    
    // Check for common patterns (bonus points)
    let hasCommonPattern = rules.commonPatterns.length === 0; // Default true if no patterns specified
    for (const pattern of rules.commonPatterns || []) {
      if (normalizedName.includes(pattern)) {
        hasCommonPattern = true;
        break;
      }
    }
    
    return hasCommonPattern;
  }

  /**
   * Get geographic indicators for a language group
   * @param {string} languageGroup - Language group
   * @returns {Object} Geographic indicators object
   */
  _getGeographicIndicators(languageGroup) {
    const normalizedLanguage = languageGroup.toLowerCase();
    
    const indicators = {
      positive: [],
      negative: []
    };
    
    // Language-specific geographic indicators
    if (normalizedLanguage.includes('arabic')) {
      indicators.positive = ['al-', 'ibn', 'abu', 'beit', 'dar'];
      indicators.negative = ['mc', 'o\'', 'van', 'de', 'la'];
    } else if (normalizedLanguage.includes('chinese')) {
      indicators.positive = ['bei', 'nan', 'dong', 'xi', 'shan', 'he'];
      indicators.negative = ['mc', 'o\'', 'saint', 'new'];
    } else if (normalizedLanguage.includes('german')) {
      indicators.positive = ['berg', 'burg', 'dorf', 'heim', 'hausen'];
      indicators.negative = ['mc', 'o\'', 'ibn', 'al-'];
    } else if (normalizedLanguage.includes('french')) {
      indicators.positive = ['saint', 'la', 'le', 'sur', 'sous'];
      indicators.negative = ['mc', 'o\'', 'ibn', 'al-', 'berg'];
    } else if (normalizedLanguage.includes('spanish')) {
      indicators.positive = ['san', 'santa', 'de', 'del', 'la', 'el'];
      indicators.negative = ['mc', 'o\'', 'ibn', 'al-', 'berg'];
    } else if (normalizedLanguage.includes('italian')) {
      indicators.positive = ['san', 'santa', 'di', 'del', 'della'];
      indicators.negative = ['mc', 'o\'', 'ibn', 'al-', 'berg'];
    }
    
    return indicators;
  }

  /**
   * Get well-known places for a language group
   * @param {string} languageGroup - Language group
   * @returns {Array} Array of well-known place names (lowercase)
   */
  _getWellKnownPlacesForLanguage(languageGroup) {
    const normalizedLanguage = languageGroup.toLowerCase();
    
    const wellKnownPlaces = {
      'french': ['paris', 'lyon', 'marseille', 'toulouse', 'nice', 'nantes', 'strasbourg', 'bordeaux', 'lille', 'rennes'],
      'german': ['berlin', 'munich', 'hamburg', 'cologne', 'frankfurt', 'stuttgart', 'dresden', 'leipzig', 'dortmund', 'essen'],
      'spanish': ['madrid', 'barcelona', 'valencia', 'seville', 'zaragoza', 'malaga', 'murcia', 'palma', 'bilbao', 'alicante'],
      'italian': ['rome', 'milan', 'naples', 'turin', 'palermo', 'genoa', 'bologna', 'florence', 'venice', 'verona'],
      'portuguese': ['lisbon', 'porto', 'braga', 'coimbra', 'funchal', 'faro', 'aveiro'],
      'arabic': ['cairo', 'baghdad', 'damascus', 'aleppo', 'casablanca', 'tunis', 'algiers', 'rabat', 'mecca', 'medina'],
      'chinese': ['beijing', 'shanghai', 'guangzhou', 'shenzhen', 'tianjin', 'wuhan', 'dongguan', 'chengdu', 'nanjing', 'xian'],
      'japanese': ['tokyo', 'osaka', 'yokohama', 'nagoya', 'sapporo', 'fukuoka', 'kobe', 'kyoto', 'kawasaki', 'hiroshima'],
      'english': ['london', 'manchester', 'birmingham', 'liverpool', 'leeds', 'sheffield', 'bristol', 'newcastle', 'nottingham']
    };
    
    // Try exact match first
    if (wellKnownPlaces[normalizedLanguage]) {
      return wellKnownPlaces[normalizedLanguage];
    }
    
    // Try partial matches
    for (const [lang, places] of Object.entries(wellKnownPlaces)) {
      if (normalizedLanguage.includes(lang) || lang.includes(normalizedLanguage)) {
        return places;
      }
    }
    
    return [];
  }

  /**
   * Get region names for country codes
   * @param {Array} countryCodes - Array of country codes
   * @returns {Array} Array of region names
   */
  _getRegionNames(countryCodes) {
    const codeToName = {
      'FR': 'France', 'DE': 'Germany', 'ES': 'Spain', 'IT': 'Italy',
      'CN': 'China', 'JP': 'Japan', 'KR': 'Korea', 'SA': 'Saudi Arabia',
      'EG': 'Egypt', 'MA': 'Morocco', 'US': 'United States', 'GB': 'Britain'
    };
    
    return countryCodes.map(code => codeToName[code] || code);
  }

  /**
   * Check if a placename is authentic based on validation results
   * @param {string} placename - Placename to check
   * @param {string} languageGroup - Language group
   * @param {Object} validationData - Validation data from different checks
   * @returns {boolean} True if placename is considered authentic
   */
  _isPlacenameAuthentic(placename, languageGroup, validationData) {
    // A placename is considered authentic if it passes at least 2 out of 3 validation checks
    let passedChecks = 0;
    
    if (validationData.geographic.includes(placename)) passedChecks++;
    if (validationData.historical.includes(placename)) passedChecks++;
    if (validationData.phonological.includes(placename)) passedChecks++;
    
    return passedChecks >= 2;
  }

  /**
   * Get placenames from multiple sources and merge results
   * @param {string} languageGroup - Language group to research
   * @returns {Promise<Array>} Array of research results from different sources
   */
  async getFromMultipleSources(languageGroup) {
    const results = [];
    
    try {
      // Research from Wikipedia
      if (this.config.sources.wikipedia) {
        const wikipediaPlacenames = await this.researchFromWikipedia(languageGroup);
        if (wikipediaPlacenames.length > 0) {
          results.push({
            placenames: wikipediaPlacenames,
            source: 'Wikipedia',
            reliability: 0.7,
            timestamp: new Date().toISOString()
          });
        }
      }
      
      // Research from geographic databases
      if (this.config.sources.openstreetmap || this.config.sources.geonames) {
        const geographicPlacenames = await this.researchFromGeographicDatabases(languageGroup);
        if (geographicPlacenames.length > 0) {
          results.push({
            placenames: geographicPlacenames,
            source: 'Geographic Databases',
            reliability: 0.85,
            timestamp: new Date().toISOString()
          });
        }
      }
      
      return results;
      
    } catch (error) {
      console.warn(`Multi-source research failed for ${languageGroup}:`, error.message);
      return results; // Return partial results if available
    }
  }

  /**
   * Research placenames from Wikipedia language pages
   * @param {string} languageGroup - Language group identifier
   * @returns {Promise<Array>} Array of placenames found on Wikipedia
   */
  async researchFromWikipedia(languageGroup) {
    try {
      const placenames = [];
      
      // Create more targeted search terms for better results
      const searchTerms = this._generateWikipediaSearchTerms(languageGroup);
      
      console.log(`    📚 Searching Wikipedia with ${searchTerms.length} search terms...`);
      
      for (const term of searchTerms) {
        try {
          // Search for relevant pages
          const searchResults = await this._searchWikipediaPages(term);
          
          // Process top results
          const topResults = searchResults.slice(0, 3); // Limit to top 3 results per search term
          
          for (const page of topResults) {
            try {
              // Extract placenames from each page
              const pageContent = await this._getWikipediaPageContent(page.title);
              if (pageContent) {
                const extractedNames = this._extractPlacenamesFromContent(pageContent, languageGroup);
                placenames.push(...extractedNames);
                
                console.log(`      📄 Extracted ${extractedNames.length} names from "${page.title}"`);
              }
              
              // Rate limiting - be respectful to Wikipedia
              await this._sleep(this.config.rateLimitMs);
              
            } catch (pageError) {
              console.warn(`      ⚠️  Failed to process page "${page.title}": ${pageError.message}`);
            }
          }
          
          // Rate limiting between search terms
          await this._sleep(this.config.rateLimitMs);
          
        } catch (searchError) {
          console.warn(`    ⚠️  Search failed for term "${term}": ${searchError.message}`);
        }
      }
      
      // Remove duplicates and filter for quality
      const uniquePlacenames = [...new Set(placenames)];
      const filteredPlacenames = this._filterPlacenameQuality(uniquePlacenames, languageGroup);
      
      console.log(`    ✅ Wikipedia research found ${filteredPlacenames.length} unique placenames for ${languageGroup}`);
      
      return filteredPlacenames;
      
    } catch (error) {
      console.warn(`Wikipedia research failed for ${languageGroup}:`, error.message);
      return [];
    }
  }

  /**
   * Generate targeted Wikipedia search terms for a language group
   * @param {string} languageGroup - Language group identifier
   * @returns {Array} Array of search terms
   */
  _generateWikipediaSearchTerms(languageGroup) {
    const baseTerms = [
      `${languageGroup} language`,
      `${languageGroup} places`,
      `${languageGroup} geography`,
      `${languageGroup} settlements`,
      `List of ${languageGroup} place names`
    ];
    
    // Add region-specific terms based on language group
    const regions = this._getRegionsForLanguageGroup(languageGroup);
    const regionTerms = regions.map(region => `${region} places`);
    
    // Add language family terms for better coverage
    const familyTerms = this._getLanguageFamilyTerms(languageGroup);
    
    // Combine all terms and remove duplicates
    const allTerms = [...baseTerms, ...regionTerms, ...familyTerms];
    return [...new Set(allTerms)].slice(0, 8); // Limit to 8 terms to avoid too many requests
  }

  /**
   * Get language family terms for broader search coverage
   * @param {string} languageGroup - Language group identifier
   * @returns {Array} Array of language family related terms
   */
  _getLanguageFamilyTerms(languageGroup) {
    const normalizedLanguage = languageGroup.toLowerCase();
    
    // Language family mappings for broader search coverage
    const familyMappings = {
      // Romance languages
      'spanish': ['Iberian Peninsula places', 'Hispanic settlements'],
      'french': ['Francophone places', 'French-speaking regions'],
      'italian': ['Italian Peninsula geography', 'Italian settlements'],
      'portuguese': ['Lusophone places', 'Portuguese-speaking regions'],
      
      // Germanic languages
      'german': ['Germanic settlements', 'German-speaking regions'],
      'dutch': ['Low Countries places', 'Netherlands geography'],
      'swedish': ['Scandinavian places', 'Nordic settlements'],
      'norwegian': ['Scandinavian places', 'Nordic settlements'],
      'danish': ['Scandinavian places', 'Nordic settlements'],
      
      // Slavic languages
      'polish': ['Slavic settlements', 'Eastern European places'],
      'czech': ['Slavic settlements', 'Central European places'],
      'russian': ['Slavic settlements', 'Russian geography'],
      
      // Arabic languages
      'arabic': ['Arab world places', 'Middle Eastern settlements'],
      'levantine': ['Levant geography', 'Middle Eastern places'],
      'libyan': ['North African places', 'Maghreb settlements'],
      
      // Asian languages
      'chinese': ['Chinese settlements', 'East Asian places'],
      'japanese': ['Japanese geography', 'Japanese settlements'],
      'korean': ['Korean geography', 'Korean settlements'],
      'thai': ['Southeast Asian places', 'Thai settlements'],
      'vietnamese': ['Southeast Asian places', 'Vietnamese settlements'],
      
      // African languages
      'swahili': ['East African places', 'Bantu settlements'],
      'yoruba': ['West African places', 'Nigerian settlements'],
      'amharic': ['Ethiopian places', 'Horn of Africa settlements'],
      
      // Indigenous languages
      'malay': ['Southeast Asian places', 'Austronesian settlements'],
      'warlpiri': ['Australian Aboriginal places', 'Indigenous Australian settlements']
    };
    
    // Try exact match first
    if (familyMappings[normalizedLanguage]) {
      return familyMappings[normalizedLanguage];
    }
    
    // Try partial matches
    for (const [lang, terms] of Object.entries(familyMappings)) {
      if (normalizedLanguage.includes(lang) || lang.includes(normalizedLanguage)) {
        return terms;
      }
    }
    
    return [];
  }

  /**
   * Search for Wikipedia pages related to a language group
   * @param {string} searchTerm - Search term to use
   * @returns {Promise<Array>} Array of page results
   */
  async _searchWikipediaPages(searchTerm) {
    try {
      const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchTerm)}&format=json&origin=*&srlimit=5`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Wikipedia API returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.query && data.query.search) {
        return data.query.search;
      }
      
      return [];
      
    } catch (error) {
      console.warn(`Wikipedia search failed for term "${searchTerm}":`, error.message);
      return [];
    }
  }

  /**
   * Get content from a Wikipedia page
   * @param {string} pageTitle - Title of the Wikipedia page
   * @returns {Promise<string>} Page content
   */
  async _getWikipediaPageContent(pageTitle) {
    try {
      const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&titles=${encodeURIComponent(pageTitle)}&prop=extracts&exintro&explaintext&origin=*`;
      const response = await fetch(url);
      const data = await response.json();
      
      const pages = data.query.pages;
      const pageId = Object.keys(pages)[0];
      
      if (pages[pageId].extract) {
        return pages[pageId].extract;
      }
      
      // If no extract, try getting full content
      const fullUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&titles=${encodeURIComponent(pageTitle)}&prop=revisions&rvprop=content&origin=*`;
      const fullResponse = await fetch(fullUrl);
      const fullData = await fullResponse.json();
      
      const fullPages = fullData.query.pages;
      const fullPageId = Object.keys(fullPages)[0];
      
      if (fullPages[fullPageId].revisions && fullPages[fullPageId].revisions[0]) {
        return fullPages[fullPageId].revisions[0]['*'] || '';
      }
      
      return '';
    } catch (error) {
      console.warn(`Failed to get Wikipedia content for "${pageTitle}":`, error.message);
      return '';
    }
  }

  /**
   * Extract placenames from Wikipedia content
   * @param {string} content - Wikipedia page content
   * @param {string} languageGroup - Language group for context
   * @returns {Array} Array of extracted placenames
   */
  _extractPlacenamesFromContent(content, languageGroup) {
    const placenames = [];
    
    // Look for patterns that indicate place names
    const patterns = [
      // Cities, towns, villages pattern
      /(?:city|town|village|settlement|place)\s+(?:of\s+)?([A-Z][a-zA-Z\u00C0-\u017F\u0100-\u024F\u1E00-\u1EFF]+(?:\s+[A-Z][a-zA-Z\u00C0-\u017F\u0100-\u024F\u1E00-\u1EFF]+)*)/gi,
      
      // Geographic features
      /(?:river|mountain|lake|valley|region|province|district)\s+(?:of\s+)?([A-Z][a-zA-Z\u00C0-\u017F\u0100-\u024F\u1E00-\u1EFF]+(?:\s+[A-Z][a-zA-Z\u00C0-\u017F\u0100-\u024F\u1E00-\u1EFF]+)*)/gi,
      
      // List patterns
      /^\*\s*([A-Z][a-zA-Z\u00C0-\u017F\u0100-\u024F\u1E00-\u1EFF]+(?:\s+[A-Z][a-zA-Z\u00C0-\u017F\u0100-\u024F\u1E00-\u1EFF]+)*)/gm,
      
      // Capitalized words that could be place names (more conservative)
      /\b([A-Z][a-zA-Z\u00C0-\u017F\u0100-\u024F\u1E00-\u1EFF]{3,}(?:\s+[A-Z][a-zA-Z\u00C0-\u017F\u0100-\u024F\u1E00-\u1EFF]{3,})?)\b/g
    ];
    
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const placename = match[1].trim();
        if (this._isValidPlacename(placename, languageGroup)) {
          placenames.push(placename);
        }
      }
    }
    
    return placenames;
  }

  /**
   * Check if a potential placename is valid
   * @param {string} placename - Potential placename to validate
   * @param {string} languageGroup - Language group for context
   * @returns {boolean} True if placename appears valid
   */
  _isValidPlacename(placename, languageGroup) {
    // Basic validation rules
    if (!placename || placename.length < 2 || placename.length > 50) {
      return false;
    }
    
    // Exclude common English words that aren't place names
    const excludeWords = [
      'The', 'This', 'That', 'These', 'Those', 'Language', 'People', 'Culture',
      'History', 'Wikipedia', 'Article', 'Page', 'Section', 'Category', 'List',
      'Main', 'See', 'Also', 'References', 'External', 'Links', 'Source',
      'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
      'September', 'October', 'November', 'December'
    ];
    
    if (excludeWords.includes(placename)) {
      return false;
    }
    
    // Must start with capital letter
    if (!/^[A-Z\u00C0-\u017F\u0100-\u024F\u1E00-\u1EFF]/.test(placename)) {
      return false;
    }
    
    // Should not contain numbers or special characters (except spaces, hyphens, apostrophes)
    if (!/^[a-zA-Z\u00C0-\u017F\u0100-\u024F\u1E00-\u1EFF\s\-']+$/.test(placename)) {
      return false;
    }
    
    return true;
  }

  /**
   * Filter placenames for quality and relevance
   * @param {Array} placenames - Array of placenames to filter
   * @param {string} languageGroup - Language group for context
   * @returns {Array} Filtered array of high-quality placenames
   */
  _filterPlacenameQuality(placenames, languageGroup) {
    return placenames
      .filter(name => this._isValidPlacename(name, languageGroup))
      .filter(name => name.length >= 3 && name.length <= 25) // Reasonable length range
      .slice(0, 50); // Limit to top 50 results
  }

  /**
   * Research placenames from geographic databases
   * @param {string} languageGroup - Language group identifier
   * @returns {Promise<Array>} Array of placenames from geographic sources
   */
  async researchFromGeographicDatabases(languageGroup) {
    const allPlacenames = [];
    
    try {
      // Get placenames from OpenStreetMap Nominatim
      if (this.config.sources.openstreetmap) {
        const osmPlacenames = await this._researchFromOSM(languageGroup);
        allPlacenames.push(...osmPlacenames.map(name => ({
          name,
          source: 'OpenStreetMap',
          reliability: 0.8
        })));
      }
      
      // Get placenames from GeoNames
      if (this.config.sources.geonames) {
        const geonamesPlacenames = await this._researchFromGeoNames(languageGroup);
        allPlacenames.push(...geonamesPlacenames.map(name => ({
          name,
          source: 'GeoNames',
          reliability: 0.9
        })));
      }
      
      // Remove duplicates and return names only
      const uniqueNames = new Map();
      allPlacenames.forEach(item => {
        if (!uniqueNames.has(item.name) || uniqueNames.get(item.name).reliability < item.reliability) {
          uniqueNames.set(item.name, item);
        }
      });
      
      return Array.from(uniqueNames.values()).map(item => item.name);
      
    } catch (error) {
      console.warn(`Geographic database research failed for ${languageGroup}:`, error.message);
      return [];
    }
  }

  /**
   * Research placenames from OpenStreetMap Nominatim API
   * @param {string} languageGroup - Language group identifier
   * @returns {Promise<Array>} Array of placenames from OSM
   */
  async _researchFromOSM(languageGroup) {
    try {
      const placenames = [];
      
      // Map language groups to countries/regions for geographic context
      const regions = this._getRegionsForLanguageGroup(languageGroup);
      
      for (const region of regions) {
        const searchQueries = [
          `city in ${region}`,
          `town in ${region}`,
          `village in ${region}`
        ];
        
        for (const query of searchQueries) {
          try {
            const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=20&addressdetails=1`;
            const response = await fetch(url, {
              headers: {
                'User-Agent': 'Fantasy-Map-Generator-Placename-Research/1.0'
              }
            });
            
            if (!response.ok) {
              throw new Error(`OSM API returned ${response.status}`);
            }
            
            const data = await response.json();
            
            for (const place of data) {
              if (place.display_name && place.type) {
                const name = this._extractPlacenameFromOSM(place);
                if (name && this._isValidPlacename(name, languageGroup)) {
                  placenames.push(name);
                }
              }
            }
            
            // Rate limiting - OSM requires 1 request per second
            await this._sleep(1000);
            
          } catch (error) {
            console.warn(`OSM search failed for query "${query}":`, error.message);
          }
        }
      }
      
      return [...new Set(placenames)]; // Remove duplicates
      
    } catch (error) {
      console.warn(`OSM research failed for ${languageGroup}:`, error.message);
      return [];
    }
  }

  /**
   * Research placenames from GeoNames database
   * @param {string} languageGroup - Language group identifier
   * @returns {Promise<Array>} Array of placenames from GeoNames
   */
  async _researchFromGeoNames(languageGroup) {
    try {
      const placenames = [];
      
      // Note: GeoNames requires registration for API access
      // This is a placeholder implementation that would need API credentials
      const regions = this._getRegionsForLanguageGroup(languageGroup);
      
      for (const region of regions) {
        try {
          // This would require a GeoNames API key
          // const url = `http://api.geonames.org/searchJSON?country=${region}&featureClass=P&maxRows=50&username=${apiKey}`;
          
          // For now, return empty array since we don't have API credentials
          // In a real implementation, this would make the API call and parse results
          console.log(`GeoNames research would query region: ${region} for language: ${languageGroup}`);
          
          await this._sleep(this.config.rateLimitMs);
          
        } catch (error) {
          console.warn(`GeoNames search failed for region "${region}":`, error.message);
        }
      }
      
      return placenames;
      
    } catch (error) {
      console.warn(`GeoNames research failed for ${languageGroup}:`, error.message);
      return [];
    }
  }

  /**
   * Extract clean placename from OSM result
   * @param {Object} osmPlace - OSM place object
   * @returns {string|null} Extracted placename or null
   */
  _extractPlacenameFromOSM(osmPlace) {
    // Try to get the most specific name
    if (osmPlace.name) {
      return osmPlace.name;
    }
    
    // Fall back to parsing display_name
    if (osmPlace.display_name) {
      const parts = osmPlace.display_name.split(',');
      if (parts.length > 0) {
        return parts[0].trim();
      }
    }
    
    return null;
  }

  /**
   * Get geographic regions associated with a language group
   * @param {string} languageGroup - Language group identifier
   * @returns {Array} Array of region/country codes
   */
  _getRegionsForLanguageGroup(languageGroup) {
    // This is a simplified mapping - in a real implementation, this would be
    // a comprehensive database of language-to-region mappings
    const languageRegionMap = {
      // European languages
      'french': ['FR', 'BE', 'CH', 'CA'],
      'german': ['DE', 'AT', 'CH'],
      'spanish': ['ES', 'MX', 'AR', 'CO'],
      'italian': ['IT', 'CH'],
      'portuguese': ['PT', 'BR'],
      'dutch': ['NL', 'BE'],
      'polish': ['PL'],
      'czech': ['CZ'],
      'hungarian': ['HU'],
      'finnish': ['FI'],
      'swedish': ['SE'],
      'norwegian': ['NO'],
      'danish': ['DK'],
      
      // Asian languages
      'chinese': ['CN', 'TW', 'HK'],
      'japanese': ['JP'],
      'korean': ['KR'],
      'thai': ['TH'],
      'vietnamese': ['VN'],
      'hindi': ['IN'],
      'arabic': ['SA', 'EG', 'MA', 'AE'],
      
      // African languages
      'swahili': ['KE', 'TZ', 'UG'],
      'amharic': ['ET'],
      'yoruba': ['NG'],
      
      // Default fallback
      'default': ['US', 'GB', 'CA', 'AU']
    };
    
    const normalizedLanguage = languageGroup.toLowerCase();
    
    // Try exact match first
    if (languageRegionMap[normalizedLanguage]) {
      return languageRegionMap[normalizedLanguage];
    }
    
    // Try partial matches
    for (const [lang, regions] of Object.entries(languageRegionMap)) {
      if (normalizedLanguage.includes(lang) || lang.includes(normalizedLanguage)) {
        return regions;
      }
    }
    
    // Return default regions if no match found
    return languageRegionMap.default;
  }

  /**
   * Validate phonological patterns of placenames (public interface)
   * @param {Array} placenames - Placenames to validate
   * @param {string} languageGroup - Language group for pattern validation
   * @returns {boolean} True if placenames follow expected patterns
   */
  validatePhonologicalPatterns(placenames, languageGroup) {
    // This method provides a simple boolean interface for backward compatibility
    const result = this._validatePhonologicalPatternsDetailed(placenames, languageGroup);
    return result.score >= 0.5;
  }

  /**
   * Prioritize sources based on reliability and resolve conflicts
   * @param {Array} sourceResults - Results from multiple sources
   * @returns {Array} Prioritized and deduplicated placenames
   */
  prioritizeAndResolveConflicts(sourceResults) {
    if (!Array.isArray(sourceResults) || sourceResults.length === 0) {
      return [];
    }
    
    // Flatten all placenames with their source information
    const allPlacenames = [];
    sourceResults.forEach(result => {
      if (result.placenames && Array.isArray(result.placenames)) {
        result.placenames.forEach(placename => {
          allPlacenames.push({
            name: placename,
            source: result.source,
            reliability: result.reliability || 0.5,
            timestamp: result.timestamp,
            normalizedName: this._normalizePlacename(placename)
          });
        });
      }
    });
    
    // Group by normalized placename to identify conflicts
    const nameGroups = new Map();
    allPlacenames.forEach(item => {
      if (!nameGroups.has(item.normalizedName)) {
        nameGroups.set(item.normalizedName, []);
      }
      nameGroups.get(item.normalizedName).push(item);
    });
    
    // Resolve conflicts using sophisticated prioritization
    const resolvedPlacenames = [];
    nameGroups.forEach((sources, normalizedName) => {
      const chosen = this._resolveSourceConflict(sources);
      if (chosen) {
        resolvedPlacenames.push(chosen.name);
      }
    });
    
    // Apply additional quality filters
    return this._applyQualityFilters(resolvedPlacenames);
  }

  /**
   * Normalize placename for conflict detection
   * @param {string} placename - Placename to normalize
   * @returns {string} Normalized placename
   */
  _normalizePlacename(placename) {
    return placename
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens
      .replace(/\s+/g, ' '); // Normalize whitespace
  }

  /**
   * Resolve conflict between multiple sources for the same placename
   * @param {Array} sources - Array of source entries for the same placename
   * @returns {Object|null} Chosen source entry or null
   */
  _resolveSourceConflict(sources) {
    if (!sources || sources.length === 0) {
      return null;
    }
    
    if (sources.length === 1) {
      return sources[0];
    }
    
    // Multi-criteria conflict resolution
    const scoredSources = sources.map(source => ({
      ...source,
      score: this._calculateSourceScore(source, sources)
    }));
    
    // Sort by score (highest first)
    scoredSources.sort((a, b) => b.score - a.score);
    
    // Return the highest scoring source
    return scoredSources[0];
  }

  /**
   * Calculate comprehensive score for a source
   * @param {Object} source - Source entry
   * @param {Array} allSources - All sources for this placename
   * @returns {number} Calculated score
   */
  _calculateSourceScore(source, allSources) {
    let score = 0;
    
    // Base reliability score (0-1)
    score += (source.reliability || 0.5) * 40;
    
    // Source priority score (0-10, scaled to 0-30)
    const priorityScore = this._getSourcePriority(source.source);
    score += (priorityScore / 10) * 30;
    
    // Recency bonus (newer sources get slight preference)
    if (source.timestamp) {
      const age = Date.now() - new Date(source.timestamp).getTime();
      const daysSinceCreation = age / (1000 * 60 * 60 * 24);
      const recencyBonus = Math.max(0, 10 - (daysSinceCreation / 30)); // Up to 10 points, decaying over 30 days
      score += recencyBonus;
    }
    
    // Consensus bonus (if multiple sources agree, boost score)
    const agreementCount = allSources.filter(s => 
      this._normalizePlacename(s.name) === this._normalizePlacename(source.name)
    ).length;
    if (agreementCount > 1) {
      score += Math.min(agreementCount * 5, 20); // Up to 20 points for consensus
    }
    
    // Name quality bonus
    score += this._assessPlacenameQuality(source.name) * 10;
    
    return score;
  }

  /**
   * Assess the quality of a placename
   * @param {string} placename - Placename to assess
   * @returns {number} Quality score between 0 and 1
   */
  _assessPlacenameQuality(placename) {
    if (!placename || typeof placename !== 'string') {
      return 0;
    }
    
    let quality = 0.5; // Base quality
    
    // Length appropriateness
    const length = placename.trim().length;
    if (length >= 3 && length <= 20) {
      quality += 0.2;
    } else if (length < 3 || length > 30) {
      quality -= 0.3;
    }
    
    // Character composition
    const hasValidChars = /^[a-zA-Z\u00C0-\u017F\u0100-\u024F\u1E00-\u1EFF\s\-']+$/.test(placename);
    if (hasValidChars) {
      quality += 0.2;
    } else {
      quality -= 0.4;
    }
    
    // Capitalization appropriateness
    const isProperlyCapitalized = /^[A-Z\u00C0-\u017F\u0100-\u024F\u1E00-\u1EFF]/.test(placename);
    if (isProperlyCapitalized) {
      quality += 0.1;
    }
    
    // Avoid obviously problematic patterns
    const problematicPatterns = [
      /^\s+|\s+$/, // Leading/trailing whitespace
      /\s{2,}/, // Multiple consecutive spaces
      /^[0-9]/, // Starting with number
      /[0-9]{3,}/, // Long number sequences
    ];
    
    for (const pattern of problematicPatterns) {
      if (pattern.test(placename)) {
        quality -= 0.2;
      }
    }
    
    return Math.max(0, Math.min(1, quality));
  }

  /**
   * Apply final quality filters to resolved placenames
   * @param {Array} placenames - Array of resolved placenames
   * @returns {Array} Filtered array of high-quality placenames
   */
  _applyQualityFilters(placenames) {
    return placenames
      .filter(name => name && typeof name === 'string')
      .filter(name => name.trim().length >= 2)
      .filter(name => this._assessPlacenameQuality(name) >= 0.3)
      .slice(0, 100); // Limit to top 100 results
  }

  /**
   * Get priority score for a source (higher is better)
   * @param {string} source - Source name
   * @returns {number} Priority score
   */
  _getSourcePriority(source) {
    const priorities = {
      // Academic and official sources (highest priority)
      'Academic Source': 10,
      'Government Database': 9,
      'National Geographic Survey': 9,
      'UNESCO World Heritage': 8,
      
      // Geographic databases (high priority)
      'GeoNames': 8,
      'Geographic Databases': 7,
      'OpenStreetMap': 6,
      
      // Wikipedia and encyclopedic sources (medium-high priority)
      'Wikipedia': 5,
      'Encyclopædia Britannica': 6,
      'World Gazetteer': 5,
      
      // Community and crowd-sourced (medium priority)
      'Community Source': 3,
      'User Contribution': 2,
      
      // Unknown or unverified (low priority)
      'Unknown': 1,
      'Unverified': 1
    };
    
    // Check for exact match first
    if (priorities[source]) {
      return priorities[source];
    }
    
    // Check for partial matches
    const normalizedSource = source.toLowerCase();
    for (const [sourceName, priority] of Object.entries(priorities)) {
      if (normalizedSource.includes(sourceName.toLowerCase()) || 
          sourceName.toLowerCase().includes(normalizedSource)) {
        return priority;
      }
    }
    
    // Default priority for unknown sources
    return priorities['Unknown'];
  }

  /**
   * Calculate research confidence based on sources and results
   * @param {Array} sourceResults - Results from different sources
   * @param {number} foundCount - Number of placenames found
   * @param {number} requestedCount - Number of placenames requested
   * @returns {number} Confidence score between 0 and 1
   */
  _calculateResearchConfidence(sourceResults, foundCount, requestedCount) {
    if (!sourceResults || sourceResults.length === 0 || foundCount === 0) {
      return 0;
    }
    
    let confidence = 0;
    
    // Base confidence from source count and reliability
    const avgReliability = sourceResults.reduce((sum, source) => sum + (source.reliability || 0.5), 0) / sourceResults.length;
    confidence += avgReliability * 0.4; // 40% weight for source reliability
    
    // Confidence from source diversity
    const uniqueSources = new Set(sourceResults.map(s => s.source)).size;
    const diversityScore = Math.min(uniqueSources / 3, 1); // Max score when 3+ different sources
    confidence += diversityScore * 0.2; // 20% weight for source diversity
    
    // Confidence from result completeness
    const completenessScore = Math.min(foundCount / requestedCount, 1);
    confidence += completenessScore * 0.3; // 30% weight for completeness
    
    // Confidence from total result count (more results = higher confidence)
    const totalResults = sourceResults.reduce((sum, source) => sum + (source.placenames?.length || 0), 0);
    const abundanceScore = Math.min(totalResults / (requestedCount * 2), 1); // Max score when 2x requested count
    confidence += abundanceScore * 0.1; // 10% weight for result abundance
    
    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Sleep utility for rate limiting
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise} Promise that resolves after the specified time
   */
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = ResearchEngine;