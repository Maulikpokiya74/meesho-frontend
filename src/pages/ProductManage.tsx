import http from '../lib/http';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';


const BASE_URL = import.meta.env.VITE_API_URL;

export function fileUrl(path?: string) {
  if (!path) return "";
  return `${BASE_URL}/${path.replace(/^\//, "")}`;
}


function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function ProductManage() {
  const q = useQuery();
  const id = q.get('id');
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', quantity: 0, thresholdLow: 10, thresholdCritical: 5, image: '', blocked: false });
  const [file, setFile] = useState<File | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  useEffect(() => {
    if (id) {
  http.get(`/products/${id}`).then(res => {
        const p = res.data;
  if (p) setForm({ name: p.name, quantity: p.quantity, thresholdLow: p.thresholdLow, thresholdCritical: p.thresholdCritical, image: p.image || '', blocked: !!p.blocked });
      });
  http.get(`/products/${id}/history`).then(res => setHistory(res.data));
    }
  }, [id]);

  const save = async () => {
    const storeId = localStorage.getItem('storeId');
    if (id) {
      // update existing (no file upload in edit for now)
  await http.patch(`/products/${id}`, form);
    } else {
      const fd = new FormData();
      fd.append('storeId', storeId || '');
      fd.append('name', form.name);
      fd.append('quantity', String(form.quantity));
      fd.append('thresholdLow', String(form.thresholdLow));
      fd.append('thresholdCritical', String(form.thresholdCritical));
      if (file) fd.append('image', file);
      const res = await http.post(`/products`, fd, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      // backend returns created product, including image url
      setForm({ ...form, image: res.data?.image || '' });
    }
    navigate('/products');
  };

  const block = async () => { if (!id) return; await http.patch(`/products/${id}`, { blocked: true }); navigate('/products'); };
  const del = async () => { if (!id) return; await http.patch(`/products/${id}`, { delete: true }); navigate('/products'); };

  const filterHistory = async () => {
    if (!id) return;
    const params: any = {};
    if (from) params.from = from;
    if (to) params.to = to;
  const res = await http.get(`/products/${id}/history`, { params });
    setHistory(res.data);
  };

  return (
    <div style={{ margin: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>{id ? 'Edit Product' : 'Create Product'}</h2>
        <button
          onClick={() => navigate('/products')}
          style={{ padding: '8px 12px', background: '#374151', color: '#fff', border: '1px solid #374151', borderRadius: 8, cursor: 'pointer' }}
        >
          Back
        </button>
      </div>
      <div style={{ display: 'grid', gap: 12, maxWidth: 520 }}>
        <label style={{ fontWeight: 600 }}>Product Name
          <input style={{ width: '100%', padding: '10px 12px' }} placeholder="e.g., Cotton Saree" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        </label>
        <label style={{ fontWeight: 600 }}>Quantity
          <input style={{ width: '100%', padding: '10px 12px' }} type="number" placeholder="e.g., 50" value={form.quantity} onChange={e => setForm({ ...form, quantity: Number(e.target.value) })} />
        </label>
        <label style={{ fontWeight: 600 }}>Low Stock Threshold
          <input style={{ width: '100%', padding: '10px 12px' }} type="number" placeholder="e.g., 10 (red border below this)" value={form.thresholdLow} onChange={e => setForm({ ...form, thresholdLow: Number(e.target.value) })} />
        </label>
        <label style={{ fontWeight: 600 }}>Critical Threshold
          <input style={{ width: '100%', padding: '10px 12px' }} type="number" placeholder="e.g., 5" value={form.thresholdCritical} onChange={e => setForm({ ...form, thresholdCritical: Number(e.target.value) })} />
        </label>
        <label style={{ fontWeight: 600 }}>Product Image
          <input style={{ width: '100%', padding: '10px 12px' }} type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} />
        </label>
        {form.image && (
          <img src={fileUrl(form.image)} alt="preview" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e7eb' }} />
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ padding: '10px 12px', background: '#0f766e', color: '#fff', border: '1px solid #0f766e', borderRadius: 10, cursor: 'pointer' }} onClick={save}>{id ? 'Update' : 'Create'}</button>
          {id && (
            <>
              {!form.blocked && (
                <button style={{ padding: '10px 12px', background: '#dc2626', color: '#fff', border: '1px solid #dc2626', borderRadius: 10, cursor: 'pointer' }} onClick={block}>Block</button>
              )}
              <button style={{ padding: '10px 12px', background: '#374151', color: '#fff', border: '1px solid #374151', borderRadius: 10, cursor: 'pointer' }} onClick={del}>Delete</button>
              {form.blocked && (
                <button style={{ padding: '10px 12px', background: '#0f766e', color: '#fff', border: '1px solid #0f766e', borderRadius: 10, cursor: 'pointer' }} onClick={async () => { if (!id) return; await http.patch(`/products/${id}`, { blocked: false }); navigate('/products'); }}>Unblock</button>
              )}
            </>
          )}
        </div>
      </div>

      {id && (
        <div style={{ marginTop: 24 }}>
          <h3>History</h3>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)} />
            <input type="date" value={to} onChange={e => setTo(e.target.value)} />
            <button onClick={filterHistory}>Apply Filter</button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: 8 }}>Date</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Time</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Change</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Type</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h: any, i: number) => {
                const d = new Date(h.date);
                return (
                  <tr key={i}>
                    <td style={{ padding: 8 }}>{d.toLocaleDateString()}</td>
                    <td style={{ padding: 8 }}>{d.toLocaleTimeString()}</td>
                    <td style={{ padding: 8, color: h.type === 'remove' ? '#dc2626' : '#0f766e' }}>
                      {h.type === 'remove' ? `-${h.addedQuantity}` : `+${h.addedQuantity}`}
                    </td>
                    <td style={{ padding: 8 }}>{h.type || 'add'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}