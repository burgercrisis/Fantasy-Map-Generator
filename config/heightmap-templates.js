"use strict";

const heightmapTemplates = (function () {
  const volcano = `Hill 1 90-100 44-56 40-60
    Multiply 0.8 50-100 0 0
    Range 1.5 30-55 45-55 40-60
    Smooth 3 0 0 0
    Hill 1.5 35-45 25-30 20-75
    Hill 1 35-55 75-80 25-75
    Hill 0.5 20-25 10-15 20-25
    Mask 3 0 0 0`;

  const highIsland = `Hill 1 90-100 65-75 47-53
    Add 7 all 0 0
    Hill 5-6 20-30 25-55 45-55
    Range 1 40-50 45-55 45-55
    Multiply 0.8 land 0 0
    Mask 3 0 0 0
    Smooth 2 0 0 0
    Trough 2-3 20-30 20-30 20-30
    Trough 2-3 20-30 60-80 70-80
    Hill 1 10-15 60-60 50-50
    Hill 1.5 13-16 15-20 20-75
    Range 1.5 30-40 15-85 30-40
    Range 1.5 30-40 15-85 60-70
    Pit 3-5 10-30 15-85 20-80`;

  const lowIsland = `Hill 1 90-99 60-80 45-55
    Hill 1-2 20-30 10-30 10-90
    Smooth 2 0 0 0
    Hill 6-7 25-35 20-70 30-70
    Range 1 40-50 45-55 45-55
    Trough 2-3 20-30 15-85 20-30
    Trough 2-3 20-30 15-85 70-80
    Hill 1.5 10-15 5-15 20-80
    Hill 1 10-15 85-95 70-80
    Pit 5-7 15-25 15-85 20-80
    Multiply 0.4 20-100 0 0
    Mask 4 0 0 0`;

  const continents = `Hill 1 80-85 60-80 40-60
    Hill 1 80-85 20-30 40-60
    Hill 6-7 15-30 25-75 15-85
    Multiply 0.6 land 0 0
    Hill 8-10 5-10 15-85 20-80
    Range 1-2 30-60 5-15 25-75
    Range 1-2 30-60 80-95 25-75
    Range 0-3 30-60 80-90 20-80
    Strait 2 vertical 0 0
    Strait 1 vertical 0 0
    Smooth 3 0 0 0
    Trough 3-4 15-20 15-85 20-80
    Trough 3-4 5-10 45-55 45-55
    Pit 3-4 10-20 15-85 20-80
    Mask 4 0 0 0`;

  const archipelago = `Add 11 all 0 0
    Range 2-3 40-60 20-80 20-80
    Hill 5 15-20 10-90 30-70
    Hill 2 10-15 10-30 20-80
    Hill 2 10-15 60-90 20-80
    Smooth 3 0 0 0
    Trough 10 20-30 5-95 5-95
    Strait 2 vertical 0 0
    Strait 2 horizontal 0 0`;

  const barrierIslands = `Range 3-4 15-25 5-25 10-90
    Smooth 2 0 0 0
    Trough 3-4 20-30 25-40 10-90
    Range 4-6 25-35 40-55 10-90
    Trough 2-3 15-25 45-60 10-90
    Range 2-3 18-24 60-75 10-90
    Smooth 2 0 0 0
    Multiply 0.8 land 0 0
    Strait 1-2 vertical 0 0
    Mask 3 0 0 0`;

  const atoll = `Hill 1 75-80 50-60 45-55
    Hill 1.5 30-50 25-75 30-70
    Hill .5 30-50 25-35 30-70
    Smooth 1 0 0 0
    Multiply 0.2 25-100 0 0
    Hill 0.5 10-20 50-55 48-52`;

  const mediterranean = `Range 4-6 30-80 0-100 0-10
    Range 4-6 30-80 0-100 90-100
    Hill 6-8 30-50 10-90 0-5
    Hill 6-8 30-50 10-90 95-100
    Multiply 0.9 land 0 0
    Mask -2 0 0 0
    Smooth 1 0 0 0
    Hill 2-3 30-70 0-5 20-80
    Hill 2-3 30-70 95-100 20-80
    Trough 3-6 40-50 0-100 0-10
    Trough 3-6 40-50 0-100 90-100`;

  const bay = `Range 3-5 25-55 20-80 5-20
    Range 3-5 25-55 20-80 80-95
    Hill 4-6 30-50 25-75 0-10
    Hill 4-6 30-50 25-75 90-100
    Multiply 0.9 land 0 0
    Smooth 1 0 0 0
    Trough 4-6 20-35 55-100 20-80
    Pit 3-5 15-25 65-95 35-65`;

  const peninsula = `Range 2-3 20-35 40-50 0-15
    Add 5 all 0 0
    Hill 1 90-100 10-90 0-5
    Add 13 all 0 0
    Hill 3-4 3-5 5-95 80-100
    Hill 1-2 3-5 5-95 40-60
    Trough 5-6 10-25 5-95 5-95
    Smooth 3 0 0 0
    Invert 0.4 both 0 0`;

  const cape = `Range 2-3 15-25 40-55 0-12
    Add 5 all 0 0
    Hill 1 90-100 10-90 0-5
    Add 13 all 0 0
    Hill 3-4 2-4 5-95 82-100
    Hill 1-2 3-5 5-95 40-60
    Trough 3-4 10-18 10-35 8-32
    Smooth 4 0 0 0
    Smooth 2 0 0 0
    Invert 0.4 both 0 0`;

  const pangea = `Hill 1-2 25-40 15-50 0-10
    Hill 1-2 5-40 50-85 0-10
    Hill 1-2 25-40 50-85 90-100
    Hill 1-2 5-40 15-50 90-100
    Hill 8-12 20-40 20-80 48-52
    Smooth 2 0 0 0
    Multiply 0.7 land 0 0
    Trough 3-4 25-35 5-95 10-20
    Trough 3-4 25-35 5-95 80-90
    Range 5-6 30-40 10-90 35-65`;

  const isthmus = `Hill 5-10 15-30 0-30 0-20
    Hill 5-10 15-30 10-50 20-40
    Hill 5-10 15-30 30-70 40-60
    Hill 5-10 15-30 50-90 60-80
    Hill 5-10 15-30 70-100 80-100
    Smooth 2 0 0 0
    Trough 4-8 15-30 0-30 0-20
    Trough 4-8 15-30 10-50 20-40
    Trough 4-8 15-30 30-70 40-60
    Trough 4-8 15-30 50-90 60-80
    Trough 4-8 15-30 70-100 80-100
    Invert 0.25 x 0 0`;

  const shattered = `Hill 8 35-40 15-85 30-70
    Trough 10-20 40-50 5-95 5-95
    Range 5-7 30-40 10-90 20-80
    Pit 12-20 30-40 15-85 20-80`;

  const taklamakan = `Hill 1-3 20-30 30-70 30-70
    Hill 2-4 60-85 0-5 0-100
    Hill 2-4 60-85 95-100 0-100
    Hill 3-4 60-85 20-80 0-5
    Hill 3-4 60-85 20-80 95-100
    Smooth 3 0 0 0`;

  const dryLakes = `Hill 1-3 20-30 30-70 30-70
    Hill 2-4 60-85 0-5 0-100
    Hill 2-4 60-85 95-100 0-100
    Hill 3-4 60-85 20-80 0-5
    Hill 3-4 60-85 20-80 95-100
    Pit 2-3 35-45 45-55 45-55
    Pit 4-6 25-35 40-60 35-65
    Pit 4-6 18-28 30-70 30-70
    Smooth 3 0 0 0`;

  const oldWorld = `Range 3 70 15-85 20-80
    Hill 2-3 50-70 15-45 20-80
    Hill 2-3 50-70 65-85 20-80
    Hill 4-6 20-25 15-85 20-80
    Multiply 0.5 land 0 0
    Smooth 2 0 0 0
    Range 3-4 20-50 15-35 20-45
    Range 2-4 20-50 65-85 45-80
    Strait 3-7 vertical 0 0
    Trough 6-8 20-50 15-85 45-65
    Pit 5-6 20-30 10-90 10-90`;

  const fractious = `Hill 12-15 50-80 5-95 5-95
    Mask -1.5 0 0 0
    Mask 3 0 0 0
    Add -20 30-100 0 0
    Range 6-8 40-50 5-95 10-90`;

  const riftContinent = `Hill 2-3 70-85 20-80 35-65
    Range 2-3 40-60 20-80 30-45
    Range 2-3 40-60 20-80 55-70
    Trough 1 45-60 45-55 10-90
    Trough 1 35-50 45-55 10-90
    Pit 3-5 20-35 35-65 20-80
    Smooth 2 0 0 0
    Mask 3 0 0 0`;

  const tripleJunction = `Range 1-2 45-65 40-60 40-60
    Trough 1 45-60 45-55 45-55
    Trough 1 45-60 45-55 45-55
    Trough 1 45-60 45-55 45-55
    Pit 1-2 30-45 45-55 45-55
    Smooth 2 0 0 0
    Mask 3 0 0 0`;

  const backArcChain = `Add 10 all 0 0
    Range 2-3 40-60 15-35 20-80
    Range 2-3 40-60 25-45 20-80
    Hill 6-10 20-35 10-50 20-80
    Trough 1-2 25-40 45-65 20-80
    Smooth 2 0 0 0
    Multiply 0.7 land 0 0
    Mask 3 0 0 0`;

  const calderaArchipelago = `Add 12 all 0 0
    Hill 12-18 25-40 10-90 15-85
    Pit 10-14 10-18 10-90 15-85
    Range 2-3 25-40 20-80 20-80
    Smooth 2 0 0 0
    Multiply 0.35 20-100 0 0
    Mask 3 0 0 0`;

  const impactRing = `Hill 1 60-70 45-55 45-55
    Pit 1 70-85 45-55 45-55
    Range 2-3 50-70 30-70 30-70
    Hill 8-12 20-35 25-75 25-75
    Smooth 2 0 0 0
    Trough 3-5 20-35 35-65 35-65
    Mask 3 0 0 0`;

  const fjordCoast = `Range 4-6 45-70 0-15 10-90
    Hill 3-5 35-55 0-20 10-90
    Smooth 2 0 0 0
    Trough 12-18 20-35 0-25 5-95
    Trough 4-6 35-55 20-40 10-90
    Multiply 0.9 land 0 0
    Mask 3 0 0 0`;

  const drownedRiverlands = `Add 6 all 0 0
    Range 1-2 25-40 60-90 20-80
    Smooth 2 0 0 0
    Trough 10-14 10-18 30-70 20-80
    Trough 6-8 18-28 60-90 20-80
    Multiply 0.8 land 0 0
    Mask 3 0 0 0`;

  const inlandSeaStraits = `Range 2-3 40-60 0-100 0-15
    Range 2-3 40-60 0-100 85-100
    Pit 1 80-95 45-55 45-55
    Trough 2-3 40-55 35-65 35-65
    Strait 1 vertical 0 0
    Strait 1 horizontal 0 0
    Smooth 2 0 0 0
    Mask 3 0 0 0`;

  const highPlateauCanyons = `Add 18 all 0 0
    Range 3-4 40-60 20-80 20-80
    Smooth 4 0 0 0
    Multiply 0.85 land 0 0
    Trough 8-12 25-40 10-90 10-90
    Trough 4-6 35-55 20-80 20-80
    Mask 3 0 0 0`;

  const endorheicBasins = `Add 8 all 0 0
    Mask -2 0 0 0
    Pit 12-18 12-20 20-80 20-80
    Pit 3-5 25-35 35-65 35-65
    Smooth 3 0 0 0
    Multiply 0.9 land 0 0
    Mask 3 0 0 0`;

  return {
    volcano: {id: 0, name: "Volcano", template: volcano, probability: 3},
    highIsland: {id: 1, name: "High Island", template: highIsland, probability: 19},
    lowIsland: {id: 2, name: "Low Island", template: lowIsland, probability: 9},
    continents: {id: 3, name: "Continents", template: continents, probability: 16},
    archipelago: {id: 4, name: "Archipelago", template: archipelago, probability: 18},
    barrierIslands: {id: 5, name: "Barrier Islands", template: barrierIslands, probability: 4},
    atoll: {id: 6, name: "Atoll", template: atoll, probability: 1},
    mediterranean: {id: 7, name: "Mediterranean", template: mediterranean, probability: 5},
    bay: {id: 16, name: "Bay", template: bay, probability: 3},
    peninsula: {id: 8, name: "Peninsula", template: peninsula, probability: 3},
    cape: {id: 17, name: "Cape", template: cape, probability: 2},
    pangea: {id: 9, name: "Pangea", template: pangea, probability: 5},
    isthmus: {id: 10, name: "Isthmus", template: isthmus, probability: 2},
    shattered: {id: 11, name: "Shattered", template: shattered, probability: 7},
    taklamakan: {id: 12, name: "Taklamakan", template: taklamakan, probability: 1},
    oldWorld: {id: 13, name: "Old World", template: oldWorld, probability: 8},
    fractious: {id: 14, name: "Fractious", template: fractious, probability: 3},
    dryLakes: {id: 15, name: "Dry Lakes", template: dryLakes, probability: 1},
    riftContinent: {id: 18, name: "Rift Continent", template: riftContinent, probability: 3},
    tripleJunction: {id: 19, name: "Triple Junction", template: tripleJunction, probability: 2},
    backArcChain: {id: 20, name: "Back-Arc Chain", template: backArcChain, probability: 2},
    calderaArchipelago: {id: 21, name: "Caldera Archipelago", template: calderaArchipelago, probability: 2},
    impactRing: {id: 22, name: "Impact Ring", template: impactRing, probability: 1},
    fjordCoast: {id: 23, name: "Fjord Coast", template: fjordCoast, probability: 2},
    drownedRiverlands: {id: 24, name: "Drowned Riverlands", template: drownedRiverlands, probability: 2},
    inlandSeaStraits: {id: 25, name: "Inland Sea + Straits", template: inlandSeaStraits, probability: 2},
    highPlateauCanyons: {id: 26, name: "High Plateau + Canyons", template: highPlateauCanyons, probability: 2},
    endorheicBasins: {id: 27, name: "Endorheic Basins", template: endorheicBasins, probability: 1}
  };
})();
