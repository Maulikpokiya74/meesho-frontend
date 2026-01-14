import { Routes, Route } from "react-router-dom";
import Login from "./pages/StoreLogin";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Products from "./pages/Products";
import Layout from "./components/Layout";
import ProductManage from "./pages/ProductManage";
import ProductHistory from "./pages/ProductHistory";
import UserEntries from "./pages/UserEntries";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/users" element={<Users />} />
  <Route path="/users/entries" element={<UserEntries />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/manage" element={<ProductManage />} />
        <Route path="/products/:id/history" element={<ProductHistory />} />
      </Route>
    </Routes>
  );
}
