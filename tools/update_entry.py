#!/usr/bin/env python3
"""Update an entry in data.json by i value.

Usage:
    python update_entry.py <i> [--d <d>] [--min <n>] [--max <n>] [--family <name>] [--notes <text>]
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

def main():
    p = argparse.ArgumentParser()
    p.add_argument("i", type=int, help="entry i value to update")
    p.add_argument("--d", help="new d value")
    p.add_argument("--min", type=int, help="new min value")
    p.add_argument("--max", type=int, help="new max value")
    p.add_argument("--family", help="new catalogFamily")
    p.add_argument("--notes", help="audit notes")
    p.add_argument("--mark-audited", action="store_true", help="mark as audited")
    args = p.parse_args()

    for e in data:
        if e.get("i") == args.i:
            if args.d is not None:
                e["d"] = args.d
            if args.min is not None:
                e["min"] = args.min
            if args.max is not None:
                e["max"] = args.max
            if args.family is not None:
                e["catalogFamily"] = args.family
            if args.notes is not None:
                e["auditNotes"] = args.notes
            if args.mark_audited:
                e["audited"] = True
            break
    else:
        print(f"ERROR: entry with i={args.i} not found", file=sys.stderr)
        sys.exit(1)

    tmp = DATA.with_suffix(".json.tmp")
    tmp.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    tmp.replace(DATA)
    print(f"Updated i={args.i}")

if __name__ == "__main__":
    main()
