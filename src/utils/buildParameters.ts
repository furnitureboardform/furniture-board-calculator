import type { Parameters, BoxForm } from '../lib/types';

export interface FormStateForParameters {
  boxes: BoxForm[];
  numberOfBoxes: number;
  nicheWidthMm: number;
  nicheHeightMm: number;
  cabinetDepthMm: number;
  hasNiches: boolean;
  leftBlendMm: number;
  rightBlendMm: number;
  topBlendMm: number;
  bottomBlendMm: number;
  leftNicheHeightMm: number;
  rightNicheHeightMm: number;
  topNicheWidthMm: number;
  bottomNicheWidthMm: number;
}

/** Buduje obiekt Parameters do raportu z aktualnego stanu formularza. */
export function buildParameters(state: FormStateForParameters): Parameters {
  const sortedBoxes = [...state.boxes].sort((a, b) =>
    a.doorType === 'left' && b.doorType === 'right'
      ? -1
      : a.doorType === 'right' && b.doorType === 'left'
        ? 1
        : 0
  );
  const numberOfDrawers = sortedBoxes.reduce(
    (s, b) => s + (b.drawers || 0),
    0
  );
  const numberOfLeftDoors = sortedBoxes.filter((b) => b.doorType === 'left')
    .length;
  const numberOfRightDoors = sortedBoxes.filter(
    (b) => b.doorType === 'right'
  ).length;
  const boxWidthMm = sortedBoxes[0]?.width ?? 964;

  return {
    numberOfDrawers,
    numberOfBoxes: state.numberOfBoxes,
    boxWidths: sortedBoxes.map((b) => b.width),
    boxShelves: sortedBoxes.map((b) => b.shelves ?? 0),
    boxRods: sortedBoxes.map((b) => b.rods ?? 0),
    boxDrawers: sortedBoxes.map((b) => b.drawers ?? 0),
    boxWidthMm,
    cabinetDepthMm: state.cabinetDepthMm,
    nicheWidthMm: state.nicheWidthMm,
    nicheHeightMm: state.nicheHeightMm,
    hasNiches: state.hasNiches,
    leftBlendMm: state.leftBlendMm,
    rightBlendMm: state.rightBlendMm,
    topBlendMm: state.topBlendMm,
    bottomBlendMm: state.bottomBlendMm,
    leftNicheHeightMm: state.leftNicheHeightMm,
    rightNicheHeightMm: state.rightNicheHeightMm,
    topNicheWidthMm: state.topNicheWidthMm,
    bottomNicheWidthMm: state.bottomNicheWidthMm,
    numberOfLeftDoors,
    numberOfRightDoors,
    doorClearancePerSideMm: 2,
    isLeftSideFullyCovered: false,
    isRightSideFullyCovered: false,
  };
}
