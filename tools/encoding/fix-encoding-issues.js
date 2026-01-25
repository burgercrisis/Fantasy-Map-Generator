/**
 * Encoding Fix Script
 * Fixes double-encoded UTF-8 characters in namebase files
 * 
 * This script corrects mojibake patterns like:
 * - Ã¡ → á (double-encoded á)
 * - Ã© → é (double-encoded é)
 * - Ã­ → í (double-encoded í)
 * - Ã³ → ó (double-encoded ó)
 * - Ã± → ñ (double-encoded ñ)
 * - Ã¼ → ü (double-encoded ü)
 * - etc.
 */

const fs = require('fs');
const path = require('path');

// Mapping of double-encoded sequences to proper UTF-8 characters
const encodingFixes = {
  // Portuguese diacritics
  'Ã¡': 'á',
  'Ã ': 'à',
  'Ã¢': 'â',
  'Ã£': 'ã',
  'Ã¤': 'ä',
  'Ã§': 'ç',
  'Ã©': 'é',
  'Ã¨': 'è',
  'Ãª': 'ê',
  'Ã«': 'ë',
  'Ã­': 'í',
  'Ã¬': 'ì',
  'Ã®': 'î',
  'Ã¯': 'ï',
  'Ã³': 'ó',
  'Ã²': 'ò',
  'Ã´': 'ô',
  'Ãµ': 'õ',
  'Ã¶': 'ö',
  'Ãº': 'ú',
  'Ã¹': 'ù',
  'Ã»': 'û',
  'Ã¼': 'ü',
  'Ã±': 'ñ',
  'Ã': 'ß',
  
  // Common UTF-8 artifacts
  'Â': '',
  'Â¿': '¿',
  'Â¡': '¡',
  'Â«': '«',
  'Â»': '»',
  'Â°': '°',
  'Â±': '±',
  'Â²': '²',
  'Â³': '³',
  'Â´': '´',
  'Âµ': 'µ',
  'Â¶': '¶',
  'Â·': '·',
  'Â¹': '¹',
  'Â¼': '¼',
  'Â½': '½',
  'Â¾': '¾',
  'Â¿': '¿',
};

function fixEncoding(content) {
  let fixed = content;
  
  // Apply all fixes
  Object.keys(encodingFixes).forEach(pattern => {
    const replacement = encodingFixes[pattern];
    // Use global replace for all occurrences
    fixed = fixed.split(pattern).join(replacement);
  });
  
  return fixed;
}

function analyzeFile(filePath) {
  console.log(`\n📄 Analyzing: ${filePath}\n`);
  
  const content = fs.readFileSync(filePath, 'utf8');
  const originalSize = content.length;
  
  // Find all mojibake patterns
  const foundPatterns = {};
  const mojibakePattern = /Ã[A-Za-z]/g;
  const matches = content.match(mojibakePattern);
  
  if (matches) {
    matches.forEach(match => {
      if (!foundPatterns[match]) {
        foundPatterns[match] = 0;
      }
      foundPatterns[match]++;
    });
  }
  
  console.log('Found mojibake patterns:');
  if (Object.keys(foundPatterns).length === 0) {
    console.log('  ✅ No encoding issues detected');
    return { fixed: false, issuesFound: 0 };
  }
  
  Object.keys(foundPatterns).sort().forEach(pattern => {
    const expected = encodingFixes[pattern] || '[unknown]';
    console.log(`  ❌ ${pattern} → ${expected} (${foundPatterns[pattern]} occurrences)`);
  });
  
  // Apply fixes
  const fixedContent = fixEncoding(content);
  const fixedSize = fixedContent.length;
  
  // Verify no mojibake remains
  const remainingMatches = fixedContent.match(mojibakePattern);
  const remainingCount = remainingMatches ? remainingMatches.length : 0;
  
  console.log(`\nFixes applied: ${Object.keys(foundPatterns).length} unique patterns`);
  console.log(`Total occurrences fixed: ${matches ? matches.length : 0}`);
  console.log(`Remaining mojibake: ${remainingCount}`);
  
  return {
    fixed: true,
    issuesFound: matches ? matches.length : 0,
    uniquePatterns: Object.keys(foundPatterns).length,
    content: fixedContent,
    sizeChange: fixedSize - originalSize
  };
}

function main() {
  console.log('=== NAMEBASE ENCODING FIX SCRIPT ===\n');
  console.log('This script fixes double-encoded UTF-8 characters (mojibake)');
  console.log('in namebase files.\n');
  
  // Files to fix (excluding backup files as they're reference copies)
  const filesToFix = [
    'modules/namebases-africa.js'
  ];
  
  // Also note backup files have issues but won't be auto-fixed
  const backupFiles = [
    'modules/namebases-real.backup-20251228-221152.js',
    'modules/namebases-real.single-line-backup.js'
  ];
  
  let totalIssuesFixed = 0;
  
  // Process main files
  filesToFix.forEach(file => {
    if (fs.existsSync(file)) {
      try {
        const result = analyzeFile(file);
        
        if (result.fixed && result.issuesFound > 0) {
          // Create backup
          const backupPath = file.replace('.js', '.encoding-backup.js');
          fs.writeFileSync(backupPath, fs.readFileSync(file));
          console.log(`\n💾 Backup created: ${path.basename(backupPath)}`);
          
          // Apply fixes
          fs.writeFileSync(file, result.content);
          console.log(`✅ Fixed: ${file}`);
          console.log(`   Issues resolved: ${result.issuesFound}`);
          console.log(`   Patterns fixed: ${result.uniquePatterns}`);
          
          totalIssuesFixed += result.issuesFound;
        }
      } catch (err) {
        console.error(`❌ Error processing ${file}: ${err.message}`);
      }
    }
  });
  
  // Report on backup files
  console.log('\n=== BACKUP FILES STATUS ===\n');
  backupFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      const matches = content.match(/Ã[A-Za-z]/g);
      const count = matches ? matches.length : 0;
      console.log(`⚠️  ${path.basename(file)}: ${count} mojibake issues (backup file - manual review recommended)`);
    }
  });
  
  // Summary
  console.log('\n=== SUMMARY ===\n');
  console.log(`Total encoding issues fixed: ${totalIssuesFixed}`);
  console.log('Files processed:');
  filesToFix.forEach(file => {
    console.log(`  - ${file}`);
  });
  
  console.log('\n✅ Encoding fix complete!');
  
  // Verification recommendation
  console.log('\n📋 NEXT STEPS:');
  console.log('1. Review the fixed file to ensure content integrity');
  console.log('2. Run: node tools/encoding/comprehensive-encoding-verification.js');
  console.log('3. Test the application to verify no regressions');
  console.log('4. Update DEVplans/Namebase-Verification.md with findings');
  
  return totalIssuesFixed;
}

// Run the fix script
const issuesFixed = main();

// Exit with appropriate code
process.exit(issuesFixed > 0 ? 0 : 1);
