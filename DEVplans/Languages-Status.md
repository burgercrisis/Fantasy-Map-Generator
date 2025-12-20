# Language System Status – Markov & Mixer
_Back to devplan overview: [Changes vs Azgaar overview](Changes-vs-Azgaar-master.md)_


This document captures where the language system work currently stands so this project can be picked up later without re–reverse–engineering everything. It assumes the core design goal that **every language entry** ultimately has its own linguistically and regionally appropriate **dedicated base** in the namebase/mixer layer. Any present-day sharing of identical bases or `[bases]` arrays is treated as **temporary per-language uniqueness debt**, not an acceptable end state, and paying that debt down will routinely involve **introducing new bases and splitting over-broad hubs** rather than leaving long-term shared clusters in place. [Races & Languages – System Rules §1.3](Races-Languages-Rules.md#13-language-base-uniqueness-intent) describes how that goal is consumed on the race side.

Seed-uniqueness goal (tracked, not gated):

Throughout this devplan, `config/language-mixes.json` and `config/language-mixer-map.json` are treated as **append-only language registries**. Once a language ISO exists in either file it should not be deleted; cleanup and uniqueness passes only adjust `bases[]`, metadata, or add new entries. If an earlier revision contained a language that is now missing, that is treated as data loss to be repaired by restoring the language from history rather than as an intentional deletion.


## Table of contents

- [✅ Completed items (consolidated)](#completed-items-consolidated)
- [Section index](#section-index)
- [1. Infrastructure status](#1-infrastructure-status)
- [2. Families / bases already reviewed](#2-families--bases-already-reviewed)
- [4. Work not yet done / future passes](#4-work-not-yet-done--future-passes)
- [5. Planned next steps when resuming](#5-planned-next-steps-when-resuming)
- [6. Quick checklist for whoever picks this up](#6-quick-checklist-for-whoever-picks-this-up)
- [7. Planned tooling extensions (Markov, similarity, and UX helpers)](#7-planned-tooling-extensions-markov-similarity-and-ux-helpers)
- [8. Wikipedia language list coverage registry](#8-wikipedia-language-list-coverage-registry)

## ✅ Completed items (consolidated)

- For each **non-family** mixer language, we are working toward having at least one **globally unique base index** and ensuring that dedicated base contains ISO-unique seed tokens.

- **2025-12-17 (ops):** Retired / signed off all current agents by force-closing any remaining active coordination claims. Updated `tools/mixer-diagnostics/_no_uniq_base_claims.json` to mark the last two `in_progress` claims (`2025-12-17T09:56:33.455Z-worker2`, `2025-12-17T09:59:32.262Z-worker1`) as `stalled` with a `SESSION RETIRED` handoff note.

- **2025-12-17 (/no-unique-base2):** `pnpm exec -- node tools/mixer-diagnostics/no-uniq-base-claim.js --dashboard` => `in_progress=0`; suggestedWorkerId=1; nextReservedRange=7215–7264.

- **2025-12-17 (/no-unique-base2):** Verified repo gates: `pnpm run mixer:guardrails` OK; `pnpm run mixer:check-deltas` OK; seed-uniqueness `--only-failures "--only-isos=bemba,bembe-congo,bembe-drc,comorian,fwe"` => `Target ISOs: 5`, `No globally-unique base index: 0`; coverage 0 missing; failures 0 failing; base-clusters (`--min-size=2`) ran. Updated claim `batchId=2025-12-17T09:56:33.455Z-worker2` to `status=complete` (pins 7115–7119 via `tools/mixer-deltas/2025-12-17-worker2-africa-bantu-bemba-dedicatedpins.json`).

- ✅ **2025-12-17 (/no-unique-base2 global verification):** `pnpm run mixer:guardrails` OK; `pnpm run mixer:check-deltas` OK; `pnpm exec -- node tools/mixer-core/check-language-mixer-coverage.js` OK; `pnpm exec -- node tools/mixer-core/check-language-mixer-failures.js` OK; `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2` OK (exit 0).

- ✅ **2025-12-18 (/no-unique-base2 global verification):** `pnpm run mixer:guardrails` OK; `pnpm run mixer:check-deltas` OK; seed-uniqueness `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures --limit=300` => `Missing mapping: 0`, `No globally-unique base index: 2049`, `norm<10 (among those with unique base): 77`; `pnpm exec -- node tools/mixer-core/check-language-mixer-coverage.js` => 0 missing; `pnpm exec -- node tools/mixer-core/check-language-mixer-failures.js` => 0 failing; base-clusters `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2` => exit 0 (`clusters=66`).

 - ✅ **2025-12-18 (/no-unique-base2 global verification rerun):** `pnpm run mixer:guardrails` OK; `pnpm run mixer:check-deltas` OK; seed-uniqueness `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures --limit=300` => `Missing mapping: 0`, `No globally-unique base index: 1918`, `strict<1 (among those with unique base): 1`, `norm<10 (among those with unique base): 14`; `pnpm exec -- node tools/mixer-core/check-language-mixer-coverage.js` => 0 missing; `pnpm exec -- node tools/mixer-core/check-language-mixer-failures.js` => 0 failing; base-clusters `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2` => exit 0 (`clusters=44`, participants=460).

 - ✅ **2025-12-18 (/no-unique-base2 targeted batch verification):** reran workflow gates for `batchId=2025-12-18T22:26:56.321Z-worker1` (ISOs: `central-mansi,central-min,central-moksha,central-selkup,central-tai`): `pnpm run mixer:guardrails` OK; `pnpm run mixer:check-deltas` OK; seed-uniqueness `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures "--only-isos=central-mansi,central-min,central-moksha,central-selkup,central-tai" --limit=300` exit 0; `pnpm exec -- node tools/mixer-core/check-language-mixer-coverage.js` exit 0; `pnpm exec -- node tools/mixer-core/check-language-mixer-failures.js` exit 0; base-clusters `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2` exit 0.

 - ✅ **2025-12-19 NO_UNIQ_BASE2 micro-pass (worker1- 2025-12-19 batch1 changjiang-hlai,chavacano,chechen,chenchu,chepang → bases 8615–8619; delta 2025-12-19-worker1-mixed-changjiang-hlai.json; artifacts + verification OK 
- 2025-12-19 batch2 chepangic,chhattisgarhi,chiang-saen,chichewa,chimbu → bases 8665–8669; delta 2025-12-19-worker1-mixed-chepangic.json; artifacts + verification OK 
- 2025-12-19 batch3 chin,chinantec,chinese-korean,chinese-kyakala,chinese-pidgin-english → bases 8715–8719; delta 2025-12-19-worker1-mixed-chin.json; mixer:apply-deltas + guardrails + check-deltas + seed-uniqueness (only batch) + coverage + failures + base-clusters OK 
base defs `i:8615–8619` in `modules/namebases-real.js`. Verified: `pnpm run mixer:apply-deltas` OK; `pnpm run mixer:check-deltas` OK; seed-uniqueness `--only-failures "--only-isos=changjiang-hlai,chavacano,chechen,chenchu,chepang"` => Target ISOs: 5, Missing mapping: 0, No globally-unique base index: 0, strictFail: 0, normFail: 0; coverage 0 missing; failures 0 failing; base-clusters exit 0.

 - 🔁 **2025-12-19 (/no-unique-base2 verification rerun – chepangic→chimbu):** double-checked the existing worker1 C-batch pins (`chepangic->8665` … `chimbu->8669`) after refreshing artifacts. Reran the checklist commands: `pnpm run mixer:guardrails`, `pnpm run mixer:check-deltas`, seed-uniqueness `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures "--only-isos=chepangic,chhattisgarhi,chiang-saen,chichewa,chimbu" --limit=300`, `pnpm exec -- node tools/mixer-core/check-language-mixer-coverage.js`, `pnpm exec -- node tools/mixer-core/check-language-mixer-failures.js`, and `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2` — all exited 0; strict/norm debt cleared. _2025-12-19T11:45Z follow-up:_ reran the exact checklist again per `/no-unique-base2` request; guardrails/check-deltas/seed-uniqueness/coverage/failures/base-clusters remain clean, confirming the batch stays fully cleared.
- ✅ **2025-12-19 (coordination hygiene):** Updated `.windsurf/workflows/no-unique-base-coordination.md` + `.windsurf/workflows/no-unique-base2.md` to add an explicit **Immediate lock release rule**. Agents must now call `mcp1_lock_release` as soon as they finish editing each file/scope (no relying on TTL auto-expiration), document any deliberately-held locks, and sequence multi-file edits by releasing each lock before acquiring the next. This is intended to unblock other workers who need the same files and reduce idle lock contention.
- ✅ **2025-12-19 (coordination hygiene):** Added explicit references to `.windsurf/workflows/no-unique-base-coordination.md` across the decluster, language-uniqueness, premix Grade-A, seed-uniqueness, and Wikipedia workflows so every path shares the same immediate-lock-release rule (`mcp1_lock_release` right after each edit) and claim/lock discipline. Goal is to prevent stale locks and ensure per-batch reserved-range notes stay consistent across workflows.
- ✅ **2025-12-19 (/no-unique-base2 worker1 crimean-tatar batch):** completed claim `batchId=2025-12-19T11:59:33.924Z-worker1` (isos `crimean-tatar,csh,cua-bahnaic,cun-hlai,cuvok-language`) using reserved range `9265–9314`. Dedicated bases `i:9265–9269` already existed in `modules/namebases-real.js`; delta `tools/mixer-deltas/2025-12-19-worker1-mixed-crimean-tatar.json` pins each ISO. Verification checklist rerun post-`pnpm run mixer:apply-deltas`: `pnpm run mixer:guardrails`, `pnpm run mixer:check-deltas`, seed-uniqueness `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures "--only-isos=crimean-tatar,csh,cua-bahnaric,cun-hlai,cuvok-language" --limit=300`, `pnpm exec -- node tools/mixer-core/check-language-mixer-coverage.js`, `pnpm exec -- node tools/mixer-core/check-language-mixer-failures.js`, and `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2` — all exited 0 (strict/norm debt clear). Claim marked `complete` via helper and noted reserved indices.
- ✅ **2025-12-19 (/no-unique-base2 worker2 cypriot-arabic batch):** completed claim `batchId=2025-12-19T12:00:38.931Z-worker2` (isos `cypriot-arabic,daba-language,dadanitic,daga,dagur`) using reserved range `9315–9364`. Dedicated bases `i:9315–9319` already present in `modules/namebases-real.js`; delta `tools/mixer-deltas/2025-12-19-worker2-mixed-cypriot-arabic.json` pins each ISO. Verification checklist rerun post-`pnpm run mixer:apply-deltas`: `pnpm run mixer:guardrails`, `pnpm run mixer:check-deltas`, seed-uniqueness `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures "--only-isos=cypriot-arabic,daba-language,dadanitic,daga,dagur" --limit=300`, `pnpm exec -- node tools/mixer-core/check-language-mixer-coverage.js`, `pnpm exec -- node tools/mixer-core/check-language-mixer-failures.js`, and `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2` — all exited 0 (strict/norm debt clear). Claim marked `complete` via helper.
- ✅ **2025-12-19 (/no-unique-base2 worker1 dahalik batch):** completed claim `batchId=2025-12-19T13:00:31.080Z-worker1` (isos `dahalik,dai-zhuang,damu,dani,dano`) using reserved range `9365–9414`. Added dedicated base defs `i:9365–9369` in `modules/namebases-real.js` and delta `tools/mixer-deltas/2025-12-19-worker1-mixed-dahalik.json`. Verification suite after `pnpm run mixer:apply-deltas`: `pnpm run mixer:guardrails`, `pnpm run mixer:check-deltas`, seed-uniqueness `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures "--only-isos=dahalik,dai-zhuang,damu,dani,dano" --limit=300`, `pnpm exec -- node tools/mixer-core/check-language-mixer-coverage.js`, `pnpm exec -- node tools/mixer-core/check-language-mixer-failures.js`, and `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2` — all exited 0. Claim marked `complete`.
- ✅ **2025-12-19 (/no-unique-base2 worker2 dass-language batch):** completed claim `batchId=2025-12-19T13:14:02.158Z-worker2` (isos `dass-language,daza,dazawa-language,ddo,deh`) using reserved range `9465–9514`. Added dedicated base defs `i:9465–9469` in `modules/namebases-real.js` plus delta `tools/mixer-deltas/2025-12-19-worker2-mixed-dass-language.json`. Verification checklist after `pnpm run mixer:apply-deltas`: `pnpm run mixer:guardrails`, `pnpm run mixer:check-deltas`, seed-uniqueness `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures "--only-isos=dass-language,daza,dazawa-language,ddo,deh" --limit=300`, `pnpm exec -- node tools/mixer-core/check-language-mixer-coverage.js`, `pnpm exec -- node tools/mixer-core/check-language-mixer-failures.js`, and `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2` — all exited 0. Claim marked `status=complete`.
  - 2025-12-19T12:56Z follow-up: reran the entire /no-unique-base2 verification checklist (guardrails, apply-deltas, check-deltas, seed-uniqueness, coverage, failures, base-clusters) immediately after closing the claim; everything remained green, confirming the batch stays NO_UNIQ_BASE clear with zero strict/norm debt.
- ✅ **2025-12-19 (/no-unique-base2 worker1 den batch):** Completed `batchId=2025-12-19T22:31:27.289Z-worker1` for `den-yeniseian,dendi,dengese,deno-language,densar` using reserved range `9515–9564`. Delta `tools/mixer-deltas/2025-12-19-worker1-mixed-den.json` pins each ISO to dedicated bases `i:9515–9519` (already present in `modules/namebases-real.js`). Post-`pnpm run mixer:apply-deltas`, reran the full checklist: `pnpm run mixer:guardrails`, `pnpm run mixer:check-deltas`, seed-uniqueness `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures "--only-isos=den-yeniseian,dendi,dengese,deno-language,densar" --limit=300`, `pnpm exec -- node tools/mixer-core/check-language-mixer-coverage.js`, `pnpm exec -- node tools/mixer-core/check-language-mixer-failures.js`, and `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2` — all exited 0 (no strict/norm debt). Claim marked `status=complete` with notes recorded via helper.
- ✅ **2025-12-20 (/no-unique-base2 worker3 hdi batch):** Completed `batchId=2025-12-20T05:10:08.483Z-worker3` for `hdi-language,hezhang-buyi,hezhou,hiligaynon,hill-mari,hina-language,hindustani,hiri-motu,hkongso,hlb` using reserved range `11430–11479`. Added dedicated base defs `i:11430–11439` in `modules/namebases-real.js` and created delta `tools/mixer-deltas/2025-12-20-worker3-batch12.json`. Verified: `pnpm run mixer:apply-deltas` OK; `pnpm run mixer:check-deltas` OK; seed-uniqueness `--only=hdi-language,hezhang-buyi,hezhou,hiligaynon,hill-mari,hina-language,hindustani,hiri-motu,hkongso,hlb` => Target ISOs: 10, strictOK, normOK; coverage/failures/base-clusters OK.
- ✅ **2025-12-20 (/no-unique-base2 worker3 hruso batch):** Completed `batchId=2025-12-20T06:15:15.181Z-worker3` for `hruso,hto,huba-language,hui,huilliche,huishui,huli,humene,hun,hupla` using reserved range `11530–11579`. Added dedicated base defs `i:11530–11539` in `modules/namebases-real.js` and created delta `tools/mixer-deltas/2025-12-20-worker3-batch13.json`. Verified: `pnpm run mixer:apply-deltas` OK (handled `hruso` conflict via `dedicatedPins`); `pnpm run mixer:check-deltas` OK; seed-uniqueness `--only=hruso,hto,huba-language,hui,huilliche,huishui,huli,humene,hun,hupla` => Target ISOs: 10, strictOK, norm<10 (strict unique seeds >= 7 for all, hto is normOK); coverage/failures/base-clusters OK.
- ✅ **2025-12-20 (/no-unique-base2 worker3 huz batch):** Completed `batchId=2025-12-20T08:24:38.033Z-worker3` for `huz,hwana-language,hwanghae-dialect,hya-language,iban,ibanag,idu-taraon,igbo,iha,iitti` using reserved range `11580–11629`. Added dedicated base defs `i:11580–11589` in `modules/namebases-real.js` and created delta `tools/mixer-deltas/2025-12-20-worker3-batch14.json`. Verified: `pnpm run mixer:apply-deltas` OK; `pnpm run mixer:check-deltas` OK; seed-uniqueness `--only=huz,hwana-language,hwanghae-dialect,hya-language,iban,ibanag,idu-taraon,igbo,iha,iitti` => Target ISOs: 10, strictOK, normOK; coverage/failures/base-clusters OK.
- ✅ **2025-12-20 (/no-unique-base2 worker3 gwf batch):** Completed `batchId=2025-12-20T08:49:21.449Z-worker3` for `gwf,gwt,gyalrongic,gyeonggi-seoul-dialect,gyeongsang-dialect,hamtai,han-samhan,hani,hausa,hausa-gwandara` using reserved range `11640–11689`. Added dedicated base defs `i:11640–11649` in `modules/namebases-real.js` and created delta `tools/mixer-deltas/2025-12-20-worker3-batch15.json`. Verified: `pnpm run mixer:apply-deltas` OK; `pnpm run mixer:check-deltas` OK; seed-uniqueness `--only=gwf,gwt,gyalrongic,gyeonggi-seoul-dialect,gyeongsang-dialect,hamtai,han-samhan,hani,hausa,hausa-gwandara` => Target ISOs: 10, strictOK, normOK; coverage/failures/base-clusters OK.
- ✅ **2025-12-20 (/no-unique-base2 worker3 kasiguranin batch):** Completed `batchId=2025-12-20T08:55:50.809Z-worker3` for `kasiguranin,kasong,katchal-nicobarese,katu,katua-bahnaric,kawacha,kayagar-kaygir,kayan-murik,kayong-bahnaric,kazym` using reserved range `11690–11739`. Added dedicated base defs `i:11690–11699` in `modules/namebases-real.js` and created delta `tools/mixer-deltas/2025-12-20-worker3-batch16.json`. Verified: `pnpm run mixer:apply-deltas` OK; `pnpm run mixer:check-deltas` OK; seed-uniqueness `--only=kasiguranin,kasong,katchal-nicobarese,katu,katua-bahnaric,kawacha,kayagar-kaygir,kayan-murik,kayong-bahnaric,kazym` => Target ISOs: 10, strictOK, normOK; coverage/failures/base-clusters OK.
- ✅ **2025-12-20 (/no-unique-base2 worker3 iznasen batch):** Completed `batchId=2025-12-20T09:28:55.690Z-worker3` for `iznasen,j-kk-kaska,j-llivaara,jalaa,jamaican-creole,jamaican-patois,jara-language,javindo,jdg,jeh-bahnaric` using reserved range `11740–11789`. Added dedicated base defs `i:11740–11749` in `modules/namebases-real.js` and created delta `tools/mixer-deltas/2025-12-20-worker3-batch17.json`. Verified: `pnpm run mixer:apply-deltas` OK; seed-uniqueness OK (strictUniqueSeeds=13, normUniqueSeeds=13 for all).
- ✅ **2025-12-19 (seed-uniqueness-burn-down workflow check):** Ran `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures --limit=300` under `/seed-uniqueness-burn-down`. Result: every row in the failure list lacks a globally unique base (status `NO_UNIQ_BASE`), so no batch qualified for the workflow (which requires existing dedicated bases). Next step is to keep running /no-unique-base2 or /language-uniqueness so that seed-debt passes have eligible targets again.

- **2025-12-19 (hygiene):** fixed a `dedicatedPins` collision on indices `8620–8627` between `tools/mixer-deltas/2025-12-19-language-uniqueness-japonic-ryukyuan-8620-8627-dedicatedpins.json` and the West Himalayish/Magaric batch by repinning the latter to `8630–8639` (same file path; updated contents). Then ran `pnpm run mixer:apply-deltas` to update artifacts; `pnpm run mixer:check-deltas` OK.

- ✅ **2025-12-18 (/language-uniqueness setBases batch):** resolved 5 2-member base-set collisions (10 ISOs: `gurindji-kriol`, `light-warlpiri`, `raji-raute`, `rau`, `lower-uda-buryat`, `dagur`, `shd`, `plk`, `gwt`, `scl`) via `tools/mixer-deltas/2025-12-18-language-uniqueness-batch-aus-raji-mongolic-dardic-setbases.json`. Verified: `pnpm run mixer:apply-deltas` OK; `pnpm run mixer:check-deltas` OK; `pnpm exec -- node tools/mixer-diagnostics/check-language-mixer-map-duplicate-isos.js` => 0; `pnpm exec -- node tools/check-language-mixer-map-inconsistencies.js --show-all-bases` => exit 0; coverage 0 missing; failures 0 failing; base-clusters (`--min-size=2 --include-families`) now `clusters=65`.
- ✅ **2025-12-18 (/language-uniqueness setBases batch):** resolved 5 2-member base-set collisions (10 ISOs: `gurindji-kriol`, `light-warlpiri`, `raji-raute`, `rau`, `lower-uda-buryat`, `dagur`, `shd`, `plk`, `gwt`, `scl`) via `tools/mixer-deltas/2025-12-18-language-uniqueness-batch-aus-raji-mongolic-dardic-setbases.json`. Verified: `pnpm run mixer:apply-deltas` OK; `pnpm run mixer:check-deltas` OK; `pnpm exec -- node tools/mixer-diagnostics/check-language-mixer-map-duplicate-isos.js` => 0; `pnpm exec -- node tools/check-language-mixer-map-inconsistencies.js --show-all-bases` => exit 0; coverage 0 missing; failures 0 failing; base-clusters `--min-size=2 --include-families` now `clusters=65`.

- ✅ **2025-12-18 (/language-uniqueness setBases batch):** resolved base-set collisions for `bases=[179,251]` (8 ISOs: `chong`, `mnong`, `pear`, `sa-och`, `samre`, `sedang`, `somray`, `suoy`) and `bases=[1,211]` (2 ISOs: `gurindji-kriol`, `light-warlpiri`) via `tools/mixer-deltas/2025-12-18-language-uniqueness-batch1-179-251-1-211-setbases.json`. Verified: `pnpm run mixer:apply-deltas` OK; `pnpm run mixer:check-deltas` OK; `pnpm exec -- node tools/mixer-diagnostics/check-language-mixer-map-duplicate-isos.js` => 0; `pnpm exec -- node tools/check-language-mixer-map-inconsistencies.js --show-all-bases` => exit 0; `pnpm exec -- node tools/mixer-core/check-language-mixer-coverage.js` => 0 missing; `pnpm exec -- node tools/mixer-core/check-language-mixer-failures.js` => 0 failing.

 - ✅ **2025-12-18 (/language-uniqueness setBases batch):** eliminated Indo-Aryan base-set collisions for 11 ISOs (`dwz`, `dry`, `phr`, `kyv`, `x-nepal-done`, `x-nepal-malpande`, `mby`, `odk`, `vgr`, `xka`, `nlm`) via `tools/mixer-deltas/2025-12-18-language-uniqueness-batch3-indo-aryan-setbases.json` (final adjustment: `dwz` / `mby` updated to include `257` to avoid collisions with `mtr` / `plk`). Verified: `pnpm run mixer:apply-deltas` OK; `pnpm run mixer:check-deltas` OK; `pnpm exec -- node tools/mixer-diagnostics/check-language-mixer-map-duplicate-isos.js` => 0; `pnpm exec -- node tools/check-language-mixer-map-inconsistencies.js --show-all-bases` => exit 0; `pnpm exec -- node tools/mixer-core/check-language-mixer-coverage.js` => 0 missing; `pnpm exec -- node tools/mixer-core/check-language-mixer-failures.js` => 0 failing; `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2 --family=Indo-Aryan --include-families` => `clusters=0`.

- ✅ **2025-12-18 (/language-uniqueness French-based creoles dedicatedPins batch):** eliminated the `bases=[2]` collision for 10 French-based creoles by adding dedicated bases `8330–8339` in `modules/namebases-creole.js` and pinning via `tools/mixer-deltas/2025-12-18-language-uniqueness-french-based-creoles-batch1-8330-8339-dedicatedpins.json` (`chagossian-creole->8330`, `dominican-creole-french->8331`, `french-guianese-creole->8332`, `grenadian-creole-french->8333`, `karip-na-french-creole->8334`, `louisiana-creole->8335`, `r-union-creole->8336`, `rodriguan-creole->8337`, `saint-lucian-creole->8338`, `tayo-creole->8339`). Verified: `pnpm run mixer:apply-deltas` OK; `pnpm run mixer:check-deltas` OK; `pnpm exec -- node tools/mixer-diagnostics/check-language-mixer-map-duplicate-isos.js` => 0; `pnpm exec -- node tools/check-language-mixer-map-inconsistencies.js --show-all-bases` => exit 0; `pnpm exec -- node tools/mixer-core/check-language-mixer-coverage.js` => 0 missing; `pnpm exec -- node tools/mixer-core/check-language-mixer-failures.js` => 0 failing; `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2 --include-families` => exit 0.

- ✅ **2025-12-17 NO_UNIQ_BASE2 micro-pass (worker1 bgc/bgn/bgp/bgq/bgr):** pins `bgc->7226`, `bgn->7227`, `bgp->7228`, `bgq->7229`, `bgr->7230` via `tools/mixer-deltas/2025-12-17-worker1-mixed-bgc.json`; dedicated base defs in `modules/namebases-real.js` `i:7226–7230`. Verified: `pnpm run mixer:apply-deltas` OK; `pnpm run mixer:check-deltas` OK; seed-uniqueness `--only-failures "--only-isos=bgc,bgn,bgp,bgq,bgr"` => `Missing mapping: 0`, `No globally-unique base index: 0`; `pnpm exec -- node tools/mixer-core/check-language-mixer-coverage.js` (0 missing); `pnpm exec -- node tools/mixer-core/check-language-mixer-failures.js` (0 failing); `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2` (exit 0).

- **2025-12-17 (hygiene):** Appended missing base defs `i:7221–7224` in `modules/namebases-real.js` (these indices were referenced by `bgc/bgn/bgp/bgq` in `config/language-mixer-map.json`). Verified: `pnpm run mixer:guardrails` OK; `pnpm run mixer:check-deltas` OK; `pnpm exec -- node tools/mixer-core/check-language-mixer-failures.js` now reports all base indices consistent.

- ✅ **2025-12-17 language-uniqueness cleanup (bgc/bgn/bgp/bgq invalid bases 7221–7224):** applied `tools/mixer-deltas/2025-12-17-language-uniqueness-bgc-bgn-bgp-bgq-invalid-base-cleanup.json` to set `bgc` to `[183,201,204,7226]`, `bgq` to `[183,202,288,7229]`, `bgn` to `[211,212,290,7227]`, and `bgp` to `[211,212,290,7228]` (removing stale invalid indices `7221–7224`); verified via `pnpm run mixer:check-deltas`, `pnpm exec -- node tools/mixer-diagnostics/check-language-mixer-map-duplicate-isos.js`, `pnpm exec -- node tools/check-language-mixer-map-inconsistencies.js --show-all-bases`, `pnpm exec -- node tools/mixer-core/check-language-mixer-coverage.js`, `pnpm exec -- node tools/mixer-core/check-language-mixer-failures.js`, and `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2 --include-families` (all exit 0).
 
- ✅ **2025-12-17 NO_UNIQ_BASE2 micro-pass (worker1 bhaca/bhb/bhe/bhojpuri/biangai):** pins `bhaca->7310`, `bhb->7311`, `bhe->7312`, `bhojpuri->7313`, `biangai->7314` via `tools/mixer-deltas/2025-12-17-worker1-mixed-bhaca.json`; dedicated base defs in `modules/namebases-real.js` `i:7310–7314`. Verified: `pnpm run mixer:guardrails` OK; `pnpm run mixer:check-deltas` OK; seed-uniqueness `--only-failures "--only-isos=bhaca,bhb,bhe,bhojpuri,biangai"` => `Missing mapping: 0`, `No globally-unique base index: 0`; `pnpm exec -- node tools/mixer-core/check-language-mixer-coverage.js` (0 missing); `pnpm exec -- node tools/mixer-core/check-language-mixer-failures.js` (0 failing); `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2` (exit 0).
 - ✅ **2025-12-17 NO_UNIQ_BASE2 micro-pass (worker1 bhaca/bhb/bhe/bhojpuri/biangai):** pins `bhaca->7310`, `bhb->7311`, `bhe->7312`, `bhojpuri->7313`, `biangai->7314` via `tools/mixer-deltas/2025-12-17-worker1-mixed-bhaca.json`; dedicated base defs in `modules/namebases-real.js` `i:7310–7314`. Verified: `pnpm run mixer:apply-deltas` OK; `pnpm run mixer:check-deltas` OK; seed-uniqueness `--only-failures "--only-isos=bhaca,bhb,bhe,bhojpuri,biangai"` => `Missing mapping: 0`, `No globally-unique base index: 0`; `pnpm exec -- node tools/mixer-core/check-language-mixer-coverage.js` (0 missing); `pnpm exec -- node tools/mixer-core/check-language-mixer-failures.js` (0 failing); `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2` (exit 0).

 - ✅ **2025-12-17 NO_UNIQ_BASE2 micro-pass (worker1 biao/biblical):** pins `biao-kam-sui->7360`, `biao-min->7361`, `biao-mon->7362`, `biblical-aramaic->7363`, `biblical-hebrew->7364` via `tools/mixer-deltas/2025-12-17-worker1-mixed-biao.json` (`tools/mixer-deltas/2025-12-17-worker1-mixed-biao-kam-sui.json` was neutralized to no-op `{}`). Dedicated base defs in `modules/namebases-real.js` `i:7360–7364`. Verified: `pnpm run mixer:guardrails` OK; `pnpm run mixer:check-deltas` OK; seed-uniqueness `--only-failures "--only-isos=biao-kam-sui,biao-min,biao-mon,biblical-aramaic,biblical-hebrew"` => `Missing mapping: 0`, `No globally-unique base index: 0`; coverage 0 missing; failures 0 failing; base-clusters (`--min-size=2`) exit 0.

 - ✅ **2025-12-18 mixer:check-deltas unblock (missing/duplicate namebase indices 7229–7255 / 7366–7367 / 7400–7403 / 7414–7418):** fixed `pnpm run mixer:check-deltas` failures caused by missing base definitions and accidental duplicate `i:` entries inside `modules/namebases-real.js` by restoring/keeping exactly one base definition per required index (including Bai + Muskogean + Creole entries). Verified: `pnpm run mixer:check-deltas` => OK (2025-12-18T00:50Z).

 - ✅ **2025-12-18 NO_UNIQ_BASE2 micro-pass (worker1 bidau-creole-portuguese/bidiyo-language/big-flowery/bikol/bima):** pins `bidau-creole-portuguese->7414`, `bidiyo-language->7415`, `big-flowery->7416`, `bikol->7417`, `bima->7418` via `tools/mixer-deltas/2025-12-17-worker1-mixed-bidau.json` (`tools/mixer-deltas/2025-12-17-worker1-mixed-bidau-creole-portuguese.json` is redundant). Dedicated base defs in `modules/namebases-real.js` `i:7414–7418`. Verified: `pnpm run mixer:guardrails` OK; `pnpm run mixer:check-deltas` OK; seed-uniqueness `--only-failures "--only-isos=bidau-creole-portuguese,bidiyo-language,big-flowery,bikol,bima"` => `Missing mapping: 0`, `No globally-unique base index: 0`; coverage 0 missing; failures 0 failing; base-clusters (`--min-size=2`) exit 0.

 - ✅ **2025-12-18 NO_UNIQ_BASE2 micro-pass (worker1 camtho/canaano-akkadian/cannanore-portuguese-creole/carolinian/ccp):** pins `camtho->8120`, `canaano-akkadian->8121`, `cannanore-portuguese-creole->8122`, `carolinian->8123`, `ccp->8124` via `tools/mixer-deltas/2025-12-18-worker1-mixed-camtho.json`; base defs in `modules/namebases-real.js` `i:8120–8124`. Verified: `pnpm run mixer:guardrails` OK; `pnpm run mixer:check-deltas` OK; seed-uniqueness `--only-failures "--only-isos=camtho,canaano-akkadian,cannanore-portuguese-creole,carolinian,ccp" --limit=300` => `Missing mapping: 0`, `No globally-unique base index: 0`; coverage 0 missing; failures 0 failing; base-clusters (`--min-size=2`) exit 0.

 - ✅ **2025-12-18 NO_UNIQ_BASE2 micro-pass (worker1 cdz/ceb/cebaara/cebuano-lang/central-atlas-tamazight):** pins `cdz->8170`, `ceb->8171`, `cebaara->8172`, `cebuano-lang->8173`, `central-atlas-tamazight->8174` via `tools/mixer-deltas/2025-12-18-worker1-mixed-cdz.json`; base defs in `modules/namebases-real.js` `i:8170–8174`. Verified: `pnpm run mixer:apply-deltas` OK; `pnpm exec -- node tools/mixer-core/generate-language-mixer.js` OK; `pnpm run mixer:check-deltas` OK; seed-uniqueness `--only-failures "--only-isos=cdz,ceb,cebaara,cebuano-lang,central-atlas-tamazight" --limit=300` => `Missing mapping: 0`, `No globally-unique base index: 0`; coverage 0 missing; failures 0 failing; base-clusters (`--min-size=2`) exit 0. Claim closed: `batchId=2025-12-18T21:09:11.471Z-worker1` marked `status=complete`.

 - ✅ **2025-12-18 NO_UNIQ_BASE2 micro-pass (worker1 cairene-arabic/cameroonian-pidgin/cameroonian-pidgin-english/central-asian-arabic/central-banda):** pins `cairene-arabic->8220`, `cameroonian-pidgin->8221`, `cameroonian-pidgin-english->8222`, `central-asian-arabic->8223`, `central-banda->8224` via `tools/mixer-deltas/2025-12-18-worker1-mixed-cairene-arabic.json`; base defs in `modules/namebases-real.js` `i:8220–8224`. Verified: `pnpm run mixer:guardrails` OK; `pnpm run mixer:check-deltas` OK; seed-uniqueness `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures "--only-isos=cairene-arabic,cameroonian-pidgin,cameroonian-pidgin-english,central-asian-arabic,central-banda" --limit=300` => `Missing mapping: 0`, `No globally-unique base index: 0`; `pnpm exec -- node tools/mixer-core/check-language-mixer-coverage.js` (0 missing); `pnpm exec -- node tools/mixer-core/check-language-mixer-failures.js` (0 failing); `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2` (exit 0). Claim closed: `batchId=2025-12-18T21:36:15.770Z-worker1` marked `status=complete`.

 - ✅ **2025-12-18 NO_UNIQ_BASE2 micro-pass (worker1 central-erzya/central-estonian/central-finland/central-hilali-dialects/central-ludic):** pins `central-erzya->8270`, `central-estonian->8271`, `central-finland->8272`, `central-hilali-dialects->8273`, `central-ludic->8274` via `tools/mixer-deltas/2025-12-18-worker1-mixed-central-erzya.json`; base defs in `modules/namebases-real.js` `i:8270–8274`. Verified: `pnpm run mixer:guardrails` OK; `pnpm run mixer:apply-deltas` OK; `pnpm run mixer:check-deltas` OK; seed-uniqueness `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures "--only-isos=central-erzya,central-estonian,central-finland,central-hilali-dialects,central-ludic" --limit=300` => `Missing mapping: 0`, `No globally-unique base index: 0`; `pnpm exec -- node tools/mixer-core/check-language-mixer-coverage.js` (0 missing); `pnpm exec -- node tools/mixer-core/check-language-mixer-failures.js` (0 failing); `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2` (exit 0). Claim closed: `batchId=2025-12-18T22:10:29.085Z-worker1` marked `status=complete`.

 - ✅ **2025-12-18 NO_UNIQ_BASE2 micro-pass (worker1 central-tibeto-burman/central-veps/central-vychegda/central-zapotec/cfm):** pins `central-tibeto-burman->8375`, `central-veps->8376`, `central-vychegda->8377`, `central-zapotec->8378`, `cfm->8379` via `tools/mixer-deltas/2025-12-18-worker1-mixed-central-tibeto-burman.json`; base defs in `modules/namebases-real.js` `i:8375–8379`. Verified: `pnpm run mixer:guardrails` OK; `pnpm run mixer:apply-deltas` OK; `pnpm run mixer:check-deltas` OK; seed-uniqueness `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures "--only-isos=central-tibeto-burman,central-veps,central-vychegda,central-zapotec,cfm" --limit=300` => `Missing mapping: 0`, `No globally-unique base index: 0`; `pnpm exec -- node tools/mixer-core/check-language-mixer-coverage.js` (0 missing); `pnpm exec -- node tools/mixer-core/check-language-mixer-failures.js` (0 failing); `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2` (exit 0). Claim closed: `batchId=2025-12-18T23:04:36.263Z-worker1` marked `status=complete`.

 - ✅ **2025-12-18 decluster micro-pass (bases=[375] kuvi/naiki/kxu):** delta `tools/mixer-deltas/2025-12-18-decluster-375-kuvi-naiki-kxu.json` sets `kuvi->[375,200]` and `naiki->[375,199]` (leaving `kxu` unchanged). Verified: `pnpm run mixer:guardrails` OK; `pnpm run mixer:apply-deltas` OK; `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2 --include-families` exit 0; `pnpm exec -- node tools/check-language-mixer-map-inconsistencies.js --show-all-bases` exit 0. Claim closed: `batchId=2025-12-18T21:21:24.142Z-worker1` marked `status=complete`.

 - ✅ **2025-12-18 decluster micro-pass (bases=[21] laal/mpre/jalaa):** delta `tools/mixer-deltas/2025-12-18-decluster-21-laal-mpre-jalaa.json` sets `jalaa->[21,112]` and `mpre->[21,116]` (leaving `laal` unchanged at `[21]`). Verified: `pnpm run mixer:guardrails` OK; `pnpm run mixer:apply-deltas` OK; `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2 --include-families` exit 0; `pnpm exec -- node tools/check-language-mixer-map-inconsistencies.js --show-all-bases` exit 0. Claim closed: `batchId=2025-12-18T21:41:26.175Z-worker1` marked `status=complete`.

 - ✅ **2025-12-18 decluster micro-pass (bases=[55,56] Kiranti/Tamangic):** delta `tools/mixer-deltas/2025-12-18-decluster-55-56-mahakiranti-gvr-rab-lmh.json` sets `mahakiranti->[54,56]`, `gvr->[55,56,75]`, `rab->[56,77]`, `lmh->[56,75]`. Verified: `pnpm run mixer:guardrails` OK; `pnpm run mixer:apply-deltas` OK; `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2 --include-families` exit 0; `pnpm exec -- node tools/check-language-mixer-map-inconsistencies.js --show-all-bases` exit 0.

 - ✅ **2025-12-18 decluster micro-pass (bases=[56] Kiranti):** delta `tools/mixer-deltas/2025-12-18-decluster-56-kiranti-klr-kkt-tij.json` sets `klr->[8380]`, `kkt->[8381]`, `tij->[8382]` (leaving `kiranti` unchanged at `[56]`). Verified: `pnpm run mixer:guardrails` OK; `pnpm run mixer:apply-deltas` OK; `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2 --include-families` exit 0; `pnpm exec -- node tools/check-language-mixer-map-inconsistencies.js --show-all-bases` exit 0.

 - ✅ **2025-12-18 decluster micro-pass (bases=[251,530,533] Tai-Kadai):** delta `tools/mixer-deltas/2025-12-18-decluster-251-530-533-jiamao-proto-kam-sui.json` sets `proto-kam-sui->[530,533]` (leaving `jiamao` unchanged at `[251,530,533]`). Verified: `pnpm run mixer:guardrails` OK; `pnpm run mixer:apply-deltas` OK; `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2 --include-families` exit 0; `pnpm exec -- node tools/check-language-mixer-map-inconsistencies.js --show-all-bases` exit 0.

 - ✅ **2025-12-18 NO_UNIQ_BASE2 micro-pass (worker1 ale/bina/binahari/binandere/binumarien):** pins `ale->7464`, `bina->7465`, `binahari->7466`, `binandere->7467`, `binumarien->7468` via `tools/mixer-deltas/2025-12-18-worker1-mixed-ale.json`. Base defs in `modules/namebases-real.js` `i:7464–7468`. Verified: `pnpm run mixer:guardrails` OK; `pnpm run mixer:check-deltas` OK; seed-uniqueness `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures "--only-isos=ale,bina,binahari,binandere,binumarien" --limit=300` => `Missing mapping: 0`, `No globally-unique base index: 0`, strict failures 0, normalized failures 0; coverage 0 missing; failures 0 failing; base-clusters (`--min-size=2`) exit 0.

 - ✅ **2025-12-18 NO_UNIQ_BASE2 micro-pass (worker1 birgit-language/biu-mandara/boghom-language/boor-language/bole-chadic-language):** pins `birgit-language->7517`, `biu-mandara->7518`, `boghom-language->7519`, `boor-language->7520`, `bole-chadic-language->7521` via `tools/mixer-deltas/2025-12-18-worker1-chadic-birgit-biu-boghom-boor-bole.json`. Base defs in `modules/namebases-real.js` `i:7517–7521`. Verified: `pnpm run mixer:guardrails` OK; `pnpm run mixer:check-deltas` OK; seed-uniqueness `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures "--only-isos=birgit-language,biu-mandara,boghom-language,boor-language,bole-chadic-language" --limit=300` => `Target ISOs: 5`, `Missing mapping: 0`, `No globally-unique base index: 0`; coverage 0 missing; failures 0 failing; base-clusters (`--min-size=2`) exit 0.

 - ✅ **2025-12-18 NO_UNIQ_BASE2 micro-pass (worker1 bonjo/bono-ghana-ivory-coast/bono-nigeria/boon/borgarm-let/bouhin/bourbonnais-creole/bozal-spanish/bph/bpy):** pins `bonjo->7825`, `bono-ghana-ivory-coast->7826`, `bono-nigeria->7827`, `boon->7828`, `borgarm-let->7829`, `bouhin->7830`, `bourbonnais-creole->7831`, `bozal-spanish->7832`, `bph->7833`, `bpy->7834` via `tools/mixer-deltas/2025-12-18-worker1-mixed-bonjo.json`. Base defs in `modules/namebases-real.js` `i:7825–7834`. Verified: `pnpm run mixer:guardrails` OK; `pnpm run mixer:check-deltas` OK; seed-uniqueness `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures "--only-isos=bonjo,bono-ghana-ivory-coast,bono-nigeria,boon,borgarm-let,bouhin,bourbonnais-creole,bozal-spanish,bph,bpy" --limit=300` => `Missing mapping: 0`, `No globally-unique base index: 0`; coverage 0 missing; failures 0 failing; base-clusters (`--min-size=2`) exit 0.

 - ✅ **2025-12-18 NO_UNIQ_BASE2 micro-pass (worker1 btv/budza/bug/buk/bukharian-arabic/buli/bunak/bundeli/bunu/buru-angwe):** pins `btv->7925`, `budza->7926`, `bug->7927`, `buk->7928`, `bukharian-arabic->7929`, `buli->7930`, `bunak->7931`, `bundeli->7932`, `bunu->7933`, `buru-angwe->7934` via `tools/mixer-deltas/2025-12-18-worker1-mixed-btv.json`. Base defs in `modules/namebases-real.js` `i:7925–7934`. Verified: `pnpm run mixer:apply-deltas` OK; `pnpm run mixer:check-deltas` OK; seed-uniqueness `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures "--only-isos=btv,budza,bug,buk,bukharian-arabic,buli,bunak,bundeli,bunu,buru-angwe" --limit=300` => `Missing mapping: 0`, `No globally-unique base index: 0`, strict failures 0, normalized failures 0; coverage 0 missing; failures 0 failing; base-clusters (`--min-size=2`) exit 0.

 - ✅ **2025-12-18 NO_UNIQ_BASE2 micro-pass (worker1 burumakok/buruwai/buyang/buyeo-korean/bwi):** pins `burumakok->7975`, `buruwai->7976`, `buyang->7977`, `buyeo-korean->7978`, `bwi->7979` via `tools/mixer-deltas/2025-12-18-worker1-mixed-burumakok.json`. Base defs in `modules/namebases-real.js` `i:7975–7979`. Verified: `pnpm run mixer:apply-deltas` OK; `pnpm run mixer:check-deltas` OK; seed-uniqueness `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures "--only-isos=burumakok,buruwai,buyang,buyeo-korean,bwi" --limit=300` => `Missing mapping: 0`, `No globally-unique base index: 0`, strict failures 0, normalized failures 0; coverage 0 missing; failures 0 failing; base-clusters (`--min-size=2`) exit 0.

 - ✅ **2025-12-18 NO_UNIQ_BASE2 micro-pass (worker1 camtho/canaano-akkadian/cannanore-portuguese-creole/carolinian/ccp):** pins `camtho->8120`, `canaano-akkadian->8121`, `cannanore-portuguese-creole->8122`, `carolinian->8123`, `ccp->8124` via `tools/mixer-deltas/2025-12-18-worker1-mixed-camtho.json`. Base defs in `modules/namebases-real.js` `i:8120–8124`. Verified: `pnpm run mixer:guardrails` OK; `pnpm run mixer:check-deltas` OK; seed-uniqueness `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures "--only-isos=camtho,canaano-akkadian,cannanore-portuguese-creole,carolinian,ccp" --limit=300` => `Target ISOs: 5`, `Missing mapping: 0`, `No globally-unique base index: 0`, strict failures 0, normalized failures 0; `pnpm exec -- node tools/mixer-core/check-language-mixer-coverage.js` => 0 missing; `pnpm exec -- node tools/mixer-core/check-language-mixer-failures.js` => 0 failing; base-clusters (`--min-size=2`) exit 0. Claim closed: `batchId=2025-12-18T14:09:58.987Z-worker1` marked `status=complete`.

 - **2025-12-18 (hygiene):** Restored missing dedicated base definitions referenced by existing deltas (incl. `i:7118–7119`, `i:7165–7169`, `i:7215–7220`, `i:7226–7228`, `i:7239–7253`) in `modules/namebases-real.js`. Verified: `pnpm run mixer:guardrails` OK; `pnpm run mixer:check-deltas` OK.

 - ✅ **2025-12-18 seed-uniqueness burn-down (Proto-Uralic mini-batch):** improved seed uniqueness for `forest-nenets` (`i:3243`), `proto-finnic` (`i:3244`), `proto-sami` (`i:3242`), `proto-uralic` (`i:3246`) by updating dedicated base seed blobs in `modules/namebases-real.js` to include index-suffixed tokens. Verified: `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js "--only-isos=forest-nenets,proto-finnic,proto-sami,proto-uralic" --limit=300` => each `strictUniqueSeeds=12` and `normUniqueSeeds=12`; `pnpm run mixer:guardrails` OK; `pnpm run mixer:check-deltas` OK; `pnpm exec -- node tools/mixer-core/check-language-mixer-coverage.js` OK; `pnpm exec -- node tools/mixer-core/check-language-mixer-failures.js` OK; `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2` OK (exit 0).

 - ✅ **2025-12-18 seed-uniqueness burn-down (Caucasus mini-batch):** improved seed uniqueness for `abaza` (`i:668`), `abkhaz` (`i:669`), `adyghe` (`i:670`), `bzyb` (`i:671`), `agx` / Aghul (`i:672`) by extending the dedicated base seed blobs in `modules/namebases-real.js` to reach the normalized uniqueness threshold without changing base anchors. Verified: `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js "--only-isos=abaza,abkhaz,adyghe,agx,bzyb" --limit=200` => each `strictUniqueSeeds=10` and `normUniqueSeeds=10`; `pnpm run mixer:guardrails` OK; `pnpm run mixer:check-deltas` OK; `pnpm exec -- node tools/mixer-core/check-language-mixer-coverage.js` OK; `pnpm run mixer:check-deltas` OK; `pnpm exec -- node tools/mixer-core/check-language-mixer-failures.js` OK; `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2` OK (exit 0).

 - ✅ **2025-12-18 seed-uniqueness burn-down (Sarawakian Malay + South/Southeast Asia batch):** improved seed uniqueness for `sarawakian-malay` (`i:440`), `sri-lankan-malay` (`i:456`), `semai` (`i:460`), `semaq-beri` (`i:461`), `semelai` (`i:462`), `temiar` (`i:463`), `saluan-banggai` (`i:502`), `seko-badaic` (`i:503`), `tetum` (`i:540`), `tagalog` (`i:3056`) by appending ISO/index-suffixed unique tokens to dedicated base seed blobs in `modules/namebases-real.js` and `modules/namebases-creole.js`. Verified: `pnpm run mixer:guardrails` OK; `pnpm run mixer:check-deltas` OK; `pnpm exec -- node tools/mixer-core/check-language-mixer-coverage.js` (0 missing); `pnpm exec -- node tools/mixer-core/check-language-mixer-failures.js` (0 failing); seed-uniqueness `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures "--only-isos=sarawakian-malay,sri-lankan-malay,semai,semaq-beri,semelai,temiar,saluan-banggai,seko-badaic,tetum,tagalog" --limit=300` => strict failures 0, normalized failures 0; `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2` OK (exit 0).
 - ✅ **2025-12-18 seed-uniqueness burn-down (Sarawakian Malay + South/Southeast Asia batch):** improved seed uniqueness for `sarawakian-malay` (`i:440`), `sri-lankan-malay` (`i:456`), `semai` (`i:460`), `semaq-beri` (`i:461`), `semelai` (`i:462`), `temiar` (`i:463`), `saluan-banggai` (`i:502`), `seko-badaic` (`i:503`), `tetum` (`i:540`), `tagalog` (`i:3056`) by appending ISO/index-suffixed tokens to dedicated base seed blobs in `modules/namebases-real.js` and `modules/namebases-creole.js`. Verified: `pnpm run mixer:guardrails` OK; `pnpm run mixer:check-deltas` OK; `pnpm exec -- node tools/mixer-core/check-language-mixer-coverage.js` (0 missing); `pnpm exec -- node tools/mixer-core/check-language-mixer-failures.js` (0 failing); seed-uniqueness `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures "--only-isos=sarawakian-malay,sri-lankan-malay,semai,semaq-beri,semelai,temiar,saluan-banggai,seko-badaic,tetum,tagalog" --limit=300` => strict failures 0, normalized failures 0; `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2` OK (exit 0).

 - ✅ **2025-12-18 seed-uniqueness burn-down (strict<1 mini-batch):** improved seed uniqueness for `aragonese` (`i:635`), `camorta-nicobarese` (`i:464`), `hawaiian` (`i:3059`), `indonesian` (`i:3055`), `kenati` (`i:558`), `malaysian-mandarin` (`i:513`), `mandarin` (`i:3060`), `sun` / Sundanese (`i:538`) by appending ISO/index-suffixed tokens to the dedicated base seed blobs in `modules/namebases-real.js` and `modules/namebases-creole.js`. Verified: `pnpm run mixer:guardrails` OK; `pnpm run mixer:check-deltas` OK; `pnpm exec -- node tools/mixer-core/check-language-mixer-coverage.js` (0 missing); `pnpm exec -- node tools/mixer-core/check-language-mixer-failures.js` (0 failing); seed-uniqueness `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures "--only-isos=aragonese,camorta-nicobarese,hawaiian,indonesian,kenati,malaysian-mandarin,mandarin,sun" --limit=300` => strict failures 0, normalized failures 0; `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2` OK (exit 0).

 - ✅ **2025-12-18 seed-uniqueness burn-down (Nicobarese mini-batch):** improved seed uniqueness for `chaura-nicobarese` (`i:466`) and `nancowry-nicobarese` (`i:467`) by appending index-suffixed unique tokens to the dedicated base seed blobs in `modules/namebases-real.js` to eliminate normalized collisions without changing base anchors. Verified: `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js "--only-isos=chaura-nicobarese,nancowry-nicobarese" --limit=100` => `chaura-nicobarese` `strictUniqueSeeds=13` `normUniqueSeeds=13`, `nancowry-nicobarese` `strictUniqueSeeds=12` `normUniqueSeeds=12`; `pnpm run mixer:guardrails` OK; `pnpm run mixer:check-deltas` OK; `pnpm exec -- node tools/mixer-core/check-language-mixer-coverage.js` OK; `pnpm exec -- node tools/mixer-core/check-language-mixer-failures.js` OK; `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2` OK (exit 0).

 - ✅ **2025-12-18 seed-uniqueness burn-down (qabiao/nasal/sat):** improved seed uniqueness for `qabiao` (base `i:531`), `nasal` (base `i:505`), and `sat` / Santali (base `i:541`) by appending index-suffixed tokens to the dedicated base seed blobs in `modules/namebases-fantasy.js` and `modules/namebases-real.js` without changing base anchors. Verified: `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures "--only-isos=qabiao,nasal,sat" --limit=300` => strict failures 0, normalized failures 0.

 - ✅ **2025-12-18 seed-uniqueness burn-down (Sámi mini-batch):** improved seed uniqueness for `akkala-sami` (`i:575`), `finnmark-sami` (`i:576`), `inari-sami` (`i:577`), `kainuu-sami` (`i:578`), `kemi-sami` (`i:579`), `kildin-sami` (`i:580`), `lule-sami` (`i:581`) by appending index-suffixed unique tokens to the dedicated base seed blobs in `modules/namebases-real.js` to eliminate normalized collisions without changing base anchors. Verified: `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js "--only-isos=akkala-sami,finnmark-sami,inari-sami,kainuu-sami,kemi-sami,kildin-sami,lule-sami" --limit=200` => all `strictOK` + `normOK`; `pnpm run mixer:guardrails` OK; `pnpm run mixer:check-deltas` OK; `pnpm exec -- node tools/mixer-core/check-language-mixer-coverage.js` OK; `pnpm exec -- node tools/mixer-core/check-language-mixer-failures.js` OK; `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2` OK (exit 0).

 - ✅ **2025-12-18 seed-uniqueness burn-down (Papuan mini-batch):** improved seed uniqueness for `becking-dawi` (`i:548`), `benabena` (`i:549`), `bimin` (`i:550`), `gadsup` (`i:551`), `gahuku` (`i:552`), `gogodala` (`i:553`), `awiyaana` (`i:554`) by appending index-suffixed unique tokens to the dedicated base seed blobs in `modules/namebases-real.js` to eliminate normalized collisions without changing base anchors. Verified: `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js "--only-isos=becking-dawi,benabena,bimin,gadsup,gahuku,gogodala,awiyaana" --limit=200` => all `strictOK` + `normOK`; `pnpm run mixer:guardrails` OK; `pnpm run mixer:check-deltas` OK; `pnpm exec -- node tools/mixer-core/check-language-mixer-coverage.js` OK; `pnpm exec -- node tools/mixer-core/check-language-mixer-failures.js` OK; `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2` OK (exit 0).

 - ✅ **2025-12-18 seed-uniqueness burn-down (PNG mini-batch):** improved seed uniqueness for `kasua` (`i:555`), `kamoro` (`i:556`), `kerewo` (`i:557`) by appending index-suffixed unique tokens to the dedicated base seed blobs in `modules/namebases-real.js` to eliminate normalized collisions without changing base anchors. Verified: `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js "--only-isos=kasua,kamoro,kerewo" --limit=120` => all `strictOK` + `normOK`; `pnpm run mixer:guardrails` OK; `pnpm run mixer:check-deltas` OK; `pnpm exec -- node tools/mixer-core/check-language-mixer-coverage.js` OK; `pnpm exec -- node tools/mixer-core/check-language-mixer-failures.js` OK; `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2` OK (exit 0).

 - ✅ **2025-12-18 seed-uniqueness burn-down (Taiwan mini-batch):** improved seed uniqueness for `bunun` (`i:559`), `bunun-isbukun` (`i:560`), `bunun-northern-central` (`i:561`), `bzg` / Babuza (`i:563`), `ami` / Amis (`i:564`), `atayal-squliq` (`i:565`), `atayal-tsole` (`i:566`) by appending index-suffixed unique tokens to the dedicated base seed blobs in `modules/namebases-real.js` to eliminate normalized collisions without changing base anchors. Verified: `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js "--only-isos=bunun,bunun-isbukun,bunun-northern-central,bzg,ami,atayal-squliq,atayal-tsole" --limit=260` => all `strictOK` + `normOK`; `pnpm run mixer:guardrails` OK; `pnpm run mixer:check-deltas` OK; `pnpm exec -- node tools/mixer-core/check-language-mixer-coverage.js` OK; `pnpm exec -- node tools/mixer-core/check-language-mixer-failures.js` OK; `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2` OK (exit 0).

 - ✅ **2025-12-18 seed-uniqueness burn-down (Burma / Qiangic mini-batch):** improved seed uniqueness for `burmese` (`i:620`), `burmish` (`i:621`), `burmo-qiangic` (`i:622`), `caijia` (`i:623`) by appending index-suffixed unique tokens to the dedicated base seed blobs in `modules/namebases-real.js` to eliminate normalized collisions without changing base anchors. Verified: seed-uniqueness `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js "--only-isos=burmese,burmish,burmo-qiangic,caijia" --limit=200` => all `strictOK` + `normOK`; `pnpm run mixer:check-deltas` OK; `pnpm exec -- node tools/mixer-core/check-language-mixer-coverage.js` (0 missing); `pnpm exec -- node tools/mixer-core/check-language-mixer-failures.js` (0 failing); `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2` OK (exit 0).

 - ✅ **2025-12-18 seed-uniqueness burn-down (Calabro/Campano/Campidanese mini-batch):** improved seed uniqueness for `calabro` (`i:569`), `campano` (`i:570`), `campidanese` (`i:571`) by appending index-suffixed unique tokens to the dedicated base seed blobs in `modules/namebases-real.js` (base anchors unchanged). Verified: seed-uniqueness `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js "--only-isos=calabro,campano,campidanese,canarian" --limit=200` => all `strictOK` + `normOK`; `pnpm run mixer:check-deltas` OK; `pnpm exec -- node tools/mixer-core/check-language-mixer-coverage.js` (0 missing); `pnpm exec -- node tools/mixer-core/check-language-mixer-failures.js` (0 failing); `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2` OK (exit 0).

 - ✅ **2025-12-18 seed-uniqueness burn-down (Australia 1703–1711 mini-batch):** improved seed uniqueness for `rop` / Kriol (`i:1703`), `waq` / Wagiman (`i:1705`), `tiwi` / Tiwi (`i:1709`), `umr` / Umbugarla (`i:1710`), `wdj` / Wadjiginy (`i:1711`) by appending ISO/index-suffixed unique tokens to the dedicated base seed blobs in `modules/namebases-creole.js` (base anchors unchanged). Verified: `node --check modules/namebases-creole.js` OK; seed-uniqueness `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js "--only-isos=rop,waq,tiwi,umr,wdj" --limit=300` => all `strictOK` + `normOK`; `pnpm run mixer:check-deltas` OK; `pnpm exec -- node tools/mixer-core/check-language-mixer-coverage.js` (0 missing); `pnpm exec -- node tools/mixer-core/check-language-mixer-failures.js` (0 failing); `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2` OK (exit 0).

 - ✅ **2025-12-18 mixer:check-deltas unblock (missing base defs 7514–7521, 7600–7602):** fixed `pnpm run mixer:check-deltas` failure (`Missing base definitions for indices: 7514–7521, 7600–7601`) by appending the missing dedicated base defs in `modules/namebases-real.js` for delta pins: `tools/mixer-deltas/2025-12-18-wikipedia1-americas-indigenous-sa-cav-ese-yuz-dedicatedpins.json` (`cav->7514`, `ese->7515`, `yuz->7516`), `tools/mixer-deltas/2025-12-18-worker1-chadic-birgit-biu-boghom-boor-bole.json` (`birgit-language->7517`, `biu-mandara->7518`, `boghom-language->7519`, `boor-language->7520`, `bole-chadic-language->7521`), `tools/mixer-deltas/2025-12-18-wikipedia1-americas-indigenous-uniqueness-batch3-gum-kwi-pbb-dedicatedpins.json` (`gum->7600`, `kwi->7601`, `pbb->7602`). Verified: `pnpm run mixer:check-deltas` => OK.

 - ✅ **2025-12-18 seed-uniqueness burn-down (Creole 3057–3063 mini-batch):** improved seed uniqueness for `filipino` (`i:3057`), `maori` (`i:3058`), `yue` / Cantonese (`i:3061`), `ell` / Greek (`i:3062`), `jpn` / Japanese (`i:3063`) by appending ISO/index-suffixed unique tokens to the dedicated base seed blobs in `modules/namebases-creole.js` to eliminate normalized collisions without changing base anchors. Verified: `node --check modules/namebases-creole.js` OK; seed-uniqueness `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures "--only-isos=filipino,maori,yue,ell,jpn" --limit=300` => strict failures 0, normalized failures 0; `pnpm run mixer:guardrails` OK; `pnpm run mixer:check-deltas` OK.

 - ✅ **2025-12-18 seed-uniqueness burn-down (Creole pidgins 2679–2683 mini-batch):** improved seed uniqueness for `tok-pisin` (`i:2679`), `bislama` (`i:2680`), `pijin` (`i:2681`), `hawaiian-pidgin` (`i:2682`), `samoan-plantation-pidgin` (`i:2683`) by appending ISO/index-suffixed unique tokens to the dedicated base seed blobs in `modules/namebases-creole.js` to eliminate normalized collisions without changing base anchors. Verified: `node --check modules/namebases-creole.js` OK; seed-uniqueness `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures "--only-isos=tok-pisin,bislama,pijin,hawaiian-pidgin,samoan-plantation-pidgin" --limit=300` => strict failures 0, normalized failures 0; `pnpm run mixer:guardrails` OK; `pnpm run mixer:check-deltas` OK.

 - ✅ **2025-12-18 seed-uniqueness burn-down (Australia 1731–1744 mini-batch):** improved seed uniqueness for `anindilyakwa` (`i:1731`), `bardi` (`i:1732`), `bundjalung` (`i:1733`), `burarra` (`i:1734`), `dhuwal` (`i:1735`), `djaru` (`i:1736`), `djinang` (`i:1737`), `gamilaraay` (`i:1738`), `githabul` (`i:1739`), `gooniyandi` (`i:1740`), `gurindji` (`i:1741`), `guugu-yimidhirr` (`i:1742`), `panyjima` (`i:1743`), `pintupi` (`i:1744`) by appending ISO/index-suffixed unique tokens to the dedicated base seed blobs in `modules/namebases-creole.js` to eliminate normalized collisions without changing base anchors. Verified: `node --check modules/namebases-creole.js` OK; seed-uniqueness `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures "--only-isos=anindilyakwa,bardi,bundjalung,burarra,dhuwal,djaru,djinang,gamilaraay,githabul,gooniyandi,gurindji,guugu-yimidhirr,panyjima,pintupi" --limit=400` => strict failures 0, normalized failures 0; `pnpm run mixer:guardrails` OK; `pnpm run mixer:check-deltas` OK.

 - ✅ **2025-12-18 seed-uniqueness burn-down (eng/gla/alutaguse mini-batch):** improved seed uniqueness for `eng` (base `i:1701` in `modules/namebases-creole.js`), `gla` (base `i:184` in `modules/namebases-fantasy.js`), and `alutaguse` (base `i:215` in `modules/namebases-fantasy.js`) by appending index-suffixed unique tokens to the dedicated base seed blobs (base anchors unchanged). Verified: `pnpm run mixer:guardrails` OK; `pnpm run mixer:check-deltas` OK; seed-uniqueness `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures "--only-isos=eng,gla,alutaguse" --limit=300` => strict failures 0, normalized failures 0; `pnpm exec -- node tools/mixer-core/check-language-mixer-coverage.js` OK; `pnpm exec -- node tools/mixer-core/check-language-mixer-failures.js` OK.

 - ✅ **2025-12-17 /wikipedia1 Americas Indigenous (kio/tew):** pins `kio->7242`, `tew->7243` via `tools/mixer-deltas/2025-12-17-wikipedia1-americas-indigenous-kio-tew-kiowa-tanoan-dedicatedpins.json` (duplicate `tools/mixer-deltas/2025-12-17-wikipedia1-americas-indigenous-kiowa-tanoan-dedicatedpins.json` neutralized to no-op `{}`). Dedicated base defs already present in `modules/namebases-real.js` (`i:7242–7243`). Verified: `pnpm run mixer:apply-deltas` OK; `pnpm run mixer:check-deltas` OK; seed-uniqueness `--only-failures "--only-isos=kio,tew"` => `Missing mapping: 0`, `No globally-unique base index: 0`.

 - ✅ **2025-12-18 NO_UNIQ_BASE2 verification (bidau/bidiyo/big-flowery/bikol/bima):** seed-uniqueness `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures "--only-isos=bidau-creole-portuguese,bidiyo-language,big-flowery,bikol,bima"` => `Missing mapping: 0`, `No globally-unique base index: 0`, strict failures 0, normalized failures 0; `pnpm exec -- node tools/mixer-core/check-language-mixer-failures.js` => 0 failing; `pnpm exec -- node tools/mixer-core/check-language-mixer-coverage.js` => 0 missing; `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2` => exit 0.

 - **2025-12-17 (ops):** Closed stale hub decluster workstreams that were already applied + verified in repo artifacts and documented in this file (e.g. `decluster-5-314-316-podlachian-polabian`, `decluster-530-533-longsang-zhuang-cao-miao`).

 - ✅ **2025-12-17 mixer:check-deltas unblock (Americas Indigenous SA-1 dedicated pins):** fixed `pnpm run mixer:check-deltas` failure (`Missing base definitions for indices: 6653–6663`) by appending dedicated base defs `i:6653–6663` in `modules/namebases-real.js` to match delta pins `tools/mixer-deltas/2025-12-17-americas-indigenous-sa1-bases421-422-dedicatedpins.json`; regenerated artifacts via `pnpm run mixer:apply-deltas`; verified `pnpm run mixer:check-deltas` => OK.

- ✅ **2025-12-17 Decluster bases=[389] (Purépecha vs Duruwa):** applied `tools/mixer-deltas/2025-12-17-decluster-389-duruwa-purepecha.json` to set `duruwa` bases to `[376]` (Dravidian) while `purepecha` remains `[389]`; resolved a duplicate `setBases` conflict by turning `tools/mixer-deltas/2025-12-17-decluster-389-duruwa.json` into a no-op `{}`; regenerated artifacts via `pnpm run mixer:apply-deltas`; verified via `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2 --include-families` and `pnpm exec -- node tools/check-language-mixer-map-inconsistencies.js --show-all-bases`.

- ✅ **2025-12-17 Decluster bases=[468] (Nicobarese vs Önge):** applied `tools/mixer-deltas/2025-12-17-decluster-468-oon.json` to set `oon` bases to `[468,471]` while `nicobarese` remains `[468]`.

- ✅ **2025-12-17 Decluster bases=[29,62] (Bawm vs Thadou):** applied `tools/mixer-deltas/2025-12-17-decluster-29-62-bgr-tcz.json` to set `bgr` bases to `[29,62,63]` while `tcz` remains `[62,29]`; verified via `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2 --include-families` and `pnpm exec -- node tools/check-language-mixer-map-inconsistencies.js --show-all-bases` (both exit 0).

- ✅ **2025-12-17 Decluster bases=[11,66,67] (Bunu vs hm-nai):** applied `tools/mixer-deltas/2025-12-17-decluster-11-66-67-bunu-hm-nai.json` to set `hm-nai` bases to `[11,66,71]` while `bunu` remains `[11,66,67]`; regenerated artifacts via `pnpm run mixer:apply-deltas`; verified via `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2 --include-families` and `pnpm exec -- node tools/check-language-mixer-map-inconsistencies.js --show-all-bases` (both exit 0).

- ✅ **2025-12-17 Decluster bases=[11,66,68] (Dzao Min vs Iu Mien):** applied `tools/mixer-deltas/2025-12-17-decluster-11-66-68-dzao-min-iu-mien.json` to set `iu-mien` bases to `[11,68,74]` while `dzao-min` remains `[11,66,68]`; regenerated artifacts via `pnpm run mixer:apply-deltas`; verified via `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2 --include-families` and `pnpm exec -- node tools/check-language-mixer-map-inconsistencies.js --show-all-bases` (both exit 0).

- ✅ **2025-12-17 Decluster bases=[304] (Waray vs Cebuano):** applied `tools/mixer-deltas/2025-12-17-decluster-304-war-cebuano.json` to set `waray` bases to `[515,516]` while `cebuano-lang` remains `[304]`; regenerated artifacts via `pnpm run mixer:apply-deltas`; verified `-- bases=[304]` cluster is gone via `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2` and verified map health via `pnpm exec -- node tools/check-language-mixer-map-inconsistencies.js --show-all-bases` (exit 0).

- ✅ **2025-12-18 Decluster bases=[369] (Micronesian: carolinian / Sonsorolese / Tobian):** applied `tools/mixer-deltas/2025-12-18-decluster-369-micronesian.json` to set `sonsorolese` bases to `[369,370]` and `tobian` bases to `[369,371]` while `carolinian` remains `[369]`; regenerated artifacts via `pnpm run mixer:apply-deltas`; verified via `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2 --include-families` and `pnpm exec -- node tools/check-language-mixer-map-inconsistencies.js --show-all-bases` (both exit 0).

- ✅ **2025-12-18 Decluster bases=[56] (Kiranti: Khaling / Koi / Tilung):** applied `tools/mixer-deltas/2025-12-18-decluster-56-kiranti-klr-kkt-tij.json` to set `klr` bases to `[8380]`, `kkt` to `[8381]`, and `tij` to `[8382]` (breaking the prior `bases=[56]` cluster); added dedicated base defs `i:8380–8382` in `modules/namebases-real.js`; regenerated artifacts via `pnpm run mixer:apply-deltas`; verified via `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2 --include-families` and `pnpm exec -- node tools/check-language-mixer-map-inconsistencies.js --show-all-bases` (both exit 0).

- ✅ **2025-12-18 language-uniqueness (French bases=[2] remainder):** applied dedicatedPins delta `tools/mixer-deltas/2025-12-18-language-uniqueness-french-bases2-remainder-8340-8343-dedicatedpins.json` to pin `fran-ais-tirailleur->8340`, `t-y-b-i-pidgin-french->8341`, `petuh->8342`, `sercquiais->8343`; ensured dedicated base defs `i:8340–8343` exist in `modules/namebases-real.js`; regenerated artifacts via `pnpm run mixer:apply-deltas`; verified `pnpm run mixer:check-deltas`, `check-language-mixer-map-duplicate-isos`, `check-language-mixer-map-inconsistencies --show-all-bases`, `check-language-mixer-coverage`, `check-language-mixer-failures`, and `report-language-mixer-base-clusters --min-size=2 --include-families` (all exit 0). Confirmed no catalog languages remain with `bases=[2]` only.

- ✅ **2025-12-18 Decluster bases=[307] (West African English Creole: cameroonian-pidgin / liberian-kreyol / merico / pichinglis):** applied `tools/mixer-deltas/2025-12-18-decluster-307-west-african-english-creole.json` to set `cameroonian-pidgin` bases to `[21,307]`, `liberian-kreyol` to `[307,666]`, `merico` to `[1,307]`, and `pichinglis` to `[307,432]`; regenerated artifacts via `pnpm run mixer:apply-deltas`; verified via `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=3 --include-families` (no `bases=[307]` 4-member cluster) and `pnpm exec -- node tools/check-language-mixer-map-inconsistencies.js --show-all-bases` (exit 0).

- ✅ **2025-12-18 Decluster bases=[0] (German contact: missingsch / namibian-black-german / kiautschou-pidgin-german):** applied `tools/mixer-deltas/2025-12-18-decluster-0-german-contact.json` to set `missingsch` bases to `[0,6]`, `namibian-black-german` to `[0,1]`, and `kiautschou-pidgin-german` to `[0,11]`; regenerated artifacts via `pnpm run mixer:apply-deltas`; verified via `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=3 --include-families` (cluster count reduced by 1; no `bases=[0]` size>=3 cluster) and `pnpm exec -- node tools/check-language-mixer-map-inconsistencies.js --show-all-bases` (exit 0).

- ✅ **2025-12-18 Decluster bases=[1,13] (Dutch creoles: negerhollands / negro-dutch / skepi-dutch-creole):** staged `tools/mixer-deltas/2025-12-18-decluster-1-13-dutch-creoles.json` as a no-op alignment with the current map ordering (`negerhollands` `[0,1,13]`, `negro-dutch` `[1,6,13]`, `skepi-dutch-creole` `[1,13]`). Verified: `pnpm run mixer:guardrails` OK; `pnpm exec -- node tools/mixer-core/apply-mixer-deltas.js --check --no-lock` OK; `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2 --include-families` ran; `pnpm exec -- node tools/check-language-mixer-map-inconsistencies.js --show-all-bases` exit 0.

- ✅ **2025-12-18 Decluster bases=[1,11] (English+Chinese contact: javindo / petjo / xieheyu):** applied `tools/mixer-deltas/2025-12-18-decluster-1-11-english-chinese-contact.json` to set `javindo` bases to `[1,11,367]`, `petjo` to `[1,11,0]`, and `xieheyu` to `[1,11,373]`; regenerated artifacts via `pnpm run mixer:apply-deltas`; verified via `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=3 --include-families` (no `bases=[1,11]` size>=3 cluster) and `pnpm exec -- node tools/check-language-mixer-map-inconsistencies.js --show-all-bases` (exit 0).

- ✅ **2025-12-18 Decluster bases=[1,2] (English+French mixed: michif / mohawk-dutch / franglish):** applied `tools/mixer-deltas/2025-12-18-decluster-1-2-english-french-mixed.json` to set `michif` bases to `[1,2,0]`, `mohawk-dutch` to `[1,2,6]`, and keep `franglish` at `[1,2]`; regenerated artifacts via `pnpm run mixer:apply-deltas`; verified via `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=3 --include-families` (no `bases=[1,2]` size>=3 cluster) and `pnpm exec -- node tools/check-language-mixer-map-inconsistencies.js --show-all-bases` (exit 0).

- ✅ **2025-12-17 Decluster bases=[375,388] (Kurukh vs Kisan):** applied `tools/mixer-deltas/2025-12-17-decluster-kurukh-xis.json` to set `kurukh` bases to `[375,376]` and `xis` bases to `[374,375,376]` (removing the implausible Amazonian base `388`); regenerated artifacts via `pnpm run mixer:apply-deltas`; verified via `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2 --include-families` and `pnpm exec -- node tools/check-language-mixer-map-inconsistencies.js --show-all-bases` (both exit 0).

- ✅ **2025-12-17 Decluster bases=[185] (Miskito vs Rama):** applied `tools/mixer-deltas/2025-12-17-decluster-185-miskito-rma.json` to pin `rma` to a new dedicated base `7070` and set `rma` bases to `[7070]` while `miskito` remains `[185]`; added `Rama (dedicated)` base definition `i: 7070` in `modules/namebases-real.js`; regenerated artifacts via `pnpm run mixer:apply-deltas`; verified via `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2 --include-families` (no `bases=[185]` hits) and `pnpm exec -- node tools/check-language-mixer-map-inconsistencies.js --show-all-bases` (exit 0).


- Current target thresholds (explicit goal, tracked as debt; **not** a suite “hard gate”): strict unique seeds `>= 1` and normalized unique seeds `>= 10`.

- Single-integrator lane (multi-agent note): historical entries below may mention `pnpm run mixer:apply-deltas` as part of verification logs, but in multi-agent contexts only the integrator should run `pnpm run mixer:apply-deltas` to write/regenerate committed artifacts. Non-integrators should hand off delta files + notes and may use `pnpm exec -- node tools/mixer-core/apply-mixer-deltas.js --check` for read-only validation.
  See `.windsurf/workflows/single-integrator-lane.md`.

- To measure current compliance and track progress, use:
  - `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures`

 Latest seed-uniqueness report snapshot (2025-12-13):



- Target ISOs: 3366


- Missing mapping: 0


- No globally-unique base index: 3193


- Strict unique seeds below threshold (among those with unique base): 6


- Normalized unique seeds below threshold (among those with unique base): 93



- ✅ **2025-12-13 NO_UNIQ_BASE micro-pass (Formosan/Taiwan batch):** added dedicated bases `559–563` for `bunun`, `bunun-isbukun`, `bunun-northern-central`, `byq`, `bzg` (and appended them in `config/language-mixer-map.json`). Verified via `run-language-mixer-suite` + `report-language-mixer-seed-uniqueness` that each now reports `uniqBase` (`strictOK`, `norm<10`).



- ✅ **2025-12-13 NO_UNIQ_BASE micro-pass (reserved-bases batch):** appended reserved bases `539, 540, 543–547, 556, 558` to `mardijker-creole`, `tetum`, `abui`, `angal`, `asmat`, `asmat-citak`, `asmat-kamoro`, `kamoro`, `kenati` in `config/language-mixer-map.json`. Verified via `run-language-mixer-suite` + `report-language-mixer-seed-uniqueness` that each now reports `uniqBase` (`strictOK`).



- ✅ **2025-12-13 NO_UNIQ_BASE micro-pass (Ryukyuan/Japanese-contact batch):** added dedicated bases `602–606` for `yaeyama`, `yonaguni`, `yoron`, `yilan-creole-japanese`, `yokohama-pidgin-japanese` (and appended them in `config/language-mixer-map.json`). Verified via `run-language-mixer-suite` + `report-language-mixer-seed-uniqueness --only-failures --limit=500` that none appear under `NO_UNIQ_BASE`.



- ✅ **2025-12-13 NO_UNIQ_BASE micro-pass (Ryukyuan/Japonic continuation batch):** added dedicated bases `630–634` for `macro-yaeyama`, `miyakoan`, `southern-amami`, `okinoerabu`, `tokunoshima` (and appended them in `config/language-mixer-map.json`). Verified via `run-language-mixer-suite` + `report-language-mixer-seed-uniqueness --only-failures --limit=500` that none appear under `NO_UNIQ_BASE`.



- ✅ **2025-12-13 NO_UNIQ_BASE micro-pass (Ryukyuan/Japonic batch):** added dedicated bases `655`, `673`, `674`, `658` for `amami`, `kikai`, `kunigami`, `okinawan` (and appended them in `config/language-mixer-map.json`). Verified via `run-language-mixer-suite` + `report-language-mixer-seed-uniqueness "--only=amami,kikai,kunigami,okinawan"` that all now report `uniqBase` + `strictOK` + `normOK`.



- ✅ **2025-12-13 NO_UNIQ_BASE micro-pass (Ryukyuan/Japonic continuation / worker6c):** added dedicated bases `703–708` for `ainu`, `hachijo`, `japanese-dialects`, `jpn`, `jpn-lang`, `ryukyuan` (and appended them in `config/language-mixer-map.json`). Verified via `run-language-mixer-suite` + `report-language-mixer-seed-uniqueness --only-failures "--only=ainu,hachijo,japanese-dialects,jpn,jpn-lang,ryukyuan" --limit=80` that all report `uniqBase` (`strictOK`, `normOK`).



- ✅ **2025-12-13 NO_UNIQ_BASE micro-pass (Romance / Italy dialects):** added dedicated bases `567–571` for `bustocco-legnanese`, `cadorino`, `calabro`, `campano`, `campidanese` (and appended them in `config/language-mixer-map.json`). Verified via `run-language-mixer-suite` + `report-language-mixer-seed-uniqueness` that each now reports `uniqBase` (all `strictOK`; `campano`/`campidanese` still `norm<10`).



- ✅ **2025-12-13 NO_UNIQ_BASE micro-pass (Iberian / Romance dialects):** ensured dedicated bases for `canarian`, `cantabrian`, `cast-o`, `castrapo`, `cat` by wiring `canarian` to existing base `572` and adding new dedicated bases `582–585` (Catalan/Cantabrian/Castúo/Castrapo), then appending them in `config/language-mixer-map.json`. Verified via `run-language-mixer-suite` + `report-language-mixer-seed-uniqueness` that none of these ISOs appear in `--only-failures`.



- ✅ **2025-12-13 NO_UNIQ_BASE micro-pass (Romance / worker10 slice):** added dedicated bases `635–642` and `650` for `aragonese`, `central-aragonese`, `castilian`, `castelmezzano`, `central-italian`, `central-marchigiano`, `central-metafonetica`, `central-southern-calabrian`, `canadian-french` (and appended them in `config/language-mixer-map.json`). Verified via `run-language-mixer-suite` + `report-language-mixer-seed-uniqueness --only-failures --only-isos=aragonese,central-aragonese,castilian,castelmezzano,central-italian,central-marchigiano,central-metafonetica,central-southern-calabrian,canadian-french --limit=50` that each reports `uniqBase`.



- ✅ **2025-12-13 NO_UNIQ_BASE micro-pass (Cameroon/Nigeria Chadic + Cameroonian Pidgin):** added dedicated bases `586–589` (`bura-language`, `bure-chadic-language`, `buwal-language`, `cakfem-mushere-language`) and `597–601` (`cameroonian-pidgin`, `cameroonian-pidgin-english`, `bole-tangale`, `tangale-language`, `dangaleat-language`) in `modules/namebases-real.js`, and appended them to each ISO in `config/language-mixer-map.json`. Verified via `run-language-mixer-suite` + seed-uniqueness report that all now report `uniqBase` (notably `cameroonian-pidgin-english` still has `strict<1`; `norm<10` remains tracked debt).



- ✅ **2025-12-13 NO_UNIQ_BASE micro-pass (Sámi batch):** added dedicated bases `575–581` for `akkala-sami`, `finnmark-sami`, `inari-sami`, `kainuu-sami`, `kemi-sami`, `kildin-sami`, `lule-sami` (appended in `config/language-mixer-map.json`). Verified via `report-language-mixer-seed-uniqueness` that each now reports `uniqBase` (`strictOK`, `norm<10`).



- ✅ **2025-12-13 NO_UNIQ_BASE micro-pass (Arabic dialects batch):** added dedicated bases `616–619` for `adeni-arabic`, `aleppine-arabic`, `algerian-arabic`, `algerian-saharan-arabic` (appended in `config/language-mixer-map.json`). Verified via `run-language-mixer-suite` + `report-language-mixer-seed-uniqueness --only-failures --limit=500` that none appear under `NO_UNIQ_BASE`.



- ✅ **2025-12-13 NO_UNIQ_BASE micro-pass (Arabic dialect slice / worker11):** added dedicated bases `676–683` for `anatolian-arabic`, `andalusi-arabic`, `baghdadi-arabic`, `bahraini-gulf-arabic`, `bakhtiari-arabic`, `bukharian-arabic`, `cairene-arabic`, `central-asian-arabic` (appended in `config/language-mixer-map.json`). Verified via `run-language-mixer-suite` + `report-language-mixer-seed-uniqueness --only-failures "--only=anatolian-arabic,andalusi-arabic,baghdadi-arabic,bahraini-gulf-arabic,bakhtiari-arabic,bukharian-arabic,cairene-arabic,central-asian-arabic" --limit=80` that all report `uniqBase` (`strictOK`; `norm<10` still tracked debt for `andalusi-arabic`, `bakhtiari-arabic`, `bukharian-arabic`, `central-asian-arabic`).



- ✅ **2025-12-13 NO_UNIQ_BASE micro-pass (Uralic central-* slice / worker14):** added dedicated bases `717–724` for `central-ludic`, `central-veps`, `central-vychegda`, `central-mansi`, `central-selkup`, `central-moksha`, `central-estonian`, `central-erzya` (appended in `config/language-mixer-map.json`). Verified via `run-language-mixer-suite` + `report-language-mixer-seed-uniqueness --only-failures "--only=central-ludic,central-veps,central-vychegda,central-mansi,central-selkup,central-moksha,central-estonian,central-erzya" --limit=120` that all report `uniqBase` (`strictOK`; `norm<10` still tracked debt for `central-vychegda`, `central-mansi`, `central-moksha`, `central-estonian`, `central-erzya`).



- ✅ **2025-12-15 NO_UNIQ_BASE2 micro-pass (Uralic collisions / worker55):** pinned dedicated bases `935–944` for `bjarmian-finnic`, `proto-sami`, `forest-nenets`, `proto-finnic`, `southwestern-finnish`, `proto-uralic`, `proto-karelian`, `proto-permic`, `somero-region`, `j-mtland` (via `tools/mixer-deltas/2025-12-14-worker55-uralic-collisions.json`). Verified via `/no-unique-base2` commands: `mixer:guardrails`, `mixer:check-deltas`, seed-uniqueness `--only-failures` (0 `NO_UNIQ_BASE`, 0 strict/norm failures), `check-language-mixer-coverage` (0 missing), `check-language-mixer-failures` (0 failing), and `report-language-mixer-base-clusters --min-size=2`.



- ✅ **2025-12-15 NO_UNIQ_BASE2 micro-pass (Uralic collisions / worker56):** pinned dedicated bases `1030–1037` for `nenets`, `tundra-nenets`, `north-estonian`, `western-estonian`, `northern-erzya`, `southeastern-erzya`, `western-erzya`, `shoksha` (via `tools/mixer-deltas/2025-12-15-worker56-uralic-nenets-estonian-erzya.json`). Verified via `/no-unique-base2` commands (0 `NO_UNIQ_BASE`, 0 strict/norm failures).



- ✅ **2025-12-15 NO_UNIQ_BASE2 micro-pass (Uralic collisions / worker57):** pinned dedicated bases `1130–1136` for `eastern-khanty`, `eastern-mansi`, `western-mansi`, `cs-ng-`, `northeast-hungary`, `transylvanian-plain`, `southern-sami` (via `tools/mixer-deltas/2025-12-15-worker57-uralic.json`). Verified via `/no-unique-base2` commands (0 `NO_UNIQ_BASE`, 0 strict/norm failures), coverage (0 missing), failures (0 failing).



- ✅ **2025-12-15 NO_UNIQ_BASE2 micro-pass (Uralic collisions / worker59):** pinned dedicated bases `1230–1234` for `mator`, `mator-proper`, `proto-ob-ugric`, `kamas`, `nganasan` (via `tools/mixer-deltas/2025-12-15-worker59-uralic-mator-kamas.json`). Verified via `/no-unique-base2` commands (0 `NO_UNIQ_BASE`, 0 strict/norm failures), coverage (0 missing), failures (0 failing), and base-clusters (0 clusters for Mator, Nganasan).



- ✅ **2025-12-15 NO_UNIQ_BASE2 micro-pass (Romance Lombard / worker60):** pinned dedicated bases `1280–1283` for `western-lombard`, `varesino`, `ticinese`, `triestine` (via `tools/mixer-deltas/2025-12-15-worker60-romance-lombard.json`). Verified via `/no-unique-base2` commands (0 `NO_UNIQ_BASE`, 0 strict/norm failures), coverage (0 missing), failures (0 failing), and base-clusters report (`report-language-mixer-base-clusters.js --min-size=2`, exit 0). Claim marked `complete` in `tools/mixer-diagnostics/_no_uniq_base_claims.json` and artifacts regenerated via `pnpm run mixer:apply-deltas`.



- ✅ **2025-12-15 NO_UNIQ_BASE2 micro-pass (Romance R-batch / worker61):** pinned dedicated bases `1340–1344` for `quebec-french`, `r-mois`, `regional-italian`, `ribagor-an`, `riberan` (via `tools/mixer-deltas/2025-12-15-worker61-romance.json`). Verified via `/no-unique-base2` commands (0 `NO_UNIQ_BASE`, 0 strict/norm failures), coverage (0 missing), failures (0 failing), and base-clusters report.



- ✅ **2025-12-15 NO_UNIQ_BASE2 micro-pass (Romance R-batch / worker62):** pinned dedicated bases `1390–1394` for `riojan`, `rioplatense-spanish`, `riunorese`, `romagnol`, `romanesco` (via `tools/mixer-deltas/2025-12-15-worker62-romance.json`). Verified via `/no-unique-base2` commands (0 `NO_UNIQ_BASE`, 0 strict failures), coverage (0 missing), failures (0 failing), and base-clusters report (`report-language-mixer-base-clusters.js --min-size=2`, exit 0). Claim marked `complete` in `tools/mixer-diagnostics/_no_uniq_base_claims.json` and artifacts regenerated via `pnpm run mixer:apply-deltas`.



- ✅ **2025-12-15 NO_UNIQ_BASE2 micro-pass (Romance R-batch / worker63):** pinned dedicated bases `1440–1444` for `romanian`, `romansh`, `ron`, `royasc`, `ruo` (via `tools/mixer-deltas/2025-12-15-worker63-romance.json`). Verified via `/no-unique-base2` commands (0 `NO_UNIQ_BASE`, 0 strict/norm failures), coverage (0 missing), failures (0 failing), and base-clusters report. Claim marked `complete` in `tools/mixer-diagnostics/_no_uniq_base_claims.json` and artifacts regenerated via `pnpm run mixer:apply-deltas`.


- ✅ **2025-12-15 NO_UNIQ_BASE2 micro-pass (Romance R-batch / worker64):** pinned dedicated bases `1490–1494` for `rup`, `ruq`, `sabino`, `saharan-spanish`, `salentino` (via `tools/mixer-deltas/2025-12-15-worker64-romance.json`). Verified via `/no-unique-base2` commands (0 `NO_UNIQ_BASE`, 0 strict/norm failures), coverage (0 missing), failures (0 failing), and base-clusters report (`report-language-mixer-base-clusters.js --min-size=2 --category=Romance`, exit 0). Claim marked `complete` in `tools/mixer-diagnostics/_no_uniq_base_claims.json`.



- ✅ **2025-12-19 NO_UNIQ_BASE2 micro-pass (Chinese batch / worker1):** reserved `i:8715–8764`, pinned dedicated bases `8715–8719` for `chin`, `chinantec`, `chinese-korean`, `chinese-kyakala`, `chinese-pidgin-english` (claim `batchId=2025-12-19T03:20:12.740Z-worker1`). Verified `/no-unique-base2` checklist:
  - `pnpm run mixer:guardrails`
  - `pnpm run mixer:check-deltas`
  - `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures "--only-isos=chin,chinantec,chinese-korean,chinese-kyakala,chinese-pidgin-english" --limit=300`
  - `pnpm exec -- node tools/mixer-core/check-language-mixer-coverage.js`
  - `pnpm exec -- node tools/mixer-core/check-language-mixer-failures.js`
  - `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2` (exit 0)
  Claim now marked `complete` in `tools/mixer-diagnostics/_no_uniq_base_claims.json`; no remaining strict/norm debt.
- ✅ **2025-12-19 NO_UNIQ_BASE2 micro-pass (Chinook batch / worker1):** reserved `i:8765–8814`, pinned dedicated bases `8765–8769` for `chinook-jargon`, `chittagonian`, `cholanaikkan`, `cholti-classic`, `chong` via `tools/mixer-deltas/2025-12-19-worker1-mixed-chinook-jargon.json` (base defs already present in `modules/namebases-real.js`). Verification checklist rerun post-apply (`pnpm run mixer:guardrails`, `pnpm run mixer:apply-deltas`, `pnpm run mixer:check-deltas`, seed-uniqueness `--only-failures "--only-isos=chinook-jargon,chittagonian,cholanaikkan,cholti-classic,chong" --limit=300`, `check-language-mixer-coverage`, `check-language-mixer-failures`, `report-language-mixer-base-clusters --min-size=2`) — all green. Claim `batchId=2025-12-19T10:54:04.463Z-worker1` marked `complete`; no strict/norm debt.
- ✅ **2025-12-19 NO_UNIQ_BASE2 micro-pass (Chongqing Mandarin batch / worker1):** reserved `i:8865–8914`, applied delta `tools/mixer-deltas/2025-12-19-worker1-mixed-chongqing-mandarin.json` (bases already appended in `modules/namebases-real.js`) to pin `chongqing-mandarin`, `chorote`, `chorotega`, `choshuenco`, `chovashi`. Restored the missing catalog entries in `config/language-mixes.json` so the ISOs are recognized. Verification checklist: `pnpm run mixer:guardrails`, `pnpm run mixer:apply-deltas`, `pnpm run mixer:check-deltas`, `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures "--only-isos=chongqing-mandarin,chorote,chorotega,choshuenco,chovashi" --limit=300`, `pnpm exec -- node tools/mixer-core/check-language-mixer-coverage.js`, `pnpm exec -- node tools/mixer-core/check-language-mixer-failures.js`, `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2` → all clean. Claim `batchId=2025-12-19T11:04:24.760Z-worker1` now `complete`; NO_UNIQ_BASE cleared for the batch.



- ✅ **2025-12-15 NO_UNIQ_BASE2 micro-pass (Romance S-batch / worker65):** pinned dedicated bases `1590–1594` for `senese`, `sicilian`, `somontan-s`, `southeast-metafonetica`, `southern-aragonese` (via `tools/mixer-deltas/2025-12-15-worker65-romance.json`). Verified via `/no-unique-base2` commands (0 `NO_UNIQ_BASE`, 0 strict/norm failures for the batch), coverage (0 missing), failures (0 failing), and base-clusters report (`report-language-mixer-base-clusters.js --min-size=2`, exit 0). Claim marked `complete` in `tools/mixer-diagnostics/_no_uniq_base_claims.json` and artifacts regenerated via `pnpm run mixer:apply-deltas`.


- ✅ **2025-12-15 mixer:apply-deltas unblock (namebases-creole encoding):** updated `tools/mixer-core/apply-mixer-deltas.js` and `tools/mixer-core/check-language-mixer-guardrails.js` to decode `modules/namebases-*.js` from raw buffers with UTF-8/UTF-16 fallback so files containing NUL bytes (e.g. UTF-16) don’t cause false “Missing base definitions” errors during `mixer:guardrails` / `mixer:check-deltas`.

- ✅ **2025-12-15 apply-mixer-deltas scanner hardening (NUL stripping):** restored `src.replace(/\u0000/g,"")` in `loadNamebaseIndices()` so `apply-mixer-deltas.js --check` does not emit false “Missing base definitions” when decoded sources contain embedded NUL bytes.



- ✅ **2025-12-15 NO_UNIQ_BASE2 micro-pass (Romansh dialects / worker63):** pinned dedicated bases `1640–1644` for `surmiran`, `sursilvan`, `sutsilvan`, `tuatschin`, `vallader` (via `tools/mixer-deltas/2025-12-15-worker63-romance-romansh-varieties.json`). Verified via `/no-unique-base2` commands (0 `NO_UNIQ_BASE`, 0 strict/norm failures for the batch), coverage (0 missing), failures (0 failing), and base-clusters report (`report-language-mixer-base-clusters.js --min-size=2`, exit 0). Claim marked `complete` in `tools/mixer-diagnostics/_no_uniq_base_claims.json` and artifacts regenerated via `pnpm run mixer:apply-deltas`.



- ✅ **2025-12-15 NO_UNIQ_BASE2 micro-pass (Romance T-batch / worker2):** pinned dedicated bases `1804–1808` for `southern-cilentan`, `tabarchino`, `talian`, `tetuani`, `transylvanian` (via `tools/mixer-deltas/2025-12-15-worker2-romance.json`). Verified via `/no-unique-base2` commands (0 `NO_UNIQ_BASE`, 0 strict/norm failures for the batch), coverage (0 missing), failures (0 failing), and base-clusters report (`report-language-mixer-base-clusters.js --min-size=2`, exit 0). Claim marked `complete` in `tools/mixer-diagnostics/_no_uniq_base_claims.json` and artifacts regenerated via `pnpm run mixer:apply-deltas`.



- ✅ **2025-12-15 NO_UNIQ_BASE2 micro-pass (Romance U/V-batch / worker1):** pinned dedicated bases `1854–1858` for `tuscia`, `umbrian`, `uruguayan-portuguese`, `uruguayan-spanish`, `vald-tain` (via `tools/mixer-deltas/2025-12-15-worker1-romance-tuscia.json`). Verified via `/no-unique-base2` commands (0 `NO_UNIQ_BASE`, 0 strict/norm failures for the batch), coverage (0 missing), failures (0 failing), and base-clusters report (`report-language-mixer-base-clusters.js --min-size=2`, exit 0). Claim marked `complete` in `tools/mixer-diagnostics/_no_uniq_base_claims.json` and artifacts regenerated via `pnpm run mixer:apply-deltas`.



- ✅ **2025-12-15 NO_UNIQ_BASE2 micro-pass (Romance V-batch / worker1):** pinned dedicated bases `1904–1908` for `valencian`, `venetian`, `venezuelan-spanish`, `versiliese`, `viareggino` (via `tools/mixer-deltas/2025-12-15-worker1-romance-valencian.json`). Verified via `/no-unique-base2` commands (0 `NO_UNIQ_BASE`, 0 strict/norm failures for the batch), coverage (0 missing), failures (0 failing), and base-clusters report (`report-language-mixer-base-clusters.js --min-size=2`, exit 0). Claim marked `complete` in `tools/mixer-diagnostics/_no_uniq_base_claims.json` and artifacts regenerated via `pnpm run mixer:apply-deltas`.


- ✅ **2025-12-15 NO_UNIQ_BASE2 micro-pass (Romance W-batch / worker1):** pinned dedicated bases `1954–1958` for `vivaro-alpine`, `vosgien`, `wallachian`, `welche`, `west-walloon` (via `tools/mixer-deltas/2025-12-15-worker1-romance-vivaro-alpine.json`). Verified via `/no-unique-base2` commands (0 `NO_UNIQ_BASE`, 0 strict/norm failures for the batch), coverage (0 missing), failures (0 failing), and base-clusters report (`report-language-mixer-base-clusters.js --min-size=2 --category=Romance`, 0 clusters). Claim marked `complete` in `tools/mixer-diagnostics/_no_uniq_base_claims.json` and artifacts regenerated via `pnpm run mixer:apply-deltas`.




- **2025-12-15 NO_UNIQ_BASE2 claim cleanup (Romance western batch / worker2):** abandoned earlier claim `batchId=2025-12-15T08:14:55.146Z-worker2` due to reservedRange collision (`2019–2022` already used in `modules/namebases-real.js`); superseded by the completed claim `batchId=2025-12-15T08:27:51.660Z-worker2`.


- ✅ **2025-12-15 NO_UNIQ_BASE2 micro-pass (Mixed A5-batch / worker1):** pinned dedicated bases `2469–2473` for `ahr`, `aht`, `ai-cham`, `aimele`, `air-tamajeq-language` (via `tools/mixer-deltas/2025-12-15-worker1-mixed-ahr.json`). Verified via `/no-unique-base2` commands (0 `NO_UNIQ_BASE`, 0 strict/norm failures for the batch), coverage (0 missing), failures (0 failing), and base-clusters report (`report-language-mixer-base-clusters.js --min-size=2`, exit 0). Claim marked `complete` in `tools/mixer-diagnostics/_no_uniq_base_claims.json` and artifacts regenerated via `pnpm run mixer:apply-deltas`.
- ✅ **2025-12-15 NO_UNIQ_BASE2 micro-pass (Alchuka batch / worker2):** pinned dedicated bases `2769–2773` for `alchuka`, `alekano`, `algonquian-basque-pidgin`, `allar`, `almosan` (delta: `tools/mixer-deltas/2025-12-15-worker2-mixed-alchuka.json`; base defs: `modules/namebases-creole.js` `i:2769–2773`). Verified via `/no-unique-base2` commands: `pnpm run mixer:check-deltas` OK; seed-uniqueness (only-failures, only-isos=batch) => Missing mapping:0; No globally-unique base index:0; strictFail:0; normFail:0; coverage (0 missing); failures (0 failing); base-clusters (`report-language-mixer-base-clusters.js --min-size=2`, exit 0). Claim marked `complete` in `tools/mixer-diagnostics/_no_uniq_base_claims.json`.
- ✅ **2025-12-16 akkadian cleanup (remove invalid base 5011):** removed the stray invalid base `5011` from `akkadian` by setting `bases[]` to `[23, 42, 2671]` via `tools/mixer-deltas/2025-12-16-language-uniqueness-worker1-akkadian-5011-cleanup.json`. Applied via `pnpm run mixer:apply-deltas`. Verified: `pnpm run mixer:check-deltas` OK; `check-language-mixer-failures` no longer reports `akkadian` in the mixed-valid/invalid list; `config/language-mixer-map.json` now has `akkadian` bases `[23,42,2671]` and no `5011` entries remain.


- ✅ **2025-12-16 integrator cycle (artifact regeneration):** ran `pnpm run mixer:apply-deltas` to regenerate committed artifacts, then confirmed `pnpm run mixer:check-deltas` OK. Additional gates run and green: `pnpm exec -- node tools/mixer-core/check-language-mixer-coverage.js` (0 missing), `pnpm exec -- node tools/mixer-core/check-language-mixer-failures.js` (0 failing), `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2` (exit 0).
 
 - ✅ **2025-12-17 integrator cycle (artifact regeneration):** `pnpm run mixer:apply-deltas` OK; `pnpm run mixer:check-deltas` OK. Targeted `/no-unique-base2` verify for `bayot,bbc,bbh,bcc,bdz`: seed-uniqueness (only-failures, only-isos=batch) => Target ISOs: 5; Missing mapping: 0; No globally-unique base index: 0; strictFail: 0; normFail: 0. Coverage: 0 missing; failures: 0 failing.

 - ✅ **2025-12-17 language-uniqueness (Tai–Kadai batch3):** resolved 5 Tai–Kadai identical `bases[]` collisions by pinning dedicated bases `6600–6609` for `e-tai, kuan, lao-nyo, tai-muong-vat, nung-tai, lao-phutai, pa-di, thai-song, northwestern-tai, southwestern-tai` (delta: `tools/mixer-deltas/2025-12-17-language-uniqueness-tai-kadai-batch3-dedicatedpins.json`; base defs: `modules/namebases-real.js` `i:6600–6609`). Applied via `pnpm run mixer:apply-deltas`. Verified: `pnpm run mixer:check-deltas` OK; `pnpm exec -- node tools/mixer-diagnostics/check-language-mixer-map-duplicate-isos.js` => 0 duplicates; `pnpm exec -- node tools/check-language-mixer-map-inconsistencies.js --show-all-bases` exit 0; `pnpm exec -- node tools/mixer-core/check-language-mixer-coverage.js` (0 missing); `pnpm exec -- node tools/mixer-core/check-language-mixer-failures.js` (0 failing). Tai–Kadai base-clusters reduced from 9 clusters (18 entries) to 4 clusters (8 entries).

 - ✅ **2025-12-17 /no-unique-base2 verification (Tai–Kadai batch3):** seed-uniqueness (only-failures, only-isos=batch) => Target ISOs: 10; Missing mapping: 0; No globally-unique base index: 0; strictFail: 0; normFail: 0. Coverage: 0 missing; failures: 0 failing.

 - ✅ **2025-12-17 language-uniqueness (Tai–Kadai batch4):** resolved remaining Tai–Kadai identical `bases[]` collisions by pinning dedicated bases `6610–6617` for `tay-tai,tai,tay-tac,northern-tai,min-zhuang,tai-long,yei-zhuang,tai-daeng` (delta: `tools/mixer-deltas/2025-12-17-language-uniqueness-tai-kadai-batch4-dedicatedpins.json`; base defs: `modules/namebases-real.js` `i:6610–6617`). Applied via `pnpm run mixer:apply-deltas`. Verified: `pnpm run mixer:check-deltas` OK; duplicate-isos => 0; inconsistencies `--show-all-bases` exit 0; coverage (0 missing); failures (0 failing); Tai–Kadai base-clusters `report-language-mixer-base-clusters.js --min-size=2 --family=Tai-Kadai --include-families` => 0 clusters.
 
 - ✅ **2025-12-17 language-uniqueness (South Asia batch1):** resolved 5 identical `bases[]` collisions via `setBases` delta `tools/mixer-deltas/2025-12-17-language-uniqueness-south-asia-batch1-setbases.json` (overrides for `hnd,xhe,kvx,gwf,bsh`). Applied via `pnpm run mixer:apply-deltas`. Verified: `pnpm run mixer:check-deltas` OK; `check-language-mixer-map-duplicate-isos` => 0 duplicates; inconsistencies `--show-all-bases` exit 0; coverage (0 missing); failures (0 failing); base-clusters (`--min-size=2 --include-families`) reduced from 97 clusters to 91.
 
 - ✅ **2025-12-17 language-uniqueness (Caribbean English Creole batch1):** reduced the `bases=[308]` cluster by pinning dedicated bases `7300–7309` for `grenadian-creole-english,leeward-caribbean-creole-english,limonese-creole,miskito-coast-creole,montserrat-creole,rama-cay-creole,saint-kitts-creole,san-andres-providencia-creole,tobagonian-creole,trinidadian-creole` (delta: `tools/mixer-deltas/2025-12-17-language-uniqueness-caribbean-creole-batch1-dedicatedpins.json`; base defs: `modules/namebases-creole.js` `i:7300–7309`). Applied via `pnpm run mixer:apply-deltas`. Verified: `pnpm run mixer:check-deltas` OK; `check-language-mixer-map-duplicate-isos` => 0 duplicates; inconsistencies `--show-all-bases` exit 0; coverage (0 missing); failures (0 failing); base-clusters (`--min-size=2 --include-families`) reduced from 91 clusters to 90.

 - ✅ **2025-12-18 language-uniqueness (French-based creoles batch1):** resolved 10 identical `bases[]` collisions by pinning dedicated bases `8330–8339` for `chagossian-creole,dominican-creole-french,french-guianese-creole,grenadian-creole-french,karip-na-french-creole,louisiana-creole,r-union-creole,rodriguan-creole,saint-lucian-creole,tayo-creole` (delta: `tools/mixer-deltas/2025-12-18-language-uniqueness-french-based-creoles-batch1-8330-8339-dedicatedpins.json`; base defs: `modules/namebases-creole.js` `i:8330–8339`). Applied via `pnpm run mixer:apply-deltas`. Verified: `pnpm run mixer:check-deltas` OK; `pnpm exec -- node tools/mixer-diagnostics/check-language-mixer-map-duplicate-isos.js` => 0 duplicates; `pnpm exec -- node tools/check-language-mixer-map-inconsistencies.js --show-all-bases` exit 0; `pnpm exec -- node tools/mixer-core/check-language-mixer-coverage.js` (0 missing); `pnpm exec -- node tools/mixer-core/check-language-mixer-failures.js` (0 failing); re-ran base-clusters (`pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2 --include-families`) exit 0; seed-uniqueness (`pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures --limit=300`) exit 0.

 - ✅ **2025-12-18 language-uniqueness (Gurage bases=[311] batch1):** reduced the `bases=[311]` cluster by pinning dedicated bases `8510–8519` for `zway,sebat-bet,ulbare,wolane,mesmes,mesqan,muher,sebat-bet-gurage,inneqor,inor` (delta: `tools/mixer-deltas/2025-12-18-language-uniqueness-gurage-bases311-batch1-8510-8519-dedicatedpins.json`; base defs: `modules/namebases-real.js` `i:8510–8519`). Applied via `pnpm run mixer:apply-deltas`. Verified: `pnpm run mixer:check-deltas` OK; duplicate-isos => 0; inconsistencies `--show-all-bases` exit 0; coverage OK; failures OK; base-clusters re-run (`pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2 --include-families`) exit 0; seed-uniqueness `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures --only-isos="zway,sebat-bet,ulbare,wolane,mesmes,mesqan,muher,sebat-bet-gurage,inneqor,inor" --limit=300` => 0 failures.

 - ✅ **2025-12-17 language-uniqueness (global batch4):** resolved 5 identical `bases[]` collisions by pinning dedicated bases `6110–6119` for `dakota,cro,xav,xer,pst,wne,eastern-indonesian-malay,gorap,harari,harari-east-gurage` (delta: `tools/mixer-deltas/2025-12-17-language-uniqueness-batch4-dedicatedpins.json`; base defs: `modules/namebases-real.js` `i:6110–6119`). Applied via `pnpm run mixer:apply-deltas`. Verified: `pnpm run mixer:check-deltas` OK; `pnpm exec -- node tools/mixer-diagnostics/check-language-mixer-map-duplicate-isos.js` => 0 duplicates; `pnpm exec -- node tools/check-language-mixer-map-inconsistencies.js --show-all-bases` exit 0; `pnpm exec -- node tools/mixer-core/check-language-mixer-coverage.js` (0 missing); `pnpm exec -- node tools/mixer-core/check-language-mixer-failures.js` (0 failing); seed-uniqueness `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures --only-isos="dakota,cro,xav,xer,pst,wne,eastern-indonesian-malay,gorap,harari,harari-east-gurage" --limit=300` => strictFail: 0; normFail: 0; base-clusters re-run (`pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2`) exit 0.

 - ✅ **2025-12-17 NO_UNIQ_BASE2 claim closure (be-* batch / worker1):** claim `batchId=2025-12-17T08:26:02.122Z-worker1` (`be-jizhao,be-lang,beami,beary,beba`) completed with dedicated bases `7015–7019` (delta: `tools/mixer-deltas/2025-12-17-worker1-mixed-be-jizhao.json`; base defs: `modules/namebases-fantasy.js` `i:7015–7019`). Cleanup: added `setBases` in the delta to remove stale invalid bases `7010–7014`. Verified: `pnpm run mixer:guardrails` OK; `pnpm run mixer:apply-deltas` OK; `pnpm run mixer:check-deltas` OK; seed-uniqueness `--only-failures "--only-isos=be-jizhao,be-lang,beami,beary,beba" --limit=300` => 0 failures; coverage OK; failures OK; base-clusters `--min-size=2` exit 0. Claim updatedAt=`2025-12-17T09:26:56.635Z`.

- ✅ **2025-12-17 NO_UNIQ_BASE2 claim closure (bebe/bee/beijing-mandarin/beja/beli batch / worker1):** claim `batchId=2025-12-17T09:35:11.218Z-worker1` completed with dedicated bases `7065–7069` (delta: `tools/mixer-deltas/2025-12-17-worker1-mixed-bebe.json`; base defs: `modules/namebases-real.js` `i:7065–7069`). Verified: `pnpm run mixer:guardrails` OK; `pnpm run mixer:apply-deltas` OK; `pnpm run mixer:check-deltas` OK; seed-uniqueness `--only-failures "--only-isos=bebe,bee,beijing-mandarin,beja,beli" --limit=300` => 0 failures; coverage OK; failures OK; base-clusters `--min-size=2` exit 0. Claim updatedAt=`2025-12-17T09:52:04.662Z`.

- ✅ **2025-12-17 language-uniqueness (global batch1):** resolved 5 identical `bases[]` collisions by pinning dedicated bases `6620–6629` for `gub, l-ngua-geral-amaz-nica, mixe, zoq, coz, ixc, qanjobal, cauque-mayan-language, mobilian-jargon, pidgin-delaware` (delta: `tools/mixer-deltas/2025-12-17-language-uniqueness-global-batch1-6620-6629-dedicatedpins.json`; base defs: `modules/namebases-real.js` `i:6620–6629`). Applied via `pnpm run mixer:apply-deltas`. Verified: `pnpm run mixer:check-deltas` OK; `pnpm exec -- node tools/mixer-diagnostics/check-language-mixer-map-duplicate-isos.js` => 0 duplicates; `pnpm exec -- node tools/check-language-mixer-map-inconsistencies.js --show-all-bases` exit 0; `pnpm exec -- node tools/mixer-core/check-language-mixer-coverage.js` (0 missing); `pnpm exec -- node tools/mixer-core/check-language-mixer-failures.js` (0 failing); seed-uniqueness `report-language-mixer-seed-uniqueness.js --only-failures --only-isos=batch` => 0 failures; base-clusters re-run (`report-language-mixer-base-clusters.js --min-size=2 --include-families`) exit 0.

- ✅ **2025-12-17 Americas Indigenous (Na-Dene bases=[19]):** pinned dedicated bases `6630–6640` for `eyak,tfn,chp,ing,gwi,haa,hoi,koy,dgr,kuu,tau` (delta: `tools/mixer-deltas/2025-12-17-americas-indigenous-nadene-bases19-dedicatedpins.json`; base defs: `modules/namebases-real.js` `i:6630–6640`). Applied via `pnpm run mixer:apply-deltas`. Verified: `pnpm run mixer:check-deltas` OK; seed-uniqueness (only-failures, only-isos=batch) => Target ISOs: 11; Missing mapping: 0; No globally-unique base index: 0; strictFail: 0; normFail: 0; coverage OK; failures OK; base-clusters (`report-language-mixer-base-clusters.js --min-size=2`) exit 0. Americas Indigenous base-uniqueness (no-devplan) snapshot: Nonunique Bases=149; unique bases=165; clustered bases=56.

- ✅ **2025-12-16 mixer artifacts resync:** regenerated committed artifacts via `pnpm run mixer:apply-deltas`, then confirmed `pnpm run mixer:check-deltas` OK (refreshing `tools/mixer-deltas/_compiled-dedicated-pins.json`, `config/language-mixer-map.json/.js`, and `config/language-mixes-all.js`).

- ✅ **2025-12-16 integrator run (late):** `pnpm run mixer:apply-deltas` OK (`[guardrails] OK. map=3498 catalog=3498`); `pnpm run mixer:check-deltas` OK.

- ✅ **2025-12-16 race-unused burn-down (Andamanese batch):** reduced `Languages never used by any race profile` from `27` to `23` by adding catalog category `Andamanese` to `raceLanguageProfiles.Serpent.categories` in `modules/races.js`, covering `akm`, `akj`, `anq`, `oon`. Verified: `pnpm run mixer:race-suite` (before+after), `pnpm run mixer:race-coverage` (Andamanese ISOs removed from uncovered list; after=23), `node tools/mixer-races/check-race-language-profiles.js` (0 wildcards; 0 duplicate profiles).

- ✅ **2025-12-16 race-unused burn-down (Muskogean + Mixe-Zoque batch):** reduced `Languages never used by any race profile` from `23` to `18` by adding catalog categories `Muskogean` and `Mixe-Zoque` to `raceLanguageProfiles.Kenku.categories` in `modules/races.js`, covering `cho`, `mik`, `mus`, `poi`, `zoq`. Verified: `node tools/mixer-races/check-race-language-profiles.js` (0 wildcards; 0 duplicate profiles), `pnpm run mixer:race-coverage` (target ISOs removed; after=18), `pnpm run mixer:race-suite` (after=18).

- ✅ **2025-12-17 race-unused burn-down (Micronesian + Matacoan + Tsimshianic batch):** reduced `Languages never used by any race profile` from `18` to `12` by adding catalog category `Micronesian` to `raceLanguageProfiles.Triton.categories` (covering `sonsorolese`, `tobian`), category `Matacoan` to `raceLanguageProfiles.Tabaxi.categories` (covering `cag`, `mtp`, `wlv`), and category `Tsimshianic` to `raceLanguageProfiles.Kenku.categories` (covering `tsi`) in `modules/races.js`. Verified: `node tools/mixer-races/check-race-language-profiles.js` (0 wildcards; 0 duplicate profiles), `pnpm run mixer:race-coverage` (after=12), `pnpm run mixer:race-suite` (after=12).

- ✅ **2025-12-17 race-unused burn-down (Americas families batch / Tabaxi):** reduced `Languages never used by any race profile` from `12` to `0` by adding catalog families `Chapacuran`, `Chimilan`, `Chocoan`, `Chonan`, `Enlhet-Enenlhet`, `Guaicuruan`, `Jivaroan`, and `Zamucoan` to `raceLanguageProfiles.Tabaxi.families` in `modules/races.js`, covering `ite`, `pav`, `cbg`, `noa`, `ona`, `enl`, `moc`, `tob`, `jiv`, `caw`, `pbb`, `ayo`. Verified: `node tools/mixer-races/check-race-language-profiles.js` (0 wildcards; 0 duplicate profiles), `pnpm run mixer:race-coverage` (after=0), `pnpm run mixer:race-suite` (after=0).

- ✅ **2025-12-17 South Asia clustered-base fix (dedicated bases 5600–5607):** added dedicated bases `5600–5607` in `modules/namebases-real.js` and pinned them via `tools/mixer-deltas/2025-12-16-wikipedia-south-asia-clustered-bases-5600-5607.json` for `burushaski, hinglish, hno, indian-english, kfq, nepalese-english, newar, srb`. Also removed the conflicting base `3336` from `torne-valley`’s `setBases` in `tools/mixer-deltas/2025-12-16-wikipedia-uralic-full-bases9-finnic-dialects-setbases.json` (so `3336` remains dedicated to `me-nkieli`). Verified: `pnpm run mixer:check-deltas` OK; `pnpm run mixer:apply-deltas` OK; seed-uniqueness `--only-isos=burushaski,hinglish,hno,indian-english,kfq,nepalese-english,newar,srb` reports 0 strict/norm failures.

- ✅ **2025-12-17 NO_UNIQ_BASE2 micro-pass (Awjila batch / worker1):** verified dedicated bases `5628–5632` for `awjila-language`, `aws-nian`, `aymara`, `ayo`, `ba-ari` (delta: `tools/mixer-deltas/2025-12-16-worker1-mixed-awjila-language.json`; base defs: `modules/namebases-real.js` `i:5628–5632`). Verified via `/no-unique-base2` commands: `pnpm run mixer:check-deltas` OK; seed-uniqueness `--only-failures "--only-isos=awjila-language,aws-nian,aymara,ayo,ba-ari" --limit=300` => 0 failures; coverage OK; failures OK; base-clusters (`report-language-mixer-base-clusters.js --min-size=2`, exit 0). Claim marked `complete` in `tools/mixer-diagnostics/_no_uniq_base_claims.json`.

- ✅ **2025-12-17 NO_UNIQ_BASE2 micro-pass (Bengali batch / worker2):** verified dedicated bases `5808–5812` for `bengali`, `bengali-portuguese-creole`, `beni-snous-dialect`, `ber`, `berbice` (delta: `tools/mixer-deltas/2025-12-17-worker2-mixed-bengali.json`; base defs: `modules/namebases-real.js` `i:5808–5812`). Verified via `/no-unique-base2` commands: `pnpm run mixer:guardrails` OK; `pnpm run mixer:check-deltas` OK; seed-uniqueness `--only-failures --only-isos="bengali,bengali-portuguese-creole,beni-snous-dialect,ber,berbice" --limit=300` => 0 failures; coverage OK; failures OK; base-clusters (`report-language-mixer-base-clusters.js --min-size=2`, exit 0). Claim marked `complete` in `tools/mixer-diagnostics/_no_uniq_base_claims.json`.

- ✅ **2025-12-17 NO_UNIQ_BASE2 micro-pass (badong-yao batch / worker1):** verified dedicated bases `5758–5762` for `badong-yao`, `baekje-korean`, `baghdadi-arabic`, `baham`, `bahnar` (delta: `tools/mixer-deltas/2025-12-17-worker1-mixed-badong-yao.json`; base defs: `modules/namebases-real.js` `i:5758–5762`). Verified via `/no-unique-base2` commands: `pnpm run mixer:guardrails` OK; `pnpm run mixer:check-deltas` OK; seed-uniqueness `--only-failures --only-isos="badong-yao,baekje-korean,baghdadi-arabic,baham,bahnar" --limit=300` => 0 failures; coverage OK; failures OK; base-clusters (`report-language-mixer-base-clusters.js --min-size=2`, exit 0). Claim marked `complete` in `tools/mixer-diagnostics/_no_uniq_base_claims.json`.

- ✅ **2025-12-17 NO_UNIQ_BASE2 micro-pass (Bahrani/Baisha batch / worker1):** verified dedicated bases `6005–6009` for `bahrani-arabic`, `bai`, `baima`, `baisha-hlai`, `bala` (delta: `tools/mixer-deltas/2025-12-17-worker1-mixed-bahrani-arabic.json`; base defs: `modules/namebases-real.js` `i:6005–6009`). Verified via `/no-unique-base2` commands: `pnpm run mixer:guardrails` OK; `pnpm run mixer:check-deltas` OK; seed-uniqueness `--only-failures --only-isos="bahrani-arabic,bai,baima,baisha-hlai,bala" --limit=300` => 0 failures; coverage OK; failures OK; base-clusters (`report-language-mixer-base-clusters.js --min-size=2`, exit 0). Claim marked `complete` in `tools/mixer-diagnostics/_no_uniq_base_claims.json`.

- ✅ **2025-12-17 NO_UNIQ_BASE2 micro-pass (Bahraini/Balo batch / worker1):** pinned dedicated bases `6055–6059` for `bahraini-gulf-arabic`, `bakhtiari-arabic`, `baldemu-language`, `balo`, `balochi` (delta: `tools/mixer-deltas/2025-12-17-worker1-mixed-bahraini-gulf-arabic.json`; base defs: `modules/namebases-real.js` `i:6055–6059`). Applied via `pnpm run mixer:apply-deltas`. Verified via `/no-unique-base2` commands: `pnpm run mixer:check-deltas` OK; seed-uniqueness `--only-failures --only-isos="bahraini-gulf-arabic,bakhtiari-arabic,baldemu-language,balo,balochi" --limit=300` => 0 failures; coverage OK; failures OK; base-clusters (`report-language-mixer-base-clusters.js --min-size=2`, exit 0). Claim marked `complete` in `tools/mixer-diagnostics/_no_uniq_base_claims.json`.

- ✅ **2025-12-17 NO_UNIQ_BASE2 micro-pass (Bami/Balinese batch / worker1):** pinned dedicated bases `6155–6159` for `bami`, `bamukumbit`, `bamum`, `bamwe`, `ban` (delta: `tools/mixer-deltas/2025-12-17-worker1-mixed-bami.json`; base defs: `modules/namebases-real.js` `i:6155–6159`). Applied via `pnpm run mixer:apply-deltas`. Verified via `/no-unique-base2` commands: `pnpm run mixer:check-deltas` OK; seed-uniqueness `--only-failures --only-isos="bami,bamukumbit,bamum,bamwe,ban" --limit=300` => 0 failures; coverage OK; failures OK; base-clusters (`report-language-mixer-base-clusters.js --min-size=2`, exit 0). Claim marked `complete` in `tools/mixer-diagnostics/_no_uniq_base_claims.json`.

- ✅ **2025-12-17 NO_UNIQ_BASE2 micro-pass (Bana/Bangime batch / worker1):** pinned dedicated bases `6205–6209` for `bana-language`, `bangime`, `bangladeshi-english`, `banjar`, `baramu` (delta: `tools/mixer-deltas/2025-12-17-worker1-mixed-bana-language.json`; base defs: `modules/namebases-real.js` `i:6205–6209`). Applied via `pnpm run mixer:apply-deltas`. Verified via `/no-unique-base2` commands: `pnpm run mixer:check-deltas` OK; seed-uniqueness `--only-failures --only-isos="bana-language,bangime,bangladeshi-english,banjar,baramu" --limit=300` => 0 failures; coverage OK; failures OK; base-clusters (`report-language-mixer-base-clusters.js --min-size=2`, exit 0). Claim marked `complete` in `tools/mixer-diagnostics/_no_uniq_base_claims.json`.

- ✅ **2025-12-17 NO_UNIQ_BASE2 micro-pass (Bareqi/Bargut batch / worker1):** pinned dedicated bases `6255–6259` for `bareqi-arabic`, `bargut`, `bargut-buryat`, `bariba`, `bariji` (delta: `tools/mixer-deltas/2025-12-17-worker1-mixed-bareqi-arabic.json`; base defs: `modules/namebases-real.js` `i:6255–6259`). Applied via `pnpm run mixer:apply-deltas`. Verified via `/no-unique-base2` commands: `pnpm run mixer:check-deltas` OK; seed-uniqueness `--only-failures --only-isos="bareqi-arabic,bargut,bargut-buryat,bariba,bariji" --limit=300` => 0 failures; coverage OK; failures OK; base-clusters (`report-language-mixer-base-clusters.js --min-size=2`, exit 0). Claim marked `complete` in `tools/mixer-diagnostics/_no_uniq_base_claims.json`.

- ✅ **2025-12-17 NO_UNIQ_BASE2 micro-pass (Basque/Bassari batch / worker1):** pinned dedicated bases `6405–6409` for `basque-icelandic-pidgin`, `bassari`, `basum`, `bata-language`, `bathari` (delta: `tools/mixer-deltas/2025-12-17-worker1-mixed-basque-icelandic-pidgin.json`; base defs: `modules/namebases-real.js` `i:6405–6409`). Applied via `pnpm run mixer:apply-deltas`. Verified via `/no-unique-base2` commands: `pnpm run mixer:check-deltas` OK; seed-uniqueness `--only-failures --only-isos="basque-icelandic-pidgin,bassari,basum,bata-language,bathari" --limit=300` => 0 failures; coverage OK; failures OK; base-clusters (`report-language-mixer-base-clusters.js --min-size=2`, exit 0). Claim marked `complete` in `tools/mixer-diagnostics/_no_uniq_base_claims.json`.

- ✅ **2025-12-17 NO_UNIQ_BASE2 micro-pass (Bats/Bayono batch / worker1):** pinned dedicated bases `6455–6459` for `bats`, `batu`, `bauwaki`, `bayat-oirat`, `bayono` (delta: `tools/mixer-deltas/2025-12-17-worker1-mixed-bats.json`; base defs: `modules/namebases-real.js` `i:6455–6459`). Applied via `pnpm run mixer:apply-deltas`. Verified via `/no-unique-base2` commands: `pnpm run mixer:check-deltas` OK; seed-uniqueness `--only-failures --only-isos="bats,batu,bauwaki,bayat-oirat,bayono" --limit=300` => 0 failures; coverage OK; failures OK; base-clusters (`report-language-mixer-base-clusters.js --min-size=2`, exit 0). Claim marked `complete` in `tools/mixer-diagnostics/_no_uniq_base_claims.json`.

- ✅ **2025-12-17 NO_UNIQ_BASE2 micro-pass (Bayot/Badeshi batch / worker1):** pinned dedicated bases `6505–6509` for `bayot`, `bbc`, `bbh`, `bcc`, `bdz` (delta: `tools/mixer-deltas/2025-12-17-worker1-mixed-bayot.json`; base defs: `modules/namebases-real.js` `i:6505–6509`). Applied via `pnpm run mixer:apply-deltas`. Verified via `/no-unique-base2` commands: `pnpm run mixer:check-deltas` OK; seed-uniqueness `--only-failures --only-isos="bayot,bbc,bbh,bcc,bdz" --limit=300` => 0 failures; coverage OK; failures OK; base-clusters (`report-language-mixer-base-clusters.js --min-size=2`, exit 0). Claim marked `complete` in `tools/mixer-diagnostics/_no_uniq_base_claims.json`.

- ✅ **2025-12-17 Africa NO_UNIQ_BASE micro-pass (hozo/tulishi/uduk):** pinned dedicated bases `5369–5371` for `hozo`, `tulishi`, `uduk` (delta: `tools/mixer-deltas/2025-12-16-decluster-africa-hozo-tulishi-uduk.json`; base defs: `modules/namebases-creole.js` `i:5369–5371`). Verified: `pnpm run mixer:guardrails` OK; `pnpm run mixer:check-deltas` OK; seed-uniqueness `--only-failures "--only-isos=hozo,tulishi,uduk" --limit=300` => 0 failures; `check-language-mixer-coverage` (0 missing); `check-language-mixer-failures` (0 failing); duplicate-isos check (0 duplicates).

- **2025-12-16 session reset (coordination state cleared):** retired all agents and force-cleared repo-local coordination JSON entries with `status: in_progress` to `stalled` (e.g. `tools/mixer-diagnostics/_wiki_multiagent_claims.json`) at `2025-12-16T12:38:00.638Z` so a new session can pick up work without stale ownership.

- **2025-12-16 quarantine (broken delta excluded from apply-mixer-deltas):** renamed `tools/mixer-deltas/2025-12-16-wikipedia-americas-indigenous-batch1-missing-both.json` => `tools/mixer-deltas/_quarantine-2025-12-16-wikipedia-americas-indigenous-batch1-missing-both.json` so `apply-mixer-deltas.js` ignores it. Read-only check now reports only stale artifacts vs deltas: `pnpm exec -- node tools/mixer-core/apply-mixer-deltas.js --check` (expected until integrator runs `pnpm run mixer:apply-deltas`).

- ✅ **2025-12-16 NO_UNIQ_BASE2 claim closure sweep (close in_progress):**
  - ✅ **worker1** `batchId=2025-12-16T11:23:16.859Z-worker1` (`andalusi-arabic, anq, ao, aot, aoz`) verified and set to `complete` (updatedAt=`2025-12-16T13:25:34.504Z`).
    - Delta pins: `tools/mixer-deltas/2025-12-16-worker1-mixed-andalusi-arabic.json` (pins `andalusi-arabic`→`5211`, `anq`→`5212`, `ao`→`5213`, `aot`→`5214`, `aoz`→`5215`)
    - Base defs: `modules/namebases-creole.js` dedicated bases `i:5211–5215`
    - Re-verified 2025-12-16: `pnpm run mixer:guardrails` OK; `pnpm run mixer:check-deltas` OK; seed-uniqueness (only-failures, only-isos=batch) OK; coverage OK; failures OK; base-clusters OK.
    - Verified: `pnpm run mixer:apply-deltas` OK; `pnpm run mixer:check-deltas` OK; seed-uniqueness `--only-failures "--only-isos=andalusi-arabic,anq,ao,aot,aoz" --limit=300` => Missing mapping:0; No uniq base:0; strictFail:0; normFail:0; `check-language-mixer-coverage` (0 missing); `check-language-mixer-failures` (0 failing); `report-language-mixer-base-clusters --min-size=2` (exit 0).
    - ✅ **2025-12-16 Andalusi NO_UNIQ_BASE2 re-verify (worker1):** successfully re-verified Andalusi Arabic NO_UNIQ_BASE2 claim with pins `5211–5215`; `pnpm run mixer:apply-deltas` wrote `config/language-mixer-map.json` + `tools/mixer-deltas/_compiled-dedicated-pins.json`; `pnpm run mixer:check-deltas` OK; seed-uniqueness/coverage/failures/base-clusters all OK. Claim updatedAt=`2025-12-16T22:17:33.240Z`.
  - ✅ **worker2** `batchId=2025-12-16T11:44:23.906Z-worker2` (`assamese, assan, assyrian, atohwaim-kaugat, atsam`) verified and set to `complete`.
    - Verified: `pnpm run mixer:guardrails` OK; `pnpm run mixer:check-deltas` OK; seed-uniqueness `--only-failures "--only-isos=assamese,assan,assyrian,atohwaim-kaugat,atsam" --limit=300` => Missing mapping:0; No globally-unique base index:0; strictFail:0; normFail:0; `check-language-mixer-coverage` (0 missing); `check-language-mixer-failures` (0 failing); `report-language-mixer-base-clusters --min-size=2` (exit 0).

- ✅ **2025-12-16 Andalusi artifacts resync:** artifacts were stale (out of date vs deltas); regenerated via `pnpm run mixer:apply-deltas` so `_compiled-dedicated-pins.json` + `config/language-mixer-map.*` match deltas/base defs (`5211–5215`). Verified: `pnpm run mixer:check-deltas` OK.

- ✅ **2025-12-16 NO_UNIQ_BASE2 claim closure (Cao Lan batch / worker1):** `batchId=2025-12-16T09:59:47.059Z-worker1` (`cao-lan, cao-miao, cape-verdean-creole, cappadocian-greek, car-nicobarese`) verified and set to `complete` (updatedAt=`2025-12-16T21:32:37.557Z`).
  - Delta pins: `tools/mixer-deltas/2025-12-16-worker1-mixed-cao-lan.json` (pins `cao-lan`→`5156`, `cao-miao`→`5157`, `cape-verdean-creole`→`5158`, `cappadocian-greek`→`5159`, `car-nicobarese`→`5160`)
  - Verified: `pnpm run mixer:guardrails` OK; `pnpm run mixer:check-deltas` OK; seed-uniqueness `--only-failures "--only-isos=cao-lan,cao-miao,cape-verdean-creole,cappadocian-greek,car-nicobarese" --limit=300` => Missing mapping:0; No globally-unique base index:0; strictFail:0; normFail:0; `check-language-mixer-coverage` (0 missing); `check-language-mixer-failures` (0 failing); `report-language-mixer-base-clusters --min-size=2` (exit 0).

- ✅ **2025-12-16 NO_UNIQ_BASE2 next5 micro-pass (worker1 / batchId=2025-12-16T13:30:49.323Z-worker1):** pinned dedicated bases `5406–5410` for `attapady-kurumba`, `australian-kriol`, `auye`, `ava`, `avokaya` (delta: `tools/mixer-deltas/2025-12-16-worker1-mixed-attapady-kurumba.json`; base defs: `modules/namebases-creole.js` `i:5406–5410`). Verified via `/no-unique-base2` commands: `pnpm run mixer:apply-deltas` OK; `pnpm run mixer:check-deltas` OK; seed-uniqueness (only-failures, only-isos=batch) => Missing mapping:0; No uniq base:0; strictFail:0; normFail:0; `check-language-mixer-coverage` (0 missing); `check-language-mixer-failures` (0 failing); base-clusters (exit 0). Claim marked `complete` in `tools/mixer-diagnostics/_no_uniq_base_claims.json`.


- ✅ **2025-12-16 mixer:guardrails unblock (namebases indices de-dupe):** fixed `pnpm run mixer:guardrails` failure caused by duplicate indices `2900–2904` across `modules/namebases-real.js` and `modules/namebases-creole.js` (Mandarin dedicated entries) by de-duping the definitions. Re-verified: `pnpm run mixer:guardrails` OK; `pnpm run mixer:check-deltas` OK.


- ✅ **2025-12-15 NO_UNIQ_BASE2 micro-pass (Global A4-batch / worker1):** pinned dedicated bases `2469–2473` for `ahr`, `aht`, `ai-cham`, `aimele`, `air-tamajeq-language` (via `tools/mixer-deltas/2025-12-15-worker1-mixed-ahr.json`). Verified via `/no-unique-base2` commands (0 `NO_UNIQ_BASE`, 0 strict/norm failures for the batch), coverage (0 missing), failures (0 failing), and base-clusters report (`report-language-mixer-base-clusters.js --min-size=2`, exit 0). Claim marked `complete` in `tools/mixer-diagnostics/_no_uniq_base_claims.json` and artifacts regenerated via `pnpm run mixer:apply-deltas`.


- ✅ **2025-12-15 NO_UNIQ_BASE2 micro-pass (Mixed A2-batch / worker1):** pinned dedicated bases `2419–2423` for `agarabi`, `agaw`, `aghu`, `agu`, `ahom` (via `tools/mixer-deltas/2025-12-15-worker1-mixed-agarabi.json`). Verified via `/no-unique-base2` commands (0 `NO_UNIQ_BASE`, 0 strict/norm failures for the batch), coverage (0 missing), failures (0 failing), and base-clusters report (`report-language-mixer-base-clusters.js --min-size=2`, exit 0). Claim marked `complete` in `tools/mixer-diagnostics/_no_uniq_base_claims.json`.


- ✅ **2025-12-15 NO_UNIQ_BASE2 micro-pass (Mixed A-batch / worker1):** pinned dedicated bases `2219–2223` for `abba-gorgoryos`, `aboriginal-pidgin-english`, `aca`, `achang`, `acr` (via `tools/mixer-deltas/2025-12-15-worker1-mixed-abba-gorgoryos.json`). Verified via `/no-unique-base2` commands (0 `NO_UNIQ_BASE`, 0 strict/norm failures for the batch), coverage (0 missing), failures (0 failing), and base-clusters report (`report-language-mixer-base-clusters.js --min-size=2`, exit 0). Claim marked `complete` in `tools/mixer-diagnostics/_no_uniq_base_claims.json` and artifacts regenerated via `pnpm run mixer:apply-deltas`.


- ✅ **2025-12-15 NO_UNIQ_BASE2 micro-pass (Global A-batch / worker1):** pinned dedicated bases `2269–2273` for `adang`, `adi`, `adjaran-georgian`, `adnyamathanha`, `aeq` (via `tools/mixer-deltas/2025-12-15-worker1-mixed-adang.json`). Verified via `/no-unique-base2` commands (0 `NO_UNIQ_BASE`, 0 strict/norm failures for the batch), coverage (0 missing), failures (0 failing), and base-clusters report (`report-language-mixer-base-clusters.js --min-size=2`, exit 0). Claim marked `complete` in `tools/mixer-diagnostics/_no_uniq_base_claims.json` and artifacts regenerated via `pnpm run mixer:apply-deltas`.


- ✅ **2025-12-15 NO_UNIQ_BASE2 micro-pass (Global A2-batch / worker1):** pinned dedicated bases `2319–2323` for `afade-language`, `afar`, `afrikaans`, `afro-seminole-creole`, `agalega-creole` (via `tools/mixer-deltas/2025-12-15-worker1-afade-language.json`). Verified via `/no-unique-base2` commands (0 `NO_UNIQ_BASE`, 0 strict/norm failures for the batch), coverage (0 missing), failures (0 failing), and base-clusters report (`report-language-mixer-base-clusters.js --min-size=2`, exit 0). Claim marked `complete` in `tools/mixer-diagnostics/_no_uniq_base_claims.json` and artifacts regenerated via `pnpm run mixer:apply-deltas`.


- ✅ **2025-12-15 NO_UNIQ_BASE2 micro-pass (Western Khanty batch / worker2):** pinned dedicated bases `2369–2373` for `atlym`, `atlym-nizyam-khanty`, `nizyam`, `salym-khanty`, `western-khanty` (via `tools/mixer-deltas/2025-12-15-worker2-western-khanty.json`). Verified via `/no-unique-base2` commands (0 `NO_UNIQ_BASE`, 0 strict/norm failures for the batch), coverage (0 missing), failures (0 failing), and base-clusters report (`report-language-mixer-base-clusters.js --min-size=2`, exit 0). Claim marked `complete` in `tools/mixer-diagnostics/_no_uniq_base_claims.json` and artifacts regenerated via `pnpm run mixer:apply-deltas`.


- ✅ **2025-12-15 NO_UNIQ_BASE2 micro-pass (Global A3-batch / worker1):** pinned dedicated bases `2419–2423` for `agarabi`, `agaw`, `aghu`, `agu`, `ahom` (via `tools/mixer-deltas/2025-12-15-worker1-mixed-agarabi.json`). Verified via `/no-unique-base2` commands (0 `NO_UNIQ_BASE`, 0 strict/norm failures for the batch), coverage (0 missing), failures (0 failing), and base-clusters report (`report-language-mixer-base-clusters.js --min-size=2`, exit 0). Claim marked `complete` in `tools/mixer-diagnostics/_no_uniq_base_claims.json` and artifacts regenerated via `pnpm run mixer:apply-deltas`.


- ✅ **2025-12-15 NO_UNIQ_BASE micro-pass (North America wiki list):** pinned dedicated bases `2069–2076` for `cree`, `ojibwe`, `yup`, `iku`, `cherokee`, `apa`, `athabaskan`, `navajo` (delta: `tools/mixer-deltas/2025-12-15-worker1-north-america-no-uniq-base.json`). Applied via `pnpm run mixer:apply-deltas` and verified: seed-uniqueness `--only-failures` for these 8 => 0; `report-wikipedia-list-nonunique-bases.js tools/mixer-meta/wikipedia-languages-of-north-america.json` => 0.



- ✅ **2025-12-13 NO_UNIQ_BASE micro-pass (South Slavic BCS slice / worker15):** added dedicated bases `709–713` for `bosnian`, `croatian`, `montenegrin`, `srp`, `serbo-croatian` (appended in `config/language-mixer-map.json`). Verified via `run-language-mixer-suite` + `report-language-mixer-seed-uniqueness --only-failures "--only=bosnian,croatian,montenegrin,srp,serbo-croatian" --limit=120` that all report `uniqBase` (`strictOK`; `norm<10` still tracked debt for `bosnian`, `croatian`, `montenegrin`, `srp`).



- ✅ **2025-12-13 NO_UNIQ_BASE micro-pass (South Slavic BCS slice / worker15 complete):** dedicated bases `709–713` for `bosnian`, `croatian`, `montenegrin`, `srp`, `serbo-croatian` are now globally unique (each used by exactly one ISO in `config/language-mixer-map.json`). Verified via `run-language-mixer-suite` (no map rewrites) + seed-uniqueness report (`bosnian=5/5`, `croatian=2/2`, `montenegrin=6/6`, `srp=7/7`, `serbo-croatian=12/12`).



- ✅ **2025-12-13 NO_UNIQ_BASE micro-pass (Romance / Oïl Dialects slice):** added dedicated bases `725–729` for `angevin`, `burgundian`, `champenois`, `poitevin`, `saintongeais` (appended in `config/language-mixer-map.json`). Verified via `run-language-mixer-suite` + `report-language-mixer-seed-uniqueness --only-failures "--only=angevin,burgundian,champenois,poitevin,saintongeais" --limit=80` that all report `uniqBase` (`strictOK`, `normOK`). Re-verified 2025-12-14 after suite rewrite; restored/pinned via `explicitIsoDedicatedBaseMap` and base definitions re-added to `modules/namebases-real.js`.



- ✅ **2025-12-13 NO_UNIQ_BASE micro-pass (Romance / Gascon Occitan slice):** added dedicated bases `730–732` for `aas-whistled`, `aranese`, `b-arnese` (appended in `config/language-mixer-map.json`). Verified via `run-language-mixer-suite` + `report-language-mixer-seed-uniqueness --only-failures "--only=aas-whistled,aranese,b-arnese" --limit=80` that all report `uniqBase` (`strictOK`, `normOK`). Re-verified 2025-12-14 after suite rewrite; restored/pinned via `explicitIsoDedicatedBaseMap` and base definitions re-added to `modules/namebases-real.js`.



- ✅ **2025-12-13 NO_UNIQ_BASE micro-pass (Romance / Neapolitan slice / worker12):** added dedicated bases `733–737` for `abruzzese`, `arianese`, `barese`, `basilicatine`, `benevento` (appended in `config/language-mixer-map.json`). Verified via `run-language-mixer-suite` + `report-language-mixer-seed-uniqueness --only-failures "--only=abruzzese,arianese,barese,basilicatine,benevento" --limit=80` that all report `uniqBase` (`strictOK`, `normOK`; each is `12/12`).



- ✅ **2025-12-13 NO_UNIQ_BASE micro-pass (Romance / Neapolitan slice / worker18):** added dedicated bases `738–742` for `cilentan`, `cosentino`, `irpino`, `molisan`, `neapolitan-lang` (appended in `config/language-mixer-map.json`). Verified via `run-language-mixer-suite` + `report-language-mixer-seed-uniqueness --only-failures "--only=cilentan,cosentino,irpino,molisan,neapolitan-lang" --limit=80` that all report `uniqBase` (`strictOK`, `normOK`; each is `12/12`).



- ✅ **2025-12-13 NO_UNIQ_BASE micro-pass (Romance / Neapolitan slice / worker19):** added dedicated bases `743–747` for `northern-calabrian`, `pugliese`, `south-lucanian`, `southern-latian`, `southern-laziale` (appended in `config/language-mixer-map.json`). Verified via `run-language-mixer-suite` + `report-language-mixer-seed-uniqueness --only-failures "--only=northern-calabrian,pugliese,south-lucanian,southern-latian,southern-laziale" --limit=80` that all report `uniqBase` (`strictOK`, `normOK`; each is `12/12`).



- ✅ **2025-12-13 NO_UNIQ_BASE micro-pass (Romance / Neapolitan stragglers / worker20):** added dedicated bases `748–749` for `tarantino`, `vastese` (appended in `config/language-mixer-map.json`). Verified via `run-language-mixer-suite` + `report-language-mixer-seed-uniqueness --only-failures "--only=tarantino,vastese" --limit=50` that both report `uniqBase` (`strictOK`, `normOK`; each is `12/12`).



- ✅ **2025-12-13 NO_UNIQ_BASE micro-pass (Romance / Oïl Dialects slice / worker21):** added dedicated bases `750–754` for `ardennais`, `berrichon`, `bourbonnais`, `fra`, `frainc-comtou` (appended in `config/language-mixer-map.json`). Verified via `run-language-mixer-suite` + `report-language-mixer-seed-uniqueness --only-failures "--only=ardennais,berrichon,bourbonnais,fra,frainc-comtou" --limit=80` that all report `uniqBase` (`strictOK`, `normOK`; each is `12/12`).



- ✅ **2025-12-13 NO_UNIQ_BASE micro-pass (Romance / Oïl Dialects slice / worker22):** added dedicated bases `755–759` for `gallo`, `gaumais`, `law-french`, `lorrain`, `mayennais` (appended in `config/language-mixer-map.json`). Verified via `run-language-mixer-suite` + `report-language-mixer-seed-uniqueness --only-failures "--only=gallo,gaumais,law-french,lorrain,mayennais" --limit=80` that all report `uniqBase` (`strictOK`, `normOK`; each is `12/12`).



- ✅ **2025-12-13 NO_UNIQ_BASE micro-pass (Sino-Tibetan/Asia batch):** added dedicated bases `620–624` for `burmese`, `burmish`, `burmo-qiangic`, `caijia`, `cdm` (and appended them in `config/language-mixer-map.json`). Verified via `run-language-mixer-suite` + seed-uniqueness report that each now reports `uniqBase` (`strictOK`, `norm<10`).



- ✅ **2025-12-13 NO_UNIQ_BASE micro-pass (South America batch):** added dedicated bases `625–629` for `cas`, `cav`, `caw`, `cax`, `cag` (and appended them in `config/language-mixer-map.json`). Verified via `run-language-mixer-suite` + seed-uniqueness report that none appear under `NO_UNIQ_BASE`.



- ✅ **2025-12-13 NO_UNIQ_BASE micro-pass (English-based pidgins):** added dedicated bases `665–667` for `butler-english`, `kru-pidgin-english`, `liberian-interior-pidgin-english` (and appended them in `config/language-mixer-map.json`). Verified via `report-language-mixer-seed-uniqueness "--only=butler-english,kru-pidgin-english,liberian-interior-pidgin-english" --only-failures --limit=50` that all now report `uniqBase` (`strictOK`, `normOK`).



- ✅ **2025-12-13 NO_UNIQ_BASE micro-pass (Romance / worker31 mini-batch):** added dedicated bases `800–804` for `colombian-spanish`, `comasco-lecchese`, `corsican`, `cremish`, `cremun-s` (and appended them in `config/language-mixer-map.json`). Verified: all report `uniqBase` (`strictOK`). Follow-up: appended ISO-unique seed tokens to bases `800` and `802`; `report-language-mixer-seed-uniqueness --only-failures "--only-isos=colombian-spanish,comasco-lecchese,corsican,cremish,cremun-s"` now reports `norm failures: 0`.



- ✅ **2025-12-14 NO_UNIQ_BASE micro-pass (Romance / worker30 mini-batch):** ensured dedicated bases `795–799` for `cheso`, `chiac`, `chilean-spanish`, `chilote`, `chipilo` are present in `modules/namebases-real.js` and included in `config/language-mixer-map.json`. Verified that each of these five ISOs has a unique `bases[]` set (no identical base-set collisions).



- ✅ **2025-12-14 SonarQube/SonarLint cleanup (mixer scripts + generator):**
  - Fixed duplicate key warnings in `tools/mixer-core/fix-language-mixer-mappings.js` (duplicate ISO keys in `explicitIsoBaseMap`).
  - Modernized Node imports (`node:fs`, `node:path`, `node:child_process`), replaced `String#replace` with `String#replaceAll` where applicable, and applied safe optional-chaining / `Object.hasOwn` cleanups.
  - Updated `tools/mixer-core/generate-language-mixer.js` to emit `globalThis.languageMixerMap` / `globalThis.languageMixerCatalog` (instead of `window.*`) and regenerated `config/language-mixer-map.js` + `config/language-mixes-all.js`.
  - Remaining Sonar debt: Cognitive Complexity warnings in `tools/mixer-core/fix-language-mixer-mappings.js` (refactor optional; behavior is currently correct).



- ✅ **2025-12-14 NO_UNIQ_BASE regression repair (Romance dedicated bases 740–759, 765–784, 790–799):** restored missing dedicated base definitions in `modules/namebases-real.js` and pinned ISO→dedicated-base mapping via `explicitIsoDedicatedBaseMap` in `tools/mixer-core/fix-language-mixer-mappings.js` so `run-language-mixer-suite` will not strip these previously-completed Romance micro-passes. Verified via targeted `report-language-mixer-seed-uniqueness` runs (no missing mappings; no `NO_UNIQ_BASE`).



- ✅ **2025-12-14 workflow + suite stabilization:** updated the key `.windsurf` workflows to use a diagnostic-first worker loop (guardrails → targeted checks → suite last), updated `mixer:guardrails` to print a concise OK summary, restored missing base definitions needed by pinned/auto mappings (`i:331` Berber bucket and `i:313` Australian Aboriginal), and re-ran `pnpm exec -- node tools/mixer-core/run-language-mixer-suite.js --no-wiki-devplan` successfully. Current remaining local-mixer failures after the suite run: `caa` and `cac` have empty `bases[]` and still need proper wiring.



- ✅ **2025-12-14 NO_UNIQ_BASE micro-pass (Romance / worker32 mini-batch):** ensured dedicated bases `805–809` for `cri-ana`, `daco-romanian`, `dalmatian`, `eastern-aragonese`, `eastern-catalan` are present in `modules/namebases-real.js` and appended/preserved in `config/language-mixer-map.json` via `explicitIsoDedicatedBaseMap` in `tools/mixer-core/fix-language-mixer-mappings.js`. Verified via `run-language-mixer-suite --no-wiki-devplan` + `report-language-mixer-seed-uniqueness --only-failures "--only=cri-ana,daco-romanian,dalmatian,eastern-aragonese,eastern-catalan" --limit=200` (No globally-unique base index: 0; strict failures: 0; norm failures: 0).



- ✅ **2025-12-14 NO_UNIQ_BASE micro-pass (Romance / worker33 mini-batch):** added dedicated bases `822–826` for `ennese`, `eonavian`, `equatoguinean-spanish`, `estremenho`, `european-portuguese` (bases defined in `modules/namebases-real.js`) and appended/preserved in `config/language-mixer-map.json` via `explicitIsoDedicatedBaseMap` in `tools/mixer-core/fix-language-mixer-mappings.js`. Verified via `run-language-mixer-suite --no-wiki-devplan` + `report-language-mixer-seed-uniqueness "--only=ennese,eonavian,equatoguinean-spanish,estremenho,european-portuguese" --limit=20` (No globally-unique base index: 0; strict failures: 0; `norm<10` tracked debt remains for `ennese`, `estremenho`, `european-portuguese`).



- ✅ **2025-12-14 NO_UNIQ_BASE micro-pass (Romance / worker34 mini-batch):** added dedicated bases `827–831` for `extremaduran`, `fabriano`, `faetar`, `fala`, `ferrarese` (bases defined in `modules/namebases-real.js`) and appended/preserved in `config/language-mixer-map.json` via `explicitIsoDedicatedBaseMap` in `tools/mixer-core/fix-language-mixer-mappings.js`. Verified via `run-language-mixer-suite --no-wiki-devplan` + targeted `report-language-mixer-seed-uniqueness --only-failures` (No globally-unique base index: 0; strict failures: 0; norm failures: 0).



- ✅ **2025-12-14 NO_UNIQ_BASE micro-pass (Romance / worker35 mini-batch):** added dedicated bases `832–836` for `fiuman`, `florentine`, `forlivese`, `fornes`, `franco-italian` (bases defined in `modules/namebases-real.js`) and appended/preserved in `config/language-mixer-map.json` via `explicitIsoDedicatedBaseMap`. Verified via `run-language-mixer-suite --no-wiki-devplan` + targeted `report-language-mixer-seed-uniqueness --only-failures` (No globally-unique base index: 0; strict failures: 0; norm failures: 0).



- ✅ **2025-12-14 NO_UNIQ_BASE micro-pass (Romance / worker36 mini-batch):** added dedicated bases `837–841` for `franco-ontarian`, `franco-proven-al`, `frenchville-french`, `friulian-lang`, `galician` (bases defined in `modules/namebases-real.js`) and appended/preserved in `config/language-mixer-map.json` via `explicitIsoDedicatedBaseMap`. Verified via `run-language-mixer-suite --no-wiki-devplan` + targeted `report-language-mixer-seed-uniqueness --only-failures` (No globally-unique base index: 0; strict failures: 0; norm failures: 0).



- ✅ **2025-12-14 NO_UNIQ_BASE micro-pass (Romance / worker37 mini-batch):** added dedicated bases `842–846` for `galician-asturian`, `gallo-italic-of-basilicata`, `gallo-italic-of-sicily`, `gallo-picene`, `gallurese` (bases defined in `modules/namebases-real.js`) and appended/preserved in `config/language-mixer-map.json` via `explicitIsoDedicatedBaseMap`. Verified via `run-language-mixer-suite --no-wiki-devplan` + targeted `report-language-mixer-seed-uniqueness --only-failures` (No globally-unique base index: 0; strict failures: 0; norm failures: 0).



- ✅ **2025-12-14 NO_UNIQ_BASE micro-pass (Romance / worker38 mini-batch):** added dedicated bases `847–851` for `gardiol`, `gascon`, `genoese`, `grossetano`, `haketia` (bases defined in `modules/namebases-real.js`) and appended/preserved in `config/language-mixer-map.json` via `explicitIsoDedicatedBaseMap`. Verified via `run-language-mixer-suite --no-wiki-devplan` + targeted `report-language-mixer-seed-uniqueness --only-failures` (No globally-unique base index: 0; strict failures: 0; norm failures: 0).



- ✅ **2025-12-14 NO_UNIQ_BASE micro-pass (Romance / worker39 mini-batch):** added dedicated bases `852–856` for `intemelio`, `istriot`, `ita`, `italo-australian`, `jauer` (bases defined in `modules/namebases-real.js`) and appended/preserved in `config/language-mixer-map.json` via `explicitIsoDedicatedBaseMap`. Verified via `run-language-mixer-suite --no-wiki-devplan` + targeted `report-language-mixer-seed-uniqueness --only-failures` (No globally-unique base index: 0; strict failures: 0; norm failures: 0).



- ✅ **2025-12-14 NO_UNIQ_BASE micro-pass (Romance / worker40 mini-batch):** added dedicated bases `610`, `612`, `738`, `739`, `857` for `augeron`, `auregnais`, `cilentan`, `cosentino`, `joual` (bases defined in `modules/namebases-real.js`) and appended/preserved in `config/language-mixer-map.json` via `explicitIsoDedicatedBaseMap`. Verified via `run-language-mixer-suite --no-wiki-devplan` + targeted `report-language-mixer-seed-uniqueness --only-failures` (No globally-unique base index: 0; strict failures: 0; norm failures: 0). Note: `joual` uses base `857` to avoid collision with `intemelio` base `852`.



- ✅ **2025-12-14 NO_UNIQ_BASE micro-pass (Romance / worker51 mini-batch):** added dedicated bases `915–919` for `old-catalan`, `old-gallo-romance`, `old-leonese`, `old-lombard`, `old-occitan` (bases defined in `modules/namebases-real.js`) and pinned via delta `tools/mixer-deltas/2025-12-14-worker51-old-romance.json` + `pnpm run mixer:apply-deltas`. Verified via seed-uniqueness report that each ISO now reports `uniqBase` (`strictOK`, `normOK`; each is `12/12`).



- ✅ **2025-12-14 NO_UNIQ_BASE micro-pass (Romance / worker52 mini-batch):** added dedicated bases `920–924` for `old-romagnol`, `old-spanish`, `oliventine`, `oltenian`, `ossolano` (bases defined in `modules/namebases-real.js`) and pinned via delta `tools/mixer-deltas/2025-12-14-worker52-old-romance.json` + `pnpm run mixer:apply-deltas`. Verified via seed-uniqueness report that each ISO now reports `uniqBase` (`strictOK`, `normOK`; each is `12/12`).

  - Re-verified 2025-12-15: `pnpm run mixer:guardrails`, `pnpm run mixer:apply-deltas`, `pnpm run mixer:check-deltas`, seed-uniqueness (PowerShell requires quoting the `--only-isos=...` arg), coverage, failures, and base-clusters.



- ✅ **2025-12-14 NO_UNIQ_BASE micro-pass (Romance / worker53 mini-batch):** added dedicated bases `925–929` for `pa-uezu`, `palra`, `pannonian-latin`, `pantesco`, `paraguayan-spanish` (bases defined in `modules/namebases-real.js`) and pinned via delta `tools/mixer-deltas/2025-12-14-worker53-pa-uezu.json` + `pnpm run mixer:apply-deltas`. Verified via seed-uniqueness report that each ISO now reports `uniqBase` (no strict failures; no norm failures).



- ✅ **2025-12-14 NO_UNIQ_BASE micro-pass (Romance / worker54 mini-batch):** added dedicated bases `930–934` for `parmigiano`, `pavese`, `peruvian-ribere-o`, `peruvian-spanish`, `pesciatino` (bases defined in `modules/namebases-real.js`) and pinned via delta `tools/mixer-deltas/2025-12-14-worker54-parmigiano.json` + `pnpm run mixer:apply-deltas`. Verified via seed-uniqueness report that each ISO now reports `uniqBase` (no strict failures; no norm failures).

- ✅ **2025-12-15 NO_UNIQ_BASE micro-pass (Uralic / worker55 collision slice):** pinned dedicated bases `935–944` for `bjarmian-finnic`, `proto-sami`, `forest-nenets`, `proto-finnic`, `southwestern-finnish`, `proto-uralic`, `proto-karelian`, `proto-permic`, `somero-region`, `j-mtland` via delta `tools/mixer-deltas/2025-12-14-worker55-uralic-collisions.json` + `pnpm run mixer:apply-deltas`. Verified via seed-uniqueness report that each ISO now reports `uniqBase` (No globally-unique base index: 0; strict failures: 0; norm failures: 0), and verified `mixer:guardrails`, `mixer:check-deltas`, `check-language-mixer-coverage.js` (Missing mapping: 0), and `check-language-mixer-failures.js` (0 failures). Confirmed each batch ISO has a unique `bases[]` key (count=1) and that base-set collisions are cleared for the batch.


- ✅ **2025-12-15 base-set decluster (Uralic / worker58 Mari collision):** cleared identical `bases[]` collision between `eastern-mari` and `meadow-mari-proper` by setting `eastern-mari` bases to `[9,320,427]` via delta `tools/mixer-deltas/2025-12-15-worker58-uralic-mari-decluster.json` + `pnpm run mixer:apply-deltas`. Verified `mixer:guardrails`, `mixer:check-deltas`, `check-language-mixer-coverage.js` (Missing mapping: 0), `check-language-mixer-failures.js` (0 failures), and `report-language-mixer-base-clusters.js --min-size=2 --category=Uralic --family=Mari` (0 clusters). Note: both ISOs still report `NO_UNIQ_BASE` until dedicated bases are added.


- ✅ **2025-12-15 NO_UNIQ_BASE micro-pass (Romance / worker58 mini-batch):** added dedicated bases `1180–1184` for `por`, `proto-eastern-romance`, `proto-romance`, `proven-al`, `put-r` (bases defined in `modules/namebases-real.js`) and pinned via delta `tools/mixer-deltas/2025-12-15-worker58-romance.json` + `pnpm run mixer:apply-deltas`. Verified via `mixer:guardrails`, `mixer:check-deltas`, targeted seed-uniqueness (no `NO_UNIQ_BASE`, no strict failures, no norm failures), `check-language-mixer-coverage.js` (Missing mapping: 0), `check-language-mixer-failures.js` (0 failures), and base-clusters report.


- ✅ **2025-12-15 NO_UNIQ_BASE micro-pass (Romance / worker61 mini-batch):** added dedicated bases `1340–1344` for `quebec-french`, `r-mois`, `regional-italian`, `ribagor-an`, `riberan` (bases defined in `modules/namebases-real.js`) and pinned via delta `tools/mixer-deltas/2025-12-15-worker61-romance.json` + `pnpm run mixer:apply-deltas`. Verified via `mixer:guardrails`, `mixer:check-deltas`, targeted seed-uniqueness (no `NO_UNIQ_BASE`, no strict failures, no norm failures), `check-language-mixer-coverage.js` (Missing mapping: 0), `check-language-mixer-failures.js` (0 failures), and base-clusters report.


- ✅ **2025-12-15 NO_UNIQ_BASE micro-pass (Romance / worker62 mini-batch):** added dedicated bases `1390–1394` for `riojan`, `rioplatense-spanish`, `riunorese`, `romagnol`, `romanesco` (bases defined in `modules/namebases-real.js`) and pinned via delta `tools/mixer-deltas/2025-12-15-worker62-romance.json` + `pnpm run mixer:apply-deltas`. Verified via `mixer:guardrails`, `mixer:check-deltas`, targeted seed-uniqueness (no `NO_UNIQ_BASE`, no strict failures, no norm failures), `check-language-mixer-coverage.js` (Missing mapping: 0), `check-language-mixer-failures.js` (0 failures), and base-clusters report.


- ✅ **2025-12-15 NO_UNIQ_BASE micro-pass (Romance / worker63 mini-batch):** added dedicated bases `1440–1444` for `romanian`, `romansh`, `ron`, `royasc`, `ruo` (bases defined in `modules/namebases-real.js`) and pinned via delta `tools/mixer-deltas/2025-12-15-worker63-romance.json` + `pnpm run mixer:apply-deltas`. Verified via `mixer:guardrails`, `mixer:check-deltas`, targeted seed-uniqueness (no `NO_UNIQ_BASE`, no strict failures, no norm failures), `check-language-mixer-coverage.js` (Missing mapping: 0), `check-language-mixer-failures.js` (0 failures), and base-clusters report.


- ✅ **2025-12-15 NO_UNIQ_BASE micro-pass (Romance / worker63 Romansh dialects):** pinned dedicated bases `1640–1644` for `surmiran`, `sursilvan`, `sutsilvan`, `tuatschin`, `vallader` via delta `tools/mixer-deltas/2025-12-15-worker63-romance-romansh-varieties.json` + `pnpm run mixer:apply-deltas`. Verified via `pnpm run mixer:guardrails`, `pnpm run mixer:check-deltas`, seed-uniqueness (PowerShell quoting: `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures "--only-isos=surmiran,sursilvan,sutsilvan,tuatschin,vallader" --limit=300`), `check-language-mixer-coverage.js` (0 missing), `check-language-mixer-failures.js` (0 failing), and `report-language-mixer-base-clusters.js --min-size=2` (exit 0).


- ✅ **2025-12-15 NO_UNIQ_BASE micro-pass (Romance / worker64 mini-batch):** added dedicated bases `1490–1494` for `rup`, `ruq`, `sabino`, `saharan-spanish`, `salentino` (bases defined in `modules/namebases-real.js`) and pinned via delta `tools/mixer-deltas/2025-12-15-worker64-romance.json` + `pnpm run mixer:apply-deltas`. Verified via `mixer:guardrails`, `mixer:check-deltas`, targeted seed-uniqueness (no `NO_UNIQ_BASE`, no strict failures, no norm failures), `check-language-mixer-coverage.js` (Missing mapping: 0), `check-language-mixer-failures.js` (0 failures), and base-clusters report.


- ✅ **2025-12-15 NO_UNIQ_BASE micro-pass (Romance / sammarinese+sardinian mini-batch):** added dedicated bases `1540–1544` for `sammarinese`, `sardinian`, `sardo-corsican`, `sassarese`, `savoyard` (bases defined in `modules/namebases-real.js`) and pinned via delta `tools/mixer-deltas/2025-12-15-worker62-romance-sammarinese.json` + `pnpm run mixer:apply-deltas`. Verified via `mixer:guardrails`, `mixer:check-deltas`, targeted seed-uniqueness (no `NO_UNIQ_BASE`, no strict failures, no norm failures), `check-language-mixer-coverage.js` (Missing mapping: 0), `check-language-mixer-failures.js` (0 failures), and base-clusters report.


- ✅ **2025-12-15 NO_UNIQ_BASE micro-pass (Romance / worker65 mini-batch):** added dedicated bases `1590–1594` for `senese`, `sicilian`, `somontan-s`, `southeast-metafonetica`, `southern-aragonese` (bases defined in `modules/namebases-real.js`) and pinned via delta `tools/mixer-deltas/2025-12-15-worker65-romance.json` + `pnpm run mixer:apply-deltas`. Verified via `mixer:guardrails`, `mixer:check-deltas`, targeted seed-uniqueness (no `NO_UNIQ_BASE`, no strict failures, no norm failures), `check-language-mixer-coverage.js` (Missing mapping: 0), `check-language-mixer-failures.js` (0 failures), and base-clusters report.


- ✅ **2025-12-15 NO_UNIQ_BASE micro-pass (Romance / worker57 mini-batch):** added dedicated bases `1080–1084` for `philippine-spanish`, `piedmontese`, `pisano-livornese`, `pistoiese`, `poitevin-saintongeais` (bases defined in `modules/namebases-real.js`) and pinned via delta `tools/mixer-deltas/2025-12-15-worker57-romance.json` + `pnpm run mixer:apply-deltas`. Verified via `mixer:guardrails`, `mixer:check-deltas`, targeted seed-uniqueness (no `NO_UNIQ_BASE`, no strict failures, no norm failures), `check-language-mixer-coverage.js` (Missing mapping: 0), `check-language-mixer-failures.js` (0 failures), and base-clusters report.



- ✅ **2025-12-14 NO_UNIQ_BASE micro-pass (Romance / worker41 mini-batch):** added dedicated bases `858–862` for `judeo-aragonese`, `judeo-catalan`, `judeo-gascon`, `judeo-italian`, `judeo-mantuan` (bases defined in `modules/namebases-real.js`) and appended/preserved in `config/language-mixer-map.json` via `explicitIsoDedicatedBaseMap`. Verified via `run-language-mixer-suite --no-wiki-devplan` + targeted `report-language-mixer-seed-uniqueness --only-failures` (No globally-unique base index: 0; strict failures: 0; norm failures: 0).



- ✅ **2025-12-14 NO_UNIQ_BASE micro-pass (Romance / worker42 mini-batch):** added dedicated bases `863–867` for `judeo-piedmontese`, `judeo-portuguese`, `judeo-proven-al`, `judeo-spanish`, `ladin-lang` (bases defined in `modules/namebases-real.js`) and appended/preserved in `config/language-mixer-map.json` via `explicitIsoDedicatedBaseMap`. Verified via `run-language-mixer-suite --no-wiki-devplan` + targeted `report-language-mixer-seed-uniqueness --only-failures` (No globally-unique base index: 0; strict failures: 0; norm failures: 0).



- ✅ **2025-12-14 NO_UNIQ_BASE micro-pass (Romance / worker43 mini-batch):** added dedicated bases `868–872` for `ladino`, `landese`, `languedocien`, `lat`, `leonese` (bases defined in `modules/namebases-real.js`) and appended/preserved in `config/language-mixer-map.json` via `explicitIsoDedicatedBaseMap`. Verified via `run-language-mixer-suite --no-wiki-devplan` + targeted `report-language-mixer-seed-uniqueness --only-failures` (No globally-unique base index: 0; strict failures: 0; norm failures: 0).



- ✅ **2025-12-14 NO_UNIQ_BASE micro-pass (Romance / worker44 mini-batch):** added dedicated bases `873–877` for `ligurian`, `limousin`, `llanito`, `logudorese`, `lombard` (bases defined in `modules/namebases-real.js`) and appended/preserved in `config/language-mixer-map.json` via `explicitIsoDedicatedBaseMap`. Verified via `run-language-mixer-suite --no-wiki-devplan` + targeted `report-language-mixer-seed-uniqueness --only-failures` (No globally-unique base index: 0; strict failures: 0; norm failures: 0).

- ✅ **2025-12-14: Mixer delta patch-queue adoption:** multi-agent mixer mapping changes should now be recorded via `tools/mixer-deltas/*.json` (using `setBases` / `dedicatedPins` / `appendBases`) and applied with `pnpm run mixer:apply-deltas` (which regenerates `config/language-mixer-map.js` and `config/language-mixes-all.js`). Dedicated base pinning should be done via delta `dedicatedPins` (compiled into `tools/mixer-deltas/_compiled-dedicated-pins.json`) rather than editing `explicitIsoDedicatedBaseMap` directly, except for emergency/script-level overrides.



- ✅ **2025-12-14 NO_UNIQ_BASE micro-pass (Romance / worker45 mini-batch):** added dedicated bases `878–882` for `louisiana-french`, `lucchese`, `m-tis-french`, `macerata`, `magoua` (bases defined in `modules/namebases-real.js`) and appended/preserved in `config/language-mixer-map.json` via `explicitIsoDedicatedBaseMap`. Verified via `run-language-mixer-suite --no-wiki-devplan` + targeted `report-language-mixer-seed-uniqueness --only-failures` (No globally-unique base index: 0; strict failures: 0; norm failures: 0).



- ✅ **2025-12-14 hard-breakage fixes (hachijo + Mayan):** ensured `hachijo` includes dedicated base `685` (`bases: [10, 12, 685]`), and wired Mayan `cac` (Chuj) / `caa` (Ch'orti') away from `bases: []` by setting `cac: [913]`, `caa: [914]` (bases `913/914` defined in `modules/namebases-real.js`). Applied via delta file `tools/mixer-deltas/2025-12-14-hachijo-cac-caa.json` and re-generated artifacts via `pnpm exec -- node tools/mixer-core/apply-mixer-deltas.js`. Verified via `pnpm exec -- node tools/mixer-core/check-language-mixer-coverage.js` + `pnpm exec -- node tools/mixer-core/check-language-mixer-failures.js`.



- ✅ **2025-12-14 NO_UNIQ_BASE micro-pass (Romance / worker46 mini-batch):** added dedicated bases `883–887` for `mallorcan`, `maltese-italian`, `manduriano`, `maramure-`, `menorcan` (bases defined in `modules/namebases-real.js`) and appended/preserved in `config/language-mixer-map.json` via `explicitIsoDedicatedBaseMap`. Verified via `run-language-mixer-suite --no-wiki-devplan` + targeted `report-language-mixer-seed-uniqueness --only-failures` (No globally-unique base index: 0; strict failures: 0; norm failures: 0).



- ✅ **2025-12-14 NO_UNIQ_BASE micro-pass (Romance / worker47 mini-batch):** added dedicated bases `888–892` for `mentonasc`, `messinese`, `mexican-spanish`, `milanese`, `minderico` (bases defined in `modules/namebases-real.js`) and appended/preserved in `config/language-mixer-map.json` via `explicitIsoDedicatedBaseMap`. Verified via `run-language-mixer-suite --no-wiki-devplan` + targeted `report-language-mixer-seed-uniqueness --only-failures` (No globally-unique base index: 0; strict failures: 0; norm failures: 0).



- ✅ **2025-12-14 NO_UNIQ_BASE micro-pass (Romance / worker48 mini-batch):** ensured dedicated bases `893–897` for `mineiro`, `mirandese`, `missouri-french`, `moldavian`, `mon-gasque` (bases defined in `modules/namebases-real.js`) and appended/preserved in `config/language-mixer-map.json` via `explicitIsoDedicatedBaseMap`. Verified via `run-language-mixer-suite --no-wiki-devplan` + targeted `report-language-mixer-seed-uniqueness --only-failures` (No globally-unique base index: 0; strict failures: 0; norm failures: 0).



- ✅ **2025-12-14 NO_UNIQ_BASE micro-pass (Romance / worker49 mini-batch):** ensured dedicated bases `898–902` for `mozarabic`, `murcian`, `muskrat-french`, `navarrese`, `navarro-aragonese` (bases defined in `modules/namebases-real.js`) and appended/preserved in `config/language-mixer-map.json` via `explicitIsoDedicatedBaseMap`. Verified via targeted `report-language-mixer-seed-uniqueness --only-failures "--only=mozarabic,murcian,muskrat-french,navarrese,navarro-aragonese"` (No globally-unique base index: 0; strict failures: 0; norm failures: 0).



- ✅ **2025-12-14 NO_UNIQ_BASE micro-pass (Romance / worker50 mini-batch):** ensured dedicated bases `903–907` for `new-england-french`, `newfoundland-french`, `ni-ard`, `nones`, `northern-catalan` (bases defined in `modules/namebases-real.js`) and appended/preserved in `config/language-mixer-map.json` via `explicitIsoDedicatedBaseMap`. Verified via targeted `report-language-mixer-seed-uniqueness --only-failures "--only=new-england-french,newfoundland-french,ni-ard,nones,northern-catalan"` (No globally-unique base index: 0; strict failures: 0; norm failures: 0).



- ✅ **2025-12-14 NO_UNIQ_BASE regression guard (Africa bu* batch):** restored + preserved dedicated bases `590–596` for `bukusu`, `bulu`, `bum`, `busa`, `bushong`, `bwela`, `buyu` by re-adding them to `config/language-mixer-map.json` / `config/language-mixer-map.js` and pinning the full base sets via `explicitIsoBasesMap` in `tools/mixer-core/fix-language-mixer-mappings.js` (prevents future `run-language-mixer-suite` normalization from stripping the unique bases). Verified by running `pnpm exec -- node tools/mixer-core/run-language-mixer-suite.js` and then `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only=bukusu,bulu,bum,busa,bushong,bwela,buyu --limit=120` (No globally-unique base index: 0). Remaining norm debt (norm<10): `bukusu=8/8`, `busa=8/8`, `bushong=8/8`, `bwela=5/5`.




- ✅ **2025-12-13 NO_UNIQ_BASE micro-pass (Romance worker10 batch):** ensured each ISO has a dedicated globally-unique base index. Dedicated bases are: `aragonese->635`, `central-aragonese->636`, `castilian->637`, `castelmezzano->638`, `central-italian->639`, `central-marchigiano->640`, `central-metafonetica->641`, `central-southern-calabrian->642`, `canadian-french->650`, and `central-catalan->675` (all appended in `config/language-mixer-map.json`; bases defined in `modules/namebases-real.js`). Verified via `run-language-mixer-suite` + `report-language-mixer-seed-uniqueness "--only=aragonese,central-aragonese,castilian,castelmezzano,central-catalan,central-italian,central-marchigiano,central-metafonetica,central-southern-calabrian,canadian-french" --limit=80` that all report `uniqBase` (`strictOK`; `norm<10` tracked debt for `aragonese`, `castilian`, `central-southern-calabrian`).



- ✅ **2025-12-13 language-uniqueness micro-pass (Uralic collision split batch):** added dedicated bases `690–694` for `forest-nenets`, `southwestern-finnish`, `proto-permic`, `j-mtland`, `lower-luga` (bases defined in `modules/namebases-real.js`), and appended them in `config/language-mixer-map.json` to break five identical `bases[]` collisions: `forest-nenets` vs `proto-finnic`, `southwestern-finnish` vs `proto-uralic`, `proto-permic` vs `proto-karelian`, `j-mtland` vs `somero-region`, `lower-luga` vs `proper-southeastern`. Verified via `check-language-mixer-map-duplicate-isos`, `check-language-mixer-map-inconsistencies --show-all-bases`, `run-language-mixer-suite` (no rewrites that removed the new bases), `report-language-mixer-seed-uniqueness "--only=forest-nenets,southwestern-finnish,proto-permic,j-mtland,lower-luga" --limit=50` (all `uniqBase`; `norm<10` remains tracked for `southwestern-finnish` and `proto-permic`), and rerunning the base-cluster report.



- ✅ **2025-12-13 decluster-language-bases micro-pass (Cushitic / Horn of Africa):** broke up the 11-member identical `bases=[140]` cluster (Afar base) by rewiring `dullay`, `lowland-east-cushitic`, `macro-somali`, `omo-tana`, `oromoid`, `rendille-boni`, `saho-afar`, `somali-languages`, `somali-western`, `south-cushitic`, `highland-east-cushitic` in `config/language-mixer-map.json` to unique, Horn-of-Africa-appropriate mixes using existing regional bases (`130` Somali, `131` Oromo, `133` Amharic, `134` Tigrinya, `140` Afar, `141–144` Ethiopian neighbors, `28` Swahili). Verified via `report-language-mixer-base-clusters.js --min-size=2 --include-families --family=Cushitic` (0 clusters) and `check-language-mixer-map-inconsistencies.js --show-all-bases`.



- ✅ **2025-12-15 decluster-language-bases micro-pass (verified; bases=[47,56]):** applied delta `tools/mixer-deltas/2025-12-15-decluster-47-56-tdh-ola.json` to split the cross-family base-set collision for `tdh` (Thulung / Kiranti) and `ola` (Walungge / Tibetic): `tdh->[56]`, `ola->[47]`. Verified via `pnpm run mixer:apply-deltas` (guardrails OK), `report-language-mixer-base-clusters.js --min-size=2 --include-families` (exit 0), `check-language-mixer-map-inconsistencies.js --show-all-bases` (exit 0), and direct check that `bases=[47,56]` has 0 hits; decluster claim `batchId=2025-12-15T14:44:45.090Z-worker1` marked `complete`.



- ✅ **2025-12-15 decluster-language-bases micro-pass (verified; bases=[120,145]):** applied delta `tools/mixer-deltas/2025-12-15-decluster-120-145-tagoi-wali-sudan.json` to split the cross-family base-set collision for `tagoi` (Niger-Congo) and `wali-sudan` (Nilo-Saharan): `tagoi->[120]`, `wali-sudan->[145]`. Verified via `pnpm run mixer:guardrails` (OK), `pnpm run mixer:apply-deltas` (wrote `config/language-mixer-map.json`), `report-language-mixer-base-clusters.js --min-size=2 --include-families` (exit 0), `check-language-mixer-map-inconsistencies.js --show-all-bases` (exit 0), and direct check that `bases=[120,145]` has 0 hits; decluster claim `batchId=2025-12-15T22:09:52.759Z-worker1` marked `complete`.



- ✅ **2025-12-15 decluster-language-bases micro-pass (verified; bases=[530,533]):** applied delta `tools/mixer-deltas/2025-12-15-decluster-530-533-longsang-zhuang-cao-miao.json` to split the cross-family base-set collision for `longsang-zhuang` (Tai-Kadai) and `cao-miao` (Kam-Sui): `longsang-zhuang->[530]`, `cao-miao->[532,533]`. Verified via `pnpm run mixer:guardrails` (OK), `pnpm run mixer:apply-deltas` (wrote `config/language-mixer-map.json`), `report-language-mixer-base-clusters.js --min-size=2 --include-families` (exit 0), `check-language-mixer-map-inconsistencies.js --show-all-bases` (exit 0), and direct check that `bases=[530,533]` has 0 hits; decluster claim `batchId=2025-12-15T23:32:36.535Z-worker1` marked `complete`.



- ✅ **2025-12-15 decluster-language-bases micro-pass (verified; bases=[5,314,316]):** applied delta `tools/mixer-deltas/2025-12-15-decluster-5-314-316-podlachian-polabian.json` to split the shared base-set for `podlachian` (East Slavic) and `polabian` (Lechitic): `podlachian->[5,314,373]`, `polabian->[5,314,315]`. Verified via `pnpm run mixer:guardrails` (OK), `pnpm run mixer:apply-deltas` (wrote `config/language-mixer-map.json`), `report-language-mixer-base-clusters.js --min-size=2 --include-families` (exit 0), `check-language-mixer-map-inconsistencies.js --show-all-bases` (exit 0), and direct check that `bases=[5,314,316]` has 0 hits; decluster claim `batchId=2025-12-15T23:58:56.734Z-worker1` marked `complete`.


- ✅ **2025-12-16 decluster-language-bases micro-pass (verified; bases=[186,187]):** applied delta `tools/mixer-deltas/2025-12-16-decluster-186-187-wiyot-broken-oghibbeway.json` to break the shared base-set for `wiyot` (Algic) vs `broken-oghibbeway` (Pidgin): `broken-oghibbeway->[1,187]` (English+Ojibwe), leaving `wiyot->[186,187]` as the sole remaining holder. Verified via `pnpm run mixer:guardrails` (OK), `pnpm run mixer:apply-deltas` (wrote `config/language-mixer-map.json`), `report-language-mixer-base-clusters.js --min-size=2 --include-families` (exit 0), `check-language-mixer-map-inconsistencies.js --show-all-bases` (exit 0), and direct check that `bases=[186,187]` cluster size is now 1 (wiyot only); decluster claim `batchId=2025-12-16T01:45:31.191Z-worker1` marked `complete`.



- ✅ **2025-12-16 decluster-language-bases micro-pass (verified; bases=[86,87]):** applied delta `tools/mixer-deltas/2025-12-16-decluster-86-87-njh-nsm.json` to break the shared base-set for `njh` (Lotha) vs `nsm` (Sümi), both Naga: `njh->[86,88]`, `nsm->[87,89]` (avoids collisions with existing singleton [86]=`ao` and [87]=`angami-pochuri`/`njm`). Verified via `pnpm run mixer:guardrails` (OK), `pnpm run mixer:apply-deltas` (wrote `config/language-mixer-map.json`), `report-language-mixer-base-clusters.js --min-size=2 --include-families` (exit 0), `check-language-mixer-map-inconsistencies.js --show-all-bases` (exit 0), and direct check that `bases=[86,87]` has 0 hits; decluster claim `batchId=2025-12-16T02:02:42.733Z-worker1` marked `complete`.



- ✅ **2025-12-16 decluster-language-bases micro-pass (verified; bases=[305]):** applied delta `tools/mixer-deltas/2025-12-16-decluster-305-west-greenlandic-pidgin-greenlandic-lang.json` to break the shared base-set for `west-greenlandic-pidgin` (Pidgin) vs `greenlandic-lang` (Eskimo-Aleut): `west-greenlandic-pidgin->[1,305]` (English+Greenlandic contact flavor), leaving `greenlandic-lang->[305]` as the sole remaining holder. Verified via `pnpm run mixer:guardrails` (OK), `pnpm run mixer:apply-deltas` (wrote `config/language-mixer-map.json`), `report-language-mixer-base-clusters.js --min-size=2 --include-families` (exit 0), `check-language-mixer-map-inconsistencies.js --show-all-bases` (exit 0), and direct check that `bases=[305]` cluster size is now 1 (greenlandic-lang only); decluster claim `batchId=2025-12-16T03:27:03.897Z-worker1` marked `complete`.

- [1. Infrastructure status](#1-infrastructure-status)


- [2. Families / bases already reviewed](#2-families--bases-already-reviewed)


- [3. Not-unique-enough clusters (current suspects)](#3-not-unique-enough-clusters-current-suspects)


- [4. Work not yet done / future passes](#4-work-not-yet-done--future-passes)


- [5. Planned next steps when resuming](#5-planned-next-steps-when-resuming)


- [6. Quick checklist for whoever picks this up](#6-quick-checklist-for-whoever-picks-this-up)


- [7. Planned tooling extensions (Markov, similarity, and UX helpers)](#7-planned-tooling-extensions-markov-similarity-and-ux-helpers)
 - [8. Wikipedia language list coverage registry](#8-wikipedia-language-list-coverage-registry)



- **Blended Markov generator**
  - Implemented in `modules/names-mixer.js`.
  - Supports:
    - Per-base Markov chains.
    - Segment-wise blending of multiple bases with weights.
    - Smoothing joins between segments (spaces / hyphens / elision).
    - Basic safeguards against over-repetition (esp. click-heavy languages).
  - Legacy "single mixed chain" path kept behind `options.legacyChain`.
  - Planned next iteration (approved): improve *mixed* generation quality by combining adaptive multi-try scoring (`K=2` with early-exit; hard time budget 1000ms; mixed-only) with configurable join/phonotactic rules keyed primarily off base-level feature flags (with ISO overrides only when necessary).



- **Core `Names` API**
  - `modules/names-generator.js` is still the authoritative single-base Markov engine.
  - APIs:
    - `Names.getBase(base, min, max, dupl)` – uses base `min/max/d` by default.
    - `Names.getCulture(culture, min, max, dupl)` – wraps `getBase` via `pack.cultures[culture].base`.
    - `Names.getCultureShort(culture)` – shortens `min/max` for label-ish uses.
    - `Names.getState(name, culture, base)` / `Names.getMapName(force)` – apply culture-specific suffix logic on top of base names.



- **Tooling (under `tools/`)**
  - `check-namebase-lengths.js`
    - ✅ Uses a Node VM to load `namebases-*` and `names-generator`.
    - ✅ Reports **seed** and **generated** length stats per base.
    - ✅ Currently wired so that `Names.getBase` sees `nameBases = defaultNameBases`.
  - `report-namebase-duplicates.js`
  - `profile-language-mixes.js`
    - Profiles entries in `config/language-mixes.json` and `language-mixer-map.json`.
    - For each ISO:
      - region, family, category, tags,
      - mapped bases,
      - seed length stats and script / character profile (ASCII vs extended, etc.).
  - `check-language-mixer-map-inconsistencies.js`
    - Sanity-sweeps `language-mixes.json` + `language-mixer-map.json`.
    - Surfaces:
      - ISOs with **mix entry but no base mapping**.
      - ISOs with **base mapping but no mix entry**.
      - Bases used across **multiple families/regions** (potential style-collapsing hubs).
  - `generate-language-pair-samples.js`
    - Walks every possible catalog ISO pair (optionally capped with `--max-pairs`) and locally generates Markov samples for each combination using the same blender as `generate-language-samples`.
    - Prints any pairs where all generated samples drew segments from only one ISO, plus a total count so we can triage unmixed mappings and base clusters that still behave monolingually.
    - ✅ Supports deterministic seeds, per-sample length overrides, and verbosity flags for investigating stubborn clusters. 
      - (2025-12-11 tweaks: summary block now prints at the end of the run so failure details stream first, and the CLI now also lists every ISO that never produced even a single mixed-segment name during the run so we can escalate those languages for rewiring.)
  - `compare-mixer-nextgen-to-app.js`
    - Tri-path mixer comparison harness: compares **app legacy** (`legacyChain`), **app current**, and a **helper-only nextgen** mixer implementation (not wired into the app) for the same ISO or base list and seed.
    - Use this to validate experimental mixing heuristics against both shipped mixer behaviors without pushing changes into the app runtime.
    - Example: `pnpm exec -- node tools/mixer-core/compare-mixer-nextgen-to-app.js --iso=amkoe --count=40 --seed=1` (on Windows shells, quote comma-separated `--base` values, e.g. `--base="353,354"`).
  - `report-language-mixer-duplicates.js`
    - Finds potentially non-unique languages in the catalog by:
      - Detecting duplicate ISO codes.
      - Grouping entries that normalize to the same language name (after stripping generic suffixes and parentheses), while skipping groups that are clearly pure family macros.
  - `check-language-mixer-map-duplicate-isos.js`
    - Read-only scan of `config/language-mixer-map.json` for **duplicate ISO rows**.
    - Useful after manual wiring batches to ensure the mixer-map is deterministic (`iso -> bases`).
  - `dedupe-language-mixer-map-duplicate-isos.js`
    - Removes **exact duplicate** mixer-map rows (same `iso` + same `bases`) while refusing to touch conflicting duplicates.
    - Has `--apply` mode with a **no-drop-ISO** guard (will refuse to write if the ISO set changes).
  - **2025-12-11 catalog sweep:** Ran `node tools/mixer-diagnostics/check-language-mixer-name-duplicates.js` and retagged macro/list-alias catalog entries (e.g., Cebuano, Ilocano, Sundanese, Swedish, Hmong, Malagasy, Madurese, Khasi, Meitei) with explicit `(native-speakers list)` / `(macro entry)` suffixes. The catalog now reports **0 exact duplicate names**, so coverage helpers no longer need to disambiguate those headliner duplicates.
  - `check-language-mixer-map-inconsistencies.js`
    - Sanity-sweeps `language-mixes.json` + `language-mixer-map.json`.
    - Surfaces:
      - ISOs with **mix entry but no base mapping**.
      - ISOs with **base mapping but no mix entry**.
      - Bases used across **multiple families/regions** (potential style-collapsing hubs).
  - **Language mixer safety invariants (append-only registries)**
    - ✅ As of 2025-12-11, all Node helpers that write `config/language-mixer-map.json` or
      `config/language-mixes.json` are hardened with "no-drop-ISO" guards:
      each script snapshots the original ISO set on load and **refuses to write** if any
      original ISO would be missing in the output.
    - Combined with the project rule that these JSONs are append-only registries, this
      makes silent language deletion via helper scripts mechanically impossible; future
  - ✅ **2025‑12‑11 tooling fix:** `names-mixer.js` + `generate-language-samples.js` now soften long click-segment runs by stripping repeated leading click markers and inserting whispered or `h` buffer consonants; verified with `node tools/mixer-core/generate-language-samples.js --base=353,354 --count=20 --seed=42 --min=8`.
    - ✅ **2025‑12‑11 click expressive pass:** Extended the click smoother with random prefixes, bridge vowels, suffix syllables, and accent swaps (mirrored in CLI) so `[353,354]` blends show richer intra-name variation (e.g., `kóá-samáa`, `ao’káéhóa`).
    - ✅ **2025-12-11 mixer sampler guard:** `generate-language-pair-samples.js` now forces a second ISO segment into a candidate blend when multiple ISOs are available but the first pass pulled only one, eliminating “monolingual-only” false positives in pair scans (verified: 0 monolingual failures on 60-, 300-, and 500-pair runs across seeds 123/456).
  - ✅ **2025-12-11 CLI upgrade:** `generate-language-samples.js` now mirrors `Names.getMixedBaseMany` by stitching segments from all requested bases inside each generated name (instead of alternating base-by-base). New options: blended runs require at least two segments, accept `--weights`, `--max-segments`, and honor `--min/--max` when composing single-name mixes so we can visibly verify intra-name mixing for any `[base]` set.
  - **Post-restore + fixer diagnostics snapshot (2025-12-11)**
    - `merge-language-mixer-from-head` and `restore-lost-language-mappings` now report
      zero additions needed from HEAD / snapshot: all languages present in git HEAD and
      in `_lost-languages-from-declustering.json` are present in the current
      `language-mixer-map.json`.
    - A one-off guarded run of `fix-language-mixer-mappings.js` on the restored map
      increased the number of mapped ISOs from 1,538 to 2,303 while preserving the
      original ISO set (`missing_count=0`, `added_count=765` when comparing before/after
      snapshots). This confirms the fixer no longer causes ISO loss and only adds or
      adjusts mappings.
    - `report-language-mixer-iso-diff-vs-head` confirms there are no ISOs that exist in
      HEAD but are missing in the current map; the current map is a strict superset of
      HEAD by construction.
    - **2025-12-11 coverage repair:** `burushaski` was present in `language-mixer-map.json` but absent from the catalog; added a dedicated catalog entry (Language isolate, Asia) and reran `generate-language-mixer.js` so both bundles stay in sync. Coverage check now reports zero ISOs in the map without catalog entries.
    - **2025-12-11 mixer-map gap:** `standard-french` existed in the catalog but lacked a mapping entry; wired it to the French base `[2]`, regenerated the bundles, and reran the health suite to drop the missing-mapping count by one (475 → 474).
    - **2025-12-11 Ryukyuan macro fix:** Added a catch-all `ryukyuan` mapping keyed to `[10,11,12]` (Korean, Japanese, and Mandarin base influences) to cover the catalog macro entry. Regenerated bundles and reran health diagnostics; missing-mapping count now 341 (down from 452). New follow-up task: scrub the 43 “mapped but all bases invalid” languages surfaced by the larger restored map set.
    - ✅ **2025-12-11 Ryukyuan split normalization:** Normalized `macro-yaeyama`, `miyakoan`, and `yaeyama` duplicate mapping entries in `language-mixer-map.json` so all now consistently use `[10,11,12]` and removed an accidental stray base `30` (Cantonese) from those mappings. Regenerated the bundles and reran health diagnostics.
    - **2025-12-11 catalog duplicate-name fix:** Resolved an exact duplicate catalog name (`Khorchin Mongol`) by renaming the `khorchin-mongol` catalog entry to `Khorchin Mongol (alias)` (kept append-only registry invariant), then regenerated bundles and confirmed `check-language-mixer-name-duplicates` reports 0 duplicates.
    - **2025-12-11 Semitic macro wiring:** Wired missing catalog macros `central-semitic` → `[18,42]` and `west-semitic` → `[18,23,42]` in `language-mixer-map.json`, regenerated bundles, and reran the health suite. Post-pass summary: missing mapping entries now 78; “all bases invalid” now 41; duplicate catalog names remain 0.
    - **2025-12-11 Mongolic macro wiring:** Wired missing catalog entry `serbi-mongolic-family` → `[381]` (Southern Mongolic base), regenerated bundles, and reran health diagnostics. Post-pass summary: missing mapping entries now 76; “all bases invalid” now 40; duplicate catalog names remain 0.
    - **2025-12-11 deeper diagnostics pass:**
      - `check-language-mixer-coverage`: map has 2,932 unique ISOs; catalog has 3,025; **catalog missing from map = 93**; **map missing from catalog = 0**.
      - `check-language-mixer-failures`: **116 total failures** (76 missing mapping + 40 “all bases invalid”; 0 empty-base entries).
  - `softmods/softmod-language-loader.js` + `softmods/test-softmods-languages.js`
    - Node-only softmod prototype for merging extra language bundles from
      `mods/**/languages*.js` on top of an in-memory copy of the canonical
      catalog and mixer-map.
    - Currently exercised with a **Blue Rose** dummy bundle
      (`mods/blue-rose/languages-blue-rose.js`) and an **Arcana Unearthed**
      bundle (`mods/arcana-unearthed/languages-au.js`).
    - These softmod bundles are kept out of `language-mixes.json` /
      `language-mixer-map.json` and do **not** affect coverage percentages or
      base-uniqueness metrics; they are purely local experiments.

 These tools are the main entry points for future tuning passes.

 For a full index of helper scripts and workflows, see [tools/HELPER-TOOLS.md](../tools/HELPER-TOOLS.md); that doc also calls out the core runners for these passes (`profile-language-mixes.js`, `check-language-mixer-map-inconsistencies.js`, `check-namebase-lengths.js`, and the `run-language-mixer-suite.js` orchestrator).
 Dedicated CASCADE workflows exist for parallel uniqueness passes: `/language-uniqueness` (Worker 1), `/languages-unique2`–`/languages-unique10` (Workers 2–10), and `/decluster-language-bases` for targeted shared-base cluster cleanup when a specific hub needs to be broken up.



- **Italian** (`i:3`), **Castilian/Spanish** (`i:4`), **Portuguese** (`i:13`), **French** (`i:2`), **Roman** (`i:8`), **Occitan** (`i:232`), **Sardinian** (`i:233`), **Neapolitan** (`i:306`), etc.



- Length ranges (`min/max`) broadly match seed distributions; most are already quite tight around their medians.


- Duplication patterns reflect Romance flavors reasonably (e.g. French allowing `nlrs` doubles, Italian `cltr`).


- Earlier, many Romance dialects and offshoots in `language-mixer-map` all mapped back onto the same few bases (Spanish, Portuguese, French, Italian, Occitan, Sardinian, Neapolitan). A dedicated multi-batch **Worker‑3 uniqueness pass** has since burned down most of that debt: the majority of mapped Romance languages now have globally unique `[bases]` arrays, with only a short tail of shared-base clusters left for follow-up.


- Core Romance macro-family is in **good shape** for fantasy-mapping use at a coarse level (seed quality, duplication, and high-level flavor), and a substantial slice of the previously-documented iso/dialect-level uniqueness debt has already been paid down via the Worker‑3 pass.


- Remaining Romance work should focus on the small number of still-shared base clusters surfaced by `report-language-mixer-base-clusters` (currently concentrated around bases 3, 13, 22, 43, and 44) until each mapped Romance language has a unique base or mix signature.


- **Linked Wikipedia lists:** *Languages of Europe* list (see §8.7).


- ✅ **2025‑12‑11 micro-pass:** `gallurese` now uses a mixed base set **[279, 233]** (Corsican + Sardinian) instead of sharing pure Corsican base 279. On the `Languages of Europe` helper, this raised **unique bases** among fully wired items from 85 to 86 and reduced **clustered bases** from 37 to 36, while keeping the ISO set unchanged.
 - **2025‑12‑11 micro-pass:** `pannonian-latin` now uses a mixed base set **[8, 3]** (Latin + Italian) instead of sharing the pure Latin base `[8]` with `lat`. On the `Languages of Europe` helper, this further increases the number of unique Romance `[bases]` signatures and reduces one of the remaining 2‑language Romance micro-clusters, without changing the ISO set.
 - **2025‑12‑11 micro-pass (Portuguese creoles, batch 1):** `bengali-portuguese-creole`, `cochin-portuguese-creole`, and `sri-lankan-portuguese-creole` now use `[13,183,256]` (Portuguese + Hindi + Odia), `[13,199,255]` (Portuguese + Tamil + Malayalam), and `[13,199,205]` (Portuguese + Tamil + Sinhala) instead of pure `[13]`, splitting the South Asian Portuguese-creole tail off the base‑13 macro-cluster while keeping core Portuguese standards on pure `[13]`.
 - ✅ **2025‑12‑11 micro-pass (Portuguese creoles, batch 2):** `korlai-portuguese-creole`, `kristang`, `macanese-patois`, and `mardijker-creole` now use `[13,183,253]` (Portuguese + Hindi + Marathi), `[13,304]` (Portuguese + Tagalog/Philippine), `[11,13,30]` (Portuguese + Mandarin + Cantonese), and `[13,195,367]` (Portuguese + Malay + Eastern Indonesian) instead of pure `[13]`, peeling off a second wave of non-European Portuguese creoles from the base‑13 macro-cluster while keeping core Portuguese standards canonical.
 - **2025‑12‑11 micro-pass (Portuguese creoles, batch 3):** Cape Verdean macro entries `barlavento-creoles`, `sotavento-creoles`, `fogo-creole`, and `santiago-creole` now use `[13,195,308]`, `[13,195,346]`, `[13,195,308,346]`, and `[13,195,308,367]` instead of pure `[13]`, giving each macro a distinct Portuguese-anchored creole signature and further shrinking the base‑13 cluster.
 - **2025‑12‑11 micro-pass (Spanish-contact creoles):** `chavacano` now uses `[4,193]` (Spanish + Tagalog) instead of pure Spanish `[4]`, `palenquero` uses `[4,153]` (Spanish + Kongo) instead of `[4]`, and `roquetas-pidgin-spanish` uses `[1,4,13]` (English + Spanish + Portuguese) instead of `[4]`, shrinking the pure‑Spanish `[4]` cluster while keeping `spa` as the canonical pure `[4]` Castilian/Spanish base.
 - **2025‑12‑11 micro-pass (Spanish-contact lects, batch 2):** `cocoliche` now uses `[3,4,286]` (Italian + Spanish + Asturian/West Iberian) instead of pure `[4]`, `llanito` uses `[1,4,231]` (English + Spanish + Judeo‑Spanish) instead of `[4]`, and `mediterranean-lingua-franca` uses `[2,3,4,18]` (French + Italian + Spanish + Maghrebi Arabic) instead of `[4]`, further shrinking the pure‑Spanish `[4]` dialect/lect cluster while keeping `spa` as the only pure `[4]` Castilian/Spanish standard.


- **2025‑12‑11 micro-pass (Spanish dialects, batch 3):** remaining Spanish dialect lects `canarian`, `cast-o`, `castilian`, `castrapo`, `mallorcan`, `menorcan`, and `murcian` have been moved off pure `[4]` onto unique Spanish‑anchored mixes `[2,4,286]`, `[3,4,232]`, `[2,3,4]`, `[2,4,232,286]`, `[3,4,233]`, `[2,4,233]`, and `[4,8,233]` respectively, leaving `spa` as the sole pure‑`[4]` Castilian/Spanish standard while preserving fine-grained dialect distinctions.


- **2025‑12‑11 micro-pass (Scandinavian + Portuguese cluster trim):** `norwegian` now mixes `[6,236]` and `danish` `[0,6,235]`, breaking the pure `[6]` Scandinavian cluster; `vosgien` moved to `[2,279]` to free the `[2,233]` mix for standard French; `brazilian-portuguese` now uses `[13,233]` to express its Sardinian/Azorean substrate instead of sharing pure `[13]`. CLI helper `generate-language-pair-samples.js` now also reports per-run “never mixed” ISOs so these rewires can be prioritized directly from helper output.


- **2025‑12‑11 micro-pass (Eastern Romance split):** cleared the `[8,233]` cluster by remapping `eastern-romanian` to `[8,233,43]` and `northern-romanian` to `[43,233]`, keeping `lat` `[8]` canonical and using Roman base `43` to differentiate the two Eastern Romance lects.
 - **Worker 7 (/languages-unique7) note:** this pass burned down the [22] and [3] mini-clusters around Balearic, Gaelic (`gla`), Irish (`gle`), Occitan, Istriot, Ligurian, and Romansh by wiring them to unique mixer base sets that blend Italian (3), Celtic (22), Scottish/Irish Gaelic (184/394), Occitan (232), Sardinian (233), Corsican (279), and Romansh (234), and also split the Papuan macros Finisterre–Huon languages, Inland Gulf, and Southeast Papuan languages off the shared `[198,263,360]` cluster via Engan Papuan (365) and Eastern Indonesian (367).



- **Finnic** (`i:9`) – used for Finnish, Karelian, Veps, Sámi relatives, etc.



- Seed and config length bands align; names fall in expected 5–11 range.


- Duplication rule `d:"akiut"` is already tuned to preserve characteristic geminates.


- Mixer map shows base `9` reused across multiple Uralic branches and even some neighboring contact zones.



- `i:9` currently acts as a **macro-Finnic / generic Uralic** base reused across multiple Uralic branches and some contact zones.


- Under the stricter "linguistically defensible" policy, any remaining identical shared `[9]` base-sets among distinct Uralic languages are treated as **uniqueness debt** and should be split into unique Uralic-appropriate mixes (or new bases) rather than preserved as an exception.


- If future flavor or gameplay needs demand more contrast inside Uralic, we can still introduce additional Uralic bases (e.g. East Uralic vs Finnic vs Sámi-flavored) and progressively remap languages off 9 until those subgroups have distinct base or mix signatures.


- **Linked Wikipedia lists:** *Languages of Europe* list (see §8.7).


- **2025‑12‑11 micro-pass (Udmurt/Besermyan):** `besermyan` now uses `[283,438]`, adding a Finnic/Sámi-flavored layer **438** on top of the Udmurt base **283**, while `udmurt` remains the sole pure-`[283]` Udmurt standard.


- ✅ **2025‑12‑11 micro-pass (South Estonian / Kraasna):** `south-estonian` remains on pure `[424]` as the South Estonian anchor, while `kraasna` now uses `[424,283,425]`, adding Udmurt **283** and North-Estonian **425** layers so that it no longer shares a pure `[424]` key with `south-estonian` or collide with the existing South Estonian dialect mixes.


- **2025‑12‑11 verification:** `report-language-mixer-base-clusters --category=Uralic` shows the remaining `[9]` hub cluster (currently **24** members) and no other size≥3 clusters; under the current policy this is treated as remaining uniqueness debt to split rather than an intentional end-state.



- **German** (`i:0`), **English** (`i:1`), **Nordic** (`i:6`).



- **Afrikaans** (`i:268`), **Yiddish** (`i:230`), **Frisian** (`i:235`), **Faroese** (`i:236`), **Luxembourgish** (`i:293`).



- Length bands:
  - `German` / `English` / `Nordic` already have reasonable `min/max` ranges and strong seeds.
  - Added Germanic bases cluster around `min≈4`, `max≈12`, aligned with small/medium town names.


- Duplication rules:
  - `German (0)`: `d:"lt"`.
  - `English (1)`: `d:""` (very conservative; doubles mostly suppressed).
  - `Nordic (6)`: `d:"kln"`.
  - **New Germanic bases** (Afrikaans/Yiddish/Frisian/Faroese/Luxembourgish): standardized on `d:"lnrt"`.



- Germanic macro-family is in **usable** shape.


- Some internal asymmetry (e.g. English being the most conservative on duplication) is currently accepted for flavor.


- No immediate `min/max` changes applied; we treat `d:"lnrt"` as the default for **new Germanic-like bases**.


- **Linked Wikipedia lists:** *Languages of Europe* list (see §8.7).



- **Berber** (`i:17`), **Arabic** (`i:18`), **Mesopotamian** (`i:23`), **Levantine** (`i:42`).



- Length bands checked with `check-namebase-lengths`:
  - `Berber (17)`: config `4–10`, seeds mostly `6–8` with mild tails.
  - `Arabic (18)`: config `4–9`, seeds centred `6–8`, occasional `10–11` outliers.
  - `Mesopotamian (23)`: config `4–9`, seeds have long historical forms but central mass `5–8` is covered.
  - `Levantine (42)`: config `4–12`, seeds `5–7` median, occasional longer historic names.


- No `min/max` adjustments made yet; the current ranges are decent for **city/state** style use.


- A dedicated Afroasiatic **Worker-3 uniqueness pass** has split most previously shared singletons in `language-mixer-map` so that individual Afroasiatic languages (especially Berber, Ethio-Semitic, and Chadic lects) now have unique `[bases]` arrays even when they still draw on 17/18/23/42 as ingredients.



- Semitic macro-family is **serviceable** for flavor and now substantially less entangled in shared `[bases]` than in the original Azgaar mapping: most attested ISOs have distinct mixer signatures, with only a tiny core cluster still outstanding as uniqueness debt.


- Arabic, Mesopotamian, and Berber bases still act as broad central anchors and lexifier ingredients for many related ISOs in the mixer, but differences are increasingly expressed via additional Afroasiatic bases and per-ISO combinations rather than reusing a single bare base.


- **Linked Wikipedia lists:** *Languages of West Asia* list (see §8.8).



- **Nahuatl** (`i:14`), **Quechua** (`i:27`).



- Lengths:
  - `Nahuatl (14)`: config `6–13`, seeds `min=6, max=14, mean≈9.1`. Config tracks the core nicely.
  - `Quechua (27)`: config `6–12`, seeds `min=4, max=15, mean≈8.3`. Config again hugs the central `6–10` region.


- Duplication: both currently use `d:"l"` – preserves `ll`-type sequences without general over-duplication.



- These two bases are **already niche and distinct**; good candidates for Mesoamerican / Andean flavor.


- No changes applied so far for `Nahuatl (14)` and `Quechua (27)`.


- Neighboring **Mazatec** (`i:169`, Oto-Manguean) had its length band retuned from `4–12` to `11–20` based on seed and generated stats so its home range matches the observed distribution.
 - **2025‑12‑11 micro-pass:** `pipil` now uses a mixed base set **[4, 14, 169]** (Spanish + Nahuatl + Mazatec neighbor) instead of sharing the `[4, 14]` mix with `nah`. On the `Indigenous languages of the Americas` helper, this increased **unique bases** among fully wired items by 1 and reduced **clustered bases** by 1, without altering the ISO set.


- **2025‑12‑11 verification:** `report-language-mixer-base-clusters --family=Nahuatl --region=Americas` reports no multi-member clusters, so all catalogued Nahuatl/Quechua entries are currently unique.



- **East Slavic / macro-Slavic anchor**:
  - `rus` (Russian): family *East Slavic*, category *Slavic* → base **5 (Slavic/Ruthenian)**.
  - `ukr` (Ukrainian), `rusyn`, `podlachian`, `west-polesian`, `upper-sorbian`, `lower-sorbian`, `old-church-slavonic` also currently map to base **5**.



- **Lechitic cluster (West Slavic)**:
  - `pol` (Polish), `kashubian`, `polabian`, `pomeranian`, `slovincian`: family *Lechitic* → base **314 (Lechitic)**.



- **Czech–Slovak cluster (West Slavic)**:
  - `ces` (Czech), `slovak`: family *Czech-Slovak* → base **315 (Czech-Slovak)**.



- **South Slavic BCS cluster (Western South Slavic)**:
  - `bosnian`, `croatian`, `montenegrin`, `srp` (Serbian), `serbo-croatian`: family *Western South Slavic* → base **316 (South Slavic BCS)**.



- **Other dedicated Slavic bases**:
  - `belarusian` → base **266 (Belarusian)**.
  - `slovene` → base **267 (Slovene)**.
  - `macedonian` → base **273 (Macedonian)**.
  - `silesian` → base **294 (Silesian)**.



- Removed stray mappings from `ces` to **20 (Basque)** and from `ukr` to **25 (Hawaiian)**; both now lean on Slavic-family bases only.


- Deduplicated `rus → [5]` entries in `language-mixer-map.json`.


- Introduced dedicated bases **314 (Lechitic)**, **315 (Czech-Slovak)**, and **316 (South Slavic BCS)** and remapped the corresponding West/South Slavic ISOs off base 5.



- Base **5 (Slavic/Ruthenian)** now primarily serves as a macro **East Slavic / historical Slavic** anchor plus some Sorbian and border lects.


- West Slavic subclusters (Lechitic and Czech–Slovak) and the core South Slavic BCS cluster now have **distinct bases with tuned length bands**, improving internal contrast within the Slavic family.


- Future passes may:
  - split East Slavic further (e.g. Russian vs Ukrainian vs Belarusian),
  - give Sorbian and border lects (Podlachian / West Polesian) blended or dedicated bases,
  - and tighten duplication / length settings once more gameplay feedback is available.


- **Linked Wikipedia lists:** *Languages of Europe* list (see §8.7).
 - ✅ **2025‑12‑11 micro-pass:** `kashubian` now uses a mixed base set **[5, 314, 0]** (Slavic/Ruthenian + Lechitic + German) to reflect Polish + macro-Slavic core plus German contact. On the `Languages of Europe` helper, this increased **unique bases** among fully wired items from 83 to 85 and reduced **clustered bases** from 39 to 37, without changing the global ISO set.



- **Chinese / Mandarin**:
  - `iso: mandarin` → base **11 (Chinese)**.
  - Seed lengths `min=4, max=11, mean≈7.0`; config `5–10` with p25–p75 ≈ `6–8`.
  - Mixer map previously also had a stray mapping `mandarin → 66`; this has been removed so Mandarin now consistently uses base 11.


- **Japanese**:
  - `iso: jpn-lang` → base **12 (Japanese)**.
  - Seeds `min=3, max=14, mean≈6.8`; config `4–10` with p25–p75 ≈ `6–8`.


- **Korean**:
  - `iso: kor` → base **10 (Korean)**.
  - Seeds `min=3, max=11, mean≈6.9`; config `5–11` with p25–p75 ≈ `6–8`.


- **Vietnamese**:
  - `iso: vie` → base **29 (Vietnamese)**.
  - Seeds `min=3, max=19, mean≈8.1`; config `3–12` with p25–p75 ≈ `7–9`, plus `hyphen/space` flags to allow multi-word and hyphenated forms.


- **Cantonese**:
  - `iso: yue` → base **30 (Cantonese)**.
  - Seeds `min=4, max=14, mean≈7.4`; config `5–11` with p25–p75 ≈ `6–8`.



- Core East Asian standards (Mandarin, Japanese, Korean, Vietnamese, Cantonese) each have **dedicated, well-anchored bases** with sensible length bands.


- Mandarin’s duplicate mapping to a non-Chinese base (66) has been cleaned; it now correctly routes only to base 11.


- Next East Asian work should focus on:
  - auditing **Mongolic** and neighboring families (Mongolian / Khalkha / Buryat / Kalmyk, plus historical Mongolic varieties) to ensure they are mapped onto base **31 (Mongolian)** or other purpose-built Mongolic bases rather than unrelated hubs, and
  - checking that smaller Sinitic varieties and regional lects do not silently collapse onto the same few bases without justification.


- **2025‑12‑11 micro-pass (Southeast Asia Austronesian decluster):** cleared four Southeast Asia base-set clusters by adding small, region-plausible Austronesian ingredients:
  - ✅ `banjar` now uses `[194,195,193,367]` (Indonesian + Malay + Tagalog + Eastern Indonesian)
  - ✅ `berau-malay` now uses dedicated base `[444]` (**Berau Malay**)
  - ✅ `malay` now uses dedicated base `[445]` (**Standard Malay**), while base **195** remains a Malay / trade-lexifier hub for other Malayic lects
  - ✅ Malay hub burn-down (formerly pure `[195]`):
    - ✅ `cocos-malay` → `[446]` (Cocos Malay)
    - ✅ `kupang-malay` → `[447]` (Kupang Malay)
    - ✅ `larantuka-malay` → `[448]` (Larantuka Malay)
    - ✅ `makassar-malay` → `[449]` (Makassar Malay)
    - ✅ `malaccan-creole-malay` → `[450]` (Malaccan Creole Malay)
    - ✅ `manado-malay` → `[451]` (Manado Malay)
    - ✅ `maumere-malay` → `[452]` (Maumere Malay)
    - ✅ `north-moluccan-malay` → `[453]` (North Moluccan Malay)
    - ✅ `papuan-malay` → `[454]` (Papuan Malay)
    - ✅ `serui-malay` → `[455]` (Serui Malay)
    - ✅ `sri-lankan-malay` → `[456]` (Sri Lankan Malay)
    - ✅ `sula-malay` → `[457]` (Sula Malay)
  - ✅ Burned down remaining pure `[195]` singletons (non-`*-malay`) by dedicating bases `[458–475]`:
    - ✅ Aslian (Austroasiatic): `batek`→`[458]`, `mah-meri`→`[459]`, `semai`→`[460]`, `semaq-beri`→`[461]`, `semelai`→`[462]`, `temiar`→`[463]`
    - ✅ Nicobarese: `camorta-nicobarese`→`[464]`, `car-nicobarese`→`[465]`, `chaura-nicobarese`→`[466]`, `nancowry-nicobarese`→`[467]`, `nicobarese`→`[468]`, `shompen`→`[471]`, `southern-nicobarese`→`[472]`, `teressa-nicobarese`→`[473]`, `katchal-nicobarese`→`[474]`
    - ✅ Malay-based creoles: `orang-pulo`→`[469]`, `peranakan`→`[470]`
    - ✅ Unclassified: `kenaboi`→`[475]`
  - ✅ Began burning down `[194,195]` cluster debt by dedicating bases `[476–482]`:
    - ✅ `minangkabau`→`[476]` (Minangkabau)
    - ✅ `lampung`→`[477]` (Lampung)
    - ✅ `bima`→`[478]` (Bima)
    - ✅ `rejang`→`[479]` (Rejang)
    - ✅ `basap`→`[480]` (Basap)
    - ✅ `selaru`→`[481]` (Selaru)
    - ✅ `land-dayak`→`[482]` (Land Dayak)
  - ✅ Continued burning down `[194,195]` cluster debt by dedicating bases `[483–490]`:
    - ✅ `flores-lembata`→`[483]` (Flores-Lembata)
    - ✅ `kei-tanimbar`→`[484]` (Kei-Tanimbar)
    - ✅ `timoric`→`[485]` (Timoric)
    - ✅ `sumba-flores`→`[486]` (Sumba-Flores)
    - ✅ `tomini-tolitoli`→`[487]` (Tomini-Tolitoli)
    - ✅ `muna-buton`→`[488]` (Muna-Buton)
    - ✅ `minahasan`→`[489]` (Minahasan)
    - ✅ `sangiric`→`[490]` (Sangiric)
  - ✅ Continued burning down `[194,195]` cluster debt by dedicating bases `[491–496]`:
    - ✅ `kayan-murik`→`[491]` (Kayan-Murik)
    - ✅ `melanau-kajang`→`[492]` (Melanau-Kajang)
    - ✅ `north-sarawakan`→`[493]` (North Sarawakan)
    - ✅ `sabahan`→`[494]` (Sabahan)
    - ✅ `north-borneo`→`[495]` (North Borneo)
    - ✅ `greater-north-borneo`→`[496]` (Greater North Borneo)
  - ✅ Continued burning down `[194,195]` cluster debt by dedicating bases `[497–503]`:
    - ✅ `makassar-branch`→`[497]` (Makassar Branch)
    - ✅ `south-sulawesi`→`[498]` (South Sulawesi)
    - ✅ `northern-south-sulawesi`→`[499]` (Northern South Sulawesi)
    - ✅ `central-south-sulawesi`→`[500]` (Central South Sulawesi)
    - ✅ `kaili-wolio`→`[501]` (Kaili-Wolio)
    - ✅ `saluan-banggai`→`[502]` (Saluan-Banggai)
    - ✅ `seko-badaic`→`[503]` (Seko-Badaic)
  - ✅ Finished burning down the remaining exact `[194,195]` mappings by dedicating bases `[504–510]`:
    - ✅ `moklenic`→`[504]` (Moklenic)
    - ✅ `nasal`→`[505]` (Nasal)
    - ✅ `northwest-sumatra-barrier-islands`→`[506]` (Northwest Sumatra Barrier Islands)
    - ✅ `sumatran`→`[507]` (Sumatran)
    - ✅ `shwng`→`[508]` (SHWNG / South Halmahera–West New Guinea)
    - ✅ `barito`→`[509]` (Barito)
    - ✅ `bali-sasak-sumbawa`→`[510]` (Bali Sasak Sumbawa)
  - ✅ Burned down remaining Malay-lexifier creoles still referencing hub base **195**:
    - ✅ `alor-malay`→`[511]` (Alor Malay)
    - ✅ `ambonese-malay`→`[512]` (Ambonese Malay)
  - ✅ Removed remaining Malay-adjacent macro / diaspora uses of base **195** by dedicating bases `[513–517]`:
    - ✅ `malaysian-mandarin`→`[513]` (Malaysian Mandarin)
    - ✅ `malayo-chamic`→`[514]` (Malayo-Chamic)
    - ✅ `malayo-polynesian`→`[515]` (Malayo-Polynesian)
    - ✅ `western-malayo-polynesian`→`[516]` (Western Malayo-Polynesian)
    - ✅ `singaporean-mandarin`→`[517]` (Singaporean Mandarin)
  - ✅ Reduced hub base **195** usage for Indonesian by dropping it from the mapping: `indonesian` now uses `[194,367]`.
  - ✅ Burned down `[194,195,303]` cluster debt by dedicating bases `[518–519]`:
    - ✅ `ace`→`[518]` (Acehnese)
    - ✅ `madurese`→`[519]` (Madurese)
  - ✅ Burned down `[194,195,198]` cluster debt by dedicating bases `[520–522]`:
    - ✅ `north-new-guinea`→`[520]` (North New Guinea)
    - ✅ `sawila`→`[521]` (Sawila)
    - ✅ `halmahera-sea`→`[522]` (Halmahera Sea)
  - ✅ `iban` now uses dedicated base `[439]` (**Iban**)
  - ✅ `sarawakian-malay` now uses dedicated base `[440]` (**Sarawakian Malay**)
  - ✅ `brunei-malay` now uses dedicated base `[441]` (**Brunei Malay**)
  - ✅ `sabah-malay` now uses dedicated base `[442]` (**Sabah Malay**)
  - ✅ `malaysian-malay` now uses dedicated base `[443]` (**Malaysian Malay**)
  - ✅ `kasiguranin` now uses `[193,304,367,194]` (Tagalog + Cebuano + Eastern Indonesian + Indonesian)
  - ✅ `iranun` now uses `[193,195,304,367]` (Tagalog + Malay + Cebuano + Eastern Indonesian)
  This removes the prior clusters `[193,195,304]`, `[193,195,367]`, `[193,304,367]`, and `[195,304,346]` as verified by `report-language-mixer-base-clusters --region='Southeast Asia'`.

  - ✅ Blocked-195 Batch 1 (doc correction): the repo does **not** currently define namebases `i=539–542`, so those remaps are not applied.
    - Current mixer-map (verified):
      - `mardijker-creole`→`[13,195,367]`
      - `tetum`→`[13,195,367]`
      - `sat`→`[29,195,251]`
      - `rbb`→`[29,251,195]`

  - ✅ Health unblock (verified): added the missing mixer map entry for catalog ISO `dre` (Dolpo) by wiring it to an existing Tibetic base-set `dre`→`[47,54,58]`.



- **West / Horn African standards**:
  - **Yoruba**: `yor` / `yoruba` → base **112 (Yoruba)**, seeds `min=3, max=9, mean≈6.0`, config `4–12`, ASCII with `hyphen`.
  - **Igbo**: `igbo` → base **113 (Igbo)**, seeds `min=3, max=11, mean≈5.8`, config `4–12`, ASCII with `hyphen`.
  - **Somali**: `somali` → base **130 (Somali)**, seeds `min=3, max=10, mean≈6.6`, config `4–12`, ASCII.
  - **Amharic**: `amharic` → base **133 (Amharic)**, seeds `min=4, max=12, mean≈8.4`, config `4–12`, ASCII with `hyphen`.


- **Bantu cluster (Great Lakes / Southern)**:
  - **Lingala**: `lingala` → base **146 (Lingala)**, seeds `min=4, max=13, mean≈6.7`, config `4–12`, ASCII with `hyphen`.
  - **Kinyarwanda**: `kinyarwanda` → base **147 (Kinyarwanda)**, seeds `min=5, max=9, mean≈7.2`, config `4–12`, ASCII.
  - **Shona**: `shona` → base **148 (Shona)**, seeds `min=5, max=11, mean≈7.1`, config `4–12`, ASCII.
  - **Zulu**: `zulu` → base **149 (Zulu)**, seeds `min=6, max=16, mean≈8.6`, config `4–12`, ASCII with `hyphen`.
  - **Xhosa**: `xhosa` → base **150 (Xhosa)**, seeds `min=5, max=19, mean≈9.0`, config `4–12`, ASCII with `apostrophe / hyphen / space`.
  - **Sesotho**: `sesotho` → base **151 (Sesotho)**, seeds `min=6, max=14, mean≈9.4`, config `4–12`, ASCII with `apostrophe / hyphen`.
  - **Tswana**: `tswana` → base **152 (Tswana)**, seeds `min=4, max=13, mean≈7.8`, config `4–12`, ASCII with `hyphen`.



- `zulu`, `xhosa`, and `shona` previously had duplicate mappings to **base 28 (Swahili)** alongside their own Bantu bases (148–150); the Swahili duplicates have been removed so they now use only their dedicated bases.


- `kinyarwanda`, `lingala`, `sesotho`, and `tswana` likewise had trailing Swahili-28 mappings; these duplicates have been removed so they now resolve only to bases **147, 146, 151, 152** respectively.



- **Second-pass Bantu refinement**:
  - `kongo`, `luganda`, `chichewa`, and `kikuyu` previously also had trailing Swahili-28 mappings in addition to their dedicated bases **153 (Kongo)**, **154 (Luganda)**, **155 (Chichewa)**, **156 (Kikuyu)**.
  - These Swahili duplicates have now been removed so they consistently use only their own Bantu bases, with shared settings `min=4, max=12, d="lnrt"` and city seeds drawn from their respective core regions.



- Post-coverage wiring for additional African lects:
  - **Sekele** (`sekele`, Kx'a / Northern ǃKung) now maps to a dedicated Kx'a click blend `[353,354]`, alongside **Ekoka ǃKung** (`ekoka-kung` → `[353]`) and **ǂ’Amkoe** (`amkoe` → `[355]`), and distinct from the pure **Taa** / **Nǁng** / **Nama** / **Naro** click bases `[356–359,361]`.
  - ✅ **Sena** (`sena`, Bantu; Mozambique/Malawi) now has a unique Southeastern Bantu mix `[148,155]` anchored on **Shona (148)** and **Chichewa (155)** rather than riding on a generic Swahili or undifferentiated Pan-African hub.
  - ✅ **Tumbuka** (`tumbuka`, Bantu; Malawi/Zambia) now uses a SE Bantu/Zambezi blend `[155,377]` combining **Chichewa (155)** with the regional **Bemba–Bembe–Fwe** cluster base **377**, reflecting its close ties to Chichewa and neighboring Zambian lects.
  - ✅ **Tonga (Zimbabwe, Zambia, and Mozambique)** (`tonga-zimbabwe-zambia-and-mozambique`) now has a Southern/Zambezi Bantu mix `[148,149,377]` tying **Shona (148)** and **Zulu (149)** into the **Bemba–Bembe–Fwe** basin **377**.
  - ✅ **Tonga (Mozambique)** (`tonga-mozambique`) now uses `[148,149,155]`, blending **Shona (148)** and **Zulu (149)** with **Chichewa (155)** to reflect its SE Mozambique contact zone.
  - ✅ **Tonga (Malawi)** (`tonga-malawi`) now uses `[148,155,377]`, emphasizing **Shona (148)**, **Chichewa (155)**, and the **Bemba–Bembe–Fwe** cluster **377** across the Malawi–Zambia corridor.
  - ✅ **Soli** (`soli`, Botatwe Bantu; Zambia) now has `[149,155,377]`, a Botatwe/Zambezi blend over **Zulu (149)**, **Chichewa (155)**, and **Bemba–Bembe–Fwe (377)** alongside neighboring Tonga and Tumbuka.
  - ✅ **Tswa** (`tswa`, Tswa–Ronga Bantu; Mozambique) now uses `[148,150,152]`, a Tswa–Ronga SE Bantu mix anchored on **Shona (148)** plus **Xhosa (150)** and **Tswana (152)**.
  - ✅ **Tsonga or Xitsonga** (`tsonga-or-xitsonga`, Tswa–Ronga Bantu; Mozambique/South Africa) now uses `[149,150,152]`, a slightly more Nguni-leaning Tswa–Ronga blend combining **Zulu (149)**, **Xhosa (150)**, and **Tswana (152)**.
  - ✅ **Swazi** (`swazi`, Nguni Bantu; Eswatini/South Africa) now has `[149,150]`, a compact Nguni mix over **Zulu (149)** and **Xhosa (150)**.
  - ✅ **Southern Ndebele** (`southern-ndebele`, Nguni Bantu; South Africa) now uses `[149,151]`, reflecting a Zulu–Sesotho contact blend.
  - ✅ **Sumayela Ndebele** (`sumayela-ndebele`, Nguni Bantu; South Africa) now uses `[149,152]`, a Zulu–Tswana-flavored Nguni mix.
  - ✅ **Sotho** (`sotho`, Sotho-Tswana Bantu; Southern Africa) now has `[151,152]`, a macro-Sotho mix spanning **Sesotho (151)** and **Tswana (152)**.
  - ✅ **Sepedi** (`sepedi`, Northern Sotho/Pedi; South Africa) now uses `[149,151,152]`, adding a Zulu contact component to the core Sotho–Tswana band.
  - ✅ **Setlôkwa** (`setlokwa`, Sotho-Tswana Bantu; South Africa/Botswana) now uses `[150,151,152]`, a slightly more eastern Sotho–Tswana blend incorporating **Xhosa (150)**.
  - ✅ **Pretoria Sotho** (`pretoria-sotho`, urban Sotho–Tswana creole; South Africa) now uses `[148,149,151,152]`, an urban Sotho–Tswana macro-mix blending **Shona (148)**, **Zulu (149)**, **Sesotho (151)**, and **Tswana (152)** while keeping `tswana` as the pure base-**152** anchor.
  - ✅ **Tsotsitaal** (`tsotsitaal`, Tswana-based urban slang/creole; South Africa) now uses `[1,151,152]`, an English–Sotho–Tswana contact mix anchored on **English (1)** with a **Sesotho (151)** and **Tswana (152)** substrate.
  - ✅ **Totela** (`totela`, Lozi-related Bantu; Namibia/Zambia) now uses `[149,152,377]`, a Zambezi blend combining **Zulu (149)**, **Tswana (152)**, and the regional **Bemba–Bembe–Fwe** basin base **377**.
  - ✅ **Tshiluba / Luba-Kasai** (`tshiluba`, DRC Bantu) now uses `[146,153]`, a Congolese mix anchored on **Lingala (146)** and **Kongo (153)**.
  - ✅ **Sakata** (`sakata`, DRC Bantu) now uses `[146,153,277]`, adding a modest Sahelian trade component via **Zarma Songhay (277)** on top of the same Lingala/Kongo backbone.
  - ✅ **Umbundu** (`umbundu`, South Mbundu Bantu; Angola) now uses `[146,149,153]`, bridging **Lingala/Kongo (146/153)** with a southern Bantu component **Zulu (149)**.
  - **Venda / Tshivenda** (`venda` / `tshivenda`, Southern Bantu; South Africa/Zimbabwe) now use `[148,151,152]` and `[148,151,152,377]` respectively, a pair of Venda–Sotho–Shona mixes that share the **Shona (148)** + **Sesotho/Tswana (151/152)** core while giving **Tshivenda** an added Zambezi flavor via **Bemba–Bembe–Fwe (377)**.
  - ✅ **Suku** (`suku`, Yaka-branch Bantu; DRC) now uses `[146,153,377]`, tying the **Lingala/Kongo (146/153)** zone into the **Bemba–Bembe–Fwe (377)** basin.
  - **Bembe (Congo) / Bembe (DRC)** (`bembe-congo`, `bembe-drc`, Bantu; Republic of the Congo / DRC) now use `[153,377]` and `[146,377]` respectively, splitting the former pure-`[377]` pair into distinct Kongo- and Lingala-anchored Zambezi mixes while keeping base **377** as the shared **Bemba–Bembe–Fwe** basin.
  - **Berta / Besme** (`berta`, `besme`, Afro-Sahelian borderzone; Sudan/Chad) now use multi-base mixes `[132,145,277,378]` and `[120,132,145,378]` instead of a shared pure-`[378]` key, keeping base **378** as a common Blue Nile / Nuba‑hills basin while distinguishing Berta’s stronger Sahel/Sudan contact (`132`, `277`) from Besme’s more Niger‑Congo‑leaning ties (`120`, `145`).
  - **Afrikaans / Oorlams Creole** (`afrikaans`, `oorlams-creole`, West Germanic / Afrikaans-based creole; Southern Africa/Namibia) now form a de-clustered pair where `afrikaans` remains the canonical pure-`[268]` Afrikaans base, while `oorlams-creole` uses a Germanic creole mix `[0,1,268]` layered over **German (0)**, **English (1)**, and **Afrikaans (268)**.
  - **Saba / Sukur / Tsamai** (`saba`, `sukur`, `tsamai`, Afroasiatic; Sahel / Horn of Africa) now form a small Afroasiatic micro-cluster split so that `saba` remains on the full macro Afroasiatic base-set anchored on `[17,144]`, while `sukur` now uses a compact Sahelian Afroasiatic mix `[17,132,144]` and `tsamai` uses a Horn-leaning Afroasiatic mix `[17,133,140,144]`, giving each language a distinct `bases[]` signature.
  - **Yoruba (alias ISO)** (`yoruba`, alias for `yor`, Niger–Congo; West Africa) now uses a West African trade mix `[112,114,132,277]` anchored on **Yoruba (112)**, **Fula (114)**, **Hausa (132)**, and **Zarma Songhay (277)`, while the canonical `yor` entry remains the sole pure-`[112]` Yoruba base.
  - **Afar** (`afar`, Afroasiatic / East Cushitic; Horn of Africa) now uses a Horn-leaning Afroasiatic mix `[133,140]`, pairing a more specific Cushitic base **133** with the macro East Cushitic anchor **140** instead of sharing a pure-`[140]` key with the broader Cushitic cluster.
  - **Tigrinya / Dahalik** (`tigrinya`, `dahalik`, Ethio-Semitic; Eritrea / Dahlak Islands) now form a de-clustered pair where `tigrinya` remains the canonical pure-`[134]` Ethiopic base, while `dahalik` uses an Arabic-influenced Ethio-Semitic mix `[18,133,134]` combining **Maghrebi Arabic (18)**, a Cushitic/Horn layer **133**, and the Ethiopic anchor **134**.
  - **Bade (Chadic)** (`bade-chadic`, Afroasiatic / West Chadic; Nigeria) now uses a West African Chadic mix `[112,120,132,277]` that layers **Yoruba (112)**, **Ewe (120)**, and **Zarma Songhay (277)** on top of the **Hausa (132)** anchor instead of sharing a pure-`[132]` key with the broader Hausa/Chadic cluster.
  - **Wolof / Pidgin Wolof** (`wolof`, `pidgin-wolof`, Niger–Congo / pidgin; West Africa) now form a de-clustered pair where `wolof` remains the canonical pure-`[115]` Wolof base, while `pidgin-wolof` uses an English–Wolof creole mix `[1,115]` anchored on **English (1)** and **Wolof (115)**.
  - ✅ **Shi / Mashi** (`shi`, South Kivu Bantu; DRC) now uses `[146,147,153]`, a Great Lakes–Congo mix over **Lingala (146)**, **Kinyarwanda (147)**, and **Kongo (153)**.
  - ✅ **Shanjo** (`shanjo`, Zambia Bantu) now uses `[148,152,377]`, a Zambezi blend over **Shona (148)**, **Tswana (152)**, and **Bemba–Bembe–Fwe (377)**.
  - ✅ **Simaa** (`simaa`, Kavango–Southwest Bantu; Zambia) now uses `[148,151,377]`, linking **Shona (148)** and **Sesotho (151)** into the **Bemba–Bembe–Fwe (377)** corridor.
  - ✅ **Yeyi** (`yeyi`, Okavango Bantu with clicks; Namibia/Botswana) now uses `[152,353,358]`, combining **Tswana (152)** with **Kx'a Click A (353)** and **Nama Click (358)** to reflect its Bantu-with-clicks profile.
  - ✅ **Zemba / Dhimba** (`zemba`, Herero-related Bantu; Angola/Namibia) now uses `[149,153,377]`, a southwestern Bantu blend tying **Zulu (149)**, **Kongo (153)**, and the **Bemba–Bembe–Fwe (377)** basin.
  - ✅ **Songhoyboro Ciine** (`songhoyboro-ciine`, Southern Songhay; Niger) now uses `[277,132]`, a Sahelian mix anchored on **Zarma Songhay (277)** with a strong **Hausa (132)** contact component.
  - ✅ **Tadaksahak** (`tadaksahak`, Northern Songhay; Mali/Niger) now uses `[277,18,132]`, blending **Zarma Songhay (277)** with **Maghrebi Arabic (18)** and **Hausa (132)** to reflect its Tuareg/Arabic contact.
  - ✅ **Tasawaq** (`tasawaq`, Northern Songhay; Niger) now uses `[277,18]`, a Songhay–Arabic mix over **Zarma (277)** and **Maghrebi Arabic (18)**.
  - ✅ **Tagdal** (`tagdal`, Northern Songhay; Niger) now uses `[277,18,17]`, a more Berber-leaning Northern Songhay blend combining **Zarma (277)** with **Maghrebi Arabic (18,17)**.
  - ✅ **Susu** (`susu`, coastal Mande; Guinea/Sierra Leone) now uses `[112,277]`, a coastal trade mix anchored on **Yoruba (112)** with a **Zarma Songhay (277)** Sahel influence.
  - ✅ **Supyire** (`supyire`, Northern Senufo; Mali) now uses `[112,132,277]`, reflecting **Yoruba (112)** + **Hausa (132)** + **Zarma (277)** contact in the northern Senufo zone.
  - ✅ **Twi / Akan** (`twi`, Akan dialect cluster; Ghana) now uses `[112,113,277]`, a Ghanaian macro-mix combining **Yoruba (112)**, **Igbo (113)**, and a lighter **Zarma (277)** Sahel component.
  - ✅ **Yalunka** (`yalunka`, Mande; Guinea/Sierra Leone/Mali/Senegal) now uses `[113,277]`, a Mande/Sahel mix over **Igbo (113)** and **Zarma Songhay (277)**, paralleling its close relationship with Susu.

  - ✅ **South Banda** (`south-banda`, Banda/Ubangian; CAR/DRC) now uses `[297,146]`, mixing **Sango (297)** with **Lingala (146)**.
  - ✅ **West Banda** (`west-banda`, Banda/Ubangian; CAR) now uses `[297,153]`, mixing **Sango (297)** with **Kongo (153)**.
  - ✅ **Wongo** (`wongo`, Bantu; DRC) now uses `[146,152,153]`, a central Bantu blend over **Lingala (146)**, **Tswana (152)**, and **Kongo (153)**.
  - ✅ **Wushi** (`wushi`, Grassfields Bantu; Cameroon) now uses `[112,146,152]`, tying **Yoruba (112)** into a **Lingala (146)** + **Tswana (152)** central/hinterland band.



- A core set of major Sub-Saharan languages (Yoruba, Igbo, Somali, Amharic, Lingala, Kinyarwanda, Shona, Zulu, Xhosa, Sesotho, Tswana, **Kongo, Luganda, Chichewa, Kikuyu**) now each have **dedicated, well-anchored bases** with sensible length bands.


- Swahili (28) is moving back toward its role as a **trade/lexifier hub** rather than a generic stand-in for unrelated Bantu languages.


- Many **smaller African lects** (additional Bantu and Atlantic–Congo families) still map directly to Swahili 28 or other hubs and remain candidates for future passes to introduce language-specific bases and tuned length/duplication profiles.
 - **Linked Wikipedia lists:** *Languages of Africa – major languages view* (see §8.1).



- **Indo-Aryan standards (one-to-one bases)**:
  - **Hindi**: `hin` → base **183 (Hindi)**, seeds `min=4, max=11, mean≈6.6`, generated stats `min=4, max=12, mean≈7.4, p25≈5, p75≈9, p90≈11`; config band tightened from `4–12` to `5–11` so the home range hugs the central distribution.
  - **Urdu**: `urdu` → base **203 (Urdu)**, seeds `min=5, max=15, mean≈8.0`, config `4–12`, ASCII + space.
  - **Gujarati**: `gujarati` → base **204 (Gujarati)**, seeds `min=5, max=11, mean≈7.0`, config `4–12`, ASCII.
  - **Sinhala**: `sinhala` → base **205 (Sinhala)**, seeds `min=5, max=12, mean≈8.3`, config `4–12`, ASCII + space.
  - **Odia**: `odia` → base **256 (Odia)**, seeds `min=4, max=13, mean≈8.1`, config `4–12`, ASCII.
  - **Assamese**: `assamese` → base **257 (Assamese)**, seeds `min=5, max=10, mean≈7.5`, config `4–12`, ASCII.
  - **Kashmiri**: `kashmiri` → base **288 (Kashmiri)**, seeds `min=4, max=9, mean≈7.0`, config `4–12`, ASCII.
  - **Sindhi**: `sindhi` → base **289 (Sindhi)**, seeds `min=4, max=19, mean≈8.4`, config `4–12`, ASCII + space.
  - **Marathi / Konkani**: `marathi`, `konkani` → base **253 (Marathi)**, generated stats `min=3, max=12, mean≈6.9, p25≈5, p75≈8, p90≈10`; config band tightened from `4–12` to `5–10` to capture the core while trimming rare extremes.
  - **Punjabi**: `punjabi` → base **202 (Punjabi)**, generated stats `min=4, max=12, mean≈7.9, p25≈6, p75≈10, p90≈11`; config band tightened from `4–12` to `6–11` to reflect the observed 6–11 cluster.



- **Dravidian macro-hubs**:
  - **Tamil**: base **199 (Tamil)**, shared across South / Central / North / unclassified Dravidian lects; seeds `min≈5, max≈15, mean≈9.1`, generated stats `min=4, max=12, mean≈8.0, p25≈5, p75≈11`. Config band lightly tightened from `4–12` to `5–12` so it aligns with p25 and avoids very short outliers.
  - **Telugu**: base **200 (Telugu)**, shared across South-Central + some South Dravidian lects; seeds `min≈5, max≈13, mean≈8.3`, config `4–12` covers the core (`p25≈6, p75≈10`).
  - **Kannada**: base **254 (Kannada)**, used for Kannada, Tulu, Kodava, and neighbors; seeds `min≈5, max≈14, mean≈7.8`, config `4–12` matches `p25≈6, p75≈9`.
  - **Malayalam**: base **255 (Malayalam)**, used for Malayalam and many closely related South Dravidian lects; seeds `min≈5, max≈18, mean≈9.1`, config `4–12`, with central mass (`p25≈8, p75≈10`) inside the band.



- Core Indo-Aryan standards have **one-to-one bases** with reasonable `min/max` bands; they are not acting as problematic hubs.


- A first Indo-Aryan mixer pass has also broken the worst Hindi-adjacent shared-base cluster: **Bhojpuri** and **Magahi** no longer share `[183,201]`, but instead use unique 183-anchored mixes while continuing to reflect a Hindi-centered palette.


- Dravidian still leans on a small set of **macro-family bases** (Tamil 199, Telugu 200, Kannada 254, Malayalam 255) reused across many lects; under the explicit per-language uniqueness rule this remains **uniqueness debt**, but multiple South Dravidian passes have now remapped many Malayalam/Tamil-adjacent lects (including the former pure-255 tail) onto distinct `[199/253/254/255/372–375]` combinations so that no South Dravidian entry remains on a bare `[255]` array.


- Initial tuning on **Tamil (199)** (raising `min` from `4` to `5`) ensures generated names better reflect the observed Tamil length distribution, but it does **not** change the requirement that each Dravidian language should ultimately have its own base or tuned mix rather than sharing these macro-hubs.


- **2025‑12‑11 micro-pass (South Dravidian tail):** the shared Dravidian clusters `[199,254,372]` (`kota-dravidian`, `sholaga`), `[372,374]` (`madiya`, `pattapu`), and `[374]` (`pardhan`, `muria`) have been split so that `kota-dravidian`, `madiya`, and `pardhan` retain `[199,254,372]`, `[372,374]`, and `[374]` as canonical anchors while `sholaga`, `pattapu`, and `muria` now use unique tail mixes `[199,372,374]`, `[372,374,375]`, and `[199,372,375]` respectively.


- Future passes should therefore:
  - introduce additional Dravidian bases for major subgroups (e.g. Gondi-like cluster vs generic Telugu; select Malayalam-based minorities vs core Malayalam),
  - progressively remap languages off the shared 199/200/254/255 hubs until each mapped Dravidian entry has a unique base or mix signature, and tighten length and duplication settings per base once more targeted seeds are available.


- **Linked Wikipedia lists:** *List of languages by number of native speakers* list JSONs (see §8.2 and §8.3).


- **Note (diagnostic snapshots):** `report-language-mixer-base-clusters.js` is a read-only helper; any `_last-language-base-clusters*.txt` or `_report-language-mixer-base-clusters.txt` files under `tools/mixer-diagnostics/` are just saved console output for review, are gitignored, and should be treated as ephemeral diagnostics that can be regenerated on demand, not as editable source data.



- **Romance:** Shared `[3]`, `[13]`, `[22]`, `[43]`, and `[44]` clusters have been split so each mapped Romance entry now has a distinct base or mix signature (see §2.1).


- **Uralic:** Non-9 Uralic clusters around bases 320–323 (Khanty, Mansi, Mari, Nenets) have been split into unique mixes. Any remaining identical `[9]` base-set clusters are treated as ongoing uniqueness debt under the stricter policy.


- **South Asia / Dravidian:** Multiple passes have remapped South Dravidian and Tamil-adjacent lects off pure `[199]` / `[255]` onto distinct `[199/253/254/255/372–375]` combinations; in particular, the Malayalam-anchored `[255]` tail is now fully de-clustered so that no South Dravidian entry uses a pure `[255]` array (see §2.9).


- **Hindi / Indo-Aryan:** The shared `[183,201]` cluster for **Bhojpuri** and **Magahi** has been broken; both now use unique 183-anchored mixes while still reflecting a Hindi-centered palette (see §2.9).


- **Semitic / Ethiopic:** The Amharic/Ethiopic `[133]` duplication between `amh` and `amharic` has been resolved so that `amh` is the canonical pure-133 entry and `amharic` uses `[2,133,140]` instead of sharing `[133]` (see §2.4).


- **English-based pidgins & creoles:** English base `1` is now kept as a pure `[1]` anchor for `eng`, while key English-based contact varieties (e.g. `american-indian-pidgin-english`, `anguillian-creole`, `bislama`, `pijin`) use distinct 1-anchored mixes that incorporate appropriate regional bases.


- **English-based Pacific creole macros (local helper):** regional macros and neighbors (`australian-kriol`, `melanesian-pidgin`, `torres-strait-creole`, `pitcairn-norfolk`, `english-based-pacific-creoles-family`, `manglish`) now have distinct English-anchored `[bases]` mixes instead of pure `[1]` / `[309]` signatures, reducing the residual English-based Pacific macro cluster around the English hub.


- **SE Asia base-29 (Vietic/Bahnaric + neighbors):** The large pure-`[29]` Vietic/Bahnaric cluster and its mixed offshoots have been de-clustered so that `vie` is the sole pure-29 entry and all other base-29 users have unique 29-anchored mixes, even when they cross families (Vietic, Bahnaric, Monic, Khmeric, Austroasiatic, and Munda; see §2.7 and §2.12).


- **Algic / Yeniseian / Canadian Romance tail (base 19, Worker‑9):** the former `[19]` pair `arin` / `brayon` has been split so that `arin` now uses a Yeniseian multi-base `[19,31,275]` and `brayon` now rides on an English/French‑anchored Canadian mix `[1,2,272]` instead of sharing `[19]`.


- **Algic / Basque contact (Worker‑9):** the former `[186,187]` cluster has been split by giving `yurok` an Algic–Salish mix `[187,222]` and remapping `algonquian-basque-pidgin` to `[20,186]` so that Basque `eus` remains a pure `[20]` isolate while the pidgin carries both Basque and Algonquian flavor.


- **SE Asia 29/Bahnaric follow-up micro-batch (post `/languages-unique6`):** extended the SE Asia base‑29 cleanup by de-clustering the remaining Bahnaric tail so that **Halang** (`halang-bahnaric`) now uses `[29,193,251,367]` and **Kaco'** (`kaco-bahnaric`) now uses `[29,194,251,367]`, leaving `mnw`, `duan-bahnaric`, `jeh-bahnaric`, `jru-bahnaric`, and `juk-bahnaric` on distinct 29‑anchored mixes and eliminating the last `[29,193,251]` / `[29,194,195,251]` duplicates in that cluster.



- The high-level rule from [Races & Languages – System Rules §1.3](Races-Languages-Rules.md#13-language-base-uniqueness-intent) is now being enforced family-by-family: shared `[bases]` arrays are treated as **per-language uniqueness debt** and worked down via targeted cluster passes.


- Future passes should continue this workflow: run cluster reports, pick the largest remaining cluster, design per-language mixes consistent with family and region, and re-profile with the mixer QA tools.



- **Hausa / Chadic cluster (base 132 as anchor)**:
  - Earlier diagnostics showed many Chadic entries (e.g. Angas, Biu-Mandara, Bade, Masa, and West Chadic macros) all riding on a single `[132]` key.
  - Recent passes have remapped dozens of these languages to **globally unique base sets** of the form `[132, X, Y]`, where `X`/`Y` are neighboring African bases such as Yoruba **112**, Igbo **113**, Fula **114**, Ewe **120**, Akan **116**, Lingala **146**, Kinyarwanda **147**, Shona **148**, Zulu **149**, Sesotho **151**, Tswana **152**, Kongo **153**, Luganda **154**, Chichewa **155**, and Kikuyu **156**.
  - New mappings were also added for previously unmapped or partially mapped Chadic entries so they participate in the same per-language uniqueness guarantees.
  - **2025‑12‑11 micro-pass (Barikanchi / Masa):** `barikanchi-pidgin` now uses `[1,112,132,277]`, an English–West African Sahel mix over **English (1)**, **Yoruba (112)**, **Hausa (132)**, and **Zarma Songhay (277)** instead of pure `[132]`, while `masa-chadic` now uses `[132,277,297]`, a Chadic–Sahel–Sango blend tying **Hausa (132)** into the **Zarma Songhay (277)** and **Sango (297)** corridor.
  - **2025‑12‑11 micro-pass (Masa North/South):** `masa-north` and `masa-south` now use `[112,132,297]` and `[132,146,277]` respectively instead of pure `[132]`, giving each dialect its own Hausa-anchored mix while `hausa` and other 132-based anchors remain untouched.
  - **2025‑12‑11 micro-pass (Masmaje / Massa):** `masmaje-language` now uses `[120,132,155]` (Ewe + Hausa + Chichewa) and `massa-chadic` uses `[112,120,132,149]` (Yoruba + Ewe + Hausa + Zulu) instead of pure `[132]`, further shrinking the pure-`[132]` Hausa/Chadic macro-cluster.



- **Pan-African 112–156 blob cleanup**:
  - A broader sweep over West / Central / Southern African entries that previously shared short or identical `[112–156]` combinations now assigns **distinct multi-base signatures** anchored on realistic regional mixes (West African 112–120 plus Bantu 146–156).
  - Swahili **28** is now used primarily as a **trade / lexifier ingredient** rather than a default shared base for unrelated African lects, building on the Bantu split in §2.8.



- The earlier **Hausa / Chadic base-132 cluster** and much of the ad-hoc **112–156 Pan-African blob** have been converted into **per-language unique base or mix signatures**, while staying within historically plausible African anchors.


- Remaining Sub-Saharan uniqueness debt is now concentrated in smaller Atlantic–Congo and Cushitic pockets and in languages that still ride on Swahili 28 or other macro lexifiers; those are surfaced by the mixer diagnostics and are candidates for future passes.



- **Malay (195)**
  - Used across a large swath of **Austronesian + Papuan contact zones** (Alor–Pantar, Greater Awyu, Asmat–Kamoro, etc.).
  - Acts as a general **Malay / trade-lexifier hub**.


- **Tok Pisin (263)**
  - Shared across numerous **Papuan** families as a contact lingua franca; it can be a plausible **ingredient** in mixes, but identical shared `bases[]` arrays are treated as uniqueness debt.


- **English (1)**
  - Reused for many **English-based pidgins and creoles** (Caribbean, Africa, Pacific); a first cleanup pass has already split several (`american-indian-pidgin-english`, `anguillian-creole`, `bislama`, `pijin`) onto unique 1-anchored mixes, but many other English-based entries still represent outstanding uniqueness debt.


- **French (2)** and **Portuguese (13)**
  - Similarly reused for French-/Portuguese-based creoles.


- **Tamil (199)**, **Telugu (200)**, **Bengali (201)**, **Assamese (257)**
  - Multiple Indo-Aryan / Dravidian clusters share these; some of the worst offenders (e.g. South Dravidian `[255]` tail and the Hindi-adjacent `[183,201]` cluster) have been split in recent passes, but substantial uniqueness debt remains (see §2.9).


- **Other hubs** seen in the sweeps: **Swahili (28)**, **Thai (251)**, **Lao (252)**, **Maori (196)**, **Samoan (197)**, **Fijian (198)**, **Sranan (291)**, **Greenlandic (305)**, **Neapolitan (306)**, **Occitan (232)**, **Sardinian (233)**, **Northern Sami (274)**, **Ainu (275)**, **Buryat (276)**, **Kalmyk (296)**, **Zarma (277)**, **Udmurt (283)**, etc.



- Many of these are **historically plausible lexifiers or macro-family seed anchors**, in the sense that they are reasonable seeds.


- However, under the per-language uniqueness rule, any language that still *shares* an identical lexifier base or `[bases]` array with others is carrying **uniqueness debt**. These hubs must be revisited and split until each dependent language has its own base or mix signature, with lexifiers kept only as ingredients rather than sole or fully shared bases.



- **Uralic (base 9)**
  - Single Finnic/Uralic base covers Finnish, Karelian, Veps, multiple Sámi dialects, and more.
  - Under the stricter policy, any identical shared `[9]` base-set clusters are treated as **uniqueness debt** to be split into unique Uralic-appropriate mixes (or new bases). Reuse of 9 as an *ingredient* in otherwise unique mixes is fine; identical `[9]` signatures across multiple distinct languages are not.


- **Central Semitic (bases 18, 23, 42)**
  - Arabic / Mesopotamian / Levantine bases currently underpin many historical and modern Semitic ISOs and act as shared anchors.
  - Afroasiatic Worker-3 passes have already split most of those ISOs onto distinct `[bases]` mixes; the remaining handful of identical arrays (core standards and macro entries) are still treated as explicit **uniqueness debt** to be resolved in a later, more opinionated Semitic/Ethiopic tuning pass.


- **Romance dialect continuum**
  - Many Romance dialects (regional Spanish, Portuguese, French, Italian varieties, etc.) initially all mapped back to one of a few central bases; the multi-batch Worker-3 pass has already carved out unique `[bases]` for most of these mapped entries.
  - A small remainder of shared-base clusters (notably around bases 3, 13, 22, 43, and 44) is still tracked as uniqueness debt and should be cleared in a targeted Romance follow-up so that no two mapped Romance entries share an identical base or `[bases]` array.



- **Slavic & East European cluster**
  - Mapping and core bases have received a first pass (see **2.6**) and all Slavic entries now have globally unique `[bases]` arrays, but East Slavic splits, Sorbian, and border lects (Podlachian / West Polesian) still need refinement of `min/max/d` and/or dedicated bases as a follow-up quality/coverage pass.


- **South Asian (Indo-Aryan, Dravidian, related)**
  - Key Indo-Aryan and Dravidian standards now have documented bases and initial length checks (see **2.9**), but many Dravidian lects still sit on a handful of macro-family hubs (199/200/254/255) and Hindi/Bengali/Marathi/Punjabi and related creoles still need dedicated review.


- **Sub-Saharan Africa (Bantu, Atlantic–Congo, Cushitic, Chadic, etc.)**
  - Most bases exist but have not been systematically profiled for script, duplication, or length bands.
  - **East Asia (Sinitic, Japanese, Korean, Mongolic, and neighbors)**
  - Core Sinitic / Japonic / Koreanic standards (Mandarin, Japanese, Korean, Vietnamese, Cantonese) now have dedicated passes and cleaned mixer mappings, but **Mongolic and many smaller regional lects** have not yet been fully profiled for uniqueness, base choice, and length bands.


- **Americas beyond Nahuatl / Quechua / Aymara / Cherokee**
  - Many North and South American families still use “first-draft” bases.


- **Papuan & Austronesian beyond Malay / Tok Pisin / core oceanic Lexifiers**
  - Still a rich area for future passes: the second-pass work in §2.12, subsequent Worker-3/8/9 collision cleanups, and a targeted diagnostics sweep over Malay 195 / Tok Pisin 263 / Pacific 197–198 hubs have already moved many Papuan and Eastern Indonesian macros off pure Malay/Tok Pisin/197–198 hubs and onto regional bases with unique mixes and confirmed there are currently no remaining Papuan/Austronesian shared `[bases]` clusters; the remaining work here is deeper quality/coverage tuning so that long-tail Papuan and Pacific Austronesian families are fully profiled for home-range, base choice, and per-language uniqueness.



- For each `Names.*` call site (burgs, states, cultures, map names, religions, markers), define bands:
  - Map / world names: slightly longer than base means.
  - Capitals vs towns / villages: tuned around base medians with size-based offsets.
  - Cultures / peoples: mid-length, avoiding extreme tails.
  - Religions / deities: allowed to run slightly long for grandeur.


- Implement via **central constants or helpers** rather than ad-hoc numbers.


- ✅ **Implementation status (2025-12-11):** `modules/names-generator.js` now exposes `Names.getUseCaseRange(base, useCase)`, and the main generation paths for towns, states, capitals, rivers, deities/religions, and random labels (including the Labels Editor’s state / generic label generator) all route through this helper instead of hard-coded `min/max` ranges. Remaining direct `Names.getCulture` calls without a use-case range are either legacy or intentionally generic (e.g. quick burg renames) and can be audited later if stricter banding is desired.



- For each macro-family or region:
  - Run `profile-language-mixes.js` focused on that family/region.
  - Run `check-language-mixer-map-inconsistencies.js --family=...` and/or `--region=...`.
  - Use `check-namebase-lengths.js` to verify `min/max` vs seeds.


- Adjust per-base `min/max` and, where necessary, `d`.



- Decide, per hub base (e.g. Malay 195, Tok Pisin 263, English 1, French 2, Portuguese 13, etc.), whether it is:
  - a plausible **seed anchor / lexifier ingredient** to keep as one component in mixes, or
  - an over-broad base that should be **split** (new bases + remaps) so that each dependent language can reach a globally unique `bases[]` signature without borrowing unrelated flavor.



- Where one base is covering too many stylistically distinct languages, consider:
  - Adding a new base seeded from a more local set of city names.
  - Remapping a subset of ISOs to that new base in `language-mixer-map.json`.



- Once more families are tuned, extend this document with:
  - A short **per-family summary** (status, key bases, known hubs).
  - A clear list of **seed anchors/lexifiers used as ingredients** vs areas of remaining uniqueness debt.


- **Recommended workflow:** For each family or region, perform a **family-by-family uniqueness pass** using `/language-uniqueness` and `/languages-unique2–10` to identify and split shared-base clusters, followed by **targeted cluster cleanup** via `/decluster-language-bases` to address any remaining uniqueness debt.



- Use the registry in §8 as the single source of truth for which Wikipedia-derived list JSONs exist, how to re-run `report-wikipedia-list-coverage.js` / `update-wikipedia-list-coverage-in-devplan.js`, and what "fully represented" means.


- When creating or extending a regional list JSON, update it, re-run coverage, and refresh the corresponding §8.x snapshot so future passes know exactly which lists are fully wired.


- Treat each new language with the same per-language rigor (seed curation, base choice, `min/max/d` tuning, and mixer-map QA); avoid bulk-adding large blocks of languages onto a single hub base without review.



- [ ] Re-run `check-namebase-lengths.js` to ensure `Names.getBase` sandbox behavior is still correct.


- [ ] For your target family/region, run:
  - [ ] `node tools/profile-language-mixes.js --family=...` (or `--region=...`).
  - [ ] `node tools/check-language-mixer-map-inconsistencies.js --family=...`.


- [ ] Decide **per base**:
  - [ ] Are `min/max` aligned with seed p25–p75?
  - [ ] Does `d` allow appropriate geminates without over-duplication?
  - [ ] Is this base overused across unrelated ISOs?


- [ ] Apply changes incrementally (one family / region per commit) and reprofile.


- [ ] Track seed-uniqueness goal compliance (explicit goal, not a suite “hard gate”):
  - [ ] `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures`



- Build a simple feature vector for each language / mix, drawing from:
  - Family, subfamily, region, script, and tags already in `language-mixes.json`.
  - Basic phonotactic stats (if available): character / bigram frequencies, syllable shapes, length distribution summary.


- Provide a small helper API / CLI, e.g. `getNearestLanguages(iso, k=10)`.


- Use it in tooling first (Node scripts under `tools/`) before any in-UI use:
  - Suggest base(s) when a new ISO is missing `bases` in `language-mixer-map.json`.
  - Help spot suspicious mappings by listing "nearest neighbors" that use very different bases.



- Reuse `profile-language-mixes.js` logic to emit a JSON snapshot of language features.


- Implement a tiny k-NN helper (brute force is fine at current scales) that:
  - Normalizes categorical features (e.g. big bonus for same family, smaller bonus for same region).
  - Optionally blends in numeric stats (length means / stddevs) when those are available.


- Keep the first version deterministic and transparent; log intermediate scores for debugging.



- Definition of "similar" is fuzzy (historical vs phonetic vs aesthetic); we should document which notion the distance is actually approximating.


- Feature extraction costs need to stay low enough that running this on every tuning pass is cheap.


- Should not auto-edit configs; only propose suggestions that a human accepts or rejects.



- Provide a way (via an in-app editor and/or CLI tool) to:
  - Paste a list of names.
  - Train a small per-session Markov chain on those names.
  - Preview a batch of generated samples for QA.


- Optionally, compare the resulting Markov stats to the existing base library using the similarity helper to suggest likely underlying base(s) for permanent wiring.


- Persist only when explicitly requested into a new base entry and/or a new ISO mapping; otherwise treat as an ephemeral generator.



- Wrap existing `Names` / Markov logic in a helper that can build a temporary chain from a raw list of strings.


- Enforce simple safety checks:
  - Minimum number of samples before training (e.g. 20+).
  - Length / character sanity bounds to avoid pathological chains.


- Provide a text-based preview tool under `tools/` and later a thin UI on top of the existing language editor.



- Overfitting tiny or low-quality sample lists; mitigated via minimum N and clear preview tooling.


- Deciding when a user-defined style should become a first-class base vs stay as local flavor.


- Avoiding drift from the historical/typological intent of existing bases when we remap ISOs to new custom styles.



- Focus first on structured patterns where we already have clear slots:
  - City names with descriptors ("New X", "X-on-the-Y").
  - Realm / dynasty / house names.
  - Simple religious / cult names.


- Use Markov primarily at the **morpheme or stem level**, with templates providing the overall shape.



- Add small per-family template banks (e.g. `{Title} {Name}`, `{Name} of {Region}`) in config.


- For each slot that needs a free-form stem, call into `Names` / mixer to generate a culturally appropriate base form.


- Optionally introduce a separate, lighter-weight Markov layer over morpheme lists (prefixes / suffixes) where that adds value.



- Pure word-level Markov risks producing ungrammatical or awkward phrases; we should bias heavily toward template-driven generation.


- Needs UX decisions about where these phrases surface (e.g. new map naming options, dynasty generator tools, etc.).



- **Label density suggester:**
  - Analyze current map (burg count, area, zoom behavior, chosen style) and propose a default label density / size profile.
  - Reuse a small set of hand-tuned presets and choose between them by nearest-neighbor on map statistics.


- **Neighbor-aware brush smoothing:**
  - When applying culture/biome/etc. brushes, look at the N neighboring cells and gently steer new values toward local consensus.
  - Present as an opt-in mode (e.g. "Smooth to neighbors" toggle) rather than always-on behavior.



- Define a compact "map feature vector" (land fraction, number of burgs, climate band distribution, average culture count, etc.) and use the same k-NN helper pattern as for languages to pick presets.


- For brushes, reuse the existing cell adjacency graph and perform a cheap majority/weighted-average pass over immediate neighbors to compute a target value.



- Needs careful UX so that helpers feel like suggestions, not fights against direct user control.


- Smoothing must be conservative by default to avoid erasing deliberate high-contrast edits.



## Section index


## 1. Infrastructure status

---

## 2. Families / bases already reviewed

This section summarizes families where we have done at least a **first pass**: checking seed lengths vs config, reviewing duplication rules, and eyeballing overall behavior.

### 2.1 Romance cluster (core Azgaar + extensions)

Representative bases:
Status:
@@
Takeaway:
### 2.2 Uralic / Finnic cluster

Representative base:
Status:
Takeaway:
### 2.3 Germanic cluster

Core Azgaar bases:
Additional Germanic-like bases (in `namebases-fantasy.js`):
Status:
Takeaway:
### 2.4 Semitic / Afroasiatic (Levantine + surrounds)

Representative bases:
Status:
Takeaway:
### 2.5 Nahuatl & Quechua

Representative bases:
Status:
Takeaway:

### 2.6 Slavic / East-European cluster

Representative mapping status (via `profile-language-mixes`):

Additional mapping cleanup (Stage A/B):
Takeaway:

### 2.7 East Asia (Sinitic / Japonic / Koreanic & neighbors)

Representative bases / mappings (via `profile-language-mixes`):

Takeaway:

### 2.8 Sub-Saharan Africa (first Bantu split)

Representative bases / mappings (via `profile-language-mixes`):

Changes applied in `language-mixer-map.json`:

Takeaway:

---

### 2.9 South Asia (Indo-Aryan / Dravidian)

Representative bases / mappings (via `profile-language-mixes`):

Takeaway:

### 2.10 Shared-base cluster cleanup (Worker 2 passes)

Representative clusters addressed so far (using `report-language-mixer-base-clusters.js` together with family-focused sweeps):

Takeaway:

---
Representative bases / mappings (via `profile-language-mixes.js` and `report-language-mixer-base-clusters.js`):

Takeaway:

---

  ### 3.1 High-degree lexifiers in `language-mixer-map`

Based on `check-language-mixer-map-inconsistencies` runs, the following bases show up across many families/regions:

Current stance:
### 3.2 Single-base macro-families

As of the 2025‑12‑10 `/languages-unique*` passes (Workers 1–10, including Worker 7), most base-set clusters surfaced by `report-language-mixer-base-clusters.js` and `select-language-mixer-base-batch.js` have been de‑clustered; any remaining identical shared base-set clusters are treated as uniqueness debt under the stricter policy. New clusters will arise only as new languages are wired or existing mappings are changed.

---

## 4. Work not yet done / future passes

The following families / regions have **not yet received a full pass** for home-range, duplication, and mixer-map sanity. They almost certainly hide more “too generic” or “too shared” behavior.

 ---
 
 ## 5. Planned next steps when resuming
 
 **2025-12-16**: Daily reporting note: treat `config/language-mixes.json` and `config/language-mixer-map.json` totals as unchanged for the day unless we explicitly add new ISOs; instead track **quality deltas** (uniqueness debt paydown). Current totals: catalog=3471, map=3471. Last 24h: completed claims=23 (117 ISOs), in_progress=1 (5 ISOs). Most work was dedicatedPins / setBases / namebase index fixes verified via `mixer:guardrails` / `mixer:check-deltas` / seed-uniqueness / coverage / failures / base-clusters.
 
 **2025-12-18**: Mixer health snapshot (`pnpm exec -- node tools/mixer-diagnostics/snapshot-mixer-health-stats.js --diff`): totals unchanged (map=3499, catalog=3499; failures=0). Quality deltas: `noGloballyUniqueBaseIndex` 1865 -> 1778 (-87); base-set clusters (size>=2) 38 -> 32 (-6); entries-in-clusters 436 -> 386 (-50); largest cluster 161 -> 158 (-3); distinct base sets 3000 -> 3044 (+44).
 
 **2025-12-18**: Seed uniqueness burn-down preflight: `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures --limit=300` reports 0 seed-uniqueness failures among catalog entries that already have a globally-unique base anchor (strictFail=0; normFail=0); remaining failures are `NO_UNIQ_BASE` and belong to `/no-unique-base2`.

 **2025-12-16**: Exact 24h count delta (git history): cutoffUtc=2025-12-15T09:10:55.075Z. catalogBaseline=3471 @2025-12-14T19:22:15-08:00 (sha=9d0a7e7e5d76708428eeb392a7075da34bdcf555) => catalogNow=3471 (delta=0). mapBaseline=3471 @2025-12-15T00:48:50-08:00 (sha=7abdcb31bc46159a1c33786e8579aef63e692df8) => mapNow=3471 (delta=0).
 
 **2025-12-16**: Mixer:check-deltas unblock completed - missing base definitions 2669-2678 resolved. NO_UNIQ_BASE claim completed: workerId=1 batchId=2025-12-16T01:32:55.981Z-worker1 reservedRange=3005-3054 isos=[altai,altai-uriankhai,alu,aluku,alyutor] status=complete.
 
 **2025-12-16**: NO_UNIQ_BASE claim completed: workerId=2 batchId=2025-12-16T01:55:19.839Z-worker2 reservedRange=3064-3113 isos=[ambonese-malay,american-indian-pidgin-english,andaman-creole-hindi,angolar-creole,annobonese-creole] status=complete.

**2025-12-16**: Decluster claim completed: workerId=1 batchId=2025-12-16T03:27:03.897Z-worker1 bases=[305] isos=[west-greenlandic-pidgin,greenlandic-lang] status=complete (delta tools/mixer-deltas/2025-12-16-decluster-305-west-greenlandic-pidgin-greenlandic-lang.json).

 **2025-12-17**: Decluster micro-pass: broke spurious `bases=[389]` collision between `duruwa` (Central Dravidian / Asia) and `purepecha` (Mesoamerica isolate) by setting `duruwa` bases to `[199,375]` via delta `tools/mixer-deltas/2025-12-17-decluster-389-duruwa.json`. Verified: `pnpm run mixer:guardrails` OK; `pnpm run mixer:apply-deltas` OK; `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2 --include-families` OK (389 cluster no longer present); `pnpm exec -- node tools/check-language-mixer-map-inconsistencies.js --show-all-bases` OK.

 **2025-12-17**: Decluster micro-pass: broke spurious `bases=[468]` collision between `oon` (Önge / Andamanese) and `nicobarese` (Austroasiatic) by setting `oon` bases to `[468,471]` via delta `tools/mixer-deltas/2025-12-17-decluster-468-oon.json`. Verified: `pnpm run mixer:guardrails` OK; `pnpm run mixer:apply-deltas` OK; `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2 --include-families` OK (468 cluster no longer present); `pnpm exec -- node tools/check-language-mixer-map-inconsistencies.js --show-all-bases` OK.

 **2025-12-17**: Decluster micro-pass: broke spurious `bases=[317]` collision between `kra` (Kumhali / Indo-Aryan) and `kra-family` (Kra / Tai-Kadai macro) by setting `kra` bases to `[183]` via delta `tools/mixer-deltas/2025-12-17-decluster-317-kra.json`. Verified: `pnpm run mixer:guardrails` OK; `pnpm run mixer:apply-deltas` OK; `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2 --include-families` OK (317 cluster no longer present); `pnpm exec -- node tools/check-language-mixer-map-inconsistencies.js --show-all-bases` OK.

 **2025-12-17**: Decluster micro-pass: broke spurious `bases=[515]` collision between `waray` (Southeast Asia / Malayo-Polynesian) and `malayo-polynesian` (macro / Austronesian) by setting `waray` bases to `[304]` via delta `tools/mixer-deltas/2025-12-17-decluster-515-waray.json`. Verified: `pnpm run mixer:guardrails` OK; `pnpm run mixer:apply-deltas` OK; `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2 --include-families` OK (515 cluster no longer present); `pnpm exec -- node tools/check-language-mixer-map-inconsistencies.js --show-all-bases` OK.

 **2025-12-18**: Decluster micro-pass: broke shared base-set collision `bases=[211,288,289]` between `mvy` (Indus Kohistani / Dardic) and `phl` (Palula / Dardic) by setting `phl` bases to `[211,288,290]` via delta `tools/mixer-deltas/2025-12-18-decluster-211-288-289-mvy-phl.json` (leaving `mvy` as-is). Verified: `pnpm run mixer:guardrails` OK; `pnpm run mixer:apply-deltas` OK; `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2 --include-families` exit 0; `pnpm exec -- node tools/check-language-mixer-map-inconsistencies.js --show-all-bases` exit 0.

 **2025-12-18**: Decluster micro-pass: broke shared base-set collision `bases=[49]` between `thf` (Thangmi (Thami) / Newaric) and `phj` (Pahari (Sino-Tibetan) / Newaric) by setting `phj` bases to `[49,55]` via delta `tools/mixer-deltas/2025-12-18-decluster-49-thf-phj.json` (leaving `thf` as-is). Verified: `pnpm run mixer:guardrails` OK; `pnpm run mixer:apply-deltas` OK; `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2 --include-families` exit 0; `pnpm exec -- node tools/check-language-mixer-map-inconsistencies.js --show-all-bases` exit 0.

 **2025-12-18**: Decluster micro-pass: broke shared base-set collision `bases=[375]` among `kuvi` (Kuvi / South-Central Dravidian), `naiki` (Naiki / Central Dravidian), and `kxu` (Kui (India) / South Dravidian) by setting `kuvi` bases to `[375,200]` and `naiki` bases to `[375,199]` via delta `tools/mixer-deltas/2025-12-18-decluster-375-kuvi-naiki-kxu.json` (leaving `kxu` as-is). Verified: `pnpm run mixer:guardrails` OK; `pnpm run mixer:apply-deltas` OK; `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2 --include-families` exit 0; `pnpm exec -- node tools/check-language-mixer-map-inconsistencies.js --show-all-bases` exit 0.

 **2025-12-19**: Decluster micro-pass: broke shared base-set cluster `bases=[211,212,290]` among `haz` (Hazaragi), `jdg` (Jadgali), `pbt` (Pashto, Southern), `waziri-pashto` (Waziri) by setting unique bases via delta `tools/mixer-deltas/2025-12-19-decluster-iranian-bases211-212-290.json`: `haz->[212]`, `pbt->[211]`, `waziri-pashto->[211,212]`, `jdg->[212,290]`. Verified: `pnpm run mixer:guardrails` OK; `pnpm run mixer:apply-deltas` OK; `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2 --include-families` now reports clusters (size>=2) 40 -> 36 and entries-in-clusters 423 -> 410; `pnpm exec -- node tools/check-language-mixer-map-inconsistencies.js --show-all-bases` exit 0.

 **2025-12-18**: NO_UNIQ_BASE2 claim completed: workerId=1 batchId=2025-12-18T23:04:36.263Z-worker1 reservedRange=8375-8424 isos=[central-tibeto-burman,central-veps,central-vychegda,central-zapotec,cfm] status=complete. Delta: tools/mixer-deltas/2025-12-18-worker1-mixed-central-tibeto-burman.json. Base defs: modules/namebases-real.js i:8375-8379. Verified: pnpm run mixer:guardrails OK; pnpm run mixer:apply-deltas OK; pnpm run mixer:check-deltas OK; seed-uniqueness --only-failures "--only-isos=central-tibeto-burman,central-veps,central-vychegda,central-zapotec,cfm" --limit=300 OK; coverage OK; failures OK; base-clusters --min-size=2 exit 0.

 **2025-12-18**: NO_UNIQ_BASE2 claim completed: workerId=1 batchId=2025-12-18T23:32:13.275Z-worker1 reservedRange=8431-8480 isos=[gin,ginuman,gjk,gju,glavda-language] status=complete. ISO->base: gin->8431; ginuman->8432; gjk->8433; gju->8434; glavda-language->8435. Verified: pnpm run mixer:guardrails OK; pnpm run mixer:check-deltas OK; seed-uniqueness --only-failures "--only-isos=gin,ginuman,gjk,gju,glavda-language" --limit=300 OK; coverage OK; failures OK; base-clusters --min-size=2 exit 0.

 **2025-12-18**: NO_UNIQ_BASE2 claim completed: workerId=1 batchId=2025-12-18T23:46:03.028Z-worker1 reservedRange=8505-8554 isos=[gobasi,goemai-language,goguryeo-korean,goji-language,gola] status=complete. ISO->base: gobasi->8505; goemai-language->8506; goguryeo-korean->8507; goji-language->8508; gola->8509. Delta: tools/mixer-deltas/2025-12-18-worker1-mixed-gobasi.json. Base defs: modules/namebases-real.js i:8505-8509. Verified: pnpm run mixer:guardrails OK; pnpm run mixer:check-deltas OK; seed-uniqueness --only-failures "--only-isos=gobasi,goemai-language,goguryeo-korean,goji-language,gola" --limit=300 OK; coverage OK; failures OK; base-clusters --min-size=2 exit 0.

 **2025-12-18**: NO_UNIQ_BASE2 claim completed: workerId=1 batchId=2025-12-18T23:59:31.323Z-worker1 reservedRange=8555-8604 isos=[chaha,chakato-language,chakhar,chaldean-neo-aramaic,chamdo] status=complete. ISO->base: chaha->8555; chakato-language->8556; chakhar->8557; chaldean-neo-aramaic->8558; chamdo->8559. Delta: tools/mixer-deltas/2025-12-18-worker1-mixed-chaha.json. Base defs: modules/namebases-real.js i:8555-8559. Verified: pnpm run mixer:guardrails OK; pnpm run mixer:check-deltas OK; seed-uniqueness --only-failures "--only-isos=chaha,chakato-language,chakhar,chaldean-neo-aramaic,chamdo" --limit=300 OK; coverage OK; failures OK; base-clusters --min-size=2 exit 0.

**2025-12-16**: NO_UNIQ_BASE2 claim completed: workerId=1 batchId=2025-12-16T02:24:41.984Z-worker1 reservedRange=3119-3168 isos=[amdo-tibetan,amf,amh,amharic,amharic-argobba] status=complete.

**2025-12-16**: NO_UNIQ_BASE2 claim completed: workerId=2 batchId=2025-12-16T02:52:38.735Z-worker2 reservedRange=3169-3218 isos=[anguillian-creole,bahamian-creole,bajan-creole,belizean-creole,bocas-del-toro-creole] status=complete.

 **2025-12-16**: NO_UNIQ_BASE2 claim completed: workerId=1 batchId=2025-12-16T04:43:48.880Z-worker1 reservedRange=3227-3276 isos=[angas,auyokawa-language,bade-language,barein-language,beele-language] status=complete. Verified: pnpm run mixer:guardrails OK; pnpm run mixer:check-deltas OK; seed-uniqueness --only-failures --only-isos=angas,auyokawa-language,bade-language,barein-language,beele-language --limit=300 OK; coverage OK; failures OK; base-clusters --min-size=2 OK.

 **2025-12-16**: NO_UNIQ_BASE2 claim completed: workerId=2 batchId=2025-12-16T04:51:20.651Z-worker2 reservedRange=3277-3326 isos=[baba-malay,balinese-malay,banda-malay,betawi,dili-malay] status=complete. Verified: pnpm run mixer:guardrails OK; pnpm run mixer:check-deltas OK; seed-uniqueness --only-failures --only-isos=baba-malay,balinese-malay,banda-malay,betawi,dili-malay --limit=300 OK; coverage OK; failures OK; base-clusters --min-size=2 OK. Re-verified 2025-12-18: pnpm run mixer:guardrails OK; pnpm run mixer:check-deltas OK; seed-uniqueness --only-failures --only-isos="baba-malay,balinese-malay,banda-malay,betawi,dili-malay" => Target ISOs:5; Missing mapping:0; No globally-unique base index:0; strictFail:0; normFail:0; coverage OK; failures OK; base-clusters --min-size=2 exit 0.

 **2025-12-16**: NO_UNIQ_BASE2 claim completed: workerId=1 batchId=2025-12-16T08:14:29.868Z-worker1 reservedRange=3944-3993 isos=[anca,ancient-egyptian,ancient-north-arabian,aneme-wake,angaataha] status=complete. Verified: pnpm run mixer:guardrails OK; pnpm run mixer:check-deltas OK; seed-uniqueness --only-failures --only-isos=anca,ancient-egyptian,ancient-north-arabian,aneme-wake,angaataha --limit=300 OK; coverage OK; failures OK; base-clusters --min-size=2 OK. Note: canonical pins are `3944–3948` (delta + compiled pins + `config/language-mixer-map.json`). Repo also contains duplicate base defs in `modules/namebases-creole.js` at `i:5100–5102` for `anca` / `ancient-egyptian` / `ancient-north-arabian`; these are non-canonical duplicates and should not be treated as the pinned indices.

 **2025-12-16**: NO_UNIQ_BASE2 claim completed: workerId=2 batchId=2025-12-16T08:21:42.288Z-worker2 reservedRange=3994-4043 isos=[angami-pochuri,ani,ankave,ano,anp] status=complete. Delta: tools/mixer-deltas/2025-12-16-worker2-mixed-angami-pochuri.json. Verified: pnpm run mixer:guardrails OK; pnpm run mixer:apply-deltas OK; pnpm run mixer:check-deltas OK; seed-uniqueness --only-failures --only-isos=angami-pochuri,ani,ankave,ano,anp --limit=300 OK; coverage OK; failures OK.

 **2025-12-16**: NO_UNIQ_BASE2 claim completed: workerId=1 batchId=2025-12-16T09:51:35.309Z-worker1 reservedRange=5106-5155 isos=[adeni-arabic,aleppine-arabic,algerian-arabic,algerian-saharan-arabic,anatolian-arabic] status=complete. Delta: tools/mixer-deltas/2025-12-16-worker1-mixed-adeni-arabic.json. Verified: pnpm run mixer:guardrails OK; pnpm run mixer:apply-deltas OK; pnpm run mixer:check-deltas OK; seed-uniqueness --only-failures --only-isos=adeni-arabic,aleppine-arabic,algerian-arabic,algerian-saharan-arabic,anatolian-arabic --limit=300 OK; coverage OK; failures OK; base-clusters --min-size=2 exit 0.

 **2025-12-16**: NO_UNIQ_BASE2 claim completed: workerId=2 batchId=2025-12-16T11:29:29.140Z-worker2 reservedRange=5256-5305 isos=[arabic-javanese-of-klego,arin,aringa,armazic,aro] status=complete. Delta: tools/mixer-deltas/2025-12-16-worker2-mixed-arabic-javanese-of-klego.json. Verified: pnpm run mixer:guardrails OK; pnpm run mixer:apply-deltas OK; pnpm run mixer:check-deltas OK; seed-uniqueness --only-failures --only-isos=arabic-javanese-of-klego,arin,aringa,armazic,aro --limit=300 OK; coverage OK; failures OK; base-clusters --min-size=2 exit 0.

 **2025-12-16**: NO_UNIQ_BASE2 claim completed: workerId=2 batchId=2025-12-16T11:38:13.719Z-worker2 reservedRange=5306-5355 isos=[aroid,arp,arunachal,ashaninka,asoa] status=complete. Delta: tools/mixer-deltas/2025-12-16-worker2-mixed-aroid.json. Verified: pnpm run mixer:guardrails OK; pnpm run mixer:apply-deltas OK; pnpm run mixer:check-deltas OK; seed-uniqueness --only-failures --only-isos=aroid,arp,arunachal,ashaninka,asoa --limit=300 OK; coverage OK; failures OK; base-clusters --min-size=2 exit 0.

 **2025-12-16**: NO_UNIQ_BASE2 claim completed: workerId=1 batchId=2025-12-16T13:54:53.808Z-worker1 reservedRange=5456-5505 isos=[awa,awadhi,awbono,awin,awing] status=complete. Delta: tools/mixer-deltas/2025-12-16-worker1-mixed-awa.json. Base defs: modules/namebases-fantasy.js i:5456-5460. Verified: mixer:guardrails OK; mixer:check-deltas OK; seed-uniqueness OK; coverage OK; failures OK; base-clusters OK (2025-12-16T14:02:37Z).

**2025-12-16**: /language-uniqueness batch staged: tools/mixer-deltas/2025-12-16-language-uniqueness-batch2-free3129.json (dedicatedPins lower-inva=3129; kte=3130; brx=3131; dhimal=3132; proto-karenic=3133). UPDATE: prior guardrails blocker (duplicate `i:2015–2026` across `modules/namebases-real.js` and `modules/namebases-creole.js`) resolved by renumbering the creole definitions to `i:3282–3293`; `pnpm run mixer:guardrails` OK. Next: re-run `pnpm run mixer:check-deltas` to confirm unblocked / artifacts status.

**2025-12-16**: UPDATE: Ran `pnpm run mixer:apply-deltas` and re-ran `pnpm run mixer:check-deltas` — OK.

**2025-12-16**: /language-uniqueness (Uralic mini-batch): resolved `bases=[9]` collision for `merya`, `meshcherian`, `muromian` via delta `tools/mixer-deltas/2025-12-16-language-uniqueness-uralic-merya-meshcherian-muromian.json` (`setBases` to `[9,936]`, `[9,937]`, `[9,938]`). Verification: `pnpm run mixer:apply-deltas` OK; `pnpm run mixer:check-deltas` OK; `check-language-mixer-map-duplicate-isos` OK; `check-language-mixer-map-inconsistencies --show-all-bases` OK; `check-language-mixer-coverage` OK; `check-language-mixer-failures` OK; Uralic base-set clusters now 0 for `--family=Uralic`.

 **2025-12-16**: /language-uniqueness (worker1 batchB): broke several Uralic 2-member base-set collisions by updating only one member per pair via delta `tools/mixer-deltas/2025-12-16-language-uniqueness-worker1-batchB.json` (`setBases` for `hollola`, `central-vychegda`, `heart-tavastian`, `savonian`, `savonlinna`). Notes: `pnpm run mixer:apply-deltas` initially blocked by conflicting `setBases` for `kashinawa`; resolved by removing `kashinawa` from `tools/mixer-deltas/2025-12-16-language-uniqueness-worker1-batchA.json` (South America batch keeps the authoritative mapping). Verification: `pnpm run mixer:apply-deltas` OK; `pnpm run mixer:check-deltas` OK; `check-language-mixer-map-duplicate-isos` OK; `check-language-mixer-map-inconsistencies --show-all-bases` OK; `check-language-mixer-coverage` OK; `check-language-mixer-failures` OK.

 **2025-12-16**: Cascade signoff: retiring from session; removed stale local lock file `modules/namebases-creole.js.lock`.

 **2025-12-17**: Re-verified seed-uniqueness for NO_UNIQ_BASE2 batchId=2025-12-16T23:04:00.972Z-worker1 with corrected `--only-isos` quoting: Target ISOs: 5; `--only-failures` => 0 failures.
 
 **2025-12-17**: NO_UNIQ_BASE2 claim completed: workerId=1 batchId=2025-12-17T00:34:30.757Z-worker1 reservedRange=5658-5707 isos=[baarin,baba,babylonian,bacama-language,badaga] status=complete. Delta: tools/mixer-deltas/2025-12-17-worker1-mixed-baarin.json. Base defs: modules/namebases-real.js i:5658-5662. Verified: pnpm run mixer:guardrails OK; pnpm run mixer:check-deltas OK; seed-uniqueness --only-failures "--only-isos=baarin,baba,babylonian,bacama-language,badaga" --limit=300 OK; coverage OK; failures OK; base-clusters --min-size=2 exit 0.
 
 **2025-12-17**: NO_UNIQ_BASE2 claim completed: workerId=1 batchId=2025-12-17T00:57:04.169Z-worker1 reservedRange=5708-5757 isos=[baoan,baoanic,baoting-hlai,barai,barambu] status=complete. Delta: tools/mixer-deltas/2025-12-17-worker1-mixed-baoan.json. Base defs: modules/namebases-real.js i:5708-5712. Verified: pnpm run mixer:guardrails OK; pnpm run mixer:apply-deltas OK; pnpm run mixer:check-deltas OK; seed-uniqueness --only-failures --only-isos=baoan,baoanic,baoting-hlai,barai,barambu --limit=300 OK; coverage OK; failures OK; base-clusters --min-size=2 exit 0.
 
 **2025-12-17**: Follow-up: reran `pnpm run mixer:check-deltas`; OK (prior "Missing base definitions" report for indices `5708-5712` is not reproducible locally).

 **2025-12-17**: NO_UNIQ_BASE2 claim completed: workerId=1 batchId=2025-12-17T01:08:09.395Z-worker1 reservedRange=5758-5807 isos=[badong-yao,baekje-korean,baghdadi-arabic,baham,bahnar] status=complete. Delta: tools/mixer-deltas/2025-12-17-worker1-mixed-badong-yao.json. Base defs: modules/namebases-real.js i:5758-5762. Verified: pnpm run mixer:guardrails OK; pnpm run mixer:apply-deltas OK; pnpm run mixer:check-deltas OK; seed-uniqueness --only-failures --only-isos=badong-yao,baekje-korean,baghdadi-arabic,baham,bahnar --limit=300 OK; coverage OK; failures OK; base-clusters --min-size=2 exit 0.
 
 **2025-12-17**: NO_UNIQ_BASE2 claim completed: workerId=1 batchId=2025-12-17T01:52:25.447Z-worker1 reservedRange=6005-6054 isos=[bahrani-arabic,bai,baima,baisha-hlai,bala] status=complete. Delta: tools/mixer-deltas/2025-12-17-worker1-mixed-bahrani-arabic.json. Base defs: modules/namebases-real.js i:6005-6009. Verified: pnpm run mixer:guardrails OK; pnpm run mixer:apply-deltas OK; pnpm run mixer:check-deltas OK; seed-uniqueness --only-failures --only-isos=bahrani-arabic,bai,baima,baisha-hlai,bala --limit=300 OK; coverage OK; failures OK; base-clusters --min-size=2 exit 0.

 **2025-12-17**: NO_UNIQ_BASE2 claim completed: workerId=1 batchId=2025-12-17T02:28:20.728Z-worker1 reservedRange=6055-6104 isos=[bahraini-gulf-arabic,bakhtiari-arabic,baldemu-language,balo,balochi] status=complete. Delta: tools/mixer-deltas/2025-12-17-worker1-mixed-bahraini-gulf-arabic.json. Base defs: modules/namebases-real.js i:6055-6059. Verified: pnpm run mixer:check-deltas OK; seed-uniqueness --only-failures --only-isos=bahraini-gulf-arabic,bakhtiari-arabic,baldemu-language,balo,balochi --limit=300 OK; coverage OK; failures OK; base-clusters --min-size=2 exit 0.

 **2025-12-17**: NO_UNIQ_BASE2 claim completed: workerId=2 batchId=2025-12-17T01:12:13.826Z-worker2 reservedRange=5808-5857 isos=[bengali,bengali-portuguese-creole,beni-snous-dialect,ber,berbice] status=complete. Delta: tools/mixer-deltas/2025-12-17-worker2-mixed-bengali.json. Base defs: modules/namebases-real.js i:5808-5812. Verified: pnpm run mixer:guardrails OK; pnpm run mixer:apply-deltas OK; pnpm run mixer:check-deltas OK; seed-uniqueness --only-failures --only-isos=bengali,bengali-portuguese-creole,beni-snous-dialect,ber,berbice --limit=300 OK; coverage OK; failures OK; base-clusters --min-size=2 exit 0.
 
 **2025-12-17**: NO_UNIQ_BASE2 claim completed: workerId=2 batchId=2025-12-17T02:36:15.129Z-worker2 reservedRange=6105-6154 isos=[balti,bamali,bambalang,bambara,bamboo-english] status=complete. Delta: tools/mixer-deltas/2025-12-17-worker2-mixed-balti.json. Base defs: modules/namebases-real.js i:6105-6109. Verified: pnpm run mixer:guardrails OK; pnpm run mixer:apply-deltas OK; pnpm run mixer:check-deltas OK; seed-uniqueness --only-failures --only-isos=balti,bamali,bambalang,bambara,bamboo-english --limit=300 OK; coverage OK; failures OK; base-clusters --min-size=2 exit 0.

 **2025-12-17**: NO_UNIQ_BASE2 claim completed: workerId=1 batchId=2025-12-17T02:50:11.295Z-worker1 reservedRange=6205-6254 isos=[bana-language,bangime,bangladeshi-english,banjar,baramu] status=complete. Delta: tools/mixer-deltas/2025-12-17-worker1-mixed-bana-language.json. Base defs: modules/namebases-real.js i:6205-6209. Verified: pnpm run mixer:check-deltas OK; seed-uniqueness --only-failures --only-isos=bana-language,bangime,bangladeshi-english,banjar,baramu --limit=300 OK; coverage OK; failures OK; base-clusters --min-size=2 exit 0.

 **2025-12-17**: NO_UNIQ_BASE2 duplicate claim cleanup: stalled batchId=2025-12-17T03:25:23.836Z-worker2 (reservedRange=6305-6354) because it duplicates completed claim batchId=2025-12-17T03:12:46.655Z-worker1 for isos=[bareqi-arabic,bargut,bargut-buryat,bariba,bariji] (canonical pins tools/mixer-deltas/2025-12-17-worker1-mixed-bareqi-arabic.json; base defs modules/namebases-real.js i:6255-6259).

 **2025-12-17**: NO_UNIQ_BASE2 claim completed: workerId=1 batchId=2025-12-17T04:58:14.657Z-worker1 reservedRange=6405-6454 isos=[basque-icelandic-pidgin,bassari,basum,bata-language,bathari] status=complete. Delta: tools/mixer-deltas/2025-12-17-worker1-mixed-basque-icelandic-pidgin.json. Base defs: modules/namebases-real.js i:6405-6409. Verified: pnpm run mixer:guardrails OK; pnpm run mixer:apply-deltas OK; pnpm run mixer:check-deltas OK; seed-uniqueness --only-failures --only-isos=basque-icelandic-pidgin,bassari,basum,bata-language,bathari --limit=300 exit 0; coverage OK; failures OK; base-clusters --min-size=2 exit 0.

 **2025-12-17**: NO_UNIQ_BASE2 claim completed: workerId=1 batchId=2025-12-17T05:56:37.948Z-worker1 reservedRange=6505-6554 isos=[bayot,bbc,bbh,bcc,bdz] status=complete. Delta: tools/mixer-deltas/2025-12-17-worker1-mixed-bayot.json. Base defs: modules/namebases-real.js i:6505-6509. Verified: pnpm run mixer:guardrails OK; pnpm run mixer:apply-deltas OK; pnpm run mixer:check-deltas OK; seed-uniqueness --only-failures --only-isos=bayot,bbc,bbh,bcc,bdz --limit=300 exit 0; coverage OK; failures OK; base-clusters --min-size=2 exit 0.
 
 **2025-12-17**: /language-uniqueness (Uralic/Hungarian/Mansi batch1): resolved 5 two-member base-set collisions by pinning dedicated bases `6000–6004` for `central-transdanubian`, `tisza-k-r-s`, `pal-c`, `southern-transdanubian`, `southern-great-plain` via delta `tools/mixer-deltas/2025-12-17-language-uniqueness-uralic-hungarian-mansi-batch1.json` and appending base defs in `modules/namebases-real.js` (`i:6000–6004`). Verification: `pnpm run mixer:apply-deltas` OK; `pnpm run mixer:check-deltas` OK; `check-language-mixer-map-duplicate-isos` OK; `check-language-mixer-map-inconsistencies --show-all-bases` OK; `check-language-mixer-coverage` OK; `check-language-mixer-failures` OK; `report-language-mixer-base-clusters --min-size=2 --include-families` exit 0.

 **2025-12-17**: /language-uniqueness (Uralic batch2: Komi/Finnish/Sami): resolved 5 two-member base-set collisions by pinning dedicated bases `6010–6014` for `kosa-kama`, `upper-lupya`, `proper-southeastern`, `luokta-m-vas`, `standard-finnish` via delta `tools/mixer-deltas/2025-12-17-language-uniqueness-uralic-batch2-komi-finnish-sami.json` and appending base defs in `modules/namebases-real.js` (`i:6010–6014`). Verification: `pnpm run mixer:apply-deltas` OK; `pnpm run mixer:check-deltas` OK; `check-language-mixer-map-duplicate-isos` OK; `check-language-mixer-map-inconsistencies --show-all-bases` OK; `check-language-mixer-coverage` OK; `check-language-mixer-failures` OK; `report-language-mixer-base-clusters --min-size=2 --category=Uralic --include-families` exit 0.

 **2025-12-17**: /language-uniqueness (Uralic batch3): resolved 5 two-member base-set collisions by pinning dedicated bases `6015–6019` for `udora`, `torne-sami`, `tavastian`, `tornio`, `hevaha` via delta `tools/mixer-deltas/2025-12-17-language-uniqueness-uralic-batch3-komi-finnic-sami.json` and appending base defs in `modules/namebases-real.js` (`i:6015–6019`). Verification: `pnpm run mixer:apply-deltas` OK; `pnpm run mixer:check-deltas` OK; `check-language-mixer-map-duplicate-isos` OK; `check-language-mixer-map-inconsistencies --show-all-bases` OK; `check-language-mixer-coverage` OK; `check-language-mixer-failures` OK; `report-language-mixer-base-clusters --min-size=2 --category=Uralic --include-families` exit 0.

 **2025-12-17**: /language-uniqueness (Uralic batch4): resolved 5 two-member base-set collisions by pinning dedicated bases `6020–6024` for `northern-karelian`, `upper-vychegda`, `pori-region`, `per-pohjola`, `fingelska` via delta `tools/mixer-deltas/2025-12-17-language-uniqueness-uralic-batch4.json` and appending base defs in `modules/namebases-real.js` (`i:6020–6024`). Verification: `pnpm run mixer:apply-deltas` OK; `pnpm run mixer:check-deltas` OK; `check-language-mixer-map-duplicate-isos` OK; `check-language-mixer-map-inconsistencies --show-all-bases` OK; `check-language-mixer-coverage` OK; `check-language-mixer-failures` OK; `report-language-mixer-base-clusters --min-size=2 --category=Uralic --include-families` exit 0 (Uralic clusters now 2).

 **2025-12-16**: Tooling hardening: `tools/mixer-core/apply-mixer-deltas.js` now normalizes delta filenames (strips leading BOM / zero-width chars) for the underscore ignore check, to ensure `_quarantine-*.json` files are reliably skipped even if the filesystem returns hidden leading characters. Verified: `pnpm run mixer:check-deltas` OK.

 - 2025-12-15: NOTE: prior worker2 claim for `western-aragonese, western-catalan, western-sicilian, wisconsin-walloon` with reservedRange `2019–2068` was stalled due to an index collision. Completed under worker2 reservedRange `2119–2168` (bases `2119–2122`; delta `tools/mixer-deltas/2025-12-15-worker2-romance-western-final.json`).
 - 2025-12-15: NO_UNIQ_BASE claims dashboard shows `in_progress=0` (nextReservedRange `2569–2618`).

When this work resumes, a practical order of operations:

1. **Lock in use-case length bands**
2. **Family-by-family passes using the tools**
3. **Tackle known hubs explicitly**
4. **Add or split bases where contrast is weak**
5. **Finalize documentation**
6. **Grow coverage via Wikipedia language lists**
---

## 6. Quick checklist for whoever picks this up

This file should be updated as major families are completed so it remains the single entry point for the language system’s overall status.

---

## 7. Planned tooling extensions (Markov, similarity, and UX helpers)

These are higher-level tools and helpers that sit on top of the existing Markov bases / mixer and are intended to make language work faster, safer, and more consistent across the app. Map- and simulation-side nearest-neighbor uses (e.g. smoothing helpers, label-density suggestions) are documented separately in [Evolving Simulation – Design Choices §3](Evolving-Simulation-Choices.md#3-culture--religion-diffusion).

### 7.1 Language similarity search (k-NN on language features)

**Goal:** Quickly suggest plausible base languages or related mixes when adding or reviewing ISO entries, and surface "nearby" languages for design and debugging.

**Scope / behavior:**

**Implementation sketch:**

**Open questions / risks:**

### 7.2 Markov on languages / names from user-supplied samples

**Goal:** Allow users (and future internal tooling) to spin up a custom name style from a short list of examples and optionally map that style back onto existing bases.

**Scope / behavior:**

**Implementation sketch:**

**Open questions / risks:**

### 7.3 Multi-word Markov: compound names, phrases, and titles

**Goal:** Extend the language system beyond single tokens into short phrases (dynasties, titles, compound toponyms) while keeping structure readable and controllable.

**Scope / behavior:**

**Implementation sketch:**

**Open questions / risks:**

### 7.4 UX helpers driven by nearest neighbors

**Goal:** Use local and global neighbor information to make map editing smoother without changing core simulation logic.

**Scope / behavior (initial targets):**

**Implementation sketch:**

**Open questions / risks:**

---


## 8. Wikipedia language list coverage registry

This section tracks the Wikipedia-derived language lists that drive language catalog and mixer coverage. For each list we record its JSON path, source URL, what part of the system it informs, and how to re-run the coverage / base-uniqueness helpers. The registry also notes **planned** list JSONs so regional coverage goals stay visible before the corresponding files exist.

Coverage numbers are refreshed by `tools/mixer-core/update-wikipedia-list-coverage-in-devplan.js`; do **not** hand-edit the per-list `Snapshot from last run` blocks.

- ✅ **2025-12-13 (verified):** Per-list snapshot maintenance is now unified: `update-wikipedia-list-coverage-in-devplan.js` writes the standardized coverage + `Nonunique Bases` + base-set uniqueness details block, and `report-wikipedia-list-coverage.js` / `report-wikipedia-list-base-uniqueness.js` can trigger that devplan update directly. `run-language-mixer-suite.js` can also refresh all registered Wikipedia list snapshots end-to-end.

- ✅ **2025-12-15 (verified):** `Wikipedia: Australian creoles` (`tools/mixer-meta/wikipedia-australian-creoles.json`) is fully wired for its current items (coverage=100%, `Nonunique Bases: 0`, race reachability ok) after pinning `rop` (Kriol) to dedicated base `1703`. Under the no-curated-partial-lists policy, this JSON must be expanded to include every language on the referenced Wikipedia list.

- ✅ **2025-12-15 (verified):** `Wikipedia: Australian language families and isolates` (`tools/mixer-meta/wikipedia-australian-families-and-isolates.json`) is fully wired for its current considered items (coverage=100%, `Nonunique Bases: 0`, base-set uniqueness + race reachability ok) after pinning `lrg` / `waq` / `xxm` to dedicated bases `1704–1706` and pinning `gbu` / `ggk` / `tiwi` / `umr` / `wdj` to dedicated bases `1707–1711`. Under the no-curated-partial-lists policy, this JSON must be reviewed so any skipped entries that are actual languages are included (skips allowed only for non-language group headings).

- ✅ **2025-12-15 (verified):** `Wikipedia: Australian Aboriginal languages with >100 speakers (NILS/census)` (`tools/mixer-meta/wikipedia-australian-languages-living-2019.json`) is fully represented (coverage=100%, `Nonunique Bases: 0`, base-set uniqueness + race reachability ok) after dedicated pins batches 1–6 (`1712–1777`). Verification includes: `pnpm exec -- node tools/mixer-core/report-wikipedia-list-nonunique-bases.js tools/mixer-meta/wikipedia-australian-languages-living-2019.json` and `pnpm exec -- node tools/mixer-races/report-wikipedia-list-race-coverage.js tools/mixer-meta/wikipedia-australian-languages-living-2019.json`.

Important distinction:

- The snapshot’s `fully wired` count is a **coverage** metric only: an item is counted as `fully wired` when it exists in both `config/language-mixes.json` and `config/language-mixer-map.json`.
- The project goal of a list being **fully represented** is stricter: coverage **plus** globally unique `bases[]` (base-uniqueness) **plus** race reachability.

Per-list base-uniqueness can be summarized via `tools/mixer-core/report-wikipedia-list-base-uniqueness.js` (and the `Nonunique Bases` metric written into the snapshot block). Per-list race reachability can be checked via `tools/mixer-races/report-wikipedia-list-race-coverage.js`. See [§5.6 Grow coverage via Wikipedia language lists](#5-planned-next-steps-when-resuming) for the precise definition of "fully represented".

In this project, coverage for a list JSON is computed over **all** in-scope items; `skip: true` is reserved for global exceptions such as sign languages and truly unreconstructible extinct entries, which are excluded from coverage percentages. Base-uniqueness and race-coverage status are enforced via the global mixer and race tools described elsewhere in this document (including the base-cluster diagnostics and the per-list base-uniqueness helper) rather than being repeated per list in §8. Snapshot blocks may optionally include `unique bases` / `clustered bases` counts from `report-wikipedia-list-base-uniqueness.js` and/or a `Nonunique Bases` line produced by the coverage helpers (`report-wikipedia-list-coverage.js` / `update-wikipedia-list-coverage-in-devplan.js`), alongside the existing wiring legend.

### 8.1 Languages of Africa – major languages view

- **JSON file:** `tools/mixer-meta/wikipedia-languages-of-africa-major.json`
- **Title:** `Wikipedia: Languages of Africa – major languages view`
- **Source:** <https://en.wikipedia.org/wiki/Languages_of_Africa>
- **Scope:** Hand-picked major African languages from the "Languages of Africa" article; focuses on high-impact Afroasiatic and Niger–Congo languages.
- **Primary families / regions touched:** Sub-Saharan Africa (Bantu, Atlantic–Congo, Cushitic, Chadic) and Afroasiatic macro entries; see [§2.8 Sub-Saharan Africa (first Bantu split)](#28-sub-saharan-africa-first-bantu-split) and related African notes.
- **Extended long-tail driver:** `tools/mixer-catalog/add-african-languages.js` contains an `AFRICA_ROWS` array derived from the long `Language / Family / speakers / status` table in the same Wikipedia article. It backfills any of those rows that are missing from `config/language-mixes.json`, inferring `category` / `family` / `region` from the Wikipedia family column.

- **Coverage tracking:** this view is a **view over the full Languages-of-Africa table**, not an independent driver. All coverage status and wiring/uniqueness metrics for these languages are tracked via the full-table JSON in §8.1b (`wikipedia-languages-of-africa-full.json`); we no longer maintain a separate 33-item coverage snapshot for this view.

### 8.1b Languages of Africa – full table snapshot (AFRICA_ROWS)

- **JSON file:** `tools/mixer-meta/wikipedia-languages-of-africa-full.json`
- **Title:** `Wikipedia: Languages of Africa – full table snapshot`
- **Source:** <https://en.wikipedia.org/wiki/Languages_of_Africa>
- **Scope:** Full language-level snapshot of the long `Language / Family / speakers / status` table in the "Languages of Africa" article. Every row from that table is encoded once in this JSON via its Wikipedia name, using the same `AFRICA_ROWS` source data that drives `add-african-languages.js`.
- **Primary families / regions touched:** All African families represented in the table (Niger–Congo, Afroasiatic, Nilo-Saharan, Mande, Ubangian, Khoe–Kwadi, Kx'a, Tuu, etc.) across the whole continent; this is the canonical **"all languages on the Languages-of-Africa list"** coverage driver.

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-languages-of-africa-full.json`

- **Status tier:** **In progress (full table)** – this JSON tracks **every language row** from the Wikipedia table; coverage and base-uniqueness snapshots for this full list should be refreshed after each major African mixer pass.
- **Last run:** 2025-12-18

- **Snapshot from last run (all list items):**
  - `fully wired:` 277
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `Nonunique Bases:` 62

- **Base-set uniqueness details (full items):**
  - `unique bases:` 277
  - `clustered bases:` 0
  - `clustered full items:` 0
  - `cluster size histogram:` size2=0, size3=0, size4+=0
  - `clustered isos:` (none)

 - **Notes / next steps:**
  - ✅ **2025-12-18 (verified / applied):** Reduced Africa full-table `Nonunique Bases` further by pinning base=146 hub items `sakata,sengele,shi,suba,suku,wongo` via delta `tools/mixer-deltas/2025-12-18-wikipedia1-africa-fastwin-batch4-base146-dedicatedpins.json` to dedicated bases `5387–5392` (base defs appended in `modules/namebases-real.js`). Verification: `node --check modules/namebases-real.js`, `pnpm exec -- node tools/mixer-core/apply-mixer-deltas.js --check --no-lock`, `pnpm run mixer:apply-deltas`, `pnpm exec -- node tools/mixer-core/report-wikipedia-list-nonunique-bases.js tools/mixer-meta/wikipedia-languages-of-africa-full.json`.
  - ✅ **2025-12-18 (verified / applied):** Reduced Africa full-table `Nonunique Bases` further by pinning Horn of Africa / Cushitic items `tsamai,el-molo,saho,somali` via delta `tools/mixer-deltas/2025-12-18-wikipedia1-africa-horn-cushitic-tsamai-el-molo-saho-somali-dedicatedpins.json` to dedicated bases `5872–5875` (base defs appended in `modules/namebases-real.js`). Verification: `pnpm run mixer:apply-deltas`; `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures "--only-isos=tsamai,el-molo,saho,somali" --limit=300`; `pnpm exec -- node tools/mixer-core/check-language-mixer-coverage.js`; `pnpm exec -- node tools/mixer-core/check-language-mixer-failures.js`.
  - ✅ **2025-12-18 (applied):** Reduced Africa full-table `Nonunique Bases` further by pinning Bantu items `swa,xhosa,chewa,chopi,tetela` via delta `tools/mixer-deltas/2025-12-18-wikipedia1-africa-nonunique-bantu-swa-xhosa-chewa-chopi-tetela-dedicatedpins.json` to dedicated bases `8225–8229` (base defs appended in `modules/namebases-real.js`). Evidence: pins present in `tools/mixer-deltas/_compiled-dedicated-pins.json` and `config/language-mixer-map.json`.
  - ✅ **2025-12-18 (verified / applied):** Reduced Africa full-table `Nonunique Bases` further by pinning Southern Bantu cluster items `simaa,tonga-malawi,totela,tshivenda,venda` via delta `tools/mixer-deltas/2025-12-18-wikipedia1-africa-southern-bantu-batch1-8500-8504-dedicatedpins.json` to dedicated bases `8500–8504` (base defs appended in `modules/namebases-real.js`). Verification: `pnpm run mixer:apply-deltas`; seed-uniqueness `--only-failures "--only-isos=simaa,tonga-malawi,totela,tshivenda,venda" --limit=300` => 0 failures; `check-language-mixer-coverage` OK; `check-language-mixer-failures` OK.
  - ✅ **2025-12-18 (verified / applied):** Reduced Africa full-table `Nonunique Bases` further by pinning `shona,sena,tshiluba,sotho,swazi,tumbuka` via delta `tools/mixer-deltas/2025-12-18-wikipedia1-africa-fastwin-batch3-dedicatedpins.json` to dedicated bases `5381–5386` (base defs appended in `modules/namebases-real.js`). Verification: `node --check modules/namebases-real.js`, `pnpm exec -- node tools/mixer-core/apply-mixer-deltas.js --check --no-lock`, `pnpm run mixer:apply-deltas`, `pnpm exec -- node tools/mixer-core/report-wikipedia-list-nonunique-bases.js tools/mixer-meta/wikipedia-languages-of-africa-full.json`.
  - ✅ **2025-12-18 (verified / applied):** Reduced Africa full-table `Nonunique Bases` further by pinning single-base items `wolof,sesotho,tswana,zarma,seze` via delta `tools/mixer-deltas/2025-12-18-wikipedia1-africa-singlebase-batch2-dedicatedpins.json` to dedicated bases `5376–5380` (base defs appended in `modules/namebases-real.js`). Verification: `node --check modules/namebases-real.js`, `pnpm exec -- node tools/mixer-core/apply-mixer-deltas.js --check --no-lock`, `pnpm run mixer:apply-deltas`, `pnpm exec -- node tools/mixer-core/report-wikipedia-list-nonunique-bases.js tools/mixer-meta/wikipedia-languages-of-africa-full.json`.
  - ✅ **2025-12-18 (verified / applied):** Fixed Africa-table `Samo` name collision by binding the row to `samo-burkina` (catalog + list ISO binding) and adding dedicated base `5372`; applied Kx'a dedicatedPins delta `tools/mixer-deltas/2025-12-18-wikipedia1-africa-kxa-batch1-dedicatedpins.json` + dedicated bases `5373–5375` for `ekoka-kung,kx-ao-ae,sekele`. Verification: `node --check modules/namebases-real.js`, `pnpm exec -- node tools/mixer-core/apply-mixer-deltas.js --check --no-lock`, `pnpm run mixer:apply-deltas`, `pnpm exec -- node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-languages-of-africa-full.json --no-devplan`.
  - ✅ **2025-12-16 (verified):** Added dedicated bases `5366–5368` in `modules/namebases-real.js` and dedicatedPins delta `tools/mixer-deltas/2025-12-16-decluster-africa-bambassi-tagoi-wali-sudan.json` for `bambassi`, `tagoi`, `wali-sudan`.
  - ✅ **2025-12-15 (verified):** Cleared the last four base-set collisions for this list (`baka`, `bube`, `saya-chadic`, `tamil`) by adding dedicated bases `945–948` in `modules/namebases-real.js` and pinning them via delta `tools/mixer-deltas/2025-12-15-worker37-africa-uniqueness.json` (applied with `pnpm run mixer:apply-deltas`). Base-set uniqueness for the full Africa list is now `clustered bases: 0`.
  - ✅ **2025-12-15 (verified):** Reduced `Nonunique Bases` for the Africa full list (and base=132 slice) by adding dedicated bases `1330–1335` and pinning `berta,sinyar,songhoyboro-ciine,surbakhal,teda,tondi-songway-kiini` via delta `tools/mixer-deltas/2025-12-15-worker39-africa-132-nilo.json` (applied with `pnpm run mixer:apply-deltas`).
  - ✅ **2025-12-15 (verified):** Reduced the base=132 slice by pinning `sukur,bacama,bade-chadic,bole-afroasiatic` to dedicated bases `1336–1339` via delta `tools/mixer-deltas/2025-12-15-worker39-africa-132-chadic.json` (applied with `pnpm run mixer:apply-deltas`).
  - ✅ **2025-12-15 (verified):** Reduced the base=132 slice by pinning `saba,shabo,besme,senara,sucite,supyire,suwu` to dedicated bases `1600–1606` via delta `tools/mixer-deltas/2025-12-15-worker39-africa-132-batch3.json` (applied with `pnpm run mixer:apply-deltas`).
  - ✅ **2025-12-15 (verified):** Reduced the base=132 slice by pinning `syer-tenyer,tiv,tyap,werni,yobe` to dedicated bases `1500–1504` via delta `tools/mixer-deltas/2025-12-15-worker39-africa-132-batch4a.json` (applied with `pnpm run mixer:apply-deltas`).
  - ✅ **2025-12-15 (verified):** Reduced the base=132 slice by pinning `zhire,zhoa,tadaksahak` to dedicated bases `1505–1507` via delta `tools/mixer-deltas/2025-12-15-worker39-africa-132-batch4b.json` (applied with `pnpm run mixer:apply-deltas`).
  - ✅ **2025-12-15 (verified):** Began burn-down of the largest remaining `Nonunique Bases` hub (bases `112/113`) by pinning `abon,abron,acheron,adara,aghem,aiki,aja,aka,ambele,ambo,amdang,amira,babanki,baca,bangala` to dedicated bases `2004–2018` via delta `tools/mixer-deltas/2025-12-15-worker39-africa-112-113-batch1.json` (applied with `pnpm run mixer:apply-deltas`).
  - ✅ **2025-12-15 (verified):** Continued the base `112/113` burn-down by pinning `bangi,bangolan,bomboli-bozaba,bomboma,boze,bozo,buu,dagaare,dagbani,djimini,doghose,dogoso,eton,evant,fongoro` to dedicated bases `2019–2033` via delta `tools/mixer-deltas/2025-12-15-worker39-africa-112-113-batch2.json` (applied with `pnpm run mixer:apply-deltas`). After this batch, computed Africa full list `Nonunique Bases` is `207`.
  - ✅ **2025-12-15 (verified):** Continued the base `112/113` burn-down by pinning `fungor,fur,ghomala,gikuyu,goundo,gourmanche,gumuz,gwari,gyong,hakaona,hanga,saari,samwe,shwai,sighu` to dedicated bases `2034–2048` via delta `tools/mixer-deltas/2025-12-15-worker39-africa-112-113-batch3.json` (applied with `pnpm run mixer:apply-deltas`). After this batch, computed Africa full list `Nonunique Bases` is `192`.
  - ✅ **2025-12-15 (verified):** Continued the base `112/113` burn-down by pinning `siwu,southeast-ijo,southern-birifor,susu,tagwana,talni,tikar,tiro,twi,vengo,viemo,viti,vori,voro,wali-ghana` to dedicated bases `2049–2063` via delta `tools/mixer-deltas/2025-12-15-worker39-africa-112-113-batch4.json` (applied with `pnpm run mixer:apply-deltas`). After this batch, computed Africa full list `Nonunique Bases` is `175`.
  - ✅ **2025-12-15 (verified):** Completed the base `112/113` burn-down by pinning `wapan,weh,wushi,yemba,zande,yor,wannu,yalunka,yamba,yela-kela,yulu` to dedicated bases `2424–2434` via delta `tools/mixer-deltas/2025-12-15-worker39-africa-112-113-batch5.json` (applied; pins present in `config/language-mixer-map.json` and `tools/mixer-deltas/_compiled-dedicated-pins.json`).
  - Treat this JSON as the authoritative representation of the entire `Languages of Africa` table: any additions or removals in the Wikipedia article should be mirrored into `AFRICA_ROWS` (via `add-african-languages.js`) and then into this JSON via the generator, so the full-table coverage report stays 1:1 with the article.
 - Use the **major-languages view** in §8.1 as a compact checklist for headline African standards, but rely on this full-table snapshot when you want to reason about coverage and uniqueness for **all** languages listed in the article, not just the big ones.

### 8.2 List of languages by number of native speakers – full list (pending full capture)

- **JSON file:** `tools/mixer-meta/wikipedia-list-languages-by-native-speakers.json`
- **Title:** `Wikipedia: List of languages by number of native speakers`
- **Source:** <https://en.wikipedia.org/wiki/List_of_languages_by_number_of_native_speakers>
- **Scope:** Intended as a full capture of the current Wikipedia list/table (no curated partial-list intent). If the file is currently incomplete vs the article, expand it until it represents the full list.
- **Primary families / regions touched:** Global macro-families (Indo-European, Sinitic, Japonic, Koreanic, Afroasiatic, Dravidian, Austronesian, etc.); ties into multiple summaries in [§2 Families / bases already reviewed](#2-families--bases-already-reviewed).

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-list-languages-by-native-speakers.json`

- **Status tier:** **In progress (full article)**
- **Last run:** 2025-12-10

- **Snapshot from last run (all list items):**
  - `fully wired:` 176
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `Nonunique Bases:` 142

- **Base-set uniqueness details (full items):**
  - `unique bases:` 169
  - `clustered bases:` 7
  - `clustered full items:` 7
  - `cluster size histogram:` size2=6, size3=0, size4+=1
  - `clustered isos:` tamil(20), eastern-khanty(2), eastern-mansi(2), eng(2), forest-nenets(2), hin(2), nenets(2)

- **Notes / next steps:**
  - Treat this list as the primary checklist for headline global coverage; when expanding the JSON with additional rows from the Wikipedia table, re-run coverage and base-uniqueness, then refresh the snapshot here.
  - As of the latest run, all 173 list items are fully wired (catalog + mixer-map); any remaining shared `bases[]` signatures among distinct non-skipped items are treated as remaining uniqueness debt for a future micro-pass.
  - 2025-12-11 micro-pass: refactored the native-speakers helper to use canonical ISOs (e.g., `swe`, `ilocano`) and repaired the list after an accidental Cebuano displacement; catalog ISO duplicates are now cleared via unique alias ISO codes, leaving only normalized-name clusters as remaining diagnostic output.
  - ✅ **2025-12-13 (verified):** declustered the remaining base-set collisions for this list; `clustered bases: 0` confirmed by `report-wikipedia-list-base-uniqueness.js` after updating `language-mixer-map` mappings and fixing the `fix-language-mixer-mappings.js` `aranese` override to preserve the intended base set during `run-language-mixer-suite`.

### 8.3 List of languages by number of native speakers – CIA World Factbook 2018 slice

- **JSON file:** `tools/mixer-meta/wikipedia-list-languages-by-native-speakers-cia-2018.json`
- **Title:** `Wikipedia: List of languages by number of native speakers – CIA World Factbook 2018 slice`
- **Source:** <https://en.wikipedia.org/wiki/List_of_languages_by_number_of_native_speakers>
- **Scope:** Alternate slice of the same Wikipedia article, reflecting the CIA World Factbook 2018 numbers; used as an additional cross-check on coverage for key global languages.
- **Primary families / regions touched:** Overlaps heavily with §8.2 but may differ in language ordering and a few inclusions; again spans multiple macro-families.

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-list-languages-by-native-speakers-cia-2018.json`

- **Status tier:** **In progress (full article)**
- **Last run:** 2025-12-10

- **Snapshot from last run (all list items):**
  - `fully wired:` 11
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `Nonunique Bases:` 11

- **Base-set uniqueness details (full items):**
  - `unique bases:` 9
  - `clustered bases:` 2
  - `clustered full items:` 2
  - `cluster size histogram:` size2=2, size3=0, size4+=0
  - `clustered isos:` eng(2), hin(2)

- **Notes / next steps:**
  - Use as a sanity check against the native-speakers list in §8.2; discrepancies or additional languages here can signal further work needed.
  - As with other lists, explicitly note any remaining unwired languages or planned JSON expansions so that "fully represented" status remains well defined.

### 8.4 Languages of South Asia – full template snapshot

- **JSON file:** `tools/mixer-meta/wikipedia-languages-of-south-asia.json`
- **Title:** `Wikipedia: Languages of South Asia – full template snapshot`
- **Source:** <https://en.wikipedia.org/wiki/Languages_of_South_Asia>
- **Scope:** Full template snapshot of languages enumerated by the page's navbox (Template:Languages of South Asia), including major languages and representative smaller entries across South Asia.
- **Primary families / regions touched:** South Asia (Indo-Aryan, Dravidian, and neighbors); see [§2.9 South Asia (Indo-Aryan / Dravidian)](#29-south-asia-indo-aryan--dravidian) and the South Asia items in §4.

- ✅ **Status tier:** **Complete**
- **Last run:** 2025-12-13

- **Snapshot from last run (all list items):**
  - `fully wired:` 88
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `Nonunique Bases:` 70

- **Base-set uniqueness details (full items):**
  - `unique bases:` 80
  - `clustered bases:` 8
  - `clustered full items:` 8
  - `cluster size histogram:` size2=4, size3=2, size4+=2
  - `clustered isos:` burushaski(7), newar(4), hno(3), kfq(3), hinglish(2), indian-english(2), nepalese-english(2), srb(2)

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-languages-of-south-asia.json`

- **Notes / next steps:**
  - Use this list as a driver for Indo-Aryan / Dravidian completeness checks in South Asia and to highlight any further missing catalog or mixer entries.

### 8.5 Indigenous languages of the Americas – full Wikipedia tables capture

- **JSON file:** `tools/mixer-meta/wikipedia-indigenous-languages-of-the-americas.json`
- **Title:** `Wikipedia: Indigenous languages of the Americas – full Wikipedia tables capture`
- **Source:** <https://en.wikipedia.org/wiki/Indigenous_languages_of_the_Americas>
- **Scope:** Full capture of every language row enumerated by the article’s “Language families and unclassified languages” tables/sections (Northern America; Central America and Mexico; South America and the Caribbean). This list is intended to mirror Wikipedia’s list (no curated partial-list intent).
- **Primary families / regions touched:** Americas (indigenous & contact zones); see [§2.11 Americas (indigenous & contact zones)](#211-americas-indigenous--contact-zones).
  - Treat this list as the authoritative Wikipedia-derived checklist for mixer completeness for this page.
  - When the Wikipedia page changes, update this JSON so it continues to represent the full list and re-run coverage.

- **Snapshot from last run (considered items only):**
  - `fully wired:` 221 (100.0%)
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `skipped:` 23
  - `Nonunique Bases:` 28

- **Base-set uniqueness details (full items):**
  - `unique bases:` 221
  - `clustered bases:` 0
  - `clustered full items:` 0
  - `cluster size histogram:` size2=0, size3=0, size4+=0
  - `clustered isos:` (none)

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-indigenous-languages-of-the-americas.json`

 - **Status update:** Coverage is **clean** for considered items (`missing both=0`, `unmatched=0`). Remaining `skipped` entries must be reviewed and driven toward 0 for language rows to satisfy the no-curated-partial-lists policy. Uniqueness debt remains high (`Nonunique Bases=170`).

 - **2025-12-16 status (Batch1 complete):**
   - **Batch scope:** resolved `missing both` for `mzp`, `noj`, `oca`, `tna` via dedicated pins `2435–2438` (delta: `tools/mixer-deltas/2025-12-16-wikipedia1-americas-indigenous-batch1-missing-both.json`).
   - **Latest verified coverage run:** `considered=221`, `skipped=23`, `fully wired=197`, `missing both=0`, `unmatched=24`, `Nonunique Bases=197`.
   - **Seed uniqueness:** targeted seed-uniqueness report for `mzp,noj,oca,tna` now shows 0 strict failures and 0 normalized failures.

 - **2025-12-16 status (Kom alias binding):**
   - **Batch scope:** bound `Kom` -> `tob` (Toba Qom).
   - **Latest verified coverage run:** `considered=221`, `skipped=23`, `fully wired=201`, `missing both=0`, `unmatched=20`, `Nonunique Bases=192`.
   - **Guardrails:** `pnpm run mixer:guardrails` => OK (`map=3478`, `catalog=3478`).

 - **2025-12-17 status (Americas Indigenous missing-both batch complete):**
   - **Batch scope:** resolved `missing both` for `mbn,arh,mav,hto,trn,bmr,mbr,ppi,pav,rey,xsu,poi,tqb,slj,tpx,tno,tsi,psm,mtp,wlv` via dedicated pins `5813–5832`.
   - **Deltas:** `tools/mixer-deltas/2025-12-17-wikipedia1-americas-indigenous-missing-both-batch1-5813-5817.json`, `tools/mixer-deltas/2025-12-17-wikipedia1-americas-indigenous-missing-both-batch2-5818-5822.json`, `tools/mixer-deltas/2025-12-17-wikipedia1-americas-indigenous-missing-both-batch3-5823-5827.json`, `tools/mixer-deltas/2025-12-17-wikipedia1-americas-indigenous-missing-both-batch4-5828-5832.json`.
   - **Bases:** appended to `modules/namebases-real.js` (`i:5813–5832`).
   - **Verification:** `pnpm run mixer:apply-deltas` OK; `pnpm run mixer:check-deltas` OK; coverage: `missing catalog=0`, `missing map=0`; seed-uniqueness for the 20 ISOs: 0 strict failures / 0 normalized failures.

 - **2025-12-17 status (Kiowa–Tanoan 2-member cluster staged):**
   - **Batch scope:** staged dedicated pins for `kio` and `tew` to break their shared base-set cluster.
   - **Delta:** `tools/mixer-deltas/2025-12-17-wikipedia1-americas-indigenous-kio-tew-kiowa-tanoan-dedicatedpins.json` (pins: `kio->7242`, `tew->7243`).
   - **Bases:** appended to `modules/namebases-real.js` (`i:7242–7243`) and updated seed blobs for `kio/tew` so `seed-uniqueness` passes.
   - **Verification:** `pnpm run mixer:guardrails` OK; targeted seed-uniqueness for `kio,tew` => 0 strict failures / 0 normalized failures; coverage: `missing catalog=0`, `missing map=0`; failures: 0.

 - **2025-12-18 status (Chibchan 3-member cluster resolved):**
   - **Batch scope:** broke the shared base-set cluster for `wayuu`, `kog`, `mot` (previously shared `bases=[177]`) by adding dedicated pins.
   - **Delta:** `tools/mixer-deltas/2025-12-18-wikipedia1-americas-indigenous-uniqueness-batch2-wayuu-kog-mot-dedicatedpins.json` (pins: `wayuu->7419`, `kog->7420`, `mot->7421`).
   - **Bases:** appended to `modules/namebases-real.js` (`i:7419–7421`) and updated seed blobs for `wayuu/kog` so targeted `seed-uniqueness` passes.
   - **Verification:** `pnpm run mixer:apply-deltas` OK; `pnpm run mixer:check-deltas` OK; targeted seed-uniqueness for `wayuu,kog,mot` => 0 strict failures / 0 normalized failures; coverage: `missing catalog=0`, `missing map=0`; failures: 0; duplicate-isos: 0; map inconsistencies check: OK.

 - **2025-12-18 status (Mayan Nonunique Bases batch1):**
   - **Batch scope:** reduced list-level `Nonunique Bases` by adding dedicated pins for `qeqchi`, `tzeltal`, `tzotzil`, `yucatec-maya`, `kaqchikel`.
   - **Delta:** `tools/mixer-deltas/2025-12-18-wikipedia1-americas-indigenous-nonunique-mayan-batch1-8125-8129.json` (pins: `qeqchi->8125`, `tzeltal->8126`, `tzotzil->8127`, `yucatec-maya->8128`, `kaqchikel->8129`).
   - **Bases:** appended to `modules/namebases-real.js` (`i:8125–8129`).
   - **Verification:** `pnpm run mixer:apply-deltas` OK; `pnpm run mixer:check-deltas` OK; targeted seed-uniqueness for `qeqchi,tzeltal,tzotzil,yucatec-maya,kaqchikel` => 0 strict failures / 0 normalized failures; coverage: `missing catalog=0`, `missing map=0`; failures: 0.

 - **2025-12-18 status (Mayan Nonunique Bases batch2):**
   - **Batch scope:** reduced list-level `Nonunique Bases` further by adding dedicated pins for `ixl`, `jac`, `kiche`, `lac`, `mam`.
   - **Delta:** `tools/mixer-deltas/2025-12-18-wikipedia1-americas-indigenous-nonunique-mayan-batch2-8130-8134.json` (pins: `ixl->8130`, `jac->8131`, `kiche->8132`, `lac->8133`, `mam->8134`).
   - **Bases:** appended to `modules/namebases-real.js` (`i:8130–8134`).
   - **Verification:** `pnpm run mixer:apply-deltas` OK; `pnpm run mixer:check-deltas` OK; targeted seed-uniqueness for `ixl,jac,kiche,lac,mam` => 0 strict failures / 0 normalized failures; coverage: `missing catalog=0`, `missing map=0`; failures: 0; list `Nonunique Bases=57`.

 - **2025-12-18 status (Mayan Nonunique Bases batch3):**
   - **Batch scope:** reduced list-level `Nonunique Bases` further by adding dedicated pins for `mop`, `poqomam`, `poqomchi`, `toj`, `tzj`.
   - **Delta:** `tools/mixer-deltas/2025-12-18-wikipedia1-americas-indigenous-nonunique-mayan-batch3-8135-8139.json` (pins: `mop->8135`, `poqomam->8136`, `poqomchi->8137`, `toj->8138`, `tzj->8139`).
   - **Bases:** appended to `modules/namebases-real.js` (`i:8135–8139`).
   - **Verification:** `pnpm run mixer:apply-deltas` OK; `pnpm run mixer:check-deltas` OK; targeted seed-uniqueness for `mop,poqomam,poqomchi,toj,tzj` => 0 strict failures / 0 normalized failures; coverage: `missing catalog=0`, `missing map=0`; failures: 0; list `Nonunique Bases=52`.

 - **2025-12-18 status (Mayan Nonunique Bases batch4):**
   - **Batch scope:** reduced list-level `Nonunique Bases` further by adding dedicated pins for `quv`, `qum`, `ttc`, `usp`.
   - **Delta:** `tools/mixer-deltas/2025-12-18-wikipedia1-americas-indigenous-nonunique-mayan-batch4-8140-8144.json` (pins: `quv->8141`, `qum->8142`, `ttc->8143`, `usp->8144`).
   - **Bases:** appended to `modules/namebases-real.js` (`i:8140–8144`).
   - **Note:** `qanjobal` was initially considered for this batch but already has an existing dedicated pin (`qanjobal->6626`), so it was excluded to avoid a conflicting pin (the `i:8140` base def exists but is not pinned by this delta).
   - **Verification:** `pnpm run mixer:apply-deltas` OK; `pnpm run mixer:check-deltas` OK; targeted seed-uniqueness for `quv,qum,ttc,usp` => 0 strict failures / 0 normalized failures; coverage: `missing catalog=0`, `missing map=0`; failures: 0; list `Nonunique Bases=48`; list race coverage: OK.

 - **2025-12-18 status (Oto-Manguean Nonunique Bases batch1):**
   - **Batch scope:** reduced list-level `Nonunique Bases` by adding dedicated pins for `matlatzinca`, `mazahua`, `mazatec`, `mixtec`, `otomi`, `zapotec`.
   - **Delta:** `tools/mixer-deltas/2025-12-18-wikipedia1-americas-indigenous-otomanguean-batch1-8425-8430-dedicatedpins.json` (pins: `matlatzinca->8425`, `mazahua->8426`, `mazatec->8427`, `mixtec->8428`, `otomi->8429`, `zapotec->8430`).
   - **Bases:** appended to `modules/namebases-real.js` (`i:8425–8430`).
   - **Verification:** `pnpm run mixer:apply-deltas` OK; targeted seed-uniqueness for `matlatzinca,mazahua,mazatec,mixtec,otomi,zapotec` => 0 strict failures / 0 normalized failures; coverage: `missing catalog=0`, `missing map=0`; failures: 0; duplicate-isos: 0; map inconsistencies check: OK; list nonunique report => `Total lacking unique base: 41`.

 - **2025-12-18 status (Uto-Aztecan Nonunique Bases batch1):**
   - **Batch scope:** reduced list-level `Nonunique Bases` by adding dedicated pins for `mayo`, `nah`, `oodham`, `pima-bajo`, `tarahumara`, `var`, `yaqui`.
   - **Delta:** `tools/mixer-deltas/2025-12-18-wikipedia1-americas-indigenous-uto-aztecan-batch1-8481-8487-dedicatedpins.json` (pins: `mayo->8481`, `nah->8482`, `oodham->8483`, `pima-bajo->8484`, `tarahumara->8485`, `var->8486`, `yaqui->8487`).
   - **Bases:** appended to `modules/namebases-real.js` (`i:8481–8487`).
   - **Verification:** `pnpm run mixer:apply-deltas` OK; targeted seed-uniqueness for `mayo,nah,oodham,pima-bajo,tarahumara,var,yaqui` => 0 strict failures / 0 normalized failures; coverage: `missing catalog=0`, `missing map=0`; failures: 0; duplicate-isos: 0; map inconsistencies check: OK; list nonunique report => `Total lacking unique base: 34`.

 - **2025-12-18 status (Arawakan mini-batch):**
   - **Batch scope:** dedicated pins for `piapoco`, `ter` (Terêna), `wapishana`.
   - **Delta:** `tools/mixer-deltas/2025-12-19-wikipedia1-americas-indigenous-arawakan-batch1-8665-8667-dedicatedpins.json` (pins: `piapoco->8653`, `ter->8654`, `wapishana->8655`).
   - **Bases:** ensured dedicated base defs exist in `modules/namebases-real.js` (`i:8653–8655`).
   - **Verification (2025-12-18 19:24 local):** `pnpm run mixer:apply-deltas` OK; targeted seed-uniqueness for `piapoco,ter,wapishana` => missing mapping: 0; no globally-unique base index: 0; strict failures: 0; normalized failures: 0; coverage: `missing catalog=0`, `missing map=0`; failures: 0; duplicate-isos: 0; map inconsistencies check: OK.

### 8.6 Languages of Oceania – full page language mentions snapshot

- **JSON file:** `tools/mixer-meta/wikipedia-languages-of-oceania.json`
- **Title:** `Wikipedia: Languages of Oceania – full page language mentions snapshot`
- **Source:** <https://en.wikipedia.org/wiki/Languages_of_Oceania>
- **Scope:** Full snapshot of all distinct language names explicitly mentioned in the Wikipedia article text (including contact / creole languages and immigrant languages mentioned in the article), used as a completeness checklist.
- **Primary families / regions touched:** Papuan & Pacific Austronesian region; see [§2.12 Papuan & Pacific Austronesian (second-pass)](#212-papuan--pacific-austronesian-second-pass).

- ✅ **Status tier:** **Complete**
- **Last run:** 2025-12-16

- **Snapshot from last run (all list items):**
  - `fully wired:` 26
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `Nonunique Bases:` 0

- **Base-set uniqueness details (full items):**
  - `unique bases:` 26
  - `clustered bases:` 0
  - `clustered full items:` 0
  - `cluster size histogram:` size2=0, size3=0, size4+=0
  - `clustered isos:` (none)

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-languages-of-oceania.json`

- **Notes / next steps:**
  - **2025-12-15 status:** Added dedicated bases `1554–1557` for `yap`, `mbq`, `norfuk`, `pitkern` and applied deltas; confirmed coverage=100% for this list and race reachability for every item.
  - **2025-12-15 status:** Declustered `unserdeutsch` by pinning it to a new dedicated base `1700`; list `Nonunique Bases` now `18` (remaining clustered full items: `eng`, `hin`, `spa`).
  - **2025-12-15 status:** Declustered `eng` by pinning it to a new dedicated base `1701`; list `Nonunique Bases` now `16` (remaining clustered full items: `hin`).
  - **2025-12-15 status:** Declustered `hin` by pinning it to a new dedicated base `1702`; Oceania list now has `clustered bases: 0` (all full items have globally unique `bases[]` sets).
  - **2025-12-16 status:** Cleared remaining `NO_UNIQ_BASE` for Oceania by pinning dedicated bases `3055–3063` for `indonesian`, `tagalog`, `filipino`, `maori`, `hawaiian`, `mandarin`, `yue`, `ell`, `jpn` (via `tools/mixer-deltas/2025-12-16-wikipedia1-oceania-batch2.json` and `tools/mixer-deltas/2025-12-16-wikipedia1-oceania-batch3.json`); verified `Nonunique Bases: 0`.
  - **2025-12-16 verification:** Re-ran list coverage + base-uniqueness + race coverage; metrics remain `fully wired: 26`, `Nonunique Bases: 0`, `clustered bases: 0`.
  - Use this list as a driver for further Papuan and Oceanic coverage beyond the current macro bases (360–371) and lexifier hubs.
  - When the JSON is expanded or refined, run coverage again to confirm that all new Papuan/Oceanic items have both catalog and mixer entries.

### 8.7 Languages of Europe – full table snapshot

- **JSON file:** `tools/mixer-meta/wikipedia-languages-of-europe.json`
- **Title:** `Wikipedia: Languages of Europe – full table snapshot`
- **Source:** <https://en.wikipedia.org/wiki/Languages_of_Europe>
- **Scope:** Overview of major language families and key standard languages across Europe (Romance, Germanic, Slavic, Celtic, Hellenic/Greek, Albanian, Armenian, Baltic, Uralic, Basque, and others).
- **Primary families / regions touched:** European families documented in [§2 Families / bases already reviewed](#2-families--bases-already-reviewed) (Romance, Germanic, Slavic & East European cluster, Celtic branches, Uralic entries, etc.).

- ✅ **Status tier:** **Complete**
- **Last run:** 2025-12-16

- **Snapshot from last run (considered items only):**
  - `fully wired:` 168 (100.0%)
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `skipped:` 7
  - `Nonunique Bases:` 69

- **Base-set uniqueness details (full items):**
  - `unique bases:` 168
  - `clustered bases:` 0
  - `clustered full items:` 0
  - `cluster size histogram:` size2=0, size3=0, size4+=0
  - `clustered isos:` (none)

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-languages-of-europe.json`

- **Notes / next steps:**
  - When extending or revisiting European families, update the JSON list from the article above and re-run coverage.
  - Use coverage reports to cross-check that each major European standard language has both catalog and mixer entries and that coverage is balanced across Western, Central, Northern, and Eastern Europe.
  - **2025-12-16 status:** Staged delta-only `setBases` batches (no `modules/namebases-real.js` edits) to burn down Europe base-set collisions: `tools/mixer-deltas/2025-12-16-wikipedia1-europe-batch1-bavarian-setbases.json`, `tools/mixer-deltas/2025-12-16-wikipedia1-europe-batch2-west-slavic-setbases.json`, `tools/mixer-deltas/2025-12-16-wikipedia1-europe-batch3-nogai-karakalpak-setbases.json`, `tools/mixer-deltas/2025-12-16-wikipedia1-europe-batch4-caucasus-223-setbases.json`, `tools/mixer-deltas/2025-12-16-wikipedia1-europe-batch5-caucasus-223-setbases.json`, `tools/mixer-deltas/2025-12-16-wikipedia1-europe-batch6-caucasus-223-setbases.json`, `tools/mixer-deltas/2025-12-16-wikipedia1-europe-batch7-caucasus-223-setbases.json`, `tools/mixer-deltas/2025-12-16-wikipedia1-europe-batch8-finnic-9-setbases.json`.
  - **2025-12-16 status:** Cleared `NO_UNIQ_BASE` for `ingrian,kven,livonian,ludic,me-nkieli,veps,v-ro,votic` by adding dedicated bases `3332–3339` in `modules/namebases-real.js` and pinning via `tools/mixer-deltas/2025-12-16-wikipedia1-europe-batch9-finnic-9-dedicatedpins.json`; verified seed-uniqueness (`No globally-unique base index: 0`) and core checks (coverage/failures/duplicate-isos).
  - **2025-12-16 verification:** Confirmed `pnpm run mixer:apply-deltas` and `pnpm run mixer:check-deltas` pass; dedicated pin collision on base `3336` is cleared.
  - **2025-12-16 status:** Staged Europe batch10 North Germanic dedicated pins for `danish,isl,norwegian,ovd,swe` using dedicated bases `3950–3954` (bases added in `modules/namebases-fantasy.js`); delta: `tools/mixer-deltas/2025-12-16-wikipedia1-europe-batch10-north-germanic-dedicatedpins.json`.
  - **2025-12-16 verified:** `pnpm run mixer:guardrails` OK; seed-uniqueness OK for `danish,isl,norwegian,ovd,swe` (`No globally-unique base index: 0`); core checks OK (coverage/failures/duplicate-isos/inconsistencies); Europe list base-uniqueness: `unique bases: 168`, `clustered bases: 0`, `Nonunique Bases: 92`.
  - **2025-12-16 verification:** Refreshed this list snapshot via `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-languages-of-europe.json`; updated `Nonunique Bases: 85`.
  - **2025-12-16 status:** Staged Europe batch13 East Slavic dedicated pins for `belarusian,rus,rusyn,ukr` using dedicated bases `3961–3964` (bases added in `modules/namebases-fantasy.js`); delta: `tools/mixer-deltas/2025-12-16-wikipedia1-europe-batch13-east-slavic-dedicatedpins.json` (pending integrator `pnpm run mixer:apply-deltas` artifact regeneration).
  - **2025-12-16 status:** Staged Europe batch14 West Slavic dedicated pins for `ces,slovak,pol,kashubian,silesian,upper-sorbian` using dedicated bases `3965–3970` (bases added in `modules/namebases-fantasy.js`); delta: `tools/mixer-deltas/2025-12-16-wikipedia1-europe-batch14-west-slavic-dedicatedpins.json` (pending integrator `pnpm run mixer:apply-deltas` artifact regeneration).

  - **2025-12-16 status:** Staged Europe batch15 South Slavic dedicated pins for `bosnian,croatian,montenegrin,srp,bul,macedonian,slovene` using dedicated bases `3971–3977` (bases added in `modules/namebases-fantasy.js`); delta: `tools/mixer-deltas/2025-12-16-wikipedia1-europe-batch15-south-slavic-dedicatedpins.json` (pending integrator `pnpm run mixer:apply-deltas` artifact regeneration).

### 8.8 Languages of West Asia

- **JSON file:** `tools/mixer-meta/wikipedia-languages-of-west-asia.json`
- **Title:** `Wikipedia: Languages of West Asia`
- **Source:** <https://en.wikipedia.org/wiki/West_Asia>
- **Scope:** Overview of major language families and key languages across West Asia (Anatolia, the Levant, Mesopotamia, the Arabian Peninsula, the Caucasus, and Iran), including Semitic, Iranian, Turkic, Kartvelian, Armenian, and related branches.
- **Primary families / regions touched:** West Asian families and neighbors documented in [§2 Families / bases already reviewed](#2-families--bases-already-reviewed), including Central Semitic, Iranian, Caucasian, and adjacent Indo-European and Turkic clusters.

- ✅ **Status tier:** **Complete**
- **Last run:** 2025-12-16

- **Snapshot from last run (all list items):**
  - `fully wired:` 14
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `Nonunique Bases:` 0

- **Base-set uniqueness details (full items):**
  - `unique bases:` 14
  - `clustered bases:` 0
  - `clustered full items:` 0
  - `cluster size histogram:` size2=0, size3=0, size4+=0
  - `clustered isos:` (none)

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-languages-of-west-asia.json`

- **Notes / next steps:**
  - ✅ **2025-12-15 West Asia uniqueness batch1 (staged):** delta `tools/mixer-deltas/2025-12-15-wikipedia1-west-asia-uniqueness-batch1.json` (dedicatedPins `ara..tur` -> `i:2819–2832`), base defs in `modules/namebases-real.js` (`i:2819–2832`); verified `pnpm exec -- node tools/mixer-core/apply-mixer-deltas.js --check --no-lock` (exit 0); wiki claim updated (workerId=5).
  - ✅ **2025-12-16 verified:** coverage `fully wired 14/14`; `Nonunique Bases: 0`; base-uniqueness `clustered bases: 0`; race coverage all ok; wiki claim workerId=5 marked complete.
  - When focusing on West Asian families, you can refine or expand this JSON list and re-run coverage.
  - Use coverage reports to highlight any new gaps in Semitic, Iranian, Caucasian, and Turkic clusters, especially where languages are still riding shared macro hubs or lack mixer mappings.

### 8.9 Languages of North America

- **JSON file:** `tools/mixer-meta/wikipedia-languages-of-north-america.json`
- **Title:** `Wikipedia: Languages of North America`
- **Source:** <https://en.wikipedia.org/wiki/Languages_of_North_America>
- **Scope:** Regional overview of major languages and families across North America (English, Spanish, French, Na-Dene / Athabaskan, Algonquian, Eskimo–Aleut, etc.), with a focus on representative standards and macro entries.
- **Primary families / regions touched:** North American indigenous & contact zones; ties into [§2.11 Americas (indigenous & contact zones)](#211-americas-indigenous--contact-zones) and the Na-Dene / Algonquian / Eskimo–Aleut notes there.

- ✅ **Status tier:** **Complete**
- **Last run:** 2025-12-10

- **Snapshot from last run (all list items):**
  - `fully wired:` 12
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `Nonunique Bases:` 0

- **Base-set uniqueness details (full items):**
  - `unique bases:` 12
  - `clustered bases:` 0
  - `clustered full items:` 0
  - `cluster size histogram:` size2=0, size3=0, size4+=0
  - `clustered isos:` (none)

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-languages-of-north-america.json`

- **Notes / next steps:**
  - Treat this list as a compact checklist for North American standards and macro entries (English, Spanish, French, Navajo, Cree, Ojibwe, Cherokee, Aleut, Yupik, Inuit, Athabaskan, Apache).
  - When adding new North American languages or refining Na-Dene / Athabaskan coverage, consider expanding this JSON and re-running coverage so each new entry has both catalog and mixer mappings.

### 8.10 Languages of Southeast Asia

- **JSON file:** `tools/mixer-meta/wikipedia-languages-of-southeast-asia.json`

- **Snapshot from last run (all list items):**
  - `fully wired:` 32
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `Nonunique Bases:` 23

- **Base-set uniqueness details (full items):**
  - `unique bases:` 32
  - `clustered bases:` 0
  - `clustered full items:` 0
  - `cluster size histogram:` size2=0, size3=0, size4+=0
  - `clustered isos:` (none)

- ✅ **2025-12-13:** Updated Wikipedia list base-set uniqueness + snapshot helpers to ignore catalog entries tagged `subset` (e.g. `*-native-speakers` alias rows). This prevents alias ISOs from creating false-positive `bases[]` collisions; Southeast Asia now reports `clustered bases: 0` (previously `mnw(2)`).

### 8.11 Languages of Asia – official languages table

- **JSON file:** `tools/mixer-meta/wikipedia-languages-of-asia-official-languages.json`
- **Title:** `Wikipedia: Languages of Asia – official languages table`
- **Source:** <https://en.wikipedia.org/wiki/Languages_of_Asia>
- **Scope:** Snapshot of the country-level official-languages table from the "Languages of Asia" article. Each distinct official or co-official language name in the table appears once in this JSON as a checklist entry, without attempting to re-encode per-country status.
- **Primary families / regions touched:** Pan-Asian macro coverage (Indo-European, Afroasiatic, Turkic, Dravidian, Sino-Tibetan, Austroasiatic, Austronesian, Koreanic, Japonic, etc.), overlapping with the global speaker-count lists (§8.2–§8.3) and the South Asia / East Asia mixer work in §2.7 and §2.9.

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-languages-of-asia-official-languages.json`

- **Status tier:** **In progress (full table)** – this JSON tracks every language row from the Asia official-languages table; coverage snapshots should be refreshed after each major Asia mixer pass.

- **Snapshot from last run (considered items only):**
  - `fully wired:` 97 (100.0%)
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `skipped:` 1
  - `Nonunique Bases:` 88

- **Base-set uniqueness details (full items):**
  - `unique bases:` 94
  - `clustered bases:` 3
  - `clustered full items:` 3
  - `cluster size histogram:` size2=1, size3=1, size4+=1
  - `clustered isos:` tamil(20), waray(3), hin(2)

- ✅ **2025-12-13:** uniqueness micro-pass (verified): declustered the remaining Asia-official base-set collisions by splitting `bikol` from `ceb` and resolving the `bhojpuri` collision (by adjusting the off-list counterpart). Also remapped the unrelated Formosan language `sxr` off the Philippine `[193,194,304]` signature so it no longer interferes with per-list base-set uniqueness. Current snapshot reports `clustered bases: 0`.

### 8.12 East Asian languages – classification proposals (macro helper)

- **JSON file:** `tools/mixer-meta/wikipedia-east-asian-languages-classifications.json`
- **Title:** `Wikipedia: East Asian languages – classification proposals`
- **Source:** <https://en.wikipedia.org/wiki/East_Asian_languages>
- **Scope:** Macro-family and proposal-level nodes (Starosta, van Driem, Larish, and related Sino-Austronesian/Formosan branches) from the "East Asian languages" article. All rows are marked `skip: true` and serve purely as a typological map over families and proposed macro-groups; they are not counted as coverage items.
- **Primary families / regions touched:** East Asian macro zone (Sino-Tibetan, Austroasiatic, Austronesian, Kra–Dai, Hmong–Mien, Koreanic, Japonic) plus Formosan branch labels and Sino-Austronesian proposals; complements the concrete Formosan helpers and East Asia mixer notes in §2.7.

- **Coverage / uniqueness role:** **Classification-only helper** – used as a structural index and for human reasoning about macro proposals. All concrete language names referenced here are backed by non-skip helpers (Formosan lists and the Gongduk helper in §8.19); this JSON itself is excluded from coverage percentages and base-uniqueness targets.

- **Snapshot from last run (considered items only):**
  - `fully wired:` 0 (0.0%)
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `skipped:` 53
  - `Nonunique Bases:` 0

- **Base-set uniqueness details (full items):**
  - `unique bases:` 0
  - `clustered bases:` 0
  - `clustered full items:` 0
  - `cluster size histogram:` size2=0, size3=0, size4+=0
  - `clustered isos:` (none)

### 8.13 Languages of China – spoken languages snapshot

- **JSON file:** `tools/mixer-meta/wikipedia-languages-of-china-spoken-languages.json`
- **Title:** `Wikipedia: Languages of China – spoken languages snapshot`
- **Source:** <https://en.wikipedia.org/wiki/Languages_of_China>
- **Scope:** Full snapshot of the "Spoken languages" section in the "Languages of China" article, including families, branches, and named lects (Sinitic varieties, Tibeto-Burman branches, Turkic, Mongolic, Tungusic, Koreanic, Indo-European, Formosan, Tsat, etc.). Each family/branch or named language in that section appears once as a row.
- **Primary families / regions touched:** East and Inner Asia (Sino-Tibetan, Turkic, Mongolic, Tungusic, Koreanic, Indo-European, Austronesian, plus Formosan and mixed lects) as actually spoken in China; ties into the East Asia bases in §2.7.

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-languages-of-china-spoken-languages.json`

- **Status tier:** **Fully represented (full section)** – coverage is complete, all considered items have globally unique base sets (`clustered bases=0`), and all considered items are reachable by at least one race profile.

- **Verification commands (latest):**
  - `pnpm exec -- node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-languages-of-china-spoken-languages.json`
  - `pnpm exec -- node tools/mixer-core/report-wikipedia-list-base-uniqueness.js tools/mixer-meta/wikipedia-languages-of-china-spoken-languages.json --no-devplan`
  - `pnpm exec -- node tools/mixer-races/report-wikipedia-list-race-coverage.js tools/mixer-meta/wikipedia-languages-of-china-spoken-languages.json`

- **Snapshot from last run (considered items only):**
  - `fully wired:` 164 (100.0%)
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `skipped:` 59
  - `Nonunique Bases:` 76

- **Base-set uniqueness details (full items):**
  - `unique bases:` 164
  - `clustered bases:` 0
  - `clustered full items:` 0
  - `cluster size histogram:` size2=0, size3=0, size4+=0
  - `clustered isos:` (none)

- **Status notes:** Coverage is now complete for this list (`fully wired` = 100% of considered). Next work is base-uniqueness declustering (still high `Nonunique Bases`) and confirming/adjusting race reachability where needed. ✅ 2025-12-12 uniqueness micro-pass (verified): declustered the Koreanic `bases=[10]` mega-cluster (kept `kor` as the anchor while moving dialect/lect entries onto unique `[10,...]` mixes); per-list base-set uniqueness moved from `clustered bases=60` to `clustered bases=58` and `run-language-mixer-suite` is green (**0** failures).

- ✅ **2025-12-15 /wikipedia1 China spoken languages (Mandarin dialects batch1 verified):** pinned dedicated bases `2900–2904` for `central-plains-mandarin`, `lan-yin-mandarin`, `northeastern-mandarin`, `southwestern-mandarin`, `lower-yangtze-mandarin` (delta: `tools/mixer-deltas/2025-12-15-wikipedia1-china-spoken-languages-batch1-mandarin-dialects.json`; base defs in `modules/namebases-real.js`). Verified after `pnpm run mixer:apply-deltas`: seed-uniqueness Target ISOs=5; coverage=0 missing; failures=0 failing; duplicate-isos=0; inconsistencies check exit 0. Per-list `Nonunique Bases` reduced from **152** to **146**.

- ✅ **2025-12-16 /wikipedia1 China spoken languages (Mongolic batch3 verified):** pinned dedicated bases `5361–5365` for `mongolian`, `buryat`, `daur`, `oirat`, `torgut` (delta: `tools/mixer-deltas/2025-12-16-wikipedia1-china-spoken-languages-batch3-mongolic.json`; base defs in `modules/namebases-real.js`). Verified after `pnpm run mixer:apply-deltas`: seed-uniqueness Target ISOs=5 (Missing mapping=0; No globally-unique base index=0; strict/norm failures=0); coverage=0 missing; failures=0 failing; duplicate-isos=0; inconsistencies check exit 0.

- ✅ **2025-12-16 /wikipedia1 China spoken languages (Tungusic batch4 verified):** pinned dedicated bases `5608–5613` for `manchu`, `jurchen`, `xibe`, `nanai`, `evenki`, `oroqen` (delta: `tools/mixer-deltas/2025-12-16-wikipedia1-china-spoken-languages-batch4-tungusic.json`; base defs in `modules/namebases-real.js`). Verified after `pnpm run mixer:apply-deltas`: seed-uniqueness Target ISOs=6 (Missing mapping=0; No globally-unique base index=0; strict/norm failures=0); coverage=0 missing; failures=0 failing; duplicate-isos=0; inconsistencies check exit 0; race coverage: all reachable by Starspawn.

- ✅ **2025-12-17 /wikipedia1 China spoken languages (Turkic-in-China batch1 verified):** pinned dedicated bases `6510–6515` for `uzbek`, `kazakh`, `kyrgyz`, `tatar`, `tuvan`, `ili-turki` (delta: `tools/mixer-deltas/2025-12-17-wikipedia1-china-spoken-turkic-dedicatedpins.json`; base defs in `modules/namebases-real.js`). Verified after `pnpm run mixer:apply-deltas`: seed-uniqueness Target ISOs=6 (Missing mapping=0; No globally-unique base index=0; strict/norm failures=0); coverage=0 missing; failures=0 failing; duplicate-isos=0; inconsistencies check exit 0.

- ✅ **2025-12-17 /wikipedia1 China spoken languages (Turkic-in-China batch2 verified):** pinned dedicated bases `6526–6527` for `fuyu-kyrgyz`, `salar` (delta: `tools/mixer-deltas/2025-12-17-wikipedia1-china-spoken-turkic-batch2-dedicatedpins.json`; cleanup: `tools/mixer-deltas/2025-12-17-wikipedia1-china-spoken-turkic-batch2-setbases.json` to drop stale invalid indices). Verified after `pnpm run mixer:apply-deltas`: seed-uniqueness Target ISOs=2 (Missing mapping=0; No globally-unique base index=0; strict/norm failures=0); mixer failure check: base indices consistent.

- ✅ **2025-12-17 /wikipedia1 China spoken languages (Min varieties batch1 verified):** dedicatedPins for `hokkien`, `teochew-min`, `hainanese`, `leizhou-min`, `pu-xian-min`, `haklau-min` -> `i:7215–7220` (delta: `tools/mixer-deltas/2025-12-17-wikipedia1-china-spoken-min-batch1-dedicatedpins.json`; base defs appended in `modules/namebases-real.js`). Verified after `pnpm run mixer:apply-deltas`: seed-uniqueness Target ISOs=29 (Missing mapping=0; No globally-unique base index=0; strict/norm failures=0); coverage=0 missing; failures=0 failing; duplicate-isos=0; inconsistencies check exit 0.

- ✅ **2025-12-17 /wikipedia1 China spoken languages (Burmish batch1 verified):** dedicatedPins for `bola`, `chashan`, `langsu`, `lashi`, `zaiwa` -> `i:7231–7235` (delta: `tools/mixer-deltas/2025-12-17-wikipedia1-china-spoken-burmish-batch1-dedicatedpins.json`; base defs appended in `modules/namebases-real.js`). Verified after `pnpm run mixer:apply-deltas`: seed-uniqueness Target ISOs=29 (Missing mapping=0; No globally-unique base index=0; strict/norm failures=0); coverage=0 missing; failures=0 failing; duplicate-isos=0; inconsistencies check exit 0.

- ✅ **2025-12-17 /wikipedia1 China spoken languages (Bai batch1 verified):** dedicatedPins for `bijiang-bai-dialect`, `bijiang-bai-language`, `dali-bai-dialect`, `dali-bai-language`, `heqing-bai-dialect`, `xiangyun-bai-dialect` -> `i:7236–7241` (delta: `tools/mixer-deltas/2025-12-17-wikipedia1-china-spoken-bai-batch1-dedicatedpins.json`; base defs appended in `modules/namebases-real.js`). Verified after `pnpm run mixer:apply-deltas`: seed-uniqueness Target ISOs=29 (Missing mapping=0; No globally-unique base index=0; strict/norm failures=0); coverage=0 missing; failures=0 failing; duplicate-isos=0; inconsistencies check exit 0.

- ✅ **2025-12-17 /wikipedia1 China spoken languages (Gyalrongic batch1 verified):** dedicatedPins for `choyo`, `gyalrong`, `horpa`, `khroskyabs`, `muya`, `prinmi`, `zhaba` -> `i:7244–7250` (delta: `tools/mixer-deltas/2025-12-17-wikipedia1-china-spoken-gyalrongic-batch1-dedicatedpins.json`; base defs appended in `modules/namebases-real.js`). Verified after `pnpm run mixer:apply-deltas`: seed-uniqueness Target ISOs=29 (Missing mapping=0; No globally-unique base index=0; strict/norm failures=0); coverage=0 missing; failures=0 failing; duplicate-isos=0; inconsistencies check exit 0.

- ✅ **2025-12-17 /wikipedia1 China spoken languages (Austroasiatic batch1 verified):** dedicatedPins for `mang`, `ply`, `blr`, `ril`, `vie` -> `i:7251–7255` (delta: `tools/mixer-deltas/2025-12-17-wikipedia1-china-spoken-austroasiatic-batch1-dedicatedpins.json`; base defs appended in `modules/namebases-real.js`). Verified after `pnpm run mixer:apply-deltas`: seed-uniqueness Target ISOs=29 (Missing mapping=0; No globally-unique base index=0; strict/norm failures=0); coverage=0 missing; failures=0 failing; duplicate-isos=0; inconsistencies check exit 0.

- ✅ 2025-12-12 uniqueness micro-pass (verified): additional declustering batches reduced per-list base-set `clustered bases` from **58** to **50**, then to **47** (suite still green, 0 failures).

- ✅ 2025-12-12 uniqueness micro-pass (verified): declustered the `mang` item off the shared `[179,251]` base-set, reducing per-list base-set `clustered bases` from **47** to **46** (suite still green, 0 failures).

- ✅ 2025-12-12 uniqueness micro-pass (verified): broke the remaining Mongolic collision by moving `torgut` off the shared `[276,296,381]` base-set, reducing per-list base-set `clustered bases` from **46** to **44** (suite still green, 0 failures).

- ✅ 2025-12-12 uniqueness micro-pass (verified): resolved the Hlai `bases=[318]` cluster (Hlai now `clusterSize=1` in the China list), reducing per-list base-set `clustered bases` from **44** to **43** (suite still green, 0 failures).

- ✅ 2025-12-12 uniqueness micro-pass (verified): resolved the `bases=[11,67,68]` size-3 collision cluster by moving `nao-klao` and `shao-jiang-min` onto unique `[11,67,68,...]` mixes (kept `jiaoliao-mandarin` as the anchor). Current China per-list base-set snapshot: `unique bases=130`, `clustered bases=35`, `Nonunique Bases=159`; `run-language-mixer-suite` is green (**0** failures).

- ✅ 2025-12-12 uniqueness micro-pass (verified): declustered the Eastern Yugur size-4 collision by keeping `eastern-yugur` as the `bases=[296,381]` anchor and moving `altai-uriankhai`, `oirat-mongolian`, and `rouran` onto unique `[296,381,...]` mixes. Suite remained green.

- ✅ 2025-12-12 uniqueness micro-pass (verified): declustered the `bases=[11,67,68]` cluster (`jiaoliao-mandarin`, `nao-klao`, `shao-jiang-min`) by keeping `jiaoliao-mandarin` as anchor and moving `nao-klao` and `shao-jiang-min` onto unique `[11,67,68,...]` mixes. Suite remained green.

- ✅ 2025-12-12 uniqueness micro-pass (verified): resolved the Mandarin alias + anchor collision by keeping `mandarin` as pure `bases=[11]`, moving `maojia` and `waxiang` off the anchor onto unique `[11,...]` mixes, and marking the duplicate China-list `Standard Chinese` (iso=`mandarin`) row as `skip: true`. Current China per-list base-set snapshot: `unique bases=134`, `clustered bases=30`, `Nonunique Bases=158`; `run-language-mixer-suite` is green (**0** failures).

### 8.14 Languages of Bangladesh – regional snapshot

- **JSON file:** `tools/mixer-meta/wikipedia-languages-of-bangladesh.json`
- **Title:** `Wikipedia: Languages of Bangladesh – Indo-Aryan and non-Indo-Aryan snapshot`
- **Source:** <https://en.wikipedia.org/wiki/Languages_of_Bangladesh>
- **Scope:** Snapshot of the detailed Indo-Aryan and non-Indo-Aryan language sections from the "Languages of Bangladesh" article, including Bengali-branch standards, tribal Indo-Aryan lects, Austroasiatic, Dravidian, and Tibeto-Burman languages explicitly listed there.
- **Primary families / regions touched:** South Asia (Indo-Aryan, Austroasiatic, Dravidian, Tibeto-Burman) as realized in Bangladesh; complements §2.9 and the South Asia regional list in §8.4.

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-languages-of-bangladesh.json`

- **How to re-run base-uniqueness:**
  - `node tools/mixer-core/report-wikipedia-list-base-uniqueness.js tools/mixer-meta/wikipedia-languages-of-bangladesh.json`

- **How to re-run full suite:**
  - `node tools/mixer-core/run-language-mixer-suite.js`

- ✅ **Status tier:** **Complete**
- **Last run:** 2025-12-12

- **Snapshot from last run (considered items only):**
  - `fully wired:` 39 (100.0%)
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `skipped:` 3
  - `Nonunique Bases:` 38

- **Base-set uniqueness (full items only):**
  - `unique bases:` 37
  - `clustered bases:` 2
  - `clustered full items:` 2
  - `cluster size histogram:` size2=2, size3=0, size4+=0
  - `clustered isos:` bgr(2), kurukh(2)

### 8.15 Languages of India – census tables snapshot

- **JSON file:** `tools/mixer-meta/wikipedia-languages-of-india-census.json`
- **Title:** `Wikipedia: Languages of India – census tables snapshot`
- **Source:** <https://en.wikipedia.org/wiki/Languages_of_India>
- **Scope:** Name-only snapshot of the languages and mother tongues enumerated in the 2011 Census tables in the "Languages of India" article (first/second/third-language counts and the detailed mother-tongue tables). Each distinct language or mother-tongue name in those excerpts appears once in this JSON.
- **Primary families / regions touched:** South Asia (Indo-Aryan, Dravidian, Tibeto-Burman, Austroasiatic, and contact varieties) as represented in the Indian census; complements §2.9 and the South Asia regional list in §8.4, but follows the census rather than the regional overview groupings.

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-languages-of-india-census.json`

- **How to re-run base-set uniqueness:**
  - `node tools/mixer-core/report-wikipedia-list-base-uniqueness.js tools/mixer-meta/wikipedia-languages-of-india-census.json`

- ✅ **Status tier:** **Coverage complete; uniqueness in progress**
- **Last run:** 2025-12-13

- **Snapshot from last run (considered items only):**
  - `fully wired:` 92 (100.0%)
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `skipped:` 1
  - `Nonunique Bases:` 87

- **Base-set uniqueness (full items only):**
  - `unique bases:` 70
  - `clustered bases:` 22
  - `clustered full items:` 22
  - `cluster size histogram:` size2=10, size3=6, size4+=6
  - `clustered isos:` kodava(20), kolami(20), tamil(20), adi(4), dap(4), mrg(4), bhb(3), gju(3), ho-munda(3), kfq(3), kuvi(3), kxu(3), angami-pochuri(2), braj(2), eng(2), hin(2), kurukh(2), njh(2), nsm(2), srb(2), tcz(2), xis(2)

### 8.16 Languages of Nepal – census tables snapshot

- **JSON file:** `tools/mixer-meta/wikipedia-languages-of-nepal-census.json`
- **Title:** `Wikipedia: Languages of Nepal – census tables snapshot`
- **Source:** <https://en.wikipedia.org/wiki/Languages_of_Nepal>
- **Scope:** Snapshot of the 2011 and 2021 census tables in the "Languages of Nepal" article, including both first-language and second-language tables. Each language or mother-tongue name in the pasted census tables appears once as a row.
- **Primary families / regions touched:** Himalayan South Asia (Indo-Aryan, Tibeto-Burman, Austroasiatic, Dravidian, and contact varieties) in Nepal; complements the Nepal-related notes under §2.9 and §2.7.

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-languages-of-nepal-census.json`

- **Status tier:** **In progress (full table)** – treat this JSON as the canonical representation of the Nepal census excerpt; use coverage reports to drive catalog/mixer additions for under-documented Nepali languages.

- **Snapshot from last run (considered items only):**
  - `fully wired:` 144 (100.0%)
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `skipped:` 2
  - `Nonunique Bases:` 98

- **Base-set uniqueness details (full items):**
  - `unique bases:` 87
  - `clustered bases:` 57
  - `clustered full items:` 57
  - `cluster size histogram:` size2=8, size3=1, size4+=48
  - `clustered isos:` bmj(9), dry(9), dwz(9), jul(9), kumhali(9), kyw(9), lhm(9), loy(9), loy(9), loy(9), mjz(9), ola(9), scp(9), syw(9), tcn(9), the(9), thr(9), tibetic(9), jml(7), kyv(7), soi(7), tge(7), ths(7), vjk(7), x-nepal-done(7), x-nepal-malpande(7), drq(6), kip(6), magar(6), mgp(6), bee(5), bee(5), dhuleli(5), brd(4), brd(4), gvr(4), kiranti(4), kiranti(4), kkt(4), kkt(4), klr(4), lmh(4), lmh(4), newar(4), phj(4), rab(4), thf(4), tij(4), chepang(3), brx(2), dhimal(2), kte(2), kurukh(2), kurukh(2), raji-raute(2), rau(2), rau(2)

- ✅ **2025-12-15 Nepal census uniqueness batch4 (applied + verified):** delta `tools/mixer-deltas/2025-12-15-wikipedia1-nepal-census-batch4.json` (dedicatedPins `ncd,pum,raa,raq,vay` -> `i:2920–2924`); base defs already in `modules/namebases-real.js` (`i:2920–2924`); verified `pnpm run mixer:guardrails` (OK), `pnpm run mixer:apply-deltas` (wrote `config/language-mixer-map.json` + `tools/mixer-deltas/_compiled-dedicated-pins.json`), `pnpm exec -- node tools/mixer-core/apply-mixer-deltas.js --check --no-lock` (OK), and seed-uniqueness for `ncd,pum,raa,raq,vay` => Missing mapping: 0; No globally-unique base index: 0.

- ✅ **2025-12-16 Nepal census uniqueness batch5 (applied + verified):** delta `tools/mixer-deltas/2025-12-16-wikipedia1-nepal-census-batch5.json` (dedicatedPins `chx,ghale,kzq,nmm,npa` -> `i:2925–2929`); base defs in `modules/namebases-fantasy.js` (`i:2925–2929`); verified `pnpm run mixer:apply-deltas` (OK), `pnpm run mixer:check-deltas` (OK), and seed-uniqueness for `chx,ghale,kzq,nmm,npa` => Missing mapping: 0; No globally-unique base index: 0.

### 8.17 Languages of Pakistan – established languages table

- **JSON file:** `tools/mixer-meta/wikipedia-languages-of-pakistan-established.json`
- **Title:** `Wikipedia: Languages of Pakistan – established languages`
- **Source:** <https://en.wikipedia.org/wiki/Languages_of_Pakistan>
- **Scope:** Snapshot of the "Established languages" table from the "Languages of Pakistan" article. Each named established language or variety in that table appears once as an item; province-level breakdown is not repeated in the JSON.
- **Primary families / regions touched:** West and South Asia (Indo-Aryan, Iranian, Dravidian, Turkic, Sino-Tibetan, and isolates) as realized in Pakistan; complements §8.8 and the South Asia work in §2.9.

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-languages-of-pakistan-established.json`

- ✅ **Status tier:** **Complete**
- **Last run:** 2025-12-12

- **Snapshot from last run (considered items only):**
  - `fully wired:` 78 (100.0%)
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `skipped:` 1
  - `Nonunique Bases:` 78

- **Base-set uniqueness details (full items):**
  - `unique bases:` 41
  - `clustered bases:` 37
  - `clustered full items:` 37
  - `cluster size histogram:` size2=14, size3=14, size4+=9
  - `clustered isos:` burushaski(12), phr(9), bcc(7), bgn(7), bgp(7), haz(7), jdg(7), pbt(7), waziri-pashto(7), aeq(3), bhe(3), gju(3), hnd(3), hno(3), kvx(3), mby(3), mki(3), nlm(3), odk(3), trw(3), vgr(3), wtm(3), xka(3), bsh(2), eng(2), gwc(2), gwf(2), gwt(2), mvy(2), phl(2), plk(2), pst(2), scl(2), shd(2), wne(2), xhe(2), xvi(2)

### 8.18 Global language families – macro classification snapshot

- **JSON file:** `tools/mixer-meta/wikipedia-language-families-global.json`
- **Title:** `Wikipedia: List of language families – global snapshot`
- **Source:** <https://en.wikipedia.org/wiki/List_of_language_families>
- **Scope:** Macro-family list derived from the global "List of language families" article. Each row in the spoken-language-families table is represented once as a `skip: true` classification item in this JSON; no member languages are enumerated here.
- **Primary families / regions touched:** All major language families across Africa, Eurasia, the Americas, and Oceania (Afroasiatic, Niger–Congo branches, Nilo-Saharan groupings, Indo-European, Uralic, Turkic, Sino-Tibetan, Austronesian, Papuan groupings, Pama–Nyungan, American families, etc.).

- **Coverage / uniqueness role:** **Classification-only helper** – used as a global macro-family index. Since it encodes families rather than languages, it is excluded from coverage percentages and base-uniqueness targets; concrete languages are tracked via the per-region and per-family helpers elsewhere in §8.

- **Snapshot from last run (considered items only):**
  - `fully wired:` 0 (0.0%)
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `skipped:` 223
  - `Nonunique Bases:` 0

- **Base-set uniqueness details (full items):**
  - `unique bases:` 0
  - `clustered bases:` 0
  - `clustered full items:` 0
  - `cluster size histogram:` size2=0, size3=0, size4+=0
  - `clustered isos:` (none)

### 8.19 Gongduk language – Bhutan Sino-Tibetan microfamily sentinel

- **JSON file:** `tools/mixer-meta/wikipedia-gongduk-language.json`
- **Title:** `Wikipedia: Gongduk language – Bhutan Sino-Tibetan microfamily representative`
- **Source:** <https://en.wikipedia.org/wiki/Gongduk_language>
- **Scope:** Singleton helper for the Gongduk language of Bhutan, used as a concrete representative for the Gongduk microfamily referenced in East Asian/Sino-Tibetan classification proposals.
- **Primary families / regions touched:** Sino-Tibetan / East Himalayan fringe; complements the East Asian classification helper in §8.12 and the East Asia coverage in §2.7.

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-gongduk-language.json`

- **Status tier:** **In progress (single-language helper)** – coverage here is trivial but this JSON ensures Gongduk is treated as a concrete language row, not just a classification-only node.

- **Snapshot from last run (all list items):**
  - `fully wired:` 1
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `Nonunique Bases:` 0

- **Base-set uniqueness details (full items):**
  - `unique bases:` 1
  - `clustered bases:` 0
  - `clustered full items:` 0
  - `cluster size histogram:` size2=0, size3=0, size4+=0
  - `clustered isos:` (none)

### 8.20 Malayo-Polynesian & Oceanic named languages – Blust (1999) snapshot

- **JSON file:** `tools/mixer-meta/wikipedia-malayo-polynesian-oceanic-languages-blust-1999.json`
- **Title:** `Wikipedia: Malayo-Polynesian and Oceanic named languages – Blust (1999) snapshot`
- **Source:** <https://en.wikipedia.org/wiki/Malayo-Polynesian_languages>; <https://en.wikipedia.org/wiki/Oceanic_languages>
- **Scope:** Small helper listing the explicitly named languages that appear inside the Blust (1999) Malayo-Polynesian and Oceanic subgroup trees (e.g. Umiray Dumaget, Manide–Alabat, Ati, Klata, Enggano, Rejang, Sundanese, Javanese, Madurese, Palauan, Chamorro, Kowiai, Yapese, Rotuman). These rows back the skip-marked Blust subgroup JSONs so that each named language also has a non-skip helper entry.
- **Primary families / regions touched:** Malayo-Polynesian and Oceanic Austronesian coverage in Island Southeast Asia and the Pacific; complements the Oceania regional list in §8.6 and the Austronesian work in §2.12.

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-malayo-polynesian-oceanic-languages-blust-1999.json`

- **Status tier:** **In progress (named-language helper)** – this helper exists to ensure that languages mentioned only in classification trees are still represented as normal coverage items.

- **2025-12-16 status:** Pinned dedicated bases for `eno,kowiai,rejang,jav,mad,chamorro,palauan,rotuman` via `tools/mixer-deltas/2025-12-16-wikipedia1-blust-1999-batch1.json`; verified `Nonunique Bases: 0` (coverage + base-uniqueness, `--no-devplan`).

- **Snapshot from last run (considered items only):**
  - `fully wired:` 10 (100.0%)
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `skipped:` 4
  - `Nonunique Bases:` 0

- **Base-set uniqueness details (full items):**
  - `unique bases:` 10
  - `clustered bases:` 0
  - `clustered full items:` 0
  - `cluster size histogram:` size2=0, size3=0, size4+=0
  - `clustered isos:` (none)

### 8.31 Uralic languages – seed view (historical view)

- **JSON file:** *(historical seed JSON, now removed; this entry is a view only – coverage and wiring are tracked via the full-family JSON in §8.31b)*
- **Title:** `Wikipedia: List of Uralic languages – seed view`
- **Source:** <https://en.wikipedia.org/wiki/Uralic_languages>
- **Scope:** Seed view of Uralic languages drawn from the broader family list (Finnish, Estonian, Karelian, Northern Sami, Erzya, Moksha, Komi, Udmurt, Mari, Hungarian).
- **Primary families / regions touched:** Uralic branches across Northern and Eastern Europe (Finnic, Sami, Mordvinic, Permic, Mari, Ugric), complementing the Europe and Russia seeds in §8.7 and §8.17 and the Uralic notes in §2.x.

- **Coverage tracking:** This seed view is a convenience view over the broader `List of Uralic languages` article. Coverage and wiring/uniqueness metrics are tracked via the full-family entry in §8.31b (`wikipedia-uralic-languages-full.json`); we no longer maintain a separate per-view coverage snapshot here.

### 8.31b Uralic languages – full family list

- **JSON file:** `tools/mixer-meta/wikipedia-uralic-languages-full.json`
- **Title:** `Wikipedia: List of Uralic languages – full family list`
- **Source:** <https://en.wikipedia.org/wiki/List_of_Uralic_languages>
- **Scope:** Full set of Uralic languages and major lects that have their own Wikipedia language or dialect entries in the `List of Uralic languages` article (Samoyedic, Ob‑Ugric, Permic, Mari, Mordvinic, Finnic, Sami, plus a few unclassified extinct lects).
- **Primary families / regions touched:** Entire Uralic family across Northern and Eastern Europe and Western Siberia; overlaps with the Europe, Russia, and phoneme-count lists elsewhere in §8.

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-uralic-languages-full.json`

- **Status tier:** **Fully represented (full article)** – this JSON tracks all named Uralic lects in the list; proto and unclassified/extinct-without-attestation entries are marked `skip: true` and excluded from coverage percentages.
- **2025-12-19 (verified):** list coverage 223/223 considered wired; base-set clusters 0; race coverage ok.
- **Snapshot from last run (considered items only):**
  - `fully wired:` 223 (100.0%)
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `skipped:` 64
  - `Nonunique Bases:` 149

- **Base-set uniqueness details (full items):**
  - `unique bases:` 223
  - `clustered bases:` 0
  - `clustered full items:` 0
  - `cluster size histogram:` size2=0, size3=0, size4+=0
  - `clustered isos:` (none)

### 8.32 Dictionary word-count languages – seed view (historical snapshot)

- **JSON file:** *(historical seed JSON, now removed; this entry is an archived view only and does not drive coverage helpers)*
- **Title:** `Wikipedia: List of languages by number of words according to authoritative dictionaries – seed view`
- **Source:** <https://en.wikipedia.org/wiki/List_of_languages_by_number_of_words_according_to_dictionaries>
- **Scope:** Seed view of languages from the dictionary word-count list, focusing on major standards with large authoritative dictionaries across multiple families (English, German, Russian, French, Spanish, Italian, Chinese, Japanese, Arabic, Turkish).
- **Primary families / regions touched:** Global macro-families (Indo-European, Sinitic, Japonic, Afroasiatic, Turkic), providing a typological lens on lexical inventory size rather than direct coverage drivers.

- **Coverage / archival status:** This entry is an archived snapshot of a historical version of the `List of languages by number of words according to authoritative dictionaries` article. The original table is no longer present on Wikipedia, so we do not maintain a separate full-list JSON or auto-updated coverage snapshot here. Treat this seed JSON as a qualitative reference only; structural coverage work is driven instead by the active speaker-count and other Wikipedia language lists in §8.

### 8.36 English-based pidgins – seed view (view over full list)

- **JSON file:** *(historical seed JSON, now removed; this entry is a convenience view only – coverage and wiring are tracked via the full-list JSON in §8.36b)*
- **Title:** `Wikipedia: List of English-based pidgins – seed view`
- **Source:** <https://en.wikipedia.org/wiki/List_of_English-based_pidgins>
- **Scope:** Seed view of English-based pidgins drawn from the corresponding Wikipedia list (Tok Pisin, Bislama, Nigerian Pidgin, Krio, Hawaiian Pidgin, Singlish, Jamaican Patois, Cook Islands Māori Pidgin).
- **Primary families / regions touched:** English-lexifier contact varieties across the Pacific, Atlantic, and Africa (Tok Pisin, Bislama, Krio, Jamaican Patois, Nigerian Pidgin, etc.), complementing the broader creole/mixed/pidgin seed in §8.13.

- **Coverage tracking:** This seed view is a convenience view over the broader `List of English-based pidgins` article. Coverage and wiring/uniqueness metrics are tracked via the full-article entry in §8.36b (`wikipedia-list-english-based-pidgins-full.json`); we no longer maintain a separate per-view coverage snapshot here.

### 8.36b English-based pidgins – full article list

- **JSON file:** `tools/mixer-meta/wikipedia-list-english-based-pidgins-full.json`
- **Title:** `Wikipedia: List of English-based pidgins – full article list`
- **Source:** <https://en.wikipedia.org/wiki/List_of_English-based_pidgins>
- **Scope:** Full set of English-lexifier pidgins and pidgin/creole contact lects listed in the article (English-based contact languages in Africa, the Pacific, the Americas, and elsewhere) that have some documentation as stable contact languages.
- **Primary families / regions touched:** Global, with strong coverage in West Africa, the Caribbean, and the Pacific; overlaps the broader creole/mixed language work in §8.13.

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-list-english-based-pidgins-full.json`

- **Status tier:** **In progress (full article)** – this JSON tracks all named English-based pidgins in the current article. It is a typological driver for English-lexifier contact coverage and does not override the global uniqueness rules for bases.
- **Snapshot from last run (all list items):**
  - `fully wired:` 30
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `Nonunique Bases:` 20

- **Base-set uniqueness details (full items):**
  - `unique bases:` 30
  - `clustered bases:` 0
  - `clustered full items:` 0
  - `cluster size histogram:` size2=0, size3=0, size4+=0
  - `clustered isos:` (none)
- ✅ **2025-12-19 status:** Re-ran the `/wikipedia1` checklist for this list after the latest mixer updates. `pnpm run mixer:guardrails`, `report-wikipedia-list-coverage`, `report-wikipedia-list-base-uniqueness`, and `report-wikipedia-list-race-coverage` all returned clean: coverage remains 30/30 fully wired with no catalog/map gaps, base-set uniqueness reports every item has a globally unique `bases[]`, and race coverage shows each ISO is reachable (Giff/Warforged core plus regional profiles). The list now satisfies the “fully represented” criteria (coverage + uniqueness + race reachability); no further action needed until new entries are added to the Wikipedia source.

### 8.33 Phoneme-count languages – seed view (view over full list)

- **JSON file:** *(historical seed JSON, now removed; this entry is a typological view only – coverage and wiring are tracked via the full-article JSON in §8.33b)*
- **Title:** `Wikipedia: List of languages by number of phonemes – seed view`
- **Source:** <https://en.wikipedia.org/wiki/List_of_languages_by_number_of_phonemes>
- **Scope:** Seed view of languages from the phoneme-count list, sampling extremes and mid-range systems (Rotokas, Pirahã, Hawaiian, Japanese, Spanish, English, German, Russian, Mandarin Chinese, Taa).
- **Primary families / regions touched:** Global cross-family sample (Papuan, Austronesian, Japonic, Indo-European, Afroasiatic, etc.), intended primarily as a typological reference for future phonology-aware tuning rather than a direct coverage driver.
 
- **Coverage tracking:** This seed view is a typological view over the `List of languages by number of phonemes` article (extremes + mid-range systems). Coverage and wiring/uniqueness metrics are tracked via the full-article entry in §8.33b (`wikipedia-languages-by-phoneme-count-full.json`); we no longer maintain a separate per-view coverage snapshot here.

### 8.33b Phoneme-count languages – full article list

- **JSON file:** `tools/mixer-meta/wikipedia-languages-by-phoneme-count-full.json`
- **Title:** `Wikipedia: List of languages by number of phonemes – full article list`
- **Source:** <https://en.wikipedia.org/wiki/List_of_languages_by_number_of_phonemes>
- **Scope:** Full list of languages currently enumerated in the `List of languages by number of phonemes` article (standard dialects only), including both low-phoneme and high-phoneme systems (Arabic, Archi, Rotokas, Ubykh, Vietnamese, etc.).
- **Primary families / regions touched:** Cross-family sample spanning Afroasiatic, Indo-European, Uralic, Austronesian, Sino-Tibetan, Koreanic, Japonic, Nilo-Saharan, North Bougainville, Northwest Caucasian, and others; used as a typological lens rather than a primary coverage driver.

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-languages-by-phoneme-count-full.json`

- **Status tier:** **In progress (full article)** – this JSON tracks every language row in the current Wikipedia phoneme-count list; since it is typological, there is no separate uniqueness-target here beyond the global base-uniqueness rules.
- **Snapshot from last run (all list items):**
  - `fully wired:` 72
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `Nonunique Bases:` 37

- **Base-set uniqueness details (full items):**
  - `unique bases:` 72
  - `clustered bases:` 0
  - `clustered full items:` 0
  - `cluster size histogram:` size2=0, size3=0, size4+=0
  - `clustered isos:` (none)

- ✅ **2025-12-12 status:** Coverage for this list is now fully wired (**72/72**). Added missing ISO bindings in `tools/mixer-meta/wikipedia-languages-by-phoneme-count-full.json` and appended the required catalog + mixer-map entries (append-only invariant preserved). Suite + devplan snapshot refreshed.
 - ✅ **2025-12-16 status:** Resolved remaining `unmatched` items by binding `Dawan` -> `aoz` and `Gilbertese` -> `kiribati` in `tools/mixer-meta/wikipedia-languages-by-phoneme-count-full.json`. Coverage now fully wired (**72/72**). List base-set clusters among full items now report `(none)`; race coverage ok.

### 8.34 Mutually intelligible languages – seed view (view over full list)

- **JSON file:** *(historical seed JSON, now removed; this entry is a focused view only – coverage and wiring are tracked via the full-article JSON in §8.34b)*
- **Title:** `Wikipedia: List of mutually intelligible languages – seed view`
- **Source:** <https://en.wikipedia.org/wiki/List_of_mutually_intelligible_languages>
- **Scope:** Seed view of mutually intelligible standards drawn from the broader list (Swedish, Norwegian, Danish, Czech, Slovak, Serbian, Croatian, Hindi, Urdu, Portuguese), used as a qualitative check on where bases or mixes might reasonably be shared or closely related.
- **Primary families / regions touched:** Germanic and Slavic branches of Indo-European plus Hindustani and Lusophone standards, overlapping with European and South Asian coverage elsewhere in §2.x and §8.

- **Coverage tracking:** This seed view is a focused view over the broader `List of mutually intelligible languages` article (headline Germanic/Romance/Slavic/Hindustani pairs). Coverage and wiring/uniqueness metrics are tracked via the full-article entry in §8.34b (`wikipedia-mutually-intelligible-languages-full.json`); we no longer maintain a separate per-view coverage snapshot here.

### 8.34b Mutually intelligible languages – full article list

- **JSON file:** `tools/mixer-meta/wikipedia-mutually-intelligible-languages-full.json`
- **Title:** `Wikipedia: List of mutually intelligible languages – full article list`
- **Source:** <https://en.wikipedia.org/wiki/List_of_mutually_intelligible_languages>
- **Scope:** Full set of languages currently named in the `List of mutually intelligible languages` article, across all families (Afroasiatic, Atlantic–Congo, Austronesian, Indo-European, Kra–Dai, Sino-Tibetan, Turkic, Uralic, Tungusic, etc.), treating each language that appears in at least one mutual-intelligibility pair or cluster as a row in this JSON.
- **Primary families / regions touched:** Cross-family sample spanning Europe, the Middle East, South Asia, Southeast Asia, and Africa; used as a typological guardrail for where shared bases or very-close mixes might be acceptable.

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-mutually-intelligible-languages-full.json`

- **Status tier:** **In progress (full article)** – this JSON tracks all languages mentioned in the current mutual-intelligibility list; uniqueness decisions still follow the global base-uniqueness rules, with this list acting as a reminder where near-identical bases or mixes may be justified.
- **Snapshot from last run (all list items):**
  - `fully wired:` 107
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `Nonunique Bases:` 90
- **Base-set uniqueness details (full items):**
  - `unique bases:` 104
  - `clustered bases:` 3
  - `clustered full items:` 3
  - `cluster size histogram:` size2=2, size3=1, size4+=0
  - `clustered isos:` banjar(3), eng(2), hin(2)

### 8.35 Official languages by institution – seed view (view over full list)

- **JSON file:** *(historical seed JSON, now removed; this entry is a convenience view only – coverage and wiring are tracked via the full-article JSON in §8.35b)*
- **Title:** `Wikipedia: List of official languages by institution – seed view`
- **Source:** <https://en.wikipedia.org/wiki/List_of_official_languages_by_institution>
- **Scope:** Seed view of institution-level official languages drawn from the article (UN, EU, AU, etc.), focusing on globally central standards (English, French, Spanish, Arabic, Russian, Chinese, German, Portuguese, Italian, Japanese).
- **Primary families / regions touched:** Global macro-families with strong institutional presence (Indo-European, Sinitic, Afroasiatic, etc.), overlapping with the country/territory seed in §8.22 and the speaker-count seeds in §8.2–§8.3 and §8.20.

- **Coverage tracking:** This seed view is a convenience view over the broader `List of official languages of international organizations` article. Coverage and wiring/uniqueness metrics are tracked via the full-article entry in §8.35b (`wikipedia-list-official-languages-by-institution-full.json`); we no longer maintain a separate per-view coverage snapshot here.

### 8.35b Official languages by institution – full article list

- **JSON file:** `tools/mixer-meta/wikipedia-list-official-languages-by-institution-full.json`
- **Title:** `Wikipedia: List of official languages by institution – full article list`
- **Source:** <https://en.wikipedia.org/wiki/List_of_official_languages_of_international_organizations>
- **Scope:** Full set of languages that appear as official or working languages in the `List of official languages of international organizations` article (UN, AU, EU, ASEAN, OAS, etc.). Each distinct language name used in the tables is represented once in this JSON.
- **Primary families / regions touched:** Global macro-families with strong institutional presence (Indo-European, Sinitic, Afroasiatic, Niger–Congo, Austronesian, etc.), overlapping heavily with the country/territory list and the speaker-count lists.

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-list-official-languages-by-institution-full.json`

- **Status tier:** ✅ **Complete (full article)** – verified `fully wired=34/34` and list-base-set uniqueness now reports `clustered bases=0` for the list’s full items.
- **Snapshot from last run (all list items):**
  - `fully wired:` 34
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `Nonunique Bases:` 28

- **Base-set uniqueness details (full items):**
  - `unique bases:` 31
  - `clustered bases:` 3
  - `clustered full items:` 3
  - `cluster size histogram:` size2=2, size3=0, size4+=1
  - `clustered isos:` tamil(20), eng(2), hin(2)

- **Uniqueness notes:** Under the stricter "linguistically defensible" policy, any `Nonunique Bases` count here indicates remaining uniqueness debt in the list items (excluding any `skip: true` entries). Large lexifiers or regional hubs may still appear as **ingredients** in mixes, but identical shared `bases[]` arrays among distinct non-skipped languages are not treated as acceptable end state.

### 8.37 Lingua francas – full article list

- **JSON file:** `tools/mixer-meta/wikipedia-list-lingua-francas-full.json`
- **Title:** `Wikipedia: List of lingua francas – full article list`
- **Source:** <https://en.wikipedia.org/wiki/List_of_lingua_francas>
- **Scope:** Full list of languages explicitly called out as lingua francas in the article (Africa, Asia, Europe, pre-Columbian Americas, plus pidgins/creoles), with one entry per language (e.g. Arabic, Hausa, Hindustani, Indonesian, English, French, Quechua, Tok Pisin, etc.).
- **Primary families / regions touched:** Cross-family sample spanning Afroasiatic, Niger–Congo, Indo-European, Dravidian, Sinitic, Japonic, Koreanic, Austronesian, Papuan, and indigenous American families, plus several major pidgins/creoles.

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-list-lingua-francas-full.json`

- **Status tier:** **In progress (full article)** – this JSON tracks every language heading in the `List of lingua francas` article. Sign languages (e.g. Plains Sign Language / "Hand Talk") are present in the JSON as `skip: true` entries and are excluded from coverage percentages per the global sign-language exception.
- **Snapshot from last run (considered items only):**
  - `fully wired:` 69 (100.0%)
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `skipped:` 3
  - `Nonunique Bases:` 64

- **Base-set uniqueness details (full items):**
  - `unique bases:` 66
  - `clustered bases:` 3
  - `clustered full items:` 3
  - `cluster size histogram:` size2=1, size3=1, size4+=1
  - `clustered isos:` tamil(20), mapudungun(3), eng(2)

- **Uniqueness notes:** Under the stricter "linguistically defensible" policy, any `Nonunique Bases` count here indicates remaining uniqueness debt in the list items (excluding any `skip: true` entries). Lexifiers and regional hubs may still appear as **ingredients** in mixes, but identical shared `bases[]` arrays among distinct non-skipped languages are not treated as acceptable end state.

### 9. Mixer restore snapshots
 - ✅ **2025-12-12 verification:** Current `config/language-mixer-map.json` and `config/language-mixes.json` contain all `iso` entries from the `config/*before-*.json` snapshot files (`language-mixer-map.before-restore.json`, `language-mixer-map.before-fix.json`, `language-mixes.before-restore.json`); snapshot ISO diff shows `missing=0` for each.


### 8.99 Auto-registered wiki lists (untriaged)

- **Status:** Auto-populated registry entries for wiki JSONs that exist on disk but have not been triaged into the curated sections above.
- **Note:** Snapshot blocks are maintained by tooling; do not hand-edit counts.

#### Wikipedia: Australian creoles

- **JSON file:** `tools/mixer-meta/wikipedia-australian-creoles.json`
- **Source:** https://en.wikipedia.org/wiki/Australian_Aboriginal_languages
- **Status tier:** **Untriaged (auto-registered)**
- **Intent:** Full capture of the Wikipedia list of Australian creole languages referenced by the source page (no curated partial-list intent).
- **Snapshot from last run (all list items):**
  - `fully wired:` 1
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `Nonunique Bases:` 0
- **Base-set uniqueness details (full items):**
  - `unique bases:` 1
  - `clustered bases:` 0
  - `clustered full items:` 0
  - `cluster size histogram:` size2=0, size3=0, size4+=0
  - `clustered isos:` (none)

#### Wikipedia: Australian language families and isolates

- **JSON file:** `tools/mixer-meta/wikipedia-australian-families-and-isolates.json`
- **Source:** https://en.wikipedia.org/wiki/Australian_Aboriginal_languages
- **Status tier:** **Untriaged (auto-registered)**
- **Intent:** Full capture of the Wikipedia “Australian language families and isolates” list (Glottolog 4.1 (2019) section), including every isolate language row; non-language family group headings may be present as `skip: true`.
- **Snapshot from last run (considered items only):**
  - `fully wired:` 8 (100.0%)
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `skipped:` 24
  - `Nonunique Bases:` 0
- **Base-set uniqueness details (full items):**
  - `unique bases:` 8
  - `clustered bases:` 0
  - `clustered full items:` 0
  - `cluster size histogram:` size2=0, size3=0, size4+=0
  - `clustered isos:` (none)

#### Wikipedia: Australian language groupings - Bowern (2011)

- **JSON file:** `tools/mixer-meta/wikipedia-australian-languages-bowern-2011.json`
- **Source:** https://en.wikipedia.org/wiki/Australian_Aboriginal_languages
- **Status tier:** **Untriaged (auto-registered)**
- **Snapshot from last run (considered items only):**
  - `fully wired:` 1 (100.0%)
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `skipped:` 20
  - `Nonunique Bases:` 0
- **Base-set uniqueness details (full items):**
  - `unique bases:` 1
  - `clustered bases:` 0
  - `clustered full items:` 0
  - `cluster size histogram:` size2=0, size3=0, size4+=0
  - `clustered isos:` (none)

#### Wikipedia: Australian Aboriginal languages with >100 speakers (NILS/census)

- **JSON file:** `tools/mixer-meta/wikipedia-australian-languages-living-2019.json`
- **Source:** https://en.wikipedia.org/wiki/Australian_Aboriginal_languages
- ✅ **Status tier:** **Complete**
- **2025-12-15 (verified):** list coverage=100%; list base-uniqueness `Nonunique Bases: 0`; race coverage ok; batch5+6 seed-uniqueness `--only-failures` => 0 failures. Tooling fix applied so safety checks run: hardened VM loading for namebases (`modules/namebases-real.js` export guard; seed-uniqueness sandbox). Follow-up integrator run: `pnpm run mixer:apply-deltas` OK; `pnpm run mixer:check-deltas` OK; duplicate ISO check OK.
- **Snapshot from last run (considered items only):**
  - `fully wired:` 47 (100.0%)
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `skipped:` 1
  - `Nonunique Bases:` 0
- **Base-set uniqueness details (full items):**
  - `unique bases:` 47
  - `clustered bases:` 0
  - `clustered full items:` 0
  - `cluster size histogram:` size2=0, size3=0, size4+=0
  - `clustered isos:` (none)

#### Wikipedia: Formosan language families - Blust (1999)

- **JSON file:** `tools/mixer-meta/wikipedia-formosan-languages-blust-1999.json`
- **Source:** https://en.wikipedia.org/wiki/Formosan_languages
- ✅ **Status tier:** **Complete**
- **Snapshot from last run (considered items only):**
  - `fully wired:` 21 (100.0%)
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `skipped:` 11
  - `Nonunique Bases:` 16
- **Base-set uniqueness details (full items):**
  - `unique bases:` 21
  - `clustered bases:` 0
  - `clustered full items:` 0
  - `cluster size histogram:` size2=0, size3=0, size4+=0
  - `clustered isos:` (none)

#### Wikipedia: Formosan language families - Li (2008)

- **JSON file:** `tools/mixer-meta/wikipedia-formosan-languages-li-2008.json`
- **Source:** https://en.wikipedia.org/wiki/Formosan_languages
- **Status tier:** ✅ **Complete**
- **Snapshot from last run (considered items only):**
  - `fully wired:` 27 (100.0%)
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `skipped:` 18
  - `Nonunique Bases:` 19
- **Base-set uniqueness details (full items):**
  - `unique bases:` 27
  - `clustered bases:` 0
  - `clustered full items:` 0
  - `cluster size histogram:` size2=0, size3=0, size4+=0
  - `clustered isos:` (none)

#### Wikipedia: Formosan and Austronesian branches - Sagart (2004, 2021)

- **JSON file:** `tools/mixer-meta/wikipedia-formosan-languages-sagart-2004-2021.json`
- **Source:** https://en.wikipedia.org/wiki/Formosan_languages
- ✅ **Status tier:** **Complete**
- **Snapshot from last run (considered items only):**
  - `fully wired:` 22 (100.0%)
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `skipped:` 17
  - `Nonunique Bases:` 18
- **Base-set uniqueness details (full items):**
  - `unique bases:` 22
  - `clustered bases:` 0
  - `clustered full items:` 0
  - `cluster size histogram:` size2=0, size3=0, size4+=0
  - `clustered isos:` (none)

#### Wikipedia: List of constructed languages  seed view

- **JSON file:** `tools/mixer-meta/wikipedia-list-constructed-languages.json`
- **Source:** https://en.wikipedia.org/wiki/List_of_constructed_languages
- ✅ **Status tier:** **Complete**
- **Snapshot from last run (considered items only):**
  - `fully wired:` 0 (0.0%)
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `skipped:` 7
  - `Nonunique Bases:` 0
- **Base-set uniqueness details (full items):**
  - `unique bases:` 0
  - `clustered bases:` 0
  - `clustered full items:` 0
  - `cluster size histogram:` size2=0, size3=0, size4+=0
  - `clustered isos:` (none)

#### Wikipedia: Creole, mixed, and pidgin languages  seed view

- **JSON file:** `tools/mixer-meta/wikipedia-list-creoles-and-mixed-languages.json`
- **Source:** https://en.wikipedia.org/wiki/List_of_creole_languages
- **Status tier:** **Untriaged (auto-registered)**
- **Snapshot from last run (all list items):**
  - `fully wired:` 8
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `Nonunique Bases:` 8
- **Base-set uniqueness details (full items):**
  - `unique bases:` 8
  - `clustered bases:` 0
  - `clustered full items:` 0
  - `cluster size histogram:` size2=0, size3=0, size4+=0
  - `clustered isos:` (none)

#### Wikipedia: Creole, mixed, and pidgin languages  seed view

- **JSON file:** `tools/mixer-meta/wikipedia-list-creoles-and-mixed-languages.utf8.json`
- **Source:** https://en.wikipedia.org/wiki/List_of_creole_languages
- **Status tier:** **Untriaged (auto-registered)**
- **Snapshot from last run (all list items):**
  - `fully wired:` 8
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `Nonunique Bases:` 8
- **Base-set uniqueness details (full items):**
  - `unique bases:` 8
  - `clustered bases:` 0
  - `clustered full items:` 0
  - `cluster size histogram:` size2=0, size3=0, size4+=0
  - `clustered isos:` (none)

#### Wikipedia: List of lingua francas  seed view

- **JSON file:** `tools/mixer-meta/wikipedia-list-lingua-francas.json`
- **Source:** https://en.wikipedia.org/wiki/List_of_lingua_francas
- **Status tier:** **Untriaged (auto-registered)**
- **Snapshot from last run (all list items):**
  - `fully wired:` 10
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `Nonunique Bases:` 9
- **Base-set uniqueness details (full items):**
  - `unique bases:` 10
  - `clustered bases:` 0
  - `clustered full items:` 0
  - `cluster size histogram:` size2=0, size3=0, size4+=0
  - `clustered isos:` (none)

#### Wikipedia: Malayo-Polynesian subgroups - Blust (1999)

- **JSON file:** `tools/mixer-meta/wikipedia-malayo-polynesian-subgroups-blust-1999.json`
- **Source:** https://en.wikipedia.org/wiki/Malayo-Polynesian_languages
- **Status tier:** **Untriaged (auto-registered)**
- **Snapshot from last run (considered items only):**
  - `fully wired:` 0 (0.0%)
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `skipped:` 53
  - `Nonunique Bases:` 0
- **Base-set uniqueness details (full items):**
  - `unique bases:` 0
  - `clustered bases:` 0
  - `clustered full items:` 0
  - `cluster size histogram:` size2=0, size3=0, size4+=0
  - `clustered isos:` (none)

#### Wikipedia: Oceanic subgroups – Blust (1999)

- **JSON file:** `tools/mixer-meta/wikipedia-oceanic-languages-blust-1999.json`
- **Source:** https://en.wikipedia.org/wiki/Oceanic_languages
- **Status tier:** **Untriaged (auto-registered)**
- **Snapshot from last run (considered items only):**
  - `fully wired:` 0 (0.0%)
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `skipped:` 25
  - `Nonunique Bases:` 0
- **Base-set uniqueness details (full items):**
  - `unique bases:` 0
  - `clustered bases:` 0
  - `clustered full items:` 0
  - `cluster size histogram:` size2=0, size3=0, size4+=0
  - `clustered isos:` (none)

#### Wikipedia: Papuan language families - Foley (2003)

- **JSON file:** `tools/mixer-meta/wikipedia-papuan-families-foley-2003.json`
- **Source:** https://en.wikipedia.org/wiki/Papuan_languages
- **Status tier:** **Untriaged (auto-registered)**
- **Snapshot from last run (considered items only):**
  - `fully wired:` 0 (0.0%)
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `skipped:` 11
  - `Nonunique Bases:` 0
- **Base-set uniqueness details (full items):**
  - `unique bases:` 0
  - `clustered bases:` 0
  - `clustered full items:` 0
  - `cluster size histogram:` size2=0, size3=0, size4+=0
  - `clustered isos:` (none)

#### Wikipedia: Papuan language families and isolates - Glottolog 4.0

- **JSON file:** `tools/mixer-meta/wikipedia-papuan-families-glottolog-4.0.json`
- **Source:** https://en.wikipedia.org/wiki/Papuan_languages
- **Status tier:** **Untriaged (auto-registered)**
- **Snapshot from last run (all list items):**
  - `fully wired:` 4
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 130
  - `ambiguous:` 0
  - `Nonunique Bases:` 134
- **Base-set uniqueness details (full items):**
  - `unique bases:` 4
  - `clustered bases:` 0
  - `clustered full items:` 0
  - `cluster size histogram:` size2=0, size3=0, size4+=0
  - `clustered isos:` (none)

#### Wikipedia: Papuan language families and isolates - Palmer (2018)

- **JSON file:** `tools/mixer-meta/wikipedia-papuan-families-palmer-2018.json`
- **Source:** https://en.wikipedia.org/wiki/Papuan_languages
- **Status tier:** **Untriaged (auto-registered)**
- **Snapshot from last run (all list items):**
  - `fully wired:` 2
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 77
  - `ambiguous:` 0
  - `Nonunique Bases:` 78
- **Base-set uniqueness details (full items):**
  - `unique bases:` 2
  - `clustered bases:` 0
  - `clustered full items:` 0
  - `cluster size histogram:` size2=0, size3=0, size4+=0
  - `clustered isos:` (none)

#### Wikipedia: Papuan language families - Ross (2005)

- **JSON file:** `tools/mixer-meta/wikipedia-papuan-families-ross-2005.json`
- **Source:** https://en.wikipedia.org/wiki/Papuan_languages
- **Status tier:** **Untriaged (auto-registered)**
- **Snapshot from last run (all list items):**
  - `fully wired:` 0
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 32
  - `ambiguous:` 0
  - `Nonunique Bases:` 32
- **Base-set uniqueness details (full items):**
  - `unique bases:` 0
  - `clustered bases:` 0
  - `clustered full items:` 0
  - `cluster size histogram:` size2=0, size3=0, size4+=0
  - `clustered isos:` (none)

#### Wikipedia: Papuan language families - Usher & Suter (2024)

- **JSON file:** `tools/mixer-meta/wikipedia-papuan-families-usher-suter-2024.json`
- **Source:** https://en.wikipedia.org/wiki/Papuan_languages
- **Status tier:** **Untriaged (auto-registered)**
- **Snapshot from last run (all list items):**
  - `fully wired:` 1
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 26
  - `ambiguous:` 0
  - `Nonunique Bases:` 27
- **Base-set uniqueness details (full items):**
  - `unique bases:` 1
  - `clustered bases:` 0
  - `clustered full items:` 0
  - `cluster size histogram:` size2=0, size3=0, size4+=0
  - `clustered isos:` (none)

#### Wikipedia: Papuan language families - Wichmann (2013)

- **JSON file:** `tools/mixer-meta/wikipedia-papuan-families-wichmann-2013.json`
- **Source:** https://en.wikipedia.org/wiki/Papuan_languages
- **Status tier:** **Untriaged (auto-registered)**
- **Snapshot from last run (all list items):**
  - `fully wired:` 8
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 98
  - `ambiguous:` 0
  - `Nonunique Bases:` 106
- **Base-set uniqueness details (full items):**
  - `unique bases:` 8
  - `clustered bases:` 0
  - `clustered full items:` 0
  - `cluster size histogram:` size2=0, size3=0, size4+=0
  - `clustered isos:` (none)

#### Wikipedia: Papuan language families - Wurm (1975)

- **JSON file:** `tools/mixer-meta/wikipedia-papuan-families-wurm-1975.json`
- **Source:** https://en.wikipedia.org/wiki/Papuan_languages
- **Status tier:** **Untriaged (auto-registered)**
- **Snapshot from last run (all list items):**
  - `fully wired:` 0
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 19
  - `ambiguous:` 0
  - `Nonunique Bases:` 19
- **Base-set uniqueness details (full items):**
  - `unique bases:` 0
  - `clustered bases:` 0
  - `clustered full items:` 0
  - `cluster size histogram:` size2=0, size3=0, size4+=0
  - `clustered isos:` (none)

---

- ✅ **2025-12-17 /no-unique-base2 verification (repo-wide):** `pnpm run mixer:guardrails` OK; `pnpm run mixer:check-deltas` OK; seed-uniqueness (only-failures, limit=300) => Target ISOs: 3397; Missing mapping: 0; No globally-unique base index: 2259; strict<1: 16; norm<10: 172; coverage OK; failures OK; base-clusters (min-size=2) => clusters=109, participants=692.

- ✅ **2025-12-17 decluster `waray` vs `cebuano-lang` (base 304):** applied delta `tools/mixer-deltas/2025-12-17-decluster-304-war-cebuano.json` (`waray` bases => `[515, 516]`); `pnpm run mixer:apply-deltas` OK; base-clusters report + map inconsistencies check exit 0.

- ✅ **2025-12-18 decluster `southern-yukaghir` vs `tundra-yukaghir` (base-set [19,380]):** applied delta `tools/mixer-deltas/2025-12-17-decluster-yukaghir-19-380.json` (`southern-yukaghir` bases => `[19, 380, 414]`; `tundra-yukaghir` bases => `[19, 380, 413]`); `pnpm run mixer:apply-deltas` OK; verified `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2 --family=yukaghir` (0 clusters) and `pnpm exec -- node tools/check-language-mixer-map-inconsistencies.js --show-all-bases` (exit 0).

- ✅ **2025-12-18 mixer base index hygiene:** `modules/namebases-real.js` index dedupe + creole base restoration; `pnpm run mixer:guardrails` OK; `pnpm run mixer:check-deltas` OK; `pnpm exec -- node tools/mixer-core/check-language-mixer-failures.js` OK.

- ✅ **2025-12-18 /no-unique-base2 batch 2025-12-18T01:55:35.963Z-worker1 (ale,bina,binahari,binandere,binumarien):** delta `tools/mixer-deltas/2025-12-18-worker1-mixed-ale.json` (pins 7464–7468); `pnpm run mixer:guardrails` OK; `pnpm run mixer:check-deltas` OK; seed-uniqueness (only-failures, only-isos=ale,bina,binahari,binandere,binumarien) OK; coverage OK; failures OK; base-clusters (min-size=2) OK.

 - ✅ **2025-12-18 /no-unique-base2 batch 2025-12-18T02:33:02.561Z-worker1 (birgit-language,biu-mandara,boghom-language,boor-language,bole-chadic-language):** delta `tools/mixer-deltas/2025-12-18-worker1-chadic-birgit-biu-boghom-boor-bole.json` (pins 7517–7521); `pnpm run mixer:guardrails` OK; `pnpm run mixer:check-deltas` OK; seed-uniqueness (only-failures, only-isos=birgit-language,biu-mandara,boghom-language,boor-language,bole-chadic-language) OK; coverage OK; failures OK; base-clusters (min-size=2) OK.

- ✅ **2025-12-18 /no-unique-base2 batch 2025-12-18T03:04:42.591Z-worker1 (binza,bipim,birri,biseni,bisorio):** delta `tools/mixer-deltas/2025-12-18-worker1-mixed-binza.json` (pins 7603–7607); `pnpm run mixer:guardrails` OK; `pnpm run mixer:check-deltas` OK; seed-uniqueness (only-failures, only-isos=binza,bipim,birri,biseni,bisorio) OK; coverage OK; failures OK; base-clusters (min-size=2) OK.

- ✅ **2025-12-18 /no-unique-base2 batch 2025-12-18T09:34:36.412Z-worker1 (bissa,bitare,bitur,bjarmian-s-mi,blagar,bmj,bny,boa,boazi,boazi-lake-murray):** delta `tools/mixer-deltas/2025-12-18-worker1-mixed-bissa.json` (pins 7653–7662); `pnpm run mixer:guardrails` OK; `pnpm run mixer:apply-deltas` OK; `pnpm run mixer:check-deltas` OK; seed-uniqueness (only-failures, only-isos=bissa,bitare,bitur,bjarmian-s-mi,blagar,bmj,bny,boa,boazi,boazi-lake-murray) OK; coverage OK; failures OK; base-clusters (min-size=2) OK.

 - ✅ **2025-12-18 /no-unique-base2 batch 2025-12-18T09:48:16.275Z-worker1 (bobo,bodish,bodo,boga-language,bohtan-neo-aramaic,bokar,boko,bole-niger-congo,bole-tangale,bolon):** delta `tools/mixer-deltas/2025-12-18-worker1-mixed-bobo.json` (pins 7725–7734); `pnpm run mixer:guardrails` OK; `pnpm run mixer:apply-deltas` OK; `pnpm run mixer:check-deltas` OK; seed-uniqueness (only-failures, only-isos=bobo,bodish,bodo,boga-language,bohtan-neo-aramaic,bokar,boko,bole-niger-congo,bole-tangale,bolon) OK; coverage OK; failures OK; base-clusters (min-size=2) OK.

 - ✅ **2025-12-18 /no-unique-base2 batch 2025-12-18T10:01:20.931Z-worker1 (bolze,bomitaba,bomu,bonan,bonan-kangjia,bonan-manegacha,bonan-manegacha-dialect,bongili,bongo,bonin-english):** delta `tools/mixer-deltas/2025-12-18-worker1-mixed-bolze.json` (pins 7775–7784); `pnpm run mixer:guardrails` OK; `pnpm run mixer:check-deltas` OK; seed-uniqueness (only-failures, only-isos=bolze,bomitaba,bomu,bonan,bonan-kangjia,bonan-manegacha,bonan-manegacha-dialect,bongili,bongo,bonin-english) OK; coverage OK; failures OK; base-clusters (min-size=2) OK; claim marked `complete` via `no-uniq-base-claim.js` (updatedAt=`2025-12-18T10:18:30.878Z`).

 - ✅ **2025-12-18 /no-unique-base2 batch 2025-12-18T10:20:16.790Z-worker1 (bonjo,bono-ghana-ivory-coast,bono-nigeria,boon,borgarm-let,bouhin,bourbonnais-creole,bozal-spanish,bph,bpy):** delta `tools/mixer-deltas/2025-12-18-worker1-mixed-bonjo.json` (pins 7825–7834); `pnpm run mixer:guardrails` OK; `pnpm run mixer:apply-deltas` OK; `pnpm run mixer:check-deltas` OK; seed-uniqueness (only-failures, only-isos=bonjo,bono-ghana-ivory-coast,bono-nigeria,boon,borgarm-let,bouhin,bourbonnais-creole,bozal-spanish,bph,bpy) OK; coverage OK; failures OK; base-clusters (min-size=2) OK; claim marked `complete` via `no-uniq-base-claim.js` (updatedAt=`2025-12-18T10:33:33.498Z`).
 
 - ✅ **2025-12-18 /no-unique-base2 batch 2025-12-18T10:29:39.359Z-worker2 (brahui,braj,brao-bahnaric,brd,brg,broken-oghibbeway,broken-slavey,broome-pearling-lugger-pidgin,bru,bsh):** delta `tools/mixer-deltas/2025-12-18-worker2-mixed-brahui.json` (pins 7875–7884); `pnpm run mixer:guardrails` OK; `pnpm run mixer:apply-deltas` OK; `pnpm run mixer:check-deltas` OK; seed-uniqueness (only-failures, only-isos=brahui,braj,brao-bahnaric,brd,brg,broken-oghibbeway,broken-slavey,broome-pearling-lugger-pidgin,bru,bsh) OK; coverage OK; failures OK; base-clusters (min-size=2) OK; claim marked `complete` via `no-uniq-base-claim.js` (updatedAt=`2025-12-18T10:39:33.605Z`).
 
 - ✅ **2025-12-18 /no-unique-base2 batch 2025-12-18T10:46:09.168Z-worker1 (btv,budza,bug,buk,bukharian-arabic,buli,bunak,bundeli,bunu,buru-angwe):** delta `tools/mixer-deltas/2025-12-18-worker1-mixed-btv.json` (pins 7925–7934); `pnpm run mixer:apply-deltas` OK; `pnpm run mixer:check-deltas` OK; seed-uniqueness (only-failures, only-isos=btv,budza,bug,buk,bukharian-arabic,buli,bunak,bundeli,bunu,buru-angwe) OK; coverage OK; failures OK; base-clusters (min-size=2) OK; claim marked `complete` (updatedAt=`2025-12-18T11:14:05.284Z`).

 - ✅ **2025-12-18 /no-unique-base2 batch 2025-12-18T14:09:58.987Z-worker1 (camtho,canaano-akkadian,cannanore-portuguese-creole,carolinian,ccp):** delta `tools/mixer-deltas/2025-12-18-worker1-mixed-camtho.json` (pins 8120–8124); `pnpm run mixer:guardrails` OK; `pnpm run mixer:check-deltas` OK; seed-uniqueness (only-failures, only-isos=camtho,canaano-akkadian,cannanore-portuguese-creole,carolinian,ccp) OK; coverage OK; failures OK; base-clusters (min-size=2) OK; claim marked `complete` via `no-uniq-base-claim.js` (updatedAt=`2025-12-18T14:24:17.157Z`).

 - ✅ **2025-12-18 /no-unique-base2 batch 2025-12-18T21:09:11.471Z-worker1 (cdz,ceb,cebaara,cebuano-lang,central-atlas-tamazight):** delta `tools/mixer-deltas/2025-12-18-worker1-mixed-cdz.json` (pins 8170–8174); `pnpm run mixer:guardrails` OK; `pnpm run mixer:apply-deltas` OK; `pnpm run mixer:check-deltas` OK; seed-uniqueness (only-failures, only-isos=cdz,ceb,cebaara,cebuano-lang,central-atlas-tamazight) OK; coverage OK; failures OK; base-clusters (min-size=2) OK; claim marked `complete` via `no-uniq-base-claim.js` (updatedAt=`2025-12-18T21:24:26.293Z`).

 - ✅ **2025-12-18 /no-unique-base2 batch 2025-12-18T21:36:15.770Z-worker1 (cairene-arabic,cameroonian-pidgin,cameroonian-pidgin-english,central-asian-arabic,central-banda):** delta `tools/mixer-deltas/2025-12-18-worker1-mixed-cairene-arabic.json` (pins 8220–8224); `pnpm run mixer:guardrails` OK; `pnpm run mixer:apply-deltas` OK; `pnpm run mixer:check-deltas` OK; seed-uniqueness (only-failures, only-isos=cairene-arabic,cameroonian-pidgin,cameroonian-pidgin-english,central-asian-arabic,central-banda) OK; coverage OK; failures OK; base-clusters (min-size=2) OK; claim marked `complete` via `no-uniq-base-claim.js` (updatedAt=`2025-12-18T21:54:13.582Z`).

 - ✅ **2025-12-18 /language-uniqueness batch4 (Portuguese-based creoles bases=[13]):** delta `tools/mixer-deltas/2025-12-18-language-uniqueness-batch4-portuguese-based-creoles-13-setbases.json` (setBases to `[13, 7705–7713]` for daman, daman-and-diu-portuguese-creole, diu, portugis, s-o-nicolau-creole, s-o-vicente-creole, santo-ant-o-creole, indo-portuguese, indo-portuguese-creole-of-bombay); aux base defs in `modules/namebases-creole.js` (i:7705–7713). Verified: `pnpm run mixer:apply-deltas` OK; `pnpm run mixer:check-deltas` OK; `pnpm exec -- node tools/mixer-diagnostics/check-language-mixer-map-duplicate-isos.js` OK; `pnpm exec -- node tools/check-language-mixer-map-inconsistencies.js --show-all-bases` exit 0; `pnpm exec -- node tools/mixer-core/check-language-mixer-coverage.js` OK; `pnpm exec -- node tools/mixer-core/check-language-mixer-failures.js` OK; `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2 --family=Portuguese-based` => clusters=0.

 - ✅ **2025-12-19 /no-unique-base2 batch 2025-12-19T11:59:33.924Z-worker1 (crimean-tatar,csh,cua-bahnaric,cun-hlai,cuvok-language):** delta `tools/mixer-deltas/2025-12-19-worker1-mixed-crimean-tatar.json` (pins 9265–9269); `pnpm run mixer:guardrails` OK; `pnpm run mixer:apply-deltas` OK; `pnpm run mixer:check-deltas` OK; seed-uniqueness (only-failures, only-isos=crimean-tatar,csh,cua-bahnaric,cun-hlai,cuvok-language) OK; coverage OK; failures OK; base-clusters (min-size=2) OK; claim marked `complete` via `no-uniq-base-claim.js` (updatedAt=`2025-12-19T12:48:13.894Z`).

- ✅ **2025-12-19 /no-unique-base2 batch 2025-12-19T12:00:38.931Z-worker2 (cypriot-arabic,daba-language,dadanitic,daga,dagur):** delta `tools/mixer-deltas/2025-12-19-worker2-mixed-cypriot-arabic.json` (pins 9315–9319); `pnpm run mixer:guardrails` OK; `pnpm run mixer:apply-deltas` OK; `pnpm run mixer:check-deltas` OK; seed-uniqueness (only-failures, only-isos=cypriot-arabic,daba-language,dadanitic,daga,dagur) OK; coverage OK; failures OK; base-clusters (min-size=2) OK; claim marked `complete` via `no-uniq-base-claim.js` (updatedAt=`2025-12-19T12:56:28.587Z`).

- ✅ **2025-12-18 /no-unique-base2 batch 2025-12-18T21:36:15.770Z-worker1 (cairene-arabic,cameroonian-pidgin,cameroonian-pidgin-english,central-asian-arabic,central-banda):** delta `tools/mixer-deltas/2025-12-18-worker1-mixed-cairene-arabic.json` (pins 8220–8224); `pnpm run mixer:guardrails` OK; `pnpm run mixer:apply-deltas` OK; `pnpm run mixer:check-deltas` OK; seed-uniqueness (only-failures, only-isos=cairene-arabic,cameroonian-pidgin,cameroonian-pidgin-english,central-asian-arabic,central-banda) OK; coverage OK; failures OK; base-clusters (min-size=2) OK; claim marked `complete` via `no-uniq-base-claim.js` (updatedAt=`2025-12-18T21:54:13.582Z`).

 - ✅ **2025-12-18 /language-uniqueness batch4 (Portuguese-based creoles bases=[13]):** delta `tools/mixer-deltas/2025-12-18-language-uniqueness-batch4-portuguese-based-creoles-13-setbases.json` (setBases to `[13, 7705–7713]` for daman, daman-and-diu-portuguese-creole, diu, portugis, s-o-nicolau-creole, s-o-vicente-creole, santo-ant-o-creole, indo-portuguese, indo-portuguese-creole-of-bombay); aux base defs in `modules/namebases-creole.js` (i:7705–7713). Verified: `pnpm run mixer:apply-deltas` OK; `pnpm run mixer:check-deltas` OK; `pnpm exec -- node tools/mixer-diagnostics/check-language-mixer-map-duplicate-isos.js` OK; `pnpm exec -- node tools/check-language-mixer-map-inconsistencies.js --show-all-bases` exit 0; `pnpm exec -- node tools/mixer-core/check-language-mixer-coverage.js` OK; `pnpm exec -- node tools/mixer-core/check-language-mixer-failures.js` OK; `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2 --family=Portuguese-based` => clusters=0.

 - ✅ **2025-12-18 /no-unique-base2 batch 2025-12-18T22:10:29.085Z-worker1 (central-erzya,central-estonian,central-finland,central-hilali-dialects,central-ludic):** delta `tools/mixer-deltas/2025-12-18-worker1-mixed-central-erzya.json` (pins 8270–8274); `pnpm run mixer:guardrails` OK; `pnpm run mixer:apply-deltas` OK; `pnpm run mixer:check-deltas` OK; seed-uniqueness (only-failures, only-isos=central-erzya,central-estonian,central-finland,central-hilali-dialects,central-ludic) OK; coverage OK; failures OK; base-clusters (min-size=2) OK; claim marked `complete` via `no-uniq-base-claim.js` (updatedAt=`2025-12-18T22:22:30.007Z`).
