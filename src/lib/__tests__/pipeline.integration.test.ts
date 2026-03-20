import { describe, it, expect } from 'vitest';
import { runReport } from '../index';
import { buildParameters } from '../../utils/buildParameters';
import type { BoxForm } from '../types';

// ---------------------------------------------------------------------------
// Scenario: 3-box wardrobe with nadstawki, partitions and mixed interiors
//   Niche: 3020 × 2570 mm, depth 600 mm
//   Left outer masking (maskownica), right blend 50 mm, bottom blend 100 mm
//   All 3 boxes equally wide (948 mm), each with double doors
//
//   Box 1 – nadstawka at 1100 mm
//     Main box: 1 rod
//     Nadstawka: partition at 600 mm from left; left = rod, right = 4 shelves
//
//   Box 2 – nadstawka at 1900 mm
//     Main box: shelf at 300 mm, 3 drawers above, shelf above drawers,
//       partition in the middle (height to top plate), 2 shelves left + 2 right
//     Nadstawka: empty
//
//   Box 3 – nadstawka at 1900 mm
//     Main box: partition at 630 mm from left;
//       left of partition: shelf at 300 mm, rod, shelf at 1570 mm
//     Nadstawka: empty
// ---------------------------------------------------------------------------

// ── Niche and cabinet input dimensions ───────────────────────────────────────
const NICHE_WIDTH_MM = 3020;
const NICHE_HEIGHT_MM = 2570;
const CABINET_DEPTH_MM = 600;
const LEFT_BLEND_MM = 0;
const RIGHT_BLEND_MM = 50;
const BOTTOM_BLEND_MM = 100;

// ── Box dimensions ───────────────────────────────────────────────────────────
// effectiveWidth = 3020 - 0 - 50 = 2970
// available interior = 2970 - 3×36 (side panels) - 18 (left masking) = 2844
// each box = 2844 / 3 = 948
const BOX_WIDTH_MM = 948;

const BOX1_SHELVES = 4;
const BOX2_SHELVES = 6;
const BOX3_SHELVES = 2;
const BOX2_DRAWERS = 3;

// Box 1 nadstawka shelf widths: right of partition (948 - 600 - 18 = 330 mm)
const BOX1_SHELF_WIDTH_MM = 330;
// Box 2 partition in the middle: each side = (948 - 18) / 2 = 465 mm
const BOX2_HALF_WIDTH_MM = 465;
// Box 3 partition at 630 mm from left: shelves on the left = 630 mm
const BOX3_LEFT_WIDTH_MM = 630;

// Box 1 nadstawka partition: nadstawka sideHeight (1370) - 2×18 (plates) = 1334
const BOX1_PARTITION_HEIGHT_MM = 1334;
// Box 2 partition: from shelf-above-drawers to main box top plate (estimated)
const BOX2_PARTITION_HEIGHT_MM = 946;
// Box 3 partition: full main box interior = 1900 - 2×18 = 1864
const BOX3_PARTITION_HEIGHT_MM = 1864;

// ── Derived expected values ──────────────────────────────────────────────────
const EFFECTIVE_WIDTH_MM = NICHE_WIDTH_MM - LEFT_BLEND_MM - RIGHT_BLEND_MM; // 2970
const EFFECTIVE_HEIGHT_MM = NICHE_HEIGHT_MM - BOTTOM_BLEND_MM; // 2470

const LEGS_PER_BOX = 4;
const TOTAL_LEGS = LEGS_PER_BOX * 3; // 12

// all boxes have double doors → 2 handles each → 6 total
const TOTAL_HANDLES = 6;

// 3 drawers in box 2 → 3 guide sets, 3 bracket sets
const TOTAL_GUIDES = BOX2_DRAWERS;
const TOTAL_BRACKETS = BOX2_DRAWERS;

// panel depth: cabinetDepth - door(18) - clearance(2) - HDF back(3) = 577
const PANEL_DEPTH_MM = CABINET_DEPTH_MM - 18 - 2 - 3; // 577

// door height: effectiveHeight - top clearance(2) - bottom clearance(2) = 2466
const DOOR_HEIGHT_MM = EFFECTIVE_HEIGHT_MM - 2 - 2; // 2466

// hinges per panel: min(5, max(2, ceil(2466/520))) = 5; doubled for double doors
const HINGES_PER_PANEL = Math.min(5, Math.max(2, Math.ceil(DOOR_HEIGHT_MM / 520))); // 5
const HINGES_PER_BOX = HINGES_PER_PANEL * 2; // 10 (double doors)

// double door panel width: floor((948+36)/2) - 4 = 488
const DOOR_PANEL_WIDTH_MM = Math.floor((BOX_WIDTH_MM + 2 * 18) / 2) - 2 - 2; // 488

// HDF width: boxWidth + 32 = 980 (same for all boxes)
const HDF_WIDTH_MM = BOX_WIDTH_MM + 32; // 980

// HDF heights per section (height - 4 mm clearance)
const BOX1_MAIN_HDF_HEIGHT_MM = 1100 - 4; // 1096
const BOX1_NAD_HDF_HEIGHT_MM = EFFECTIVE_HEIGHT_MM - 1100 - 4; // 1366
const BOX2_MAIN_HDF_HEIGHT_MM = 1900 - 4; // 1896
const BOX2_NAD_HDF_HEIGHT_MM = EFFECTIVE_HEIGHT_MM - 1900 - 4; // 566

// panel section side heights
const BOX1_MAIN_SIDE_HEIGHT_MM = 1100;
const BOX1_NAD_SIDE_HEIGHT_MM = EFFECTIVE_HEIGHT_MM - 1100; // 1370
const BOX2_MAIN_SIDE_HEIGHT_MM = 1900;
const BOX2_NAD_SIDE_HEIGHT_MM = EFFECTIVE_HEIGHT_MM - 1900; // 570

// drawer front width (double door): boxWidth - 2×separator(40) - clearance(8) = 860
const BOX2_DRAWER_FRONT_WIDTH_MM = BOX_WIDTH_MM - 2 * 40 - 8; // 860

// partition depth: cabinetDepth - 23 = 577
const PARTITION_DEPTH_MM = CABINET_DEPTH_MM - 23; // 577

// maskownica lewa: height = nicheHeight - 2, width = 100 (not full cover)
const MASKING_HEIGHT_MM = NICHE_HEIGHT_MM - 2; // 2568
const MASKING_WIDTH_MM = 100;

// ── Box form data ────────────────────────────────────────────────────────────
const boxes: BoxForm[] = [
  {
    width: BOX_WIDTH_MM,
    doubleDoor: true,
    shelves: BOX1_SHELVES,
    shelvesMm: [BOX1_SHELF_WIDTH_MM, BOX1_SHELF_WIDTH_MM, BOX1_SHELF_WIDTH_MM, BOX1_SHELF_WIDTH_MM],
    rods: 2,
    drawers: 0,
    partitions: [BOX1_PARTITION_HEIGHT_MM],
    nadstawkaMm: [1100],
  },
  {
    width: BOX_WIDTH_MM,
    doubleDoor: true,
    shelves: BOX2_SHELVES,
    shelvesMm: [BOX_WIDTH_MM, BOX_WIDTH_MM, BOX2_HALF_WIDTH_MM, BOX2_HALF_WIDTH_MM, BOX2_HALF_WIDTH_MM, BOX2_HALF_WIDTH_MM],
    rods: 0,
    drawers: BOX2_DRAWERS,
    partitions: [BOX2_PARTITION_HEIGHT_MM],
    nadstawkaMm: [1900],
  },
  {
    width: BOX_WIDTH_MM,
    doubleDoor: true,
    shelves: BOX3_SHELVES,
    shelvesMm: [BOX3_LEFT_WIDTH_MM, BOX3_LEFT_WIDTH_MM],
    rods: 1,
    drawers: 0,
    partitions: [BOX3_PARTITION_HEIGHT_MM],
    nadstawkaMm: [1900],
  },
];

const params = buildParameters({
  boxes,
  numberOfBoxes: 3,
  nicheWidthMm: NICHE_WIDTH_MM,
  nicheHeightMm: NICHE_HEIGHT_MM,
  cabinetDepthMm: CABINET_DEPTH_MM,
  hasNiches: false,
  leftBlendMm: LEFT_BLEND_MM,
  rightBlendMm: RIGHT_BLEND_MM,
  topBlendMm: 0,
  bottomBlendMm: BOTTOM_BLEND_MM,
  leftNicheHeightMm: 0,
  rightNicheHeightMm: 0,
  topNicheWidthMm: 0,
  bottomNicheWidthMm: 0,
  outerMaskingLeft: true,
  outerMaskingRight: false,
  outerMaskingLeftFullCover: false,
  outerMaskingRightFullCover: false,
});

const result = runReport(params);

// ---------------------------------------------------------------------------

describe('E2E pipeline – 3-box wardrobe with nadstawki and partitions', () => {
  it('report generates without error', () => {
    expect(result.mainText).not.toMatch(/Błąd podczas generowania raportu/);
    expect(result.elementsData.boxes).toHaveLength(3);
  });

  // ── Legs ──────────────────────────────────────────────────────────────────
  describe('legs', () => {
    it(`4 legs per box → ${TOTAL_LEGS} total`, () => {
      expect(result.hardwareSummary.totalLegs).toBe(TOTAL_LEGS);
    });
  });

  // ── Hinges ────────────────────────────────────────────────────────────────
  describe('hinges', () => {
    it(`all boxes have double doors → ${HINGES_PER_BOX} hinges each`, () => {
      for (const box of result.elementsData.boxes) {
        expect(box.door?.doubleDoor).toBe(true);
        expect(box.door?.hinges).toBe(HINGES_PER_BOX);
      }
    });
  });

  // ── Handles ───────────────────────────────────────────────────────────────
  describe('handles', () => {
    it(`all double-door → 2 handles per box → ${TOTAL_HANDLES} total`, () => {
      expect(result.hardwareSummary.totalHandles).toBe(TOTAL_HANDLES);
    });
  });

  // ── Drawer guides ─────────────────────────────────────────────────────────
  describe('drawer guides & brackets', () => {
    it(`${BOX2_DRAWERS} drawers in box 2 → ${TOTAL_GUIDES} guide sets and ${TOTAL_BRACKETS} bracket sets`, () => {
      expect(result.hardwareSummary.totalGuides).toBe(TOTAL_GUIDES);
      expect(result.hardwareSummary.totalBrackets).toBe(TOTAL_BRACKETS);
    });
  });

  // ── Shelves ───────────────────────────────────────────────────────────────
  describe('shelves', () => {
    it(`box 1 has ${BOX1_SHELVES} shelves (nadstawka right, ${BOX1_SHELF_WIDTH_MM} mm each)`, () => {
      const box1 = result.elementsData.boxes[0]!;
      const totalQty = box1.shelves?.groups.reduce((s, g) => s + g.qty, 0) ?? 0;
      expect(totalQty).toBe(BOX1_SHELVES);
      expect(box1.shelves?.groups).toContainEqual({ widthMm: BOX1_SHELF_WIDTH_MM, qty: 4 });
    });

    it(`box 2 has ${BOX2_SHELVES} shelves (2 full-width + 4 half-width)`, () => {
      const box2 = result.elementsData.boxes[1]!;
      const totalQty = box2.shelves?.groups.reduce((s, g) => s + g.qty, 0) ?? 0;
      expect(totalQty).toBe(BOX2_SHELVES);
      expect(box2.shelves?.groups).toContainEqual({ widthMm: BOX_WIDTH_MM, qty: 2 });
      expect(box2.shelves?.groups).toContainEqual({ widthMm: BOX2_HALF_WIDTH_MM, qty: 4 });
    });

    it(`box 3 has ${BOX3_SHELVES} shelves (left of partition, ${BOX3_LEFT_WIDTH_MM} mm each)`, () => {
      const box3 = result.elementsData.boxes[2]!;
      const totalQty = box3.shelves?.groups.reduce((s, g) => s + g.qty, 0) ?? 0;
      expect(totalQty).toBe(BOX3_SHELVES);
      expect(box3.shelves?.groups).toContainEqual({ widthMm: BOX3_LEFT_WIDTH_MM, qty: 2 });
    });

    it('shelf depth is positive and less than cabinet depth', () => {
      for (const box of result.elementsData.boxes) {
        if (box.shelves) {
          expect(box.shelves.depthMm).toBeGreaterThan(0);
          expect(box.shelves.depthMm).toBeLessThan(CABINET_DEPTH_MM);
        }
      }
    });
  });

  // ── Rods ──────────────────────────────────────────────────────────────────
  describe('rods', () => {
    it('box 1 has 2 rods (main + nadstawka left)', () => {
      expect(result.elementsData.boxes[0]!.rods).toBe(2);
    });

    it('box 2 has no rods', () => {
      expect(result.elementsData.boxes[1]!.rods).toBeUndefined();
    });

    it('box 3 has 1 rod (left of partition)', () => {
      expect(result.elementsData.boxes[2]!.rods).toBe(1);
    });
  });

  // ── Partitions ────────────────────────────────────────────────────────────
  describe('partitions', () => {
    it('every box has exactly 1 partition', () => {
      for (const box of result.elementsData.boxes) {
        expect(box.partitions).toHaveLength(1);
      }
    });

    it(`partition depth = cabinetDepth - 23 = ${PARTITION_DEPTH_MM} mm`, () => {
      for (const box of result.elementsData.boxes) {
        expect(box.partitions![0]!.depthMm).toBe(PARTITION_DEPTH_MM);
      }
    });

    it('partition heights match input data', () => {
      expect(result.elementsData.boxes[0]!.partitions![0]!.heightMm).toBe(BOX1_PARTITION_HEIGHT_MM);
      expect(result.elementsData.boxes[1]!.partitions![0]!.heightMm).toBe(BOX2_PARTITION_HEIGHT_MM);
      expect(result.elementsData.boxes[2]!.partitions![0]!.heightMm).toBe(BOX3_PARTITION_HEIGHT_MM);
    });
  });

  // ── Drawer boards ─────────────────────────────────────────────────────────
  describe('drawer boards', () => {
    it(`box 2 has drawerBoards defined (${BOX2_DRAWERS} drawers)`, () => {
      const box2 = result.elementsData.boxes[1]!;
      expect(box2.drawerBoards).toBeDefined();
      expect(box2.drawerBoards?.count).toBe(BOX2_DRAWERS);
    });

    it(`box 2 drawer front width = ${BOX2_DRAWER_FRONT_WIDTH_MM} mm`, () => {
      const box2 = result.elementsData.boxes[1]!;
      expect(box2.drawerBoards?.frontPanel.widthMm).toBe(BOX2_DRAWER_FRONT_WIDTH_MM);
    });

    it('box 2 HDF bottom dimensions are positive', () => {
      const box2 = result.elementsData.boxes[1]!;
      expect(box2.drawerBoards?.hdfBottom.depthMm).toBeGreaterThan(0);
      expect(box2.drawerBoards?.hdfBottom.widthMm).toBeGreaterThan(0);
    });

    it('box 1 and box 3 have no drawerBoards', () => {
      expect(result.elementsData.boxes[0]!.drawerBoards).toBeUndefined();
      expect(result.elementsData.boxes[2]!.drawerBoards).toBeUndefined();
    });
  });

  // ── Box panels (nadstawka sections) ───────────────────────────────────────
  describe('box panels (with nadstawka sections)', () => {
    it('box 1 has 2 panel sections (main + nadstawka)', () => {
      const box1 = result.elementsData.boxes[0]!;
      expect(box1.panels).toHaveLength(2);
      expect(box1.panels![0]!.sideHeightMm).toBe(BOX1_MAIN_SIDE_HEIGHT_MM);
      expect(box1.panels![0]!.isNadstawka).toBe(false);
      expect(box1.panels![1]!.sideHeightMm).toBe(BOX1_NAD_SIDE_HEIGHT_MM);
      expect(box1.panels![1]!.isNadstawka).toBe(true);
    });

    it('box 2 and box 3 have 2 panel sections (main + nadstawka)', () => {
      for (const idx of [1, 2]) {
        const box = result.elementsData.boxes[idx]!;
        expect(box.panels).toHaveLength(2);
        expect(box.panels![0]!.sideHeightMm).toBe(BOX2_MAIN_SIDE_HEIGHT_MM);
        expect(box.panels![0]!.isNadstawka).toBe(false);
        expect(box.panels![1]!.sideHeightMm).toBe(BOX2_NAD_SIDE_HEIGHT_MM);
        expect(box.panels![1]!.isNadstawka).toBe(true);
      }
    });

    it(`panel depth = ${PANEL_DEPTH_MM} mm for all sections`, () => {
      for (const box of result.elementsData.boxes) {
        for (const panel of box.panels!) {
          expect(panel.depthMm).toBe(PANEL_DEPTH_MM);
        }
      }
    });
  });

  // ── HDF back panels ───────────────────────────────────────────────────────
  describe('HDF back panels', () => {
    it('every box has 2 HDF sections (main + nadstawka)', () => {
      for (const box of result.elementsData.boxes) {
        expect(box.hdf).toHaveLength(2);
      }
    });

    it(`all HDF widths = ${HDF_WIDTH_MM} mm`, () => {
      for (const box of result.elementsData.boxes) {
        for (const hdf of box.hdf!) {
          expect(hdf.widthMm).toBe(HDF_WIDTH_MM);
        }
      }
    });

    it('box 1 HDF section heights match nadstawka split', () => {
      const box1 = result.elementsData.boxes[0]!;
      expect(box1.hdf![0]!.heightMm).toBe(BOX1_MAIN_HDF_HEIGHT_MM);
      expect(box1.hdf![1]!.heightMm).toBe(BOX1_NAD_HDF_HEIGHT_MM);
    });

    it('box 2 and box 3 HDF section heights match nadstawka split', () => {
      for (const idx of [1, 2]) {
        const box = result.elementsData.boxes[idx]!;
        expect(box.hdf![0]!.heightMm).toBe(BOX2_MAIN_HDF_HEIGHT_MM);
        expect(box.hdf![1]!.heightMm).toBe(BOX2_NAD_HDF_HEIGHT_MM);
      }
    });
  });

  // ── Door dimensions ───────────────────────────────────────────────────────
  describe('door dimensions', () => {
    it(`door height = ${DOOR_HEIGHT_MM} mm for all boxes`, () => {
      for (const box of result.elementsData.boxes) {
        expect(box.door?.heightMm).toBe(DOOR_HEIGHT_MM);
      }
    });

    it(`double door panel width = ${DOOR_PANEL_WIDTH_MM} mm for all boxes`, () => {
      for (const box of result.elementsData.boxes) {
        expect(box.door?.doubleDoor).toBe(true);
        expect(box.door?.widthMm).toBe(DOOR_PANEL_WIDTH_MM);
      }
    });
  });

  // ── Maskownica ────────────────────────────────────────────────────────────
  describe('outer masking (maskownica)', () => {
    it('left masking is present with correct dimensions', () => {
      expect(result.elementsData.maskings).not.toBeNull();
      expect(result.elementsData.maskings?.left).toBeDefined();
      expect(result.elementsData.maskings?.left?.heightMm).toBe(MASKING_HEIGHT_MM);
      expect(result.elementsData.maskings?.left?.widthMm).toBe(MASKING_WIDTH_MM);
    });

    it('right masking is absent', () => {
      expect(result.elementsData.maskings?.right).toBeUndefined();
    });
  });

  // ── Parameters summary ────────────────────────────────────────────────────
  describe('parameters summary', () => {
    it(`effective width = ${EFFECTIVE_WIDTH_MM} mm`, () => {
      const row = result.parametersData.groups
        .flatMap((g) => g.rows)
        .find((r) => r.label === 'Szerokość efektywna');
      expect(row?.value).toBe(`${EFFECTIVE_WIDTH_MM} mm`);
    });

    it(`effective height = nicheHeight - bottomBlend = ${EFFECTIVE_HEIGHT_MM} mm`, () => {
      const row = result.parametersData.groups
        .flatMap((g) => g.rows)
        .find((r) => r.label === 'Wysokość efektywna');
      expect(row?.value).toBe(`${EFFECTIVE_HEIGHT_MM} mm`);
    });

    it('bottom blend = 100 mm in parameters', () => {
      const row = result.parametersData.groups
        .flatMap((g) => g.rows)
        .find((r) => r.label === 'Dolna');
      expect(row?.value).toBe('100 mm');
    });
  });
});
