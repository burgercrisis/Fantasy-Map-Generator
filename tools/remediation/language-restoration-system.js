/**
 * Language Restoration System for Namebases
 * 
 * This module analyzes the current namebases structure and compares it with 
 * the original backup to identify missing languages and restore them to 
 * their appropriate continent-organized files.
 */

const fs = require('fs');
const path = require('path');

class LanguageRestorationSystem {
  constructor() {
    this.currentFile = path.join(__dirname, '../../modules/namebases-real.js');
    this.backupFile = path.join(__dirname, '../../modules/namebases-real.backup-20251228-221152.js');
    this.continentFiles = {
      'africa': path.join(__dirname, '../../namebases/namebases-africa.js'),
      'asia': path.join(__dirname, '../../namebases/namebases-asia.js'),
      'europe': path.join(__dirname, '../../namebases/namebases-europe.js'),
      'north-america': path.join(__dirname, '../../namebases/namebases-north-america.js'),
      'south-america': path.join(__dirname, '../../namebases/namebases-south-america.js'),
      'oceania': path.join(__dirname, '../../namebases/namebases-oceania.js'),
      'antarctica': path.join(__dirname, '../../namebases/namebases-antarctica.js'),
    };
  }

  /**
   * Analyze the current namebases-real.js structure
   */
  analyzeCurrentStructure() {
    try {
      const content = fs.readFileSync(this.currentFile, 'utf8');
      
      // Extract languages from current file
      const languagePattern = /\{[^}]*name:\s*"([^"]+)"[^}]*i:\s*(\d+)[^}]*\}/g;
      const currentLanguages = [];
      let match;
      
      while ((match = languagePattern.exec(content)) !== null) {
        currentLanguages.push({
          name: match[1],
          index: parseInt(match[2]),
          fullMatch: match[0]
        });
      }
      
      return {
        totalLanguages: currentLanguages.length,
        languages: currentLanguages,
        fileSize: content.length
      };
    } catch (error) {
      console.error(`Error analyzing current structure: ${error.message}`);
      return null;
    }
  }

  /**
   * Analyze the backup file structure
   */
  analyzeBackupStructure() {
    try {
      const content = fs.readFileSync(this.backupFile, 'utf8');
      
      // Extract languages from backup file
      const languagePattern = /\{[^}]*"name":\s*"([^"]+)"[^}]*"i":\s*(\d+)[^}]*\}/g;
      const backupLanguages = [];
      let match;
      
      while ((match = languagePattern.exec(content)) !== null) {
        backupLanguages.push({
          name: match[1],
          index: parseInt(match[2]),
          fullMatch: match[0]
        });
      }
      
      return {
        totalLanguages: backupLanguages.length,
        languages: backupLanguages,
        fileSize: content.length
      };
    } catch (error) {
      console.error(`Error analyzing backup structure: ${error.message}`);
      return null;
    }
  }

  /**
   * Compare current vs backup to identify missing languages
   */
  compareLanguages() {
    console.log('🔍 Comparing current vs backup languages...');
    
    const current = this.analyzeCurrentStructure();
    const backup = this.analyzeBackupStructure();
    
    if (!current || !backup) {
      throw new Error('Failed to analyze structures');
    }
    
    const currentIndices = new Set(current.languages.map(l => l.index));
    const backupIndices = new Set(backup.languages.map(l => l.index));
    
    // Find missing languages
    const missingIndices = [...backupIndices].filter(i => !currentIndices.has(i));
    const missingLanguages = backup.languages.filter(l => missingIndices.includes(l.index));
    
    // Find extra languages (shouldn't exist, but good to check)
    const extraIndices = [...currentIndices].filter(i => !backupIndices.has(i));
    const extraLanguages = current.languages.filter(l => extraIndices.includes(l.index));
    
    return {
      current: current,
      backup: backup,
      missingLanguages: missingLanguages,
      missingCount: missingLanguages.length,
      extraLanguages: extraLanguages,
      extraCount: extraLanguages.length,
      comparisonSummary: {
        currentTotal: current.totalLanguages,
        backupTotal: backup.totalLanguages,
        missingCount: missingLanguages.length,
        extraCount: extraLanguages.length,
        fileSizeReduction: backup.fileSize - current.fileSize
      }
    };
  }

  /**
   * Get continent mapping for a language based on its characteristics
   */
  getContinentMapping(language) {
    const name = language.name.toLowerCase();
    
    // Define continent-specific patterns
    const continentPatterns = {
      'africa': [
        'berber', 'arabic', 'swahili', 'yoruba', 'hausa', 'amharic', 'somali',
        'zulu', 'xhosa', 'afrikaans', 'nigerian', 'mali', 'ghana', 'kenya',
        'tanzania', 'uganda', 'rwanda', 'burundi', 'sudan', 'ethiopia', 'eritrea',
        'madagascar', 'mauritius', 'botswana', 'namibia', 'zimbabwe', 'mozambique',
        'angola', 'congo', 'chad', 'mali', 'burkina', 'niger', 'mauritania',
        'gambia', 'guinea', 'sierra leone', 'liberia', 'ivory', 'benin', 'togo',
        'central african', 'cameroon', 'equatorial guinea', 'gabon', 'são tomé',
        'cape verde', 'guinea-bissau', 'djibouti', 'comoros', 'seychelles'
      ],
      'asia': [
        'chinese', 'mandarin', 'cantonese', 'japanese', 'korean', 'vietnamese',
        'thai', 'lao', 'burmese', 'khmer', 'malay', 'indonesian', 'tagalog',
        'filipino', 'tamil', 'telugu', 'hindi', 'urdu', 'bengali', 'punjabi',
        'gujarati', 'kannada', 'malayalam', 'sinhala', 'nepali', 'bhutanese',
        'mongolian', 'uyghur', 'kazakh', 'uzbek', 'kyrgyz', 'tajik', 'turkmen',
        'persian', 'farsi', 'dari', 'pashto', 'kurdish', 'armenian', 'georgian',
        'azerbaijani', 'hebrew', 'arabic' // Arabic also in Asia
      ],
      'europe': [
        'english', 'french', 'german', 'spanish', 'italian', 'portuguese',
        'dutch', 'belgian', 'swiss', 'austrian', 'polish', 'czech', 'slovak',
        'hungarian', 'romanian', 'bulgarian', 'croatian', 'serbian', 'slovenian',
        'bosnian', 'macedonian', 'albanian', 'greek', 'finnish', 'swedish',
        'norwegian', 'danish', 'icelandic', 'estonian', 'latvian', 'lithuanian',
        'ukrainian', 'belarusian', 'moldovan', 'basque', 'catalan', 'galician',
        'scottish gaelic', 'irish gaelic', 'welsh', 'breton', 'cornish',
        'manx', 'luxembourgish', 'liechtenstein', 'maltese', 'sami'
      ],
      'north-america': [
        'english', 'spanish', 'french', 'canadian', 'mexican', 'american',
        'inuit', 'eskimo', 'cree', 'ojibwe', 'cherokee', 'navajo', 'sioux',
        'choctaw', 'chickasaw', 'seminole', 'apache', 'comanche', 'kiowa',
        'pueblo', 'hopi', 'zuni', 'algonquin', 'micmac', 'delaware', 'shawnee',
        'miami', 'illinois', 'peoria', 'fox', 'sac', 'kaskaskia', 'menominee',
        'winnebago', 'hochunk', 'ottawa', 'potawatomi', 'kickapoo', 'miami',
        'wea', 'piankashaw', 'kaskaskia', 'michigamea', 'cahokia', 'tamaroa',
        'chokwe', 'tunica', 'biloxi', 'pascagoula', 'mobile', 'tenskwatawa',
        'miccosukee', 'yuchi', 'natchez', 'catawba', 'tuscarora'
      ],
      'south-america': [
        'spanish', 'portuguese', 'quechua', 'nahuatl', 'guarani', 'aymara',
        'inca', 'maya', 'aztec', 'mayan', 'caribbean', 'creole', 'brazilian',
        'argentinian', 'chilean', 'colombian', 'venezuelan', 'peruvian', 'bolivian',
        'ecuadorian', 'uruguayan', 'paraguayan', 'amazonian', 'patagonia',
        'tupi', 'guarani', 'kaingang', 'xokleng', 'charrua', 'selknam',
        'yagan', 'kawesqar', 'mapuche', 'diaguita', 'atacameño', 'puelche',
        'tehuelche', 'chono', 'alacaluf', 'yaghan', 'selk\'nam', 'qom',
        'mocoví', 'wichí', 'pilagá', 'toba', 'mataco', 'lule', 'tonocote',
        'sanaviron', 'comechingón', 'diaguitas', 'puelches', 'tehuelches'
      ],
      'oceania': [
        'hawaiian', 'maori', 'samoan', 'tongan', 'fijian', 'polynesian',
        'melanesian', 'micronesia', 'australian', 'papuan', 'indonesian',
        'solomon islands', 'vanuatu', 'new caledonia', 'palau', 'marshall',
        'kiribati', 'tuvalu', 'nauru', 'tokelau', 'cook islands', 'tahiti',
        'rapa nui', 'maori', 'maohi', 'wallisian', 'futunan', 'niuean',
        'samoan', 'tongan', 'tuvaluan', 'kiribatese', 'marshallese', 'palauan',
        'chamorro', 'caroline', 'yapese', 'trukese', 'pohnpeian', 'kosraean',
        'nauruan', 'fijian', 'rotuman', 'hawaiian', 'tahitian', 'samoan',
        'tongan', 'maori', 'māori', 'australian', 'aboriginal', 'melanesian'
      ],
      'antarctica': [
        'antarctic', 'polar', 'research station', 'base'
      ]
    };
    
    // Check patterns for each continent
    for (const [continent, patterns] of Object.entries(continentPatterns)) {
      for (const pattern of patterns) {
        if (name.includes(pattern)) {
          return continent;
        }
      }
    }
    
    // Default fallback based on known patterns
    if (name.includes('click') || name.includes('khoisan')) {
      return 'africa';
    }
    
    if (name.includes('dravidian') || name.includes('austroasiatic')) {
      return 'asia';
    }
    
    if (name.includes('semitic') || name.includes('afroasiatic')) {
      return 'africa';
    }
    
    // Default to europe for unclear cases
    return 'europe';
  }

  /**
   * Generate restoration plan
   */
  generateRestorationPlan() {
    console.log('📋 Generating language restoration plan...');
    
    const comparison = this.compareLanguages();
    const { missingLanguages } = comparison;
    
    const restorationPlan = {
      totalMissing: missingLanguages.length,
      continentMapping: {},
      restorationItems: []
    };
    
    // Group missing languages by continent
    missingLanguages.forEach(language => {
      const continent = this.getContinentMapping(language);
      
      if (!restorationPlan.continentMapping[continent]) {
        restorationPlan.continentMapping[continent] = [];
      }
      
      restorationPlan.continentMapping[continent].push(language);
      restorationPlan.restorationItems.push({
        language,
        continent,
        action: 'restore'
      });
    });
    
    return restorationPlan;
  }

  /**
   * Validate language data model compliance
   */
  validateDataModel(language) {
    const errors = [];
    
    // Check required fields
    if (!language.name) errors.push('Missing name field');
    if (language.i === undefined || language.i === null) errors.push('Missing index field');
    if (language.min === undefined) errors.push('Missing min field');
    if (language.max === undefined) errors.push('Missing max field');
    if (!language.d) errors.push('Missing d field');
    if (language.m === undefined) errors.push('Missing m field');
    if (!language.b) errors.push('Missing b field');
    
    // Validate field types
    if (language.name && typeof language.name !== 'string') errors.push('Name must be string');
    if (language.i !== undefined && typeof language.i !== 'number') errors.push('Index must be number');
    if (language.min !== undefined && typeof language.min !== 'number') errors.push('Min must be number');
    if (language.max !== undefined && typeof language.max !== 'number') errors.push('Max must be number');
    if (language.d && typeof language.d !== 'string') errors.push('D field must be string');
    if (language.m !== undefined && typeof language.m !== 'number') errors.push('M field must be number');
    if (language.b && typeof language.b !== 'string') errors.push('B field must be string');
    
    // Validate UTF-8 encoding
    if (language.name && !this.isValidUTF8(language.name)) errors.push('Name contains invalid UTF-8 characters');
    if (language.b && !this.isValidUTF8(language.b)) errors.push('B field contains invalid UTF-8 characters');
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Check if string is valid UTF-8
   */
  isValidUTF8(str) {
    try {
      Buffer.from(str, 'utf8');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate detailed report
   */
  generateReport() {
    console.log('📊 Generating detailed restoration report...');
    
    const comparison = this.compareLanguages();
    const restorationPlan = this.generateRestorationPlan();
    
    // Validate all missing languages
    const validationResults = restorationPlan.restorationItems.map(item => {
      const validation = this.validateDataModel(item.language);
      return {
        language: item.language,
        continent: item.continent,
        validation,
        errors: validation.errors
      };
    });
    
    const report = {
      timestamp: new Date().toISOString(),
      comparison,
      restorationPlan,
      validation: validationResults,
      summary: {
        totalCurrentLanguages: comparison.current.totalLanguages,
        totalBackupLanguages: comparison.backup.totalLanguages,
        totalMissingLanguages: restorationPlan.totalMissing,
        validationPassCount: validationResults.filter(r => r.validation.isValid).length,
        validationFailCount: validationResults.filter(r => !r.validation.isValid).length,
        continentBreakdown: restorationPlan.continentMapping
      },
      recommendations: this.generateRecommendations(validationResults)
    };
    
    return report;
  }

  /**
   * Generate recommendations based on analysis
   */
  generateRecommendations(validationResults) {
    const recommendations = [];
    
    // Check for validation failures
    const failures = validationResults.filter(r => !r.validation.isValid);
    if (failures.length > 0) {
      recommendations.push({
        priority: 'high',
        category: 'validation',
        message: `${failures.length} languages failed validation - review data model compliance`,
        details: failures.map(f => f.validation.errors)
      });
    }
    
    // Check for duplicate concerns
    const duplicateIndices = new Set();
    validationResults.forEach(result => {
      if (duplicateIndices.has(result.language.i)) {
        recommendations.push({
          priority: 'high',
          category: 'duplicates',
          message: `Language index ${result.language.i} (${result.language.name}) may have duplicates`
        });
      }
      duplicateIndices.add(result.language.i);
    });
    
    // Check continent distribution
    const continentCounts = {};
    validationResults.forEach(result => {
      continentCounts[result.continent] = (continentCounts[result.continent] || 0) + 1;
    });
    
    Object.entries(continentCounts).forEach(([continent, count]) => {
      if (count > 50) {
        recommendations.push({
          priority: 'medium',
          category: 'distribution',
          message: `High number of ${continent} languages (${count}) - consider verification`
        });
      }
    });
    
    return recommendations;
  }

  /**
   * Save report to file
   */
  saveReport(report) {
    const reportPath = path.join(__dirname, '../data/language-restoration-report.json');
    const markdownPath = path.join(__dirname, '../data/language-restoration-report.md');
    
    // Save JSON report
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Generate markdown summary
    const markdown = this.generateMarkdownReport(report);
    fs.writeFileSync(markdownPath, markdown);
    
    console.log(`📄 Reports saved:`);
    console.log(`   JSON: ${reportPath}`);
    console.log(`   Markdown: ${markdownPath}`);
    
    return { jsonPath: reportPath, markdownPath };
  }

  /**
   * Generate markdown report
   */
  generateMarkdownReport(report) {
    let markdown = `# Language Restoration Report\n\n`;
    markdown += `**Generated:** ${report.timestamp}\n`;
    markdown += `**Status:** Analysis Complete\n\n`;
    
    markdown += `## Summary\n\n`;
    markdown += `- **Current Languages:** ${report.summary.totalCurrentLanguages}\n`;
    markdown += `- **Original Languages:** ${report.summary.totalBackupLanguages}\n`;
    markdown += `- **Missing Languages:** ${report.summary.totalMissingLanguages}\n`;
    markdown += `- **Validation Pass:** ${report.summary.validationPassCount}\n`;
    markdown += `- **Validation Fail:** ${report.summary.validationFailCount}\n\n`;
    
    markdown += `## Continent Distribution\n\n`;
    Object.entries(report.summary.continentBreakdown).forEach(([continent, languages]) => {
      markdown += `- **${continent}:** ${languages.length} languages\n`;
    });
    markdown += `\n`;
    
    markdown += `## Missing Languages by Continent\n\n`;
    Object.entries(report.restorationPlan.continentMapping).forEach(([continent, languages]) => {
      markdown += `### ${continent}\n\n`;
      languages.forEach(lang => {
        markdown += `- ${lang.name} (index: ${lang.i})\n`;
      });
      markdown += `\n`;
    });
    
    if (report.recommendations.length > 0) {
      markdown += `## Recommendations\n\n`;
      report.recommendations.forEach(rec => {
        markdown += `### ${rec.category} (${rec.priority} priority)\n`;
        markdown += `${rec.message}\n\n`;
      });
    }
    
    return markdown;
  }

  /**
   * Run the complete analysis
   */
  runAnalysis() {
    console.log('🚀 Starting Language Restoration Analysis...\n');
    
    try {
      const report = this.generateReport();
      const reportPaths = this.saveReport(report);
      
      console.log('\n✅ Analysis Complete!');
      console.log(`📊 Found ${report.summary.totalMissingLanguages} missing languages`);
      console.log(`📋 ${report.summary.validationPassCount}/${report.summary.totalMissingLanguages} pass validation`);
      
      return {
        success: true,
        report,
        reportPaths
      };
      
    } catch (error) {
      console.error('❌ Analysis failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LanguageRestorationSystem;
}

// Run analysis if executed directly
if (require.main === module) {
  const restorationSystem = new LanguageRestorationSystem();
  const result = restorationSystem.runAnalysis();
  
  if (result.success) {
    console.log('\n🎉 Language restoration analysis completed successfully!');
  } else {
    console.error('\n💥 Analysis failed:', result.error);
    process.exit(1);
  }
}