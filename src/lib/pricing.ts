import type { ElementsData, HardwareSummary } from './report';
import type { BoardFinish, DoorHandleSelection } from './types';
import { ALL_FINISH_OPTIONS } from './finishOptions';
import { ALL_HANDLE_OPTIONS } from './handleOptions';

const COST_PER_HINGE_PLN = 13;
const COST_PER_GUIDE_SET_PLN = 104;
const COST_PER_BRACKET_SET_PLN = 8;
const DEFAULT_HANDLE_PRICE_PLN = 25;
const COST_PER_LEG_PLN = 6;
const COST_PER_LEG_CLIP_PLN = 1;
const COST_PER_ROD_PLN = 15;
const BOARD_PIECE_WIDTH_MM = 2800;
const BOARD_PIECE_HEIGHT_MM = 1045;
const BOARD_PIECE_AREA_MM2 = BOARD_PIECE_WIDTH_MM * BOARD_PIECE_HEIGHT_MM;
const COST_PER_SZARY_PIECE_PLN = 120;
const COST_PER_KOLOR_PIECE_PLN = 205;
const COST_PER_METER_CUTTING_PLN = 5;
const COST_PER_METER_BANDING_PLN = 6;

interface BoardEntry {
  dim1: number;
  dim2: number;
  edgeBandingMm: number;
  qty: number;
}

export interface PricingSummary {
  totalCost: number;
  roundedBaseForClient: number;
  clientPrice: number;
  handleUnitPrice: number;
}

function calcBoardPieces(boards: BoardEntry[]): number {
  const totalArea = boards.reduce((sum, b) => sum + b.dim1 * b.dim2 * b.qty, 0);
  return Math.ceil(totalArea / BOARD_PIECE_AREA_MM2);
}

function calcCuttingLengthM(boards: BoardEntry[]): number {
  const totalMm = boards.reduce((sum, b) => sum + (b.dim1 + b.dim2) * b.qty, 0);
  return Math.round(totalMm) / 1000;
}

function calcEdgeBandingLengthM(boards: BoardEntry[]): number {
  const totalMm = boards.reduce((sum, b) => sum + b.edgeBandingMm * b.qty, 0);
  return Math.round(totalMm) / 1000;
}

function roundUpToCents(value: number): number {
  return Math.ceil(value * 100) / 100;
}

function roundUpToHundreds(value: number): number {
  return Math.ceil(value / 100) * 100;
}

function groupBoards(boards: BoardEntry[]): BoardEntry[] {
  const map = new Map<string, BoardEntry>();
  for (const board of boards) {
    const key = `${board.dim1}x${board.dim2}|${board.edgeBandingMm}`;
    const existing = map.get(key);
    if (existing) {
      existing.qty += board.qty;
      continue;
    }
    map.set(key, { ...board });
  }
  return Array.from(map.values());
}

function getKolorBoards(elementsData: ElementsData): BoardEntry[] {
  const boards: BoardEntry[] = [];

  for (const box of elementsData.boxes) {
    if (box.door) {
      const qty = box.door.doubleDoor ? 2 : 1;
      boards.push({
        dim1: box.door.heightMm,
        dim2: box.door.widthMm,
        edgeBandingMm: 2 * (box.door.heightMm + box.door.widthMm),
        qty,
      });
    }
  }

  const { left, right, top, bottom } = elementsData.niches;
  if (left.widthMm > 0 && left.heightMm > 0) {
    boards.push({ dim1: left.widthMm, dim2: left.heightMm, edgeBandingMm: 0, qty: 1 });
  }
  if (right.widthMm > 0 && right.heightMm > 0) {
    boards.push({ dim1: right.widthMm, dim2: right.heightMm, edgeBandingMm: 0, qty: 1 });
  }
  if (top.widthMm > 0 && top.heightMm > 0) {
    boards.push({ dim1: top.widthMm, dim2: top.heightMm, edgeBandingMm: 0, qty: 1 });
  }
  if (bottom.widthMm > 0 && bottom.heightMm > 0) {
    boards.push({ dim1: bottom.widthMm, dim2: bottom.heightMm, edgeBandingMm: 0, qty: 1 });
  }

  if (elementsData.maskings?.left) {
    boards.push({
      dim1: elementsData.maskings.left.heightMm,
      dim2: elementsData.maskings.left.widthMm,
      edgeBandingMm: elementsData.maskings.left.heightMm,
      qty: 1,
    });
  }

  if (elementsData.maskings?.right) {
    boards.push({
      dim1: elementsData.maskings.right.heightMm,
      dim2: elementsData.maskings.right.widthMm,
      edgeBandingMm: elementsData.maskings.right.heightMm,
      qty: 1,
    });
  }

  return boards;
}

function getSzaryBoards(elementsData: ElementsData): BoardEntry[] {
  const boards: BoardEntry[] = [];

  for (const box of elementsData.boxes) {
    if (box.shelves) {
      for (const group of box.shelves.groups) {
        boards.push({
          dim1: group.widthMm,
          dim2: box.shelves.depthMm,
          edgeBandingMm: group.widthMm,
          qty: group.qty,
        });
      }
    }

    if (box.panels) {
      boards.push({
        dim1: box.panels.sideHeightMm,
        dim2: box.panels.depthMm,
        edgeBandingMm: box.panels.sideHeightMm,
        qty: 2,
      });
      boards.push({
        dim1: box.panels.topBottomWidthMm,
        dim2: box.panels.depthMm,
        edgeBandingMm: box.panels.topBottomWidthMm,
        qty: 2,
      });
    }

    if (box.drawerBoards) {
      const drawerBoards = box.drawerBoards;
      const sets = drawerBoards.sets;
      boards.push({ dim1: drawerBoards.sidePanel.heightMm, dim2: drawerBoards.sidePanel.depthMm, edgeBandingMm: drawerBoards.sidePanel.depthMm, qty: drawerBoards.count * 2 * sets });
      boards.push({ dim1: drawerBoards.frontPanel.heightMm, dim2: drawerBoards.frontPanel.widthMm, edgeBandingMm: 2 * (drawerBoards.frontPanel.heightMm + drawerBoards.frontPanel.widthMm), qty: drawerBoards.count * sets });
      boards.push({ dim1: drawerBoards.internalWall1.heightMm, dim2: drawerBoards.internalWall1.widthMm, edgeBandingMm: drawerBoards.internalWall1.widthMm, qty: drawerBoards.count * sets });
      boards.push({ dim1: drawerBoards.internalWall2.heightMm, dim2: drawerBoards.internalWall2.widthMm, edgeBandingMm: drawerBoards.internalWall2.widthMm, qty: drawerBoards.count * sets });
      boards.push({ dim1: drawerBoards.separator.heightMm, dim2: drawerBoards.separator.widthMm, edgeBandingMm: 0, qty: drawerBoards.separator.qty });
      boards.push({ dim1: drawerBoards.drawerRail.heightMm, dim2: drawerBoards.drawerRail.widthMm, edgeBandingMm: drawerBoards.drawerRail.widthMm, qty: 2 });
    }

    if (box.slupki && box.slupki.length > 0) {
      for (const slupek of box.slupki) {
        boards.push({
          dim1: slupek.heightMm,
          dim2: slupek.depthMm,
          edgeBandingMm: slupek.heightMm,
          qty: 1,
        });
      }
    }
  }

  return boards;
}

export function calculatePricingSummary(
  elementsData: ElementsData | null,
  hardwareSummary: HardwareSummary | null,
  boardFinish: BoardFinish,
  doorHandle: DoorHandleSelection,
): PricingSummary {
  if (!elementsData || !hardwareSummary) {
    return {
      totalCost: 0,
      roundedBaseForClient: 0,
      clientPrice: 0,
      handleUnitPrice: ALL_HANDLE_OPTIONS.get(doorHandle.optionId)?.pricePln ?? DEFAULT_HANDLE_PRICE_PLN,
    };
  }

  const selectedFinish = ALL_FINISH_OPTIONS.get(boardFinish.optionId);
  const handleUnitPrice = ALL_HANDLE_OPTIONS.get(doorHandle.optionId)?.pricePln ?? DEFAULT_HANDLE_PRICE_PLN;
  const kolorBoards = groupBoards(getKolorBoards(elementsData));
  const szaryBoards = groupBoards(getSzaryBoards(elementsData));
  const totalHinges = elementsData.boxes.reduce((sum, box) => sum + (box.door?.hinges ?? 0), 0);
  const totalRods = elementsData.boxes.reduce((sum, box) => sum + (box.rods ?? 0), 0);

  const hingesCost = totalHinges * COST_PER_HINGE_PLN;
  const guidesCost = hardwareSummary.totalGuides * COST_PER_GUIDE_SET_PLN;
  const bracketsCost = hardwareSummary.totalBrackets * COST_PER_BRACKET_SET_PLN;
  const handlesCost = hardwareSummary.totalHandles * handleUnitPrice;
  const legsCost = hardwareSummary.totalLegs * COST_PER_LEG_PLN;
  const clipsCost = hardwareSummary.totalLegs * COST_PER_LEG_CLIP_PLN;
  const rodsCost = totalRods * COST_PER_ROD_PLN;
  const szaryPieces = calcBoardPieces(szaryBoards);
  const kolorPieces = calcBoardPieces(kolorBoards);
  const szaryBoardCost = szaryPieces * COST_PER_SZARY_PIECE_PLN;
  const kolorPricePerSheet = (selectedFinish?.pricePerSheetPln ?? COST_PER_KOLOR_PIECE_PLN * 2) / 2;
  const kolorBoardCost = kolorPieces * kolorPricePerSheet;
  const cuttingLengthM = Math.round((calcCuttingLengthM(szaryBoards) + calcCuttingLengthM(kolorBoards)) * 100) / 100;
  const cuttingCost = Math.round(cuttingLengthM * COST_PER_METER_CUTTING_PLN * 100) / 100;
  const bandingLengthM = Math.round((calcEdgeBandingLengthM(szaryBoards) + calcEdgeBandingLengthM(kolorBoards)) * 100) / 100;
  const bandingCost = Math.round(bandingLengthM * COST_PER_METER_BANDING_PLN * 100) / 100;
  const rawTotalCost = hingesCost + guidesCost + bracketsCost + handlesCost + legsCost + clipsCost + rodsCost + szaryBoardCost + kolorBoardCost + cuttingCost + bandingCost;
  const totalCost = roundUpToCents(rawTotalCost);
  const roundedBaseForClient = roundUpToHundreds(totalCost);

  return {
    totalCost,
    roundedBaseForClient,
    clientPrice: roundedBaseForClient * 2,
    handleUnitPrice,
  };
}