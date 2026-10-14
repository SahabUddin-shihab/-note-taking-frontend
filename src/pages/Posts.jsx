import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { Pager, Status, useList } from '../ui.jsx';

export default function Posts() {
  const { user } = useAuth();
  const [sp, setSp] = useSearchParams();
  const uid = sp.get('user');
  const [page, setPage] = useState(1);
  const path = uid ? `/users/${uid}/posts` : '/posts';
  const { data, pagination, loading, error, reload } = useList(path, page);
  const [f, setF] = useState({ title: '', content: '' });
  const [err, setErr] = useState('');
  const create = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      await api('/posts', { method: 'POST', body: f });
      setF({ title: '', content: '' });
      setPage(1);
      reload();
    } catch (x) {
      setErr(x.message);
    }
  };
  return (<>
    <h1>{uid ? 'Posts by one author' : 'Posts'}</h1>
    {uid && <button className="alt" onClick={() => {
      setSp({});
      setPage(1);
    }}>Show all posts</button>}
    {user && !uid && <form className="card stack" onSubmit={create}>
      <h2>Publish a post</h2>
      <label>Title<input required value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></label>
      <label>Content<textarea rows={4} value={f.content} onChange={(e) => setF({ ...f, content: e.target.value })} /></label>
      {err && <p className="err" role="alert">{err}</p>}
      <button>Publish post</button>
    </form>}
    <Status loading={loading} error={error} empty={!data.length} emptyText="No posts here yet." />
    {data.map((p) => (<div className="card" key={p._id}>
      <h2>{p.title}</h2>
      <p>{p.content}</p>
      <p className="mute">By {p.author ? <a href={`?user=${p.author._id}`} onClick={(e) => {
        e.preventDefault();
        setPage(1);
        setSp({ user: p.author._id });
      }}>
        {p.author.name}
      </a> : 'deleted user'}</p>
    </div>))}
    <Pager pagination={pagination} onPage={setPage} />
  </>);
}
