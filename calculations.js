// ╔════════════════════════════════════════════════════════════════════════╗
// ║                      CALCULATIONS MODULE                                ║
// ╚════════════════════════════════════════════════════════════════════════╝

const parameters = require('./parameters');
const specs = require('./specifications');

/**
 * Calculate all drawer dimensions based on configuration
 * @returns {Object} Object containing calculated dimensions
 */
function calculateDimensions() {
    const internalWidth = parameters.recessWidthMm - (2 * specs.sideMatThicknessMm);
    const internalDepth = parameters.cabinetDepthMm - specs.guidesMarginMm;

    // Dimensions of individual panels
    const sideDepth = internalDepth;
    const frontWidth = internalWidth;
    const internalWallsWidth = internalWidth - specs.internalWallMarginMm;
    const bottomDepth = internalDepth - specs.bottomDepthMarginMm;
    const bottomWidth = internalWidth - specs.bottomWidthMarginMm;

    return {
        internalWidth,
        internalDepth,
        sideDepth,
        frontWidth,
        internalWallsWidth,
        bottomDepth,
        bottomWidth
    };
}

/**
 * Calculate total hardware quantities
 * @returns {Object} Object containing total guides and brackets
 */
function calculateHardware() {
    const constants = require('./constants');
    const totalGuides = parameters.numberOfDrawers * constants.GUIDES_PER_DRAWER;
    const totalBrackets = parameters.numberOfDrawers * constants.BRACKETS_PER_DRAWER;

    return {
        totalGuides,
        totalBrackets
    };
}

module.exports = {
    calculateDimensions,
    calculateHardware
};
