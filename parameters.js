// ╔════════════════════════════════════════════════════════════════════════╗
// ║                  EDITABLE PARAMETERS FILE                               ║
// ║              >> MODIFY THESE VALUES FOR YOUR PROJECT <<                 ║
// ╚════════════════════════════════════════════════════════════════════════╝

// Drawer parameters - EDIT THESE FOR YOUR PROJECT
const numberOfDrawers = 2;                   // Number of drawers to build
const boxWidthMm = 964;                      // Width of recess for drawers [mm]
const cabinetDepthMm = 600;                  // Cabinet depth (front to back) [mm]

// Niche parameters - EDIT THESE FOR YOUR PROJECT
const nicheWidthMm = 3070;                   // Width of niche [mm]
const nicheHeightMm = 2700;                  // Height of niche [mm]

// Door parameters - EDIT THESE FOR YOUR PROJECT
const numberOfLeftDoors = 1;                 // Number of left-hand doors
const numberOfRightDoors = 1;                // Number of right-hand doors
const isLeftSideFullyCovered = false;        // Is the left side fully upholstered
const isRightSideFullyCovered = true;       // Is the right side fully upholstered

module.exports = {
    numberOfDrawers,
    boxWidthMm,
    cabinetDepthMm,
    nicheWidthMm,
    nicheHeightMm,
    numberOfLeftDoors,
    numberOfRightDoors,
    isLeftSideFullyCovered,
    isRightSideFullyCovered
};
