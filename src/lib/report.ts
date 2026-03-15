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

/**
 * Buduje pełny tekst raportu z parametrów i wyliczonych danych.
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
): string {
  const lines: string[] = [];

  lines.push('');
  lines.push('╔' + '═'.repeat(78) + '╗');
  lines.push('║' + ' '.repeat(18) + 'NARZĘDZIE DO OBLICZANIA SZUFLAD' + ' '.repeat(29) + '║');
  lines.push('╚' + '═'.repeat(78) + '╝');

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

  lines.push('');
  lines.push('📋 PARAMETRY WEJŚCIOWE:');
  lines.push(`   ├─ Liczba szuflad: ${parameters.numberOfDrawers}`);
  lines.push(`   ├─ Szerokość wnęki na szuflady: ${parameters.boxWidthMm} mm`);
  lines.push(`   ├─ Głębokość szafki: ${parameters.cabinetDepthMm} mm`);
  lines.push(`   ├─ Szerokość wnęki: ${parameters.nicheWidthMm} mm`);
  lines.push(`   ├─ Wysokość wnęki: ${parameters.nicheHeightMm} mm`);
  lines.push(
    `   ├─ Blendy L/P/G/D: ${parameters.leftBlendMm || 0} / ${parameters.rightBlendMm || 0} / ${parameters.topBlendMm || 0} / ${parameters.bottomBlendMm || 0} mm`
  );
  lines.push(`   ├─ Szerokość szafy po blendach: ${effectiveWidthMm} mm`);
  lines.push(`   ├─ Wysokość szafy po blendach: ${effectiveHeightMm} mm`);
  lines.push(
    `   ├─ Odjęcie na boxy (po ${perBoxDeductionMm} mm): ${parameters.numberOfBoxes * perBoxDeductionMm} mm`
  );
  lines.push(`   ├─ Dostępna szerokość wnętrz boxów: ${availableInteriorWidthForBoxesMm} mm`);
  lines.push(`   ├─ Drzwi lewe: ${parameters.numberOfLeftDoors}`);
  lines.push(`   └─ Drzwi prawe: ${parameters.numberOfRightDoors}`);

  lines.push('─'.repeat(80));
  lines.push('📋 PODSUMOWANIE LISTY ZAKUPÓW');
  lines.push('─'.repeat(80));
  lines.push('');

  lines.push('🔧 PROWADNICE I SPRZĘGŁA');
  lines.push('─'.repeat(80));
  lines.push(`   • Prowadnice przesuwne (1 zestaw na szuflądę): ${hardware.totalGuides} szt.`);
  lines.push(`   • Sprzęgła (1 zestaw na szuflądę): ${hardware.totalBrackets} szt.`);
  lines.push(`   • Uchwyty (1 na drzwi): ${hardware.totalHandles} szt.`);
  lines.push(`   • Zawiasy (5 na drzwi × ${hardware.totalDoors} drzwi): ${hardware.totalHinges} szt.`);
  lines.push('');

  lines.push('📦 PŁYTY MEBLOWE KORPUS SZARY');
  lines.push('─'.repeat(80));
  for (const board of woodenBoards) {
    const totalQty = board.qtyPerDrawer * parameters.numberOfDrawers;
    lines.push(`   • ${board.dimensions} mm (${totalQty} szt.) - ${board.edgeBanding}`);
  }
  lines.push('');

  lines.push('📦 PŁYTA HDF');
  lines.push('─'.repeat(80));
  const hdfQty = hdfBottom.qtyPerDrawer * parameters.numberOfDrawers;
  lines.push(`   • ${hdfBottom.dimensions} mm: ${hdfQty} szt.`);
  lines.push('');
  lines.push('═'.repeat(80));
  lines.push('');

  lines.push('📦 PŁYTY MEBLOWE OBICIE KOLOR');
  lines.push('─'.repeat(80));
  for (const board of nicheBoards) {
    lines.push(`   • ${board.name}: ${board.dimensions} mm (${board.qty} szt.) - ${board.edgeBanding}`);
  }
  lines.push(`   • Drzwi łącznie: ${doorRequirements.totalDoors} szt. (1 drzwi na 1 box)`);
  lines.push(
    `   • Wysokość drzwi: ${doorRequirements.doorHeightMm} mm (wysokość szafy po blendach ${doorRequirements.wardrobeHeightMm} mm, luz: ${doorRequirements.topClearanceMm} mm góra + ${doorRequirements.bottomClearanceMm} mm dół)`
  );
  lines.push(
    `   • Wzór wys. drzwi: ${parameters.nicheHeightMm} - ${parameters.topBlendMm || 0} - ${parameters.bottomBlendMm || 0} - ${doorRequirements.topClearanceMm} - ${doorRequirements.bottomClearanceMm} = ${doorRequirements.doorHeightMm} mm`
  );
  lines.push(
    `   • Szerokość drzwi: szerokość wnętrza boxa + 2 × ${doorRequirements.sidePanelThicknessMm} mm - ${doorRequirements.leftClearanceMm} mm lewy luz - ${doorRequirements.rightClearanceMm} mm prawy luz`
  );
  for (const door of doorRequirements.doors) {
    const sideLabel = door.sideType === 'left' ? 'lewe' : 'prawe';
    lines.push(`   • Box ${door.boxNumber}: drzwi ${sideLabel} ${door.heightMm} × ${door.widthMm} mm`);
  }
  lines.push(`   • Drzwi lewe: ${hardware.numberOfLeftDoors} szt.`);
  lines.push(`   • Drzwi prawe: ${hardware.numberOfRightDoors} szt.`);
  lines.push('');

  lines.push('📦 PÓŁKI W BOXACH');
  lines.push('─'.repeat(80));
  lines.push(
    `   • Głębokość półki: ${shelvesRequirements.shelfDepthMm} mm (${parameters.cabinetDepthMm} - ${shelvesRequirements.doorThicknessMm} - ${shelvesRequirements.doorClearanceFromCabinetMm} - ${shelvesRequirements.backBoardThicknessMm})`
  );
  lines.push(`   • Łącznie półek: ${shelvesRequirements.totalShelves} szt.`);
  for (const shelf of shelvesRequirements.shelvesByBox) {
    if (shelf.quantity === 0) continue;
    lines.push(`   • Box ${shelf.boxNumber}: ${shelf.quantity} szt. (${shelf.widthMm} × ${shelf.depthMm} mm)`);
  }
  lines.push('');

  lines.push('📦 BLENDY / WNĘKI');
  lines.push('─'.repeat(80));
  lines.push(`   • Czy są wnęki: ${parameters.hasNiches ? 'Tak' : 'Nie'}`);
  lines.push(`   • Lewa: szer. ${parameters.leftBlendMm || 0} mm, wys. ${parameters.leftNicheHeightMm || 0} mm`);
  lines.push(`   • Prawa: szer. ${parameters.rightBlendMm || 0} mm, wys. ${parameters.rightNicheHeightMm || 0} mm`);
  lines.push(`   • Górna: szer. ${parameters.topNicheWidthMm || 0} mm, wys. ${parameters.topBlendMm || 0} mm`);
  lines.push(`   • Dolna: szer. ${parameters.bottomNicheWidthMm || 0} mm, wys. ${parameters.bottomBlendMm || 0} mm`);
  lines.push('   • Wpływ na szerokość szafy: lewa szerokość + prawa szerokość');
  lines.push('   • Wpływ na wysokość szafy: górna wysokość + dolna wysokość');
  lines.push('');

  return lines.join('\n');
}
