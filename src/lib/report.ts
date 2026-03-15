import type {
  Parameters,
  Hardware,
  WoodenBoard,
  HDFBoard,
  NicheBoard,
  BoardsSummary,
  DoorRequirements,
  ShelvesRequirements,
} from './types';

export interface BoxElement {
  boxNumber: number;
  door?: { doubleDoor: boolean; heightMm: number; widthMm: number; hinges: number };
  shelves?: { quantity: number; widthMm: number; depthMm: number };
  rods?: number;
  hdf?: { widthMm: number; heightMm: number };
  panels?: { sideHeightMm: number; topBottomWidthMm: number; depthMm: number };
}

export interface NichesElement {
  hasNiches: boolean;
  left: { widthMm: number; heightMm: number };
  right: { widthMm: number; heightMm: number };
  top: { widthMm: number; heightMm: number };
  bottom: { widthMm: number; heightMm: number };
}

export interface MaskingItem {
  heightMm: number;
  widthMm: number;
}

export interface MaskingsElement {
  left?: MaskingItem;
  right?: MaskingItem;
}

export interface ElementsData {
  boxes: BoxElement[];
  niches: NichesElement;
  maskings: MaskingsElement | null;
}

export interface HardwareSummary {
  totalGuides: number;
  totalBrackets: number;
  totalHandles: number;
}

export interface ParameterRow {
  label: string;
  value: string;
}

export interface ParameterGroup {
  title: string;
  rows: ParameterRow[];
}

export interface ParametersData {
  groups: ParameterGroup[];
}

export interface ReportResult {
  parametersData: ParametersData;
  mainText: string;
  summaryText: string;
  elementsData: ElementsData;
  hardwareSummary: HardwareSummary;
}

/**
 * Builds the full report from parameters and calculated data.
 */
export function buildReport(
  parameters: Parameters,
  hardware: Hardware,
  woodenBoards: WoodenBoard[],
  hdfBottom: HDFBoard,
  _boardsSummary: BoardsSummary,
  nicheBoards: NicheBoard[],
  doorRequirements: DoorRequirements,
  shelvesRequirements: ShelvesRequirements
): ReportResult {
  const lines: string[] = [];
  const summaryLines: string[] = [];
  const parametersLines: string[] = [];

  const effectiveWidthMm =
    parameters.nicheWidthMm -
    (parameters.leftBlendMm || 0) -
    (parameters.rightBlendMm || 0);
  const effectiveHeightMm =
    parameters.nicheHeightMm -
    (parameters.topBlendMm || 0) -
    (parameters.bottomBlendMm || 0);
  const perBoxDeductionMm = 36;
  const availableInteriorWidthForBoxesMm =
    effectiveWidthMm - parameters.numberOfBoxes * perBoxDeductionMm;

  parametersLines.push('');
  parametersLines.push('📋 PARAMETRY WEJŚCIOWE:');
  parametersLines.push(`   ├─ Liczba szuflad: ${parameters.numberOfDrawers}`);
  parametersLines.push(`   ├─ Szerokość wnęki na szuflady: ${parameters.boxWidthMm} mm`);
  parametersLines.push(`   ├─ Głębokość szafki: ${parameters.cabinetDepthMm} mm`);
  parametersLines.push(`   ├─ Szerokość wnęki: ${parameters.nicheWidthMm} mm`);
  parametersLines.push(`   ├─ Wysokość wnęki: ${parameters.nicheHeightMm} mm`);
  parametersLines.push(
    `   ├─ Blendy L/P/G/D: ${parameters.leftBlendMm || 0} / ${parameters.rightBlendMm || 0} / ${parameters.topBlendMm || 0} / ${parameters.bottomBlendMm || 0} mm`
  );
  parametersLines.push(`   ├─ Szerokość szafy po blendach: ${effectiveWidthMm} mm`);
  parametersLines.push(`   ├─ Wysokość szafy po blendach: ${effectiveHeightMm} mm`);
  parametersLines.push(
    `   ├─ Odjęcie na boxy (po ${perBoxDeductionMm} mm): ${parameters.numberOfBoxes * perBoxDeductionMm} mm`
  );
  parametersLines.push(`   ├─ Dostępna szerokość wnętrz boxów: ${availableInteriorWidthForBoxesMm} mm`);
  const doubleDoorCount = (parameters.boxDoubleDoors ?? []).filter(Boolean).length;
  parametersLines.push(`   ├─ Boxy z podwójnymi drzwiami: ${doubleDoorCount}`);
  parametersLines.push(`   └─ Boxy z pojedynczymi drzwiami: ${parameters.numberOfBoxes - doubleDoorCount}`);

  const parametersData: ParametersData = {
    groups: [
      {
        title: 'Wymiary wnęki',
        rows: [
          { label: 'Szerokość wnęki', value: `${parameters.nicheWidthMm} mm` },
          { label: 'Wysokość wnęki', value: `${parameters.nicheHeightMm} mm` },
          { label: 'Głębokość wnęki', value: `${parameters.cabinetDepthMm} mm` },
        ],
      },
      {
        title: 'Blendy',
        rows: [
          { label: 'Lewa', value: `${parameters.leftBlendMm || 0} mm` },
          { label: 'Prawa', value: `${parameters.rightBlendMm || 0} mm` },
          { label: 'Górna', value: `${parameters.topBlendMm || 0} mm` },
          { label: 'Dolna', value: `${parameters.bottomBlendMm || 0} mm` },
        ],
      },
      {
        title: 'Wymiary szafy (po blendach)',
        rows: [
          { label: 'Szerokość efektywna', value: `${effectiveWidthMm} mm` },
          { label: 'Wysokość efektywna', value: `${effectiveHeightMm} mm` },
        ],
      },
      {
        title: 'Szuflady i boxy',
        rows: [
          { label: 'Liczba szuflad', value: `${parameters.numberOfDrawers}` },
          { label: 'Liczba boxów', value: `${parameters.numberOfBoxes}` },
          { label: 'Szerokość wnęki na szuflady', value: `${parameters.boxWidthMm} mm` },
          { label: 'Dostępna szerokość wnętrz boxów', value: `${availableInteriorWidthForBoxesMm} mm` },
          { label: 'Boxy z podwójnymi drzwiami', value: `${doubleDoorCount}` },
          { label: 'Boxy z pojedynczymi drzwiami', value: `${parameters.numberOfBoxes - doubleDoorCount}` },
        ],
      },
    ],
  };

  lines.push('📦 PŁYTY MEBLOWE KORPUS SZARY');
  lines.push('─'.repeat(80));
  for (const board of woodenBoards) {
    const totalQty = board.qtyPerDrawer * parameters.numberOfDrawers;
    lines.push(`   • ${board.dimensions} mm (${totalQty} szt.) - ${board.edgeBanding}`);
  }
  lines.push('');
  lines.push('═'.repeat(80));
  lines.push('');

  const panelDepthMm = parameters.cabinetDepthMm - 18 - 2 - 3;
  const sideHeightMm = effectiveHeightMm;
  const boxWidthsForPanels =
    parameters.boxWidths && parameters.boxWidths.length > 0
      ? parameters.boxWidths.slice(0, parameters.numberOfBoxes)
      : Array(parameters.numberOfBoxes).fill(parameters.boxWidthMm) as number[];

  const _hdfQty = hdfBottom.qtyPerDrawer * parameters.numberOfDrawers;

  lines.push('📦 PŁYTY MEBLOWE OBICIE KOLOR');
  lines.push('═'.repeat(80));
  lines.push('');

  for (let boxNum = 1; boxNum <= parameters.numberOfBoxes; boxNum++) {
    const door = doorRequirements.doors.find((d) => d.boxNumber === boxNum);
    const shelf = shelvesRequirements.shelvesByBox.find((s) => s.boxNumber === boxNum);

    lines.push(`  ── Box ${boxNum} ──`);
    lines.push('  ' + '─'.repeat(78));

    if (door) {
      const doorLabel = door.doubleDoor ? 'podwójne' : 'pojedyncze';
      const doorCount = door.doubleDoor ? '2 szt.' : '1 szt.';
      const hinglesPerPanel = Math.max(2, Math.ceil(door.heightMm / 520));
      const hinges = door.doubleDoor ? hinglesPerPanel * 2 : hinglesPerPanel;
      lines.push(`   • Drzwi ${doorLabel} (${doorCount}): ${door.heightMm} × ${door.widthMm} mm - Wszystkie obrzeża (4 strony), zawiasy: ${hinges} szt.`);
    }

    if (shelf && shelf.quantity > 0) {
      lines.push(`   • Półki: ${shelf.quantity} szt. (${shelf.widthMm} × ${shelf.depthMm} mm) - Obrzeże na szerokości ${shelf.widthMm} mm (1 bok)`);
    }

    lines.push('');
  }

  const leftBlend = parameters.leftBlendMm || 0;
  const rightBlend = parameters.rightBlendMm || 0;
  const topBlend = parameters.topBlendMm || 0;

  lines.push('  ── Blendy / Wnęki ──');
  lines.push('  ' + '─'.repeat(78));
  lines.push(`   • Czy są wnęki: ${parameters.hasNiches ? 'Tak' : 'Nie'}`);
  lines.push(`   • Lewa: szer. ${leftBlend > 0 ? leftBlend + 50 : 0} mm, wys. ${parameters.leftNicheHeightMm || 0} mm - Bez obrzeży`);
  lines.push(`   • Prawa: szer. ${rightBlend > 0 ? rightBlend + 50 : 0} mm, wys. ${parameters.rightNicheHeightMm || 0} mm - Bez obrzeży`);
  lines.push(`   • Górna: szer. ${parameters.topNicheWidthMm || 0} mm, wys. ${topBlend > 0 ? topBlend + 50 : 0} mm - Bez obrzeży`);
  lines.push(`   • Dolna: szer. ${parameters.bottomNicheWidthMm || 0} mm, wys. ${parameters.bottomBlendMm || 0} mm - Bez obrzeży`);
  lines.push('');

  if (parameters.outerMaskingLeft || parameters.outerMaskingRight) {
    const maskingHeightMm = Math.max(0, parameters.nicheHeightMm - 2);
    lines.push('  ── Maskownice ──');
    lines.push('  ' + '─'.repeat(78));
    if (parameters.outerMaskingLeft) {
      const widthMm = parameters.outerMaskingLeftFullCover ? parameters.cabinetDepthMm : 100;
      lines.push(`   • Maskownica lewa: ${maskingHeightMm} × ${widthMm} mm (1 szt.) - Obrzeże na wysokości ${maskingHeightMm} mm (1 bok)`);
    }
    if (parameters.outerMaskingRight) {
      const widthMm = parameters.outerMaskingRightFullCover ? parameters.cabinetDepthMm : 100;
      lines.push(`   • Maskownica prawa: ${maskingHeightMm} × ${widthMm} mm (1 szt.) - Obrzeże na wysokości ${maskingHeightMm} mm (1 bok)`);
    }
    lines.push('');
  }

  const leftBlendFinal = parameters.leftBlendMm || 0;
  const rightBlendFinal = parameters.rightBlendMm || 0;
  const topBlendFinal = parameters.topBlendMm || 0;
  const maskingHeightFinal = Math.max(0, parameters.nicheHeightMm - 2);

  const elementsData: ElementsData = {
    boxes: Array.from({ length: parameters.numberOfBoxes }, (_, i) => {
      const boxNum = i + 1;
      const door = doorRequirements.doors.find((d) => d.boxNumber === boxNum);
      const shelf = shelvesRequirements.shelvesByBox.find((s) => s.boxNumber === boxNum);
      return {
        boxNumber: boxNum,
        door: door
          ? {
              doubleDoor: door.doubleDoor,
              heightMm: door.heightMm,
              widthMm: door.widthMm,
              hinges: (() => {
                const perPanel = Math.max(2, Math.ceil(door.heightMm / 520));
                return door.doubleDoor ? perPanel * 2 : perPanel;
              })(),
            }
          : undefined,
        shelves:
          shelf && shelf.quantity > 0
            ? { quantity: shelf.quantity, widthMm: shelf.widthMm, depthMm: shelf.depthMm }
            : undefined,
        rods: (parameters.boxRods?.[i] ?? 0) > 0 ? (parameters.boxRods![i]) : undefined,
        hdf: {
          widthMm: (boxWidthsForPanels[i] ?? parameters.boxWidthMm) + 32,
          heightMm: doorRequirements.doorHeightMm,
        },
        panels: {
          sideHeightMm,
          topBottomWidthMm: boxWidthsForPanels[i] ?? parameters.boxWidthMm,
          depthMm: panelDepthMm,
        },
      };
    }),
    niches: {
      hasNiches: parameters.hasNiches,
      left: { widthMm: leftBlendFinal > 0 ? leftBlendFinal + 50 : 0, heightMm: parameters.leftNicheHeightMm || 0 },
      right: { widthMm: rightBlendFinal > 0 ? rightBlendFinal + 50 : 0, heightMm: parameters.rightNicheHeightMm || 0 },
      top: { widthMm: parameters.topNicheWidthMm || 0, heightMm: topBlendFinal > 0 ? topBlendFinal + 50 : 0 },
      bottom: { widthMm: parameters.bottomNicheWidthMm || 0, heightMm: parameters.bottomBlendMm || 0 },
    },
    maskings:
      parameters.outerMaskingLeft || parameters.outerMaskingRight
        ? {
            left: parameters.outerMaskingLeft
              ? { heightMm: maskingHeightFinal, widthMm: parameters.outerMaskingLeftFullCover ? parameters.cabinetDepthMm : 100 }
              : undefined,
            right: parameters.outerMaskingRight
              ? { heightMm: maskingHeightFinal, widthMm: parameters.outerMaskingRightFullCover ? parameters.cabinetDepthMm : 100 }
              : undefined,
          }
        : null,
  };

  return {
    parametersData,
    mainText: lines.join('\n'),
    summaryText: summaryLines.join('\n'),
    elementsData,
    hardwareSummary: {
      totalGuides: hardware.totalGuides,
      totalBrackets: hardware.totalBrackets,
      totalHandles: hardware.totalHandles,
    },
  };
}
