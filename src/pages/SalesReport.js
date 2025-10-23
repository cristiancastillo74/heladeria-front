import { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx"; // Importa xlsx
import { jsPDF } from 'jspdf';  // Importar jsPDF correctamente
import 'jspdf-autotable';       // Importar autoTable


export default function SalesReport() {
  const [data, setData] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [startDate, setStartDate] = useState("2025-10-01");
  const [endDate, setEndDate] = useState("2025-10-21");

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Función para calcular los elementos visibles en la página actual
  const getCurrentData = () => {
    return data.content || []; // Devuelve el contenido paginado
  };

  // Cambiar de página
  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const totalPages = Math.ceil(data.totalElements / itemsPerPage);  // Total de páginas

  const fetchReport = async () => {
    try {
      // Llamada a los datos paginados con los parámetros 'page' y 'size'
      const res = await axios.get("http://localhost:8080/api/reports/sales", {
        params: { 
          startDate, 
          endDate,
          page: currentPage - 1, // 'page' en backend comienza desde 0
          size: itemsPerPage 
        },
      });

      setData(res.data);  // Establece el objeto completo que viene desde el backend

      // Llamada al total del periodo
      const totalRes = await axios.get("http://localhost:8080/api/reports/sales/total", {
        params: {
          startDate: `${startDate}T00:00:00`,
          endDate: `${endDate}T23:59:59`,
        },
      });
      setTotalAmount(totalRes.data);
    } catch (err) {
      console.error("Error fetching report", err);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [currentPage]); // Vuelve a cargar los datos cada vez que cambia la página

  // Función para exportar a PDF
const exportToPDF = () => {
  const doc = new jsPDF();

  const allData = [];
  let totalAmount = 0;  // Variable para almacenar el total de todas las ventas

  const totalPages = Math.ceil(data.totalElements / itemsPerPage);

  for (let page = 0; page < totalPages; page++) {
    axios.get("http://localhost:8080/api/reports/sales", {
      params: {
        startDate,
        endDate,
        page,
        size: itemsPerPage,
      }
    }).then(res => {
      const rows = res.data.content.map(row => {
        const rowData = [
          row.date,
          row.product,
          row.quantity,
          row.branch,
          row.user,
          row.total.toFixed(2),
        ];

        totalAmount += row.total;  // Acumulamos el total de las ventas

        return rowData;
      });

      allData.push(...rows);

      if (allData.length >= data.totalElements) {
        // Ordenamos los datos por la fecha (de forma ascendente)
        allData.sort((a, b) => new Date(a[0]) - new Date(b[0]));  // Asegúrate de que a[0] sea la fecha

        // Añadimos el total como una fila adicional al final
        allData.push([
          'TOTAL', '', '','','', `$${totalAmount.toFixed(2)}`, 
        ]);

        doc.autoTable({
          head: [['Fecha', 'Producto', 'Cantidad', 'Sucursal', 'Usuario', 'Total']],
          body: allData,
        });

        doc.save('reporte_ventas.pdf');
      }
    }).catch(err => console.error('Error fetching data for page ' + page, err));
  }
};





  // Función para exportar a Excel
  const exportToExcel = () => {
  const allData = [];
  const totalPages = Math.ceil(data.totalElements / itemsPerPage);

  for (let page = 0; page < totalPages; page++) {
    axios.get("http://localhost:8080/api/reports/sales", {
      params: {
        startDate,
        endDate,
        page,
        size: itemsPerPage,
      }
    }).then(res => {
      const pageData = res.data.content.map((r) => ({
        Fecha: r.date,
        Producto: r.product,
        Cantidad: r.quantity,
        Total: r.total.toFixed(2),
        Sucursal: r.branch,
        Usuario: r.user,
      }));

      allData.push(...pageData);

      if (allData.length >= data.totalElements) {
        // Ordenamos los datos por la fecha (de forma ascendente)
        allData.sort((a, b) => new Date(a.Fecha) - new Date(b.Fecha));  // Asegúrate de que "Fecha" esté en el formato correcto

        const ws = XLSX.utils.json_to_sheet(allData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sales Report");

        // Descargar el archivo Excel con todos los datos ordenados
        XLSX.writeFile(wb, "sales_report.xlsx");
      }
    }).catch(err => console.error('Error fetching data for page ' + page, err));
  }
};


  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-center mb-6 text-primary">📊 Reporte de Ventas</h1>

      {/* Filtro de fechas */}
      <div className="card shadow-lg p-4 mb-6 rounded-xl bg-base-100">
        <h2 className="text-xl font-semibold text-center mb-4">Filtro de Fechas</h2>
        <div className="flex justify-between gap-4">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="input input-bordered w-full rounded-lg border-2 border-primary focus:ring-2 focus:ring-primary transition-all"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="input input-bordered w-full rounded-lg border-2 border-primary focus:ring-2 focus:ring-primary transition-all"
          />
          <button 
            onClick={fetchReport} 
            className="btn btn-primary w-auto rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            Filtrar
          </button>
        </div>
      </div>

      {/* Tabla de ventas */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-md">
        <table className="table table-zebra w-full">
          <thead>
            <tr className="bg-primary text-white">
              <th className="text-center">Fecha</th>
              <th className="text-center">Producto</th>
              <th className="text-center">Cantidad</th>
              <th className="text-center">Total ($)</th>
              <th className="text-center">Sucursal</th>
              <th className="text-center">Usuario</th>
            </tr>
          </thead>
          <tbody>
            {getCurrentData().map((r, idx) => (
              <tr key={idx}>
                <td className="text-center">{r.date}</td>
                <td className="text-center">{r.product}</td>
                <td className="text-center">{r.quantity}</td>
                <td className="text-center">${r.total.toFixed(2)}</td>
                <td className="text-center">{r.branch}</td>
                <td className="text-center">{r.user}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Total del período */}
      {data.content && data.content.length > 0 && (
        <div className="text-right text-lg font-bold mt-6 text-accent">
          <span className="text-primary">Total del período (todas las ventas):</span> ${parseFloat(totalAmount).toFixed(2)}
        </div>
      )}

      {/* Paginación */}
      {data.content && data.content.length > 0 && (
        <div className="flex justify-between items-center mt-6">
          <button 
            onClick={goToPreviousPage} 
            className="btn btn-secondary w-auto rounded-lg disabled:opacity-50"
            disabled={currentPage === 1}
          >
            Anterior
          </button>
          <span className="text-lg">
            Página {currentPage} de {totalPages}
          </span>
          <button 
            onClick={goToNextPage} 
            className="btn btn-secondary w-auto rounded-lg disabled:opacity-50"
            disabled={currentPage === totalPages}
          >
            Siguiente
          </button>
        </div>
      )}

      {/* Botones de exportación */}
      <div className="flex justify-between mt-6">
        <button onClick={exportToPDF} className="btn btn-success">Exportar a PDF</button>
        <button onClick={exportToExcel} className="btn btn-success">Exportar a Excel</button>
      </div>
    </div>
  );
}
