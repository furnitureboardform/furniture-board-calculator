// ╔════════════════════════════════════════════════════════════════════════╗
// ║                      CALCULATIONS MODULE                                ║
// ╚════════════════════════════════════════════════════════════════════════╝

const parameters = require("./parameters");
const specs = require("./specifications");

function getEffectiveWardrobeDimensions() {
  const effectiveWidthMm =
    parameters.nicheWidthMm -
    (parameters.leftBlendMm || 0) -
    (parameters.rightBlendMm || 0);
  const effectiveHeightMm =
    parameters.nicheHeightMm -
    (parameters.topBlendMm || 0) -
    (parameters.bottomBlendMm || 0);

  return {
    effectiveWidthMm,
    effectiveHeightMm,
  };
}

/**
 * Calculate all drawer dimensions based on configuration
 * @returns {Object} Object containing calculated dimensions
 */
function calculateDimensions() {
  const internalWidth = parameters.boxWidthMm - 2 * specs.sideMatThicknessMm;
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
    bottomWidth,
  };
}

/**
 * Calculate niche furniture dimensions
 * @returns {Object} Object containing niche shelf and blend dimensions
 */
function calculateNicheDimensions() {
  const wardrobe = getEffectiveWardrobeDimensions();
  const shelfWidth =
    wardrobe.effectiveWidthMm - specs.nicheThicknessDeductionMm;
  const blendWidth =
    wardrobe.effectiveWidthMm - specs.nicheThicknessDeductionMm;
  const sidePanelHeight = wardrobe.effectiveHeightMm - 5;
  const sidePanelFullWidth = parameters.cabinetDepthMm + 3;
  const sidePanelPartialWidth = 100;

  return {
    shelfHeight: specs.nicheShelfHeightMm,
    shelfWidth: shelfWidth,
    blendHeight: specs.nicheBlendHeightMm,
    blendWidth: blendWidth,
    sidePanelHeight: sidePanelHeight,
    sidePanelFullWidth: sidePanelFullWidth,
    sidePanelPartialWidth: sidePanelPartialWidth,
  };
}

/**
 * Calculate total hardware quantities
 * @returns {Object} Object containing total guides, brackets, handles, and hinges
 */
function calculateHardware() {
  const constants = require("./constants");
  const totalGuides = parameters.numberOfDrawers * constants.GUIDES_PER_DRAWER;
  const totalBrackets =
    parameters.numberOfDrawers * constants.BRACKETS_PER_DRAWER;
  const totalDoorsFromSides =
    (parameters.numberOfLeftDoors || 0) + (parameters.numberOfRightDoors || 0);
  const totalDoors =
    totalDoorsFromSides > 0 ? totalDoorsFromSides : parameters.numberOfBoxes;
  const totalHandles = totalDoors * constants.HANDLES_PER_DOOR;
  const totalHinges = totalDoors * constants.HINGES_PER_DOOR;

  return {
    totalGuides,
    totalBrackets,
    numberOfLeftDoors: parameters.numberOfLeftDoors,
    numberOfRightDoors: parameters.numberOfRightDoors,
    totalDoors,
    totalHandles,
    totalHinges,
  };
}

/**
 * Calculate doors requirements for all boxes
 * - one door per box
 * - door width = box interior width + 2 * side panel thickness (18 mm) - left clearance - right clearance
 * - door height = effective wardrobe height (after top/bottom blends) - top clearance - bottom clearance
 * @returns {Object} Object containing total door count, dimensions and per-box details
 */
function calculateDoorRequirements() {
  const sidePanelThicknessMm = 18;
  const topClearanceMm = 2;
  const bottomClearanceMm = 2;
  const leftClearanceMm = 2;
  const rightClearanceMm = 2;
  const wardrobe = getEffectiveWardrobeDimensions();

  const boxWidths =
    parameters.boxWidths && parameters.boxWidths.length > 0
      ? parameters.boxWidths.slice(0, parameters.numberOfBoxes)
      : Array(parameters.numberOfBoxes).fill(parameters.boxWidthMm);

  const doorHeightMm =
    wardrobe.effectiveHeightMm - topClearanceMm - bottomClearanceMm;
  const doors = boxWidths.map((boxInteriorWidthMm, index) => {
    const sideType = index < parameters.numberOfLeftDoors ? "left" : "right";

    return {
      boxNumber: index + 1,
      sideType,
      widthMm:
        boxInteriorWidthMm +
        2 * sidePanelThicknessMm -
        leftClearanceMm -
        rightClearanceMm,
      heightMm: doorHeightMm,
    };
  });

  return {
    totalDoors: parameters.numberOfBoxes,
    wardrobeHeightMm: wardrobe.effectiveHeightMm,
    doorHeightMm,
    sidePanelThicknessMm,
    topClearanceMm,
    bottomClearanceMm,
    leftClearanceMm,
    rightClearanceMm,
    doors,
  };
}

/**
 * Calculate shelf requirements for all boxes
 * Shelf depth formula:
 * cabinet depth - 18 mm door - 2 mm door clearance - 3 mm back board
 * @returns {Object} Object containing shelf depth, total shelves and per-box details
 */
function calculateShelvesRequirements() {
  const doorThicknessMm = 18;
  const doorClearanceFromCabinetMm = 2;
  const backBoardThicknessMm = 3;

  const shelfDepthMm =
    parameters.cabinetDepthMm -
    doorThicknessMm -
    doorClearanceFromCabinetMm -
    backBoardThicknessMm;

  const boxWidths =
    parameters.boxWidths && parameters.boxWidths.length > 0
      ? parameters.boxWidths.slice(0, parameters.numberOfBoxes)
      : Array(parameters.numberOfBoxes).fill(parameters.boxWidthMm);

  const boxShelves =
    parameters.boxShelves && parameters.boxShelves.length > 0
      ? parameters.boxShelves.slice(0, parameters.numberOfBoxes)
      : Array(parameters.numberOfBoxes).fill(0);

  const shelvesByBox = boxWidths.map((boxInteriorWidthMm, index) => ({
    boxNumber: index + 1,
    quantity: boxShelves[index] || 0,
    widthMm: boxInteriorWidthMm,
    depthMm: shelfDepthMm,
  }));

  const totalShelves = shelvesByBox.reduce(
    (total, shelf) => total + shelf.quantity,
    0,
  );

  return {
    shelfDepthMm,
    doorThicknessMm,
    doorClearanceFromCabinetMm,
    backBoardThicknessMm,
    totalShelves,
    shelvesByBox,
  };
}

module.exports = {
  calculateDimensions,
  calculateNicheDimensions,
  calculateHardware,
  calculateDoorRequirements,
  calculateShelvesRequirements,
  getEffectiveWardrobeDimensions,
};
