// ╔════════════════════════════════════════════════════════════════════════╗
// ║                   DRAWER CALCULATION SCRIPT - MAIN FILE                 ║
// ╚════════════════════════════════════════════════════════════════════════╝

const { calculateDimensions, calculateHardware } = require('./calculations');
const { getWoodenBoards, getHDFBottom, getBoardsData, getBoardsSummary } = require('./boards');
const report = require('./report');

function main() {
    const woodenBoards = getWoodenBoards();
    const hdfBottom = getHDFBottom();
    const allBoards = getBoardsData();
    const boardsSummary = getBoardsSummary(allBoards);

    const hardware = calculateHardware();

    report.printHeader();
    report.printInputParameters();
    report.printShoppingList(hardware.totalGuides, hardware.totalBrackets, woodenBoards, hdfBottom, boardsSummary);
}

main();
