import React, { useEffect, useState } from "react";
import { saveSales } from "../services/saleService";
import { getProducts } from "../services/productService";
import FlavorModal from "./FlavorModals";

const Sales = () => {
  const [cart, setCart]                       = useState([]);
  const [products, setProducts]               = useState([]);
  const [error, setError]                     = useState(null);
  const [loading, setLoading]                 = useState(true);
  const [showModal, setShowModal]             = useState(false);
  const [saleInfo, setSaleInfo]               = useState(null);
  const [showFlavorModal, setShowFlavorModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);



  
  useEffect(() => {
    const fetchProducts = async () => {
      try{
        const data = await getProducts();
        setProducts(data);
      }catch(err){
        setError('error al obtener Productos');
        console.error(err);
      } finally{
        setLoading(false);
      }
    };
    fetchProducts();
  },[]);

  const addToCart = (product) => {
    let sabores = "-";
    if (product.isIceCream) {
      setSelectedProduct(product);
      setShowFlavorModal(true);
    } else {
      // buscar si ya existe en el carrito
      const existingIndex = cart.findIndex((p) => p.name === product.name);
      if (existingIndex >= 0) {
        const newCart = [...cart];
        newCart[existingIndex].cantidad++;
        setCart(newCart);
      } else {
        setCart([...cart, { ...product, sabores, cantidad: 1 }]);
      }
    }
  };

  const handleConfirmFlavors = (product, ballSelections, depot) => {
    const sabores = ballSelections.map(b => `${b.flavor} (${b.balls})`).join(", ");
    setCart([
      ...cart,
      { ...product, cantidad: 1, ballSelections, sabores, depotId: depot?.id || null, depotName: depot?.name || '' }
    ]);
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.cantidad, 0);
  };

  const handleSaveSale = async () => {
    try {
      const payment = prompt("Ingrese el monto que pagó el cliente:");
      const paymentFloat = parseFloat(payment);

      if (isNaN(paymentFloat) || paymentFloat <= 0) {
        alert("Monto inválido");
        return;
      }
      const salePayload = {
        items: cart.flatMap((item) => {
          let base = {
            product: { id: item.id },
            quantity: item.cantidad,
          };

          if (item.isIceCream && item.ballSelections) {
            base.ballSelections = item.ballSelections;
          }

          if(item.isIceCream && item.depotId){
            const depotItem = { product: { id: item.depotId }, quantity: 1 };
            return [base, depotItem];
          }

          return base;
        }),
        paymentAmount: paymentFloat,
      };


      const userId = 1; // ⚠️ reemplazar con el usuario logueado
      const branchId = 1; // ⚠️ reemplazar con la sucursal seleccionada

      const response = await saveSales(salePayload, userId, branchId);
      console.log("Venta guardada:", response);

      setSaleInfo({
        total: response.totalAmount || calculateTotal(), // depende de tu API
        payment: response.paymentAmount || paymentFloat,
        change: response.changeAmount || (paymentFloat - calculateTotal()),
      });
      setCart([]); // limpiar carrito
      setShowModal(true);
    } catch (err) {
      console.error(err);
      alert("Error al guardar la venta ❌");
    }
  };

  if(loading) return <p className='text-center mt-10'>Cargando Productos..</p>
  if(error)   return <p className='text-center mt-10 text-red-500'>{error}</p>

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Pantalla de Ventas</h1>

      {/* Botones de productos tipo Helados*/}
      <div className="flex gap-2 flex-wrap mb-6">
        {products.map((p) => (
          p.isIceCream && (
            <button
              key={p.name}
              className="px-4 py-2 bg-green-600 text-white rounded-lg"
              onClick={() => addToCart(p)}
            >
              {p.name}
            </button>
        )))}
      </div>

      {/* Botones de otros productos */}
      <div className="flex gap-2 flex-wrap mb-6">
        {products.map((p) => (
          !p.isIceCream && (
            <button
              key={p.name}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg"
              onClick={() => addToCart(p)}
            >
              {p.name}
            </button>
        )))}
      </div>

      {/* Carrito */}
      <table className="w-full border">
        <thead>
          <tr>
            <th className="border p-2">Producto</th>
            <th className="border p-2">Sabores</th>
            <th className="border p-2">Depósito</th>
            <th className="border p-2">Cantidad</th>
            <th className="border p-2">Precio U</th>
            <th className="border p-2">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {cart.map((item, idx) => (
            <tr key={idx}>
              <td className="border p-2">{item.name}</td>
              <td className="border p-2">{item.sabores}</td>
              <td>{item.depotName || '—'}</td>
              <td className="border p-2">{item.cantidad}</td>
              <td className="border p-2">${item.price.toFixed(2)}</td>
              <td className="border p-2">
                ${(item.price * item.cantidad).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Total */}
      <h2 className="mt-4 text-lg font-bold">
        Total: ${calculateTotal().toFixed(2)}
      </h2>

      {/* Botón guardar */}
      <button
        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg"
        onClick={handleSaveSale}
      >
        Guardar Venta
      </button>

      {showModal && saleInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
            <h3 className="text-xl font-semibold text-green-700 mb-4">Venta registrada con éxito ✅</h3>
            <p><strong>Total de la venta:</strong> ${saleInfo.total.toFixed(2)}</p>
            <p><strong>Pagó con:</strong> ${saleInfo.payment.toFixed(2)}</p>
            <p><strong>Cambio a devolver:</strong> ${saleInfo.change.toFixed(2)}</p>

            <button
              className="mt-6 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              onClick={() => setShowModal(false)}
            >
              Cerrar
            </button>

            {/* Icono de cerrar en la esquina superior derecha */}
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
              onClick={() => setShowModal(false)}
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* 🔹 Modal de selección de sabores */}
    <FlavorModal
      isOpen={showFlavorModal}
      onClose={() => setShowFlavorModal(false)}
      onConfirm={handleConfirmFlavors}
      product={selectedProduct}
    />

    </div>
  );
};

export default Sales;
