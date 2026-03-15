// ╔════════════════════════════════════════════════════════════════════════╗
// ║                       REPORT OUTPUT MODULE                              ║
// ╚════════════════════════════════════════════════════════════════════════╝

const parameters = require("./parameters");

function printHeader() {
  console.log("\n");
  console.log("╔" + "═".repeat(78) + "╗");
  console.log(
    "║" +
      " ".repeat(18) +
      "NARZĘDZIE DO OBLICZANIA SZUFLAD" +
      " ".repeat(29) +
      "║",
  );
  console.log("╚" + "═".repeat(78) + "╝");
}

function printInputParameters() {
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

  console.log("\n📋 PARAMETRY WEJŚCIOWE:");
  console.log(`   ├─ Liczba szuflad: ${parameters.numberOfDrawers}`);
  console.log(`   ├─ Szerokość wnęki na szuflady: ${parameters.boxWidthMm} mm`);
  console.log(`   ├─ Głębokość szafki: ${parameters.cabinetDepthMm} mm`);
  console.log(`   ├─ Szerokość wnęki: ${parameters.nicheWidthMm} mm`);
  console.log(`   ├─ Wysokość wnęki: ${parameters.nicheHeightMm} mm`);
  console.log(
    `   ├─ Blendy L/P/G/D: ${parameters.leftBlendMm || 0} / ${parameters.rightBlendMm || 0} / ${parameters.topBlendMm || 0} / ${parameters.bottomBlendMm || 0} mm`,
  );
  console.log(`   ├─ Szerokość szafy po blendach: ${effectiveWidthMm} mm`);
  console.log(`   ├─ Wysokość szafy po blendach: ${effectiveHeightMm} mm`);
  console.log(
    `   ├─ Odjęcie na boxy (po ${perBoxDeductionMm} mm): ${parameters.numberOfBoxes * perBoxDeductionMm} mm`,
  );
  console.log(
    `   ├─ Dostępna szerokość wnętrz boxów: ${availableInteriorWidthForBoxesMm} mm`,
  );
  console.log(`   ├─ Drzwi lewe: ${parameters.numberOfLeftDoors}`);
  console.log(`   └─ Drzwi prawe: ${parameters.numberOfRightDoors}`);
}

/**
 * Print shopping list section with edge banding details
 * @param {Object} data Object containing all hardware quantities and door counts
 * @param {Array} woodenBoards Array of wooden board objects
 * @param {Object} hdfBottom HDF bottom board object
 * @param {Object} boardsSummary Summary object with dimensions as keys
 */
function printShoppingList(data, woodenBoards, hdfBottom, boardsSummary) {
  console.log("─".repeat(80));
  console.log("📋 PODSUMOWANIE LISTY ZAKUPÓW");
  console.log("─".repeat(80));
  console.log();

  // Print hardware section
  console.log("🔧 PROWADNICE I SPRZĘGŁA");
  console.log("─".repeat(80));
  console.log(
    `   • Prowadnice przesuwne (1 zestaw na szuflądę): ${data.totalGuides} szt.`,
  );
  console.log(
    `   • Sprzęgła (1 zestaw na szuflądę): ${data.totalBrackets} szt.`,
  );
  console.log(`   • Uchwyty (1 na drzwi): ${data.totalHandles} szt.`);
  console.log(
    `   • Zawiasy (5 na drzwi × ${data.totalDoors} drzwi): ${data.totalHinges} szt.`,
  );
  console.log();

  // Print wooden boards with edge banding info
  console.log("📦 PŁYTY MEBLOWE KORPUS SZARY");
  console.log("─".repeat(80));
  for (const board of woodenBoards) {
    const totalQty = board.qtyPerDrawer * parameters.numberOfDrawers;
    console.log(
      `   • ${board.dimensions} mm (${totalQty} szt.) - ${board.edgeBanding}`,
    );
  }
  console.log();

  // Print HDF bottom
  console.log("📦 PŁYTA HDF");
  console.log("─".repeat(80));
  const hdfQty = hdfBottom.qtyPerDrawer * parameters.numberOfDrawers;
  console.log(`   • ${hdfBottom.dimensions} mm: ${hdfQty} szt.`);
  console.log("\n" + "═".repeat(80) + "\n");
}

/**
 * Print colored wooden boards and doors section
 * @param {Array} nicheBoards Array of niche board objects
 * @param {Object} data Object containing door counts
 * @param {Object} doorRequirements Object containing calculated door dimensions and per-box details
 * @param {Object} shelvesRequirements Object containing calculated shelf depth and per-box shelf details
 */
function printNicheFurniture(
  nicheBoards,
  data,
  doorRequirements,
  shelvesRequirements,
) {
  console.log("📦 PŁYTY MEBLOWE OBICIE KOLOR");
  console.log("─".repeat(80));
  for (const board of nicheBoards) {
    console.log(
      `   • ${board.name}: ${board.dimensions} mm (${board.qty} szt.) - ${board.edgeBanding}`,
    );
  }
  console.log(
    `   • Drzwi łącznie: ${doorRequirements.totalDoors} szt. (1 drzwi na 1 box)`,
  );
  console.log(
    `   • Wysokość drzwi: ${doorRequirements.doorHeightMm} mm (wysokość szafy po blendach ${doorRequirements.wardrobeHeightMm} mm, luz: ${doorRequirements.topClearanceMm} mm góra + ${doorRequirements.bottomClearanceMm} mm dół)`,
  );
  console.log(
    `   • Wzór wys. drzwi: ${parameters.nicheHeightMm} - ${parameters.topBlendMm || 0} - ${parameters.bottomBlendMm || 0} - ${doorRequirements.topClearanceMm} - ${doorRequirements.bottomClearanceMm} = ${doorRequirements.doorHeightMm} mm`,
  );
  console.log(
    `   • Szerokość drzwi: szerokość wnętrza boxa + 2 × ${doorRequirements.sidePanelThicknessMm} mm - ${doorRequirements.leftClearanceMm} mm lewy luz - ${doorRequirements.rightClearanceMm} mm prawy luz`,
  );
  for (const door of doorRequirements.doors) {
    const sideLabel = door.sideType === "left" ? "lewe" : "prawe";
    console.log(
      `   • Box ${door.boxNumber}: drzwi ${sideLabel} ${door.heightMm} × ${door.widthMm} mm`,
    );
  }
  console.log(`   • Drzwi lewe: ${data.numberOfLeftDoors} szt.`);
  console.log(`   • Drzwi prawe: ${data.numberOfRightDoors} szt.`);
  console.log();

  console.log("📦 PÓŁKI W BOXACH");
  console.log("─".repeat(80));
  console.log(
    `   • Głębokość półki: ${shelvesRequirements.shelfDepthMm} mm (${parameters.cabinetDepthMm} - ${shelvesRequirements.doorThicknessMm} - ${shelvesRequirements.doorClearanceFromCabinetMm} - ${shelvesRequirements.backBoardThicknessMm})`,
  );
  console.log(`   • Łącznie półek: ${shelvesRequirements.totalShelves} szt.`);
  for (const shelf of shelvesRequirements.shelvesByBox) {
    if (shelf.quantity === 0) {
      continue;
    }
    console.log(
      `   • Box ${shelf.boxNumber}: ${shelf.quantity} szt. (${shelf.widthMm} × ${shelf.depthMm} mm)`,
    );
  }
  console.log();

  console.log("📦 BLENDY / WNĘKI");
  console.log("─".repeat(80));
  console.log(`   • Czy są wnęki: ${parameters.hasNiches ? "Tak" : "Nie"}`);
  console.log(
    `   • Lewa: szer. ${parameters.leftBlendMm || 0} mm, wys. ${parameters.leftNicheHeightMm || 0} mm`,
  );
  console.log(
    `   • Prawa: szer. ${parameters.rightBlendMm || 0} mm, wys. ${parameters.rightNicheHeightMm || 0} mm`,
  );
  console.log(
    `   • Górna: szer. ${parameters.topNicheWidthMm || 0} mm, wys. ${parameters.topBlendMm || 0} mm`,
  );
  console.log(
    `   • Dolna: szer. ${parameters.bottomNicheWidthMm || 0} mm, wys. ${parameters.bottomBlendMm || 0} mm`,
  );
  console.log(
    `   • Wpływ na szerokość szafy: lewa szerokość + prawa szerokość`,
  );
  console.log(`   • Wpływ na wysokość szafy: górna wysokość + dolna wysokość`);
  console.log();
}

module.exports = {
  printHeader,
  printInputParameters,
  printShoppingList,
  printNicheFurniture,
};
