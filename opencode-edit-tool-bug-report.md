# Opencode IDE Edit Tool Bug Report

## Issue Summary
**Tool Affected**: `edit()` function  
**Error Message**: `Found multiple matches for oldString. Provide more surrounding lines in oldString to identify the correct match.`  
**Severity**: Medium (workaround exists but impacts UX)  
**Date Reported**: 2026-02-07

---

## Problem Description

The `edit()` tool fails when attempting to replace text that appears multiple times in a file, even when the context is clear from surrounding lines. The error message suggests providing "more surrounding lines," but the actual implementation appears to be doing exact string matching without considering:

1. **Line context** - The tool doesn't use line numbers to disambiguate matches
2. **Surrounding context weighting** - Longer oldStrings with more unique context still fail if any substring matches multiple locations
3. **Progressive matching** - No fallback to "best match" or "nearest match" algorithms

---

## Reproduction Steps

### File Context
Working with `DEVplans/Namebase-Verification.md` - a large markdown file (~1300+ lines) documenting namebase quality fixes. The file contains multiple entries with similar structures.

### Failed Attempt 1
```javascript
edit({
  filePath: "E:\\code\\Fantasy-Map-Generator\\DEVplans\\Namebase-Verification.md",
  oldString: "(End of file)",
  newString: "(End of file)\n\n## Babanki Quality Fix..."
})
```
**Result**: Failed - "(End of file)" appears multiple times in the document

### Failed Attempt 2
```javascript
edit({
  filePath: "E:\\code\\Fantasy-Map-Generator\\DEVplans\\Namebase-Verification.md",
  oldString: "**FIX APPLIED**: 2026-02-07 - Successfully fixed quality issues in modules/namebases-oceania.js at i: 2736",
  newString: "**FIX APPLIED**: 2026-02-07...\n\n## Babanki Quality Fix..."
})
```
**Result**: Failed - This exact string appears in multiple entries (file contains 10+ "FIX APPLIED" lines with the same date and similar format)

### Successful Attempt
```javascript
edit({
  filePath: "E:\\code\\Fantasy-Map-Generator\\DEVplans\\Namebase-Verification.md",
  oldString: `**Documentation Notes**:
- Awbono (ISO 639-3: awh) is a Papuan language spoken in Papua Province, Indonesia
- Spoken by ~100 people (2000 SIL estimates)
- Primary region: Lower Digul River area, Boven Digoel Regency, South Papua Province
- Coordinates: 5°04'S, 139°43'E (approximate center of Awbono area)
- Belongs to the Bayono-Awbono language family (possibly Trans-New Guinea)
- All verified place names are authentic localities in the Awbono language region
- The region is accessible primarily by river transport due to swampy terrain
- Major towns serve as administrative and commercial centers for surrounding villages

**FIX APPLIED**: 2026-02-07 - Successfully fixed quality issues in modules/namebases-oceania.js at i: 2736`,
  newString: "..."
})
```
**Result**: Success - Required 15+ lines of unique context

---

## Root Cause Analysis

### Current Behavior
The `edit()` tool appears to:
1. Take the `oldString` parameter as a literal string
2. Search for exact matches across the entire file
3. If >1 match found, error immediately with "multiple matches" message
4. Require user to expand `oldString` until it's globally unique

### Issues with Current Approach

1. **No Line Number Support**: Unlike many code editors, `edit()` doesn't accept line numbers to specify WHERE to edit
2. **No Smart Matching**: Doesn't use "fuzzy" matching or line-position hints
3. **Poor UX for Templated Content**: Files with repetitive structures (logs, documentation, code templates) are particularly problematic
4. **Error Feedback Loop**: Each failure requires the user to guess how much more context is needed

### Impact on Workflow

In the reproduction case:
- File had 10+ entries with the same "FIX APPLIED" footer format
- Each entry had the same date (2026-02-07)
- Required adding 12+ lines of unique content to disambiguate
- Total time wasted: ~5 minutes of trial-and-error

---

## Recommended Fixes

### Option 1: Add Line Number Support (Preferred)
```javascript
edit({
  filePath: "path/to/file",
  lineStart: 1295,  // Add these parameters
  lineEnd: 1305,
  newString: "replacement text"
})
```
**Pros**: Precise, unambiguous, standard in many editors  
**Cons**: Requires reading file first to determine line numbers

### Option 2: Smart Context Matching
Use the provided context intelligently:
1. Find all matches of `oldString`
2. For each match, check if surrounding lines (±3 lines) match the provided context
3. If exactly one match has matching context, use it
4. Only error if multiple matches pass context check

### Option 3: Nearest Match Algorithm
When multiple matches exist:
1. Calculate uniqueness score for each match based on surrounding context similarity
2. Select the match with highest uniqueness score
3. Include the "ambiguous matches" in error message for debugging

### Option 4: Interactive Disambiguation
When multiple matches found:
1. Show user the line numbers and context of each match
2. Ask user to specify which occurrence to replace
3. Or provide a "replace all" option

---

## Edge Cases to Consider

1. **Large oldStrings**: What if the unique context itself is 100+ lines? Should there be a limit?
2. **Whitespace Sensitivity**: Current exact matching is sensitive to indentation changes
3. **Performance**: Searching large files (10k+ lines) for long strings could be slow
4. **UTF-8/Encoding**: Multi-byte characters in context could cause matching issues

---

## Files Affected in This Session

- `E:\code\Fantasy-Map-Generator\DEVplans\Namebase-Verification.md` (1300+ lines, templated documentation)
- Pattern: Multiple entries with identical headers/footers

---

## Workarounds for Users (Until Fixed)

1. **Use very long oldStrings**: Include 10-15 lines of unique surrounding context
2. **Read first, then edit**: Use `read()` to identify exact location, then craft precise oldString
3. **Avoid editing repetitive sections**: Edit at unique boundaries when possible
4. **Use write() for append**: For adding to end of file, read entire file and use `write()` instead

---

## Additional Context

This issue is particularly painful when:
- Working with generated/templated files
- Editing log files or documentation with repetitive structures
- Doing batch operations where consistency is desired
- Working in large codebases where patterns repeat (e.g., test files, config files)

The error message is technically correct but provides poor developer experience. The tool should be smarter about using the context that's already provided.

---

## Contact

Reported by: AI Agent (kimi-k2.5-free)  
Working on: Fantasy-Map-Generator namebase quality improvements  
Session date: 2026-02-07

---

## Related Issues

This may be related to:
- General exact-string-matching limitations in text editing tools
- Lack of position-aware editing primitives
- No fuzzy matching or similarity scoring in the edit tool

**Priority Recommendation**: Medium-High - This impacts productivity on any non-trivial file editing task.
