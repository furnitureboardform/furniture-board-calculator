/**
 * Wymiary i stałe konstrukcyjne – nie modyfikować.
 * Wszystkie wartości w milimetrach [mm].
 */

// ─── Szuflady (korpus) ─────────────────────────────────────────────────────

/** Grubość płyty bocznej szuflady (odjęcie z szerokości wnętrza po obu stronach). */
export const sideMatThicknessMm = 42;

/** Wysokość boku szuflady (lewy + prawy). */
export const drawerSideHeightMm = 145;

/** Wysokość frontu szuflady. */
export const drawerFrontHeightMm = 170;

/** Wysokość pierwszej ściany wewnętrznej szuflady. */
export const internalWallHeight1Mm = 100;

/** Wysokość drugiej ściany wewnętrznej szuflady. */
export const internalWallHeight2Mm = 130;

/** Odjęcie z głębokości na montaż prowadnic. */
export const guidesMarginMm = 60;

/** Odjęcie ze szerokości na ściany wewnętrzne szuflady. */
export const internalWallMarginMm = 83;

/** Odjęcie z głębokości dla dna szuflady (HDF). */
export const bottomDepthMarginMm = 7;

/** Odjęcie ze szerokości dla dna szuflady (HDF). */
export const bottomWidthMarginMm = 63;

// ─── Wnęki / blendy ───────────────────────────────────────────────────────

/** Grubość płyty półki wnęki. */
export const nicheShelfThicknessMm = 18;

/** Wysokość półki wnęki (główna półka nad blendą). */
export const nicheShelfHeightMm = 100;

/** Wysokość blendy wnęki (listwa / pasek pod półką). */
export const nicheBlendHeightMm = 50;

/** Łączne odjęcie ze szerokości szafy przy liczeniu półki i blendy wnęki (grubości materiału itd.). */
export const nicheThicknessDeductionMm = 76;
