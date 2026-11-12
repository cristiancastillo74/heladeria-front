import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getUserBranches } from '../services/userService';

const money = (value) => `$${Number(value || 0).toFixed(2)}`;

export default function Dashboard() {
  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getUserBranches().then(setBranches).catch((requestError) => {
      console.error('Error al cargar sucursales:', requestError);
    });
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    axios.get('http://localhost:8080/api/dashboard', {
      params: { branchId: branchId || undefined }
    }).then((response) => {
      if (active) setData(response.data);
    }).catch((requestError) => {
      if (active) setError(requestError.response?.data?.message || 'No se pudieron cargar las métricas.');
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [branchId]);

  const topProducts = data?.bestSellingProducts || [];
  const leastProducts = data?.leastSellingProducts || [];
  const chartColors = ['#1D6A5B', '#D18B45', '#4E7B9B', '#B85643', '#75864C'];

  return (
    <main className="mx-auto max-w-7xl p-4 md:p-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-base-300 pb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Resumen ejecutivo</p>
          <h1 className="mt-1 text-3xl font-semibold">Dashboard</h1>
        </div>
        <label className="form-control min-w-52">
          <span className="label-text mb-1">Sucursal</span>
          <select className="select select-bordered" value={branchId} onChange={(event) => setBranchId(event.target.value)}>
            <option value="">Todas las sucursales</option>
            {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
          </select>
        </label>
      </header>

      {error && <div className="alert alert-error mb-5" role="alert">{error}</div>}
      {loading && <p className="py-10 text-center">Cargando indicadores...</p>}
      {!loading && data && <>
        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <article className="border-l-4 border-emerald-700 bg-base-200 p-5">
            <p className="text-sm text-base-content/70">Vendido hoy</p>
            <p className="mt-2 text-3xl font-semibold">{money(data.salesToday)}</p>
          </article>
          <article className="border-l-4 border-rose-700 bg-base-200 p-5">
            <p className="text-sm text-base-content/70">Gastado hoy</p>
            <p className="mt-2 text-3xl font-semibold">{money(data.expensesToday)}</p>
          </article>
        </section>

        <section className="mb-8 grid grid-cols-1 gap-8 xl:grid-cols-2">
          <div className="min-w-0 border-t border-base-300 pt-4">
            <h2 className="mb-4 text-lg font-semibold">Ventas de los últimos 7 días</h2>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.weeklySales || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tickFormatter={(date) => date.slice(5)} />
                  <YAxis />
                  <Tooltip formatter={(value) => money(value)} />
                  <Bar dataKey="total" name="Ventas" fill="#1D6A5B" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="min-w-0 border-t border-base-300 pt-4">
            <h2 className="mb-4 text-lg font-semibold">Productos más vendidos · 30 días</h2>
            {topProducts.length ? <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical" margin={{ left: 18, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="product" width={110} />
                  <Tooltip />
                  <Bar dataKey="quantity" name="Unidades" radius={[0, 3, 3, 0]}>
                    {topProducts.map((item, index) => <Cell key={item.product} fill={chartColors[index % chartColors.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div> : <p className="py-12 text-sm text-base-content/60">Aún no hay ventas en el periodo.</p>}
          </div>
        </section>

        <section className="mb-8 border-t border-base-300 pt-4">
          <h2 className="mb-4 text-lg font-semibold">Productos menos vendidos · 30 días</h2>
          {leastProducts.length ? <div className="h-64 w-full max-w-3xl">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leastProducts} layout="vertical" margin={{ left: 18, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="product" width={120} />
                <Tooltip />
                <Bar dataKey="quantity" name="Unidades" fill="#B85643" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div> : <p className="py-10 text-sm text-base-content/60">Aún no hay ventas en el periodo.</p>}
        </section>

        <section className="mb-8 border-t border-base-300 pt-4">
          <h2 className="mb-4 text-lg font-semibold">Sabores de helado más vendidos · 30 días</h2>
          {data.bestSellingFlavors?.length ? <div className="h-72 w-full max-w-4xl">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.bestSellingFlavors} layout="vertical" margin={{ left: 18, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="flavor" width={120} />
                <Tooltip />
                <Bar dataKey="ballsSold" name="Bolas servidas" fill="#4E7B9B" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div> : <p className="py-10 text-sm text-base-content/60">Aún no hay sabores vendidos en el periodo.</p>}
        </section>

        <section className="border-t border-base-300 pt-4">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-semibold">Alertas de inventario</h2>
            <span className="text-sm text-base-content/60">Según los mínimos configurados por producto</span>
          </div>
          {data.inventoryAlerts?.length ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {data.inventoryAlerts.map((alert, index) => (
                <article key={`${alert.kind}-${alert.item}-${alert.branch}-${index}`} className="border-l-4 border-amber-600 bg-base-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{alert.item}</p>
                      <p className="mt-1 text-sm text-base-content/65">{alert.branch} · {alert.kind === 'CYLINDER' ? 'Cilindro' : 'Producto'}</p>
                    </div>
                    <span className="badge badge-warning">Bajo</span>
                  </div>
                  <p className="mt-4 text-sm">
                    Existencia <strong className="text-error">{alert.kind === 'CYLINDER' ? `${Number(alert.current).toFixed(1)}%` : alert.current}</strong>
                    <span className="px-1 text-base-content/50">/</span>
                    mínimo {alert.kind === 'CYLINDER' ? `${Number(alert.threshold).toFixed(1)}%` : alert.threshold}
                  </p>
                </article>
              ))}
            </div>
          ) : <p className="py-8 text-sm text-base-content/60">No hay productos por debajo del mínimo.</p>}
        </section>
      </>}
    </main>
  );
}
