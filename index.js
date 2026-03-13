// ╔════════════════════════════════════════════════════════════════════════╗
// ║                   DRAWER CALCULATION SCRIPT - MAIN FILE                 ║
// ╚════════════════════════════════════════════════════════════════════════╝

const { calculateDimensions, calculateHardware } = require('./calculations');
const { getWoodenBoards, getHDFBottom, getBoardsData, getBoardsSummary, getNicheBoards } = require('./boards');
const report = require('./report');

function main() {
    const woodenBoards = getWoodenBoards();
    const hdfBottom = getHDFBottom();
    const allBoards = getBoardsData();
    const boardsSummary = getBoardsSummary(allBoards);
    const nicheBoards = getNicheBoards();

    const hardware = calculateHardware();

    report.printHeader();
    report.printInputParameters();
    report.printShoppingList(hardware, woodenBoards, hdfBottom, boardsSummary);
    report.printNicheFurniture(nicheBoards, hardware);
}

main();
