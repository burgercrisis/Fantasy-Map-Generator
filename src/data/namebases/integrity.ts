import type { NameBase } from "../name-bases";

export function countNames(b: unknown): number {
  if (typeof b !== "string") return 0;
  return b.split(",").filter(n => n.trim().length > 0).length;
}

export function isProto(name: unknown): boolean {
  if (typeof name !== "string") return false;
  // Only match an exact "proto" placeholder, not legitimate reconstructed
  // languages such as "Proto-Germanic" or "Proto-Indo-European".
  return /^proto$/i.test(name.trim());
}

/**
 * Sanitize an array of namebase entries with integrity guarantees:
 * - Removes proto-language entries (name contains "proto", case-insensitive)
 * - Deduplicates by name::i, keeping the entry with MORE names in `b`
 * - Resolves index collisions (same `i`, different name) by keeping the entry
 *   with more names and reassigning the displaced entry to a new index >= 300000
 * - Sorts by index `i`
 * Skips malformed entries (missing name, i, or b) instead of throwing.
 */
export function sanitizeNameBases(entries: unknown[]): NameBase[] {
  // Validate and normalize entries
  const valid: NameBase[] = [];
  for (const e of entries) {
    if (!e || typeof e !== "object") continue;
    const entry = e as Record<string, unknown>;
    if (typeof entry.name !== "string" || !entry.name) continue;
    if (typeof entry.i !== "number") continue;
    if (typeof entry.b !== "string") continue;
    valid.push(entry as unknown as NameBase);
  }

  // Remove proto languages
  const nonProto = valid.filter(e => !isProto(e.name));

  // Dedup by name::i - keep the entry with MORE names in b (fix #6: name::i, not name only)
  const byKey = new Map<string, NameBase>();
  for (const e of nonProto) {
    const key = `${e.name}::${e.i}`;
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, e);
    } else if (countNames(e.b) > countNames(existing.b)) {
      byKey.set(key, e);
    }
  }
  const nameDeduped = Array.from(byKey.values());

  // Resolve index collisions - same i, different name
  const byI = new Map<number, NameBase>();
  let nextNewI = 300000;
  for (const e of nameDeduped) {
    const existing = byI.get(e.i);
    if (!existing) {
      byI.set(e.i, e);
    } else {
      // Collision: keep the one with more names, reassign the other
      if (countNames(e.b) > countNames(existing.b)) {
        byI.set(e.i, e);
        while (byI.has(nextNewI)) nextNewI++;
        byI.set(nextNewI, { ...existing, i: nextNewI });
        nextNewI++;
      } else {
        while (byI.has(nextNewI)) nextNewI++;
        byI.set(nextNewI, { ...e, i: nextNewI });
        nextNewI++;
      }
    }
  }

  return Array.from(byI.values()).sort((a, b) => a.i - b.i);
}
