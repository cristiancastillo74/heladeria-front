import React, { useEffect, useState } from 'react'
import { deleteExpense, getExpenses, saveExpense } from '../services/expenseService';
import PaginatedTable from '../component/PaginatedTable';
import { DeleteIcon, SaveIcon } from '../assets/icons';
import { useAuth } from '../context/AuthContext';

const Expenses = () => {
    const [expense,     setExpense]                 = useState([]);
    const [isLoading, setIsLoading]                 = useState(true);
    const [isError,     setIsError]                 = useState(null);
    const [confirmDeleteId, setconfirmDeleteId]     = useState(null);
    const [confirmDeleteDesc, setConfirmDeleteDesc] = useState('');
    const [currentExpense, setCurrentExpense]       = useState({descripcion:'', amount:0, user:null, branch:null});
    const [isEditing, setIsEditing]                 = useState(false);
    const { currentUser, currentBranch }            = useAuth();
    //const [isEditing, setIsEditing]         = useState(false);

    useEffect(() => {
        const fetchExpenses = async () =>{
            try{
                const data = await getExpenses();
                setExpense(data);
                console.log(data);
            }catch(err){
                setIsError('error');
                console.log(err);
            }finally{
                setIsLoading(false);
            }
        };
        fetchExpenses();
    },[]);

    const openCreateModal = () => {
        setCurrentExpense({descripcion:'', amount:0, user: currentUser,branch: currentBranch});
        setIsEditing(false);
        document.getElementById('save_modal').showModal();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
            await saveExpense(currentExpense);
            const update = await getExpenses();
            setExpense(update);
            document.getElementById('save_modal').close();
            setCurrentExpense({descripcion:'', amount:0, user: currentUser,branch: currentBranch});
        }catch(error){
            console.log('error');
        }
    };

    const openDeleteModal = (id, desc) => {
        setconfirmDeleteId(id);
        setConfirmDeleteDesc(desc);
        document.getElementById('delete_modal').showModal();
    };

    const confirmDelete = async () => {
        try{
            await deleteExpense(confirmDeleteId);
            const update = await getExpenses();
            setExpense(update);
            setconfirmDeleteId(null);
            document.getElementById('delete_modal').close();
        }catch(err){
            console.log(err);
        }
    }

    if(isLoading) return <p className='text-center mt-10'>Cargando Productos..</p>
    if(isError)   return <p className='text-center mt-10 text-red-500'>{isError}</p>
    return (
    <div className='p-10'>
        <h1 className='text-2xl font-bold mb-4 text-center'>Registro de gastos</h1>
        <PaginatedTable
            columns={['ID','GASTO','MONTO','QUIEN REALIZO EL GASTO','FECHA registro','FECHA modificacion','ACCIONES']}
            data={expense}
            renderRow={(ex) => (
                <tr key={ex.id} className='hover:bg-base-300'>
                    <td className='text-center'>{ex.id}</td>
                    <td className='text-center'>{ex.descripcion}</td>
                    <td className='text-center'>{ex.amount}</td>
                    <td className='text-center'>{ex.user.firstName} {ex.user.lastName}</td>
                    <td className='text-center'>{ex.createdAt}</td>
                    <td className='text-center'>{ex.updatedAt}</td>
                    <td>
                        <button className='btn btn-outline btn-error ml-1 btn-sm'
                            onClick={() =>{openDeleteModal(ex.id, ex.descripcion)}}>
                                <DeleteIcon className='w-5 h-5 text-current'/>
                                Eliminar
                        </button>
                    </td>
                </tr>
            )}
            extraAction={
                <button className='btn btn-outline btn-primary'
                onClick={openCreateModal}>
                    <SaveIcon className="w-5 h-5 text-current "/>
                    Registrar Gasto
                </button>
            }
            filasPorPagina={10}
        />

        <dialog className='modal' id='save_modal'>
            <div className='modal-box'>
                <h3 className='font-bold text-lg text-yellow-500 text-center'>{isEditing ? 'Editando el Gasto' : 'Registrando un Nuevo Gasto'}</h3>
                <form method='dialog' className='mt-4 space-y-3' onSubmit={handleSubmit}>
                    <textarea 
                        type='text'
                        placeholder='Descripcion del Gasto'
                        className='input input-bordered w-full'
                        value={currentExpense.descripcion}
                        onChange={(e) => setCurrentExpense({...currentExpense, descripcion: e.target.value})}/>
                    
                    <input
                    type='number'
                    placeholder='Monto del gasto'
                    className='input input-bordered w-full'
                    value={currentExpense.amount}
                    onChange={(e) => setCurrentExpense({...currentExpense, amount: e.target.value})}/>

                    {/* Mostrar info del usuario actual */}
                    <div className="text-sm text-gray-600">
                        {/* <h3><strong>Datos del usuario que registra el gasto</strong></h3> */}
                        <p><strong>Usuario:</strong> {currentUser?.firstName} {currentUser?.lastName}</p>
                        <p><strong>Sucursal:</strong> {currentBranch?.name}</p>
                    </div>

                    <div className="modal-action">
                    <button type="submit" className="btn btn-success">{isEditing ? "Actualizar" : "Registrar"}</button>
                    <button type="button" className="btn" onClick={() => document.getElementById("save_modal").close()}>
                        Cancelar
                    </button>
                    </div>

                </form>
            </div>

        </dialog>

        <dialog className='modal' id='delete_modal'>
            <div className='modal-box'>
                <h3 className='font-bold text-lg text-red-500'>Eliminar el Gasto Registrado</h3>
                <p>Estas seguro de eliminar el Gasto?: <strong>{confirmDeleteDesc}</strong> </p>
                <div className='modal-accion'>
                    <button className='btn btn-error' onClick={confirmDelete}>Eliminar</button>
                    <button className='btn' 
                        onClick={() =>{
                            setconfirmDeleteId(null);
                            setConfirmDeleteDesc('');
                            document.getElementById('delete_modal').close();
                        }}
                        >Cancelar</button>
                </div>
            </div>
        </dialog>
    </div>
  );
};

export default Expenses