---
name: namebase-verification
description: Systematic verification and cleanup of namebases-real.js language entries (slow & in-depth approach)
---

# Namebase Verification Workflow (Slow & In-Depth)

## Purpose
Verify and fix quality issues in `modules/namebases-real.js` through systematic, thorough research of each language entry, ensuring cultural and geographic authenticity.

## Instructions

### 1. Work Sequentially, Starting From Where Last Left Off

- **One language at a time** - complete full verification before moving on
- **Start where the tracker in DEVplans\Namebase-Verification.md has left off** - each language must be processed in order of i number from 0 to end of file, starting from the line number tracker has left off
- **Always add verification to the end of DEVplans\Namebase-Verification.md** - this way if you need to know where to pick up, you can just look at the end of the file.
- **Do not skip ahead** - each language must be fully completed before moving to the next
- **Do not jump between entries** - each language is processed in order of i number from 0 to end of file

### 2. In-Depth Verification Process (Per Language)

#### Phase 1: Comprehensive Research
**Step A: Language Background Research**
- Search: "[Language Name] geographic distribution countries"
- Search: "[Language Name] linguistic regions historical"
- Search: "[Language Name] place names etymology"
- Search: "[Language Name] cities towns villages authentic"
- etc
- Document: Primary countries/regions where this language is spoken

**Step B: Current Name Analysis**
- Extract all names from the `b: "..."` field
- For each name, search: "[Name] [Language Name]" or "[Name] [Country]"
- Categorize each name as: VERIFIED, SUSPICIOUS, or UNKNOWN
- Note geographic coordinates and modern vs. historical status

**Step C: Cultural Context Research**
- Search: "[Language Name] naming conventions traditional"
- Search: "[Language Name] place name patterns suffixes prefixes"
- Understand typical name structures (e.g., -burg, -ville, -stad, etc.)

#### Phase 2: Quality Assessment
**Step D: Identify Specific Issues**
For each SUSPICIOUS name, determine:
- **Geographic mismatch**: Name exists but in wrong country/region
- **Cultural mismatch**: Name follows wrong linguistic patterns
- **Generic descriptor**: "[Feature] [Type]" patterns (e.g., "Blue River")
- **Modern anachronism**: 20th century names in historical context
- **Administrative names**: Provinces, districts, regions vs. actual places
- **Duplicate/transliteration issues**: Same place in different spellings

**Step E: Verification Documentation**
Create a detailed analysis:
```
[Language Name] (i: [number])
- Total names: [count]
- Verified authentic: [count]
- Suspicious/incorrect: [count]
- Primary regions: [list]
- Issues found: [detailed list]
```

#### Phase 3: Careful Corrections
**Step F: Strategic Name Replacement**
- NEVER delete all names - maintain reasonable minimum count (minimums below)
- Replace suspicious names with VERIFIED alternatives from your research
- Prioritize: Major cities > Historic towns > Geographic features > Cultural sites
- Ensure geographic diversity within the language's region

**IMMEDIATE ACTION REQUIRED**: If issues are found during verification (such as generic descriptors, placeholder names, insufficient quantity), these must be fixed immediately in the actual `modules/namebases-real.js` file, not just documented. The verification workflow is not complete until identified issues are actually resolved. **THIS IS NOT OPTIONAL - FIX THE ACTUAL FILE.**

**Step G: Quality Control**
- Read the final list aloud - does it sound authentic?
- Check for modern anachronisms
- Verify no generic descriptors remain
- Ensure adequate name count and diversity

### 3. Documentation Standards

#### Update Verification Log
After each language, update `DEVplans/Namebase-Verification.md`:

```markdown
### [Language Name] (i: [number]) - [DATE]
**Status**: COMPLETED
**Research Time**: [X hours]
**Names Analyzed**: [count]
**Issues Found**: [count]
**Corrections Made**: [count]

**Primary Regions**: [list of countries/regions]

**Issues Identified**:
- [Specific issue 1 with examples]
- [Specific issue 2 with examples]

**Names Removed**: [list of removed names with reasons]
**Names Added**: [list of added names with sources]

**Verification Notes**: [detailed observations about naming patterns, cultural context, etc.]
```

**CRITICAL**: NEVER delete or truncate existing verification entries. Always append new entries to the end of the file. The verification log maintains a complete history of all work completed and must never be modified to remove previous entries.

### 4. Quality Standards (Strict)

#### Authenticity Requirements
- **Primary**: Names must be genuinely used in the target language/culture
- **Geographic**: Names must exist within the language's historic/current region
- **Historical**: Consider the time period appropriate for fantasy settings
- **Cultural**: Follow indigenous naming patterns and conventions

#### Automatic Disqualifications
- Generic descriptors: "[X] Sea", "[X] River", "[X] City", "[X] Town" (you can remove these describers and keep the important part of the name)
- Administrative units: Provinces, states, districts, regions
- Modern neologisms or recently founded places (post-1900)
- Obvious transliteration errors or misspellings
- Names from completely different language families

#### Minimum Standards
- Major languages (20M+ speakers): Minimum 50 authentic names
- Medium languages (1M-20M): Minimum 30 authentic names  
- Small languages (<1M): Minimum 20 authentic names

### 5. Research Resources

#### Recommended Search Patterns
- "[Language Name] cities towns villages"
- "[Language Name] place names list"
- "[Language Name] geographic features"
- "[Country] [Language Name] speaking regions"
- "Historical [Language Name] place names"

#### Quality Sources
- Wikipedia articles on language distribution
- Ethnologue language entries
- Geographic name databases (GEOnet, GeoNames)
- Academic sources on linguistics and toponymy
- Official tourism/cultural sites for target regions

### 6. Coordination & Progress Tracking

#### Work Methodology
- **One language at a time** - complete full verification before moving on
- **Document everything** - leave detailed trail of research and decisions
- **Quality over quantity** - better to do 3 languages thoroughly than 10 superficially
- **SYSTEMATIC ONE-BY-ONE PROCESS** - Every item must be fully covered. If it's worth noting, it's worth immediately fixing. No language is considered "completed" until all identified issues are actually resolved in the actual `modules/namebases-real.js` file.

#### Progress Updates
After each language completion:
1. Update the verification markdown file
2. Note next planned language
3. Summarize lessons learned for future languages

### 7. Examples of Issues to Fix
```javascript
// BAD - Contains Mexican names in Philippine language
{ name: "Kapampangan", b: "San Fernando,Angeles,Mabalacat,Guagua,Lubao,Floridablanca,Mexico,Arayat,Candaba,Macabebe" }

// BAD - Generic geographic features  
{ name: "Nenets", b: "Nenets,Okrug,Naryan-Mar,Ob River,Pechora River,Kara Sea,Novaya Zemlya" }

// BAD - Modern anachronisms
{ name: "Medieval", b: "New York,Los Angeles,Tokyo,Modern City" }

// GOOD - Authentic regional names only
{ name: "Gurage", b: "Butajira,Welkite,Wolkite,Imdibir,Endibir,Worabe,Agena,Arekit,Hosaena,Soddo,Angacha" }
```

## Goal
Transform the namebase into a meticulously researched, culturally authentic resource where every name can be traced to its proper linguistic and geographic context.