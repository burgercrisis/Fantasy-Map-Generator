const fs = require('fs');
const path = require('path');

const FIXES_DIR = path.join(__dirname, '../modules/name-fixes');
const PROCESSED_DIR = path.join(FIXES_DIR, 'processed');
const DATABASE_FILE = path.join(__dirname, '../modules/namebases-real.js');
const TRACKING_FILE = path.join(FIXES_DIR, 'tracking.json');

async function integrate() {
  console.log('Starting namebase integration...');

  // 1. Read all fix files
  const files = fs.readdirSync(FIXES_DIR).filter(f => f.endsWith('.json') && f !== 'tracking.json');
  if (files.length === 0) {
    console.log('No fix files found.');
    return;
  }

  console.log(`Found ${files.length} fix files.`);

  // 2. Load database
  let content = fs.readFileSync(DATABASE_FILE, 'utf8');
  const arrayStartMatch = content.match(/window\.realWorldNameBases = \[\s*/);
  if (!arrayStartMatch) {
    console.error('Could not find window.realWorldNameBases array start');
    return;
  }

  const arrayStartIndex = arrayStartMatch.index + arrayStartMatch[0].length;
  const arrayEndIndex = content.lastIndexOf('];');
  
  const arrayContent = content.substring(arrayStartIndex, arrayEndIndex);
  // We'll parse it carefully. Since it's a JS file, not JSON, we have to be careful.
  // The simplest way to keep formatting is to replace line by line if possible,
  // or rebuild the array content.
  
  // Re-evaluating: Rebuilding the whole file might be safer to ensure valid JS.
  // But we want to preserve the structure.
  
  const bases = eval('[' + arrayContent + ']');
  const tracking = JSON.parse(fs.readFileSync(TRACKING_FILE, 'utf8'));

  let updatedCount = 0;

  for (const file of files) {
    const filePath = path.join(FIXES_DIR, file);
    try {
      const fix = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const index = bases.findIndex(b => b.i === fix.i);

      if (index !== -1) {
        // Apply fix
        bases[index] = { ...bases[index], ...fix };
        
        // Update tracking
        const trackIndex = tracking.findIndex(t => t.i === fix.i);
        if (trackIndex !== -1) {
          tracking[trackIndex].status = 'integrated';
          tracking[trackIndex].updated = new Date().toISOString();
        }

        // Move to processed
        fs.renameSync(filePath, path.join(PROCESSED_DIR, file));
        updatedCount++;
        console.log(`Integrated ${fix.name} (index ${fix.i})`);
      } else {
        console.warn(`Could not find namebase with index ${fix.i} (from ${file})`);
      }
    } catch (err) {
      console.error(`Error processing ${file}:`, err);
    }
  }

  if (updatedCount > 0) {
    // 3. Write back to database
    // We'll format it similar to the original: one object per line
    const formattedBases = bases.map(b => '    ' + JSON.stringify(b)).join(',\n');
    const newContent = content.substring(0, arrayStartIndex) + formattedBases + '\n' + content.substring(arrayEndIndex);
    
    fs.writeFileSync(DATABASE_FILE, newContent);
    fs.writeFileSync(TRACKING_FILE, JSON.stringify(tracking, null, 2));
    console.log(`Successfully integrated ${updatedCount} namebases.`);
  } else {
    console.log('No updates were applied.');
  }
}

integrate().catch(console.error);
