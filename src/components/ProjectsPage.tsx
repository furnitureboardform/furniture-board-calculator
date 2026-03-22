import { useEffect, useState } from 'react';

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
  </svg>
);

const DeleteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
  </svg>
);

const VisibilityIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
  </svg>
);

const VisibilityOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
  </svg>
);
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

interface Project {
  id: string;
  name: string;
  createdAt: Timestamp | null;
  clientPriceAfterDiscount?: number;
}

interface ProjectsPageProps {
  readonly onSelectProject: (projectId: string) => void;
  readonly onCreateProject: (projectId: string) => void;
  readonly onDashboard: () => void;
}

export function ProjectsPage({ onSelectProject, onCreateProject, onDashboard }: ProjectsPageProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [visiblePriceIds, setVisiblePriceIds] = useState<Set<string>>(new Set());
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const togglePriceVisibility = (id: string) => {
    setVisiblePriceIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  useEffect(() => {
    const fetchProjects = async () => {
      const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map((d) => ({
        id: d.id,
        name: d.data().name as string,
        createdAt: d.data().createdAt as Timestamp | null,
        clientPriceAfterDiscount: d.data().clientPriceAfterDiscount as number | undefined,
      }));
      setProjects(docs);
      setLoading(false);
    };
    fetchProjects();
  }, []);

  const handleCreate = async () => {
    const name = newName.trim() || `Projekt ${new Date().toLocaleDateString('pl-PL')}`;
    setCreating(true);
    const docRef = await addDoc(collection(db, 'projects'), {
      name,
      createdAt: serverTimestamp(),
    });
    setCreating(false);
    onCreateProject(docRef.id);
  };

  const handleRenameConfirm = async (id: string) => {
    const name = editingName.trim();
    if (!name) return;
    await updateDoc(doc(db, 'projects', id), { name });
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name } : p))
    );
    setEditingId(null);
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDeleteId) return;
    setDeleting(true);
    await deleteDoc(doc(db, 'projects', confirmDeleteId));
    setProjects((prev) => prev.filter((p) => p.id !== confirmDeleteId));
    setDeleting(false);
    setConfirmDeleteId(null);
  };

  const formatDate = (ts: Timestamp | null): string => {
    if (!ts) return '';
    return ts.toDate().toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div style={styles.page}>
      <div style={styles.pageHeader}>
        <h1 style={styles.heading}>Projekty</h1>
        <button onClick={onDashboard} style={styles.dashboardBtn}>Dashboard</button>
      </div>

      {confirmDeleteId !== null && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <p style={styles.modalText}>
              Czy na pewno chcesz usunąć projekt
              {' '}„<strong>{projects.find((p) => p.id === confirmDeleteId)?.name}</strong>”?
            </p>
            <div style={styles.modalButtons}>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                style={styles.deleteConfirmBtn}
              >
                {deleting ? 'Usuwanie…' : 'Usuń'}
              </button>
              <button
                onClick={() => setConfirmDeleteId(null)}
                disabled={deleting}
                style={styles.cancelBtn}
              >
                Anuluj
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateForm ? (
        <div style={styles.createForm}>
          <input
            type="text"
            autoFocus
            placeholder="Nazwa projektu"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            style={styles.nameInput}
          />
          <div style={styles.createFormButtons}>
            <button onClick={handleCreate} disabled={creating} style={styles.confirmBtn}>
              {creating ? 'Tworzenie…' : 'Utwórz'}
            </button>
            <button onClick={() => { setShowCreateForm(false); setNewName(''); }} style={styles.cancelBtn}>
              Anuluj
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowCreateForm(true)}
          style={styles.createCard}
        >
          <span style={styles.plus}>+</span>
          <span style={styles.createLabel}>Stwórz nowy projekt</span>
        </button>
      )}

      {loading ? (
        <p style={styles.hint}>Ładowanie projektów…</p>
      ) : projects.length > 0 ? (
        <div style={styles.list}>
          {projects.map((project) => (
            <div key={project.id} style={styles.projectCardWrapper}>
              {editingId === project.id ? (
                <div style={styles.editForm}>
                  <input
                    autoFocus
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRenameConfirm(project.id);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    style={styles.nameInput}
                  />
                  <div style={styles.createFormButtons}>
                    <button onClick={() => handleRenameConfirm(project.id)} style={styles.confirmBtn}>Zapisz</button>
                    <button onClick={() => setEditingId(null)} style={styles.cancelBtn}>Anuluj</button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => onSelectProject(project.id)}
                  style={styles.projectCard}
                >
                  <span style={styles.projectName}>{project.name}</span>
                  <span style={styles.projectDate}>{formatDate(project.createdAt)}</span>
                </button>
              )}
              {editingId !== project.id && (
                <>
                  <button
                    className="icon-btn"
                    style={styles.editBtn}
                    title="Zmień nazwę"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingId(project.id);
                      setEditingName(project.name);
                    }}
                  >
                    <EditIcon />
                  </button>
                  <button
                    className="icon-btn icon-btn--danger"
                    style={styles.deleteBtn}
                    title="Usuń projekt"
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmDeleteId(project.id);
                    }}
                  >
                    <DeleteIcon />
                  </button>
                  {project.clientPriceAfterDiscount != null && (
                    <button
                      className="icon-btn"
                      style={styles.priceEyeBtn}
                      title={visiblePriceIds.has(project.id) ? 'Ukryj cenę' : 'Pokaż cenę'}
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePriceVisibility(project.id);
                      }}
                    >
                      {visiblePriceIds.has(project.id) ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </button>
                  )}
                  {visiblePriceIds.has(project.id) && project.clientPriceAfterDiscount != null && (
                    <div style={styles.priceTag}>
                      {project.clientPriceAfterDiscount.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p style={styles.hint}>Brak projektów. Stwórz pierwszy projekt.</p>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#f0f2f5',
    padding: '48px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  pageHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    marginBottom: '0',
    width: '100%',
    maxWidth: '900px',
    justifyContent: 'space-between',
  },
  heading: {
    fontSize: '1.6rem',
    fontWeight: 700,
    color: '#1a1a2e',
    marginBottom: '32px',
  },
  dashboardBtn: {
    marginBottom: '32px',
    padding: '8px 20px',
    background: '#1a1a2e',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.9rem',
  },
  createForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    width: '260px',
    marginBottom: '40px',
  },
  createFormButtons: {
    display: 'flex',
    gap: '8px',
  },
  nameInput: {
    padding: '8px 12px',
    fontSize: '0.95rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    width: '100%',
  },
  confirmBtn: {
    flex: 1,
    padding: '8px',
    background: '#1a1a2e',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.9rem',
  },
  cancelBtn: {
    flex: 1,
    padding: '8px',
    background: '#e0e0e0',
    color: '#333',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  createCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    width: '220px',
    height: '160px',
    background: '#fff',
    border: '2px dashed #1a1a2e',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'box-shadow 0.15s',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    marginBottom: '40px',
  },
  plus: {
    fontSize: '2.4rem',
    fontWeight: 300,
    color: '#1a1a2e',
    lineHeight: 1,
  },
  createLabel: {
    fontSize: '0.95rem',
    fontWeight: 600,
    color: '#1a1a2e',
  },
  list: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '16px',
    justifyContent: 'center',
    width: '100%',
    maxWidth: '900px',
  },
  projectCardWrapper: {
    position: 'relative',
    width: '220px',
  },
  projectCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    width: '100%',
    height: '100px',
    background: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: '10px',
    padding: '12px 16px 14px',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    textAlign: 'left',
    transition: 'box-shadow 0.15s',
    gap: '4px',
  },
  editForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    background: '#fff',
    border: '1px solid #ccc',
    borderRadius: '10px',
    padding: '12px',
  },
  editBtn: {
    position: 'absolute',
    top: '4px',
    right: '4px',
  },
  deleteBtn: {
    position: 'absolute',
    top: '4px',
    right: '36px',
  },
  priceEyeBtn: {
    position: 'absolute',
    top: '4px',
    right: '68px',
  },
  priceTag: {
    position: 'absolute',
    bottom: '8px',
    right: '8px',
    fontSize: '0.8rem',
    fontWeight: 700,
    color: '#1a1a2e',
    background: '#e8f4e8',
    borderRadius: '4px',
    padding: '2px 7px',
  },
  projectName: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: '#1a1a2e',
    paddingRight: '20px',
  },
  projectDate: {
    fontSize: '0.75rem',
    color: '#999',
  },
  hint: {
    color: '#888',
    fontSize: '0.9rem',
    marginTop: '8px',
  },
  modalOverlay: {
    position: 'fixed' as const,
    inset: 0,
    background: 'rgba(0,0,0,0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#fff',
    borderRadius: '10px',
    padding: '28px 24px',
    width: '320px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
  },
  modalText: {
    fontSize: '0.95rem',
    color: '#1a1a2e',
    marginBottom: '20px',
    lineHeight: 1.5,
  },
  modalButtons: {
    display: 'flex',
    gap: '8px',
  },
  deleteConfirmBtn: {
    flex: 1,
    padding: '8px',
    background: '#c62828',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.9rem',
  },
};
