// ╔════════════════════════════════════════════════════════════════════════╗
// ║              DESIGN SPECIFICATIONS - DO NOT MODIFY                      ║
// ║           Material dimensions and assembly specifications                ║
// ╚════════════════════════════════════════════════════════════════════════╝

const sideMatThicknessMm = 42;
const drawerSideHeightMm = 145;
const drawerFrontHeightMm = 170;
const internalWallHeight1Mm = 100;
const internalWallHeight2Mm = 130;
const guidesMarginMm = 60;
const internalWallMarginMm = 83;
const bottomDepthMarginMm = 7;
const bottomWidthMarginMm = 63;

// Niche furniture specifications
const nicheShelfThicknessMm = 18;            // Thickness of board material
const nicheShelfHeightMm = 100;              // Height of main shelf board
const nicheBlendHeightMm = 50;               // Height of blend (trim strip)
const nicheThicknessDeductionMm = 76;       // Total thickness to deduct from width

module.exports = {
    sideMatThicknessMm,
    drawerSideHeightMm,
    drawerFrontHeightMm,
    internalWallHeight1Mm,
    internalWallHeight2Mm,
    guidesMarginMm,
    internalWallMarginMm,
    bottomDepthMarginMm,
    bottomWidthMarginMm,
    nicheShelfThicknessMm,
    nicheShelfHeightMm,
    nicheBlendHeightMm,
    nicheThicknessDeductionMm
};
