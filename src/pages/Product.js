import React, { useEffect, useState } from 'react'
import { getProducts, createProduct } from '../services/productService';
import PaginatedTable from '../component/PaginatedTable';
import { getCategories } from "../services/categoryService";

const Products = () => {
    const [products, setProducts]     = useState([]);
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState(null);
    const [newProduct, setNewProduct] = useState({name: "",category: "",price: "",ballsPerUnit: ""});
    const [categories, setCategories] = useState([]);


    useEffect(() => {
        const fetchProducts = async () => {
            try{
                const data = await getProducts();
                setProducts(data);
                console.log(data);
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
          console.log("categorías desde backend:", data);
          setCategories(data); 
        } catch (err) {
          console.error("Error al obtener categorías:", err);
        }
      };
      fetchCategories();
    }, []);

    const handleCreate = async (e) => {
      e.preventDefault();
      try {
        await createProduct(newProduct);
        // refrescar la lista
        const updated = await getProducts();
        setProducts(updated);
        // cerrar modal
        document.getElementById("create_product_modal").close();
        // limpiar formulario
        setNewProduct({ name: "", category: "", price: "", ballsPerUnit: "" });
      } catch (err) {
        console.error("Error al crear producto:", err);
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
              <button className="btn btn-outline btn-warning me-1 btn-sm">Editar</button>
              <button className="btn btn-outline btn-error ml-1 btn-sm">Eliminar</button>
            </td>
          </tr>
        )}
        extraAction={
          <button className="btn btn-outline btn-primary"
            onClick={() => document.getElementById("create_product_modal").showModal()}
          >
            CREAR PRODUCTO
          </button>
        }
        filasPorPagina={10} 
      />

      <dialog id="create_product_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Nuevo Producto</h3>
          <form method="dialog" className="mt-4 space-y-3" onSubmit={handleCreate}>
            <input 
              type="text" 
              placeholder="Nombre" 
              className="input input-bordered w-full" 
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            />
            {/* Categoría como SELECT dinámico */}
            <select 
  className="select select-bordered w-full"
  value={newProduct.category}
  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
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
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
            />
            <input 
              type="number" 
              placeholder="Bolas por Unidad" 
              className="input input-bordered w-full" 
              value={newProduct.ballsPerUnit}
              onChange={(e) => setNewProduct({ ...newProduct, ballsPerUnit: e.target.value })}
            />

            <div className="modal-action">
              <button type="submit" className="btn btn-success">Guardar</button>
              <button type="button" className="btn" onClick={() => document.getElementById("create_product_modal").close()}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </dialog>

    </div>

    
  );
};
export default Products;
