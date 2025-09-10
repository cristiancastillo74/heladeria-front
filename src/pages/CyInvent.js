import React, { useEffect, useState } from 'react'
import { getCyInvent, saveInvent } from '../services/cyInventService';
import PaginatedTable from '../component/PaginatedTable';
import { DeleteIcon, EditIcon, SaveIcon } from '../assets/icons';
import { getStatus } from '../services/statusService';

  const CyInvent = () => {

    const [cyInvents, setCyInvents]             = useState([]);
    const [statusOptions, setStatusOptions]     = useState([]);
    const [loading, setLoading]                 = useState(true);
    const [error,   setError]                   = useState(null);
    const [currentCyInvent, setCurrentInvent]   = useState({ fraction:"", status:""});
    const [isEditing, setIsEditing]             = useState(false);


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
        setCurrentInvent({ fraction:"", status:""});
        setIsEditing(false);
        document.getElementById("cyInvent_modal").showModal();
    };


    const handleSubmit = async (e) =>{
            e.preventDefault();
            try{
                await saveInvent(currentCyInvent);
                const updated = await getCyInvent();
                setCyInvents(updated);
                document.getElementById("cyInvent_modal").close();
                setCurrentInvent({ fraction:"", status:""});
            }catch(err){
                console.log("error",err);
            }
        };


    if(loading) return <p className='text-center mt-10'>Cargando Inventario de Cilindros</p>
    if(error) return <p className='text-center mt-10 text-red-500'>{error}</p>


  return (
    <div className='p-10'>
      <h1 className='text-2xl font-bold mb-4 text-center'>Inventario de sorbetes</h1>
      <PaginatedTable
        columns={['ID', 'SABOR', 'ESTADO','US0 %','FECHA DE COMPRA', 'ACCIONES']}
        data={cyInvents}
        renderRow={(cyInvent) => (
          <tr key={cyInvent.id} className='hover:bg-base-300'>
            <td className='text-center'>{cyInvent.id}</td>
            <td className='text-center'>{cyInvent.cylinder.flavor}</td>
            <td className='text-center'>{cyInvent.status}</td>
            <td className='text-center'>{cyInvent.fraction * 100} %</td>
            <td className='text-center'>{new Date(cyInvent.createdAt).toLocaleDateString()}</td>
            <td>
                <button className="btn btn-outline btn-warning me-1 btn-sm">
                  <EditIcon className="w-5 h-5 text-current " />
                  Editar
                </button>
                <button className="btn btn-outline btn-error ml-1 btn-sm">
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
                  value={currentCyInvent.status}
                  onChange={(e) =>
                    setCurrentInvent({ ...currentCyInvent, status: e.target.value })
                  }
                >
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
                  <option value="">-- Selecciona el tipo de cilindro --</option>
                  <option value="1">Cilindro lleno</option>
                  <option value="0.5">Medio cilindro</option>
                </select>

                <div className='modal-accion'>
                    <button type='submit' className='btn btn-success'>{isEditing ? "Editar" : "Guardar"}</button>
                    <button type='button' className='btn' onClick={() => document.getElementById("cyInvent_modal").close()} >Cancelar</button>
                </div>
            </form>
        </div>
      </dialog>
    </div>
  )
}

export default CyInvent