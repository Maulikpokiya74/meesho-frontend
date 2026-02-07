import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import http from "../lib/http";
import styles from "./Users.module.css";

export default function UserEntries() {
  const [user, setUser] = useState<any | null>(null);
  const [error, setError] = useState<string>("");
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [type, setType] = useState<"income" | "expense">("income");
  const [description, setDescription] = useState("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">(
    "all"
  );
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const mode = (search.get("mode") || "view") as "add" | "view";

  useEffect(() => {
    if (user?.password) {
      setPassword(user.password);
    }
  }, [user]);

  const load = async () => {
    const storeId = localStorage.getItem("storeId");
    const userId = search.get("id");
    if (!storeId || !userId) {
      setError("Missing store or user.");
      return;
    }
    setError("");
    const res = await http.get("/users", { params: { storeId } });
    const found = (res.data || []).find((x: any) => x._id === userId);
    if (!found) setError("User not found");
    if (found) {
      found.entries = found.entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    setUser(found || null);
  };

  useEffect(() => {
    load();
  }, []);

  const addEntry = async () => {
    if (!user) return;
    if (!Number.isFinite(amount) || amount === 0) {
      alert("Amount is required and must be non-zero");
      return;
    }
    if (!description.trim()) {
      alert("Description is required");
      return;
    }
    await http.post(`/users/${user._id}/entries`, {
      password,
      amount,
      type,
      description,
    });
    const res = await http.get("/users", {
      params: { storeId: localStorage.getItem("storeId") },
    });
    const fresh = (res.data || []).find((x: any) => x._id === user._id) || user;
    if (fresh && fresh.entries) {
      fresh.entries.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    setUser(fresh);
    setAmount(0);
    setType("income");
    setDescription("");
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button
          className={`${styles.button} ${styles.secondary}`}
          onClick={() => navigate(-1)}
        >
          Back
        </button>
        <div className={styles.title}>User Entries</div>
        <div />
      </div>
      {error && (
        <div style={{ color: "#dc2626", marginBottom: 8 }}>{error}</div>
      )}
      {!user ? (
        <div style={{ color: "#6b7280" }}>Loading…</div>
      ) : (
        <div className={styles.card}>
          {mode === "add" && (
            <>
              <div
                className={styles.title}
                style={{ fontSize: 22, marginBottom: 12 }}
              >
                Add Entry
              </div>
              <div style={{ marginBottom: 10 }}>
                <label
                  style={{ display: "block", fontWeight: 600, marginBottom: 6 }}
                >
                  User
                </label>
                <div className={styles.input} style={{ padding: "10px 12px" }}>
                  {user.name}
                </div>
              </div>
              <div style={{ marginBottom: 10 }}>
                <input
                  className={styles.input}
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  hidden
                />
              </div>
              <div style={{ marginBottom: 10 }}>
                <label
                  style={{ display: "block", fontWeight: 600, marginBottom: 6 }}
                >
                  Amount
                </label>
                <input
                  className={styles.input}
                  type="number"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                />
              </div>
              <div style={{ marginBottom: 10 }}>
                <label
                  style={{ display: "block", fontWeight: 600, marginBottom: 6 }}
                >
                  Type
                </label>
                <select
                  className={styles.input}
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label
                  style={{ display: "block", fontWeight: 600, marginBottom: 6 }}
                >
                  Description
                </label>
                <input
                  className={styles.input}
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  list="description-options"
                />
                <datalist id="description-options">
                  <option value="Product" />
                  <option value="Box" />
                  <option value="Review" />
                </datalist>
              </div>
              <button className={styles.button} onClick={addEntry}>
                Create
              </button>
              <div style={{ marginTop: 16 }} />
            </>
          )}

          <div style={{ marginTop: 16 }}>
            {/* Filters */}
            <div className={styles.row} style={{ marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <label
                  style={{ display: "block", fontWeight: 600, marginBottom: 6 }}
                >
                  From
                </label>
                <input
                  className={styles.input}
                  type="date"
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label
                  style={{ display: "block", fontWeight: 600, marginBottom: 6 }}
                >
                  To
                </label>
                <input
                  className={styles.input}
                  type="date"
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label
                  style={{ display: "block", fontWeight: 600, marginBottom: 6 }}
                >
                  Type
                </label>
                <select
                  className={styles.input}
                  value={filterType}
                  onChange={(e) => {
                    setFilterType(e.target.value as any);
                    setPage(1);
                  }}
                >
                  <option value="all">All</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
            </div>

            {!user.entries || user.entries.length === 0 ? (
              <div style={{ color: "#6b7280" }}>No entries yet.</div>
            ) : (
              (() => {
                // Filter entries
                const start = fromDate ? new Date(fromDate) : null;
                const end = toDate ? new Date(toDate) : null;
                const filtered = user.entries.filter((en: any) => {
                  const d = new Date(en.date);
                  if (start && d < start) return false;
                  if (end) {
                    const endOfDay = new Date(end);
                    endOfDay.setHours(23, 59, 59, 999);
                    if (d > endOfDay) return false;
                  }
                  if (filterType !== "all" && en.type !== filterType)
                    return false;
                  return true;
                });
                const totalPages = Math.max(
                  1,
                  Math.ceil(filtered.length / pageSize)
                );
                const currentPage = Math.min(page, totalPages);
                const startIdx = (currentPage - 1) * pageSize;
                const pageEntries = filtered.slice(
                  startIdx,
                  startIdx + pageSize
                );
                const onPrev = () => setPage(Math.max(1, currentPage - 1));
                const onNext = () =>
                  setPage(Math.min(totalPages, currentPage + 1));
                return (
                  <table className={styles.entriesTable}>
                    <thead>
                      <tr>
                        <th className={styles.th}>Date</th>
                        <th className={styles.th}>Type</th>
                        <th className={`${styles.th} ${styles.tdRight}`}>
                          Amount
                        </th>
                        <th className={styles.th}>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageEntries.map((en: any, idx: number) => (
                        <tr key={idx}>
                              <td className={styles.td} data-label="Date"><span className={styles.value}>{new Date(en.date).toLocaleString()}</span></td>
                              <td className={styles.td} data-label="Type"><span className={styles.value}>{en.type}</span></td>
                              <td
                                className={`${styles.td} ${styles.tdRight} ${
                                  en.type === "income"
                                    ? styles.income
                                    : styles.expense
                                }`}
                                data-label="Amount"
                              ><span className={styles.value}>{en.type === "income" ? "+" : "-"}{en.amount}</span></td>
                              <td className={styles.td} data-label="Description"><span className={styles.value}>{en.description}</span></td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={4} style={{ padding: "10px 12px" }}>
                          <div
                            className={styles.row}
                            style={{ justifyContent: "space-between" }}
                          >
                            <span style={{ color: "#6b7280" }}>
                              Page {currentPage} of {totalPages} •{" "}
                              {filtered.length} entries
                            </span>
                            <div className={styles.paginationRow}>
                              <button
                                className={`${styles.button} ${styles.secondary}`}
                                onClick={onPrev}
                                disabled={currentPage === 1}
                              >
                                Prev
                              </button>
                              <button
                                className={styles.button}
                                onClick={onNext}
                                disabled={currentPage === totalPages}
                                style={{ marginLeft: 8 }}
                              >
                                Next
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                );
              })()
            )}
          </div>

          {/* Summary totals */}
          {(() => {
            const income = (user.entries || []).reduce((s, e) => s + (e.type === 'income' ? e.amount : 0), 0);
            const expense = (user.entries || []).reduce((s, e) => s + (e.type === 'expense' ? e.amount : 0), 0);
            const net = income - expense;
            return (
              <div style={{
                marginTop: 12,
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 12,
              }} className={styles.totalsGrid}>
                <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 12px', background: '#f8fafc' }}>
                  <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 4 }}>Total Income</div>
                  <div style={{ fontWeight: 700, color: '#065f46' }}>{`$${income.toLocaleString()}`}</div>
                </div>
                <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 12px', background: '#f8fafc' }}>
                  <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 4 }}>Total Expense</div>
                  <div style={{ fontWeight: 700, color: '#7f1d1d' }}>{`$${expense.toLocaleString()}`}</div>
                </div>
                <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 12px', background: '#f8fafc' }}>
                  <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 4 }}>Balance</div>
                  <div style={{ fontWeight: 700 }}>{`$${net.toLocaleString()}`}</div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
