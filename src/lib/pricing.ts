import type { ElementsData, HardwareSummary } from './report';
import type { BoardFinish, DoorHandleSelection } from './types';
import { ALL_FINISH_OPTIONS } from './finishOptions';
import { ALL_HANDLE_OPTIONS } from './handleOptions';
import {
  COST_PER_HINGE_PLN,
  COST_PER_GUIDE_SET_PLN,
  COST_PER_BRACKET_SET_PLN,
  DEFAULT_HANDLE_PRICE_PLN,
  COST_PER_LEG_PLN,
  COST_PER_LEG_CLIP_PLN,
  COST_PER_ROD_PLN,
  BOARD_PIECE_AREA_MM2,
  COST_PER_SZARY_SQM_PLN,
  COST_PER_KOLOR_SQM_PLN,
  COST_PER_METER_CUTTING_PLN,
  COST_PER_METER_BANDING_PLN,
} from './constants';

interface BoardEntry {
  dim1: number;
  dim2: number;
  edgeBandingMm: number;
  qty: number;
}

export interface PricingSummary {
  totalCost: number;
  roundedBaseForClient: number;
  materialsDeposit: number;
  clientPrice: number;
  discountPercent: number;
  discountPercentAmount: number;
  discountFixedAmount: number;
  discountAmount: number;
  clientPriceAfterDiscount: number;
  handleUnitPrice: number;
}

export interface DiscountResult {
  discountAmount: number;
  discountedAmount: number;
}

function clampDiscountPln(discountPln: number): number {
  if (!Number.isFinite(discountPln)) return 0;
  return Math.max(0, discountPln);
}

function clampDiscountPercent(discountPercent: number): number {
  if (!Number.isFinite(discountPercent)) return 0;
  return Math.min(100, Math.max(0, discountPercent));
}

export function applyFixedDiscountToPln(amountPln: number, discountPln: number): DiscountResult {
  const safeDiscountPln = clampDiscountPln(discountPln);
  const appliedDiscount = Math.min(amountPln, safeDiscountPln);
  return {
    discountAmount: appliedDiscount,
    discountedAmount: amountPln - appliedDiscount,
  };
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
  for (const niche of [left, right, top, bottom]) {
    const { widthMm, heightMm } = niche;
    if (widthMm <= 0 || heightMm <= 0) continue;
    if (widthMm > 2800) {
      boards.push({ dim1: Math.ceil(widthMm / 2), dim2: heightMm, edgeBandingMm: 0, qty: 2 });
    } else if (heightMm > 2800) {
      boards.push({ dim1: widthMm, dim2: Math.ceil(heightMm / 2), edgeBandingMm: 0, qty: 2 });
    } else {
      boards.push({ dim1: widthMm, dim2: heightMm, edgeBandingMm: 0, qty: 1 });
    }
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
      for (const panel of box.panels) {
        boards.push({
          dim1: panel.sideHeightMm,
          dim2: panel.depthMm,
          edgeBandingMm: panel.sideHeightMm,
          qty: 2,
        });
        boards.push({
          dim1: panel.topBottomWidthMm,
          dim2: panel.depthMm,
          edgeBandingMm: panel.topBottomWidthMm,
          qty: 2,
        });
      }
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

    if (box.partitions && box.partitions.length > 0) {
      for (const partition of box.partitions) {
        boards.push({
          dim1: partition.heightMm,
          dim2: partition.depthMm,
          edgeBandingMm: partition.heightMm,
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
  discountPln = 0,
  discountPercent = 0,
): PricingSummary {
  if (!elementsData || !hardwareSummary) {
    const safePercent = clampDiscountPercent(discountPercent);
    const discount = applyFixedDiscountToPln(0, discountPln);
    return {
      totalCost: 0,
      roundedBaseForClient: 0,
      materialsDeposit: 0,
      clientPrice: 0,
      discountPercent: safePercent,
      discountPercentAmount: 0,
      discountFixedAmount: discount.discountAmount,
      discountAmount: discount.discountAmount,
      clientPriceAfterDiscount: discount.discountedAmount,
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
  const szaryAreaSqm = szaryBoards.reduce((sum, b) => sum + b.dim1 * b.dim2 * b.qty, 0) / 1_000_000;
  const szaryBoardCost = Math.round(szaryAreaSqm * COST_PER_SZARY_SQM_PLN * 100) / 100;
  const kolorAreaSqm = kolorBoards.reduce((sum, b) => sum + b.dim1 * b.dim2 * b.qty, 0) / 1_000_000;
  const kolorPricePerSqm = selectedFinish?.pricePerSqmPln ?? COST_PER_KOLOR_SQM_PLN;
  const kolorBoardCost = Math.round(kolorAreaSqm * kolorPricePerSqm * 100) / 100;
  const cuttingLengthM = Math.round((calcCuttingLengthM(szaryBoards) + calcCuttingLengthM(kolorBoards)) * 100) / 100;
  const cuttingCost = Math.round(cuttingLengthM * COST_PER_METER_CUTTING_PLN * 100) / 100;
  const bandingLengthM = Math.round((calcEdgeBandingLengthM(szaryBoards) + calcEdgeBandingLengthM(kolorBoards)) * 100) / 100;
  const bandingCost = Math.round(bandingLengthM * COST_PER_METER_BANDING_PLN * 100) / 100;
  const rawTotalCost = hingesCost + guidesCost + bracketsCost + handlesCost + legsCost + clipsCost + rodsCost + szaryBoardCost + kolorBoardCost + cuttingCost + bandingCost;
  const totalCost = roundUpToCents(rawTotalCost);
  const roundedBaseForClient = roundUpToHundreds(totalCost);
  const materialsDeposit = roundedBaseForClient;
  const clientPrice = roundedBaseForClient * 2;
  const safePercent = clampDiscountPercent(discountPercent);
  const serviceAmount = Math.max(0, clientPrice - materialsDeposit);
  const discountPercentAmount = Math.min(serviceAmount, Math.round((serviceAmount * safePercent) / 100));
  const afterPercentDiscount = clientPrice - discountPercentAmount;
  const fixedDiscount = applyFixedDiscountToPln(afterPercentDiscount, discountPln);
  const discountFixedAmount = fixedDiscount.discountAmount;
  const clientPriceAfterDiscount = fixedDiscount.discountedAmount;
  const discountAmount = discountPercentAmount + discountFixedAmount;

  return {
    totalCost,
    roundedBaseForClient,
    materialsDeposit,
    clientPrice,
    discountPercent: safePercent,
    discountPercentAmount,
    discountFixedAmount,
    discountAmount,
    clientPriceAfterDiscount,
    handleUnitPrice,
  };
}