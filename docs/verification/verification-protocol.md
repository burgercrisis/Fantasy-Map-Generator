# Verification Protocol — Bulletproof Edition

> **This document replaces ALL previous verification instructions.**
> Read this file in full before starting ANY verification work.

---

## 0. BEFORE YOU TOUCH A SINGLE NAME — MANDATORY READ

This protocol exists because every previous agent — every single one — fell into the same trap:
researching a language's region, then stuffing the `b:` field with nearby towns from that region
while claiming each name was "verified." That is NOT verification. That is regional estimation.
It produces garbage data that looks plausible but is fundamentally wrong.

**The core principle, stated plainly:**

A name belongs in a language's `b:` field ONLY if you can answer YES to ALL of these:
1. Does this place physically exist? (city, town, village, hamlet — not a province, not a river)
2. Do speakers of THIS specific language live there, or historically live there?
3. Did speakers of this language coin this name, or is it the common name used BY speakers of this language for their own settlement?

If you cannot answer yes to ALL THREE, the name does NOT belong.

### What "verified" actually means

Verified = you opened a web page that confirms the place exists AND has a connection to the language AND the name form is authentic to the language.

NOT verified = "it's in the same country" or "it's nearby" or "I found it on a Wikipedia page about a different language" or "it sounds like it could be from that language" or "the etymology is from that language but the name form is colonial."

### The colonial name trap (READ THIS CAREFULLY)

For indigenous languages, many places have colonial Spanish/Portuguese/English names that replaced the original indigenous names. **Finding that a colonial name has an indigenous etymology does NOT verify the colonial name as an entry in the indigenous language.**

Example: The Quechua entry uses "Cusco" — this is the Spanish colonial form. The authentic Quechua name is "Qusqu." If you search for "Cusco Quechua etymology" and find it comes from "Qusqu," you have NOT verified "Cusco" as a Quechua name. You have verified the etymology of a Spanish name.

**The rule:** For indigenous language entries, you must find the name form actually used IN that language, not just the colonial name that replaced it. If the only name you can find is the colonial form, you must explicitly note this in the log and consider whether the entry should use the indigenous form instead.

### Rate limit handling

If you hit 3 consecutive web search rate limits (429 errors):
1. Log the searches you attempted
2. Mark remaining unverified names as WAITING
3. Move to the next entry
4. Do NOT wait more than 5 minutes total for rate limits

### No declaring done prematurely

You CANNOT declare an entry "COMPLETE" unless you have individually verified EVERY name in the b: field. If you have verified some names but not others, the entry is PARTIALLY VERIFIED — not complete. Do not let the pace of work pressure you into declaring done prematurely.

### The punishment for regional estimation

If you add a name you haven't individually verified, you are CORRUPTING the data.
This is worse than leaving the entry broken, because broken data can be fixed but corrupted data looks correct. The downstream language mixer will generate plausible-sounding fake names that poison the entire map generation pipeline.

**DO NOT DO THIS.**

---

## 1. WORKFLOW — ENTRY BY ENTRY (NO EXCEPTIONS)

### Step 1: Read the entry
- Open `modules/namebases-<continent>.js`
- Read the entry's `name`, `i`, `min`, `max`, `d`, `m`, and `b:` fields.
- Count the names in `b:`.

### Step 2: Research the language
For the language name in the `name` field:
1. Search `"<Language>" language Wikipedia`
2. Note: countries where spoken, speaker count, specific villages/towns where concentrated
3. Note: typical place name patterns for this language family
4. Note: the language's phonology (consonants, vowels, syllable structure, tone)
5. If the Wikipedia article mentions specific villages/towns, **WRITE THESE DOWN** for use in Step 4.

### Step 3: Verify EVERY existing name in `b:`
For EACH name currently in the `b:` field:
1. Search `"<name>" town OR city OR village` to confirm it exists
2. If it exists, confirm it has a connection to the language (same country/region at minimum)
3. Check the name against the language's phonotactic patterns (Step 2 notes)
4. If it does NOT exist, or has NO connection to the language, or VIOLATES phonotactics — REMOVE IT
5. If it's an administrative unit (province, state, district, county), REMOVE IT
6. If it's a geographic feature (river, lake, mountain, ocean), REMOVE IT
7. If it's a language name or ethnic group name (not a place), REMOVE IT
8. If it's a country name, REMOVE IT

**Track removals in your verification log.**

### Step 4: Expand to minimum threshold
After Step 3, count the remaining verified names. If below the minimum (30 for small, 50 for medium, 80 for major), you MUST add more.

**How to find verified additions ONLY:**
1. Look at the Wikipedia article for the language — it often lists specific villages
2. Search `"<Language> villages" OR "<Language> settlements" OR "<Language> place names"`
3. Search `"villages in <specific region where language is spoken>"` — Wikipedia pages for districts/communes often list villages
4. Search `"List of cities in <country>"` — find cities in the language's region
5. Use GEOnames.org or GeoNames.org to search for places in the specific region

**For EVERY name you add:**
- Confirm it exists as a real place
- Confirm speakers of this language live there or historically lived there
- Check it against the language's phonotactic patterns
- **WRITE DOWN THE SOURCE URL** where you found it

### Step 5: Check mixer map references
1. Open `config/language-mixer-map.json`
2. Search for the entry's `i` value
3. Verify that every ISO code that references this index is INTENTIONAL
4. If an unrelated ISO code references this index, note it in the log and flag for integrator

### Step 6: Verify other entry fields
- `min` / `max`: Must match actual name length distribution in `b:`
- `d`: Must match language's actual doubled-letter patterns from phonology
- `m`: Must be appropriate for the language (0 for no multi-word, 0.1 default, higher for languages with multi-word names)

### Step 7: Log your work (MANDATORY)
For EACH entry, append a verification log entry to `docs/verification/research/by-language/<language-name>.md`:

```markdown

---

## <Language Name> (i=<index>)

**Status:** COMPLETE | WAITING
**Confidence:** HIGH | MEDIUM | LOW | WAITING
**Date:** YYYY-MM-DD
**Agent:** <agent name>

### Removed Names (N)
| Name | Reason |
|------|--------|
| `oldname` | administrative unit / geographic feature / not verified / duplicate / wrong language / phonotactic violation |

### Added Names (N)
| Name | Source | Language Connection |
|------|--------|---------------------|
| `newname` | [URL or citation] | [how this name relates to the language specifically] |

### Research Log
- Search 1: [query] → [result]
- Search 2: [query] → [result]
- Search 3: [query] → [result]
- Sources consulted: [count]

### Phonology Check
- Source: [URL for phonology reference]
- Key patterns: [e.g., CV structure only, /s/ only in loanwords, 4 tones]
- Names flagged: [any names that violate phonotactics]

### Mixer Map Check
- Index `i` referenced by: [list ISO codes]
- All references intentional: YES/NO
- Issues: [if any]

### Final Verification
- Total verified names: X/25 minimum
- Minimum threshold met: YES/NO
- NO names added without individual verification: YES/NO
- If WAITING: explain what was tried and why insufficient
```

### Step 8: Write back to the file
Replace the `b:` field with the verified names. No duplicates. No invalid entries.

### Step 9: Update checkpoint
Update `docs/verification/checkpoints/<continent>-checkpoint.json` with current position.

---

## 2. HARD RULES — BREAK ANY OF THESE AND YOUR WORK IS INVALID

### Rule 1: No regional estimation
You MAY NOT add a name because "it's in the same country" or "it's nearby" unless you can confirm the language is spoken there.

### Rule 2: No Wikipedia dump
You MAY NOT take all towns from a Wikipedia article about a neighboring language or the same region and dump them into an entry. Each name must have a documented connection to THE specific language.

### Rule 3: No more than 5 names from one source
You MAY NOT take more than 5 names from any single web search result. If you need 30 names, you need at least 6 different sources. **Exception:** For micro-languages (<1000 speakers) where the Wikipedia article is the ONLY source that mentions any specific villages, you may use all names from that article, but you must note this in the log.

### Rule 4: Every name gets a source
You MUST log where you found EVERY name you add. If you can't find a source, don't add the name.

### Rule 5: Micro-language protection

If a language has <1000 speakers AND you cannot find 30 verified names after at least 3 separate web searches:
1. Log the searches you tried
2. Mark the entry as WAITING in the verification log
3. Do NOT pad with unverified regional names
4. Move to the next entry

### Rule 5b: The "no documented toponymy" problem

Some languages — particularly Papuan, Australian Aboriginal, and small island languages — have essentially NO documented place names in online sources. The language is real, the speakers exist, but no one has published a list of villages where they live.

**What to do:**
1. Search for the language on Wikipedia, Ethnologue, Glottolog, and New Guinea World (for Papuan languages)
2. Note the specific geographic area where the language is spoken (river valley, island, district)
3. Search for villages in that specific area using GeoNames.org
4. If you can find villages in the area but cannot confirm they are specifically associated with the language, note this in the log
5. If you cannot find ANY villages in the area, mark the entry as WAITING with a detailed explanation

**What NOT to do:**
- Do NOT fill the entry with names from a nearby language just to hit the threshold
- Do NOT use names from the same region without confirming the language connection
- Do NOT mark the entry COMPLETE if you cannot verify the names

### Rule 6: Diff format
When editing an entry, you MUST track which names you removed and which you added. Replace the entire `b:` field in a single edit, but document the diff in the verification log.

### Rule 7: No administrative units
NEVER include: provinces, states, districts, counties, regions, departments, communes (as opposed to specific villages within them), countries, geographic features (rivers, mountains, lakes).

### Rule 8: Checkpoints every 10 entries
Update the checkpoint file after every 10 completed entries. If you stop, the next agent can resume from the checkpoint.

### Rule 9: No bulk scripting
You MAY NOT write scripts to do bulk replacements across multiple entries. Each entry must be researched and edited individually. The only exception is fixing identical placeholder strings (the same 200+ city list appearing in multiple entries) — but even then, each entry's replacement must be individually researched afterward.

**Why:** Scripts don't verify. They replace. Verification requires human judgment per name per language. A script that replaces a placeholder with "plausible" names from a list is just automated regional estimation.

### Rule 10: Per-name source log
For EVERY name in the final `b:` field, you MUST be able to answer: "Where did this name come from?" The answer must be one of:
- A specific URL where the name was found in connection with the language
- A specific citation (book, paper, database) where the name appears
- "Already present, verified against [source]" for names that were already in the entry and confirmed valid

If you cannot answer this for a name, that name should not be in the field.

**The verification log IS the source log.** Every name in the Added Names table must have a source. This is non-negotiable.

---

## 3. MINIMUM THRESHOLDS

| Language Size | Minimum | Target |
|---------------|---------|--------|
| Major (>20M speakers) | 80 | 100+ |
| Medium (1M-20M) | 50 | 75+ |
| Small (<1M) | 30 | 50+ |
| Micro (<1000) | WAITING if <30 found | 30+ |
| All languages | **25 (absolute minimum)** | |

**If an entry has fewer than 25 names after Step 3 (removing invalid ones), you MUST expand it.
If you cannot expand it because the language is too small/marked, mark it WAITING and explain why in the log.**

---

## 4. PROHIBITED PATTERNS — DO NOT DO ANY OF THIS

This is the exact pattern every previous agent followed. DO NOT repeat it.

❌ "I researched the language and found it's spoken in Nigeria, so I added Nigerian city names"
❌ "I found the language is in Cameroon, so I added Cameroonian towns from Wikipedia"
❌ "The language is in Chad, so I added cities from a 'cities in Chad' Wikipedia page"
❌ "The language is nearly extinct with only 100 speakers, so I padded with nearby regional towns to reach 30"
❌ "I found one Wikipedia article that listed towns in the region, and used all of them"
❌ "I verified the language exists, then filled the b: field with any places I could find from its country"
❌ "I found the etymology is from that language, so the name is verified" — NO. Colonial names with indigenous etymologies are NOT verified indigenous-language names.
❌ "I verified 70% of the names, so the entry is COMPLETE" — NO. Every name must be verified.
❌ "I wrote a script to replace all placeholders with regionally-appropriate names" — NO. Scripts don't verify.

**All of the above produce CORRUPTED data.**

Instead:
✅ "I verified each individual name exists and has a documented connection to the language"
✅ "I searched for the language's specific villages and found them mentioned in this source"
✅ "The language has <1000 speakers and only 12 verified place names exist after extensive searching — marked WAITING"
✅ "I found the colonial name has an indigenous etymology, so I replaced it with the authentic indigenous form"
✅ "I checked each name against the language's phonology and removed 3 that violated phonotactic patterns"

---

## 5. VERIFICATION LOG FORMAT

Every entry MUST get a log entry in `docs/verification/research/by-language/<name>.md`.

The structure is non-negotiable — see the template in Step 7 above.

---

## 6. ENTRY PROMPT

To start verification work for any continent:

1. Read THIS file (`docs/verification/verification-protocol.md`)
2. Read `docs/verification/agents/<CONTINENT>-AGENT.md` for continent-specific guidance
3. Read `docs/verification/region/<CONTINENT>.md` for region context
4. Check `docs/verification/checkpoints/<CONTINENT>-checkpoint.json` for where to resume
5. Begin from the checkpoint position, following the workflow in Step 1 above
6. After every 10 entries, update the checkpoint

**Do not skip any steps. Do not improvise. Follow the protocol exactly.**

---

## 7. WHAT "COMPLETE" LOOKS LIKE

An entry is COMPLETE when:
- Every name in `b:` exists as a real place (city/town/village/hamlet)
- Every name has a documented connection to the specific language
- **For indigenous languages: the name form is authentic to the language, not a colonial replacement**
- Every name passes phonotactic verification against the language's documented phonology
- The minimum threshold is met (or WAITING is justified)
- The mixer map references have been checked
- The verification log has been written with per-name sources
- The checkpoint has been updated

An entry is NOT complete when:
- You added names from the region without verifying the language connection
- You padded with nearby towns to hit the number
- You haven't written a verification log entry
- You cannot justify every name in the `b:` field
- **You found colonial names with indigenous etymologies and declared the entry verified**
- **You verified only some names and declared the entry complete**
- **You didn't check phonotactic patterns**
- **You didn't check mixer map references**

---

## 8. PHONOTACTIC VERIFICATION — CHECK THE SOUND PATTERNS

Every name in `b:` must be checked against the language's actual phonotactic patterns. This is NOT optional and NOT the same as "it sounds plausible."

### How to do this:

1. **Find the language's phonology.** Search `"<Language>" language phonology` or read the Wikipedia article's phonology section. Note:
   - Which consonants and vowels exist
   - Which consonant clusters are allowed
   - Whether the language is tonal
   - Typical syllable structure (CV, CVC, etc.)
   - Whether certain sounds only appear in loanwords

2. **Check each name against the phonology.** A name that violates the language's phonotactic patterns cannot be from that language.

### Examples:

**Rumu language** (Papuan Gulf, tonal):
- Phonology: /r/ → [l] word-initial, /w/ → [β] before front vowels, /s/ ONLY in loanwords, 4 tones
- Names containing /s/ that aren't near a known loanword source are suspect
- Names should have CV or CVC structure, vowel-final is common
- Check: "Kopi" ✅ (CV.CV, no illegal consonants), "Waira" ✅ (CVV.CV, valid)

**Tok Pisin** (English-based creole):
- No complex consonant clusters (simplified from English)
- No /θ/ or /ð/ — replaced by /t/ and /d/
- Final devoicing: /g/ → [k], /d/ → [t], /b/ → [p]
- Check: "Lae" ✅ (CV.V, valid), "Madang" ✅ (CV.CVC, valid)

### Red flags:
- Names with consonant clusters the language doesn't allow
- Names with sounds that don't exist in the language's inventory
- Names that follow the phonotactic patterns of a DIFFERENT language in the same region
- For tonal languages: names that don't match known tonal patterns (if documented)

### Log requirement:
In your verification log, note the phonology source and any names that were flagged or removed due to phonotactic violations.

---

## 9. CHECK MIXER MAP REFERENCES

After verifying an entry's `b:` field, you MUST check that the entry's `i` (index) value is correctly referenced in the mixer map.

### How to do this:

1. Open `config/language-mixer-map.json`
2. Search for the entry's `i` value
3. Verify that every ISO code that references this index is INTENTIONAL
4. If an unrelated ISO code references this index, it means that language will draw names from this entry — which may be wrong

### What to do if you find a mismatch:
1. Note it in the verification log
2. Fix the mixer map reference if you have permission
3. Flag it for the integrator if you don't

---

## 10. VERIFY OTHER ENTRY FIELDS

The `b:` field is not the only field that needs verification. Check ALL fields:

### `min` and `max` fields:
- Look at the actual name lengths in `b:`
- `min` should be ≤ the shortest name length
- `max` should be ≥ the longest name length
- The range should be at least 2
- If all names are 5-8 characters, `min: 3, max: 15` is wrong

### `d` field (doubled-letter permission):
- Check the language's phonology for which consonants can be doubled
- Romance languages: `nlrs` — correct
- Germanic languages: `lnrt` — correct
- Papuan languages: often empty string — correct
- If `d` contains letters that the language doesn't have, it's wrong

### `m` field (multi-word rate):
- 0 = no multi-word names
- 0.1 = ~10% multi-word (good default)
- Higher values for languages with multi-word place names
- If any names in `b:` contain spaces, `m` should be > 0

---

## 11. PRACTICAL EXAMPLES — RIGHT VS WRONG

### Example: Quechua entry

**WRONG (what every previous agent did):**
1. Search "Cusco" → find it's a real city in Peru
2. Search "Cusco etymology" → find it comes from Quechua "Qusqu"
3. Declare "Cusco" as verified Quechua name ❌

**RIGHT:**
1. Search "Cusco" → find it's a real city in Peru
2. Search "Cusco etymology" → find it comes from Quechua "Qusqu"
3. Recognize that "Cusco" is the Spanish colonial form, not the Quechua form
4. Search for "Qusqu" → find it's the authentic Quechua name
5. Either: replace "Cusco" with "Qusqu" in the entry, OR log that "Cusco" is a colonial form with Quechua etymology but is not the authentic Quechua name
6. Only then declare verified ✅

### Example: Yanomami entry

**WRONG:**
1. Search "Yanomami language" → find it's spoken in Brazil/Venezuela
2. Search "cities in Roraima Brazil" → find Boa Vista, Caracaraí
3. Add them to the Yanomami entry ❌ (these are Portuguese names, not Yanomami names)

**RIGHT:**
1. Search "Yanomami language" → find it's spoken in Brazil/Venezuela
2. Search "Yanomami villages" → find specific Yanomami settlement names
3. Search each name individually → confirm it's a real Yanomami settlement
4. Only add names that are specifically Yanomami settlements ✅

---

## 12. TOOLING

After EVERY edit to a namebase file:
```bash
pnpm run mixer:guardrails
```

After every 10 entries:
```bash
pnpm run mixer:health
```

If either fails, STOP and fix the issue before proceeding.

### Additional check — search for your changes:
After editing, search the file for the language name to confirm your changes were applied correctly:
```bash
grep -n "LanguageName" modules/namebases-<continent>.js
```

### Regenerate language mixes after changes:
```bash
node tools/mixer-core/generate-language-mixer.js
```
