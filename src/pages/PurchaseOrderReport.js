import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { AddIcon, DeleteIcon, ExcelIcon, PdfIcon } from '../assets/icons';
import { getUserBranches } from '../services/userService';

const API_URL = 'http://localhost:8080/api/purchase-orders';
const money = (value) => `$${Number(value || 0).toFixed(2)}`;
const dateLabel = (value) => value ? new Date(value).toLocaleString('es-SV') : '';

export default function PurchaseOrderReport({ type }) {
  const isIceCream = type === 'ICE_CREAM';
  const title = isIceCream ? 'Pedido de helados' : 'Pedido de productos';
  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [savedOrders, setSavedOrders] = useState([]);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [orderTitle, setOrderTitle] = useState('');
  const [includePrices, setIncludePrices] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const total = useMemo(() => selectedItems.reduce(
    (sum, item) => sum + Number(item.unitPrice || 0) * Number(item.quantity || 0), 0
  ), [selectedItems]);

  const loadOrders = async () => {
    const response = await axios.get(`${API_URL}/${type}`);
    setSavedOrders(response.data);
  };

  const loadCandidates = async (selectedBranchId) => {
    if (!selectedBranchId) {
      setCandidates([]);
      return [];
    }
    const response = await axios.get(`${API_URL}/${type}/candidates`, {
      params: { branchId: selectedBranchId }
    });
    setCandidates(response.data);
    return response.data;
  };

  useEffect(() => {
    Promise.all([getUserBranches(), loadOrders()])
      .then(([branchList]) => {
        setBranches(branchList);
        if (branchList.length === 1) setBranchId(String(branchList[0].id));
      })
      .catch((requestError) => {
        setError(requestError.response?.data?.message || 'No se pudo cargar el módulo de pedidos.');
      })
      .finally(() => setLoading(false));
  }, [type]);

  useEffect(() => {
    if (!branchId) {
      setCandidates([]);
      return;
    }
    loadCandidates(branchId).catch((requestError) => {
      setError(requestError.response?.data?.message || 'No se pudo cargar el inventario de la sucursal.');
    });
  }, [branchId, type]);

  const startNewOrder = () => {
    setCurrentOrderId(null);
    setSelectedItems([]);
    setOrderTitle('');
    setIncludePrices(true);
    setError('');
    setNotice('');
  };

  const selectBranch = (value) => {
    setCurrentOrderId(null);
    setSelectedItems([]);
    setOrderTitle('');
    setIncludePrices(true);
    setBranchId(value);
  };

  const addItem = (candidate) => {
    setSelectedItems((current) => {
      if (current.some((item) => item.itemId === candidate.id)) return current;
      return [...current, {
        itemId: candidate.id,
        name: candidate.name,
        currentStock: candidate.currentStock,
        unit: candidate.unit,
        quantity: 1,
        unitPrice: candidate.unitPrice == null ? '' : String(candidate.unitPrice)
      }];
    });
  };

  const updateLine = (itemId, key, value) => {
    setSelectedItems((current) => current.map((item) => item.itemId === itemId
      ? { ...item, [key]: value }
      : item));
  };

  const removeLine = (itemId) => {
    setSelectedItems((current) => current.filter((item) => item.itemId !== itemId));
  };

  const editSavedOrder = async (order) => {
    setError('');
    setNotice('');
    try {
      const response = await axios.get(`${API_URL}/${type}/${order.id}`);
      const saved = response.data;
      setCurrentOrderId(saved.id);
      setBranchId(String(saved.branchId));
      setOrderTitle(saved.title || '');
      setIncludePrices(saved.includePrices);
      setCandidates(await loadCandidates(saved.branchId));
      setSelectedItems(saved.items.map((item) => ({
        itemId: item.itemId,
        name: item.name,
        currentStock: item.currentStock,
        unit: item.unit,
        quantity: item.quantity,
        unitPrice: item.unitPrice == null ? '' : String(item.unitPrice)
      })));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'No se pudo abrir el reporte guardado.');
    }
  };

  const saveOrder = async () => {
    setError('');
    setNotice('');
    if (!branchId) {
      setError('Selecciona una sucursal.');
      return;
    }
    if (selectedItems.length === 0) {
      setError('Agrega por lo menos un artículo al pedido.');
      return;
    }
    if (includePrices && selectedItems.some((item) => item.unitPrice === '' || !Number.isFinite(Number(item.unitPrice)) || Number(item.unitPrice) < 0)) {
      setError('Completa un precio unitario válido para cada artículo.');
      return;
    }

    const payload = {
      branchId: Number(branchId),
      title: orderTitle.trim() || title,
      includePrices,
      items: selectedItems.map((item) => ({
        itemId: item.itemId,
        quantity: Number(item.quantity),
        unitPrice: includePrices ? Number(item.unitPrice) : null
      }))
    };

    setSaving(true);
    try {
      const response = currentOrderId
        ? await axios.put(`${API_URL}/${type}/${currentOrderId}`, payload)
        : await axios.post(`${API_URL}/${type}`, payload);
      setCurrentOrderId(response.data.id);
      setNotice(currentOrderId ? 'Reporte actualizado.' : 'Reporte guardado.');
      await loadOrders();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'No se pudo guardar el reporte.');
    } finally {
      setSaving(false);
    }
  };

  const exportRows = () => selectedItems.map((item) => {
    const row = {
      Artículo: item.name,
      Existencia: `${Number(item.currentStock).toFixed(isIceCream ? 2 : 0)} ${item.unit}`,
      'Cantidad a pedir': item.quantity
    };
    if (includePrices) {
      row['Precio unitario'] = Number(item.unitPrice || 0);
      row['Total'] = Number(item.unitPrice || 0) * Number(item.quantity || 0);
    }
    return row;
  });

  const exportExcel = () => {
    if (!selectedItems.length) return setError('Agrega artículos antes de exportar.');
    const sheet = XLSX.utils.json_to_sheet(exportRows());
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, isIceCream ? 'Pedido de helados' : 'Pedido de productos');
    XLSX.writeFile(workbook, `${isIceCream ? 'pedido_helados' : 'pedido_productos'}_${branchId}.xlsx`);
  };

  const exportPdf = () => {
    if (!selectedItems.length) return setError('Agrega artículos antes de exportar.');
    const doc = new jsPDF('p', 'mm', 'a4');
    const branchName = branches.find((branch) => String(branch.id) === String(branchId))?.name || '';
    doc.setFontSize(18);
    doc.text(orderTitle.trim() || title, 14, 18);
    doc.setFontSize(11);
    doc.text(`Sucursal: ${branchName}`, 14, 26);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-SV')}`, 14, 32);
    const headers = ['Artículo', 'Existencia', 'Cantidad a pedir'];
    if (includePrices) headers.push('Precio unitario', 'Total');
    const body = selectedItems.map((item) => {
      const row = [item.name, `${Number(item.currentStock).toFixed(isIceCream ? 2 : 0)} ${item.unit}`, String(item.quantity)];
      if (includePrices) {
        row.push(money(item.unitPrice), money(Number(item.unitPrice || 0) * Number(item.quantity || 0)));
      }
      return row;
    });
    doc.autoTable({ startY: 39, head: [headers], body, styles: { fontSize: 9 }, headStyles: { fillColor: [29, 106, 91] } });
    if (includePrices) doc.text(`Total estimado: ${money(total)}`, 14, doc.lastAutoTable.finalY + 10);
    doc.save(`${isIceCream ? 'pedido_helados' : 'pedido_productos'}_${branchId}.pdf`);
  };

  if (loading) return <p className="p-8 text-center">Cargando pedidos...</p>;

  return (
    <main className="mx-auto max-w-7xl p-4 md:p-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-base-300 pb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Reportería · reposición</p>
          <h1 className="mt-1 text-3xl font-semibold">{title}</h1>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-outline btn-error" onClick={exportPdf}><PdfIcon className="h-5 w-5" />PDF</button>
          <button className="btn btn-outline btn-success" onClick={exportExcel}><ExcelIcon className="h-5 w-5" />Excel</button>
          <button className="btn btn-primary" onClick={saveOrder} disabled={saving}>{saving ? 'Guardando...' : currentOrderId ? 'Guardar cambios' : 'Guardar reporte'}</button>
        </div>
      </header>

      {error && <div className="alert alert-error mb-4" role="alert">{error}</div>}
      {notice && <div className="alert alert-success mb-4" role="status">{notice}</div>}

      <section className="mb-6 grid grid-cols-1 gap-4 border-b border-base-300 pb-6 sm:grid-cols-3">
        <label className="form-control">
          <span className="label-text mb-1">Sucursal</span>
          <select className="select select-bordered" value={branchId} onChange={(event) => selectBranch(event.target.value)}>
            <option value="">Selecciona una sucursal</option>
            {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
          </select>
        </label>
        <label className="form-control sm:col-span-2">
          <span className="label-text mb-1">Nombre del pedido</span>
          <input className="input input-bordered" value={orderTitle} placeholder={title} onChange={(event) => setOrderTitle(event.target.value)} />
        </label>
        <label className="label cursor-pointer justify-start gap-3 sm:col-span-3">
          <input type="checkbox" className="toggle toggle-primary" checked={includePrices} onChange={(event) => setIncludePrices(event.target.checked)} />
          <span className="label-text">Incluir precios en el reporte</span>
        </label>
      </section>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Artículos disponibles</h2>
            <span className="text-sm text-base-content/60">Ordenados desde menor existencia</span>
          </div>
          <div className="overflow-x-auto border border-base-300">
            <table className="table table-zebra">
              <thead><tr><th>Artículo</th><th>Existencia</th><th>Precio catálogo</th><th /></tr></thead>
              <tbody>
                {candidates.map((candidate) => {
                  const selected = selectedItems.some((item) => item.itemId === candidate.id);
                  return <tr key={candidate.id}>
                    <td>{candidate.name}</td>
                    <td>{Number(candidate.currentStock).toFixed(isIceCream ? 2 : 0)} {candidate.unit}</td>
                    <td>{candidate.unitPrice == null ? '—' : money(candidate.unitPrice)}</td>
                    <td><button className="btn btn-sm" disabled={!branchId || selected} onClick={() => addItem(candidate)}>{selected ? 'Agregado' : 'Agregar'}</button></td>
                  </tr>;
                })}
                {branchId && candidates.length === 0 && <tr><td colSpan="4" className="py-8 text-center text-base-content/60">No hay artículos para mostrar.</td></tr>}
                {!branchId && <tr><td colSpan="4" className="py-8 text-center text-base-content/60">Selecciona una sucursal para consultar existencias.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Detalle del pedido</h2>
            {currentOrderId && <button className="btn btn-ghost btn-sm" onClick={startNewOrder}>Nuevo reporte</button>}
          </div>
          <div className="overflow-x-auto border border-base-300">
            <table className="table">
              <thead><tr><th>Artículo</th><th>Existencia</th><th>Cantidad</th>{includePrices && <th>Precio unit.</th>}<th /></tr></thead>
              <tbody>
                {selectedItems.map((item) => <tr key={item.itemId}>
                  <td>{item.name}</td>
                  <td>{Number(item.currentStock).toFixed(isIceCream ? 2 : 0)} {item.unit}</td>
                  <td><input aria-label={`Cantidad ${item.name}`} type="number" min="1" step="1" className="input input-bordered input-sm w-24" value={item.quantity} onChange={(event) => updateLine(item.itemId, 'quantity', event.target.value)} /></td>
                  {includePrices && <td><input aria-label={`Precio ${item.name}`} type="number" min="0" step="0.01" className="input input-bordered input-sm w-28" value={item.unitPrice} onChange={(event) => updateLine(item.itemId, 'unitPrice', event.target.value)} /></td>}
                  <td><button className="btn btn-ghost btn-sm text-error" title="Quitar del pedido" onClick={() => removeLine(item.itemId)}><DeleteIcon className="h-4 w-4" /></button></td>
                </tr>)}
                {selectedItems.length === 0 && <tr><td colSpan={includePrices ? 5 : 4} className="py-8 text-center text-base-content/60">Aún no agregas artículos.</td></tr>}
              </tbody>
            </table>
          </div>
          {includePrices && <p className="mt-3 text-right text-lg font-semibold">Total estimado: {money(total)}</p>}
        </section>
      </div>

      <section className="mt-10 border-t border-base-300 pt-5">
        <h2 className="mb-3 text-lg font-semibold">Reportes guardados</h2>
        {savedOrders.length ? <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead><tr><th>Reporte</th><th>Sucursal</th><th>Actualizado</th><th>Líneas</th><th>Precios</th><th /></tr></thead>
            <tbody>{savedOrders.map((order) => <tr key={order.id}>
              <td>{order.title}</td><td>{order.branchName}</td><td>{dateLabel(order.updatedAt)}</td>
              <td>{order.items.length}</td><td>{order.includePrices ? 'Incluidos' : 'Ocultos'}</td>
              <td><button className="btn btn-sm btn-outline" onClick={() => editSavedOrder(order)}>Consultar / editar</button></td>
            </tr>)}</tbody>
          </table>
        </div> : <p className="text-sm text-base-content/60">Todavía no hay reportes guardados.</p>}
      </section>
    </main>
  );
}
