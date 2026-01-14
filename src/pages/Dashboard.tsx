import http from '../lib/http';
import { useEffect, useMemo, useState } from 'react';
import styles from './Dashboard.module.css';

type UserRow = {
  _id: string;
  name: string;
  contact?: string;
  marketplace?: string;
  orders?: number;
  totalSpent?: number;
  status?: 'active' | 'inactive' | 'blocked';
  entries: { amount: number; type: 'income' | 'expense'; description: string; date: string }[];
};

export default function Dashboard() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<'orders' | 'totalSpent' | 'name'>('name');

  useEffect(() => {
    const storeId = localStorage.getItem('storeId');
  http.get('/users', { params: { storeId } }).then(res => setUsers(res.data));
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return [...users]
      .filter(u => !q || u.name.toLowerCase().includes(q) || (u.contact ?? '').toLowerCase().includes(q))
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'orders') return (a.orders ?? 0) - (b.orders ?? 0);
        // Sort by computed total spent = sum of expense entries
        const aSpent = (a.entries || []).reduce((s, e) => s + (e.type === 'expense' ? e.amount : 0), 0);
        const bSpent = (b.entries || []).reduce((s, e) => s + (e.type === 'expense' ? e.amount : 0), 0);
        return aSpent - bSpent;
      });
  }, [users, query, sortBy]);

  const totals = useMemo(() => {
    const usersTotal = users.reduce((sum, u) => {
      const bal = u.entries.reduce((s, e) => s + (e.type === 'income' ? e.amount : -e.amount), 0);
      return sum + bal;
    }, 0);
    return { usersTotal, shopTotal: 0 };
  }, [users]);

  const statusClass = (s?: UserRow['status']) =>
    s === 'active' ? `${styles.status} ${styles.active}` : s === 'blocked' ? `${styles.status} ${styles.blocked}` : `${styles.status} ${styles.inactive}`;

  return (
    <main className={styles.content}>

        <div className={styles.toolbar}>
          <input placeholder="Search..." value={query} onChange={e => setQuery(e.target.value)} />
          <button onClick={() => setSortBy('name')}>Sort By Name</button>
          <button onClick={() => setSortBy('totalSpent')}>Sort By Total Spent</button>
        </div>

  <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Customer Name</th>
                
                <th>Total Income</th>
                <th>Total Expense</th>
                <th>Net Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr key={u._id}>
                  <td>{`CUST-${String(i + 24).padStart(3, '0')}`}</td>
                  <td>{u.name}</td>
                  
                  <td>{`$${((u.entries || []).reduce((s, e) => s + (e.type === 'income' ? e.amount : 0), 0)).toLocaleString()}`}</td>
                  <td>{`$${((u.entries || []).reduce((s, e) => s + (e.type === 'expense' ? e.amount : 0), 0)).toLocaleString()}`}</td>
                  <td>{`$${(((u.entries || []).reduce((s, e) => s + (e.type === 'income' ? e.amount : 0), 0)) - ((u.entries || []).reduce((s, e) => s + (e.type === 'expense' ? e.amount : 0), 0))).toLocaleString()}`}</td>
                  <td><span className={statusClass(u.status)}>{u.status ?? 'inactive'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className={styles.footer}>
            <span>1 - {Math.min(filtered.length, 10)} of {filtered.length} entries</span>
            <span>
              <button>Previous</button> <button>Next</button>
            </span>
          </div>
    </div>
  </main>
  );
}
