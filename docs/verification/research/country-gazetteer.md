# Country gazetteer and the cross-country padding check

`tools/namebase-tools/country-gazetteer.js` maps settlements to countries.
`tools/namebase-tools/check-cross-country-padding.js` uses it to find namebase
entries whose seed list is a real place list from the wrong country.

## The defect being looked for

A namebase entry padded with a block of another country's genuine towns is
invisible to every other check in `tools/namebase-tools`. Those checks look at
shape: is this a template, is this a duplicated block, does it contain a digit,
does it contain a research label. Twenty-seven real West African city names,
correctly spelled and correctly ordered, pass all of them. The only thing wrong
with the list is where it is, and geography is the one property the dataset does
not record anywhere.

## What the gazetteer is

`COUNTRY_CITIES` holds 237 countries and 8,387 distinct settlement names, 40-60
per country for the countries where a padding list would plausibly reach. The
ordering inside each country is population rank, so the first entries are the
ones a pasted list is built from.

It is a **curated approximation, not a gazetteer of record**. There is no
authoritative, licence-clean, machine-readable list of the 50 largest cities of
every country that ships with this repo, and a name in this file is a claim that
the place exists in that country, not a citation. A name absent from it is a
claim of nothing at all. Recall is sacrificed for precision deliberately: a
country that is missing entirely costs coverage, a country with a wrong name in
it costs correctness, and only one of those is recoverable by inspection.

`resolveCountry(name)` returns:

| return | meaning | weight |
| --- | --- | --- |
| `"NG"` | exactly one country here has that name | STRONG |
| `["ES","VE"]` | genuinely shared between countries | WEAK, never counted |
| `null` | no claim | NO EVIDENCE |

## The ambiguity problem

"San Jose" is a real settlement in a dozen countries, "Springfield" in dozens,
"Victoria" in six, "Georgetown" in five, "Santiago" in eight, "London" in three.
A gazetteer that returns one of those confidently is worse than no gazetteer,
because it manufactures evidence that was never in the data.

The rule enforced while building the file was: **if a name exists in more than
one country, it is listed in all of them**, so that it resolves to an array and
the checker throws it away. 276 names are currently shared between countries for
this reason. It costs real evidence - a genuine one-country finding on a shared
name is discarded - and that is the correct trade.

The converse rule matters just as much: no country list was padded with
"recognisable" filler. A list containing Springfield, Georgetown, Victoria,
Cambridge and London would resolve almost everything and flag almost everything.
Country-specific forms (Dayton, Akron, Mevki, Ulaanbaatar, Kanpur) are safe
precisely because they are not shared.

## How the checker decides

For each entry, seeds are resolved and tallied. An entry is judged only if the
winning country has at least 5 single-country resolutions covering at least 80%
of its resolvable seeds. Ambiguous names count in the denominator and never in
the numerator.

A finding is raised when the catalog region **excludes** the resolved country at
continent level: the region label's own primary continent does not contain the
country. Two escapes, both reported rather than dropped:

- **Coarse region.** `Atlantic`, `Indian Ocean`, `Pacific`, `Misc`, `Eurasia`,
  `Americas`, `The Americas`, `Latin America`, `Ancient Mesopotamia` delimit no
  country set at all, so entries carrying them are unresolved. The transcontinental
  widening is deliberately skipped for these, or admitting the United States to
  "The Americas" would make it look like a set that excludes French Guiana.
- **Same continent, different country.** Sinhala is catalogued "Asia" and seeded
  with Sri Lankan towns. The label is coarse, the data is right. 150 entries are
  in this state and the check says so rather than failing them.

A namebase index can be reachable from more than one catalog row, and those rows
do not always agree on a region (628 entries reach more than one, 100 of them
with disagreeing regions), so the test is applied against all of the rows that
reach the entry: the seeds only have to be consistent with one. A language named
for its host country - "Vietnamese US", "American Finnish" - is expected to carry
that country's settlements and is also reported, not failed.

## Known instances

Reproduced from the tree as it stood before concurrent work remediated it:

| instance | outcome |
| --- | --- |
| `i=202820 "Hmu"`, `i=202857 "She"` (27 West African cities) | **reproduced** - FLAGGED, `NG`, 25 of 27 resolvable |
| `i=201377 "Khmu"` (Ambo, Numan, Demsa, Adamawa) | not judged - 3 resolvable place names, below the floor of 5 |
| `i=202572 "Oroch"` as originally padded (Pacific settlements) | not judged - 7 of 23 resolvable, below the floor |
| `i=203068 "Raute"` (Mexican archaeological sites) | not judged - 1 of 20 resolves; archaeological sites are not settlements |
| `i=200144 "Pan"` (88 East Timorese villages) | not testable - the seed block was not captured before remediation; village-scale padding is below the gazetteer's resolution floor by construction |
| `i=202572 "Oroch"` (current state) | correct - Russian Far East seeds, and the transcontinental guard makes it consistent rather than a finding |

The three known instances the mechanism can be expected to catch are the ones
built from capital cities and other top-50 places, because that is what the
gazetteer resolves. Everything smaller is a deliberate blind spot, not an
oversight.

## Blind spots

1. **Village-scale padding.** The gazetteer holds 40-60 settlements per country.
   A block of 88 hamlets resolves to almost nothing. The check prints its own
   resolution rate (about 17% of seeds are single-country) so this stays visible.
2. **Non-settlement toponyms.** Archaeological sites, mountain ranges, rivers,
   deserts and administrative provinces are not settlements and are not in the
   gazetteer. Mexican archaeological sites resolve at 5%.
3. **Coarse region labels.** 150 of the 2880 judged entries cannot be called,
   because the catalog has 33 region labels for the whole world and most are a
   continent. Raising the catalog's region granularity would make this check much
   sharper, and that is a change to `config/language-mixes.json`, not here.
4. **Small and uninhabited territories.** 75 of the 237 countries hold fewer
   than 25 names - Svalbard has 6, French Southern Territories 5, Tokelau 4. A
   padded list drawn from one of them is unlikely to resolve. `--verbose` lists
   them.
5. **Spelling.** Folded to lower case with diacritics and punctuation stripped, so
   "Sao Paulo" and "São Paulo" agree. A seed written in a transliteration the
   gazetteer does not carry - Cyrillic-adjacent forms, colonial spellings not in
   `ALIASES` - will not resolve.

## Countries not covered

None of the 237 ISO 3166-1 alpha-2 codes that appear in this namebase's regions
are absent from the gazetteer, but coverage inside countries is uneven: 75
countries have fewer than 25 names, and those are the microstates and island
territories listed above. The gazetteer was built from the countries that appear
in this namebase, which means it is not a general-purpose gazetteer and should
not be reused as one without extending it.

## Maintenance

`country-gazetteer.js` documents its own conventions at the top. The step that
matters is cross-checking every new name against every other country: a name
added to one list and not the other is the single failure mode that makes this
instrument worse than nothing. After any edit, re-run:

```
node tools/namebase-tools/check-cross-country-padding.js --verbose
```

A change that moves the finding count from single digits into the dozens has
introduced a false confidence somewhere; `--verbose` also prints how many names
are currently shared between countries, which is the number that should go **up**
when a country is extended.
