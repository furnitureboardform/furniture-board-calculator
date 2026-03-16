import * as specs from './specifications';
import * as constants from './constants';
import type {
  Parameters,
  EffectiveWardrobeDimensions,
  DrawerDimensions,
  NicheDimensions,
  Hardware,
  DoorRequirements,
  DoorInfo,
  ShelvesRequirements,
  ShelfByBox,
} from './types';


export function getEffectiveWardrobeDimensions(
  parameters: Parameters
): EffectiveWardrobeDimensions {
  const effectiveWidthMm =
    parameters.nicheWidthMm -
    (parameters.leftBlendMm || 0) -
    (parameters.rightBlendMm || 0);
  const effectiveHeightMm =
    parameters.nicheHeightMm -
    (parameters.topBlendMm || 0) -
    (parameters.bottomBlendMm || 0);
  return { effectiveWidthMm, effectiveHeightMm };
}

export function calculateDimensions(parameters: Parameters): DrawerDimensions {
  const internalWidth = parameters.boxWidthMm - 2 * specs.sideMatThicknessMm;
  const internalDepth = parameters.cabinetDepthMm - specs.guidesMarginMm;
  const sideDepth = internalDepth;
  // Front = wnętrze boxa - 1 separator 40mm - luz 8mm (ogólny przypadek, pojedyncze drzwi)
  const frontWidth = parameters.boxWidthMm - specs.separatorWidthMm - specs.drawerFrontClearanceMm;
  // Przód/Tył: boxWidth - 40mm (1 separator) - 90mm (5× grubość płyty)
  const internalWallsWidth = parameters.boxWidthMm - specs.separatorWidthMm - specs.drawerInternalWallDeductionMm;
  // HDF: głębokość = bok szuflady - 8mm; szerokość = przód/tył + 20mm
  const bottomDepth = internalDepth - 4;
  const bottomWidth = (parameters.boxWidthMm - specs.separatorWidthMm - specs.drawerInternalWallDeductionMm) + 18;
  return {
    internalWidth,
    internalDepth,
    sideDepth,
    frontWidth,
    internalWallsWidth,
    bottomDepth,
    bottomWidth,
  };
}

export function calculateNicheDimensions(parameters: Parameters): NicheDimensions {
  const wardrobe = getEffectiveWardrobeDimensions(parameters);
  const shelfWidth = wardrobe.effectiveWidthMm - specs.nicheThicknessDeductionMm;
  const blendWidth = wardrobe.effectiveWidthMm - specs.nicheThicknessDeductionMm;
  const sidePanelHeight = wardrobe.effectiveHeightMm - 5;
  const sidePanelFullWidth = parameters.cabinetDepthMm + 3;
  const sidePanelPartialWidth = 100;
  return {
    shelfHeight: specs.nicheShelfHeightMm,
    shelfWidth,
    blendHeight: specs.nicheBlendHeightMm,
    blendWidth,
    sidePanelHeight,
    sidePanelFullWidth,
    sidePanelPartialWidth,
  };
}

export function calculateHardware(parameters: Parameters): Hardware {
  const totalGuides = parameters.numberOfDrawers * constants.GUIDES_PER_DRAWER;
  const totalBrackets = parameters.numberOfDrawers * constants.BRACKETS_PER_DRAWER;
  const totalDoorsFromSides =
    (parameters.numberOfLeftDoors || 0) + (parameters.numberOfRightDoors || 0);
  const totalDoors =
    totalDoorsFromSides > 0 ? totalDoorsFromSides : parameters.numberOfBoxes;
  const boxDoubleDoors = parameters.boxDoubleDoors ?? [];
  const totalHandles = Array.from({ length: parameters.numberOfBoxes }, (_, i) =>
    boxDoubleDoors[i] ? 2 : 1
  ).reduce((sum, n) => sum + n, 0) * constants.HANDLES_PER_DOOR;
  const totalHinges = totalDoors * constants.HINGES_PER_DOOR;
  const totalLegs = parameters.numberOfBoxes * constants.LEGS_PER_BOX;
  return {
    totalGuides,
    totalBrackets,
    numberOfLeftDoors: parameters.numberOfLeftDoors,
    numberOfRightDoors: parameters.numberOfRightDoors,
    totalDoors,
    totalHandles,
    totalHinges,
    totalLegs,
  };
}

export function calculateDoorRequirements(parameters: Parameters): DoorRequirements {
  const sidePanelThicknessMm = 18;
  const topClearanceMm = 2;
  const bottomClearanceMm = 2;
  const leftClearanceMm = 2;
  const rightClearanceMm = 2;
  const wardrobe = getEffectiveWardrobeDimensions(parameters);
  const boxWidths =
    parameters.boxWidths && parameters.boxWidths.length > 0
      ? parameters.boxWidths.slice(0, parameters.numberOfBoxes)
      : Array(parameters.numberOfBoxes).fill(parameters.boxWidthMm) as number[];
  const boxDoubleDoors = parameters.boxDoubleDoors ?? [];
  const doorHeightMm =
    wardrobe.effectiveHeightMm - topClearanceMm - bottomClearanceMm;
  const doors: DoorInfo[] = boxWidths.map((boxInteriorWidthMm, index) => {
    const doubleDoor = boxDoubleDoors[index] ?? false;
    const fullWidthMm =
      boxInteriorWidthMm +
      2 * sidePanelThicknessMm -
      leftClearanceMm -
      rightClearanceMm;
    return {
      boxNumber: index + 1,
      doubleDoor,
      widthMm: doubleDoor ? Math.floor(fullWidthMm / 2) : fullWidthMm,
      heightMm: doorHeightMm,
    };
  });
  return {
    totalDoors: parameters.numberOfBoxes,
    wardrobeHeightMm: wardrobe.effectiveHeightMm,
    doorHeightMm,
    sidePanelThicknessMm,
    topClearanceMm,
    bottomClearanceMm,
    leftClearanceMm,
    rightClearanceMm,
    doors,
  };
}

export function calculateShelvesRequirements(
  parameters: Parameters
): ShelvesRequirements {
  const doorThicknessMm = 18;
  const doorClearanceFromCabinetMm = 2;
  const backBoardThicknessMm = 3;
  const shelfDepthMm =
    parameters.cabinetDepthMm -
    doorThicknessMm -
    doorClearanceFromCabinetMm -
    backBoardThicknessMm;
  const boxWidths =
    parameters.boxWidths && parameters.boxWidths.length > 0
      ? parameters.boxWidths.slice(0, parameters.numberOfBoxes)
      : Array(parameters.numberOfBoxes).fill(parameters.boxWidthMm);
  const boxShelves =
    parameters.boxShelves && parameters.boxShelves.length > 0
      ? parameters.boxShelves.slice(0, parameters.numberOfBoxes)
      : Array(parameters.numberOfBoxes).fill(0);
  const shelvesByBox: ShelfByBox[] = boxWidths.map((boxInteriorWidthMm, index) => ({
    boxNumber: index + 1,
    quantity: boxShelves[index] || 0,
    widthMm: boxInteriorWidthMm,
    depthMm: shelfDepthMm,
  }));
  const totalShelves = shelvesByBox.reduce((total, shelf) => total + shelf.quantity, 0);
  return {
    shelfDepthMm,
    doorThicknessMm,
    doorClearanceFromCabinetMm,
    backBoardThicknessMm,
    totalShelves,
    shelvesByBox,
  };
}
