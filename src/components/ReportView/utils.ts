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

const MAX_BOARD_DIM_MM = 2800;

function pushNicheBoard(boards: BoardEntry[], widthMm: number, heightMm: number): void {
  if (widthMm <= 0 || heightMm <= 0) return;
  if (widthMm > MAX_BOARD_DIM_MM) {
    boards.push({ dim1: Math.ceil(widthMm / 2), dim2: heightMm, edgeBanding: 'Bez obrzeży', edgeBandingMm: 0, qty: 2 });
  } else if (heightMm > MAX_BOARD_DIM_MM) {
    boards.push({ dim1: widthMm, dim2: Math.ceil(heightMm / 2), edgeBanding: 'Bez obrzeży', edgeBandingMm: 0, qty: 2 });
  } else {
    boards.push({ dim1: widthMm, dim2: heightMm, edgeBanding: 'Bez obrzeży', edgeBandingMm: 0, qty: 1 });
  }
}

export function getCoverBoards(elementsData: ElementsData): BoardEntry[] {
  const boards: BoardEntry[] = [];

  for (const box of elementsData.boxes) {
    if (box.door) {
      const qty = box.door.doubleDoor ? 2 : 1;
      boards.push({ dim1: box.door.heightMm, dim2: box.door.widthMm, edgeBanding: 'Wszystkie obrzeża (4 strony)', edgeBandingMm: 2 * (box.door.heightMm + box.door.widthMm), qty });
    }
  }

  const { left, right, top, bottom } = elementsData.niches;
  pushNicheBoard(boards, left.widthMm, left.heightMm);
  pushNicheBoard(boards, right.widthMm, right.heightMm);
  pushNicheBoard(boards, top.widthMm, top.heightMm);
  pushNicheBoard(boards, bottom.widthMm, bottom.heightMm);

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

export function getCarcassBoards(elementsData: ElementsData): BoardEntry[] {
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
      for (const panel of box.panels) {
        boards.push({
          dim1: panel.sideHeightMm,
          dim2: panel.depthMm,
          edgeBanding: `Obrzeże na wysokości ${panel.sideHeightMm} mm (1 bok)`,
          edgeBandingMm: panel.sideHeightMm,
          qty: 2,
        });
        boards.push({
          dim1: panel.topBottomWidthMm,
          dim2: panel.depthMm,
          edgeBanding: `Obrzeże na szerokości ${panel.topBottomWidthMm} mm (1 bok)`,
          edgeBandingMm: panel.topBottomWidthMm,
          qty: 2,
        });
      }
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
