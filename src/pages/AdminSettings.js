import React, { useEffect, useState } from 'react';
import { AddIcon, DeleteIcon, EditIcon } from '../assets/icons';
import {
  branchAdminService,
  categoryAdminService,
  cylinderTypeAdminService,
  productStatusAdminService
} from '../services/adminConfigService';

const sections = [
  { id: 'branches', label: 'Sucursales' },
  { id: 'categories', label: 'Categorías' },
  { id: 'productStatuses', label: 'Estados de producto' },
  { id: 'cylinderTypes', label: 'Tipos de cilindro' }
];

const services = {
  branches: branchAdminService,
  categories: categoryAdminService,
  productStatuses: productStatusAdminService,
  cylinderTypes: cylinderTypeAdminService
};

const blankEntry = { name: '', location: '', phone: '', fraction: '' };

export default function AdminSettings() {
  const [activeSection, setActiveSection] = useState('branches');
  const [data, setData] = useState({ branches: [], categories: [], productStatuses: [], cylinderTypes: [] });
  const [entry, setEntry] = useState(blankEntry);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadSection = async (section = activeSection) => {
    setError('');
    try {
      const values = await services[section].list();
      setData((current) => ({ ...current, [section]: values }));
    } catch (requestError) {
      setError(requestError.response?.data?.detail || requestError.response?.data?.message || 'No se pudo cargar la configuración.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSection(activeSection);
  }, [activeSection]);

  const selectSection = (section) => {
    setActiveSection(section);
    setEditingId(null);
    setEntry(blankEntry);
    setError('');
    setSuccess('');
  };

  const beginEdit = (item) => {
    setEditingId(item.id);
    setEntry({
      name: item.name || '',
      location: item.location || '',
      phone: item.phone || '',
      fraction: item.fraction ?? ''
    });
    setError('');
  };

  const resetForm = () => {
    setEditingId(null);
    setEntry(blankEntry);
    setError('');
  };

  const saveEntry = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setIsSaving(true);
    const payload = activeSection === 'branches'
      ? { name: entry.name.trim(), location: entry.location.trim(), phone: entry.phone.trim() }
      : activeSection === 'cylinderTypes'
        ? { name: entry.name.trim(), fraction: Number(entry.fraction) }
        : { name: entry.name.trim() };

    try {
      if (editingId) {
        await services[activeSection].update(editingId, payload);
        setSuccess('Cambios guardados.');
      } else {
        await services[activeSection].create(payload);
        setSuccess('Registro creado.');
      }
      resetForm();
      await loadSection(activeSection);
    } catch (requestError) {
      setError(requestError.response?.data?.detail || requestError.response?.data?.message || 'No se pudo guardar. Revisa si el nombre ya existe.');
    } finally {
      setIsSaving(false);
    }
  };

  const removeEntry = async (item) => {
    if (!window.confirm(`¿Eliminar "${item.name}"?`)) return;
    setError('');
    setSuccess('');
    try {
      await services[activeSection].remove(item.id);
      setSuccess('Registro eliminado.');
      await loadSection(activeSection);
    } catch (requestError) {
      setError(requestError.response?.data?.detail || requestError.response?.data?.message || 'No se pudo eliminar; puede estar en uso.');
    }
  };

  const rows = data[activeSection];
  const isBranchSection = activeSection === 'branches';
  const isCylinderSection = activeSection === 'cylinderTypes';

  return (
    <main className="mx-auto max-w-6xl p-4 md:p-8">
      <header className="mb-6 border-b border-base-300 pb-4">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Administración global</p>
        <h1 className="mt-1 text-3xl font-semibold">Configuración del sistema</h1>
      </header>

      <div role="tablist" className="tabs tabs-bordered mb-6 flex-wrap">
        {sections.map((section) => (
          <button
            key={section.id}
            role="tab"
            aria-selected={activeSection === section.id}
            className={`tab ${activeSection === section.id ? 'tab-active' : ''}`}
            onClick={() => selectSection(section.id)}
          >
            {section.label}
          </button>
        ))}
      </div>

      {error && <div className="alert alert-error mb-4" role="alert">{error}</div>}
      {success && <div className="alert alert-success mb-4" role="status">{success}</div>}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section>
          <h2 className="mb-3 text-lg font-semibold">{sections.find((section) => section.id === activeSection)?.label}</h2>
          {isLoading ? <p className="py-8 text-center">Cargando...</p> : (
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    {isBranchSection && <><th>Ubicación</th><th>Teléfono</th></>}
                    {isCylinderSection && <th>Fracción</th>}
                    <th aria-label="Acciones" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((item) => (
                    <tr key={item.id}>
                      <td className="font-medium">{item.name}</td>
                      {isBranchSection && <><td>{item.location || '—'}</td><td>{item.phone || '—'}</td></>}
                      {isCylinderSection && <td>{item.fraction}</td>}
                      <td className="whitespace-nowrap text-right">
                        <button className="btn btn-ghost btn-sm" title="Editar" onClick={() => beginEdit(item)}><EditIcon className="h-4 w-4" /></button>
                        <button className="btn btn-ghost btn-sm text-error" title="Eliminar" onClick={() => removeEntry(item)}><DeleteIcon className="h-4 w-4" /></button>
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 && <tr><td colSpan={isBranchSection ? 4 : isCylinderSection ? 3 : 2} className="py-8 text-center text-base-content/60">No hay registros.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <form className="h-fit border-l border-base-300 pl-0 lg:pl-6" onSubmit={saveEntry}>
          <h2 className="text-lg font-semibold">{editingId ? 'Editar registro' : 'Agregar registro'}</h2>
          <label className="form-control mt-4">
            <span className="label-text mb-1">Nombre</span>
            <input className="input input-bordered" required value={entry.name} onChange={(event) => setEntry({ ...entry, name: event.target.value })} />
          </label>
          {isBranchSection && <>
            <label className="form-control mt-3"><span className="label-text mb-1">Ubicación</span><input className="input input-bordered" value={entry.location} onChange={(event) => setEntry({ ...entry, location: event.target.value })} /></label>
            <label className="form-control mt-3"><span className="label-text mb-1">Teléfono</span><input className="input input-bordered" value={entry.phone} onChange={(event) => setEntry({ ...entry, phone: event.target.value })} /></label>
          </>}
          {isCylinderSection && <label className="form-control mt-3">
            <span className="label-text mb-1">Fracción del cilindro (0 a 1)</span>
            <input className="input input-bordered" type="number" min="0" max="1" step="0.01" required value={entry.fraction} onChange={(event) => setEntry({ ...entry, fraction: event.target.value })} />
          </label>}
          <div className="mt-4 flex gap-2">
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              {!editingId && <AddIcon className="h-4 w-4" />}
              {isSaving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Agregar'}
            </button>
            {editingId && <button type="button" className="btn" onClick={resetForm}>Cancelar</button>}
          </div>
        </form>
      </div>
    </main>
  );
}