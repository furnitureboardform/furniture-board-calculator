// ╔════════════════════════════════════════════════════════════════════════╗
// ║                       REPORT OUTPUT MODULE                              ║
// ╚════════════════════════════════════════════════════════════════════════╝

const parameters = require('./parameters');

function printHeader() {
    console.log("\n");
    console.log("╔" + "═".repeat(78) + "╗");
    console.log("║" + " ".repeat(18) + "NARZĘDZIE DO OBLICZANIA SZUFLAD" + " ".repeat(29) + "║");
    console.log("╚" + "═".repeat(78) + "╝");
}

function printInputParameters() {
    console.log("\n📋 PARAMETRY WEJŚCIOWE:");
    console.log(`   ├─ Liczba szuflad: ${parameters.numberOfDrawers}`);
    console.log(`   ├─ Szerokość wnęki na szuflady: ${parameters.boxWidthMm} mm`);
    console.log(`   ├─ Głębokość szafki: ${parameters.cabinetDepthMm} mm`);
    console.log(`   ├─ Szerokość wnęki: ${parameters.nicheWidthMm} mm`);
    console.log(`   ├─ Wysokość wnęki: ${parameters.nicheHeightMm} mm`);
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
    console.log(`   • Prowadnice przesuwne (1 zestaw na szuflądę): ${data.totalGuides} szt.`);
    console.log(`   • Sprzęgła (1 zestaw na szuflądę): ${data.totalBrackets} szt.`);
    console.log(`   • Uchwyty (1 na drzwi): ${data.totalHandles} szt.`);
    console.log(`   • Zawiasy (5 na drzwi): ${data.totalHinges} szt.`);
    console.log();

    // Print wooden boards with edge banding info
    console.log("📦 PŁYTY MEBLOWE KORPUS SZARY");
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

/**
 * Print colored wooden boards and doors section
 * @param {Array} nicheBoards Array of niche board objects
 * @param {Object} data Object containing door counts
 */
function printNicheFurniture(nicheBoards, data) {
    console.log("📦 PŁYTY MEBLOWE OBICIE KOLOR");
    console.log("─".repeat(80));
    for (const board of nicheBoards) {
        console.log(`   • ${board.name}: ${board.dimensions} mm (${board.qty} szt.) - ${board.edgeBanding}`);
    }
    console.log(`   • Drzwi lewe: ${data.numberOfLeftDoors} szt. - Okleinione z każdej strony`);
    console.log(`   • Drzwi prawe: ${data.numberOfRightDoors} szt. - Okleinione z każdej strony`);
    console.log();
}

module.exports = {
    printHeader,
    printInputParameters,
    printShoppingList,
    printNicheFurniture
};
