import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import AppHeader from '../components/AppHeader';

const ROLE_BADGE = {
  owner: 'bg-[#0b2654]/10 text-[#0b2654]',
  editor: 'bg-emerald-100 text-emerald-700',
  viewer: 'bg-gray-100 text-gray-600',
};

const ROLE_LABEL = { owner: 'Owner', editor: 'Can edit', viewer: 'View only' };

export default function DashboardPage() {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [docs, setDocs] = useState({ owned: [], shared: [] });
  const [newTitle, setNewTitle] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await api.listDocuments(auth.token);
      setDocs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setError('');
    try {
      const doc = await api.createDocument(auth.token, newTitle.trim());
      setNewTitle('');
      navigate(`/documents/${doc.id}`);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    try {
      const doc = await api.importDocument(auth.token, file);
      navigate(`/documents/${doc.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      e.target.value = '';
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">{error}</p>}

        <section className="bg-white p-5 rounded-lg shadow-sm border space-y-3">
          <h2 className="text-xs tracking-[0.15em] font-medium text-[#0b2654]">NEW DOCUMENT</h2>
          <form onSubmit={handleCreate} className="flex gap-2">
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Document title"
              className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0b2654]/40"
            />
            <button
              type="submit"
              className="rounded bg-[#0b2654] text-white px-5 py-2 text-xs tracking-[0.15em] font-medium hover:bg-[#0f3270] transition-colors"
            >
              CREATE
            </button>
          </form>

          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span>or import a file (.txt, .md, .docx — max 5MB):</span>
            <input ref={fileInputRef} type="file" accept=".txt,.md,.docx" onChange={handleImport} className="text-sm" />
          </div>
        </section>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <>
            <DocList title="Owned by me" docs={docs.owned} onOpen={(id) => navigate(`/documents/${id}`)} />
            <DocList title="Shared with me" docs={docs.shared} onOpen={(id) => navigate(`/documents/${id}`)} />
          </>
        )}
      </main>
    </div>
  );
}

function DocList({ title, docs, onOpen }) {
  return (
    <section>
      <h2 className="text-xs tracking-[0.15em] font-medium text-[#0b2654] mb-2">{title.toUpperCase()}</h2>
      {docs.length === 0 ? (
        <p className="text-sm text-gray-400">Nothing here yet.</p>
      ) : (
        <ul className="bg-white rounded-lg shadow-sm border divide-y">
          {docs.map((doc) => (
            <li
              key={doc.id}
              onClick={() => onOpen(doc.id)}
              className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50"
            >
              <span className="text-gray-800">{doc.title}</span>
              <span className={`text-xs font-medium px-2 py-1 rounded ${ROLE_BADGE[doc.role] || ''}`}>
                {ROLE_LABEL[doc.role] || doc.role}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
