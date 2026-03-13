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
    const internalWidth = parameters.boxWidthMm - (2 * specs.sideMatThicknessMm);
    const internalDepth = parameters.cabinetDepthMm - specs.guidesMarginMm;

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
 * Calculate niche furniture dimensions
 * @returns {Object} Object containing niche shelf and blend dimensions
 */
function calculateNicheDimensions() {
    const shelfWidth = parameters.nicheWidthMm - specs.nicheThicknessDeductionMm;
    const blendWidth = parameters.nicheWidthMm - specs.nicheThicknessDeductionMm;
    const sidePanelHeight = parameters.nicheHeightMm - 5;
    const sidePanelFullWidth = parameters.cabinetDepthMm + 3;
    const sidePanelPartialWidth = 100;

    return {
        shelfHeight: specs.nicheShelfHeightMm,
        shelfWidth: shelfWidth,
        blendHeight: specs.nicheBlendHeightMm,
        blendWidth: blendWidth,
        sidePanelHeight: sidePanelHeight,
        sidePanelFullWidth: sidePanelFullWidth,
        sidePanelPartialWidth: sidePanelPartialWidth
    };
}

/**
 * Calculate total hardware quantities
 * @returns {Object} Object containing total guides, brackets, handles, and hinges
 */
function calculateHardware() {
    const constants = require('./constants');
    const totalGuides = parameters.numberOfDrawers * constants.GUIDES_PER_DRAWER;
    const totalBrackets = parameters.numberOfDrawers * constants.BRACKETS_PER_DRAWER;
    const totalDoors = parameters.numberOfLeftDoors + parameters.numberOfRightDoors;
    const totalHandles = totalDoors * constants.HANDLES_PER_DOOR;
    const totalHinges = totalDoors * constants.HINGES_PER_DOOR;

    return {
        totalGuides,
        totalBrackets,
        numberOfLeftDoors: parameters.numberOfLeftDoors,
        numberOfRightDoors: parameters.numberOfRightDoors,
        totalDoors,
        totalHandles,
        totalHinges
    };
}

module.exports = {
    calculateDimensions,
    calculateNicheDimensions,
    calculateHardware
};
