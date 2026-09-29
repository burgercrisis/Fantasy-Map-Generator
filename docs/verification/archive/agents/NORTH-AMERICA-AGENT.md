# North America Agent — Language Namebase Verification

## Your Assignment

You are responsible for verifying ALL 232 language entries in `modules/namebases-northAmerica.js`.

This file primarily contains Indigenous languages of North America, Central America, and the Caribbean.

**Critical principle**: Names are defined by the LANGUAGE that coined them, not by the region they're in. Your job is to ensure every name in each entry is authentically from that language.

## Your Workspace

- **Source file**: `modules/namebases-northAmerica.js`
- **Progress log**: `docs/verification/reports/north-america-progress.md`
- **Checkpoint**: `docs/verification/checkpoints/north-america-checkpoint.json`
- **Research notes**: `docs/verification/research/by-language/<name>.md`
- **Continent findings**: `docs/verification/research/by-continent/north-america-findings.md`

## Processing Order

Process entries **strictly in file order** (sequential, from top to bottom). Do NOT skip around or reorder by language size. This ensures predictable progress and makes resumption from checkpoints straightforward.

## Common Issues to Watch For

### 1. Colonial-Language Names in Indigenous Bases
Many indigenous language entries are contaminated with English, French, or Spanish colonial names. **Prefer names from the indigenous language.** The test is: "Was this name coined by speakers of this language?"

- ❌ "Red Lake", "White Earth", "Mille Lacs", "Fond du Lac" in Ojibwe → English/French names
- ❌ "Sioux Falls", "Rapid City", "Fargo", "Bismarck" in Dakota → English names
- ❌ "Window Rock", "Shiprock", "Tuba City" in Navajo → English names
- ❌ "Santa Fe", "Albuquerque" in Navajo/Apache → Spanish names

### 2. Language Names as Place Names
Never use the language name itself as a place name:
- ❌ "Eyak" in Eyak entry
- ❌ "Cherokee" in Cherokee entry
- ❌ "Wiyot" in Wiyot entry
- ❌ "Holikachuk" in Holikachuk entry

### 3. Ethnic Group Names as Place Names
Never use ethnic group names as place names:
- ❌ "Tlingit", "Inupiat", "Yupik", "Nunamiut", "Sugpiaq", "Aleut", "Alutiiq" in Tlingit entry

### 4. Person Names as Place Names
Never use person names as place names:
- ❌ "Lone Wolf", "Satanta", "Kicking Bird", "Big Tree", "Ten Bears" in Kiowa entry
- ❌ "Standing Bear" in Muscogee entry

### 5. Event Names as Place Names
Never use event names as place names:
- ❌ "Trail of Tears" in Muscogee entry

### 6. Administrative Region Names
Never use political/administrative region names:
- ❌ "Georgia", "Florida", "Oklahoma", "Indian Territory" in Muscogee entry
- ❌ "Kiowa County", "Caddo County", "Comanche County" in Kiowa/Comanche entries
- ❌ "Tuscarora" entry had 28 NC county names — all removed

### 7. Cross-Contamination Between Indigenous Languages
Names from one indigenous language appearing in another's entry. This is a common copy-paste bug:
- ❌ Zapotec/Chatino/Mixtec names in Mixe entry
- ❌ Cuicatec/Zapotec names in Huichol entry
- ❌ Amuzgo names in Chontal Maya entry
- ❌ Oaxaca-region names in Sierra Popoluca entry

### 8. Very Small Name Sets
Many indigenous languages may have very few documented place names. Do your best to find authentic names. Include historical place names if modern ones are scarce.

### 9. Cross-File Issues
Some languages span North and South America (Quechua, Arawakan). Ensure entries have names from the language as spoken in North/Central America.

## Verification Workflow

Same as the general workflow in MASTER-PLAN.md.

### Step 1: Research the Language
1. Search Wikipedia: `"<Language>" language`
2. Note: traditional territory, current communities, speaker count
3. Note: typical place name patterns and romanization standards
4. Note: language family and related languages

### Step 2: Verify Each Name
1. Extract all names from the `b:` field
2. Count them — if <25, flag for expansion
3. Spot-check at least 20% of names (minimum 10)
4. For each checked name:
   - Verify it's a real place
   - Verify the name is authentically from the correct language
   - Verify it's in Romanized form
   - Prefer indigenous-language names over colonial names

### Step 3: Expand if Needed
If fewer than 30 names (50 preferred):
1. Search for place names from the language itself
2. Use Wikipedia lists of indigenous communities
3. Use tribal government websites for community names
4. Include historical place names if modern ones are scarce

### Step 4-6: Same as general workflow

## Quality Checklist Per Language

- [ ] Language name is a real language
- [ ] All names in `b:` are real places
- [ ] All names are from the correct LANGUAGE (language determines name origin, not geography)
- [ ] All names use Latin/Romanized script
- [ ] Minimum 25 names (target 50+)
- [ ] Prefer indigenous-language place names over colonial names
- [ ] No language names used as place names
- [ ] No ethnic group names used as place names
- [ ] No person names used as place names
- [ ] No event names used as place names
- [ ] No administrative region names
- [ ] No cross-language contamination from other indigenous languages
- [ ] `min`/`max` are reasonable
- [ ] `d` value matches language phonotactics
- [ ] No encoding issues

## Research Sources

1. **Wikipedia**: Language articles, tribal articles
2. **Native-Land.ca**: Indigenous territory maps
3. **Tribal government websites**: Official community names
4. **Ethnologue**: Language details
5. **GEOnet**: Official geographic names
