# Batch Entry Review: i=413 to i=554 (asia namebase)

**Date:** 2026-06-25
**File:** `modules/namebases-asia.js`
**Range:** i=413 through i=554

## Summary

The range contains **8 entries** (i=413–419 are Nepalese Doteli dialects, i=554 is Philippine Spanish). There are no entries with i=420–553.

## Entries Reviewed

---

### ENTRY: Doteli (i=413) | STATUS: ISSUES | ISSUES:
- `"Dipayal Silgadhi"` — these are TWO separate places (Dipayal and Silgadhi) written as a single string without a comma. Should be `"Dipayal,Silgadhi"`.
- `"Saileswori Temple"` and `"Badikedar Temple"` — these are temples (religious sites), not towns/cities. Acceptable as landmarks but not ideal as "place names".
- `"Terai"` — this is a geographic/physiographic region (the Terai lowland belt), not a specific town or city.
- District names used as place names: Baitadi, Dadeldhura, Bajhang, Darchula, Kailali, Kanchanpur, Achham, Bajura — these are administrative districts, not towns/cities.

---

### ENTRY: Achhami Doteli (i=414) | STATUS: ISSUES | ISSUES:
- `"Bayalu"`, `"Chaurapani"`, `"Dhakari"`, `"Bannigadi"`, `"Jupu"`, `"Kamalbazar"`, `"Panchadewal"`, `"Basti"`, `"Patalkot"`, `"Lamatoli"`, `"Sera"`, `"Bhageshwar"`, `"Marku"`, `"Dungeshwor"`, `"Thanti"` — these are villages/settlements in Achham district. While technically populated places, many are very small rural settlements.
- `"Khaptad"` — Khaptad National Park, a protected area, not a town.
- `"Dipayal,Silgadhi"` — two towns correctly separated here.
- `"Achham"` — this is a district name (administrative unit), not a town.

---

### ENTRY: Baitadeli Doteli (i=415) | STATUS: ISSUES | ISSUES:
- `"Seti River"`, `"Mahakali River"`, `"Karnali River"` — rivers, acceptable as geographic features.
- `"Khaptad"` — national park, not a town.
- `"Saileswori"`, `"Badikedar"` — temples, not towns.
- `"Terai"` — geographic region, not a town.
- `"Baitadi"`, `"Dadeldhura"`, `"Darchula"`, `"Kanchanpur"`, `"Kailali"`, `"Achham"`, `"Bajhang"`, `"Bajura"` — all district names (administrative units).

---

### ENTRY: Bajhangi Doteli (i=416) | STATUS: ISSUES | ISSUES:
- `"Khaptad"` — national park, not a town.
- `"Saileswori"`, `"Badikedar"` — temples, not towns.
- `"Seti River"`, `"Mahakali River"`, `"Karnali River"` — rivers (fine).
- `"Bajhang"`, `"Baitadi"`, `"Dadeldhura"`, `"Darchula"`, `"Kailali"`, `"Kanchanpur"`, `"Achham"`, `"Bajura"` — district names (administrative units).

---

### ENTRY: Darchuleli Doteli (i=417) | STATUS: ISSUES | ISSUES:
- `"Seti River"`, `"Mahakali River"`, `"Karnali River"` — rivers (fine).
- `"Khaptad"` — national park, not a town.
- `"Saileswori"`, `"Badikedar"` — temples, not towns.
- `"Darchula"`, `"Dadeldhura"`, `"Baitadi"`, `"Dipayal"`, `"Silgadhi"`, `"Kailali"`, `"Kanchanpur"`, `"Bajhang"`, `"Achham"`, `"Bajura"` — district names (administrative units).

---

### ENTRY: Bajureli Doteli (i=418) | STATUS: ISSUES | ISSUES:
- `"Seti River"`, `"Mahakali River"`, `"Karnali River"` — rivers (fine).
- `"Khaptad"` — national park, not a town.
- `"Saileswori"`, `"Badikedar"` — temples, not towns.
- `"Bajura"`, `"Kailali"`, `"Kanchanpur"`, `"Dipayal"`, `"Silgadhi"`, `"Baitadi"`, `"Dadeldhura"`, `"Darchula"`, `"Bajhang"`, `"Achham"` — district names (administrative units).

---

### ENTRY: Dadeldhuri Doteli (i=419) | STATUS: ISSUES | ISSUES:
- `"Seti River"`, `"Mahakali River"`, `"Karnali River"` — rivers (fine).
- `"Khaptad"` — national park, not a town.
- `"Saileswori"`, `"Badikedar"` — temples, not towns.
- `"Dadeldhura"`, `"Amargadhi"` (Amargadhi is actually the district HQ of Dadeldhura — borderline), `"Darchula"`, `"Baitadi"`, `"Dipayal"`, `"Silgadhi"`, `"Kailali"`, `"Kanchanpur"`, `"Bajhang"`, `"Achham"`, `"Bajura"` — district names (administrative units).

---

### ENTRY: Philippine Spanish (i=554) | STATUS: ISSUES | ISSUES:
- **Province names (administrative units) dominate the list:** Ilocos, Bicol, Laguna, Pangasinan, Isabela, Nueva Vizcaya, Nueva Ecija, Quirino, Aurora, Rizal, Bulacan, Bataan, Zambales, Antique, Capiz, Aklan, Guimaras, Surigao, Agusan, Bukidnon, Sarangani, South Cotabato, North Cotabato, Sultan Kudarat, Maguindanao, Lanao del Norte, Lanao del Sur — these are all provinces, not cities/towns.
- **Cities (correct):** Manila, Cebu, Zamboanga, Iloilo, Bacolod, Cagayan de Oro, Davao, Baguio, Vigan, Batangas, Cavite — these are actual cities.
- **Mixed concern:** The list is approximately 50% provinces, 50% cities. For a fantasy map generator, province names may be less useful as "place names" compared to cities/towns.
- `"La Union"` — this is a province name, not a town.
- `"Misamis"` — this is a historical province/region, not a specific town.
- `"Mindoro"`, `"Marinduque"`, `"Romblon"`, `"Siquijor"` — these are island provinces, not towns.
- `"Negros"` — island/province, not a town.
- `"Palawan"` — island province, not a town.
- `"Samar"`, `"Leyte"` — island provinces, not towns.
- `"Basilan"`, `"Tawi-Tawi"` — island provinces, not towns.
- `"Sulu"` — archipelago/province, not a town.
- `"Cotabato"` — province (also a city, but ambiguous).
- `"Lanao"` — province, not a town.

---

## Key Findings

### Pattern: Nepalese entries (i=413–419)
All 7 Nepalese entries share the same structural issues:
1. **District names used as place names** — The primary "place names" are the 8 districts where Doteli is spoken (Achham, Baitadi, Dadeldhura, Darchula, Kailali, Kanchanpur, Bajhang, Bajura). These are administrative units, not towns/cities.
2. **Temples listed as place names** — Saileswori and Badikedar are temples, not settlements.
3. **National park** — Khaptad is a national park, not a town.
4. **Rivers** — Seti, Mahakali, Karnali rivers are fine as geographic features.
5. **Missing comma** — In i=413, "Dipayal Silgadhi" should be "Dipayal,Silgadhi".

### Pattern: Philippine Spanish (i=554)
1. **Province names mixed with city names** — Roughly half the entries are provinces (administrative units), half are cities.
2. **Island names** — Several entries are islands (Mindoro, Marinduque, Romblon, Siquijor, Negros, Palawan, Samar, Leyte, Basilan, Tawi-Tawi).
3. **Historical regions** — "Ilocos", "Misamis", "Lanao" are traditional regions/provinces.

## Recommendations
- For Nepalese entries: Replace district names with actual town/city names from within those districts (e.g., use "Amargadhi", "Jayaprithvi", "Mangalsen", "Sanfebagar", "Chainpur", "Dhangadhi" which are actual municipalities).
- For Philippine Spanish: Replace province/island names with actual city/municipality names (e.g., use "Cebu City", "Makati", "Taguig", "Pasig", "Caloocan", "Mandaluyong" instead of just province names).
- Fix the "Dipayal Silgadhi" → "Dipayal,Silgadhi" issue in i=413.
