import React, { useEffect, useState } from 'react';
import { getUserBranches } from '../services/userService';

export default function BranchFilter({ value, onChange }) {
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    getUserBranches().then(setBranches).catch((error) => {
      console.error('No se pudieron cargar las sucursales del filtro:', error);
    });
  }, []);

  return (
    <label className="form-control min-w-48">
      <span className="label-text mb-1">Sucursal</span>
      <select className="select select-bordered" value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">Todas las sucursales</option>
        {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
      </select>
    </label>
  );
}
