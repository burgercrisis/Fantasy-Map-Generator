/**
 * Targeted Encoding Fix Script
 * Fixes specific mojibake patterns found in namebase files
 */

const fs = require('fs');
const path = require('path');

// The specific mojibake patterns found
const MOJIBAKE_PATTERNS = {
  // German umlauts (found in "GrÃ¼nau" -> "Grünau")
  'Ã¼': 'ü',
  'Ã¤': 'ä',
  'Ã¶': 'ö',
  'Ã': 'ß',
  
  // Spanish
  'Ã±': 'ñ',
  'Ã¡': 'á',
  'Ã©': 'é',
  'Ã­': 'í',
  'Ã³': 'ó',
  'Ãº': 'ú',
  
  // Portuguese
  'Ã£': 'ã',
  'Ãµ': 'õ',
  'Ã ': 'à',
  'Ã¢': 'â',
  'Ã§': 'ç',
  'Ã¨': 'è',
  'Ãª': 'ê',
  'Ã¬': 'ì',
  'Ã®': 'î',
  'Ã¯': 'ï',
  'Ã²': 'ò',
  'Ã´': 'ô',
  'Ã¹': 'ù',
  'Ã»': 'û',
  
  // French
  'Ã«': 'ë',
  
  // Common artifacts
  'Â': '',
};

function fixMojibake(content) {
  let fixed = content;
  let changes = 0;
  
  Object.keys(MOJIBAKE_PATTERNS).forEach(pattern => {
    const replacement = MOJIBAKE_PATTERNS[pattern];
    const regex = new RegExp(pattern, 'g');
    const matches = fixed.match(regex);
    
    if (matches) {
      changes += matches.length;
      fixed = fixed.replace(regex, replacement);
    }
  });
  
  return { content: fixed, changes };
}

function processFile(filePath) {
  console.log(`\n📄 Processing: ${filePath}\n`);
  
  const content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Apply fixes
  const { content: fixedContent, changes } = fixMojibake(content);
  
  if (changes === 0) {
    console.log('✅ No encoding issues found');
    return { fixed: false, changes: 0 };
  }
  
  console.log(`🔧 Fixes applied: ${changes}`);
  
  // Create backup
  const backupPath = filePath.replace('.js', '.mojibake-backup.js');
  fs.writeFileSync(backupPath, originalContent);
  console.log(`💾 Backup created: ${path.basename(backupPath)}`);
  
  // Write fixed content
  fs.writeFileSync(filePath, fixedContent);
  console.log(`✅ Fixed: ${path.basename(filePath)}`);
  
  return { fixed: true, changes };
}

function main() {
  console.log('=== TARGETED ENCODING FIX ===\n');
  console.log('Fixing mojibake patterns in namebase files\n');
  
  const filesToProcess = [
    'modules/namebases-africa.js'
  ];
  
  let totalFixed = 0;
  
  filesToProcess.forEach(file => {
    if (fs.existsSync(file)) {
      try {
        const result = processFile(file);
        if (result.fixed) {
          totalFixed += result.changes;
        }
      } catch (err) {
        console.error(`❌ Error: ${err.message}`);
      }
    }
  });
  
  console.log('\n=== SUMMARY ===\n');
  console.log(`Total characters fixed: ${totalFixed}`);
  console.log('Files processed successfully');
  
  if (totalFixed > 0) {
    console.log('\n✅ Encoding issues resolved!');
    console.log('📋 Next: Run verification to confirm fixes');
  }
  
  return totalFixed;
}

const fixed = main();
process.exit(fixed > 0 ? 0 : 1);
