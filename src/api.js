const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Short-lived access token kept in sessionStorage (cleared when the tab closes; server revokes it on logout).
let token = sessionStorage.getItem('token');

let onUnauthorized = () => { };

export const setToken = (t) => {
  token = t;
  t ? sessionStorage.setItem('token', t) : sessionStorage.removeItem('token');
};

export const getToken = () => token;

export const setUnauthorizedHandler = (f) => {
  onUnauthorized = f;
};

export async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(BASE + path, {
    method,
    body: body && JSON.stringify(body),
    headers: {
      ...(body && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` })
    }
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && token) {
      setToken(null);
      onUnauthorized();
    }
    const msg = json.error?.message || 'Request failed';
    const d = json.error?.details?.map((x) => `${x.path}: ${x.message}`).join('; ');
    throw new Error(d ? `${msg} (${d})` : msg);
  }
  return json;
}
