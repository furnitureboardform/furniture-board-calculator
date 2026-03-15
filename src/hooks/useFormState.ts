import { useState, useEffect, useMemo, useCallback } from 'react';
import type { BoxForm, NicheFieldName } from '../lib/types';
import {
  SIDE_PANEL_THICKNESS_MM,
  OUTER_MASKING_SIDE_MM,
  SPLIT_EQUALLY_STORAGE_KEY,
  defaultBox,
  getStoredSplitEqually,
  getEvenSplitWidths,
} from '../constants';

const INITIAL_BOXES: BoxForm[] = [
  { ...defaultBox(), width: 952, shelves: 4, rods: 1, drawers: 0 },
  { ...defaultBox(), width: 952, shelves: 2, rods: 0, drawers: 2 },
  { ...defaultBox(), width: 952, shelves: 2, rods: 0, drawers: 2 },
];

export function useFormState() {
  const [step, setStep] = useState(1);

  const [nicheWidthMm, setNicheWidthMm] = useState(3070);
  const [nicheHeightMm, setNicheHeightMm] = useState(2700);
  const [cabinetDepthMm, setCabinetDepthMm] = useState(600);
  const [hasNiches, setHasNiches] = useState(false);
  const [leftBlendMm, setLeftBlendMm] = useState(0);
  const [rightBlendMm, setRightBlendMm] = useState(0);
  const [topBlendMm, setTopBlendMm] = useState(0);
  const [bottomBlendMm, setBottomBlendMm] = useState(0);
  const [leftNicheHeightMm, setLeftNicheHeightMm] = useState(0);
  const [rightNicheHeightMm, setRightNicheHeightMm] = useState(0);
  const [topNicheWidthMm, setTopNicheWidthMm] = useState(0);
  const [bottomNicheWidthMm, setBottomNicheWidthMm] = useState(0);

  const [numberOfBoxes, setNumberOfBoxes] = useState(3);
  const [boxes, setBoxes] = useState<BoxForm[]>(INITIAL_BOXES);
  const [splitEqually, setSplitEquallyState] = useState(getStoredSplitEqually);
  /** Maskownice zewnętrzne – gdy true, od dostępnej szerokości odejmowane jest 2×OUTER_MASKING_SIDE_MM */
  const [outerMaskingEnabled, setOuterMaskingEnabled] = useState(true);

  useEffect(() => {
    localStorage.setItem(SPLIT_EQUALLY_STORAGE_KEY, String(splitEqually));
  }, [splitEqually]);

  const effectiveWardrobeWidthMm = useMemo(() => {
    const left = hasNiches ? leftBlendMm : 0;
    const right = hasNiches ? rightBlendMm : 0;
    return (nicheWidthMm || 0) - left - right;
  }, [nicheWidthMm, hasNiches, leftBlendMm, rightBlendMm]);

  const availableInteriorWidth = useMemo(() => {
    const n = Math.max(1, numberOfBoxes);
    const outerMaskingDeduction = outerMaskingEnabled
      ? 2 * OUTER_MASKING_SIDE_MM
      : 0;
    return (
      effectiveWardrobeWidthMm -
      n * (2 * SIDE_PANEL_THICKNESS_MM) -
      outerMaskingDeduction
    );
  }, [effectiveWardrobeWidthMm, numberOfBoxes, outerMaskingEnabled]);

  useEffect(() => {
    setBoxes((prev) => {
      const n = Math.max(1, Math.min(20, numberOfBoxes));
      if (prev.length === n) return prev;
      const evenWidths = getEvenSplitWidths(availableInteriorWidth, n);
      const next: BoxForm[] = [];
      for (let i = 0; i < n; i++) {
        next.push(
          prev[i]
            ? { ...prev[i], width: splitEqually ? evenWidths[i]! : prev[i]!.width }
            : { ...defaultBox(), width: splitEqually ? evenWidths[i]! : 964 }
        );
      }
      return next;
    });
  }, [numberOfBoxes]);

  useEffect(() => {
    if (!splitEqually) return;
    const n = Math.max(1, Math.min(20, numberOfBoxes));
    const evenWidths = getEvenSplitWidths(availableInteriorWidth, n);
    setBoxes((prev) => {
      const next: BoxForm[] = [];
      for (let i = 0; i < n; i++) {
        next.push({
          ...(prev[i] ?? defaultBox()),
          width: evenWidths[i]!,
        });
      }
      return next;
    });
  }, [splitEqually, availableInteriorWidth, numberOfBoxes]);

  const setSplitEqually = useCallback((v: boolean) => setSplitEquallyState(v), []);

  const onNicheChange = useCallback((field: NicheFieldName, value: string) => {
    const num = parseInt(value, 10);
    const val = isNaN(num) ? 0 : num;
    const setters: Record<NicheFieldName, (n: number) => void> = {
      nicheWidthMm: setNicheWidthMm,
      nicheHeightMm: setNicheHeightMm,
      cabinetDepthMm: setCabinetDepthMm,
      leftBlendMm: setLeftBlendMm,
      rightBlendMm: setRightBlendMm,
      topBlendMm: setTopBlendMm,
      bottomBlendMm: setBottomBlendMm,
      leftNicheHeightMm: setLeftNicheHeightMm,
      rightNicheHeightMm: setRightNicheHeightMm,
      topNicheWidthMm: setTopNicheWidthMm,
      bottomNicheWidthMm: setBottomNicheWidthMm,
    };
    setters[field]?.(val);
  }, []);

  const onHasNichesChange = useCallback((checked: boolean) => {
    setHasNiches(checked);
    if (!checked) {
      setLeftBlendMm(0);
      setRightBlendMm(0);
      setTopBlendMm(0);
      setBottomBlendMm(0);
      setLeftNicheHeightMm(0);
      setRightNicheHeightMm(0);
      setTopNicheWidthMm(0);
      setBottomNicheWidthMm(0);
    }
  }, []);

  const onNumberOfBoxesChange = useCallback(
    (n: number) => {
      const clamped = Math.max(1, Math.min(20, n));
      setNumberOfBoxes(clamped);
      setBoxes((prev) => {
        if (prev.length === clamped) return prev;
        const evenWidths = getEvenSplitWidths(availableInteriorWidth, clamped);
        const next: BoxForm[] = [];
        for (let i = 0; i < clamped; i++) {
          next.push(
            prev[i]
              ? {
                  ...prev[i],
                  width: splitEqually ? evenWidths[i]! : prev[i]!.width,
                }
              : { ...defaultBox(), width: splitEqually ? evenWidths[i]! : 964 }
          );
        }
        return next;
      });
    },
    [availableInteriorWidth, splitEqually]
  );

  const onBoxChange = useCallback(
    (index: number, field: keyof BoxForm, value: number | string) => {
      setBoxes((prev) => {
        const next = [...prev];
        const current = next[index];
        if (!current) return prev;
        if (field === 'doorType') {
          next[index] = { ...current, doorType: value as 'left' | 'right' };
        } else {
          next[index] = { ...current, [field]: value as number };
        }
        return next;
      });
    },
    []
  );

  return {
    step,
    setStep,
    outerMaskingEnabled,
    setOuterMaskingEnabled,
    nicheWidthMm,
    nicheHeightMm,
    cabinetDepthMm,
    hasNiches,
    leftBlendMm,
    rightBlendMm,
    topBlendMm,
    bottomBlendMm,
    leftNicheHeightMm,
    rightNicheHeightMm,
    topNicheWidthMm,
    bottomNicheWidthMm,
    numberOfBoxes,
    boxes,
    splitEqually,
    setSplitEqually,
    effectiveWardrobeWidthMm,
    availableInteriorWidth,
    onNicheChange,
    onHasNichesChange,
    onNumberOfBoxesChange,
    onBoxChange,
  };
}
