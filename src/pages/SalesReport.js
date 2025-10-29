import { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx"; // Importa xlsx
import { jsPDF } from 'jspdf';  // Importar jsPDF correctamente
import 'jspdf-autotable';       // Importar autoTable
import logo from "../assets/imagenes/logo.jpeg"; // ✅ tu import
import { ExcelIcon, PdfIcon } from "../assets/icons";


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



const exportToPDF = async () => {
  console.log("Generando PDF...");

  if (!data.totalElements || data.totalElements === 0) {
    alert("No hay datos para exportar.");
    return;
  }

  try {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();

    // === Convertir imagen importada a Base64 ===
    const getBase64Image = (imgSrc) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = imgSrc;
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          const dataURL = canvas.toDataURL("image/png");
          resolve(dataURL);
        };
        img.onerror = (err) => reject(err);
      });
    };

    // === Agregar logo ===
    try {
      const logoBase64 = await getBase64Image(logo);
      doc.addImage(logoBase64, "PNG", 15, 10, 25, 25); // (x, y, width, height)
    } catch (err) {
      console.warn("⚠️ No se pudo cargar el logo:", err);
    }

    // === Encabezado ===
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Reporte de Ventas", pageWidth / 2, 20, { align: "center" });
    
    // === Obtener el nombre del establecimiento (branch) del primer registro ===
    const firstBranch = data.content && data.content.length > 0 ? data.content[0].branch : "Sucursal no especificada";

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(firstBranch, pageWidth / 2, 26, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`Periodo: ${startDate} a ${endDate}`, pageWidth / 2, 32, {
      align: "center",
    });

    doc.setDrawColor(100);
    doc.line(10, 35, pageWidth - 10, 35);

    // === Datos ===
    const allData = [];
    let totalAmountSum = 0;
    const totalPages = Math.ceil(data.totalElements / itemsPerPage);

    const requests = Array.from({ length: totalPages }, (_, page) =>
      axios.get("http://localhost:8080/api/reports/sales", {
        params: { startDate, endDate, page, size: itemsPerPage },
      })
    );

    const responses = await Promise.all(requests);

    responses.forEach((res) => {
      res.data.content.forEach((row) => {
        allData.push([
          row.date,
          row.product,
          row.quantity,
          row.branch,
          row.user,
          `$${row.total.toFixed(2)}`,
        ]);
        totalAmountSum += row.total;
      });
    });

    allData.sort((a, b) => new Date(a[0]) - new Date(b[0]));
    allData.push(["TOTAL", "", "", "", "", `$${totalAmountSum.toFixed(2)}`]);

    doc.autoTable({
      startY: 40,
      head: [["Fecha", "Producto", "Cantidad", "Sucursal", "Usuario", "Total"]],
      body: allData,
      styles: { fontSize: 9, halign: "center", valign: "middle" },
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      theme: "grid",
    });

    // === Pie de página ===
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.text(
        `Página ${i} de ${pageCount}`,
        pageWidth - 20,
        doc.internal.pageSize.getHeight() - 10,
        { align: "right" }
      );
      doc.text(
        "Generado automáticamente por el sistema de ventas",
        15,
        doc.internal.pageSize.getHeight() - 10
      );
    }

    // === Guardar PDF ===
    doc.save(`reporte_ventas_${startDate}_a_${endDate}.pdf`);
    console.log("✅ PDF generado correctamente.");
  } catch (err) {
    console.error("❌ Error al generar PDF:", err);
    alert("Ocurrió un error al generar el PDF. Ver consola para más detalles.");
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
        <button className="btn btn-outline btn-error" onClick={exportToPDF}>
          <PdfIcon className="w-5 h-5 text-current " />
          Exportar a PDF</button>
        <button className='btn btn-outline btn-success' onClick={exportToExcel}>
          <ExcelIcon className="w-5 h-5 text-current " />
         Exportar a Excel </button>
      </div>
    </div>
  );
}
