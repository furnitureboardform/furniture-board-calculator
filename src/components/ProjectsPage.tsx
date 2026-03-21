import { useEffect, useState } from 'react';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
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
}

interface ProjectsPageProps {
  readonly onSelectProject: (projectId: string) => void;
}

export function ProjectsPage({ onSelectProject }: ProjectsPageProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map((d) => ({
        id: d.id,
        name: d.data().name as string,
        createdAt: d.data().createdAt as Timestamp | null,
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
    onSelectProject(docRef.id);
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
      <h1 style={styles.heading}>Projekty</h1>

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
                <button
                  style={styles.editBtn}
                  title="Zmień nazwę"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingId(project.id);
                    setEditingName(project.name);
                  }}
                >
                  ✏️
                </button>
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
  heading: {
    fontSize: '1.6rem',
    fontWeight: 700,
    color: '#1a1a2e',
    marginBottom: '32px',
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
    justifyContent: 'space-between',
    width: '100%',
    height: '100px',
    background: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: '10px',
    padding: '16px',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    textAlign: 'left',
    transition: 'box-shadow 0.15s',
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
    top: '8px',
    right: '8px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.85rem',
    padding: '2px 4px',
    lineHeight: 1,
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
};
