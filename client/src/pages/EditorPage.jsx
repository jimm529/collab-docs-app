import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import AppHeader from '../components/AppHeader';

const AUTOSAVE_DELAY_MS = 1000;

export default function EditorPage() {
  const { id } = useParams();
  const { auth } = useAuth();
  const navigate = useNavigate();

  const [doc, setDoc] = useState(null);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('loaded'); // loaded | saving | saved | error
  const [shareEmail, setShareEmail] = useState('');
  const [shareRole, setShareRole] = useState('editor');
  const [shareMessage, setShareMessage] = useState('');

  const saveTimer = useRef(null);
  const canEdit = doc && (doc.role === 'owner' || doc.role === 'editor');

  // Content is NOT passed reactively here — useEditor re-applies the
  // `content` option on every render when it changes, which would re-fire
  // onUpdate (and trigger an autosave) as soon as the document loads, even
  // for a read-only viewer. We set content manually in load() instead, with
  // emitUpdate: false.
  const editor = useEditor({
    extensions: [StarterKit],
    editable: canEdit,
    onUpdate: ({ editor }) => {
      // Guards against any programmatic/non-user content change (e.g. the
      // initial load) accidentally triggering a save attempt — a viewer
      // should never even try to write, regardless of what caused this to fire.
      if (!canEdit) return;
      scheduleSave({ content: editor.getJSON() });
    },
  });

  useEffect(() => {
    load();
    return () => clearTimeout(saveTimer.current);
  }, [id]);

  useEffect(() => {
    if (editor && doc) {
      editor.setEditable(canEdit);
    }
  }, [editor, canEdit]);

  async function load() {
    setError('');
    try {
      const data = await api.getDocument(auth.token, id);
      setDoc(data);
      setTitle(data.title);
      editor?.commands.setContent(data.content, { emitUpdate: false });
    } catch (err) {
      setError(err.message);
    }
  }

  function scheduleSave(updates) {
    setStatus('saving');
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await api.updateDocument(auth.token, id, updates);
        setStatus('saved');
        setError('');
      } catch (err) {
        setStatus('error');
        setError(err.message);
      }
    }, AUTOSAVE_DELAY_MS);
  }

  function handleTitleChange(e) {
    setTitle(e.target.value);
    scheduleSave({ title: e.target.value });
  }

  async function handleShare(e) {
    e.preventDefault();
    setShareMessage('');
    setError('');
    try {
      await api.shareDocument(auth.token, id, shareEmail, shareRole);
      setShareMessage(`Shared with ${shareEmail} as ${shareRole}`);
      setShareEmail('');
    } catch (err) {
      setError(err.message);
    }
  }

  if (error && !doc) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b2654]">
        <div className="text-center space-y-3">
          <p className="text-red-200">{error}</p>
          <button onClick={() => navigate('/')} className="text-white/80 hover:text-white hover:underline">
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!doc) {
    return <div className="min-h-screen flex items-center justify-center bg-[#0b2654] text-white/70">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader
        left={
          <div className="flex items-center gap-4 min-w-0">
            <button onClick={() => navigate('/')} className="text-sm text-white/70 hover:text-white whitespace-nowrap">
              &larr; Dashboard
            </button>
            <input
              value={title}
              onChange={handleTitleChange}
              disabled={!canEdit}
              className="text-sm text-white font-medium bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-white/30 rounded px-2 py-1 min-w-0 w-64 disabled:opacity-80"
            />
            <SaveStatus status={status} />
          </div>
        }
      />

      {error && <p className="max-w-3xl mx-auto mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">{error}</p>}

      <main className="max-w-3xl mx-auto px-6 py-6 space-y-4">
        {!canEdit && (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
            You have view-only access to this document.
          </p>
        )}

        {canEdit && editor && <Toolbar editor={editor} />}

        <div className="bg-white rounded-lg shadow-sm border p-6 min-h-[50vh]">
          <EditorContent editor={editor} className="prose max-w-none focus:outline-none" />
        </div>

        {doc.role === 'owner' && (
          <section className="bg-white rounded-lg shadow-sm border p-4 space-y-3">
            <h2 className="text-xs tracking-[0.15em] font-medium text-[#0b2654]">SHARE THIS DOCUMENT</h2>
            <form onSubmit={handleShare} className="flex gap-2">
              <input
                type="email"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                placeholder="user@example.com"
                required
                className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0b2654]/40"
              />
              <select
                value={shareRole}
                onChange={(e) => setShareRole(e.target.value)}
                className="rounded border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="editor">Can edit</option>
                <option value="viewer">View only</option>
              </select>
              <button
                type="submit"
                className="rounded bg-[#0b2654] text-white px-5 py-2 text-xs tracking-[0.15em] font-medium hover:bg-[#0f3270] transition-colors"
              >
                SHARE
              </button>
            </form>
            {shareMessage && <p className="text-sm text-emerald-600">{shareMessage}</p>}
          </section>
        )}
      </main>
    </div>
  );
}

function SaveStatus({ status }) {
  const label = { saving: 'Saving...', saved: 'Saved', error: 'Save failed', loaded: '' }[status];
  if (!label) return null;
  const color = status === 'error' ? 'text-red-300' : 'text-white/50';
  return <span className={`text-xs whitespace-nowrap ${color}`}>{label}</span>;
}

function Toolbar({ editor }) {
  const buttons = [
    { label: 'B', action: () => editor.chain().focus().toggleBold().run(), active: 'bold', className: 'font-bold' },
    { label: 'I', action: () => editor.chain().focus().toggleItalic().run(), active: 'italic', className: 'italic' },
    { label: 'U', action: () => editor.chain().focus().toggleUnderline().run(), active: 'underline', className: 'underline' },
    { label: 'H1', action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: 'heading', activeAttrs: { level: 1 } },
    { label: 'H2', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: 'heading', activeAttrs: { level: 2 } },
    { label: '• List', action: () => editor.chain().focus().toggleBulletList().run(), active: 'bulletList' },
    { label: '1. List', action: () => editor.chain().focus().toggleOrderedList().run(), active: 'orderedList' },
  ];

  return (
    <div className="flex gap-2 bg-white rounded-lg shadow-sm border p-2">
      {buttons.map((btn) => {
        const isActive = btn.activeAttrs
          ? editor.isActive(btn.active, btn.activeAttrs)
          : editor.isActive(btn.active);
        return (
          <button
            key={btn.label}
            type="button"
            onClick={btn.action}
            className={`px-3 py-1 text-sm rounded ${btn.className || ''} ${
              isActive ? 'bg-[#0b2654]/10 text-[#0b2654]' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {btn.label}
          </button>
        );
      })}
    </div>
  );
}
