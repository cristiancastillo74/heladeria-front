import React, { useEffect, useState } from 'react'
import { getProducts } from '../services/productService';

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
        <div className="overflow-x-auto">
            <table className="table table-zebra max-w-7xl mx-auto border">
                <thead className='bg-blue-400 text-white'>
                <tr>
                    <th>ID</th>
                    <th>Producto</th>
                    <th>Categoria</th>
                    <th>Precio</th>
                    <th>Stock</th>
                    <th>Bolas Por unidad</th>
                    <th>Sabor Helado</th>
                    <th>Acciones</th>
                </tr>
                </thead>
                
                <tbody>
                        {products.map((product) => (
                        <tr key={product.id} className="hover:bg-base-300">
                            <td> {product.id}</td>
                            <td> {product.name} </td>
                            <td> {product.category} </td>
                            <td>$ {product.price}</td>
                            <td> {product.stock}</td>
                            <td> {product.ballsPerUnit}</td>
                            <td> {product.cylinder?.flavor}</td>
                            <td></td>
                        </tr>
                        ))}
                </tbody>
            </table>
        </div>
    </div>
  );
};
export default Products;
