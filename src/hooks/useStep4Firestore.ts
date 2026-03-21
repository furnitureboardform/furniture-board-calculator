import { useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { BoardFinish, DoorHandleSelection } from '../lib/types';

interface Step4Data {
  boardFinish: BoardFinish;
  doorHandle: DoorHandleSelection;
  transportCostPln: number;
  customElementsCostPln: number;
  discountPln: number;
  discountPercent: number;
  clientPriceAfterDiscount?: number;
}

interface UseStep4FirestoreParams {
  projectId: string | null;
  setBoardFinish: (finish: BoardFinish) => void;
  setDoorHandle: (handle: DoorHandleSelection) => void;
  setTransportCostPln: (value: number) => void;
  setCustomElementsCostPln: (value: number) => void;
  setDiscountPln: (value: number) => void;
  setDiscountPercent: (value: number) => void;
}

export function useStep4Firestore({
  projectId,
  setBoardFinish,
  setDoorHandle,
  setTransportCostPln,
  setCustomElementsCostPln,
  setDiscountPln,
  setDiscountPercent,
}: UseStep4FirestoreParams) {
  useEffect(() => {
    if (!projectId) return;

    const load = async () => {
      const ref = doc(db, 'projects', projectId, 'steps', 'step4');
      const snap = await getDoc(ref);
      if (!snap.exists()) return;
      const data = snap.data() as Step4Data;
      setBoardFinish(data.boardFinish);
      setDoorHandle(data.doorHandle);
      if (data.transportCostPln != null) setTransportCostPln(data.transportCostPln);
      if (data.customElementsCostPln != null) setCustomElementsCostPln(data.customElementsCostPln);
      if (data.discountPln != null) setDiscountPln(data.discountPln);
      if (data.discountPercent != null) setDiscountPercent(data.discountPercent);
    };

    load();
  }, [projectId]);

  const saveStep4 = async (
    boardFinish: BoardFinish,
    doorHandle: DoorHandleSelection,
    transportCostPln: number,
    customElementsCostPln: number,
    discountPln: number,
    discountPercent: number,
    clientPriceAfterDiscount?: number,
  ) => {
    if (!projectId) return;
    const stepRef = doc(db, 'projects', projectId, 'steps', 'step4');
    const stepData: Step4Data = { boardFinish, doorHandle, transportCostPln, customElementsCostPln, discountPln, discountPercent };
    if (clientPriceAfterDiscount != null) {
      stepData.clientPriceAfterDiscount = clientPriceAfterDiscount;
    }
    await setDoc(stepRef, stepData);
    if (clientPriceAfterDiscount != null) {
      const projectRef = doc(db, 'projects', projectId);
      await updateDoc(projectRef, { clientPriceAfterDiscount });
    }
  };

  return { saveStep4 };
}
