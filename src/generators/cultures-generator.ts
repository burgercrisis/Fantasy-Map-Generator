import { max, quadtree, range } from "d3";
import { Emblems } from "@/generators/emblems-generator";
import type { LanguageMixerCatalogEntry } from "@/generators/language-softmods";
import { last } from "@/utils/arrayUtils";
import { abbreviate, biased, ensureEl, getColors, getRandomColor, minmax, P, rand, rn, rw } from "../utils";

declare global {
  var Cultures: CulturesGenerator;

  /**
   * Runtime-attached by names-mixer.js. Not part of the upstream NamesGenerator
   * class; declared here so the culture mixer can call it without `any`.
   */
  var getRaceNameForCulture: ((culture: Culture) => string | null) | undefined;
  var getRacesSetFilter: ((value: string) => Set<string> | null) | undefined;
  var getRaceCultureProps: ((raceName: string) => { base: number; shield: string; odd: number } | null) | undefined;
  var rerollRacesForCultures: ((options?: { forceFilterFromUi?: boolean }) => void) | undefined;
}

export interface Culture {
  name: string;
  i: number;
  base: number;
  shield: string;
  lock?: boolean;
  code?: string;
  center?: number;
  // transient coordinates cached by the heightmap editor across a re-graph
  x?: number;
  y?: number;
  sort?: (i: number) => number;
  odd?: number;
  color?: string;
  type: CultureType;
  expansionism?: number;
  origins?: (number | null)[];
  removed?: boolean;
  cells?: number;
  area?: number;
  rural?: number;
  urban?: number;
  /** Race name assigned by the race system (custom fork; no upstream equivalent) */
  race?: string;
}

export const CULTURE_TYPES = ["Generic", "Hunting", "Highland", "River", "Lake", "Naval", "Nomadic"] as const;
export type CultureType = (typeof CULTURE_TYPES)[number];
export const DEFAULT_CULTURE_TYPE: CultureType = "Generic";

class CulturesGenerator {
  cells: any;

  getRandomShield() {
    const type = rw(Emblems.shields.types);
    return rw(Emblems.shields[type]);
  }

  getDefault(count: number = 0): Omit<Culture, "i" | "type">[] {
    // generic sorting functions
    const cells = pack.cells,
      s = cells.s,
      sMax = max(s) as number,
      t = cells.t,
      h = cells.h,
      temp = grid.cells.temp;
    const n = (cell: number) => Math.ceil((s[cell] / sMax) * 3); // normalized cell score
    const td = (cell: number, goal: number) => {
      const d = Math.abs(temp[cells.g[cell]] - goal);
      return d ? d + 1 : 1;
    }; // temperature difference fee
    const bd = (cell: number, biomes: number[], fee = 4) => (biomes.includes(cells.biome[cell]) ? 1 : fee); // biome difference fee
    const sf = (cell: number, fee = 4) =>
      cells.haven[cell] && pack.features[cells.f[cells.haven[cell]]].type !== "lake" ? 1 : fee; // not on sea coast fee

    if (culturesSet.value === "european") {
      return [
        {
          name: "Shwazen",
          base: 0,
          odd: 1,
          sort: (i: number) => n(i) / td(i, 10) / bd(i, [6, 8]),
          shield: "swiss"
        },
        {
          name: "Angshire",
          base: 1,
          odd: 1,
          sort: (i: number) => n(i) / td(i, 10) / sf(i),
          shield: "wedged"
        },
        {
          name: "Luari",
          base: 2,
          odd: 1,
          sort: (i: number) => n(i) / td(i, 12) / bd(i, [6, 8]),
          shield: "french"
        },
        {
          name: "Tallian",
          base: 3,
          odd: 1,
          sort: (i: number) => n(i) / td(i, 15),
          shield: "horsehead"
        },
        {
          name: "Astellian",
          base: 4,
          odd: 1,
          sort: (i: number) => n(i) / td(i, 16),
          shield: "spanish"
        },
        {
          name: "Slovan",
          base: 5,
          odd: 1,
          sort: (i: number) => (n(i) / td(i, 6)) * t[i],
          shield: "polish"
        },
        {
          name: "Norse",
          base: 6,
          odd: 1,
          sort: (i: number) => n(i) / td(i, 5),
          shield: "heater"
        },
        {
          name: "Elladan",
          base: 7,
          odd: 1,
          sort: (i: number) => (n(i) / td(i, 18)) * h[i],
          shield: "boeotian"
        },
        {
          name: "Romian",
          base: 8,
          odd: 0.2,
          sort: (i: number) => n(i) / td(i, 15) / t[i],
          shield: "roman"
        },
        {
          name: "Soumi",
          base: 9,
          odd: 1,
          sort: (i: number) => (n(i) / td(i, 5) / bd(i, [9])) * t[i],
          shield: "pavise"
        },
        {
          name: "Portuzian",
          base: 13,
          odd: 1,
          sort: (i: number) => n(i) / td(i, 17) / sf(i),
          shield: "renaissance"
        },
        {
          name: "Vengrian",
          base: 15,
          odd: 1,
          sort: (i: number) => (n(i) / td(i, 11) / bd(i, [4])) * t[i],
          shield: "horsehead2"
        },
        {
          name: "Turchian",
          base: 16,
          odd: 0.05,
          sort: (i: number) => n(i) / td(i, 14),
          shield: "round"
        },
        {
          name: "Euskati",
          base: 20,
          odd: 0.05,
          sort: (i: number) => (n(i) / td(i, 15)) * h[i],
          shield: "oldFrench"
        },
        {
          name: "Keltan",
          base: 22,
          odd: 0.05,
          sort: (i: number) => (n(i) / td(i, 11) / bd(i, [6, 8])) * t[i],
          shield: "oval"
        }
      ];
    }

    if (culturesSet.value === "oriental") {
      return [
        {
          name: "Koryo",
          base: 10,
          odd: 1,
          sort: (i: number) => n(i) / td(i, 12) / t[i],
          shield: "round"
        },
        {
          name: "Hantzu",
          base: 11,
          odd: 1,
          sort: (i: number) => n(i) / td(i, 13),
          shield: "banner"
        },
        {
          name: "Yamoto",
          base: 12,
          odd: 1,
          sort: (i: number) => n(i) / td(i, 15) / t[i],
          shield: "round"
        },
        {
          name: "Turchian",
          base: 16,
          odd: 1,
          sort: (i: number) => n(i) / td(i, 12),
          shield: "round"
        },
        {
          name: "Berberan",
          base: 17,
          odd: 0.2,
          sort: (i: number) => (n(i) / td(i, 19) / bd(i, [1, 2, 3], 7)) * t[i],
          shield: "oval"
        },
        {
          name: "Eurabic",
          base: 18,
          odd: 1,
          sort: (i: number) => (n(i) / td(i, 26) / bd(i, [1, 2], 7)) * t[i],
          shield: "oval"
        },
        {
          name: "Efratic",
          base: 23,
          odd: 0.1,
          sort: (i: number) => (n(i) / td(i, 22)) * t[i],
          shield: "round"
        },
        {
          name: "Tehrani",
          base: 24,
          odd: 1,
          sort: (i: number) => (n(i) / td(i, 18)) * h[i],
          shield: "round"
        },
        {
          name: "Maui",
          base: 25,
          odd: 0.2,
          sort: (i: number) => n(i) / td(i, 24) / sf(i) / t[i],
          shield: "vesicaPiscis"
        },
        {
          name: "Carnatic",
          base: 26,
          odd: 0.5,
          sort: (i: number) => n(i) / td(i, 26),
          shield: "round"
        },
        {
          name: "Vietic",
          base: 29,
          odd: 0.8,
          sort: (i: number) => n(i) / td(i, 25) / bd(i, [7], 7) / t[i],
          shield: "banner"
        },
        {
          name: "Guantzu",
          base: 30,
          odd: 0.5,
          sort: (i: number) => n(i) / td(i, 17),
          shield: "banner"
        },
        {
          name: "Ulus",
          base: 31,
          odd: 1,
          sort: (i: number) => (n(i) / td(i, 5) / bd(i, [2, 4, 10], 7)) * t[i],
          shield: "banner"
        }
      ];
    }

    if (culturesSet.value === "english") {
      const getName = () => Names.getBase(1, 5, 9, "");
      return [
        { name: getName(), base: 1, odd: 1, shield: "heater" },
        { name: getName(), base: 1, odd: 1, shield: "wedged" },
        { name: getName(), base: 1, odd: 1, shield: "swiss" },
        { name: getName(), base: 1, odd: 1, shield: "oldFrench" },
        { name: getName(), base: 1, odd: 1, shield: "swiss" },
        { name: getName(), base: 1, odd: 1, shield: "spanish" },
        { name: getName(), base: 1, odd: 1, shield: "hessen" },
        { name: getName(), base: 1, odd: 1, shield: "fantasy5" },
        { name: getName(), base: 1, odd: 1, shield: "fantasy4" },
        { name: getName(), base: 1, odd: 1, shield: "fantasy1" }
      ];
    }

    if (culturesSet.value === "antique") {
      return [
        {
          name: "Roman",
          base: 8,
          odd: 1,
          sort: (i: number) => n(i) / td(i, 14) / t[i],
          shield: "roman"
        }, // Roman
        {
          name: "Roman",
          base: 8,
          odd: 1,
          sort: (i: number) => n(i) / td(i, 15) / sf(i),
          shield: "roman"
        }, // Roman
        {
          name: "Roman",
          base: 8,
          odd: 1,
          sort: (i: number) => n(i) / td(i, 16) / sf(i),
          shield: "roman"
        }, // Roman
        {
          name: "Roman",
          base: 8,
          odd: 1,
          sort: (i: number) => n(i) / td(i, 17) / t[i],
          shield: "roman"
        }, // Roman
        {
          name: "Hellenic",
          base: 7,
          odd: 1,
          sort: (i: number) => (n(i) / td(i, 18) / sf(i)) * h[i],
          shield: "boeotian"
        }, // Greek
        {
          name: "Hellenic",
          base: 7,
          odd: 1,
          sort: (i: number) => (n(i) / td(i, 19) / sf(i)) * h[i],
          shield: "boeotian"
        }, // Greek
        {
          name: "Macedonian",
          base: 7,
          odd: 0.5,
          sort: (i: number) => (n(i) / td(i, 12)) * h[i],
          shield: "round"
        }, // Greek
        {
          name: "Celtic",
          base: 22,
          odd: 1,
          sort: (i: number) => n(i) / td(i, 11) ** 0.5 / bd(i, [6, 8]),
          shield: "round"
        },
        {
          name: "Germanic",
          base: 0,
          odd: 1,
          sort: (i: number) => n(i) / td(i, 10) ** 0.5 / bd(i, [6, 8]),
          shield: "round"
        },
        {
          name: "Persian",
          base: 24,
          odd: 0.8,
          sort: (i: number) => (n(i) / td(i, 18)) * h[i],
          shield: "oval"
        }, // Iranian
        {
          name: "Scythian",
          base: 24,
          odd: 0.5,
          sort: (i: number) => n(i) / td(i, 11) ** 0.5 / bd(i, [4]),
          shield: "round"
        }, // Iranian
        {
          name: "Cantabrian",
          base: 20,
          odd: 0.5,
          sort: (i: number) => (n(i) / td(i, 16)) * h[i],
          shield: "oval"
        }, // Basque
        {
          name: "Estian",
          base: 9,
          odd: 0.2,
          sort: (i: number) => (n(i) / td(i, 5)) * t[i],
          shield: "pavise"
        }, // Finnic
        {
          name: "Carthaginian",
          base: 42,
          odd: 0.3,
          sort: (i: number) => n(i) / td(i, 20) / sf(i),
          shield: "oval"
        }, // Levantine
        {
          name: "Hebrew",
          base: 42,
          odd: 0.2,
          sort: (i: number) => (n(i) / td(i, 19)) * sf(i),
          shield: "oval"
        }, // Levantine
        {
          name: "Mesopotamian",
          base: 23,
          odd: 0.2,
          sort: (i: number) => n(i) / td(i, 22) / bd(i, [1, 2, 3]),
          shield: "oval"
        } // Mesopotamian
      ];
    }

    if (culturesSet.value === "fantasy" || culturesSet.value === "highFantasy" || culturesSet.value === "darkFantasy") {
      const racesSetEl = document.getElementById("racesSet") as HTMLSelectElement | null;
      const racesSetValue = racesSetEl ? racesSetEl.value : "all";
      const filter = typeof getRacesSetFilter === "function" ? getRacesSetFilter(racesSetValue) : null;

      const cultures: Omit<Culture, "i" | "type">[] = [];
      const sortVariants = [
        (i: number) => n(i),
        (i: number) => n(i) / td(i, 10),
        (i: number) => (n(i) / td(i, 5)) * t[i],
        (i: number) => n(i) + h[i]
      ];

      const raceNames = (window as any).fantasyRaceNames as string[] | undefined;
      if (!raceNames) return cultures;

      let sortIdx = 0;
      for (const raceName of raceNames) {
        if (raceName === "Human" || raceName === "AnyLanguage") continue;
        if (filter && !filter.has(raceName)) continue;
        if (typeof getRaceCultureProps !== "function") continue;
        const props = getRaceCultureProps(raceName);
        if (!props) continue;

        const name = Names.getBaseShort(props.base);
        const sort = sortVariants[sortIdx % sortVariants.length];
        sortIdx++;

        cultures.push({
          name,
          base: props.base,
          odd: props.odd,
          sort,
          shield: props.shield
        });
      }

      cultures.push({
        name: Names.getBaseShort(32),
        base: 32,
        odd: 1,
        sort: (i: number) => n(i) / td(i, 10),
        shield: "fantasy5"
      });

      return cultures;
    }

    if (culturesSet.value === "random") {
      return range(count).map(() => {
        const rnd = this.getRandomValidBaseIndex();
        const name = Names.getBaseShort(rnd);
        return { name, base: rnd, odd: 1, shield: this.getRandomShield() };
      });
    }

    // all-world
    return [
      {
        name: "Shwazen",
        base: 0,
        odd: 0.7,
        sort: (i: number) => n(i) / td(i, 10) / bd(i, [6, 8]),
        shield: "hessen"
      },
      {
        name: "Angshire",
        base: 1,
        odd: 1,
        sort: (i: number) => n(i) / td(i, 10) / sf(i),
        shield: "heater"
      },
      {
        name: "Luari",
        base: 2,
        odd: 0.6,
        sort: (i: number) => n(i) / td(i, 12) / bd(i, [6, 8]),
        shield: "oldFrench"
      },
      {
        name: "Tallian",
        base: 3,
        odd: 0.6,
        sort: (i: number) => n(i) / td(i, 15),
        shield: "horsehead2"
      },
      {
        name: "Astellian",
        base: 4,
        odd: 0.6,
        sort: (i: number) => n(i) / td(i, 16),
        shield: "spanish"
      },
      {
        name: "Slovan",
        base: 5,
        odd: 0.7,
        sort: (i: number) => (n(i) / td(i, 6)) * t[i],
        shield: "round"
      },
      {
        name: "Norse",
        base: 6,
        odd: 0.7,
        sort: (i: number) => n(i) / td(i, 5),
        shield: "heater"
      },
      {
        name: "Elladan",
        base: 7,
        odd: 0.7,
        sort: (i: number) => (n(i) / td(i, 18)) * h[i],
        shield: "boeotian"
      },
      {
        name: "Romian",
        base: 8,
        odd: 0.7,
        sort: (i: number) => n(i) / td(i, 15),
        shield: "roman"
      },
      {
        name: "Soumi",
        base: 9,
        odd: 0.3,
        sort: (i: number) => (n(i) / td(i, 5) / bd(i, [9])) * t[i],
        shield: "pavise"
      },
      {
        name: "Koryo",
        base: 10,
        odd: 0.1,
        sort: (i: number) => n(i) / td(i, 12) / t[i],
        shield: "round"
      },
      {
        name: "Hantzu",
        base: 11,
        odd: 0.1,
        sort: (i: number) => n(i) / td(i, 13),
        shield: "banner"
      },
      {
        name: "Yamoto",
        base: 12,
        odd: 0.1,
        sort: (i: number) => n(i) / td(i, 15) / t[i],
        shield: "round"
      },
      {
        name: "Portuzian",
        base: 13,
        odd: 0.4,
        sort: (i: number) => n(i) / td(i, 17) / sf(i),
        shield: "spanish"
      },
      {
        name: "Nawatli",
        base: 14,
        odd: 0.1,
        sort: (i: number) => h[i] / td(i, 18) / bd(i, [7]),
        shield: "square"
      },
      {
        name: "Vengrian",
        base: 15,
        odd: 0.2,
        sort: (i: number) => (n(i) / td(i, 11) / bd(i, [4])) * t[i],
        shield: "wedged"
      },
      {
        name: "Turchian",
        base: 16,
        odd: 0.2,
        sort: (i: number) => n(i) / td(i, 13),
        shield: "round"
      },
      {
        name: "Berberan",
        base: 17,
        odd: 0.1,
        sort: (i: number) => (n(i) / td(i, 19) / bd(i, [1, 2, 3], 7)) * t[i],
        shield: "round"
      },
      {
        name: "Eurabic",
        base: 18,
        odd: 0.2,
        sort: (i: number) => (n(i) / td(i, 26) / bd(i, [1, 2], 7)) * t[i],
        shield: "round"
      },
      {
        name: "Inuk",
        base: 19,
        odd: 0.05,
        sort: (i: number) => td(i, -1) / bd(i, [10, 11]) / sf(i),
        shield: "square"
      },
      {
        name: "Euskati",
        base: 20,
        odd: 0.05,
        sort: (i: number) => (n(i) / td(i, 15)) * h[i],
        shield: "spanish"
      },
      {
        name: "Yoruba",
        base: 21,
        odd: 0.05,
        sort: (i: number) => n(i) / td(i, 15) / bd(i, [5, 7]),
        shield: "vesicaPiscis"
      },
      {
        name: "Keltan",
        base: 22,
        odd: 0.05,
        sort: (i: number) => (n(i) / td(i, 11) / bd(i, [6, 8])) * t[i],
        shield: "vesicaPiscis"
      },
      {
        name: "Efratic",
        base: 23,
        odd: 0.05,
        sort: (i: number) => (n(i) / td(i, 22)) * t[i],
        shield: "diamond"
      },
      {
        name: "Tehrani",
        base: 24,
        odd: 0.1,
        sort: (i: number) => (n(i) / td(i, 18)) * h[i],
        shield: "round"
      },
      {
        name: "Maui",
        base: 25,
        odd: 0.05,
        sort: (i: number) => n(i) / td(i, 24) / sf(i) / t[i],
        shield: "round"
      },
      {
        name: "Carnatic",
        base: 26,
        odd: 0.05,
        sort: (i: number) => n(i) / td(i, 26),
        shield: "round"
      },
      {
        name: "Inqan",
        base: 27,
        odd: 0.05,
        sort: (i: number) => h[i] / td(i, 13),
        shield: "square"
      },
      {
        name: "Kiswaili",
        base: 28,
        odd: 0.1,
        sort: (i: number) => n(i) / td(i, 29) / bd(i, [1, 3, 5, 7]),
        shield: "vesicaPiscis"
      },
      {
        name: "Vietic",
        base: 29,
        odd: 0.1,
        sort: (i: number) => n(i) / td(i, 25) / bd(i, [7], 7) / t[i],
        shield: "banner"
      },
      {
        name: "Guantzu",
        base: 30,
        odd: 0.1,
        sort: (i: number) => n(i) / td(i, 17),
        shield: "banner"
      },
      {
        name: "Ulus",
        base: 31,
        odd: 0.1,
        sort: (i: number) => (n(i) / td(i, 5) / bd(i, [2, 4, 10], 7)) * t[i],
        shield: "banner"
      },
      {
        name: "Levent",
        base: 42,
        odd: 0.2,
        sort: (i: number) => (n(i) / td(i, 18)) * sf(i),
        shield: "oval"
      } // Levantine
    ];
  }

  generate() {
    this.cells = pack.cells;
    const cultureIds = new Uint16Array(this.cells.i.length); // cell cultures

    const culturesInputNumber = +(ensureEl("culturesInput") as HTMLInputElement).value;
    const culturesInSetNumber = +((ensureEl("culturesSet") as HTMLSelectElement).selectedOptions[0].dataset.max ?? "0");
    let count = Math.min(culturesInputNumber, culturesInSetNumber);
    const populated = this.cells.i.filter((i: number) => this.cells.s[i]); // populated cells

    if (populated.length < count * 25) {
      count = Math.floor(populated.length / 50);
      if (!count) {
        WARN && console.warn(`There are no populated cells. Cannot generate cultures`);
        pack.cultures = [
          {
            name: "Wildlands",
            i: 0,
            base: 1,
            shield: "round",
            type: DEFAULT_CULTURE_TYPE
          }
        ];
        this.cells.culture = cultureIds;

        alertMessage.innerHTML = /* html */ `The climate is harsh and people cannot live in this world.<br />
          No cultures, states and burgs will be created.<br />
          Please consider changing climate settings in the World Configurator`;

        $("#alert").dialog({
          resizable: false,
          title: "Extreme climate warning",
          buttons: {
            Ok: function () {
              $(this).dialog("close");
            }
          }
        });
        return;
      } else {
        WARN && console.warn(`Not enough populated cells (${populated.length}). Will generate only ${count} cultures`);
        alertMessage.innerHTML = /* html */ ` There are only ${populated.length} populated cells and it's insufficient livable area.<br />
          Only ${count} out of ${culturesInput.value} requested cultures will be generated.<br />
          Please consider changing climate settings in the World Configurator`;
        $("#alert").dialog({
          resizable: false,
          title: "Extreme climate warning",
          buttons: {
            Ok: function () {
              $(this).dialog("close");
            }
          }
        });
      }
    }

    const selectCultures = (culturesNumber: number): Culture[] => {
      const defaultCultures = this.getDefault(culturesNumber);
      const cultures: Culture[] = [];

      pack.cultures?.forEach(culture => {
        if (culture.lock && !culture.removed) cultures.push(culture);
      });

      if (!cultures.length) {
        if (culturesNumber === defaultCultures.length) return defaultCultures as Culture[];
        if (defaultCultures.every(d => d.odd === 1)) return defaultCultures.splice(0, culturesNumber) as Culture[];
      }

      for (let culture: Culture, rnd: number, i = 0; cultures.length < culturesNumber && defaultCultures.length > 0; ) {
        do {
          rnd = rand(defaultCultures.length - 1);
          culture = defaultCultures[rnd] as Culture;
          i++;
        } while (i < 200 && !P(culture.odd as number));
        cultures.push(culture);
        defaultCultures.splice(rnd, 1);
      }
      return cultures;
    };

    const cultures = selectCultures(count);
    pack.cultures = cultures;
    const centers = quadtree<number>();
    const colors = getColors(count);
    const emblemShape = Emblems.shape;

    const codes: string[] = [];

    const placeCenter = (sortingFn: (i: number) => number) => {
      let spacing = (graphWidth + graphHeight) / 2 / count;
      const MAX_ATTEMPTS = 100;

      const sorted = [...populated].sort((a, b) => sortingFn(b) - sortingFn(a));
      const max = Math.floor(sorted.length / 2);

      let cellId = 0;
      for (let i = 0; i < MAX_ATTEMPTS; i++) {
        cellId = sorted[biased(0, max, 5)];
        spacing *= 0.9;
        if (!cultureIds[cellId] && !centers.find(this.cells.p[cellId][0], this.cells.p[cellId][1], spacing)) break;
      }

      return cellId;
    };

    // set culture type based on culture center position
    const defineCultureType = (i: number) => {
      if (this.cells.h[i] < 70 && [1, 2, 4].includes(this.cells.biome[i])) return "Nomadic"; // high penalty in forest biomes and near coastline
      if (this.cells.h[i] > 50) return "Highland"; // no penalty for hills and mountains, high for other elevations
      const f = pack.features[this.cells.f[this.cells.haven[i]]]; // opposite feature
      if (f.type === "lake" && f.cells > 5) return "Lake"; // low water cross penalty and high for growth not along coastline
      if (
        (this.cells.harbor[i] && f.type !== "lake" && P(0.1)) ||
        (this.cells.harbor[i] === 1 && P(0.6)) ||
        (pack.features[this.cells.f[i]].subtype === "isle" && P(0.4))
      )
        return "Naval"; // low water cross penalty and high for non-along-coastline growth
      if (this.cells.r[i] && this.cells.fl[i] > 100) return "River"; // no River cross penalty, penalty for non-River growth
      if (this.cells.t[i] > 2 && [3, 7, 8, 9, 10, 12].includes(this.cells.biome[i])) return "Hunting"; // high penalty in non-native biomes
      return DEFAULT_CULTURE_TYPE;
    };

    const defineCultureExpansionism = (type: CultureType) => {
      let base = 1; // Generic
      if (type === "Lake") base = 0.8;
      else if (type === "Naval") base = 1.5;
      else if (type === "River") base = 0.9;
      else if (type === "Nomadic") base = 1.5;
      else if (type === "Hunting") base = 0.7;
      else if (type === "Highland") base = 1.2;
      return rn(((Math.random() * (ensureEl("sizeVariety") as HTMLInputElement).valueAsNumber) / 2 + 1) * base, 1);
    };

    cultures.forEach((c: Culture, i: number) => {
      const newId = i + 1;

      if (c.lock) {
        codes.push(c.code as string);
        centers.add(c.center as number);

        for (const i of this.cells.i) {
          if (this.cells.culture[i] === c.i) cultureIds[i] = newId;
        }

        c.i = newId;
        return;
      }

      const sortingFn = c.sort ? c.sort : (i: number) => this.cells.s[i];
      const center = placeCenter(sortingFn);

      centers.add(this.cells.p[center]);
      c.center = center;
      c.i = newId;
      delete c.odd;
      delete c.sort;
      c.color = colors[i];
      c.type = defineCultureType(center);
      c.expansionism = defineCultureExpansionism(c.type);
      c.origins = [0];
      c.code = abbreviate(c.name, codes);
      codes.push(c.code);
      cultureIds[center] = newId;
      if (emblemShape === "random") c.shield = this.getRandomShield();
    });

    this.cells.culture = cultureIds;

    // the first culture with id 0 is for wildlands
    cultures.unshift({
      name: "Wildlands",
      i: 0,
      base: 1,
      origins: [null],
      shield: "round",
      type: DEFAULT_CULTURE_TYPE
    });

    // Determine race names BEFORE the validBaseIds remapping so that fantasy
    // race bases (e.g. 33 for Elf, 43 for Halfling) are correctly resolved.
    // The remapping below uses c.base % validBaseIds.length which would destroy
    // fantasy base indices that exceed validBaseIds.length, causing all cultures
    // to fall back to "Human".
    if (typeof getRaceNameForCulture === "function") {
      for (const c of cultures) {
        if (!c || c.i === 0 || c.removed) continue;
        const resolved = getRaceNameForCulture(c);
        if (resolved) c.race = resolved;
      }
    }

    // Use valid indices to avoid sparse array gaps (defaultNameBaseIds contains
    // all indices that actually have a namebase, not just the array length)
    const validBaseIds = (window as unknown as { defaultNameBaseIds?: number[] }).defaultNameBaseIds;
    if (!Array.isArray(validBaseIds) || validBaseIds.length === 0) {
      WARN && console.warn("defaultNameBaseIds not available, falling back to array length");
    }
    cultures.forEach((c: Culture) => {
      // Preserve race-mixer and culture-mixer bases (they are at the end of the array
      // and are NOT in defaultNameBaseIds). Only remap default/sparse bases.
      const currentBase = c.base;
      if (Names.nameBases[currentBase] && (Names.nameBases[currentBase] as any).raceMixerFor) return;
      if (Names.nameBases[currentBase] && (Names.nameBases[currentBase] as any).cultureMixer) return;

      if (Array.isArray(validBaseIds) && validBaseIds.length > 0) {
        // If the current base is already in validBaseIds, don't remap it
        if (validBaseIds.includes(currentBase)) return;
        const newBase = validBaseIds[currentBase % validBaseIds.length];
        c.base = newBase;
      } else if (Names.nameBases.length > 0) {
        if (currentBase < Names.nameBases.length && Names.nameBases[currentBase]) return;
        c.base = currentBase % Names.nameBases.length;
      } else {
        c.base = 0;
      }
    });

    // --- Race + language mixer integration (custom fork; no upstream equivalent) ---
    // Build mixer bases for all cultures (except wildlands at index 0)
    for (const c of cultures) {
      if (!c || c.i === 0 || c.removed) continue;
      const raceName = typeof c.race === "string" ? c.race : "";
      const baseIndex = this.ensureCultureMixerBaseIndex(c.i, raceName);
      if (typeof baseIndex === "number") {
        c.base = baseIndex;
      } else if (!Names.nameBases[c.base] || !Names.nameBases[c.base].b) {
        // Fallback: culture mixer failed and current base is invalid.
        // Use the first valid namebase to prevent "ERROR" names.
        const firstValid = Names.nameBases.findIndex(b => b && b.b && b.b.length > 0);
        c.base = firstValid >= 0 ? firstValid : 0;
      }
    }

    // --- Assign races to cultures during initial generation ---
    // This ensures cultures get non-human races (Elf, Dwarf, etc.) during
    // initial map generation, not just when the user clicks "Races" button.
    if (typeof rerollRacesForCultures === "function") {
      rerollRacesForCultures({ forceFilterFromUi: true });
    }
  }

  add(center: number) {
    const defaultCultures = this.getDefault();
    let culture: number, base: number, name: string;

    if (pack.cultures.length < defaultCultures.length) {
      // add one of the default cultures
      culture = pack.cultures.length;
      base = defaultCultures[culture].base;
      name = defaultCultures[culture].name;
    } else {
      // add random culture based on one of the current ones
      culture = rand(pack.cultures.length - 1);
      name = Names.getCulture(culture, 5, 8, "");
      base = pack.cultures[culture].base;
    }

    const code = abbreviate(name, pack.cultures.map(c => c.code) as string[]);
    const i = pack.cultures.length;
    const color = getRandomColor();

    pack.cultures.push({
      name,
      color,
      base,
      center,
      i,
      expansionism: 1,
      type: DEFAULT_CULTURE_TYPE,
      cells: 0,
      area: 0,
      rural: 0,
      urban: 0,
      origins: [pack.cells.culture[center]],
      code,
      shield: Emblems.shape === "random" ? this.getRandomShield() : ""
    });
  }

  expand() {
    const { cells, cultures } = pack;

    const queue = new FlatQueue();
    const cost: number[] = [];

    const growthRate = (ensureEl("growthRate") as HTMLInputElement).valueAsNumber;
    const maxExpansionCost = cells.i.length * 0.6 * growthRate; // limit cost for culture growth

    // remove culture from all cells except of locked
    const hasLocked = cultures.some(c => !c.removed && c.lock);
    if (hasLocked) {
      for (const cellId of cells.i) {
        const culture = cultures[cells.culture[cellId]];
        if (culture.lock) continue;
        cells.culture[cellId] = 0;
      }
    } else {
      cells.culture = new Uint16Array(cells.i.length);
    }

    for (const culture of cultures) {
      if (!culture.i || culture.removed || culture.lock) continue;
      queue.push({ cellId: culture.center, cultureId: culture.i, priority: 0 }, 0);
    }

    const getBiomeCost = (c: number, biome: number, type: string) => {
      if (cells.biome[cultures[c].center as number] === biome) return 10; // tiny penalty for native biome
      if (type === "Hunting") return pack.biomes[biome].cost * 5; // non-native biome penalty for hunters
      if (type === "Nomadic" && biome > 4 && biome < 10) return pack.biomes[biome].cost * 10; // forest biome penalty for nomads
      return pack.biomes[biome].cost * 2; // general non-native biome penalty
    };

    const getHeightCost = (i: number, h: number, type: string) => {
      const f = pack.features[cells.f[i]],
        a = cells.area[i];
      if (type === "Lake" && f.type === "lake") return 10; // no lake crossing penalty for Lake cultures
      if (type === "Naval" && h < 20) return a * 2; // low sea/lake crossing penalty for Naval cultures
      if (type === "Nomadic" && h < 20) return a * 50; // giant sea/lake crossing penalty for Nomads
      if (h < 20) return a * 6; // general sea/lake crossing penalty
      if (type === "Highland" && h < 44) return 3000; // giant penalty for highlanders on lowlands
      if (type === "Highland" && h < 62) return 200; // giant penalty for highlanders on lowhills
      if (type === "Highland") return 0; // no penalty for highlanders on highlands
      if (h >= 67) return 200; // general mountains crossing penalty
      if (h >= 44) return 30; // general hills crossing penalty
      return 0;
    };

    const getRiverCost = (riverId: number, cellId: number, type: string) => {
      if (type === "River") return riverId ? 0 : 100; // penalty for river cultures
      if (!riverId) return 0; // no penalty for others if there is no river
      return minmax(cells.fl[cellId] / 10, 20, 100); // river penalty from 20 to 100 based on flux
    };

    const getTypeCost = (t: number, type: string) => {
      if (t === 1) return type === "Naval" || type === "Lake" ? 0 : type === "Nomadic" ? 60 : 20; // penalty for coastline
      if (t === 2) return type === "Naval" || type === "Nomadic" ? 30 : 0; // low penalty for land level 2 for Navals and nomads
      if (t !== -1) return type === "Naval" || type === "Lake" ? 100 : 0; // penalty for mainland for navals
      return 0;
    };

    while (queue.length) {
      const { cellId, priority, cultureId } = queue.pop();
      const { type, expansionism } = cultures[cultureId];
      const sourceBiome = cells.biome[cellId];

      cells.c[cellId].forEach(neibCellId => {
        if (hasLocked) {
          const neibCultureId = cells.culture[neibCellId];
          if (neibCultureId && cultures[neibCultureId].lock) return; // do not overwrite cell of locked culture
        }

        const targetBiome = cells.biome[neibCellId];
        const biomeCost = getBiomeCost(cultureId, targetBiome, type as string);
        const biomeChangeCost = sourceBiome === targetBiome ? 0 : 20; // penalty on biome change
        const heightCost = getHeightCost(neibCellId, cells.h[neibCellId], type as string);
        const riverCost = getRiverCost(cells.r[neibCellId], neibCellId, type as string);
        const typeCost = getTypeCost(cells.t[neibCellId], type as string);
        const cellCost = (biomeCost + biomeChangeCost + heightCost + riverCost + typeCost) / (expansionism as number);
        const totalCost = priority + cellCost;

        if (totalCost > maxExpansionCost) return;

        if (!cost[neibCellId] || totalCost < cost[neibCellId]) {
          if (cells.pop[neibCellId] > 0) cells.culture[neibCellId] = cultureId; // assign culture to populated cell
          cost[neibCellId] = totalCost;
          queue.push({ cellId: neibCellId, cultureId, priority: totalCost }, totalCost);
        }
      });
    }
  }

  regenerate(): void {
    this.generate();
    this.expand();

    pack.states = pack.states.map(state =>
      !state.i || state.removed ? state : { ...state, culture: pack.cells.culture[state.center] }
    );
    pack.burgs = pack.burgs.map(burg =>
      !burg.i || burg.removed ? burg : { ...burg, culture: pack.cells.culture[burg.cell] }
    );
    pack.religions = pack.religions.map(religion =>
      !religion.i || religion.removed ? religion : { ...religion, culture: pack.cells.culture[religion.center] }
    );
  }

  // =====================================================================
  // Race + language mixer methods (custom fork; no upstream equivalent)
  // =====================================================================

  /**
   * Generates a deterministic seed for a culture-specific language mixer.
   * Combines the global map seed with the culture ID for reproducible results.
   */
  getCultureMixerSeed(cultureId: number): number {
    const seedStr = typeof seed === "string" ? seed : String(seed || "");
    let h = 2166136261;
    const s = `culture-mixer|${seedStr}|${cultureId}`;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  /**
   * Creates a seeded pseudo-random number generator from an integer seed.
   * Returns a function that produces floats in [0, 1).
   */
  makeRng(seedInt: number): () => number {
    let x = seedInt >>> 0;
    return () => {
      x += 0x6d2b79f5;
      let t = x;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /**
   * Reads the language mixer setting from the UI.
   * Returns "on", "off", or "random" (defaults to "on").
   */
  getLanguageMixerSetting(): string {
    const el = document.getElementById("languageMixer");
    return el && "value" in el ? (el as HTMLSelectElement).value : "on";
  }

  /**
   * Reads the current culture set from the UI.
   */
  getCultureSet(): string {
    const el = ensureEl<HTMLSelectElement>("culturesSet");
    return el ? el.value || "world" : "world";
  }

  /**
   * Filters the language mixer catalog based on the culture set preset configuration.
   * Uses `window.languageMixerCultureSets` to determine which categories/families
   * are allowed for the given culture set.
   */
  filterCatalogByCultureSet(catalog: LanguageMixerCatalogEntry[], cultureSet: string): LanguageMixerCatalogEntry[] {
    const config = (
      window as unknown as { languageMixerCultureSets?: Record<string, { categories?: string[]; families?: string[] }> }
    ).languageMixerCultureSets?.[cultureSet];
    if (!config) return catalog.filter(l => l && l.iso && !(l.tags && l.tags.includes("family")));

    const { categories, families } = config;
    const hasFilter = (categories && categories.length) || (families && families.length);

    // No filters = full catalog (world, random)
    if (!hasFilter) return catalog.filter(l => l && l.iso && !(l.tags && l.tags.includes("family")));

    const catSet = new Set((categories || []).map(c => c.toLowerCase()));
    const famSet = new Set((families || []).map(f => f.toLowerCase()));

    return catalog.filter(l => {
      if (!l || !l.iso) return false;
      if (l.tags && l.tags.includes("family")) return false;

      const cat = (l.category || "").toLowerCase();
      const fam = (l.family || "").toLowerCase();

      if (catSet.size && catSet.has(cat)) return true;
      if (famSet.size && famSet.has(fam)) return true;
      return false;
    });
  }

  /**
   * Builds ISO weights for culture mixing. Determines which languages
   * contribute to a culture's name generation based on:
   * 1. Race-based weights (if the culture has an associated race)
   * 2. Culture-set-filtered catalog with random selection
   *
   * Returns null if the mixer is disabled or no weights could be built.
   */
  buildCultureMixerIsoWeights(cultureId: number): Record<string, number> | null {
    const catalog = Array.isArray(window.languageMixerCatalog) ? window.languageMixerCatalog : [];
    if (!catalog.length) return null;

    const cultureSet = this.getCultureSet();
    const mixerSetting = this.getLanguageMixerSetting();

    // The "random" culture set has its own independent random namebase selection
    // and should not use the language mixer
    if (cultureSet === "random") return null;

    // Off = don't use mixer at all
    if (mixerSetting === "off") return null;

    // Random = 50/50 chance per culture
    if (mixerSetting === "random") {
      const seedInt = this.getCultureMixerSeed(cultureId);
      if (seedInt % 2 === 0) return null;
    }

    const culture = pack.cultures && pack.cultures[cultureId];

    // "Humans only" = mixer runs for non-Human (fantasy) cultures; Human
    // cultures use their preset namebases (same effect as Off for them).
    if (mixerSetting === "humans") {
      const raceName = culture && typeof getRaceNameForCulture === "function" ? getRaceNameForCulture(culture) : "";
      if (raceName === "Human") return null;
    }

    // If culture has a race, constrain the language pool to the race's
    // eligible languages, then pick a unique random subset per culture.
    // This ensures race identity is preserved (e.g. Elf cultures only draw
    // from Celtic/Uralic) while each culture gets a distinct name style.
    if (culture && typeof getRaceLanguageIsoWeights === "function") {
      const raceName = typeof getRaceNameForCulture === "function" ? getRaceNameForCulture(culture) : "";
      if (raceName) {
        const raceWeights = getRaceLanguageIsoWeights(raceName);
        if (raceWeights) {
          const raceIsoCodes = new Set(Object.keys(raceWeights));
          const racePool = catalog.filter(l => l && l.iso && raceIsoCodes.has(l.iso));
          if (racePool.length) {
            const rng = this.makeRng(this.getCultureMixerSeed(cultureId));
            const isoWeights: Record<string, number> = {};
            const picks = Math.min(3 + Math.floor(rng() * 4), racePool.length);
            for (let i = 0; i < picks; i++) {
              const lang = racePool[Math.floor(rng() * racePool.length)];
              if (!lang || !lang.iso) continue;
              isoWeights[lang.iso] = (isoWeights[lang.iso] || 0) + 1;
            }
            if (Object.keys(isoWeights).length) return isoWeights;
          }
        }
      }
    }

    // Filter catalog by culture set preset (no race constraint)
    let pool = this.filterCatalogByCultureSet(catalog, cultureSet);
    if (!pool.length) {
      // Fallback: if filter produced nothing, use full catalog
      pool = catalog.filter(l => l && l.iso && !(l.tags && l.tags.includes("family")));
    }
    if (!pool.length) return null;

    const rng = this.makeRng(this.getCultureMixerSeed(cultureId));
    const isoWeights: Record<string, number> = {};

    const picks = 3 + Math.floor(rng() * 4); // 3..6
    for (let i = 0; i < picks; i++) {
      const lang = pool[Math.floor(rng() * pool.length)];
      if (!lang || !lang.iso) continue;
      isoWeights[lang.iso] = (isoWeights[lang.iso] || 0) + 1;
    }

    return Object.keys(isoWeights).length ? isoWeights : null;
  }

  /**
   * Generates a fictional display name from a list of names using Markov chains.
   * Uses the same algorithm as the upstream name generator.
   */
  generateFictionalDisplayNameFromNames(names: string[], options?: { seed?: number }): string {
    if (
      !Names ||
      typeof (Names as unknown as { calculateChain?: (s: string) => string[][] & Record<string, string[]> })
        .calculateChain !== "function"
    )
      return "";
    if (!Array.isArray(names) || names.length < 3) return "";

    const sanitized = names
      .map(n =>
        String(n || "")
          .replace(/[/|,\d]/g, "")
          .replace(/_unq\d+\b/gi, "")
          .replace(/_/g, "")
          .trim()
      )
      .filter(Boolean);

    if (sanitized.length < 3) return "";

    const chain = (
      Names as unknown as { calculateChain: (s: string) => string[][] & Record<string, string[]> }
    ).calculateChain(sanitized.join(","));
    if (!chain || chain[""] === undefined) return "";

    const seedInt = options && typeof options.seed === "number" ? options.seed >>> 0 : 0;
    const rng = this.makeRng(seedInt || 1);
    const pick = (arr: string[]) => arr[Math.floor(rng() * arr.length)];

    const min = 4;
    const max = 14;
    const dupl = "lnrt";

    let v = chain[""],
      cur = pick(v),
      w = "";

    for (let i = 0; i < 20; i++) {
      if (cur === "") {
        if (w.length < min) {
          cur = "";
          w = "";
          v = chain[""];
        } else break;
      } else {
        if (w.length + cur.length > max) {
          if (w.length < min) w += cur;
          break;
        } else v = chain[cur.charAt(cur.length - 1)] || chain[""];
      }

      w += cur;
      cur = pick(v);
    }

    const wArr = [...w];
    const l = last(wArr);
    if (l === "'" || l === " " || l === "-") w = w.slice(0, -1);

    const name = [...w].reduce<string>((r, c, i, d) => {
      if (c === d[i + 1] && !dupl.includes(c)) return r;
      if (!r.length) return c.toUpperCase();
      if (last(r.split("")) === "-" && c === " ") return r;
      if (last(r.split("")) === " ") return r + c.toUpperCase();
      if (last(r.split("")) === "-") return r + c.toUpperCase();
      if (c === "a" && d[i + 1] === "e") return r;
      if (i + 2 < d.length && c === d[i + 1] && c === d[i + 2]) return r;
      return r + c;
    }, "");

    const finalName = String(name || "").trim();
    if (!finalName || finalName.length < 4) return "";
    if (/^(elven|dwarven|orcish|draconic)$/i.test(finalName)) return "";
    if (/\s/.test(finalName)) return "";
    return finalName;
  }

  /**
   * Ensures a culture has a mixer base index. Creates one if it doesn't exist.
   * @param raceName - Optional race name to tag the mixer base with so getRaceNameForCulture
   *   can still resolve the race after the culture's base is replaced.
   * Returns the base index, or null if no mixer base could be created.
   */
  ensureCultureMixerBaseIndex(cultureId: number, raceName?: string): number | null {
    if (
      !Names ||
      typeof (
        Names as unknown as {
          getMixedByIso?: (w: Record<string, number>, o: { count: number; seed: number }) => string[];
        }
      ).getMixedByIso !== "function"
    )
      return null;

    const nameBases = Names.nameBases;
    const existingIndex = Array.isArray(nameBases)
      ? nameBases.findIndex(
          b =>
            b &&
            (b as unknown as { cultureMixer?: boolean; cultureMixerFor?: number }).cultureMixer === true &&
            (b as unknown as { cultureMixerFor?: number }).cultureMixerFor === cultureId
        )
      : -1;
    if (existingIndex >= 0) return existingIndex;

    const isoWeights = this.buildCultureMixerIsoWeights(cultureId);
    if (!isoWeights) {
      WARN && console.warn(`culture ${cultureId}: no isoWeights (mixer catalog or setting issue)`);
      return null;
    }

    const mixSeed = this.getCultureMixerSeed(cultureId);
    const count = 240;
    let names: string[];
    try {
      names = (
        Names as unknown as {
          getMixedByIso: (w: Record<string, number>, o: { count: number; seed: number }) => string[];
        }
      ).getMixedByIso(isoWeights, { count, seed: mixSeed });
    } catch (_e) {
      ERROR && console.error(`culture ${cultureId}: getMixedByIso threw`, _e);
      return null;
    }

    if (!Array.isArray(names) || names.length < 3) {
      WARN && console.warn(`culture ${cultureId}: insufficient names (${names?.length ?? 0})`);
      return null;
    }
    const sanitized = names
      .map(n =>
        String(n || "")
          .replace(/[/|,\d]/g, "")
          .replace(/_unq\d+\b/gi, "")
          .replace(/_/g, "")
          .trim()
      )
      .filter(Boolean);
    if (sanitized.length < 3) return null;

    let min = 4;
    let max = 12;
    try {
      const lengths = sanitized.map(n => n.length).sort((a, b) => a - b);
      const q = (p: number) => lengths[Math.floor(p * (lengths.length - 1))];
      const p25 = q(0.25);
      const p75 = q(0.75);
      const computedMin = Math.max(3, Math.min(12, Math.floor(p25)));
      const computedMax = Math.max(computedMin, Math.min(16, Math.ceil(p75) + 2));
      min = computedMin;
      max = computedMax;
    } catch (_e) {
      /* keep defaults */
    }

    const nameSeed = (mixSeed ^ 0x9e3779b9) >>> 0;
    const displayName = this.generateFictionalDisplayNameFromNames(sanitized, { seed: nameSeed });
    const b = sanitized.join(",");
    const baseIndex = nameBases.length;

    const fallbackName = (() => {
      const sample = sanitized[0] ? String(sanitized[0]).trim() : "";
      if (sample.length >= 4 && !/\s/.test(sample)) {
        return sample.charAt(0).toUpperCase() + sample.slice(1).toLowerCase();
      }
      const consonants = "bcdfghjklmnpqrstvwxz";
      const vowels = "aeiouy";
      const rng = this.makeRng(nameSeed || 1);
      const pick = (s: string) => s[Math.floor(rng() * s.length)];
      let out = "";
      const target = 6 + Math.floor(rng() * 4);
      while (out.length < target) {
        out += pick(consonants) + pick(vowels);
        if (rng() < 0.15) out += pick(consonants);
      }
      out = out.slice(0, Math.min(10, Math.max(5, target)));
      return out.charAt(0).toUpperCase() + out.slice(1);
    })();

    nameBases.push({
      name: displayName || fallbackName,
      i: baseIndex,
      min,
      max,
      d: "",
      m: 0,
      b,
      cultureMixer: true,
      cultureMixerFor: cultureId,
      raceMixerFor: raceName && raceName !== "Human" ? raceName : undefined,
      isoWeights
    } as (typeof nameBases)[number] & {
      cultureMixer: boolean;
      cultureMixerFor: number;
      raceMixerFor?: string;
      isoWeights: Record<string, number>;
    });

    // Pre-compute the Markov chain for the new namebase so getBase() doesn't
    // return "ERROR" before updateChain() is called lazily.
    if (typeof Names.updateChain === "function") {
      Names.updateChain(baseIndex);
    }

    if (
      typeof (window as unknown as { refreshDefaultNameBaseIds?: () => void }).refreshDefaultNameBaseIds === "function"
    ) {
      (window as unknown as { refreshDefaultNameBaseIds: () => void }).refreshDefaultNameBaseIds();
    }

    return baseIndex;
  }

  /**
   * Returns a random valid namebase index, accounting for sparse array gaps.
   * Uses defaultNameBaseIds if available, otherwise falls back to array length.
   */
  getRandomValidBaseIndex(): number {
    const validBaseIds = (window as unknown as { defaultNameBaseIds?: number[] }).defaultNameBaseIds;
    if (Array.isArray(validBaseIds) && validBaseIds.length > 0) {
      return validBaseIds[rand(validBaseIds.length - 1)];
    }
    return rand(Names.nameBases.length - 1);
  }
}

window.Cultures = new CulturesGenerator();
