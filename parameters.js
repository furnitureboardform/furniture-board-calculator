// ╔════════════════════════════════════════════════════════════════════════╗
// ║                  EDITABLE PARAMETERS FILE                               ║
// ║              >> MODIFY THESE VALUES FOR YOUR PROJECT <<                 ║
// ╚════════════════════════════════════════════════════════════════════════╝

// Drawer parameters - EDIT THESE FOR YOUR PROJECT
const numberOfDrawers = 2; // Number of drawers to build
const numberOfBoxes = 3; // Number of boxes in the wardrobe
const boxWidths = [952, 952, 952]; // Width of each box [mm]
const boxShelves = [4, 2, 2]; // Number of shelves per box
const boxRods = [1, 0, 0]; // Number of rods per box
const boxDrawers = [0, 2, 2]; // Number of drawers per box
const boxWidthMm = 964; // Width of recess for drawers [mm]
const cabinetDepthMm = 600; // Cabinet depth (front to back) [mm]

// Niche parameters - EDIT THESE FOR YOUR PROJECT
const nicheWidthMm = 3000; // Width of niche [mm]
const nicheHeightMm = 2580; // Height of niche [mm]
const hasNiches = false; // Are side/top/bottom niches present
const leftBlendMm = 0; // Left blend size [mm]
const rightBlendMm = 0; // Right blend size [mm]
const topBlendMm = 0; // Top blend size [mm]
const bottomBlendMm = 0; // Bottom blend size [mm]
const leftNicheHeightMm = 0; // Left niche height [mm]
const rightNicheHeightMm = 0; // Right niche height [mm]
const topNicheWidthMm = 0; // Top niche width [mm]
const bottomNicheWidthMm = 0; // Bottom niche width [mm]

// Door parameters - EDIT THESE FOR YOUR PROJECT
const numberOfLeftDoors = 3; // Number of left-hand doors
const numberOfRightDoors = 0; // Number of right-hand doors
const doorClearancePerSideMm = 2; // Door clearance per side [mm] (top + bottom)
const isLeftSideFullyCovered = false; // Is the left side fully upholstered
const isRightSideFullyCovered = false; // Is the right side fully upholstered

module.exports = {
  numberOfDrawers,
  numberOfBoxes,
  boxWidths,
  boxShelves,
  boxRods,
  boxDrawers,
  boxWidthMm,
  cabinetDepthMm,
  nicheWidthMm,
  nicheHeightMm,
  hasNiches,
  leftBlendMm,
  rightBlendMm,
  topBlendMm,
  bottomBlendMm,
  leftNicheHeightMm,
  rightNicheHeightMm,
  topNicheWidthMm,
  bottomNicheWidthMm,
  numberOfLeftDoors,
  numberOfRightDoors,
  doorClearancePerSideMm,
  isLeftSideFullyCovered,
  isRightSideFullyCovered,
};
