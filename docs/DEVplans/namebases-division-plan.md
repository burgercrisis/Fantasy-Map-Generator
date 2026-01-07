# Plan for Dividing namebases-real.js into Continent-Based Files

## Current Structure Analysis
The file `modules/namebases-real.js` contains an array `window.realWorldNameBases` with language/region namebase entries. Each entry has the following structure:
- `name`: Language or region name
- `i`: Index (sequential starting from 0)
- `min`: Minimum name length
- `max`: Maximum name length
- `d`: Diacritic or special character settings
- `m`: Mutation rate (0-1)
- `b`: Comma-separated list of base names

From the partial file view, entries range from i=0 ("German") to i=617 ("Tadaksahak"), covering languages from various continents including European, Asian, African, American, and Oceanic languages.

## Continent Categories
The entries will be divided into the following continent-based files:
- **namebases-africa.js**: African languages and regions
- **namebases-asia.js**: Asian languages and regions
- **namebases-europe.js**: European languages and regions
- **namebases-northamerica.js**: North American languages and regions
- **namebases-southamerica.js**: South American languages and regions
- **namebases-oceania.js**: Oceanic languages and regions (including Australia, Pacific islands)

## Index Handling Strategy
- **Renumber consecutively within each file**: Each continent file will have its own array with indices starting from 0.
- Example: In `namebases-europe.js`, the first European entry gets i=0, second gets i=1, etc.
- This approach maintains local indexing per continent while avoiding conflicts when files are loaded separately.

## Global/Multi-Continent Entry Handling
Some entries represent global or diaspora languages (e.g., "English Global", "Spanish Global", "Arabic Global", "Mandarin Global"). These will be placed in a separate **namebases-global.js** file to avoid duplication across continents.

For entries that have significant presence in multiple continents (e.g., colonial languages like Portuguese, French, Spanish), assign to their continent of origin:
- Spanish → Europe
- Portuguese → Europe
- French → Europe
- English → Europe
- Arabic → Asia (with global variants in namebases-global.js)

## File Structure Proposal
Each continent file will follow this template:

```javascript
"use strict";

window.realWorldNameBases = [
  // Continent-specific entries with renumbered indices
  {
    "name": "Example Language",
    "i": 0,
    "min": 5,
    "max": 12,
    "d": "settings",
    "m": 0.1,
    "b": "name1,name2,name3"
  },
  // ... more entries
];
```

## Implementation Considerations
1. **Entry Mapping**: Create a mapping script to categorize each entry by analyzing the "name" field and geographic knowledge.
2. **Global Entries**: Identify entries with "Global" in the name and extract to namebases-global.js.
3. **Index Renumbering**: During division, update the "i" field to reflect new consecutive numbering within each file.
4. **Testing**: After division, verify that each file loads correctly and contains the expected entries.
5. **Backward Compatibility**: If the original global indexing is needed, consider maintaining a separate mapping file.

## Next Steps
1. Complete full categorization of all entries
2. Implement the division script
3. Test the resulting files
4. Update any dependent code that references the global array