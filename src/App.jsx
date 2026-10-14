import { NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { Protected, useAuth } from './auth.jsx';
import { Login, Register, Dashboard, Profile } from './pages/Account.jsx';
import { NotesList, NoteDetail, NoteForm } from './pages/Notes.jsx';
import { AdminHome, AdminUsers, AdminNotes, AdminInterests } from './pages/Admin.jsx';
import Posts from './pages/Posts.jsx';

export default function App() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const P = (c, admin) => <Protected admin={admin}>{c}</Protected>;
  return (<>
    <nav>
      <NavLink to="/">Dashboard</NavLink>
      <NavLink to="/notes">Notes</NavLink>
      <NavLink to="/posts">Posts</NavLink>
      {user?.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
      <span className="sp" />
      {user ? (<>
        <NavLink to="/profile">{user.name}</NavLink>
        <a href="#" onClick={async (e) => {
          e.preventDefault();
          await logout();
          nav('/login');
        }}>Log out</a>
      </>)
        : (<>
          <NavLink to="/login">Log in</NavLink>
          <NavLink to="/register">Register</NavLink>
        </>)}
    </nav>
    <main>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={P(<Dashboard />)} />
        <Route path="/profile" element={P(<Profile />)} />
        <Route path="/notes" element={P(<NotesList />)} />
        <Route path="/notes/new" element={P(<NoteForm />)} />
        <Route path="/notes/:id" element={P(<NoteDetail />)} />
        <Route path="/notes/:id/edit" element={P(<NoteForm />)} />
        <Route path="/posts" element={<Posts />} />
        <Route path="/admin" element={P(<AdminHome />, true)} />
        <Route path="/admin/users" element={P(<AdminUsers />, true)} />
        <Route path="/admin/notes" element={P(<AdminNotes />, true)} />
        <Route path="/admin/interests" element={P(<AdminInterests />, true)} />
        <Route path="*" element={<p>Page not found.</p>} />
      </Routes>
    </main>
  </>);
}
