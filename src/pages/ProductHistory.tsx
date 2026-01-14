import http from '../lib/http';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function ProductHistory() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [history, setHistory] = useState<any[]>([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
    const [type, setType] = useState<string>('');

  const load = async () => {
    const params: any = {};
    if (from) params.from = from;
    if (to) params.to = to;
      if (type) params.type = type;
  const res = await http.get(`/products/${id}/history`, { params });
    setHistory(res.data);
  };

  useEffect(() => { load(); }, [id]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Product History</h2>
        <button
          onClick={() => navigate('/products')}
          style={{ padding: '8px 12px', background: '#374151', color: '#fff', border: '1px solid #374151', borderRadius: 8, cursor: 'pointer' }}
        >
          Back
        </button>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <input type="date" value={from} onChange={e => setFrom(e.target.value)} />
        <input type="date" value={to} onChange={e => setTo(e.target.value)} />
          <select value={type} onChange={e => setType(e.target.value)}>
            <option value="">All</option>
            <option value="add">Add</option>
            <option value="remove">Remove</option>
          </select>
        <button onClick={load}>Apply Filter</button>
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
  );
}