#!/usr/bin/env python3
"""Get entry data from data.json by index or name.

Usage:
    python get_next_entry.py <i>
    python get_next_entry.py --name <name>
    python get_next_entry.py --next          # get first unaudited entry
"""
import json, sys, argparse
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
DATA = BASE / "docs" / "plans" / "namebase-research" / "data.json"

if not DATA.exists():
    print(f"ERROR: data file not found: {DATA}", file=sys.stderr)
    sys.exit(1)

raw = DATA.read_text(encoding="utf-8")
data = json.loads(raw)

def by_i(i):
    return next((e for e in data if e.get("i") == i), None)

def by_name(name):
    name_l = name.lower()
    return next((e for e in data if e.get("name","").lower() == name_l), None)

def first_unaudited():
    return next((e for e in data if not e.get("audited")), None)

def main():
    p = argparse.ArgumentParser()
    p.add_argument("i", nargs="?", type=int, help="entry i value")
    p.add_argument("--name", help="search by name")
    p.add_argument("--next", action="store_true", help="first unaudited entry")
    args = p.parse_args()

    if args.i is not None:
        e = by_i(args.i)
    elif args.name:
        e = by_name(args.name)
    elif args.next:
        e = first_unaudited()
    else:
        p.error("provide i, --name, or --next")

    if not e:
        print("Entry not found")
        sys.exit(1)

    out = BASE / "entry_data.txt"
    with open(out, "w", encoding="utf-8") as f:
        f.write("name: %s\n" % e.get("name"))
        f.write("i: %s\n" % e.get("i"))
        f.write("d: %s\n" % e.get("d"))
        f.write("min: %s, max: %s\n" % (e.get("min"), e.get("max")))
        f.write("file: %s\n" % e.get("filename"))
        f.write("family: %s\n" % e.get("catalogFamily"))
        f.write("seeds: %s\n" % e.get("allSeeds"))
    print(f"Wrote {out}")

if __name__ == "__main__":
    main()
