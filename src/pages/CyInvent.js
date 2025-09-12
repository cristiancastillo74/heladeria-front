import React, { useEffect, useState } from 'react'
import { deleteCyInvent, getCyInvent, saveInvent } from '../services/cyInventService';
import PaginatedTable from '../component/PaginatedTable';
import { DeleteIcon, EditIcon, SaveIcon } from '../assets/icons';
import { getStatus } from '../services/statusService';
import { getCylinder } from '../services/cylinderService';
import { useAuth } from '../context/AuthContext';


  const CyInvent = () => {

    const [cyInvents, setCyInvents]             = useState([]);
    const [statusOptions, setStatusOptions]     = useState([]);
    const [cylinders, setCylinders]             = useState([]);
    const [loading, setLoading]                 = useState(true);
    const [error,   setError]                   = useState(null);
    const [currentCyInvent, setCurrentInvent]   = useState({ fraction:"", status:"", branch:null, cylinder:null});
    const [isEditing, setIsEditing]             = useState(false);
    const { currentUser, currentBranch }        = useAuth();
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    

    useEffect(() =>{
      const fetchCylinder = async () =>{
        try{
          const data = await getCylinder();
          setCylinders(data);
        }catch(error){
          setError("error")
          console.log('error',error);
        }
      };
      fetchCylinder();
    },[]);

    useEffect(() => {
      const fetchStatus = async () =>{
        try{
          const data = await getStatus();
          setStatusOptions(data);
          //console.log(data);
        }catch(err){
          setError("error");
          console.log(err);
        }
      };
      fetchStatus();
    }, []);

    useEffect (() =>{
    const fetchCyInvents = async () =>{
        try{
          const data = await getCyInvent();
          setCyInvents(data);
          console.log(data);
        }catch(err){
          setError("error");
          console.log(err);
        } finally{
          setLoading(false);
        }
      };
      fetchCyInvents();
    },[]);

    const openCreateModal = () =>{
        setCurrentInvent({ fraction:"", status:"" ,user: currentUser,branch: currentBranch,cylinder:null});
        setIsEditing(false);
        document.getElementById("cyInvent_modal").showModal();
    };

    const openEditModal = (cyInvent) =>{
      setCurrentInvent({...cyInvent,user: currentUser});
      setIsEditing(true);
      document.getElementById('cyInvent_modal').showModal();
    };

    const openDeleteModal = (id) => {
      setConfirmDeleteId(id);
      document.getElementById('delete_modal').showModal();
    };


    const handleSubmit = async (e) =>{
            e.preventDefault();
            try{
                await saveInvent(currentCyInvent);
                const updated = await getCyInvent();
                setCyInvents(updated);
                document.getElementById("cyInvent_modal").close();
                setCurrentInvent({ fraction:"", status:"",user: null,branch:null, cylinder:null});
            }catch(err){
                console.log("error",err);
            }
        };

    const confirmDelete = async () => {
      try{
        await deleteCyInvent(confirmDeleteId);
        const update = await getCyInvent();
        setCyInvents(update);
        setConfirmDeleteId(null);
        document.getElementById('delete_modal').close();
      }catch(err){
        console.error('error al eliminar',err);
      }
    };


    if(loading) return <p className='text-center mt-10'>Cargando Inventario de Cilindros</p>
    if(error) return <p className='text-center mt-10 text-red-500'>{error}</p>


  return (
    <div className='p-10'>
      <h1 className='text-2xl font-bold mb-4 text-center'>Inventario de sorbetes</h1>
      <PaginatedTable
        columns={['ID', 'SABOR', 'ESTADO','US0 %','FECHA DE COMPRA','REGISTRADO/EDITADO', 'ACCIONES']}
        data={cyInvents}
        renderRow={(cyInvent) => (
          <tr key={cyInvent.id} className='hover:bg-base-300'>
            <td className='text-center'>{cyInvent.id}</td>
            <td className='text-center'>{cyInvent.cylinder.flavor}</td>
            <td className='text-center'>{cyInvent.status}</td>
            <td className='text-center'>{cyInvent.fraction * 100} %</td>
            <td className='text-center'>{new Date(cyInvent.createdAt).toLocaleDateString()}</td>
            <td className='text-center'>{cyInvent.user?.firstName} {cyInvent.user?.lastName}</td>
            <td>
                <button className="btn btn-outline btn-warning me-1 btn-sm"
                  onClick={() => openEditModal(cyInvent)}>
                  <EditIcon className="w-5 h-5 text-current " />
                  Editar
                </button>
                <button className="btn btn-outline btn-error ml-1 btn-sm"
                onClick={() => openDeleteModal(cyInvent.id)}>
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
            Registrar Inventario
          </button>
        }
        filasPorPagina={10}
      />
      <dialog className='modal' id='cyInvent_modal'>
        <div className='modal-box'>
            <h3 className="font-bold text-lg">{isEditing ? "Editar Inventario" : "Registrar Inventario de Cilindros"}</h3>
            <form method='dialog' className='mt-4 space-y-3' onSubmit={handleSubmit}>

                <select
                  className="select select-bordered w-full"
                  value={currentCyInvent.cylinder?.id || ""}
                  onChange={(e) => {
                    const selectedId = parseInt(e.target.value);
                    const selectedCylinder = cylinders.find(c => c.id === selectedId) || null;
                    setCurrentInvent({ ...currentCyInvent, cylinder: selectedCylinder });
                  }}
                >
                  <option value="">--Seleccione un sabor de Helado--</option>
                  {cylinders.map((cylinder) => (
                    <option key={cylinder.id} value={cylinder.id}>
                      {cylinder.flavor}
                    </option>
                  ))}
                </select>

                <select
                  className="select select-bordered w-full"
                  value={currentCyInvent.status}
                  onChange={(e) =>
                    setCurrentInvent({ ...currentCyInvent, status: e.target.value })
                  }>
                  <option value="">-- Selecciona un estado --</option>
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <select
                  className="select select-bordered w-full"
                  value={currentCyInvent.fraction}
                  onChange={(e) =>
                    setCurrentInvent({ ...currentCyInvent, fraction: e.target.value })
                  }
                >
                  <option value=""   >-- Selecciona el tipo de cilindro --</option>
                  <option value="1"  >CILINDRO_COMPLETO </option>
                  <option value="0.5">CILINDRO_MEDIO    </option>
                  <option value="0"  >CILINDRO_VACIO    </option>
                </select>

                {/* Mostrar info del usuario actual */}
                <div className="text-sm text-gray-600">
                    {/* <h3><strong>Datos del usuario que registra el gasto</strong></h3> */}
                    <p><strong>Usuario:</strong> {currentUser?.firstName} {currentUser?.lastName}</p>
                    <p><strong>Sucursal:</strong> {currentBranch?.name}</p>
                </div>

                <div className='modal-accion'>
                    <button type='submit' className='btn btn-success'>{isEditing ? "Editar" : "Guardar"}</button>
                    <button type='button' className='btn' onClick={() => document.getElementById("cyInvent_modal").close()} >Cancelar</button>
                </div>
            </form>
        </div>
      </dialog>
      <dialog className='modal' id='delete_modal'>
        <div className='modal-box'>
          <h3 className="font-bold text-lg text-red-500">Confirmar eliminación</h3>
          <p className="py-4">¿Está seguro de que desea eliminar este Cilindro del inventario?</p>
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
  )
}

export default CyInvent