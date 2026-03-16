import { useMemo } from 'react';
import { getBoxValidation } from '../utils/validation';

interface UseBoxValidationArgs {
  numberOfBoxes: number;
  boxes: { width: number }[];
  nicheWidthMm: number;
  hasNiches: boolean;
  hasSideNiches: boolean;
  leftBlendMm: number;
  rightBlendMm: number;
  effectiveWardrobeWidthMm: number;
  availableInteriorWidth: number;
  outerMaskingLeft: boolean;
  outerMaskingRight: boolean;
}

export function useBoxValidation({
  numberOfBoxes,
  boxes,
  nicheWidthMm,
  hasNiches,
  hasSideNiches,
  leftBlendMm,
  rightBlendMm,
  effectiveWardrobeWidthMm,
  availableInteriorWidth,
  outerMaskingLeft,
  outerMaskingRight,
}: UseBoxValidationArgs) {
  return useMemo(
    () =>
      getBoxValidation({
        numberOfBoxes,
        boxes,
        nicheWidthMm,
        hasNiches,
        hasSideNiches,
        leftBlendMm,
        rightBlendMm,
        effectiveWardrobeWidthMm,
        availableInteriorWidth,
        outerMaskingLeft,
        outerMaskingRight,
      }),
    [
      numberOfBoxes,
      boxes,
      nicheWidthMm,
      hasNiches,
      hasSideNiches,
      leftBlendMm,
      rightBlendMm,
      effectiveWardrobeWidthMm,
      availableInteriorWidth,
      outerMaskingLeft,
      outerMaskingRight,
    ]
  );
}
