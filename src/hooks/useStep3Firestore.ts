import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { BoxForm } from '../lib/types';
import type { PositionedItem } from '../components/WardrobeSchematic/types';

interface Step3Data {
  boxes: BoxForm[];
  placedItems: Record<string, PositionedItem[]>;
}

interface UseStep3FirestoreParams {
  projectId: string | null;
  onLoaded: (boxes: BoxForm[], placedItems: Record<number, PositionedItem[]>) => void;
}

export function useStep3Firestore({ projectId, onLoaded }: UseStep3FirestoreParams) {
  const [step3Ready, setStep3Ready] = useState(false);

  useEffect(() => {
    setStep3Ready(false);
    if (!projectId) return;

    const load = async () => {
      const ref = doc(db, 'projects', projectId, 'steps', 'step3');
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data() as Step3Data;
        const numericPlacedItems: Record<number, PositionedItem[]> = {};
        Object.entries(data.placedItems ?? {}).forEach(([k, v]) => {
          numericPlacedItems[Number(k)] = v;
        });
        onLoaded(data.boxes, numericPlacedItems);
      }
      setStep3Ready(true);
    };

    load();
  }, [projectId]);

  const saveStep3 = async (boxes: BoxForm[], placedItems: Record<number, PositionedItem[]>) => {
    if (!projectId) return;
    const stringPlacedItems: Record<string, PositionedItem[]> = {};
    Object.entries(placedItems).forEach(([k, v]) => {
      stringPlacedItems[k] = v;
    });
    const ref = doc(db, 'projects', projectId, 'steps', 'step3');
    await setDoc(ref, { boxes, placedItems: stringPlacedItems });
  };

  return { saveStep3, step3Ready };
}
