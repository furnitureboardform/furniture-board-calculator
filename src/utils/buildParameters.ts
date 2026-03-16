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
  outerMaskingLeft: boolean;
  outerMaskingRight: boolean;
  outerMaskingLeftFullCover: boolean;
  outerMaskingRightFullCover: boolean;
}

/** Buduje obiekt Parameters do raportu z aktualnego stanu formularza. */
export function buildParameters(state: FormStateForParameters): Parameters {
  const boxes = state.boxes;
  const numberOfDrawers = boxes.reduce((s, b) => s + (b.drawers || 0), 0);
  const boxWidthMm = boxes[0]?.width ?? 964;

  return {
    numberOfDrawers,
    numberOfBoxes: state.numberOfBoxes,
    boxWidths: boxes.map((b) => b.width),
    boxShelves: boxes.map((b) => b.shelves ?? 0),
    boxRods: boxes.map((b) => b.rods ?? 0),
    boxDrawers: boxes.map((b) => b.drawers ?? 0),
    boxDoubleDoors: boxes.map((b) => b.doubleDoor),
    boxWidthMm,
    numberOfLeftDoors: 0,
    numberOfRightDoors: 0,
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
    doorClearancePerSideMm: 2,
    isLeftSideFullyCovered: false,
    isRightSideFullyCovered: false,
    outerMaskingLeft: state.outerMaskingLeft,
    outerMaskingRight: state.outerMaskingRight,
    outerMaskingLeftFullCover: state.outerMaskingLeftFullCover,
    outerMaskingRightFullCover: state.outerMaskingRightFullCover,
    boxSlupki: boxes.map((b) => b.slupki ?? []),
    boxShelvesMm: boxes.map((b) => b.shelvesMm ?? []),
  };
}
