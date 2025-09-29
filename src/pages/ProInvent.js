import React, { useEffect, useState } from 'react'
import { getProInvents } from '../services/proInventService';
import PaginatedTable from '../component/PaginatedTable';
import { AddIcon, DeleteIcon, EditIcon, SaveIcon } from '../assets/icons';

const ProInvent = () => {

    const [proInvents, setProInvents]                   = useState([]);
    const [loading, setLoading]                         = useState(true);
    const [error, setError]                             = useState(null);
    const [isEditing, setIsEditing]                     = useState(false);

    useEffect(() => {
        const fetchProInvents = async () =>{
            try{
                const data = await getProInvents();
                console.log(data);
                setProInvents(data);
            }catch(err){
                console.log(err);
            }finally{
                setLoading(false);
            }
        };
        fetchProInvents();
    }, []);


    if(loading) return <p className='text-center mt-10'>Cargando Productos..</p>
    if(error)   return <p className='text-center mt-10 text-red-500'>{error}</p>

  return (
    <div className='p-10'>
        <h1 className='text-2xl font-bold mb-4 text-center'>INVENTARIO DE PRODUCTOS</h1>
        <PaginatedTable
            columns={['ID', 'PRODUCTO', 'EXISTENCIA', 'ACCIONES']}
            data={proInvents}
            renderRow={(proInvent) => (
                <tr key={proInvent.id} className="hover:bg-base-300">
                    <td className='text-center'>{proInvent.id}</td>
                    <td className='text-center'>{proInvent.product.name}</td>
                    <td className='text-center'>{proInvent.stock}</td>
                    <td className='text-center'>
                        <button className='btn btn-outline btn-warning me-1 btn-sm'>
                            <EditIcon className="w-5 h-5 text-current " />
                            Editar
                        </button>
                        <button className='btn btn-outline btn-error me-1 btn-sm'>
                            <DeleteIcon className="w-5 h-5 text-current " />
                            ELiminar
                        </button>

                    </td>
                </tr>
            )}
            extraAction={
                <button className="btn btn-outline btn-primary">
                    <AddIcon className="w-5 h-5 text-current " />
                    Registrar Inventario
                </button>
            }
            filasPorPagina={10}

        />
    </div>
  )
}

export default ProInvent