import { useMemo } from 'react';
import { getBoxValidation } from '../utils/validation';

interface UseBoxValidationArgs {
  numberOfBoxes: number;
  boxes: { width: number }[];
  nicheWidthMm: number;
  hasNiches: boolean;
  leftBlendMm: number;
  rightBlendMm: number;
  effectiveWardrobeWidthMm: number;
  availableInteriorWidth: number;
  outerMaskingEnabled: boolean;
}

export function useBoxValidation({
  numberOfBoxes,
  boxes,
  nicheWidthMm,
  hasNiches,
  leftBlendMm,
  rightBlendMm,
  effectiveWardrobeWidthMm,
  availableInteriorWidth,
  outerMaskingEnabled,
}: UseBoxValidationArgs) {
  return useMemo(
    () =>
      getBoxValidation({
        numberOfBoxes,
        boxes,
        nicheWidthMm,
        hasNiches,
        leftBlendMm,
        rightBlendMm,
        effectiveWardrobeWidthMm,
        availableInteriorWidth,
        outerMaskingEnabled,
      }),
    [
      numberOfBoxes,
      boxes,
      nicheWidthMm,
      hasNiches,
      leftBlendMm,
      rightBlendMm,
      effectiveWardrobeWidthMm,
      availableInteriorWidth,
      outerMaskingEnabled,
    ]
  );
}
