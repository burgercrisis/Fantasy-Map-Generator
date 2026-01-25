/**
 * Namebase Safety Guardrails Validation Script
 * Validates that no truncation occurs during namebase operations
 */

"use strict";

const fs = require("fs");
const path = require("path");

const NAMEBASE_DIR = path.join(__dirname, "..", "modules");

// Files that should never have entries removed
const PROTECTED_FILES = [
  "namebases-all.js",
  "namebases-real.backup-*.js"
];

function countEntries(content) {
  const matches = content.match(/"name":\s*"/g);
  return matches ? matches.length : 0;
}

function validateNoTruncation(originalPath, newContent, operation) {
  const originalContent = fs.readFileSync(originalPath, "utf8");
  const originalCount = countEntries(originalContent);
  const newCount = countEntries(newContent);
  
  if (newCount < originalCount) {
    throw new Error(
      `🚨 TRUNCATION DETECTED during ${operation}\n` +
      `File: ${originalPath}\n` +
      `Original entries: ${originalCount}\n` +
      `New entries: ${newCount}\n` +
      `Entries lost: ${originalCount - newCount}\n\n` +
      `OPERATION BLOCKED - No entries may be removed!`
    );
  }
  
  console.log(`✅ ${operation}: ${originalCount} → ${newCount} entries (safe)`);
  return true;
}

function createBackup(filePath) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = filePath.replace(".js", `-backup-${timestamp}.js`);
  fs.copyFileSync(filePath, backupPath);
  console.log(`💾 Backup created: ${path.basename(backupPath)}`);
  return backupPath;
}

function validateSpecificEntry(filePath, targetIndex) {
  const content = fs.readFileSync(filePath, "utf8");
  const entryPattern = new RegExp(`\\{\\s*"name":\\s*"[^"]+",\\s*"i":\\s*${targetIndex},`, 'g');
  const matches = content.match(entryPattern);
  
  if (!matches || matches.length === 0) {
    throw new Error(`❌ Entry with i:${targetIndex} not found in ${filePath}`);
  }
  
  if (matches.length > 1) {
    throw new Error(`❌ Multiple entries found with i:${targetIndex} in ${filePath}`);
  }
  
  console.log(`✅ Entry i:${targetIndex} found and unique`);
  return true;
}

function validateLanguageContent(filePath, targetIndex, expectedName) {
  const content = fs.readFileSync(filePath, "utf8");
  const entryPattern = new RegExp(
    `\\{\\s*"name":\\s*"${expectedName}",\\s*"i":\\s*${targetIndex},.*?\\}`,
    's'
  );
  const match = content.match(entryPattern);
  
  if (!match) {
    throw new Error(`❌ Entry i:${targetIndex} with name "${expectedName}" not found in ${filePath}`);
  }
  
  console.log(`✅ Entry i:${targetIndex} "${expectedName}" verified`);
  return true;
}

// Export functions for use in other scripts
module.exports = {
  validateNoTruncation,
  createBackup,
  countEntries,
  validateSpecificEntry,
  validateLanguageContent
};

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log("Usage: node namebase-safety-guardrails.js <operation> [args]");
    console.log("Operations:");
    console.log("  validate <file> - Validate no truncation in file");
    console.log("  backup <file> - Create backup of file");
    console.log("  count <file> - Count entries in file");
    console.log("  find <file> <index> - Find entry by index");
    console.log("  verify <file> <index> <name> - Verify specific entry");
    process.exit(1);
  }
  
  const operation = args[0];
  switch(operation) {
    case 'validate':
      if (args.length < 2) {
        console.log("Usage: node namebase-safety-guardrails.js validate <file>");
        process.exit(1);
      }
      const content = fs.readFileSync(args[1], "utf8");
      const count = countEntries(content);
      console.log(`📊 Total entries in ${args[1]}: ${count}`);
      break;
      
    case 'backup':
      if (args.length < 2) {
        console.log("Usage: node namebase-safety-guardrails.js backup <file>");
        process.exit(1);
      }
      createBackup(args[1]);
      break;
      
    case 'count':
      if (args.length < 2) {
        console.log("Usage: node namebase-safety-guardrails.js count <file>");
        process.exit(1);
      }
      const fileCount = countEntries(fs.readFileSync(args[1], "utf8"));
      console.log(`📊 Total entries: ${fileCount}`);
      break;
      
    case 'find':
      if (args.length < 3) {
        console.log("Usage: node namebase-safety-guardrails.js find <file> <index>");
        process.exit(1);
      }
      validateSpecificEntry(args[1], args[2]);
      break;
      
    case 'verify':
      if (args.length < 4) {
        console.log("Usage: node namebase-safety-guardrails.js verify <file> <index> <name>");
        process.exit(1);
      }
      validateLanguageContent(args[1], args[2], args[3]);
      break;
      
    default:
      console.log(`❌ Unknown operation: ${operation}`);
      process.exit(1);
  }
}
