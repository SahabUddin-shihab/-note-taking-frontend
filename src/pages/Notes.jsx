import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { Pager, Status, useList } from '../ui.jsx';

export function NotesList() {
  const [page, setPage] = useState(1);
  const { data, pagination, loading, error, reload } = useList('/notes', page);
  const [err, setErr] = useState('');
  const del = async (id) => {
    if (!confirm('Delete this note?')) return;
    try {
      await api(`/notes/${id}`, { method: 'DELETE' });
      if (data.length === 1 && page > 1) setPage(page - 1);
      else reload();
    } catch (x) {
      setErr(x.message);
    }
  };
  return (<>
    <div className="row between">
      <h1>Your notes</h1>
      <Link className="btn" to="/notes/new">New note</Link>
    </div>
    <Status loading={loading} error={error || err} empty={!data.length} emptyText="No notes yet. Write your first one." />
    {data.map((n) => (<div className="card" key={n._id}>
      <h2><Link to={`/notes/${n._id}`}>{n.title}</Link></h2>
      <p className="mute">{n.content.slice(0, 140)}</p>
      <div className="row">
        <Link to={`/notes/${n._id}/edit`}>Edit</Link>
        <button className="danger" onClick={() => del(n._id)}>Delete</button>
      </div>
    </div>))}
    <Pager pagination={pagination} onPage={setPage} />
  </>);
}

export function NoteDetail() {
  const { id } = useParams();
  const [n, setN] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    api(`/notes/${id}`).then((r) => setN(r.data)).catch((e) => setErr(e.message));
  }, [id]);
  if (err)
    return <>
      <p className="err" role="alert">{err}</p>
      <Link to="/notes">Back to notes</Link>
    </>;
  if (!n) return <p className="mute">Loading…</p>;
  return (<>
    <h1>{n.title}</h1>
    <p style={{ whiteSpace: 'pre-wrap' }}>{n.content}</p>
    <div className="row">
      <Link to={`/notes/${id}/edit`}>Edit</Link>
      <Link to="/notes">Back to notes</Link>
    </div>
  </>);
}

export function NoteForm() {
  const { id } = useParams();
  const nav = useNavigate();
  const [f, setF] = useState({ title: '', content: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(!!id);
  useEffect(() => {
    if (id)
      api(`/notes/${id}`).then((r) => setF({
        title: r.data.title,
        content: r.data.content
      })).catch((e) => setErr(e.message)).finally(() => setBusy(false));
  }, [id]);
  const save = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      const r = await api(id ? `/notes/${id}` : '/notes', {
        method: id ? 'PUT' : 'POST',
        body: f
      });
      nav(`/notes/${r.data._id}`);
    } catch (x) {
      setErr(x.message);
    }
  };
  return (<>
    <h1>{id ? 'Edit note' : 'New note'}</h1>
    <form className="stack" onSubmit={save}>
      <label>Title<input required maxLength={200} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></label>
      <label>Content<textarea rows={8} value={f.content} onChange={(e) => setF({ ...f, content: e.target.value })} /></label>
      {err && <p className="err" role="alert">{err}</p>}
      <button disabled={busy}>Save note</button>
    </form>
  </>);
}
