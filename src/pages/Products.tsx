import http from '../lib/http';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Remove custom ImportMeta and ImportMetaEnv interfaces, Vite provides these types automatically.

const BASE_URL = import.meta.env.VITE_API_URL;

export function fileUrl(path?: string) {
  if (!path) return "";
  return `${BASE_URL}/${path.replace(/^\//, "")}`;
}

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [viewerSrc, setViewerSrc] = useState<string | null>(null);
  // filters & paging
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'blocked' | 'unblocked'>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'low'>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    const storeId = localStorage.getItem('storeId');
    const token = localStorage.getItem('token');
  http.get('/products', {
      params: { storeId },
    }).then(res => setProducts(res.data));
  }, []);

  const refresh = async () => {
    const storeId = localStorage.getItem('storeId');
    const res = await http.get('/products', { params: { storeId } });
    setProducts(res.data);
  };

  // derived filtered list
  const filtered = useMemo(() => {
    let list = products;
    // search by name only
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((p) => String(p.name || '').toLowerCase().includes(q));
    }
    // blocked/unblocked filter
    if (statusFilter === 'blocked') list = list.filter((p) => !!p.blocked);
    if (statusFilter === 'unblocked') list = list.filter((p) => !p.blocked);
  // low stock filter: quantity < 10
  if (stockFilter === 'low') list = list.filter((p) => (p.quantity ?? 0) < 10);
    return list;
  }, [products, search, statusFilter, stockFilter]);

  // reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, stockFilter, pageSize]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageStart = (page - 1) * pageSize;
  const pageEnd = Math.min(total, pageStart + pageSize);
  const visible = filtered.slice(pageStart, pageEnd);

  const addQty = async (id: string) => {
    const input = window.prompt('Add quantity');
    if (!input) return;
    const n = Number(input);
    if (!Number.isFinite(n) || n <= 0) return alert('Please enter a positive number');
    await http.post(`/products/${id}/history`, { addedQuantity: n });
    refresh();
  };

  const removeQty = async (id: string) => {
    const input = window.prompt('Remove quantity');
    if (!input) return;
    const n = Number(input);
    if (!Number.isFinite(n) || n <= 0) return alert('Please enter a positive number');
    await http.post(`/products/${id}/history/remove`, { removedQuantity: n });
    refresh();
  };

  const unblock = async (id: string) => {
    await http.patch(`/products/${id}`, { blocked: false });
    refresh();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <h2 style={{ marginRight: 'auto' }}>Products</h2>
        <input
          placeholder="Search by name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 8, minWidth: 220 }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          title="Filter by status"
          style={{ padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 8 }}
        >
          <option value="all">All</option>
          <option value="unblocked">Unblocked</option>
          <option value="blocked">Blocked</option>
        </select>
        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value as any)}
          title="Low stock filter"
          style={{ padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 8 }}
        >
          <option value="all">All Stock</option>
          <option value="low">Low Only</option>
        </select>
        <select
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          title="Page size"
          style={{ padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 8 }}
        >
          <option value={10}>10 / page</option>
          <option value={20}>20 / page</option>
          <option value={50}>50 / page</option>
        </select>
        <button style={{ padding: '10px 12px', background: '#0f766e', color: '#fff', border: '1px solid #0f766e', borderRadius: 10, cursor: 'pointer' }} onClick={() => navigate('/products/manage')}>Create Product</button>
      </div>

      <div style={{ marginTop: 8, fontSize: 13, color: '#6b7280' }}>
        Showing {total === 0 ? 0 : pageStart + 1}-{pageEnd} of {total}
      </div>

      <ul>
        {visible.map(p => (
          <li key={p._id} style={{ display: 'flex', alignItems: 'center', gap: 10, border: p.quantity < p.thresholdLow ? '3px solid red' : '1px solid gray', padding: 8, margin: 10 }}>
            {p.image && (
              <img
                src={fileUrl(p.image)}
                alt={p.name}
                style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6, cursor: 'zoom-in' }}
                onClick={() => setViewerSrc(fileUrl(p.image))}
              />
            )}
            <span>
              {p.name} - Qty: {p.quantity}
              {p.blocked && (
                <span style={{ marginLeft: 8, padding: '2px 6px', background: '#dc2626', color: '#fff', borderRadius: 6, fontSize: 12 }}>Blocked</span>
              )}
            </span>
            <button style={{ marginLeft: 8 }} onClick={() => navigate(`/products/${p._id}/history`)}>Info</button>
            <button style={{ marginLeft: 8 }} onClick={() => navigate(`/products/manage?id=${p._id}`)}>Edit</button>
            {p.blocked && (
              <button style={{ marginLeft: 8, background: '#0f766e', color: '#fff', border: '1px solid #0f766e', borderRadius: 8, padding: '6px 10px', cursor: 'pointer' }} onClick={() => unblock(p._id)}>
                Unblock
              </button>
            )}
            <button style={{ marginLeft: 8 }} disabled={!!p.blocked} title={p.blocked ? 'Product is blocked' : undefined} onClick={() => addQty(p._id)}>Add Qty</button>
            <button style={{ marginLeft: 8 }} disabled={!!p.blocked} title={p.blocked ? 'Product is blocked' : undefined} onClick={() => removeQty(p._id)}>Remove Qty</button>
          </li>
        ))}
        {visible.length === 0 && (
          <li style={{ padding: 12, margin: 10, border: '1px dashed #e5e7eb', color: '#6b7280' }}>No products found</li>
        )}
      </ul>

      {/* pagination controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginTop: 12 }}>
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
          style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: page <= 1 ? '#f3f4f6' : '#fff', cursor: page <= 1 ? 'not-allowed' : 'pointer' }}
        >
          Prev
        </button>
        <span style={{ minWidth: 90, textAlign: 'center' }}>Page {page} / {totalPages}</span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
          style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: page >= totalPages ? '#f3f4f6' : '#fff', cursor: page >= totalPages ? 'not-allowed' : 'pointer' }}
        >
          Next
        </button>
      </div>

      {viewerSrc && (
        <div
          onClick={() => setViewerSrc(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          }}
        >
          <img
            src={viewerSrc}
            alt="preview"
            style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', boxShadow: '0 10px 40px rgba(0,0,0,0.6)', borderRadius: 8 }}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setViewerSrc(null)}
            style={{ position: 'fixed', top: 20, right: 20, padding: '8px 12px', background: '#111827', color: '#fff', border: '1px solid #111827', borderRadius: 8, cursor: 'pointer' }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
