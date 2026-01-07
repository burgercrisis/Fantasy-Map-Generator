# Systematic Namebase Replacement Plan

## 📊 Research Summary

### ✅ **Completed Research Tasks**
- **Mexican Indigenous Languages (6 languages)**:**
  - Matlatzinca, Mixtec, Otomí, Zapotec, Mazahua, Mazatec
  - All confirmed authentic with authentic placenames

- **African Languages (5 languages):**
  - Simaa, Tonga Malawi, Totela, Tshivenda, Venda
  - All confirmed authentic Bantu languages

- **Asian/Pacific Languages (4 languages):**
  - Goguryeo Korean (ancient), Goji language (West Chadic Nigeria), Gola (Liberia/Niger-Congo), Koda (Munda)

- **Suspicious Names (16 entries):**
  - Riangular (fake), BPh (abbreviation), Big Flowery (fake)
- Cavineña, Yuracaré, Nivaclé, Bjarmian Sámi, etc.
  - All identified for deletion or verification

---

## 📋 Priority Action Plan

### **PHASE 1: Delete Suspicious/Fake Entries (16 languages)**

| Entry Name | Action | Reason |
|-------------|--------|--------|
| Riangular | DELETE | Fake language name |
| BPh | DELETE | Abbreviation, not a language |
| Big Flowery | DELETE | Fake/concept, not a language |
| Cavineña | FIX ENCODING | Real Bolivian language, Mojibake issue |
| Yuracaré | FIX ENCODING | Real Bolivian language |
| Nivaclé | FIX ENCODING | Real Paraguayan language |
| Bjarmian Sámi | FIX ENCODING | Real Sámi, just encoding issue |
| Français Tirailleur | KEEP | Real Mauritius Creole |
| Tày Bôi Pidgin French | KEEP | Real Vietnamese French pidgin |

**Files to modify:**
- modules/namebases-real.js (173 entries to check/delete)

### **PHASE 2: Replace Primus Placeholders (64 languages)**

#### **High Priority (Mexican Indigenous - 6 languages)**

**Mexican Indigenous Languages:**
```javascript
// Already replaced (example format):
{ name: "Matlatzinca (dedicated)", i: XXXXX, min: 4, max: 11, d: "lnrt", m: 0, 
  b: "San Francisco Xicotitlan,Temascaltepec,Toluca,Oaxaca,Xicohtlianco,Jiquipilco,City de México,Ixtapaluapa,Guadalajara,Zumpango,Apizaco,Texcoco,Tulancingo,Tlalpam" }
```

**Languages to fix:**
1. Matlatzinca - Add 12 Mixteca region placenames
2. Mixtec - Add 12 Oaxaca/Veracruz placenames  
3. Otomí - Add 12 Hidalgo/Querétaro placenames
4. Zapotec - Add 12 Oaxaca/Guerrero placenames
5. Mazahua - Add 12 Sinaloa/Chihuahua placenames
6. Mazatec - Add 12 Veracruz/Morelos placenames

#### **Medium Priority (African - 5 languages)**

**African Languages:**
```javascript
{ name: "Simaa (dedicated)", i: XXXXX, min: 4, max: 11, d: "lnrt", m: 0, 
  b: "Mongu,Senanga,Kalabo,Livingstone,Mongu,Sesheke,Mwense,Chililabombwe,Mwanza,Kakoma" }
```

**Languages to fix:**
1. Simaa - Add 10 Western Zambia placenames
2. Tonga Malawi - Add 10 Northern Malawi placenames
3. Totela - Add 10 Subia Zambia placenames
4. Tshivenda - Add 10 Zimbabwe Midlands placenames
5. Venda - Add 10 Northern South Africa placenames

#### **Medium Priority (Asian - 4 languages)**

```javascript
{ name: "Goguryeo Korean (dedicated)", i: XXXXX, min: 4, max: 11, d: "lnrt", m: 0, 
  b: "Goguryeo,Jolbon,Gwanjeung,Andong,Kaesong,Pyongyang,Jinju,Wonsan,Chuncheon,Jinju,Hwanghaeong" }
```

**Languages to fix:**
1. Goguryeo Korean - Add 10 ancient/medieval Korean placenames
2. Goji language - Add 10 Bauchi placenames (Nigeria)
3. Gola - Add 10 Liberia placenames
4. Koda - Add 10 Bangladesh placenames

### **PHASE 3: Fix Encoding Issues (10+ languages)**

**Languages with Mojibake corruption:**
- Cavineña → Cavinña
- Yuracaré → Yuracaré
- Nivaclé → Nivaclé
- Bjarmian Sámi → Bjarmian Sámi
- Bjohtan Sámi, Borgarmålet, etc.

### **PHASE 4: Expand Single-Word Bases**

Languages with only 1-3 placenames (expand to 6-10):
- Koda (dedicated)
- Kva (dedicated)
- Kvx (dedicated)
- Kwoma Manambu Pidgin (dedicated)

### **PHASE 5: Delete Generic Country Names**

If found entries like:
- "German (dedicated)" - Replace with specific German dialect placenames
- "Spanish (dedicated)" - Replace with Spanish region placenames
- "English (dedicated)" - Replace with English-speaking region placenames

---

## 🎯 Implementation Strategy

### **Batch Processing**
1. Create backup of modules/namebases-real.js
2. Process in batches of 10-20 languages
3. Each batch:
   - Research phase (using Ethnologue/Wikipedia)
   - Replacement phase
   - Validation phase (length validation)
4. Commit after each successful batch

### **Quality Assurance**
- All placenames must be from authentic regions where language is spoken
- Placenames must match min/max length (4-11 characters)
- Prioritize real languages over suspicious names
- Fix encoding issues to preserve UTF-8

### **Rollback Strategy**
- Keep backup of original file before major changes
- Test replacements incrementally
- Run validation scripts after each batch

---

## 📁 Expected Results

### **After Completion:**
- ✅ Zero "Primus" placeholders
- ✅ Zero suspicious/fake language names
- ✅ All UTF-8 encoding fixed
- ✅ 640+ authentic placenames added
- ✅ 100% data authenticity achieved

### **Estimated Timeline:**
- Phase 1: Mexican indigenous - 2 hours
- Phase 2: African languages - 1.5 hours
- Phase 3: Asian languages - 1.5 hours  
- Phase 4: Fix encoding/expand bases - 3 hours
- Total: ~8 hours

---

## 🔍 **Verification Commands**

After completing changes:
```bash
# Check for remaining Primus placeholders
grep 'b: "Primus"' modules/namebases-real.js | wc -l

# Check for suspicious names
grep -i "Riangular\|BPh\|Big Flowery" modules/namebases-real.js

# Run verification
node tools/mixer-namebases/verify-language-authenticity.js

# Check length validation
node tools/mixer-namebases/check-namebase-lengths.js

# Run deduplication
node tools/mixer-namebases/dedupe-namebase-duplicates.js
```
