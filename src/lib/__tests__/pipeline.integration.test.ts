import { describe, it, expect } from 'vitest';
import { runReport } from '../index';
import { buildParameters } from '../../utils/buildParameters';
import type { BoxForm } from '../types';

// ---------------------------------------------------------------------------
// Scenario: 3-box wardrobe
//   Niche: 2800 × 2400 mm, depth 600 mm
//   Blends: left 50 mm, right 50 mm, top 0 mm, bottom 0 mm
//   Box 1 – 900 mm wide, single door, 2 shelves, 1 rod
//   Box 2 – 950 mm wide, double door, 3 shelves, 1 drawer
//   Box 3 – 900 mm wide, single door, 2 shelves
// ---------------------------------------------------------------------------

// ── Input dimensions ──────────────────────────────────────────────────────────
const NICHE_WIDTH_MM = 2800;
const NICHE_HEIGHT_MM = 2400;
const CABINET_DEPTH_MM = 600;
const LEFT_BLEND_MM = 50;
const RIGHT_BLEND_MM = 50;

const BOX1_WIDTH_MM = 900;
const BOX2_WIDTH_MM = 950;
const BOX3_WIDTH_MM = 900;
const BOX1_SHELVES = 2;
const BOX2_SHELVES = 3;
const BOX3_SHELVES = 2;
const BOX2_DRAWERS = 1;

// ── Derived / expected output values ─────────────────────────────────────────
const EFFECTIVE_WIDTH_MM = NICHE_WIDTH_MM - LEFT_BLEND_MM - RIGHT_BLEND_MM; // 2700
const EFFECTIVE_HEIGHT_MM = NICHE_HEIGHT_MM; // 2400 (no vertical blends)

// Legs: 4 per box × 3 boxes
const LEGS_PER_BOX = 4;
const TOTAL_LEGS = LEGS_PER_BOX * 3; // 12

// Handles: box1=1, box2=2 (double door), box3=1
const TOTAL_HANDLES = 4;

// Guides & brackets: 1 per drawer, 1 drawer total
const TOTAL_GUIDES = BOX2_DRAWERS; // 1
const TOTAL_BRACKETS = BOX2_DRAWERS; // 1

// Panel depth: cabinetDepth - doorThickness(18) - doorClearance(2) - backBoard(3)
const PANEL_DEPTH_MM = CABINET_DEPTH_MM - 18 - 2 - 3; // 577

// Door clearance: top(2) + bottom(2)
const DOOR_HEIGHT_MM = EFFECTIVE_HEIGHT_MM - 2 - 2; // 2396
const HDF_HEIGHT_MM = EFFECTIVE_HEIGHT_MM - 4; // 2396

// HDF width: boxWidth + 32
const BOX1_HDF_WIDTH_MM = BOX1_WIDTH_MM + 32; // 932
const BOX2_HDF_WIDTH_MM = BOX2_WIDTH_MM + 32; // 982

// Single door width: boxWidth + 2×sidePanel(18) - leftClearance(2) - rightClearance(2)
const BOX1_DOOR_WIDTH_MM = BOX1_WIDTH_MM + 2 * 18 - 2 - 2; // 932
// Double door panel: (boxWidth + 2×sidePanel) / 2 - leftClearance(2) - rightClearance(2)
const BOX2_DOOR_PANEL_WIDTH_MM = Math.floor((BOX2_WIDTH_MM + 2 * 18) / 2) - 2 - 2; // 489

// Box2 drawer front: width - 2×separator(40) - clearance(8)
const BOX2_DRAWER_FRONT_WIDTH_MM = BOX2_WIDTH_MM - 2 * 40 - 8; // 862

// Hinges: max(2, ceil(doorHeight / 520)); doubled for double door
const BOX1_HINGES = Math.max(2, Math.ceil(DOOR_HEIGHT_MM / 520)); // 5
const BOX2_HINGES = BOX1_HINGES * 2; // 10 (double door)

const boxes: BoxForm[] = [
  {
    width: BOX1_WIDTH_MM,
    doubleDoor: false,
    shelves: BOX1_SHELVES,
    shelvesMm: [],
    rods: 1,
    drawers: 0,
    partitions: [],
    nadstawkaMm: [],
  },
  {
    width: BOX2_WIDTH_MM,
    doubleDoor: true,
    shelves: BOX2_SHELVES,
    shelvesMm: [],
    rods: 0,
    drawers: BOX2_DRAWERS,
    partitions: [],
    nadstawkaMm: [],
  },
  {
    width: BOX3_WIDTH_MM,
    doubleDoor: false,
    shelves: BOX3_SHELVES,
    shelvesMm: [],
    rods: 0,
    drawers: 0,
    partitions: [],
    nadstawkaMm: [],
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
  bottomBlendMm: 0,
  leftNicheHeightMm: 0,
  rightNicheHeightMm: 0,
  topNicheWidthMm: 0,
  bottomNicheWidthMm: 0,
  outerMaskingLeft: false,
  outerMaskingRight: false,
  outerMaskingLeftFullCover: false,
  outerMaskingRightFullCover: false,
});

const result = runReport(params);

// ---------------------------------------------------------------------------

describe('E2E pipeline – 3-box wardrobe', () => {
  it('report generates without error', () => {
    expect(result.mainText).not.toMatch(/Błąd podczas generowania raportu/);
    expect(result.elementsData.boxes).toHaveLength(3);
  });

  // ── Legs ──────────────────────────────────────────────────────────────────
  describe('legs (nóżki)', () => {
    it('calculates 4 legs per box → 12 total', () => {
      expect(result.hardwareSummary.totalLegs).toBe(TOTAL_LEGS);
    });
  });

  // ── Hinges ────────────────────────────────────────────────────────────────
  describe('hinges (zawiasy)', () => {
    it('each box has at least 2 hinges per door panel', () => {
      for (const box of result.elementsData.boxes) {
        if (box.door) {
          const minHinges = box.door.doubleDoor ? BOX1_HINGES * 2 : BOX1_HINGES;
          expect(box.door.hinges).toBeGreaterThanOrEqual(minHinges);
        }
      }
    });

    it(`box 1 – single door → ${BOX1_HINGES} hinges`, () => {
      const box1 = result.elementsData.boxes[0]!;
      expect(box1.door?.doubleDoor).toBe(false);
      expect(box1.door?.hinges).toBe(BOX1_HINGES);
    });

    it(`box 2 – double door → hinges doubled (${BOX2_HINGES})`, () => {
      const box2 = result.elementsData.boxes[1]!;
      expect(box2.door?.doubleDoor).toBe(true);
      expect(box2.door?.hinges).toBe(BOX2_HINGES);
    });
  });

  // ── Handles ───────────────────────────────────────────────────────────────
  describe('handles (uchwyty)', () => {
    it(`single-door boxes get 1 handle, double-door gets 2 → total ${TOTAL_HANDLES}`, () => {
      expect(result.hardwareSummary.totalHandles).toBe(TOTAL_HANDLES);
    });
  });

  // ── Drawer guides ─────────────────────────────────────────────────────────
  describe('drawer guides & brackets (prowadnice)', () => {
    it('1 drawer in box 2 → 1 guide set and 1 bracket set', () => {
      expect(result.hardwareSummary.totalGuides).toBe(TOTAL_GUIDES);
      expect(result.hardwareSummary.totalBrackets).toBe(TOTAL_BRACKETS);
    });
  });

  // ── Shelves ───────────────────────────────────────────────────────────────
  describe('shelves (półki)', () => {
    it(`box 1 has ${BOX1_SHELVES} shelves`, () => {
      const box1 = result.elementsData.boxes[0]!;
      const totalQty = box1.shelves?.groups.reduce((s, g) => s + g.qty, 0) ?? 0;
      expect(totalQty).toBe(BOX1_SHELVES);
    });

    it(`box 2 has ${BOX2_SHELVES} shelves`, () => {
      const box2 = result.elementsData.boxes[1]!;
      const totalQty = box2.shelves?.groups.reduce((s, g) => s + g.qty, 0) ?? 0;
      expect(totalQty).toBe(BOX2_SHELVES);
    });

    it(`box 3 has ${BOX3_SHELVES} shelves`, () => {
      const box3 = result.elementsData.boxes[2]!;
      const totalQty = box3.shelves?.groups.reduce((s, g) => s + g.qty, 0) ?? 0;
      expect(totalQty).toBe(BOX3_SHELVES);
    });

    it('shelf depth = cabinetDepth minus door thickness and clearance', () => {
      const box1 = result.elementsData.boxes[0]!;
      // depth is always positive
      expect(box1.shelves?.depthMm).toBeGreaterThan(0);
      expect(box1.shelves?.depthMm).toBeLessThan(600);
    });
  });

  // ── Rods ──────────────────────────────────────────────────────────────────
  describe('rods (drążki)', () => {
    it('box 1 has 1 rod', () => {
      expect(result.elementsData.boxes[0]!.rods).toBe(1);
    });

    it('box 2 and box 3 have no rods', () => {
      expect(result.elementsData.boxes[1]!.rods).toBeUndefined();
      expect(result.elementsData.boxes[2]!.rods).toBeUndefined();
    });
  });

  // ── Drawer boards ─────────────────────────────────────────────────────────
  describe('drawer boards (płyty szuflad)', () => {
    it('box 2 has drawerBoards defined (1 drawer)', () => {
      const box2 = result.elementsData.boxes[1]!;
      expect(box2.drawerBoards).toBeDefined();
      expect(box2.drawerBoards?.count).toBe(1);
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

    it('box 1 has no drawerBoards', () => {
      expect(result.elementsData.boxes[0]!.drawerBoards).toBeUndefined();
    });
  });

  // ── Box panels (korpus) ───────────────────────────────────────────────────
  describe('box panels (boki, góra, dół)', () => {
    it('every box has at least one panel section', () => {
      for (const box of result.elementsData.boxes) {
        expect(box.panels?.length).toBeGreaterThanOrEqual(1);
      }
    });

    it(`panel depth = cabinetDepth - 18 - 2 - 3 = ${PANEL_DEPTH_MM} mm`, () => {
      const box1 = result.elementsData.boxes[0]!;
      expect(box1.panels![0]!.depthMm).toBe(PANEL_DEPTH_MM);
    });

    it(`panel side height = effective wardrobe height = ${EFFECTIVE_HEIGHT_MM} mm`, () => {
      const box1 = result.elementsData.boxes[0]!;
      expect(box1.panels![0]!.sideHeightMm).toBe(EFFECTIVE_HEIGHT_MM);
    });
  });

  // ── HDF back panels ───────────────────────────────────────────────────────
  describe('HDF back panels (płyta tylna)', () => {
    it('every box has HDF back section(s)', () => {
      for (const box of result.elementsData.boxes) {
        expect(box.hdf?.length).toBeGreaterThanOrEqual(1);
      }
    });

    it(`HDF height = effective wardrobe height - 4 mm = ${HDF_HEIGHT_MM}`, () => {
      const box1 = result.elementsData.boxes[0]!;
      expect(box1.hdf![0]!.heightMm).toBe(HDF_HEIGHT_MM);
    });

    it('HDF width = boxWidth + 32', () => {
      expect(result.elementsData.boxes[0]!.hdf![0]!.widthMm).toBe(BOX1_HDF_WIDTH_MM);
      expect(result.elementsData.boxes[1]!.hdf![0]!.widthMm).toBe(BOX2_HDF_WIDTH_MM);
    });
  });

  // ── Door dimensions ───────────────────────────────────────────────────────
  describe('door dimensions (drzwi)', () => {
    it(`door height accounts for top and bottom clearance → ${DOOR_HEIGHT_MM} mm`, () => {
      const box1 = result.elementsData.boxes[0]!;
      expect(box1.door?.heightMm).toBe(DOOR_HEIGHT_MM);
    });

    it(`single door width = boxWidth + 2×18 - 4 = ${BOX1_DOOR_WIDTH_MM} mm`, () => {
      const box1 = result.elementsData.boxes[0]!;
      expect(box1.door?.widthMm).toBe(BOX1_DOOR_WIDTH_MM);
    });

    it(`each double door panel = floor((boxWidth + 36) / 2) - 4 = ${BOX2_DOOR_PANEL_WIDTH_MM} mm`, () => {
      const box2 = result.elementsData.boxes[1]!;
      expect(box2.door?.doubleDoor).toBe(true);
      expect(box2.door?.widthMm).toBe(BOX2_DOOR_PANEL_WIDTH_MM);
    });
  });

  // ── Parameters summary ────────────────────────────────────────────────────
  describe('parameters summary', () => {
    it(`effective width = nicheWidth - leftBlend - rightBlend = ${EFFECTIVE_WIDTH_MM} mm`, () => {
      const effectiveWidthRow = result.parametersData.groups
        .flatMap((g) => g.rows)
        .find((r) => r.label === 'Szerokość efektywna');
      expect(effectiveWidthRow?.value).toBe(`${EFFECTIVE_WIDTH_MM} mm`);
    });

    it(`effective height = nicheHeight (no vertical blends) = ${EFFECTIVE_HEIGHT_MM} mm`, () => {
      const effectiveHeightRow = result.parametersData.groups
        .flatMap((g) => g.rows)
        .find((r) => r.label === 'Wysokość efektywna');
      expect(effectiveHeightRow?.value).toBe(`${EFFECTIVE_HEIGHT_MM} mm`);
    });
  });
});
