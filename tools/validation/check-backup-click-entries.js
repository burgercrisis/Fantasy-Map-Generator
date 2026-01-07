/**
 * Backup Click Entries Extractor
 * 
 * Reads backup files to extract Click language entries.
 * Searches across continent backup files for entries with click languages.
 * Useful for restoring reference click language data.
 * 
 * Usage:
 *   node tools/validation/check-backup-click-entries.js
 */

const fs = require('fs');
const path = require('path');

const modulesDir = 'modules';
const backupFiles = fs.readdirSync(modulesDir)
  .filter(f => f.includes('.js.backup') || f.includes('.backup-'))
  .filter(f => !f.includes('namebases-real')) // Skip legacy monolithic backups
  .sort();

console.log('\n=== CLICK LANGUAGE ENTRIES IN BACKUPS ===\n');

const allClickEntries = [];

backupFiles.forEach(backupFile => {
  const backupPath = path.join(modulesDir, backupFile);
  const content = fs.readFileSync(backupPath, 'utf-8');
  const lines = content.split('\n');
  
  const fileClickEntries = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('Click') && line.includes('i:')) {
      // Extract index
      const match = line.match(/i:\s*(\d+)/);
      if (match) {
        const index = parseInt(match[1]);
        fileClickEntries.push({ file: backupFile, line: i + 1, index, lineContent: line.substring(0, 150) });
      }
    }
  }
  
  if (fileClickEntries.length > 0) {
    console.log(`[${backupFile}] - ${fileClickEntries.length} click entries`);
    fileClickEntries.forEach(entry => {
      console.log(`  Line ${entry.line} (i=${entry.index}): ${entry.lineContent}...`);
      allClickEntries.push(entry);
    });
    console.log('');
  }
});

console.log(`\n=== SUMMARY ===\n`);
console.log(`Total backup files scanned: ${backupFiles.length}`);
console.log(`Total click entries found: ${allClickEntries.length}`);
