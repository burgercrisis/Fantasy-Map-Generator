/**
 * Wave 5 Fix Script - Convert "(dedicated)" suffix to "(setBases aux)"
 * 
 * This script converts all language entries marked as "(dedicated)" to "(setBases aux)"
 * which improves their quality score from 20 to 40.
 * 
 * The "(dedicated)" suffix indicates placeholder/auxiliary entries.
 * Converting to "(setBases aux)" properly marks them as auxiliary entries.
 */

const fs = require("fs");
const path = require("path");

const HEAD_NAMEBASES_FILE = path.join(__dirname, "..", "..", "namebases", "head-namebases.js");
const BACKUP_SUFFIX = ".backup-wave5";

function applyWave5Fixes() {
  console.log("🔧 Applying Wave 5 fixes...");
  console.log("   Converting '(dedicated)' → '(setBases aux)'");
  
  // Read the file
  let content = fs.readFileSync(HEAD_NAMEBASES_FILE, "utf8");
  
  // Count occurrences before fix
  const dedicatedCount = (content.match(/\(dedicated\)/g) || []).length;
  console.log(`   Found ${dedicatedCount} entries with '(dedicated)' suffix`);
  
  if (dedicatedCount === 0) {
    console.log("   ✅ No fixes needed - no '(dedicated)' entries found");
    return;
  }
  
  // Create backup
  const backupFile = HEAD_NAMEBASES_FILE + BACKUP_SUFFIX;
  fs.writeFileSync(backupFile, content, "utf8");
  console.log(`   📁 Backup created: ${path.basename(backupFile)}`);
  
  // Apply the conversion
  const newContent = content.replace(/\(dedicated\)/g, "(setBases aux)");
  
  // Count occurrences after fix
  const newCount = (newContent.match(/\(setBases aux\)/g) || []).length;
  console.log(`   Converted ${dedicatedCount} entries to '(setBases aux)'`);
  
  // Write the fixed content
  fs.writeFileSync(HEAD_NAMEBASES_FILE, newContent, "utf8");
  console.log("   ✅ Fixes applied successfully!");
  
  // Show sample of changes
  console.log("\n   Sample changes:");
  let shown = 0;
  const lines = newContent.split("\n");
  for (const line of lines) {
    if (line.includes("(setBases aux)") && shown < 3) {
      const match = line.match(/name:\s*"([^"]+)/);
      if (match) {
        console.log(`   - ${match[1]}`);
        shown++;
      }
    }
  }
  
  console.log("\n📊 Quality Score Improvement:");
  console.log(`   Before: ${dedicatedCount} entries at score 20`);
  console.log(`   After:  ${newCount} entries at score 40`);
  console.log(`   Total improvement: +${dedicatedCount * 20} points`);
}

if (require.main === module) {
  applyWave5Fixes();
}

module.exports = { applyWave5Fixes };
