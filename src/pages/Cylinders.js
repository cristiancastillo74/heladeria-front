import React, { useEffect, useState } from 'react'
import { deleteCylinder, getCylinder, saveCylinder } from '../services/cylinderService';
import PaginatedTable from '../component/PaginatedTable';
import { DeleteIcon, EditIcon, SaveIcon } from '../assets/icons';

const Cylinders = () => {
    const [cylinders, setCylinders]             = useState([]);
    const [loading, setLoading]                 = useState(true);
    const [error, setError]                     = useState(null);
    const [isEditing, setIsEditing]             = useState(false);
    const [currentCylinder, setCurrentCylinder] = useState({flavor:"", estimatedBalls:""});
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    useEffect(() => {
        const fetchCylinders = async () =>{
            try{
                const data = await getCylinder();
                setCylinders(data);
                console.log(data);
            }catch(err){
                setError("error");
                console.log(err);
            } finally{
                setLoading(false);
            }
        };
        fetchCylinders();
    },[]);

    const openCreateModal = () =>{
        setCurrentCylinder({flavor:"", estimatedBalls:""});
        setIsEditing(false);
        document.getElementById("cylinder_modal").showModal();
    };

    const openEditModal = (cylinder) =>{
        setCurrentCylinder(cylinder);
        setIsEditing(true);
        document.getElementById("cylinder_modal").showModal();
    };

    const handleSubmit = async (e) =>{
        e.preventDefault();
        try{
            await saveCylinder(currentCylinder);
            const updated = await getCylinder();
            setCylinders(updated);
            document.getElementById("cylinder_modal").close();
            setCurrentCylinder({flavor:"", estimatedBalls:""});
        }catch(err){
            console.log("error",err);
        }
    };

    const openConfirmDelete = (id) => {
        setConfirmDeleteId(id);
        document.getElementById("delete_modal").showModal();
    }

    const confirmDelete = async () => {
          try {
            await deleteCylinder(confirmDeleteId);
            const updated = await getCylinder();
            setCylinders(updated);
            setConfirmDeleteId(null);
            document.getElementById("delete_modal").close();
          } catch (err) {
            console.error("Error al eliminar cylinder:", err);
          }
        };

    if(loading) return <p className='text-center mt-10'>Cagando Cylinders</p>
    if(error) return <p className='text-center mt-10 text-red-500'>{error}</p>

  return (
    <div className='p-10'>
         <h1 className='text-2xl font-bold mb-4 text-center'>CILINDROS DE HELADO</h1>
         <PaginatedTable
            columns={['ID', 'SABOR', 'PROMEDIO DE BOLAS', 'ACCIONES']}
            data={cylinders}
            renderRow={(cylinder) => (
                <tr key={cylinder.id} className='hover:bg-base-300'>
                    <td className='text-center'>{cylinder.id}</td>
                    <td className='text-center'>{cylinder.flavor}</td>
                    <td className='text-center'>{cylinder.estimatedBalls}</td>
                    <td >
                        <button className="btn btn-outline btn-warning me-1 btn-sm"
                            onClick={() => openEditModal(cylinder)}
                        >
                            <EditIcon className="w-5 h-5 text-current " />
                            Editar
                        </button>
                        <button className="btn btn-outline btn-error ml-1 btn-sm"
                            onClick={() => openConfirmDelete(cylinder.id)}
                        >
                            <DeleteIcon className="w-5 h-5 text-current " />
                            Eliminar
                        </button>
                    </td>
                </tr>
            )}
            extraAction={
            <button className="btn btn-outline btn-primary "
                onClick={openCreateModal}
            >
                <SaveIcon className="w-5 h-5 text-current " />
                CREAR CILINDRO
            </button>
            }
            filasPorPagina={10} 
        
        />
    <dialog className='modal' id='cylinder_modal'>
        <div className='modal-box'>
            <h3 className="font-bold text-lg">{isEditing ? "Editar Cilindro" : "Crear Cilindro"}</h3>
            <form method='dialog' className='mt-4 space-y-3' onSubmit={handleSubmit}>
                <input
                    type='text'
                    placeholder='sabor'
                    className='input input-bordered w-full'
                    value={currentCylinder.flavor}
                    onChange={(e) => setCurrentCylinder({...currentCylinder, flavor: e.target.value})}
                />
                <input
                    type='number'
                    placeholder='estimado de bolas'
                    className='input input-bordered w-full'
                    value={currentCylinder.estimatedBalls}
                    onChange={(e) => setCurrentCylinder({...currentCylinder, estimatedBalls: e.target.value})}
                />
                <div className='modal-accion'>
                    <button type='submit' className='btn btn-success'>{isEditing ? "Editar" : "Guardar"}</button>
                    <button type='button' className='btn' onClick={() => document.getElementById("cylinder_modal").close()} >Cancelar</button>
                </div>
            </form>
        </div>
    </dialog>
    <dialog id="delete_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg text-red-500">Confirmar eliminación</h3>
          <p className="py-4">¿Está seguro de que desea eliminar este cilindro?</p>
          <div className="modal-action">
            <button className="btn btn-error" onClick={confirmDelete}>Eliminar</button>
            <button className="btn" onClick={() => {
              setConfirmDeleteId(null);
              document.getElementById("delete_modal").close();
            }}>Cancelar</button>
          </div>
        </div>
    </dialog>
    </div>
  );
};
export default Cylinders