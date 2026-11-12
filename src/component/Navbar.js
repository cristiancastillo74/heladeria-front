import { Link } from 'react-router-dom';
import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const canManageUsers = ['ADMIN_GLOBAL', 'ADMIN_BRANCH'].includes(currentUser?.role);
  const isGlobalAdmin = currentUser?.role === 'ADMIN_GLOBAL';
  const canViewInventory = canManageUsers || (currentUser?.role === 'EMPLOYEE' && currentUser?.canViewInventory);
  const canManageCatalogs = canManageUsers;

  return (
    <div className="navbar bg-blue-500 text-white shadow-md">
      <div className="flex-1">
        <Link to="/" className="btn btn-ghost normal-case text-xl">
          Heladería
        </Link>
      </div>

      <div className="flex-none gap-2">
        {isGlobalAdmin && (
          <>
            <Link to="/" className="btn btn-ghost">Dashboard</Link>
            <div className="dropdown dropdown-hover">
              <label tabIndex={0} className="btn btn-ghost m-1">Reportería</label>
              <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-blue-600 rounded-box w-60">
                <li><Link to="/reports/sales">Reporte de ventas</Link></li>
                <li><Link to="/reports/balance">Balance Mensual</Link></li>
                <li><Link to="/reports/products">Inventario de Productos</Link></li>
                <li><Link to="/reports/cylinders">Inventario de Helados</Link></li>
                <li><Link to="/reports/orders/products">Pedido de productos</Link></li>
                <li><Link to="/reports/orders/ice-creams">Pedido de helados</Link></li>
              </ul>
            </div>
          </>
        )}

        {/* Resto de los botones */}
        <Link to="/sales" className="btn btn-ghost">
          Registrar Venta
        </Link>
        <Link to="/expenses" className="btn btn-ghost">
          Gastos
        </Link>
        {canManageCatalogs && <Link to="/cylinder" className="btn btn-ghost">
          Cilindros
        </Link>}
        {canManageCatalogs && <Link to="/product" className="btn btn-ghost">
          Productos
        </Link>}
        {canViewInventory && <Link to="/cyInvent" className="btn btn-ghost">
          Inventario de helados
        </Link>}
        {canViewInventory && <Link to="/proInvent" className="btn btn-ghost">
          Inventario de productos
        </Link>}
        {canManageUsers && <Link to="/users" className="btn btn-ghost">Usuarios</Link>}
        {isGlobalAdmin && <Link to="/admin/configuration" className="btn btn-ghost">Configuración</Link>}
        <span className="px-2 text-sm">{currentUser?.firstName || currentUser?.username}</span>
        <button type="button" className="btn btn-outline btn-sm text-white" onClick={logout}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
