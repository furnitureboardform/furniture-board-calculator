// ╔════════════════════════════════════════════════════════════════════════╗
// ║                       BOARDS DATA MODULE                                ║
// ╚════════════════════════════════════════════════════════════════════════╝

const parameters = require('./parameters');
const specs = require('./specifications');
const { calculateDimensions } = require('./calculations');

/**
 * Generate wooden board array for one drawer
 * @returns {Array} Array of wooden board objects with dimensions and quantities
 */
function getWoodenBoards() {
    const dims = calculateDimensions();

    return [
        {
            nr: 1,
            name: "Boki szuflady (lewy + prawy)",
            dimensions: `${specs.drawerSideHeightMm} × ${dims.sideDepth}`,
            dimensionsTuple: [specs.drawerSideHeightMm, dims.sideDepth],
            qtyPerDrawer: 2,
            material: "Płyta meblowa",
            edgeBanding: `Jedno obrzeże na długości ${dims.sideDepth} mm`
        },
        {
            nr: 2,
            name: "Front szuflady",
            dimensions: `${specs.drawerFrontHeightMm} × ${dims.frontWidth}`,
            dimensionsTuple: [specs.drawerFrontHeightMm, dims.frontWidth],
            qtyPerDrawer: 1,
            material: "Płyta meblowa",
            edgeBanding: "Wszystkie obrzeża"
        },
        {
            nr: 3,
            name: "Ściana wewnętrzna 1",
            dimensions: `${specs.internalWallHeight1Mm} × ${dims.internalWallsWidth}`,
            dimensionsTuple: [specs.internalWallHeight1Mm, dims.internalWallsWidth],
            qtyPerDrawer: 1,
            material: "Płyta meblowa",
            edgeBanding: `Jedno obrzeże na długości ${dims.internalWallsWidth} mm`
        },
        {
            nr: 4,
            name: "Ściana wewnętrzna 2",
            dimensions: `${specs.internalWallHeight2Mm} × ${dims.internalWallsWidth}`,
            dimensionsTuple: [specs.internalWallHeight2Mm, dims.internalWallsWidth],
            qtyPerDrawer: 1,
            material: "Płyta meblowa",
            edgeBanding: `Jedno obrzeże na długości ${dims.internalWallsWidth} mm`
        }
    ];
}

/**
 * Generate HDF bottom board for one drawer
 * @returns {Object} HDF board object with dimensions and quantity
 */
function getHDFBottom() {
    const dims = calculateDimensions();

    return {
        nr: 5,
        name: "Dno szuflady",
        dimensions: `${dims.bottomDepth} × ${dims.bottomWidth}`,
        dimensionsTuple: [dims.bottomDepth, dims.bottomWidth],
        qtyPerDrawer: 1,
        material: "Płyta HDF"
    };
}

/**
 * Generate complete board array for one drawer (wooden + HDF)
 * @returns {Array} Array of all board objects
 */
function getBoardsData() {
    return [...getWoodenBoards(), getHDFBottom()];
}

/**
 * Calculate summary of boards by dimensions
 * @param {Array} boards Array of board objects
 * @returns {Object} Summary object with dimensions as keys
 */
function getBoardsSummary(boards) {
    const summary = {};
    for (const board of boards) {
        const dimensionsKey = board.dimensions;
        if (!(dimensionsKey in summary)) {
            summary[dimensionsKey] = {
                name: board.name,
                material: board.material,
                qtyPerDrawer: 0
            };
        }
        summary[dimensionsKey].qtyPerDrawer += board.qtyPerDrawer;
    }
    return summary;
}

module.exports = {
    getWoodenBoards,
    getHDFBottom,
    getBoardsData,
    getBoardsSummary
};
