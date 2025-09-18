import React, { useState } from "react";
import { saveSales } from "../services/saleService";

const Sales = () => {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);

  // productos simulados (puedes reemplazarlos con los que te devuelve el backend)
  const products = [
    { name: "Cono sencillo", price: 1.5, requiereSabor: true },
    { name: "Cono doble", price: 2.5, requiereSabor: true },
    { name: "Litro", price: 5.0, requiereSabor: false },
    { name: "Cilindro", price: 10.0, requiereSabor: false },
  ];

  const addToCart = (product) => {
    let sabores = "-";
    if (product.requiereSabor) {
      sabores = prompt("Ingrese el sabor (ej: Fresa, Vainilla):");
      if (!sabores) return;
      // cada sabor = producto diferente
      setCart([...cart, { ...product, sabores, cantidad: 1 }]);
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

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.cantidad, 0);
  };

  const handleSaveSale = async () => {
    try {
      const salePayload = {
        items: cart.map((item) => ({
          product: item.name,
          sabores: item.sabores,
          cantidad: item.cantidad,
          price: item.price,
        })),
        total: calculateTotal(),
      };

      const userId = 1; // ⚠️ reemplazar con el usuario logueado
      const branchId = 1; // ⚠️ reemplazar con la sucursal seleccionada

      const response = await saveSales(salePayload, userId, branchId);
      console.log("Venta guardada:", response);

      alert("Venta realizada con éxito ✅");
      setCart([]); // limpiar carrito
    } catch (err) {
      console.error(err);
      alert("Error al guardar la venta ❌");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Pantalla de Ventas</h1>

      {/* Botones de productos */}
      <div className="flex gap-2 flex-wrap mb-6">
        {products.map((p) => (
          <button
            key={p.name}
            className="px-4 py-2 bg-green-600 text-white rounded-lg"
            onClick={() => addToCart(p)}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Carrito */}
      <table className="w-full border">
        <thead>
          <tr>
            <th className="border p-2">Producto</th>
            <th className="border p-2">Sabores</th>
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
    </div>
  );
};

export default Sales;
