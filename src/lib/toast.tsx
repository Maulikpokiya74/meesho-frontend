import { useEffect, useState } from 'react';

type Toast = { id: number; text: string; type?: 'success' | 'error' };

let pushFn: (t: Omit<Toast, 'id'>) => void;

export function toast(text: string, type: 'success' | 'error' = 'success') {
  if (pushFn) pushFn({ text, type });
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  useEffect(() => {
    pushFn = ({ text, type }) => {
      const id = Date.now();
      setToasts((t) => [...t, { id, text, type }]);
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
    };
  }, []);

  return (
    <div style={{ position: 'fixed', top: 12, right: 12, zIndex: 2000, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {toasts.map((t) => (
        <div key={t.id} style={{ background: t.type === 'error' ? '#fef2f2' : '#ecfeff', color: '#111827', border: `1px solid ${t.type === 'error' ? '#fecaca' : '#a5f3fc'}`, padding: '8px 12px', borderRadius: 8, minWidth: 220, boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
          {t.text}
        </div>
      ))}
    </div>
  );
}
