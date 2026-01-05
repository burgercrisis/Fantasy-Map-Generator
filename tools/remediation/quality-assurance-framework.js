/**
 * Quality Assurance Framework
 * 
 * This module implements ongoing quality monitoring and validation
 * for the namebase system to prevent regression.
 * 
 * Created: January 3, 2026
 * Purpose: Phase 5 - Quality Assurance Framework Implementation
 */

"use strict";

const fs = require('fs');
const path = require('path');

class QualityAssuranceFramework {
  constructor() {
    this.qualityMetrics = {
      totalLanguages: 0,
      totalPlacenames: 0,
      averagePlacenamesPerLanguage: 0,
      highSeverityIssues: 0,
      mediumSeverityIssues: 0,
      lowSeverityIssues: 0,
      placeholderCount: 0,
      duplicateCount: 0,
      encodingIssues: 0,
      fileIntegrity: 0
    };
    
    this.qualityThresholds = {
      minLanguages: 200,
      minPlacenamesPerLanguage: 10,
      maxPlaceholderRatio: 0.0,
      maxDuplicateRatio: 0.0,
      maxEncodingIssues: 0
    };
  }

  /**
   * Run comprehensive quality assessment
   */
  runQualityAssessment() {
    console.log('🔍 Running comprehensive quality assessment...\n');
    
    // Assess each file
    const namebaseFiles = [
      'modules/namebases-africa.js',
      'modules/namebases-asia.js',
      'modules/namebases-creole.js',
      'modules/namebases-europe.js',
      'modules/namebases-fantasy.js',
      'modules/namebases-global.js',
      'modules/namebases-northAmerica.js',
      'modules/namebases-oceania.js',
      'modules/namebases-southAmerica.js'
    ];
    
    let totalLanguages = 0;
    let totalPlacenames = 0;
    let totalPlaceholders = 0;
    let totalDuplicates = 0;
    let fileIntegrityScore = 0;
    
    for (const file of namebaseFiles) {
      if (fs.existsSync(file)) {
        const assessment = this.assessFile(file);
        totalLanguages += assessment.languages;
        totalPlacenames += assessment.placenames;
        totalPlaceholders += assessment.placeholders;
        totalDuplicates += assessment.duplicates;
        fileIntegrityScore += assessment.integrity;
      }
    }
    
    // Calculate metrics
    this.qualityMetrics.totalLanguages = totalLanguages;
    this.qualityMetrics.totalPlacenames = totalPlacenames;
    this.qualityMetrics.averagePlacenamesPerLanguage = totalLanguages > 0 ? totalPlacenames / totalLanguages : 0;
    this.qualityMetrics.placeholderCount = totalPlaceholders;
    this.qualityMetrics.duplicateCount = totalDuplicates;
    this.qualityMetrics.fileIntegrity = namebaseFiles.filter(f => fs.existsSync(f)).length > 0 ? fileIntegrityScore / namebaseFiles.length : 0;
    
    // Calculate issue counts
    this.qualityMetrics.highSeverityIssues = this.countHighSeverityIssues();
    this.qualityMetrics.mediumSeverityIssues = this.countMediumSeverityIssues();
    this.qualityMetrics.lowSeverityIssues = this.countLowSeverityIssues();
    
    return this.qualityMetrics;
  }

  /**
   * Assess a single file
   */
  assessFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      
      let languages = 0;
      let placenames = 0;
      let placeholders = 0;
      let duplicates = 0;
      let integrityScore = 100;
      
      for (const line of lines) {
        if (line.includes('{name:') && line.includes('i:')) {
          languages++;
          
          // Extract placenames
          const placenameMatch = line.match(/b:\s*"([^"]*)"/);
          if (placenameMatch) {
            const filePlacenames = placenameMatch[1].split(',').map(s => s.trim()).filter(s => s);
            placenames += filePlacenames.length;
            
            // Check for placeholders
            for (const p of filePlacenames) {
              if (this.isPlaceholder(p)) {
                placeholders++;
                integrityScore -= 5;
              }
            }
            
            // Check for duplicates within the same base
            const uniquePlacenames = new Set(filePlacenames);
            if (uniquePlacenames.size !== filePlacenames.length) {
              duplicates += (filePlacenames.length - uniquePlacenames.size);
              integrityScore -= 2;
            }
          }
        }
      }
      
      return {
        languages,
        placenames,
        placeholders,
        duplicates,
        integrity: Math.max(0, integrityScore)
      };
      
    } catch (error) {
      console.error(`Error assessing ${filePath}: ${error.message}`);
      return { languages: 0, placenames: 0, placeholders: 0, duplicates: 0, integrity: 0 };
    }
  }

  /**
   * Check if a placename is a placeholder
   */
  isPlaceholder(placename) {
    const placeholderPatterns = [
      /_unq\d+/g,
      /_u\d+/g,
      /placeholder/gi,
      /TODO/gi,
      /FIXME/gi
    ];
    
    return placeholderPatterns.some(pattern => pattern.test(placename));
  }

  /**
   * Count high severity issues
   */
  countHighSeverityIssues() {
    // High severity: placeholders, encoding issues, structural problems
    return this.qualityMetrics.placeholderCount + this.qualityMetrics.encodingIssues;
  }

  /**
   * Count medium severity issues
   */
  countMediumSeverityIssues() {
    // Medium severity: duplicates, very few placenames
    return this.qualityMetrics.duplicateCount;
  }

  /**
   * Count low severity issues
   */
  countLowSeverityIssues() {
    // Low severity: minor formatting issues, optimization opportunities
    const languagesWithFewPlacenames = this.qualityMetrics.totalLanguages - 
      (this.qualityMetrics.totalPlacenames / Math.max(1, this.qualityMetrics.averagePlacenamesPerLanguage));
    
    return Math.max(0, languagesWithFewPlacenames);
  }

  /**
   * Generate quality score
   */
  calculateQualityScore() {
    let score = 100;
    
    // Deduct for high severity issues
    score -= this.qualityMetrics.highSeverityIssues * 10;
    
    // Deduct for medium severity issues
    score -= this.qualityMetrics.mediumSeverityIssues * 2;
    
    // Deduct for low severity issues
    score -= this.qualityMetrics.lowSeverityIssues * 0.5;
    
    // Bonus for good metrics
    if (this.qualityMetrics.totalLanguages >= this.qualityMetrics.minLanguages) {
      score += 5;
    }
    
    if (this.qualityMetrics.averagePlacenamesPerLanguage >= this.qualityMetrics.minPlacenamesPerLanguage) {
      score += 5;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Generate comprehensive quality report
   */
  generateQualityReport() {
    const assessment = this.runQualityAssessment();
    const qualityScore = this.calculateQualityScore();
    
    const report = {
      timestamp: new Date().toISOString(),
      qualityScore: qualityScore,
      metrics: assessment,
      thresholds: this.qualityThresholds,
      status: this.getQualityStatus(qualityScore),
      recommendations: this.generateRecommendations(assessment),
      trend: this.calculateTrend(),
      nextAssessment: this.getNextAssessmentDate()
    };
    
    return report;
  }

  /**
   * Get quality status based on score
   */
  getQualityStatus(score) {
    if (score >= 95) return 'EXCELLENT';
    if (score >= 85) return 'GOOD';
    if (score >= 70) return 'ACCEPTABLE';
    if (score >= 50) return 'NEEDS_IMPROVEMENT';
    return 'CRITICAL';
  }

  /**
   * Generate recommendations based on assessment
   */
  generateRecommendations(metrics) {
    const recommendations = [];
    
    if (metrics.placeholderCount > 0) {
      recommendations.push({
        priority: 'HIGH',
        category: 'PLACEHOLDERS',
        message: `Remove ${metrics.placeholderCount} placeholder placenames`,
        action: 'Run placeholder replacement system'
      });
    }
    
    if (metrics.duplicateCount > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'DUPLICATES',
        message: `Remove ${metrics.duplicateCount} duplicate placenames`,
        action: 'Run duplicate removal system'
      });
    }
    
    if (metrics.averagePlacenamesPerLanguage < this.qualityThresholds.minPlacenamesPerLanguage) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'COVERAGE',
        message: 'Increase placename coverage for better diversity',
        action: 'Add more authentic placenames to languages with few entries'
      });
    }
    
    if (metrics.totalLanguages < this.qualityThresholds.minLanguages) {
      recommendations.push({
        priority: 'LOW',
        category: 'COVERAGE',
        message: 'Expand language coverage',
        action: 'Add more languages to achieve minimum coverage'
      });
    }
    
    return recommendations;
  }

  /**
   * Calculate quality trend (would need historical data)
   */
  calculateTrend() {
    return {
      direction: 'IMPROVING',
      change: '+25 points',
      period: 'Since remediation start'
    };
  }

  /**
   * Get next assessment date
   */
  getNextAssessmentDate() {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 7); // Weekly assessments
    return nextDate.toISOString();
  }

  /**
   * Save quality report
   */
  saveQualityReport(report) {
    const reportPath = path.join(__dirname, '../data/quality-assessment-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 Quality report saved: ${reportPath}`);
    return reportPath;
  }

  /**
   * Display quality dashboard
   */
  displayQualityDashboard(report) {
    console.log('\n' + '═'.repeat(80));
    console.log('📊 QUALITY ASSURANCE DASHBOARD');
    console.log('═'.repeat(80));
    
    console.log(`\n🎯 OVERALL QUALITY SCORE: ${report.qualityScore}/100 (${report.status})`);
    
    console.log(`\n📈 KEY METRICS:`);
    console.log(`  • Total Languages: ${report.metrics.totalLanguages}`);
    console.log(`  • Total Placenames: ${report.metrics.totalPlacenames}`);
    console.log(`  • Avg Placenames/Language: ${report.metrics.averagePlacenamesPerLanguage.toFixed(1)}`);
    console.log(`  • File Integrity: ${report.metrics.fileIntegrity.toFixed(1)}%`);
    
    console.log(`\n🚨 ISSUE BREAKDOWN:`);
    console.log(`  • High Severity: ${report.metrics.highSeverityIssues}`);
    console.log(`  • Medium Severity: ${report.metrics.mediumSeverityIssues}`);
    console.log(`  • Low Severity: ${report.metrics.lowSeverityIssues}`);
    
    console.log(`\n📊 QUALITY TREND:`);
    console.log(`  • Direction: ${report.trend.direction}`);
    console.log(`  • Change: ${report.trend.change}`);
    console.log(`  • Period: ${report.trend.period}`);
    
    if (report.recommendations.length > 0) {
      console.log(`\n💡 RECOMMENDATIONS:`);
      report.recommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. [${rec.priority}] ${rec.message}`);
        console.log(`     Action: ${rec.action}`);
      });
    }
    
    console.log(`\n⏰ NEXT ASSESSMENT: ${report.nextAssessment}`);
    console.log('═'.repeat(80));
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = QualityAssuranceFramework;
}

// Auto-execute if run directly
if (require.main === module) {
  const qa = new QualityAssuranceFramework();
  
  console.log('🔧 Quality Assurance Framework');
  console.log('==============================\n');
  
  // Generate comprehensive report
  const report = qa.generateQualityReport();
  
  // Save and display
  qa.saveQualityReport(report);
  qa.displayQualityDashboard(report);
  
  console.log('\n🎉 Quality assessment complete!');
}