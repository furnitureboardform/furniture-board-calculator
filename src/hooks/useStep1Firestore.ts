import { useEffect, useRef } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { NicheFieldName } from '../lib/types';

interface Step1Data {
  nicheWidthMm: number;
  nicheHeightMm: number;
  cabinetDepthMm: number;
  hasSideNiches: boolean;
  hasTopBottomNiches: boolean;
  leftBlendMm: number;
  rightBlendMm: number;
  topBlendMm: number;
  bottomBlendMm: number;
  outerMaskingLeft: boolean;
  outerMaskingRight: boolean;
  outerMaskingLeftFullCover: boolean;
  outerMaskingRightFullCover: boolean;
}

interface Step1Setters {
  onNicheChange: (field: NicheFieldName, value: string) => void;
  onHasSideNichesChange: (v: boolean) => void;
  onHasTopBottomNichesChange: (v: boolean) => void;
  setOuterMaskingLeft: (v: boolean) => void;
  setOuterMaskingRight: (v: boolean) => void;
  setOuterMaskingLeftFullCover: (v: boolean) => void;
  setOuterMaskingRightFullCover: (v: boolean) => void;
}

export function useStep1Firestore(projectId: string | null, setters: Step1Setters) {
  const settingsRef = useRef(setters);
  settingsRef.current = setters;

  useEffect(() => {
    if (!projectId) return;

    const load = async () => {
      const ref = doc(db, 'projects', projectId, 'steps', 'step1');
      const snap = await getDoc(ref);
      if (!snap.exists()) return;

      const data = snap.data() as Step1Data;
      const s = settingsRef.current;

      s.setOuterMaskingLeft(data.outerMaskingLeft);
      s.setOuterMaskingRight(data.outerMaskingRight);
      s.setOuterMaskingLeftFullCover(data.outerMaskingLeftFullCover);
      s.setOuterMaskingRightFullCover(data.outerMaskingRightFullCover);
      s.onHasSideNichesChange(data.hasSideNiches);
      s.onHasTopBottomNichesChange(data.hasTopBottomNiches);
      s.onNicheChange('nicheWidthMm', String(data.nicheWidthMm));
      s.onNicheChange('nicheHeightMm', String(data.nicheHeightMm));
      s.onNicheChange('cabinetDepthMm', String(data.cabinetDepthMm));
      s.onNicheChange('leftBlendMm', String(data.leftBlendMm));
      s.onNicheChange('rightBlendMm', String(data.rightBlendMm));
      s.onNicheChange('topBlendMm', String(data.topBlendMm));
      s.onNicheChange('bottomBlendMm', String(data.bottomBlendMm));
    };

    load();
  }, [projectId]);

  const saveStep1 = async (data: Step1Data) => {
    if (!projectId) return;
    const ref = doc(db, 'projects', projectId, 'steps', 'step1');
    await setDoc(ref, data);
  };

  return { saveStep1 };
}
