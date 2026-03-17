import type { ElementsData } from '../../lib/report';
import { BOARD_PIECE_AREA_MM2 } from '../../lib/constants';

export interface BoardEntry {
  dim1: number;
  dim2: number;
  edgeBanding: string;
  edgeBandingMm: number;
  qty: number;
}

export function calcBoardPieces(boards: BoardEntry[]): number {
  const totalArea = boards.reduce((sum, b) => sum + b.dim1 * b.dim2 * b.qty, 0);
  return Math.ceil(totalArea / BOARD_PIECE_AREA_MM2);
}

export function calcCuttingLengthM(boards: BoardEntry[]): number {
  const totalMm = boards.reduce((sum, b) => sum + (b.dim1 + b.dim2) * b.qty, 0);
  return Math.round(totalMm) / 1000;
}

export function calcEdgeBandingLengthM(boards: BoardEntry[]): number {
  const totalMm = boards.reduce((sum, b) => sum + b.edgeBandingMm * b.qty, 0);
  return Math.round(totalMm) / 1000;
}

export function roundUpToCents(value: number): number {
  return Math.ceil(value * 100) / 100;
}

export function roundUpToHundreds(value: number): number {
  return Math.ceil(value / 100) * 100;
}

export function groupBoards(boards: BoardEntry[]): BoardEntry[] {
  const map = new Map<string, BoardEntry>();
  for (const b of boards) {
    const key = `${b.dim1}x${b.dim2}|${b.edgeBanding}`;
    const existing = map.get(key);
    if (existing) {
      existing.qty += b.qty;
    } else {
      map.set(key, { ...b });
    }
  }
  return Array.from(map.values());
}

export function getKolorBoards(elementsData: ElementsData): BoardEntry[] {
  const boards: BoardEntry[] = [];

  for (const box of elementsData.boxes) {
    if (box.door) {
      const qty = box.door.doubleDoor ? 2 : 1;
      boards.push({ dim1: box.door.heightMm, dim2: box.door.widthMm, edgeBanding: 'Wszystkie obrzeża (4 strony)', edgeBandingMm: 2 * (box.door.heightMm + box.door.widthMm), qty });
    }
  }

  const { left, right, top, bottom } = elementsData.niches;
  if (left.widthMm > 0 && left.heightMm > 0) {
    boards.push({ dim1: left.widthMm, dim2: left.heightMm, edgeBanding: 'Bez obrzeży', edgeBandingMm: 0, qty: 1 });
  }
  if (right.widthMm > 0 && right.heightMm > 0) {
    boards.push({ dim1: right.widthMm, dim2: right.heightMm, edgeBanding: 'Bez obrzeży', edgeBandingMm: 0, qty: 1 });
  }
  if (top.widthMm > 0 && top.heightMm > 0) {
    boards.push({ dim1: top.widthMm, dim2: top.heightMm, edgeBanding: 'Bez obrzeży', edgeBandingMm: 0, qty: 1 });
  }
  if (bottom.widthMm > 0 && bottom.heightMm > 0) {
    boards.push({ dim1: bottom.widthMm, dim2: bottom.heightMm, edgeBanding: 'Bez obrzeży', edgeBandingMm: 0, qty: 1 });
  }

  if (elementsData.maskings) {
    if (elementsData.maskings.left) {
      const { heightMm, widthMm } = elementsData.maskings.left;
      boards.push({ dim1: heightMm, dim2: widthMm, edgeBanding: `Obrzeże na wysokości ${heightMm} mm (1 bok)`, edgeBandingMm: heightMm, qty: 1 });
    }
    if (elementsData.maskings.right) {
      const { heightMm, widthMm } = elementsData.maskings.right;
      boards.push({ dim1: heightMm, dim2: widthMm, edgeBanding: `Obrzeże na wysokości ${heightMm} mm (1 bok)`, edgeBandingMm: heightMm, qty: 1 });
    }
  }

  return boards;
}

export function getSzaryBoards(elementsData: ElementsData): BoardEntry[] {
  const boards: BoardEntry[] = [];

  for (const box of elementsData.boxes) {
    if (box.shelves) {
      for (const g of box.shelves.groups) {
        boards.push({
          dim1: g.widthMm,
          dim2: box.shelves.depthMm,
          edgeBanding: `Obrzeże na szerokości ${g.widthMm} mm (1 bok)`,
          edgeBandingMm: g.widthMm,
          qty: g.qty,
        });
      }
    }

    if (box.panels) {
      boards.push({
        dim1: box.panels.sideHeightMm,
        dim2: box.panels.depthMm,
        edgeBanding: `Obrzeże na wysokości ${box.panels.sideHeightMm} mm (1 bok)`,
        edgeBandingMm: box.panels.sideHeightMm,
        qty: 2,
      });
      // top and bottom have the same dimensions — push 2 together
      boards.push({
        dim1: box.panels.topBottomWidthMm,
        dim2: box.panels.depthMm,
        edgeBanding: `Obrzeże na szerokości ${box.panels.topBottomWidthMm} mm (1 bok)`,
        edgeBandingMm: box.panels.topBottomWidthMm,
        qty: 2,
      });
    }

    if (box.drawerBoards) {
      const d = box.drawerBoards;
      const s = d.sets;
      boards.push({ dim1: d.sidePanel.heightMm, dim2: d.sidePanel.depthMm, edgeBanding: `Obrzeże na długości ${d.sidePanel.depthMm} mm (1 bok)`, edgeBandingMm: d.sidePanel.depthMm, qty: d.count * 2 * s });
      boards.push({ dim1: d.frontPanel.heightMm, dim2: d.frontPanel.widthMm, edgeBanding: 'Wszystkie obrzeża (4 strony)', edgeBandingMm: 2 * (d.frontPanel.heightMm + d.frontPanel.widthMm), qty: d.count * s });
      boards.push({ dim1: d.internalWall1.heightMm, dim2: d.internalWall1.widthMm, edgeBanding: `Obrzeże na długości ${d.internalWall1.widthMm} mm (1 bok)`, edgeBandingMm: d.internalWall1.widthMm, qty: d.count * s });
      boards.push({ dim1: d.internalWall2.heightMm, dim2: d.internalWall2.widthMm, edgeBanding: `Obrzeże na długości ${d.internalWall2.widthMm} mm (1 bok)`, edgeBandingMm: d.internalWall2.widthMm, qty: d.count * s });
      boards.push({ dim1: d.separator.heightMm, dim2: d.separator.widthMm, edgeBanding: 'Bez obrzeży', edgeBandingMm: 0, qty: d.separator.qty });
      boards.push({ dim1: d.drawerRail.heightMm, dim2: d.drawerRail.widthMm, edgeBanding: `Jedno obrzeże na długości ${d.drawerRail.widthMm} mm`, edgeBandingMm: d.drawerRail.widthMm, qty: 2 });
    }

    if (box.partitions && box.partitions.length > 0) {
      for (const s of box.partitions) {
        boards.push({
          dim1: s.heightMm,
          dim2: s.depthMm,
          edgeBanding: `Obrzeże na wysokości ${s.heightMm} mm (1 bok)`,
          edgeBandingMm: s.heightMm,
          qty: 1,
        });
      }
    }
  }

  return boards;
}
