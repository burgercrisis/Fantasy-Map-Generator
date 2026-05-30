const fs = require('fs');

function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = `modules/namebases-all-backup-Wave8-${timestamp}.js`;
  fs.copyFileSync('modules/namebases-all.js', backupPath);
  console.log(`✓ Backup created: ${backupPath}`);
  return backupPath;
}

function validateNoTruncation(originalContent, newContent) {
  const original = JSON.parse(originalContent);
  const updated = JSON.parse(newContent);
  
  if (updated.length < original.length) {
    console.error(`❌ ERROR: Truncation detected! Original: ${original.length}, New: ${updated.length}`);
    return false;
  }
  
  console.log(`✓ No truncation: ${original.length} languages → ${updated.length} languages`);
  return true;
}

function validateEntryCount(originalEntry, updatedEntry) {
  const originalNames = originalEntry.b.split(',');
  const updatedNames = updatedEntry.b.split(',');
  
  if (updatedNames.length < originalNames.length) {
    console.error(`❌ ERROR: Entry truncation detected! Original: ${originalNames.length}, New: ${updatedNames.length}`);
    return false;
  }
  
  console.log(`✓ Entry count preserved: ${originalNames.length} → ${updatedNames.length}`);
  return true;
}

function validateEntryExists(original, updated, entryName) {
  const origEntry = original.find(e => e.name === entryName);
  const updEntry = updated.find(e => e.name === entryName);
  
  if (!origEntry) {
    console.error(`❌ ERROR: Original entry ${entryName} not found!`);
    return false;
  }
  
  if (!updEntry) {
    console.error(`❌ ERROR: Updated entry ${entryName} not found!`);
    return false;
  }
  
  return validateEntryCount(origEntry, updEntry);
}

module.exports = {
  createBackup,
  validateNoTruncation,
  validateEntryCount,
  validateEntryExists
};
