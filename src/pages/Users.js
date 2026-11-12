import React, { useEffect, useState } from 'react';
import PaginatedTable from '../component/PaginatedTable';
import { AddIcon, DeleteIcon, EditIcon } from '../assets/icons';
import {
	createUser,
	deleteUser,
	getAssignableRoles,
	getUserBranches,
	getUsers,
	updateUser
} from '../services/userService';
import { useAuth } from '../context/AuthContext';

const emptyForm = {
	firstName: '', lastName: '', dui: '', phone: '', address: '', salary: '',
	workDays: '', username: '', password: '', role: '', branchId: '', canViewInventory: false
};

const roleLabels = {
	ADMIN_GLOBAL: 'Administrador global',
	ADMIN_BRANCH: 'Administrador de sucursal',
	EMPLOYEE: 'Empleado'
};

export default function Users() {
	const { currentUser } = useAuth();
	const isGlobalAdmin = currentUser?.role === 'ADMIN_GLOBAL';
	const [users, setUsers] = useState([]);
	const [roles, setRoles] = useState([]);
	const [branches, setBranches] = useState([]);
	const [form, setForm] = useState(emptyForm);
	const [editingUserId, setEditingUserId] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [pendingDelete, setPendingDelete] = useState(null);

	const loadData = async () => {
		setError('');
		try {
			const [userData, roleData, branchData] = await Promise.all([
				getUsers(), getAssignableRoles(), getUserBranches()
			]);
			setUsers(userData);
			setRoles(roleData);
			setBranches(branchData);
		} catch (requestError) {
			setError(requestError.response?.data?.detail || 'No se pudo cargar la gestión de usuarios.');
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		loadData();
	}, []);

	const openCreate = () => {
		setEditingUserId(null);
		setSuccess('');
		setError('');
		setForm({
			...emptyForm,
			role: roles[0] || '',
			branchId: isGlobalAdmin ? '' : String(branches[0]?.id || ''),
			canViewInventory: false
		});
	};

	const openEdit = (user) => {
		setEditingUserId(user.id);
		setSuccess('');
		setError('');
		setForm({
			firstName: user.firstName || '',
			lastName: user.lastName || '',
			dui: user.dui || '',
			phone: user.phone || '',
			address: user.address || '',
			salary: user.salary ?? '',
			workDays: user.workDays || '',
			username: user.username || '',
			password: '',
			role: user.role,
			branchId: user.branchId ? String(user.branchId) : '',
			canViewInventory: Boolean(user.canViewInventory)
		});
	};

	const closeForm = () => {
		document.getElementById('user_form_modal')?.close();
		setEditingUserId(null);
		setForm(emptyForm);
	};

	const handleSave = async (event) => {
		event.preventDefault();
		setError('');
		setIsSaving(true);
		const userPayload = {
			...form,
			salary: form.salary === '' ? null : Number(form.salary),
			branchId: form.role === 'ADMIN_GLOBAL' && !form.branchId ? null : Number(form.branchId)
		};

		try {
			if (editingUserId) {
				await updateUser(editingUserId, userPayload);
				setSuccess('Usuario actualizado.');
			} else {
				await createUser(userPayload);
				setSuccess('Usuario creado.');
			}
			await loadData();
			closeForm();
		} catch (requestError) {
			const response = requestError.response?.data;
			setError(response?.detail || (typeof response === 'string' ? response : 'No se pudo guardar el usuario.'));
		} finally {
			setIsSaving(false);
		}
	};

	const handleDelete = async () => {
		if (!pendingDelete) return;
		setError('');
		try {
			await deleteUser(pendingDelete.id);
			setUsers((currentUsers) => currentUsers.filter((user) => user.id !== pendingDelete.id));
			setSuccess(`Se eliminó el usuario ${pendingDelete.username}.`);
			setPendingDelete(null);
		} catch (requestError) {
			setError(requestError.response?.data?.detail || 'No se pudo eliminar el usuario.');
			setPendingDelete(null);
		}
	};

	if (isLoading) return <p className="p-8 text-center">Cargando usuarios...</p>;

	return (
		<section className="mx-auto max-w-7xl p-4 md:p-8">
			<header className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-base-300 pb-4">
				<div>
					<p className="text-xs font-bold uppercase tracking-widest text-primary">Administración</p>
					<h1 className="mt-1 text-3xl font-semibold">Usuarios y roles</h1>
					<p className="mt-1 text-sm text-base-content/70">
						{isGlobalAdmin ? 'Gestión de todas las sucursales' : `Personal de ${branches[0]?.name || 'tu sucursal'}`}
					</p>
				</div>
				<button className="btn btn-primary" onClick={() => {
					openCreate();
					document.getElementById('user_form_modal')?.showModal();
				}}>
					<AddIcon className="h-5 w-5" />
					Nuevo usuario
				</button>
			</header>

			{error && <div className="alert alert-error mb-4" role="alert">{error}</div>}
			{success && <div className="alert alert-success mb-4" role="status">{success}</div>}

			<PaginatedTable
				columns={['Usuario', 'Nombre', 'Rol', 'Inventarios', 'Sucursal', 'Teléfono', 'Acciones']}
				data={users}
				filasPorPagina={10}
				renderRow={(user) => (
					<tr key={user.id}>
						<td className="font-medium">{user.username}</td>
						<td>{user.firstName} {user.lastName}</td>
						<td><span className="badge badge-outline">{roleLabels[user.role] || user.role}</span></td>
						<td>{user.role === 'EMPLOYEE' && user.canViewInventory ? 'Lectura habilitada' : '—'}</td>
						<td>{user.branchName || 'Global'}</td>
						<td>{user.phone || '—'}</td>
						<td className="whitespace-nowrap">
							<button className="btn btn-ghost btn-sm" title="Editar usuario" onClick={() => {
								openEdit(user);
								document.getElementById('user_form_modal')?.showModal();
							}}>
								<EditIcon className="h-4 w-4" />
							</button>
							{user.id !== currentUser?.id && (
								<button className="btn btn-ghost btn-sm text-error" title="Eliminar usuario" onClick={() => setPendingDelete(user)}>
									<DeleteIcon className="h-4 w-4" />
								</button>
							)}
						</td>
					</tr>
				)}
			/>

			<dialog id="user_form_modal" className="modal">
				<div className="modal-box max-w-2xl">
					<h2 className="text-xl font-semibold">{editingUserId ? 'Editar usuario' : 'Crear usuario'}</h2>
					<form className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={handleSave}>
						<label className="form-control"><span className="label-text mb-1">Nombre</span><input className="input input-bordered" required value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} /></label>
						<label className="form-control"><span className="label-text mb-1">Apellido</span><input className="input input-bordered" required value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} /></label>
						<label className="form-control"><span className="label-text mb-1">Nombre de usuario</span><input className="input input-bordered" required autoComplete="username" value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} /></label>
						<label className="form-control"><span className="label-text mb-1">{editingUserId ? 'Nueva contraseña (opcional)' : 'Contraseña'}</span><input className="input input-bordered" type="password" required={!editingUserId} minLength={6} autoComplete="new-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label>
						<label className="form-control"><span className="label-text mb-1">DUI</span><input className="input input-bordered" value={form.dui} onChange={(event) => setForm({ ...form, dui: event.target.value })} /></label>
						<label className="form-control"><span className="label-text mb-1">Teléfono</span><input className="input input-bordered" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label>
						<label className="form-control"><span className="label-text mb-1">Salario</span><input className="input input-bordered" type="number" min="0" step="0.01" value={form.salary} onChange={(event) => setForm({ ...form, salary: event.target.value })} /></label>
						<label className="form-control"><span className="label-text mb-1">Días de trabajo</span><input className="input input-bordered" value={form.workDays} onChange={(event) => setForm({ ...form, workDays: event.target.value })} /></label>
						<label className="form-control">
							<span className="label-text mb-1">Rol</span>
							  <select className="select select-bordered" required disabled={editingUserId === currentUser?.id} value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value, branchId: event.target.value === 'ADMIN_GLOBAL' ? '' : form.branchId })}>
								<option value="" disabled>Selecciona un rol</option>
								{roles.map((role) => <option key={role} value={role}>{roleLabels[role] || role}</option>)}
							</select>
						</label>
						<label className="form-control">
							<span className="label-text mb-1">Sucursal</span>
							<select className="select select-bordered" required={form.role !== 'ADMIN_GLOBAL'} disabled={!isGlobalAdmin} value={form.branchId} onChange={(event) => setForm({ ...form, branchId: event.target.value })}>
								{isGlobalAdmin && <option value="">Sin sucursal</option>}
								{branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
							</select>
						</label>
						{isGlobalAdmin && form.role === 'EMPLOYEE' && <label className="label cursor-pointer justify-start gap-3 sm:col-span-2">
							<input
								type="checkbox"
								className="toggle toggle-primary"
								checked={form.canViewInventory}
								onChange={(event) => setForm({ ...form, canViewInventory: event.target.checked })}
							/>
							<span className="label-text">Permitir consultar inventario de su sucursal</span>
						</label>}
						<label className="form-control sm:col-span-2"><span className="label-text mb-1">Dirección</span><input className="input input-bordered" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} /></label>
						{error && <p className="text-sm text-error sm:col-span-2" role="alert">{error}</p>}
						<div className="modal-action sm:col-span-2">
							<button type="button" className="btn" onClick={closeForm}>Cancelar</button>
							<button type="submit" className="btn btn-primary" disabled={isSaving}>{isSaving ? 'Guardando...' : 'Guardar usuario'}</button>
						</div>
					</form>
				</div>
				<form method="dialog" className="modal-backdrop"><button onClick={closeForm}>Cerrar</button></form>
			</dialog>

			{pendingDelete && (
				<dialog open className="modal modal-open">
					<div className="modal-box">
						<h2 className="text-lg font-semibold">Eliminar usuario</h2>
						<p className="py-4">¿Eliminar la cuenta de <strong>{pendingDelete.username}</strong>? Esta acción no se puede deshacer.</p>
						<div className="modal-action">
							<button className="btn" onClick={() => setPendingDelete(null)}>Cancelar</button>
							<button className="btn btn-error" onClick={handleDelete}>Eliminar</button>
						</div>
					</div>
					<button className="modal-backdrop" aria-label="Cerrar confirmación" onClick={() => setPendingDelete(null)} />
				</dialog>
			)}
		</section>
	);
}