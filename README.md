# Notes App: Frontend

React single-page app for the Notes backend. Built with Vite, React 18 and React Router 6, using plain `fetch` and React hooks.

## Features

- Register, login and logout
- Dashboard and profile page (edit name and interests)
- Notes: paginated list, detail view, create, edit and delete
- Public posts feed with pagination; click an author to see only that author's posts
- Signed-in users can publish a post from the posts page
- Admin area (visible only to admins):
  - user management: list, create, promote or demote, delete
  - all notes, with an owner-ID filter
  - users grouped by interest
- Loading, empty and error states on every list; server validation messages are shown in forms
- Protected routes and admin-only routes

## Prerequisites

- Node.js 18 or newer
- The backend running (default `http://localhost:4000`)

## Setup

```bash
cd frontend
npm install
cp .env.example .env
```

### Environment variables

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the API, including `/api`. Default: `http://localhost:4000/api` |

Make sure the backend's `CORS_ORIGINS` includes the origin you open the app on (default `http://localhost:5173`).

## Running

```bash
npm run dev       # dev server at http://localhost:5173
npm run build     # production build in dist/
npm run preview   # serve the production build locally
npm run format    # format with Prettier
```

## Project structure

```
src/
  main.jsx          app entry; wraps the app in Router and AuthProvider
  App.jsx           navigation bar and route table
  api.js            fetch client: base URL, bearer token, error handling, 401 handler
  auth.jsx          AuthProvider, useAuth hook, Protected route guard
  ui.jsx            useList hook (paginated fetching), Status and Pager components
  styles.css        all styling
  pages/
    Account.jsx     Login, Register, Dashboard, Profile
    Notes.jsx       NotesList, NoteDetail, NoteForm (create and edit)
    Posts.jsx       public posts, posts by author, publish form
    Admin.jsx       AdminHome, AdminUsers, AdminNotes, AdminInterests
```

## Routes

| Path | Access |
|---|---|
| `/login`, `/register` | public |
| `/posts` | public (`?user=<id>` shows one author's posts) |
| `/` , `/profile` | signed in |
| `/notes`, `/notes/new`, `/notes/:id`, `/notes/:id/edit` | signed in |
| `/admin`, `/admin/users`, `/admin/notes`, `/admin/interests` | admin only |

## How authentication works

- After login or registration the API returns a short-lived access token. The app keeps it in `sessionStorage` and sends it as `Authorization: Bearer <token>`.
- `sessionStorage` is cleared when the tab closes. Logging out also revokes the token on the server.
- If any request returns 401, the app clears the session and redirects to the login page.
- Route guards (`Protected`, admin check) and hiding admin links are only for user experience. The backend enforces every permission, so changing client-side state cannot grant admin access.

## Using the app with a fresh database

1. Start MongoDB and the backend, then run `npm run seed:admin` in the backend to create the first admin.
2. Start this frontend and log in with the admin credentials, or register a normal user.
3. Admins can open the Admin menu to manage users and view all notes and the interest grouping.

## Manual verification checklist

1. Register a user, then log out and log in again.
2. Create, edit, view and delete a note; create more than 10 notes and check the pagination controls.
3. Register a second user and confirm they do not see the first user's notes.
4. Log in as a normal user and open `/admin`; you should be redirected away, and direct API calls to `/api/admin/*` return 403.
5. Log in as admin: create a user, change a role, delete a user, filter notes by owner ID, and open the interest grouping page.
6. Publish a post, open `/posts`, and click the author name to see only their posts.
7. Log out, then try the browser's back button to a protected page; you should be sent to login.

## Testing

This version has no automated frontend tests. Use the checklist above to verify the flows manually.

## Troubleshooting

- **Network error or failed fetch:** the backend is not running, or `VITE_API_URL` is wrong. Restart `npm run dev` after changing `.env`.
- **CORS error in the browser console:** add the frontend origin (for example `http://localhost:5173`) to the backend's `CORS_ORIGINS` and restart the backend.
- **Logged out unexpectedly:** the access token lasts 15 minutes by default, so log in again.
- **Admin menu is missing:** the signed-in account has the `user` role. Admins are created with the backend seed script or by another admin.
