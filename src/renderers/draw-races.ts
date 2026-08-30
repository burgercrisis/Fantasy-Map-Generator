import { ensureEl, getIsolines } from "@/utils";

export function drawRaces(): void {
  TIME && console.time("drawRaces");
  const { cells } = pack;
  const races = (pack as unknown as { races?: Array<{ i: number; color?: string; removed?: boolean }> }).races;

  if (!races || races.length <= 1 || !cells || !(cells as unknown as { race?: Uint16Array }).race) {
    ensureEl("races").innerHTML = "";
    TIME && console.timeEnd("drawRaces");
    return;
  }

  const isolines = getIsolines(pack, cellId => (cells as unknown as { race: Uint16Array }).race[cellId], {
    fill: true,
    waterGap: true
  });

  const bodyPaths: string[] = [];
  for (const [index, { fill, waterGap }] of Object.entries(isolines)) {
    const race = races[+index];
    if (!race || !race.i || race.removed) continue;
    const color = race.color || "#888888";
    if (fill) bodyPaths.push(/* html */ `<path d="${fill}" fill="${color}" id="race${index}" />`);
    if (waterGap)
      bodyPaths.push(
        /* html */ `<path d="${waterGap}" fill="none" stroke="${color}" stroke-width="3" id="race-gap${index}" />`
      );
  }

  ensureEl("races").innerHTML = bodyPaths.join("");
  TIME && console.timeEnd("drawRaces");
}
