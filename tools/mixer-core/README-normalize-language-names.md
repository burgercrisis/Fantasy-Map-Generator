# Language Name Normalization Tool

## Overview

The `normalize-language-names.js` tool systematically identifies and replaces placeholder, abbreviated, or incomplete language names with proper, full language names in the Language Mixer System.

## Quick Start

```bash
# Recommended: Start with a dry run to see what would be changed
pnpm run mixer:normalize-names -- --dry-run

# Apply changes (creates automatic backup)
pnpm run mixer:normalize-names

# Include in full mixer maintenance workflow
pnpm run mixer:full-with-normalize
```

## What It Does

- **Identifies problematic names**: Finds abbreviated names (< 4 characters), ISO codes used as display names, or generic patterns
- **Resolves proper names**: Uses ISO 639 standards and Wikipedia references to find correct language names
- **Preserves distinctions**: Maintains regional and dialectal distinctions (e.g., "American English", "Swiss German")
- **Handles extinct languages**: Adds appropriate indicators for historical languages (e.g., "Old English", "Ancient Greek")
- **Prioritizes by usage**: Updates most frequently used languages first
- **Validates consistency**: Ensures name consistency within language families

## Command Line Options

```bash
# Basic usage
node tools/mixer-core/normalize-language-names.js [options]

# Available options:
--dry-run              # Preview changes without modifying files
--report-format json   # Generate JSON report instead of markdown
--no-backup           # Skip backup creation (not recommended)
--help                # Show help message
```

## Examples

```bash
# Preview what would be changed
pnpm run mixer:normalize-names -- --dry-run

# Apply changes with default settings
pnpm run mixer:normalize-names

# Generate a JSON report for programmatic processing
pnpm run mixer:normalize-names -- --report-format json

# Skip backup creation (use with caution)
pnpm run mixer:normalize-names -- --no-backup
```

## Files Modified

- **Input**: `config/language-mixes.json` (language catalog)
- **Input**: `config/language-mixer-map.json` (for usage analysis)
- **Output**: `config/language-mixes.json` (updated with proper names)
- **Backup**: Timestamped backup files created automatically
- **Reports**: Generated in `tools/mixer-core/reports/` directory

## Safety Features

- **Automatic backups**: Creates timestamped backups before making changes
- **Metadata preservation**: Preserves all existing metadata (region, category, family, Wikipedia links)
- **Base index integrity**: Ensures all base index references remain intact
- **Multi-agent safe**: Safe to run in collaborative environments
- **Rollback capability**: Can restore from backups if needed

## When to Use

- When you notice abbreviated or inconsistent language names in the mixer catalog
- As part of periodic maintenance to improve language name quality
- After importing new languages that may have placeholder names
- Before major releases to ensure professional language presentation

## Integration with Other Tools

The normalize-language-names tool integrates seamlessly with the existing mixer maintenance workflow:

1. **Before normalization**: Run `pnpm run mixer:qa` to check current state
2. **Normalization**: Run `pnpm run mixer:normalize-names`
3. **After normalization**: Run `pnpm run mixer:full` to complete maintenance
4. **Or use combined**: Run `pnpm run mixer:full-with-normalize` for everything at once

## Troubleshooting

If you encounter issues:

1. **Check backups**: Automatic backups are created in the same directory with timestamps
2. **Validate integrity**: The tool validates file integrity after updates
3. **Review reports**: Check generated reports for details on what was changed
4. **Restore if needed**: Use backup files to restore previous state if necessary

For more detailed information, see the main documentation in `tools/HELPER-TOOLS.md`.