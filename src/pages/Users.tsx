  import http from '../lib/http';
  import { useEffect, useState } from 'react';
  import styles from './Users.module.css';

export default function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [password, setPassword] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [description, setDescription] = useState('');
  const [newUser, setNewUser] = useState({ name: '', password: '' });
  const [authModal, setAuthModal] = useState<{ open: boolean; user?: any }>({ open: false });
  const [authPassword, setAuthPassword] = useState('');
  const [error, setError] = useState<string>('');

  const load = async () => {
    const storeId = localStorage.getItem('storeId');
    if (!storeId) {
      setError('No store selected. Please login/store first.');
      setUsers([]);
      return;
    }
    setError('');
    const res = await http.get('/users', { params: { storeId } });
    setUsers(res.data || []);
  };

  useEffect(() => { load(); }, []);

  const openUser = (u: any) => {
    setAuthModal({ open: true, user: u });
    setAuthPassword('');
    setSelected(null);
  };
  const closeAuth = () => setAuthModal({ open: false });
  const submitAuth = async () => {
    if (!authModal.user) return;
    // Lightweight verification by attempting a no-op entry (amount 0) or call a headless verify endpoint if available.
    if (!authPassword) return alert('Enter password');
    console.log("dsds");
    
    try {
  await http.post(`/users/${authModal.user._id}/verify`, { password: authPassword });
  // Navigate to the dedicated entries page in add mode
  window.location.href = `/users/entries?id=${authModal.user._id}&mode=add`;
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Authentication failed');
    }
  };
  const addUser = async () => {
    const storeId = localStorage.getItem('storeId');
    if (!newUser.name || !newUser.password) return alert('Enter name and password');
    await http.post('/users', { storeId, name: newUser.name, password: newUser.password });
    setNewUser({ name: '', password: '' });
    await load();
    alert('User added');
  };
  const addEntry = async () => {
    if (!selected) return;
  await http.post(`/users/${selected._id}/entries`, { password, amount, type, description });
    alert('Entry added');
    // Reload entries for the selected user
    const res = await http.get(`/users`, { params: { storeId: localStorage.getItem('storeId') } });
    const fresh = (res.data || []).find((x: any) => x._id === selected._id) || selected;
    if (fresh && fresh.entries) {
      fresh.entries.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    setSelected(fresh);
    setAmount(0);
    setType('income');
    setDescription('');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>Users</div>
        <button className={`${styles.button} ${styles.secondary}`} onClick={load}>Refresh</button>
      </div>
      {error && <div style={{ color: '#dc2626', marginBottom: 8 }}>{error}</div>}
      <div className={`${styles.card}`} style={{ marginBottom: 12 }}>
        <div className={styles.row}>
          <input className={styles.input} placeholder="New user name" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} />
          <input className={styles.input} placeholder="Password" type="password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
          <button className={styles.button} onClick={addUser}>Add User</button>
        </div>
      </div>
      <div className={styles.card}>
        {users.length === 0 ? (
          <div style={{ color: '#6b7280' }}>No users found.</div>
        ) : (
          <ul className={styles.list}>
            {users.map(u => (
              <li key={u._id} className={styles.listItem}>
                <div className={styles.cardContent}>
                  <h4 className={styles.userName}>{u.name}</h4>
                  <p className={styles.userId}>ID: {u._id.slice(-6)}</p>
                  <div className={styles.actions}>
                    <button className={styles.button} onClick={() => openUser(u)}>Add Entry</button>
                    <a className={`${styles.button} ${styles.secondary}`} href={`/users/entries?id=${u._id}&mode=view`}>View Entries</a>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selected && (
        <div className={styles.card} style={{ marginTop: 12 }}>
          <div className={styles.header}>
            <div className={styles.title}>Add Entry for {selected.name}</div>
          </div>
          <div className={styles.row} style={{ marginBottom: 8 }}>
            <input className={styles.input} placeholder="Password" value={styles.password} onChange={e => setPassword(e.target.value)} />
            <input className={styles.input} type="number" placeholder="Amount" value={amount} onChange={e => setAmount(Number(e.target.value))} />
            <select className={styles.input} value={type} onChange={e => setType(e.target.value as any)}>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          <div className={styles.row}>
            <input className={styles.input} placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
            <button className={styles.button} onClick={addEntry}>Add</button>
          </div>
          <div style={{ marginTop: 16 }}>
            <div className={styles.title} style={{ fontSize: 18 }}>Entries</div>
            {(!selected.entries || selected.entries.length === 0) ? (
              <div style={{ color: '#6b7280' }}>No entries yet.</div>
            ) : (
              <table className={styles.entriesTable}>
                <thead>
                  <tr>
                    <th className={styles.th}>Date</th>
                    <th className={styles.th}>Type</th>
                    <th className={`${styles.th} ${styles.tdRight}`}>Amount</th>
                    <th className={styles.th}>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.entries.map((en: any, idx: number) => (
                    <tr key={idx}>
                      <td className={styles.td} data-label="Date"><span className={styles.value}>{new Date(en.date).toLocaleString()}</span></td>
                      <td className={styles.td} data-label="Type"><span className={styles.value}>{en.type}</span></td>
                      <td className={`${styles.td} ${styles.tdRight} ${en.type === 'income' ? styles.income : styles.expense}`} data-label="Amount"><span className={styles.value}>{en.type === 'income' ? '+' : '-'}{en.amount}</span></td>
                      <td className={styles.td} data-label="Description"><span className={styles.value}>{en.description}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {authModal.open && (
        <div onClick={closeAuth} className={styles.modalBackdrop}>
          <div onClick={e => e.stopPropagation()} className={styles.modal}>
            <div className={styles.title} style={{ fontSize: 18 }}>Authenticate User</div>
            <div style={{ marginTop: 8 }}>
              <label style={{ display: 'block', fontWeight: 600 }}>Name</label>
              <input className={styles.input} value={authModal.user?.name || ''} readOnly />
            </div>
            <div style={{ marginTop: 8 }}>
              <label style={{ display: 'block', fontWeight: 600 }}>Password</label>
              <input className={styles.input} type="password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} />
            </div>
            <div className={styles.modalActions}>
              <button className={`${styles.button} ${styles.secondary}`} onClick={closeAuth}>Cancel</button>
              <button className={styles.button} onClick={submitAuth}>Proceed</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
