// ╔════════════════════════════════════════════════════════════════════════╗
// ║                  EDITABLE PARAMETERS FILE                               ║
// ║              >> MODIFY THESE VALUES FOR YOUR PROJECT <<                 ║
// ╚════════════════════════════════════════════════════════════════════════╝

// Drawer parameters - EDIT THESE FOR YOUR PROJECT
const numberOfDrawers = 2;                   // Number of drawers to build
const numberOfBoxes = 1;                     // Number of boxes in the wardrobe
const boxWidths = [964];                     // Width of each box [mm]
const boxShelves = [0];                      // Number of shelves per box
const boxRods = [0];                         // Number of rods per box
const boxDrawers = [0];                      // Number of drawers per box
const boxWidthMm = 964;                      // Width of recess for drawers [mm]
const cabinetDepthMm = 600;                  // Cabinet depth (front to back) [mm]

// Niche parameters - EDIT THESE FOR YOUR PROJECT
const nicheWidthMm = 3070;                   // Width of niche [mm]
const nicheHeightMm = 2700;                  // Height of niche [mm]

// Door parameters - EDIT THESE FOR YOUR PROJECT
const numberOfLeftDoors = 1;                 // Number of left-hand doors
const numberOfRightDoors = 1;                // Number of right-hand doors
const isLeftSideFullyCovered = false;        // Is the left side fully upholstered
const isRightSideFullyCovered = false;       // Is the right side fully upholstered

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
    numberOfLeftDoors,
    numberOfRightDoors,
    isLeftSideFullyCovered,
    isRightSideFullyCovered
};
