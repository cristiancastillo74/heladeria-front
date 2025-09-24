import React, { useState, useEffect } from "react";
import { getCyInvent } from "../services/cyInventService";

const FlavorModal = ({ isOpen, onClose, onConfirm, product }) => {
  const [cylinders, setCylinders] = useState([]);
  const [selections, setSelections] = useState([]);

  const ballsCount = product?.ballsPerUnit || 1;

  useEffect(() => {
    if (isOpen) {
      const fetchCyInvents = async () => {
        try {
          const data = await getCyInvent();
          setCylinders(data);
          setSelections([{ cylinderId: null, balls: 1 }]); // empezamos con un select
        } catch (err) {
          console.log(err);
        }
      };
      fetchCyInvents();
    }
  }, [isOpen]);

  const handleFlavorChange = (index, cylinderId, balls = 1) => {
  const newSelections = [...selections];
  newSelections[index] = { cylinderId: parseInt(cylinderId), balls: parseInt(balls) || 1 };

  // contar total de bolas seleccionadas
  const totalBalls = newSelections.reduce((sum, s) => sum + (s?.balls || 0), 0);

  // si todavía no llegamos al total de bolas, agregamos un nuevo select
  if (totalBalls < ballsCount && !newSelections.some(s => s.cylinderId === null)) {
    newSelections.push({ cylinderId: null, balls: 1 });
  }

  setSelections(newSelections);
};


  const handleConfirm = () => {
  const selected = selections.filter((s) => s.cylinderId !== null);

  const totalBalls = selected.reduce((sum, s) => sum + (s.balls || 1), 0);
  if (totalBalls !== ballsCount) {
    alert(`Debes seleccionar ${ballsCount} bola(s) 🍦`);
    return;
  }

  // agregar el nombre del sabor al objeto para la tabla
  const selectionsWithNames = selected.map(s => ({
    ...s,
    flavor: cylinders.find(c => c.cylinder.id === s.cylinderId)?.cylinder.flavor
  }));

  onConfirm(selectionsWithNames);
  onClose();
};


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
        <h3 className="text-xl font-semibold mb-4">
          Seleccionar sabores para {product?.name}
        </h3>

        {selections.map((sel, index) => {
            const selection = sel || { cylinderId: null, balls: 1 };
            return (
                <div key={index} className="mb-3 flex gap-2 items-center">
                {/* Botón de eliminar select */}
                <div>
                <label  className="block text-sm font-medium mb-1 invisible">
                    pla
                </label>
                {selections.length > 1 && (
                    <button
                    className="ml-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    onClick={() => {
                        const newSelections = selections.filter((_, i) => i !== index);
                        setSelections(newSelections);
                    }}
                    >
                    &times;
                    </button>
                )}
                </div>

                <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">
                    Sabor {index + 1}
                    </label>
                    <select
                    className="border rounded px-2 py-1 w-full"
                    value={selection.cylinderId || ""}
                    onChange={(e) =>
                        handleFlavorChange(index, e.target.value, selection.balls)
                    }
                    >
                    <option value="">-- Seleccionar sabor --</option>
                    {cylinders.map((c) => (
                        <option key={c.id} value={c.cylinder.id}>
                        {c.cylinder.flavor}
                        </option>
                    ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Bolas</label>
                    <input
                    type="number"
                    min="1"
                    max={ballsCount}
                    value={selection.balls}
                    onChange={(e) =>
                        handleFlavorChange(index, selection.cylinderId, parseInt(e.target.value))
                    }
                    className="border rounded px-2 py-1 w-16"
                    />
                </div>

                
                </div>
            );
            })}



        <div className="flex justify-end gap-2 mt-4">
          <button className="px-4 py-2 bg-gray-300 rounded" onClick={onClose}>
            Cancelar
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={handleConfirm}>
            Confirmar
          </button>
        </div>

        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default FlavorModal;
