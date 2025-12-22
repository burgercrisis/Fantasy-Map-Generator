"use strict";

/**
 * Language Name Normalization Tool
 * 
 * Systematically identifies and replaces placeholder, abbreviated, or incomplete 
 * language names with proper, full language names in the Language Mixer System.
 * 
 * Usage:
 *   node tools/mixer-core/normalize-language-names.js [options]
 * 
 * Options:
 *   --dry-run          Show what would be changed without making modifications
 *   --backup           Create backup files before making changes (default: true)
 *   --report-format    Output format for reports: json, csv, markdown (default: markdown)
 *   --help             Show this help message
 */

const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..", "..");

/**
 * Analyzes language entries to identify incomplete, abbreviated, or placeholder names
 */
class LanguageNameAnalyzer {
  constructor() {
    // Legitimate short names that should not be flagged as incomplete
    this.legitimateShortNames = new Set([
      "ga", "ao", "yi", "yo", "zu", "xh", "st", "ss", "ts", "ve", "nr", "nd"
    ]);
  }

  /**
   * Analyzes a single language entry for completeness
   * @param {Object} languageEntry - Language entry from language-mixes.json
   * @returns {Object} Analysis result with issues and suggestions
   */
  analyzeEntry(languageEntry) {
    const issues = [];
    const suggestions = [];
    let needsUpdate = false;
    let priority = 1;

    if (!languageEntry || !languageEntry.name) {
      return { needsUpdate: false, issues: ["Missing language entry or name"], priority: 0, suggestions: [] };
    }

    const name = languageEntry.name.toLowerCase();
    const iso = (languageEntry.iso || "").toLowerCase();

    // Check for very short names (likely abbreviations)
    if (name.length < 4 && !this.legitimateShortNames.has(name)) {
      issues.push("Name is very short (likely abbreviated)");
      suggestions.push("Expand to full language name");
      needsUpdate = true;
      priority = Math.max(priority, 7);
    }

    // Check if name is identical to ISO code (generic placeholder)
    if (name === iso || name.replace(/[-\s]/g, "") === iso.replace(/[-\s]/g, "")) {
      issues.push("Name appears to be ISO code used as display name");
      suggestions.push("Replace with proper human-readable language name");
      needsUpdate = true;
      priority = Math.max(priority, 8);
    }

    // Check for generic patterns
    const genericPatterns = [
      /^[a-z]{2,3}$/,  // Simple ISO-like codes
      /language$/i,     // Ends with "language" without proper name
      /dialect$/i,      // Ends with "dialect" without proper name
      /family$/i        // Family-level entries used as language names
    ];

    for (const pattern of genericPatterns) {
      if (pattern.test(name)) {
        issues.push(`Name matches generic pattern: ${pattern.source}`);
        suggestions.push("Use specific language name instead of generic pattern");
        needsUpdate = true;
        priority = Math.max(priority, 6);
      }
    }

    // Check for missing metadata
    if (!languageEntry.family || languageEntry.family.trim() === "") {
      issues.push("Missing language family information");
      suggestions.push("Add proper language family classification");
      priority = Math.max(priority, 3);
    }

    return {
      needsUpdate,
      issues,
      priority,
      suggestions,
      usageFrequency: 0 // Will be populated by usage analysis
    };
  }

  /**
   * Identifies all entries needing normalization
   * @param {Array} languageEntries - Array of language entries
   * @returns {Array} Entries that need normalization
   */
  identifyIncompleteNames(languageEntries) {
    const incompleteEntries = [];

    for (const entry of languageEntries) {
      const analysis = this.analyzeEntry(entry);
      if (analysis.needsUpdate) {
        incompleteEntries.push({
          entry,
          analysis
        });
      }
    }

    return incompleteEntries;
  }

  /**
   * Analyzes existing language mixer usage patterns
   * @param {Array} languageMixes - Language mixes configuration
   * @param {Array} languageMixerMap - Language mixer map configuration
   * @returns {Object} Usage statistics by ISO code
   */
  analyzeUsageFrequency(languageMixes, languageMixerMap) {
    const usageStats = {};
    
    // Initialize all ISOs with zero usage
    for (const mix of languageMixes) {
      if (mix.iso) {
        usageStats[mix.iso] = 0;
      }
    }
    
    // Count usage patterns from mixer map
    for (const mapEntry of languageMixerMap) {
      if (mapEntry.iso && mapEntry.bases && Array.isArray(mapEntry.bases)) {
        const iso = mapEntry.iso;
        
        // Base usage frequency - languages with more bases are used more
        const baseCount = mapEntry.bases.length;
        usageStats[iso] = (usageStats[iso] || 0) + baseCount;
        
        // Boost for languages that appear in multiple contexts
        // (This is a simplified heuristic - in a real system we might analyze
        // actual generation logs or user preferences)
        if (baseCount > 1) {
          usageStats[iso] += Math.floor(baseCount / 2);
        }
      }
    }
    
    // Apply additional heuristics based on language characteristics
    for (const mix of languageMixes) {
      if (!mix.iso) continue;
      
      const iso = mix.iso;
      let bonusPoints = 0;
      
      // Major world languages get usage bonus
      const majorLanguages = new Set([
        'en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko', 'ar', 'hi'
      ]);
      if (majorLanguages.has(iso)) {
        bonusPoints += 10;
      }
      
      // Languages with Wikipedia references are more likely to be used
      if (mix.wikipedia && mix.wikipedia.trim()) {
        bonusPoints += 3;
      }
      
      // Languages with complete metadata are more likely to be used
      if (mix.family && mix.family.trim() && 
          mix.region && mix.region.trim() && 
          mix.category && mix.category.trim()) {
        bonusPoints += 2;
      }
      
      // Regional languages in populated areas get moderate bonus
      if (mix.region) {
        const populatedRegions = ['Europe', 'Asia', 'Africa', 'North America'];
        if (populatedRegions.some(region => 
          mix.region.toLowerCase().includes(region.toLowerCase()))) {
          bonusPoints += 1;
        }
      }
      
      // Language families with many members are more likely to be used
      if (mix.family) {
        const largeFamilies = [
          'Indo-European', 'Sino-Tibetan', 'Niger-Congo', 'Austronesian',
          'Trans-New Guinea', 'Afro-Asiatic', 'Nilo-Saharan', 'Austroasiatic'
        ];
        if (largeFamilies.some(family => 
          mix.family.toLowerCase().includes(family.toLowerCase()))) {
          bonusPoints += 1;
        }
      }
      
      usageStats[iso] = (usageStats[iso] || 0) + bonusPoints;
    }
    
    return usageStats;
  }

  /**
   * Calculates priority scores for incomplete entries based on usage
   * @param {Array} incompleteEntries - Entries needing normalization
   * @param {Object} usageStats - Usage statistics from analyzeUsageFrequency
   * @returns {Array} Entries with calculated priority scores
   */
  calculatePriorityScores(incompleteEntries, usageStats) {
    for (const item of incompleteEntries) {
      const iso = item.entry.iso;
      const usage = usageStats[iso] || 0;
      
      // Calculate priority score based on usage frequency
      let priorityBoost = 0;
      
      if (usage >= 20) {
        priorityBoost = 4; // Very high usage
      } else if (usage >= 15) {
        priorityBoost = 3; // High usage
      } else if (usage >= 10) {
        priorityBoost = 2; // Medium-high usage
      } else if (usage >= 5) {
        priorityBoost = 1; // Medium usage
      }
      // Low usage (< 5) gets no boost
      
      // Apply the boost to the existing priority
      item.analysis.priority = Math.max(item.analysis.priority, 
        item.analysis.priority + priorityBoost);
      
      // Store usage frequency for sorting
      item.analysis.usageFrequency = usage;
    }
    
    return incompleteEntries;
  }

  /**
   * Prioritizes entries based on usage frequency in the mixer system
   * @param {Array} incompleteEntries - Entries needing normalization
   * @param {Object} usageStats - Usage statistics from mixer system
   * @returns {Array} Prioritized list of entries
   */
  prioritizeByUsage(incompleteEntries, usageStats = {}) {
    // Add usage frequency to analysis
    for (const item of incompleteEntries) {
      const iso = item.entry.iso;
      item.analysis.usageFrequency = usageStats[iso] || 0;
      
      // Boost priority for frequently used languages
      if (item.analysis.usageFrequency > 10) {
        item.analysis.priority = Math.max(item.analysis.priority, 9);
      } else if (item.analysis.usageFrequency > 5) {
        item.analysis.priority = Math.max(item.analysis.priority, 7);
      }
    }

    // Sort by priority (descending) then by usage frequency (descending)
    return incompleteEntries.sort((a, b) => {
      if (a.analysis.priority !== b.analysis.priority) {
        return b.analysis.priority - a.analysis.priority;
      }
      return b.analysis.usageFrequency - a.analysis.usageFrequency;
    });
  }
}

/**
 * Resolves proper language names from authoritative sources
 */
class LanguageNameResolver {
  constructor() {
    // Comprehensive ISO 639 code to name mappings
    this.isoNameMap = new Map([
      // Major world languages
      ["en", "English"],
      ["es", "Spanish"],
      ["fr", "French"],
      ["de", "German"],
      ["it", "Italian"],
      ["pt", "Portuguese"],
      ["ru", "Russian"],
      ["zh", "Chinese"],
      ["ja", "Japanese"],
      ["ko", "Korean"],
      ["ar", "Arabic"],
      ["hi", "Hindi"],
      ["bn", "Bengali"],
      ["ur", "Urdu"],
      ["fa", "Persian"],
      ["tr", "Turkish"],
      ["pl", "Polish"],
      ["nl", "Dutch"],
      ["sv", "Swedish"],
      ["no", "Norwegian"],
      ["da", "Danish"],
      ["fi", "Finnish"],
      ["is", "Icelandic"],
      ["hu", "Hungarian"],
      ["cs", "Czech"],
      ["sk", "Slovak"],
      ["sl", "Slovenian"],
      ["hr", "Croatian"],
      ["sr", "Serbian"],
      ["bg", "Bulgarian"],
      ["mk", "Macedonian"],
      ["sq", "Albanian"],
      ["ro", "Romanian"],
      ["el", "Greek"],
      ["he", "Hebrew"],
      ["th", "Thai"],
      ["vi", "Vietnamese"],
      ["id", "Indonesian"],
      ["ms", "Malay"],
      ["tl", "Tagalog"],
      ["sw", "Swahili"],
      ["am", "Amharic"],
      ["yo", "Yoruba"],
      ["ig", "Igbo"],
      ["ha", "Hausa"],
      ["zu", "Zulu"],
      ["xh", "Xhosa"],
      ["af", "Afrikaans"],
      
      // European languages
      ["ca", "Catalan"],
      ["eu", "Basque"],
      ["gl", "Galician"],
      ["cy", "Welsh"],
      ["ga", "Irish"],
      ["gd", "Scottish Gaelic"],
      ["br", "Breton"],
      ["mt", "Maltese"],
      ["lv", "Latvian"],
      ["lt", "Lithuanian"],
      ["et", "Estonian"],
      ["be", "Belarusian"],
      ["uk", "Ukrainian"],
      
      // Asian languages
      ["mn", "Mongolian"],
      ["ka", "Georgian"],
      ["hy", "Armenian"],
      ["az", "Azerbaijani"],
      ["kk", "Kazakh"],
      ["ky", "Kyrgyz"],
      ["uz", "Uzbek"],
      ["tg", "Tajik"],
      ["tk", "Turkmen"],
      ["ps", "Pashto"],
      ["sd", "Sindhi"],
      ["ne", "Nepali"],
      ["si", "Sinhala"],
      ["my", "Burmese"],
      ["km", "Khmer"],
      ["lo", "Lao"],
      
      // African languages
      ["rw", "Kinyarwanda"],
      ["rn", "Kirundi"],
      ["lg", "Luganda"],
      ["sn", "Shona"],
      ["st", "Sesotho"],
      ["tn", "Setswana"],
      ["ts", "Tsonga"],
      ["ve", "Venda"],
      ["nr", "Ndebele"],
      ["nd", "Ndebele"],
      ["ss", "Swati"],
      
      // Indigenous and minority languages
      ["qu", "Quechua"],
      ["gn", "Guarani"],
      ["ay", "Aymara"],
      ["iu", "Inuktitut"],
      ["kl", "Kalaallisut"],
      ["mi", "Maori"],
      ["haw", "Hawaiian"],
      ["sm", "Samoan"],
      ["to", "Tongan"],
      ["fj", "Fijian"],
      
      // Historical and constructed languages
      ["la", "Latin"],
      ["grc", "Ancient Greek"],
      ["non", "Old Norse"],
      ["ang", "Old English"],
      ["gmh", "Middle High German"],
      ["fro", "Old French"],
      ["eo", "Esperanto"],
      ["ia", "Interlingua"],
      ["ie", "Interlingue"],
      ["vo", "Volapük"],
      
      // Sign languages
      ["ase", "American Sign Language"],
      ["bfi", "British Sign Language"],
      ["fsl", "French Sign Language"],
      ["gsg", "German Sign Language"],
      
      // Regional variants (ISO 639-1 with common extensions)
      ["en-gb", "British English"],
      ["en-us", "American English"],
      ["en-au", "Australian English"],
      ["en-ca", "Canadian English"],
      ["fr-ca", "Canadian French"],
      ["fr-ch", "Swiss French"],
      ["de-at", "Austrian German"],
      ["de-ch", "Swiss German"],
      ["pt-br", "Brazilian Portuguese"],
      ["es-mx", "Mexican Spanish"],
      ["es-ar", "Argentinian Spanish"],
      ["zh-cn", "Simplified Chinese"],
      ["zh-tw", "Traditional Chinese"]
    ]);
    
    // Fallback patterns for non-standard codes
    this.fallbackPatterns = [
      // Common 3-letter ISO 639-2/3 codes that map to 2-letter codes
      { pattern: /^eng$/i, replacement: "en" },
      { pattern: /^spa$/i, replacement: "es" },
      { pattern: /^fra$/i, replacement: "fr" },
      { pattern: /^deu$/i, replacement: "de" },
      { pattern: /^ita$/i, replacement: "it" },
      { pattern: /^por$/i, replacement: "pt" },
      { pattern: /^rus$/i, replacement: "ru" },
      { pattern: /^zho$/i, replacement: "zh" },
      { pattern: /^jpn$/i, replacement: "ja" },
      { pattern: /^kor$/i, replacement: "ko" },
      { pattern: /^ara$/i, replacement: "ar" },
      { pattern: /^hin$/i, replacement: "hi" },
      { pattern: /^ben$/i, replacement: "bn" },
      { pattern: /^urd$/i, replacement: "ur" },
      { pattern: /^fas$/i, replacement: "fa" },
      { pattern: /^tur$/i, replacement: "tr" },
      { pattern: /^pol$/i, replacement: "pl" },
      { pattern: /^nld$/i, replacement: "nl" },
      { pattern: /^swe$/i, replacement: "sv" },
      { pattern: /^nor$/i, replacement: "no" },
      
      // Common alternative codes
      { pattern: /^chinese$/i, replacement: "zh" },
      { pattern: /^mandarin$/i, replacement: "zh" },
      { pattern: /^cantonese$/i, replacement: "yue" },
      { pattern: /^persian$/i, replacement: "fa" },
      { pattern: /^farsi$/i, replacement: "fa" },
      { pattern: /^dutch$/i, replacement: "nl" },
      { pattern: /^flemish$/i, replacement: "nl" }
    ];
  }

  /**
   * Resolves proper name from ISO code with fallback mechanisms
   * @param {string} isoCode - ISO 639 language code (can be 2 or 3 letters)
   * @returns {string|null} Proper language name or null if not found
   */
  resolveFromISO(isoCode) {
    if (!isoCode) return null;
    
    const code = isoCode.toLowerCase().trim();
    
    // First, try direct lookup
    const directMatch = this.isoNameMap.get(code);
    if (directMatch) return directMatch;
    
    // Try fallback patterns for non-standard codes
    for (const fallback of this.fallbackPatterns) {
      if (fallback.pattern.test(code)) {
        const standardCode = fallback.replacement;
        const resolvedName = this.isoNameMap.get(standardCode);
        if (resolvedName) return resolvedName;
      }
    }
    
    // Try removing common suffixes/prefixes that might be added to codes
    const cleanedCode = code
      .replace(/^iso[-_]?/i, '')  // Remove "iso" prefix
      .replace(/[-_]?lang(uage)?$/i, '')  // Remove "lang" or "language" suffix
      .replace(/[-_]?code$/i, '');  // Remove "code" suffix
    
    if (cleanedCode !== code) {
      const cleanedMatch = this.isoNameMap.get(cleanedCode);
      if (cleanedMatch) return cleanedMatch;
    }
    
    // Try partial matching for regional variants (e.g., "en-US" -> "en")
    if (code.includes('-') || code.includes('_')) {
      const baseCode = code.split(/[-_]/)[0];
      const baseMatch = this.isoNameMap.get(baseCode);
      if (baseMatch) {
        // For regional variants, we might want to preserve the regional info
        const regionPart = code.split(/[-_]/).slice(1).join('-').toUpperCase();
        if (regionPart && regionPart.length === 2) {
          // Common region codes
          const regionNames = {
            'US': 'American',
            'GB': 'British', 
            'AU': 'Australian',
            'CA': 'Canadian',
            'CH': 'Swiss',
            'AT': 'Austrian',
            'BR': 'Brazilian',
            'MX': 'Mexican',
            'AR': 'Argentinian',
            'CN': 'Simplified',
            'TW': 'Traditional'
          };
          
          const regionName = regionNames[regionPart];
          if (regionName) {
            return `${regionName} ${baseMatch}`;
          }
        }
        return baseMatch;
      }
    }
    
    return null;
  }

  /**
   * Extracts proper name from Wikipedia URL with enhanced disambiguation handling
   * @param {string} wikipediaUrl - Wikipedia URL reference
   * @returns {string|null} Extracted language name or null
   */
  resolveFromWikipedia(wikipediaUrl) {
    if (!wikipediaUrl || typeof wikipediaUrl !== "string") return null;
    
    try {
      // Extract page title from Wikipedia URL
      const match = wikipediaUrl.match(/\/wiki\/([^#?]+)/);
      if (!match) return null;
      
      let title = decodeURIComponent(match[1]);
      
      // Clean up common Wikipedia title patterns
      title = title.replace(/_/g, " ");
      
      // Handle disambiguation patterns more comprehensively
      // Remove disambiguation in parentheses (but preserve important info)
      title = title.replace(/\s*\([^)]*disambiguation[^)]*\)$/i, "");
      title = title.replace(/\s*\([^)]*language[^)]*\)$/i, "");
      
      // Handle specific disambiguation cases we want to preserve
      const preservePatterns = [
        /\(ancient\)/i,
        /\(old\)/i,
        /\(middle\)/i,
        /\(modern\)/i,
        /\(classical\)/i,
        /\(extinct\)/i,
        /\(historical\)/i,
        /\(sign language\)/i
      ];
      
      let hasPreservedInfo = false;
      for (const pattern of preservePatterns) {
        if (pattern.test(title)) {
          hasPreservedInfo = true;
          break;
        }
      }
      
      // If no important info to preserve, remove all parentheses
      if (!hasPreservedInfo) {
        title = title.replace(/\s*\([^)]+\)$/g, "");
      }
      
      // Remove common suffixes
      title = title.replace(/\s+language$/i, "");
      title = title.replace(/\s+languages$/i, "");
      
      // Handle redirect indicators
      title = title.replace(/^redirect:?\s*/i, "");
      
      // Handle "List of" pages
      if (title.match(/^list\s+of\s+/i)) {
        return null; // These are not individual language pages
      }
      
      // Handle family/group pages
      if (title.match(/\s+(family|group|languages)$/i)) {
        return null; // These are language family pages, not individual languages
      }
      
      // Clean up extra whitespace
      title = title.trim().replace(/\s+/g, " ");
      
      // Validate the result
      if (title.length === 0) return null;
      if (title.length < 2) return null;
      
      // Ensure proper capitalization
      title = title.split(' ').map(word => {
        if (word.length === 0) return word;
        // Handle hyphenated words
        if (word.includes('-')) {
          return word.split('-').map(part => 
            part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
          ).join('-');
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }).join(' ');
      
      return title;
    } catch (error) {
      return null;
    }
  }

  /**
   * Detects if a language is extinct based on various indicators
   * @param {string} name - Language name
   * @param {Object} metadata - Language metadata (family, region, etc.)
   * @returns {Object} Extinction analysis result
   */
  analyzeExtinctionStatus(name, metadata = {}) {
    const extinctIndicators = [
      'ancient', 'old', 'middle', 'classical', 'extinct', 'historical', 'dead',
      'proto-', 'archaic', 'obsolete', 'medieval', 'early'
    ];
    
    const nameLower = name.toLowerCase();
    const foundIndicators = extinctIndicators.filter(indicator => 
      nameLower.includes(indicator.toLowerCase())
    );
    
    // Check for temporal patterns that suggest extinction
    const temporalPatterns = [
      /^(ancient|old|middle|classical|proto-|early)\s+/i,
      /\s+\((ancient|old|middle|classical|extinct|historical|dead)\)$/i,
      /\s+(ancient|old|middle|classical|extinct|historical|dead)$/i
    ];
    
    const hasTemporalPattern = temporalPatterns.some(pattern => pattern.test(name));
    
    // Check metadata for extinction clues
    const familyLower = (metadata.family || '').toLowerCase();
    const regionLower = (metadata.region || '').toLowerCase();
    
    // Some language families are predominantly extinct
    const extinctFamilyPatterns = [
      'ancient', 'classical', 'proto-', 'old', 'extinct', 'historical'
    ];
    
    const familyIndicatesExtinction = extinctFamilyPatterns.some(pattern => 
      familyLower.includes(pattern)
    );
    
    // Historical regions might indicate extinct languages
    const historicalRegionPatterns = [
      'ancient', 'classical', 'historical', 'medieval', 'prehistoric'
    ];
    
    const regionIndicatesExtinction = historicalRegionPatterns.some(pattern => 
      regionLower.includes(pattern)
    );
    
    const isLikelyExtinct = foundIndicators.length > 0 || 
                           hasTemporalPattern || 
                           familyIndicatesExtinction || 
                           regionIndicatesExtinction;
    
    return {
      isLikelyExtinct,
      indicators: foundIndicators,
      hasTemporalPattern,
      familyIndicatesExtinction,
      regionIndicatesExtinction,
      confidence: this.calculateExtinctionConfidence(foundIndicators, hasTemporalPattern, familyIndicatesExtinction, regionIndicatesExtinction)
    };
  }
  
  /**
   * Calculates confidence score for extinction status
   * @param {Array} indicators - Found extinction indicators
   * @param {boolean} hasTemporalPattern - Whether name has temporal pattern
   * @param {boolean} familyIndicatesExtinction - Whether family suggests extinction
   * @param {boolean} regionIndicatesExtinction - Whether region suggests extinction
   * @returns {number} Confidence score (0-1)
   */
  calculateExtinctionConfidence(indicators, hasTemporalPattern, familyIndicatesExtinction, regionIndicatesExtinction) {
    let confidence = 0;
    
    // Direct indicators in name are strongest signal
    if (indicators.length > 0) {
      confidence += 0.4 + (indicators.length * 0.1);
    }
    
    // Temporal patterns are very strong indicators
    if (hasTemporalPattern) {
      confidence += 0.3;
    }
    
    // Family and region provide supporting evidence
    if (familyIndicatesExtinction) {
      confidence += 0.2;
    }
    
    if (regionIndicatesExtinction) {
      confidence += 0.1;
    }
    
    return Math.min(confidence, 1.0);
  }
  
  /**
   * Adds appropriate extinct language indicators to a name
   * @param {string} name - Original language name
   * @param {Object} extinctionAnalysis - Result from analyzeExtinctionStatus
   * @param {Object} metadata - Language metadata
   * @returns {string} Name with appropriate extinct indicators
   */
  addExtinctLanguageIndicators(name, extinctionAnalysis, metadata = {}) {
    if (!extinctionAnalysis.isLikelyExtinct) {
      return name; // No changes needed for living languages
    }
    
    // If already has proper temporal indicators, preserve them
    if (extinctionAnalysis.hasTemporalPattern) {
      return this.normalizeExtinctLanguageFormat(name);
    }
    
    // Determine appropriate temporal indicator based on language characteristics
    const temporalIndicator = this.determineTemporalIndicator(name, metadata);
    
    // Add temporal indicator if none exists
    if (temporalIndicator) {
      return `${temporalIndicator} ${name}`;
    }
    
    return name;
  }
  
  /**
   * Determines appropriate temporal indicator for an extinct language
   * @param {string} name - Language name
   * @param {Object} metadata - Language metadata
   * @returns {string|null} Appropriate temporal indicator
   */
  determineTemporalIndicator(name, metadata = {}) {
    const nameLower = name.toLowerCase();
    const familyLower = (metadata.family || '').toLowerCase();
    
    // Language-specific patterns for temporal indicators
    if (nameLower.includes('latin') || familyLower.includes('latin')) {
      return 'Classical';
    }
    
    if (nameLower.includes('greek') && !nameLower.includes('modern')) {
      return 'Ancient';
    }
    
    if (nameLower.includes('english') || nameLower.includes('german') || nameLower.includes('french')) {
      return 'Old';
    }
    
    if (nameLower.includes('norse') || nameLower.includes('saxon')) {
      return 'Old';
    }
    
    if (familyLower.includes('germanic') && !nameLower.includes('modern')) {
      return 'Old';
    }
    
    if (familyLower.includes('romance') && !nameLower.includes('modern')) {
      return 'Old';
    }
    
    if (familyLower.includes('celtic') && !nameLower.includes('modern')) {
      return 'Old';
    }
    
    if (familyLower.includes('slavic') && !nameLower.includes('modern')) {
      return 'Old';
    }
    
    // Default temporal indicators based on general patterns
    if (familyLower.includes('proto') || nameLower.includes('proto')) {
      return null; // Proto- is already a prefix
    }
    
    // For very ancient languages or reconstructed languages
    if (familyLower.includes('ancient') || metadata.region && metadata.region.toLowerCase().includes('ancient')) {
      return 'Ancient';
    }
    
    // Default for most extinct languages
    return 'Old';
  }
  
  /**
   * Normalizes the format of extinct language names
   * @param {string} name - Language name with existing temporal indicators
   * @returns {string} Normalized name format
   */
  normalizeExtinctLanguageFormat(name) {
    // Standardize temporal indicator formatting
    const temporalPatterns = [
      { pattern: /^(ancient|old|middle|classical|proto-|early)\s+/i, replacement: (match) => match.charAt(0).toUpperCase() + match.slice(1).toLowerCase() },
      { pattern: /\s+\((ancient|old|middle|classical|extinct|historical|dead)\)$/i, replacement: (match, indicator) => ` (${indicator.charAt(0).toUpperCase() + indicator.slice(1).toLowerCase()})` },
      { pattern: /\s+(ancient|old|middle|classical|extinct|historical|dead)$/i, replacement: (match, indicator) => ` ${indicator.charAt(0).toUpperCase() + indicator.slice(1).toLowerCase()}` }
    ];
    
    let normalizedName = name;
    
    for (const { pattern, replacement } of temporalPatterns) {
      if (pattern.test(normalizedName)) {
        normalizedName = normalizedName.replace(pattern, replacement);
        break; // Only apply one pattern
      }
    }
    
    return normalizedName;
  }
  
  /**
   * Preserves extinction status in metadata
   * @param {Object} metadata - Original language metadata
   * @param {Object} extinctionAnalysis - Extinction analysis result
   * @returns {Object} Updated metadata with extinction information
   */
  preserveExtinctionStatus(metadata, extinctionAnalysis) {
    const updatedMetadata = { ...metadata };
    
    if (extinctionAnalysis.isLikelyExtinct) {
      // Add extinction status to metadata
      updatedMetadata.extinct = true;
      updatedMetadata.extinctionConfidence = extinctionAnalysis.confidence;
      updatedMetadata.extinctionIndicators = extinctionAnalysis.indicators;
      
      // Add temporal classification if available
      if (extinctionAnalysis.hasTemporalPattern) {
        updatedMetadata.temporalClassification = this.extractTemporalClassification(metadata.name || '');
      }
    }
    
    return updatedMetadata;
  }
  
  /**
   * Extracts temporal classification from language name
   * @param {string} name - Language name
   * @returns {string|null} Temporal classification
   */
  extractTemporalClassification(name) {
    const temporalPatterns = [
      { pattern: /^ancient\s+/i, classification: 'Ancient' },
      { pattern: /^old\s+/i, classification: 'Old' },
      { pattern: /^middle\s+/i, classification: 'Middle' },
      { pattern: /^classical\s+/i, classification: 'Classical' },
      { pattern: /^proto-/i, classification: 'Proto' },
      { pattern: /^early\s+/i, classification: 'Early' },
      { pattern: /\s+\(ancient\)/i, classification: 'Ancient' },
      { pattern: /\s+\(old\)/i, classification: 'Old' },
      { pattern: /\s+\(middle\)/i, classification: 'Middle' },
      { pattern: /\s+\(classical\)/i, classification: 'Classical' },
      { pattern: /\s+\(extinct\)/i, classification: 'Extinct' },
      { pattern: /\s+\(historical\)/i, classification: 'Historical' }
    ];
    
    for (const { pattern, classification } of temporalPatterns) {
      if (pattern.test(name)) {
        return classification;
      }
    }
    
    return null;
  }

  /**
   * Analyzes regional and dialectal distinctions in language names
   * @param {string} name - Language name
   * @param {Object} metadata - Language metadata
   * @returns {Object} Regional analysis result
   */
  analyzeRegionalDistinctions(name, metadata = {}) {
    const regionalPatterns = [
      // Geographic regions
      { pattern: /\b(Northern|Southern|Eastern|Western|Central)\s+/i, type: 'geographic' },
      { pattern: /\b(North|South|East|West)\s+/i, type: 'geographic' },
      { pattern: /\b(Upper|Lower)\s+/i, type: 'geographic' },
      { pattern: /\b(Highland|Lowland)\s+/i, type: 'geographic' },
      { pattern: /\b(Coastal|Inland|Mountain|Valley)\s+/i, type: 'geographic' },
      
      // Country/region-specific variants
      { pattern: /\b(American|British|Canadian|Australian|New Zealand)\s+/i, type: 'national' },
      { pattern: /\b(Mexican|Argentinian|Brazilian|Peruvian|Chilean)\s+/i, type: 'national' },
      { pattern: /\b(Swiss|Austrian|Belgian|Luxembourgish)\s+/i, type: 'national' },
      { pattern: /\b(Simplified|Traditional)\s+/i, type: 'script' },
      
      // Regional suffixes
      { pattern: /\s+\((Northern|Southern|Eastern|Western|Central)\)$/i, type: 'geographic' },
      { pattern: /\s+\((American|British|Canadian|Australian)\)$/i, type: 'national' },
      { pattern: /\s+\((Simplified|Traditional)\)$/i, type: 'script' },
      
      // Dialectal indicators
      { pattern: /\b(Dialect|Variety|Vernacular)\b/i, type: 'dialectal' },
      { pattern: /\s+\(dialect\)$/i, type: 'dialectal' },
      { pattern: /\s+\(variety\)$/i, type: 'dialectal' },
      
      // Historical regional variants
      { pattern: /\b(Bavarian|Swabian|Alemannic|Saxon|Franconian)\s+/i, type: 'historical_regional' },
      { pattern: /\b(Castilian|Andalusian|Catalan|Galician|Basque)\s+/i, type: 'historical_regional' },
      { pattern: /\b(Tuscan|Venetian|Neapolitan|Sicilian|Lombard)\s+/i, type: 'historical_regional' },
      { pattern: /\b(Ulster|Munster|Connacht|Leinster)\s+/i, type: 'historical_regional' },
      
      // Linguistic variants
      { pattern: /\b(Formal|Informal|Literary|Colloquial|Standard)\s+/i, type: 'register' },
      { pattern: /\b(Classical|Modern|Contemporary|Archaic)\s+/i, type: 'temporal' }
    ];
    
    const foundDistinctions = [];
    const nameLower = name.toLowerCase();
    
    for (const { pattern, type } of regionalPatterns) {
      const match = pattern.exec(name);
      if (match) {
        foundDistinctions.push({
          type,
          indicator: match[1] || match[0],
          position: match.index,
          fullMatch: match[0]
        });
      }
    }
    
    // Check metadata for regional information
    const regionMetadata = this.extractRegionalInfoFromMetadata(metadata);
    
    return {
      hasRegionalDistinctions: foundDistinctions.length > 0,
      distinctions: foundDistinctions,
      regionMetadata,
      preservationPriority: this.calculatePreservationPriority(foundDistinctions, regionMetadata)
    };
  }
  
  /**
   * Extracts regional information from language metadata
   * @param {Object} metadata - Language metadata
   * @returns {Object} Regional metadata information
   */
  extractRegionalInfoFromMetadata(metadata) {
    const region = metadata.region || '';
    const category = metadata.category || '';
    const family = metadata.family || '';
    
    const regionalInfo = {
      hasRegionalInfo: false,
      regionType: null,
      specificRegion: null,
      countryCode: null
    };
    
    // Extract country codes from region
    const countryPatterns = [
      { pattern: /\b(US|USA|United States)\b/i, code: 'US' },
      { pattern: /\b(UK|Britain|British|England)\b/i, code: 'GB' },
      { pattern: /\b(Canada|Canadian)\b/i, code: 'CA' },
      { pattern: /\b(Australia|Australian)\b/i, code: 'AU' },
      { pattern: /\b(Germany|German)\b/i, code: 'DE' },
      { pattern: /\b(France|French)\b/i, code: 'FR' },
      { pattern: /\b(Spain|Spanish)\b/i, code: 'ES' },
      { pattern: /\b(Italy|Italian)\b/i, code: 'IT' },
      { pattern: /\b(Switzerland|Swiss)\b/i, code: 'CH' },
      { pattern: /\b(Austria|Austrian)\b/i, code: 'AT' },
      { pattern: /\b(Belgium|Belgian)\b/i, code: 'BE' },
      { pattern: /\b(Netherlands|Dutch)\b/i, code: 'NL' },
      { pattern: /\b(Mexico|Mexican)\b/i, code: 'MX' },
      { pattern: /\b(Brazil|Brazilian)\b/i, code: 'BR' },
      { pattern: /\b(Argentina|Argentinian)\b/i, code: 'AR' },
      { pattern: /\b(China|Chinese)\b/i, code: 'CN' },
      { pattern: /\b(Taiwan|Taiwanese)\b/i, code: 'TW' },
      { pattern: /\b(Japan|Japanese)\b/i, code: 'JP' },
      { pattern: /\b(Korea|Korean)\b/i, code: 'KR' }
    ];
    
    for (const { pattern, code } of countryPatterns) {
      if (pattern.test(region) || pattern.test(category)) {
        regionalInfo.hasRegionalInfo = true;
        regionalInfo.countryCode = code;
        break;
      }
    }
    
    // Extract region types
    if (region.toLowerCase().includes('europe')) {
      regionalInfo.regionType = 'European';
    } else if (region.toLowerCase().includes('america')) {
      regionalInfo.regionType = 'American';
    } else if (region.toLowerCase().includes('asia')) {
      regionalInfo.regionType = 'Asian';
    } else if (region.toLowerCase().includes('africa')) {
      regionalInfo.regionType = 'African';
    } else if (region.toLowerCase().includes('oceania')) {
      regionalInfo.regionType = 'Oceanic';
    }
    
    return regionalInfo;
  }
  
  /**
   * Calculates priority for preserving regional distinctions
   * @param {Array} distinctions - Found regional distinctions
   * @param {Object} regionMetadata - Regional metadata
   * @returns {number} Priority score (0-10)
   */
  calculatePreservationPriority(distinctions, regionMetadata) {
    let priority = 0;
    
    // Higher priority for specific regional variants
    for (const distinction of distinctions) {
      switch (distinction.type) {
        case 'national':
          priority += 3; // High priority for national variants
          break;
        case 'geographic':
          priority += 2; // Medium-high priority for geographic variants
          break;
        case 'historical_regional':
          priority += 2; // Medium-high priority for historical regions
          break;
        case 'script':
          priority += 3; // High priority for script variants
          break;
        case 'dialectal':
          priority += 1; // Medium priority for dialectal markers
          break;
        case 'register':
          priority += 1; // Medium priority for register variants
          break;
        case 'temporal':
          priority += 1; // Medium priority for temporal variants
          break;
      }
    }
    
    // Boost priority if metadata supports regional distinction
    if (regionMetadata.hasRegionalInfo) {
      priority += 1;
    }
    
    if (regionMetadata.countryCode) {
      priority += 1;
    }
    
    return Math.min(priority, 10);
  }
  
  /**
   * Preserves regional and dialectal distinctions in language names
   * @param {string} originalName - Original language name
   * @param {string} resolvedName - Resolved base language name
   * @param {Object} metadata - Language metadata
   * @returns {string} Name with preserved regional distinctions
   */
  preserveRegionalDistinctions(originalName, resolvedName, metadata = {}) {
    const originalAnalysis = this.analyzeRegionalDistinctions(originalName, metadata);
    const resolvedAnalysis = this.analyzeRegionalDistinctions(resolvedName, metadata);
    
    // If original has regional distinctions but resolved doesn't, preserve them
    if (originalAnalysis.hasRegionalDistinctions && !resolvedAnalysis.hasRegionalDistinctions) {
      return this.transferRegionalDistinctions(originalName, resolvedName, originalAnalysis);
    }
    
    // If both have regional distinctions, prefer the more specific one
    if (originalAnalysis.hasRegionalDistinctions && resolvedAnalysis.hasRegionalDistinctions) {
      if (originalAnalysis.preservationPriority > resolvedAnalysis.preservationPriority) {
        return this.transferRegionalDistinctions(originalName, resolvedName, originalAnalysis);
      }
    }
    
    // If resolved name already has appropriate regional distinctions, use it
    return resolvedName;
  }
  
  /**
   * Transfers regional distinctions from original to resolved name
   * @param {string} originalName - Original name with regional distinctions
   * @param {string} resolvedName - Resolved base name
   * @param {Object} originalAnalysis - Analysis of original name
   * @returns {string} Resolved name with transferred regional distinctions
   */
  transferRegionalDistinctions(originalName, resolvedName, originalAnalysis) {
    let enhancedName = resolvedName;
    
    // Sort distinctions by position to maintain order
    const sortedDistinctions = originalAnalysis.distinctions.sort((a, b) => a.position - b.position);
    
    for (const distinction of sortedDistinctions) {
      switch (distinction.type) {
        case 'national':
        case 'geographic':
        case 'historical_regional':
          // Add as prefix if it was a prefix in original
          if (distinction.position === 0 || distinction.position < originalName.length / 2) {
            enhancedName = `${distinction.indicator} ${enhancedName}`;
          } else {
            // Add as suffix if it was a suffix in original
            enhancedName = `${enhancedName} (${distinction.indicator})`;
          }
          break;
          
        case 'script':
          // Script variants usually go as prefix
          enhancedName = `${distinction.indicator} ${enhancedName}`;
          break;
          
        case 'dialectal':
          // Dialectal markers usually go as suffix
          enhancedName = `${enhancedName} ${distinction.indicator}`;
          break;
          
        case 'register':
        case 'temporal':
          // Register and temporal markers can go as prefix
          enhancedName = `${distinction.indicator} ${enhancedName}`;
          break;
      }
    }
    
    return enhancedName;
  }
  
  /**
   * Validates that regional distinctions are properly preserved
   * @param {string} originalName - Original language name
   * @param {string} updatedName - Updated language name
   * @param {Object} metadata - Language metadata
   * @returns {Object} Validation result
   */
  validateRegionalPreservation(originalName, updatedName, metadata = {}) {
    const originalAnalysis = this.analyzeRegionalDistinctions(originalName, metadata);
    const updatedAnalysis = this.analyzeRegionalDistinctions(updatedName, metadata);
    
    const issues = [];
    const suggestions = [];
    
    // Check if important regional distinctions were lost
    if (originalAnalysis.hasRegionalDistinctions && !updatedAnalysis.hasRegionalDistinctions) {
      if (originalAnalysis.preservationPriority >= 3) {
        issues.push("Important regional distinctions were lost in the update");
        suggestions.push(`Consider preserving regional indicators from: ${originalName}`);
      }
    }
    
    // Check if regional distinctions are consistent
    if (originalAnalysis.hasRegionalDistinctions && updatedAnalysis.hasRegionalDistinctions) {
      const originalTypes = new Set(originalAnalysis.distinctions.map(d => d.type));
      const updatedTypes = new Set(updatedAnalysis.distinctions.map(d => d.type));
      
      // Check for conflicting regional information
      if (originalTypes.has('national') && updatedTypes.has('national')) {
        const originalNational = originalAnalysis.distinctions.find(d => d.type === 'national');
        const updatedNational = updatedAnalysis.distinctions.find(d => d.type === 'national');
        
        if (originalNational.indicator !== updatedNational.indicator) {
          issues.push("Conflicting national variants detected");
          suggestions.push(`Choose between '${originalNational.indicator}' and '${updatedNational.indicator}'`);
        }
      }
    }
    
    return {
      isValid: issues.length === 0,
      issues,
      suggestions,
      preservationScore: updatedAnalysis.preservationPriority
    };
  }

  /**
   * Validates name consistency with linguistic conventions
   * @param {string} name - Proposed language name
   * @param {string} family - Language family
   * @param {string} region - Geographic region
   * @returns {Object} Validation result with suggestions
   */
  validateNameConsistency(name, family, region) {
    const issues = [];
    const suggestions = [];

    if (!name) {
      issues.push("Name is empty");
      return { isValid: false, issues, suggestions };
    }

    // Enhanced capitalization rules
    const words = name.split(/\s+/);
    const properlyCapitalized = words.every(word => {
      if (word.length === 0) return true;
      
      // Handle special cases for linguistic terms
      const lowerCaseExceptions = ['of', 'the', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'with'];
      const isException = lowerCaseExceptions.includes(word.toLowerCase()) && words.indexOf(word) > 0;
      
      if (isException) {
        return /^[a-z]+$/.test(word);
      }
      
      // Handle hyphenated words (e.g., "Austro-Bavarian")
      if (word.includes('-')) {
        const parts = word.split('-');
        return parts.every(part => /^[A-Z][a-z]*$/.test(part));
      }
      
      // Handle parenthetical information (e.g., "Ancient (Classical)")
      if (word.includes('(') || word.includes(')')) {
        const cleanWord = word.replace(/[()]/g, '');
        return /^[A-Z][a-z]*$/.test(cleanWord);
      }
      
      // Standard title case: first letter uppercase, rest lowercase
      return /^[A-Z][a-z]*$/.test(word);
    });

    if (!properlyCapitalized) {
      issues.push("Name capitalization doesn't follow standard conventions");
      suggestions.push("Use proper title case (e.g., 'Old English' not 'old english')");
    }

    // Handle extinct language indicators using comprehensive analysis
    const extinctionAnalysis = this.analyzeExtinctionStatus(name, { family, region });
    
    // Validate extinct language formatting
    if (extinctionAnalysis.isLikelyExtinct) {
      // Extinct languages should have proper temporal indicators
      const validExtinctPatterns = [
        /^(Ancient|Old|Middle|Classical|Proto-|Early)\s+/,
        /\s+\((Ancient|Old|Middle|Classical|Extinct|Historical)\)$/,
        /^(Proto-)/
      ];
      
      const hasValidExtinctPattern = validExtinctPatterns.some(pattern => pattern.test(name));
      
      if (!hasValidExtinctPattern && extinctionAnalysis.confidence > 0.5) {
        issues.push("Extinct language should have proper temporal indicator");
        suggestions.push("Add temporal indicator like 'Ancient', 'Old', 'Middle', or 'Classical'");
        suggestions.push(`Consider: ${this.addExtinctLanguageIndicators(name, extinctionAnalysis, { family, region })}`);
      }
      
      // Validate that extinct indicator is properly formatted
      if (hasValidExtinctPattern) {
        const normalizedName = this.normalizeExtinctLanguageFormat(name);
        if (normalizedName !== name) {
          suggestions.push(`Consider normalizing format to: ${normalizedName}`);
        }
      }
    }

    // Enhanced language family consistency checks
    if (family) {
      const familyLower = family.toLowerCase();
      const nameLower = name.toLowerCase();
      
      // Romance language family patterns
      if (familyLower.includes('romance') || familyLower.includes('italic')) {
        const romanLanguages = ['spanish', 'french', 'italian', 'portuguese', 'romanian', 'catalan', 'galician', 'sardinian', 'corsican', 'occitan', 'latin'];
        const isRomanLanguage = romanLanguages.some(lang => nameLower.includes(lang));
        
        if (!isRomanLanguage && !extinctionAnalysis.isLikelyExtinct) {
          // This might be a lesser-known Romance language, which is acceptable
          // Only flag if it seems completely unrelated
          if (!nameLower.match(/(latin|roman|italic)/)) {
            // Don't flag as error, just note for review
          }
        }
      }
      
      // Germanic language family patterns
      if (familyLower.includes('germanic')) {
        const germanicLanguages = ['english', 'german', 'dutch', 'swedish', 'norwegian', 'danish', 'icelandic', 'gothic', 'frisian', 'yiddish', 'afrikaans'];
        const isGermanicLanguage = germanicLanguages.some(lang => nameLower.includes(lang));
        
        // Check for proper Germanic naming conventions
        if (isGermanicLanguage && extinctionAnalysis.isLikelyExtinct) {
          // Validate historical Germanic language naming
          if (nameLower.includes('old') && !nameLower.match(/(old\s+(english|norse|high\s+german|saxon|frisian))/)) {
            suggestions.push("Consider using standard historical Germanic language names");
          }
        }
      }
      
      // Celtic language family patterns
      if (familyLower.includes('celtic')) {
        const celticLanguages = ['irish', 'scottish', 'welsh', 'breton', 'cornish', 'manx', 'gaelic', 'gaulish'];
        const isCelticLanguage = celticLanguages.some(lang => nameLower.includes(lang));
        
        if (isCelticLanguage && nameLower.includes('gaelic')) {
          // Ensure proper Gaelic distinction
          if (!nameLower.match(/(irish|scottish)\s+gaelic/)) {
            suggestions.push("Specify 'Irish Gaelic' or 'Scottish Gaelic' for clarity");
          }
        }
      }
      
      // Slavic language family patterns
      if (familyLower.includes('slavic') || familyLower.includes('slav')) {
        const slavicLanguages = ['russian', 'polish', 'czech', 'slovak', 'ukrainian', 'belarusian', 'bulgarian', 'serbian', 'croatian', 'slovenian', 'macedonian', 'bosnian'];
        const isSlavicLanguage = slavicLanguages.some(lang => nameLower.includes(lang));
        
        if (isSlavicLanguage && extinctionAnalysis.isLikelyExtinct) {
          // Validate historical Slavic language naming
          if (nameLower.includes('old') && !nameLower.match(/(old\s+(church\s+)?slavonic?)/)) {
            suggestions.push("Consider 'Old Church Slavonic' for historical Slavic languages");
          }
        }
      }
      
      // Sino-Tibetan language family patterns
      if (familyLower.includes('sino') || familyLower.includes('tibetan') || familyLower.includes('chinese')) {
        const sinoTibetanLanguages = ['chinese', 'mandarin', 'cantonese', 'tibetan', 'burmese', 'thai'];
        const isSinoTibetanLanguage = sinoTibetanLanguages.some(lang => nameLower.includes(lang));
        
        if (nameLower.includes('chinese') && !nameLower.match(/(mandarin|cantonese|wu|min|hakka|simplified|traditional)/)) {
          suggestions.push("Consider specifying Chinese variant (e.g., 'Mandarin Chinese', 'Cantonese')");
        }
      }
    }

    // Regional consistency checks
    if (region) {
      const regionLower = region.toLowerCase();
      const nameLower = name.toLowerCase();
      
      // European languages should follow European naming conventions
      if (regionLower.includes('europe')) {
        // Check for proper European language naming
        if (nameLower.includes('american') && !nameLower.includes('native')) {
          issues.push("European language should not have 'American' designation");
          suggestions.push("Use the base language name or specify regional variant properly");
        }
      }
      
      // American languages should be properly distinguished
      if (regionLower.includes('america')) {
        if (nameLower.includes('english') && !nameLower.includes('american')) {
          suggestions.push("Consider 'American English' for American English variant");
        }
      }
    }

    // Check for common formatting issues
    if (name.includes('  ')) {
      issues.push("Name contains multiple consecutive spaces");
      suggestions.push("Remove extra spaces");
    }
    
    if (name.startsWith(' ') || name.endsWith(' ')) {
      issues.push("Name has leading or trailing spaces");
      suggestions.push("Trim whitespace from name");
    }
    
    // Check for invalid characters
    if (!/^[A-Za-z\s\-()]+$/.test(name)) {
      issues.push("Name contains invalid characters");
      suggestions.push("Use only letters, spaces, hyphens, and parentheses");
    }

    return {
      isValid: issues.length === 0,
      issues,
      suggestions
    };
  }
}

/**
 * Manages reading, updating, and validating configuration files
 */
class ConfigurationFileManager {
  constructor() {
    this.languageMixesPath = path.join(root, "config", "language-mixes.json");
    this.languageMixerMapPath = path.join(root, "config", "language-mixer-map.json");
  }

  /**
   * Loads and parses language-mixes.json
   * @returns {Array} Language mixes configuration
   */
  loadLanguageMixes() {
    try {
      const content = fs.readFileSync(this.languageMixesPath, "utf8");
      // Handle BOM if present
      const cleanContent = content.codePointAt(0) === 0xfeff ? content.slice(1) : content;
      return JSON.parse(cleanContent);
    } catch (error) {
      throw new Error(`Failed to load language-mixes.json: ${error.message}`);
    }
  }

  /**
   * Loads and parses language-mixer-map.json
   * @returns {Array} Language mixer map configuration
   */
  loadLanguageMixerMap() {
    try {
      const content = fs.readFileSync(this.languageMixerMapPath, "utf8");
      // Handle BOM if present
      const cleanContent = content.codePointAt(0) === 0xfeff ? content.slice(1) : content;
      return JSON.parse(cleanContent);
    } catch (error) {
      throw new Error(`Failed to load language-mixer-map.json: ${error.message}`);
    }
  }

  /**
   * Creates timestamped backup of a file
   * @param {string} filename - File to backup
   * @returns {string} Backup file path
   */
  createBackup(filename) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupPath = `${filename}.backup-${timestamp}`;
    
    try {
      fs.copyFileSync(filename, backupPath);
      console.log(`Created backup: ${path.relative(root, backupPath)}`);
      return backupPath;
    } catch (error) {
      throw new Error(`Failed to create backup of ${filename}: ${error.message}`);
    }
  }

  /**
   * Restores a file from its backup
   * @param {string} backupPath - Path to backup file
   * @param {string} originalPath - Path to restore to (optional, defaults to removing .backup-* suffix)
   * @returns {boolean} Success status
   */
  rollbackFromBackup(backupPath, originalPath = null) {
    try {
      // If no original path specified, derive it from backup path
      if (!originalPath) {
        originalPath = backupPath.replace(/\.backup-[^.]+$/, '');
      }
      
      // Verify backup file exists
      if (!fs.existsSync(backupPath)) {
        throw new Error(`Backup file not found: ${backupPath}`);
      }
      
      // Restore from backup
      fs.copyFileSync(backupPath, originalPath);
      console.log(`Restored from backup: ${path.relative(root, backupPath)} → ${path.relative(root, originalPath)}`);
      
      return true;
    } catch (error) {
      console.error(`Failed to rollback from backup: ${error.message}`);
      return false;
    }
  }

  /**
   * Updates language-mixes.json with new names while preserving structure
   * @param {Array} updates - Array of update objects
   * @param {boolean} createBackup - Whether to create backup first
   */
  updateLanguageMixes(updates, createBackup = true) {
    if (createBackup) {
      this.createBackup(this.languageMixesPath);
    }

    const languageMixes = this.loadLanguageMixes();
    let changeCount = 0;

    // Apply updates while preserving all other metadata
    for (const update of updates) {
      const entry = languageMixes.find(lang => lang.iso === update.iso);
      if (entry && entry.name !== update.newName) {
        entry.name = update.newName;
        changeCount++;
      }
    }

    if (changeCount > 0) {
      this.writeJson(this.languageMixesPath, languageMixes);
      console.log(`Updated ${changeCount} language names in language-mixes.json`);
    } else {
      console.log("No changes needed for language-mixes.json");
    }
  }

  /**
   * Validates that all base index references remain intact
   * @returns {Object} Validation result
   */
  validateIntegrity() {
    try {
      const languageMixes = this.loadLanguageMixes();
      const languageMixerMap = this.loadLanguageMixerMap();
      
      const issues = [];
      
      // Check that all ISOs in mixer map exist in language mixes
      const mixesIsos = new Set(languageMixes.map(lang => lang.iso));
      const mapIsos = new Set(languageMixerMap.map(entry => entry.iso));
      
      for (const iso of mapIsos) {
        if (!mixesIsos.has(iso)) {
          issues.push(`ISO ${iso} exists in mixer map but not in language mixes`);
        }
      }
      
      // Check JSON structure validity
      if (!Array.isArray(languageMixes)) {
        issues.push("language-mixes.json is not a valid array");
      }
      
      if (!Array.isArray(languageMixerMap)) {
        issues.push("language-mixer-map.json is not a valid array");
      }
      
      return {
        isValid: issues.length === 0,
        issues
      };
    } catch (error) {
      return {
        isValid: false,
        issues: [`Integrity validation failed: ${error.message}`]
      };
    }
  }

  /**
   * Writes JSON data to file with proper formatting
   * @param {string} filePath - Target file path
   * @param {*} data - Data to write
   */
  writeJson(filePath, data) {
    const content = JSON.stringify(data, null, 2) + "\n";
    fs.writeFileSync(filePath, content, "utf8");
  }
}

/**
 * Generates comprehensive reports of all changes made
 */
class UpdateReportGenerator {
  constructor() {
    this.reportsDir = path.join(root, "tools", "mixer-core", "reports");
    this.ensureReportsDirectory();
  }

  /**
   * Ensures reports directory exists
   */
  ensureReportsDirectory() {
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  /**
   * Generates detailed before/after report
   * @param {Array} updates - Array of update objects
   * @returns {Object} Change report
   */
  generateChangeReport(updates) {
    const report = {
      timestamp: new Date().toISOString(),
      totalChanges: updates.length,
      changes: updates.map(update => ({
        iso: update.iso,
        oldName: update.oldName,
        newName: update.newName,
        confidence: update.confidence,
        source: update.source,
        justification: update.justification
      }))
    };

    return report;
  }

  /**
   * Generates summary statistics by family/region
   * @param {Array} updates - Array of update objects
   * @returns {Object} Statistics summary
   */
  generateStatistics(updates) {
    const stats = {
      totalUpdates: updates.length,
      byFamily: {},
      byRegion: {},
      bySource: {},
      byConfidence: {
        high: 0,    // confidence >= 0.8
        medium: 0,  // confidence >= 0.5
        low: 0      // confidence < 0.5
      }
    };

    for (const update of updates) {
      // Count by family
      const family = update.family || "Unknown";
      stats.byFamily[family] = (stats.byFamily[family] || 0) + 1;

      // Count by region
      const region = update.region || "Unknown";
      stats.byRegion[region] = (stats.byRegion[region] || 0) + 1;

      // Count by source
      const source = update.source || "Unknown";
      stats.bySource[source] = (stats.bySource[source] || 0) + 1;

      // Count by confidence level
      const confidence = update.confidence || 0;
      if (confidence >= 0.8) {
        stats.byConfidence.high++;
      } else if (confidence >= 0.5) {
        stats.byConfidence.medium++;
      } else {
        stats.byConfidence.low++;
      }
    }

    return stats;
  }

  /**
   * Reports any ambiguities or conflicts found
   * @param {Array} conflicts - Array of conflict objects
   * @returns {Object} Conflict report
   */
  generateConflictReport(conflicts) {
    return {
      timestamp: new Date().toISOString(),
      totalConflicts: conflicts.length,
      conflicts: conflicts.map(conflict => ({
        iso: conflict.iso,
        issue: conflict.issue,
        possibleResolutions: conflict.possibleResolutions || [],
        requiresManualReview: conflict.requiresManualReview || false
      }))
    };
  }

  /**
   * Exports report in specified format
   * @param {Object} report - Report data
   * @param {string} format - Output format: json, csv, markdown
   * @param {string} filename - Output filename (without extension)
   * @returns {string} Path to exported file
   */
  exportReport(report, format = "markdown", filename = "language-normalization-report") {
    const timestamp = new Date().toISOString().slice(0, 10);
    const fullFilename = `${filename}-${timestamp}`;
    
    let content;
    let extension;
    
    switch (format.toLowerCase()) {
      case "json":
        content = JSON.stringify(report, null, 2);
        extension = "json";
        break;
        
      case "csv":
        content = this.generateCSV(report);
        extension = "csv";
        break;
        
      case "markdown":
      default:
        content = this.generateMarkdown(report);
        extension = "md";
        break;
    }
    
    const outputPath = path.join(this.reportsDir, `${fullFilename}.${extension}`);
    fs.writeFileSync(outputPath, content, "utf8");
    
    console.log(`Report exported to: ${path.relative(root, outputPath)}`);
    return outputPath;
  }

  /**
   * Generates CSV format report
   * @param {Object} report - Report data
   * @returns {string} CSV content
   */
  generateCSV(report) {
    if (!report.changes || !Array.isArray(report.changes)) {
      return "No changes to report\n";
    }

    const headers = ["ISO", "Old Name", "New Name", "Confidence", "Source", "Justification"];
    const rows = [headers.join(",")];
    
    for (const change of report.changes) {
      const row = [
        change.iso || "",
        `"${(change.oldName || "").replace(/"/g, '""')}"`,
        `"${(change.newName || "").replace(/"/g, '""')}"`,
        change.confidence || "",
        change.source || "",
        `"${(change.justification || "").replace(/"/g, '""')}"`
      ];
      rows.push(row.join(","));
    }
    
    return rows.join("\n") + "\n";
  }

  /**
   * Generates Markdown format report
   * @param {Object} report - Report data
   * @returns {string} Markdown content
   */
  generateMarkdown(report) {
    const lines = [];
    
    lines.push("# Language Name Normalization Report");
    lines.push("");
    lines.push(`**Generated:** ${report.timestamp}`);
    lines.push(`**Total Changes:** ${report.totalChanges || 0}`);
    lines.push("");
    
    if (report.changes && report.changes.length > 0) {
      lines.push("## Changes Made");
      lines.push("");
      lines.push("| ISO | Old Name | New Name | Confidence | Source | Justification |");
      lines.push("|-----|----------|----------|------------|--------|---------------|");
      
      for (const change of report.changes) {
        const row = [
          change.iso || "",
          change.oldName || "",
          change.newName || "",
          change.confidence || "",
          change.source || "",
          change.justification || ""
        ].map(cell => cell.toString().replace(/\|/g, "\\|"));
        
        lines.push(`| ${row.join(" | ")} |`);
      }
      lines.push("");
    }
    
    if (report.statistics) {
      lines.push("## Statistics");
      lines.push("");
      lines.push(`- **Total Updates:** ${report.statistics.totalUpdates}`);
      
      if (report.statistics.byConfidence) {
        lines.push("- **By Confidence:**");
        lines.push(`  - High (≥80%): ${report.statistics.byConfidence.high}`);
        lines.push(`  - Medium (≥50%): ${report.statistics.byConfidence.medium}`);
        lines.push(`  - Low (<50%): ${report.statistics.byConfidence.low}`);
      }
      lines.push("");
    }
    
    return lines.join("\n");
  }
}

/**
 * Main CLI interface
 */
function parseArguments() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: false,
    backup: true,
    reportFormat: "markdown",
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case "--dry-run":
        options.dryRun = true;
        break;
      case "--no-backup":
        options.backup = false;
        break;
      case "--report-format":
        if (i + 1 < args.length) {
          options.reportFormat = args[++i];
        }
        break;
      case "--help":
        options.help = true;
        break;
      default:
        console.warn(`Unknown option: ${arg}`);
    }
  }

  return options;
}

function showHelp() {
  console.log(`
Language Name Normalization Tool

Usage: node tools/mixer-core/normalize-language-names.js [options]

Options:
  --dry-run          Show what would be changed without making modifications
  --no-backup        Skip creating backup files (not recommended)
  --report-format    Output format for reports: json, csv, markdown (default: markdown)
  --help             Show this help message

Examples:
  node tools/mixer-core/normalize-language-names.js --dry-run
  node tools/mixer-core/normalize-language-names.js --report-format json
  node tools/mixer-core/normalize-language-names.js --no-backup
`);
}

/**
 * Main execution function
 */
async function main() {
  const options = parseArguments();

  if (options.help) {
    showHelp();
    return;
  }

  console.log("Language Name Normalization Tool");
  console.log("=================================");
  
  if (options.dryRun) {
    console.log("🔍 Running in dry-run mode - no changes will be made");
  }
  
  console.log("");

  try {
    // Initialize components
    const analyzer = new LanguageNameAnalyzer();
    const resolver = new LanguageNameResolver();
    const configManager = new ConfigurationFileManager();
    const reportGenerator = new UpdateReportGenerator();

    // Load configuration files
    console.log("📁 Loading configuration files...");
    const languageMixes = configManager.loadLanguageMixes();
    const languageMixerMap = configManager.loadLanguageMixerMap();
    console.log(`   Loaded ${languageMixes.length} language entries`);

    // Analyze entries for issues
    console.log("🔍 Analyzing language entries...");
    const incompleteEntries = analyzer.identifyIncompleteNames(languageMixes);
    console.log(`   Found ${incompleteEntries.length} entries needing attention`);

    if (incompleteEntries.length === 0) {
      console.log("✅ All language names appear to be properly formatted!");
      return;
    }

    // Analyze usage frequency patterns
    console.log("📊 Analyzing usage frequency patterns...");
    const usageStats = analyzer.analyzeUsageFrequency(languageMixes, languageMixerMap);
    const totalUsageEntries = Object.keys(usageStats).length;
    const highUsageCount = Object.values(usageStats).filter(usage => usage >= 10).length;
    console.log(`   Analyzed usage for ${totalUsageEntries} languages`);
    console.log(`   Found ${highUsageCount} high-usage languages (≥10 usage points)`);

    // Prioritize by usage frequency
    const prioritizedEntries = analyzer.prioritizeByUsage(incompleteEntries, usageStats);

    // Generate proposed updates (placeholder - would implement actual resolution logic)
    const proposedUpdates = [];
    const conflicts = [];

    for (const item of prioritizedEntries.slice(0, 10)) { // Limit to top 10 for demo
      const entry = item.entry;
      const analysis = item.analysis;
      
      // Try to resolve proper name
      let resolvedName = resolver.resolveFromISO(entry.iso);
      
      if (!resolvedName && entry.wikipedia) {
        resolvedName = resolver.resolveFromWikipedia(entry.wikipedia);
      }
      
      if (resolvedName && resolvedName !== entry.name) {
        // Preserve regional and dialectal distinctions
        const nameWithRegionalDistinctions = resolver.preserveRegionalDistinctions(
          entry.name, 
          resolvedName, 
          {
            family: entry.family,
            region: entry.region,
            category: entry.category
          }
        );
        
        // Use the name with preserved regional distinctions
        resolvedName = nameWithRegionalDistinctions;
        
        // Analyze extinction status and add appropriate indicators
        const extinctionAnalysis = resolver.analyzeExtinctionStatus(resolvedName, {
          family: entry.family,
          region: entry.region,
          category: entry.category
        });
        
        // Add extinct language indicators if needed
        if (extinctionAnalysis.isLikelyExtinct && extinctionAnalysis.confidence > 0.5) {
          resolvedName = resolver.addExtinctLanguageIndicators(resolvedName, extinctionAnalysis, {
            family: entry.family,
            region: entry.region,
            category: entry.category
          });
        }
        
        // Validate regional preservation
        const regionalValidation = resolver.validateRegionalPreservation(entry.name, resolvedName, {
          family: entry.family,
          region: entry.region,
          category: entry.category
        });
        
        const validation = resolver.validateNameConsistency(resolvedName, entry.family, entry.region);
        
        if (validation.isValid && regionalValidation.isValid) {
          proposedUpdates.push({
            iso: entry.iso,
            oldName: entry.name,
            newName: resolvedName,
            confidence: extinctionAnalysis.isLikelyExtinct ? Math.min(0.8, 0.8 * extinctionAnalysis.confidence) : 0.8,
            source: entry.wikipedia ? "Wikipedia" : "ISO",
            justification: extinctionAnalysis.isLikelyExtinct ? 
              `Resolved from ${entry.wikipedia ? 'Wikipedia' : 'ISO code'} ${entry.iso} with extinct language indicators and preserved regional distinctions` :
              `Resolved from ${entry.wikipedia ? 'Wikipedia' : 'ISO code'} ${entry.iso} with preserved regional distinctions`,
            family: entry.family,
            region: entry.region,
            extinctionStatus: extinctionAnalysis.isLikelyExtinct ? {
              extinct: true,
              confidence: extinctionAnalysis.confidence,
              indicators: extinctionAnalysis.indicators,
              temporalClassification: resolver.extractTemporalClassification(resolvedName)
            } : null,
            regionalPreservation: {
              preservationScore: regionalValidation.preservationScore,
              hadRegionalDistinctions: resolver.analyzeRegionalDistinctions(entry.name).hasRegionalDistinctions,
              preservedDistinctions: resolver.analyzeRegionalDistinctions(resolvedName).distinctions
            }
          });
        } else {
          const allIssues = [...validation.issues, ...regionalValidation.issues];
          const allSuggestions = [...validation.suggestions, ...regionalValidation.suggestions];
          
          conflicts.push({
            iso: entry.iso,
            issue: `Validation failed for resolved name: ${allIssues.join(", ")}`,
            possibleResolutions: allSuggestions,
            requiresManualReview: true
          });
        }
      } else {
        conflicts.push({
          iso: entry.iso,
          issue: `Could not resolve proper name for ${entry.name}`,
          possibleResolutions: analysis.suggestions,
          requiresManualReview: true
        });
      }
    }

    // Display results
    console.log(`\n📊 Analysis Results:`);
    console.log(`   Proposed updates: ${proposedUpdates.length}`);
    console.log(`   Conflicts requiring review: ${conflicts.length}`);

    if (proposedUpdates.length > 0) {
      console.log("\n🔄 Proposed Updates:");
      for (const update of proposedUpdates) {
        console.log(`   ${update.iso}: "${update.oldName}" → "${update.newName}"`);
      }
    }

    if (conflicts.length > 0) {
      console.log("\n⚠️  Conflicts Requiring Manual Review:");
      for (const conflict of conflicts) {
        console.log(`   ${conflict.iso}: ${conflict.issue}`);
      }
    }

    // Apply updates if not in dry-run mode
    if (!options.dryRun && proposedUpdates.length > 0) {
      console.log("\n💾 Applying updates...");
      configManager.updateLanguageMixes(proposedUpdates, options.backup);
      
      // Validate integrity after changes
      const integrity = configManager.validateIntegrity();
      if (!integrity.isValid) {
        console.error("❌ Integrity validation failed:");
        for (const issue of integrity.issues) {
          console.error(`   ${issue}`);
        }
        process.exitCode = 1;
        return;
      }
      
      console.log("✅ Updates applied successfully");
    }

    // Generate reports
    console.log("\n📄 Generating reports...");
    const changeReport = reportGenerator.generateChangeReport(proposedUpdates);
    const statistics = reportGenerator.generateStatistics(proposedUpdates);
    const conflictReport = reportGenerator.generateConflictReport(conflicts);

    const fullReport = {
      ...changeReport,
      statistics,
      conflicts: conflictReport.conflicts
    };

    const reportPath = reportGenerator.exportReport(fullReport, options.reportFormat);
    console.log(`   Report saved to: ${path.relative(root, reportPath)}`);

    console.log("\n✅ Language name normalization completed!");

  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exitCode = 1;
  }
}

// Export classes for testing
module.exports = {
  LanguageNameAnalyzer,
  LanguageNameResolver,
  ConfigurationFileManager,
  UpdateReportGenerator,
  main
};

// Run main function if this script is executed directly
if (require.main === module) {
  main().catch(error => {
    console.error("Fatal error:", error);
    process.exitCode = 1;
  });
}