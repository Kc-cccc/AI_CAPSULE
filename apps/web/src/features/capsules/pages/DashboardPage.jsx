import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../shared/api/client.js';
import AppShell from '../../../app/layouts/AppShell.jsx';
import CapsuleForm from '../components/CapsuleForm.jsx';
import DeleteDialog from '../components/DeleteDialog.jsx';
import { EditIcon, PlusIcon, TrashIcon } from '../../../shared/ui/Icons.jsx';

function recordStatus(record) {
  if (record.improved) return 'Improved';
  if (record.reviewed) return 'Reviewed';
  return 'Not reviewed';
}

function categoryClass(category) {
  const value = String(category || '').toLowerCase();
  if (value === 'research') return 'tag tag--olive';
  return 'tag tag--rust';
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [records, setRecords] = useState([]);
  const [view, setView] = useState('list');
  const [selected, setSelected] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleError = useCallback((caught) => {
    if (caught.status === 401) {
      navigate('/login', { replace: true });
      return;
    }
    setError(caught.message || 'Something went wrong.');
  }, [navigate]);

  const load = useCallback(async () => {
    try {
      const [currentUser, capsules] = await Promise.all([api.me(), api.listCapsules()]);
      setUser(currentUser);
      setRecords(capsules);
    } catch (caught) {
      handleError(caught);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setSelected(null);
    setError('');
    setView('create');
  }

  function openEdit(record) {
    setSelected(record);
    setError('');
    setView('edit');
  }

  function returnToList() {
    setView('list');
    setSelected(null);
    setError('');
  }

  async function save(values) {
    setBusy(true);
    setError('');
    try {
      if (view === 'edit') {
        await api.updateCapsule(selected.id, values);
      } else {
        await api.createCapsule(values);
      }
      setView('list');
      setSelected(null);
      await load();
    } catch (caught) {
      handleError(caught);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!deleteTarget) return;
    setBusy(true);
    setError('');
    try {
      await api.deleteCapsule(deleteTarget.id);
      setDeleteTarget(null);
      setView('list');
      setSelected(null);
      await load();
    } catch (caught) {
      handleError(caught);
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    try {
      await api.logout();
    } finally {
      navigate('/', { replace: true });
    }
  }

  if (loading) {
    return <main className="loading-screen"><div className="loading-mark" /><p>Opening your prompt library…</p></main>;
  }

  const isForm = view === 'create' || view === 'edit';

  return (
    <AppShell user={user} title={isForm ? `Prompt library / ${view === 'edit' ? 'Edit record' : 'New record'}` : 'Dashboard / Prompt library'} onLogout={logout}>
      {isForm ? (
        <CapsuleForm capsule={selected} user={user} busy={busy} error={error} onBack={returnToList} onSave={save} />
      ) : (
        <div className="library-view">
          <header className="library-heading">
            <div><h1>Your prompts</h1><p>Review and manage the prompt records saved to your account.</p></div>
            <button className="button button--rust" type="button" onClick={openCreate}><PlusIcon />New capsule</button>
          </header>

          {error && <div className="inline-error" role="alert">{error}</div>}
          <section className="record-list" aria-label="Saved prompt records">
            <div className="record-list__head"><span>Index / Prompt</span><span>Version</span><span>Category</span><span>Usefulness</span><span>Status</span><span aria-hidden="true" /></div>
            {records.length === 0 ? (
              <div className="empty-state"><span>01</span><h2>No prompts saved yet.</h2><p>Create your first capsule to keep a useful prompt and its review notes together.</p><button className="button button--rust" type="button" onClick={openCreate}>Create capsule</button></div>
            ) : records.map((record, index) => (
              <article className="record-row" key={record.id}>
                <div className="record-name"><span>{String(index + 1).padStart(2, '0')}</span><div><h2>{record.prompt_title}</h2><p>{record.project_name}{record.response_summary ? ` · ${record.response_summary}` : ''}</p></div></div>
                <span>{record.prompt_version || '—'}</span>
                <span><i className={categoryClass(record.category)}>{record.category || '—'}</i></span>
                <span>{record.usefulness || '—'}</span>
                <span className={`record-status${!record.reviewed && !record.improved ? ' record-status--pending' : ''}`}><i />{recordStatus(record)}</span>
                <div className="record-actions">
                  <button type="button" aria-label={`Edit ${record.prompt_title}`} title="Edit" onClick={() => openEdit(record)}><EditIcon /></button>
                  <button className="record-actions__delete" type="button" aria-label={`Delete ${record.prompt_title}`} title="Delete" onClick={() => setDeleteTarget(record)}><TrashIcon /></button>
                </div>
              </article>
            ))}
            <footer><span>{records.length} prompt {records.length === 1 ? 'record' : 'records'}</span><span>Showing your records only</span></footer>
          </section>
        </div>
      )}
      <DeleteDialog capsule={deleteTarget} busy={busy} onCancel={() => setDeleteTarget(null)} onConfirm={remove} />
    </AppShell>
  );
}
