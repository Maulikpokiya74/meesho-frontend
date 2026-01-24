import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import http from '../lib/http';

export default function StoreLogin() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [mode, setMode] = useState<'login' | 'create'>('login');
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const login = async () => {
  const res = await http.post('/auth/login', { name, password });
    setToken(res.data.token);
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('storeId', res.data.storeId);
    setMessage('Logged in successfully');
    navigate('/dashboard');
  };

  const createStore = async () => {
  const res = await http.post('/auth/create-store', { name, password });
    if (res.data?.ok) {
      localStorage.setItem('storeId', res.data.id);
      setMessage('Store created! You can now login.');
      setMode('login');
    } else {
      setMessage(res.data?.message ?? 'Unable to create store');
    }
  };

  return (
    <div style={{ minHeight: '70vh', display: 'grid', placeItems: 'center' }}>
      <div style={{ width: 420, background: '#fff', border: '1px solid #e6e6ea', borderRadius: 16, padding: 24, boxShadow: '0 1px 2px rgba(16,24,40,.06)' }}>
        <h2 style={{ marginTop: 0, marginBottom: 12 }}>{mode === 'login' ? 'Store Login' : 'Create a New Store'}</h2>
        <p style={{ marginTop: 0, color: '#6b7280', fontSize: 14 }}>
          {mode === 'login'
            ? 'Sign in to manage your store, customers and products.'
            : 'Create your store account to start managing customers and products.'}
        </p>
        <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
          <input style={{ padding: '10px 12px', border: '1px solid #e6e6ea', borderRadius: 10 }} placeholder="Store name" value={name} onChange={e => setName(e.target.value)} />
          <input style={{ padding: '10px 12px', border: '1px solid #e6e6ea', borderRadius: 10 }} placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          {mode === 'login' ? (
            <button style={{ padding: '10px 12px', background: '#111827', color: '#fff', border: '1px solid #111827', borderRadius: 10, cursor: 'pointer' }} onClick={login}>Login</button>
          ) : (
            <button style={{ padding: '10px 12px', background: '#0f766e', color: '#fff', border: '1px solid #0f766e', borderRadius: 10, cursor: 'pointer' }} onClick={createStore}>Create Store</button>
          )}
          <button style={{ padding: '8px 10px', background: '#ffffff', color: '#374151', border: '1px solid #e5e7eb', borderRadius: 10, cursor: 'pointer' }} onClick={() => setMode(mode === 'login' ? 'create' : 'login')}>
            {mode === 'login' ? 'Create a new store' : 'Back to login'}
          </button>
        </div>
        {message && <p style={{ color: '#1e874b', fontSize: 13, marginTop: 10 }}>{message}</p>}
      </div>
    </div>
  );
}
