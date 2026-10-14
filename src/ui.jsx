import { useCallback, useEffect, useState } from 'react';
import { api } from './api.js';

export function useList(path, page, extra = '') {
  const [s, setS] = useState({
    data: [],
    pagination: null,
    loading: true,
    error: ''
  });
  const load = useCallback(() => {
    setS((p) => ({ ...p, loading: true, error: '' }));
    api(`${path}?page=${page}&limit=10${extra}`)
      .then((r) => setS({
        data: r.data,
        pagination: r.pagination,
        loading: false,
        error: ''
      }))
      .catch((e) => setS({
        data: [],
        pagination: null,
        loading: false,
        error: e.message
      }));
  }, [path, page, extra]);
  useEffect(load, [load]);
  return { ...s, reload: load };
}

export function Status({ loading, error, empty, emptyText }) {
  if (loading) return <p className="mute">Loading…</p>;
  if (error)
    return <p className="err" role="alert">{error}</p>;
  if (empty)
    return <p className="mute">{emptyText}</p>;
  return null;
}

export function Pager({ pagination, onPage }) {
  if (!pagination || pagination.totalPages <= 1) return null;
  const { page, totalPages, total } = pagination;
  return (<div className="row">
    <button className="alt" disabled={page <= 1} onClick={() => onPage(page - 1)}>Previous</button>
    <span>Page {page} of {totalPages} ({total} total)</span>
    <button className="alt" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>Next</button>
  </div>);
}
