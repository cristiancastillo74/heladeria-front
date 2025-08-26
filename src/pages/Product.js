import React, { useEffect, useState } from 'react'
import { deleteProduct, getProducts, saveProduct } from '../services/productService';
import PaginatedTable from '../component/PaginatedTable';
import { getCategories } from "../services/categoryService";
import { EditIcon, DeleteIcon, SaveIcon} from '../assets/icons';

const Products = () => {
    const [products, setProducts]               = useState([]);
    const [loading, setLoading]                 = useState(true);
    const [error, setError]                     = useState(null);
    const [categories, setCategories]           = useState([]);
    const [currentProduct, setCurrentProduct]   = useState({ name: "", category: "", price: "", ballsPerUnit: "" });
    const [isEditing, setIsEditing]             = useState(false); // false = crear, true = editar
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);




    useEffect(() => {
        const fetchProducts = async () => {
            try{
                const data = await getProducts();
                setProducts(data);
                //console.log(data);
            } catch (err) {
                setError('error al obtenre los productos');
                console.error(err);
            } finally {
                setLoading(false)
            }
        };
        fetchProducts();
    }, []);

    // traer categorías
    useEffect(() => {
      const fetchCategories = async () => {
        try {
          const data = await getCategories();
          //console.log("categorías desde backend:", data);
          setCategories(data); 
        } catch (err) {
          console.error("Error al obtener categorías:", err);
        }
      };
      fetchCategories();
    }, []);


    const openCreateModal = () => {
      setCurrentProduct({ name: "", category: "", price: "", ballsPerUnit: "" });
      setIsEditing(false);
      document.getElementById("product_modal").showModal();
    };

    const openEditModal = (product) => {
      setCurrentProduct(product);
      setIsEditing(true);
      document.getElementById("product_modal").showModal();
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        await saveProduct(currentProduct); // tu backend decide si es update o create según tenga id
        const updated = await getProducts();
        setProducts(updated);
        document.getElementById("product_modal").close();
        setCurrentProduct({ name: "", category: "", price: "", ballsPerUnit: "" });
      } catch (err) {
        console.error("Error al guardar producto:", err);
      }
    };

    const openConfirmDelete = (id) => {
      setConfirmDeleteId(id);
      document.getElementById("confirm_delete_modal").showModal();
    };

    const confirmDelete = async () => {
      try {
        await deleteProduct(confirmDeleteId);
        const updated = await getProducts();
        setProducts(updated);
        setConfirmDeleteId(null);
        document.getElementById("confirm_delete_modal").close();
      } catch (err) {
        console.error("Error al eliminar producto:", err);
      }
    };

    if(loading) return <p className='text-center mt-10'>Cargando Productos..</p>
    if(error)   return <p className='text-center mt-10 text-red-500'>{error}</p>

  return (
    <div className='p-10'>
        <h1 className='text-2xl font-bold mb-4 text-center'>PRODUCTOS</h1>
        
        <PaginatedTable
        columns={['ID', 'PRODUCTO', 'CATEGORIA', 'PRECIO', 'BOLAS POR UNI', 'ACCIONES']}
        data={products}
        renderRow={(product) => (
          <tr key={product.id} className="hover:bg-base-300">
            <td className="text-center">{product.id}</td>
            <td className="text-center">{product.name}</td>
            <td className="text-center">{product.category}</td>
            <td className="text-center">$ {product.price}</td>
            <td className="text-center">{product.ballsPerUnit}</td>
            <td>
              <button className="btn btn-outline btn-warning me-1 btn-sm"
                onClick={() => openEditModal(product)}>
                  <EditIcon className="w-5 h-5 text-current " />
                  Editar
              </button>
              <button className="btn btn-outline btn-error ml-1 btn-sm"
              onClick={() => openConfirmDelete(product.id)}>
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
            CREAR PRODUCTO
          </button>
        }
        filasPorPagina={10} 
      />

      <dialog id="product_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">{isEditing ? "Editar Producto" : "Nuevo Producto"}</h3>
          <form method="dialog" className="mt-4 space-y-3" onSubmit={handleSubmit}>
            <input 
              type="text" 
              placeholder="Nombre" 
              className="input input-bordered w-full" 
              value={currentProduct.name}
              onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })}
            />
            <select 
              className="select select-bordered w-full"
              value={currentProduct.category}
              onChange={(e) => setCurrentProduct({ ...currentProduct, category: e.target.value })}
              required
            >
              <option value="">Seleccione Categoría</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <input 
              type="number" 
              placeholder="Precio" 
              className="input input-bordered w-full" 
              value={currentProduct.price}
              onChange={(e) => setCurrentProduct({ ...currentProduct, price: e.target.value })}
            />
            <input 
              type="number" 
              placeholder="Bolas por Unidad" 
              className="input input-bordered w-full" 
              value={currentProduct.ballsPerUnit}
              onChange={(e) => setCurrentProduct({ ...currentProduct, ballsPerUnit: e.target.value })}
            />

            <div className="modal-action">
              <button type="submit" className="btn btn-success">{isEditing ? "Actualizar" : "Guardar"}</button>
              <button type="button" className="btn" onClick={() => document.getElementById("product_modal").close()}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </dialog>

      <dialog id="confirm_delete_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg text-red-500">Confirmar eliminación</h3>
          <p className="py-4">¿Está seguro de que desea eliminar este producto?</p>
          <div className="modal-action">
            <button className="btn btn-error" onClick={confirmDelete}>Eliminar</button>
            <button className="btn" onClick={() => {
              setConfirmDeleteId(null);
              document.getElementById("confirm_delete_modal").close();
            }}>Cancelar</button>
          </div>
        </div>
      </dialog>



    </div>

    
  );
};
export default Products;
