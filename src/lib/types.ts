export type FinishType = 'laminat' | 'okleina' | 'akryl';

export interface BoardFinish {
  type: FinishType;
  optionId: string;
}

/**
 * Parametry wejściowe do obliczeń (raport, prowadnice, płyty, drzwi, półki).
 */
export interface Parameters {
  numberOfDrawers: number;
  numberOfBoxes: number;
  boxWidths: number[];
  boxShelves: number[];
  boxRods: number[];
  boxDrawers: number[];
  boxWidthMm: number;
  cabinetDepthMm: number;
  nicheWidthMm: number;
  nicheHeightMm: number;
  hasNiches: boolean;
  leftBlendMm: number;
  rightBlendMm: number;
  topBlendMm: number;
  bottomBlendMm: number;
  leftNicheHeightMm: number;
  rightNicheHeightMm: number;
  topNicheWidthMm: number;
  bottomNicheWidthMm: number;
  numberOfLeftDoors: number;
  numberOfRightDoors: number;
  boxDoubleDoors: boolean[];
  doorClearancePerSideMm: number;
  isLeftSideFullyCovered: boolean;
  isRightSideFullyCovered: boolean;
  outerMaskingLeft: boolean;
  outerMaskingRight: boolean;
  outerMaskingLeftFullCover: boolean;
  outerMaskingRightFullCover: boolean;
  boxSlupki: number[][];
  boxShelvesMm: number[][];
}

/** Wymiary szafy po odjęciu blendów. */
export interface EffectiveWardrobeDimensions {
  effectiveWidthMm: number;
  effectiveHeightMm: number;
}

/** Wymiary elementów szuflady. */
export interface DrawerDimensions {
  internalWidth: number;
  internalDepth: number;
  sideDepth: number;
  frontWidth: number;
  internalWallsWidth: number;
  bottomDepth: number;
  bottomWidth: number;
}

/** Wymiary półki/blendy wnęki. */
export interface NicheDimensions {
  shelfHeight: number;
  shelfWidth: number;
  blendHeight: number;
  blendWidth: number;
  sidePanelHeight: number;
  sidePanelFullWidth: number;
  sidePanelPartialWidth: number;
}

/** Płyta meblowa (np. boki szuflady) – ilość na szufladę. */
export interface WoodenBoard {
  nr: number;
  name: string;
  dimensions: string;
  dimensionsTuple: [number, number];
  qtyPerDrawer: number;
  material: string;
  edgeBanding: string;
}

/** Dno szuflady (HDF). */
export interface HDFBoard {
  nr: number;
  name: string;
  dimensions: string;
  dimensionsTuple: [number, number];
  qtyPerDrawer: number;
  material: string;
}

/** Płyta wnęki (półka, blenda, boki) – ilość 1. */
export interface NicheBoard {
  nr: number;
  name: string;
  dimensions: string;
  dimensionsTuple: [number, number];
  qty: number;
  material: string;
  edgeBanding: string;
  color?: string;
}

/** Podsumowanie listy płyt (klucz = wymiary). */
export interface BoardsSummary {
  [dimensionsKey: string]: {
    name: string;
    material: string;
    qtyPerDrawer: number;
  };
}

/** Sprzęt (prowadnice, sprzęgła, uchwyty, zawiasy). */
export interface Hardware {
  totalGuides: number;
  totalBrackets: number;
  numberOfLeftDoors: number;
  numberOfRightDoors: number;
  totalDoors: number;
  totalHandles: number;
  totalHinges: number;
  totalLegs: number;
}

export type DoorSideType = 'left' | 'right';

/** Jedne drzwi (wymiary, typ). */
export interface DoorInfo {
  boxNumber: number;
  doubleDoor: boolean;
  widthMm: number;
  heightMm: number;
}

/** Wymagania na drzwi (wysokość, luz, lista drzwi). */
export interface DoorRequirements {
  totalDoors: number;
  wardrobeHeightMm: number;
  doorHeightMm: number;
  sidePanelThicknessMm: number;
  topClearanceMm: number;
  bottomClearanceMm: number;
  leftClearanceMm: number;
  rightClearanceMm: number;
  doors: DoorInfo[];
}

/** Półki w jednym boxie. */
export interface ShelfByBox {
  boxNumber: number;
  quantity: number;
  widthMm: number;
  depthMm: number;
}

/** Wymagania na półki (głębokość, suma, per box). */
export interface ShelvesRequirements {
  shelfDepthMm: number;
  doorThicknessMm: number;
  doorClearanceFromCabinetMm: number;
  backBoardThicknessMm: number;
  totalShelves: number;
  shelvesByBox: ShelfByBox[];
}

/** Jedna pozycja formularza boxu (UI). */
export interface BoxForm {
  width: number;
  doubleDoor: boolean;
  shelves: number;
  shelvesMm: number[];
  rods: number;
  drawers: number;
  slupki: number[];
}

/** Nazwy pól wnęki do onNicheChange. */
export type NicheFieldName =
  | 'nicheWidthMm'
  | 'nicheHeightMm'
  | 'cabinetDepthMm'
  | 'leftBlendMm'
  | 'rightBlendMm'
  | 'topBlendMm'
  | 'bottomBlendMm'
  | 'leftNicheHeightMm'
  | 'rightNicheHeightMm'
  | 'topNicheWidthMm'
  | 'bottomNicheWidthMm';
