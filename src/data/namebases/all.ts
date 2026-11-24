import type { NameBase } from "../name-bases";
import { africaNameBases } from "./africa";
import { asiaNameBases } from "./asia";
import { europeNameBases } from "./europe";
import { fantasyNameBases } from "./fantasy";
import { sanitizeNameBases } from "./integrity";
import { northAmericaNameBases } from "./northAmerica";
import { oceaniaNameBases } from "./oceania";
import { southAmericaNameBases } from "./southAmerica";

// Lazily computed and memoized (fix #3): sanitize + sort runs only on first call,
// not at module load time.
let _allNameBases: NameBase[] | null = null;

export function getAllNameBases(): NameBase[] {
  if (!_allNameBases) {
    _allNameBases = sanitizeNameBases([
      ...africaNameBases,
      ...asiaNameBases,
      ...europeNameBases,
      ...northAmericaNameBases,
      ...oceaniaNameBases,
      ...southAmericaNameBases,
      ...fantasyNameBases
    ]);
  }
  return _allNameBases;
}
