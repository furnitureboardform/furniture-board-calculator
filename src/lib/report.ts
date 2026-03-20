import * as specs from './specifications';
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
  shelves?: { depthMm: number; groups: { widthMm: number; qty: number }[] };
  rods?: number;
  hdf?: { label: string; widthMm: number; heightMm: number }[];
  panels?: {
    label: string;
    sideHeightMm: number;
    topBottomWidthMm: number;
    depthMm: number;
    isNadstawka: boolean;
  }[];
  partitions?: { heightMm: number; depthMm: number }[];
  drawerBoards?: {
    count: number;
    sidePanel: { heightMm: number; depthMm: number };
    frontPanel: { heightMm: number; widthMm: number };
    internalWall1: { heightMm: number; widthMm: number };
    internalWall2: { heightMm: number; widthMm: number };
    hdfBottom: { depthMm: number; widthMm: number };
    sets: number;
    separator: { heightMm: number; widthMm: number; qty: number };
    drawerRail: { heightMm: number; widthMm: number };
  };
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

export interface BlindReinforcement {
  side: 'left' | 'right' | 'top';
  heightMm: number;
  widthMm: number;
}

export interface ElementsData {
  boxes: BoxElement[];
  niches: NichesElement;
  maskings: MaskingsElement | null;
  blindReinforcements: BlindReinforcement[];
}

export interface HardwareSummary {
  totalGuides: number;
  totalBrackets: number;
  totalHandles: number;
  totalLegs: number;
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

const PANEL_THICKNESS_MM = 18;

function normalizeNadstawkaHeights(totalHeightMm: number, nadstawkaHeights: number[]): number[] {
  return Array.from(
    new Set(
      nadstawkaHeights
        .map((height) => Math.round(height))
        .filter((height) => height > PANEL_THICKNESS_MM && height < totalHeightMm)
    )
  ).sort((left, right) => left - right);
}

function getBoxPanelSections(
  totalHeightMm: number,
  topBottomWidthMm: number,
  depthMm: number,
  nadstawkaHeights: number[]
): NonNullable<BoxElement['panels']> {
  const normalizedHeights = normalizeNadstawkaHeights(totalHeightMm, nadstawkaHeights);

  if (normalizedHeights.length === 0) {
    return [
      {
        label: 'Box główny',
        sideHeightMm: totalHeightMm,
        topBottomWidthMm,
        depthMm,
        isNadstawka: false,
      },
    ];
  }

  const sections: NonNullable<BoxElement['panels']> = [];
  const mainBoxHeightMm = normalizedHeights[0] - PANEL_THICKNESS_MM;

  if (mainBoxHeightMm > 0) {
    sections.push({
      label: 'Box główny',
      sideHeightMm: mainBoxHeightMm,
      topBottomWidthMm,
      depthMm,
      isNadstawka: false,
    });
  }

  for (let index = 1; index < normalizedHeights.length; index += 1) {
    const sectionHeightMm = normalizedHeights[index] - normalizedHeights[index - 1];
    if (sectionHeightMm <= 0) {
      continue;
    }
    sections.push({
      label: `Nadstawka ${index}`,
      sideHeightMm: sectionHeightMm,
      topBottomWidthMm,
      depthMm,
      isNadstawka: true,
    });
  }

  const topSectionHeightMm = totalHeightMm - normalizedHeights[normalizedHeights.length - 1] + PANEL_THICKNESS_MM;
  if (topSectionHeightMm > 0) {
    sections.push({
      label: `Nadstawka ${normalizedHeights.length}`,
      sideHeightMm: topSectionHeightMm,
      topBottomWidthMm,
      depthMm,
      isNadstawka: true,
    });
  }

  return sections;
}

function getBoxHdfSections(
  totalHeightMm: number,
  widthMm: number,
  nadstawkaHeights: number[]
): NonNullable<BoxElement['hdf']> {
  const normalizedHeights = normalizeNadstawkaHeights(totalHeightMm, nadstawkaHeights);

  if (normalizedHeights.length === 0) {
    return [{
      label: 'Box główny',
      widthMm,
      heightMm: Math.max(0, totalHeightMm - 4),
    }];
  }

  const sections: NonNullable<BoxElement['hdf']> = [];
  const mainBoxHeightMm = normalizedHeights[0] - 4;

  if (mainBoxHeightMm > 0) {
    sections.push({
      label: 'Box główny',
      widthMm,
      heightMm: mainBoxHeightMm,
    });
  }

  for (let index = 1; index < normalizedHeights.length; index += 1) {
    const sectionHeightMm = normalizedHeights[index] - normalizedHeights[index - 1] - 4;
    if (sectionHeightMm <= 0) {
      continue;
    }
    sections.push({
      label: `Nadstawka ${index}`,
      widthMm,
      heightMm: sectionHeightMm,
    });
  }

  const topSectionHeightMm = totalHeightMm - normalizedHeights[normalizedHeights.length - 1] - 4;
  if (topSectionHeightMm > 0) {
    sections.push({
      label: `Nadstawka ${normalizedHeights.length}`,
      widthMm,
      heightMm: topSectionHeightMm,
    });
  }

  return sections;
}

/**
 * Builds the full report from parameters and calculated data.
 */
export function buildReport(
  parameters: Parameters,
  hardware: Hardware,
  woodenBoards: WoodenBoard[],
  _hdfBottom: HDFBoard,
  _boardsSummary: BoardsSummary,
  _nicheBoards: NicheBoard[],
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

  lines.push('📦 PŁYTY MEBLOWE KORPUS');
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

  lines.push('📦 PŁYTY MEBLOWE OBICIE');
  lines.push('═'.repeat(80));
  lines.push('');

  for (let boxNum = 1; boxNum <= parameters.numberOfBoxes; boxNum++) {
    const door = doorRequirements.doors.find((d) => d.boxNumber === boxNum);
    const shelf = shelvesRequirements.shelvesByBox.find((s) => s.boxNumber === boxNum);
    const panelSections = getBoxPanelSections(
      sideHeightMm,
      boxWidthsForPanels[boxNum - 1] ?? parameters.boxWidthMm,
      panelDepthMm,
      parameters.boxNadstawkaMm?.[boxNum - 1] ?? []
    );

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

    for (const hdfSection of getBoxHdfSections(
      sideHeightMm,
      (boxWidthsForPanels[boxNum - 1] ?? parameters.boxWidthMm) + 32,
      parameters.boxNadstawkaMm?.[boxNum - 1] ?? []
    )) {
      lines.push(`   • ${hdfSection.label}: płyta HDF (1 szt.) ${hdfSection.widthMm} × ${hdfSection.heightMm} mm - Bez obrzeży`);
    }

    for (const panelSection of panelSections) {
      lines.push(`   • ${panelSection.label}: płyta boczna (2 szt.) ${panelSection.sideHeightMm} × ${panelSection.depthMm} mm - Obrzeże na wysokości ${panelSection.sideHeightMm} mm (1 bok)`);
      lines.push(`   • ${panelSection.label}: płyta górna (1 szt.) ${panelSection.topBottomWidthMm} × ${panelSection.depthMm} mm - Obrzeże na szerokości ${panelSection.topBottomWidthMm} mm (1 bok)`);
      lines.push(`   • ${panelSection.label}: płyta dolna (1 szt.) ${panelSection.topBottomWidthMm} × ${panelSection.depthMm} mm - Obrzeże na szerokości ${panelSection.topBottomWidthMm} mm (1 bok)`);
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
  lines.push(`   • Górna: szer. ${parameters.bottomNicheWidthMm || 0} mm, wys. ${topBlend > 0 ? topBlend + 50 : 0} mm - Bez obrzeży`);
  lines.push(`   • Dolna: szer. ${parameters.bottomNicheWidthMm || 0} mm, wys. ${parameters.bottomBlendMm || 0} mm - Bez obrzeży`);
  if (leftBlend > 0 && (parameters.leftNicheHeightMm || 0) > 0) {
    lines.push(`   • Dodatkowa płyta blenda lewa: ${parameters.leftNicheHeightMm} × 80 mm (1 szt.) - Bez obrzeży [obicie, okleina]`);
  }
  if (rightBlend > 0 && (parameters.rightNicheHeightMm || 0) > 0) {
    lines.push(`   • Dodatkowa płyta blenda prawa: ${parameters.rightNicheHeightMm} × 80 mm (1 szt.) - Bez obrzeży [obicie, okleina]`);
  }
  if (topBlend > 0 && (parameters.topNicheWidthMm || 0) > 0) {
    const topReinforcementWidthMm = parameters.bottomNicheWidthMm || 0;
    if (topReinforcementWidthMm > 2800) {
      const half = Math.ceil(topReinforcementWidthMm / 2);
      lines.push(`   • Dodatkowa płyta blenda górna (cz. 1/2): 80 × ${half} mm (1 szt.) - Bez obrzeży [obicie, okleina]`);
      lines.push(`   • Dodatkowa płyta blenda górna (cz. 2/2): 80 × ${topReinforcementWidthMm - half} mm (1 szt.) - Bez obrzeży [obicie, okleina]`);
    } else {
      lines.push(`   • Dodatkowa płyta blenda górna: 80 × ${topReinforcementWidthMm} mm (1 szt.) - Bez obrzeży [obicie, okleina]`);
    }
  }
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
      const panels = getBoxPanelSections(
        sideHeightMm,
        boxWidthsForPanels[i] ?? parameters.boxWidthMm,
        panelDepthMm,
        parameters.boxNadstawkaMm?.[i] ?? []
      );
      return {
        boxNumber: boxNum,
        door: door
          ? {
              doubleDoor: door.doubleDoor,
              heightMm: door.heightMm,
              widthMm: door.widthMm,
              hinges: (() => {
                const perPanel = Math.min(5, Math.max(2, Math.ceil(door.heightMm / 520)));
                return door.doubleDoor ? perPanel * 2 : perPanel;
              })(),
            }
          : undefined,
        shelves: (() => {
          if (!shelf || shelf.quantity === 0) return undefined;
          const depthMm = shelf.depthMm;
          const perShelfMm = parameters.boxShelvesMm?.[i] ?? [];
          if (perShelfMm.length > 0) {
            // grup według szerokości (ze schematu — uwzględnia przegrody)
            const map = new Map<number, number>();
            for (const w of perShelfMm) map.set(w, (map.get(w) ?? 0) + 1);
            return { depthMm, groups: [...map.entries()].map(([widthMm, qty]) => ({ widthMm, qty })) };
          }
          // fallback: wszystkie półki na pełną szerokość boxa
          return { depthMm, groups: [{ widthMm: shelf.widthMm, qty: shelf.quantity }] };
        })(),
        rods: (parameters.boxRods?.[i] ?? 0) > 0 ? (parameters.boxRods![i]) : undefined,
        hdf: getBoxHdfSections(
          sideHeightMm,
          (boxWidthsForPanels[i] ?? parameters.boxWidthMm) + 32,
          parameters.boxNadstawkaMm?.[i] ?? []
        ),
        panels,
        partitions: (() => {
          const heights = parameters.boxPartitions?.[i] ?? [];
          if (heights.length === 0) return undefined;
          const partitionDepthMm = parameters.cabinetDepthMm - 23; // głębokość = głębokość półki
          return heights.map((h) => ({ heightMm: h, depthMm: partitionDepthMm }));
        })(),
        drawerBoards: (() => {
          const drawerCount = parameters.boxDrawers?.[i] ?? 0;
          if (drawerCount === 0) return undefined;
          const isDouble = parameters.boxDoubleDoors?.[i] ?? false;
          const boxW = boxWidthsForPanels[i] ?? parameters.boxWidthMm;
          // Głębokość boku szuflady = głębokość szafki - margines prowadnic - grubość tylnej płyty
          const internalD = parameters.cabinetDepthMm - specs.guidesMarginMm - specs.drawerSideDepthReductionMm;
          const sets = 1; // szuflady są zawsze 1 zestaw na box, niezależnie od drzwi
          // Front szuflady: boxW - (80mm podwójne / 40mm pojedyncze) - luz 8mm
          const separatorDeductionMm = isDouble ? 2 * specs.separatorWidthMm : specs.separatorWidthMm;
          const frontW = boxW - separatorDeductionMm - specs.drawerFrontClearanceMm;
          // Przód/Tył szuflady: boxW - separator - 87 (stałe odjęcie)
          const internalWallW = boxW - separatorDeductionMm - specs.drawerInternalWallFixedDeductionMm;
          return {
            count: drawerCount,
            sidePanel: { heightMm: specs.drawerSideHeightMm, depthMm: internalD },
            frontPanel: { heightMm: specs.drawerFrontHeightMm, widthMm: frontW },
            internalWall1: { heightMm: specs.internalWallHeight1Mm, widthMm: internalWallW },
            internalWall2: { heightMm: specs.internalWallHeight2Mm, widthMm: internalWallW },
            // HDF: głębokość = bok szuflady - 4mm; szerokość = przód/tył + 18mm
            hdfBottom: { depthMm: internalD - 4, widthMm: internalWallW + 18 },
            sets,
            separator: {
              heightMm: drawerCount * 200,
              widthMm: 40,
              qty: isDouble ? 2 : 1,
            },
            drawerRail: {
              // wysokość = liczba szuflad × 200mm; głębokość = głębokość półki - 35mm
              heightMm: drawerCount * 200,
              widthMm: parameters.cabinetDepthMm - 23 - 35,
            },
          };
        })(),
      };
    }),
    niches: {
      hasNiches: parameters.hasNiches,
      left: { widthMm: leftBlendFinal > 0 ? leftBlendFinal + 50 : 0, heightMm: parameters.leftNicheHeightMm || 0 },
      right: { widthMm: rightBlendFinal > 0 ? rightBlendFinal + 50 : 0, heightMm: parameters.rightNicheHeightMm || 0 },
      top: { widthMm: parameters.bottomNicheWidthMm || 0, heightMm: topBlendFinal > 0 ? topBlendFinal + 50 : 0 },
      bottom: { widthMm: parameters.bottomNicheWidthMm || 0, heightMm: parameters.bottomBlendMm ? parameters.bottomBlendMm + 50 : 0 },
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
    blindReinforcements: (() => {
      const reinforcements: BlindReinforcement[] = [];
      if (leftBlendFinal > 0 && (parameters.leftNicheHeightMm || 0) > 0) {
        reinforcements.push({ side: 'left', heightMm: parameters.leftNicheHeightMm, widthMm: 80 });
      }
      if (rightBlendFinal > 0 && (parameters.rightNicheHeightMm || 0) > 0) {
        reinforcements.push({ side: 'right', heightMm: parameters.rightNicheHeightMm, widthMm: 80 });
      }
      if (topBlendFinal > 0 && (parameters.topNicheWidthMm || 0) > 0) {
        reinforcements.push({ side: 'top', heightMm: 80, widthMm: parameters.bottomNicheWidthMm || 0 });
      }
      return reinforcements;
    })(),
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
      totalLegs: hardware.totalLegs,
    },
  };
}
