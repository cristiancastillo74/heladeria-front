import React, { useEffect, useState } from 'react'
import { getProducts } from '../services/productService';
import PaginatedTable from '../component/PaginatedTable';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);

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
          <button className="btn btn-outline btn-primary">
            CREAR PRODUCTO
          </button>
        }
        filasPorPagina={10} 
      />
    </div>
  );
};
export default Products;
