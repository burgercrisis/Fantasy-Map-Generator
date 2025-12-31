# Extract and analyze Greek names (i: 6)
$greekEntry = '{"name":"Greek","i":6,"min":5,"max":11,"d":"s","m":0.1,"b":"Abdera,Acharnae,Aegae,Aegina,Agrinion,Aigosthena,Akragas,Akroinon,Akrotiri,Alalia,Alexandria,Amarynthos,Amaseia,Amphicaea,Amphigeneia,Amphipolis,Antipatrea,Antiochia,Apamea,Aphidna,Apollonia,Argos,Artemita,Argyropolis,Asklepios,Athenai,Athmonia,Bhrytos,Borysthenes,Brauron,Byblos,Byzantion,Bythinion,Calydon,Chamaizi,Chalcis,Chios,Cleona,Corcyra,Croton,Cyrene,Cythera,Decelea,Delos,Delphi,Dicaearchia,Didyma,Dion,Dioscurias,Dodona,Dorylaion,Elateia,Eleusis,Eleutherna,Emporion,Ephesos,Epidamnos,Epidauros,Epizephyriani,Erythrae,Eubea,Golgi,Gonnos,Gorgippia,Gournia,Gortyn,Gytion,Hagios,Halicarnassos,Heliopolis,Hellespontos,Heloros,Heraclea,Hierapolis,Himera,Histria,Hula,Hyele,Ialysos,Iasos,Idalion,Imbros,Iolcos,Itanos,Ithaca,Juktas,Kallipolis,Kameiros,Karistos,Kasmenai,Kepoi,Kimmerikon,Knossos,Korinthos,Kos,Kourion,Kydonia,Kyrenia,Lamia,Lampsacos,Laodicea,Lapithos,Larissa,Lebena,Lefkada,Lekhaion,Lebethra,Leontinoi,Lilaea,Lindos,Lissos,Magnesia,Mantineia,Marathon,Marmara,Massalia,Megalopolis,Megara,Metapontion,Methumna,Miletos,Morgantina,Mulai,Mukenai,Myonia,Myra,Myrmekion,Myos,Nauplios,Naucratis,Naupaktos,Naxos,Neapolis,Nemea,Nicaea,Nicopolis,Nymphaion,Nysa,Odessos,Olbia,Olympia,Olynthos,Opos,Orchomenos,Oricos,Orestias,Oreos,Onchesmos,Pagasae,Paikastro,Pandosia,Panticapaion,Paphos,Pargamon,Paros,Pegai,Pelion,Peiraies,Phaistos,Phaleron,Pharos,Pithekussa,Philippopolis,Phocaea,Pinara,Pisa,Pitane,Plataea,Poseidonia,Potidaea,Pseira,Psychro,Pteleos,Pydna,Pylos,Pyrgos,Rhamnos,Rhithymna,Rhypae,Rizinia,Rodos,Salamis,Samos,Skyllaion,Seleucia,Semasos,Sestos,Scidros,Sicyon,,Sinope,Siris,Smyrna,Sozopolis,Sparta,Stagiros,Stratos,Stymphalos,Sybaris,Surakousai,Taras,Tanagra,Tanais,Tauromenion,Tegea,Temnos,Teos,Thapsos,Thassos,Thebai,Theodosia,Therma,Thespian,Thronion,Thoricos,Thurii,Thyreum,Thyria,Tithoraea,Tomis,Tragurion,Tripolis,Troliton,Troy,Tylissos,Tyros,Vathypetros,Zakynthos,Zakros"}'

# Parse the JSON and extract names
$data = $greekEntry | ConvertFrom-Json
$names = $data.b -split ','

Write-Host "=== Greek (i: 6) Analysis ==="
Write-Host "Total names: $($names.Count)"
Write-Host ""
Write-Host "First 20 names:"
$names | Select-Object -First 20 | ForEach-Object { Write-Host "  $_" }
Write-Host ""
Write-Host "Last 20 names:"
$names | Select-Object -Last 20 | ForEach-Object { Write-Host "  $_" }
