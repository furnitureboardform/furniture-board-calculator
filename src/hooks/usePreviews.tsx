import { useMemo, type ReactNode } from 'react';
import {
  DOOR_THICKNESS_MM,
  DOOR_CLEARANCE_FROM_CABINET_MM,
  BACK_BOARD_THICKNESS_MM,
} from '../constants';

interface UsePreviewsArgs {
  nicheWidthMm: number;
  nicheHeightMm: number;
  cabinetDepthMm: number;
  hasSideNiches: boolean;
  hasTopBottomNiches: boolean;
  leftBlendMm: number;
  rightBlendMm: number;
  topBlendMm: number;
  bottomBlendMm: number;
  numberOfBoxes: number;
  boxes: { width: number; shelves: number }[];
}

export function usePreviews({
  nicheWidthMm,
  nicheHeightMm,
  cabinetDepthMm,
  hasSideNiches,
  hasTopBottomNiches,
  leftBlendMm,
  rightBlendMm,
  topBlendMm,
  bottomBlendMm,
  numberOfBoxes,
  boxes,
}: UsePreviewsArgs): {
  wardrobePreview: ReactNode;
  shelvesPreview: string | null;
} {
  const wardrobePreview = useMemo<ReactNode>(() => {
    if (!nicheWidthMm || !nicheHeightMm) return null;
    const left = hasSideNiches ? leftBlendMm : 0;
    const right = hasSideNiches ? rightBlendMm : 0;
    const top = hasTopBottomNiches ? topBlendMm : 0;
    const bottom = hasTopBottomNiches ? bottomBlendMm : 0;
    const w = nicheWidthMm - left - right;
    const h = nicheHeightMm - top - bottom;
    return (
      <>
        <strong>Szafa po blendach (podgląd)</strong>
        <br />
        Szerokość: {w} mm ({nicheWidthMm} - {left} - {right})
        <br />
        Wysokość: {h} mm ({nicheHeightMm} - {top} - {bottom})
      </>
    );
  }, [
    nicheWidthMm,
    nicheHeightMm,
    hasSideNiches,
    hasTopBottomNiches,
    leftBlendMm,
    rightBlendMm,
    topBlendMm,
    bottomBlendMm,
  ]);

  const shelfDepthMm =
    (cabinetDepthMm || 0) -
    DOOR_THICKNESS_MM -
    DOOR_CLEARANCE_FROM_CABINET_MM -
    BACK_BOARD_THICKNESS_MM;

  const shelvesPreview = useMemo<string | null>(() => {
    if (numberOfBoxes <= 0 || !cabinetDepthMm) return null;
    let totalShelves = 0;
    const lines: string[] = [];
    boxes.forEach((box, i) => {
      totalShelves += box.shelves || 0;
      if ((box.shelves || 0) > 0) {
        lines.push(
          `Box ${i + 1}: ${box.shelves} szt. (${box.width || 0} × ${shelfDepthMm} mm)`
        );
      }
    });
    const details = lines.length > 0 ? `<br>${lines.join('<br>')}` : '';
    return (
      `<strong>Półki (podgląd)</strong><br>` +
      `Głębokość półki: ${shelfDepthMm} mm (${cabinetDepthMm} - ${DOOR_THICKNESS_MM} - ${DOOR_CLEARANCE_FROM_CABINET_MM} - ${BACK_BOARD_THICKNESS_MM})<br>` +
      `Łącznie półek: ${totalShelves} szt.` +
      details
    );
  }, [numberOfBoxes, cabinetDepthMm, boxes, shelfDepthMm]);

  return { wardrobePreview, shelvesPreview };
}
