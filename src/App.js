import React, { useEffect } from 'react';
import './App.css';
import Layout from './component/Layout';
import Dashboard from './pages/Dashboard';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import Products from './pages/Product';
import Cylinders from './pages/Cylinders';
import Expenses from './pages/Expenses';
import { AuthProvider, useAuth } from './context/AuthContext';
import CyInvent from './pages/CyInvent';
import Sales from './pages/Sales';
import ProInvent from './pages/ProInvent';
import SalesReport from './pages/SalesReport';
import BalanceReport from './pages/BalanceReport';
import ProductReport from './pages/ProductReport';
import CylinderReport from './pages/CyliderReport';
import Login from './pages/Login';
import Users from './pages/Users';
import AdminSettings from './pages/AdminSettings';

function ProtectedLayout() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Layout><Outlet /></Layout>;
}

function LoginRoute() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/" replace /> : <Login />;
}

function AdminUsersRoute() {
  const { currentUser } = useAuth();
  if (!['ADMIN_GLOBAL', 'ADMIN_BRANCH'].includes(currentUser?.role)) {
    return <Navigate to="/" replace />;
  }
  return <Users />;
}

function GlobalAdminSettingsRoute() {
  const { currentUser } = useAuth();
  if (currentUser?.role !== 'ADMIN_GLOBAL') return <Navigate to="/" replace />;
  return <AdminSettings />;
}

function App() {
   useEffect(() => {
    // Establecer el tema al cargar la aplicación
    document.documentElement.setAttribute('data-theme', 'light');
  }, []);

  return (
     <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginRoute />} />
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/reports/sales" element={<SalesReport />} />
            <Route path="/reports/balance" element={<BalanceReport />} />
            <Route path="/reports/products" element={<ProductReport />} />
            <Route path="/reports/cylinders" element={<CylinderReport />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/cylinder" element={<Cylinders />} />
            <Route path="/product" element={<Products />} />
            <Route path="/cyInvent" element={<CyInvent />} />
            <Route path="/proInvent" element={<ProInvent />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/users" element={<AdminUsersRoute />} />
            <Route path="/admin/configuration" element={<GlobalAdminSettingsRoute />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
