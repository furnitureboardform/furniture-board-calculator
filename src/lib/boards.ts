import * as specs from './specifications';
import { calculateDimensions, calculateNicheDimensions } from './calculations';
import type { Parameters, WoodenBoard, HDFBoard, NicheBoard, BoardsSummary } from './types';

export function getWoodenBoards(parameters: Parameters): WoodenBoard[] {
  const dims = calculateDimensions(parameters);
  return [
    {
      nr: 1,
      name: 'Boki szuflady (lewy + prawy)',
      dimensions: `${specs.drawerSideHeightMm} × ${dims.sideDepth}`,
      dimensionsTuple: [specs.drawerSideHeightMm, dims.sideDepth],
      qtyPerDrawer: 2,
      material: 'Płyta meblowa',
      edgeBanding: `Jedno obrzeże na długości ${dims.sideDepth} mm`,
    },
    {
      nr: 2,
      name: 'Front szuflady',
      dimensions: `${specs.drawerFrontHeightMm} × ${dims.frontWidth}`,
      dimensionsTuple: [specs.drawerFrontHeightMm, dims.frontWidth],
      qtyPerDrawer: 1,
      material: 'Płyta meblowa',
      edgeBanding: 'Wszystkie obrzeża',
    },
    {
      nr: 3,
      name: 'Ściana wewnętrzna 1',
      dimensions: `${specs.internalWallHeight1Mm} × ${dims.internalWallsWidth}`,
      dimensionsTuple: [specs.internalWallHeight1Mm, dims.internalWallsWidth],
      qtyPerDrawer: 1,
      material: 'Płyta meblowa',
      edgeBanding: `Jedno obrzeże na długości ${dims.internalWallsWidth} mm`,
    },
    {
      nr: 4,
      name: 'Ściana wewnętrzna 2',
      dimensions: `${specs.internalWallHeight2Mm} × ${dims.internalWallsWidth}`,
      dimensionsTuple: [specs.internalWallHeight2Mm, dims.internalWallsWidth],
      qtyPerDrawer: 1,
      material: 'Płyta meblowa',
      edgeBanding: `Jedno obrzeże na długości ${dims.internalWallsWidth} mm`,
    },
  ];
}

export function getHDFBottom(parameters: Parameters): HDFBoard {
  const dims = calculateDimensions(parameters);
  return {
    nr: 5,
    name: 'Dno szuflady',
    dimensions: `${dims.bottomDepth} × ${dims.bottomWidth}`,
    dimensionsTuple: [dims.bottomDepth, dims.bottomWidth],
    qtyPerDrawer: 1,
    material: 'Płyta HDF',
  };
}

export function getBoardsData(
  parameters: Parameters
): (WoodenBoard | HDFBoard)[] {
  return [...getWoodenBoards(parameters), getHDFBottom(parameters)];
}

export function getBoardsSummary(
  boards: (WoodenBoard | HDFBoard)[]
): BoardsSummary {
  const summary: BoardsSummary = {};
  for (const board of boards) {
    const dimensionsKey = board.dimensions;
    if (!(dimensionsKey in summary)) {
      summary[dimensionsKey] = { name: board.name, material: board.material, qtyPerDrawer: 0 };
    }
    summary[dimensionsKey].qtyPerDrawer += board.qtyPerDrawer;
  }
  return summary;
}

function getNicheShelfBoard(parameters: Parameters): NicheBoard {
  const nicheDims = calculateNicheDimensions(parameters);
  return {
    nr: 101,
    name: 'Półka wnęki',
    dimensions: `${nicheDims.shelfHeight} × ${nicheDims.shelfWidth}`,
    dimensionsTuple: [nicheDims.shelfHeight, nicheDims.shelfWidth],
    qty: 1,
    material: 'Płyta meblowa',
    color: 'Kolor A (inny niż standard)',
    edgeBanding: 'Wszystkie obrzeża (4 strony)',
  };
}

function getNicheBlendBoard(parameters: Parameters): NicheBoard {
  const nicheDims = calculateNicheDimensions(parameters);
  return {
    nr: 102,
    name: 'Blenda wnęki',
    dimensions: `${nicheDims.blendHeight} × ${nicheDims.blendWidth}`,
    dimensionsTuple: [nicheDims.blendHeight, nicheDims.blendWidth],
    qty: 1,
    material: 'Płyta meblowa',
    color: 'Kolor A (ten sam co półka)',
    edgeBanding: 'Obrzeża na krótszych bokach (2) + jeden długszy bok',
  };
}

function getNicheSidePanel(
  parameters: Parameters,
  side: 'left' | 'right'
): NicheBoard {
  const nicheDims = calculateNicheDimensions(parameters);
  const isFullyCovered =
    side === 'left' ? parameters.isLeftSideFullyCovered : parameters.isRightSideFullyCovered;
  const width = isFullyCovered ? nicheDims.sidePanelFullWidth : nicheDims.sidePanelPartialWidth;
  const name = side === 'left' ? 'Bok lewy wnęki' : 'Bok prawy wnęki';
  return {
    nr: side === 'left' ? 103 : 104,
    name,
    dimensions: `${nicheDims.sidePanelHeight} × ${width}`,
    dimensionsTuple: [nicheDims.sidePanelHeight, width],
    qty: 1,
    material: 'Płyta meblowa',
    edgeBanding: 'Jedno obrzeże na dłuższym boku',
  };
}

export function getNicheBoards(parameters: Parameters): NicheBoard[] {
  return [
    getNicheShelfBoard(parameters),
    getNicheBlendBoard(parameters),
    getNicheSidePanel(parameters, 'left'),
    getNicheSidePanel(parameters, 'right'),
  ];
}
