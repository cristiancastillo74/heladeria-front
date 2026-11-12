import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DeleteIcon, EditIcon } from '../assets/icons';
import { useAuth } from '../context/AuthContext';
import { deleteSale, getSalesHistory } from '../services/saleService';
import { getUserBranches } from '../services/userService';

const currency = (amount) => `$${Number(amount || 0).toFixed(2)}`;
const dateTime = (value) => value ? new Date(value).toLocaleString('es-SV') : '—';

export default function SalesHistory() {
  const { currentUser } = useAuth();
  const isGlobalAdmin = currentUser?.role === 'ADMIN_GLOBAL';
  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState('');
  const [sales, setSales] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null);
  const [editingSale, setEditingSale] = useState(null);
  const [editItems, setEditItems] = useState([]);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadSales = async (selectedBranchId = branchId) => {
    setError('');
    setLoading(true);
    try {
      const data = await getSalesHistory(isGlobalAdmin ? selectedBranchId || undefined : undefined);
      setSales(data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'No se pudieron cargar las ventas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isGlobalAdmin) {
      loadSales();
      return;
    }
    getUserBranches().then((branchList) => {
      setBranches(branchList);
      if (branchList.length === 1) setBranchId(String(branchList[0].id));
      else setLoading(false);
    }).catch((requestError) => {
      setError(requestError.response?.data?.message || 'No se pudieron cargar las sucursales.');
      setLoading(false);
    });
  }, [isGlobalAdmin]);

  useEffect(() => {
    if (isGlobalAdmin && branchId) loadSales(branchId);
    if (isGlobalAdmin && !branchId) setSales([]);
  }, [branchId, isGlobalAdmin]);

  const openEdit = (sale) => {
    setEditingSale(sale);
    setPaymentAmount(String(sale.paymentAmount ?? ''));
    setEditItems(sale.items.map((item) => ({
      ...item,
      flavors: (item.flavors || []).map((flavor) => ({ ...flavor }))
    })));
    setError('');
  };

  const editTotal = editItems.reduce((sum, item) => sum + (item.ignorePrice
    ? 0
    : Number(item.unitPrice || 0) * Number(item.quantity || 0)), 0);

  const updateEditItem = (itemIndex, key, value) => {
    setEditItems((current) => current.map((item, index) => index === itemIndex
      ? { ...item, [key]: value }
      : item));
  };

  const updateEditFlavor = (itemIndex, flavorIndex, balls) => {
    setEditItems((current) => current.map((item, index) => index === itemIndex
      ? { ...item, flavors: item.flavors.map((flavor, selectedIndex) => selectedIndex === flavorIndex
        ? { ...flavor, balls: Number(balls) }
        : flavor) }
      : item));
  };

  const removeEditItem = (itemIndex) => {
    setEditItems((current) => current.filter((_, index) => index !== itemIndex));
  };

  const savePayment = async (event) => {
    event.preventDefault();
    if (!editingSale) return;
    setSaving(true);
    setError('');
    try {
      if (editItems.length === 0) {
        setError('La venta debe conservar al menos un artículo. Usa Eliminar venta si deseas anularla.');
        setSaving(false);
        return;
      }
      const corrected = await axios.put(`http://localhost:8080/helados/sale/${editingSale.id}`, {
        paymentAmount: Number(paymentAmount),
        items: editItems.map((item) => ({
          product: { id: item.productId },
          quantity: Number(item.quantity),
          ignorePrice: item.ignorePrice,
          ...(item.iceCream ? {
            ballSelections: item.flavors.map((flavor) => ({
              cylinderId: flavor.cylinderId,
              balls: Number(flavor.balls)
            }))
          } : {})
        }))
      });
      setEditingSale(null);
      setNotice('Venta corregida; se actualizaron existencias, total y vuelto.');
      if (selectedSale?.id === corrected.data.id) setSelectedSale(corrected.data);
      await loadSales();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'No se pudo actualizar el pago.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setError('');
    try {
      await deleteSale(pendingDelete.id);
      setNotice(`Venta #${pendingDelete.id} eliminada y existencias restauradas.`);
      setPendingDelete(null);
      if (selectedSale?.id === pendingDelete.id) setSelectedSale(null);
      await loadSales();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'No se pudo eliminar la venta.');
      setPendingDelete(null);
    }
  };

  return (
    <main className="mx-auto max-w-7xl p-4 md:p-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-base-300 pb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Registro</p>
          <h1 className="mt-1 text-3xl font-semibold">Ventas</h1>
          <p className="mt-1 text-sm text-base-content/65">
            {isGlobalAdmin ? 'Consulta las ventas de la sucursal seleccionada.' : 'Consulta las ventas registradas por tu usuario.'}
          </p>
        </div>
        {isGlobalAdmin && <label className="form-control min-w-56">
          <span className="label-text mb-1">Sucursal</span>
          <select className="select select-bordered" value={branchId} onChange={(event) => setBranchId(event.target.value)}>
            <option value="">Selecciona una sucursal</option>
            {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
          </select>
        </label>}
      </header>

      {error && <div className="alert alert-error mb-4" role="alert">{error}</div>}
      {notice && <div className="alert alert-success mb-4" role="status">{notice}</div>}

      {loading ? <p className="py-10 text-center">Cargando ventas...</p> : isGlobalAdmin && !branchId ? (
        <p className="border border-dashed border-base-300 py-12 text-center text-base-content/60">Selecciona una sucursal para consultar las ventas.</p>
      ) : (
        <div className="overflow-x-auto border border-base-300">
          <table className="table table-zebra">
            <thead><tr><th>Venta</th><th>Fecha</th>{isGlobalAdmin && <th>Usuario</th>}<th>Artículos</th><th>Total</th><th>Pagó</th><th>Vuelto</th><th>Detalle</th>{isGlobalAdmin && <th>Acciones</th>}</tr></thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id}>
                  <td className="font-semibold">#{sale.id}</td>
                  <td>{dateTime(sale.createdAt)}</td>
                  {isGlobalAdmin && <td>{sale.username}</td>}
                  <td>{sale.items.reduce((count, item) => count + Number(item.quantity || 0), 0)}</td>
                  <td>{currency(sale.totalAmount)}</td>
                  <td>{currency(sale.paymentAmount)}</td>
                  <td className="font-medium text-success">{currency(sale.changeAmount)}</td>
                  <td><button className="btn btn-sm btn-outline" onClick={() => setSelectedSale(sale)}>Ver venta</button></td>
                  {isGlobalAdmin && <td className="whitespace-nowrap">
                    <button className="btn btn-ghost btn-sm" title="Editar pago y vuelto" onClick={() => openEdit(sale)}><EditIcon className="h-4 w-4" /></button>
                    <button className="btn btn-ghost btn-sm text-error" title="Eliminar venta" onClick={() => setPendingDelete(sale)}><DeleteIcon className="h-4 w-4" /></button>
                  </td>}
                </tr>
              ))}
              {sales.length === 0 && <tr><td colSpan={isGlobalAdmin ? 9 : 7} className="py-10 text-center text-base-content/60">No hay ventas para mostrar.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {selectedSale && <dialog open className="modal modal-open">
        <section className="modal-box max-w-3xl">
          <header className="flex items-start justify-between gap-3">
            <div><p className="text-xs uppercase tracking-wide text-primary">Detalle de venta</p><h2 className="text-2xl font-semibold">Venta #{selectedSale.id}</h2></div>
            <button className="btn btn-ghost btn-sm" onClick={() => setSelectedSale(null)} aria-label="Cerrar">×</button>
          </header>
          <div className="my-5 grid grid-cols-2 gap-3 md:grid-cols-4">
            <div><p className="text-xs text-base-content/60">Fecha</p><p>{dateTime(selectedSale.createdAt)}</p></div>
            <div><p className="text-xs text-base-content/60">Usuario</p><p>{selectedSale.username}</p></div>
            <div><p className="text-xs text-base-content/60">Sucursal</p><p>{selectedSale.branchName}</p></div>
            <div><p className="text-xs text-base-content/60">Total</p><p className="font-semibold">{currency(selectedSale.totalAmount)}</p></div>
          </div>
          <div className="overflow-x-auto border border-base-300">
            <table className="table table-sm">
              <thead><tr><th>Artículo</th><th>Cantidad</th><th>Precio unitario</th><th>Subtotal</th><th>Sabores</th></tr></thead>
              <tbody>{selectedSale.items.map((item, index) => <tr key={`${item.productId}-${index}`}>
                <td>{item.productName}</td>
                <td>{item.quantity}</td>
                <td>{currency(item.unitPrice)}</td>
                <td>{currency(Number(item.unitPrice || 0) * Number(item.quantity || 0))}</td>
                <td>{item.flavors?.length ? item.flavors.map((flavor) => `${flavor.flavor} (${flavor.balls})`).join(', ') : '—'}</td>
              </tr>)}</tbody>
            </table>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-4 text-right">
            <p>Total: <strong>{currency(selectedSale.totalAmount)}</strong></p>
            <p>Pagó: <strong>{currency(selectedSale.paymentAmount)}</strong></p>
            <p className="col-span-2">Vuelto: <strong className="text-success">{currency(selectedSale.changeAmount)}</strong></p>
          </div>
        </section>
        <button className="modal-backdrop" onClick={() => setSelectedSale(null)} aria-label="Cerrar detalle" />
      </dialog>}

      {editingSale && <dialog open className="modal modal-open">
        <form className="modal-box max-w-4xl" onSubmit={savePayment}>
          <h2 className="text-xl font-semibold">Editar venta #{editingSale.id}</h2>
          <p className="mt-2 text-sm text-base-content/70">Al guardar se recalcularán existencias, total y vuelto.</p>
          <div className="mt-4 max-h-80 overflow-auto border border-base-300">
            <table className="table table-sm">
              <thead><tr><th>Artículo</th><th>Cantidad</th><th>Sabores / bolas</th><th>Precio unit.</th><th /></tr></thead>
              <tbody>{editItems.map((item, itemIndex) => <tr key={`${item.productId}-${itemIndex}`}>
                <td>{item.productName}{item.ignorePrice ? ' (sin cargo)' : ''}</td>
                <td><input aria-label={`Cantidad ${item.productName}`} className="input input-bordered input-sm w-20" type="number" min="1" required value={item.quantity} onChange={(event) => updateEditItem(itemIndex, 'quantity', Number(event.target.value))} /></td>
                <td>{item.iceCream ? item.flavors.map((flavor, flavorIndex) => <label key={`${flavor.cylinderId}-${flavorIndex}`} className="mb-1 flex items-center gap-2 text-sm">
                  <span>{flavor.flavor}</span><input aria-label={`Bolas ${flavor.flavor}`} className="input input-bordered input-xs w-16" type="number" min="1" required value={flavor.balls} onChange={(event) => updateEditFlavor(itemIndex, flavorIndex, event.target.value)} />
                </label>) : '—'}</td>
                <td>{currency(item.unitPrice)}</td>
                <td><button type="button" className="btn btn-ghost btn-xs text-error" onClick={() => removeEditItem(itemIndex)} title="Quitar artículo">×</button></td>
              </tr>)}</tbody>
            </table>
          </div>
          <p className="mt-3 text-right">Nuevo total: <strong>{currency(editTotal)}</strong></p>
          <label className="form-control mt-4">
            <span className="label-text mb-1">Monto recibido</span>
            <input className="input input-bordered" type="number" min={editTotal} step="0.01" required value={paymentAmount} onChange={(event) => setPaymentAmount(event.target.value)} />
          </label>
          <p className="mt-3 text-sm">Vuelto calculado: <strong>{currency(Number(paymentAmount || 0) - editTotal)}</strong></p>
          {error && <p className="mt-3 text-sm text-error" role="alert">{error}</p>}
          <div className="modal-action"><button type="button" className="btn" onClick={() => setEditingSale(null)}>Cancelar</button><button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button></div>
        </form>
        <button className="modal-backdrop" onClick={() => setEditingSale(null)} aria-label="Cerrar edición" />
      </dialog>}

      {pendingDelete && <dialog open className="modal modal-open">
        <div className="modal-box">
          <h2 className="text-lg font-semibold">Eliminar venta #{pendingDelete.id}</h2>
          <p className="py-4">Se restaurarán las existencias de productos y cilindros que descontó esta venta. ¿Continuar?</p>
          <div className="modal-action"><button className="btn" onClick={() => setPendingDelete(null)}>Cancelar</button><button className="btn btn-error" onClick={confirmDelete}>Eliminar venta</button></div>
        </div>
        <button className="modal-backdrop" onClick={() => setPendingDelete(null)} aria-label="Cancelar eliminación" />
      </dialog>}
    </main>
  );
}
