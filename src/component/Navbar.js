import { Link } from 'react-router-dom';
import React from 'react'

export default function Navbar() {
  return (
    <div className="navbar bg-blue-500 text-white shadow-md">
      <div className="flex-1">
        <Link to="/" className="btn btn-ghost normal-case text-xl">
          Heladería
          </Link>
      </div>
      <div className="flex-none gap-2 ">
        <Link to="/" className="btn btn-ghost">Dashboard</Link>
        <Link to="/sales" className="btn btn-ghost">Registrar Venta</Link>
        <Link to="/expenses" className="btn btn-ghost">Gastos</Link>
        <Link to="/cylinder" className="btn btn-ghost">Cilindros</Link>
        <Link to="/product" className="btn btn-ghost">Productos</Link>
        <Link to="/cyInvent" className="btn btn-ghost">Inventario de helados</Link>
        <Link to="/proInvent" className="btn btn-ghost">Inventario de productos</Link>
      </div>
    </div>
  );
}
