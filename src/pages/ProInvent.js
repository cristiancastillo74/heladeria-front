import React, { useEffect, useState } from 'react'
import { deleteProInvent, getProInvents, saveProInvent } from '../services/proInventService';
import PaginatedTable from '../component/PaginatedTable';
import { AddIcon, DeleteIcon, EditIcon, SaveIcon } from '../assets/icons';
import { getProducts } from '../services/productService';
import { useAuth } from '../context/AuthContext';

const ProInvent = () => {

    const [proInvents, setProInvents]                   = useState([]);
    const [products, setProducts]                       = useState([]);
    const [loading, setLoading]                         = useState(true);
    const [error, setError]                             = useState(null);
    const [isEditing, setIsEditing]                     = useState(false);
    const [currentProInvent, setCurrentProInvent]       = useState({ product: null, stock: "" ,user:null, branch:null});
    const {currentUser, currentBranch}                  = useAuth();
    const [confirmDeleteId, setConfirmDeleteId]         = useState(null);

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

    useEffect(() => {
        const fetchProducts = async () => {
            try{
            const datapro = await getProducts();
            console.log(datapro);
            setProducts(datapro);
        }catch(err){
            console.log(err);        
        }
        };fetchProducts();
    },[]);

    const openCreateModal = () => {
        setCurrentProInvent({ product: null, stock: "",  branch: currentBranch});
        setIsEditing(false);
        document.getElementById("pro_invent_modal").showModal();
    };

    const openEditModal = (proInvents) => {
        setCurrentProInvent(proInvents);
        setIsEditing(true);
        document.getElementById("pro_invent_modal").showModal();

    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
            await saveProInvent(currentProInvent);
            const update = await getProInvents();
            setProInvents(update);
            document.getElementById("pro_invent_modal").close();
            setCurrentProInvent({ product: null, stock: "" ,user:null, branch:null })
        }catch(err){
            console.log(err);
        }
    }

    const openDeleteModal = (id) => {
        setConfirmDeleteId(id);
        document.getElementById('delete_modal').showModal();    
    }

    const confirmDelete = async () => {
        try{
            await deleteProInvent(confirmDeleteId);
            const update = await getProInvents();
            setProInvents(update);
            setConfirmDeleteId(null);
            document.getElementById('delete_modal').close();
        }catch(err){
            console.log(err);
        }
    }

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
                        <button className='btn btn-outline btn-warning me-1 btn-sm'
                            onClick={() => openEditModal(proInvent)}>
                            <EditIcon className="w-5 h-5 text-current " />
                            Editar
                        </button>
                        <button className='btn btn-outline btn-error me-1 btn-sm'
                            onClick={() => openDeleteModal(proInvent.id)}>
                            <DeleteIcon className="w-5 h-5 text-current " />
                            ELiminar
                        </button>

                    </td>
                </tr>
            )}
            extraAction={
                <button className="btn btn-outline btn-primary"
                    onClick={openCreateModal}>
                    <AddIcon className="w-5 h-5 text-current " />
                    Registrar Inventario
                </button>
            }
            filasPorPagina={10}
        />
    <dialog id='pro_invent_modal' className='modal'>
        <div className="modal-box">
            <h3 className='font-bold text-lg mb-4'>{isEditing ? "Editar Inventario de un Producto" : "Registrar compra de un producto"}</h3>
            <form method="dialog" className="mt-4 space-y-3" onSubmit={handleSubmit}>
                        <select 
                            className="select select-bordered w-full"
                            value={currentProInvent.product?.id || ''}
                            onChange={(e) => {
                                const selectedId = parseInt(e.target.value);
                                const selectedProduct = products.find(p => p.id === selectedId);
                                setCurrentProInvent(prev => ({...prev, product: selectedProduct}));
                                }}
                                >
                            <option disabled selected>Selecciona un producto</option>
                            {products.map((product) => (
                                <option key={product.id} value={product.id}>{product.name}</option>
                            ))}
                        </select>
                        <input 
                            type='number' 
                            className='input input-bordered w-full ' 
                            placeholder='Cantidad' 
                            value={currentProInvent.stock}
                            onChange={(e) => setCurrentProInvent({ ...currentProInvent, stock: e.target.value })}/>

                        <div >
                            <p><strong>Usuario :</strong> {currentUser?.name} {currentUser?.lastname}</p>
                            <p><strong>Sucursal :</strong> {currentBranch?.name}</p>
                        </div>
                        
                        <div className="modal-action">
                            <button 
                                className='btn btn-outline btn-success me-1 btn-sm'>
                                <SaveIcon className="w-5 h-5 text-current " />
                                {isEditing ? "Guardar Cambios" : "Registrar"}
                            </button>
                            <button 
                                type='button'
                                className='btn btn-outline btn-error me-1 btn-sm'
                                onClick={() => document.getElementById("pro_invent_modal").close()}>
                                Cancelar
                            </button>  
                        </div> 
            </form>
        </div>
    </dialog>


    <dialog className='modal' id='delete_modal'>
        <div className='modal-box'>
            <h3 className='font-bold text-lg text-red-500 text-center'>¿Estás seguro de eliminar este registro?</h3>
            <p className='text-center'>Esta acción no se puede deshacer.</p>
            <div className='modal-action justify-center'>
                <button className='btn btn-error'
                    onClick={confirmDelete}>
                    Eliminar
                </button>
                <button className='btn btn-outline btn-success'
                    onClick={() => {
                        setConfirmDeleteId(null);
                        document.getElementById('delete_modal').close();
                        }}>
                    Cancelar
                </button>
            </div>
        </div>
    </dialog>
    </div>
  )
}

export default ProInvent