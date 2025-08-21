import React, { useState } from 'react';

const PaginatedTable = ({ columns, data, renderRow, extraAction,filasPorPagina = 4 }) => {
  const [paginaActual, setPaginaActual] = useState(0);
  const totalPaginas = Math.ceil(data.length / filasPorPagina);

  const inicio = paginaActual * filasPorPagina;
  const fin = inicio + filasPorPagina;
  const datosVisibles = data.slice(inicio, fin);

  return (
     <div className="max-w-7xl mx-auto p-4">
      {/* Aquí se muestra el botón o cualquier acción extra si la hay */}
      {extraAction && (
        <div className="mb-4 text-right">
          {extraAction}
        </div>
      )}
      <table className="table table-zebra max-w-7xl mx-auto border">
        <thead className="bg-blue-400 text-white">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx}>{col}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {datosVisibles.map(renderRow)}
        </tbody>
      </table>

      {/* Paginación */}
      <div className="mt-6 flex justify-center items-center space-x-4">
        <button
          className="btn btn-sm"
          onClick={() => setPaginaActual(prev => Math.max(prev - 1, 0))}
          disabled={paginaActual === 0}
        >
          « Anterior
        </button>

        <span className="text-sm">
          Página <strong>{paginaActual + 1}</strong> de <strong>{totalPaginas}</strong>
        </span>

        <button
          className="btn btn-sm"
          onClick={() => setPaginaActual(prev => Math.min(prev + 1, totalPaginas - 1))}
          disabled={paginaActual >= totalPaginas - 1}
        >
          Siguiente »
        </button>
      </div>
    </div>
  );
};

export default PaginatedTable;
