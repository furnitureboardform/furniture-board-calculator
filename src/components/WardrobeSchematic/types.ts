import type { BoxForm } from '../../lib/types';

export type ItemType = 'shelves' | 'rods' | 'drawers' | 'partition' | 'nadstawka';

export interface PositionedItem {
  id: string;
  type: ItemType;
  /** mm from top of main area — for shelves/rods/drawers */
  yMm: number;
  /** mm from left edge of box interior — only for partitions */
  xMm?: number;
  /**
   * For shelves/rods/drawers: fixed horizontal span expressed in mm
   * from left edge of box interior. Once set, it does NOT change even
   * if new partitions are added later.
   */
  startMm?: number;
  endMm?: number;
  /** computed top of partition span — only for partitions */
  spanTopMm?: number;
  /** computed bottom of partition span — only for partitions */
  spanBotMm?: number;
}

export interface TooltipState {
  x: number;
  y: number;
  text: string;
}

export interface PaletteConfig {
  type: ItemType;
  label: string;
  icon: string;
  fill: string;
  stroke: string;
  /** visual height in mm for SVG rendering */
  heightMm: number;
  /** actual board/item thickness used for snap & label calculations */
  boardMm: number;
}

export type WardrobeSegment = {
  type: 'mask' | 'niche-l' | 'niche-r' | 'panel' | 'box';
  xMm: number;
  wMm: number;
  boxIdx?: number;
};

export type BoxSeg = WardrobeSegment & { boxIdx: number };

export type DragHoverPos = {
  boxIdx: number;
  yMm: number;
  /** for partitions: X position within box interior */
  xMm?: number;
  spanTopMm?: number;
  spanBotMm?: number;
};

export interface WardrobeSchematicProps {
  nicheWidthMm: number;
  nicheHeightMm: number;
  outerMaskingLeft: boolean;
  outerMaskingRight: boolean;
  hasSideNiches: boolean;
  leftBlendMm: number;
  rightBlendMm: number;
  leftNicheHeightMm: number;
  rightNicheHeightMm: number;
  topBlendMm: number;
  bottomBlendMm: number;
  boxes: BoxForm[];
  numberOfBoxes: number;
  onBoxChange: (index: number, field: keyof BoxForm, value: number | string | boolean | number[]) => void;
  initialPlacedItems?: Record<number, PositionedItem[]>;
  onPlacedItemsChange?: (items: Record<number, PositionedItem[]>) => void;
}
