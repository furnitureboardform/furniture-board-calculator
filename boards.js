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
 * Calculate niche furniture dimensions
 * @returns {Object} Object containing niche shelf and blend dimensions
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

/**
 * Generate niche shelf board data
 * @returns {Object} Niche shelf board object with dimensions and quantity
 */
function getNicheShelfBoard() {
    const { calculateNicheDimensions } = require('./calculations');
    const nicheDims = calculateNicheDimensions();

    return {
        nr: 101,
        name: "Półka wnęki",
        dimensions: `${nicheDims.shelfHeight} × ${nicheDims.shelfWidth}`,
        dimensionsTuple: [nicheDims.shelfHeight, nicheDims.shelfWidth],
        qty: 1,
        material: "Płyta meblowa",
        color: "Kolor A (inny niż standard)",
        edgeBanding: "Wszystkie obrzeża (4 strony)"
    };
}

/**
 * Generate niche blend (trim strip) board data
 * @returns {Object} Niche blend board object with dimensions and quantity
 */
function getNicheBlendBoard() {
    const { calculateNicheDimensions } = require('./calculations');
    const nicheDims = calculateNicheDimensions();

    return {
        nr: 102,
        name: "Blenda wnęki",
        dimensions: `${nicheDims.blendHeight} × ${nicheDims.blendWidth}`,
        dimensionsTuple: [nicheDims.blendHeight, nicheDims.blendWidth],
        qty: 1,
        material: "Płyta meblowa",
        color: "Kolor A (ten sam co półka)",
        edgeBanding: "Obrzeża na krótszych bokach (2) + jeden długszy bok"
    };
}

/**
 * Generate side panel board for left or right side of niche
 * @param {string} side 'left' or 'right'
 * @returns {Object} Side panel board object
 */
function getNicheSidePanel(side) {
    const { calculateNicheDimensions } = require('./calculations');
    const parameters = require('./parameters');
    const nicheDims = calculateNicheDimensions();

    const isFullyCovered = side === 'left'
        ? parameters.isLeftSideFullyCovered
        : parameters.isRightSideFullyCovered;

    const width = isFullyCovered ? nicheDims.sidePanelFullWidth : nicheDims.sidePanelPartialWidth;
    const name = side === 'left' ? "Bok lewy wnęki" : "Bok prawy wnęki";

    return {
        nr: side === 'left' ? 103 : 104,
        name: name,
        dimensions: `${nicheDims.sidePanelHeight} × ${width}`,
        dimensionsTuple: [nicheDims.sidePanelHeight, width],
        qty: 1,
        material: "Płyta meblowa",
        edgeBanding: "Jedno obrzeże na dłuższym boku"
    };
}

/**
 * Generate niche boards array
 * @returns {Array} Array containing shelf, blend and side panels
 */
function getNicheBoards() {
    return [
        getNicheShelfBoard(),
        getNicheBlendBoard(),
        getNicheSidePanel('left'),
        getNicheSidePanel('right')
    ];
}

module.exports = {
    getWoodenBoards,
    getHDFBottom,
    getBoardsData,
    getBoardsSummary,
    getNicheShelfBoard,
    getNicheBlendBoard,
    getNicheSidePanel,
    getNicheBoards
};
