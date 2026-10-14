import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { Pager, Status, useList } from '../ui.jsx';

export const AdminHome = () => (<>
  <h1>Admin</h1>
  <div className="card row">
    <Link to="/admin/users">Manage users</Link>
    <Link to="/admin/notes">All notes</Link>
    <Link to="/admin/interests">Users by interest</Link>
  </div>
</>);

export function AdminUsers() {
  const { user: me } = useAuth();
  const [page, setPage] = useState(1);
  const { data, pagination, loading, error, reload } = useList('/admin/users', page);
  const [f, setF] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    interests: ''
  });
  const [err, setErr] = useState('');
  const act = async (fn) => {
    setErr('');
    try {
      await fn();
      reload();
    } catch (x) {
      setErr(x.message);
    }
  };
  const create = (e) => {
    e.preventDefault();
    act(async () => {
      await api('/admin/users', {
        method: 'POST',
        body: {
          ...f,
          interests: f.interests.split(',').map((s) => s.trim()).filter(Boolean)
        }
      });
      setF({
        name: '',
        email: '',
        password: '',
        role: 'user',
        interests: ''
      });
    });
  };
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (<>
    <h1>Manage users</h1>
    <form className="card stack" onSubmit={create}>
      <h2>Add a user</h2>
      <label>Name<input required value={f.name} onChange={set('name')} /></label>
      <label>Email<input type="email" required value={f.email} onChange={set('email')} /></label>
      <label>Password<input type="password" required minLength={8} value={f.password} onChange={set('password')} /></label>
      <label>Role<select value={f.role} onChange={set('role')}>
        <option value="user">user</option>
        <option value="admin">admin</option>
      </select></label>
      <label>Interests (comma separated)<input value={f.interests} onChange={set('interests')} /></label>
      <button>Create user</button>
    </form>
    <Status loading={loading} error={error || err} empty={!data.length} emptyText="No users found." />
    {!!data.length && <div className="scroll">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Interests</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {data.map((u) => (<tr key={u._id}>
            <td>{u.name}</td>
            <td>{u.email}</td>
            <td>{u.role}</td>
            <td>{u.interests.join(', ')}</td>
            <td>
              <div className="row">
                <button className="alt" onClick={() => act(() => api(`/admin/users/${u._id}`, {
                  method: 'PUT',
                  body: {
                    role: u.role === 'admin' ? 'user' : 'admin'
                  }
                }))}>Make {u.role === 'admin' ? 'user' : 'admin'}</button>
                <button className="danger" disabled={u._id === me._id} onClick={() => confirm(`Delete ${u.email} and their notes?`) && act(() => api(`/admin/users/${u._id}`, { method: 'DELETE' }))}>Delete</button>
              </div>
            </td>
          </tr>))}
        </tbody>
      </table>
    </div>}
    <Pager pagination={pagination} onPage={setPage} />
  </>);
}

export function AdminNotes() {
  const [page, setPage] = useState(1);
  const [owner, setOwner] = useState('');
  const [applied, setApplied] = useState('');
  const { data, pagination, loading, error } = useList('/admin/notes', page, applied ? `&owner=${applied}` : '');
  return (<>
    <h1>All notes</h1>
    <form className="row" onSubmit={(e) => {
      e.preventDefault();
      setPage(1);
      setApplied(owner.trim());
    }}>
      <input placeholder="Filter by owner ID" value={owner} onChange={(e) => setOwner(e.target.value)} />
      <button>Filter</button>
      {applied && <button type="button" className="alt" onClick={() => {
        setOwner('');
        setApplied('');
        setPage(1);
      }}>Clear</button>}
    </form>
    <Status loading={loading} error={error} empty={!data.length} emptyText="No notes match." />
    {data.map((n) => (<div className="card" key={n._id}>
      <h2>{n.title}</h2>
      <p className="mute">{n.owner ? `${n.owner.name} (${n.owner.email})` : 'Unknown owner'} · {n.owner?._id}</p>
      <p>{n.content.slice(0, 200)}</p>
    </div>))}
    <Pager pagination={pagination} onPage={setPage} />
  </>);
}

export function AdminInterests() {
  const [page, setPage] = useState(1);
  const { data, pagination, loading, error } = useList('/admin/users/interests', page);
  return (<>
    <h1>Users by interest</h1>
    <Status loading={loading} error={error} empty={!data.length} emptyText="No user has set interests yet." />
    {data.map((g) => (<div className="card" key={g.interest}>
      <h2>{g.interest} <span className="mute">({g.userCount})</span></h2>
      <p>
        {g.users.map((u) => `${u.name} <${u.email}>`).join(', ')}
      </p>
    </div>))}
    <Pager pagination={pagination} onPage={setPage} />
  </>);
}
