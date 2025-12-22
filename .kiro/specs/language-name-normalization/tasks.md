# Implementation Plan: Language Name Normalization

## Overview

This implementation will create a new Node.js tool in the `tools/mixer-core/` directory that systematically identifies and replaces placeholder, abbreviated, or incomplete language names with proper, full language names. The tool will integrate with the existing language mixer maintenance workflow and follow established patterns.

## Tasks

- [x] 1. Set up project structure and core interfaces
  - Create `tools/mixer-core/normalize-language-names.js` as the main entry point
  - Define core class interfaces for LanguageNameAnalyzer, LanguageNameResolver, ConfigurationFileManager, and UpdateReportGenerator
  - Set up testing framework with Jest for both unit and property-based tests
  - _Requirements: 1.1, 2.1, 4.1_

- [x]* 1.1 Write property test for project structure
  - **Property 1: Short name identification**
  - **Validates: Requirements 1.1**

- [x] 2. Implement LanguageNameAnalyzer class
  - [x] 2.1 Create name length analysis functionality
    - Implement detection of names shorter than 4 characters
    - Add exceptions for legitimate short names (e.g., "Ga", "Ao")
    - _Requirements: 1.1_

  - [x] 2.2 Write property test for name length analysis

    - **Property 1: Short name identification**
    - **Validates: Requirements 1.1**

  - [x] 2.3 Create generic name pattern detection
    - Implement detection of ISO codes used as display names
    - Add pattern matching for generic abbreviations and codes
    - _Requirements: 1.2, 2.2_

  - [x] 2.4 Write property test for generic name detection

    - **Property 2: Generic name pattern detection**
    - **Validates: Requirements 1.2, 2.2**

  - [x] 2.5 Implement metadata validation
    - Add detection of missing language family information
    - Validate completeness of region and category data
    - _Requirements: 1.3_

  - [x] 2.6 Write property test for metadata validation

    - **Property 3: Missing metadata identification**
    - **Validates: Requirements 1.3**

- [x] 3. Implement LanguageNameResolver class
  - [x] 3.1 Create ISO 639 name resolution
    - Build mapping from ISO codes to official language names
    - Implement fallback mechanisms for non-standard codes
    - _Requirements: 2.1, 2.2_

  - [x] 3.2 Write property test for ISO name resolution

    - **Property 6: Proper name expansion**
    - **Validates: Requirements 2.1**

  - [x] 3.3 Implement Wikipedia name extraction
    - Parse existing Wikipedia URLs to extract proper language names
    - Handle disambiguation and redirect cases
    - _Requirements: 2.4_

  - [x] 3.4 Write property test for Wikipedia consistency

    - **Property 8: Wikipedia consistency**
    - **Validates: Requirements 2.4**

  - [x] 3.5 Add linguistic convention validation
    - Implement proper capitalization rules
    - Ensure consistency within language families
    - Handle extinct language indicators
    - _Requirements: 2.5, 3.3, 3.4_

  - [x] 3.6 Write property test for formatting consistency

    - **Property 7: Formatting consistency**
    - **Validates: Requirements 2.5, 3.4**

- [x] 4. Checkpoint - Ensure core analysis and resolution work
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement ConfigurationFileManager class
  - [x] 5.1 Create file loading and parsing functionality
    - Load and validate language-mixes.json and language-mixer-map.json
    - Implement JSON structure validation
    - _Requirements: 4.1, 4.3_

  - [x] 5.2 Write property test for file integrity

    - **Property 11: File update integrity**
    - **Validates: Requirements 4.1, 4.3**

  - [x] 5.3 Implement backup creation system
    - Create timestamped backups before any modifications
    - Implement rollback functionality
    - _Requirements: 4.4_

  - [x] 5.4 Write property test for backup creation

    - **Property 12: Backup creation**
    - **Validates: Requirements 4.4**

  - [x] 5.5 Create update application functionality
    - Apply name changes while preserving all other metadata
    - Validate that base index references remain intact
    - _Requirements: 2.3, 4.2, 4.5_

  - [x] 5.6 Write property test for metadata preservation

    - **Property 5: Name transformation preservation**
    - **Validates: Requirements 2.3, 4.2, 4.5**

- [x] 6. Implement UpdateReportGenerator class
  - [x] 6.1 Create change report generation
    - Generate detailed before/after mappings
    - Include justification for each change
    - Highlight conflicts and ambiguities
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 6.2 Write property test for comprehensive reporting

    - **Property 13: Comprehensive reporting**
    - **Validates: Requirements 5.1, 5.2, 5.3**

  - [x] 6.3 Implement statistics generation
    - Calculate changes by language family and region
    - Generate summary metrics
    - _Requirements: 5.4_

  - [x] 6.4 Add report export functionality
    - Support JSON, CSV, and Markdown formats
    - Ensure human-readable output
    - _Requirements: 5.5_

  - [x] 6.5 Write property test for report format validation

    - **Property 14: Report format validation**
    - **Validates: Requirements 5.5**

- [x] 7. Implement usage-based prioritization
  - [x] 7.1 Create usage frequency analysis
    - Analyze existing language mixer usage patterns
    - Calculate priority scores for incomplete entries
    - _Requirements: 1.5_

  - [x] 7.2 Write property test for usage-based prioritization

    - **Property 4: Usage-based prioritization**
    - **Validates: Requirements 1.5**

- [x] 8. Add special handling for extinct and regional languages
  - [x] 8.1 Implement extinct language indicators
    - Add appropriate tags for historical languages
    - Preserve extinction status in metadata
    - _Requirements: 3.3_

  - [x] 8.2 Write property test for extinct language indicators

    - **Property 9: Extinct language indicators**
    - **Validates: Requirements 3.3**

  - [x] 8.3 Preserve regional and dialectal distinctions
    - Maintain regional identifiers in language names
    - Ensure dialectal information is preserved
    - _Requirements: 3.5_

  - [x] 8.4 Write property test for regional distinction preservation

    - **Property 10: Regional distinction preservation**
    - **Validates: Requirements 3.5**

- [x] 9. Integration and command-line interface
  - [x] 9.1 Create main CLI entry point
    - Implement command-line argument parsing
    - Add options for dry-run, backup, and report formats
    - Wire all components together
    - _Requirements: 1.1, 2.1, 4.1, 5.1_

  - [x] 9.2 Add integration with existing mixer tools
    - Ensure compatibility with fix-language-mixer-mappings.js
    - Add support for delta workflow if needed
    - Follow existing tool patterns and conventions

  - [x] 9.3 Write integration tests

    - Test end-to-end normalization workflow
    - Validate compatibility with existing tools
    - Test error handling and recovery mechanisms

- [x] 10. Documentation and package.json integration
  - [x] 10.1 Add npm script to package.json
    - Add `mixer:normalize-names` script
    - Update existing mixer suite to include normalization option
    - _Requirements: All_

  - [x] 10.2 Create comprehensive documentation
    - Document CLI usage and options
    - Add examples and common use cases
    - Update tools/HELPER-TOOLS.md with new tool information

- [x] 11. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The tool will follow existing patterns in the `tools/mixer-core/` directory
- Integration with the existing language mixer maintenance workflow is essential