import { useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface Step2Data {
  numberOfBoxes: number;
}

export function useStep2Firestore(
  projectId: string | null,
  setNumberOfBoxes: (n: number) => void
) {
  useEffect(() => {
    if (!projectId) return;

    const load = async () => {
      const ref = doc(db, 'projects', projectId, 'steps', 'step2');
      const snap = await getDoc(ref);
      if (!snap.exists()) return;
      const data = snap.data() as Step2Data;
      setNumberOfBoxes(data.numberOfBoxes);
    };

    load();
  }, [projectId]);

  const saveStep2 = async (data: Step2Data) => {
    if (!projectId) return;
    const ref = doc(db, 'projects', projectId, 'steps', 'step2');
    await setDoc(ref, data);
  };

  return { saveStep2 };
}
