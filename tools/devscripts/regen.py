import json
import random

root = "E:/code/Fantasy-Map-Generator"

# Read files
with open(root + "/config/language-mixes.json", "r", encoding="utf-8") as f:
    catalog = json.load(f)

with open(root + "/config/language-mixer-map.json", "r", encoding="utf-8") as f:
    existing = json.load(f)

with open(root + "/tools/data/continent-file-mapping.json", "r", encoding="utf-8") as f:
    continent = json.load(f)

# Get valid bases
valid_bases = set()
for entry in continent["entries"]:
    if "index" in entry:
        valid_bases.add(entry["index"])
valid_arr = sorted(list(valid_bases))

# Build lookup
lookup = {e["iso"]: e["bases"] for e in existing}

# Process
new_map = []
assigned = 0
for lang in catalog:
    iso = lang["iso"]
    bases = lookup.get(iso)
    if bases and len(bases) > 0:
        new_map.append({"iso": iso, "bases": bases})
    else:
        num = random.randint(1, 3)
        bases = random.sample(valid_arr, num)
        new_map.append({"iso": iso, "bases": bases})
        assigned += 1

# Write
with open(root + "/config/language-mixer-map.json", "w", encoding="utf-8") as f:
    json.dump(new_map, f, indent=2)

print(f"Total: {len(new_map)}, Assigned: {assigned}")