import { useState, useEffect, useMemo, useCallback } from 'react';
import type { BoxForm, NicheFieldName, BoardFinish } from '../lib/types';
import {
  SIDE_PANEL_THICKNESS_MM,
  OUTER_MASKING_SIDE_MM,
  SPLIT_EQUALLY_STORAGE_KEY,
  defaultBox,
  getStoredSplitEqually,
  getEvenSplitWidths,
} from '../constants';

const INITIAL_BOXES: BoxForm[] = [
  { ...defaultBox(), width: 952, shelves: 4, rods: 1 },
  { ...defaultBox(), width: 952, shelves: 2, rods: 0 },
  { ...defaultBox(), width: 952, shelves: 2, rods: 0 },
];

export function useFormState() {
  const [step, setStep] = useState(1);

  const [nicheWidthMm, setNicheWidthMm] = useState(3070);
  const [nicheHeightMm, setNicheHeightMm] = useState(2700);
  const [cabinetDepthMm, setCabinetDepthMm] = useState(600);
  const [hasSideNiches, setHasSideNiches] = useState(false);
  const [hasTopBottomNiches, setHasTopBottomNiches] = useState(false);
  const [leftBlendMm, setLeftBlendMm] = useState(0);
  const [rightBlendMm, setRightBlendMm] = useState(0);
  const [topBlendMm, setTopBlendMm] = useState(0);
  const [bottomBlendMm, setBottomBlendMm] = useState(100);
  const [leftNicheHeightMm, setLeftNicheHeightMm] = useState(0);
  const [rightNicheHeightMm, setRightNicheHeightMm] = useState(0);
  const [topNicheWidthMm, setTopNicheWidthMm] = useState(0);
  const [bottomNicheWidthMm, setBottomNicheWidthMm] = useState(0);

  const [numberOfBoxes, setNumberOfBoxes] = useState(3);
  const [boxes, setBoxes] = useState<BoxForm[]>(INITIAL_BOXES);
  const [splitEqually, setSplitEquallyState] = useState(getStoredSplitEqually);
  const [outerMaskingLeft, setOuterMaskingLeft] = useState(true);
  const [outerMaskingRight, setOuterMaskingRight] = useState(true);
  const [outerMaskingLeftFullCover, setOuterMaskingLeftFullCover] = useState(false);
  const [outerMaskingRightFullCover, setOuterMaskingRightFullCover] = useState(false);
  const [boardFinish, setBoardFinish] = useState<BoardFinish>({ type: 'kolor', optionId: 'U156' });

  useEffect(() => {
    localStorage.setItem(SPLIT_EQUALLY_STORAGE_KEY, String(splitEqually));
  }, [splitEqually]);

  useEffect(() => {
    if (hasSideNiches) {
      const autoHeight = Math.max(0, nicheHeightMm - 2);
      setLeftNicheHeightMm(outerMaskingLeft ? 0 : autoHeight);
      setRightNicheHeightMm(outerMaskingRight ? 0 : autoHeight);
    }
  }, [nicheHeightMm, hasSideNiches, outerMaskingLeft, outerMaskingRight]);

  useEffect(() => {
    if (hasTopBottomNiches) {
      const maskingDeduction =
        (outerMaskingLeft ? OUTER_MASKING_SIDE_MM : 0) +
        (outerMaskingRight ? OUTER_MASKING_SIDE_MM : 0);
      const sideNichesDeduction = hasSideNiches ? leftBlendMm + rightBlendMm : 0;
      const autoWidth = Math.max(0, nicheWidthMm - maskingDeduction - sideNichesDeduction - 2);
      setTopNicheWidthMm(autoWidth);
    }
  }, [hasTopBottomNiches, nicheWidthMm, outerMaskingLeft, outerMaskingRight, hasSideNiches, leftBlendMm, rightBlendMm]);

  useEffect(() => {
    const maskingDeduction =
      (outerMaskingLeft ? OUTER_MASKING_SIDE_MM : 0) +
      (outerMaskingRight ? OUTER_MASKING_SIDE_MM : 0);
    const sideNichesDeduction = hasSideNiches ? leftBlendMm + rightBlendMm : 0;
    const autoWidth = Math.max(0, nicheWidthMm - maskingDeduction - sideNichesDeduction - 2);
    setBottomNicheWidthMm(autoWidth);
  }, [nicheWidthMm, outerMaskingLeft, outerMaskingRight, hasSideNiches, leftBlendMm, rightBlendMm]);

  const effectiveWardrobeWidthMm = useMemo(() => {
    const left = hasSideNiches ? leftBlendMm : 0;
    const right = hasSideNiches ? rightBlendMm : 0;
    return (nicheWidthMm || 0) - left - right;
  }, [nicheWidthMm, hasSideNiches, leftBlendMm, rightBlendMm]);

  const availableInteriorWidth = useMemo(() => {
    const n = Math.max(1, numberOfBoxes);
    const outerMaskingDeduction =
      (outerMaskingLeft ? OUTER_MASKING_SIDE_MM : 0) +
      (outerMaskingRight ? OUTER_MASKING_SIDE_MM : 0);
    return (
      effectiveWardrobeWidthMm -
      n * (2 * SIDE_PANEL_THICKNESS_MM) -
      outerMaskingDeduction
    );
  }, [effectiveWardrobeWidthMm, numberOfBoxes, outerMaskingLeft, outerMaskingRight]);

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

  const onHasSideNichesChange = useCallback(
    (checked: boolean) => {
      setHasSideNiches(checked);
      if (checked) {
        const autoHeight = Math.max(0, nicheHeightMm - 2);
        setLeftNicheHeightMm(outerMaskingLeft ? 0 : autoHeight);
        setRightNicheHeightMm(outerMaskingRight ? 0 : autoHeight);
      } else {
        setLeftBlendMm(0);
        setRightBlendMm(0);
        setLeftNicheHeightMm(0);
        setRightNicheHeightMm(0);
      }
    },
    [nicheHeightMm, outerMaskingLeft, outerMaskingRight]
  );

  const onHasTopBottomNichesChange = useCallback(
    (checked: boolean) => {
      setHasTopBottomNiches(checked);
      if (checked) {
        const maskingDeduction =
          (outerMaskingLeft ? OUTER_MASKING_SIDE_MM : 0) +
          (outerMaskingRight ? OUTER_MASKING_SIDE_MM : 0);
        const sideNichesDeduction = hasSideNiches ? leftBlendMm + rightBlendMm : 0;
        const autoWidth = Math.max(0, nicheWidthMm - maskingDeduction - sideNichesDeduction - 2);
        setTopNicheWidthMm(autoWidth);
      } else {
        setTopBlendMm(0);
        setTopNicheWidthMm(0);
      }
    },
    [nicheWidthMm, outerMaskingLeft, outerMaskingRight, hasSideNiches, leftBlendMm, rightBlendMm]
  );

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
    (index: number, field: keyof BoxForm, value: number | string | boolean) => {
      setBoxes((prev) => {
        const next = [...prev];
        const current = next[index];
        if (!current) return prev;
        next[index] = { ...current, [field]: value };
        return next;
      });
    },
    []
  );

  return {
    step,
    setStep,
    outerMaskingLeft,
    setOuterMaskingLeft,
    outerMaskingRight,
    setOuterMaskingRight,
    outerMaskingLeftFullCover,
    setOuterMaskingLeftFullCover,
    outerMaskingRightFullCover,
    setOuterMaskingRightFullCover,
    nicheWidthMm,
    nicheHeightMm,
    cabinetDepthMm,
    hasSideNiches,
    hasTopBottomNiches,
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
    onHasSideNichesChange,
    onHasTopBottomNichesChange,
    onNumberOfBoxesChange,
    onBoxChange,
    boardFinish,
    setBoardFinish,
  };
}
