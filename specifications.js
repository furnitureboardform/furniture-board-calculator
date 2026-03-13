// ╔════════════════════════════════════════════════════════════════════════╗
// ║              DESIGN SPECIFICATIONS - DO NOT MODIFY                      ║
// ║           Material dimensions and assembly specifications                ║
// ╚════════════════════════════════════════════════════════════════════════╝

// Material parameters
const sideMatThicknessMm = 42;               // Thickness of drawer side panels [mm]

// Drawer component dimensions (heights of individual walls)
const drawerSideHeightMm = 145;              // Height of drawer side [mm]
const drawerFrontHeightMm = 170;             // Height of drawer front/face [mm]
const internalWallHeight1Mm = 100;           // Height of internal wall 1 [mm]
const internalWallHeight2Mm = 130;           // Height of internal wall 2 [mm]

// Assembly margins
const guidesMarginMm = 60;                   // Margin for slide guides [mm]
const internalWallMarginMm = 83;             // Margin for internal walls [mm]
const bottomDepthMarginMm = 7;               // Margin for bottom depth [mm]
const bottomWidthMarginMm = 63;              // Margin for bottom width [mm]

module.exports = {
    sideMatThicknessMm,
    drawerSideHeightMm,
    drawerFrontHeightMm,
    internalWallHeight1Mm,
    internalWallHeight2Mm,
    guidesMarginMm,
    internalWallMarginMm,
    bottomDepthMarginMm,
    bottomWidthMarginMm
};
