# Implementation Plan: Placename Placeholder Replacement

## Overview

This implementation will create a comprehensive Node.js system to systematically identify and replace **12,600+ placeholder placenames** in the Fantasy Map Generator's namebases-real.js file with authentic, researched placenames. The system will integrate with existing language mixer tools and maintain full backward compatibility.

**Scope**: This is a substantial data curation project involving:
- **~10,400 `_unq` pattern placeholders** (e.g., `language_index_unq1`, `language_index_unq2`)
- **~2,200 `_u` pattern placeholders** (e.g., `language_index_u1`, `language_index_u2`)
- **Hundreds of language groups** requiring individual research and validation
- **Multiple placeholder formats** including truncated and mixed patterns

## Tasks

- [x] 1. Set up project structure and core interfaces
  - Create `tools/placename-replacement/` directory structure
  - Define core class interfaces for PlaceholderScanner, ResearchEngine, ReplacementEngine, ValidationSystem, and ReportGenerator
  - Set up testing framework with Jest for both unit and property-based tests using fast-check
  - Create package.json scripts for the new tool
  - _Requirements: 1.1, 2.1, 4.1, 5.1_

- [x]* 1.1 Write property test for project structure validation
  - **Property 1: Comprehensive Placeholder Detection**
  - **Validates: Requirements 1.1, 1.2, 1.3**

- [x] 2. Implement PlaceholderScanner class
  - [x] 2.1 Create namebase file parsing functionality
    - Parse namebases-real.js and extract all namebase entries
    - Implement JSON-like object parsing for namebase structure
    - Handle special characters and encoding issues
    - _Requirements: 1.1_

  - [x] 2.2 Implement placeholder pattern detection
    - Detect `_unq\d+` patterns (~10,400 instances)
    - Identify `_u\d+` format placeholders (~2,200 instances)
    - Handle truncated and mixed pattern formats
    - Extract language group and ISO code information from entries
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 2.3 Write property test for placeholder detection
    - **Property 1: Comprehensive Placeholder Detection**
    - **Validates: Requirements 1.1, 1.2, 1.3**

  - [x] 2.4 Create analysis and reporting functionality
    - Generate comprehensive reports organized by language group
    - Calculate statistics for placeholders per language group
    - Export analysis results in JSON and human-readable formats
    - _Requirements: 1.4, 1.5_

- [x] 3. Implement ResearchEngine class
  - [x] 3.1 Create Wikipedia research integration
    - Implement Wikipedia API integration for language-specific placename research
    - Parse language pages and extract authentic placenames
    - Handle disambiguation pages and redirects
    - _Requirements: 2.1_

  - [x] 3.2 Add geographic database integration
    - Integrate with OpenStreetMap Nominatim API for placename validation
    - Add GeoNames database integration for additional sources
    - Implement rate limiting and API key management
    - _Requirements: 2.1_

  - [x] 3.3 Write property test for multi-source research


    - **Property 2: Multi-Source Research Coverage**
    - **Validates: Requirements 2.1, 2.4**

  - [x] 3.4 Implement authenticity validation system
    - Validate geographic appropriateness of placenames for language groups
    - Check historical accuracy and cultural sensitivity
    - Implement phonological pattern validation for linguistic consistency
    - _Requirements: 2.2, 2.3_

  - [x] 3.5 Write property test for authenticity validation

    - **Property 3: Authenticity and Linguistic Validation**
    - **Validates: Requirements 2.2, 2.3, 4.1, 4.3**

  - [x] 3.6 Create source prioritization and conflict resolution
    - Implement source reliability scoring system
    - Prioritize academic and official geographic sources
    - Handle conflicting information from multiple sources
    - _Requirements: 2.4_

- [x] 4. Checkpoint - Ensure core scanning and research functionality works
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement ReplacementEngine class
  - [x] 5.1 Create backup management system
    - Implement timestamped backup creation for namebases-real.js
    - Add backup validation and integrity checking
    - Create rollback functionality for failed operations
    - _Requirements: 3.3_

  - [x] 5.2 Write property test for backup integrity

    - **Property 5: Backup and Recovery Integrity**
    - **Validates: Requirements 3.3**

  - [x] 5.3 Implement systematic replacement functionality
    - Replace placeholders while preserving all metadata (min, max, d, m values)
    - Maintain exact same number of placename seeds per entry
    - Handle special characters and encoding preservation
    - _Requirements: 3.1, 3.2, 2.6_
    - **Status: COMPLETED** - Multiple implementations available:
      - Main CLI tool (`replace-placeholders.js`) with full research pipeline
      - Basic systematic replacement (`systematic-replacement.js`) for direct database use
      - Enhanced systematic replacement (`systematic-replacement-improved.js`) with better error handling

  - [x] 5.4 Write property test for replacement preservation

    - **Property 4: Replacement Preservation and Consistency**
    - **Validates: Requirements 3.1, 3.2**

  - [x] 5.5 Write property test for character encoding compatibility

    - **Property 8: Character Encoding Compatibility**
    - **Validates: Requirements 2.6**

  - [x] 5.6 Create file update and validation system
    - Apply all replacements to namebases-real.js atomically
    - Validate file integrity after updates
    - Generate detailed change logs for each replacement
    - _Requirements: 3.4, 3.5_

- [x] 6. Implement ValidationSystem class
  - [x] 6.1 Create quality threshold validation
    - Ensure minimum 12 authentic placenames per language group
    - Flag insufficient data for manual review
    - Implement quality scoring for research results
    - _Requirements: 2.5, 4.5_
    - **Status: COMPLETED** - Full implementation with comprehensive quality assessment

  - [x] 6.2 Write property test for quality threshold maintenance

    - **Property 6: Quality Threshold Maintenance**
    - **Validates: Requirements 2.5, 4.5**
    - **Status: COMPLETED** - Property test implemented and passing

  - [x] 6.3 Implement system compatibility testing
    - Test language mixer functionality with updated namebases
    - Validate that existing tools continue to work correctly
    - Verify name generation works with new placename seeds
    - _Requirements: 4.2, 4.4_
    - **Status: COMPLETED** - Full compatibility testing suite implemented

  - [x] 6.4 Write property test for system compatibility

    - **Property 7: System Compatibility Preservation**
    - **Validates: Requirements 3.4, 4.2, 4.4**
    - **Status: COMPLETED** - Property test implemented and passing

  - [x] 6.5 Add post-replacement validation
    - Verify linguistic patterns of applied replacements through ResearchEngine integration
    - Check geographic and historical appropriateness with confidence scoring
    - Validate integration with language mixer mappings
    - Implement character encoding compatibility validation
    - _Requirements: 4.1, 4.3_
    - **Status: COMPLETED** - Full validation suite with linguistic authenticity, geographic appropriateness, and encoding validation

- [x] 7. Implement ReportGenerator class
  - [x] 7.1 Create comprehensive change reporting
    - Generate detailed before/after reports organized by language group
    - Include source citations for each replacement placename
    - Calculate and report replacement coverage and success rates
    - _Requirements: 5.1, 5.2, 5.3_
    - **Status: COMPLETED** - All methods implemented and unit tests passing

  - [x] 7.2 Write property test for comprehensive reporting
    - **Property 9: Comprehensive Reporting and Documentation**
    - **Validates: Requirements 5.1, 5.2, 5.3**
    - **Status: COMPLETED** - Property test implemented and passing

  - [x] 7.3 Implement multiple output formats
    - Support JSON, CSV, and Markdown report formats
    - Generate both human-readable and machine-readable outputs
    - Create summary statistics and detailed audit trails
    - _Requirements: 5.4, 5.5_
    - **Status: COMPLETED** - All export formats implemented and tested

  - [x] 7.4 Write property test for audit trail completeness
    - **Property 10: Complete Audit Trail**
    - **Validates: Requirements 5.4, 5.5**
    - **Status: COMPLETED** - Property test implemented and passing

- [x] 8. Create command-line interface and integration
  - [x] 8.1 Implement main CLI entry point
    - Create `tools/placename-replacement/replace-placeholders.js` as main script
    - Add command-line argument parsing with options for dry-run, backup, and report formats
    - Implement progress reporting and user feedback
    - _Requirements: All_

  - [x] 8.2 Add integration with existing mixer tools
    - Ensure compatibility with existing language mixer workflow
    - Add npm script integration to package.json
    - Follow existing tool patterns and conventions
    - Update tools/HELPER-TOOLS.md documentation

  - [x] 8.3 Write integration tests

    - Test end-to-end placeholder replacement workflow
    - Validate compatibility with existing language mixer tools
    - Test error handling and recovery mechanisms

- [x] 9. Research and populate initial placename database
  - [x] 9.1 Research placenames for high-priority language groups
    - Identify the most commonly used language groups with placeholders
    - Research authentic placenames for top 20 language groups
    - Create initial placename database with source citations
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 9.2 Validate and test initial replacements
    - Apply initial replacements to a test copy of namebases-real.js
    - Validate authenticity and linguistic appropriateness
    - Test name generation with new placenames
    - _Requirements: 4.1, 4.2, 4.3_

- [x] 10. Documentation and final integration
  - [x] 10.1 Create comprehensive documentation
    - Document CLI usage and all available options
    - Add examples and common use cases
    - Create troubleshooting guide for common issues
    - Update existing tool documentation

  - [x] 10.2 Add npm script integration
    - Add `placenames:replace` script to package.json
    - Add `placenames:analyze` script for analysis-only mode
    - Add `placenames:validate` script for validation-only mode
    - Integrate with existing mixer tool suite

- [x] 11. Final checkpoint - Ensure all tests pass and system works end-to-end
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties using fast-check library
- Unit tests validate specific examples and edge cases
- The system will integrate with existing tools in the `tools/` directory
- All research operations will include proper rate limiting and API usage guidelines to handle the large scale of 12,600+ replacements
- Special attention to cultural sensitivity when handling indigenous and minority language placenames
- The system is designed to handle the substantial scope efficiently through batching and parallel processing where appropriate