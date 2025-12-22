# Placename Placeholder Replacement Tool

This tool systematically identifies and replaces placeholder placenames in the Fantasy Map Generator's namebases-real.js file with authentic, researched placenames representative of their respective language groups.

## Overview

The system handles approximately **12,600+ placeholder entries** using multiple patterns:
- **Standard `_unq` patterns**: `language_index_unq1`, `language_index_unq2`, etc. (~10,400 instances)
- **Shortened `_u` patterns**: `language_index_u1`, `language_index_u2`, etc. (~2,200 instances)  
- **Truncated patterns**: Placeholders that appear cut off mid-generation
- **Mixed patterns**: Various combinations of the above formats

## Usage

```bash
# Analyze placeholders (dry-run)
pnpm run placenames:analyze

# Replace placeholders with researched names
pnpm run placenames:replace

# Validate replacements
pnpm run placenames:validate
```

## Architecture

The system consists of five main components:
- **PlaceholderScanner**: Identifies all placeholder entries
- **ResearchEngine**: Researches authentic placenames from multiple sources
- **ReplacementEngine**: Systematically replaces placeholders
- **ValidationSystem**: Ensures quality and compatibility
- **ReportGenerator**: Creates comprehensive documentation

## Testing

The tool includes both unit tests and property-based tests using Jest and fast-check:

```bash
# Run all tests
pnpm test -- tools/placename-replacement

# Run with coverage
pnpm test:coverage -- tools/placename-replacement
```