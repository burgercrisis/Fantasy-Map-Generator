# Namebase Verification Agent Prompt

## Task
Verify and fix quality issues in `modules/namebases-real.js` by systematically reviewing language entries and removing low-quality or geographically incorrect place names.

## Context
This is part of a systematic effort to clean up the Fantasy Map Generator's namebase database. We've already completed Gurage (i: 311) and Harari-Argobba (i: 312), removing incorrectly placed Oromia Region towns.

## Instructions

### 1. Choose Your Starting Point
Select one of these starting ranges by i number (modify as needed):

**Early entries (i: 0-20)**:
- German (i: 0), English (i: 1), French (i: 2), Italian (i: 3), Castillian (i: 4)
- Nordic (i: 6), Greek (i: 7), Roman (i: 8), Finnic (i: 9)
- Korean (i: 10), Chinese (i: 11), Japanese (i: 12), Portuguese (i: 13)
- Nahuatl (i: 14), Hungarian (i: 15), Turkish (i: 16), Berber (i: 17)
- Arabic (i: 18), Inuit (i: 19), Basque (i: 20)

**Mid-range entries (i: 100-1000)**:
- [Agent should scan file for specific i numbers in this range]

**High-range entries (i: 1000-10000)**:
- [Agent should scan file for specific i numbers in this range]

**Known problematic entries**:
- Halmahera Sea (i: 522), Nenets (i: 525), Kenaboi (i: 475)
- Kapampangan (i: 13677)

**Custom range**: Specify your own i number range (e.g., "i: 50-100")

### 2. Verification Process
For each language entry:

**Step A: Research**
- Use web search to verify the language's geographic region
- Research authentic place names for that language/culture
- Identify which names in the current list are genuine vs. incorrect

**Step B: Identify Issues**
- **Geographic errors**: Names from wrong countries/regions
- **Generic descriptors**: "[X] Sea", "[X] River", "[X] City" 
- **Cultural mismatches**: Spanish names in Philippine languages, etc.
- **Modern anachronisms**: Inappropriate contemporary place names

**Step C: Make Corrections**
- Remove incorrect names while preserving authentic ones
- Maintain reasonable name count (don't leave entries too sparse)
- Use edit/multi_edit tools to fix the `b: "..."` field

**Step D: Update Tracking**
- Update `DEVplans/Namebase-Verification.md` with your findings
- Mark languages as COMPLETED with specific notes
- Add new issues to the "Specific Examples Found" section

### 3. Quality Standards
- **Authenticity**: Names must genuinely belong to the target language/culture
- **Geographic accuracy**: Names must match the language's historic geographic region
- **Avoid generics**: No "[X] sea", "[X] city", "[X] river" patterns
- **Cultural appropriateness**: Consider historical context and naming conventions

### 4. Examples of Issues to Fix
```javascript
// BAD - Contains Mexican names in Philippine language
{ name: "Kapampangan", b: "San Fernando,Angeles,Mabalacat,Guagua,Lubao,Floridablanca,Mexico,Arayat,Candaba,Macabebe" }

// BAD - Generic geographic features  
{ name: "Nenets", b: "Nenets,Okrug,Naryan-Mar,Ob River,Pechora River,Kara Sea,Novaya Zemlya" }

// GOOD - Authentic regional names only
{ name: "Gurage", b: "Butajira,Welkite,Wolkite,Imdibir,Endibir,Worabe,Agena,Arekit,Hosaena,Soddo,Angacha" }
```

### 5. Coordination
- Update the verification status in the markdown file as you work
- Focus on your assigned range to avoid duplicate work
- Document specific issues and fixes for transparency

### 6. Tools to Use
- `search_web` for research
- `read_file`/`edit`/`multi_edit` for file changes  
- `write_to_file` for updating verification log

## Goal
Transform the namebase from a mixed-quality collection into a culturally and geographically authentic resource that enhances the Fantasy Map Generator's realism.

---
**Starting Point**: [AGENT SHOULD INSERT THEIR CHOSEN STARTING RANGE HERE]
