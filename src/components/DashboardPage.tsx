import { useState, useEffect } from 'react';
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  setDoc,
  updateDoc,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { FinishType } from '../lib/types';

function resizeAndConvertToBase64(file: File, maxPx = 400, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas not available')); return; }
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Image load failed')); };
    img.src = objectUrl;
  });
}

const FINISH_TYPES: readonly { value: FinishType; label: string }[] = [
  { value: 'laminat', label: 'Laminat' },
  { value: 'akryl', label: 'Akryl' },
  { value: 'lakier', label: 'Lakier' },
];

interface FirestoreFinish {
  docId: string;
  id: string;
  label: string;
  brand: string;
  type: FinishType;
  pricePerSqmPln: number;
  imageBase64: string;
}

interface FirestoreHandle {
  docId: string;
  id: string;
  label: string;
  brand: string;
  pricePln: number;
  imageBase64: string;
  isEdge: boolean;
  edgeWidthMm: number | null;
}

interface DashboardPageProps {
  readonly onBack: () => void;
}

interface FinishFormState {
  label: string;
  brand: string;
  type: FinishType;
  pricePerSqmPln: number;
  imageBase64: string;
}

interface HandleFormState {
  label: string;
  brand: string;
  pricePln: number;
  imageBase64: string;
  isEdge: boolean;
  edgeWidthMm: number | null;
}

const emptyFinishForm = (): FinishFormState => ({
  label: '',
  brand: '',
  type: 'laminat',
  pricePerSqmPln: 0,
  imageBase64: '',
});

const emptyHandleForm = (): HandleFormState => ({
  label: '',
  brand: '',
  pricePln: 0,
  imageBase64: '',
  isEdge: false,
  edgeWidthMm: null,
});

export function DashboardPage({ onBack }: DashboardPageProps) {
  const [finishes, setFinishes] = useState<FirestoreFinish[]>([]);
  const [handles, setHandles] = useState<FirestoreHandle[]>([]);
  const [loadingFinishes, setLoadingFinishes] = useState(true);
  const [loadingHandles, setLoadingHandles] = useState(true);

  const [showFinishForm, setShowFinishForm] = useState(false);
  const [finishForm, setFinishForm] = useState(emptyFinishForm());
  const [savingFinish, setSavingFinish] = useState(false);
  const [editingFinishDocId, setEditingFinishDocId] = useState<string | null>(null);
  const [editFinishForm, setEditFinishForm] = useState(emptyFinishForm());
  const [savingEditFinish, setSavingEditFinish] = useState(false);

  const [showHandleForm, setShowHandleForm] = useState(false);
  const [handleForm, setHandleForm] = useState(emptyHandleForm());
  const [savingHandle, setSavingHandle] = useState(false);
  const [editingHandleDocId, setEditingHandleDocId] = useState<string | null>(null);
  const [editHandleForm, setEditHandleForm] = useState(emptyHandleForm());
  const [savingEditHandle, setSavingEditHandle] = useState(false);

  const [confirmDeleteFinish, setConfirmDeleteFinish] = useState<string | null>(null);
  const [confirmDeleteHandle, setConfirmDeleteHandle] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'finishes'), orderBy('createdAt', 'desc'));
    getDocs(q).then((snapshot) => {
      setFinishes(
        snapshot.docs.map((d) => ({
          docId: d.id,
          id: d.data().id as string,
          label: d.data().label as string,
          brand: d.data().brand as string,
          type: ((d.data().type as string | undefined) ?? 'laminat') as FinishType,
          pricePerSqmPln: d.data().pricePerSqmPln as number,
          imageBase64: (d.data().imageBase64 as string | undefined) ?? '',
        }))
      );
      setLoadingFinishes(false);
    });
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'handles'), orderBy('createdAt', 'desc'));
    getDocs(q).then((snapshot) => {
      setHandles(
        snapshot.docs.map((d) => ({
          docId: d.id,
          id: d.data().id as string,
          label: d.data().label as string,
          brand: d.data().brand as string,
          pricePln: d.data().pricePln as number,
          imageBase64: (d.data().imageBase64 as string | undefined) ?? '',
          isEdge: d.data().isEdge as boolean,
          edgeWidthMm: d.data().edgeWidthMm as number | null,
        }))
      );
      setLoadingHandles(false);
    });
  }, []);

  const handleAddFinish = async () => {
    if (!finishForm.label.trim()) return;
    setSavingFinish(true);
    const docRef = doc(collection(db, 'finishes'));
    await setDoc(docRef, {
      id: docRef.id,
      label: finishForm.label.trim(),
      brand: finishForm.brand.trim(),
      type: finishForm.type,
      pricePerSqmPln: Number(finishForm.pricePerSqmPln),
      imageBase64: finishForm.imageBase64,
      createdAt: serverTimestamp(),
    });
    setFinishes((prev) => [{
      docId: docRef.id,
      id: docRef.id,
      label: finishForm.label.trim(),
      brand: finishForm.brand.trim(),
      type: finishForm.type,
      pricePerSqmPln: Number(finishForm.pricePerSqmPln),
      imageBase64: finishForm.imageBase64,
    }, ...prev]);
    setFinishForm(emptyFinishForm());
    setShowFinishForm(false);
    setSavingFinish(false);
  };

  const handleAddHandle = async () => {
    if (!handleForm.label.trim()) return;
    setSavingHandle(true);
    const docRef = doc(collection(db, 'handles'));
    const edgeWidthMm = handleForm.isEdge ? (handleForm.edgeWidthMm !== null ? Number(handleForm.edgeWidthMm) : null) : null;
    await setDoc(docRef, {
      id: docRef.id,
      label: handleForm.label.trim(),
      brand: handleForm.brand.trim(),
      pricePln: Number(handleForm.pricePln),
      imageBase64: handleForm.imageBase64,
      isEdge: handleForm.isEdge,
      edgeWidthMm,
      createdAt: serverTimestamp(),
    });
    setHandles((prev) => [
      {
        docId: docRef.id,
        id: docRef.id,
        label: handleForm.label.trim(),
        brand: handleForm.brand.trim(),
        pricePln: Number(handleForm.pricePln),
        imageBase64: handleForm.imageBase64,
        isEdge: handleForm.isEdge,
        edgeWidthMm,
      },
      ...prev,
    ]);
    setHandleForm(emptyHandleForm());
    setShowHandleForm(false);
    setSavingHandle(false);
  };

  const handleDeleteFinish = async (docId: string) => {
    setDeleting(true);
    await deleteDoc(doc(db, 'finishes', docId));
    setFinishes((prev) => prev.filter((f) => f.docId !== docId));
    setDeleting(false);
    setConfirmDeleteFinish(null);
  };

  const handleUpdateFinish = async () => {
    if (!editingFinishDocId || !editFinishForm.label.trim()) return;
    setSavingEditFinish(true);
    await updateDoc(doc(db, 'finishes', editingFinishDocId), {
      label: editFinishForm.label.trim(),
      brand: editFinishForm.brand.trim(),
      type: editFinishForm.type,
      pricePerSqmPln: Number(editFinishForm.pricePerSqmPln),
      ...(editFinishForm.imageBase64 ? { imageBase64: editFinishForm.imageBase64 } : {}),
    });
    setFinishes((prev) => prev.map((f) =>
      f.docId === editingFinishDocId
        ? { ...f, label: editFinishForm.label.trim(), brand: editFinishForm.brand.trim(), type: editFinishForm.type, pricePerSqmPln: Number(editFinishForm.pricePerSqmPln), ...(editFinishForm.imageBase64 ? { imageBase64: editFinishForm.imageBase64 } : {}) }
        : f
    ));
    setSavingEditFinish(false);
    setEditingFinishDocId(null);
  };

  const handleDeleteHandle = async (docId: string) => {
    setDeleting(true);
    await deleteDoc(doc(db, 'handles', docId));
    setHandles((prev) => prev.filter((h) => h.docId !== docId));
    setDeleting(false);
    setConfirmDeleteHandle(null);
  };

  const handleUpdateHandle = async () => {
    if (!editingHandleDocId || !editHandleForm.label.trim()) return;
    setSavingEditHandle(true);
    const edgeWidthMm = editHandleForm.isEdge ? (editHandleForm.edgeWidthMm !== null ? Number(editHandleForm.edgeWidthMm) : null) : null;
    await updateDoc(doc(db, 'handles', editingHandleDocId), {
      label: editHandleForm.label.trim(),
      brand: editHandleForm.brand.trim(),
      pricePln: Number(editHandleForm.pricePln),
      isEdge: editHandleForm.isEdge,
      edgeWidthMm,
      ...(editHandleForm.imageBase64 ? { imageBase64: editHandleForm.imageBase64 } : {}),
    });
    setHandles((prev) => prev.map((h) =>
      h.docId === editingHandleDocId
        ? { ...h, label: editHandleForm.label.trim(), brand: editHandleForm.brand.trim(), pricePln: Number(editHandleForm.pricePln), isEdge: editHandleForm.isEdge, edgeWidthMm, ...(editHandleForm.imageBase64 ? { imageBase64: editHandleForm.imageBase64 } : {}) }
        : h
    ));
    setSavingEditHandle(false);
    setEditingHandleDocId(null);
  };

  return (
    <div style={styles.page}>
      <div style={styles.topBar}>
        <button onClick={onBack} style={styles.backBtn}>← Powrót do projektów</button>
        <h1 style={styles.heading}>Dashboard</h1>
      </div>

      {(confirmDeleteFinish !== null || confirmDeleteHandle !== null) && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <p style={styles.modalText}>Czy na pewno chcesz usunąć ten element?</p>
            <div style={styles.modalButtons}>
              <button
                onClick={() => {
                  if (confirmDeleteFinish) handleDeleteFinish(confirmDeleteFinish);
                  if (confirmDeleteHandle) handleDeleteHandle(confirmDeleteHandle);
                }}
                disabled={deleting}
                style={styles.deleteConfirmBtn}
              >
                {deleting ? 'Usuwanie…' : 'Usuń'}
              </button>
              <button
                onClick={() => { setConfirmDeleteFinish(null); setConfirmDeleteHandle(null); }}
                disabled={deleting}
                style={styles.cancelBtn}
              >
                Anuluj
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={styles.sectionsWrapper}>
        {/* Finishes section */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Okleiny</h2>
            {!showFinishForm && (
              <button onClick={() => setShowFinishForm(true)} style={styles.addBtn}>+ Dodaj okleinę</button>
            )}
          </div>

          {showFinishForm && (
            <div style={styles.form}>
              <div style={styles.formRow}>
                <label style={styles.label}>Etykieta</label>
                <input
                  style={styles.input}
                  value={finishForm.label}
                  onChange={(e) => setFinishForm((f) => ({ ...f, label: e.target.value }))}
                  placeholder="np. U156 Beż piaskowy"
                />
              </div>
              <div style={styles.formRow}>
                <label style={styles.label}>Typ</label>
                <select
                  style={styles.input}
                  value={finishForm.type}
                  onChange={(e) => setFinishForm((f) => ({ ...f, type: e.target.value as FinishType }))}
                >
                  {FINISH_TYPES.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div style={styles.formRow}>
                <label style={styles.label}>Marka</label>
                <input
                  style={styles.input}
                  value={finishForm.brand}
                  onChange={(e) => setFinishForm((f) => ({ ...f, brand: e.target.value }))}
                  placeholder="np. Egger"
                />
              </div>
              <div style={styles.formRow}>
                <label style={styles.label}>Cena (zł/m²)</label>
                <input
                  style={styles.input}
                  type="number"
                  min={0}
                  step={0.01}
                  value={finishForm.pricePerSqmPln}
                  onChange={(e) => setFinishForm((f) => ({ ...f, pricePerSqmPln: Number(e.target.value) }))}
                />
              </div>
              <div style={styles.formRow}>
                <label style={styles.label}>Zdjęcie</label>
                <div style={styles.fileInputWrapper}>
                  <input
                    type="file"
                    accept="image/*"
                    style={styles.fileInput}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const base64 = await resizeAndConvertToBase64(file);
                      setFinishForm((f) => ({ ...f, imageBase64: base64 }));
                    }}
                  />
                  {finishForm.imageBase64 && (
                    <img src={finishForm.imageBase64} alt="podgląd" style={styles.previewThumb} />
                  )}
                </div>
              </div>
              <div style={styles.formActions}>
                <button
                  onClick={handleAddFinish}
                  disabled={savingFinish || !finishForm.label.trim()}
                  style={styles.confirmBtn}
                >
                  {savingFinish ? 'Zapisywanie…' : 'Zapisz'}
                </button>
                <button
                  onClick={() => {
                    setShowFinishForm(false);
                    setFinishForm(emptyFinishForm());
                  }}
                  style={styles.cancelBtn}
                >
                  Anuluj
                </button>
              </div>
            </div>
          )}

          {loadingFinishes ? (
            <p style={styles.hint}>Ładowanie…</p>
          ) : finishes.length === 0 ? (
            <p style={styles.hint}>Brak oklein. Dodaj pierwszą.</p>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Zdjęcie</th>
                    <th style={styles.th}>Etykieta</th>
                    <th style={styles.th}>Typ</th>
                    <th style={styles.th}>Marka</th>
                    <th style={styles.th}>Cena zł/m²</th>
                    <th style={styles.th}></th>
                  </tr>
                </thead>
                <tbody>
                  {finishes.map((f) => (
                    <>
                    <tr key={f.id} style={styles.tr}>
                      <td style={styles.td}>
                        {f.imageBase64 ? (
                          <img src={f.imageBase64} alt={f.label} style={styles.thumb} />
                        ) : (
                          <span style={styles.noThumb}>—</span>
                        )}
                      </td>
                      <td style={styles.td}>{f.label}</td>
                      <td style={styles.td}>{FINISH_TYPES.find((t) => t.value === f.type)?.label ?? f.type}</td>
                      <td style={styles.td}>{f.brand}</td>
                      <td style={styles.td}>{f.pricePerSqmPln.toFixed(2)}</td>
                      <td style={styles.td}>
                        <button
                          style={styles.editRowBtn}
                          onClick={() => {
                            setEditingFinishDocId(f.docId);
                            setEditFinishForm({ label: f.label, brand: f.brand, type: f.type, pricePerSqmPln: f.pricePerSqmPln, imageBase64: '' });
                          }}
                          title="Edytuj"
                        >
                          ✏️
                        </button>
                        <button
                          style={styles.deleteRowBtn}
                          onClick={() => setConfirmDeleteFinish(f.docId)}
                          title="Usuń"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                    {editingFinishDocId === f.docId && (
                      <tr key={f.id + '_edit'}>
                        <td colSpan={6} style={styles.editTd}>
                          <div style={styles.form}>
                            <div style={styles.formRow}>
                              <label style={styles.label}>Etykieta</label>
                              <input style={styles.input} value={editFinishForm.label} onChange={(e) => setEditFinishForm((x) => ({ ...x, label: e.target.value }))} />
                            </div>
                            <div style={styles.formRow}>
                              <label style={styles.label}>Typ</label>
                              <select style={styles.input} value={editFinishForm.type} onChange={(e) => setEditFinishForm((x) => ({ ...x, type: e.target.value as FinishType }))}>
                                {FINISH_TYPES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                              </select>
                            </div>
                            <div style={styles.formRow}>
                              <label style={styles.label}>Marka</label>
                              <input style={styles.input} value={editFinishForm.brand} onChange={(e) => setEditFinishForm((x) => ({ ...x, brand: e.target.value }))} />
                            </div>
                            <div style={styles.formRow}>
                              <label style={styles.label}>Cena (zł/m²)</label>
                              <input style={styles.input} type="number" min={0} step={0.01} value={editFinishForm.pricePerSqmPln} onChange={(e) => setEditFinishForm((x) => ({ ...x, pricePerSqmPln: Number(e.target.value) }))} />
                            </div>
                            <div style={styles.formRow}>
                              <label style={styles.label}>Nowe zdjęcie</label>
                              <div style={styles.fileInputWrapper}>
                                <input type="file" accept="image/*" style={styles.fileInput} onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  const base64 = await resizeAndConvertToBase64(file);
                                  setEditFinishForm((x) => ({ ...x, imageBase64: base64 }));
                                }} />
                                {editFinishForm.imageBase64 ? (
                                  <img src={editFinishForm.imageBase64} alt="podgląd" style={styles.previewThumb} />
                                ) : f.imageBase64 ? (
                                  <img src={f.imageBase64} alt="obecne" style={styles.previewThumb} />
                                ) : null}
                              </div>
                            </div>
                            <div style={styles.formActions}>
                              <button onClick={handleUpdateFinish} disabled={savingEditFinish || !editFinishForm.label.trim()} style={styles.confirmBtn}>
                                {savingEditFinish ? 'Zapisywanie…' : 'Zapisz zmiany'}
                              </button>
                              <button onClick={() => setEditingFinishDocId(null)} style={styles.cancelBtn}>Anuluj</button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Handles section */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Uchwyty</h2>
            {!showHandleForm && (
              <button onClick={() => setShowHandleForm(true)} style={styles.addBtn}>+ Dodaj uchwyt</button>
            )}
          </div>

          {showHandleForm && (
            <div style={styles.form}>
              <div style={styles.formRow}>
                <label style={styles.label}>Etykieta</label>
                <input
                  style={styles.input}
                  value={handleForm.label}
                  onChange={(e) => setHandleForm((h) => ({ ...h, label: e.target.value }))}
                  placeholder="np. UZ NYXA 320"
                />
              </div>
              <div style={styles.formRow}>
                <label style={styles.label}>Marka</label>
                <input
                  style={styles.input}
                  value={handleForm.brand}
                  onChange={(e) => setHandleForm((h) => ({ ...h, brand: e.target.value }))}
                  placeholder="np. GTV"
                />
              </div>
              <div style={styles.formRow}>
                <label style={styles.label}>Cena (zł/szt.)</label>
                <input
                  style={styles.input}
                  type="number"
                  min={0}
                  step={0.01}
                  value={handleForm.pricePln}
                  onChange={(e) => setHandleForm((h) => ({ ...h, pricePln: Number(e.target.value) }))}
                />
              </div>
              <div style={styles.formRow}>
                <label style={styles.label}>Zdjęcie</label>
                <div style={styles.fileInputWrapper}>
                  <input
                    type="file"
                    accept="image/*"
                    style={styles.fileInput}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const base64 = await resizeAndConvertToBase64(file);
                      setHandleForm((h) => ({ ...h, imageBase64: base64 }));
                    }}
                  />
                  {handleForm.imageBase64 && (
                    <img src={handleForm.imageBase64} alt="podgląd" style={styles.previewThumb} />
                  )}
                </div>
              </div>
              <div style={styles.formRow}>
                <label style={styles.label}>Jest krawędziowy</label>
                <input
                  type="checkbox"
                  checked={handleForm.isEdge}
                  onChange={(e) => setHandleForm((h) => ({ ...h, isEdge: e.target.checked, edgeWidthMm: e.target.checked ? h.edgeWidthMm : null }))}
                />
              </div>
              {handleForm.isEdge && (
                <div style={styles.formRow}>
                  <label style={styles.label}>Szerokość krawędzi (mm)</label>
                  <input
                    style={styles.input}
                    type="number"
                    min={0}
                    step={0.1}
                    value={handleForm.edgeWidthMm ?? ''}
                    onChange={(e) => setHandleForm((h) => ({ ...h, edgeWidthMm: e.target.value === '' ? null : Number(e.target.value) }))}
                  />
                </div>
              )}
              <div style={styles.formActions}>
                <button
                  onClick={handleAddHandle}
                  disabled={savingHandle || !handleForm.label.trim()}
                  style={styles.confirmBtn}
                >
                  {savingHandle ? 'Zapisywanie…' : 'Zapisz'}
                </button>
                <button
                  onClick={() => {
                    setShowHandleForm(false);
                    setHandleForm(emptyHandleForm());
                  }}
                  style={styles.cancelBtn}
                >
                  Anuluj
                </button>
              </div>
            </div>
          )}

          {loadingHandles ? (
            <p style={styles.hint}>Ładowanie…</p>
          ) : handles.length === 0 ? (
            <p style={styles.hint}>Brak uchwytów. Dodaj pierwszy.</p>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Zdjęcie</th>
                    <th style={styles.th}>Etykieta</th>
                    <th style={styles.th}>Marka</th>
                    <th style={styles.th}>Cena zł/szt.</th>
                    <th style={styles.th}>Krawędziowy</th>
                    <th style={styles.th}>Szer. (mm)</th>
                    <th style={styles.th}></th>
                  </tr>
                </thead>
                <tbody>
                  {handles.map((h) => (
                    <>
                    <tr key={h.id} style={styles.tr}>
                      <td style={styles.td}>
                        {h.imageBase64 ? (
                          <img src={h.imageBase64} alt={h.label} style={styles.thumb} />
                        ) : (
                          <span style={styles.noThumb}>—</span>
                        )}
                      </td>
                      <td style={styles.td}>{h.label}</td>
                      <td style={styles.td}>{h.brand}</td>
                      <td style={styles.td}>{h.pricePln.toFixed(2)}</td>
                      <td style={styles.td}>{h.isEdge ? 'Tak' : 'Nie'}</td>
                      <td style={styles.td}>{h.isEdge && h.edgeWidthMm !== null ? h.edgeWidthMm : '—'}</td>
                      <td style={styles.td}>
                        <button
                          style={styles.editRowBtn}
                          onClick={() => {
                            setEditingHandleDocId(h.docId);
                            setEditHandleForm({ label: h.label, brand: h.brand, pricePln: h.pricePln, imageBase64: '', isEdge: h.isEdge, edgeWidthMm: h.edgeWidthMm });
                          }}
                          title="Edytuj"
                        >
                          ✏️
                        </button>
                        <button
                          style={styles.deleteRowBtn}
                          onClick={() => setConfirmDeleteHandle(h.docId)}
                          title="Usuń"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                    {editingHandleDocId === h.docId && (
                      <tr key={h.id + '_edit'}>
                        <td colSpan={7} style={styles.editTd}>
                          <div style={styles.form}>
                            <div style={styles.formRow}>
                              <label style={styles.label}>Etykieta</label>
                              <input style={styles.input} value={editHandleForm.label} onChange={(e) => setEditHandleForm((x) => ({ ...x, label: e.target.value }))} />
                            </div>
                            <div style={styles.formRow}>
                              <label style={styles.label}>Marka</label>
                              <input style={styles.input} value={editHandleForm.brand} onChange={(e) => setEditHandleForm((x) => ({ ...x, brand: e.target.value }))} />
                            </div>
                            <div style={styles.formRow}>
                              <label style={styles.label}>Cena (zł/szt.)</label>
                              <input style={styles.input} type="number" min={0} step={0.01} value={editHandleForm.pricePln} onChange={(e) => setEditHandleForm((x) => ({ ...x, pricePln: Number(e.target.value) }))} />
                            </div>
                            <div style={styles.formRow}>
                              <label style={styles.label}>Nowe zdjęcie</label>
                              <div style={styles.fileInputWrapper}>
                                <input type="file" accept="image/*" style={styles.fileInput} onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  const base64 = await resizeAndConvertToBase64(file);
                                  setEditHandleForm((x) => ({ ...x, imageBase64: base64 }));
                                }} />
                                {editHandleForm.imageBase64 ? (
                                  <img src={editHandleForm.imageBase64} alt="podgląd" style={styles.previewThumb} />
                                ) : h.imageBase64 ? (
                                  <img src={h.imageBase64} alt="obecne" style={styles.previewThumb} />
                                ) : null}
                              </div>
                            </div>
                            <div style={styles.formRow}>
                              <label style={styles.label}>Jest krawędziowy</label>
                              <input type="checkbox" checked={editHandleForm.isEdge} onChange={(e) => setEditHandleForm((x) => ({ ...x, isEdge: e.target.checked, edgeWidthMm: e.target.checked ? x.edgeWidthMm : null }))} />
                            </div>
                            {editHandleForm.isEdge && (
                              <div style={styles.formRow}>
                                <label style={styles.label}>Szerokość krawędzi (mm)</label>
                                <input style={styles.input} type="number" min={0} step={0.1} value={editHandleForm.edgeWidthMm ?? ''} onChange={(e) => setEditHandleForm((x) => ({ ...x, edgeWidthMm: e.target.value === '' ? null : Number(e.target.value) }))} />
                              </div>
                            )}
                            <div style={styles.formActions}>
                              <button onClick={handleUpdateHandle} disabled={savingEditHandle || !editHandleForm.label.trim()} style={styles.confirmBtn}>
                                {savingEditHandle ? 'Zapisywanie…' : 'Zapisz zmiany'}
                              </button>
                              <button onClick={() => setEditingHandleDocId(null)} style={styles.cancelBtn}>Anuluj</button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#f0f2f5',
    padding: '48px 24px',
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    marginBottom: '40px',
    maxWidth: '1100px',
    margin: '0 auto 40px auto',
  },
  backBtn: {
    background: 'transparent',
    border: '1px solid #ccc',
    borderRadius: '6px',
    padding: '8px 16px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    color: '#444',
  },
  heading: {
    fontSize: '1.6rem',
    fontWeight: 700,
    color: '#1a1a2e',
    margin: 0,
  },
  sectionsWrapper: {
    maxWidth: '1100px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '48px',
  },
  section: {
    background: '#fff',
    borderRadius: '12px',
    padding: '28px 32px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '1.2rem',
    fontWeight: 700,
    color: '#1a1a2e',
    margin: 0,
  },
  addBtn: {
    background: '#1a1a2e',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 16px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 600,
  },
  form: {
    background: '#f8f9fa',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '20px 24px',
    marginBottom: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxWidth: '480px',
  },
  formRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  label: {
    width: '180px',
    flexShrink: 0,
    fontSize: '0.9rem',
    color: '#555',
    fontWeight: 500,
  },
  input: {
    flex: 1,
    padding: '7px 10px',
    fontSize: '0.9rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
  fileInputWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  fileInput: {
    fontSize: '0.88rem',
  },
  previewThumb: {
    width: '80px',
    height: '52px',
    objectFit: 'cover' as const,
    borderRadius: '4px',
    border: '1px solid #ddd',
  },
  formActions: {
    display: 'flex',
    gap: '10px',
    marginTop: '4px',
  },
  confirmBtn: {
    padding: '8px 20px',
    background: '#1a1a2e',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.9rem',
  },
  cancelBtn: {
    padding: '8px 20px',
    background: '#e0e0e0',
    color: '#333',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  hint: {
    color: '#888',
    fontSize: '0.9rem',
  },
  tableWrapper: {
    overflowX: 'auto' as const,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '0.9rem',
  },
  th: {
    textAlign: 'left' as const,
    padding: '10px 12px',
    borderBottom: '2px solid #e0e0e0',
    color: '#555',
    fontWeight: 600,
    whiteSpace: 'nowrap' as const,
  },
  tr: {
    borderBottom: '1px solid #f0f0f0',
  },
  td: {
    padding: '10px 12px',
    verticalAlign: 'middle' as const,
  },
  thumb: {
    width: '48px',
    height: '32px',
    objectFit: 'cover' as const,
    borderRadius: '4px',
    display: 'block',
  },
  noThumb: {
    color: '#bbb',
    fontSize: '0.85rem',
  },
  code: {
    background: '#f0f0f0',
    padding: '2px 6px',
    borderRadius: '3px',
    fontSize: '0.82rem',
    fontFamily: 'monospace',
  },
  deleteRowBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.9rem',
    padding: '2px 4px',
  },
  editRowBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.9rem',
    padding: '2px 4px',
  },
  editTd: {
    padding: '0 0 8px 0',
    background: '#f0f4ff',
  },
  modalOverlay: {
    position: 'fixed' as const,
    inset: 0,
    background: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#fff',
    borderRadius: '10px',
    padding: '28px 32px',
    maxWidth: '380px',
    width: '90%',
    textAlign: 'center' as const,
  },
  modalText: {
    fontSize: '1rem',
    marginBottom: '20px',
    color: '#333',
  },
  modalButtons: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
  },
  deleteConfirmBtn: {
    padding: '8px 20px',
    background: '#c0392b',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.9rem',
  },
};
