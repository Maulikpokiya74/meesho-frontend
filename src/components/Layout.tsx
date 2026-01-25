import { Link, Outlet, useLocation } from "react-router-dom";
import styles from "./Layout.module.css";

export default function Layout() {
  const { pathname } = useLocation();
  const isActive = (path: string) => (pathname === path ? "active" : "");
  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };
  return (
    <div className={styles.app}>
      <aside className={styles.sidebar}>
        <h3>TeamSync</h3>
        <div className={styles.nav}>
          <Link className={isActive("/dashboard")} to="/dashboard">
            Dashboard
          </Link>
        </div>
        <h3 style={{ marginTop: 16 }}>Management</h3>
        <div className={styles.nav}>
          <Link className={isActive("/users")} to="/users">
            Customer
          </Link>
          <Link className={isActive("/products")} to="/products">
            Product
          </Link>
        </div>
        <div style={{ marginTop: 16 }}>
          <button className={styles.button} onClick={logout}>Logout</button>
        </div>
      </aside>
      <main className={styles.content}>
        
        <div className={styles.slot}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
