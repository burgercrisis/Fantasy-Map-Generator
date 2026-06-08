# Subagent Research Instructions for Namebase Audit

You are auditing language entries for a fantasy map generator's namebase system.

## Your Task
Read your assigned batch file at `docs/plans/namebase-research/BATCH_FILE` and research EACH language entry individually.

For each entry, you must determine:
1. **d value** - Which consonants can be doubled in this language's phonotactics? Use the reference below.
2. **family** - The language family (e.g. "Austronesian", "Bantu", "Indo-European")
3. **continent** - The correct continent (should match the JS file it's in)
4. **seeds** - 25+ place names IN THE LANGUAGE ITSELF (not English exonyms, not from the wrong region)

## D-Value Reference by Language Family
- **Romance (French)**: "lnrm" | **Romance (Spanish/Portuguese)**: "lr" | **Romance (Italian)**: "cltrpfsmbdg"
- **Germanic (English, Dutch, Scandinavian)**: "lnrt"
- **Slavic (all)**: "" (no geminates)
- **Bantu (all)**: ""
- **Austronesian (all Oceanic, Malay, etc.)**: ""
- **Semitic (Arabic, Amharic, etc.)**: "bdfghklmnqrstwxz"
- **Dravidian**: "tdnl" or "tnlrpdmk"
- **Turkic**: "lmnprstkc"
- **Uralic (Finnish, Estonian)**: "klmnprst" | **Uralic (Hungarian)**: "klmnprstz"
- **Japonic**: "kstpmnrl"
- **Chinese/Cantonese**: ""
- **Quechua**: ""
- **Nahuatl**: "lmtnxzc"
- **Inuit/Eskimo-Aleut**: "ntklrsmg"
- **Khoisan click languages**: "lnrtksxmg"
- **Greek**: "stpklnr"
- **Latin**: "lnrstpkmbdfg"
- **Berber**: "bdfghklmnqrstwxz"
- **Mongolic**: ""
- **Chadic**: ""
- **Papuan**: "" (except Dani: "ptklnrs")
- **Iranian/Persian**: "bdfghjklmnprstvxz"
- **Celtic**: "nldtsrk"
- **Mayan**: "kpt"
- **Aragonese**: ""
- **Basque**: "lnrstzkp"

## Rules
1. AUDIT EACH LANGUAGE INDIVIDUALLY - don't just guess based on family
2. If seeds are wrong (English exonyms, wrong region, etc.), REPLACE them with correct ones
3. Seeds must be OF THE LANGUAGE, not just from a region
4. Write your results to `docs/plans/namebase-research/results/BATCH_FILE` in this exact format:

```json
{
  "entries": [
    {
      "i": 123,
      "name": "Language Name",
      "file": "namebases-asia.js",
      "d": "lnrt",
      "family": "Language Family",
      "continent": "asia",
      "seeds": "Place1,Place2,Place3,...",
      "seed_count": 25,
      "notes": "any issues found"
    }
  ]
}
```

5. Use web search to research each language's phonotactics and verify seed names
6. If you can't verify something, use your best judgment based on the language family
