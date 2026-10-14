import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import { api } from '../api.js';

const csv = (s) => s.split(',').map((x) => x.trim()).filter(Boolean);

function AuthForm({ mode }) {
  const { login, register } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ name: '', email: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      mode === 'login' ? await login({ email: f.email, password: f.password }) : await register(f);
      nav('/');
    } catch (x) {
      setErr(x.message);
    } finally {
      setBusy(false);
    }
  };
  return (<>
    <h1>
      {mode === 'login' ? 'Log in' : 'Create your account'}
    </h1>
    <form className="stack" onSubmit={submit}>
      {mode === 'register' && <label>Name<input required value={f.name} onChange={set('name')} /></label>}
      <label>Email<input type="email" required value={f.email} onChange={set('email')} /></label>
      <label>Password{mode === 'register' && ' (8+ characters)'}<input type="password" required minLength={mode === 'register' ? 8 : 1} value={f.password} onChange={set('password')} /></label>
      {err && <p className="err" role="alert">{err}</p>}
      <button disabled={busy}>
        {busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
      </button>
    </form>
  </>);
}

export const Login = () => <AuthForm mode="login" />;
export const Register = () => <AuthForm mode="register" />;

export function Dashboard() {
  const { user } = useAuth();
  return (<>
    <h1>Welcome, {user.name}</h1>
    <div className="card">
      <div className="row">
        <Link className="btn" to="/notes/new">Write a note</Link>
        <Link to="/notes">Your notes</Link>
        <Link to="/profile">Edit profile</Link>
      </div>
    </div>
    {user.role === 'admin' && <div className="card">
      <Link to="/admin">Open admin tools</Link>
    </div>}
  </>);
}

export function Profile() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user.name);
  const [interests, setInterests] = useState(user.interests.join(', '));
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const save = async (e) => {
    e.preventDefault();
    setMsg('');
    setErr('');
    try {
      const r = await api('/users/me', {
        method: 'PUT',
        body: { name, interests: csv(interests) }
      });
      setUser(r.data);
      setMsg('Profile saved');
    } catch (x) {
      setErr(x.message);
    }
  };
  return (<>
    <h1>Your profile</h1>
    <p className="mute">{user.email} · role: {user.role}</p>
    <form className="stack" onSubmit={save}>
      <label>Name<input required value={name} onChange={(e) => setName(e.target.value)} /></label>
      <label>Interests (comma separated)<input value={interests} onChange={(e) => setInterests(e.target.value)} /></label>
      {msg && <p className="ok">{msg}</p>}
      {err && <p className="err" role="alert">{err}</p>}
      <button>Save profile</button>
    </form>
  </>);
}
