import React from 'react'

export default function Navbar() {
  return (
    <div className="navbar bg-base-200 shadow-md">
      <div className="flex-1">
        <a className="btn btn-ghost normal-case text-xl">Heladería</a>
      </div>
      <div className="flex-none gap-2">
        <a className="btn btn-ghost">Dashboard</a>
        <a className="btn btn-ghost">Sucursales</a>
        <a className="btn btn-ghost">Cilindros</a>
      </div>
    </div>
  );
}
