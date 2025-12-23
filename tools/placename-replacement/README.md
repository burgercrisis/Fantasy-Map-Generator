# Placename Placeholder Replacement Tool

This tool systematically identifies and replaces placeholder placenames in the Fantasy Map Generator's namebases-real.js file with authentic, researched placenames representative of their respective language groups.

## Overview

The system handles approximately **12,600+ placeholder entries** using multiple patterns:
- **Standard `_unq` patterns**: `language_index_unq1`, `language_index_unq2`, etc. (~10,400 instances)
- **Shortened `_u` patterns**: `language_index_u1`, `language_index_u2`, etc. (~2,200 instances)  
- **Truncated patterns**: Placeholders that appear cut off mid-generation
- **Mixed patterns**: Various combinations of the above formats

## Choosing the Right Approach

### Use `replace-placeholders.js` (Main CLI) When:
- **First-time users**: Complete workflow with research, validation, and reporting
- **Production use**: Need comprehensive validation and safety features
- **Research required**: Don't have pre-built authentic placename databases
- **Full documentation**: Need detailed reports and audit trails
- **Maximum safety**: Want automatic backups and rollback capabilities

### Use Systematic Replacement Scripts When:
- **Pre-built databases**: Already have authentic placename databases ready
- **Batch processing**: Processing multiple files or repeated operations
- **Simplified workflow**: Want direct replacement without research phase
- **Custom integration**: Building your own tools on top of the replacement logic
- **Performance**: Need faster execution for large-scale operations

### Script Comparison:

| Feature | Main CLI | Systematic Basic | Systematic Improved |
|---------|----------|------------------|-------------------|
| External API Research | ✅ | ❌ | ❌ |
| Pre-built Database Required | ❌ | ✅ | ✅ |
| Comprehensive Validation | ✅ | ⚠️ Basic | ⚠️ Basic |
| Multiple Report Formats | ✅ | ❌ | ❌ |
| Advanced Error Handling | ✅ | ❌ | ✅ |
| Configuration Options | ✅ | ❌ | ✅ |
| CLI Arguments | ✅ | ❌ | ❌ |
| Backup Management | ✅ | ✅ | ✅ |
| Execution Speed | Slower | Fast | Fast |
| Setup Complexity | Low | Medium | Medium |

## Quick Start

### 1. Analysis Mode (Recommended First Step)
```bash
# Analyze placeholders without making changes
pnpm run placenames:analyze
# or: node tools/placename-replacement/replace-placeholders.js --dry-run
```

### 2. Full Replacement
```bash
# Replace placeholders with researched names (creates backup automatically)
pnpm run placenames:replace
# or: node tools/placename-replacement/replace-placeholders.js
```

### 3. Validation Only
```bash
# Validate existing replacements
pnpm run placenames:validate
# or: node tools/placename-replacement/replace-placeholders.js --dry-run
```

### 4. Alternative Systematic Replacement Scripts
For specialized use cases, there are also standalone systematic replacement scripts:

```bash
# Basic systematic replacement (requires authentic database)
node tools/placename-replacement/systematic-replacement.js

# Enhanced systematic replacement with better error handling
node tools/placename-replacement/systematic-replacement-improved.js
```

**Note**: These scripts require an authentic placename database created first:
```bash
node tools/placename-replacement/authentic-placename-database.js
```

## CLI Usage and Options

### Basic Commands

```bash
# Analysis mode - scan and report without changes
node tools/placename-replacement/replace-placeholders.js --dry-run

# Live replacement mode - apply changes with backup
node tools/placename-replacement/replace-placeholders.js

# Help and usage information
node tools/placename-replacement/replace-placeholders.js --help
```

### Advanced Options

```bash
# Custom report formats (json, csv, markdown)
node tools/placename-replacement/replace-placeholders.js --format=json,csv,markdown

# Custom output directory
node tools/placename-replacement/replace-placeholders.js --output=./custom-reports

# Verbose logging for detailed progress
node tools/placename-replacement/replace-placeholders.js --verbose --dry-run

# Skip backup creation (NOT RECOMMENDED)
node tools/placename-replacement/replace-placeholders.js --no-backup

# Process custom namebase file
node tools/placename-replacement/replace-placeholders.js --file=./custom-namebases.js
```

### NPM Script Integration

The tool integrates with the existing mixer tool suite via npm scripts:

```bash
# Main CLI tool (recommended for most users)
pnpm run placenames:analyze      # Quick analysis (same as --dry-run)
pnpm run placenames:replace      # Full replacement with backup
pnpm run placenames:validate     # Validation mode (same as --dry-run)

# Testing
pnpm run test:placenames         # Run tests for the placename replacement system

# Direct script execution (for advanced users)
# These require pre-built authentic databases:
node tools/placename-replacement/authentic-placename-database.js  # Create database
node tools/placename-replacement/systematic-replacement.js        # Basic systematic replacement
node tools/placename-replacement/systematic-replacement-improved.js # Enhanced systematic replacement
node tools/placename-replacement/test-initial-replacements.js     # Test replacements
```

## Common Use Cases

### 1. Initial Assessment
Before making any changes, analyze the scope of placeholder replacements:

```bash
pnpm run placenames:analyze --verbose
```

This will:
- Scan all placeholder patterns in namebases-real.js
- Generate detailed reports by language group
- Show statistics and top affected language families
- Export analysis in multiple formats

### 2. Targeted Language Group Research
Research specific language groups before full replacement:

```bash
# Create initial authentic placename database for high-priority languages
node tools/placename-replacement/authentic-placename-database.js

# Test replacements with the authentic database
node tools/placename-replacement/test-initial-replacements.js
```

### 3. Full System Replacement (Recommended)
Replace all placeholders with comprehensive validation:

```bash
# Full replacement with all safety features
pnpm run placenames:replace --verbose

# Check the generated reports in tools/placename-replacement/output/
```

### 4. Quick Systematic Replacement
For users with pre-built authentic databases who want direct replacement:

```bash
# Basic systematic replacement (requires authentic database)
node tools/placename-replacement/systematic-replacement.js

# Enhanced systematic replacement with better error handling
node tools/placename-replacement/systematic-replacement-improved.js
```

**Prerequisites for systematic replacement scripts**:
1. Run `authentic-placename-database.js` first to create the database
2. Ensure the database file exists in `research-output/` directory
3. The scripts will automatically find and use the latest database file

### 5. Quality Assurance
Validate replacements and system compatibility:

```bash
# Run validation-only mode
pnpm run placenames:validate

# Run the full test suite
pnpm run test:placenames

# Check system integration with language mixer
pnpm run mixer:qa
```

## Architecture

The system consists of five main components with multiple implementation approaches:

### Core Components
- **PlaceholderScanner**: Identifies all placeholder entries
- **ResearchEngine**: Researches authentic placenames from multiple sources
- **ReplacementEngine**: Systematically replaces placeholders
- **ValidationSystem**: Ensures quality and compatibility
- **ReportGenerator**: Creates comprehensive documentation

### Implementation Approaches

#### 1. Full-Featured CLI Tool (`replace-placeholders.js`)
The main entry point providing comprehensive functionality:
- Complete research pipeline with external API integration
- Advanced validation and quality assessment
- Multiple report formats (JSON, CSV, Markdown)
- Extensive CLI options and configuration
- Full backup and rollback capabilities

#### 2. Systematic Replacement Scripts
Specialized scripts for direct replacement using pre-built databases:

- **`systematic-replacement.js`**: Basic systematic replacement implementation
  - Simple, straightforward replacement logic
  - Requires pre-built authentic placename database
  - Minimal configuration options
  - Good for batch processing with known data

- **`systematic-replacement-improved.js`**: Enhanced systematic replacement
  - Improved error handling and logging
  - Configurable options and better maintainability
  - Enhanced success rate calculation
  - More robust file processing

#### 3. Database Creation Scripts
- **`authentic-placename-database.js`**: Creates initial authentic placename databases
- **`create-initial-database.js`**: Alternative database creation approach
- **`test-initial-replacements.js`**: Tests replacement quality and system integration

### Component Details

#### PlaceholderScanner
- Parses namebases-real.js to extract all namebase entries
- Detects multiple placeholder patterns (`_unq\d+`, `_u\d+`, truncated, mixed)
- Extracts language group and ISO code information
- Generates comprehensive analysis reports organized by language group

#### ResearchEngine
- Integrates with Wikipedia API for language-specific placename research
- Uses OpenStreetMap Nominatim API and GeoNames database for validation
- Implements rate limiting and API key management
- Validates geographic appropriateness and cultural sensitivity
- Prioritizes academic and official geographic sources

#### ReplacementEngine
- Creates timestamped backups before any modifications
- Preserves all existing namebase metadata (min, max, d, m values)
- Maintains exact same number of placename seeds per entry
- Handles special characters and encoding preservation
- Applies replacements atomically with integrity validation

#### ValidationSystem
- Ensures minimum 12 authentic placenames per language group
- Tests language mixer functionality with updated namebases
- Validates linguistic patterns and phonological consistency through ResearchEngine integration
- Checks geographic and historical appropriateness with confidence scoring
- Provides comprehensive quality scoring and flagging mechanisms
- Validates character encoding compatibility across different language scripts
- Flags problematic replacements for manual review with severity levels

#### ReportGenerator
- Creates detailed before/after reports organized by language group
- Includes source citations for each replacement placename
- Calculates replacement coverage and success rates
- Supports multiple output formats (JSON, CSV, Markdown)
- Maintains complete audit trails for rollback capabilities

## Troubleshooting Guide

### Common Issues

#### 1. "No placeholders found" or Low Placeholder Count
**Symptoms**: Tool reports finding fewer placeholders than expected (~12,600)

**Possible Causes**:
- Wrong namebase file path
- File has already been processed
- Placeholder patterns have changed

**Solutions**:
```bash
# Verify file path and content
node tools/placename-replacement/replace-placeholders.js --file=./modules/namebases-real.js --verbose --dry-run

# Check if backups exist (file may have been processed)
ls -la tools/placename-replacement/backups/

# Restore from backup if needed
cp tools/placename-replacement/backups/namebases-real-YYYY-MM-DD-HH-MM-SS.js modules/namebases-real.js
```

#### 2. "No authentic placename database found" (Systematic Scripts)
**Symptoms**: Systematic replacement scripts fail with database not found error

**Possible Causes**:
- Haven't run database creation script
- Database files in wrong location
- Incorrect file naming pattern

**Solutions**:
```bash
# Create authentic database first
node tools/placename-replacement/authentic-placename-database.js

# Check database files exist
ls -la tools/placename-replacement/research-output/authentic-placenames-ready-*

# Use alternative database creation if needed
node tools/placename-replacement/create-initial-database.js
```

#### 2. Research API Failures (Main CLI Only)
**Symptoms**: "Research failed" messages, low success rates

**Possible Causes**:
- Network connectivity issues
- API rate limiting
- Invalid language group names
- External service downtime

**Solutions**:
```bash
# Run with verbose logging to see detailed errors
node tools/placename-replacement/replace-placeholders.js --verbose --dry-run

# Check network connectivity
curl -I https://en.wikipedia.org/api/rest_v1/
curl -I https://nominatim.openstreetmap.org/

# Alternative: Use systematic replacement with pre-built database
node tools/placename-replacement/authentic-placename-database.js
node tools/placename-replacement/systematic-replacement-improved.js
```

#### 3. System Compatibility Issues
**Symptoms**: Language mixer fails after replacements, name generation errors

**Possible Causes**:
- Invalid characters in placenames
- Metadata corruption
- Mapping inconsistencies

**Solutions**:
```bash
# Run language mixer health check
pnpm run mixer:health

# Validate namebase integrity
node tools/mixer-namebases/check-namebase-lengths.js

# Restore from backup if needed
cp tools/placename-replacement/backups/namebases-real-YYYY-MM-DD-HH-MM-SS.js modules/namebases-real.js

# Regenerate language mixer bundles
pnpm run mixer:full
```

#### 4. Low Quality Scores
**Symptoms**: Validation reports low authenticity or quality scores

**Possible Causes**:
- Insufficient research sources
- Poor source quality
- Inappropriate placenames for language groups

**Solutions**:
```bash
# Review quality assessment in reports
cat tools/placename-replacement/output/final-report-*.json | jq '.validationResults.qualityAssessment'

# Run targeted research for specific language groups
node tools/placename-replacement/research-high-priority-languages.js

# Manual review of flagged replacements
# Check tools/placename-replacement/output/ for detailed reports
```

#### 5. File Permission or Backup Issues
**Symptoms**: "Cannot create backup" or "Permission denied" errors

**Possible Causes**:
- Insufficient file permissions
- Disk space issues
- Read-only file system

**Solutions**:
```bash
# Check file permissions
ls -la modules/namebases-real.js
ls -la tools/placename-replacement/

# Ensure write permissions
chmod 644 modules/namebases-real.js
chmod -R 755 tools/placename-replacement/

# Check disk space
df -h

# Use custom output directory if needed
node tools/placename-replacement/replace-placeholders.js --output=/tmp/placename-reports
```

### Performance Optimization

#### Large-Scale Processing
For processing all 12,600+ placeholders efficiently:

```bash
# Use verbose mode to monitor progress
node tools/placename-replacement/replace-placeholders.js --verbose

# Process in analysis mode first to estimate time
time node tools/placename-replacement/replace-placeholders.js --dry-run --verbose

# Consider running during off-peak hours due to API rate limiting
# Estimated time: 2-4 hours for full replacement
```

#### Memory Usage
The tool loads the entire namebase file into memory:

```bash
# Monitor memory usage during processing
node --max-old-space-size=4096 tools/placename-replacement/replace-placeholders.js

# For very large files, consider processing in batches
# (This would require custom modification of the tool)
```

### Recovery Procedures

#### Rollback from Backup
If replacements cause issues:

```bash
# List available backups
ls -la tools/placename-replacement/backups/

# Restore most recent backup
cp tools/placename-replacement/backups/namebases-real-$(ls -t tools/placename-replacement/backups/ | head -1) modules/namebases-real.js

# Verify restoration
pnpm run mixer:health
```

#### Partial Recovery
To recover specific language groups:

```bash
# Extract specific entries from backup
# (Requires manual editing or custom script)

# Validate specific entries
node tools/mixer-namebases/check-namebase-lengths.js --base=<specific-indices>
```

### Debugging and Logging

#### Enable Debug Logging
```bash
# Maximum verbosity
DEBUG=placename:* node tools/placename-replacement/replace-placeholders.js --verbose --dry-run

# Component-specific debugging
DEBUG=placename:scanner node tools/placename-replacement/replace-placeholders.js --dry-run
DEBUG=placename:research node tools/placename-replacement/replace-placeholders.js --dry-run
DEBUG=placename:validation node tools/placename-replacement/replace-placeholders.js --dry-run
```

#### Log File Analysis
```bash
# Check recent logs in output directory
ls -la tools/placename-replacement/output/

# Analyze error patterns
grep -i error tools/placename-replacement/output/*.log

# Check API response patterns
grep -i "api" tools/placename-replacement/output/*.log
```

### Integration with Existing Tools

#### Language Mixer Integration
After running placename replacement:

```bash
# Full mixer health check and regeneration
pnpm run mixer:full

# Check for any mapping issues
pnpm run mixer:failures

# Validate name generation
node tools/mixer-core/generate-language-samples.js --iso=<test-iso> --per-base=20
```

#### Continuous Integration
For automated workflows:

```bash
# Analysis-only mode for CI
node tools/placename-replacement/replace-placeholders.js --dry-run --format=json --output=./ci-reports

# Validate CI results
if [ $? -eq 0 ]; then echo "Analysis passed"; else echo "Analysis failed"; exit 1; fi
```

## ValidationSystem API

The ValidationSystem provides comprehensive validation capabilities for placename replacements:

### Core Validation Methods

#### `validateLinguisticAuthenticity(placenames, languageGroup)`
Validates the linguistic authenticity of placenames for a specific language group.

**Parameters:**
- `placenames` (Array): Array of placename strings to validate
- `languageGroup` (string): Language group context for validation

**Returns:** Promise resolving to validation result object:
```javascript
{
  isValid: boolean,           // Overall validation result
  confidence: number,         // Confidence score (0-1)
  issues: Array,             // Array of validation issues
  validatedPlacenames: Array, // Placenames that passed validation
  linguisticScore: number,    // Phonological pattern score
  geographicScore: number,    // Geographic appropriateness score
  historicalScore: number     // Historical accuracy score
}
```

#### `validateGeographicAppropriateness(placenames, languageGroup)`
Validates geographic and historical appropriateness of placenames.

**Parameters:**
- `placenames` (Array): Placenames to validate
- `languageGroup` (string): Language group for geographic context

**Returns:** Promise resolving to geographic validation result with confidence scoring.

#### `checkQualityThresholds(placenames, qualityCriteria)`
Checks that placenames meet minimum quality standards.

**Parameters:**
- `placenames` (Array): Placenames to assess
- `qualityCriteria` (Object): Optional quality criteria override

**Returns:** Quality assessment object with pass/fail status and detailed statistics.

#### `validateCharacterEncoding(placenames)`
Validates character encoding compatibility across different scripts.

**Parameters:**
- `placenames` (Array): Placenames with potential special characters

**Returns:** Encoding compatibility results with detected encoding types and issues.

### System Integration Methods

#### `testSystemCompatibility(updatedFilePath)`
Tests compatibility with the existing language mixer system.

**Parameters:**
- `updatedFilePath` (string): Path to updated namebase file

**Returns:** Promise resolving to comprehensive compatibility test results.

#### `testLanguageMixerIntegration(updatedNamebases)`
Tests integration with language mixer mappings and validates index consistency.

**Parameters:**
- `updatedNamebases` (string|Object): File path or namebase data

**Returns:** Promise resolving to integration test results.

#### `validateGenerationPatterns(namebase)`
Validates that namebase entries work correctly with the name generation system.

**Parameters:**
- `namebase` (Object): Namebase entry to validate

**Returns:** Promise resolving to boolean validation result.

### Quality Assurance Methods

#### `flagProblematicReplacements(replacements)`
Identifies replacements that may require manual review.

**Parameters:**
- `replacements` (Array): Array of replacement operations

**Returns:** Array of flagged replacements with severity levels and recommended actions.

### Configuration

The ValidationSystem accepts configuration options:

```javascript
const validator = new ValidationSystem({
  minPlacenamesPerGroup: 12,    // Minimum placenames required per language group
  maxValidationRetries: 3,      // Maximum retry attempts for validation
  qualityThreshold: 0.8         // Minimum quality score threshold
});
```

### Error Handling

All validation methods include comprehensive error handling:
- Empty or invalid input arrays return appropriate error results
- Network failures during research validation are handled gracefully
- File system errors during compatibility testing are caught and reported
- All methods return structured result objects rather than throwing exceptions

## Database Creation

The tool includes scripts for creating and testing authentic placename databases:

### `authentic-placename-database.js`
Creates an initial database of authentic placenames for high-priority language groups using real geographic and linguistic research. The database includes:

- **Latin American Spanish**: 30 authentic city names from Mexico and Central America
- **Levantine Arabic**: 30 authentic city names from Syria, Lebanon, Jordan, and Palestine  
- **Libyan Arabic**: 30 authentic city and oasis names from throughout Libya

Each entry includes confidence ratings, regional information, and research notes.

### `test-initial-replacements.js`
Tests the initial placename replacements by:
1. Creating a test copy of namebases-real.js
2. Applying replacements from the authentic database
3. Validating authenticity and linguistic appropriateness
4. Testing name generation with new placenames

## Testing

The tool includes both unit tests and property-based tests using Jest and fast-check:

```bash
# Run all tests
pnpm test -- tools/placename-replacement

# Run with coverage
pnpm test:coverage -- tools/placename-replacement
```

## Report Formats

The tool generates comprehensive reports in multiple formats:

### JSON Format
Machine-readable format with complete data structure:
```json
{
  "metadata": {
    "generatedAt": "2024-01-01T12:00:00.000Z",
    "toolVersion": "1.0.0",
    "namebaseFile": "./modules/namebases-real.js"
  },
  "summary": {
    "totalPlaceholders": 12600,
    "languageGroupsAffected": 450,
    "successfulReplacements": 12400,
    "averageQuality": 0.85
  },
  "changeReport": { /* detailed changes */ },
  "sourceCitations": { /* research sources */ },
  "validationResults": { /* quality assessment */ }
}
```

### CSV Format
Spreadsheet-compatible format for analysis:
```csv
Language Group,Original Placeholders,New Placenames,Quality Score,Sources
Spanish (Latin American),15,15,0.92,"Wikipedia, GeoNames"
Arabic (Levantine),12,12,0.88,"OpenStreetMap, Wikipedia"
```

### Markdown Format
Human-readable documentation format:
```markdown
# Placename Replacement Report

## Summary
- **Total Placeholders Replaced**: 12,600
- **Language Groups Affected**: 450
- **Success Rate**: 98.4%

## Language Groups
### Spanish (Latin American)
- **Placeholders Replaced**: 15
- **Quality Score**: 92%
- **Sources**: Wikipedia, GeoNames
```

## Safety Features

### Automatic Backups
- Timestamped backups created before any modifications
- Backup location: `tools/placename-replacement/backups/`
- Backup format: `namebases-real-YYYY-MM-DD-HH-MM-SS.js`

### Validation and Quality Assurance
- Comprehensive validation of all changes
- System compatibility testing
- Quality scoring for each replacement
- Rollback capability if issues detected

### Rate Limiting and API Respect
- Built-in delays between API requests (1000ms default)
- Respectful usage of external research sources
- Error handling for API failures and timeouts

### Audit Trail
- Complete documentation of all operations
- Source citations for every replacement
- Detailed change logs with timestamps
- Recovery information for troubleshooting

## Configuration

### Environment Variables
```bash
# Optional: Set custom API keys for enhanced research
export GEONAMES_USERNAME=your_username
export OPENSTREETMAP_USER_AGENT=your_app_name

# Optional: Adjust rate limiting
export PLACENAME_API_DELAY=2000  # milliseconds between requests
```

### Custom Configuration
Create `tools/placename-replacement/config.json` for custom settings:
```json
{
  "rateLimitMs": 1000,
  "minPlacenamesPerGroup": 12,
  "qualityThreshold": 0.7,
  "sources": {
    "wikipedia": { "enabled": true, "priority": 1 },
    "geonames": { "enabled": true, "priority": 2 },
    "openstreetmap": { "enabled": true, "priority": 3 }
  }
}
```

## Development and Contributing

### Project Structure
```
tools/placename-replacement/
├── src/                          # Core implementation
│   ├── PlaceholderScanner.js     # Placeholder detection
│   ├── ResearchEngine.js         # Placename research
│   ├── ReplacementEngine.js      # Replacement logic
│   ├── ValidationSystem.js       # Quality validation
│   └── ReportGenerator.js        # Report generation
├── __tests__/                    # Test suites
├── backups/                      # Automatic backups
├── output/                       # Generated reports
├── research-output/              # Research data
├── README.md                     # This documentation
├── replace-placeholders.js       # Main CLI entry point (recommended)
├── systematic-replacement.js     # Basic systematic replacement script
├── systematic-replacement-improved.js # Enhanced systematic replacement
├── authentic-placename-database.js   # Database creation script
├── create-initial-database.js    # Alternative database creation
├── test-initial-replacements.js  # Replacement testing script
└── jest.config.js               # Test configuration
```

### Adding New Research Sources
To add new research sources:

1. Extend `ResearchEngine.js` with new source integration
2. Add source configuration to config schema
3. Update validation logic in `ValidationSystem.js`
4. Add tests for new source functionality
5. Update documentation

### Testing New Features
```bash
# Run specific test suites
pnpm test -- tools/placename-replacement/__tests__/PlaceholderScanner.test.js

# Run property-based tests
pnpm test -- tools/placename-replacement/__tests__/properties/

# Test with custom namebase file
node tools/placename-replacement/replace-placeholders.js --file=./test-data/sample-namebases.js --dry-run
```

## Related Tools

This tool integrates with the existing Fantasy Map Generator tool ecosystem:

### Language Mixer Tools
- `pnpm run mixer:health` - Check mixer system health
- `pnpm run mixer:qa` - Quick quality assurance check
- `pnpm run mixer:full` - Complete mixer rebuild

### Namebase Tools
- `pnpm run namebases:lengths` - Check namebase length statistics
- `node tools/mixer-namebases/report-namebase-duplicates.js` - Find duplicates
- `node tools/mixer-namebases/dedupe-namebase-duplicates.js` - Remove duplicates

### Diagnostic Tools
- `pnpm run mixer:failures` - Check for mapping failures
- `pnpm run mixer:coverage` - Check ISO coverage
- `node tools/mixer-core/generate-language-samples.js` - Test name generation

## License and Attribution

This tool is part of the Fantasy Map Generator project. When using researched placenames, the tool automatically includes proper attribution and source citations in all reports.

### Research Ethics
- Respects cultural sensitivity when handling indigenous and minority language placenames
- Uses only publicly available and appropriately licensed geographic data
- Provides proper attribution for all research sources
- Maintains academic standards for linguistic and geographic accuracy

### Data Sources
- **Wikipedia**: Used under Creative Commons licensing
- **OpenStreetMap**: Used under Open Database License
- **GeoNames**: Used under Creative Commons Attribution license
- **Academic Sources**: Properly cited with full attribution

For questions, issues, or contributions, please refer to the main project documentation and contribution guidelines.