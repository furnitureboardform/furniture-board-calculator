// ╔════════════════════════════════════════════════════════════════════════╗
// ║                       REPORT OUTPUT MODULE                              ║
// ╚════════════════════════════════════════════════════════════════════════╝

const parameters = require('./parameters');

/**
 * Print the main report header
 */
function printHeader() {
    console.log("\n");
    console.log("╔" + "═".repeat(78) + "╗");
    console.log("║" + " ".repeat(18) + "NARZĘDZIE DO OBLICZANIA SZUFLAD" + " ".repeat(29) + "║");
    console.log("╚" + "═".repeat(78) + "╝");
}

/**
 * Print input parameters section
 */
function printInputParameters() {
    console.log("\n📋 PARAMETRY WEJŚCIOWE:");
    console.log(`   ├─ Liczba szuflad: ${parameters.numberOfDrawers}`);
    console.log(`   ├─ Szerokość wnęki na szuflady: ${parameters.recessWidthMm} mm`);
    console.log(`   └─ Głębokość szafki: ${parameters.cabinetDepthMm} mm`);
}

/**
 * Print shopping list section with edge banding details
 * @param {number} totalGuides
 * @param {number} totalBrackets
 * @param {Array} woodenBoards Array of wooden board objects
 * @param {Object} hdfBottom HDF bottom board object
 * @param {Object} boardsSummary Summary object with dimensions as keys
 */
function printShoppingList(totalGuides, totalBrackets, woodenBoards, hdfBottom, boardsSummary) {
    console.log("─".repeat(80));
    console.log("📋 PODSUMOWANIE LISTY ZAKUPÓW");
    console.log("─".repeat(80));
    console.log();

    // Print hardware section
    console.log("🔧 PROWADNICE I SPRZĘGŁA");
    console.log("─".repeat(80));
    console.log(`   • Prowadnice przesuwne (1 zestaw na szuflądę): ${totalGuides} szt.`);
    console.log(`   • Sprzęgła (1 zestaw na szuflądę): ${totalBrackets} szt.`);
    console.log();

    // Print wooden boards with edge banding info
    console.log("📦 PŁYTY MEBLOWE");
    console.log("─".repeat(80));
    for (const board of woodenBoards) {
        const totalQty = board.qtyPerDrawer * parameters.numberOfDrawers;
        console.log(`   • ${board.dimensions} mm (${totalQty} szt.) - ${board.edgeBanding}`);
    }
    console.log();

    // Print HDF bottom
    console.log("📦 PŁYTA HDF");
    console.log("─".repeat(80));
    const hdfQty = hdfBottom.qtyPerDrawer * parameters.numberOfDrawers;
    console.log(`   • ${hdfBottom.dimensions} mm: ${hdfQty} szt.`);

    console.log("\n" + "═".repeat(80) + "\n");
}

module.exports = {
    printHeader,
    printInputParameters,
    printShoppingList
};
