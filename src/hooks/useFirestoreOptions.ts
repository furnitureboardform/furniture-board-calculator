import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { FinishType } from '../lib/types';
import type { FinishOption } from '../lib/finishOptions';
import type { HandleOption } from '../lib/handleOptions';

const VALID_FINISH_TYPES = new Set<string>(['laminat', 'okleina', 'akryl', 'lakier']);

function toFinishType(raw: unknown): FinishType {
  if (typeof raw === 'string' && VALID_FINISH_TYPES.has(raw)) {
    return raw as FinishType;
  }
  return 'laminat';
}

export function useFirestoreOptions() {
  const [finishes, setFinishes] = useState<FinishOption[]>([]);
  const [handles, setHandles] = useState<HandleOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [finishSnap, handleSnap] = await Promise.all([
        getDocs(query(collection(db, 'finishes'), orderBy('createdAt'))),
        getDocs(query(collection(db, 'handles'), orderBy('createdAt'))),
      ]);

      const loadedFinishes: FinishOption[] = finishSnap.docs.map((d) => {
        const data = d.data();
        return {
          id: (data.id as string) ?? d.id,
          label: (data.label as string) ?? '',
          brand: (data.brand as string) ?? '',
          type: toFinishType(data.type),
          pricePerSqmPln: (data.pricePerSqmPln as number) ?? 0,
          imageUrl: (data.imageBase64 as string) || undefined,
        };
      });

      const loadedHandles: HandleOption[] = handleSnap.docs.map((d) => {
        const data = d.data();
        return {
          id: (data.id as string) ?? d.id,
          label: (data.label as string) ?? '',
          brand: (data.brand as string) ?? '',
          pricePln: (data.pricePln as number) ?? 0,
          imageUrl: (data.imageBase64 as string) || undefined,
          isEdge: (data.isEdge as boolean) ?? false,
          edgeWidthMm: (data.edgeWidthMm as number) ?? 0,
        };
      });

      setFinishes(loadedFinishes);
      setHandles(loadedHandles);
      setLoading(false);
    }

    load();
  }, []);

  const finishesMap = new Map(finishes.map((f) => [f.id, f]));
  const handlesMap = new Map(handles.map((h) => [h.id, h]));

  return { finishes, handles, finishesMap, handlesMap, loading };
}
